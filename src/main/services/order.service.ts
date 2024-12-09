import { ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';
import {
  CloseOrderData,
  OrderDbItem,
  OrderDbItemWithOrderItems,
  OrderItemsDbItem,
  OrderStatus,
  OrderToUpload,
  SaveOrderData,
} from '../../renderer/types/Order';

export const saveOrder = (data: SaveOrderData) => {
  const db = connect();

  // Проверка наличия существующего заказа по номеру
  const existingOrderQuery = db.prepare(`
    SELECT id FROM orders WHERE number = ? AND status = 'open';
  `);
  const existingOrder = existingOrderQuery.get(data.number) as
    | { id: number }
    | undefined;

  let order_id;

  if (existingOrder) {
    // Если заказ с таким номером существует, обновляем его
    const updateOrderQuery = db.prepare(`
      UPDATE orders SET
        created_at = @created_at,
        total_amount = @total_amount,
        discount_id = @discount_id,
        discount_total_amount = @discount_total_amount,
        payment_type_id = @payment_type_id,
        table_id = @table_id,
        client = @client,
        created_by = @created_by,
        status = @status
      WHERE id = @id;
    `);

    updateOrderQuery.run({ ...data, id: existingOrder.id });
    order_id = existingOrder.id;
  } else {
    // Если заказа нет, создаем новый
    const orderQuery = db.prepare(`
      INSERT INTO orders (number, created_at, total_amount, discount_id, discount_total_amount, payment_type_id, table_id, client, created_by, status)
      VALUES (@number, @created_at, @total_amount, @discount_id, @discount_total_amount, @payment_type_id, @table_id, @client, @created_by, @status)
      RETURNING id;
    `);

    order_id = orderQuery.run(data).lastInsertRowid;

    const updateNumberQuery = db.prepare(`
      UPDATE orders SET number = ? WHERE id = ?;
    `);
    updateNumberQuery.run(order_id, order_id);
  }

  // Вставка или обновление позиций заказа
  const existingItemsQuery = db.prepare(`
    SELECT * FROM orders_items WHERE order_id = ? AND product_id = ?;
  `);

  const insertItem = db.prepare(`
    INSERT INTO orders_items (product_id, quantity, price, order_id)
    VALUES (@product_id, @quantity, @price, @order_id);
  `);

  const updateItem = db.prepare(`
    UPDATE orders_items SET
      quantity = @quantity,
      price = @price
    WHERE order_id = @order_id AND product_id = @product_id;
  `);

  // Обрабатываем каждый элемент заказа
  for (const item of data.items) {
    const existingItem = existingItemsQuery.get(order_id, item.product_id);

    if (existingItem) {
      // Если позиция заказа существует, обновляем её
      updateItem.run({
        ...item,
        order_id,
      });
    } else {
      // Если позиции заказа нет, создаем новую
      insertItem.run({
        ...item,
        order_id,
      });
    }
  }

  db.close();

  return order_id;
};

export const getOpenOrders = () => {
  const db = connect();

  // Получаем заказы со статусом 'open'
  const ordersQuery = db.prepare(`
    SELECT * FROM orders WHERE status = 'open';
  `);

  const openOrders = ordersQuery.all() as OrderDbItem[];

  // Если есть открытые заказы, получаем для них позиции
  const ordersWithItems = openOrders.map((order) => {
    const orderItemsQuery = db.prepare(`
      SELECT * FROM orders_items WHERE order_id = ?;
    `);
    const orderItems = orderItemsQuery.all(order.id) as OrderItemsDbItem[];

    return {
      ...order,
      items: orderItems,
    };
  });

  db.close();

  return ordersWithItems as OrderDbItemWithOrderItems[];
};

export const closeOrder = (data: SaveOrderData) => {
  const db = connect();

  // Проверка существования заказа
  const existingOrderQuery = db.prepare(`
    SELECT id FROM orders WHERE number = ? AND status = 'open';
  `);
  const existingOrder = existingOrderQuery.get(data.number) as
    | { id: number }
    | undefined;

  if (!existingOrder) {
    db.close();
    throw new Error('Заказ не сохранен! Оплата невозможна!');
  }

  // Обновление заказа: статус на 'closed' и метод оплаты
  const updateOrderQuery = db.prepare(`
    UPDATE orders SET
      created_at = @created_at,
      total_amount = @total_amount,
      discount_id = @discount_id,
      discount_total_amount = @discount_total_amount,
      payment_type_id = @payment_type_id,  -- запись типа оплаты
      table_id = @table_id,
      client = @client,
      created_by = @created_by,
      status = 'closed'
    WHERE id = @id;
  `);

  updateOrderQuery.run({ ...data, id: existingOrder.id });

  // Обновление позиций заказа
  const insertItem = db.prepare(`
    INSERT INTO orders_items (product_id, quantity, price, order_id)
    VALUES (@product_id, @quantity, @price, @order_id);
  `);
  const updateItem = db.prepare(`
    UPDATE orders_items SET
      quantity = @quantity,
      price = @price
    WHERE order_id = @order_id AND product_id = @product_id;
  `);
  const existingItemsQuery = db.prepare(`
    SELECT * FROM orders_items WHERE order_id = ? AND product_id = ?;
  `);

  for (const item of data.items) {
    const existingItem = existingItemsQuery.get(
      existingOrder.id,
      item.product_id,
    );
    if (existingItem) {
      updateItem.run({ ...item, order_id: existingOrder.id });
    } else {
      insertItem.run({ ...item, order_id: existingOrder.id });
    }
  }

  // Получение полной информации о заказе
  const getOrderQuery = db.prepare(`
    SELECT * FROM orders WHERE id = ?;
  `);
  const order = getOrderQuery.get(existingOrder.id) as OrderToUpload;
  const getOrderItemsQuery = db.prepare(`
    SELECT id, product_id, quantity, price FROM orders_items WHERE order_id = ?;
  `);
  const orderItems = getOrderItemsQuery.all(existingOrder.id);

  db.close();
  // return existingOrder.id;
  return { ...order, items: orderItems };
};

export const getOrdersToUpload = () => {
  const db = connect();

  const ordersQuery = db.prepare(
    `
      SELECT *
      FROM orders
      WHERE uploaded = FALSE
      ORDER BY id;
    `,
  );

  const orders: any = ordersQuery.all();

  const getProductsByOrderId = db.prepare(
    `
      SELECT id, product_id, quantity, price
      FROM orders_items
      WHERE order_id = ?;
    `,
  );

  const products: any[] = [];

  console.log(orders);

  for (const order of orders) {
    const product = getProductsByOrderId.all(order.id);
    products.push({
      id: order.id,
      number: order.number,
      created_at: order.created_at,
      total_amount: order.total_amount,
      discount_id: order.discount_id,
      discount_total_amount: order.discount_total_amount,
      payment_type_id: order.payment_type_id,
      table_id: order.table_id,
      client: order.client,
      created_by: order.created_by,
      status: order.status,
      items: product || [],
    });
  }

  db.close();

  return products;
};

export const setUploadedOrders = () => {
  const db = connect();

  const updateOrders = db.prepare(
    `
      UPDATE orders
      SET uploaded = true,
          uploaded_at = CURRENT_TIMESTAMP
      WHERE
        uploaded = false;
    `,
  );

  const res = updateOrders.run();

  db.close();

  return res;
};

export const setUploadedOrderById = (orderId: number) => {
  const db = connect();

  const updateOrder = db.prepare(
    `
      UPDATE orders
      SET uploaded = true,
          uploaded_at = CURRENT_TIMESTAMP
      WHERE
        id = ?;
    `,
  );

  const res = updateOrder.run(orderId);

  db.close();

  return res;
};

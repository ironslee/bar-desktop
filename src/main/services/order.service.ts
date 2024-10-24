import { ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';
import {
  OrderDbItem,
  OrderDbItemWithOrderItems,
  OrderItemsDbItem,
  OrderStatus,
  SaveOrderData,
} from '../../renderer/types/Order';

// export const saveOrder = (data: SaveOrderData) => {
//   const db = connect();

//   // Вставка в таблицу orders
//   const orderQuery = db.prepare(`
//     INSERT INTO orders (number, createdAt, totalAmount, discountId, discountTotalAmount, paymentTypeId, table_id, client, created_by, status)
//     VALUES (@number, @createdAt, @totalAmount, @discountId, @discountTotalAmount, @paymentTypeId, @table_id, @client, @created_by, @status)
//     RETURNING id;
//   `);
//   console.log('Executing query for saving order:', orderQuery);

//   // Вставляем заказ и получаем его ID
//   const orderId = orderQuery.run(data).lastInsertRowid;

//   // Вставка позиций заказа в таблицу order_items
//   const insertItem = db.prepare(`
//     INSERT INTO orders_items (productId, quantity, price, orderId)
//     VALUES (@productId, @quantity, @price, @orderId);
//   `);

//   // Обновление количества товаров в products
//   // const updateProduct = db.prepare(`
//   //   UPDATE products
//   //   SET count = count - @quantity
//   //   WHERE id = @productId;
//   // `);

//   // Вставляем каждую позицию в order_items и обновляем количество продуктов
//   for (const item of data.orderItems) {
//     insertItem.run({
//       ...item,
//       orderId, // Вставляем ID созданного заказа
//     });
//     // updateProduct.run({
//     //   productId: item.productId,
//     //   quantity: item.quantity,
//     // });
//   }

//   db.close();

//   return orderId;
// };

export const saveOrder = (data: SaveOrderData) => {
  const db = connect();

  // Проверка наличия существующего заказа по номеру
  const existingOrderQuery = db.prepare(`
    SELECT id FROM orders WHERE number = ? AND status = 'open';
  `);
  const existingOrder = existingOrderQuery.get(data.number) as
    | { id: number }
    | undefined;

  let orderId;

  if (existingOrder) {
    // Если заказ с таким номером существует, обновляем его
    const updateOrderQuery = db.prepare(`
      UPDATE orders SET
        createdAt = @createdAt,
        totalAmount = @totalAmount,
        discountId = @discountId,
        discountTotalAmount = @discountTotalAmount,
        paymentTypeId = @paymentTypeId,
        table_id = @table_id,
        client = @client,
        created_by = @created_by,
        status = @status
      WHERE id = @id;
    `);

    updateOrderQuery.run({ ...data, id: existingOrder.id });
    orderId = existingOrder.id;
  } else {
    // Если заказа нет, создаем новый
    const orderQuery = db.prepare(`
      INSERT INTO orders (number, createdAt, totalAmount, discountId, discountTotalAmount, paymentTypeId, table_id, client, created_by, status)
      VALUES (@number, @createdAt, @totalAmount, @discountId, @discountTotalAmount, @paymentTypeId, @table_id, @client, @created_by, @status)
      RETURNING id;
    `);

    orderId = orderQuery.run(data).lastInsertRowid;
  }

  // Вставка или обновление позиций заказа
  const existingItemsQuery = db.prepare(`
    SELECT * FROM orders_items WHERE orderId = ? AND productId = ?;
  `);

  const insertItem = db.prepare(`
    INSERT INTO orders_items (productId, quantity, price, orderId)
    VALUES (@productId, @quantity, @price, @orderId);
  `);

  const updateItem = db.prepare(`
    UPDATE orders_items SET
      quantity = @quantity,
      price = @price
    WHERE orderId = @orderId AND productId = @productId;
  `);

  // Обрабатываем каждый элемент заказа
  for (const item of data.orderItems) {
    const existingItem = existingItemsQuery.get(orderId, item.productId);

    if (existingItem) {
      // Если позиция заказа существует, обновляем её
      updateItem.run({
        ...item,
        orderId,
      });
    } else {
      // Если позиции заказа нет, создаем новую
      insertItem.run({
        ...item,
        orderId,
      });
    }
  }

  db.close();

  return orderId;
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
      SELECT * FROM orders_items WHERE orderId = ?;
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

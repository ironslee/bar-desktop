import { ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';
import {
  CreateOrderDbItem,
  OrderItemsDbItem,
  OrderStatus,
} from '../../renderer/types/Order';

export const saveOrder = async (data: CreateOrderDbItem) => {
  const db = connect();

  try {
    // Начало транзакции
    db.transaction(() => {
      // Вставка в таблицу orders
      const insertOrder = db.prepare(`
        INSERT INTO orders (number, createdAt, totalAmount, discountId, discountTotalAmount, paymentTypeId, table_id, client, created_by, status)
        VALUES (@number, @createdAt, @totalAmount, @discountId, @discountTotalAmount, @paymentTypeId, @table_id, @client, @created_by, @status)
        RETURNING id;
      `);

      const orderData: CreateOrderDbItem = {
        number: checkNumber,
        createdAt: new Date().toISOString(), // Текущая дата и время
        totalAmount: 0, // Пустое значение
        discountId: 0, // Пустое значение
        discountTotalAmount: 0, // Пустое значение
        paymentTypeId: 0, // Пустое значение
        table_id: tableId,
        client: orderClient || '', // Имя клиента или пустая строка
        created_by: orderUser || '', // Имя пользователя
        status: OrderStatus.OPEN, // Статус заказа
      };

      const orderResult = insertOrder.run(orderData);
      const orderId = orderResult.lastInsertRowid;

      // Вставка в таблицу orders_items
      const insertOrderItem = db.prepare(`
        INSERT INTO order_items (productId, quantity, price, orderId)
        VALUES (@productId, @quantity, @price, @orderId);
      `);

      for (const item of items) {
        insertOrderItem.run({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          orderId,
        });
      }
    })();

    db.close();
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении заказа:', error);
    db.close();
    return false;
  }
};

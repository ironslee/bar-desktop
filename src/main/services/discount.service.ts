import { DiscountItem } from '../../renderer/types/Discount';
import { connect } from './connectDb';

export const getDiscount = () => {
  const db = connect();

  const discountQuery = db.prepare(
    `
      SELECT id, discount_value
      FROM discount;
    `,
  );

  const discount = discountQuery.all();

  db.close();

  return discount as DiscountItem[];
};

export const getDiscountByOrderId = (number: number) => {
  const db = connect();

  // Получаем discount_id из таблицы orders по orderId
  const orderQuery = db.prepare(`

    SELECT discount_id FROM orders WHERE number = ? AND status = 'open';
  `);
  const order = orderQuery.get(number) as { discount_id: number } | undefined;

  if (!order) {
    db.close();
    throw new Error(`Заказ с id ${number} не найден или не имеет скидки`);
  }

  // Находим запись в таблице discount по discount_id
  const discountQuery = db.prepare(`
    SELECT * FROM discount WHERE id = ?;
  `);
  const discount = discountQuery.get(order.discount_id);

  db.close();

  return discount;
};

export const getDiscountById = (id: number): DiscountItem => {
  const db = connect();
  const discountQuery = db.prepare(
    `
      SELECT id, discount_value
      FROM discount
      WHERE id = ?;
    `,
  );

  const discount = discountQuery.get(id);

  db.close();

  return discount as DiscountItem;
};

export const updateOpenOrderDiscount = (
  discount_id: number | null,
  orderNumber: number,
) => {
  const db = connect();

  const updateDiscountQuery = db.prepare(`
    UPDATE orders
    SET discount_id = ?
    WHERE number = ? AND status = 'open';
  `);

  updateDiscountQuery.run(discount_id, orderNumber);

  db.close();
};

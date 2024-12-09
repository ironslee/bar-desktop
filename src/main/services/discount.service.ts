import axios from 'axios';
import { DiscountItem } from '../../renderer/types/Discount';
import { connect } from './connectDb';
import { apiUrl } from './main-constants';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

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

export const importDiscount = async () => {
  try {
    const response = await axios.get(`${apiUrl}/desktop/discounts`);

    if (!Array.isArray(response.data)) {
      throw new Error('Ответ сервера не содержит массив объектов');
    }

    const discounts = await response.data.map((discount: DiscountItem) => ({
      id: discount.id,
      discount_value: discount.discount_value,
    }));

    // db tables update
    const success = await updateDiscount(discounts);

    if (!success) {
      throw new Error('Ошибка обновления таблиц в базе данных');
    }

    console.log('Таблицы успешно импортированы и обновлены.');
    return true;
  } catch (error) {
    console.error('Ошибка импорта таблиц:', error);
    return false;
  }
};

const updateDiscount = (discount: DiscountItem[]) => {
  try {
    const db = connect();

    // Foreign key verification off
    db.prepare('PRAGMA foreign_keys = OFF;').run();

    // Clear discount table
    const clearDiscount = db.prepare(
      `
        DELETE FROM discount WHERE true;
      `,
    );

    clearDiscount.run();

    // Insert downloaded discount into discount table
    const insert = db.prepare(`
      INSERT INTO discount (id, discount_value)
      VALUES (@id, @discount_value)
    `);

    const insertMany = db.transaction((discounts) => {
      for (const discount of discounts) {
        insert.run(discount);
      }
    });

    insertMany(discount);

    // Foreign key verification on
    db.prepare('PRAGMA foreign_keys = ON;').run();

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

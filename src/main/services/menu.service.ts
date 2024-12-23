import { CurrentCount, ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';
import axios from 'axios';
import { apiUrl } from './main-constants';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

export const getCategories = (): CategoryItem[] => {
  const db = connect();

  const categoriesQuery = db.prepare(
    `
      SELECT id, name, link, print_cat
      FROM categories;
    `,
  );

  const categories = categoriesQuery.all();

  db.close();

  return categories as CategoryItem[];
};

export const getProductsByCategory = (category_id: number): ProductItem[] => {
  const db = connect();
  const productsQuery = db.prepare(
    `
      SELECT id, name, vendorcodes, retprice, category_id, link, statuses, stock
      FROM products
      WHERE category_id = ?;
    `,
  );

  const products = productsQuery.all(category_id);

  db.close();

  return products as ProductItem[];
};

export const getAllProducts = (): ProductItem[] => {
  const db = connect();

  const allProductsQuery = db.prepare(
    `
      SELECT id, name, vendorcodes, retprice, category_id, link, statuses, stock
      FROM products;
    `,
  );

  const allProducts = allProductsQuery.all();

  db.close();

  return allProducts as ProductItem[];
};

export const getProductById = (id: number): ProductItem => {
  const db = connect();
  const productQuery = db.prepare(
    `
      SELECT id, name, vendorcodes, retprice, category_id, link, statuses, stock
      FROM products
      WHERE id = ?;
    `,
  );

  const product = productQuery.get(id);

  db.close();

  return product as ProductItem;
};

// Import categories
export const importCategories = async () => {
  try {
    const response = await axios.get(`${apiUrl}/desktop/categories`);

    if (!Array.isArray(response.data)) {
      throw new Error('Ответ сервера не содержит массив объектов');
    }

    const categories = await response.data.map((category: CategoryItem) => ({
      id: category.id,
      name: category.name,
      link: category.link,
      print_cat: category.print_cat,
    }));

    // db tables update
    const success = await updateCategories(categories);

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

const updateCategories = (categories: CategoryItem[]) => {
  try {
    const db = connect();

    // Foreign key verification off
    db.prepare('PRAGMA foreign_keys = OFF;').run();

    // Clear categories table
    const clearCategories = db.prepare(
      `
        DELETE FROM categories WHERE true;
      `,
    );

    clearCategories.run();

    // Insert downloaded categories into categories table
    const insert = db.prepare(`
      INSERT INTO categories (id, name, link, print_cat)
      VALUES (@id, @name, @link, @print_cat)
    `);

    const insertMany = db.transaction((categories) => {
      for (const category of categories) {
        insert.run(category);
      }
    });

    insertMany(categories);

    // Foreign key verification on
    db.prepare('PRAGMA foreign_keys = ON;').run();

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Import products
export const importProducts = async () => {
  try {
    const response = await axios.get(`${apiUrl}/desktop/products`);

    if (!Array.isArray(response.data)) {
      throw new Error('Ответ сервера не содержит массив объектов');
    }

    const products = await response.data.map((product: ProductItem) => ({
      id: product.id,
      name: product.name,
      vendorcodes: product.vendorcodes,
      retprice: product.retprice,
      category_id: product.category_id,
      link: product.link,
      statuses: product.statuses,
      stock: product.stock,
    }));

    // db tables update
    const success = await updateProducts(products);

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

const updateProducts = (products: ProductItem[]) => {
  try {
    const db = connect();

    // Foreign key verification off
    db.prepare('PRAGMA foreign_keys = OFF;').run();

    // Clear products table
    const clearProducts = db.prepare(
      `
        DELETE FROM products WHERE true;
      `,
    );

    clearProducts.run();

    // Insert downloaded products into products table
    const insert = db.prepare(`
      INSERT INTO products (id, name, vendorcodes, retprice, category_id, link, statuses, stock)
      VALUES (@id, @name, @vendorcodes, @retprice, @category_id, @link, @statuses, @stock)
    `);

    const insertMany = db.transaction((products) => {
      for (const product of products) {
        insert.run(product);
      }
    });

    insertMany(products);

    // Foreign key verification on
    db.prepare('PRAGMA foreign_keys = ON;').run();

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// ----------Count services------------------

export const addProductToCurrentCount = (
  productId: number,
  tableId: number,
  orderId?: number,
) => {
  const db = connect();

  // Отключаем проверку внешних ключей
  db.prepare('PRAGMA foreign_keys = OFF;').run();

  // Проверяем, существует ли запись
  const check = db.prepare(`
    SELECT * FROM current_count
    WHERE product_id = @productId
      AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
      AND order_status = 'open';
  `);
  const existingRecord = check.get({ productId, orderId, tableId });

  if (existingRecord) {
    // Увеличиваем счётчик count
    const update = db.prepare(`
      UPDATE current_count
      SET count = count + 1
      WHERE product_id = @productId
        AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
        AND order_status = 'open';
    `);
    update.run({ productId, orderId, tableId });
  } else {
    // Добавляем новую запись с orderId или NULL
    const insert = db.prepare(`
      INSERT INTO current_count (product_id, order_id, table_id, count, order_status)
      VALUES (@productId, @orderId, @tableId, 1, 'open');
    `);
    insert.run({ productId, orderId: orderId ?? null, tableId });
  }

  // Включаем проверку внешних ключей
  db.prepare('PRAGMA foreign_keys = ON;').run();

  db.close();
  return true;
};

export const updateOrderIdInCurrentCount = (
  tableId: number,
  orderId: number,
) => {
  const db = connect();

  const update = db.prepare(`
    UPDATE current_count
    SET order_id = @orderId
    WHERE table_id = @tableId AND order_id IS NULL AND order_status = 'open';
  `);

  update.run({ tableId, orderId });

  db.close();
  return true;
};

export const decreaseProductInCurrentCount = (
  productId: number,
  tableId: number,
  orderId?: number,
) => {
  const db = connect();

  db.prepare('PRAGMA foreign_keys = OFF;').run();

  // Проверяем существующую запись
  const check = db.prepare(`
    SELECT * FROM current_count
    WHERE product_id = @productId
      AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
      AND order_status = 'open';
  `);
  const existingRecord: CurrentCount = check.get({
    productId,
    orderId,
    tableId,
  }) as CurrentCount;

  if (existingRecord) {
    if (existingRecord.count > 1) {
      // Уменьшаем счётчик count
      const update = db.prepare(`
        UPDATE current_count
        SET count = count - 1
        WHERE product_id = @productId
          AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
          AND order_status = 'open';
      `);
      update.run({ productId, orderId, tableId });
    } else {
      // Удаляем запись, если count становится равным 0
      const remove = db.prepare(`
        DELETE FROM current_count
        WHERE product_id = @productId
          AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
          AND order_status = 'open';
      `);
      remove.run({ productId, orderId, tableId });
    }
  }

  db.prepare('PRAGMA foreign_keys = ON;').run();
  db.close();
  return true;
};

export const deleteProductFromCurrentCount = (
  productId: number,
  tableId: number,
  orderId?: number,
) => {
  const db = connect();

  db.prepare('PRAGMA foreign_keys = OFF;').run();

  // Проверяем существующую запись
  const check = db.prepare(`
    SELECT * FROM current_count
    WHERE product_id = @productId
      AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
      AND order_status = 'open';
  `);
  const existingRecord = check.get({ productId, orderId, tableId });

  if (existingRecord) {
    // Удаляем запись
    const remove = db.prepare(`
      DELETE FROM current_count
      WHERE product_id = @productId
        AND (order_id = @orderId OR (order_id IS NULL AND table_id = @tableId))
        AND order_status = 'open';
    `);
    remove.run({ productId, orderId, tableId });
  }

  db.prepare('PRAGMA foreign_keys = ON;').run();
  db.close();
  return true;
};

export const recalculateStock = () => {
  try {
    const db = connect();

    // Получаем сумму count для каждого продукта в открытых заказах
    const counts = db
      .prepare(
        `
      SELECT product_id, SUM(count) as total_count
      FROM current_count
      WHERE order_status = 'open'
      GROUP BY product_id;
    `,
      )
      .all();

    // Обновляем stock в products
    const updateStock = db.prepare(`
      UPDATE products
      SET stock = stock - @total_count
      WHERE id = @product_id AND stock IS NOT NULL;
    `);

    const transaction = db.transaction(() => {
      for (const row of counts) {
        updateStock.run(row);
      }
    });

    transaction();
    db.close();
    return true;
  } catch (error) {
    console.log('Ошибка пересчёта stock:', error);
    return false;
  }
};

export const closeOrderInCurrentCount = (orderId: number, tableId: number) => {
  try {
    const db = connect();

    const update = db.prepare(`
      UPDATE current_count
      SET order_status = 'closed'
      WHERE order_id = @orderId AND table_id = @tableId AND order_status = 'open';
    `);

    update.run({ orderId, tableId });
    db.close();
    return true;
  } catch (error) {
    console.log('Ошибка обновления статуса заказа в current_count:', error);
    return false;
  }
};

export const getCurrentCounts = () => {
  try {
    const db = connect(); // Подключаемся к базе

    // SQL-запрос для получения всех записей из current_count с статусом 'open'
    const query = db.prepare(`
      SELECT * FROM current_count
      WHERE order_status = 'open';
    `);

    const currentCounts = query.all(); // Получаем все записи

    db.close(); // Закрываем подключение к базе
    return currentCounts as CurrentCount[]; // Возвращаем массив записей
  } catch (error) {
    console.error('Ошибка при получении currentCounts:', error);
    return [];
  }
};

export const clearTemporaryCounts = () => {
  const db = connect();

  db.prepare(`
    DELETE FROM current_count WHERE order_id IS NULL;
  `).run();

  db.close();
};

import { ProductItem } from '../../renderer/types/Product';
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
      SELECT id, name, vendorcodes, retprice, category_id, link, statuses
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
      SELECT id, name, vendorcodes, retprice, category_id, link, statuses
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
      SELECT id, name, vendorcodes, retprice, category_id, link, statuses
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
      INSERT INTO products (id, name, vendorcodes, retprice, category_id, link, statuses)
      VALUES (@id, @name, @vendorcodes, @retprice, @category_id, @link, @statuses)
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

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
export const importCategories = async (token: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/desktop/categories`,
      {},
      {
        responseType: 'blob',
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const filePath =
      process?.env?.NODE_ENV === 'development'
        ? app.getAppPath() + '/categories.csv'
        : path.join(process.resourcesPath, '/categories.csv');
    fs.writeFileSync(filePath, response.data);

    const result: any[] = [];

    await fs
      .createReadStream(filePath)
      .pipe(
        csv({
          separator: ',',
          mapHeaders: ({ header }) => {
            return String(header).trim();
          },
        }),
      )
      .on('data', (data) => result.push(data))
      .on('end', () => {
        updateCategories(result);
      });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const updateCategories = (categories: CategoryItem[]) => {
  try {
    const db = connect();

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

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Import products
export const importProducts = async (token: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/desktop/products`,
      {},
      {
        responseType: 'blob',
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const filePath =
      process?.env?.NODE_ENV === 'development'
        ? app.getAppPath() + '/products.csv'
        : path.join(process.resourcesPath, '/products.csv');
    fs.writeFileSync(filePath, response.data);

    const result: any[] = [];

    await fs
      .createReadStream(filePath)
      .pipe(
        csv({
          separator: ',',
          mapHeaders: ({ header }) => {
            return String(header).trim();
          },
        }),
      )
      .on('data', (data) => result.push(data))
      .on('end', () => {
        updateProducts(result);
      });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const updateProducts = (products: ProductItem[]) => {
  try {
    const db = connect();

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

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

import { ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';

export const getCategories = (): CategoryItem[] => {
  const db = connect();

  const categoriesQuery = db.prepare(
    `
      SELECT id, name, link
      FROM categories;
    `,
  );

  const categories = categoriesQuery.all();

  db.close();

  return categories as CategoryItem[];
};

export const getProductsByCategory = (categoryId: number): ProductItem[] => {
  const db = connect();
  const productsQuery = db.prepare(
    `
      SELECT id, name, vendorcodes, retprice, categoryId, link, statuses
      FROM products
      WHERE categoryId = ?;
    `,
  );

  const products = productsQuery.all(categoryId);

  db.close();

  return products as ProductItem[];
};

export const getAllProducts = (): ProductItem[] => {
  const db = connect();

  const allProductsQuery = db.prepare(
    `
      SELECT id, name, vendorcodes, retprice, categoryId, link, statuses
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
      SELECT id, name, vendorcodes, retprice, categoryId, link, statuses
      FROM products
      WHERE id = ?;
    `,
  );

  const product = productQuery.get(id);

  db.close();

  return product as ProductItem;
};

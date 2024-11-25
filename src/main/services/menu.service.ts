import { ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';

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

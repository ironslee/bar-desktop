import { ProductItem } from '../../renderer/types/Product';
import { CategoryItem } from '../../renderer/types/Category';
import { connect } from './connectDb';

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

import { CurrentCount, ProductItem } from '../types/Product';

// eslint-disable-next-line import/prefer-default-export
export const calculateStockLeft = (
  product: ProductItem,
  counts: CurrentCount[],
) => {
  const countInOrders = counts
    .filter(
      (record) =>
        record.product_id === product.id && record.order_status === 'open',
    )
    .reduce((total, record) => total + record.count, 0);

  return product.stock !== null
    ? Math.max(product.stock - countInOrders, 0)
    : 0;
};

import { ProductItem } from './Product';

export interface OrderItem {
  product: ProductItem;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  checkNumber: string;
  items: OrderItem[];
}

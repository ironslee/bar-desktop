import { ProductItem } from './Product';

export interface OrderItem {
  product: ProductItem;
  quantity: number;
  totalPrice: number;
  printedQuantity: number;
}

export interface Order {
  checkNumber: string;
  items: OrderItem[];
}

export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface CreateOrderDbItem {
  // id: number;
  number: number;
  createdAt: string;
  totalAmount: number;
  discountId: number;
  discountTotalAmount: number;
  paymentTypeId: number;
  table_id: number;
  client: string;
  created_by: string;
  status: OrderStatus.OPEN | OrderStatus.CLOSED;
}

export interface OrderItemsDbItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  orderId: number;
}

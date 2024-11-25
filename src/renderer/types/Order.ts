import { ProductItem } from './Product';

export interface OrderItem {
  product: ProductItem;
  quantity: number;
  totalPrice: number;
  printedQuantity: number;
}

export interface Order {
  checkNumber: number;
  items: OrderItem[];
}

export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface OrderDbItem {
  id: number;
  number: number;
  created_at: string;
  total_amount: number;
  discount_id: number;
  discount_total_amount: number;
  payment_type_id: number;
  table_id: number;
  client: number;
  created_by: number;
  status: OrderStatus.OPEN | OrderStatus.CLOSED;
}

export interface OrderDbItemWithOrderItems extends OrderDbItem {
  items: OrderItemsDbItem[];
}

export interface OrderItemsDbItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  order_id: number;
}

export interface OrderItemData {
  product_id: number; // ID продукта
  quantity: number; // Количество товара
  price: number; // Цена за единицу товара
}

export interface SaveOrderData {
  number?: number; // Номер чека
  created_at: string; // Дата создания
  total_amount: number; // Общая сумма заказа
  discount_id: number | null; // ID скидки, если есть
  discount_total_amount: number; // Сумма скидки
  payment_type_id: number | null; // Тип оплаты
  table_id: number; // ID стола
  client: number | null; // Имя клиента
  created_by: number | null; // Кто создал заказ (имя пользователя)
  status: OrderStatus.OPEN | OrderStatus.CLOSED; // Статус заказа
  orderItems: OrderItemData[]; // Позиции заказа (товары)
}

export interface CloseOrderData extends SaveOrderData {
  paymentType: 0 | 1;
}

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
  createdAt: string;
  totalAmount: number;
  discountId: number;
  discountTotalAmount: number;
  paymentTypeId: number;
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
  productId: number;
  quantity: number;
  price: number;
  orderId: number;
}

export interface OrderItemData {
  productId: number; // ID продукта
  quantity: number; // Количество товара
  price: number; // Цена за единицу товара
}

export interface SaveOrderData {
  number?: number; // Номер чека
  createdAt: string; // Дата создания
  totalAmount: number; // Общая сумма заказа
  discountId: number | null; // ID скидки, если есть
  discountTotalAmount: number; // Сумма скидки
  paymentTypeId: number | null; // Тип оплаты
  table_id: number; // ID стола
  client: number | null; // Имя клиента
  created_by: number | null; // Кто создал заказ (имя пользователя)
  status: OrderStatus.OPEN | OrderStatus.CLOSED; // Статус заказа
  orderItems: OrderItemData[]; // Позиции заказа (товары)
}

export interface CloseOrderData extends SaveOrderData {
  paymentType: 0 | 1;
}

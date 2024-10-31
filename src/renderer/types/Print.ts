import { OrderItem } from './Order';

export interface KitchenTicketItem {
  name: string;
  quantity: number;
  print_category: string;
}

export interface KitchenTicket {
  items: KitchenTicketItem[];
  table: string;
}

export interface PreCheck {
  checkId: number;
  table: string;
  user: string;
  client?: string;
  totalAmount: number;
  discount: number;
  items: OrderItem[];
}

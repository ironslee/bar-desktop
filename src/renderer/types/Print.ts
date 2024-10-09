export interface KitchenTicketItem {
  name: string;
  quantity: number;
}

export interface KitchenTicket {
  items: KitchenTicketItem[];
  table: string;
}

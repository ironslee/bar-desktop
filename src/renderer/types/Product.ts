export interface ProductItem {
  id: number;
  name: string;
  vendorcodes: string;
  retprice: number;
  category_id: number;
  link: string;
  statuses: number;
  stock: number;
  count_in_order?: number;
}

export interface CurrentCount {
  id: number;
  product_id: number;
  order_id: number | null;
  count: number;
  order_status: string;
  table_id: number;
}

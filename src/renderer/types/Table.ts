export enum TableStatus {
  Reserved = 'reserved',
  Free = 'free',
}

export interface TableItem {
  id: number;
  name: string;
  color: string;
}

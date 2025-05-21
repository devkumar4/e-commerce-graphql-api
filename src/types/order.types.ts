export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderInput {
  items: OrderItemInput[];
}

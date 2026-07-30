export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: 'Bread' | 'Pastry' | 'Cake' | 'Cookies';
  image_url: string | null;
  stock: number;
  featured: boolean;
  created_at: string;
};

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: OrderStatus;
  total: number;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

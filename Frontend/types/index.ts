export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  vendor_id?: string;
  vendor_name?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Address {
  id?: string;
  user_id?: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_default?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

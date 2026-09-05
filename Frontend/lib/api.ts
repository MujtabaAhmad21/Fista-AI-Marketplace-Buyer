import { Product, User, Cart, Order } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fista-backend-production.up.railway.app";

export const TOKEN_KEY = "fista_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token"); // backward compatibility with "token"
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("token", token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("token");
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "An error occurred while communicating with the server";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    if (response.status === 401 && options.requiresAuth) {
      clearAuthToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?session_expired=1";
      }
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // Auth endpoints
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const formData = new URLSearchParams();
    formData.append("username", cleanEmail);
    formData.append("password", password);

    const data = await request<{ access_token: string; token_type: string }>("/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    setAuthToken(data.access_token);
    return data;
  },

  async register(fullName: string, email: string, password: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    return request<User>("/register", {
      method: "POST",
      body: JSON.stringify({ full_name: cleanName, email: cleanEmail, password }),
    });
  },

  async getCurrentUser(): Promise<User> {
    return request<User>("/users/me", { requiresAuth: true });
  },

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    return request<{ message: string }>("/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, new_password: newPassword }),
    });
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return request<Product[]>("/products");
  },

  async getProduct(id: string): Promise<Product> {
    return request<Product>(`/products/${id}`);
  },

  // Cart
  async getCart(): Promise<Cart> {
    return request<Cart>("/cart", { requiresAuth: true });
  },

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return request<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
      requiresAuth: true,
    });
  },

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    return request<Cart>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
      requiresAuth: true,
    });
  },

  async removeCartItem(itemId: string): Promise<Cart> {
    return request<Cart>(`/cart/items/${itemId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  async clearCart(): Promise<void> {
    return request<void>("/cart", {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  // Orders
  async createOrder(shippingAddress: string): Promise<Order> {
    return request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify({ shipping_address: shippingAddress }),
      requiresAuth: true,
    });
  },

  async getOrders(): Promise<Order[]> {
    return request<Order[]>("/orders", { requiresAuth: true });
  },

  // Chatbot
  async sendChatMessage(message: string, history?: { role: string; content: string }[]): Promise<{ reply: string }> {
    return request<{ reply: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },
};

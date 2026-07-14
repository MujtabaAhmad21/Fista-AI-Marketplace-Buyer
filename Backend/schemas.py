from pydantic import BaseModel
from uuid import UUID

# --- User Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Product Schemas ---
class ProductResponse(BaseModel):
    id: UUID
    title: str
    description: str
    price: float
    stock_quantity: int
    category: str
    image_url: str

    class Config:
        from_attributes = True

# --- Cart Schemas ---
class CartItemCreate(BaseModel):
    product_id: UUID
    quantity: int

class CartItemResponse(BaseModel):
    id: UUID
    product: ProductResponse
    quantity: int

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: UUID
    items: list[CartItemResponse] = []

    class Config:
        from_attributes = True

# --- AI Chat Schemas ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

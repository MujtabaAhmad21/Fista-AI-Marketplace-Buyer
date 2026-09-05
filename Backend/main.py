from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from database import engine, Base, get_db
import models
import schemas
import hashlib
import os
import jwt
from uuid import UUID
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import ai_agent

# --- ENABLE AI SEARCH EXTENSION ---
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    conn.commit()

# Create the database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FISTA Marketplace API",
    description="Backend for the FISTA Buyer Interface",
    version="1.0.0"
)

# --- CORS SETTINGS ---
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- JWT Configuration ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- SECURITY DEPENDENCY ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the FISTA Marketplace API! The server is running smoothly."}

@app.get("/db-check")
def test_db_connection(db: Session = Depends(get_db)):
    return {"message": "Successfully connected to the PostgreSQL database!"}

# --- USER ROUTES ---
@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    clean_email = user.email.strip().lower()
    clean_name = user.full_name.strip()
    
    existing_user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already registered. Please sign in instead.")
    
    hashed_pw = hashlib.sha256(user.password.encode()).hexdigest()
    
    new_user = models.User(
        email=clean_email,
        hashed_password=hashed_pw,
        full_name=clean_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    clean_email = form_data.username.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    hashed_pw = hashlib.sha256(form_data.password.encode()).hexdigest()
    if hashed_pw != user.hashed_password:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/reset-password")
def reset_password(payload: schemas.PasswordReset, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address")
    
    user.hashed_password = hashlib.sha256(payload.new_password.encode()).hexdigest()
    db.commit()
    return {"message": "Password updated successfully. You can now sign in with your new password."}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# --- PRODUCT ROUTES ---
@app.get("/products", response_model=list[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    results = []
    for p in products:
        item = schemas.ProductResponse.model_validate(p)
        if p.vendor:
            item.vendor_name = p.vendor.name
        results.append(item)
    return results

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    res = schemas.ProductResponse.model_validate(product)
    if product.vendor:
        res.vendor_name = product.vendor.name
    return res


# --- CART ROUTES ---
@app.get("/cart", response_model=schemas.CartResponse)
def get_cart(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Attach vendor names to products inside cart items
    for item in cart.items:
        if item.product and item.product.vendor:
            item.product.vendor_name = item.product.vendor.name
    return cart

@app.post("/cart/items", response_model=schemas.CartResponse)
def add_to_cart(item: schemas.CartItemCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id, 
        models.CartItem.product_id == item.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item.quantity
    else:
        new_item = models.CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)
        db.add(new_item)
        
    db.commit()
    db.refresh(cart)
    return cart

@app.patch("/cart/items/{item_id}", response_model=schemas.CartResponse)
def update_cart_item(item_id: UUID, payload: schemas.CartItemUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if payload.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = payload.quantity
        
    db.commit()
    db.refresh(cart)
    return cart

@app.delete("/cart/items/{item_id}", response_model=schemas.CartResponse)
def remove_cart_item(item_id: UUID, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()
    
    if cart_item:
        db.delete(cart_item)
        db.commit()
        db.refresh(cart)
        
    return cart

@app.delete("/cart")
def clear_cart(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if cart:
        db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
        db.commit()
    return {"message": "Cart cleared successfully"}


# --- ORDERS ROUTES ---
@app.post("/orders", response_model=schemas.OrderResponse)
def create_order(payload: schemas.OrderCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cannot create order from an empty cart")
        
    total_amount = 0.0
    for item in cart.items:
        if item.product:
            total_amount += item.product.price * item.quantity
            # Decrement stock quantity
            if item.product.stock_quantity >= item.quantity:
                item.product.stock_quantity -= item.quantity
            else:
                item.product.stock_quantity = 0

    new_order = models.Order(
        user_id=current_user.id,
        total_amount=round(total_amount, 2),
        status="confirmed",
        shipping_address=payload.shipping_address
    )
    db.add(new_order)
    
    # Empty cart
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/orders", response_model=list[schemas.OrderResponse])
def get_user_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()
    return orders


# --- AI CHAT ROUTE ---
@app.post("/chat", response_model=schemas.ChatResponse)
def chat_with_assistant(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    ai_reply = ai_agent.get_shopping_assistant_reply(
        user_message=request.message, 
        db=db, 
        history=request.history
    )
    return {"reply": ai_reply}

from database import SessionLocal
import models

# Open a connection to the database
db = SessionLocal()

def seed_data():
    # 1. Check if we already have vendors to avoid duplicates if you run this twice
    # if db.query(models.Vendor).first():
    #     print("Database is already seeded with products!")
    #     return

    print("Seeding vendors...")
    vendor1 = models.Vendor(name="Tech Haven", store_description="Premium electronics and gadgets.")
    vendor2 = models.Vendor(name="Fashion Forward", store_description="Trendy apparel and clothing.")
    
    db.add(vendor1)
    db.add(vendor2)
    db.commit()
    db.refresh(vendor1)
    db.refresh(vendor2)

    print("Seeding products...")
    products = [
        models.Product(
            vendor_id=vendor1.id,
            title="Wireless Noise-Canceling Headphones",
            description="High quality over-ear headphones with 30hr battery life.",
            price=199.99,
            stock_quantity=50,
            category="Electronics",
            image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
        ),
        models.Product(
            vendor_id=vendor1.id,
            title="4K Action Camera",
            description="Waterproof action camera with ultra HD resolution and Wi-Fi.",
            price=129.50,
            stock_quantity=30,
            category="Electronics",
            image_url="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80"
        ),
        models.Product(
            vendor_id=vendor2.id,
            title="Men's Classic Cotton T-Shirt",
            description="100% pure cotton everyday t-shirt. Extremely comfortable.",
            price=19.99,
            stock_quantity=100,
            category="Clothing",
            image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"
        ),
        models.Product(
            vendor_id=vendor2.id,
            title="Running Sneakers",
            description="Lightweight and breathable sneakers for running and gym.",
            price=89.99,
            stock_quantity=75,
            category="Clothing",
            image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
        ),
        models.Product(
            vendor_id=vendor1.id,
            title="Smart Fitness Watch",
            description="Track your heart rate, steps, and sleep with this sleek waterproof smartwatch.",
            price=149.99,
            stock_quantity=40,
            category="Electronics",
            image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
        )
    ]
    
    db.bulk_save_objects(products)
    db.commit()
    print("Database seeded successfully with 2 Vendors and 4 Products!")

if __name__ == "__main__":
    seed_data()
    db.close()

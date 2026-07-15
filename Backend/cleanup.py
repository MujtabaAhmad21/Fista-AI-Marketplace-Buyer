from database import SessionLocal
import models

def clean_database():
    db = SessionLocal()
    
    try:
        print("🧹 Cleaning up database...")
        
        # We have to delete in this exact order because of database relationships!
        # (You can't delete a product if it's currently sitting in someone's cart)
        db.query(models.CartItem).delete()
        db.query(models.Cart).delete()
        db.query(models.Product).delete()
        db.query(models.Vendor).delete()
        
        db.commit()
        print("✅ Database successfully wiped clean!")
        print("➡️  You can now run 'python seed.py' exactly ONCE to get a perfect list of products.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()

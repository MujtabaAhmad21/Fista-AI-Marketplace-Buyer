import os
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import models

# 1. Force Python to load our secrets from the .env file
load_dotenv()

# 2. Initialize the OpenAI SDK, pointing to Groq
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def get_shopping_assistant_reply(user_message: str, db: Session) -> str:
    """
    Sends the user's message to the Groq AI model along with the current store inventory.
    """
    try:
        # Step A: Fetch all products currently in the database
        products = db.query(models.Product).all()
        
        # Step B: Format them into a readable text list for the AI
        inventory_text = "\n".join(
            [f"- {p.title}: ${p.price} (Category: {p.category}). {p.description}" for p in products]
        )

        # Step C: Create a dynamic system prompt that includes the inventory
        system_prompt = f"""
        You are a helpful and polite shopping assistant for the FISTA Marketplace. 
        You help customers find products and answer their questions. Keep your answers brief, friendly, and helpful.
        
        Here is the CURRENT list of products available in the store:
        {inventory_text}
        
        If a user asks for something that is NOT on this list, politely tell them it is out of stock or that we do not carry it. Do not make up products.
        """

        # Step D: Send it to Groq!
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system", 
                    "content": system_prompt
                },
                {
                    "role": "user", 
                    "content": user_message
                }
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"--- AI ERROR ---: {e}")
        return "I'm sorry, my AI brain is taking a quick nap. Please try again in a moment!"

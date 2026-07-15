"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New states for the mock payment flow
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirect to login if not authenticated
      return;
    }

    // Fetch the user's secure cart from the backend
    fetch("http://127.0.0.1:8000/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => {
        setCartItems(data.items || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [router]);

  // Handle the mock checkout process
  const handleCheckout = () => {
    setIsProcessing(true);
    
    // Simulate a network request to a payment gateway (e.g., Stripe)
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setCartItems([]); // Visually clear the cart upon success
    }, 2000); // 2-second delay
  };

  // Calculate the total price of all items in the cart
  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // If payment was successful, show the success screen
  if (isSuccess) {
    return (
      <main className="container mx-auto py-10 px-4 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="text-green-500 text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-slate-600 mb-8">
            Thank you for your mock order. Your payment went through perfectly, and your imaginary items are on their way!
          </p>
          <Link href="/">
            <Button size="lg" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10 px-4 min-h-screen">
      <Navbar />

      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>

      {isLoading ? (
        <p>Loading your cart...</p>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-4">Your cart is empty!</h2>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="flex flex-col sm:flex-row overflow-hidden">
                <div className="relative w-full sm:w-48 h-48 sm:h-auto">
                  <Image
                    src={item.product.image_url}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow p-4 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.product.title}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{item.product.category}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="font-medium">Qty: {item.quantity}</p>
                    <p className="font-bold text-green-600">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Checkout Summary Box */}
          <div>
            <Card className="sticky top-10">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}

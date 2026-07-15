"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }: { product: any }) {
  const [status, setStatus] = useState("");

  const handleAddToCart = async () => {
    // 1. Check if the user has a wristband
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("Please sign in first!");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setStatus("Adding...");

    try {
      // 2. Send the request to the backend VIP route
      const res = await fetch("http://127.0.0.1:8000/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Show the wristband to the bouncer!
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });

      if (!res.ok) throw new Error("Failed to add");
      
      setStatus("Added to Cart! ✅");
    } catch (error) {
      setStatus("Error adding item ❌");
    } finally {
      setTimeout(() => setStatus(""), 3000); // Clear message after 3 seconds
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-48 w-full">
        <Image 
          src={product.image_url} 
          alt={product.title} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
          <span className="font-bold text-green-600">${product.price.toFixed(2)}</span>
        </div>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <span className="inline-block bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full">
          {product.category}
        </span>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2">
        <Button onClick={handleAddToCart} className="w-full">
          Add to Cart
        </Button>
        {status && <p className="text-sm text-center font-medium text-slate-600 h-5">{status}</p>}
      </CardFooter>
    </Card>
  );
}

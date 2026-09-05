"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { Cart, CartItem } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

function CartContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, refreshCartCount } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
      await refreshCartCount();
    } catch (err: any) {
      console.error("Failed to load cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/cart");
      } else {
        fetchCart();
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemoveItem(item.id);
      return;
    }
    setUpdatingId(item.id);
    try {
      const updatedCart = await api.updateCartItem(item.id, newQty);
      setCart(updatedCart);
      await refreshCartCount();
    } catch (err: any) {
      alert(err.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const updatedCart = await api.removeCartItem(itemId);
      setCart(updatedCart);
      await refreshCartCount();
    } catch (err: any) {
      alert(err.message || "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to empty your cart?")) return;
    try {
      await api.clearCart();
      await fetchCart();
    } catch (err: any) {
      alert(err.message || "Failed to clear cart");
    }
  };

  const subtotal = cart?.items
    ? cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    : 0;

  const isFreeShipping = subtotal >= 50;
  const shipping = subtotal === 0 ? 0 : isFreeShipping ? 0 : 4.99;
  const freeShippingThresholdRemaining = Math.max(0, 50 - subtotal);
  const estimatedTax = subtotal * 0.08; // 8% sales tax
  const total = subtotal + shipping + estimatedTax;

  if (authLoading || (isLoading && !cart)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-28 bg-muted rounded-2xl" />
              <div className="h-28 bg-muted rounded-2xl" />
            </div>
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-border pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Shopping Bag</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? "distinct item" : "distinct items"} in your bag
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Empty Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto py-16 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold">Your bag is empty</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Looks like you haven&apos;t added any goods to your bag yet. Explore our curated collections to find something exceptional.
              </p>
            </div>
            <Link href="/">
              <Button className="rounded-full px-6 py-2.5 text-xs font-semibold bg-[#4C4556] hover:bg-[#583F52] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:text-[#241E28] gap-2">
                <ArrowLeft className="w-4 h-4" /> Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free shipping progress bar */}
              <div className="p-4 rounded-2xl bg-secondary/60 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F]" />
                    {isFreeShipping ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        🎉 You&apos;ve qualified for Free Standard Delivery!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-foreground">${freeShippingThresholdRemaining.toFixed(2)}</strong> more to unlock Free Delivery
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    ${subtotal.toFixed(2)} / $50.00
                  </span>
                </div>
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F8CB4F] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="divide-y divide-border border border-border rounded-2xl bg-card overflow-hidden">
                {items.map((item) => {
                  const isBusy = updatingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-secondary/20 transition-colors"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/products/${item.product.id}`}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary border border-border shrink-0"
                      >
                        <Image
                          src={item.product.image_url}
                          alt={item.product.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.product.category} • {item.product.vendor_name || "Verified Brand"}
                        </span>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="block text-sm sm:text-base font-serif font-bold text-foreground hover:underline truncate"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.product.description}
                        </p>
                        <div className="text-xs sm:hidden pt-1 font-bold text-[#4C4556] dark:text-[#F8CB4F]">
                          ${item.product.price.toFixed(2)} each
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border rounded-lg bg-background shrink-0">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateQuantity(item, -1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isBusy || item.quantity >= item.product.stock_quantity}
                          onClick={() => handleUpdateQuantity(item, 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total & Remove */}
                      <div className="text-right shrink-0 min-w-[90px] flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                        <span className="text-sm sm:text-base font-bold text-[#4C4556] dark:text-[#F8CB4F]">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 mt-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="text-[11px]">Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary Box */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-serif font-bold tracking-tight">Order Summary</h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-foreground">
                      {isFreeShipping ? (
                        <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-semibold text-foreground">${estimatedTax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-foreground">
                    <span>Estimated Total</span>
                    <span className="text-lg text-[#4C4556] dark:text-[#F8CB4F]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-[#4C4556] hover:bg-[#583F52] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:hover:bg-[#f6c236] dark:text-[#241E28] transition-all shadow-sm gap-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                {/* Trust and Assurance Badges */}
                <div className="space-y-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F] shrink-0" />
                    <span>256-bit SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F] shrink-0" />
                    <span>30-day money-back return guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F] shrink-0" />
                    <span>24/7 AI shopping support on standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CartContent />
    </Suspense>
  );
}

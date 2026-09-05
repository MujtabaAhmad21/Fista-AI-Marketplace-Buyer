"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Truck, 
  Check, 
  PackageCheck,
  AlertCircle,
  Clock
} from "lucide-react";
import { Cart, Order } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshCartCount } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingSpeed, setShippingSpeed] = useState<"standard" | "express">("standard");

  // Mock Card
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  // Submission & Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/checkout");
      } else {
        if (user?.full_name) {
          setFullName(user.full_name);
        }
        loadCart();
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  const loadCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
      if (!data.items || data.items.length === 0) {
        // empty cart
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingCart(false);
    }
  };

  const subtotal = cart?.items
    ? cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    : 0;

  const baseShipping = subtotal >= 50 ? 0 : 4.99;
  const shippingCost = shippingSpeed === "express" ? 14.99 : baseShipping;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!street || !city || !state || !zipCode) {
      setError("Please complete your delivery address details.");
      return;
    }

    const fullShippingAddress = `${fullName}, ${street}${apartment ? ` Apt ${apartment}` : ""}, ${city}, ${state} ${zipCode} (Tel: ${phone || "N/A"})`;

    setIsSubmitting(true);
    try {
      const order = await api.createOrder(fullShippingAddress);
      setConfirmedOrder(order);
      await refreshCartCount();
    } catch (err: any) {
      setError(err.message || "Failed to finalize order. Please verify details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#4C4556] dark:border-[#F8CB4F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Securing checkout session...</p>
        </div>
      </div>
    );
  }

  // --- ORDER SUCCESS CONFIRMATION SCREEN ---
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto w-full text-center space-y-8 my-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12 stroke-[2]" />
          </div>

          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">
              Payment Authorized
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
              Thank you for your order!
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              We&apos;ve received your order and our logistics team has started preparing your package for shipment.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4 shadow-sm text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <p className="text-muted-foreground">Order Reference</p>
                <p className="font-mono font-bold text-sm text-foreground mt-0.5">
                  #{confirmedOrder.id.toString().substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Total Paid</p>
                <p className="font-bold text-sm text-[#4C4556] dark:text-[#F8CB4F] mt-0.5">
                  ${confirmedOrder.total_amount.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground font-medium mb-1">Delivering To:</p>
              <p className="font-medium text-foreground">{confirmedOrder.shipping_address}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t border-border">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Delivery: 2 to 4 Business Days</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full rounded-full px-8 h-11 text-xs font-semibold bg-[#4C4556] hover:bg-[#583F52] text-white dark:bg-[#F8CB4F] dark:text-[#241E28]">
                Return to Store
              </Button>
            </Link>
            <Link href="/support" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-full px-6 h-11 text-xs font-semibold">
                Ask AI About Order
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-8">
          &copy; {new Date().getFullYear()} FISTA Marketplace. All purchases protected by buyer guarantee.
        </div>
      </div>
    );
  }

  // --- EMPTY CART CHECKOUT WARNING ---
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Please add items to your shopping bag before proceeding to checkout.
        </p>
        <Link href="/">
          <Button variant="outline">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  // --- STANDARD TWO-COLUMN CHECKOUT FLOW ---
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Secure Checkout Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold">FISTA</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
              Checkout
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline font-medium">256-Bit SSL Encrypted</span>
          </div>

          <Link
            href="/cart"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to bag
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Error Notice */}
              {error && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-serif font-bold text-lg">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      Full Recipient Name
                    </label>
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="h-10 bg-card border-border"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      Street Address
                    </label>
                    <Input
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Market Street"
                      className="h-10 bg-card border-border"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      Apt / Suite / Unit (Optional)
                    </label>
                    <Input
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Suite 4B"
                      className="h-10 bg-card border-border"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      City
                    </label>
                    <Input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      className="h-10 bg-card border-border"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      State / Province
                    </label>
                    <Input
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      className="h-10 bg-card border-border"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      Postal / ZIP Code
                    </label>
                    <Input
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="94105"
                      className="h-10 bg-card border-border"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                      Phone Number (For delivery updates)
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="h-10 bg-card border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Speed */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-serif font-bold text-lg">Delivery Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    onClick={() => setShippingSpeed("standard")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      shippingSpeed === "standard"
                        ? "border-[#4C4556] bg-secondary/50 dark:border-[#F8CB4F]"
                        : "border-border bg-card hover:bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">Standard Delivery</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {subtotal >= 50 ? "FREE" : "$4.99"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Delivers within 2-4 business days via courier.
                    </p>
                  </label>

                  <label
                    onClick={() => setShippingSpeed("express")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      shippingSpeed === "express"
                        ? "border-[#4C4556] bg-secondary/50 dark:border-[#F8CB4F]"
                        : "border-border bg-card hover:bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">Express Air Shipping</span>
                      <span className="text-xs font-bold">$14.99</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Guaranteed delivery in 1-2 business days.
                    </p>
                  </label>
                </div>
              </div>

              {/* Step 3: Payment Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-serif font-bold text-lg">Payment Details</h2>
                </div>

                <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-4">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F]" />
                      Credit or Debit Card
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">
                      Demo Store Mode
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Card Number</label>
                      <Input
                        disabled
                        value={cardNumber}
                        className="h-10 bg-card font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Expires</label>
                        <Input
                          disabled
                          value={cardExpiry}
                          className="h-10 bg-card font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">CVC</label>
                        <Input
                          disabled
                          value={cardCvc}
                          className="h-10 bg-card font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    This is a prototype sandbox checkout. No actual credit card charge will take place.
                  </p>
                </div>
              </div>

              {/* Place Order CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-sm font-semibold bg-[#4C4556] hover:bg-[#583F52] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:hover:bg-[#f6c236] dark:text-[#241E28] transition-all shadow-md gap-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Pay ${total.toFixed(2)} & Place Order</span>
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-lg">Order Items ({cart.items.length})</h3>

              {/* Items List */}
              <div className="divide-y divide-border/60 max-h-80 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.product.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        ${item.product.price.toFixed(2)} &times; {item.quantity}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-foreground">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Free</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Due</span>
                  <span className="text-lg text-[#4C4556] dark:text-[#F8CB4F]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-2 border-t border-border/60 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-[#F8CB4F]" />
                  <span>Real-time dispatch notification upon completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-[#F8CB4F]" />
                  <span>Full refund if not 100% satisfied within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Star, 
  Check, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  Heart,
  Share2,
  AlertCircle
} from "lucide-react";
import { Product } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { isAuthenticated, refreshCartCount } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "vendor">("details");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product && next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    if (!product) return;

    setIsAdding(true);
    setAddSuccess(false);

    try {
      await api.addToCart(product.id, quantity);
      await refreshCartCount();
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);

      if (redirectToCheckout) {
        router.push("/checkout");
      }
    } catch (err: any) {
      alert(err.message || "Failed to add item to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-6">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif font-bold">Product Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {error || "The product you are looking for might have been removed or is temporarily unavailable."}
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/60 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs flex items-center gap-2 text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <span>/</span>
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link 
            href={`/?category=${encodeURIComponent(product.category)}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.title}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Product Imagery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm group">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Category Pill */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-md text-foreground shadow-xs border border-border/80">
                  {product.category}
                </span>
              </div>

              {/* Wishlist and Share Action */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={() => alert("Saved to your wishlist!")}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-md border border-border/80 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shadow-xs"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Product link copied to clipboard!");
                  }}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-md border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-xs"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border text-center space-y-1">
                <Truck className="w-4 h-4 mx-auto text-amber-600 dark:text-[#F8CB4F]" />
                <p className="text-[11px] font-semibold">Fast Delivery</p>
                <p className="text-[10px] text-muted-foreground">2-4 Business Days</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border text-center space-y-1">
                <RotateCcw className="w-4 h-4 mx-auto text-amber-600 dark:text-[#F8CB4F]" />
                <p className="text-[11px] font-semibold">30-Day Returns</p>
                <p className="text-[10px] text-muted-foreground">Free Prepaid Label</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border text-center space-y-1">
                <ShieldCheck className="w-4 h-4 mx-auto text-amber-600 dark:text-[#F8CB4F]" />
                <p className="text-[11px] font-semibold">Verified Vendor</p>
                <p className="text-[10px] text-muted-foreground">100% Genuine</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Vendor & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  By {product.vendor_name || "Verified FISTA Vendor"}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="font-semibold">4.9</span>
                  <span className="text-muted-foreground">(48 reviews)</span>
                </div>
              </div>

              {/* Title & Price */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-[#4C4556] dark:text-[#F8CB4F]">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tax included • Shipping calculated at checkout
                  </span>
                </div>
              </div>

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Only {product.stock_quantity} left in stock - order soon
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    In stock ({product.stock_quantity} available)
                  </span>
                )}
              </div>

              {/* Product Description */}
              <p className="text-sm text-foreground/80 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector & Purchase Buttons */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center border border-border rounded-lg bg-card">
                    <button
                      type="button"
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => handleQuantityChange(-1)}
                      className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock_quantity || isOutOfStock}
                      onClick={() => handleQuantityChange(1)}
                      className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    disabled={isAdding || isOutOfStock}
                    onClick={() => handleAddToCart(false)}
                    className="flex-1 h-12 text-sm font-semibold rounded-xl bg-[#4C4556] hover:bg-[#583F52] text-[#FEFEFE] dark:bg-[#F8CB4F] dark:hover:bg-[#f6c236] dark:text-[#241E28] transition-all shadow-sm"
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : addSuccess ? (
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    disabled={isAdding || isOutOfStock}
                    onClick={() => handleAddToCart(true)}
                    className="sm:w-44 h-12 text-sm font-semibold rounded-xl border-[#4C4556] dark:border-[#F8CB4F] text-[#4C4556] dark:text-[#F8CB4F] hover:bg-muted"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* AI Concierge Link */}
                <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F]" />
                    <span className="text-foreground font-medium">
                      Have questions about this item? Ask our AI Concierge.
                    </span>
                  </div>
                  <Link 
                    href="/support"
                    className="font-bold text-[#4C4556] dark:text-[#F8CB4F] hover:underline shrink-0"
                  >
                    Chat Now &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex border-b border-border text-xs font-semibold gap-6">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-3 border-b-2 transition-all ${
                    activeTab === "details"
                      ? "border-[#4C4556] dark:border-[#F8CB4F] text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Features & Details
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-3 border-b-2 transition-all ${
                    activeTab === "shipping"
                      ? "border-[#4C4556] dark:border-[#F8CB4F] text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Shipping & Returns
                </button>
                <button
                  onClick={() => setActiveTab("vendor")}
                  className={`pb-3 border-b-2 transition-all ${
                    activeTab === "vendor"
                      ? "border-[#4C4556] dark:border-[#F8CB4F] text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Vendor Guarantee
                </button>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                {activeTab === "details" && (
                  <div className="space-y-2">
                    <p>• Premium grade materials curated for durability and ergonomic ease.</p>
                    <p>• Individually inspected for quality control prior to shipment.</p>
                    <p>• Full compatibility with standard accessories in the {product.category} category.</p>
                  </div>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-2">
                    <p>• Orders ship within 24 hours Monday through Friday.</p>
                    <p>• Free standard delivery on orders over $50; flat $4.99 otherwise.</p>
                    <p>• 30-day money-back guarantee with complimentary prepaid return labels.</p>
                  </div>
                )}
                {activeTab === "vendor" && (
                  <div className="space-y-2">
                    <p>• Sourced directly from {product.vendor_name || "verified partners"}.</p>
                    <p>• 1-year limited manufacturer warranty against craftsmanship defects.</p>
                    <p>• Direct support escalation available via support@fistamarketplace.com.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

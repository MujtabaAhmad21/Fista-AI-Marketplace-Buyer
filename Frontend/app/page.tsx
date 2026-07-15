import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Chatbot from "@/components/Chatbot";

async function getProducts() {
  const res = await fetch("http://127.0.0.1:8000/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="container mx-auto py-10 px-4 relative min-h-screen">
      
      {/* 1. Our new smart Navbar */}
      <Navbar />

      {/* 2. The Product Grid using our new interactive cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 3. The AI Chatbot */}
      <Chatbot />
      
    </main>
  );
}

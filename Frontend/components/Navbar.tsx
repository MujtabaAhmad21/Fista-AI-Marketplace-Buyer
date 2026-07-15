"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [user, setUser] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    // When the navbar loads, check for a token
    const token = localStorage.getItem("token");
    if (token) {
      // If we have a token, fetch the user's profile from the backend
      fetch("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          // If the token is expired/invalid, remove it
          localStorage.removeItem("token");
          throw new Error("Invalid token");
        })
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload(); // Refresh the page to clear state
  };

  return (
    <div className="flex justify-between items-center mb-8 border-b pb-4">
      <Link href="/">
        <h1 className="text-4xl font-extrabold tracking-tight cursor-pointer">FISTA</h1>
      </Link>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm font-medium hidden sm:inline-block">
              Welcome, {user.full_name}
            </span>
            <Button variant="outline" onClick={handleLogout}>Log Out</Button>
            {/* NEW: Link to the cart page */}
            <Link href="/cart">
              <Button>View Cart</Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Button disabled>View Cart</Button>
          </>
        )}
      </div>
    </div>
  );
}

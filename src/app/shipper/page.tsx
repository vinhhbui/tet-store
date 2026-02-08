"use client";
import { useState } from "react";
import Link from "next/link";
import OrderManager from "@/components/admin/OrderManager";

// Shipper login code (match with admin config for consistency)
const SHIPPER_CODE = "ship2025";

export default function ShipperPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === SHIPPER_CODE) {
      setIsAuthenticated(true);
    } else {
      alert("Sai mã shipper!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-tet-red)] text-white p-4">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-tet-gold)]">Khu Vực Shipper</h1>
        <form onSubmit={handleLogin} className="flex gap-2">
          <input 
            type="password" 
            placeholder="Nhập mã shipper..." 
            className="p-2 rounded text-black"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
          />
          <button type="submit" className="bg-[var(--color-tet-red)] px-4 py-2 rounded font-bold">Vào</button>
        </form>
        <Link href="/" className="mt-4 text-sm underline opacity-50">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-tet-red)] text-white">
      <header className="p-4 bg-[var(--color-tet-red)] shadow-md flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-xl uppercase">Giao Hàng Tết 🛵</h1>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs bg-black/50 px-2 py-1 rounded">Thoát</button>
      </header>

      <main className="max-w-4xl mx-auto p-4 animate-fade-in">
        <div className="mb-4 text-sm opacity-80 text-center">
            Chào bác tài! Chúc bác thượng lộ bình an 🧧
        </div>
        {/* Reuse OrderManager with shipper role */}
        <OrderManager role="shipper" />
      </main>
    </div>
  );
}

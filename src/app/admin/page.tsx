"use client";
import { useState } from "react";
import Link from "next/link";
import ProductManager from "@/components/admin/ProductManager";
import OrderManager from "@/components/admin/OrderManager";

// Cấu hình tài khoản (Mã bảo mật)
const ACCOUNTS = {
  admin: "admin2025",   // Mã cho quản trị viên
  shipper: "ship2025"   // Mã cho shipper
};

export default function AdminPage() {
  const [role, setRole] = useState<'admin' | 'shipper' | null>(null); // Lưu quyền hạn hiện tại
  const [passcode, setPasscode] = useState("");
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ACCOUNTS.admin) {
      setRole('admin');
      setActiveTab('orders');
    } else if (passcode === ACCOUNTS.shipper) {
      setRole('shipper');
      setActiveTab('orders'); // Shipper mặc định xem đơn
    } else {
      alert("Sai mã bảo mật!");
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-tet-red)] text-white p-4">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-tet-gold)]">Hệ Thống Nội Bộ</h1>
        <form onSubmit={handleLogin} className="flex gap-2">
          <input 
            type="password" 
            placeholder="Nhập mã bí mật..." 
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
        <h1 className="font-bold text-xl uppercase">
          {role === 'admin' ? 'Admin' : 'Khu Vực Shipper'}
        </h1>
        <div className="flex gap-4 items-center">
            {/* Chỉ Admin mới thấy thanh menu chuyển tab */}
            {role === 'admin' && (
              <div className="space-x-2">
                  <button 
                      onClick={() => setActiveTab('orders')}
                      className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-[var(--color-tet-gold)] text-[var(--color-tet-dark)]' : 'bg-black/20 hover:bg-black/40'}`}
                  >
                      Đơn Hàng
                  </button>
                  <button 
                      onClick={() => setActiveTab('products')}
                      className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${activeTab === 'products' ? 'bg-[var(--color-tet-gold)] text-[var(--color-tet-dark)]' : 'bg-black/20 hover:bg-black/40'}`}
                  >
                      Sản Phẩm
                  </button>
              </div>
            )}
            <button onClick={() => setRole(null)} className="text-xs bg-black/50 px-2 py-1 rounded">Thoát</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 animate-fade-in">
        {activeTab === 'orders' ? (
          <OrderManager role={role} /> 
        ) : (
          // Chỉ render ProductManager nếu là admin
          role === 'admin' ? <ProductManager /> : null
        )}
      </main>
    </div>
  );
}

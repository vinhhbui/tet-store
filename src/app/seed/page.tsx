"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { SEED_PRODUCTS } from "@/data/seed-data";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSeed = async () => {
    if (!confirm("Bạn có chắc muốn nạp dữ liệu? Dữ liệu cũ sẽ không bị xóa mà sẽ thêm mới vào.")) return;
    
    setLoading(true);
    setStatus("Đang xử lý...");

    try {
      // Sử dụng Batch để ghi hàng loạt (Atomic Write) - Nhanh và an toàn
      const batch = writeBatch(db);
      
      SEED_PRODUCTS.forEach((product) => {
        // Tạo một reference mới với ID tự động
        const docRef = doc(collection(db, "products"));
        batch.set(docRef, product);
      });

      // Thực thi lệnh ghi
      await batch.commit();
      
      setStatus(`✅ Thành công! Đã thêm ${SEED_PRODUCTS.length} sản phẩm.`);
    } catch (error) {
      console.error(error);
      setStatus("❌ Có lỗi xảy ra. Xem console để biết chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-yellow-500">DATABASE SEEDER</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full text-center">
        <p className="mb-4 text-gray-300">
          Nhấn nút bên dưới để nạp <strong>{SEED_PRODUCTS.length}</strong> sản phẩm mẫu vào Firestore.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all ${
            loading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-500 active:scale-95"
          }`}
        >
          {loading ? "Đang nạp dữ liệu..." : "🚀 BẮT ĐẦU NẠP DỮ LIỆU"}
        </button>

        {status && (
          <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
            {status}
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-red-400">
        ⚠️ Lưu ý: Sau khi nạp xong, hãy xóa trang này hoặc bảo mật nó để tránh người lạ truy cập.
      </p>
    </div>
  );
}
import React from "react";
import { useRouter } from "next/navigation"; // 1. Thêm import này

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  selectedComboLabel: string;
  quantityOfSets: number; // Số lượng set/combo khách chọn
  quantityOfItems: number; // Tổng số cái thực tế
  totalPrice: number;
}

interface CartPopupProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
}

export default function CartPopup({ items, total, onClose, onRemoveItem }: CartPopupProps) {
  const router = useRouter(); // 2. Khởi tạo router

  // 3. Sửa hàm xử lý đặt hàng
  const handleCheckout = () => {
    if (items.length === 0) return;
    onClose(); // Đóng popup
    router.push("/checkout"); // Chuyển sang trang thanh toán
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[var(--color-tet-red)] border-2 border-[var(--color-tet-gold)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-tet-gold)]/30 flex justify-between items-center text-[var(--color-tet-gold)]">
          <h2 className="font-bold text-xl uppercase tracking-wide">Giỏ Hàng Tết</h2>
          <button 
            onClick={onClose}
            className="hover:bg-black/20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body - List Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 opacity-70 text-[var(--color-tet-gold)]">
              <p className="text-4xl mb-2">🧧</p>
              <p>Chưa có món nào trong giỏ.</p>
              <p className="text-sm mt-2">Mau lựa quà Tết đi thôi!</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex gap-3 bg-black/10 p-2 rounded-lg border border-[var(--color-tet-gold)]/20">
                {/* Ảnh sản phẩm */}
                <div className="w-16 h-16 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <div className="w-full h-full bg-[var(--color-tet-gold)]/20 rounded-md flex items-center justify-center text-[var(--color-tet-gold)] text-xs">
                      No IMG
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div className="flex-1 min-w-0 text-[var(--color-tet-gold)]">
                  <h3 className="font-bold text-sm truncate">{item.name}</h3>
                  <p className="text-xs opacity-80 mt-1">
                    Phân loại: <span className="font-semibold text-[var(--color-tet-gold)]">{item.selectedComboLabel}</span>
                  </p>
                  <p className="text-xs opacity-80">
                    Số lượng: <span className="font-mono">x{item.quantityOfSets}</span>
                  </p>
                </div>

                {/* Giá & Nút xóa */}
                <div className="flex flex-col justify-between items-end text-[var(--color-tet-gold)]">
                  <span className="font-bold text-sm">{item.totalPrice.toLocaleString()}đ</span>
                  <button 
                    onClick={() => onRemoveItem(index)}
                    className="text-xs underline opacity-60 hover:opacity-100 hover:text-red-300 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Total & Checkout */}
        <div className="p-4 border-t border-[var(--color-tet-gold)]/30 bg-[var(--color-tet-red)] rounded-b-2xl">
          <div className="flex justify-between items-center mb-4 text-[var(--color-tet-gold)]">
             <span className="opacity-80">Tổng thanh toán:</span>
             <span className="text-2xl font-bold">{total.toLocaleString()}đ</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] font-bold py-3 rounded-xl text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            TIẾN HÀNH THANH TOÁN
          </button>
        </div>

      </div>
    </div>
  );
}
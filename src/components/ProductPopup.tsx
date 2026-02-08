"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface PopupProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

interface ComboOption {
  label: string;    // VD: "Mua lẻ", "combo 5"
  quantity: number; // VD: 1, 10
  discount: number; // VD: 0, 5 (tương ứng 5%)
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  combos: ComboOption[]; // Thêm trường này
}

export default function ProductPopup({ product, onClose, onAddToCart }: PopupProps) {
  const [quantity, setQuantity] = useState(1); // Số lượng set người dùng chọn
  const [loading, setLoading] = useState(false);
  
  // State lưu dữ liệu sản phẩm đầy đủ
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // State lưu combo đang được chọn (mặc định là null hoặc cái đầu tiên)
  const [selectedCombo, setSelectedCombo] = useState<ComboOption | null>(null);

  // 2. Fetch dữ liệu
  useEffect(() => {
    const fetchLatestProduct = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "products", product.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Map dữ liệu từ Firebase vào Interface
          const fullProduct = {
            id: docSnap.id,
            name: data.name,
            price: data.price,
            image: data.image,
            combos: data.combos || [] // Lấy mảng combos, nếu không có thì mảng rỗng
          } as Product;

          setCurrentProduct(fullProduct);
          
          // Mặc định chọn combo đầu tiên (thường là Mua lẻ)
          if (fullProduct.combos && fullProduct.combos.length > 0) {
            setSelectedCombo(fullProduct.combos[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProduct();
  }, [product.id]);

  // Nếu chưa load xong hoặc không có dữ liệu
  if (!currentProduct || !selectedCombo) return null;

  // 3. Tính toán giá tiền động
  // Giá gốc cho 1 set = Giá đơn vị * Số lượng trong combo
  const basePricePerSet = currentProduct.price * selectedCombo.quantity;
  
  // Số tiền được giảm = Giá gốc set * (Phần trăm giảm / 100)
  const discountAmount = basePricePerSet * (selectedCombo.discount / 100);
  
  // Giá cuối cùng của 1 set
  const finalPricePerSet = basePricePerSet - discountAmount;
  
  // Tổng tiền = Giá 1 set * Số lượng set khách chọn
  const totalPrice = finalPricePerSet * quantity;

  const handleConfirm = () => {
    const item = {
      ...currentProduct,
      selectedComboLabel: selectedCombo.label, // Lưu tên combo khách chọn
      quantityOfItems: selectedCombo.quantity * quantity, // Tổng số cái thực tế
      quantityOfSets: quantity, // Số lượng set
      totalPrice: totalPrice
    };
    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[var(--color-tet-red)] border-2 border-[var(--color-tet-gold)] rounded-2xl shadow-2xl overflow-hidden relative animate-slide-up">
        
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-[var(--color-tet-gold)] hover:bg-black/20 rounded-full p-2 z-10"
        >
          ✕
        </button>

        <div className="p-5 text-[var(--color-tet-gold)]">
          {loading && <p className="text-center mb-3 opacity-70">Loading...</p>}
          
          <div className="flex gap-4 mb-4">
            {currentProduct.image && (
              <img src={currentProduct.image} className="w-20 h-20 rounded-md object-cover border border-[var(--color-tet-gold)]" alt="" />
            )}
            <div>
              <h3 className="font-bold text-lg leading-tight">{currentProduct.name}</h3>
              <p className="opacity-80 text-sm mt-1">
                Đơn giá gốc: {currentProduct.price.toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* 4. Render danh sách Combos động từ dữ liệu */}
          <div className="bg-black/20 p-3 rounded-lg mb-4">
            <p className="text-sm font-bold mb-2 uppercase opacity-70">Hình thức mua:</p>
            <div className="flex flex-wrap gap-2">
              {currentProduct.combos.map((combo, index) => {
                const isSelected = selectedCombo.label === combo.label;
                return (
                  <button 
                    key={index}
                    onClick={() => {
                        setSelectedCombo(combo);
                        setQuantity(1); // Reset số lượng về 1 khi đổi loại combo
                    }}
                    className={`flex-1 min-w-[100px] py-2 px-1 rounded-md text-sm font-bold border transition-all
                      ${isSelected 
                        ? 'bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] border-transparent shadow-md' 
                        : 'border-[var(--color-tet-gold)] text-[var(--color-tet-gold)] hover:bg-[var(--color-tet-gold)]/10'
                      }`}
                  >
                    {combo.label}
                    {combo.discount > 0 && <span className="block text-xs opacity-80">(-{combo.discount}%)</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="font-bold">Số lượng ({selectedCombo.label}):</span>
            <div className="flex items-center gap-4 bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] rounded-lg px-2 py-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="font-bold text-xl px-2">−</button>
              <span className="font-bold text-lg min-w-[20px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="font-bold text-xl px-2">+</button>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--color-tet-gold)]/30">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm opacity-80">Tạm tính:</span>
              <div className="text-right">
                <span className="text-2xl font-bold block">{totalPrice.toLocaleString()}đ</span>
                {selectedCombo.discount > 0 && (
                    <span className="text-xs opacity-70 line-through">
                        {(currentProduct.price * selectedCombo.quantity * quantity).toLocaleString()}đ
                    </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] font-bold py-3 rounded-xl text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              THÊM VÀO GIỎ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
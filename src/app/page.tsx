"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import Banner from "@/components/Banner"; // Import Banner
import ProductPopup from "@/components/ProductPopup";
import CartPopup from "@/components/CartPopup";
import { Product } from "@/types/product";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Lấy dữ liệu từ Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        setProducts(productsData);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load cart từ localStorage khi trang mở
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Lỗi đọc cart:", error);
      }
    }
  }, []);

  // Lưu cart vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (item: any) => {
    setCartItems([...cartItems, item]);
    setSelectedProduct(null);
    alert(`Đã thêm: ${item.quantity} ${item.name} | Tổng: ${item.totalPrice.toLocaleString()}đ`);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <main className="min-h-screen p-4 pb-24">
      <header className="text-center my-6 flex justify-between items-center">
        <div />
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--color-tet-gold)] font-serif">
          Chợ Tết
        </h1>
        <button
          onClick={() => setShowCart(true)}
          className="relative bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] px-4 py-2 rounded-lg font-bold hover:opacity-90"
        >
          🛒 Cart
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {cartItems.length}
            </span>
          )}
        </button>
      </header>

      {/* Hiển thị Banner khi đã load xong dữ liệu */}
      {!loading && products.length > 0 && (
        <Banner
          products={products}
          onProductClick={setSelectedProduct}
        />
      )}

      {loading ? (
        <div className="text-center text-[var(--color-tet-gold)] mt-10">
          Đang dọn hàng ra... ⏳
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} onClick={() => setSelectedProduct(p)}>
              <ProductCard product={p as any} />
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showCart && (
        <CartPopup
          items={cartItems}
          total={totalPrice}
          onClose={() => setShowCart(false)}
          onRemoveItem={handleRemoveItem}
        />
      )}
    </main>
  );
}


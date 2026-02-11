"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";
import Banner from "@/components/Banner";
import ProductPopup from "@/components/ProductPopup";
import CartPopup from "@/components/CartPopup";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <>
      <Header cartCount={cartItems.length} onCartClick={() => setShowCart(true)} />
      
      <main className="pt-20 pb-40 px-4">
        {/* Hiển thị Banner khi đã load xong dữ liệu */}
        {!loading && products.length > 0 && (
          <Banner
            products={products}
            onProductClick={setSelectedProduct}
          />
        )}
      <h2 className="text-[var(--color-tet-gold)] font-bold mb-3 uppercase text-sm tracking-wider flex items-center gap-2">
        <span></span> Gian hàng Tết nhà Vinh
      </h2>
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
      <Footer />
    </>
  );
}


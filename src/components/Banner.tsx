import { Product } from "@/types/product";

interface BannerProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function Banner({ products, onProductClick }: BannerProps) {
  // Lấy 5 sản phẩm đầu tiên hoặc ngẫu nhiên làm nổi bật
  const featuredProducts = products.slice(0, 5);

  if (featuredProducts.length === 0) return null;

  return (
    <div className="w-full mb-6">
      <h2 className="text-[var(--color-tet-gold)] font-bold mb-3 uppercase text-sm tracking-wider flex items-center gap-2">
        <span>🔥</span> Hàng Tết Nổi Bật
      </h2>
      
      {/* Container cuộn ngang */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar pb-2">
        {featuredProducts.map((product) => (
          <div 
            key={product.id}
            onClick={() => onProductClick(product)}
            className="snap-center shrink-0 w-[85vw] md:w-[400px] relative h-[200px] rounded-xl overflow-hidden border border-[var(--color-tet-gold)] shadow-lg cursor-pointer transform transition-transform active:scale-95"
          >
            {/* Ảnh nền mờ tối */}
            <div className="absolute inset-0 bg-black/40 z-10 hover:bg-black/20 transition-colors" />
            
            {/* Ảnh sản phẩm (Giả sử product.image là array string hoặc string) */}
            <img 
              src={Array.isArray(product.images) ? product.images[0] : (product.image || '/placeholder.jpg')} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Nội dung đè lên */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-white font-bold text-lg truncate">{product.name}</h3>
              <p className="text-[var(--color-tet-gold)] font-bold">
                {product.price?.toLocaleString()}đ
              </p>
              <span className="text-xs text-white/80 italic">Chạm để xem chi tiết</span>
            </div>
            
            {/* Tag "Hot" */}
            <div className="absolute top-2 right-2 z-20 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md border border-[var(--color-tet-gold)]">
              TẾT 2026
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

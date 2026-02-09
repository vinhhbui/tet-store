import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  type: string;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-[var(--color-tet-red)] border-2 border-[var(--color-tet-gold)] rounded-lg p-3 text-[var(--color-tet-gold)] shadow-lg">
      <div className="relative w-full h-40 mb-2">
        {/* Dùng thẻ img thường cho đơn giản lúc dev, sau này tối ưu sau */}
        {product.image && (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-md"
          />
        )}
      </div>
      
      <h3 className="font-bold text-lg uppercase leading-tight line-clamp-2 min-h-[3rem]">
        {product.name}
      </h3>
      
      <p className="text-sm opacity-90 mt-1 font-mono">
        {product.price.toLocaleString('vi-VN')}đ
        {product.type && <span className="text-[var(--color-tet-gold)]"> / {product.type}</span>}
      </p>
      
      {product.type === 'combo' && (
        <span className="text-[10px] bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] px-2 py-0.5 rounded-full font-bold mt-2 inline-block">
          COMBO TIẾT KIỆM
        </span>
      )}
      
      <button className="w-full mt-3 bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] font-bold py-2 rounded-md active:scale-95 transition-transform hover:opacity-90">
        CHỌN MUA
      </button>
    </div>
  );
}
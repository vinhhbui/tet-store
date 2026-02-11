"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getShippingFee
} from "@/utils/shipping";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Footer from "@/components/Footer";

// Dữ liệu mẫu (Giữ nguyên như cũ)
export const LOCATION_DATA: Record<string, string[]> = {
  // --- KHU VỰC TRUNG TÂM ---
  "Quận 1": [
    "Phường Bến Nghé", "Phường Bến Thành", "Phường Cô Giang", "Phường Cầu Kho",
    "Phường Cầu Ông Lãnh", "Phường Đa Kao", "Phường Nguyễn Cư Trinh",
    "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Tân Định"
  ],
  "Quận 3": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13",
    "Phường 14", "Phường Võ Thị Sáu"
  ],
  "Quận 4": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6",
    "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14",
    "Phường 15", "Phường 16", "Phường 18"
  ],
  "Quận 5": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
    "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 6": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
    "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 8": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
    "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],
  "Quận 10": [
    "Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
    "Phường 12", "Phường 13", "Phường 14", "Phường 15"
  ],
  "Quận 11": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
    "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],
  "Quận Phú Nhuận": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
    "Phường 13", "Phường 15", "Phường 17"
  ],
  "Quận Bình Thạnh": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6",
    "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14",
    "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22",
    "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"
  ],
  "Quận Tân Bình": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
    "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
    "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
  ],
  "Quận Tân Phú": [
    "Phường Hiệp Tân", "Phường Hòa Thạnh", "Phường Phú Thạnh", "Phường Phú Thọ Hòa",
    "Phường Phú Trung", "Phường Sơn Kỳ", "Phường Tân Quý", "Phường Tân Sơn Nhì",
    "Phường Tân Thành", "Phường Tân Thới Hòa", "Phường Tây Thạnh"
  ],
  "Quận Gò Vấp": [
    "Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
    "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
    "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"
  ],

  // --- TP THỦ ĐỨC (Gộp Q2, Q9, Thủ Đức cũ) ---
  "Thành phố Thủ Đức": [
    "Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình Chiểu",
    "Phường Bình Thọ", "Phường Cát Lái", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước",
    "Phường Hiệp Phú", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Linh Tây",
    "Phường Linh Trung", "Phường Linh Xuân", "Phường Long Bình", "Phường Long Phước",
    "Phường Long Thạnh Mỹ", "Phường Long Trường", "Phường Phú Hữu", "Phường Phước Bình",
    "Phường Phước Long A", "Phường Phước Long B", "Phường Tam Bình", "Phường Tam Phú",
    "Phường Tân Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B",
    "Phường Thạnh Mỹ Lợi", "Phường Thảo Điền", "Phường Thủ Thiêm",
    "Phường Trường Thạnh", "Phường Trường Thọ"
  ],

  // --- CÁC QUẬN VEN ---
  "Quận 7": [
    "Phường Bình Thuận", "Phường Phú Mỹ", "Phường Phú Thuận", "Phường Tân Hưng",
    "Phường Tân Kiểng", "Phường Tân Phong", "Phường Tân Phú", "Phường Tân Quy",
    "Phường Tân Thuận Đông", "Phường Tân Thuận Tây"
  ],
  "Quận 12": [
    "Phường An Phú Đông", "Phường Đông Hưng Thuận", "Phường Hiệp Thành",
    "Phường Tân Chánh Hiệp", "Phường Tân Hưng Thuận", "Phường Tân Thới Hiệp",
    "Phường Tân Thới Nhất", "Phường Thạnh Lộc", "Phường Thạnh Xuân",
    "Phường Thới An", "Phường Trung Mỹ Tây"
  ],
  "Quận Bình Tân": [
    "Phường An Lạc", "Phường An Lạc A", "Phường Bình Hưng Hòa", "Phường Bình Hưng Hòa A",
    "Phường Bình Hưng Hòa B", "Phường Bình Trị Đông", "Phường Bình Trị Đông A",
    "Phường Bình Trị Đông B", "Phường Tân Tạo", "Phường Tân Tạo A"
  ],

  // --- CÁC HUYỆN NGOẠI THÀNH ---
  "Huyện Bình Chánh": [
    "Thị trấn Tân Túc", "Xã An Phú Tây", "Xã Bình Chánh", "Xã Bình Hưng",
    "Xã Bình Lợi", "Xã Đa Phước", "Xã Hưng Long", "Xã Lê Minh Xuân",
    "Xã Phạm Văn Hai", "Xã Phong Phú", "Xã Quy Đức", "Xã Tân Kiên",
    "Xã Tân Nhựt", "Xã Tân Quý Tây", "Xã Vĩnh Lộc A", "Xã Vĩnh Lộc B"
  ],
  "Huyện Hóc Môn": [
    "Thị trấn Hóc Môn", "Xã Bà Điểm", "Xã Đông Thạnh", "Xã Nhị Bình",
    "Xã Tân Hiệp", "Xã Tân Thới Nhì", "Xã Tân Xuân", "Xã Thới Tam Thôn",
    "Xã Trung Chánh", "Xã Xuân Thới Đông", "Xã Xuân Thới Sơn", "Xã Xuân Thới Thượng"
  ],
  "Huyện Nhà Bè": [
    "Thị trấn Nhà Bè", "Xã Hiệp Phước", "Xã Long Thới", "Xã Nhơn Đức",
    "Xã Phú Xuân", "Xã Phước Kiển", "Xã Phước Lộc"
  ],
  "Huyện Củ Chi": [
    "Thị trấn Củ Chi", "Xã An Nhơn Tây", "Xã An Phú", "Xã Bình Mỹ",
    "Xã Hòa Phú", "Xã Nhuận Đức", "Xã Phạm Văn Cội", "Xã Phú Hòa Đông",
    "Xã Phú Mỹ Hưng", "Xã Phước Hiệp", "Xã Phước Thạnh", "Xã Phước Vĩnh An",
    "Xã Tân An Hội", "Xã Tân Phú Trung", "Xã Tân Thạnh Đông", "Xã Tân Thạnh Tây",
    "Xã Tân Thông Hội", "Xã Thái Mỹ", "Xã Trung An", "Xã Trung Lập Hạ",
    "Xã Trung Lập Thượng"
  ],
  "Huyện Cần Giờ": [
    "Thị trấn Cần Thạnh", "Xã An Thới Đông", "Xã Bình Khánh", "Xã Long Hòa",
    "Xã Lý Nhơn", "Xã Tam Thôn Hiệp", "Xã Thạnh An"
  ]
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state xử lý submit

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "", // Số nhà, đường
    district: "",
    ward: "",
  });

  // State tính toán ship
  const [shippingFee, setShippingFee] = useState(0);

  // State danh sách phường
  const [availableWards, setAvailableWards] = useState<string[]>([]);

  // Load Cart
  useEffect(() => {
    const saved = localStorage.getItem("cartItems");
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const finalTotal = cartTotal + shippingFee;

  // Tính phí ship ngay lập tức khi chọn xong Quận & Phường
  useEffect(() => {
    if (formData.district && formData.ward) {
      // Truyền thêm cartTotal vào hàm tính phí
      const fee = getShippingFee(formData.district, formData.ward, cartTotal);
      setShippingFee(fee);
    } else {
      setShippingFee(0);
    }
  }, [formData.district, formData.ward, cartTotal]); // Thêm cartTotal vào dependency

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setFormData({ ...formData, district: newDistrict, ward: "" });
    // Nếu LOCATION_DATA không có key đầy đủ, hãy đảm bảo data của bạn đầy đủ hoặc handle []
    setAvailableWards(LOCATION_DATA[newDistrict] || [
      // Fallback data nếu key sai
      "Phường 1", "Phường 2"
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Kiểm tra định dạng số điện thoại (10 chữ số, bắt đầu bằng số 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số và bắt đầu bằng số 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          fullAddress: `${formData.address}, ${formData.ward}, ${formData.district}`
        },
        items: cartItems,
        financials: {
          subtotal: cartTotal,
          shippingFee: shippingFee,
          total: finalTotal
        },
        status: "new", // Trạng thái đơn hàng: mới
        createdAt: serverTimestamp(),
        deviceInfo: navigator.userAgent
      };

      // Lưu vào collection "orders" trên Firestore
      await addDoc(collection(db, "orders"), orderData);

      alert(`Đặt hàng thành công!\n\nKhách hàng: ${formData.name}\nTổng tiền: ${finalTotal.toLocaleString()}đ (Ship: ${shippingFee.toLocaleString()}đ)\nĐịa chỉ: ${formData.address}, ${formData.ward}, ${formData.district}`);

      // Xóa giỏ hàng và về trang chủ
      localStorage.removeItem("cartItems");
      router.push("/");
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau!");
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-tet-red)] text-[var(--color-tet-gold)] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống trơn! 🧧</h2>
        <Link href="/" className="underline hover:text-white">Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <>


      <div className="min-h-screen bg-[var(--color-tet-red)] text-[var(--color-tet-gold)] p-4 pb-20 font-sans">
        <div className="max-w-2xl mx-auto animate-fade-in">

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pt-4">
            <Link href="/" className="text-2xl">←</Link>
            <h1 className="text-2xl font-bold uppercase tracking-wider">Xác nhận đơn hàng</h1>
          </div>

          {/* 1. Thông tin đơn hàng (Tóm tắt) */}
          <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-tet-gold)]/30 mb-6">
            <h2 className="font-bold border-b border-[var(--color-tet-gold)]/20 pb-2 mb-3">Chi tiết thanh toán</h2>

            {/* List items scrollable */}
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar mb-4 border-b border-[var(--color-tet-gold)]/10 pb-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="truncate pr-2">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-xs opacity-70 ml-1">x{item.quantityOfSets}: </span>
                    <span className="font-semibold text-[var(--color-tet-gold)]"> {item.selectedComboLabel}</span>
                  </div>
                  <span className="font-mono flex-shrink-0">{item.totalPrice.toLocaleString()}đ</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-80">Tiền hàng:</span>
                <span className="font-bold">{cartTotal.toLocaleString()}đ</span>
              </div>

              <div className="flex justify-between items-center h-6">
                <span className="opacity-80">Phí vận chuyển:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {shippingFee === 0 && (!formData.district || !formData.ward)
                      ? "--"
                      : shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString()}đ`}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-tet-gold)]/50 mt-3 pt-3 flex justify-between text-xl font-bold text-[var(--color-tet-gold)]">
              <span>Tổng thanh toán:</span>
              <span>{finalTotal.toLocaleString()}đ</span>
            </div>
          </div>

          {/* 2. Form thông tin giao hàng */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-bold text-lg mb-2">Thông tin giao hàng</h2>

            {/* Họ tên */}
            <div>
              <label className="block text-sm opacity-80 mb-1">Họ tên người nhận *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/10 border border-[var(--color-tet-gold)] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-tet-gold)] placeholder:text-white/30"
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm opacity-80 mb-1">Số điện thoại *</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/10 border border-[var(--color-tet-gold)] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-tet-gold)] placeholder:text-white/30"
                placeholder="0909 xxx xxx"
              />
            </div>

            {/* Dropdown Quận & Phường */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm opacity-80 mb-1">Quận / Huyện *</label>
                <select
                  required
                  value={formData.district}
                  onChange={handleDistrictChange}
                  className="w-full bg-white/10 border border-[var(--color-tet-gold)] rounded-lg p-3 text-[var(--color-tet-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-tet-gold)] appearance-none"
                >
                  <option value="" className="text-black">-- Chọn Quận --</option>
                  {Object.keys(LOCATION_DATA).map(d => (
                    <option key={d} value={d} className="text-black">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm opacity-80 mb-1">Phường / Xã *</label>
                <select
                  required
                  value={formData.ward}
                  onChange={e => setFormData({ ...formData, ward: e.target.value })}
                  disabled={!formData.district}
                  className="w-full bg-white/10 border border-[var(--color-tet-gold)] rounded-lg p-3 text-[var(--color-tet-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-tet-gold)] appearance-none disabled:opacity-50"
                >
                  <option value="" className="text-black">-- Chọn Phường --</option>
                  {availableWards.map(w => (
                    <option key={w} value={w} className="text-black">{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Số nhà, tên đường (Text input) */}
            <div>
              <label className="block text-sm opacity-80 mb-1">Địa chỉ chi tiết (Số nhà, đường) *</label>
              <input
                required
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white/10 border border-[var(--color-tet-gold)] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-tet-gold)] placeholder:text-white/30"
                placeholder="VD: 123 Đường Nguyễn Huệ"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] font-bold py-4 rounded-xl text-xl shadow-xl active:scale-95 transition-transform hover:bg-yellow-400 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "ĐANG XỬ LÝ..." : `ĐẶT HÀNG (${finalTotal.toLocaleString()}đ)`}
            </button>
          </form>

        </div>
      </div>
      <Footer />
    </>

  );
}
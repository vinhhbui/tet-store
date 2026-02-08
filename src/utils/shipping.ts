// Bảng giá ship cơ bản theo Quận (Đơn vị: VNĐ)
const DISTRICT_RATES: Record<string, number> = {
  // --- KHU VỰC 1: TRUNG TÂM (Gần kho) ---
  "Quận 1": 15000,
  "Quận 3": 15000,
  "Quận 4": 0,
  "Quận 5": 15000,
  "Quận 10": 15000,
  "Quận Phú Nhuận": 15000,
  "Quận Bình Thạnh": 15000, // Giả sử kho ở Bình Thạnh hoặc gần đó

  // --- KHU VỰC 2: NỘI THÀNH ---
  "Quận 6": 25000,
  "Quận 8": 25000,
  "Quận 11": 25000,
  "Quận Tân Bình": 25000,
  "Quận Tân Phú": 25000,
  "Quận Gò Vấp": 25000,

  // --- KHU VỰC 3: NGOẠI THÀNH ---
  "Quận 7": 30000,
  "Quận 12": 35000,
  "Quận Bình Tân": 35000,
  "Thành phố Thủ Đức": 35000,

  // --- KHU VỰC 4: HUYỆN ---
  "Huyện Bình Chánh": 45000,
  "Huyện Hóc Môn": 45000,
  "Huyện Nhà Bè": 45000,
  "Huyện Củ Chi": 55000,
  "Huyện Cần Giờ": 70000,
};

// Hàm lấy phí ship dựa trên Quận và Phường
export const getShippingFee = (district: string, ward: string, subtotal: number = 0): number => {
  // Nếu đơn hàng >= 200k thì FREESHIP
  if (subtotal >= 200000) {
    return 0;
  }

  // 1. Lấy giá cơ bản theo Quận
  let fee = DISTRICT_RATES[district] ; // Mặc định 30k nếu không tìm thấy quận

  // 2. (Tuy chọn) Logic phụ thu theo Phường đặc biệt
  // Ví dụ: Các phường xa của TP Thủ Đức
  if (district === "Thành phố Thủ Đức") {
    const remoteWards = ["Phường Long Phước", "Phường Long Bình", "Phường Long Thạnh Mỹ"];
    if (remoteWards.includes(ward)) {
      fee += 10000; // Phụ thu 10k
    }
  }

  // Ví dụ: Các xã xa của Bình Chánh
  if (district === "Huyện Bình Chánh") {
    const remoteCommunes = ["Xã Quy Đức", "Xã Đa Phước", "Xã Phong Phú"];
    if (remoteCommunes.includes(ward)) {
       fee += 5000;
    }
  }

  return fee;
};
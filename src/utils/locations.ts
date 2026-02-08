// utils/locations.ts

export const CITY_NAME = "Thành phố Hồ Chí Minh";

export const DISTRICTS_DATA: Record<string, string[]> = {
  "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cô Giang", "Phường Cầu Kho", "Phường Đa Kao"],
  "Quận 3": ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3"],
  "Quận 4": ["Phường 1", "Phường 2", "Phường 3", "Phường 4"],
  "Quận 5": ["Phường 1", "Phường 2", "Phường 3", "Phường 4"],
  "Quận 7": ["Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng", "Phường Tân Hưng"],
  "Quận 10": ["Phường 1", "Phường 2", "Phường 4", "Phường 5"],
  "Quận Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 25"],
  "Thành phố Thủ Đức": ["Phường Thảo Điền", "Phường An Phú", "Phường Bình Chiểu", "Phường Linh Trung"],
  "Quận Gò Vấp": ["Phường 1", "Phường 3", "Phường 4", "Phường 5"],
  // ... Bạn có thể thêm các quận khác vào đây
};

export const getWards = (district: string) => {
  return DISTRICTS_DATA[district] || [];
};
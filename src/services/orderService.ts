// src/services/orderService.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

// Định nghĩa kiểu dữ liệu cho Đơn hàng
export interface Order {
  id?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
  createdAt?: Timestamp | Date;
}

const ORDERS_COLLECTION = 'orders';

// Tạo đơn hàng mới
export const createOrder = async (order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Không thể tạo đơn hàng');
  }
};

// Lấy tất cả đơn hàng
export const getOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status']
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Không thể cập nhật trạng thái đơn hàng');
  }
};
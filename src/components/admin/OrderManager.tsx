"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, orderBy, query, deleteDoc } from "firebase/firestore";

interface OrderManagerProps {
  role: 'admin' | 'shipper';
}

export default function OrderManager({ role }: OrderManagerProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'active' | 'history'>('active');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      const snap = await getDocs(collection(db, "orders"));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", id), { status: newStatus });
    fetchOrders(); 
  };

  const deleteOrder = async (id: string) => {
      if (role !== 'admin') {
        alert("Bạn không có quyền xóa đơn!");
        return;
      }
      if(!confirm("Xóa đơn hàng này?")) return;
      await deleteDoc(doc(db, "orders", id));
      fetchOrders();
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-green-600 text-white';
      case 'processing': return 'bg-blue-600 text-white';
      case 'shipped': return 'bg-purple-600 text-white';
      case 'done': return 'bg-gray-600 text-gray-200';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-500';
    }
  };

  const filteredOrders = orders.filter(order => {
    const isCompleted = order.status === 'done' || order.status === 'cancelled';
    if (filterTab === 'active') return !isCompleted; 
    return isCompleted; 
  });

  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg sticky top-[70px] z-40 backdrop-blur-md border border-[var(--color-tet-gold)]/30">
        <h2 className="text-lg font-bold text-[var(--color-tet-gold)] hidden sm:block">Quản lý Đơn</h2>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={() => setFilterTab('active')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterTab === 'active' ? 'bg-[var(--color-tet-gold)] text-black shadow-lg scale-105' : 'bg-black/40 text-gray-300'}`}
            >
                Đang xử lý
            </button>
            <button 
                onClick={() => setFilterTab('history')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterTab === 'history' ? 'bg-[var(--color-tet-gold)] text-black shadow-lg scale-105' : 'bg-black/40 text-gray-300'}`}
            >
                Lịch sử ({orders.filter(o => o.status === 'done' || o.status === 'cancelled').length})
            </button>
            <button onClick={fetchOrders} className="bg-white/10 px-3 rounded-lg text-xl">↻</button>
        </div>
       </div>

      {loading ? <p className="text-center text-white">Đang tải...</p> : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-[#333333] rounded-xl overflow-hidden shadow-xl border border-[var(--color-tet-gold)]/50 animate-fade-in">
              
              {/* Header: Tên khách + Trạng thái */}
              <div className="bg-white/30 p-3 flex justify-between items-center border-b border-white/10">
                <div className="font-bold text-lg text-[var(--color-tet-gold)] truncate max-w-[60%]">
                    {order.customer?.name}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status === 'new' ? 'MỚI' : order.status}
                </span>
              </div>

              <div className="p-4 space-y-4">
                
                {/* Khu vực 1: Thông tin liên lạc (Nút to dễ ấn) */}
                <div className="grid grid-cols-2 gap-3">
                    <a 
                        href={`tel:${order.customer?.phone}`}
                        className="bg-green-700/20 hover:bg-green-700/40 border border-green-700/50 rounded-lg p-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                        <span className="text-2xl">📞</span>
                        <span className="font-bold text-green-400">{order.customer?.phone}</span>
                        <span className="text-[10px] uppercase opacity-70">Gọi điện</span>
                    </a>

                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer?.fullAddress || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-700/20 hover:bg-blue-700/40 border border-blue-700/50 rounded-lg p-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform text-center"
                    >
                        <span className="text-2xl">📍</span>
                        <span className="font-bold text-blue-400 text-sm line-clamp-1">{order.customer?.district}</span>
                        <span className="text-[10px] uppercase opacity-70">Mở bản đồ</span>
                    </a>
                </div>
                
                {/* Khu vực 2: Địa chỉ chi tiết */}
                <div className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 border border-white/5">
                    <span className="opacity-50 text-xs block mb-1">ĐỊA CHỈ GIAO HÀNG:</span>
                    {order.customer?.fullAddress}
                </div>

                {/* Khu vực 3: Danh sách món */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <span className="opacity-50 text-xs block mb-2 uppercase border-b border-white/10 pb-1">Chi tiết đơn hàng:</span>
                    {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-1 text-sm">
                        <div className="flex-1">
                            <span className="text-white font-medium">{item.name}</span>
                            <div className="text-xs text-[var(--color-tet-gold)] opacity-80">{item.selectedComboLabel}</div>
                        </div>
                        <div className="text-right">
                            <span className="font-bold bg-white/10 px-2 py-1 rounded">x{item.quantityOfSets || item.quantity}</span>
                        </div>
                    </div>
                    ))}
                    <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[var(--color-tet-gold)] font-bold text-lg">
                        <span>Tổng thu:</span>
                        <span>{order.financials?.total?.toLocaleString()}đ</span>
                    </div>
                     <div className="text-xs text-right opacity-50 mt-1">
                        (Ship: {order.financials?.shippingFee?.toLocaleString()}đ)
                     </div>
                </div>

                {/* Khu vực 4: Hành động (Cập nhật trạng thái) */}
                <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Cập nhật trạng thái:</label>
                    <div className="flex gap-2 h-12">
                        <select 
                            value={order.status} 
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="bg-white text-black font-bold rounded-lg px-4 flex-1 outline-none text-lg border-2 border-[var(--color-tet-gold)]"
                        >
                            <option value="new">Mới đặt</option>
                            <option value="processing">Đang làm</option>
                            <option value="shipped">🚀 Đang giao</option>
                            <option value="done">✅ Hoàn tất</option>
                            <option value="cancelled">❌ Hủy đơn</option>
                        </select>
                        
                        {role === 'admin' && (
                             <button 
                                onClick={() => deleteOrder(order.id)} 
                                className="bg-red-900/50 border border-red-600 text-red-400 px-4 rounded-lg hover:bg-red-900 transition-colors"
                                title="Xóa đơn"
                            >
                                🗑
                            </button>
                        )}
                    </div>
                    <div className="text-center mt-2 text-[10px] text-gray-500">
                        Đặt lúc: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                </div>

              </div>
            </div>
          ))}
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 opacity-50 border-2 border-dashed border-gray-600 rounded-xl">
                <p className="text-xl">📭</p>
                <p>Không tìm thấy đơn hàng nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

interface Combo {
  label: string;
  quantity: number;
  discount: number;
}

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Cấu trúc form theo hình ảnh
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    image: "", // String theo hình
    combos: [] as Combo[]
  });

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dữ liệu save chuẩn theo hình
      const dataToSave = {
        name: formData.name,
        price: Number(formData.price),
        image: formData.image,
        combos: formData.combos.map(c => ({
            label: c.label,
            quantity: Number(c.quantity),
            discount: Number(c.discount)
        }))
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), dataToSave);
      } else {
        await addDoc(collection(db, "products"), dataToSave);
      }
      resetForm();
      fetchProducts();
      alert("Lưu sản phẩm thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu!");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: 0, image: "", combos: [] });
    setEditingId(null);
  }

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      price: p.price,
      image: p.image || (p.images && p.images[0]) || "", // Fallback nếu dữ liệu cũ dùng mảng images
      // Nếu chưa có combo, tạo mặc định
      combos: p.combos || [
          { label: "Mua lẻ", quantity: 1, discount: 0 },
          { label: "combo 10", quantity: 10, discount: 0 }
      ]
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  // Các hàm xử lý Combos dynamic
  const addCombo = () => {
      setFormData(prev => ({
          ...prev,
          combos: [...prev.combos, { label: "", quantity: 1, discount: 0 }]
      }));
  }

  const removeCombo = (index: number) => {
      setFormData(prev => ({
          ...prev,
          combos: prev.combos.filter((_, i) => i !== index)
      }));
  }

  const updateCombo = (index: number, field: keyof Combo, value: any) => {
      const newCombos = [...formData.combos];
      newCombos[index] = { ...newCombos[index], [field]: value };
      setFormData(prev => ({ ...prev, combos: newCombos }));
  }

  return (
    <div className="p-4 bg-white/10 rounded-xl text-white">
      <h2 className="text-xl font-bold mb-4 text-[var(--color-tet-gold)]">Quản lý Sản phẩm</h2>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-black/20 p-4 rounded grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm opacity-70 mb-1">Tên sản phẩm *</label>
                <input 
                    placeholder="Tên sản phẩm" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 rounded bg-white/20" required
                />
            </div>
            <div>
                <label className="block text-sm opacity-70 mb-1">Giá cơ bản (1 cái) *</label>
                <input 
                    type="number" placeholder="Giá" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full p-2 rounded bg-white/20" required
                />
            </div>
        </div>
        
        <div>
            <label className="block text-sm opacity-70 mb-1">Link ảnh (URL) *</label>
            <input 
                placeholder="https://..." 
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
                className="w-full p-2 rounded bg-white/20" required
            />
        </div>

        {/* Combos Section */}
        <div className="bg-white/5 p-3 rounded">
            <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-[var(--color-tet-gold)]">Cấu hình Compbos</label>
                <button type="button" onClick={addCombo} className="text-xs bg-green-600 px-2 py-1 rounded">+ Thêm Combo</button>
            </div>
            
            {formData.combos.map((combo, idx) => (
                <div key={idx} className="flex gap-2 items-end mb-2 p-2 border border-white/10 rounded">
                    <div className="flex-1">
                        <label className="text-xs opacity-50 block">Nhãn (Label)</label>
                        <input 
                            value={combo.label} 
                            onChange={e => updateCombo(idx, 'label', e.target.value)}
                            placeholder="Vd: Mua lẻ"
                            className="w-full p-1 bg-white/10 rounded text-sm"
                        />
                    </div>
                    <div className="w-20">
                        <label className="text-xs opacity-50 block">SL (Qty)</label>
                        <input 
                            type="number"
                            value={combo.quantity} 
                            onChange={e => updateCombo(idx, 'quantity', Number(e.target.value))}
                            className="w-full p-1 bg-white/10 rounded text-sm"
                        />
                    </div>
                    <div className="w-24">
                        <label className="text-xs opacity-50 block">Giảm (Disc)</label>
                        <input 
                            type="number"
                            value={combo.discount} 
                            onChange={e => updateCombo(idx, 'discount', Number(e.target.value))}
                            className="w-full p-1 bg-white/10 rounded text-sm"
                        />
                    </div>
                    <button type="button" onClick={() => removeCombo(idx)} className="bg-red-600/50 hover:bg-red-600 text-white p-1 rounded h-8 w-8 flex items-center justify-center">×</button>
                </div>
            ))}
            {formData.combos.length === 0 && <p className="text-sm opacity-50 italic">Chưa có combo nào.</p>}
        </div>

        <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-[var(--color-tet-gold)] text-black font-bold p-2 rounded hover:opacity-90">
            {editingId ? "Lưu Thay Đổi" : "Tạo Sản Phẩm"}
            </button>
            {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 rounded">
                Hủy
            </button>
            )}
        </div>
      </form>

      {/* List */}
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-black/30 p-3 rounded border border-[var(--color-tet-gold)]/30">
            <div className="flex items-center gap-3">
               {/* Hỗ trợ hiển thị cả image mới và images cũ */}
              <img src={p.image || (p.images && p.images[0])} className="w-12 h-12 object-cover rounded bg-white/10" alt="" />
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-sm text-[var(--color-tet-gold)]">{p.price?.toLocaleString()}đ</div>
                <div className="text-xs opacity-50">{p.combos?.length || 0} combos</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Sửa</button>
              <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

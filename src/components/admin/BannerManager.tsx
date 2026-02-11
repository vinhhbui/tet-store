"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    query,
} from "firebase/firestore";
import { BannerPost } from "@/types/banner";

// Nén ảnh bằng canvas trước khi lưu base64 vào Firestore
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Resize nếu quá lớn
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Cannot get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Chuyển sang base64 (JPEG để nhỏ hơn)
                const base64 = canvas.toDataURL("image/jpeg", quality);
                resolve(base64);
            };
            img.onerror = () => reject(new Error("Lỗi đọc ảnh"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Lỗi đọc file"));
        reader.readAsDataURL(file);
    });
};

export default function BannerManager() {
    const [posts, setPosts] = useState<BannerPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPost, setEditingPost] = useState<BannerPost | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        author: "",
        tags: "",
        isActive: true,
    });

    // Fetch banner posts
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "bannerPosts"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(
                (docSnap) =>
                ({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as BannerPost)
            );
            setPosts(postsData);
        } catch (error) {
            console.error("Lỗi lấy bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
            return;
        }

        try {
            // Preview ngay
            const previewReader = new FileReader();
            previewReader.onloadend = () => {
                setImagePreview(previewReader.result as string);
            };
            previewReader.readAsDataURL(file);

            // Nén ảnh → base64
            const compressed = await compressImage(file, 800, 0.7);
            setImageBase64(compressed);
        } catch (error) {
            console.error("Lỗi xử lý ảnh:", error);
            alert("Có lỗi khi xử lý ảnh. Thử lại với ảnh khác.");
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            author: "",
            tags: "",
            isActive: true,
        });
        setImagePreview(null);
        setImageBase64(null);
        setEditingPost(null);
        setShowForm(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEdit = (post: BannerPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            author: post.author,
            tags: post.tags.join(", "),
            isActive: post.isActive,
        });
        setImagePreview(post.imageUrl || null);
        setImageBase64(post.imageUrl || null);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert("Vui lòng nhập tiêu đề!");
            return;
        }

        setSaving(true);
        try {
            // Dùng base64 đã nén hoặc giữ URL cũ khi edit
            let imageUrl = imageBase64 || editingPost?.imageUrl || "";

            const tags = formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t);

            if (editingPost) {
                // Update existing post
                const postRef = doc(db, "bannerPosts", editingPost.id);
                await updateDoc(postRef, {
                    title: formData.title,
                    content: formData.content,
                    author: formData.author,
                    imageUrl,
                    tags,
                    isActive: formData.isActive,
                    updatedAt: Date.now(),
                });
                alert("Đã cập nhật bài viết!");
            } else {
                // Create new post
                await addDoc(collection(db, "bannerPosts"), {
                    title: formData.title,
                    content: formData.content,
                    author: formData.author,
                    imageUrl,
                    tags,
                    isActive: formData.isActive,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
                alert("Đã thêm bài viết mới!");
            }

            resetForm();
            fetchPosts();
        } catch (error) {
            console.error("Lỗi lưu bài viết:", error);
            alert("Có lỗi xảy ra khi lưu! Chi tiết: " + (error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (post: BannerPost) => {
        if (!confirm(`Bạn chắc chắn muốn xóa bài viết "${post.title}"?`)) return;
        try {
            await deleteDoc(doc(db, "bannerPosts", post.id));
            alert("Đã xóa bài viết!");
            fetchPosts();
        } catch (error) {
            console.error("Lỗi xóa bài viết:", error);
            alert("Có lỗi xảy ra khi xóa!");
        }
    };

    const toggleActive = async (post: BannerPost) => {
        try {
            const postRef = doc(db, "bannerPosts", post.id);
            await updateDoc(postRef, { isActive: !post.isActive });
            fetchPosts();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-tet-gold)] flex items-center gap-2">
                    📰 Quản Lý Banner / Blog
                </h2>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className="bg-[var(--color-tet-gold)] text-[var(--color-tet-dark)] px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                    {showForm ? "✕ Đóng" : "＋ Thêm Bài Viết"}
                </button>
            </div>

            {/* Form thêm/sửa */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-black/30 backdrop-blur rounded-xl p-5 mb-6 border border-[var(--color-tet-gold)]/30 space-y-4 animate-fade-in"
                >
                    <h3 className="text-[var(--color-tet-gold)] font-bold text-lg">
                        {editingPost ? "✏️ Sửa Bài Viết" : "📝 Thêm Bài Viết Mới"}
                    </h3>

                    {/* Tiêu đề */}
                    <div>
                        <label className="text-sm text-white/70 block mb-1">
                            Tiêu đề *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder:text-white/40 focus:border-[var(--color-tet-gold)] focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Nội dung */}
                    <div>
                        <label className="text-sm text-white/70 block mb-1">
                            Nội dung
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({ ...formData, content: e.target.value })
                            }
                            placeholder="Nhập nội dung bài viết..."
                            rows={5}
                            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder:text-white/40 focus:border-[var(--color-tet-gold)] focus:outline-none transition-colors resize-y"
                        />
                    </div>

                    {/* Tác giả */}
                    <div>
                        <label className="text-sm text-white/70 block mb-1">Tác giả</label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) =>
                                setFormData({ ...formData, author: e.target.value })
                            }
                            placeholder="Tên tác giả..."
                            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder:text-white/40 focus:border-[var(--color-tet-gold)] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-sm text-white/70 block mb-1">
                            Tags (phân cách bằng dấu phẩy)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData({ ...formData, tags: e.target.value })
                            }
                            placeholder="vd: Tết, Khuyến mãi, Sản phẩm mới..."
                            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder:text-white/40 focus:border-[var(--color-tet-gold)] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Upload ảnh */}
                    <div>
                        <label className="text-sm text-white/70 block mb-1">
                            Hình ảnh
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white/10 border border-dashed border-white/30 px-4 py-3 rounded-lg hover:bg-white/20 transition-colors text-white/70 text-sm flex items-center gap-2"
                            >
                                📷 Chọn ảnh
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {imageBase64 && (
                                <span className="text-xs text-green-400">
                                    ✅ Ảnh đã sẵn sàng
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-white/30 mt-1">
                            Ảnh sẽ được nén tự động. Tối đa 5MB.
                        </p>
                        {imagePreview && (
                            <div className="mt-3 relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-[200px] rounded-lg border border-white/20 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageBase64(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Trạng thái */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-white/70">Hiển thị:</label>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({ ...formData, isActive: !formData.isActive })
                            }
                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-500"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? "left-6" : "left-0.5"
                                    }`}
                            />
                        </button>
                        <span className="text-xs text-white/50">
                            {formData.isActive ? "Đang bật" : "Đang tắt"}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[var(--color-tet-gold)] text-[var(--color-tet-dark)] px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {saving
                                ? "Đang lưu..."
                                : editingPost
                                    ? "💾 Cập Nhật"
                                    : "✅ Đăng Bài"}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-white/10 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-white/20 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* Danh sách bài viết */}
            {loading ? (
                <div className="text-center text-[var(--color-tet-gold)] py-8">
                    Đang tải bài viết... ⏳
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center text-white/50 py-8">
                    <p className="text-4xl mb-2">📝</p>
                    <p>Chưa có bài viết nào.</p>
                    <p className="text-sm mt-1">
                        Nhấn &quot;Thêm Bài Viết&quot; để bắt đầu!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className={`bg-black/20 border rounded-xl overflow-hidden transition-all hover:shadow-lg ${post.isActive
                                    ? "border-[var(--color-tet-gold)]/30"
                                    : "border-white/10 opacity-60"
                                }`}
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Ảnh thumbnail */}
                                {post.imageUrl && (
                                    <div className="md:w-48 h-40 md:h-auto flex-shrink-0">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Nội dung */}
                                <div className="flex-1 p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                                                {post.author && <span>✍️ {post.author}</span>}
                                                <span>📅 {formatDate(post.createdAt)}</span>
                                                {post.updatedAt !== post.createdAt && (
                                                    <span className="italic">
                                                        (sửa: {formatDate(post.updatedAt)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Status badge */}
                                        <span
                                            className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${post.isActive
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-gray-500/20 text-gray-400"
                                                }`}
                                        >
                                            {post.isActive ? "Hiển thị" : "Ẩn"}
                                        </span>
                                    </div>

                                    {/* Content preview */}
                                    <p className="text-white/70 text-sm line-clamp-2 mb-3">
                                        {post.content || "Không có nội dung."}
                                    </p>

                                    {/* Tags */}
                                    {post.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {post.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-[var(--color-tet-gold)]/20 text-[var(--color-tet-gold)] text-xs px-2 py-0.5 rounded-full"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500/40 transition-colors"
                                        >
                                            ✏️ Sửa
                                        </button>
                                        <button
                                            onClick={() => toggleActive(post)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${post.isActive
                                                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40"
                                                    : "bg-green-500/20 text-green-400 hover:bg-green-500/40"
                                                }`}
                                        >
                                            {post.isActive ? "👁️ Ẩn" : "👁️ Hiện"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post)}
                                            className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/40 transition-colors"
                                        >
                                            🗑️ Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

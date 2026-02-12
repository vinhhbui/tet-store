"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { BannerPost } from "@/types/banner";

interface BannerProps {
  posts: BannerPost[];
}

export default function Banner({ posts }: BannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPost, setSelectedPost] = useState<BannerPost | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chỉ hiển thị bài viết active
  const activePosts = posts.filter((p) => p.isActive);

  if (activePosts.length === 0) return null;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % activePosts.length);
  }, [activePosts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + activePosts.length) % activePosts.length
    );
  }, [activePosts.length]);

  // Auto-play loop mỗi 2s
  useEffect(() => {
    if (activePosts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [activePosts.length, isPaused, nextSlide]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    setIsPaused(true); // Tạm dừng auto khi đang touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const diffX = Math.abs(touchEndX.current - touchStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Nếu vuốt ngang nhiều hơn dọc → đang swipe banner
    if (diffX > diffY && diffX > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        nextSlide(); // Vuốt trái → next
      } else {
        prevSlide(); // Vuốt phải → prev
      }
    }

    // Resume auto-play sau 4s
    setTimeout(() => setIsPaused(false), 10000);
  };

  // Mouse swipe (desktop)
  const mouseStartX = useRef(0);
  const isMouseDown = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isMouseDown.current = true;
    isSwiping.current = false;
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    const diff = Math.abs(e.clientX - mouseStartX.current);
    if (diff > 10) {
      isSwiping.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;

    const diff = mouseStartX.current - e.clientX;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setTimeout(() => setIsPaused(false), 4000);
  };

  const handleSlideClick = (post: BannerPost) => {
    // Chỉ mở popup nếu không phải đang swipe
    if (!isSwiping.current) {
      setSelectedPost(post);
      setIsPaused(true);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const featuredPost = activePosts[currentSlide] || activePosts[0];

  return (
    <>
      <div className="w-full mb-8">
        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden border border-[var(--color-tet-gold)]/30 shadow-2xl bg-black/30 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (isMouseDown.current) {
              isMouseDown.current = false;
              setTimeout(() => setIsPaused(false), 4000);
            }
          }}
        >
          {/* Slides wrapper */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {activePosts.map((post) => (
              <div
                key={post.id}
                className="w-full flex-shrink-0"
                onClick={() => handleSlideClick(post)}
              >
                {/* Ảnh bìa */}
                {post.imageUrl ? (
                  <div className="relative w-full h-[220px] md:h-[340px] overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Nội dung trên ảnh */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {post.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-[var(--color-tet-gold)]/30 text-[var(--color-tet-gold)] text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-[var(--color-tet-gold)]/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="text-white font-bold text-lg md:text-2xl leading-tight mb-1 drop-shadow-lg line-clamp-2">
                        {post.title}
                      </h2>
                      <div className="flex items-center gap-2 text-white/70 text-xs">
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 bg-[var(--color-tet-gold)] rounded-full flex items-center justify-center text-[var(--color-tet-dark)] text-[9px] font-bold">
                              {post.author.charAt(0).toUpperCase()}
                            </span>
                            {post.author}
                          </span>
                        )}
                        {/* <span>{formatDate(post.createdAt)}</span> */}
                      </div>
                      {/* Hint nhấn để xem */}
                      <span className="inline-block mt-2 text-[var(--color-tet-gold)] text-xs font-medium opacity-80">
                        Nhấn để xem chi tiết →
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Không có ảnh */
                  <div className="relative w-full h-[220px] md:h-[340px] bg-gradient-to-br from-[var(--color-tet-red)] to-[var(--color-tet-dark)] flex flex-col justify-end p-4 md:p-6">
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-[var(--color-tet-gold)]/30 text-[var(--color-tet-gold)] text-[10px] font-medium px-2 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="text-white font-bold text-lg md:text-2xl leading-tight mb-1">
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 bg-[var(--color-tet-gold)] rounded-full flex items-center justify-center text-[var(--color-tet-dark)] text-[9px] font-bold">
                            {post.author.charAt(0).toUpperCase()}
                          </span>
                          {post.author}
                        </span>
                      )}
                      {/* <span>{formatDate(post.createdAt)}</span> */}
                    </div>
                    <span className="inline-block mt-2 text-[var(--color-tet-gold)] text-xs font-medium opacity-80">
                      Nhấn để xem chi tiết →
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Badge số bài */}
          {activePosts.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 z-10">
              {currentSlide + 1} / {activePosts.length}
            </div>
          )}


        </div>

        {/* Dots indicator */}
        {activePosts.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {activePosts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 4000);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide
                  ? "bg-[var(--color-tet-gold)] w-6"
                  : "bg-white/30 hover:bg-white/50 w-2"
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popup chi tiết bài viết */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          onClick={() => {
            setSelectedPost(null);
            setIsPaused(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

          {/* Content */}
          <div
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-tet-dark)] border border-[var(--color-tet-gold)]/30 rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ảnh lớn */}
            {selectedPost.imageUrl && (
              <div className="relative w-full h-[250px] md:h-[300px]">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-tet-dark)] via-transparent to-transparent" />
              </div>
            )}

            {/* Nút đóng */}
            <button
              onClick={() => {
                setSelectedPost(null);
                setIsPaused(false);
              }}
              className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10 z-20 text-lg"
              aria-label="Đóng"
            >
              ✕
            </button>

            {/* Nội dung chi tiết */}
            <div className={`p-5 md:p-6 ${selectedPost.imageUrl ? "-mt-10 relative z-10" : ""}`}>
              {/* Tags */}
              {selectedPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedPost.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[var(--color-tet-gold)]/20 text-[var(--color-tet-gold)] text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--color-tet-gold)]/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Tiêu đề */}
              <h2 className="text-white font-bold text-xl md:text-2xl leading-tight mb-3">
                {selectedPost.title}
              </h2>

              {/* Meta */}
              <div className="flex items-center gap-3 text-white/60 text-xs mb-4 pb-4 border-b border-white/10">
                {selectedPost.author && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-6 h-6 bg-[var(--color-tet-gold)] rounded-full flex items-center justify-center text-[var(--color-tet-dark)] text-xs font-bold">
                      {selectedPost.author.charAt(0).toUpperCase()}
                    </span>
                    {selectedPost.author}
                  </span>
                )}
                {/* <span>📅 {formatDate(selectedPost.createdAt)}</span> */}
                {selectedPost.updatedAt !== selectedPost.createdAt && (
                  <span className="italic text-white/40">
                    (sửa: {formatDate(selectedPost.updatedAt)})
                  </span>
                )}
              </div>

              {/* Nội dung đầy đủ */}
              {selectedPost.content ? (
                <p className="text-white/80 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </p>
              ) : (
                <p className="text-white/40 text-sm italic">
                  Không có nội dung chi tiết.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

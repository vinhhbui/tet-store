"use client";
import { useState } from "react";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-tet-red)] border-b-4 border-[var(--color-tet-gold)] shadow-lg">
      <div className="flex justify-between items-center p-4">
        {/* Left spacer */}
        <div className="w-12" />
        
        {/* Logo/Title */}
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--color-tet-gold)] font-serif">
            Chợ Tết
          </h1>
          <p className="text-xs text-[var(--color-tet-gold)] font-semibold tracking-wide">
            Đồ Tết nhà Vinh, Tết vui linh đình! 
          </p>
        </div>
        
        {/* Cart button */}
        <button
          onClick={onCartClick}
          className="relative bg-[var(--color-tet-gold)] text-[var(--color-tet-red)] px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-95 flex items-center gap-2"
        >
          🛒 Giỏ
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

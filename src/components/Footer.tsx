export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[var(--color-tet-red)] border-t-4 border-[var(--color-tet-gold)] shadow-lg">
      <div className="max-w-full px-4 py-3">
        {/* Top row - Navigation Links */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
          <a
            href="#"
            className="text-[var(--color-tet-gold)] font-semibold hover:text-yellow-300 transition-colors"
          >
            Liên Hệ
          </a>
          <a
            href="#"
            className="text-[var(--color-tet-gold)] font-semibold hover:text-yellow-300 transition-colors"
          >
            Hỗ Trợ
          </a>
          <a
            href="#"
            className="text-[var(--color-tet-gold)] font-semibold hover:text-yellow-300 transition-colors"
          >
            Về Chúng Tôi
          </a>
        </div>

        {/* Bottom row - Copyright */}
        <div className="text-center text-[10px] text-[var(--color-tet-gold)] border-t border-[var(--color-tet-gold)] pt-2">
          <p className="font-semibold">Copyright © {currentYear} by Vinh</p>
          <p className="text-[9px] opacity-80">Vạng sự như ý | Mã đáo thành công</p>
        </div>
      </div>
    </footer>
  );
}

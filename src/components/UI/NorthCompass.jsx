export default function NorthCompass() {
  return (
    <div className="absolute left-5 z-20 flex flex-col items-center" style={{ top: 80 }}>
      <div className="glass rounded-xl px-3 py-2 flex flex-col items-center gap-0.5">
        {/* Up arrow */}
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
          <path d="M9 1L9 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 6L9 1L14 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-white text-xs font-bold tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>N</span>
      </div>
    </div>
  );
}

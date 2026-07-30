export function CrustLogo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cc-loaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e4cf" />
          <stop offset="100%" stopColor="#c89665" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#2c5282" />
      <path
        d="M14 40c0-9 8-16 18-16s18 7 18 16z"
        fill="url(#cc-loaf)"
        stroke="#a87c4f"
        strokeWidth="2"
      />
      <path d="M14 40h36" stroke="#a87c4f" strokeWidth="2" />
      <path
        d="M22 24c2-3 6-3 8 0M30 22c2-3 6-3 8 0"
        stroke="#a87c4f"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="32" cy="38" r="2" fill="#a87c4f" />
      <circle cx="24" cy="38" r="1.5" fill="#a87c4f" />
      <circle cx="40" cy="38" r="1.5" fill="#a87c4f" />
    </svg>
  );
}

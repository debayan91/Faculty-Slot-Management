export function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        strokeWidth="0.5"
      >
        {/* Icosahedron lines */}
        <path d="M50 5 L95 27.5 L77.5 72.5 H22.5 L5 27.5 Z" />
        <path d="M50 5 L50 35" />
        <path d="M95 27.5 L67.5 35" />
        <path d="M77.5 72.5 L67.5 65" />
        <path d="M22.5 72.5 L32.5 65" />
        <path d="M5 27.5 L32.5 35" />
        <path d="M50 100 L50 65" />
        <path d="M22.5 72.5 L5 72.5" />
        <path d="M77.5 72.5 L95 72.5" />
        <path d="M20 95 L50 100 L80 95" />
        <path d="M20 95 L22.5 72.5" />
        <path d="M80 95 L77.5 72.5" />

        {/* Inner Connections */}
        <path d="M50 35 L32.5 35" />
        <path d="M50 35 L67.5 35" />
        <path d="M32.5 35 L32.5 65" />
        <path d="M67.5 35 L67.5 65" />
        <path d="M32.5 65 L50 65" />
        <path d="M67.5 65 L50 65" />

        {/* More connections to give depth */}
        <path d="M50 5 L32.5 35" />
        <path d="M50 5 L67.5 35" />
        <path d="M95 27.5 L77.5 72.5" />
        <path d="M5 27.5 L22.5 72.5" />
        <path d="M50 100 L22.5 72.5" />
        <path d="M50 100 L77.5 72.5" />
      </svg>
    </div>
  );
}

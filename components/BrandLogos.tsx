import React from 'react';

export function BenapoleLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg viewBox="0 0 200 120" className="h-full w-auto aspect-[5/3]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top Handle */}
        <circle cx="100" cy="18" r="7" fill="#F7931E" />
        
        {/* Cloche Dome Arc */}
        <path
          d="M 28 78 A 72 65 0 0 1 172 78"
          stroke="#F7931E"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 42 74 A 58 52 0 0 1 158 74"
          stroke="#0B5D3B"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Fork */}
        <path
          d="M 74 38 L 74 72 M 70 38 L 70 52 C 70 56 74 58 74 58 M 78 38 L 78 52 C 78 56 74 58 74 58"
          stroke="#F7931E"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Spoon */}
        <path
          d="M 126 50 C 126 40 134 38 134 44 C 134 50 126 54 126 54 L 126 72"
          stroke="#F7931E"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#F7931E"
          fillOpacity="0.15"
        />

        {/* Central Doi Chira Bowl */}
        <path
          d="M 82 54 C 82 72 118 72 118 54 Z"
          fill="#F7931E"
        />
        <ellipse cx="100" cy="54" rx="18" ry="4" fill="#FFFFFF" />
        <circle cx="94" cy="54" r="2.2" fill="#0B5D3B" />
        <circle cx="104" cy="54" r="2.2" fill="#0B5D3B" />

        {/* Leaves */}
        <path
          d="M 34 38 C 24 50 28 68 46 64 C 54 62 58 48 34 38 Z"
          fill="#0B5D3B"
        />
        <path
          d="M 166 42 C 174 54 170 70 152 66 C 146 64 142 50 166 42 Z"
          fill="#0B5D3B"
        />

        {/* Base Cloche Rim Curve */}
        <path
          d="M 20 86 Q 100 78 180 86"
          stroke="#F7931E"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Wordmark */}
        <text
          x="100"
          y="112"
          textAnchor="middle"
          fill="#0B5D3B"
          fontSize="22"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          fontStyle="italic"
          letterSpacing="0.5"
        >
          Benapole Special
        </text>
      </svg>
    </div>
  );
}

export function BkashLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square" fill="none">
        <rect width="100" height="100" rx="20" fill="#E2136E" />
        {/* Origami Bird */}
        <path
          d="M 22 25 L 48 38 L 38 65 L 20 32 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 48 38 L 78 20 L 70 54 L 48 38 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 48 38 L 70 54 L 42 78 L 38 65 Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
        <path
          d="M 70 54 L 88 52 L 80 62 Z"
          fill="#FFFFFF"
        />
      </svg>
      <span className="font-bold text-[#E2136E] text-sm tracking-tight">bKash</span>
    </div>
  );
}

export function NagadLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square" fill="none">
        <circle cx="50" cy="50" r="46" fill="#F7931E" />
        <circle cx="50" cy="50" r="34" fill="#ED1C24" />
        <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
        <path
          d="M 46 36 L 54 36 L 56 46 L 52 58 L 44 54 Z"
          fill="#ED1C24"
        />
      </svg>
      <span className="font-bold text-[#ED1C24] text-sm tracking-tight">নগদ</span>
    </div>
  );
}

export function RocketLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square" fill="none">
        <rect width="100" height="100" rx="20" fill="#8C3494" />
        {/* Rocket Paper Plane */}
        <path
          d="M 22 52 L 78 26 L 54 78 L 46 58 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 46 58 L 62 46 L 46 52 Z"
          fill="#E6C2EB"
        />
      </svg>
      <span className="font-bold text-[#8C3494] text-sm tracking-tight">Rocket</span>
    </div>
  );
}

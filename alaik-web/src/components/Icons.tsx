interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const BackIcon = ({ size = 21, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.2} className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const PlusIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.6} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ShareIcon = ({ size = 17, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M12 15V4M8 8l4-4 4 4" />
    <path d="M6 12v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
  </svg>
);

export const ChevronIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ListsIcon = ({ size = 23, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1.3" />
    <circle cx="3.5" cy="12" r="1.3" />
    <circle cx="3.5" cy="18" r="1.3" />
  </svg>
);

export const ProfileIcon = ({ size = 23, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export const GiftIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.8} className={className}>
    <path d="M20 12v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8" />
    <path d="M2 8.5h20V12H2z" />
    <path d="M12 8.5V21" />
    <path d="M12 8.5C12 6 10.5 4 8.5 4S5.5 5 6 6.5C6.5 8 9 8.5 12 8.5z" />
    <path d="M12 8.5C12 6 13.5 4 15.5 4S18.5 5 18 6.5C17.5 8 15 8.5 12 8.5z" />
  </svg>
);

export const BellIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 01-3.4 0" />
  </svg>
);

export const TrashIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2} className={className}>
    <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a1 1 0 01-1 1H6a1 1 0 01-1-1V6" />
  </svg>
);

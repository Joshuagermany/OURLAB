type AdBannerProps = {
  className?: string;
  label?: string;
  position?: "left" | "right";
};

export default function AdBanner({ className = "", label = "광고", position }: AdBannerProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border border-black/10 bg-white text-black/70 ${className}`}
      aria-label={position ? `${position} ${label}` : label}
    >
      {label}
    </div>
  );
}


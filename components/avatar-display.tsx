const DEFAULT_AVATAR_URL = "https://api.dicebear.com/10.x/bottts-neutral/svg";

export function AvatarDisplay({
  avatar,
  username,
  className = "size-8",
}: {
  avatar?: string;
  username?: string;
  className?: string;
}) {
  const current = avatar || `${DEFAULT_AVATAR_URL}?seed=${encodeURIComponent(username || "neroviax")}`;

  if (
    current.startsWith("http://") ||
    current.startsWith("https://") ||
    current.startsWith("/") ||
    current.startsWith("data:")
  ) {
    const isSvg = current.includes(".svg") || current.includes("dicebear.com");
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={current}
        alt={username || "Avatar"}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        suppressHydrationWarning
        className={`${className} rounded-full ${isSvg ? "object-contain p-0.5" : "object-cover"}`}
      />
    );
  }

  return (
    <span suppressHydrationWarning className="text-xl leading-none select-none">
      {current}
    </span>
  );
}

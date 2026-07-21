/* Iconografia do manual: formas preenchidas, cantos arredondados, sem traços finos */

type IconProps = { size?: number; className?: string };

export function IconDashboard({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" opacity=".55" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" opacity=".55" />
    </svg>
  );
}

export function IconChat({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8.4L4 22a1 1 0 0 1-1.7-.7V5a2 2 0 0 1 2-2Z" transform="translate(-0.3 0)" />
    </svg>
  );
}

export function IconCart({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M2.5 2a1 1 0 0 0 0 2h1.7l2.5 12.1A2 2 0 0 0 8.66 18H18.5a2 2 0 0 0 1.96-1.6l1.5-8A2 2 0 0 0 20 6H6.2l-.5-2.4A2 2 0 0 0 3.74 2H2.5Z" />
      <circle cx="9.5" cy="21" r="1.8" />
      <circle cx="17.5" cy="21" r="1.8" />
    </svg>
  );
}

export function IconUsers({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 20a7 7 0 0 1 14 0v1H2v-1Z" />
      <circle cx="17.5" cy="9" r="3" opacity=".55" />
      <path d="M16 14.5c3.2 0 6 2.3 6 5.5v1h-4v-1c0-2-.8-3.9-2-5.5Z" opacity=".55" />
    </svg>
  );
}

export function IconSettings({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10.4 2.6a2 2 0 0 1 3.2 0l.9 1.2a2 2 0 0 0 2 .8l1.5-.3a2 2 0 0 1 2.3 2.3l-.3 1.5a2 2 0 0 0 .8 2l1.2.9a2 2 0 0 1 0 3.2l-1.2.9a2 2 0 0 0-.8 2l.3 1.5a2 2 0 0 1-2.3 2.3l-1.5-.3a2 2 0 0 0-2 .8l-.9 1.2a2 2 0 0 1-3.2 0l-.9-1.2a2 2 0 0 0-2-.8l-1.5.3a2 2 0 0 1-2.3-2.3l.3-1.5a2 2 0 0 0-.8-2l-1.2-.9a2 2 0 0 1 0-3.2l1.2-.9a2 2 0 0 0 .8-2l-.3-1.5A2 2 0 0 1 6 4.3l1.5.3a2 2 0 0 0 2-.8l.9-1.2ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    </svg>
  );
}

export function IconMore({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
    </svg>
  );
}

export function IconTrend({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 3a1 1 0 0 1 1 1v14a1 1 0 0 0 1 1h15a1 1 0 1 1 0 2H5a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1Z" />
      <rect x="6.5" y="12" width="3" height="5" rx="1" />
      <rect x="11.5" y="9" width="3" height="8" rx="1" opacity=".6" />
      <rect x="16.5" y="5.5" width="3" height="11.5" rx="1" />
    </svg>
  );
}

export function IconAlert({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10.3 3.2a2 2 0 0 1 3.4 0l8.1 14A2 2 0 0 1 20.1 20H3.9a2 2 0 0 1-1.7-3l8.1-14Zm.7 5.8v4a1 1 0 1 0 2 0V9a1 1 0 1 0-2 0Zm1 8.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />
    </svg>
  );
}

export function IconPin({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 4.6 5.4 10.6 6.3 11.5a1 1 0 0 0 1.4 0C13.6 19.6 19 13.6 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function IconLogout({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M5 3h6a2 2 0 0 1 2 2v2h-2V5H5v14h6v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M16.3 7.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l2.3-2.3H9a1 1 0 1 1 0-2h9.6l-2.3-2.3a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

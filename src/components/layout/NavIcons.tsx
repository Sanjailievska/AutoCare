// Small inline icon set (no external icon library dependency).
import type { SVGProps } from 'react'

const base = (props: SVGProps<SVGSVGElement>) => ({ width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props })

export const IconDashboard = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
export const IconCar = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 16l1.5-5A2 2 0 017.4 9.6h9.2A2 2 0 0118.5 11L20 16" /><rect x="2.5" y="16" width="19" height="4" rx="1.5" /><circle cx="7" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" /></svg>
export const IconWrench = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M14.7 6.3a4 4 0 01-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 015.4-5.4l-3-3z" /></svg>
export const IconHistory = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 12a9 9 0 109-9 9 9 0 00-8 4.7" /><path d="M3 4v4h4" /><path d="M12 7v5l3.5 2" /></svg>
export const IconSearch = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
export const IconBell = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 8a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M9.5 18a2.5 2.5 0 005 0" /></svg>
export const IconUser = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0115 0" /></svg>
export const IconClipboard = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" /><path d="M8 10h8M8 14h8M8 18h5" /></svg>
export const IconUsers = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="18" cy="9" r="2.5" /><path d="M15.5 13a5.5 5.5 0 016 6.5" /></svg>
export const IconSettings = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
export const IconStar = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 2.5l3 6.1 6.7 1-4.8 4.7 1.1 6.6-6-3.1-6 3.1 1.1-6.6-4.8-4.7 6.7-1z" /></svg>
export const IconShop = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9" /><path d="M9 20v-6h6v6" /></svg>
export const IconCalendar = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
export const IconLogout = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
export const IconPlus = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
export const IconChevronRight = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
export const IconAlert = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>
export const IconShield = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
export const IconX = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
export const IconCheck = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 12l5 5 11-11" /></svg>
export const IconCamera = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 8h3l2-2h6l2 2h3v11a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" /><circle cx="12" cy="13" r="3.5" /></svg>

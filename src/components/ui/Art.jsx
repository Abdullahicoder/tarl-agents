/**
 * Inline SVG illustration set.
 *
 * Deliberately vector + inline: no image requests, no CDN, works offline,
 * scales crisply on cheap tablets, and stays under a few KB gzipped.
 */

const paths = {
  orange: (
    <g>
      <circle cx="32" cy="34" r="20" fill="#F9A825" />
      <circle cx="26" cy="28" r="6" fill="#FFD54F" opacity="0.7" />
      <path d="M32 14c0-4 4-6 7-5-1 4-3 6-7 5z" fill="#4CAF50" />
      <rect x="31" y="10" width="3" height="6" rx="1.5" fill="#795548" />
    </g>
  ),
  frog: (
    <g>
      <ellipse cx="32" cy="40" rx="20" ry="14" fill="#66BB6A" />
      <circle cx="23" cy="24" r="8" fill="#66BB6A" />
      <circle cx="41" cy="24" r="8" fill="#66BB6A" />
      <circle cx="23" cy="24" r="4" fill="#fff" />
      <circle cx="41" cy="24" r="4" fill="#fff" />
      <circle cx="23" cy="25" r="2" fill="#14202e" />
      <circle cx="41" cy="25" r="2" fill="#14202e" />
      <path d="M24 44q8 6 16 0" stroke="#2E7D32" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  ball: (
    <g>
      <circle cx="32" cy="34" r="19" fill="#42A5F5" />
      <path d="M13 34h38" stroke="#fff" strokeWidth="3" />
      <path d="M32 15q10 19 0 38" stroke="#fff" strokeWidth="3" fill="none" />
      <path d="M32 15q-10 19 0 38" stroke="#fff" strokeWidth="3" fill="none" />
    </g>
  ),
  tree: (
    <g>
      <rect x="29" y="36" width="7" height="20" rx="3" fill="#8D6E63" />
      <circle cx="32" cy="26" r="16" fill="#43A047" />
      <circle cx="21" cy="32" r="10" fill="#2E7D32" />
      <circle cx="43" cy="32" r="10" fill="#66BB6A" />
    </g>
  ),
  chicken: (
    <g>
      <ellipse cx="30" cy="38" rx="17" ry="14" fill="#F5F0E6" />
      <circle cx="43" cy="24" r="9" fill="#F5F0E6" />
      <path d="M43 13q3-6 6 0-3 2-6 0z" fill="#E53935" />
      <path d="M51 24l7 3-7 3z" fill="#FB8C00" />
      <circle cx="46" cy="22" r="2" fill="#14202e" />
      <path d="M26 50v6M34 50v6" stroke="#FB8C00" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="27" cy="38" rx="8" ry="7" fill="#E8E0CE" />
    </g>
  ),
  cup: (
    <g>
      <path d="M16 26h30v14a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill="#fff" stroke="#90A4AE" strokeWidth="2" />
      <path d="M46 30h5a6 6 0 0 1 0 12h-5" fill="none" stroke="#90A4AE" strokeWidth="3" />
      <path d="M18 28h26v8H18z" fill="#A1887F" />
      <path d="M24 18q2-5 5 0M33 16q2-5 5 0" stroke="#B0BEC5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  seed: (
    <g>
      <ellipse cx="32" cy="38" rx="9" ry="12" fill="#A1887F" />
      <ellipse cx="29" cy="34" rx="3" ry="5" fill="#D7CCC8" opacity="0.6" />
    </g>
  ),
  sprout: (
    <g>
      <path d="M32 52V32" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 36q-12-2-12-12 12 0 12 12z" fill="#66BB6A" />
      <path d="M32 32q12-2 12-14-12 2-12 14z" fill="#43A047" />
    </g>
  ),
  star: (
    <path
      d="M32 8l7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 45.8 17.2 53.6 20 37.1 8 25.4 24.6 23z"
      fill="#FFC107"
      stroke="#F9A825"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
}

export default function Art({ name, className = 'w-16 h-16', title }) {
  const art = paths[name]
  if (!art) return null
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {art}
    </svg>
  )
}

/** Friendly geometric learner avatars — no photos, no PII. */
const AVATAR_COLORS = {
  amina: ['#F48FB1', '#AD1457'],
  juma: ['#90CAF9', '#1565C0'],
  neema: ['#A5D6A7', '#2E7D32'],
  baraka: ['#FFCC80', '#EF6C00'],
}

export function Avatar({ id, className = 'w-20 h-20' }) {
  const [bg, fg] = AVATAR_COLORS[id] ?? ['#CFD8DC', '#455A64']
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={bg} />
      <circle cx="32" cy="25" r="11" fill={fg} />
      <path d="M10 60a22 22 0 0 1 44 0z" fill={fg} />
      <circle cx="28" cy="24" r="2" fill="#fff" />
      <circle cx="36" cy="24" r="2" fill="#fff" />
      <path d="M27 30q5 4 10 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

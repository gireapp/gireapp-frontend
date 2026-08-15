const isDev = process.env.NODE_ENV === 'development';

// connect-src must allow the backend API origin (frontend and backend are
// separate origins in dev, and may be in production too).
const originOf = (value) => {
  try {
    return new URL(value ?? '').origin;
  } catch {
    return '';
  }
};

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_URL);

// Lesson PDFs render in an <iframe>. Same-origin files fall under default-src,
// but once media moves to object storage the frame is cross-origin and CSP
// blocks it unless that host is named here.
const mediaOrigin = originOf(process.env.NEXT_PUBLIC_MEDIA_URL);

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js injects inline bootstrap scripts; dev mode additionally needs eval for HMR.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}${isDev ? ' ws:' : ''}`,
  `frame-src 'self'${mediaOrigin ? ` ${mediaOrigin}` : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .join('; ')
  .concat(isDev ? '' : '; upgrade-insecure-requests');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gireapp/shared'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

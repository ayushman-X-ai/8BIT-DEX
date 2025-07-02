import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffc41a" d="M2 8h4v2H2z M3 11h4v2H3z"/><path fill="#fafafa" d="M12 6h8v1h-8z M10 7h2v1h-2z M20 7h1v1h-1z M9 8h1v1H9z M21 8h1v6h-1z M9 15h1v1H9z M20 15h1v1h-1z M10 16h2v1h-2z M12 17h8v1h-8z"/><path fill="#f22e2e" d="M12 7h8v1h-8z M10 8h11v1H10z M10 9h11v2H10z"/><path fill="#121212" d="M10 13h11v2H10z M10 15h10v1H10z M12 16h8v1h-8z"/><path fill="#fafafa" d="M9 11h13v2H9z"/><path fill="#121212" d="M14 11h3v2h-3z"/><path fill="#fafafa" d="M15 11.5h1v1h-1z"/></svg>`;
const logoDataUri = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

export const metadata: Metadata = {
  title: '8BitDex',
  description: 'A modern, pixel-art 8BitDex to browse and learn about Pokémon.',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '8BitDex',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcf7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  icons: {
    icon: logoDataUri,
    shortcut: logoDataUri,
    apple: logoDataUri,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

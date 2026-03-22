import { IBM_Plex_Mono, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';
import '../styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Wardrobe X - AI Fashion Try-On',
  description: 'Experience premium fashion with AI-powered virtual try-on and immersive shopping.',
  keywords: 'fashion, AI, virtual try-on, clothing, wardrobe',
  openGraph: {
    title: 'Wardrobe X - AI Fashion Try-On',
    description: 'Try on outfits virtually with AI before you buy.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} ${plexMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <StoreProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3200,
                  style: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                  },
                  success: { iconTheme: { primary: 'var(--gold-dark)', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
            </StoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


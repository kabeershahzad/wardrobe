import { JetBrains_Mono, Orbitron, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';
import Chatbot from '../components/ui/Chatbot';
import '../styles/globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
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
      className={`${orbitron.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div className="noise-overlay" />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <StoreProvider>
              {children}
              <Chatbot />
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



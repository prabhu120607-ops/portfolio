import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingAssistant from '@/components/ai/FloatingAssistant';

export const metadata: Metadata = {
  title: 'NOVA — Contemporary Luxury Fashion & Essentials',
  description: 'Explore contemporary luxury silhouettes crafted from cashmere, silk, and raw denim. Experience AI-powered personal shopping recommendations.',
  openGraph: {
    title: 'NOVA — Luxury Fashion & Essentials',
    description: 'Explore contemporary luxury silhouettes crafted from cashmere, silk, and raw denim.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* FontAwesome for payment provider brand icons in Footer */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#1C1A17] antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
              <FloatingAssistant />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#FAF9F6] border-t border-[#2C2A29] pt-20 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-[#2C2A29]">
          {/* Brand Info */}
          <div>
            <span className="font-serif text-2xl tracking-widest font-semibold block mb-6">NOVA</span>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
              Contemporary fashion designed for modern silhouettes. We construct garments from premium materials with focus on precision and craftsmanship.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <span className="text-xs tracking-wider font-semibold">INSTAGRAM</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Pinterest">
                <span className="text-xs tracking-wider font-semibold">PINTEREST</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <span className="text-xs tracking-wider font-semibold">FACEBOOK</span>
              </a>
            </div>
          </div>

          {/* Shop Directories */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-300 mb-6">Shop Collections</h4>
            <ul className="space-y-3 text-sm font-light text-gray-400">
              <li><Link href="/shop?category=women" className="hover:text-white transition-colors">Women's Collection</Link></li>
              <li><Link href="/shop?category=men" className="hover:text-white transition-colors">Men's Collection</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-white transition-colors">Accessories & Shoes</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?category=all&sort=best-selling" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/shop?category=all&sort=price-low-high" className="hover:text-white transition-colors">Sale Archives</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-300 mb-6">Customer Care</h4>
            <ul className="space-y-3 text-sm font-light text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Customs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide & Styling</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Store Locator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Editorial Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-gray-300 mb-6">Join the World of Style</h4>
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
              Subscribe to enjoy early access to new seasonal collections, private sales, and brand updates.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-[#2C2A29] text-[#FAF9F6] border border-[#3E3C3A] px-4 py-3 text-xs tracking-wider focus:outline-none focus:border-white transition-colors placeholder-gray-500 font-light"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FAF9F6] text-[#1A1A1A] hover:bg-gray-200 py-3 text-xs tracking-widest font-semibold uppercase transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-gray-500 font-light space-x-6">
            <span>&copy; {new Date().getFullYear()} NOVA. All rights reserved.</span>
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
          
          {/* Payment Method Badges */}
          <div className="flex items-center gap-3 text-gray-500 opacity-60 text-lg">
            <span className="text-xs font-semibold uppercase tracking-wider mr-2">Secure Payments:</span>
            <i className="fa-brands fa-cc-visa" title="Visa"></i>
            <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
            <i className="fa-brands fa-cc-amex" title="American Express"></i>
            <i className="fa-solid fa-credit-card" title="RuPay / UPI"></i>
            <i className="fa-solid fa-shield-halved" title="Secure Payment Architecture" className="text-sm"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}

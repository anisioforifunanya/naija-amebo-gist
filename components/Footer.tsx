'use client';

import Link from 'next/link'
import AlternatingLogo from './AlternatingLogo'

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">About Us</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Your ultimate source for celebrity news, gossip, and viral stories from Nigeria and beyond.
            </p>
          </div>
          <div className="mb-4 xs:mb-0">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/privacy-policy" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">Privacy Policy</Link></li>
              <li><Link href="/faq" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">FAQ</Link></li>
              <li><Link href="/terms" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">Terms & Copyright</Link></li>
              <li><Link href="/about" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div className="mb-4 xs:mb-0">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-3 text-xs sm:text-sm">Subscribe for breaking news.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-gray-900 rounded-md text-xs sm:text-sm"
              />
              <button 
                onClick={() => {
                  const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                  const email = emailInput?.value;
                  if (email && email.includes('@')) {
                    alert('Thank you for subscribing!');
                    if (emailInput) emailInput.value = '';
                  } else {
                    alert('Please enter a valid email');
                  }
                }}
                className="w-full bg-blue-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-blue-600 font-medium text-xs sm:text-sm min-h-[40px]"
              >
                Subscribe
              </button>
            </div>
          </div>
          <div className="md:col-span-1 sm:col-span-2 xs:col-span-1">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4">Help</h3>
            <div className="flex flex-col space-y-1.5 sm:space-y-2">
              <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">Support</a>
              <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">Bug Report</a>
              <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-white transition hover:underline">Advertise</a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 border-t border-gray-700 pt-6 sm:pt-8">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Download Our App</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm">Get the latest news on the go!</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <a
                href="#"
                className="flex items-center gap-1.5 sm:gap-2 bg-black hover:bg-gray-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 text-xs sm:text-sm min-h-[44px] justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5Z" />
                </svg>
                <span className="hidden xs:inline">Play Store</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-1.5 sm:gap-2 bg-black hover:bg-gray-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 text-xs sm:text-sm min-h-[44px] justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="hidden xs:inline">App Store</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 sm:pt-8 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <AlternatingLogo className="h-6 sm:h-8 w-auto" />
          </div>
          <p className="text-gray-300 text-xs sm:text-sm">&copy; 2026 Naija Amebo Gist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

import { Mail } from 'lucide-react';
import { memo } from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t-2 border-[#3A3A3A] bg-[#1A1A1B]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-[#CC0000]">About Night Market</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              A safe and verified platform for IIT students to buy, sell, and trade food on campus
              during late-night hours.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 text-lg font-bold text-[#CC0000]">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#CC0000]" />
                marketsupport@iillinoistech.edu
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#3A3A3A] pt-6 md:flex-row">
          <p className="text-xs text-gray-500">
            © 2025 Night Market. All rights reserved. | For verified IIT students only.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Memoize Footer since it has no props and never needs to re-render
export default memo(Footer);

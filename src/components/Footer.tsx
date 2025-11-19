import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t-2 border-[#E5E5E5] bg-[#FAFAFA] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-[#CC0000]">
              About Night Market
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A safe and verified platform for IIT students to buy, sell, and trade food 
              on campus during late-night hours.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-[#CC0000]">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#CC0000]" />
                marketsupport@iillinoistech.edu
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © 2025 Night Market. All rights reserved. | For verified IIT students only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
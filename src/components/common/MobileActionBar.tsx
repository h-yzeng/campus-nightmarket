import { Home, ShoppingCart, ListOrdered, User } from 'lucide-react';

type Action = 'browse' | 'cart' | 'orders' | 'profile';

interface MobileActionBarProps {
  active: Action;
  onBrowse: () => void;
  onCart: () => void;
  onOrders: () => void;
  onProfile: () => void;
}

const navItems: Array<{ key: Action; label: string; icon: typeof Home }> = [
  { key: 'browse', label: 'Browse', icon: Home },
  { key: 'cart', label: 'Cart', icon: ShoppingCart },
  { key: 'orders', label: 'Orders', icon: ListOrdered },
  { key: 'profile', label: 'Profile', icon: User },
];

const MobileActionBar = ({
  active,
  onBrowse,
  onCart,
  onOrders,
  onProfile,
}: MobileActionBarProps) => {
  const callbacks: Record<Action, () => void> = {
    browse: onBrowse,
    cart: onCart,
    orders: onOrders,
    profile: onProfile,
  };

  return (
    <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#252525] bg-[#0C0C0D]/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={callbacks[key]}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors active:translate-y-px active:scale-95 ${
                isActive ? 'text-white' : 'text-[#A0A0A0] hover:bg-[#161616] hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  isActive ? 'border-[#CC0000] bg-[#1C1C1C]' : 'border-[#2A2A2A] bg-[#121212]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#FF5555]' : 'text-[#C0C0C0]'} />
              </div>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileActionBar;

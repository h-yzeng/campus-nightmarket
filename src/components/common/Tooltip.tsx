import { ReactNode, useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  showIcon?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip = ({ content, children, showIcon = true, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#2A2A2A]',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[#2A2A2A]',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[#2A2A2A]',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[#2A2A2A]',
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex cursor-help"
      >
        {children || (showIcon && <HelpCircle size={16} className="text-[#888888]" />)}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 whitespace-nowrap rounded-lg bg-[#2A2A2A] px-3 py-2 text-sm text-white shadow-lg ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute h-0 w-0 border-4 border-solid ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

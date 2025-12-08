import { toast as sonnerToast } from 'sonner';

let liveRegion: HTMLDivElement | null = null;

const ensureLiveRegion = () => {
  if (typeof window === 'undefined') return null;
  if (liveRegion) return liveRegion;

  liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'assertive');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.position = 'fixed';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.margin = '-1px';
  liveRegion.style.border = '0';
  liveRegion.style.padding = '0';
  liveRegion.style.overflow = 'hidden';
  liveRegion.style.clip = 'rect(0 0 0 0)';
  liveRegion.style.whiteSpace = 'nowrap';

  document.body.appendChild(liveRegion);
  return liveRegion;
};

const announce = (message: string) => {
  const region = ensureLiveRegion();
  if (region) {
    region.textContent = message;
  }
};

export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    announce(message);
    sonnerToast.success(message, options);
  },
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    announce(message);
    sonnerToast.error(message, options);
  },
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    announce(message);
    sonnerToast.info(message, options);
  },
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    announce(message);
    sonnerToast.warning(message, options);
  },
  loading: (message: string, options?: Parameters<typeof sonnerToast.loading>[1]) => {
    announce(message);
    sonnerToast.loading(message, options);
  },
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
};

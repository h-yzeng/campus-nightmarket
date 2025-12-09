/**
 * Skip Navigation Link
 *
 * Provides keyboard users ability to skip repetitive navigation and jump directly to main content.
 * Only visible when focused (Tab key), hidden otherwise.
 *
 * Accessibility: WCAG 2.1 Level A requirement
 */
export function SkipNavigation() {
  const handleSkipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        handleSkipToMain();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSkipToMain();
        }
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#E23E57] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0A0A0A] focus:outline-none"
    >
      Skip to main content
    </a>
  );
}

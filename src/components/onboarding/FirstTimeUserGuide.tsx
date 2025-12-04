import { useState } from 'react';
import { X, ShoppingCart, Store, Package } from 'lucide-react';

interface FirstTimeUserGuideProps {
  onClose: () => void;
}

const FirstTimeUserGuide = ({ onClose }: FirstTimeUserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Night Market! 🌙',
      description: 'Your campus late-night food exchange platform',
      content:
        "Night Market connects IIT students who want to buy food with students who want to sell homemade meals. Whether you're hungry late at night or want to earn some extra cash, we've got you covered!",
      icon: '🌙',
    },
    {
      title: 'Browse & Order Food 🛒',
      description: 'Shop from verified IIT students',
      content:
        'In Buyer Mode, you can browse available food items, search by category or location, add items to your cart, and place orders. All sellers are verified IIT students, so you know your food is coming from a trusted source!',
      icon: <ShoppingCart size={48} className="text-[#CC0000]" />,
    },
    {
      title: 'Sell Your Homemade Food 🍕',
      description: 'Turn your cooking skills into cash',
      content:
        'Switch to Seller Mode to create food listings, manage your menu, and receive orders. Set your own prices, specify pickup locations, and connect with hungry students on campus!',
      icon: <Store size={48} className="text-[#CC0000]" />,
    },
    {
      title: 'Switch Modes Anytime 🔄',
      description: 'Be a buyer and seller',
      content:
        "Use the toggle in the header to switch between Buyer and Seller modes. You can shop for food when you're hungry and sell your homemade meals when you have time to cook!",
      icon: '🔄',
    },
    {
      title: 'Track Your Orders 📦',
      description: 'Stay updated on your activity',
      content:
        'View your order history as a buyer and manage incoming orders as a seller. Get notified when orders are placed, confirmed, or ready for pickup.',
      icon: <Package size={48} className="text-[#CC0000]" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#2A2A2A] hover:text-white"
          type="button"
          aria-label="Close guide"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            {typeof step.icon === 'string' ? (
              <div className="text-6xl">{step.icon}</div>
            ) : (
              step.icon
            )}
          </div>
          <h2 className="mb-2 text-3xl font-bold text-[#E0E0E0]">{step.title}</h2>
          <p className="mb-4 text-lg font-semibold text-[#CC0000]">{step.description}</p>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-[#B0B0B0]">
            {step.content}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? 'w-8 bg-[#CC0000]' : 'w-2 bg-[#3A3A3A] hover:bg-[#4A4A4A]'
              }`}
              type="button"
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleSkip}
            className="rounded-lg px-6 py-2.5 font-semibold text-[#888888] transition-colors hover:text-white"
            type="button"
          >
            Skip Tutorial
          </button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="rounded-lg border-2 border-[#3A3A3A] bg-[#252525] px-6 py-2.5 font-semibold text-[#E0E0E0] transition-colors hover:bg-[#2A2A2A]"
                type="button"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-lg bg-[#CC0000] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#B00000]"
              type="button"
            >
              {currentStep === steps.length - 1 ? "Let's Get Started!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeUserGuide;

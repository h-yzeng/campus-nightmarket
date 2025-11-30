import { Wallet } from 'lucide-react';

type PaymentMethod = 'Cash' | 'CashApp' | 'Venmo' | 'Zelle';

interface PaymentMethodSelectorProps {
  selectedPayment: PaymentMethod;
  onPaymentChange: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({
  selectedPayment,
  onPaymentChange,
}: PaymentMethodSelectorProps) => {
  const paymentMethods: PaymentMethod[] = ['Cash', 'CashApp', 'Venmo', 'Zelle'];

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'Cash':
        return '💵';
      case 'CashApp':
        return '💸';
      case 'Venmo':
        return '💳';
      case 'Zelle':
        return '🏦';
    }
  };

  const getPaymentMessage = (method: PaymentMethod) => {
    if (method === 'Cash') {
      return '💵 Pay each seller in person when you pick up your orders';
    }
    return `💳 After placing your order, each seller will share their ${method} details for payment`;
  };

  return (
    <div className="rounded-2xl border-2 border-neutral-700 bg-neutral-800 p-6 shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#E0E0E0]">
        <Wallet size={20} />
        Payment Method
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onPaymentChange(method)}
            className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${
              selectedPayment === method
                ? 'border-[#CC0000] bg-[#CC0000] text-white'
                : 'border-[#4A4A4A] bg-[#2A2A2A] text-[#E0E0E0] hover:border-[#CC0000]'
            }`}
            aria-label={`Pay with ${method}`}
            aria-pressed={selectedPayment === method}
          >
            {getPaymentIcon(method)} {method}
          </button>
        ))}
      </div>

      <div className="rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
        <p className="text-sm text-[#88CCFF]">{getPaymentMessage(selectedPayment)}</p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

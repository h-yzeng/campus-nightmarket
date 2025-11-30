import { Clock, CheckCircle, Package, XCircle } from 'lucide-react';
import type { Order } from '../../types';

interface OrderTimelineProps {
  status: Order['status'];
}

type TimelineStep = {
  id: Order['status'];
  label: string;
  icon: React.ReactNode;
  description: string;
};

const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const steps: TimelineStep[] = [
    {
      id: 'pending',
      label: 'Order Placed',
      icon: <Clock size={20} />,
      description: 'Waiting for seller confirmation',
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      icon: <CheckCircle size={20} />,
      description: 'Seller is preparing your order',
    },
    {
      id: 'ready',
      label: 'Ready for Pickup',
      icon: <Package size={20} />,
      description: 'Your order is ready to be picked up',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle size={20} />,
      description: 'Order picked up and completed',
    },
  ];

  // Handle cancelled status separately
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4A1A1A]">
            <XCircle size={24} className="text-[#FF8888]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#FF8888]">Order Cancelled</h3>
            <p className="text-sm text-[#B0B0B0]">This order was cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  const getStepStatus = (stepId: Order['status']): 'completed' | 'current' | 'upcoming' => {
    const statusOrder: Order['status'][] = ['pending', 'confirmed', 'ready', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
      <h3 className="mb-6 text-xl font-bold text-white">Order Progress</h3>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-4">
                {/* Timeline Icon */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      stepStatus === 'completed'
                        ? 'border-[#0A6A0A] bg-[#0A6A0A] text-[#88FF88]'
                        : stepStatus === 'current'
                          ? 'border-[#CC0000] bg-[#2A0A0A] text-[#FF8888]'
                          : 'border-[#3A3A3A] bg-[#252525] text-[#888888]'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`mt-2 h-12 w-0.5 ${
                        stepStatus === 'completed' ? 'bg-[#0A6A0A]' : 'bg-[#3A3A3A]'
                      }`}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-4">
                  <h4
                    className={`mb-1 font-bold ${
                      stepStatus === 'completed'
                        ? 'text-[#88FF88]'
                        : stepStatus === 'current'
                          ? 'text-[#FF8888]'
                          : 'text-[#888888]'
                    }`}
                  >
                    {step.label}
                    {stepStatus === 'current' && (
                      <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#CC0000]" />
                    )}
                  </h4>
                  <p
                    className={`text-sm ${
                      stepStatus === 'current' ? 'text-[#B0B0B0]' : 'text-[#888888]'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Current Status Additional Info */}
                  {stepStatus === 'current' && (
                    <div className="mt-3 rounded-lg border border-[#4A2A1A] bg-[#2A1A0A] p-3">
                      <p className="text-xs text-[#FFD699]">
                        {step.id === 'pending' && (
                          <>⏳ Please wait while the seller reviews your order</>
                        )}
                        {step.id === 'confirmed' && (
                          <>🍳 Your order is being prepared. Check back for updates!</>
                        )}
                        {step.id === 'ready' && (
                          <>📍 Your order is ready! Head to the pickup location</>
                        )}
                        {step.id === 'completed' && <>✅ Enjoy your meal!</>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Time for Current Status */}
      {status !== 'completed' && (
        <div className="mt-6 rounded-xl border border-[#3A3A3A] bg-[#2A2A2A] p-4">
          <p className="text-xs font-semibold text-[#888888]">ESTIMATED TIME</p>
          <p className="mt-1 text-sm text-[#E0E0E0]">
            {status === 'pending' && 'Usually within 5-10 minutes'}
            {status === 'confirmed' && 'Usually 15-30 minutes'}
            {status === 'ready' && 'Ready for pickup now!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LOCATIONS } from '../../constants/locations';
import {
  getAllListings,
  getTopListingByPurchaseCount,
} from '../../services/listings/listingService';
import PageHead from '../../components/common/PageHead';

interface HomeProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onBrowseFood?: () => void;
}

const Home = ({ onGetStarted, onLogin, onBrowseFood }: HomeProps) => {
  const handleBrowse = () => {
    if (onBrowseFood) onBrowseFood();
    else onGetStarted();
  };

  const { data: stats } = useQuery({
    queryKey: ['home', 'hero-stats'],
    queryFn: async () => {
      const [activeListings, topListing] = await Promise.all([
        getAllListings(true),
        getTopListingByPurchaseCount(),
      ]);

      return {
        activeCount: activeListings.length,
        bestSeller: topListing?.name || 'Ramen',
      };
    },
    staleTime: 60_000,
  });

  const dormSpots = useMemo(() => LOCATIONS.slice(0, 4).join(', '), []);

  return (
    <>
      <PageHead
        title="Home"
        description="The official student food marketplace for Illinois Institute of Technology. Buy and sell homemade food on campus."
      />
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-[#060608] via-[#0B0B0F] to-[#0A0A0B]">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute top-10 -left-32 h-64 w-64 rounded-full bg-[#CC0000]/20 blur-3xl" />
          <div className="absolute top-40 right-0 h-72 w-72 rounded-full bg-[#5E5CE6]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#12B886]/10 blur-3xl" />
        </div>

        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="relative z-10 mx-auto w-full max-w-6xl">
            <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="text-left lg:pr-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#121214] px-4 py-2 text-sm font-semibold text-[#E0E0E0] shadow-lg shadow-black/40">
                  <span className="text-lg">🌙</span>
                  Late-night cravings, solved.
                </div>

                <h1 className="mb-4 text-5xl leading-tight font-black text-white sm:text-6xl lg:text-7xl">
                  Night Market
                </h1>
                <p className="mb-4 text-xl font-semibold text-[#E0E0E0]">
                  Campus Late-Night Food Exchange
                </p>
                <p className="mb-8 max-w-2xl text-lg text-[#B8B8B8]">
                  Buy, sell, and trade food with verified IIT students. Stay fueled through exams
                  with quick pickups across campus.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={onGetStarted}
                    className="group hover:translate-y-1px inline-flex items-center gap-2 rounded-full bg-[#CC0000] px-6 py-3 text-lg font-bold text-white shadow-[0_20px_60px_-15px_rgba(204,0,0,0.6)] transition-transform duration-150 focus-visible:outline focus-visible:outline-[#CC0000]"
                    type="button"
                  >
                    Get Started
                    <span className="transition-transform duration-150 group-hover:translate-x-1">
                      →
                    </span>
                  </button>

                  <button
                    onClick={handleBrowse}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3A3A3A] bg-[#141416] px-6 py-3 text-lg font-semibold text-white transition-colors duration-150 hover:border-[#CC0000] hover:text-[#CC0000] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#3A3A3A]"
                    type="button"
                  >
                    Browse Tonight&apos;s Menu
                  </button>

                  <button
                    onClick={onLogin}
                    className="text-sm font-semibold text-[#B8B8B8] underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#3A3A3A]"
                    type="button"
                  >
                    Already a member? Sign in
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#B8B8B8]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#2C2C2E] bg-[#121214] px-4 py-2">
                    🔒 Verified IIT students only
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#2C2C2E] bg-[#121214] px-4 py-2">
                    ⚡ 15 min avg pickup
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#2C2C2E] bg-[#121214] px-4 py-2">
                    🤝 Peer-to-peer trusted trades
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#CC0000]/15 via-[#5E5CE6]/10 to-transparent blur-2xl" />
                <div className="relative space-y-4 rounded-3xl border border-[#36363A] bg-[#16161A]/85 p-6 shadow-2xl shadow-black/40 backdrop-blur">
                  <div className="flex items-center justify-between rounded-2xl border border-[#2C2C2E] bg-[#1A1A1D] px-4 py-3">
                    <div>
                      <p className="text-sm text-[#D0D0D5]">Active listings</p>
                      <p className="text-3xl font-bold text-white">
                        {typeof stats?.activeCount === 'number' ? stats.activeCount : '—'}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#12B886]/15 px-3 py-1 text-xs font-semibold text-[#12B886]">
                      Updates in real time
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Best seller', value: stats?.bestSeller || 'Ramen' },
                      { label: 'Dorm spots', value: dormSpots },
                      { label: 'Payment', value: 'Cash, Cash App, Venmo, Zelle' },
                      { label: 'Peak time', value: '9:30 PM – 1 AM' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[#3A3A3F] bg-[#1B1B20] p-3 text-left"
                      >
                        <p className="text-xs tracking-wide text-[#9A9AA2] uppercase">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[#3A3A3F] bg-linear-to-r from-[#202028] to-[#1A1A1F] p-4 text-left">
                    <p className="text-sm font-semibold text-white">Skip the wait</p>
                    <p className="mt-1 text-sm text-[#C4C4CA]">
                      Reserve a pickup window and message the seller instantly after checkout.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-16 grid gap-6 rounded-3xl border border-[#282832] bg-[#101018]/70 p-6 shadow-inner shadow-black/40 md:grid-cols-3">
              {[
                {
                  icon: '🔒',
                  title: 'Verified students',
                  desc: 'ID-verified buyers & sellers keep trades safe.',
                },
                {
                  icon: '⚡',
                  title: 'Fast pickup',
                  desc: 'On-campus handoffs with average pickup under 15 minutes.',
                },
                {
                  icon: '🤝',
                  title: 'Trusted community',
                  desc: 'Ratings and reviews help you find reliable partners.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#32323A] bg-[#161620] p-5 shadow-lg shadow-black/30"
                >
                  <div className="mb-3 text-3xl">{card.icon}</div>
                  <h3 className="mb-2 text-lg font-bold text-white">{card.title}</h3>
                  <p className="text-sm text-[#A8A8A8]">{card.desc}</p>
                </div>
              ))}
            </section>

            <section className="mt-12 rounded-3xl border border-[#2A2A34] bg-[#12121C]/75 p-6">
              <h2 className="mb-4 text-2xl font-bold text-white">How it works</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Browse & filter',
                    desc: 'See what’s hot tonight by dorm, cuisine, or pickup time.',
                  },
                  {
                    step: '2',
                    title: 'Reserve & message',
                    desc: 'Pick a time slot and chat with the seller instantly.',
                  },
                  {
                    step: '3',
                    title: 'Grab & rate',
                    desc: 'Meet on campus, enjoy, and rate the experience for others.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="relative overflow-hidden rounded-2xl border border-[#32323C] bg-[#181822] p-5"
                  >
                    <div className="absolute top-3 right-4 text-5xl font-black text-[#3A3A45]">
                      {item.step}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-[#A8A8A8]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Home;

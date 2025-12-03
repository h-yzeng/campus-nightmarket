interface HomeProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onBrowseFood?: () => void;
}

const Home = ({ onGetStarted, onLogin, onBrowseFood }: HomeProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <main className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="animate-bounce-slow mb-8 text-9xl">🌙</div>
          <h1 className="mb-4 text-7xl font-bold tracking-tight text-[#CC0000]">Night Market</h1>
          <p className="mb-3 text-2xl font-semibold text-white">Campus Late-Night Food Exchange</p>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-400">
            Buy, sell, and trade food with verified IIT students. Never go hungry during those
            late-night study sessions again.
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onGetStarted}
              className="hover:shadow-3xl transform rounded-2xl bg-[#CC0000] px-12 py-5 text-xl font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              type="button"
            >
              Create Account →
            </button>

            {onBrowseFood && (
              <button
                onClick={onBrowseFood}
                className="transform rounded-2xl border-2 border-[#CC0000] px-12 py-5 text-xl font-bold text-[#CC0000] shadow-2xl transition-all hover:scale-105 hover:bg-[#CC0000] hover:text-white active:scale-95"
                type="button"
              >
                Browse Available Food 🍕
              </button>
            )}

            <p className="text-base text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onLogin}
                className="font-bold text-[#CC0000] hover:underline"
                type="button"
              >
                Sign In
              </button>
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
              <div className="mb-3 text-4xl">🔒</div>
              <h3 className="mb-2 text-lg font-bold text-white">Verified Students</h3>
              <p className="text-sm text-gray-400">
                Student ID verification required for all users
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
              <div className="mb-3 text-4xl">⚡</div>
              <h3 className="mb-2 text-lg font-bold text-white">Fast & Easy</h3>
              <p className="text-sm text-gray-400">Quick pickup and delivery on campus</p>
            </div>

            <div className="rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-md">
              <div className="mb-3 text-4xl">🤝</div>
              <h3 className="mb-2 text-lg font-bold text-white">Community Trust</h3>
              <p className="text-sm text-gray-400">Built by students, for students</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

interface HomeProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const Home = ({ onGetStarted, onLogin }: HomeProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6 py-16 max-w-4xl mx-auto">
          <div className="text-9xl mb-8 animate-bounce-slow">🌙</div>
          <h1 className="text-7xl font-bold mb-4 text-[#CC0000] tracking-tight">
            Night Market
          </h1>
          <p className="text-2xl font-semibold text-white mb-3">
            Campus Late-Night Food Exchange
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Buy, sell, and trade food with verified IIT students.
            Never go hungry during those late-night study sessions again.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-12 py-5 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 bg-[#CC0000]"
            >
              Create Account →
            </button>
            
            <p className="text-base text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onLogin}
                className="text-[#CC0000] font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#1E1E1E] rounded-xl shadow-md border-2 border-[#3A3A3A]">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-white">Verified Students</h3>
              <p className="text-sm text-gray-400">
                Student ID verification required for all users
              </p>
            </div>

            <div className="p-6 bg-[#1E1E1E] rounded-xl shadow-md border-2 border-[#3A3A3A]">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2 text-white">Fast & Easy</h3>
              <p className="text-sm text-gray-400">
                Quick pickup and delivery on campus
              </p>
            </div>

            <div className="p-6 bg-[#1E1E1E] rounded-xl shadow-md border-2 border-[#3A3A3A]">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-bold text-lg mb-2 text-white">Community Trust</h3>
              <p className="text-sm text-gray-400">
                Built by students, for students
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
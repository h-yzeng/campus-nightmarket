import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import PageHead from '../components/common/PageHead';

const NotFound = () => {
  return (
    <>
      <PageHead
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist."
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-6 text-center">
        <div className="mb-8 text-9xl font-bold text-[#CC0000]">404</div>
        <h1 className="mb-4 text-3xl font-bold text-white">Page Not Found</h1>
        <p className="mb-8 max-w-md text-lg text-[#A0A0A0]">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CC0000] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#B00000]"
          >
            <Home size={20} />
            Go Home
          </Link>
          <Link
            to="/browse"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#3A3A3A] bg-[#1A1A1B] px-6 py-3 font-semibold text-white transition-colors hover:border-[#CC0000] hover:bg-[#252525]"
          >
            <Search size={20} />
            Browse Food
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#3A3A3A] bg-[#1A1A1B] px-6 py-3 font-semibold text-white transition-colors hover:border-[#CC0000] hover:bg-[#252525]"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;

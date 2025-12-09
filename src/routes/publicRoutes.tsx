import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { PageLoadingFallback, makeLogoToBrowse } from './shared';
import { useNavigate } from 'react-router-dom';
import { useListingsQuery } from '../hooks/queries/useListingsQuery';
import { useSellerRatingsQuery } from '../hooks/queries/useReviewsQuery';

const Home = lazy(() => import('../pages/shared/Home'));
const FoodPreview = lazy(() => import('../pages/shared/FoodPreview'));

// eslint-disable-next-line react-refresh/only-export-components
const HomeWrapper = () => {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Home
        onGetStarted={() => navigate('/signup')}
        onLogin={() => navigate('/login')}
        onBrowseFood={() => navigate('/preview')}
      />
    </Suspense>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
const FoodPreviewWrapper = () => {
  const navigate = useNavigate();
  const logoToBrowse = makeLogoToBrowse(navigate);

  const {
    data: foodItems = [],
    isLoading: listingsLoading,
    error: listingsError,
  } = useListingsQuery();

  const sellerIds = [...new Set(foodItems.map((item) => item.sellerId))];
  const { data: sellerRatings = {} } = useSellerRatingsQuery(sellerIds);

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <FoodPreview
        foodItems={foodItems}
        sellerRatings={sellerRatings}
        loading={listingsLoading}
        error={listingsError?.message || null}
        onSignUp={() => navigate('/signup')}
        onLogin={() => navigate('/login')}
        onBack={logoToBrowse}
      />
    </Suspense>
  );
};

export const renderPublicRoutes = () => (
  <>
    <Route path="/" element={<HomeWrapper />} />
    <Route path="/preview" element={<FoodPreviewWrapper />} />
  </>
);

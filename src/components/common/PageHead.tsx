import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title: string;
  description?: string;
}

/**
 * Component for setting page-specific metadata (title, description, etc.)
 * Uses react-helmet-async for dynamic head management.
 */
export default function PageHead({ title, description }: PageHeadProps) {
  const fullTitle = `${title} | Campus Night Market`;
  const defaultDescription =
    'Buy and sell homemade food on campus. Connect with student sellers at IIT.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
    </Helmet>
  );
}

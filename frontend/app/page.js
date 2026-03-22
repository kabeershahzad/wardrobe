import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import HeroSection from '../components/sections/HeroSection';
import { HowItWorksSection, FeaturesSection } from '../components/sections/HowItWorks';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import NewsletterSection from '../components/sections/NewsletterSection';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <HowItWorksSection />
      <FeaturesSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}

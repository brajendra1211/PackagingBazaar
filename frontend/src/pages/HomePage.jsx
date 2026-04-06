import HeroSection        from "../components/sections/HeroSection";
import FeaturedProducts   from "../components/sections/FeaturedProducts";
import TopSelling         from "../components/sections/TopSelling";
import WhyChooseUs        from "../components/sections/WhyChooseUs";
import ReviewSection      from "../components/sections/ReviewSection";
export default function HomePage() {
  return (
    <>
      <HeroSection/>
      <FeaturedProducts/>
      <TopSelling/>
      <WhyChooseUs/>
      <ReviewSection/>
    </>
  );
}

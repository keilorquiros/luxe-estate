import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturedPropertyCard from "../components/ui/FeaturedPropertyCard";
import PropertyCard from "../components/ui/PropertyCard";
import { featuredProperties, newMarketProperties } from "../data/mockProperties";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSection />
        
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">Featured Collections</h2>
              <p className="text-nordic-muted mt-1 text-sm">Curated properties for the discerning eye.</p>
            </div>
            <a className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity" href="#">
              View all <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProperties.map((property) => (
              <FeaturedPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
              <p className="text-nordic-muted mt-1 text-sm">Fresh opportunities added this week.</p>
            </div>
            <div className="hidden md:flex bg-white p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">All</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark:text-white">Buy</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark:text-white">Rent</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newMarketProperties.map((property, index) => {
              let extraClass = "";
              if (index === 4) extraClass = "hidden xl:flex";
              if (index === 5) extraClass = "hidden lg:flex";
              
              return (
                <PropertyCard key={property.id} property={property} className={extraClass} />
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark font-medium rounded-lg transition-all hover:shadow-md">
              Load more properties
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

import SearchArea from "./SearchArea";
import { Locale } from "../../lib/i18n";

interface HeroSectionProps {
  lang: Locale;
  dict: any;
}

export default function HeroSection({ lang, dict }: HeroSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
          {dict.hero.title_start} <span className="relative inline-block">
            <span className="relative z-10 font-medium">{dict.hero.title_highlight}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>.
        </h1>
        
        <SearchArea lang={lang} dict={dict} />
      </div>
    </section>
  );
}

export default function TrustedBy() {
  const brands = ['Acme Corp', 'GlobalNet', 'TechFlow', 'Zenith', 'Nexus', 'Pioneer'];

  return (
    <section className="py-10 border-y border-[#5C2D8F]/50 bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-sm font-medium text-[#B5A1C2]/50 mb-6">
          Trusted by innovative engineering teams worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {brands.map((brand, i) => (
            <div key={i} className="text-lg md:text-xl font-bold tracking-tighter text-[#D5CBE5]">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

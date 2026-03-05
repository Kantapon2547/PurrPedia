import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="bg-gray-100">

      {/* HERO SECTION */}
      <section
        className="relative h-[80vh] flex items-center"
        style={{
          backgroundImage: "url('/hero-cat.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Everything You Need to <br /> Know About Cats
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-xl text-gray-200">
            Explore cat breeds, learn care tips, and join a community of feline enthusiasts.
          </p>

          <div className="flex gap-4">
            <Link
              href="/breeds"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Browse Breeds →
            </Link>

            <Link
              href="/submit"
              className="border border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition"
            >
              Share Knowledge
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="bg-[#f3f1ee] py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 text-2xl">
              📖
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Breed Encyclopedia
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Detailed profiles of popular cat breeds with origins,
              temperament, and photos.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 text-2xl">
              ❤️
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Care Tips
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Expert advice on grooming, nutrition, health,
              and keeping your cat happy.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 text-2xl">
              🛡️
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Community Driven
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Submit and share cat information with fellow
              feline enthusiasts.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
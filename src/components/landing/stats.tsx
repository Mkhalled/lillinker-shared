export const Stats = () => {
  const stats = [
    { number: "1200+", label: "Projects done" },
    { number: "2354+", label: "Happy Clients" },
    { number: "3299+", label: "Cup Coffee" },
    { number: "101+", label: "Award Wins" },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

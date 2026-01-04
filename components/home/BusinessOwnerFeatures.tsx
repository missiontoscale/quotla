'use client'

import Link from 'next/link'

export default function BusinessOwnerFeatures() {
  const features = [
    {
      title: "Track Every Expense",
      description: "Categorize spending, identify tax deductions, and maintain complete financial records for your business.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
      color: "from-red-500 to-orange-500",
      link: "/dashboard/analytics"
    },
    {
      title: "Inventory Management",
      description: "Track products and stock levels. Integrate seamlessly with quotes and invoices for automated updates.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
      link: "/inventory"
    },
    {
      title: "Profitability Analysis",
      description: "Monitor revenue, costs, and profit margins. Identify your most profitable projects and optimize pricing.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-quotla-orange to-secondary-500",
      link: "/dashboard/analytics"
    },
    {
      title: "Time Tracking",
      description: "Log billable hours, track project time, and automatically calculate earnings for service-based work.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-quotla-green to-green-600",
      link: "/dashboard/analytics"
    },
    {
      title: "Supplier Management",
      description: "Maintain vendor relationships, track purchase orders, and manage procurement in one place.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      link: "/inventory/suppliers"
    },
    {
      title: "Income Summaries",
      description: "View revenue by month and year. Get instant insights into your business financial performance.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-quotla-dark to-quotla-green",
      link: "/dashboard"
    }
  ]

  return (
    <section className="relative py-32 bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-green overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-quotla-orange/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-quotla-green/15 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02]" style={{backgroundSize: '150%'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-2 bg-quotla-light/10 backdrop-blur-sm rounded-full mb-6 border border-quotla-light/20">
            <span className="font-heading text-sm font-bold text-quotla-light tracking-widest">FOR BUSINESS OWNERS</span>
          </div>
          <h2 className="font-sans text-5xl md:text-6xl font-bold text-quotla-light mb-6 leading-tight">
            Everything to run<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-400 to-quotla-light">your business smarter</span>
          </h2>
          <p className="text-xl text-quotla-light/70 max-w-3xl mx-auto">
            From expenses to inventory, profitability to time tracking—all the tools you need in one platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              href={feature.link}
              className="group relative bg-quotla-light/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-quotla-light/10 hover:border-quotla-orange hover:bg-quotla-light/10 transition-all duration-500 hover:scale-[1.03] overflow-hidden"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-quotla-orange/0 via-transparent to-quotla-green/0 group-hover:from-quotla-orange/10 group-hover:to-quotla-green/10 transition-all duration-500 rounded-3xl"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                  {feature.icon}
                </div>

                <h4 className="font-sans text-2xl font-bold text-quotla-light mb-4 group-hover:text-quotla-orange transition-colors">
                  {feature.title}
                </h4>
                <p className="font-sans text-base text-quotla-light/70 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <div className="flex items-center gap-2 text-sm font-bold text-quotla-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>Explore</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-20 h-20 border-2 border-quotla-light/5 rounded-full group-hover:border-quotla-orange/30 transition-all duration-500"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-8 py-4 bg-quotla-orange text-white rounded-2xl font-bold text-lg hover:bg-secondary-600 transition-all shadow-2xl shadow-quotla-orange/30 hover:shadow-quotla-orange/50 hover:scale-105"
          >
            Start managing your business
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-quotla-light/60 text-sm">
            Free to start • No credit card required • Full access
          </p>
        </div>
      </div>
    </section>
  )
}

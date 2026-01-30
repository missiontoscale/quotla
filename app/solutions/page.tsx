'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SolutionsPage() {
  const solutions = [
    {
      title: 'Freelancers & Contractors',
      description: 'Built for independent professionals who need to create quotes fast, track invoices, and get paid on time.',
      benefits: [
        'AI-powered quote generation in seconds',
        'Professional invoice templates',
        'Multi-currency support for global clients',
        'Track payments and outstanding balances'
      ],
      image: '/images/home/freelancer.jpg',
      cta: 'Start Free',
      link: '/signup'
    },
    {
      title: 'Small Business',
      description: 'Scale your operations with inventory tracking, team management, and comprehensive business analytics.',
      benefits: [
        'Complete inventory management',
        'Track products, stock, and expenses',
        'Customer relationship management',
        'Business insights and reporting'
      ],
      image: '/images/home/business-owner.jpg',
      cta: 'Get Started',
      link: '/signup'
    },
    {
      title: 'Agencies',
      description: 'Manage multiple clients seamlessly with centralized quoting, invoicing, and project tracking.',
      benefits: [
        'Multi-client quote management',
        'Branded documents for each client',
        'Batch invoicing capabilities',
        'Client portal for self-service'
      ],
      image: '/images/home/managing-multiple-cleints.jpg',
      cta: 'Learn More',
      link: '/for-business'
    }
  ]

  return (
    <div className="min-h-screen bg-quotla-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] overflow-hidden bg-gradient-to-br from-quotla-light via-white to-quotla-green/20">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-quotla-orange/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-quotla-green/15 rounded-full blur-[100px]"></div>

        <div className="relative w-full px-6 lg:px-20 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-6 py-2 bg-quotla-dark/10 rounded-full border border-quotla-dark/20 mb-6">
              <span className="font-heading text-sm font-bold text-quotla-dark tracking-widest">SOLUTIONS</span>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-quotla-dark leading-tight mb-6">
              Built for how<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-500 to-quotla-green">you work</span>
            </h1>

            <p className="text-xl md:text-2xl text-quotla-dark/70 leading-relaxed max-w-2xl mx-auto">
              Whether you're a solo freelancer or managing a growing team, Quotla adapts to your workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="relative py-24 bg-quotla-dark">
        <div className="w-full px-6 lg:px-20">
          <div className="space-y-24 max-w-[1600px] mx-auto">
            {solutions.map((solution, idx) => (
              <div
                key={idx}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-8 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <h2 className="font-heading text-4xl md:text-5xl font-bold text-quotla-light">
                    {solution.title}
                  </h2>
                  <p className="text-xl text-quotla-light/70 leading-relaxed">
                    {solution.description}
                  </p>

                  <ul className="space-y-4">
                    {solution.benefits.map((benefit, bidx) => (
                      <li key={bidx} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-quotla-orange/20 flex items-center justify-center mt-1">
                          <svg className="w-4 h-4 text-quotla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-lg text-quotla-light/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={solution.link}
                    className="inline-block px-10 py-4 rounded-2xl bg-gradient-to-r from-quotla-orange to-secondary-600 text-white text-lg font-bold hover:shadow-2xl hover:shadow-quotla-orange/40 transition-all hover:scale-105"
                  >
                    {solution.cta}
                  </Link>
                </div>

                {/* Image */}
                <div className={`relative ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="absolute -inset-4 bg-gradient-to-br from-quotla-orange/20 to-quotla-green/20 blur-2xl"></div>
                  <div
                    className="relative overflow-hidden rounded-3xl shadow-2xl"
                    style={{
                      clipPath: idx === 0
                        ? 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)'
                        : idx === 1
                        ? 'polygon(15% 0, 100% 0, 100% 100%, 0 100%, 0 15%)'
                        : 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)'
                    }}
                  >
                    <img
                      src={solution.image}
                      alt={solution.title}
                      className="w-full h-[400px] object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-quotla-orange via-secondary-500 to-quotla-dark">
        <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-[0.05]" style={{backgroundSize: '100%'}}></div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who've simplified their business workflow with Quotla.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-12 py-5 rounded-2xl bg-quotla-dark text-quotla-light text-xl font-bold hover:scale-105 transition-all shadow-2xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-12 py-5 rounded-2xl bg-white/10 backdrop-blur-sm text-white text-xl font-bold border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              View Pricing
            </Link>
          </div>

          <p className="text-white/70 mt-8">
            No credit card required • 2-minute setup
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

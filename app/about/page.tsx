'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  const [openFeature, setOpenFeature] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-quotla-light">
      {/* Header */}
      <Navbar />

      {/* Hero Section - Asymmetric Split Design */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-quotla-dark via-[#162020] to-quotla-green">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-quotla-orange/15 rounded-full blur-[140px] animate-morph"></div>
          <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-quotla-green/20 rounded-full blur-[120px] animate-morph" style={{animationDelay: '8s'}}></div>
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20light.svg')] bg-center opacity-[0.025]" style={{backgroundSize: '120%'}}></div>
        </div>

        {/* Full-width asymmetric grid */}
        <div className="relative w-full px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-block px-5 py-2 bg-quotla-orange/20 backdrop-blur-sm rounded-full border-2 border-quotla-orange/40">
                <span className="text-quotla-orange font-heading font-bold text-sm uppercase tracking-widest">Our Story</span>
              </div>

              <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl font-black text-quotla-light leading-[1.05] tracking-tight">
                Built by people who{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-400 to-quotla-light animate-pulse-glow">
                    get it
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M0 4 Q50 0, 100 4 T200 4" stroke="#ce6203" strokeWidth="3" fill="none" className="animate-draw"/>
                  </svg>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-quotla-light/85 leading-relaxed max-w-2xl font-sans">
                We're entrepreneurs ourselves. We know the frustration of spending hours on quotes when you could be closing deals.
                <span className="block mt-3 text-quotla-orange font-bold">That's why Quotla exists.</span>
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-quotla-orange to-secondary-600 text-white hover:from-secondary-600 hover:to-quotla-orange shadow-2xl shadow-quotla-orange/40 hover:shadow-quotla-orange/60 hover:scale-105 transition-all"
                >
                  Try Quotla Free
                </Link>
                <Link
                  href="#mission"
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-quotla-light/10 backdrop-blur-sm text-quotla-light border-2 border-quotla-light/30 hover:bg-quotla-light/20 hover:border-quotla-light/50 transition-all"
                >
                  Our Mission
                </Link>
              </div>
            </div>

            {/* Right: Image with creative frame */}
            <div className="relative animate-diagonal-slide" style={{animationDelay: '0.2s'}}>
              <div className="relative">
                {/* Decorative frame elements */}
                <div className="absolute -inset-6 bg-gradient-to-br from-quotla-orange/30 to-quotla-green/30 rounded-[3rem] blur-2xl"></div>
                <div className="absolute -top-8 -right-8 w-32 h-32 border-4 border-quotla-orange rounded-3xl rotate-12"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 border-4 border-quotla-green rounded-full"></div>

                <img
                  src="/images/about/independent-professional.jpg"
                  alt="Professional working"
                  className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                />

                {/* Floating stat card */}
                <div className="absolute -bottom-6 -right-6 bg-quotla-dark/95 backdrop-blur-xl text-quotla-light px-8 py-6 rounded-2xl shadow-2xl border-2 border-quotla-orange animate-float">
                  <div className="font-heading text-5xl font-black text-quotla-orange mb-1">2min</div>
                  <div className="text-sm font-semibold">Avg. Quote Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement - Diagonal Split */}
      <section id="mission" className="relative py-24 bg-quotla-light overflow-hidden">
        {/* Diagonal transition */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-quotla-dark via-[#162020] to-quotla-green" style={{clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)'}}></div>

        <div className="relative w-full px-6 lg:px-12 pt-16">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left: Large Image - Takes 3 columns */}
            <div className="lg:col-span-3 relative">
              <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
                <img
                  src="/images/about/shop.jpg"
                  alt="Professional workspace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-quotla-dark/80 via-transparent to-transparent"></div>

                {/* Quote overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <svg className="w-12 h-12 text-quotla-orange/60 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-2xl font-sans font-bold text-quotla-light italic leading-relaxed">
                    Time is your most valuable asset. We built Quotla to give it back to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Mission Text - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-sans text-4xl md:text-5xl font-black text-quotla-dark leading-tight">
                Your time<br/>
                <span className="text-quotla-orange">matters more</span>
              </h2>

              <div className="space-y-4 text-lg text-quotla-dark/80 leading-relaxed">
                <p className="font-semibold text-quotla-dark">
                  We've been in your shoes—the late nights, endless admin, and soul-crushing paperwork.
                </p>

                <p>
                  Every hour you spend formatting quotes is an hour stolen from growing your business, serving clients, or simply living your life.
                </p>

                <p className="text-quotla-orange font-bold">
                  Quotla changes that equation.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  { value: '3-5hrs', label: 'Saved per week' },
                  { value: '92%', label: 'Faster creation' },
                  { value: '$2.4k', label: 'Annual savings' },
                  { value: '100%', label: 'Customizable' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-quotla-dark/5 rounded-2xl p-5 border-2 border-quotla-dark/10 hover:border-quotla-orange hover:bg-quotla-orange/5 transition-all group">
                    <div className="font-heading text-3xl font-black text-quotla-orange group-hover:scale-110 transition-transform">{stat.value}</div>
                    <div className="text-sm font-semibold text-quotla-dark/70 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve - Creative Cards */}
      <section className="relative py-24 bg-gradient-to-br from-quotla-dark via-quotla-green/20 to-quotla-dark overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02]" style={{backgroundSize: '180%'}}></div>

        <div className="relative w-full px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-sans text-4xl md:text-5xl font-black text-quotla-light mb-6 leading-tight">
              Who We Serve
            </h2>
            <p className="text-xl text-quotla-light/80 max-w-3xl mx-auto">
              From solo freelancers to growing agencies, Quotla adapts to your workflow
            </p>
          </div>

          {/* Staggered Grid Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: '👤',
                title: 'Freelancers',
                description: 'Send professional quotes in minutes. Focus on your craft, not paperwork.',
                color: 'from-quotla-orange to-secondary-600',
                image: '/images/home/freelancer.jpg'
              },
              {
                icon: '🏢',
                title: 'Small Businesses',
                description: 'Scale operations with automated billing and payment tracking.',
                color: 'from-quotla-green to-green-600',
                image: '/images/home/business-owner.jpg'
              },
              {
                icon: '👥',
                title: 'Agencies',
                description: 'Manage multiple clients with organized project workflows.',
                color: 'from-purple-500 to-pink-500',
                image: '/images/home/managing-multiple-cleints.jpg'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative h-[450px] rounded-3xl overflow-hidden shadow-2xl hover:shadow-quotla-orange/30 transition-all duration-500 hover:scale-[1.02] animate-diagonal-slide"
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => e.currentTarget.src = '/images/about/A2.jpg'}
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-quotla-dark via-quotla-dark/70 to-transparent group-hover:from-quotla-dark/95 transition-all duration-500`}></div>

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className={`text-6xl mb-4 transform group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-3xl font-black text-quotla-light mb-3 group-hover:text-quotla-orange transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-lg text-quotla-light/90 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-4 flex items-center gap-2 text-quotla-orange font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span>Learn more</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-20 group-hover:opacity-40 blur-2xl transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Horizontal Scroll Cards */}
      <section className="relative py-24 bg-quotla-light overflow-hidden">
        <div className="w-full px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-sans text-4xl md:text-5xl font-black text-quotla-dark mb-6">
              What Drives Us
            </h2>
            <p className="text-xl text-quotla-dark/70 max-w-2xl mx-auto">
              The principles that guide everything we build
            </p>
          </div>

          {/* Values Cards - Bento Grid Style */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: '⚡',
                title: 'Speed',
                description: 'Your time is precious. We make everything instant.',
                color: 'bg-gradient-to-br from-quotla-orange/10 to-quotla-orange/5 border-quotla-orange'
              },
              {
                icon: '🎯',
                title: 'Simplicity',
                description: 'Powerful tools don\'t have to be complicated.',
                color: 'bg-gradient-to-br from-quotla-green/10 to-quotla-green/5 border-quotla-green'
              },
              {
                icon: '🔒',
                title: 'Security',
                description: 'Your data is encrypted and always protected.',
                color: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500'
              },
              {
                icon: '❤️',
                title: 'Empathy',
                description: 'Built by entrepreneurs, for entrepreneurs.',
                color: 'bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500'
              }
            ].map((value, idx) => (
              <div
                key={idx}
                className={`${value.color} border-2 rounded-3xl p-8 hover:scale-105 transition-all duration-500 group cursor-pointer animate-slide-up`}
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">
                  {value.icon}
                </div>
                <h3 className="font-heading text-2xl font-black text-quotla-dark mb-3">
                  {value.title}
                </h3>
                <p className="text-quotla-dark/70 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Full Bleed */}
      <section className="relative py-32 bg-gradient-to-r from-quotla-orange via-secondary-500 to-quotla-dark overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-quotla-light/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-[0.08]" style={{backgroundSize: '120%'}}></div>
        </div>

        <div className="relative w-full px-6 lg:px-12 text-center">
          <h2 className="font-sans text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Ready to reclaim<br/>
            <span className="text-quotla-dark">your time?</span>
          </h2>

          <p className="text-2xl md:text-3xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-semibold">
            Join thousands of professionals who've discovered a better way to work
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/signup"
              className="group relative px-12 py-6 rounded-2xl text-xl font-black bg-quotla-dark text-quotla-light hover:bg-quotla-light hover:text-quotla-dark transition-all shadow-2xl hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-quotla-light transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>

            <Link
              href="/pricing"
              className="px-12 py-6 rounded-2xl text-xl font-black bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
            >
              View Pricing
            </Link>
          </div>

          <p className="text-white/80 mt-8 text-lg">
            No credit card required • 2-minute setup • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

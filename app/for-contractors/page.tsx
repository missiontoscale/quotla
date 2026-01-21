'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ForContractorsPage() {
  const [hoveredTool, setHoveredTool] = useState<number | null>(null)

  const contractorTools = [
    {
      title: 'Quote Builder',
      tagline: 'Win more projects',
      description: 'Create detailed, itemized quotes that impress clients and close deals faster.',
      link: '/create',
      stats: '2 min avg',
      bgGradient: 'from-quotla-green via-[#5a6e58] to-quotla-orange'
    },
    {
      title: 'Invoice Hub',
      tagline: 'Get paid on time',
      description: 'Professional invoices with payment tracking and automated reminders.',
      link: '/invoices',
      stats: '99% accuracy',
      bgGradient: 'from-quotla-orange via-secondary-500 to-quotla-dark'
    },
    {
      title: 'Client Manager',
      tagline: 'Build relationships',
      description: 'Keep all client info, project history, and communications in one place.',
      link: '/clients',
      stats: 'Unlimited clients',
      bgGradient: 'from-quotla-dark via-[#1a2820] to-quotla-green'
    },
    {
      title: 'Project Calendar',
      tagline: 'Stay organized',
      description: 'Schedule consultations and manage deadlines with integrated calendar.',
      link: '/settings/integrations',
      stats: 'Sync anywhere',
      bgGradient: 'from-quotla-light via-quotla-green/30 to-quotla-orange/30'
    },
    {
      title: 'Income Reports',
      tagline: 'Track earnings',
      description: 'Simple summaries of monthly and yearly income for easy tax prep.',
      link: '/analytics',
      stats: 'Real-time data',
      bgGradient: 'from-secondary-600 via-quotla-orange to-quotla-green'
    },
    {
      title: 'Portfolio Library',
      tagline: 'Showcase your work',
      description: 'Store project photos and examples to share with potential clients.',
      link: '/business/products',
      stats: 'Unlimited storage',
      bgGradient: 'from-quotla-green via-quotla-dark to-secondary-700'
    },
  ]

  const contractorStories = [
    {
      name: 'Sarah Chen',
      role: 'Graphic Designer',
      quote: 'Quotla cut my admin time in half. Now I can focus on actual design work.',
      metric: '10hrs/week saved',
      bgColor: 'bg-quotla-orange/10'
    },
    {
      name: 'Marcus Johnson',
      role: 'Web Developer',
      quote: 'Clients love how fast I can turn around quotes. My close rate went up 35%.',
      metric: '35% more deals',
      bgColor: 'bg-quotla-green/10'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Content Writer',
      quote: 'The invoice tracking is a game-changer. No more chasing payments.',
      metric: '100% on-time payment',
      bgColor: 'bg-secondary-500/10'
    },
  ]

  const contractorBenefits = [
    {
      title: 'Work from anywhere',
      description: 'Cloud-based platform accessible on any device',
      image: '/images/home/freelancer.jpg',
      height: 'h-[450px]'
    },
    {
      title: 'Professional impression',
      description: 'Polished quotes and invoices that build trust',
      image: '/images/home/independent-professional.jpg',
      height: 'h-[380px]'
    },
    {
      title: 'Scale your business',
      description: 'Tools that grow with you from solo to team',
      image: '/images/home/business-owner2.jpg',
      height: 'h-[420px]'
    },
    {
      title: 'Stay organized',
      description: 'All your projects, clients, and docs in one place',
      image: '/images/home/managing-multiple-cleints.jpg',
      height: 'h-[500px]'
    },
  ]

  const pricingFeatures = [
    'Unlimited quotes & invoices',
    'AI-powered generation',
    'Multi-currency support',
    'Client portal access',
    'Payment tracking',
    'Income reports',
    'Calendar integration',
    'Priority support',
  ]

  return (
    <div className="min-h-screen bg-quotla-dark">
      <Navbar />

      {/* Hero Section - Diagonal split with contrasting colors */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Diagonal background split */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-quotla-light" style={{clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 85%)'}}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-green"></div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-40 h-40 border-8 border-quotla-orange/30 rounded-full animate-float"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-quotla-green/20 rounded-2xl transform rotate-45 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 border-8 border-quotla-light/20 rounded-2xl animate-float" style={{animationDelay: '2s'}}></div>

        <div className="relative w-full px-6 lg:px-20 pt-32 pb-20">
          <div className="max-w-[1800px] mx-auto">
            {/* Main content */}
            <div className="max-w-4xl">
              <div className="inline-block px-6 py-2 bg-quotla-orange/20 rounded-full mb-8 border-2 border-quotla-orange/40 animate-pulse-glow">
                <span className="font-heading text-sm font-bold text-quotla-orange tracking-widest">FOR CONTRACTORS & FREELANCERS</span>
              </div>

              <h1 className="font-heading text-6xl md:text-7xl lg:text-[120px] font-bold leading-[0.9] mb-8">
                <span className="text-quotla-dark">Do what</span><br/>
                <span className="text-quotla-dark">you love.</span><br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-500 to-quotla-light">
                  Automate
                </span><br/>
                <span className="text-quotla-light">the rest.</span>
              </h1>

              <p className="text-2xl md:text-3xl text-quotla-light/90 leading-relaxed max-w-2xl mb-12">
                Spend less time on paperwork, more time on projects you're passionate about.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="/signup"
                  className="group relative px-12 py-6 rounded-2xl bg-quotla-orange text-white text-xl font-bold overflow-hidden hover:scale-105 transition-all shadow-2xl shadow-quotla-orange/40"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-quotla-orange transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                <Link
                  href="#tools"
                  className="px-12 py-6 rounded-2xl border-3 border-quotla-light text-quotla-light text-xl font-bold hover:bg-quotla-light hover:text-quotla-dark transition-all text-center"
                >
                  Explore Tools
                </Link>
              </div>
            </div>

            {/* Stats cards - floating in space */}
            <div className="absolute bottom-20 right-20 hidden lg:flex flex-col gap-4 animate-diagonal-slide" style={{animationDelay: '0.5s'}}>
              <div className="bg-quotla-light rounded-2xl p-6 shadow-2xl transform hover:scale-110 transition-transform">
                <div className="font-heading text-4xl font-bold text-quotla-orange mb-1">2 min</div>
                <div className="text-sm text-quotla-dark/70">avg. quote time</div>
              </div>
              <div className="bg-quotla-orange rounded-2xl p-6 shadow-2xl transform hover:scale-110 transition-transform">
                <div className="font-heading text-4xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-white/80">satisfaction rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Benefits Section - Image cards with varied layouts */}
      <section className="relative py-32 bg-gradient-to-b from-quotla-light via-white to-quotla-green/10 overflow-hidden">
        <div className="relative w-full px-6 lg:px-20">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-quotla-dark/10 rounded-full mb-6">
              <span className="font-heading text-sm font-bold text-quotla-dark tracking-widest">WHY CONTRACTORS LOVE US</span>
            </div>
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-dark mb-6">
              Built for your lifestyle
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1800px] mx-auto">
            {contractorBenefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`group relative ${benefit.height} rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-reveal`}
                style={{
                  animationDelay: `${idx * 0.15}s`,
                  clipPath: idx % 2 === 0
                    ? 'polygon(10% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%, 0% 10%)'
                    : 'polygon(0% 0%, 90% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%)'
                }}
              >
                <img
                  src={benefit.image}
                  alt={benefit.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-t from-quotla-dark via-quotla-dark/60 to-transparent group-hover:from-quotla-orange group-hover:via-quotla-orange/80 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-white/90 text-lg">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid - Mosaic layout with varied heights */}
      <section id="tools" className="relative py-32 bg-quotla-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.015]"></div>

        <div className="relative w-full px-6 lg:px-20">
          <div className="text-center mb-20">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-light mb-6">
              Your complete<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange to-quotla-green">contractor toolkit</span>
            </h2>
            <p className="text-xl text-quotla-light/70 max-w-3xl mx-auto">
              Quick access to everything you need—from quote to payment
            </p>
          </div>

          {/* Masonry-style grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
            {contractorTools.map((tool, idx) => (
              <Link
                key={idx}
                href={tool.link}
                onMouseEnter={() => setHoveredTool(idx)}
                onMouseLeave={() => setHoveredTool(null)}
                className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-slide-up"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  height: idx % 3 === 0 ? '420px' : idx % 3 === 1 ? '380px' : '450px'
                }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} transition-all duration-500 ${
                  hoveredTool === idx ? 'scale-110' : 'scale-100'
                }`}></div>

                {/* Content overlay */}
                <div className="relative h-full p-8 flex flex-col justify-between">
                  {/* Stat badge */}
                  <div className="flex items-start justify-end">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md ${
                      idx === 3 ? 'bg-quotla-dark/30 text-quotla-dark' : 'bg-white/20 text-white'
                    }`}>
                      {tool.stats}
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="space-y-3">
                    <div className={`text-sm font-bold tracking-wider ${
                      idx === 3 ? 'text-quotla-orange' : 'text-white/70'
                    }`}>
                      {tool.tagline.toUpperCase()}
                    </div>
                    <h3 className={`font-heading text-3xl font-bold ${
                      idx === 3 ? 'text-quotla-dark' : 'text-white'
                    }`}>
                      {tool.title}
                    </h3>
                    <p className={`text-base leading-relaxed ${
                      idx === 3 ? 'text-quotla-dark/80' : 'text-white/90'
                    }`}>
                      {tool.description}
                    </p>

                    {/* Arrow */}
                    <div className={`flex items-center gap-2 font-bold pt-2 transform translate-x-0 group-hover:translate-x-2 transition-transform ${
                      idx === 3 ? 'text-quotla-orange' : 'text-white'
                    }`}>
                      <span>Launch</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Contractor testimonials */}
      <section className="relative py-32 bg-quotla-dark overflow-hidden">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-quotla-green/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-quotla-orange/10 rounded-full blur-[130px]"></div>

        <div className="relative w-full px-6 lg:px-20">
          <div className="text-center mb-20">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-light mb-6">
              Real contractors.<br/>
              <span className="text-quotla-orange">Real results.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
            {contractorStories.map((story, idx) => (
              <div
                key={idx}
                className={`group relative ${story.bgColor} backdrop-blur-sm rounded-3xl p-10 border-2 border-quotla-light/10 hover:border-quotla-orange transition-all duration-500 hover:scale-105 animate-slide-up`}
                style={{
                  animationDelay: `${idx * 0.2}s`,
                  minHeight: idx === 1 ? '420px' : '380px'
                }}
              >
                {/* Quote */}
                <blockquote className="text-xl text-quotla-light/90 leading-relaxed mb-6 italic">
                  "{story.quote}"
                </blockquote>

                {/* Author */}
                <div className="space-y-2">
                  <div className="font-heading text-xl font-bold text-quotla-light">{story.name}</div>
                  <div className="text-quotla-light/60 text-sm">{story.role}</div>
                  <div className="inline-block px-4 py-2 bg-quotla-orange/20 rounded-full mt-4">
                    <span className="text-quotla-orange font-bold text-sm">{story.metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Contractor-focused */}
      <section className="relative py-32 bg-gradient-to-br from-quotla-green via-[#1a2820] to-quotla-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-[0.03]"></div>

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-light mb-6">
              Simple pricing for<br/>
              <span className="text-quotla-orange">independent pros</span>
            </h2>
            <p className="text-xl text-quotla-light/70">
              One plan. Everything included. No hidden fees.
            </p>
          </div>

          {/* Pricing card - centered and prominent */}
          <div className="relative bg-quotla-light/5 backdrop-blur-md rounded-[50px] overflow-hidden border-4 border-quotla-orange/40 shadow-2xl hover:shadow-quotla-orange/30 transition-all animate-pulse-glow">
            <div className="p-16 text-center">
              <div className="inline-block px-6 py-2 bg-quotla-orange/20 rounded-full mb-8">
                <span className="font-heading text-sm font-bold text-quotla-orange tracking-widest">MOST POPULAR</span>
              </div>

              <h3 className="font-heading text-4xl font-bold text-quotla-light mb-4">Pro Plan</h3>

              <div className="mb-8">
                <span className="font-heading text-7xl font-bold text-quotla-light">$15</span>
                <span className="text-2xl text-quotla-light/70">/month</span>
              </div>

              <p className="text-xl text-quotla-light/80 mb-12">
                Everything you need to run your contracting business
              </p>

              <Link
                href="/signup"
                className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-quotla-orange to-secondary-600 text-white text-xl font-bold hover:scale-105 transition-all shadow-xl mb-12"
              >
                Start Free Trial
              </Link>

              {/* Features list */}
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                {pricingFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-quotla-light/90 animate-slide-up"
                    style={{animationDelay: `${idx * 0.05}s`}}
                  >
                    <svg className="w-6 h-6 text-quotla-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-quotla-light/60 mt-8 text-lg">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Final CTA - Bold diagonal */}
      <section className="relative py-40 overflow-hidden">
        {/* Diagonal split background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-quotla-orange" style={{clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)'}}></div>
          <div className="absolute inset-0 bg-quotla-light"></div>
        </div>

        {/* Animated shapes */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-quotla-dark/10 rounded-full blur-3xl animate-morph"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-quotla-orange/20 rounded-full blur-3xl animate-morph" style={{animationDelay: '5s'}}></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="font-heading text-6xl md:text-7xl font-bold leading-tight mb-8">
            <span className="text-white">Stop the paperwork.</span><br/>
            <span className="text-quotla-dark">Start creating.</span>
          </h2>

          <p className="text-2xl text-quotla-dark/80 mb-12 max-w-3xl mx-auto">
            Join thousands of contractors who've reclaimed their time with Quotla
          </p>

          <Link
            href="/signup"
            className="inline-block px-14 py-6 rounded-2xl bg-quotla-dark text-quotla-light text-2xl font-bold hover:scale-105 transition-all shadow-2xl hover:shadow-quotla-dark/50"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

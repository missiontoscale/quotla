'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeroCarouselProps {
  typingText: string
}

const carouselSlides = [
  {
    id: 'freelancers',
    badge: 'FOR FREELANCERS & CONSULTANTS',
    badgeColor: 'bg-quotla-orange/15 border-quotla-orange/30',
    title: 'Get paid faster with AI-powered quotes',
    subtitle: 'Focus on your expertise, not paperwork',
    description: 'Create professional quotes in minutes, track payments effortlessly, and spend more time doing what you love.',
    features: [
      { stat: '2 min', text: 'avg. quote time' },
      { stat: '4+', text: 'currencies' },
      { stat: '100%', text: 'customizable' }
    ],
    ctaPrimary: 'Start Free',
    ctaSecondary: 'See How It Works',
    gradient: 'from-quotla-orange via-secondary-400 to-quotla-light',
    primaryBtnBg: 'bg-quotla-orange hover:bg-secondary-600',
    primaryBtnShadow: 'shadow-quotla-orange/30 hover:shadow-quotla-orange/50'
  },
  {
    id: 'business',
    badge: 'FOR SMALL BUSINESS OWNERS',
    badgeColor: 'bg-quotla-green/20 border-quotla-green/40',
    title: 'Grow your business with smart automation',
    subtitle: 'Streamline operations and boost revenue',
    description: 'Manage inventory, create quotes, send invoices, and track everything in one powerful platform built for growth.',
    features: [
      { stat: 'Inventory', text: 'management' },
      { stat: 'Multi', text: 'currency' },
      { stat: 'PDF', text: 'export' }
    ],
    ctaPrimary: 'Start Free',
    ctaSecondary: 'View Features',
    gradient: 'from-quotla-green via-quotla-orange to-quotla-light',
    primaryBtnBg: 'bg-quotla-green hover:bg-quotla-green/90',
    primaryBtnShadow: 'shadow-quotla-green/30 hover:shadow-quotla-green/50'
  },
  {
    id: 'ai',
    badge: 'AI-POWERED PLATFORM',
    badgeColor: 'bg-quotla-orange/15 border-quotla-orange/30',
    title: 'AI that understands your business',
    subtitle: 'Natural language meets powerful automation',
    description: 'Simply describe what you need in plain English. Our AI handles quotes, invoices, pricing, and more—automatically.',
    features: [
      { stat: 'AI', text: 'quote generation' },
      { stat: 'Smart', text: 'pricing' },
      { stat: 'Auto', text: 'conversion' }
    ],
    ctaPrimary: 'Try AI Free',
    ctaSecondary: 'See AI in Action',
    gradient: 'from-quotla-orange via-secondary-400 to-quotla-light',
    primaryBtnBg: 'bg-quotla-orange hover:bg-secondary-600',
    primaryBtnShadow: 'shadow-quotla-orange/30 hover:shadow-quotla-orange/50'
  }
]

export default function HeroCarousel({ typingText }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-rotate carousel every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 12000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  const currentSlideData = carouselSlides[currentSlide]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-quotla-dark via-[#162020] to-quotla-green pt-8">
      {/* Animated background orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-quotla-orange/15 rounded-full blur-[140px] animate-morph"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-quotla-green/20 rounded-full blur-[120px] animate-morph" style={{animationDelay: '8s'}}></div>
        <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20light.svg')] bg-center opacity-[0.025]" style={{backgroundSize: '120%'}}></div>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative w-full h-full">
        {/* Single Slide - Dynamic Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 w-full py-16 md:py-20 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Left Column - Text Content */}
            <div className="space-y-6 md:space-y-8 animate-slide-up lg:pl-16">
              <div className={`inline-flex items-center gap-3 px-5 py-2.5 ${currentSlideData.badgeColor} backdrop-blur-sm rounded-full border transition-all duration-500`}>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-quotla-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-quotla-orange"></span>
                </div>
                <span className="text-quotla-light/90 font-heading text-xs md:text-sm font-semibold tracking-wider">{currentSlideData.badge}</span>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                  <span className="text-quotla-light block mb-1 md:mb-2">
                    {currentSlideData.title}
                  </span>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentSlideData.gradient} inline-block`}>
                    {currentSlideData.subtitle}
                  </span>
                </h1>
              </div>

              <p className="font-sans text-lg sm:text-xl md:text-2xl text-quotla-light/75 leading-relaxed max-w-2xl">
                {currentSlideData.description}
              </p>

              <div className="flex flex-wrap gap-6 md:gap-8 pt-2">
                {currentSlideData.features.map((feature, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-heading text-2xl md:text-3xl font-bold text-quotla-orange">{feature.stat}</div>
                    <div className="text-xs md:text-sm text-quotla-light/60">{feature.text}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/signup"
                  className={`group relative px-6 md:px-8 py-4 md:py-5 rounded-xl text-lg md:text-xl font-bold ${currentSlideData.primaryBtnBg} text-white transition-all duration-300 shadow-2xl ${currentSlideData.primaryBtnShadow} hover:scale-105 overflow-hidden`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {currentSlideData.ctaPrimary}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/about"
                  className="group px-6 md:px-8 py-4 md:py-5 rounded-xl text-lg md:text-xl font-bold bg-quotla-light/10 backdrop-blur-sm text-quotla-light border-2 border-quotla-light/30 hover:bg-quotla-light/20 hover:border-quotla-light/50 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {currentSlideData.ctaSecondary}
                    <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3 md:gap-4 pt-2 text-xs md:text-sm text-quotla-light/60 flex-wrap">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-quotla-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-quotla-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>2-minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-quotla-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative animate-fade-in-delay hidden lg:block">
              <div className="relative">
                <div className="absolute top-8 left-8 w-full h-[400px] bg-quotla-light/5 backdrop-blur-md rounded-2xl border border-quotla-light/10 transform rotate-6 scale-95"></div>
                <div className="absolute top-4 left-4 w-full h-[400px] bg-quotla-light/8 backdrop-blur-md rounded-2xl border border-quotla-light/15 transform rotate-3 scale-[0.97]"></div>

                <div className="relative w-full h-[400px] bg-quotla-light/10 backdrop-blur-xl rounded-2xl border-2 border-quotla-orange/30 shadow-2xl shadow-quotla-orange/20 p-8 transform hover:scale-105 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-quotla-light/20">
                      <div className="space-y-1">
                        <div className="text-quotla-light/50 text-xs font-semibold tracking-wider">QUOTE</div>
                        <div className="text-quotla-light text-lg font-bold">#QT-2026-001</div>
                      </div>
                      <div className="px-3 py-1.5 bg-quotla-green/30 rounded-full">
                        <span className="text-quotla-light text-xs font-semibold">APPROVED</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between p-3 bg-quotla-light/5 rounded-lg">
                        <div className="flex-1">
                          <div className="text-quotla-light/90 font-medium text-sm">Website Design</div>
                          <div className="text-quotla-light/50 text-xs mt-1">5 pages, responsive</div>
                        </div>
                        <div className="text-quotla-orange font-bold">$2,500</div>
                      </div>

                      <div className="flex items-start justify-between p-3 bg-quotla-light/5 rounded-lg">
                        <div className="flex-1">
                          <div className="text-quotla-light/90 font-medium text-sm">SEO Optimization</div>
                          <div className="text-quotla-light/50 text-xs mt-1">3 months</div>
                        </div>
                        <div className="text-quotla-orange font-bold">$1,200</div>
                      </div>

                      <div className="flex items-start justify-between p-3 bg-quotla-light/5 rounded-lg">
                        <div className="flex-1">
                          <div className="text-quotla-light/90 font-medium text-sm">Hosting & Maintenance</div>
                          <div className="text-quotla-light/50 text-xs mt-1">Annual plan</div>
                        </div>
                        <div className="text-quotla-orange font-bold">$600</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-quotla-light/20">
                      <div className="flex items-center justify-between">
                        <div className="text-quotla-light text-lg font-bold">Total</div>
                        <div className="text-quotla-orange text-2xl font-bold">$4,300</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -inset-0.5 bg-gradient-to-r from-quotla-orange to-quotla-green rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 px-4 py-2 bg-quotla-orange rounded-xl shadow-lg animate-float">
                <div className="text-white text-sm font-bold">Generated in 2 min</div>
              </div>

              <div className="absolute -bottom-6 -left-6 px-4 py-2 bg-quotla-green rounded-xl shadow-lg animate-float" style={{animationDelay: '3s'}}>
                <div className="text-quotla-light text-sm font-bold">AI-Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation - Bottom Right for Desktop, Bottom Center for Mobile */}
      <div className="absolute bottom-8 right-4 sm:right-8 z-20 flex items-center gap-3 bg-quotla-dark/40 backdrop-blur-md px-4 py-3 rounded-full border border-quotla-light/10">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="group w-10 h-10 rounded-full bg-quotla-light/10 border border-quotla-light/20 hover:bg-quotla-orange hover:border-quotla-orange transition-all duration-300 flex items-center justify-center hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4 text-quotla-light group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {carouselSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-quotla-orange w-8 h-2 shadow-lg shadow-quotla-orange/50'
                  : 'bg-quotla-light/30 w-2 h-2 hover:bg-quotla-light/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="group w-10 h-10 rounded-full bg-quotla-light/10 border border-quotla-light/20 hover:bg-quotla-orange hover:border-quotla-orange transition-all duration-300 flex items-center justify-center hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4 text-quotla-light group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Scroll Indicator - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden sm:block">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-quotla-light/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-quotla-orange/60 rounded-full animate-pulse"></div>
          </div>
          <span className="text-quotla-light/40 text-xs font-medium">Scroll</span>
        </div>
      </div>
    </section>
  )
}

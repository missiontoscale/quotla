'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  const [openFeature, setOpenFeature] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
    <div className="min-h-screen bg-gradient-to-br from-quotla-dark via-primary-800 to-quotla-dark">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20light.svg')] bg-center opacity-[0.02]" style={{backgroundSize: '100%'}}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-quotla-orange/10 via-transparent to-quotla-green/10"></div>
        {/* Morphing accent shapes */}
        <div className="absolute top-10 left-20 w-72 h-72 bg-quotla-green/20 animate-morph blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-quotla-orange/15 animate-morph blur-3xl" style={{animationDelay: '7s'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-quotla-orange/20 backdrop-blur-sm rounded-full border border-quotla-orange/30">
            <span className="text-quotla-orange font-semibold text-sm uppercase tracking-wider">About Quotla</span>
          </div>
          <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-quotla-light mb-8 leading-tight tracking-tight">
            Professional Quotes in <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-500 to-quotla-green animate-pulse-glow">2 Minutes</span>
          </h1>
          <p className="font-sans text-2xl md:text-3xl text-quotla-light/90 max-w-3xl mx-auto leading-relaxed">
            Quotla helps you create professional quotes and invoices quickly using AI to generate clear, client-ready documents.
          </p>
        </div>
      </section>

      {/* Mission Statement - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-24">
        <div className="bg-gradient-to-br from-quotla-light via-quotla-light to-quotla-green/20 rounded-3xl shadow-2xl border-2 border-quotla-orange/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-quotla-orange/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-quotla-green/10 rounded-full blur-3xl"></div>
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Person Photo */}
            <div className="relative h-full min-h-[400px] md:min-h-[500px] rounded-l-3xl overflow-hidden">
              <img
                src="/images/about/independent-professional.jpg"
                alt="Professional smiling"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-quotla-light/20"></div>
            </div>

            {/* Right: Concise Text */}
            <div className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-quotla-dark mb-4">Your Time Matters</h2>
              <p className="text-lg md:text-xl text-quotla-dark/80 leading-relaxed mb-4">
                Every minute formatting quotes is time away from building your business or doing what you love.
              </p>
              <p className="text-lg md:text-xl text-quotla-dark/80 leading-relaxed mb-4">
                <span className="font-bold text-quotla-dark">Quotla is lightning fast.</span> Describe your needs in plain language, and get polished, client-ready quotes in seconds.
              </p>
              <p className="text-lg md:text-xl text-quotla-dark/80 leading-relaxed">
                <span className="font-bold text-quotla-dark">Work your way.</span> Choose AI-powered automation or manual controls for complete customization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Image Section - Professional Working */}
        <section className="mb-24">
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/images/about/shop.jpg"
              alt="Professional working with Quotla"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-quotla-dark/90 via-quotla-dark/40 to-transparent flex items-end">
              <div className="p-12 max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold text-quotla-light mb-4">
                  Built for Professionals Like You
                </h2>
                <p className="text-xl text-quotla-light/90 leading-relaxed">
                  Whether you're closing deals, managing clients, or growing your business, Quotla gives you the tools to work smarter, not harder.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built For Section */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-quotla-light mb-6 text-center">Built for How You Work</h2>
          <p className="text-xl text-quotla-light/80 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
            Whether you're a freelancer juggling multiple projects, a small business scaling operations, or an agency managing dozens of clients, Quotla adapts to your workflow.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Freelancers & Consultants",
                description: "Send professional quotes in minutes, not hours. Focus on your craft, not paperwork.",
                color: "from-quotla-orange to-secondary-600"
              },
              {
                icon: (
                  <svg className="w-12 h-12 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: "Small Businesses",
                description: "Manage multiple clients and projects with organized billing and payment tracking.",
                color: "from-quotla-green to-green-600"
              },
              {
                icon: (
                  <svg className="w-12 h-12 hover-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Creative Agencies",
                description: "Streamline client work from quote to payment with seamless project management.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-quotla-orange/50 hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-diagonal-slide" style={{animationDelay: `${idx * 0.15}s`}}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 transform group-hover:scale-110 transition-transform shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-quotla-light mb-3">{item.title}</h3>
                <p className="text-quotla-light/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Accordion */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-quotla-light mb-6 text-center">Packed with Power</h2>
          <p className="text-xl text-quotla-light/80 mb-12 text-center max-w-3xl mx-auto">
            Everything you need to manage your business, all in one place
          </p>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "AI-Powered Creation",
                description: "Describe your quote in plain language, and our AI generates a professional document instantly. No templates, no complicated forms - just tell us what you need in your own words.",
                color: "from-quotla-orange to-secondary-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Lightning Fast",
                description: "Create complete quotes in under 2 minutes. No more wasting time on repetitive tasks. Spend less time on paperwork and more time growing your business.",
                color: "from-quotla-green to-green-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Multi-Currency Support",
                description: "Work globally with USD, NGN, EUR, GBP, and automatic currency conversion. Perfect for international clients and cross-border transactions.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: "Complete Control",
                description: "Choose between AI automation or manual creation with full customization. Whether you prefer speed or precision, Quotla gives you the flexibility to work your way.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Client Management",
                description: "Track all clients, contact info, and transaction history in one dashboard. Keep all your business relationships organized and accessible from anywhere.",
                color: "from-quotla-dark to-quotla-green"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: "PDF Export & Sharing",
                description: "Generate professional PDFs ready to download, print, or email to clients. Beautiful, branded documents that make a great first impression.",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-quotla-orange/50">
                <button
                  onClick={() => setOpenFeature(openFeature === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  aria-expanded={openFeature === idx}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} text-white flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-quotla-light">{feature.title}</h3>
                  </div>
                  <svg
                    className={`w-6 h-6 text-quotla-light/70 transition-transform duration-300 flex-shrink-0 ${openFeature === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFeature === idx ? 'max-h-48' : 'max-h-0'}`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-quotla-light/80 leading-relaxed pl-16">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works - Simple Grid */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-quotla-light mb-16 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Start a Conversation",
                description: "Open the AI assistant and describe what you need. Tell it about your business, your client, and the products or services you're quoting.",
                color: "from-quotla-orange to-secondary-600"
              },
              {
                step: "2",
                title: "Review and Refine",
                description: "The AI generates a draft based on your description. Review the details, make any adjustments you need, and add your personal touch.",
                color: "from-quotla-green to-green-600"
              },
              {
                step: "3",
                title: "Send to Client",
                description: "Export your quote as a PDF and send it to your client. Track its status and follow up when needed.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-quotla-orange/50 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center text-3xl font-bold shadow-xl mb-6`}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-quotla-light mb-4">{item.title}</h3>
                <p className="text-quotla-light/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-quotla-light mb-6 text-center">Common Questions</h2>
          <p className="text-xl text-quotla-light/80 mb-12 text-center max-w-3xl mx-auto">
            Quick answers to questions you may have
          </p>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "What makes Quotla different from other invoicing tools?",
                answer: "Quotla combines AI-powered automation with complete manual control. Our Quotla Agent understands natural language, so you can create professional quotes by simply describing what you need - no templates or forms required. Yet you still have full control to customize everything."
              },
              {
                question: "Can I use Quotla if I'm not tech-savvy?",
                answer: "Absolutely! Quotla is designed for everyone. If you can describe your services in plain English, you can use Quotla. The AI handles the complexity, giving you professional documents without the learning curve."
              },
              {
                question: "How does inventory management work?",
                answer: "Quotla's inventory system lets you track products and services, manage stock levels, and automatically pull items into quotes and invoices. It's integrated seamlessly, so you can manage everything from one dashboard."
              },
              {
                question: "What happens to my data if I cancel?",
                answer: "Your data is always yours. You can export all your quotes, invoices, and client information at any time. If you cancel, you'll have access to download everything before your account closes."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes! We offer a 30-day money-back guarantee on all paid plans. If Quotla isn't right for you, just let us know within 30 days for a full refund."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-quotla-orange/50">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  aria-expanded={openFaq === idx}
                >
                  <h4 className="text-lg font-semibold text-quotla-light pr-8">{faq.question}</h4>
                  <svg
                    className={`w-6 h-6 text-quotla-light/70 transition-transform duration-300 flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-quotla-light/80 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-quotla-light via-quotla-light/95 to-quotla-green/30 relative overflow-hidden p-12 md:p-16 rounded-3xl border-2 border-quotla-orange/40 shadow-2xl">
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-5" style={{backgroundSize: 'cover'}}></div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-quotla-dark mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-xl md:text-2xl text-quotla-dark/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who've discovered a better way to create quotes and manage their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup" className="px-10 py-5 rounded-xl text-xl font-semibold bg-quotla-dark text-quotla-light hover:bg-quotla-dark/90 transition-all shadow-2xl hover:shadow-quotla-dark/50 hover:scale-105 text-center">
                Start Free Trial
              </Link>
              <Link href="/login" className="px-10 py-5 rounded-xl text-xl font-semibold bg-transparent text-quotla-dark hover:bg-quotla-dark/10 transition-all border-2 border-quotla-dark/30 hover:border-quotla-dark text-center">
                Sign In
              </Link>
            </div>
            <p className="text-sm text-quotla-dark/60 mt-6">
              No credit card required • 2 free AI questions to get started
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

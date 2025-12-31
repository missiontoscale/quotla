'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-quotla-dark via-primary-800 to-quotla-dark">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-quotla-orange/10 via-transparent to-quotla-green/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-quotla-orange/20 backdrop-blur-sm rounded-full border border-quotla-orange/30">
            <span className="text-quotla-orange font-semibold text-sm uppercase tracking-wider">About Quotla</span>
          </div>
          <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-quotla-light mb-8 leading-tight">
            Professional Quotes in <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange to-quotla-green">2 Minutes</span>
          </h1>
          <p className="font-sans text-2xl md:text-3xl text-quotla-light/90 max-w-3xl mx-auto leading-relaxed">
            Quotla helps you create professional quotes and invoices quickly using AI to generate clear, client-ready documents.
          </p>
        </div>
      </section>

      {/* Mission Statement - Visual Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-24">
        <div className="bg-gradient-to-br from-quotla-light via-quotla-light to-quotla-green/20 rounded-3xl shadow-2xl p-12 md:p-16 border-2 border-quotla-orange/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-quotla-orange/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-quotla-green/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold text-quotla-dark mb-6 text-center">Your Time Matters</h2>
            <p className="text-xl md:text-2xl text-quotla-dark/80 text-center max-w-4xl mx-auto leading-relaxed">
              Every minute you spend formatting quotes and invoices is a minute away from building your business, serving clients, or doing what you actually love. <span className="font-bold text-quotla-dark">We built Quotla to give you those minutes back.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* The Story Section */}
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-quotla-orange/20 to-quotla-green/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <svg className="w-20 h-20 text-quotla-orange mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-3xl font-bold text-quotla-light mb-4">Lightning Fast</h3>
                <p className="text-lg text-quotla-light/80 leading-relaxed">
                  Quotla transforms how professionals create business documents. Describe what you need in plain language, like you're talking to a colleague, and our AI generates a polished, client-ready quote in seconds.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-quotla-green/20 to-quotla-orange/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <svg className="w-20 h-20 text-quotla-green mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className="text-3xl font-bold text-quotla-light mb-4">Your Way</h3>
                <p className="text-lg text-quotla-light/80 leading-relaxed">
                  Our platform offers both AI-powered generation and traditional manual controls. Love automation? Let our AI handle the heavy lifting. Prefer hands-on control? Use our intuitive forms for complete customization.
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
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                title: "Freelancers & Consultants",
                description: "Send professional quotes in minutes, not hours. Focus on your craft, not paperwork.",
                color: "from-quotla-orange to-secondary-600"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: "Small Businesses",
                description: "Manage multiple clients and projects with organized billing and payment tracking.",
                color: "from-quotla-green to-green-600"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Creative Agencies",
                description: "Streamline client work from quote to payment with seamless project management.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-quotla-orange/50 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 transform group-hover:scale-110 transition-transform shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-quotla-light mb-3">{item.title}</h3>
                <p className="text-quotla-light/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-quotla-light mb-6 text-center">Packed with Power</h2>
          <p className="text-xl text-quotla-light/80 mb-12 text-center max-w-3xl mx-auto">
            Everything you need to manage your business, all in one place
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "AI-Powered Creation",
                description: "Describe your quote in plain language, and our AI generates a professional document instantly.",
                color: "from-quotla-orange to-secondary-600"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Lightning Fast",
                description: "Create complete quotes in under 2 minutes. No more wasting time on repetitive tasks.",
                color: "from-quotla-green to-green-600"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Multi-Currency",
                description: "Work globally with USD, NGN, EUR, GBP, and automatic currency conversion.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: "Complete Control",
                description: "Choose between AI automation or manual creation with full customization.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Client Management",
                description: "Track all clients, contact info, and transaction history in one dashboard.",
                color: "from-quotla-dark to-quotla-green"
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: "PDF Export",
                description: "Generate professional PDFs ready to download, print, or email to clients.",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-quotla-orange/50 hover:shadow-2xl transition-all duration-300 group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 transform group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-quotla-light mb-3">{feature.title}</h3>
                <p className="text-quotla-light/70 leading-relaxed">{feature.description}</p>
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

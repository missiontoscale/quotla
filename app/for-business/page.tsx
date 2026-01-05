'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ForBusinessPage() {
  const [activeTab, setActiveTab] = useState(0)

  const businessTools = [
    {
      title: 'AI Quote Generation',
      icon: '⚡',
      description: 'Create professional quotes in seconds',
      link: '/quotes/new',
      color: 'from-quotla-orange to-secondary-600'
    },
    {
      title: 'Invoice Management',
      icon: '📄',
      description: 'Track payments and billing',
      link: '/invoices',
      color: 'from-quotla-green to-quotla-dark'
    },
    {
      title: 'Inventory Tracking',
      icon: '📦',
      description: 'Manage products and stock',
      link: '/inventory',
      color: 'from-secondary-500 to-quotla-orange'
    },
    {
      title: 'Client Portal',
      icon: '👥',
      description: 'Centralized client management',
      link: '/clients',
      color: 'from-quotla-dark to-quotla-green'
    },
    {
      title: 'Analytics Dashboard',
      icon: '📊',
      description: 'Business insights & reporting',
      link: '/analytics',
      color: 'from-quotla-orange to-quotla-green'
    },
    {
      title: 'Meeting Scheduler',
      icon: '📅',
      description: 'Book meetings with clients',
      link: '/settings/integrations',
      color: 'from-quotla-green to-secondary-600'
    },
  ]

  const businessBenefits = [
    {
      stat: '10+ hours',
      label: 'saved per week',
      description: 'Automate repetitive tasks and focus on growth'
    },
    {
      stat: '3x faster',
      label: 'quote generation',
      description: 'From inquiry to quote in under 2 minutes'
    },
    {
      stat: '99.5%',
      label: 'payment accuracy',
      description: 'Eliminate invoicing errors and disputes'
    },
    {
      stat: '40%',
      label: 'revenue increase',
      description: 'Faster quotes mean more closed deals'
    },
  ]

  const workflows = [
    {
      title: 'Streamlined Quote Process',
      steps: ['Client inquiry', 'AI generates quote', 'Review & customize', 'Send & close'],
      image: '/images/home/business-owner.jpg',
      bgColor: 'bg-gradient-to-br from-quotla-light via-white to-quotla-green/10'
    },
    {
      title: 'Automated Invoicing',
      steps: ['Convert quote', 'Auto-calculate totals', 'Track payments', 'Generate reports'],
      image: '/images/home/business-owner2.jpg',
      bgColor: 'bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-green'
    },
    {
      title: 'Client Management',
      steps: ['Store client data', 'Track history', 'Schedule meetings', 'Build relationships'],
      image: '/images/home/managing-multiple-cleints.jpg',
      bgColor: 'bg-gradient-to-br from-quotla-orange/90 via-secondary-500 to-quotla-dark'
    },
  ]

  return (
    <div className="min-h-screen bg-quotla-dark">
      <Navbar />

      {/* Hero Section - Asymmetric with bold typography */}
      <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-br from-quotla-light via-white to-quotla-green/20">
        {/* Animated background shapes */}
        <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-quotla-orange/10 rounded-full blur-[120px] animate-morph"></div>
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-quotla-green/15 rounded-full blur-[100px] animate-morph" style={{animationDelay: '5s'}}></div>

        <div className="relative w-full px-6 lg:px-20 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-[1800px] mx-auto">
            {/* Text side */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-block px-6 py-2 bg-quotla-dark/10 rounded-full border border-quotla-dark/20">
                <span className="font-heading text-sm font-bold text-quotla-dark tracking-widest">FOR BUSINESS OWNERS</span>
              </div>

              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-quotla-dark leading-[0.95]">
                Run your<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-quotla-orange via-secondary-500 to-quotla-green">business</span><br/>
                smarter
              </h1>

              <p className="text-2xl text-quotla-dark/70 leading-relaxed max-w-xl">
                Everything you need to manage quotes, invoices, clients, and inventory—all in one powerful platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/signup"
                  className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-quotla-orange to-secondary-600 text-white text-xl font-bold hover:shadow-2xl hover:shadow-quotla-orange/40 transition-all hover:scale-105 text-center"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#tools"
                  className="px-10 py-5 rounded-2xl border-3 border-quotla-dark text-quotla-dark text-xl font-bold hover:bg-quotla-dark hover:text-quotla-light transition-all text-center"
                >
                  Explore Tools
                </Link>
              </div>
            </div>

            {/* Image side with creative clipping */}
            <div className="relative h-[600px] animate-fade-in-delay">
              <div className="absolute -inset-6 bg-gradient-to-br from-quotla-orange/30 to-quotla-green/30 blur-3xl"></div>
              <div
                className="relative h-full overflow-hidden shadow-2xl"
                style={{clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'}}
              >
                <img
                  src="/images/home/business-owner.jpg"
                  alt="Business owner working"
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
              </div>
              {/* Floating stat badge */}
              <div className="absolute -bottom-6 -left-6 bg-quotla-dark text-quotla-light px-8 py-6 rounded-2xl shadow-2xl border-4 border-quotla-light animate-float">
                <div className="font-heading text-5xl font-bold mb-1 text-quotla-orange">$2.4M+</div>
                <div className="text-sm text-quotla-light/80">invoiced by our users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid - Varied heights */}
      <section className="relative py-32 bg-quotla-dark overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-center opacity-[0.02]" style={{backgroundSize: '120%'}}></div>

        <div className="relative w-full px-6 lg:px-20">
          <div className="text-center mb-20">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-light mb-6">
              Why business owners<br/>
              <span className="text-quotla-orange">choose Quotla</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
            {businessBenefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`group relative bg-quotla-light/5 backdrop-blur-sm rounded-3xl p-10 border-2 border-quotla-light/10 hover:border-quotla-orange transition-all duration-500 hover:scale-105 animate-diagonal-slide ${
                  idx % 2 === 0 ? 'lg:h-[320px]' : 'lg:h-[380px] lg:mt-8'
                }`}
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-quotla-orange/10 blur-xl group-hover:bg-quotla-orange/30 transition-all"></div>

                <div className="relative space-y-4">
                  <div className="font-heading text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-quotla-orange to-quotla-light">
                    {benefit.stat}
                  </div>
                  <div className="font-heading text-2xl font-bold text-quotla-light">
                    {benefit.label}
                  </div>
                  <p className="text-lg text-quotla-light/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Tools Grid - Quick access with stunning visuals */}
      <section id="tools" className="relative py-32 bg-gradient-to-b from-quotla-light via-quotla-green/10 to-quotla-dark overflow-hidden">
        <div className="relative w-full px-6 lg:px-20">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-quotla-orange/20 rounded-full mb-6 border border-quotla-orange/30">
              <span className="font-heading text-sm font-bold text-quotla-orange tracking-widest">YOUR TOOLKIT</span>
            </div>
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-dark mb-6">
              Everything in one place
            </h2>
            <p className="text-xl text-quotla-dark/70 max-w-2xl mx-auto">
              Quick access to all the tools you need to run your business efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
            {businessTools.map((tool, idx) => (
              <Link
                key={idx}
                href={tool.link}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-slide-up"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  height: idx === 0 || idx === 4 ? '420px' : idx === 2 ? '380px' : '350px'
                }}
              >
                {/* Gradient background that shows on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative h-full p-10 flex flex-col justify-between">
                  {/* Icon */}
                  <div className="text-8xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                    {tool.icon}
                  </div>

                  {/* Text content */}
                  <div className="space-y-3">
                    <h3 className="font-heading text-3xl font-bold text-quotla-dark group-hover:text-white transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-lg text-quotla-dark/70 group-hover:text-white/90 transition-colors">
                      {tool.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-2 text-quotla-orange group-hover:text-white font-bold mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Access tool</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Showcase - Tabbed interface with images */}
      <section className="relative py-32 bg-quotla-dark overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-quotla-green/10 rounded-full blur-[150px] animate-morph"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-quotla-orange/10 rounded-full blur-[130px] animate-morph" style={{animationDelay: '8s'}}></div>
        </div>

        <div className="relative w-full px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-quotla-light mb-6">
              Workflows designed<br/>
              <span className="text-quotla-orange">for efficiency</span>
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {workflows.map((workflow, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-8 py-4 rounded-2xl font-heading font-bold text-lg transition-all duration-500 ${
                  activeTab === idx
                    ? 'bg-gradient-to-r from-quotla-orange to-secondary-600 text-white scale-110 shadow-2xl shadow-quotla-orange/40'
                    : 'bg-quotla-light/5 text-quotla-light/70 hover:bg-quotla-light/10 hover:text-quotla-light'
                }`}
              >
                {workflow.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-[1400px] mx-auto">
            {workflows.map((workflow, idx) => (
              activeTab === idx && (
                <div
                  key={idx}
                  className={`${workflow.bgColor} rounded-[60px] overflow-hidden shadow-2xl animate-fadeIn`}
                >
                  <div className="grid lg:grid-cols-2 gap-0 items-center">
                    {/* Steps */}
                    <div className="p-16 space-y-8">
                      <h3 className={`font-heading text-4xl font-bold mb-12 ${idx === 1 ? 'text-quotla-light' : 'text-quotla-dark'}`}>
                        {workflow.title}
                      </h3>

                      {workflow.steps.map((step, stepIdx) => (
                        <div
                          key={stepIdx}
                          className="flex items-center gap-6 animate-slide-up"
                          style={{animationDelay: `${stepIdx * 0.15}s`}}
                        >
                          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-heading text-2xl font-bold ${
                            idx === 1
                              ? 'bg-quotla-light text-quotla-dark'
                              : idx === 2
                              ? 'bg-white text-quotla-orange'
                              : 'bg-quotla-orange text-white'
                          }`}>
                            {stepIdx + 1}
                          </div>
                          <p className={`text-2xl font-semibold ${
                            idx === 1 ? 'text-quotla-light' : idx === 2 ? 'text-white' : 'text-quotla-dark'
                          }`}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Image */}
                    <div className="h-full min-h-[500px] relative">
                      <img
                        src={workflow.image}
                        alt={workflow.title}
                        className="w-full h-full object-cover animate-reveal"
                      />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & unique */}
      <section className="relative py-40 overflow-hidden bg-gradient-to-br from-quotla-orange via-secondary-500 to-quotla-dark">
        <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-[0.08]" style={{backgroundSize: '120%'}}></div>

        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-quotla-light/10 rounded-full blur-[120px] animate-morph"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-quotla-dark/30 rounded-full blur-[100px] animate-morph" style={{animationDelay: '7s'}}></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="font-heading text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to transform<br/>
            <span className="text-quotla-dark">your business?</span>
          </h2>

          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join thousands of business owners who've automated their workflow with Quotla
          </p>

          <Link
            href="/signup"
            className="inline-block px-14 py-6 rounded-2xl bg-quotla-dark text-quotla-light text-2xl font-bold hover:scale-105 transition-all shadow-2xl hover:shadow-quotla-dark/60"
          >
            Start Your Free Trial
          </Link>

          <p className="text-white/70 mt-8 text-lg">
            No credit card required • Setup in 2 minutes • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

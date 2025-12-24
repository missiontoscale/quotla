'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary-700">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/images/patterns/grid/Quotla%20grid%20pattern%20light.svg')] bg-cover bg-center opacity-15"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary-50 mb-6 leading-tight">
            Professional Quotes in 2 Minutes or Less
          </h1>
          <p className="font-sans text-xl text-primary-300 max-w-2xl mx-auto leading-relaxed">
            Quotla helps you create professional quotes and invoices quickly using AI to generate clear, client-ready documents.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-50 mb-6">Your Time Matters</h2>
          <p className="text-lg text-primary-200 mb-4">
            Every minute you spend formatting quotes and invoices is a minute away from building your business, serving clients, or doing what you actually love. We built Quotla to give you those minutes back.
          </p>
          <p className="text-lg text-primary-200 mb-4">
            Quotla transforms how professionals create business documents. Describe what you need in plain language, like you're talking to a colleague, and our AI generates a polished, client-ready quote in seconds. No templates to fight with. No repetitive data entry. Just fast, professional results.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-50 mb-6">Built for How You Work</h2>
          <p className="text-lg text-primary-200 mb-4">
            Whether you're a freelancer juggling multiple projects, a small business scaling operations, or an agency managing dozens of clients, Quotla adapts to your workflow.
          </p>
          <p className="text-lg text-primary-200 mb-4">
            Our platform offers both AI-powered generation and traditional manual controls. Love automation? Let our AI handle the heavy lifting. Prefer hands-on control? Use our intuitive forms for complete customization. You choose how you want to work.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-50 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-primary-600 p-6 rounded-lg border border-primary-500">
              <h3 className="text-xl font-semibold text-primary-50 mb-3">AI-Powered Creation</h3>
              <p className="text-primary-200">
                Describe your quote or invoice in plain language, and our AI will generate a professional document with all the details properly formatted.
              </p>
            </div>
            <div className="bg-primary-600 p-6 rounded-lg border border-primary-500">
              <h3 className="text-xl font-semibold text-primary-50 mb-3">Lightning Fast</h3>
              <p className="text-primary-200">
                Create complete quotes in under 2 minutes. No more wasting time on repetitive data entry or formatting.
              </p>
            </div>
            <div className="bg-primary-600 p-6 rounded-lg border border-primary-500">
              <h3 className="text-xl font-semibold text-primary-50 mb-3">Multi-Currency Support</h3>
              <p className="text-primary-200">
                Work with clients globally. Support for USD, NGN, EUR, GBP, and more currencies out of the box.
              </p>
            </div>
            <div className="bg-primary-600 p-6 rounded-lg border border-primary-500">
              <h3 className="text-xl font-semibold text-primary-50 mb-3">Complete Control</h3>
              <p className="text-primary-200">
                Prefer manual creation? Use our traditional forms to create quotes and invoices with full customization options.
              </p>
            </div>
            <div className="bg-primary-600 p-6 rounded-lg border border-primary-500">
              <h3 className="text-xl font-semibold text-primary-50 mb-3">Client Management</h3>
              <p className="text-primary-200">
                Keep track of all your clients, their contact information, and transaction history in one place.
              </p>
            </div>
            <div className="bg-primary-600 p-6 rounded-lg border border-primary-500">
              <h3 className="text-xl font-semibold text-primary-50 mb-3">PDF Export</h3>
              <p className="text-primary-200">
                Generate professional PDF documents that you can download, print, or email directly to clients.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-50 mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-quotla-light flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-50 mb-2">Start a Conversation</h3>
                <p className="text-primary-200">
                  Open the AI assistant and describe what you need. Tell it about your business, your client, and the products or services you're quoting.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-quotla-light flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-50 mb-2">Review and Refine</h3>
                <p className="text-primary-200">
                  The AI generates a draft based on your description. Review the details, make any adjustments you need, and add your personal touch.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-quotla-light flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-50 mb-2">Send to Client</h3>
                <p className="text-primary-200">
                  Export your quote as a PDF and send it to your client. Track its status and follow up when needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-50 mb-6">Trusted by Professionals Worldwide</h2>
          <p className="text-lg text-primary-200 mb-6">
            From solo freelancers to growing agencies, Quotla helps professionals work smarter:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-quotla-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="text-primary-50 font-semibold">Freelancers & Consultants</span>
                <p className="text-primary-300 text-sm">Send professional quotes in minutes, not hours</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-quotla-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="text-primary-50 font-semibold">Small Businesses</span>
                <p className="text-primary-300 text-sm">Manage multiple clients and projects with organized billing</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-quotla-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="text-primary-50 font-semibold">Creative Agencies</span>
                <p className="text-primary-300 text-sm">Streamline client work from quote to payment</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-quotla-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="text-primary-50 font-semibold">Global Teams</span>
                <p className="text-primary-300 text-sm">Work seamlessly across currencies and time zones</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-gradient-to-br from-quotla-dark via-quotla-dark/95 to-quotla-dark relative overflow-hidden p-8 rounded-lg border border-quotla-orange/30">
          <div className="absolute inset-0 bg-[url('/images/patterns/spiral/Quotla%20Spiral%20orange.svg')] bg-center opacity-10" style={{backgroundSize: 'cover'}}></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-quotla-light mb-4 text-center">Ready to Get Started?</h2>
            <p className="text-lg text-primary-300 mb-6 text-center max-w-2xl mx-auto">
              Create your first professional quote in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 rounded-lg text-lg font-semibold bg-quotla-orange text-quotla-light hover:bg-secondary-600 transition-all shadow-lg shadow-quotla-orange/40 hover:shadow-quotla-orange/60 text-center">
                Start Free Trial
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-lg text-lg font-semibold bg-transparent text-quotla-light hover:bg-quotla-light/10 transition-all border-2 border-quotla-light/20 text-center">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

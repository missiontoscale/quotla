'use client'

import Link from 'next/link'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Quotla
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Professional Quotes in 2 Minutes or Less
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Quotla helps you create professional quotes and invoices quickly using AI to generate clear, client-ready documents.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
          <p className="text-lg text-gray-700 mb-4">
            Quotla is a platform that helps you create professional quotes and invoices in 2 minutes or less using AI to generate documents.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Our platform combines intelligent conversation-based document creation with traditional manual controls, giving you the flexibility to work however you prefer.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Built Quotla</h2>
          <p className="text-lg text-gray-700 mb-4">
            We understand that as a business owner, your time is valuable. Creating quotes and invoices traditionally takes too long and often requires switching between multiple tools.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Quotla was built to solve this problem. Our AI assistant understands natural conversation, so you can describe your quote requirements the same way you would explain them to a colleague. Within minutes, you have a professional document ready to send.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Creation</h3>
              <p className="text-gray-700">
                Describe your quote or invoice in plain language, and our AI will generate a professional document with all the details properly formatted.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-700">
                Create complete quotes in under 2 minutes. No more wasting time on repetitive data entry or formatting.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Currency Support</h3>
              <p className="text-gray-700">
                Work with clients globally. Support for USD, NGN, EUR, GBP, and more currencies out of the box.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete Control</h3>
              <p className="text-gray-700">
                Prefer manual creation? Use our traditional forms to create quotes and invoices with full customization options.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Client Management</h3>
              <p className="text-gray-700">
                Keep track of all your clients, their contact information, and transaction history in one place.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF Export</h3>
              <p className="text-gray-700">
                Generate professional PDF documents that you can download, print, or email directly to clients.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                <p className="text-gray-700">
                  Open the AI assistant and describe what you need. Tell it about your business, your client, and the products or services you're quoting.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review and Refine</h3>
                <p className="text-gray-700">
                  The AI generates a draft based on your description. Review the details, make any adjustments you need, and add your personal touch.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Send to Client</h3>
                <p className="text-gray-700">
                  Export your quote as a PDF and send it to your client. Track its status and follow up when needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Quotla</h2>
          <p className="text-lg text-gray-700 mb-6">
            Quotla serves businesses of all sizes across various industries:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Freelancers and consultants who need to send quotes quickly</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Small businesses managing multiple clients and projects</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Service providers who need to organize billing records</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">E-commerce businesses needing to generate custom quotes</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">International businesses working with multiple currencies</span>
            </li>
          </ul>
        </section>

        <section className="bg-primary-50 p-8 rounded-lg border border-primary-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Ready to Get Started?</h2>
          <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl mx-auto">
            Create your first professional quote in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-lg text-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors text-center">
              Start Free Trial
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-lg text-lg font-semibold bg-white text-primary-600 hover:bg-gray-50 transition-colors border-2 border-primary-600 text-center">
              Sign In
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

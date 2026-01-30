'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')

  return (
    <div className="min-h-screen bg-quotla-light">
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-quotla-dark via-[#1a2820] to-quotla-green">
        <div className="w-full px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-quotla-light mb-4">
              Legal
            </h1>
            <p className="text-xl text-quotla-light/70">
              Our commitment to transparency and your rights
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-0 z-10 bg-quotla-light border-b border-quotla-dark/10">
        <div className="w-full px-6 lg:px-20">
          <div className="max-w-4xl mx-auto flex gap-8">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-2 font-heading font-bold text-lg border-b-3 transition-all ${
                activeTab === 'privacy'
                  ? 'border-quotla-orange text-quotla-dark'
                  : 'border-transparent text-quotla-dark/50 hover:text-quotla-dark'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`py-4 px-2 font-heading font-bold text-lg border-b-3 transition-all ${
                activeTab === 'terms'
                  ? 'border-quotla-orange text-quotla-dark'
                  : 'border-transparent text-quotla-dark/50 hover:text-quotla-dark'
              }`}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="w-full px-6 lg:px-20">
          <div className="max-w-4xl mx-auto prose prose-lg prose-quotla">
            {activeTab === 'privacy' ? (
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-quotla-dark/50 mb-8">Last updated: January 2025</p>

                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">1. Information We Collect</h2>
                  <p className="text-quotla-dark/80 leading-relaxed mb-4">
                    When you use Quotla, we collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-quotla-dark/80">
                    <li>Account information (name, email, password)</li>
                    <li>Business information (company name, address, logo)</li>
                    <li>Quote and invoice data you create</li>
                    <li>Client information you add to the platform</li>
                    <li>Payment information (processed securely by Stripe)</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">2. How We Use Your Information</h2>
                  <p className="text-quotla-dark/80 leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-quotla-dark/80">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Develop new features and services</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">3. Data Security</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    We take reasonable measures to protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. Your data is encrypted in transit and at rest using industry-standard encryption protocols.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">4. Data Retention</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    We retain your information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time by contacting us.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">5. Your Rights</h2>
                  <p className="text-quotla-dark/80 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-quotla-dark/80">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Export your data in a portable format</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">6. Cookies</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes. You can control cookie settings through your browser.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">7. Contact Us</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    If you have questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@quotla.com" className="text-quotla-orange hover:underline">privacy@quotla.com</a>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <p className="text-sm text-quotla-dark/50 mb-8">Last updated: January 2025</p>

                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">1. Acceptance of Terms</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    By accessing or using Quotla, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">2. Description of Service</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    Quotla provides quote generation, invoice management, inventory tracking, and business management tools. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">3. User Accounts</h2>
                  <p className="text-quotla-dark/80 leading-relaxed mb-4">
                    You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-quotla-dark/80">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Ensuring your account information is accurate and up-to-date</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">4. Acceptable Use</h2>
                  <p className="text-quotla-dark/80 leading-relaxed mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-quotla-dark/80">
                    <li>Use the service for any illegal purpose</li>
                    <li>Upload malicious code or attempt to compromise our systems</li>
                    <li>Impersonate another person or entity</li>
                    <li>Interfere with other users' use of the service</li>
                    <li>Resell or redistribute the service without authorization</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">5. Payment Terms</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    Paid subscriptions are billed in advance on a monthly or annual basis. Refunds are handled on a case-by-case basis. You can cancel your subscription at any time, and you will retain access until the end of your billing period.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">6. Intellectual Property</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    Quotla and its original content, features, and functionality are owned by Quotla and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of any content you create using our service.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">7. Limitation of Liability</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    Quotla shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">8. Changes to Terms</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    We may update these terms from time to time. We will notify you of any material changes by posting the new terms on this page and updating the "Last updated" date.
                  </p>
                </div>

                <div>
                  <h2 className="font-heading text-2xl font-bold text-quotla-dark mb-4">9. Contact</h2>
                  <p className="text-quotla-dark/80 leading-relaxed">
                    For questions about these Terms of Service, please contact us at <a href="mailto:legal@quotla.com" className="text-quotla-orange hover:underline">legal@quotla.com</a>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

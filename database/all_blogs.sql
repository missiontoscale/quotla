-- Sample Blog Posts for Testing
-- Run this AFTER you've created your first admin user

-- Sample Post 1: Getting Started with Quotla
INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
VALUES (
  'Getting Started with Quotla',
  'getting-started-with-quotla',
  'Learn how to set up your business profile and create your first professional quote in minutes.',
  '<h2>Welcome to Quotla!</h2>
<p>Quotla is your all-in-one solution for creating professional quotes and invoices. This guide will walk you through the essential steps to get started.</p>

<h3>Step 1: Set Up Your Business Profile</h3>
<p>Navigate to <strong>Settings</strong> from the dashboard menu. Here you can:</p>
<ul>
  <li>Upload your company logo</li>
  <li>Add your business information</li>
  <li>Set your default currency</li>
  <li>Configure tax settings</li>
</ul>

<h3>Step 2: Add Your First Client</h3>
<p>Go to <strong>Clients</strong> and click "Add Client". Fill in your client''s contact information including:</p>
<ul>
  <li>Name and company details</li>
  <li>Email and phone number</li>
  <li>Billing address</li>
</ul>

<h3>Step 3: Create Your First Quote</h3>
<p>Click on <strong>Quotes</strong> and then "Create Quote". Add line items, use AI to generate professional descriptions, and send it to your client!</p>

<p>That''s it! You''re ready to start managing your business documents professionally.</p>',
  TRUE,
  NOW()
);

-- Sample Post 2: AI-Powered Descriptions
INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
VALUES (
  'How to Use AI-Powered Description Generation',
  'ai-powered-description-generation',
  'Discover how Quotla''s AI feature can help you write professional service descriptions in seconds.',
  '<h2>AI-Powered Descriptions</h2>
<p>One of Quotla''s most powerful features is AI-powered content generation. Let''s explore how to use it effectively.</p>

<h3>What is AI Description Generation?</h3>
<p>When creating quotes or invoices, you can use AI to automatically generate professional descriptions for your services. Simply describe what you''re offering in plain language, and AI transforms it into polished, client-ready text.</p>

<h3>How to Use It</h3>
<ol>
  <li>When adding a line item to a quote or invoice, click the <strong>"Generate with AI"</strong> button</li>
  <li>Describe your service in simple terms (e.g., "Website design with 5 pages and contact form")</li>
  <li>Click "Generate" and watch AI create a professional description</li>
  <li>Review and edit if needed, then add to your document</li>
</ol>

<h3>Tips for Best Results</h3>
<ul>
  <li>Be specific about what you''re offering</li>
  <li>Include key features or deliverables</li>
  <li>Mention any special requirements</li>
  <li>You can always edit the AI-generated text</li>
</ul>

<p>AI description generation saves time while ensuring your quotes look professional and detailed.</p>',
  TRUE,
  NOW()
);

-- Sample Post 3: Best Practices
INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
VALUES (
  '5 Best Practices for Professional Quotes',
  'best-practices-professional-quotes',
  'Follow these tips to create quotes that win more clients and get approved faster.',
  '<h2>5 Best Practices for Professional Quotes</h2>
<p>Creating winning quotes is an art. Here are five best practices to improve your quote acceptance rate.</p>

<h3>1. Be Clear and Detailed</h3>
<p>Ambiguity is the enemy of approval. Clearly describe each service or product, including:</p>
<ul>
  <li>What''s included</li>
  <li>Timeline or delivery schedule</li>
  <li>Any limitations or exclusions</li>
</ul>

<h3>2. Professional Presentation Matters</h3>
<p>Use your company logo, maintain consistent formatting, and ensure there are no typos. Quotla makes this easy with professional templates.</p>

<h3>3. Set Clear Validity Dates</h3>
<p>Always include a validity period for your quote. This creates urgency and protects you from price changes.</p>

<h3>4. Include Payment Terms</h3>
<p>Specify when and how you expect to be paid. Common terms include:</p>
<ul>
  <li>50% upfront, 50% on completion</li>
  <li>Net 30 days</li>
  <li>Upon project milestones</li>
</ul>

<h3>5. Follow Up Promptly</h3>
<p>After sending a quote, follow up within 2-3 business days. Use Quotla''s dashboard to track which quotes are pending and need attention.</p>

<p>Implementing these practices will help you create quotes that clients trust and approve quickly.</p>',
  TRUE,
  NOW()
);

-- Sample Draft Post (unpublished)
INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
VALUES (
  'Understanding Multi-Currency Support',
  'understanding-multi-currency-support',
  'A comprehensive guide to working with international clients using Quotla''s multi-currency features.',
  '<h2>Multi-Currency Support</h2>
<p>This is a draft post about multi-currency support. Content coming soon...</p>',
  FALSE,
  NULL
);


-- ================================================================
-- BLOG POSTS - Nigeria's 2026 Tax Reforms
-- ================================================================
-- This file inserts 3 comprehensive blog posts about the tax reforms
--
-- BEFORE RUNNING: Make sure you've run supabase-blog-schema-updates.sql first!
-- ================================================================

-- First, let's get the author ID dynamically
-- Replace 'your-email@example.com' with your actual admin email
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the first admin user's ID (or specify by email)
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'chibuzordev@gmail.com'  -- CHANGE THIS TO YOUR EMAIL
  LIMIT 1;

  -- If no user found with that email, get the first admin
  IF admin_user_id IS NULL THEN
    SELECT profiles.id INTO admin_user_id
    FROM profiles
    WHERE profiles.is_admin = true
    LIMIT 1;
  END IF;

  -- If still no admin found, raise an error
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Please set is_admin=true for at least one user first.';
  END IF;

  -- Now insert the blog posts with the correct author_id

-- Blog Post 1: Understanding Nigeria's 2026 Tax Reforms - A Complete Overview
INSERT INTO blog_posts (title, slug, excerpt, content, author_id, published, published_at, created_at, meta_description, category, tags, reading_time_minutes, featured)
VALUES (
  'Understanding Nigeria''s 2026 Tax Reforms: A Complete Overview',
  'understanding-nigerias-2026-tax-reforms-complete-overview',
  'Nigeria is set to undergo one of the most significant fiscal transformations in its history. Learn everything you need to know about the 2026 tax reforms and how they will impact you.',
  '<article class="prose prose-lg max-w-none">
    <p class="lead">Nigeria is poised for a major fiscal transformation with comprehensive tax reforms taking effect on <strong>January 1, 2026</strong>. These changes represent the most ambitious redesign of Nigeria''s tax system in decades, moving from a complex, burdensome framework to a simplified, progressive system designed to promote economic growth and fairness.</p>

    <h2>Why These Reforms Matter</h2>
    <p>For years, Nigeria''s tax system has been plagued by complexity, inefficiency, and low compliance. With over 60 different taxes and levies across federal, state, and local levels, the system has been confusing for individuals and businesses alike. The new reforms aim to fix these fundamental issues.</p>

    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
      <h3 class="text-blue-900 font-bold mb-2">Key Goals of the Reforms</h3>
      <ul class="text-blue-800 mb-0">
        <li>Simplify the tax system by consolidating over 50 overlapping taxes</li>
        <li>Increase the tax-to-GDP ratio from less than 10% to approximately 18%</li>
        <li>Expand the tax base from under 10 million to 40 million active taxpayers</li>
        <li>Modernize collection through technology and data integration</li>
        <li>Build public trust through transparency and better service delivery</li>
      </ul>
    </div>

    <h2>The New Legislative Framework</h2>
    <p>The reforms are built on four cornerstone acts that will fundamentally reshape Nigeria''s fiscal architecture:</p>

    <ol>
      <li><strong>The Nigerian Tax Act of 2025</strong> - Consolidates numerous outdated laws and eliminates over 50 duplicative taxes</li>
      <li><strong>The Nigeria Tax Administration Act</strong> - Unifies collection rules across all government levels</li>
      <li><strong>The Nigeria Revenue Service Act</strong> - Establishes an independent Nigerian Revenue Service (NRS) to replace FIRS</li>
      <li><strong>The Joint Revenue Board Act</strong> - Creates a neutral dispute resolution body and tax appeal tribunal</li>
    </ol>

    <h2>What Changes for Individuals</h2>
    <p>The new progressive Personal Income Tax structure means most Nigerians will pay less tax:</p>

    <table class="min-w-full divide-y divide-gray-200 my-6">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Income (₦)</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr><td class="px-6 py-4">₦0 – ₦800,000</td><td class="px-6 py-4 font-bold text-green-600">0%</td></tr>
        <tr><td class="px-6 py-4">₦800,001 – ₦3,000,000</td><td class="px-6 py-4">15%</td></tr>
        <tr><td class="px-6 py-4">₦3,000,001 – ₦12,000,000</td><td class="px-6 py-4">18%</td></tr>
        <tr><td class="px-6 py-4">₦12,000,001 – ₦25,000,000</td><td class="px-6 py-4">21%</td></tr>
        <tr><td class="px-6 py-4">₦25,000,001 – ₦50,000,000</td><td class="px-6 py-4">23%</td></tr>
        <tr><td class="px-6 py-4">Above ₦50,000,000</td><td class="px-6 py-4">25%</td></tr>
      </tbody>
    </table>

    <p><strong>New Exemptions and Reliefs:</strong></p>
    <ul>
      <li>Anyone earning ₦800,000 or less annually pays NO income tax</li>
      <li>Rent relief of 20% of annual rent (capped at ₦500,000)</li>
      <li>Military personnel salaries are tax-exempt</li>
      <li>All pensions and retirement benefits are tax-exempt</li>
    </ul>

    <h2>VAT Reforms to Reduce Cost of Living</h2>
    <p>One of the most impactful changes is the shift of essential goods and services from "exempt" to "zero-rated" status. This change allows producers to reclaim input VAT, reducing production costs and ultimately consumer prices.</p>

    <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8">
      <h3 class="text-green-900 font-bold mb-2">Five Key Categories Now Zero-Rated</h3>
      <ul class="text-green-800 mb-0 text-lg font-medium">
        <li>Food</li>
        <li>Rent</li>
        <li>Transportation</li>
        <li>Education</li>
        <li>Health</li>
      </ul>
    </div>

    <p>Additionally, food vendors (''mama put'') with annual turnover below ₦100 million are exempt from charging VAT, supporting the informal sector.</p>

    <h2>Business and Corporate Changes</h2>
    <p>The reforms introduce significant incentives for businesses:</p>

    <ul>
      <li><strong>Small company exemption:</strong> Companies with turnover under ₦50-100 million and assets under ₦250 million are exempt from corporate income tax</li>
      <li><strong>VAT refunds:</strong> All businesses, including service providers, can now receive refunds for input VAT on assets and overheads</li>
      <li><strong>Agricultural tax holiday:</strong> New agricultural companies get a 5-year tax holiday</li>
      <li><strong>Digital assets:</strong> Cryptocurrency gains are now taxed at progressive income rates (0-25%), with loss offsetting allowed</li>
    </ul>

    <h2>Modernized Enforcement</h2>
    <p>The new system leverages technology for transparency and efficiency:</p>

    <ul>
      <li><strong>Data integration:</strong> NIN, BVN, bank accounts, and other databases linked for comprehensive taxpayer profiles</li>
      <li><strong>E-invoicing:</strong> Automatic government notification when businesses issue invoices</li>
      <li><strong>Automated collection:</strong> Direct bank account debits for owed taxes (after due process)</li>
      <li><strong>Expanded tax net:</strong> Goal to increase active taxpayers from 10 million to 40 million within 2-3 years</li>
    </ul>

    <h2>What This Means for You</h2>
    <p>The reforms are designed to benefit approximately 98% of Nigerians:</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-bold mb-3 text-primary-600">✓ For Individuals</h3>
        <ul class="space-y-2 text-sm">
          <li>• Lower tax burden for most earners</li>
          <li>• More take-home pay</li>
          <li>• Lower prices on essentials</li>
          <li>• Clearer tax obligations</li>
        </ul>
      </div>
      <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-bold mb-3 text-primary-600">✓ For Businesses</h3>
        <ul class="space-y-2 text-sm">
          <li>• Reduced compliance complexity</li>
          <li>• Lower operational costs</li>
          <li>• Better cash flow through VAT refunds</li>
          <li>• Exemptions for small companies</li>
        </ul>
      </div>
    </div>

    <h2>Next Steps</h2>
    <p>As we approach January 1, 2026, it''s crucial to:</p>

    <ol>
      <li>Understand how the new tax brackets affect your personal income</li>
      <li>Evaluate whether your business qualifies for small company exemption</li>
      <li>Ensure you have your NIN and BVN properly linked</li>
      <li>Keep accurate records for rent relief claims</li>
      <li>Stay informed about implementation details from the new Nigerian Revenue Service</li>
    </ol>

    <p class="text-lg font-medium mt-8 p-6 bg-gray-50 border-l-4 border-primary-600">The 2026 tax reforms represent a once-in-a-generation opportunity to build a fairer, more efficient fiscal system. While challenges remain in implementation, the framework is designed to create a more prosperous economic environment for all Nigerians.</p>

    <div class="mt-12 p-6 bg-blue-50 rounded-lg">
      <p class="text-sm text-gray-700 mb-0"><strong>Need help understanding how these changes affect your business?</strong> Quotla can help you navigate the new tax landscape. Our AI-powered platform helps you create accurate quotes and invoices that comply with the new 2026 tax regulations. <a href="/signup" class="text-primary-600 font-medium hover:underline">Get started free today</a>.</p>
    </div>
  </article>',
  admin_user_id,
  true,
  NOW(),
  NOW(),
  'Complete guide to Nigeria''s 2026 tax reforms including new tax brackets, VAT changes, business exemptions, and what they mean for you.',
  'Tax & Finance',
  ARRAY['Nigeria', 'Tax Reform', '2026', 'VAT', 'Personal Income Tax', 'Business Tax', 'Finance'],
  15,
  true
);

-- Blog Post 2: How Nigeria's 2026 Tax Laws Affect Small Businesses
INSERT INTO blog_posts (title, slug, excerpt, content, author_id, published, published_at, created_at, meta_description, category, tags, reading_time_minutes)
VALUES (
  'How Nigeria''s 2026 Tax Laws Affect Small Businesses and Entrepreneurs',
  'how-nigerias-2026-tax-laws-affect-small-businesses-entrepreneurs',
  'Small business owners and entrepreneurs will see major benefits from the 2026 tax reforms. Here''s everything you need to know about exemptions, VAT changes, and how to maximize your savings.',
  '<article class="prose prose-lg max-w-none">
    <p class="lead">If you own or run a small business in Nigeria, the tax reforms taking effect on <strong>January 1, 2026</strong> will fundamentally change your financial landscape. The good news? Most of these changes are designed to help you grow your business, reduce costs, and simplify compliance.</p>

    <h2>The Game-Changer: Small Company Tax Exemption</h2>
    <p>Perhaps the most significant change for small businesses is the complete exemption from Corporate Income Tax (CIT) for qualifying small companies.</p>

    <div class="bg-green-50 border-l-4 border-green-500 p-6 my-8">
      <h3 class="text-green-900 font-bold mb-3">Your Business May Qualify for 0% Corporate Tax</h3>
      <p class="text-green-800 mb-2">To qualify for the small company exemption, your business must meet BOTH criteria:</p>
      <ul class="text-green-800 mb-0">
        <li><strong>Annual turnover:</strong> Less than ₦50-100 million (sources vary, final threshold to be confirmed)</li>
        <li><strong>Asset base:</strong> Not exceeding ₦250 million</li>
      </ul>
    </div>

    <h3>Why This Matters: Enterprise vs. Limited Company</h3>
    <p>This exemption creates a powerful incentive for entrepreneurs currently operating as sole proprietors or using business names to upgrade to a limited liability company structure.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <h4 class="text-red-900 font-bold mb-3">❌ Operating as Enterprise/Business Name</h4>
        <p class="text-sm text-red-800 mb-2">All business profits are treated as your personal income</p>
        <ul class="text-sm text-red-800 space-y-1">
          <li>• Taxed at progressive PIT rates (0-25%)</li>
          <li>• No separation between business and personal tax</li>
          <li>• Higher tax burden on successful businesses</li>
        </ul>
      </div>
      <div class="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <h4 class="text-green-900 font-bold mb-3">✓ Operating as Limited Liability Company</h4>
        <p class="text-sm text-green-800 mb-2">Business is a separate legal entity</p>
        <ul class="text-sm text-green-800 space-y-1">
          <li>• May qualify for 0% CIT if criteria met</li>
          <li>• Clear separation of business/personal finances</li>
          <li>• Significantly lower tax liability</li>
        </ul>
      </div>
    </div>

    <h2>VAT Changes That Put Money Back in Your Pocket</h2>
    <p>The shift from "exempt" to "zero-rated" status for essential goods and services is a game-changer for cash flow.</p>

    <h3>Understanding the Difference</h3>
    <p><strong>Under the OLD system (Exempt):</strong></p>
    <ul>
      <li>You paid VAT on business inputs (equipment, supplies, fuel, etc.)</li>
      <li>You could NOT reclaim that VAT</li>
      <li>Input VAT became part of your costs</li>
      <li>You passed these costs to customers through higher prices</li>
    </ul>

    <p><strong>Under the NEW system (Zero-Rated):</strong></p>
    <ul>
      <li>You still pay VAT on business inputs</li>
      <li>You CAN now reclaim 100% of input VAT</li>
      <li>Your production costs decrease significantly</li>
      <li>You can offer more competitive prices</li>
    </ul>

    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
      <h3 class="text-blue-900 font-bold mb-2">Five Sectors Benefiting from Zero-Rating</h3>
      <ul class="text-blue-800 mb-0 space-y-1">
        <li><strong>Food businesses:</strong> Restaurants, food vendors, caterers, food processors</li>
        <li><strong>Rental/Property:</strong> Landlords, property managers, real estate businesses</li>
        <li><strong>Transportation:</strong> Logistics companies, taxi services, delivery businesses</li>
        <li><strong>Education:</strong> Schools, training centers, tutoring services, EdTech</li>
        <li><strong>Healthcare:</strong> Clinics, pharmacies, medical equipment suppliers, telemedicine</li>
      </ul>
    </div>

    <h3>Special Relief for Food Vendors</h3>
    <p>If you operate a small food business (commonly known as "mama put" or small-scale food vendor) with annual turnover below ₦100 million, you are completely exempt from charging VAT to your customers. This makes your pricing more competitive while simplifying your tax obligations.</p>

    <h2>All Businesses Can Now Claim VAT Refunds</h2>
    <p>In a major policy shift, <strong>ALL businesses</strong>—including service providers who were previously excluded—can now receive refunds for input VAT paid on:</p>

    <ul>
      <li>Business assets (computers, equipment, vehicles, etc.)</li>
      <li>Operational overheads (office supplies, utilities, software subscriptions)</li>
      <li>Professional services (legal, accounting, consulting)</li>
    </ul>

    <p>This change significantly improves business cash flow and reduces the cost of doing business across all sectors.</p>

    <h2>Agricultural Sector Incentives</h2>
    <p>If you''re starting a new agricultural business, you''re eligible for a <strong>5-year tax holiday</strong>. This applies to:</p>

    <ul>
      <li>Crop production and farming</li>
      <li>Livestock rearing</li>
      <li>Agricultural processing</li>
      <li>Related agricultural activities</li>
    </ul>

    <p>This incentive is designed to boost food security and encourage investment in Nigeria''s agricultural sector.</p>

    <h2>Digital Economy and Cryptocurrency</h2>
    <p>For businesses involved in the digital economy, the reforms bring clarity to previously ambiguous areas:</p>

    <ul>
      <li><strong>Capital gains on digital assets:</strong> Profits from selling cryptocurrencies and NFTs are now taxed at progressive income rates (0-25%)</li>
      <li><strong>Loss offsetting allowed:</strong> You can offset gains with losses from crypto transactions within the same assessment period</li>
      <li><strong>Clearer compliance:</strong> No more uncertainty about how to report digital asset transactions</li>
    </ul>

    <h2>Modernized Compliance: What to Expect</h2>
    <p>The new enforcement system is designed to be more transparent and technology-driven:</p>

    <h3>E-Invoicing and Fiscalization</h3>
    <p>When your business issues an invoice for goods or services, a copy will be automatically sent to the government. While this may sound intrusive, it actually:</p>

    <ul>
      <li>Creates a level playing field by reducing under-reporting</li>
      <li>Simplifies tax filing with pre-populated data</li>
      <li>Reduces audits for compliant businesses</li>
      <li>Enables faster VAT refund processing</li>
    </ul>

    <h3>Data Integration</h3>
    <p>Your business records will be linked across various national databases (NIN, BVN, bank accounts). Ensure you:</p>

    <ul>
      <li>Have accurate business registration details</li>
      <li>Link your business bank accounts properly</li>
      <li>Maintain consistent information across all platforms</li>
      <li>Keep thorough records of all transactions</li>
    </ul>

    <h2>Practical Action Steps for Your Business</h2>

    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8">
      <h3 class="text-yellow-900 font-bold mb-3">Before January 1, 2026:</h3>
      <ol class="text-yellow-800 mb-0 space-y-2">
        <li><strong>Evaluate your structure:</strong> If operating as an enterprise/business name, calculate whether incorporating as a limited company would save you money</li>
        <li><strong>Calculate your eligibility:</strong> Determine if you qualify for small company tax exemption</li>
        <li><strong>Update your systems:</strong> Ensure your invoicing and accounting systems can handle e-invoicing requirements</li>
        <li><strong>Verify your data:</strong> Confirm your NIN, BVN, and business registration details are accurate and linked</li>
        <li><strong>Understand VAT refunds:</strong> Implement processes to track and claim input VAT on all eligible expenses</li>
        <li><strong>Train your team:</strong> Educate your accounting staff on the new requirements</li>
        <li><strong>Consult professionals:</strong> Work with tax advisors to optimize your tax position under the new rules</li>
      </ol>
    </div>

    <h2>Common Concerns Addressed</h2>

    <h3>"Will the government actually process VAT refunds?"</h3>
    <p>The new system includes automated VAT refund processing tied to the e-invoicing system. With better data integration and transparency, refund processing should be significantly faster than under the old manual system.</p>

    <h3>"What if I don''t qualify for small company exemption?"</h3>
    <p>Even if your company is too large for the exemption, you''ll still benefit from VAT refunds, simplified compliance, and reduced number of taxes to manage. The overall burden will still be lower than the current system.</p>

    <h3>"Should I reduce my turnover to stay under the exemption threshold?"</h3>
    <p>No. Artificial limitation of business growth is never a good strategy. If your business naturally exceeds the threshold, the additional revenue will more than compensate for the tax liability.</p>

    <h2>The Bottom Line for Small Businesses</h2>

    <p class="text-lg font-medium mt-8 p-6 bg-gray-50 border-l-4 border-primary-600">The 2026 tax reforms represent the most business-friendly fiscal policy Nigeria has introduced in decades. For small businesses, the combination of tax exemptions, VAT refunds, and simplified compliance creates unprecedented opportunities for growth and profitability.</p>

    <p>The key to maximizing these benefits is preparation. Start now to ensure your business is structured optimally and your systems are ready for the new requirements.</p>

    <div class="mt-12 p-6 bg-blue-50 rounded-lg">
      <p class="text-sm text-gray-700 mb-0"><strong>Running a small business in Nigeria?</strong> Quotla helps you create professional quotes and invoices that automatically account for the new 2026 tax regulations. Track your VAT, manage multiple currencies, and stay compliant effortlessly. <a href="/signup" class="text-primary-600 font-medium hover:underline">Get started today</a>.</p>
    </div>
  </article>',
  admin_user_id,
  true,
  NOW(),
  NOW(),
  'Comprehensive guide on how Nigeria''s 2026 tax reforms affect small businesses including tax exemptions, VAT refunds, and compliance requirements.',
  'Business & Entrepreneurship',
  ARRAY['Small Business', 'Tax Reform', '2026', 'VAT', 'Corporate Tax', 'Nigeria', 'Entrepreneurship'],
  12
);

-- Blog Post 3: Personal Income Tax Changes
INSERT INTO blog_posts (title, slug, excerpt, content, author_id, published, published_at, created_at, meta_description, category, tags, reading_time_minutes)
VALUES (
  'Personal Income Tax Changes Under Nigeria''s 2026 Reforms: What You Need to Know',
  'personal-income-tax-changes-nigeria-2026-reforms-what-you-need-to-know',
  'The new progressive tax system starting January 1, 2026 will put more money in most Nigerians'' pockets. Here''s a detailed breakdown of the new tax brackets, exemptions, and how to calculate your take-home pay.',
  '<article class="prose prose-lg max-w-none">
    <p class="lead">Starting <strong>January 1, 2026</strong>, Nigeria''s Personal Income Tax (PIT) system will undergo a fundamental transformation designed around one core principle: <em>"those who earn more pay more."</em> For most Nigerians, this means more money in your pocket every month.</p>

    <h2>The New Tax Brackets Explained</h2>
    <p>The current fragmented tax system is being replaced with a clear, progressive structure that''s easy to understand:</p>

    <div class="overflow-x-auto my-8">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-primary-600 text-white">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-bold uppercase">Annual Income Range</th>
            <th class="px-6 py-4 text-left text-sm font-bold uppercase">Tax Rate</th>
            <th class="px-6 py-4 text-left text-sm font-bold uppercase">Monthly Income (approx)</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr class="bg-green-50">
            <td class="px-6 py-4 font-medium">₦0 – ₦800,000</td>
            <td class="px-6 py-4 text-green-600 font-bold text-lg">0%</td>
            <td class="px-6 py-4 text-gray-600">₦0 – ₦66,667</td>
          </tr>
          <tr>
            <td class="px-6 py-4 font-medium">₦800,001 – ₦3,000,000</td>
            <td class="px-6 py-4">15%</td>
            <td class="px-6 py-4 text-gray-600">₦66,668 – ₦250,000</td>
          </tr>
          <tr>
            <td class="px-6 py-4 font-medium">₦3,000,001 – ₦12,000,000</td>
            <td class="px-6 py-4">18%</td>
            <td class="px-6 py-4 text-gray-600">₦250,001 – ₦1,000,000</td>
          </tr>
          <tr>
            <td class="px-6 py-4 font-medium">₦12,000,001 – ₦25,000,000</td>
            <td class="px-6 py-4">21%</td>
            <td class="px-6 py-4 text-gray-600">₦1,000,001 – ₦2,083,333</td>
          </tr>
          <tr>
            <td class="px-6 py-4 font-medium">₦25,000,001 – ₦50,000,000</td>
            <td class="px-6 py-4">23%</td>
            <td class="px-6 py-4 text-gray-600">₦2,083,334 – ₦4,166,667</td>
          </tr>
          <tr>
            <td class="px-6 py-4 font-medium">Above ₦50,000,000</td>
            <td class="px-6 py-4">25%</td>
            <td class="px-6 py-4 text-gray-600">Above ₦4,166,667</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
      <h3 class="text-blue-900 font-bold mb-2">Important: How Progressive Tax Works</h3>
      <p class="text-blue-800 mb-0">You don''t pay your highest rate on all your income. Each portion of your income is taxed at its corresponding rate. For example, if you earn ₦5 million annually:</p>
      <ul class="text-blue-800 mt-2 mb-0">
        <li>First ₦800,000 → 0% tax = ₦0</li>
        <li>Next ₦2,200,000 (800k to 3M) → 15% = ₦330,000</li>
        <li>Remaining ₦2,000,000 (3M to 5M) → 18% = ₦360,000</li>
        <li><strong>Total tax: ₦690,000 (effective rate: 13.8%)</strong></li>
      </ul>
    </div>

    <h2>Who Pays Zero Tax?</h2>
    <p>The reforms introduce a <strong>complete tax exemption</strong> for low-income earners:</p>

    <ul>
      <li>Anyone earning the <strong>national minimum wage</strong></li>
      <li>Anyone with total annual taxable income of <strong>₦800,000 or less</strong></li>
    </ul>

    <p>This means if your monthly income is ₦66,667 or less, you pay absolutely nothing in personal income tax. This provides crucial relief to Nigeria''s most vulnerable workers.</p>

    <h2>New Exemptions and Reliefs</h2>

    <h3>1. Rent Relief (20% of Annual Rent, Capped at ₦500,000)</h3>
    <p>This is a new and significant benefit for anyone who pays rent:</p>

    <div class="bg-gray-50 p-6 rounded-lg my-6">
      <h4 class="font-bold mb-3">How Rent Relief Works:</h4>
      <p class="mb-2"><strong>Example 1:</strong> You pay ₦1,200,000 annual rent</p>
      <ul class="text-sm space-y-1 mb-4">
        <li>• 20% of ₦1,200,000 = ₦240,000</li>
        <li>• This ₦240,000 reduces your taxable income</li>
        <li>• Your actual tax savings depend on your tax bracket</li>
      </ul>

      <p class="mb-2"><strong>Example 2:</strong> You pay ₦3,000,000 annual rent</p>
      <ul class="text-sm space-y-1">
        <li>• 20% of ₦3,000,000 = ₦600,000</li>
        <li>• But relief is capped at ₦500,000</li>
        <li>• You can only claim ₦500,000 reduction in taxable income</li>
      </ul>
    </div>

    <p><strong>Requirements to claim:</strong></p>
    <ul>
      <li>You must declare your actual rent payments to the tax authority</li>
      <li>Provide supporting details (likely tenancy agreement or receipts)</li>
      <li>Keep records for at least 5 years</li>
    </ul>

    <h3>2. Military Personnel</h3>
    <p>All salaries paid to military officers are now completely tax-exempt in recognition of their service to the nation.</p>

    <h3>3. Pensioners</h3>
    <p>All approved pensions and retirement benefits are fully exempt from taxation, ensuring retirees keep more of their hard-earned income.</p>

    <h2>Real-World Examples: How Much Will You Save?</h2>

    <div class="space-y-6 my-8">
      <div class="border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-primary-600 font-bold mb-3">Scenario 1: Entry-Level Professional</h3>
        <p class="text-sm mb-2"><strong>Annual Salary:</strong> ₦1,800,000 (₦150,000/month)</p>
        <p class="text-sm mb-2"><strong>Annual Rent:</strong> ₦600,000</p>

        <p class="text-sm font-medium mt-4 mb-2">Tax Calculation:</p>
        <ul class="text-sm space-y-1 mb-3">
          <li>• Gross income: ₦1,800,000</li>
          <li>• Rent relief (20% of 600k): -₦120,000</li>
          <li>• Taxable income: ₦1,680,000</li>
        </ul>

        <p class="text-sm font-medium mb-2">Tax breakdown:</p>
        <ul class="text-sm space-y-1 mb-3">
          <li>• First ₦800,000 at 0% = ₦0</li>
          <li>• Remaining ₦880,000 at 15% = ₦132,000</li>
        </ul>

        <p class="bg-green-50 text-green-800 p-3 rounded font-bold">Annual Tax: ₦132,000 (₦11,000/month)</p>
        <p class="text-sm text-gray-600 mt-2">Effective tax rate: 7.3% of gross income</p>
      </div>

      <div class="border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-primary-600 font-bold mb-3">Scenario 2: Mid-Career Professional</h3>
        <p class="text-sm mb-2"><strong>Annual Salary:</strong> ₦6,000,000 (₦500,000/month)</p>
        <p class="text-sm mb-2"><strong>Annual Rent:</strong> ₦1,800,000</p>

        <p class="text-sm font-medium mt-4 mb-2">Tax Calculation:</p>
        <ul class="text-sm space-y-1 mb-3">
          <li>• Gross income: ₦6,000,000</li>
          <li>• Rent relief (20% of 1.8M): -₦360,000</li>
          <li>• Taxable income: ₦5,640,000</li>
        </ul>

        <p class="text-sm font-medium mb-2">Tax breakdown:</p>
        <ul class="text-sm space-y-1 mb-3">
          <li>• First ₦800,000 at 0% = ₦0</li>
          <li>• Next ₦2,200,000 at 15% = ₦330,000</li>
          <li>• Remaining ₦2,640,000 at 18% = ₦475,200</li>
        </ul>

        <p class="bg-green-50 text-green-800 p-3 rounded font-bold">Annual Tax: ₦805,200 (₦67,100/month)</p>
        <p class="text-sm text-gray-600 mt-2">Effective tax rate: 13.4% of gross income</p>
      </div>

      <div class="border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-primary-600 font-bold mb-3">Scenario 3: Senior Executive</h3>
        <p class="text-sm mb-2"><strong>Annual Salary:</strong> ₦30,000,000 (₦2,500,000/month)</p>
        <p class="text-sm mb-2"><strong>Annual Rent:</strong> ₦4,000,000</p>

        <p class="text-sm font-medium mt-4 mb-2">Tax Calculation:</p>
        <ul class="text-sm space-y-1 mb-3">
          <li>• Gross income: ₦30,000,000</li>
          <li>• Rent relief (capped): -₦500,000</li>
          <li>• Taxable income: ₦29,500,000</li>
        </ul>

        <p class="text-sm font-medium mb-2">Tax breakdown:</p>
        <ul class="text-sm space-y-1 mb-3">
          <li>• First ₦800,000 at 0% = ₦0</li>
          <li>• Next ₦2,200,000 at 15% = ₦330,000</li>
          <li>• Next ₦9,000,000 at 18% = ₦1,620,000</li>
          <li>• Next ₦13,000,000 at 21% = ₦2,730,000</li>
          <li>• Remaining ₦4,500,000 at 23% = ₦1,035,000</li>
        </ul>

        <p class="bg-green-50 text-green-800 p-3 rounded font-bold">Annual Tax: ₦5,715,000 (₦476,250/month)</p>
        <p class="text-sm text-gray-600 mt-2">Effective tax rate: 19.1% of gross income</p>
      </div>
    </div>

    <h2>Digital Assets and Capital Gains</h2>
    <p>The new tax law brings clarity to previously ambiguous areas:</p>

    <h3>Cryptocurrency and NFTs</h3>
    <p>Gains from selling digital assets are now taxed at the same progressive rates as regular income (0-25%), not the old flat 10% capital gains rate.</p>

    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6">
      <h4 class="text-yellow-900 font-bold mb-2">Important: Loss Offsetting Allowed</h4>
      <p class="text-yellow-800 mb-0">You can offset your cryptocurrency gains with losses from other crypto transactions in the same tax year. Keep detailed records of all transactions including:</p>
      <ul class="text-yellow-800 mt-2 mb-0">
        <li>Purchase date and price</li>
        <li>Sale date and price</li>
        <li>Transaction fees</li>
        <li>Type of cryptocurrency/NFT</li>
      </ul>
    </div>

    <h2>Modernized Tax Compliance</h2>
    <p>The new system leverages technology to make compliance easier and more transparent:</p>

    <h3>Data Integration</h3>
    <p>Your tax profile will automatically link:</p>
    <ul>
      <li>National Identification Number (NIN)</li>
      <li>Bank Verification Number (BVN)</li>
      <li>Bank accounts</li>
      <li>Employment records</li>
      <li>Property ownership</li>
    </ul>

    <p><strong>What this means for you:</strong></p>
    <ul>
      <li>Pre-filled tax returns based on your actual income</li>
      <li>Reduced need for manual documentation</li>
      <li>Faster processing of refunds and reliefs</li>
      <li>Less chance of errors in your tax filing</li>
    </ul>

    <h3>Automated Tax Collection</h3>
    <p>The new law grants tax authorities power to directly debit bank accounts for owed taxes—but <strong>only after due process</strong>:</p>

    <ol>
      <li>You''ll receive a tax assessment</li>
      <li>You''ll have opportunity to dispute or clarify</li>
      <li>Only after this process can automatic debit occur</li>
    </ol>

    <p>This ensures fairness while improving collection efficiency for legitimate tax obligations.</p>

    <h2>What You Need to Do Before January 1, 2026</h2>

    <div class="bg-primary-50 border-l-4 border-primary-600 p-6 my-8">
      <h3 class="text-primary-900 font-bold mb-3">Action Checklist:</h3>
      <ol class="text-primary-800 space-y-2 mb-0">
        <li><strong>Calculate your new tax liability</strong> using the brackets above</li>
        <li><strong>Gather rent documentation</strong> to claim rent relief (tenancy agreement, receipts)</li>
        <li><strong>Ensure NIN and BVN are linked</strong> to avoid compliance issues</li>
        <li><strong>Update your employer</strong> on any exemptions or reliefs you qualify for</li>
        <li><strong>Keep crypto transaction records</strong> if you trade digital assets</li>
        <li><strong>Review your payslip</strong> in January 2026 to confirm correct deductions</li>
        <li><strong>Consult a tax professional</strong> if you have complex income sources</li>
      </ol>
    </div>

    <h2>Frequently Asked Questions</h2>

    <h3>Will my employer automatically apply the new rates?</h3>
    <p>Yes, employers are required to use the new tax brackets starting January 1, 2026. However, you should verify your January payslip to ensure correct application.</p>

    <h3>Can I claim rent relief if I live in family property?</h3>
    <p>Only if you have a formal tenancy agreement and make actual rent payments. Living rent-free in family property doesn''t qualify.</p>

    <h3>What if I have multiple sources of income?</h3>
    <p>All income sources are combined to determine your total annual taxable income, which is then taxed at the progressive rates. The data integration system will help consolidate this automatically.</p>

    <h3>Are bonuses and allowances taxed differently?</h3>
    <p>No, all forms of income (salary, bonuses, allowances, etc.) are combined and taxed at the progressive rates based on your total annual income.</p>

    <h2>The Bottom Line</h2>

    <p class="text-lg font-medium mt-8 p-6 bg-gray-50 border-l-4 border-primary-600">The 2026 personal income tax reforms will benefit approximately 98% of Nigerian workers. The combination of higher exemption thresholds, progressive rates, and new reliefs like rent deductions means more take-home pay for most earners. The key is understanding how these changes apply to your specific situation and taking advantage of all available reliefs.</p>

    <p>With just weeks until implementation, now is the time to calculate your new tax liability, gather necessary documentation, and ensure you''re positioned to maximize your benefits under the new system.</p>

    <div class="mt-12 p-6 bg-blue-50 rounded-lg">
      <p class="text-sm text-gray-700 mb-0"><strong>Are you a freelancer or business owner?</strong> Understanding your tax obligations is crucial. Quotla helps you track your income, generate professional invoices, and stay compliant with Nigeria''s new 2026 tax regulations. <a href="/signup" class="text-primary-600 font-medium hover:underline">Start free today</a>.</p>
    </div>
  </article>',
  admin_user_id,
  true,
  NOW(),
  NOW(),
  'Detailed breakdown of Nigeria''s 2026 personal income tax changes including new tax brackets, exemptions, rent relief, and take-home pay calculations.',
  'Tax & Finance',
  ARRAY['Personal Income Tax', 'Tax Reform', '2026', 'Nigeria', 'Finance', 'Salary', 'Tax Brackets'],
  14
);

END$$;

-- ================================================================
-- POST-INSERTION: Verify the posts were created
-- ================================================================
SELECT id, title, author_id, published, created_at
FROM blog_posts
WHERE slug IN (
  'understanding-nigerias-2026-tax-reforms-complete-overview',
  'how-nigerias-2026-tax-laws-affect-small-businesses-entrepreneurs',
  'personal-income-tax-changes-nigeria-2026-reforms-what-you-need-to-know'
)
ORDER BY created_at DESC;

-- ================================================================
-- INSTRUCTIONS
-- ================================================================
-- 1. First, ensure you've run supabase-blog-schema-updates.sql
-- 2. Update line 15: Replace 'your-email@example.com' with your actual email
-- 3. Run this entire file in your Supabase SQL editor
-- 4. The script will automatically find your user ID and insert all 3 posts
-- 5. If you get an error, make sure you have is_admin=true set for your user:
--    UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
-- ================================================================

'use client'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            👋 About Naija Amebo Gist
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your ultimate platform for news, connections, and opportunities in Nigeria and beyond
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Mission Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              At Naija Amebo Gist, our mission is to create a vibrant, inclusive community where Nigerians and people interested in Nigerian culture can share news, stories, opportunities, and connect with one another. We believe in the power of community and the transformative impact of sharing information and building meaningful relationships.
            </p>
          </div>

          {/* Vision Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              We envision a world where people are empowered through accessible information, authentic connections, and genuine opportunities. Naija Amebo Gist aims to be the go-to platform for trending news, celebrity gossip, viral content, job opportunities, and community engagement across Nigeria and the diaspora.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">📰</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Breaking News</h3>
                  <p className="text-gray-700 dark:text-gray-300">Stay updated with the latest news from Nigeria and around the world.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">🌟</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Celebrity Gossip</h3>
                  <p className="text-gray-700 dark:text-gray-300">Get the latest scoop on your favorite celebrities and entertainment stories.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">💼</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Job Opportunities</h3>
                  <p className="text-gray-700 dark:text-gray-300">Discover career opportunities and connect with employers in your field.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">🛍️</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Marketplace</h3>
                  <p className="text-gray-700 dark:text-gray-300">Buy and sell products and services within our trusted community.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">📍</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Location Features</h3>
                  <p className="text-gray-700 dark:text-gray-300">Find people and opportunities near you using our geolocation tools.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">💬</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Community Chats</h3>
                  <p className="text-gray-700 dark:text-gray-300">Connect with like-minded people through group chats and discussions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Naija Amebo Gist?</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Authentic Community:</strong> Connect with real people and authentic stories from Nigeria.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Safety First:</strong> We implement anti-fraudulent measures and maintain a safe environment for all users.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Real Opportunities:</strong> From job openings to business partnerships, find genuine opportunities on our platform.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Mobile Accessible:</strong> Access everything on your phone or desktop. We're always where you are.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>Privacy Focused:</strong> Your data is yours. We respect your privacy and protect your information.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300"><strong>24/7 Support:</strong> Our team is here to help whenever you need assistance.</span>
              </li>
            </ul>
          </div>

          {/* Our Story */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Naija Amebo Gist was founded with a simple belief: Nigerians deserve a platform where they can freely share their stories, celebrate culture, connect with opportunities, and build meaningful relationships. What started as an idea has grown into a thriving community of thousands of users from Nigeria and beyond.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Today, we continue to innovate and improve our platform to better serve our community. Every feature we build, every policy we enforce, and every update we release is driven by our commitment to creating a safe, inclusive, and empowering space for all.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl shadow-lg p-8 sm:p-12 border-l-4 border-blue-500">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong> naijaameboconnect@gmail.com</p>
              <p><strong>Phone:</strong> +234 708 677 3237</p>
              <p><strong>Follow us on social media for updates and community news</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 sm:p-12 text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">About Naija Amebo Gist</h1>
          <p className="text-lg text-white/90">
            Your ultimate platform for Nigerian celebrity news, trending stories, and community engagement
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300">
              To provide a vibrant, engaging platform where Nigerians and the global diaspora can share, discuss, and stay updated on celebrity news, entertainment updates, and trending stories. We believe in the power of community and authentic connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2">Breaking News</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get the latest celebrity news and entertainment updates as they happen</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Community Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect with other users in real-time discussions about trending topics</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-bold text-green-900 dark:text-green-300 mb-2">Group Chats & Channels</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create or join specialized groups and channels focused on your interests</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-2">Location-Based Groups</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find and create local meetup groups based on your location</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Team</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We are a passionate team of developers, designers, and content creators dedicated to building the most engaging entertainment platform for Nigerians worldwide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Why Choose Us?</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Real-time updates on the latest celebrity gossip and entertainment news</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Vibrant community of Nigerian entertainment enthusiasts</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Multiple ways to connect: private messages, groups, channels, and nearby meetups</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>User-friendly interface optimized for mobile and desktop</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">✓</span>
                <span>Safe and moderated community environment</span>
              </li>
            </ul>
          </section>

          <section className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Get In Touch</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <a href="/contact" className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all">
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}

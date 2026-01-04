'use client'

export default function TermsAndCopyright() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms & Copyright</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Terms of Service</h2>
            <p>
              By accessing and using Naija Amebo Gist, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">User Responsibilities</h2>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account information</li>
              <li>You agree not to post content that is illegal, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive, hateful, or racially, ethnically or otherwise objectionable</li>
              <li>You agree not to post any copyrighted material unless you own the copyright or have explicit permission</li>
              <li>You agree not to spam or engage in harassment of other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Copyright Notice</h2>
            <p>
              All content on Naija Amebo Gist, including text, graphics, logos, images, and software, is the property of Naija Amebo Gist or its content suppliers and is protected by international copyright laws.
            </p>
            <p className="mt-4">
              © 2024 Naija Amebo Gist. All rights reserved.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">User Generated Content</h2>
            <p>
              By submitting content to Naija Amebo Gist, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute the content in any media or medium.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Limitation of Liability</h2>
            <p>
              Naija Amebo Gist shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, damages for loss of profits, goodwill, use, data or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Changes to Terms</h2>
            <p>
              Naija Amebo Gist reserves the right to modify these terms at any time. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

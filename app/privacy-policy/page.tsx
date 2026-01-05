'use client'

import { useState } from 'react'

interface PolicySection {
  title: string
  content: string | string[]
}

export default function PrivacyPolicy() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview'])

  const sections: PolicySection[] = [
    {
      title: 'Overview',
      content: 'Once again, welcome to Naija Amebo Gist! We value your privacy and are committed to protecting your personal data. This privacy notice outlines how we collect, use, and share your information when you use our platform. By using Naija Amebo Gist, you agree to the practices described in this policy.'
    },
    {
      title: 'Information We Collect',
      content: [
        'Personal Information: When you sign up for an account, we collect information such as your name, email address, phone number, profile photo, and other contact details.',
        'Content and Usage Data: We collect content you upload, such as photos, posts, comments, and messages. We also collect data on how you interact with the platform, including your connections, job applications, event participations, and marketplace activities.',
        'Location Data: If you use our geolocation features, we collect your precise location information. You can control your location settings through your device permissions.'
      ]
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To Provide and Improve Services: We use your information to operate, maintain, and improve the features of Naija Amebo Gist, including facilitating connections, job searches, and marketplace functionality.',
        'Personalization: We use your data to personalize your experience, such as suggesting friends, jobs, and content that may interest you.',
        'Safety and Security: We use your information to protect our platform and users from fraud, abuse, and other harmful activities.'
      ]
    },
    {
      title: 'Sharing Your Information',
      content: [
        'With Other Users: Information such as your profile, posts, and location (if enabled) may be visible to other users depending on your privacy settings.',
        'Legal Obligations: We may disclose your information if required by law or to protect the rights, property, or safety of Naija Amebo Gist, our users, or others.',
        'Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner.'
      ]
    },
    {
      title: 'Your Choices and Controls',
      content: [
        'Location Sharing: You can enable or disable location sharing on the maps page.',
        'Access and Correction: You can access and update your personal information through your account settings.',
        'Account Deactivation: You can deactivate your account at any time. Upon deactivation, your profile and data will no longer be visible to other users. Contact an admin for more info.'
      ]
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. Your Information is safe with us.'
    },
    {
      title: "Children's Privacy",
      content: 'Naija Amebo Gist is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information.'
    },
    {
      title: 'Changes to This Privacy Policy',
      content: 'We may update this privacy policy from time to time. If we make significant changes, we will notify you through the platform or by email. Your continued use of Naija Amebo Gist after any changes indicates your acceptance of the new privacy policy.'
    },
    {
      title: 'Contact',
      content: [
        'If you have any questions or concerns about this privacy policy, please contact us at:',
        'Email: naijaameboconnect@gmail.com',
        'Tel: +234 708 677 3237'
      ]
    }
  ]

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            🛡️ Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your privacy matters to us. Learn how we protect your data.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="min-h-[60px] transition duration-300 w-full rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-gray-900 dark:text-white border-2 border-blue-400/50 dark:border-blue-500/50 overflow-hidden hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400"
            >
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex justify-between items-center p-4 hover:bg-white/5 dark:hover:bg-white/5 transition"
              >
                <h3 className="text-lg font-semibold text-left">{section.title}</h3>
                <svg
                  className={`w-6 h-6 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    expandedSections.includes(section.title) ? 'rotate-45' : ''
                  }`}
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"></path>
                </svg>
              </button>

              {/* Expanded Content */}
              {expandedSections.includes(section.title) && (
                <div className="px-4 pb-4 border-t border-blue-400/30 dark:border-blue-500/30 pt-4 bg-white/5 dark:bg-white/5">
                  {Array.isArray(section.content) ? (
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-3">
                          <span className="text-blue-500 dark:text-blue-400 font-bold flex-shrink-0">•</span>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400">By using Naija Amebo Gist,</span> you agree to this privacy policy. Thank you for being a part of our community!
          </p>
        </div>
      </div>
    </div>
  )
}

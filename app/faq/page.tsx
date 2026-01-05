'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: 'What are the things I can do on this platform?',
      answer: 'Our platform gives you the ability to send posts to your network just like you would on twitter. You can create and apply for jobs and events, message and connect with people and furthermore, promote your business by uploading your products in the marketplace. Additionally, there is a geolocation feature in the maps section that lets you make your location public, allowing people to easily find you or your business.'
    },
    {
      question: 'Can I create my own events on the platform?',
      answer: 'Yes, users have the option to create and promote their own events on the platform. You can add/edit event details and manage RSVPs.'
    },
    {
      question: 'Are there virtual events available on the platform?',
      answer: 'Yes, we offer virtual events and online hangouts for users who prefer to participate remotely. These events include webinars, virtual conferences, online classes, and virtual social gatherings where users can connect and interact from anywhere.'
    },
    {
      question: 'What types of job opportunities are available on the platform?',
      answer: 'Our platform offers a wide range of job opportunities across various industries and job functions, including full-time, part-time, freelance, and remote positions.'
    },
    {
      question: 'Is geolocation tracking always accurate?',
      answer: 'Geolocation accuracy can vary based on factors like GPS signal strength, device capabilities, and environmental conditions. It\'s generally reliable but may have limitations in certain situations. Regardless, if a person\'s device has a low location accuracy, you\'ll see a circle around the marker, showing the range of places that person could be.'
    },
    {
      question: 'How do I join a discussion chat room?',
      answer: 'Typically, you can join a discussion chat room by creating an account on the Naija Amebo Gist platform, browsing available chat rooms, and clicking to join the ones that interest you. You can also create your own chat room to discuss topics you\'re passionate about.'
    }
  ]

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            ❓ Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions about Naija Amebo Gist
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="min-h-[60px] transition duration-300 w-full rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-gray-900 dark:text-white border-2 border-blue-400/50 dark:border-blue-500/50 overflow-hidden hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex justify-between items-center p-4 hover:bg-white/5 dark:hover:bg-white/5 transition"
              >
                <h3 className="text-lg font-semibold text-left pr-4">{faq.question}</h3>
                <svg
                  className={`w-6 h-6 transition-transform duration-300 flex-shrink-0 ${
                    expandedIndex === index ? 'rotate-45' : ''
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

              {/* Expanded Answer */}
              {expandedIndex === index && (
                <div className="px-4 pb-4 border-t border-blue-400/30 dark:border-blue-500/30 pt-4 bg-white/5 dark:bg-white/5">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-l-4 border-blue-500">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Didn't find your answer?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Contact us at <span className="font-semibold text-blue-600 dark:text-blue-400">naijaameboconnect@gmail.com</span> or call <span className="font-semibold text-blue-600 dark:text-blue-400">+234 708 677 3237</span>
          </p>
        </div>
      </div>
    </div>
  )
}

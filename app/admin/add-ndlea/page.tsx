"use client";
import { useState } from 'react'

export default function AddNDLEAArticle() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    setStatus('Adding article...')
    
    try {
      const response = await fetch('/api/articles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "80-year-old ex-convict arrested as NDLEA uncovers illicit drugs in full body mannequins",
          description: "80-year-old ex-convict arrested as NDLEA uncovers illicit drugs in full body mannequins Barely three years after he was arrested, prosecuted and sentenced to two years imprisonment for dealing in illicit drugs, an 80-year-old grandpa Jeremiah Isaiah Nkanta has again been nabbed by operatives of the National Drug Law Enforcement Agency (NDLEA) for returning to the criminal trade. A statement from Femi Babafemi, spokesperson person for NDLEA, says Nkanta who is notorious for illicit drug business, was first arrested by NDLEA on 14th December 2022, prosecuted and sentenced to two years in jail by a Federal High Court in Uyo, Akwa Ibom state. Not ready to let go the old habits, Nkanta returned to the illicit drug trade and hoarding credible intelligence, NDLEA operatives on Saturday 10th January tracked the Octogenarian ex-convict to his Mmanta - Abak village, Abak local government area of Akwa Ibom state, where he was arrested with 5.7 kilograms of cannabis in his residence. Babafemi said in another successful interdiction operation in Akwa Ibom state, NDLEA operatives on patrol along Oron-Ibaka Road on Friday 9th January intercepted a 37-year-old businessman Ani Onyebuchi Romans while travelling with full body mannequins for his clothing business in Cameroun. A search of the mannequins revealed that they were stuffed with pills of tramadol weighing 5.3 kilograms. He mentioned that the suspect claims he resides in Cameroun and was reportedly returning to his base after the Christmas and New Year holidays when he was apprehended. It was revealed that he bought the drugs in Onitsha, Anambra state and was trafficking them to Cameroun to sell, using two mannequins to conceal the opioids.",
          category: "breaking-news",
          submitterName: "IFUNANYA ANISIOFOR",
          submitterEmail: "ifunanya.anisiofor@gmail.com",
          hashtags: ["#DrugBaron", "#DrugAddict"],
          image: "https://res.cloudinary.com/dxuqv4muq/image/upload/v1673358906/naija-amebo-gist/ndlea-article_xyz123.jpg"
        })
      })

      const result = await response.json()
      if (response.ok) {
        setStatus('✅ Article added successfully to Firebase!')
        // Now approve it
        const approveResponse = await fetch(`/api/articles/update-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId: result.id,
            status: 'approved'
          })
        })
        
        if (approveResponse.ok) {
          setStatus('✅ Article approved and live!')
        }
      } else {
        setStatus('❌ Error: ' + result.error)
      }
    } catch (error) {
      setStatus('❌ Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Back Button - Fixed at Top */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 px-8 py-3">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-lg transition-colors">
          <span className="mr-2">← Back to Admin Dashboard</span>
        </Link>
      </div>

      {/* Main Content with Top Padding */}
      <div className="pt-12">
      <h1 className="text-3xl font-bold mb-6">Add Missing NDLEA Article to Firebase</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <p className="text-yellow-800">
          This article was in localStorage but not migrated to Firebase. 
          Click below to add it permanently.
        </p>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold"
      >
        {loading ? 'Adding...' : '➕ Add NDLEA Article to Firebase'}
      </button>

      {status && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          {status}
        </div>
      )}
      </div>
    </div>
  )
}

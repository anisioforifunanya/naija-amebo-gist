"use client";
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, where, query, updateDoc, doc } from 'firebase/firestore'
import Link from 'next/link'

export default function ApproveArticles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), where('status', '==', 'pending'))
        const snapshot = await getDocs(q)
        setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (error) {
        console.error('Failed to load articles:', error)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [])

  const handleApprove = async (articleId: string) => {
    setApproving(prev => ({ ...prev, [articleId]: true }))
    try {
      await updateDoc(doc(db, 'articles', articleId), {
        status: 'approved'
      })
      setArticles(articles.filter(a => a.id !== articleId))
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('Failed to approve article')
    } finally {
      setApproving(prev => ({ ...prev, [articleId]: false }))
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/admin" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Admin
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">📰 Approve Pending Articles</h1>
      
      {articles.length === 0 ? (
        <p className="text-gray-600">No pending articles to approve</p>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="border p-4 rounded-lg bg-white shadow">
              <h3 className="text-xl font-bold">{article.title}</h3>
              <p className="text-gray-600 mt-2">{article.description?.substring(0, 200)}...</p>
              <div className="mt-3 flex gap-2 text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{article.category}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{article.status}</span>
              </div>
              {article.image && (
                <img src={article.image} alt="" className="mt-3 max-h-32 rounded" />
              )}
              <button
                onClick={() => handleApprove(article.id)}
                disabled={approving[article.id]}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {approving[article.id] ? 'Approving...' : '✅ Approve'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

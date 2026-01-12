import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const articlesToRestore = [
      {
        title: "Single Nigerian mom of 10 kids shares how she survives with her children!!!",
        description: "Just in: A remarkable story of a single Nigerian mother who shares her inspiring journey of raising 10 children.",
        excerpt: "Just in: A remarkable story of a single Nigerian mother who shares her inspiring journey of raising 10 children.",
        category: "entertainment",
        status: "approved",
        date: "1/12/2026, 2:51:25 PM",
        submittedBy: "IFUNANYA ANISIOFOR",
        submitterEmail: "ifunanya.anisiofor@gmail.com",
        hashtags: ["nigerian", "mother", "children", "story", "inspiring"],
        image: "",
        video: "",
      },
      {
        title: "Teyana Taylor's emotional acceptance speech after winning her first Golden Globe award last night",
        description: "The Grammy-nominated singer and dancer took home the award for Best Supporting Female Actor in a Motion Picture for her performance in One Battle After Another.",
        excerpt: "The Grammy-nominated singer and dancer took home the award for Best Supporting Female Actor in a Motion Picture for her performance in One Battle After Another.",
        category: "celebrity-news",
        status: "approved",
        date: "1/12/2026, 2:58:41 PM",
        submittedBy: "IFUNANYA ANISIOFOR",
        submitterEmail: "ifunanya.anisiofor@gmail.com",
        hashtags: ["teyana-taylor", "golden-globe", "award", "actress", "music"],
        image: "",
        video: "",
      },
      {
        title: "Nigerian doctor based in Germany lists benefits of paying his taxes",
        description: "If I loose my job, the govt pays me 60% of my salary and help to find a new one- Nigerian doctor based in Germany lists benefits of paying his taxes as he asks Nigerians what benefits they derive after tax payment",
        excerpt: "If I loose my job, the govt pays me 60% of my salary and help to find a new one- Nigerian doctor based in Germany lists benefits of paying his taxes as he asks Nigerians what benefits they derive after tax payment",
        category: "viral-content",
        status: "approved",
        date: "1/12/2026, 3:09:07 PM",
        submittedBy: "IFUNANYA ANISIOFOR",
        submitterEmail: "ifunanya.anisiofor@gmail.com",
        hashtags: ["doctor", "germany", "taxes", "benefits", "nigeria"],
        image: "",
        video: "",
      },
    ]

    const restored = []
    
    for (const article of articlesToRestore) {
      const docRef = await addDoc(collection(db, 'articles'), {
        ...article,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      restored.push({
        id: docRef.id,
        title: article.title,
        category: article.category,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Articles restored successfully',
      restored: restored,
      count: restored.length,
    })
  } catch (error) {
    console.error('Restoration error:', error)
    return NextResponse.json(
      {
        error: 'Failed to restore articles',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

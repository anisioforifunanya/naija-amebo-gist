import PhotoGallery from '@/components/PhotoGallery'
import extendedNews from '@/data/extended-news.json'
import galleries from '@/data/galleries.json'

export const metadata = {
  title: 'Photo Galleries - Naija Amebo Gist',
  description: 'High-quality photo galleries of red carpet fashion, events, and celebrity moments',
}

export default function PhotoGalleryPage() {
  const photoContent = extendedNews.filter((item: any) => item.contentType === 'photo-gallery')

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            📸 Photo Galleries
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            High-quality photos from red carpets, events, and celebrity moments
          </p>
        </div>

        {/* Featured Gallery */}
        {galleries.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{galleries[0].title}</h2>
            <PhotoGallery
              title={galleries[0].title}
              description={galleries[0].description}
              images={galleries[0].images}
            />
          </div>
        )}

        {/* Additional Galleries */}
        {galleries.slice(1).map((gallery: any) => (
          <div key={gallery.id} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{gallery.title}</h2>
            <PhotoGallery
              title={gallery.title}
              description={gallery.description}
              images={gallery.images}
            />
          </div>
        ))}

        {/* Featured Photo Stories */}
        {photoContent.length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Photo Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photoContent.map((item: any) => (
                <div key={item.id} className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

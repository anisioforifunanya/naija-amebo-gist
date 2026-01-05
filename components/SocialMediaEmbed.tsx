'use client'

interface SocialEmbed {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'threads'
  embedUrl: string
  caption?: string
  width?: number
  height?: number
}

export default function SocialMediaEmbed({ embed }: { embed: SocialEmbed }) {
  const { platform, embedUrl, caption, width = 100, height = 100 } = embed

  const getEmbedComponent = () => {
    switch (platform) {
      case 'instagram':
        return (
          <div className="flex justify-center my-4">
            <iframe
              src={`${embedUrl}/embed`}
              width={Math.min(width, 540)}
              height={height}
              frameBorder="0"
              scrolling="no"
              allowTransparency={true}
              allow="encrypted-media"
              className="rounded-lg"
              loading="lazy"
            ></iframe>
          </div>
        )
      case 'tiktok':
        return (
          <div className="flex justify-center my-4">
            <blockquote
              className="tiktok-embed"
              cite={embedUrl}
              data-unique-id={embedUrl.split('/').pop()}
              style={{ maxWidth: '540px', minWidth: '325px' }}
            >
              <section></section>
            </blockquote>
            <script async src="https://www.tiktok.com/embed.js" crossOrigin="anonymous"></script>
          </div>
        )
      case 'youtube':
        const youtubeId = extractYoutubeId(embedUrl)
        return (
          <div className="flex justify-center my-4">
            <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )
      case 'twitter':
        return (
          <div className="flex justify-center my-4">
            <blockquote className="twitter-tweet" data-dnt="true">
              <a href={embedUrl}></a>
            </blockquote>
            <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
          </div>
        )
      case 'threads':
        return (
          <div className="flex justify-center my-4">
            <blockquote className="threads-embed" data-post-url={embedUrl}>
              <section></section>
            </blockquote>
            <script async src="https://www.threads.net/embed.js"></script>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="my-6 space-y-2">
      {caption && <p className="text-sm text-gray-600 italic text-center mb-3">{caption}</p>}
      <div className="flex justify-center">
        {getEmbedComponent()}
      </div>
    </div>
  )
}

function extractYoutubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : ''
}

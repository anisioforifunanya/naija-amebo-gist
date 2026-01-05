import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={126}
      title="Image Watermark System"
      icon=""
      description="Explore the Image Watermark System feature and all its capabilities."
      features={[
        'Real-time updates',
        'User-friendly interface',
        'Mobile optimized',
        'Dark mode support',
        'Analytics tracking',
        'Easy integration'
      ]}
    />
  )
}

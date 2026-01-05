import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={115}
      title="Community Hall of Fame"
      icon=""
      description="Explore the Community Hall of Fame feature and all its capabilities."
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

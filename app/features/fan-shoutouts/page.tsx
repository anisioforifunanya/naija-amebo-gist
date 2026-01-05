import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={114}
      title="Fan Shoutout Feature"
      icon=""
      description="Explore the Fan Shoutout Feature feature and all its capabilities."
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

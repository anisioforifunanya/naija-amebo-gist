import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={109}
      title="Anniversary & Throwback Posts"
      icon=""
      description="Explore the Anniversary & Throwback Posts feature and all its capabilities."
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

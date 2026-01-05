import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={106}
      title="Daily Gist Countdown"
      icon=""
      description="Explore the Daily Gist Countdown feature and all its capabilities."
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

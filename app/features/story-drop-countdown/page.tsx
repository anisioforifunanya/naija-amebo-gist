import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={123}
      title="Story Drop Countdown"
      icon=""
      description="Experience the power of Story Drop Countdown with real-time updates and intuitive controls."
      features={[
        'Real-time updates and notifications',
        'User-friendly interface design',
        'Mobile and desktop optimized',
        'Full dark mode support',
        'Advanced analytics tracking',
        'Seamless integration'
      ]}
    />
  )
}

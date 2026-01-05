import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={123}
      title="Growth Graph"
      icon=""
      description="Experience the power of Growth Graph with real-time updates and intuitive controls."
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

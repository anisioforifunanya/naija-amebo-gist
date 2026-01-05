import { FeaturePageTemplate } from '@/components/FeatureTemplate'

export default function Feature() {
  return (
    <FeaturePageTemplate
      number={123}
      title="Handle Verifier"
      icon=""
      description="Experience the power of Handle Verifier with real-time updates and intuitive controls."
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

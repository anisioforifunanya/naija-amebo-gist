import { Suspense } from 'react'
import AdminContent from './admin-content'

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminContent />
    </Suspense>
  )
}

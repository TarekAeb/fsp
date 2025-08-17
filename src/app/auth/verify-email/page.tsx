import { Suspense } from 'react'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'

function VerifyEmailContent() {
  return <VerifyEmailForm />
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VerificationStatus {
  isVerified: boolean
  hasPendingVerification: boolean
  email: string
}

export function VerificationBanner() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/user/verification-status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    try {
      const response = await fetch('/api/user/verification-status', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Verification email sent!')
        fetchVerificationStatus() // Refresh status
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Failed to resend verification:', error)
      alert('Failed to send verification email')
    } finally {
      setResendLoading(false)
    }
  }

  if (loading || !status || status.isVerified || dismissed) {
    return null
  }

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <AlertDescription className="text-yellow-800">
            <strong>Email verification required:</strong> Please verify your email address ({status.email}) to access all features.
            {status.hasPendingVerification && (
              <span className="ml-2 text-sm text-yellow-600">Check your inbox for the verification email.</span>
            )}
          </AlertDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleResendVerification}
            disabled={resendLoading}
            variant="outline"
            size="sm"
            className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
          >
            {resendLoading ? 'Sending...' : 'Resend Email'}
          </Button>
          <Button
            onClick={() => setDismissed(true)}
            variant="ghost"
            size="sm"
            className="text-yellow-600 hover:text-yellow-800"
          >
            ×
          </Button>
        </div>
      </div>
    </Alert>
  )
}
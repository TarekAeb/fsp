"use client"

import { useState } from "react"

interface User {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  emailVerified?: Date | null
}

interface ProfileSectionProps {
  user: User
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    projectUpdates: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePreferenceChange = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const savePreferences = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Preferences updated successfully!")
        setIsSuccess(true)
      } else {
        setMessage(data.error || "Failed to update preferences")
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage("An error occurred while updating preferences")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="bg-card rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Manage your notification and communication preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Receive important updates via email</p>
          </div>
          <ToggleSwitch 
            enabled={preferences.emailNotifications}
            onChange={() => handlePreferenceChange('emailNotifications')}
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">Marketing Emails</h3>
            <p className="text-sm text-muted-foreground">Receive updates about new features and FSP news</p>
          </div>
          <ToggleSwitch 
            enabled={preferences.marketingEmails}
            onChange={() => handlePreferenceChange('marketingEmails')}
          />
        </div>

        {/* Security Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">Security Alerts</h3>
            <p className="text-sm text-muted-foreground">Get notified about security-related activities</p>
          </div>
          <ToggleSwitch 
            enabled={preferences.securityAlerts}
            onChange={() => handlePreferenceChange('securityAlerts')}
          />
        </div>

        {/* Project Updates */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">Project Updates</h3>
            <p className="text-sm text-muted-foreground">Receive notifications about FSP projects and productions</p>
          </div>
          <ToggleSwitch 
            enabled={preferences.projectUpdates}
            onChange={() => handlePreferenceChange('projectUpdates')}
          />
        </div>

        {message && (
          <div className={`p-4 rounded-md border ${
            isSuccess 
              ? 'bg-primary/10 border-primary/20 text-primary' 
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isSuccess ? (
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={savePreferences}
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-black font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  )
}
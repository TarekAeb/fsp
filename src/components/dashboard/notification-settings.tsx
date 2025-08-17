"use client"

import { useState } from "react"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: {
      systemUpdates: true,
      securityAlerts: true,
      projectUpdates: true,
      marketingEmails: false,
      weeklyDigest: true,
    },
    pushNotifications: {
      instantMessages: true,
      projectMilestones: true,
      securityAlerts: true,
      systemMaintenance: false,
    },
    inAppNotifications: {
      comments: true,
      mentions: true,
      assignments: true,
      deadlines: true,
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  type NotificationCategory = 'emailNotifications' | 'pushNotifications' | 'inAppNotifications';
  
  const handleChange = (category: NotificationCategory, setting: string) => {
    setSettings(prev => {
      const categorySettings = prev[category];
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: !categorySettings[setting as keyof typeof categorySettings]
        }
      };
    });
  }

  const saveSettings = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Notification settings updated successfully!")
        setIsSuccess(true)
      } else {
        setMessage(data.error || "Failed to update settings")
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage("An error occurred while updating settings")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-muted-foreground'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Choose which emails you&apos;d like to receive from FSP
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">System Updates</h3>
              <p className="text-sm text-muted-foreground">Important system announcements and updates</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications.systemUpdates}
              onChange={() => handleChange('emailNotifications', 'systemUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Security Alerts</h3>
              <p className="text-sm text-muted-foreground">Login attempts and security-related notifications</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications.securityAlerts}
              onChange={() => handleChange('emailNotifications', 'securityAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Project Updates</h3>
              <p className="text-sm text-muted-foreground">Updates about FSP productions and projects</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications.projectUpdates}
              onChange={() => handleChange('emailNotifications', 'projectUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Marketing Emails</h3>
              <p className="text-sm text-muted-foreground">Promotional content and feature announcements</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications.marketingEmails}
              onChange={() => handleChange('emailNotifications', 'marketingEmails')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Weekly Digest</h3>
              <p className="text-sm text-muted-foreground">Summary of your activity and important updates</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications.weeklyDigest}
              onChange={() => handleChange('emailNotifications', 'weeklyDigest')}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Push Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Real-time notifications sent to your device
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Instant Messages</h3>
              <p className="text-sm text-muted-foreground">Direct messages and team communications</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications.instantMessages}
              onChange={() => handleChange('pushNotifications', 'instantMessages')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Project Milestones</h3>
              <p className="text-sm text-muted-foreground">Important project deadlines and achievements</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications.projectMilestones}
              onChange={() => handleChange('pushNotifications', 'projectMilestones')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Security Alerts</h3>
              <p className="text-sm text-muted-foreground">Immediate security notifications</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications.securityAlerts}
              onChange={() => handleChange('pushNotifications', 'securityAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">System Maintenance</h3>
              <p className="text-sm text-muted-foreground">Scheduled maintenance and downtime alerts</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications.systemMaintenance}
              onChange={() => handleChange('pushNotifications', 'systemMaintenance')}
            />
          </div>
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">In-App Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Notifications shown within the FSP application
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Comments</h3>
              <p className="text-sm text-muted-foreground">Comments on your projects and posts</p>
            </div>
            <ToggleSwitch
              enabled={settings.inAppNotifications.comments}
              onChange={() => handleChange('inAppNotifications', 'comments')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Mentions</h3>
              <p className="text-sm text-muted-foreground">When someone mentions you in discussions</p>
            </div>
            <ToggleSwitch
              enabled={settings.inAppNotifications.mentions}
              onChange={() => handleChange('inAppNotifications', 'mentions')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Assignments</h3>
              <p className="text-sm text-muted-foreground">When you&apos;re assigned to new tasks or projects</p>
            </div>
            <ToggleSwitch
              enabled={settings.inAppNotifications.assignments}
              onChange={() => handleChange('inAppNotifications', 'assignments')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Deadlines</h3>
              <p className="text-sm text-muted-foreground">Upcoming deadlines and due dates</p>
            </div>
            <ToggleSwitch
              enabled={settings.inAppNotifications.deadlines}
              onChange={() => handleChange('inAppNotifications', 'deadlines')}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            isSuccess 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isSuccess ? (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
            onClick={saveSettings}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}
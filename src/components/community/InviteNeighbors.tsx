import React, { useState } from 'react'
import { UserPlus, Mail, Copy, Check, Send, X } from 'lucide-react'
import { BASE_URL } from '../../lib/config'

const InviteNeighbors = () => {
  const [emails, setEmails] = useState<string[]>([''])
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // The inviteLink now correctly includes the current user's ID as a referrer
  const inviteLink = `${BASE_URL}/auth?ref=${localStorage.getItem('userId') || ''}`

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const addEmailField = () => {
    setEmails([...emails, ''])
  }

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      const newEmails = [...emails]
      newEmails.splice(index, 1)
      setEmails(newEmails)
    }
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const sendInvites = async () => {
    // Filter out empty emails
    const validEmails = emails.filter(email => email.trim() !== '')
    
    if (validEmails.length === 0) {
      setError('Please enter at least one email address')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = validEmails.filter(email => !emailRegex.test(email))
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`)
      return
    }
    
    setSending(true)
    setError('')
    
    try {
      // --- SIMULATION (for local testing without a backend function) ---
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      // --- END SIMULATION ---

      setSuccess(true)
      setEmails(['']) // Clear emails after successful send
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error sending invites:', err)
      setError(err.message || 'An unexpected error occurred while sending invites.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Invite Your Neighbors
              </h2>
              <p className="text-gray-600 text-sm">
                Help grow your local community by inviting your neighbors
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Share your invite link
            </h3>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-100 p-3 rounded-lg text-gray-700 break-all">
                {inviteLink}
              </div>
              
              <button
                onClick={copyInviteLink}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Send email invitations
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-green-700 text-sm">
                Invitations sent successfully!
              </div>
            )}
            
            <div className="space-y-3">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="neighbor@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmailField(index)}
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={addEmailField}
              className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
            >
              + Add another email
            </button>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={sendInvites}
              disabled={sending}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send Invitations</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow mt-6 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Why invite neighbors?
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Strengthen your community</h4>
                <p className="text-gray-600 text-sm">
                  More neighbors means more local connections, resources, and support.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Boost local businesses</h4>
                <p className="text-gray-600 text-sm">
                  Help local businesses thrive by connecting them with more potential customers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Earn rewards</h4>
                <p className="text-gray-600 text-sm">
                  You'll earn credits for each neighbor who joins through your invitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteNeighbors
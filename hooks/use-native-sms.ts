"use client"

import { useCallback } from "react"
import { handleSMSClick, isMobileDevice } from "@/utils/native-sms"

interface Client {
  name: string
  phone: string
  policy_type?: string
  expiry_date?: string
}

export function useNativeSMS() {
  const isMobile = isMobileDevice()

  const sendSMS = useCallback((client: Client) => {
    handleSMSClick(client)
  }, [])

  const getSMSButtonProps = useCallback(
    (client: Client) => {
      return {
        onClick: () => sendSMS(client),
        title: isMobile
          ? "Send SMS via your phone's messaging app"
          : "Copy SMS message to clipboard (works best on mobile)",
        "aria-label": `Send SMS to ${client.name}`,
      }
    },
    [isMobile, sendSMS],
  )

  return {
    sendSMS,
    getSMSButtonProps,
    isMobile,
  }
}

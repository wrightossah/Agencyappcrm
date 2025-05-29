"use client"

import { useCallback } from "react"
import { handleEmailClick, getEmailTooltip, type ClientEmailData } from "@/utils/native-email"

export function useNativeEmail() {
  const sendEmail = useCallback((client: ClientEmailData) => {
    handleEmailClick(client)
  }, [])

  const getTooltip = useCallback(() => {
    return getEmailTooltip()
  }, [])

  return {
    sendEmail,
    getTooltip,
  }
}

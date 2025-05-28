"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SMSBalanceData {
  balance: number
  currency: string
}

export function SMSBalanceWidget() {
  const [balance, setBalance] = useState<SMSBalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sms-balance")
      const data = await response.json()

      if (data.success) {
        setBalance({
          balance: data.balance,
          currency: data.currency,
        })
      } else {
        setError(data.error || "Failed to fetch balance")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const getBalanceColor = (balance: number) => {
    if (balance > 100) return "bg-green-500"
    if (balance > 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getBalanceStatus = (balance: number) => {
    if (balance > 100) return "Good"
    if (balance > 50) return "Low"
    return "Critical"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">SMS Balance</CardTitle>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Button variant="ghost" size="sm" onClick={fetchBalance} disabled={loading}>
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : balance ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {balance.balance.toLocaleString()} {balance.currency}
            </div>
            <Badge variant="secondary" className={`${getBalanceColor(balance.balance)} text-white`}>
              {getBalanceStatus(balance.balance)}
            </Badge>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function GeneralBotSettingsTab() {
  const [botToken, setBotToken] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // In a real application, you would fetch the bot token from your backend
  // and have an API endpoint to update it. For this example, we'll simulate it.
  useEffect(() => {
    // Simulate fetching bot token
    setIsSaving(true)
    setTimeout(() => {
      setBotToken("YOUR_BOT_TOKEN_HERE_SIMULATED") // Replace with actual fetch
      setIsSaving(false)
    }, 500)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      // Simulate API call to save bot token
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Saving bot token:", botToken)
      setMessage({ type: "success", text: "Bot sozlamalari muvaffaqiyatli saqlandi" })
    } catch (error) {
      console.error("Error saving bot settings:", error)
      setMessage({ type: "error", text: "Bot sozlamalarini saqlashda xatolik yuz berdi" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Bot Sozlamalari</span>
        </CardTitle>
        <CardDescription>Telegram bot token va boshqa umumiy sozlamalar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert
            className={`mb-4 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="bot-token">Bot Token</Label>
          <Input
            id="bot-token"
            type="password" // Use password type for sensitive info
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="Telegram bot tokenini kiriting"
          />
          <p className="text-sm text-gray-500 mt-1">
            {"Bu token botingizni Telegram API bilan bog'laydi. Uni maxfiy saqlang."}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Sozlamalarni saqlash
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

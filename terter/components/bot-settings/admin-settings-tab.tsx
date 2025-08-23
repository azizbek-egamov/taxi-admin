"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Save, Loader2, CheckCircle, AlertCircle, Search } from "lucide-react"
import { apiClient, type BotSettings, type User } from "@/lib/api"

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState<BotSettings | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([]) // All users fetched from API
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form state
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]) // Selected admin IDs

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [settingsResponse, usersResponse] = await Promise.all([apiClient.getBotSettings(), apiClient.getUsers()])

      setSettings(settingsResponse)
      setAllUsers(usersResponse.results) // Set all users
      setSelectedAdminIds(settingsResponse.admins.map((admin) => admin.id)) // Set initial selected admins
    } catch (error) {
      console.error("Error fetching admin data:", error)
      setMessage({ type: "error", text: "Ma'lumotlarni yuklashda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setMessage(null)

      await apiClient.updateBotSettings({
        admin_ids: selectedAdminIds, // Send selected admin IDs
      })

      setMessage({ type: "success", text: "Administrator sozlamalari muvaffaqiyatli saqlandi" })
      fetchData() // Refresh data to show updated admins
    } catch (error) {
      console.error("Error saving admin settings:", error)
      setMessage({ type: "error", text: "Administrator sozlamalarini saqlashda xatolik yuz berdi" })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleAdmin = (userId: number) => {
    setSelectedAdminIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  // Filtered users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) {
      return allUsers
    }
    const lowerCaseQuery = searchQuery.toLowerCase()
    return allUsers.filter(
      (user) =>
        user.id
          .toString()
          .includes(lowerCaseQuery) || // Search by PK
        user.full_name?.toLowerCase().includes(lowerCaseQuery) || // Search by full name
        user.phone_number?.toLowerCase().includes(lowerCaseQuery) || // Search by phone number
        user.telegram_id?.toString().includes(lowerCaseQuery), // Search by Telegram ID
    )
  }, [allUsers, searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Administrator foydalanuvchilar</span>
        </CardTitle>
        <CardDescription>Bot administratori bo'lishi kerak bo'lgan foydalanuvchilarni tanlang</CardDescription>
      </CardHeader>
      <CardContent>
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Foydalanuvchini qidirish (ID, ism, telefon, Telegram ID)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAdminIds.includes(user.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleAdmin(user.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.full_name?.charAt(0) || "F"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{user.full_name || "Noma'lum foydalanuvchi"}</h4>
                    <p className="text-sm text-gray-600">ID: {user.telegram_id}</p>
                    {user.phone_number && <p className="text-sm text-gray-600">{user.phone_number}</p>}
                  </div>
                  {selectedAdminIds.includes(user.id) && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Hech qanday foydalanuvchi topilmadi</p>
            </div>
          )}
        </div>

        {selectedAdminIds.length === 0 && filteredUsers.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Hech qanday administrator tanlanmagan</p>
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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

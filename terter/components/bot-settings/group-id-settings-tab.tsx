"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hash, Save, Loader2 } from "lucide-react"
import { apiClient, type BotSettings, type UpdateBotSettingsPayload } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function GroupIdSettingsTab() {
  const [settings, setSettings] = useState<BotSettings | null>(null)
  const [formData, setFormData] = useState<UpdateBotSettingsPayload>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getBotSettings()
      setSettings(data)
      setFormData({
        driver_request_group_id: data.driver_request_group_id,
        taxi_group_id: data.taxi_group_id,
        gruz_group_id: data.gruz_group_id,
        avia_group_id: data.avia_group_id,
        point_purchase_group_id: data.point_purchase_group_id, // NEW: Initialize new field
      })
    } catch (error) {
      console.error("Error fetching bot settings:", error)
      toast({
        title: "Xatolik",
        description: "Bot sozlamalarini yuklashda xatolik yuz berdi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedSettings = await apiClient.updateBotSettings(formData)
      setSettings(updatedSettings)
      toast({
        title: "Muvaffaqiyatli!",
        description: "Guruh ID sozlamalari muvaffaqiyatli saqlandi.",
      })
    } catch (error) {
      console.error("Error saving group ID settings:", error)
      toast({
        title: "Xatolik",
        description: "Guruh ID sozlamalarini saqlashda xatolik yuz berdi.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="h-5 w-5" />
            <span>Guruh ID Sozlamalari</span>
          </CardTitle>
          <CardDescription>Telegram guruhlari uchun ID sozlamalari</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          {/* NEW: Skeleton for point_purchase_group_id */}
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Hash className="h-5 w-5" />
          <span>Guruh ID Sozlamalari</span>
        </CardTitle>
        <CardDescription>Telegram guruhlari uchun ID sozlamalari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="driver_request_group_id">Haydovchi Arizalari Guruhi ID</Label>
          <Input
            id="driver_request_group_id"
            value={formData.driver_request_group_id || ""}
            onChange={handleChange}
            placeholder="Haydovchi arizalari guruhi ID sini kiriting"
          />
          <p className="text-sm text-gray-500 mt-1">
            Haydovchilarning yangi arizalari yuboriladigan Telegram guruhi IDsi.
          </p>
        </div>
        <div>
          <Label htmlFor="taxi_group_id">Taksi Buyurtmalari Guruhi ID</Label>
          <Input
            id="taxi_group_id"
            value={formData.taxi_group_id || ""}
            onChange={handleChange}
            placeholder="Taksi buyurtmalari guruhi ID sini kiriting"
          />
          <p className="text-sm text-gray-500 mt-1">Taksi buyurtmalari yuboriladigan Telegram guruhi IDsi.</p>
        </div>
        <div>
          <Label htmlFor="gruz_group_id">Gruz Buyurtmalari Guruhi ID</Label>
          <Input
            id="gruz_group_id"
            value={formData.gruz_group_id || ""}
            onChange={handleChange}
            placeholder="Gruz buyurtmalari guruhi ID sini kiriting"
          />
          <p className="text-sm text-gray-500 mt-1">Gruz buyurtmalari yuboriladigan Telegram guruhi IDsi.</p>
        </div>
        <div>
          <Label htmlFor="avia_group_id">Aviabilet/Poyezd Buyurtmalari Guruhi ID</Label>
          <Input
            id="avia_group_id"
            value={formData.avia_group_id || ""}
            onChange={handleChange}
            placeholder="Aviabilet/Poyezd buyurtmalari guruhi ID sini kiriting"
          />
          <p className="text-sm text-gray-500 mt-1">
            Aviabilet va poyezd buyurtmalari yuboriladigan Telegram guruhi IDsi.
          </p>
        </div>
        {/* NEW: Input for point_purchase_group_id */}
        <div>
          <Label htmlFor="point_purchase_group_id">Ball Sotib Olish So'rovlari Guruhi ID</Label>
          <Input
            id="point_purchase_group_id"
            value={formData.point_purchase_group_id || ""}
            onChange={handleChange}
            placeholder="Ball sotib olish so'rovlari guruhi ID sini kiriting"
          />
          <p className="text-sm text-gray-500 mt-1">
            Haydovchilarning ball sotib olish so'rovlari yuboriladigan Telegram guruhi IDsi.
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

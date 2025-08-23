"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, Search, Eye, CheckCircle, XCircle, Clock, Download, RefreshCw, FileText, Calendar } from "lucide-react"
import { apiClient, type DeportCheckRequest, type BotSettings } from "@/lib/api"

export default function DeportCheckRequestsTab() {
  const [requests, setRequests] = useState<DeportCheckRequest[]>([])
  const [botSettings, setBotSettings] = useState<BotSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<DeportCheckRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Settings form state
  const [deportGroupId, setDeportGroupId] = useState("")
  const [deportPrice, setDeportPrice] = useState("")
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [requestsResponse, settingsResponse] = await Promise.all([apiClient.getDeportCheckRequests(), apiClient.getBotSettings()])
      setRequests(requestsResponse.results)
      setBotSettings(settingsResponse)

      if (settingsResponse) {
        setDeportGroupId(settingsResponse.deport_check_group_id || "")
        setDeportPrice(settingsResponse.deport_price?.toString() || "")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      setIsSavingSettings(true)
      await apiClient.updateBotSettings({ deport_check_group_id: deportGroupId || null, deport_price: deportPrice ? Number.parseFloat(deportPrice) : null })
      await fetchData()
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleUpdateRequestStatus = async (requestId: number, status: "processing" | "completed" | "rejected") => {
    try {
      setIsUpdating(true)
      await apiClient.updateDeportCheckRequest(requestId, { status })
      await fetchData()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating request:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredRequests = requests.filter(
    (request) =>
      (request.user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.phone_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toString().includes(searchTerm),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Kutilmoqda
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Jarayonda
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Yakunlangan
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rad etilgan
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Deportatsiya tekshiruvi sozlamalari
          </CardTitle>
          <CardDescription>Deportatsiya tekshiruvi uchun guruh ID va narxni belgilang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deport-group-id">Deportatsiya guruh ID</Label>
              <Input id="deport-group-id" value={deportGroupId} onChange={(e) => setDeportGroupId(e.target.value)} placeholder="Masalan: -1001234567890" />
            </div>
            <div>
              <Label htmlFor="deport-price">Deportatsiya tekshiruvi narxi (so'm)</Label>
              <Input id="deport-price" type="number" value={deportPrice} onChange={(e) => setDeportPrice(e.target.value)} placeholder="Masalan: 50000" />
            </div>
          </div>
          <Button onClick={handleUpdateSettings} disabled={isSavingSettings}>{isSavingSettings ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}</Button>
        </CardContent>
      </Card>

      {/* Requests Management */}
      <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Deportatsiya tekshiruvi so'rovlari
              </CardTitle>
              <CardDescription>Jami {requests.length} ta so'rov</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yangilash
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Ism, telefon yoki so'rov ID bo'yicha qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              <div className="text-sm text-blue-700">Jami so'rovlar</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{requests.filter((r) => r.status === "pending").length}</div>
              <div className="text-sm text-yellow-700">Kutilmoqda</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{requests.filter((r) => r.status === "processing").length}</div>
              <div className="text-sm text-blue-700">Jarayonda</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{requests.filter((r) => r.status === "completed").length}</div>
              <div className="text-sm text-green-700">Yakunlangan</div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.passport_photo_url || ""} />
                        <AvatarFallback>{request.user.full_name?.charAt(0) || "F"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{request.user.full_name || "Noma'lum foydalanuvchi"}</h4>
                        <p className="text-sm text-gray-600">{request.phone_number || "Telefon yo'q"}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(request.created_at).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(request.status)}
                      <Dialog
                        open={isDialogOpen && selectedRequest?.id === request.id}
                        onOpenChange={(open) => {
                          setIsDialogOpen(open)
                          if (!open) setSelectedRequest(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ko'rish
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Deportatsiya tekshiruvi so'rovi</DialogTitle>
                            <DialogDescription>#{selectedRequest?.id} so'rovning batafsil ma'lumotlari</DialogDescription>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Foydalanuvchi ma'lumotlari</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Ism:</strong> {selectedRequest.user.full_name || "Noma'lum"}
                                    </div>
                                    <div>
                                      <strong>Telefon:</strong> {selectedRequest.phone_number || "Yo'q"}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">So'rov ma'lumotlari</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>So'rov ID:</strong> #{selectedRequest.id}
                                    </div>
                                    <div>
                                      <strong>Holat:</strong> {getStatusBadge(selectedRequest.status)}
                                    </div>
                                    <div>
                                      <strong>Yaratilgan:</strong> {new Date(selectedRequest.created_at).toLocaleString("uz-UZ")}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedRequest.passport_photo_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">Pasport rasmi</h4>
                                  <div className="border rounded-lg p-4">
                                    <a href={selectedRequest.passport_photo_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                      <Download className="w-4 h-4 mr-2" />
                                      Pasport rasmini ko'rish
                                    </a>
                                  </div>
                                </div>
                              )}

                              {selectedRequest.admin_screenshot_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">Tekshiruv natijasi (admin)</h4>
                                  <div className="border rounded-lg p-4">
                                    <a href={selectedRequest.admin_screenshot_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                      <Download className="w-4 h-4 mr-2" />
                                      Admin skrinshotini ko'rish
                                    </a>
                                  </div>
                                </div>
                              )}

                              {selectedRequest.status === "pending" && (
                                <div className="flex justify-center space-x-4 pt-4 border-t">
                                  <Button onClick={() => handleUpdateRequestStatus(selectedRequest.id, "processing")} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Jarayonga o'tkazish
                                  </Button>
                                  <Button onClick={() => handleUpdateRequestStatus(selectedRequest.id, "completed")} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Yakunlash
                                  </Button>
                                  <Button onClick={() => handleUpdateRequestStatus(selectedRequest.id, "rejected")} disabled={isUpdating} variant="destructive">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rad etish
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">So'rovlar topilmadi</h3>
              <p className="mt-1 text-sm text-gray-500">Hozircha deportatsiya tekshiruvi so'rovlari yo'q</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

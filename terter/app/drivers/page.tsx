"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, CheckCircle, XCircle, Clock, Search, Star, Phone, Eye, Trash2, Loader2 } from "lucide-react"
import { apiClient, type Driver } from "@/lib/api"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [directionFilter, setDirectionFilter] = useState<string>("all")
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingDriverId, setDeletingDriverId] = useState<number | null>(null)

  useEffect(() => {
    fetchDrivers()
  }, [statusFilter, directionFilter])

  const fetchDrivers = async () => {
    try {
      setIsLoading(true)
      const filters: Record<string, string> = {}

      if (statusFilter !== "all") {
        filters.is_approved = statusFilter
      }

      if (directionFilter !== "all") {
        filters.direction = directionFilter
      }

      const response = await apiClient.getDrivers(1, filters)
      setDrivers(response.results)
    } catch (error) {
      console.error("Error fetching drivers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveDriver = async (driverId: number, approved: boolean) => {
    try {
      await apiClient.updateDriver(driverId, { is_approved: approved })
      // Refresh drivers list
      fetchDrivers()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating driver:", error)
    }
  }

  const handleDeleteDriver = async (driverId: number) => {
    try {
      setDeletingDriverId(driverId)
      await apiClient.deleteDriver(driverId)
      setDrivers(drivers.filter((driver) => driver.id !== driverId))
    } catch (error) {
      console.error("Error deleting driver:", error)
    } finally {
      setDeletingDriverId(null)
    }
  }

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.car_make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.car_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Tasdiqlangan
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Kutilmoqda
      </Badge>
    )
  }

  const getDirectionDisplay = (direction: string | null) => {
    switch (direction) {
      case "1":
        return "🚕 Taksi / 📦 Pasilka"
      case "2":
        return "🚚 Gruz"
      default:
        return "Noma'lum"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 ml-16 lg:ml-0">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Haydovchilar</h1>
                <p className="text-sm text-gray-500">Haydovchilarni boshqarish va tasdiqlash</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Haydovchi, mashina yoki raqam bo'yicha qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Holat bo'yicha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  <SelectItem value="true">Tasdiqlangan</SelectItem>
                  <SelectItem value="false">Kutilayotgan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Yo'nalish bo'yicha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha yo'nalishlar</SelectItem>
                  <SelectItem value="1">Taksi / Pasilka</SelectItem>
                  <SelectItem value="2">Gruz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <Card
              key={driver.id}
              className="bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover-lift"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={driver.passport_photo_url || ""} />
                      <AvatarFallback>{driver.user.full_name?.charAt(0) || "H"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{driver.user.full_name || "Noma'lum"}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {driver.user.phone_number || "Telefon yo'q"}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(driver.is_approved)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mashina:</span>
                  <span className="font-medium">
                    {driver.car_make} ({driver.car_year})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Raqam:</span>
                  <span className="font-medium">{driver.car_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yo'nalish:</span>
                  <span className="text-sm">{getDirectionDisplay(driver.direction)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ballar:</span>
                  <span className="font-medium text-blue-600">{driver.points}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reyting:</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="font-medium">{driver.rating.toFixed(1)}</span>
                  </div>
                </div>
                {driver.region && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Viloyat:</span>
                    <span className="text-sm">{driver.region}</span>
                  </div>
                )}
                <div className="pt-3 border-t flex space-x-2">
                  <Dialog
                    open={isDialogOpen && selectedDriver?.id === driver.id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setSelectedDriver(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ko'rish
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Haydovchi ma'lumotlari</DialogTitle>
                        <DialogDescription>
                          {selectedDriver?.user.full_name || "Noma'lum"} ning to'liq ma'lumotlari
                        </DialogDescription>
                      </DialogHeader>

                      {selectedDriver && (
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Asosiy ma'lumotlar</TabsTrigger>
                            <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
                            <TabsTrigger value="actions">Amallar</TabsTrigger>
                          </TabsList>

                          <TabsContent value="info" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Shaxsiy ma'lumotlar</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>To'liq ism:</strong> {selectedDriver.user.full_name || "Noma'lum"}
                                  </div>
                                  <div>
                                    <strong>Telefon:</strong> {selectedDriver.user.phone_number || "Yo'q"}
                                  </div>
                                  <div>
                                    <strong>Telegram ID:</strong> {selectedDriver.user.telegram_id}
                                  </div>
                                  <div>
                                    <strong>Til:</strong> {selectedDriver.user.language || "Noma'lum"}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Mashina ma'lumotlari</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Marka:</strong> {selectedDriver.car_make}
                                  </div>
                                  <div>
                                    <strong>Yil:</strong> {selectedDriver.car_year}
                                  </div>
                                  <div>
                                    <strong>Raqam:</strong> {selectedDriver.car_number}
                                  </div>
                                  <div>
                                    <strong>Yo'nalish:</strong> {getDirectionDisplay(selectedDriver.direction)}
                                  </div>
                                  {selectedDriver.car_capacity && (
                                    <div>
                                      <strong>Sig'im:</strong> {selectedDriver.car_capacity} tonna
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Statistika</h4>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">{selectedDriver.points}</div>
                                  <div className="text-sm text-blue-700">Ballar</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-yellow-600">
                                    {selectedDriver.rating.toFixed(1)}
                                  </div>
                                  <div className="text-sm text-yellow-700">Reyting</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {selectedDriver.is_approved ? "✓" : "⏳"}
                                  </div>
                                  <div className="text-sm text-green-700">Holat</div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="documents" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedDriver.passport_photo_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">Pasport rasmi</h4>
                                  <img
                                    src={selectedDriver.passport_photo_url || "/placeholder.svg"}
                                    alt="Pasport"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              {selectedDriver.driver_license_photo_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">Haydovchilik guvohnomasi</h4>
                                  <img
                                    src={selectedDriver.driver_license_photo_url || "/placeholder.svg"}
                                    alt="Guvohnoma"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              {selectedDriver.sts_photo_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">STS (Avto hujjat)</h4>
                                  <img
                                    src={selectedDriver.sts_photo_url || "/placeholder.svg"}
                                    alt="STS"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              {selectedDriver.car_photo_url && (
                                <div>
                                  <h4 className="font-semibold mb-2">Mashina rasmi</h4>
                                  <img
                                    src={selectedDriver.car_photo_url || "/placeholder.svg"}
                                    alt="Mashina"
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="actions" className="space-y-4">
                            <div className="text-center space-y-4">
                              <p className="text-gray-600">
                                Haydovchini tasdiqlash, rad etish yoki o'chirish uchun quyidagi tugmalardan foydalaning
                              </p>
                              <div className="flex justify-center space-x-4">
                                {!selectedDriver.is_approved ? (
                                  <Button
                                    onClick={() => handleApproveDriver(selectedDriver.id, true)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Tasdiqlash
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleApproveDriver(selectedDriver.id, false)}
                                    variant="outline"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rad etish
                                  </Button>
                                )}

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      O'chirish
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Haydovchini o'chirish</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Haqiqatan ham <strong>{selectedDriver.user.full_name}</strong>ni
                                        o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi va barcha ma'lumotlar
                                        yo'qoladi.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          handleDeleteDriver(selectedDriver.id)
                                          setIsDialogOpen(false)
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        O'chirish
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingDriverId === driver.id}>
                        {deletingDriverId === driver.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Haydovchini o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          Haqiqatan ham <strong>{driver.user.full_name || "bu haydovchi"}</strong>ni o'chirmoqchimisiz?
                          Bu amalni bekor qilib bo'lmaydi va barcha ma'lumotlar yo'qoladi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          O'chirish
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Haydovchilar topilmadi</h3>
            <p className="mt-1 text-sm text-gray-500">Qidiruv shartlaringizni o'zgartiring</p>
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
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
import {
  Car,
  CheckCircle,
  Clock,
  Search,
  Star,
  Phone,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  Download,
  UserPlus,
} from "lucide-react"
import { apiClient, type Driver, type User, type CreateDriverPayload } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

const ITEMS_PER_PAGE = 12

export default function DriversPage() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([])
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>("all")
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingDriverId, setDeletingDriverId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalDrivers, setTotalDrivers] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // New state for driver creation
  const [isCreateDriverDialogOpen, setIsCreateDriverDialogOpen] = useState(false)
  const [createDriverStep, setCreateDriverStep] = useState(1) // 1: Select User, 2: Enter Driver Details
  const [searchUserQuery, setSearchUserQuery] = useState("")
  const [searchedUsers, setSearchedUsers] = useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [hasSearchedUsers, setHasSearchedUsers] = useState(false)
  const [selectedUserForDriver, setSelectedUserForDriver] = useState<User | null>(null)
  const [newDriverData, setNewDriverData] = useState<Omit<CreateDriverPayload, "user_id"> & { user_id?: number }>({
    // user_id is optional here because it's set in step 1
    direction: "taxi",
    passport_photo: null as any,
    driver_license_photo: null as any,
    sts_photo: null as any,
    car_photo: null as any,
  })
  const [isCreatingDriver, setIsCreatingDriver] = useState(false)
  const [createDriverError, setCreateDriverError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllDrivers()
  }, [])

  const fetchAllDrivers = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching all drivers")
      let allDriversData: Driver[] = []
      let page = 1
      let hasMore = true

      // Fetch all pages to get all drivers
      while (hasMore) {
        const response = await apiClient.getDrivers(page, {}, 50) // Fetch 50 per page
        allDriversData = [...allDriversData, ...response.results]
        hasMore = response.next !== null
        page++
      }

      console.log("[v0] All drivers fetched:", {
        count: allDriversData.length,
      })

      setAllDrivers(allDriversData)
      setTotalDrivers(allDriversData.length)
    } catch (error) {
      console.error("Error fetching drivers:", error)
      toast({
        title: "Xatolik",
        description: "Haydovchilarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm.trim())
    setAppliedStatusFilter(statusFilter)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSearchUsers = async () => {
    if (!searchUserQuery.trim()) {
      setSearchedUsers([])
      setHasSearchedUsers(false)
      return
    }
    setIsSearchingUsers(true)
    setCreateDriverError(null) // Clear any previous errors
    setHasSearchedUsers(true)
    try {
      console.log("[v0] Starting user search with query:", searchUserQuery.trim())
      const response = await apiClient.searchUsers(searchUserQuery.trim(), 1)
      console.log("[v0] Search response:", response)
      setSearchedUsers(response.results)

      if (response.results.length === 0) {
        console.log("[v0] No users found for query:", searchUserQuery.trim())
      }
    } catch (error: any) {
      console.error("[v0] Error searching users:", error)
      setSearchedUsers([])
      setCreateDriverError(`Qidirishda xatolik: ${error.message}`)
    } finally {
      setIsSearchingUsers(false)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Omit<CreateDriverPayload, "user_id" | "direction">,
  ) => {
    if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
      setNewDriverData((prev) => ({ ...prev, [field]: e.target.files[0] }))
    }
  }

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForDriver) {
      setCreateDriverError("Iltimos, avval foydalanuvchini tanlang.")
      return
    }
    if (
      !newDriverData.passport_photo ||
      !newDriverData.driver_license_photo ||
      !newDriverData.sts_photo ||
      !newDriverData.car_photo
    ) {
      setCreateDriverError("Iltimos, barcha rasm maydonlarini to'ldiring.")
      return
    }

    setIsCreatingDriver(true)
    setCreateDriverError(null)

    try {
      const payload: CreateDriverPayload = {
        user_id: selectedUserForDriver.id,
        direction: newDriverData.direction,
        passport_photo: newDriverData.passport_photo,
        driver_license_photo: newDriverData.driver_license_photo,
        sts_photo: newDriverData.sts_photo,
        car_photo: newDriverData.car_photo,
      }
      const createdDriver = await apiClient.createDriver(payload)
      setAllDrivers([createdDriver, ...allDrivers])
      setTotalDrivers((prev) => prev + 1)
      setIsCreateDriverDialogOpen(false)
      setCreateDriverStep(1)
      setSelectedUserForDriver(null)
      setNewDriverData({
        direction: "taxi",
        passport_photo: null as any,
        driver_license_photo: null as any,
        sts_photo: null as any,
        car_photo: null as any,
      })
    } catch (error: any) {
      console.error("Error creating driver:", error)
      setCreateDriverError(error.message || "Haydovchi yaratishda xatolik yuz berdi.")
    } finally {
      setIsCreatingDriver(false)
    }
  }

  const handleApproveDriver = async (driverId: number, approved: boolean) => {
    try {
      await apiClient.updateDriver(driverId, { is_approved: approved as any })
      setAllDrivers(
        allDrivers.map((driver) => (driver.id === driverId ? { ...driver, is_approved: approved } : driver)),
      )
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating driver:", error)
    }
  }

  const handleDeleteDriver = async (driverId: number) => {
    try {
      setDeletingDriverId(driverId)
      await apiClient.deleteDriver(driverId)
      setAllDrivers(allDrivers.filter((driver) => driver.id !== driverId))
      setTotalDrivers((prev) => prev - 1)
      toast({
        title: "Muvaffaqiyat",
        description: "Haydovchi muvaffaqiyatli o'chirildi",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Error deleting driver:", error)
      toast({
        title: "Xatolik",
        description: `Haydovchini o'chirishda xatolik: ${error.message || "Noma'lum xatolik"}`,
        variant: "destructive",
      })
    } finally {
      setDeletingDriverId(null)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAllDrivers()
    setIsRefreshing(false)
  }

  const filteredDrivers = useMemo(() => {
    let filtered = allDrivers

    // Apply search filter
    if (appliedSearchTerm.trim()) {
      const term = appliedSearchTerm.trim().toLowerCase()
      filtered = filtered.filter((driver) => {
        const name = driver.user.full_name?.toLowerCase() || ""
        const phone = driver.user.phone_number?.toLowerCase() || ""
        const telegramId = String(driver.user.telegram_id).toLowerCase()
        const driverId = String(driver.id).toLowerCase()

        return name.includes(term) || phone.includes(term) || telegramId.includes(term) || driverId.includes(term)
      })
    }

    // Apply status filter
    if (appliedStatusFilter !== "all") {
      filtered = filtered.filter((driver) =>
        appliedStatusFilter === "true" ? driver.is_approved : !driver.is_approved,
      )
    }

    return filtered
  }, [allDrivers, appliedSearchTerm, appliedStatusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE))
  const displayedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredDrivers.slice(startIndex, endIndex)
  }, [filteredDrivers, currentPage])

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

  const handleExportDrivers = () => {
    const csvContent = (
      [
        ["ID", "Ism", "Telefon", "Yo'nalish", "Holat", "Ballar", "Reyting"],
        ...filteredDrivers.map((driver) => [
          driver.id.toString(),
          driver.user.full_name || "Noma'lum",
          driver.user.phone_number || "Yo'q",
          driver.direction_display,
          driver.is_approved ? "Tasdiqlangan" : "Kutilmoqda",
          String(driver.points),
          driver.rating.toFixed(1),
        ]),
      ] as string[][]
    )
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `haydovchilar-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 gap-4">
            <div className="flex items-center space-x-4 ml-16 lg:ml-0">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Haydovchilar ro'xati</h1>
                <p className="text-sm text-gray-500">Jami {allDrivers.length.toLocaleString()} ta haydovchi</p>
              </div>
            </div>
            <div className="flex flex-col [@media(max-width:920px)]:flex-col [@media(min-width:921px)]:flex-row items-stretch [@media(max-width:920px)]:items-stretch [@media(min-width:921px)]:items-center gap-2 w-full md:w-auto">
              <Dialog open={isCreateDriverDialogOpen} onOpenChange={setIsCreateDriverDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yangi haydovchi qo'shish
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Yangi haydovchi qo'shish</DialogTitle>
                    <DialogDescription>
                      {createDriverStep === 1
                        ? "Haydovchi profilini yaratish uchun foydalanuvchini qidiring va tanlang."
                        : "Haydovchi ma'lumotlarini kiriting va hujjatlarni yuklang."}
                    </DialogDescription>
                  </DialogHeader>

                  {createDriverStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-1">
                          Foydalanuvchini qidirish (Telegram ID, ID, ism yoki telefon raqami bo'yicha)
                        </label>
                        <div className="flex space-x-2">
                          <Input
                            id="user-search"
                            placeholder="Qidiruv so'rovi..."
                            value={searchUserQuery}
                            onChange={(e) => {
                              setSearchUserQuery(e.target.value)
                              if (hasSearchedUsers) {
                                setHasSearchedUsers(false)
                                setSearchedUsers([])
                              }
                            }}
                            onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                          />
                          <Button onClick={handleSearchUsers} disabled={isSearchingUsers}>
                            {isSearchingUsers ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                            Qidirish
                          </Button>
                        </div>
                      </div>

                      {searchedUsers.length > 0 && (
                        <div className="border rounded-md max-h-60 overflow-y-auto">
                          {searchedUsers.map((user) => (
                            <div
                              key={user.id}
                              className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedUserForDriver?.id === user.id ? "bg-blue-50" : ""}`}
                              onClick={() => setSelectedUserForDriver(user)}
                            >
                              <div>
                                <p className="font-medium">{user.full_name || "Noma'lum foydalanuvchi"}</p>
                                <p className="text-sm text-gray-500">
                                  Telegram ID: {user.telegram_id} | Telefon: {user.phone_number || "Yo'q"}
                                </p>
                              </div>
                              {selectedUserForDriver?.id === user.id && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {searchedUsers.length === 0 && hasSearchedUsers && !isSearchingUsers && (
                        <div className="text-center p-4 bg-yellow-50 rounded-md">
                          <p className="text-sm text-yellow-700">
                            "{searchUserQuery}" bo'yicha foydalanuvchilar topilmadi.
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Telegram ID, to'liq ism yoki telefon raqamini tekshiring.
                          </p>
                        </div>
                      )}

                      {createDriverError && createDriverStep === 1 && (
                        <div className="text-center p-4 bg-red-50 rounded-md">
                          <p className="text-sm text-red-700">{createDriverError}</p>
                        </div>
                      )}

                      <Button
                        onClick={() => setCreateDriverStep(2)}
                        disabled={!selectedUserForDriver}
                        className="w-full"
                      >
                        Keyingi bosqich
                      </Button>
                    </div>
                  )}

                  {createDriverStep === 2 && (
                    <form onSubmit={handleCreateDriver} className="space-y-4">
                      <h4 className="font-semibold text-lg">
                        Tanlangan foydalanuvchi:{" "}
                        {selectedUserForDriver?.full_name || selectedUserForDriver?.telegram_id}
                      </h4>
                      <div>
                        <label htmlFor="direction" className="block text-sm font-medium text-gray-700">
                          Yo'nalish
                        </label>
                        <Select
                          value={newDriverData.direction}
                          onValueChange={(value) => setNewDriverData({ ...newDriverData, direction: value as "taxi" })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Yo'nalishni tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="taxi">Taksi / Pasilka</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="passport_photo" className="block text-sm font-medium text-gray-700">
                          Pasport rasmi <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="passport_photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "passport_photo")}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="driver_license_photo" className="block text-sm font-medium text-gray-700">
                          Haydovchilik guvohnomasi <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="driver_license_photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "driver_license_photo")}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="sts_photo" className="block text-sm font-medium text-gray-700">
                          STS (Avtomobil texnik pasporti) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="sts_photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "sts_photo")}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="car_photo" className="block text-sm font-medium text-gray-700">
                          Mashina rasmi <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="car_photo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "car_photo")}
                          required
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isCreatingDriver}>
                        {isCreatingDriver ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        Haydovchi yaratish
                      </Button>
                      {createDriverError && <p className="text-red-500 text-sm mt-2">{createDriverError}</p>}
                      <Button variant="outline" onClick={() => setCreateDriverStep(1)} className="w-full mt-2">
                        Ortga
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Yangilash
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportDrivers} disabled={filteredDrivers.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Eksport
              </Button>
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
                    placeholder="Haydovchi, telefon yoki ID bo'yicha qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                  <SelectItem value="false">Kutilmoqda</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Qidirish
              </Button>
            </div>
          </CardContent>
        </Card>

        {(appliedSearchTerm.trim() || appliedStatusFilter !== "all") && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Qidiruv natijasi: {filteredDrivers.length} ta haydovchi topildi
              {filteredDrivers.length !== allDrivers.length && (
                <span className="text-blue-600"> (jami {allDrivers.length} tadan)</span>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setAppliedSearchTerm("")
                setAppliedStatusFilter("all")
                setCurrentPage(1)
              }}
            >
              Barcha filtrlarni tozalash
            </Button>
          </div>
        )}

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDrivers.map((driver) => (
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
                  <span className="text-sm text-gray-600">Yo'nalish:</span>
                  <span className="text-sm">{driver.direction_display}</span>
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
                                    <strong>Yo'nalish:</strong> {selectedDriver.direction_display}
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
                              <p className="text-gray-600">Haydovchini tasdiqlash, rad etish yoki o'chirish.</p>
                              <div className="flex justify-center space-x-4">
                                {!selectedDriver.is_approved ? (
                                  <Button
                                    onClick={() => handleApproveDriver(selectedDriver.id, true)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Tasdiqlash
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleApproveDriver(selectedDriver.id, false)}
                                    variant="outline"
                                  >
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

        {totalPages > 1 && (
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredDrivers.length} tadan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredDrivers.length)} ko'rsatilmoqda
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Oldingi
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Keyingi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {displayedDrivers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {appliedSearchTerm.trim() || appliedStatusFilter !== "all"
                ? "Qidiruv bo'yicha haydovchilar topilmadi"
                : "Haydovchilar topilmadi"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {appliedSearchTerm.trim() || appliedStatusFilter !== "all"
                ? "Qidiruv shartlaringizni o'zgartiring yoki filtrlarni tozalang."
                : "Qidiruv shartlaringizni o'zgartiring"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, CheckSquare, XCircle, Search, Phone, MapPin, Calendar, Eye, Trash2, Loader2, Filter, Download, RefreshCw, DollarSign, User, Image as ImageIcon } from "lucide-react"
import { apiClient, type Order, type Driver } from "@/lib/api"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)
  const [bulkUpdating, setBulkUpdating] = useState(false)

  // Assign driver dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignOrderId, setAssignOrderId] = useState<number | null>(null)
  const [driverSearchId, setDriverSearchId] = useState<string>("")
  const [foundDriver, setFoundDriver] = useState<Driver | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [searchingDriver, setSearchingDriver] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, typeFilter])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const filters: Record<string, string> = {}

      // Default to today's orders
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      filters.date_from = `${year}-${month}-${day}`
      filters.date_to = `${year}-${month}-${day}`

      if (statusFilter !== "all") {
        filters.status = statusFilter
      }

      if (typeFilter !== "all") {
        filters.order_type = typeFilter
      }

      if (searchTerm.trim()) {
        // If search term is numeric and order type is taxi or package, search by order_number
        if (!isNaN(Number(searchTerm.trim())) && (typeFilter === "taxi" || typeFilter === "package")) {
          filters.order_number = searchTerm.trim()
        } else {
          // Otherwise, search by other fields (id, name, phone) - backend handles this general search
          filters.search = searchTerm.trim()
        }
      }

      const response = await apiClient.getOrders(currentPage, filters)
      setOrders(response.results)
      setTotalPages(Math.ceil(response.count / 20))
      setTotalOrders(response.count)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setCurrentPage(1)
    await fetchOrders()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setIsRefreshing(false)
  }

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await apiClient.updateOrder(orderId, { status: status as any })
      fetchOrders()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      setBulkUpdating(true)
      const pendingOrders = orders.filter((order) => order.status === "pending")

      for (const order of pendingOrders) {
        await apiClient.updateOrder(order.id, { status: status as any })
      }

      await fetchOrders()
    } catch (error) {
      console.error("Error bulk updating orders:", error)
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    try {
      setDeletingOrderId(orderId)
      await apiClient.deleteOrder(orderId)
      setOrders(orders.filter((order) => order.id !== orderId))
      setTotalOrders(totalOrders - 1)
    } catch (error) {
      console.error("Error deleting order:", error)
    } finally {
      setDeletingOrderId(null)
    }
  }

  const displayedOrders = orders

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Kutilmoqda
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckSquare className="w-3 h-3 mr-1" />
            Qabul qilingan
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckSquare className="w-3 h-3 mr-1" />
            Yakunlangan
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Bekor qilingan
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

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "taxi":
        return "🚕"
      case "package":
        return "📦"
      case "cargo":
        return "🚚"
      case "plane":
        return "✈️"
      case "train":
        return "🚆"
      default:
        return "📋"
    }
  }

  const getOrderTypeDisplay = (type: string) => {
    switch (type) {
      case "taxi":
        return "Taksi"
      case "package":
        return "Paket"
      case "cargo":
        return "Yuk"
      case "plane":
        return "Aviabilet"
      case "train":
        return "Poyezd"
      default:
        return "Noma'lum"
    }
  }

  const handleExportOrders = () => {
    const csvContent = [
      ["ID", "Tur", "Mijoz", "Telefon", "Holat", "Yaratilgan"],
      ...orders.map((order) => [
        order.id.toString(),
        getOrderTypeDisplay(order.order_type),
        order.full_name,
        order.phone_number,
        order.status,
        new Date(order.created_at).toLocaleDateString("uz-UZ"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `buyurtmalar-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading && currentPage === 1) {
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
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Buyurtmalar</h1>
                <p className="text-sm text-gray-500">Jami {totalOrders.toLocaleString()} ta buyurtma</p>
              </div>
            </div>
            <div className="flex flex-col [@media(max-width:920px)]:flex-col [@media(min-width:921px)]:flex-row items-stretch [@media(max-width:920px)]:items-stretch [@media(min-width:921px)]:items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Yangilash
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportOrders} disabled={orders.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Eksport
              </Button>
              {orders.some((o) => o.status === "pending") && (
                <Button size="sm" onClick={() => handleBulkStatusUpdate("accepted")} disabled={bulkUpdating} className="bg-blue-600 hover:bg-blue-700">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Barchasini qabul qilish
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 backdrop-blur-sm border shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buyurtma ID, ism yoki telefon bo'yicha qidirish..."
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
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="accepted">Qabul qilingan</SelectItem>
                  <SelectItem value="completed">Yakunlangan</SelectItem>
                  <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                  <SelectItem value="rejected">Rad etilgan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tur bo'yicha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha turlar</SelectItem>
                  <SelectItem value="taxi">Taksi</SelectItem>
                  <SelectItem value="package">Paket</SelectItem>
                  <SelectItem value="cargo">Yuk</SelectItem>
                  <SelectItem value="plane">Aviabilet</SelectItem>
                  <SelectItem value="train">Poyezd</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                Qidirish
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jami buyurtmalar</p>
                  <p className="text-2xl font-bold text-blue-600">{totalOrders.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Kutilmoqda</p>
                  <p className="text-2xl font-bold text-yellow-600">{orders.filter((o) => o.status === "pending").length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Qabul qilingan</p>
                  <p className="text-2xl font-bold text-blue-600">{orders.filter((o) => o.status === "accepted").length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Yakunlangan</p>
                  <p className="text-2xl font-bold text-green-600">{orders.filter((o) => o.status === "completed").length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sahifadagi</p>
                  <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOrders.map((order) => (
            <Card key={order.id} className="bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getOrderTypeIcon(order.order_type)}</span>
                    <div>
                      <CardTitle className="text-lg">#{order.order_number || order.id}</CardTitle>
                      <CardDescription>{getOrderTypeDisplay(order.order_type)}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mijoz:</span>
                  <span className="font-medium">{order.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    Telefon:
                  </span>
                  <span className="font-medium">{order.phone_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Manzil:
                  </span>
                  <span className="text-sm text-right max-w-32 truncate" title={order.from_location || order.from_region || ""}>
                    {(order.from_location || order.from_region || "") + " → " + (order.to_location || order.to_region || "")}
                  </span>
                  </div>
                {order.driver && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Haydovchi:
                    </span>
                    <span className="text-sm font-medium">{order.driver.user.full_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Yaratilgan:
                  </span>
                  <span className="text-sm">{new Date(order.created_at).toLocaleDateString("uz-UZ")}</span>
                </div>
                <div className="pt-3 border-t flex space-x-2">
                  <Dialog
                    open={isDialogOpen && selectedOrder?.id === order.id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setSelectedOrder(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ko'rish
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Buyurtma ma'lumotlari</DialogTitle>
                        <DialogDescription>#{selectedOrder?.order_number || selectedOrder?.id} buyurtmaning to'liq ma'lumotlari</DialogDescription>
                      </DialogHeader>

                      {selectedOrder && (
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Asosiy ma'lumotlar</TabsTrigger>
                            <TabsTrigger value="details">Batafsil</TabsTrigger>
                            <TabsTrigger value="actions">Amallar</TabsTrigger>
                          </TabsList>

                          <TabsContent value="info" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Mijoz ma'lumotlari</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>To'liq ism:</strong> {selectedOrder.full_name}
                                  </div>
                                  <div>
                                    <strong>Telefon:</strong> {selectedOrder.phone_number}
                                  </div>
                                  <div>
                                    <strong>Buyurtma turi:</strong> {getOrderTypeDisplay(selectedOrder.order_type)}
                                  </div>
                                  <div>
                                    <strong>Holat:</strong> {getStatusBadge(selectedOrder.status)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Manzil ma'lumotlari</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Qayerdan:</strong> {selectedOrder.from_location || selectedOrder.from_region || ""}
                                  </div>
                                  <div>
                                    <strong>Qayerga:</strong> {selectedOrder.to_location || selectedOrder.to_region || ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="details" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                <h4 className="font-semibold mb-2">Qo'shimcha ma'lumotlar</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <strong>Buyurtma ID:</strong> #{selectedOrder.order_number || selectedOrder.id}
                                      </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <strong>Turi:</strong> {getOrderTypeDisplay(selectedOrder.order_type)}
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <strong>Holat:</strong> {selectedOrder.status}
                                </div>
                                    {selectedOrder.num_passengers && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <strong>Yo'lovchilar soni:</strong> {selectedOrder.num_passengers}
                                      </div>
                                    )}
                                    {selectedOrder.item_description && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <strong>Mahsulot tavsifi:</strong> {selectedOrder.item_description}
                                      </div>
                                    )}
                                    {selectedOrder.weight_tons && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <strong>Yuk og'irligi:</strong> {selectedOrder.weight_tons} tonna
                                      </div>
                                    )}
                                    {selectedOrder.payment_amount && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <strong>To'lov miqdori:</strong> {selectedOrder.payment_amount}
                                      </div>
                                    )}
                                    {selectedOrder.terms && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <strong>Shartlar:</strong> {selectedOrder.terms}
                                      </div>
                                    )}
                                    {selectedOrder.comment && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <strong>Izoh:</strong> {selectedOrder.comment}
                                      </div>
                                    )}
                                  {selectedOrder.claimed_by && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <strong>Qabul qilgan haydovchi:</strong> {selectedOrder.claimed_by.user.full_name} (ID: {selectedOrder.claimed_by.id})
                                    </div>
                                  )}
                                  {selectedOrder.claimed_at && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <strong>Qabul qilingan vaqti:</strong> {new Date(selectedOrder.claimed_at).toLocaleString("uz-UZ")}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {(selectedOrder.order_type === "plane" || selectedOrder.order_type === "train") && selectedOrder.passport_urls && selectedOrder.passport_urls.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Pasport rasmlari</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {selectedOrder.passport_urls.map((url, index) => (
                                      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                        <img src={url} alt={`Passport ${index + 1}`} className="object-cover object-center w-full h-full" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="actions" className="space-y-4">
                            <div className="text-center space-y-4">
                              <p className="text-gray-600">Buyurtma holatini o'zgartirish, haydovchi biriktirish yoki o'chirish.</p>
                              <div className="flex flex-wrap justify-center gap-2">
                                <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "accepted")} className="bg-blue-600 hover:bg-blue-700" disabled={selectedOrder.status === "accepted"}>
                                    Qabul qilish
                                  </Button>
                                <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "completed")} className="bg-green-600 hover:bg-green-700" disabled={selectedOrder.status === "completed"}>
                                    Yakunlash
                                  </Button>
                                <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "cancelled")} variant="outline" disabled={selectedOrder.status === "cancelled"}>
                                    Bekor qilish
                                  </Button>
                                <Button onClick={() => handleUpdateOrderStatus(selectedOrder.id, "rejected")} variant="destructive" disabled={selectedOrder.status === "rejected"}>
                                    Rad etish
                                  </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAssignOrderId(selectedOrder.id)
                                    setAssignDialogOpen(true)
                                    setFoundDriver(null)
                                    setDriverSearchId("")
                                  }}
                                >
                                  Haydovchi belgilash
                                </Button>
                              </div>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                  <Button variant="destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                    O'chirish
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Buyurtmani o'chirish</AlertDialogTitle>
                                      <AlertDialogDescription>
                                      Haqiqatan ham <strong>#{selectedOrder.order_number || selectedOrder.id}</strong> buyurtmani o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi va barcha ma'lumotlar yo'qoladi.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          handleDeleteOrder(selectedOrder.id)
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
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingOrderId === order.id}>
                        {deletingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Buyurtmani o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          Haqiqatan ham <strong>#{order.order_number || order.id}</strong> buyurtmani o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi va barcha ma'lumotlar yo'qoladi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">
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
                  {totalOrders} tadan {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalOrders)} ko'rsatilmoqda
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || isLoading}>
                    Oldingi
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Keyingi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {displayedOrders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Buyurtmalar topilmadi</h3>
            <p className="mt-1 text-sm text-gray-500">Qidiruv shartlaringizni o'zgartiring</p>
          </div>
        )}
      </main>

      {/* Assign driver dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Haydovchi belgilash</DialogTitle>
            <DialogDescription>Haydovchi ID bo'yicha qidiring va tanlang.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Haydovchi ID (faqat raqam)"
                value={driverSearchId}
                onChange={(e) => setDriverSearchId(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyPress={(e) => e.key === "Enter" && handleSearchDriver()}
              />
              <Button onClick={handleSearchDriver} disabled={!driverSearchId || searchingDriver}>
                {searchingDriver ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {foundDriver && (
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                    {foundDriver.user.full_name?.charAt(0) || "H"}
                  </div>
                  <div>
                    <div className="font-medium">{foundDriver.user.full_name || "Noma'lum haydovchi"}</div>
                    <div className="text-xs text-gray-500">ID: {foundDriver.id}</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAssignDriver} disabled={assigning}>
                    {assigning ? "Biriktirilmoqda..." : "Biriktirish"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  async function handleSearchDriver() {
    try {
      if (!driverSearchId) return
      setSearchingDriver(true)
      const page1 = await apiClient.getDrivers(1, { is_approved: true })
      const found = page1.results.find((d) => d.id === Number(driverSearchId)) || null
      setFoundDriver(found || null)
    } catch (e) {
      console.error("Driver search error:", e)
      setFoundDriver(null)
    } finally {
      setSearchingDriver(false)
    }
  }

  async function handleAssignDriver() {
    try {
      if (!assignOrderId || !foundDriver) return
      setAssigning(true)
      await apiClient.updateOrder(assignOrderId, { driver_id: foundDriver.id })
      setAssignDialogOpen(false)
      setFoundDriver(null)
      setDriverSearchId("")
      await fetchOrders()
    } catch (e) {
      console.error("Assign error:", e)
    } finally {
      setAssigning(false)
    }
  }
}

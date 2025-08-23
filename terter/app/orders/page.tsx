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
import {
  Package,
  Search,
  Eye,
  Phone,
  MapPin,
  Calendar,
  User,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Loader2,
} from "lucide-react"
import { apiClient, type Order } from "@/lib/api"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, typeFilter])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const filters: Record<string, string> = {}

      if (statusFilter !== "all") {
        filters.status = statusFilter
      }

      if (typeFilter !== "all") {
        filters.order_type = typeFilter
      }

      const response = await apiClient.getOrders(1, filters)
      setOrders(response.results)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
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

  const handleDeleteOrder = async (orderId: number) => {
    try {
      setDeletingOrderId(orderId)
      await apiClient.deleteOrder(orderId)
      setOrders(orders.filter((order) => order.id !== orderId))
    } catch (error) {
      console.error("Error deleting order:", error)
    } finally {
      setDeletingOrderId(null)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_number.includes(searchTerm) ||
      order.id.toString().includes(searchTerm),
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
      case "accepted":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Qabul qilingan
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
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
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Noma'lum
          </Badge>
        )
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
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Buyurtmalar</h1>
                <p className="text-sm text-gray-500">Barcha buyurtmalarni boshqarish</p>
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
                    placeholder="Buyurtma ID, ism yoki telefon bo'yicha qidirish..."
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
            </div>
          </CardContent>
        </Card>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover-lift"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getOrderTypeIcon(order.order_type)}</span>
                    <div>
                      <CardTitle className="text-lg">#{order.id}</CardTitle>
                      <CardDescription>{order.order_type_display}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    Mijoz:
                  </span>
                  <span className="font-medium text-sm">{order.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    Telefon:
                  </span>
                  <span className="text-sm">{order.phone_number}</span>
                </div>
                {order.from_location && order.to_location && (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-3 h-3 mr-1 text-green-600" />
                      <span className="text-gray-600">Dan:</span>
                      <span className="ml-1 font-medium">{order.from_location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-3 h-3 mr-1 text-red-600" />
                      <span className="text-gray-600">Ga:</span>
                      <span className="ml-1 font-medium">{order.to_location}</span>
                    </div>
                  </div>
                )}
                {order.driver && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Car className="w-3 h-3 mr-1" />
                      Haydovchi:
                    </span>
                    <span className="text-sm font-medium">{order.driver.user.full_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Sana:
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ko'rish
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Buyurtma #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                          {selectedOrder?.order_type_display} buyurtmasi haqida to'liq ma'lumot
                        </DialogDescription>
                      </DialogHeader>

                      {selectedOrder && (
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Ma'lumotlar</TabsTrigger>
                            <TabsTrigger value="details">Tafsilotlar</TabsTrigger>
                            <TabsTrigger value="actions">Amallar</TabsTrigger>
                          </TabsList>

                          <TabsContent value="info" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Mijoz ma'lumotlari</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Ism:</strong> {selectedOrder.full_name}
                                  </div>
                                  <div>
                                    <strong>Telefon:</strong> {selectedOrder.phone_number}
                                  </div>
                                  <div>
                                    <strong>Telegram:</strong> {selectedOrder.user.full_name || "Noma'lum"}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Buyurtma ma'lumotlari</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Tur:</strong> {selectedOrder.order_type_display}
                                  </div>
                                  <div>
                                    <strong>Holat:</strong> {selectedOrder.status_display}
                                  </div>
                                  <div>
                                    <strong>Yaratilgan:</strong>{" "}
                                    {new Date(selectedOrder.created_at).toLocaleString("uz-UZ")}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {selectedOrder.driver && (
                              <div>
                                <h4 className="font-semibold mb-2">Haydovchi ma'lumotlari</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <strong>Ism:</strong> {selectedOrder.driver.user.full_name}
                                    </div>
                                    <div>
                                      <strong>Telefon:</strong> {selectedOrder.driver.user.phone_number}
                                    </div>
                                    <div>
                                      <strong>Mashina:</strong> {selectedOrder.driver.car_make}
                                    </div>
                                    <div>
                                      <strong>Raqam:</strong> {selectedOrder.driver.car_number}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="details" className="space-y-4">
                            <div className="space-y-4">
                              {(selectedOrder.from_location || selectedOrder.to_location) && (
                                <div>
                                  <h4 className="font-semibold mb-2">Manzillar</h4>
                                  <div className="space-y-2 text-sm">
                                    {selectedOrder.from_country && (
                                      <div>
                                        <strong>Qayerdan (davlat):</strong> {selectedOrder.from_country}
                                      </div>
                                    )}
                                    {selectedOrder.from_region && (
                                      <div>
                                        <strong>Qayerdan (viloyat):</strong> {selectedOrder.from_region}
                                      </div>
                                    )}
                                    {selectedOrder.from_location && (
                                      <div>
                                        <strong>Qayerdan (manzil):</strong> {selectedOrder.from_location}
                                      </div>
                                    )}
                                    {selectedOrder.to_country && (
                                      <div>
                                        <strong>Qayerga (davlat):</strong> {selectedOrder.to_country}
                                      </div>
                                    )}
                                    {selectedOrder.to_region && (
                                      <div>
                                        <strong>Qayerga (viloyat):</strong> {selectedOrder.to_region}
                                      </div>
                                    )}
                                    {selectedOrder.to_location && (
                                      <div>
                                        <strong>Qayerga (manzil):</strong> {selectedOrder.to_location}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {(selectedOrder.num_passengers ||
                                selectedOrder.item_description ||
                                selectedOrder.weight_tons) && (
                                <div>
                                  <h4 className="font-semibold mb-2">Qo'shimcha ma'lumotlar</h4>
                                  <div className="space-y-2 text-sm">
                                    {selectedOrder.num_passengers && (
                                      <div>
                                        <strong>Yo'lovchilar soni:</strong> {selectedOrder.num_passengers}
                                      </div>
                                    )}
                                    {selectedOrder.item_description && (
                                      <div>
                                        <strong>Yuborilayotgan narsa:</strong> {selectedOrder.item_description}
                                      </div>
                                    )}
                                    {selectedOrder.weight_tons && (
                                      <div>
                                        <strong>Vazn:</strong> {selectedOrder.weight_tons} tonna
                                      </div>
                                    )}
                                    {selectedOrder.payment_amount && (
                                      <div>
                                        <strong>To'lov miqdori:</strong> {selectedOrder.payment_amount}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {(selectedOrder.terms || selectedOrder.comment) && (
                                <div>
                                  <h4 className="font-semibold mb-2">Shartlar va izohlar</h4>
                                  <div className="space-y-2 text-sm">
                                    {selectedOrder.terms && (
                                      <div>
                                        <strong>Shartlar:</strong> {selectedOrder.terms}
                                      </div>
                                    )}
                                    {selectedOrder.comment && (
                                      <div>
                                        <strong>Izoh:</strong> {selectedOrder.comment}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="actions" className="space-y-4">
                            <div className="text-center space-y-4">
                              <p className="text-gray-600">
                                Buyurtma holatini o'zgartirish yoki o'chirish uchun quyidagi tugmalardan foydalaning
                              </p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {selectedOrder.status !== "accepted" && (
                                  <Button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "accepted")}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Qabul qilish
                                  </Button>
                                )}
                                {selectedOrder.status !== "completed" && (
                                  <Button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "completed")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Yakunlash
                                  </Button>
                                )}
                                {selectedOrder.status !== "cancelled" && (
                                  <Button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "cancelled")}
                                    variant="outline"
                                  >
                                    Bekor qilish
                                  </Button>
                                )}
                                {selectedOrder.status !== "rejected" && (
                                  <Button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "rejected")}
                                    variant="destructive"
                                  >
                                    Rad etish
                                  </Button>
                                )}
                              </div>
                              <div className="border-t pt-4">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Buyurtmani o'chirish
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Buyurtmani o'chirish</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Haqiqatan ham <strong>#{selectedOrder.id}</strong> buyurtmani o'chirmoqchimisiz?
                                        Bu amalni bekor qilib bo'lmaydi va barcha ma'lumotlar yo'qoladi.
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
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingOrderId === order.id}>
                        {deletingOrderId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Buyurtmani o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          Haqiqatan ham <strong>#{order.id}</strong> buyurtmani o'chirmoqchimisiz? Bu amalni bekor qilib
                          bo'lmaydi va barcha ma'lumotlar yo'qoladi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteOrder(order.id)}
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

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Buyurtmalar topilmadi</h3>
            <p className="mt-1 text-sm text-gray-500">Qidiruv shartlaringizni o'zgartiring</p>
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coins, Plus, Search, Calendar, TrendingUp, TrendingDown, Trash2, Loader2 } from "lucide-react"
import { apiClient, type PointTransaction, type Driver } from "@/lib/api"

export default function PointsPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null)

  // Form state
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [transactionType, setTransactionType] = useState<"add" | "deduct">("add")
  const [reason, setReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [typeFilter])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const filters: Record<string, string> = {}

      if (typeFilter !== "all") {
        filters.transaction_type = typeFilter
      }

      const [transactionsResponse, driversResponse] = await Promise.all([
        apiClient.getPointTransactions(1, filters),
        apiClient.getDrivers(),
      ])

      setTransactions(transactionsResponse.results)
      setDrivers(driversResponse.results)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTransaction = async () => {
    if (!selectedDriverId || !amount || !transactionType) return

    try {
      setIsSubmitting(true)
      await apiClient.createPointTransaction({
        driver_id: Number.parseInt(selectedDriverId),
        amount: Number.parseInt(amount),
        transaction_type: transactionType,
        reason: reason || null,
      })

      // Reset form
      setSelectedDriverId("")
      setAmount("")
      setTransactionType("add")
      setReason("")
      setIsDialogOpen(false)

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error creating transaction:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      setDeletingTransactionId(transactionId)
      await apiClient.deletePointTransaction(transactionId)
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId))
    } catch (error) {
      console.error("Error deleting transaction:", error)
    } finally {
      setDeletingTransactionId(null)
    }
  }

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.driver.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.driver.car_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTransactionBadge = (type: string) => {
    return type === "add" ? (
      <Badge className="bg-green-100 text-green-800">
        <TrendingUp className="w-3 h-3 mr-1" />
        Qo'shildi
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <TrendingDown className="w-3 h-3 mr-1" />
        Ayirildi
      </Badge>
    )
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
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-2 rounded-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ball tranzaksiyalari</h1>
                <p className="text-sm text-gray-500">Haydovchilar ballarini boshqarish</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Yangi tranzaksiya
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi ball tranzaksiyasi</DialogTitle>
                  <DialogDescription>Haydovchiga ball qo'shish yoki ayirish uchun forma to'ldiring</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driver">Haydovchi</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Haydovchini tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.user.full_name || "Noma'lum"} - {driver.car_number} ({driver.points} ball)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Tranzaksiya turi</Label>
                    <Select
                      value={transactionType}
                      onValueChange={(value: "add" | "deduct") => setTransactionType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Ball qo'shish</SelectItem>
                        <SelectItem value="deduct">Ball ayirish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Ball miqdori</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Masalan: 10"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Sabab (ixtiyoriy)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Tranzaksiya sababini kiriting..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Bekor qilish
                    </Button>
                    <Button onClick={handleCreateTransaction} disabled={!selectedDriverId || !amount || isSubmitting}>
                      {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                    placeholder="Haydovchi, mashina raqami yoki sabab bo'yicha qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tur bo'yicha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha turlar</SelectItem>
                  <SelectItem value="add">Qo'shilgan</SelectItem>
                  <SelectItem value="deduct">Ayirilgan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={transaction.driver.passport_photo_url || ""} />
                      <AvatarFallback>{transaction.driver.user.full_name?.charAt(0) || "H"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {transaction.driver.user.full_name || "Noma'lum haydovchi"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.driver.car_make} - {transaction.driver.car_number}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(transaction.created_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-2 flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        {getTransactionBadge(transaction.transaction_type)}
                        <span
                          className={`text-2xl font-bold ${
                            transaction.transaction_type === "add" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.transaction_type === "add" ? "+" : "-"}
                          {transaction.amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Joriy ball: <span className="font-semibold">{transaction.driver.points}</span>
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingTransactionId === transaction.id}>
                          {deletingTransactionId === transaction.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tranzaksiyani o'chirish</AlertDialogTitle>
                          <AlertDialogDescription>
                            Haqiqatan ham bu tranzaksiyani o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi va
                            tranzaksiya tarixi yo'qoladi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            O'chirish
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {transaction.reason && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Sabab:</strong> {transaction.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Coins className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tranzaksiyalar topilmadi</h3>
            <p className="mt-1 text-sm text-gray-500">
              Qidiruv shartlaringizni o'zgartiring yoki yangi tranzaksiya yarating
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

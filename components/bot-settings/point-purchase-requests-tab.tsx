"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, RefreshCw, Filter, Eye, ImageIcon } from "lucide-react"
import { apiClient, type PointPurchaseRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PointPurchaseRequestsTab() {
  const [requests, setRequests] = useState<PointPurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PointPurchaseRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const params: { status?: "pending" | "approved" | "rejected" } = {}
      if (statusFilter !== "all") {
        params.status = statusFilter as "pending" | "approved" | "rejected"
      }
      const data = await apiClient.getPointPurchaseRequests(params)
      setRequests(data.results)
    } catch (error) {
      console.error("Error fetching point purchase requests:", error)
      toast({
        title: "Xatolik",
        description: "Ball sotib olish so'rovlarini yuklashda xatolik yuz berdi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "approved":
        return "text-green-600 bg-green-50 border-green-200"
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Ball Sotib Olish So'rovlari</span>
        </CardTitle>
        <CardDescription>Haydovchilarning ball sotib olish so'rovlarini ko'rish</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Holat bo'yicha filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="approved">Tasdiqlangan</SelectItem>
                <SelectItem value="rejected">Rad etilgan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={fetchRequests}
            disabled={isLoading}
            variant="outline"
            className="w-full md:w-auto bg-transparent"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Yangilash
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <AlertDescription>Hozircha hech qanday ball sotib olish so'rovlari yo'q.</AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Haydovchi</TableHead>
                  <TableHead>Ball Toifasi</TableHead>
                  <TableHead>Karta Raqami</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Yaratilgan vaqt</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      {request.driver?.user?.full_name || `ID: ${request.driver?.user?.telegram_id}`}
                    </TableCell>
                    <TableCell>
                      {request.point_price?.name} ({request.point_price?.point_amount} ball)
                    </TableCell>
                    <TableCell>{request.card_number}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}
                      >
                        {request.status_display}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Dialog onOpenChange={(open) => !open && setSelectedRequest(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedRequest && (
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Ball Sotib Olish So'rovi #{selectedRequest.id}</DialogTitle>
                              <DialogDescription>
                                Haydovchining ball sotib olish so'rovi tafsilotlari.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Haydovchi:</Label>
                                <span className="col-span-3">
                                  {selectedRequest.driver?.user?.full_name ||
                                    `ID: ${selectedRequest.driver?.user?.telegram_id}`}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Ball Toifasi:</Label>
                                <span className="col-span-3">
                                  {selectedRequest.point_price?.name} ({selectedRequest.point_price?.point_amount} ball,{" "}
                                  {selectedRequest.point_price?.final_price} so'm)
                                </span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Karta Raqami:</Label>
                                <span className="col-span-3">{selectedRequest.card_number}</span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Holat:</Label>
                                <span
                                  className={`col-span-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}
                                >
                                  {selectedRequest.status_display}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Yaratilgan vaqt:</Label>
                                <span className="col-span-3">
                                  {new Date(selectedRequest.created_at).toLocaleString()}
                                </span>
                              </div>
                              {selectedRequest.admin_comment && (
                                <div className="grid grid-cols-4 items-start gap-4">
                                  <Label className="text-right">Admin Izohi:</Label>
                                  <span className="col-span-3">{selectedRequest.admin_comment}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right">Chek rasmi:</Label>
                                <div className="col-span-3">
                                  {selectedRequest.receipt_photo_url ? (
                                    <a
                                      href={selectedRequest.receipt_photo_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Image
                                        src={selectedRequest.receipt_photo_url || "/placeholder.svg"}
                                        alt="To'lov cheki"
                                        width={150}
                                        height={150}
                                        className="rounded-md border object-cover"
                                      />
                                    </a>
                                  ) : (
                                    <span>Rasm mavjud emas</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={() => setSelectedRequest(null)}>Yopish</Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

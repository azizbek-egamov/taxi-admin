"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, PlusCircle, Pencil, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient, type PointPrice } from "@/lib/api"

export default function PointPricesTab() {
  const [pointPrices, setPointPrices] = useState<PointPrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<PointPrice | null>(null)

  // Form state for new/edit
  const [name, setName] = useState("")
  const [service, setService] = useState<"cargo" | "taxi_package">("cargo")
  const [pointAmount, setPointAmount] = useState(0)
  const [price, setPrice] = useState(0)
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [orderNumber, setOrderNumber] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isPopular, setIsPopular] = useState(false)
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchPointPrices()
  }, [])

  const fetchPointPrices = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getPointPrices()
      setPointPrices(response.results)
    } catch (error) {
      console.error("Error fetching point prices:", error)
      setMessage({ type: "error", text: "Ball narxlarini yuklashda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditingPrice(null)
    setName("")
    setService("cargo")
    setPointAmount(0)
    setPrice(0)
    setDiscountPercentage(0)
    setOrderNumber(0)
    setIsActive(true)
    setIsPopular(false)
    setDescription("")
    setMessage(null)
  }

  const handleEdit = (price: PointPrice) => {
    setEditingPrice(price)
    setName(price.name)
    setService(price.service)
    setPointAmount(price.point_amount)
    setPrice(price.price)
    setDiscountPercentage(price.discount_percentage)
    setOrderNumber(price.order_number)
    setIsActive(price.is_active)
    setIsPopular(price.is_popular)
    setDescription(price.description || "")
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham bu ball narxini o'chirmoqchimisiz?")) return

    try {
      setIsLoading(true)
      await apiClient.deletePointPrice(id)
      setMessage({ type: "success", text: "Ball narxi muvaffaqiyatli o'chirildi" })
      fetchPointPrices()
    } catch (error) {
      console.error("Error deleting point price:", error)
      setMessage({ type: "error", text: "Ball narxini o'chirishda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const data = {
      name,
      service,
      point_amount: pointAmount,
      price,
      discount_percentage: discountPercentage,
      order_number: orderNumber,
      is_active: isActive,
      is_popular: isPopular,
      description,
    }

    try {
      if (editingPrice) {
        await apiClient.updatePointPrice(editingPrice.id, data)
        setMessage({ type: "success", text: "Ball narxi muvaffaqiyatli yangilandi" })
      } else {
        await apiClient.createPointPrice(data)
        setMessage({ type: "success", text: "Ball narxi muvaffaqiyatli qo'shildi" })
      }
      setDialogOpen(false)
      resetForm()
      fetchPointPrices()
    } catch (error: any) {
      console.error("Error saving point price:", error)
      setMessage({ type: "error", text: error.message || "Ball narxini saqlashda xatolik yuz berdi" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Ball Narxlari</span>
        </CardTitle>
        <CardDescription>Haydovchilar uchun ball narxlarini boshqarish</CardDescription>
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

        <div className="flex justify-end mb-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Yangi narx qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingPrice ? "Ball narxini tahrirlash" : "Yangi ball narxi qo'shish"}</DialogTitle>
                <DialogDescription>Ball narxi ma'lumotlarini kiriting.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nomi
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">
                    Xizmat turi
                  </Label>
                  <Select value={service} onValueChange={(value: "cargo" | "taxi_package") => setService(value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Xizmat turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cargo">🚚 Gruz</SelectItem>
                      <SelectItem value="taxi_package">🚕 Taksi / 📦 Pasilka</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pointAmount" className="text-right">
                    Ball miqdori
                  </Label>
                  <Input
                    id="pointAmount"
                    type="number"
                    value={pointAmount}
                    onChange={(e) => setPointAmount(Number.parseInt(e.target.value) || 0)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Narxi
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number.parseInt(e.target.value) || 0)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discountPercentage" className="text-right">
                    Chegirma (%)
                  </Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number.parseInt(e.target.value) || 0)}
                    className="col-span-3"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="orderNumber" className="text-right">
                    Tartib raqami
                  </Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(Number.parseInt(e.target.value) || 0)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">
                    Faol
                  </Label>
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isPopular" className="text-right">
                    Mashhur
                  </Label>
                  <Switch id="isPopular" checked={isPopular} onCheckedChange={setIsPopular} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Tavsif
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      "Saqlash"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : pointPrices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Hech qanday ball narxi topilmadi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Xizmat</TableHead>
                  <TableHead>Ball</TableHead>
                  <TableHead>Narxi</TableHead>
                  <TableHead>Chegirma (%)</TableHead>
                  <TableHead>Yakuniy narx</TableHead>
                  <TableHead>Tartib raqami</TableHead>
                  <TableHead>Faol</TableHead>
                  <TableHead>Mashhur</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointPrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">{price.name}</TableCell>
                    <TableCell>{price.service_display}</TableCell>
                    <TableCell>{price.point_amount}</TableCell>
                    <TableCell>{price.price}</TableCell>
                    <TableCell>{price.discount_percentage}%</TableCell>
                    <TableCell className="font-semibold">{price.final_price}</TableCell>
                    <TableCell>{price.order_number}</TableCell>
                    <TableCell>{price.is_active ? "Ha" : "Yo'q"}</TableCell>
                    <TableCell>{price.is_popular ? "Ha" : "Yo'q"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(price)} className="mr-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(price.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

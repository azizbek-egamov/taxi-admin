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
import { Switch } from "@/components/ui/switch"
import { CreditCard, PlusCircle, Pencil, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient, type Card as CardType } from "@/lib/api" // Renamed to CardType to avoid conflict with component

export default function CardsTab() {
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardType | null>(null)

  // Form state for new/edit
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [bankName, setBankName] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getCards()
      setCards(response.results)
    } catch (error) {
      console.error("Error fetching cards:", error)
      setMessage({ type: "error", text: "Kartalarni yuklashda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditingCard(null)
    setCardNumber("")
    setCardHolderName("")
    setBankName("")
    setIsActive(true)
    setMessage(null)
  }

  const handleEdit = (card: CardType) => {
    setEditingCard(card)
    setCardNumber(card.card_number)
    setCardHolderName(card.card_holder_name)
    setBankName(card.bank_name)
    setIsActive(card.is_active)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham bu kartani o'chirmoqchimisiz?")) return

    try {
      setIsLoading(true)
      await apiClient.deleteCard(id)
      setMessage({ type: "success", text: "Karta muvaffaqiyatli o'chirildi" })
      fetchCards()
    } catch (error) {
      console.error("Error deleting card:", error)
      setMessage({ type: "error", text: "Kartani o'chirishda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const data = {
      card_number: cardNumber,
      card_holder_name: cardHolderName,
      bank_name: bankName,
      is_active: isActive,
    }

    try {
      if (editingCard) {
        await apiClient.updateCard(editingCard.id, data)
        setMessage({ type: "success", text: "Karta muvaffaqiyatli yangilandi" })
      } else {
        await apiClient.createCard(data)
        setMessage({ type: "success", text: "Karta muvaffaqiyatli qo'shildi" })
      }
      setDialogOpen(false)
      resetForm()
      fetchCards()
    } catch (error: any) {
      console.error("Error saving card:", error)
      setMessage({ type: "error", text: error.message || "Kartani saqlashda xatolik yuz berdi" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>To'lov Kartalari</span>
        </CardTitle>
        <CardDescription>Tizimda ishlatiladigan to'lov kartalarini boshqarish</CardDescription>
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
                Yangi karta qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingCard ? "Kartani tahrirlash" : "Yangi karta qo'shish"}</DialogTitle>
                <DialogDescription>Karta ma'lumotlarini kiriting.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardNumber" className="text-right">
                    Karta raqami
                  </Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="col-span-3"
                    required
                    maxLength={16}
                    pattern="\d{16}"
                    title="16 xonali raqam kiriting"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cardHolderName" className="text-right">
                    Karta egasi
                  </Label>
                  <Input
                    id="cardHolderName"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bankName" className="text-right">
                    Bank nomi
                  </Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
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
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Hech qanday karta topilmadi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karta raqami</TableHead>
                  <TableHead>Karta egasi</TableHead>
                  <TableHead>Bank nomi</TableHead>
                  <TableHead>Faol</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.card_number}</TableCell>
                    <TableCell>{card.card_holder_name}</TableCell>
                    <TableCell>{card.bank_name}</TableCell>
                    <TableCell>{card.is_active ? "Ha" : "Yo'q"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(card)} className="mr-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)}>
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

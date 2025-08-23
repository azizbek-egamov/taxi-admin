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
import { Globe, PlusCircle, Pencil, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient, type Country } from "@/lib/api"

export default function CountriesTab() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)

  // Form state for new/edit
  const [code, setCode] = useState("")
  const [nameUz, setNameUz] = useState("")
  const [nameRu, setNameRu] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [nameTj, setNameTj] = useState("")
  const [nameKz, setNameKz] = useState("")

  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getCountries()
      setCountries(response.results)
    } catch (error) {
      console.error("Error fetching countries:", error)
      setMessage({ type: "error", text: "Davlatlarni yuklashda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditingCountry(null)
    setCode("")
    setNameUz("")
    setNameRu("")
    setNameEn("")
    setNameTj("")
    setNameKz("")
    setMessage(null)
  }

  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setCode(country.code)
    setNameUz(country.name_uz)
    setNameRu(country.name_ru)
    setNameEn(country.name_en)
    setNameTj(country.name_tj)
    setNameKz(country.name_kz)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham bu davlatni o'chirmoqchimisiz?")) return

    try {
      setIsLoading(true)
      await apiClient.deleteCountry(id)
      setMessage({ type: "success", text: "Davlat muvaffaqiyatli o'chirildi" })
      fetchCountries()
    } catch (error) {
      console.error("Error deleting country:", error)
      setMessage({ type: "error", text: "Davlatni o'chirishda xatolik yuz berdi" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const data = {
      code,
      name_uz: nameUz,
      name_ru: nameRu,
      name_en: nameEn,
      name_tj: nameTj,
      name_kz: nameKz,
    }

    try {
      if (editingCountry) {
        await apiClient.updateCountry(editingCountry.id, data)
        setMessage({ type: "success", text: "Davlat muvaffaqiyatli yangilandi" })
      } else {
        await apiClient.createCountry(data)
        setMessage({ type: "success", text: "Davlat muvaffaqiyatli qo'shildi" })
      }
      setDialogOpen(false)
      resetForm()
      fetchCountries()
    } catch (error: any) {
      console.error("Error saving country:", error)
      setMessage({ type: "error", text: error.message || "Davlatni saqlashda xatolik yuz berdi" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Davlat/Viloyat/Shahar</span>
        </CardTitle>
        <CardDescription>Davlatlar, viloyatlar va shaharlarni boshqarish</CardDescription>
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
                Yangi davlat qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingCountry ? "Davlatni tahrirlash" : "Yangi davlat qo'shish"}</DialogTitle>
                <DialogDescription>Davlat ma'lumotlarini kiriting.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Kodi
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nameUz" className="text-right">
                    Nomi (O'zbek)
                  </Label>
                  <Input
                    id="nameUz"
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nameRu" className="text-right">
                    Nomi (Rus)
                  </Label>
                  <Input
                    id="nameRu"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nameEn" className="text-right">
                    Nomi (Ingliz)
                  </Label>
                  <Input
                    id="nameEn"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nameTj" className="text-right">
                    Nomi (Tojik)
                  </Label>
                  <Input
                    id="nameTj"
                    value={nameTj}
                    onChange={(e) => setNameTj(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nameKz" className="text-right">
                    Nomi (Qozoq)
                  </Label>
                  <Input
                    id="nameKz"
                    value={nameKz}
                    onChange={(e) => setNameKz(e.target.value)}
                    className="col-span-3"
                    required
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
        ) : countries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Hech qanday davlat topilmadi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kodi</TableHead>
                  <TableHead>Nomi (O'zbek)</TableHead>
                  <TableHead>Nomi (Rus)</TableHead>
                  <TableHead>Nomi (Ingliz)</TableHead>
                  <TableHead>Nomi (Tojik)</TableHead>
                  <TableHead>Nomi (Qozoq)</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.code}</TableCell>
                    <TableCell>{country.name_uz}</TableCell>
                    <TableCell>{country.name_ru}</TableCell>
                    <TableCell>{country.name_en}</TableCell>
                    <TableCell>{country.name_tj}</TableCell>
                    <TableCell>{country.name_kz}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(country)} className="mr-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(country.id)}>
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

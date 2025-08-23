"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import {
  Users,
  Search,
  Phone,
  Calendar,
  Globe,
  Eye,
  Trash2,
  Loader2,
  Filter,
  Download,
  RefreshCw,
  UserPlus,
} from "lucide-react"
import { apiClient, type User, type CreateUserPayload } from "@/lib/api"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState<CreateUserPayload>({
    telegram_id: 0,
    full_name: "",
    phone_number: "",
    language: "uz",
  })
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [createUserError, setCreateUserError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, languageFilter, searchTerm])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const filters: { query?: string; language?: string } = {}

      if (languageFilter !== "all") {
        filters.language = languageFilter
      }

      if (searchTerm.trim()) {
        filters.query = searchTerm.trim()
      }

      const response = await apiClient.getUsers(currentPage, filters)
      setUsers(response.results)
      setTotalPages(Math.ceil(response.count / 20)) // Assuming 20 items per page
      setTotalUsers(response.count)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setCurrentPage(1)
    // fetchUsers will be triggered by useEffect due to searchTerm change
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsers()
    setIsRefreshing(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)
    setCreateUserError(null)
    try {
      const createdUser = await apiClient.createUser(newUserData)
      setUsers([createdUser, ...users]) // Add new user to the list
      setTotalUsers(totalUsers + 1)
      setIsCreateUserDialogOpen(false) // Close the dialog
      setNewUserData({ telegram_id: 0, full_name: "", phone_number: "", language: "uz" }) // Reset form
    } catch (error: any) {
      console.error("Error creating user:", error)
      setCreateUserError(error.message || "Foydalanuvchi yaratishda xatolik yuz berdi.")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      setDeletingUserId(userId)
      await apiClient.deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
      setTotalUsers(totalUsers - 1)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setDeletingUserId(null)
    }
  }

  const displayedUsers = searchTerm.trim() ? users : users

  const getLanguageDisplay = (language: string | null) => {
    switch (language) {
      case "uz":
        return "O'zbek"
      case "ru":
        return "Русский"
      case "cy":
        return "Ўзбек (Кирилл)"
      case "tj":
        return "Тоҷикӣ"
      case "kz":
        return "Қазақша"
      case "en":
        return "English"
      default:
        return "Noma'lum"
    }
  }

  const handleExportUsers = () => {
    const csvContent = [
      ["ID", "Ism", "Telefon", "Telegram ID", "Til", "Ro'yxatdan o'tgan"],
      ...users.map((user) => [
        user.id.toString(),
        user.full_name || "Noma'lum",
        user.phone_number || "Yo'q",
        user.telegram_id.toString(),
        getLanguageDisplay(user.language),
        new Date(user.created_at).toLocaleDateString("uz-UZ"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `foydalanuvchilar-${new Date().toISOString().split("T")[0]}.csv`
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
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
                <p className="text-sm text-gray-500">Jami {totalUsers.toLocaleString()} ta foydalanuvchi</p>
              </div>
            </div>
            <div className="flex flex-col [@media(max-width:920px)]:flex-col [@media(min-width:921px)]:flex-row items-stretch [@media(max-width:920px)]:items-stretch [@media(min-width:921px)]:items-center gap-2 w-full md:w-auto">
              <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yangi foydalanuvchi qo'shish
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Yangi foydalanuvchi qo'shish</DialogTitle>
                    <DialogDescription>
                      Telegram boti orqali ro'yxatdan o'tgan foydalanuvchini qo'shing.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label htmlFor="telegram_id" className="block text-sm font-medium text-gray-700">
                        Telegram ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="telegram_id"
                        type="number"
                        value={newUserData.telegram_id || ""}
                        onChange={(e) =>
                          setNewUserData({ ...newUserData, telegram_id: parseInt(e.target.value) || 0 })
                        }
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                        To'liq ism (ixtiyoriy)
                      </label>
                      <Input
                        id="full_name"
                        value={newUserData.full_name || ""}
                        onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                        Telefon raqami (ixtiyoriy)
                      </label>
                      <Input
                        id="phone_number"
                        value={newUserData.phone_number || ""}
                        onChange={(e) => setNewUserData({ ...newUserData, phone_number: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        Til (ixtiyoriy)
                      </label>
                      <Select
                        value={newUserData.language || "uz"}
                        onValueChange={(value) => setNewUserData({ ...newUserData, language: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Tilni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uz">O'zbek</SelectItem>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="cy">Ўзбек (Кирилл)</SelectItem>
                          <SelectItem value="tj">Тоҷикӣ</SelectItem>
                          <SelectItem value="kz">Қазақша</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreatingUser}>
                      {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      Foydalanuvchi qo'shish
                    </Button>
                    {createUserError && (
                      <p className="text-red-500 text-sm mt-2">{createUserError}</p>
                    )}
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="w-full sm:w-auto">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Yangilash
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportUsers} disabled={users.length === 0} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Eksport
              </Button>
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
                placeholder="Ism, telefon yoki Telegram ID bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
                </div>
              </div>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Til bo'yicha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha tillar</SelectItem>
                  <SelectItem value="uz">O'zbek</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="cy">Ўзбек (Кирилл)</SelectItem>
                  <SelectItem value="tj">Тоҷикӣ</SelectItem>
                  <SelectItem value="kz">Қазақша</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                Qidirish
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jami foydalanuvchilar</p>
                  <p className="text-2xl font-bold text-blue-600">{totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Joriy sahifa</p>
                  <p className="text-2xl font-bold text-green-600">{currentPage}</p>
                </div>
                <Filter className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jami sahifalar</p>
                  <p className="text-2xl font-bold text-purple-600">{totalPages}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sahifadagi</p>
                  <p className="text-2xl font-bold text-orange-600">{users.length}</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUsers.map((user) => (
            <Card
              key={user.id}
              className="bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover-lift"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.full_name?.charAt(0) || "F"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.full_name || "Noma'lum foydalanuvchi"}</CardTitle>
                    <CardDescription>ID: {user.telegram_id}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    Telefon:
                  </span>
                  <span className="font-medium">{user.phone_number || "Yo'q"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    Til:
                  </span>
                  <Badge variant="outline">{getLanguageDisplay(user.language)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Ro'yxat:
                  </span>
                  <span className="text-sm">{new Date(user.created_at).toLocaleDateString("uz-UZ")}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t flex space-x-2">
                  <Dialog
                    open={isDialogOpen && selectedUser?.id === user.id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setSelectedUser(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ko'rish
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Foydalanuvchi ma'lumotlari</DialogTitle>
                        <DialogDescription>
                          {selectedUser?.full_name || "Foydalanuvchi"} ning to'liq ma'lumotlari
                        </DialogDescription>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                                {selectedUser.full_name?.charAt(0) || "F"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{selectedUser.full_name || "Noma'lum"}</h3>
                              <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Telegram ID:</span>
                              <span className="font-mono text-sm">{selectedUser.telegram_id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Telefon:</span>
                              <span className="text-sm">{selectedUser.phone_number || "Kiritilmagan"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Til:</span>
                              <Badge variant="outline">{getLanguageDisplay(selectedUser.language)}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Ro'yxatdan o'tgan:</span>
                              <span className="text-sm">
                                {new Date(selectedUser.created_at).toLocaleDateString("uz-UZ", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Oxirgi yangilanish:</span>
                              <span className="text-sm">
                                {new Date(selectedUser.updated_at).toLocaleDateString("uz-UZ", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingUserId === user.id}>
                        {deletingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
                        <AlertDialogDescription>
                          Haqiqatan ham <strong>{user.full_name || "bu foydalanuvchi"}</strong>ni o'chirmoqchimisiz? Bu
                          amalni bekor qilib bo'lmaydi va barcha ma'lumotlar yo'qoladi.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.id)}
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
                  {totalUsers} tadan {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalUsers)}{" "}
                  ko'rsatilmoqda
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
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
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Keyingi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {displayedUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Foydalanuvchilar topilmadi</h3>
            <p className="mt-1 text-sm text-gray-500">Qidiruv shartlaringizni o'zgartiring</p>
          </div>
        )}
      </main>
    </div>
  )
}

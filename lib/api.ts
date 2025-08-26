const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface AuthUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
}

export interface User {
  id: number
  telegram_id: number
  full_name: string | null
  phone_number: string | null
  language: string | null
  created_at: string
  updated_at: string
}

export interface CreateUserPayload {
  telegram_id: number
  full_name?: string | null
  phone_number?: string | null
  language?: string | null
}

export interface Driver {
  id: number
  user: User
  passport_photo: string // URL
  passport_photo_url: string
  direction: string
  direction_display: string
  driver_license_photo: string // URL
  driver_license_photo_url: string
  sts_photo: string // URL
  sts_photo_url: string
  car_photo: string // URL
  car_photo_url: string
  is_approved: boolean
  points: number
  rating: number
  created_at: string
  updated_at: string
}

export interface CreateDriverPayload {
  user_id: number
  direction: string
  passport_photo: File
  driver_license_photo: File
  sts_photo: File
  car_photo: File
}

export interface Order {
  id: number
  order_number?: number | null
  user: User
  driver: Driver | null
  claimed_by?: Driver | null
  claimed_at?: string | null
  order_type: string
  order_type_display: string
  full_name: string
  phone_number: string
  from_country: string | null
  from_location: string | null
  from_region: string | null
  to_country: string | null
  to_location: string | null
  to_region: string | null
  order_date: string | null // YYYY-MM-DD
  num_passengers?: number | null
  item_description?: string | null
  weight_tons?: number | null
  payment_amount?: string | null
  terms?: string | null
  comment?: string | null
  status: string
  status_display: string
  passport: string[] | null
  passport_urls: string[] | null
  created_at: string
  updated_at: string
}

export interface BotSettings {
  id: number
  driver_request_group_id: string
  taxi_group_id: string
  gruz_group_id: string
  avia_group_id: string
  point_purchase_group_id: string | null
  deport_check_group_id: string | null
  deport_price: number | null
  admin_username: string | null
  admins: User[]
}

export interface UpdateBotSettingsPayload {
  driver_request_group_id?: string
  taxi_group_id?: string
  gruz_group_id?: string
  avia_group_id?: string
  point_purchase_group_id?: string | null
  deport_check_group_id?: string | null
  deport_price?: number | null
  admin_username?: string
  admin_ids?: number[]
}

export interface PointTransaction {
  id: number
  driver: Driver
  driver_id: number // For creation
  amount: number
  transaction_type: "add" | "subtract"
  transaction_type_display: string
  reason: string | null
  created_at: string
}

export interface Country {
  id: number
  code: string
  name_uz: string
  name_ru: string
  name_en: string | null
  name_cy: string | null
  name_tj: string | null
  name_kz: string | null
  created_at: string
  updated_at: string
}

export interface PointPrice {
  id: number
  name: string
  service: "taxi_package" | "cargo"
  service_display: string
  point_amount: number
  price: number
  discount_percentage: number
  order_number: number
  is_active: boolean
  is_popular: boolean
  description: string | null
  created_at: string
  updated_at: string
  final_price: number
}

export interface Card {
  id: number
  card_number: string
  card_holder_name: string
  bank_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PointPurchaseRequest {
  id: number
  driver: Driver // Nested Driver object
  point_price: PointPrice // Nested PointPrice object
  card_number: string
  receipt_photo?: string // URL, optional as it's write-only in serializer but read as URL
  receipt_photo_url: string // This is the actual URL to display
  status: "pending" | "approved" | "rejected"
  status_display: string
  admin_comment: string | null
  created_at: string
  updated_at: string
}

export interface UpdatePointPurchaseRequestPayload {
  status?: "pending" | "approved" | "rejected"
  admin_comment?: string | null
}

export interface DeportCheckRequest {
  id: number
  user: User
  user_id?: number
  phone_number: string
  passport_photo?: string
  passport_photo_url: string | null
  admin_screenshot?: string
  admin_screenshot_url: string | null
  status: "pending" | "processing" | "completed" | "rejected"
  status_display: string
  admin_comment: string | null
  created_at: string
  updated_at: string
}

export interface UpdateDeportCheckRequestPayload {
  status?: "pending" | "processing" | "completed" | "rejected"
  admin_comment?: string | null
}

export interface OrderStatistics {
  total_orders: number
  pending_orders: number
  completed_orders: number
  total_users: number
  total_drivers: number
  approved_drivers: number
  pending_drivers: number
  today_orders: number
  yesterday_orders: number
  this_week_orders: number
  last_week_orders: number
  taxi_orders: number
  package_orders: number
  plane_orders: number
  train_orders: number
  // cargo_orders: number
  recent_orders_by_day: Array<{
    date: string
    count: number
  }>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token")
      this.refreshToken = localStorage.getItem("refresh_token")
    }
  }

  private async request<T>(method: string, path: string, data?: any, isAuthRequest = false): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.accessToken && !isAuthRequest) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }

    let response = await fetch(`${this.baseUrl}${path}`, config)

    if (response.status === 401 && this.refreshToken && !isAuthRequest) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        // Retry the original request with the new token
        headers["Authorization"] = `Bearer ${this.accessToken}`
        config.headers = headers
        response = await fetch(`${this.baseUrl}${path}`, config)
      } else {
        // If refresh failed, logout
        this.logout()
        throw new Error("Unauthorized: Could not refresh token")
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.detail || errorData.message || "API request failed")
    }

    return response.json()
  }

  async login(username: string, password: string): Promise<{ access: string; refresh: string }> {
    const data = await this.request<{ access: string; refresh: string }>(
      "POST",
      "/token/",
      { username, password },
      true,
    )
    this.accessToken = data.access
    this.refreshToken = data.refresh
    localStorage.setItem("access_token", data.access)
    localStorage.setItem("refresh_token", data.refresh)
    return data
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false
    try {
      const data = await this.request<{ access: string }>(
        "POST",
        "/token/refresh/",
        { refresh: this.refreshToken },
        true,
      )
      this.accessToken = data.access
      localStorage.setItem("access_token", data.access)
      return true
    } catch (error) {
      console.error("Failed to refresh token:", error)
      return false
    }
  }

  logout(): void {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    // Redirect to login page or show a message
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Auth User
  async getCurrentAuthUser(): Promise<AuthUser> {
    return this.request("GET", "/auth/user/")
  }

  // Users
  async getUsers(page = 1, filters?: { query?: string; telegram_id?: number }): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())
    if (filters?.query) query.append("query", filters.query)
    if (filters?.telegram_id) query.append("telegram_id", filters.telegram_id.toString())
    return this.request("GET", `/users/?${query.toString()}`)
  }

  async searchUsers(searchQuery: string, page = 1): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())

    query.append("query", searchQuery.trim())

    console.log("[v0] Searching users with query:", `/users/search/?${query.toString()}`)
    return this.request("GET", `/users/search/?${query.toString()}`)
  }

  async createUser(data: CreateUserPayload): Promise<User> {
    return this.request("POST", "/users/", data)
  }

  async getUser(id: number): Promise<User> {
    return this.request("GET", `/users/${id}/`)
  }

  async deleteUser(id: number): Promise<void> {
    return this.request("DELETE", `/users/${id}/`)
  }

  // Drivers
  async getDrivers(
    page = 1,
    params?: { is_approved?: boolean; direction?: string; search?: string },
  ): Promise<PaginatedResponse<Driver>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())
    if (params?.is_approved !== undefined) query.append("is_approved", String(params.is_approved))
    if (params?.direction) query.append("direction", params.direction)
    if (params?.search) query.append("search", params.search) // Add search parameter
    return this.request("GET", `/drivers/?${query.toString()}`)
  }

  async createDriver(data: CreateDriverPayload): Promise<Driver> {
    const formData = new FormData()
    formData.append("user_id", String(data.user_id))
    formData.append("direction", data.direction)
    formData.append("passport_photo", data.passport_photo)
    formData.append("driver_license_photo", data.driver_license_photo)
    formData.append("sts_photo", data.sts_photo)
    formData.append("car_photo", data.car_photo)

    const headers: HeadersInit = {
      // "Content-Type": "multipart/form-data", // This header is automatically set by fetch when FormData is used
    }
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const config: RequestInit = {
      method: "POST",
      headers,
      body: formData,
    }

    let response = await fetch(`${this.baseUrl}/drivers/`, config)

    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken()
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.accessToken}`
        config.headers = headers
        response = await fetch(`${this.baseUrl}/drivers/`, config)
      } else {
        this.logout()
        throw new Error("Unauthorized: Could not refresh token")
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.detail || errorData.message || "API request failed")
    }

    return response.json()
  }

  async getDriver(id: number): Promise<Driver> {
    return this.request("GET", `/drivers/${id}/`)
  }

  async updateDriver(id: number, data: Partial<Driver>): Promise<Driver> {
    return this.request("PATCH", `/drivers/${id}/`, data)
  }

  async deleteDriver(id: number): Promise<void> {
    return this.request("DELETE", `/drivers/${id}/`)
  }

  // Orders
  async getOrders(
    page = 1,
    params?: { order_type?: string; status?: string; date_from?: string; date_to?: string; order_number?: string },
  ): Promise<PaginatedResponse<Order>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value)
      })
    }
    return this.request("GET", `/orders/?${query.toString()}`)
  }

  async getOrder(id: number): Promise<Order> {
    return this.request("GET", `/orders/${id}/`)
  }

  async updateOrder(id: number, data: Partial<Order> & { driver_id?: number }): Promise<Order> {
    return this.request("PATCH", `/orders/${id}/`, data)
  }

  async deleteOrder(id: number): Promise<void> {
    return this.request("DELETE", `/orders/${id}/`)
  }

  // Point Transactions
  async getPointTransactions(
    page = 1,
    params?: { driver_id?: number; transaction_type?: "add" | "subtract" },
  ): Promise<PaginatedResponse<PointTransaction>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())
    if (params?.driver_id) query.append("driver_id", String(params.driver_id))
    if (params?.transaction_type) query.append("transaction_type", params.transaction_type)
    return this.request("GET", `/point-transactions/?${query.toString()}`)
  }

  async createPointTransaction(data: {
    driver_id: number
    amount: number
    transaction_type: "add" | "subtract"
    reason?: string
  }): Promise<PointTransaction> {
    return this.request("POST", "/point-transactions/", data)
  }

  async getPointTransaction(id: number): Promise<PointTransaction> {
    return this.request("GET", `/point-transactions/${id}/`)
  }

  async updatePointTransaction(id: number, data: Partial<PointTransaction>): Promise<PointTransaction> {
    return this.request("PATCH", `/point-transactions/${id}/`, data)
  }

  async deletePointTransaction(id: number): Promise<void> {
    return this.request("DELETE", `/point-transactions/${id}/`)
  }

  // Bot Settings
  async getBotSettings(): Promise<BotSettings> {
    return this.request("GET", "/bot-settings/")
  }

  async updateBotSettings(data: UpdateBotSettingsPayload): Promise<BotSettings> {
    return this.request("PATCH", "/bot-settings/", data)
  }

  // Statistics
  async getOrderStatistics(): Promise<PaginatedResponse<OrderStatistics>> {
    return this.request("GET", "/statistics/")
  }

  // Invite Links
  async createInviteLink(group_id: string): Promise<{ success: boolean; invite_link?: string; message: string }> {
    return this.request("POST", "/invite-links/create/", { group_id })
  }

  async revokeInviteLink(group_id: string, invite_link: string): Promise<{ success: boolean; message: string }> {
    return this.request("POST", "/invite-links/revoke/", { group_id, invite_link })
  }

  // Countries
  async getCountries(page = 1): Promise<PaginatedResponse<Country>> {
    return this.request("GET", `/countries/?page=${page}`)
  }

  async createCountry(data: Omit<Country, "id" | "created_at" | "updated_at">): Promise<Country> {
    return this.request("POST", "/countries/", data)
  }

  async updateCountry(id: number, data: Partial<Omit<Country, "id" | "created_at" | "updated_at">>): Promise<Country> {
    return this.request("PATCH", `/countries/${id}/`, data)
  }

  async deleteCountry(id: number): Promise<void> {
    return this.request("DELETE", `/countries/${id}/`)
  }

  // Point Prices
  async getPointPrices(page = 1): Promise<PaginatedResponse<PointPrice>> {
    return this.request("GET", `/point-prices/?page=${page}`)
  }

  async createPointPrice(
    data: Omit<PointPrice, "id" | "created_at" | "updated_at" | "service_display" | "final_price">,
  ): Promise<PointPrice> {
    return this.request("POST", "/point-prices/", data)
  }

  async updatePointPrice(
    id: number,
    data: Partial<Omit<PointPrice, "id" | "created_at" | "updated_at" | "service_display" | "final_price">>,
  ): Promise<PointPrice> {
    return this.request("PATCH", `/point-prices/${id}/`, data)
  }

  async deletePointPrice(id: number): Promise<void> {
    return this.request("DELETE", `/point-prices/${id}/`)
  }

  // Cards
  async getCards(page = 1): Promise<PaginatedResponse<Card>> {
    return this.request("GET", `/cards/?page=${page}`)
  }

  async createCard(data: Omit<Card, "id" | "created_at" | "updated_at">): Promise<Card> {
    return this.request("POST", "/cards/", data)
  }

  async updateCard(id: number, data: Partial<Omit<Card, "id" | "created_at" | "updated_at">>): Promise<Card> {
    return this.request("PATCH", `/cards/${id}/`, data)
  }

  async deleteCard(id: number): Promise<void> {
    return this.request("DELETE", `/cards/${id}/`)
  }

  // Point Purchase Requests
  async getPointPurchaseRequests(
    page = 1,
    params?: { status?: "pending" | "approved" | "rejected"; driver_id?: number },
  ): Promise<PaginatedResponse<PointPurchaseRequest>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())
    if (params?.status) query.append("status", params.status)
    if (params?.driver_id) query.append("driver_id", String(params.driver_id))
    return this.request("GET", `/point-purchase-requests/?${query.toString()}`)
  }

  async getPointPurchaseRequest(id: number): Promise<PointPurchaseRequest> {
    return this.request("GET", `/point-purchase-requests/${id}/`)
  }

  async updatePointPurchaseRequest(id: number, data: UpdatePointPurchaseRequestPayload): Promise<PointPurchaseRequest> {
    return this.request("PATCH", `/point-purchase-requests/${id}/`, data)
  }

  async deletePointPurchaseRequest(id: number): Promise<void> {
    return this.request("DELETE", `/point-purchase-requests/${id}/`)
  }

  // Deport Check Requests
  async getDeportCheckRequests(
    page = 1,
    params?: { status?: "pending" | "processing" | "completed" | "rejected"; user_id?: number },
  ): Promise<PaginatedResponse<DeportCheckRequest>> {
    const query = new URLSearchParams()
    query.append("page", page.toString())
    if (params?.status) query.append("status", params.status)
    if (params?.user_id) query.append("user_id", String(params.user_id))
    return this.request("GET", `/deport-check-requests/?${query.toString()}`)
  }

  async getDeportCheckRequest(id: number): Promise<DeportCheckRequest> {
    return this.request("GET", `/deport-check-requests/${id}/`)
  }

  async updateDeportCheckRequest(id: number, data: UpdateDeportCheckRequestPayload): Promise<DeportCheckRequest> {
    return this.request("PATCH", `/deport-check-requests/${id}/`, data)
  }

  async deleteDeportCheckRequest(id: number): Promise<void> {
    return this.request("DELETE", `/deport-check-requests/${id}/`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

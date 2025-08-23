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
  car_make: string
  car_year: number
  car_number: string
  car_photo: string // URL
  car_photo_url: string
  is_approved: boolean
  points: number
  rating: number
  region: string | null
  car_capacity: number | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user: User
  driver: Driver | null
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
  num_passengers: number | null
  item_description: string | null
  weight_tons: number | null
  payment_amount: string | null
  terms: string | null
  comment: string | null
  status: string
  status_display: string
  created_at: string
  updated_at: string
}

export interface BotSettings {
  id: number
  driver_request_group_id: string
  taxi_group_id: string
  gruz_group_id: string
  avia_group_id: string
  point_purchase_group_id: string | null // NEW: Added point_purchase_group_id
  admins: User[]
}

export interface UpdateBotSettingsPayload {
  driver_request_group_id?: string
  taxi_group_id?: string
  gruz_group_id?: string
  avia_group_id?: string
  point_purchase_group_id?: string | null // NEW: Added point_purchase_group_id
  admin_ids?: number[]
}

export interface PointTransaction {
  id: number
  driver: Driver
  driver_id: number // For creation
  amount: number
  transaction_type: "add" | "deduct"
  transaction_type_display: string
  reason: string | null
  created_at: string
}

export interface Country {
  id: number
  code: string
  name_uz: string
  name_ru: string
  name_en: string
  name_tj: string
  name_kz: string
  created_at: string
  updated_at: string
}

export interface PointPrice {
  id: number
  name: string
  service: "cargo" | "taxi_package"
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
    window.location.href = "/login"
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Auth User
  async getCurrentAuthUser(): Promise<AuthUser> {
    return this.request("GET", "/auth/user/")
  }

  // Users
  async getUsers(): Promise<{ results: User[] }> {
    return this.request("GET", "/users/")
  }

  async getUser(id: number): Promise<User> {
    return this.request("GET", `/users/${id}/`)
  }

  async deleteUser(id: number): Promise<void> {
    return this.request("DELETE", `/users/${id}/`)
  }

  async searchUsers(query: string): Promise<{ results: User[] }> {
    return this.request("GET", `/users/search/?query=${encodeURIComponent(query)}`)
  }

  // Drivers
  async getDrivers(params?: { is_approved?: boolean; direction?: string; region?: string }): Promise<{
    results: Driver[]
  }> {
    const query = new URLSearchParams()
    if (params?.is_approved !== undefined) query.append("is_approved", String(params.is_approved))
    if (params?.direction) query.append("direction", params.direction)
    if (params?.region) query.append("region", params.region)
    return this.request("GET", `/drivers/?${query.toString()}`)
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
  async getOrders(params?: { order_type?: string; status?: string; date_from?: string; date_to?: string }): Promise<{
    results: Order[]
  }> {
    const query = new URLSearchParams()
    if (params?.order_type) query.append("order_type", params.order_type)
    if (params?.status) query.append("status", params.status)
    if (params?.date_from) query.append("date_from", params.date_from)
    if (params?.date_to) query.append("date_to", params.date_to)
    return this.request("GET", `/orders/?${query.toString()}`)
  }

  async getOrder(id: number): Promise<Order> {
    return this.request("GET", `/orders/${id}/`)
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    return this.request("PATCH", `/orders/${id}/`, data)
  }

  async deleteOrder(id: number): Promise<void> {
    return this.request("DELETE", `/orders/${id}/`)
  }

  // Point Transactions
  async getPointTransactions(params?: { driver_id?: number; transaction_type?: "add" | "deduct" }): Promise<{
    results: PointTransaction[]
  }> {
    const query = new URLSearchParams()
    if (params?.driver_id) query.append("driver_id", String(params.driver_id))
    if (params?.transaction_type) query.append("transaction_type", params.transaction_type)
    return this.request("GET", `/point-transactions/?${query.toString()}`)
  }

  async createPointTransaction(data: {
    driver_id: number
    amount: number
    transaction_type: "add" | "deduct"
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
  async getOrderStatistics(): Promise<any> {
    // Define a proper interface for statistics if needed
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
  async getCountries(): Promise<{ results: Country[] }> {
    return this.request("GET", "/countries/")
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
  async getPointPrices(): Promise<{ results: PointPrice[] }> {
    return this.request("GET", "/point-prices/")
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
  async getCards(): Promise<{ results: Card[] }> {
    return this.request("GET", "/cards/")
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
  async getPointPurchaseRequests(params?: {
    status?: "pending" | "approved" | "rejected"
    driver_id?: number
  }): Promise<{ results: PointPurchaseRequest[] }> {
    const query = new URLSearchParams()
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
}

export const apiClient = new ApiClient(API_BASE_URL)

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Car,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { apiClient, type OrderStatistics } from "@/lib/api"
import ReactECharts from "echarts-for-react" // ECharts import

export default function Dashboard() {
  const [stats, setStats] = useState<OrderStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getOrderStatistics() // Corrected line
      setStats(response)
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ma'lumotlarni yuklashda xatolik</h2>
          <Button onClick={fetchStats}>Qayta urinish</Button>
        </div>
      </div>
    )
  }

  const orderTypeData = [
    { name: "Taksi", value: stats.taxi_orders, color: "#3B82F6" },
    { name: "Paket", value: stats.package_orders, color: "#10B981" },
    { name: "Yuk", value: stats.cargo_orders, color: "#F59E0B" },
    { name: "Aviabilet", value: stats.plane_orders, color: "#EF4444" },
    { name: "Poyezd", value: stats.train_orders, color: "#8B5CF6" },
  ]

  const weeklyData = stats.recent_orders_by_day.map((item) => ({
    date: new Date(item.date).toLocaleDateString("uz-UZ", { weekday: "short" }),
    orders: item.count,
  }))

  const driverStatusData = [
    { name: "Tasdiqlangan", value: stats.approved_drivers, color: "#22C55E" }, // green-500
    { name: "Kutilmoqda", value: stats.pending_drivers, color: "#F97316" }, // orange-500
  ]

  // ECharts options for Weekly Orders (Bar Chart)
  const weeklyOrdersOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: weeklyData.map((item) => item.date),
      axisLabel: {
        color: "#6b7280", // gray-500
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280", // gray-500
      },
    },
    series: [
      {
        name: "Buyurtmalar",
        type: "bar",
        data: weeklyData.map((item) => item.orders),
        itemStyle: {
          color: "#3B82F6", // blue-500
        },
        barWidth: "60%",
      },
    ],
  }

  // ECharts options for Order Types (Pie Chart)
  const orderTypeOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "#4b5563", // gray-700
      },
    },
    series: [
      {
        name: "Buyurtma turlari",
        type: "pie",
        radius: ["40%", "70%"], // Donut chart
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "20",
            fontWeight: "bold",
            color: "#1f2937", // gray-900
          },
        },
        labelLine: {
          show: false,
        },
        data: orderTypeData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
        })),
      },
    ],
  }

  // ECharts options for Daily Order Trend (Line Chart)
  const dailyTrendOption = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: weeklyData.map((item) => item.date),
      axisLabel: {
        color: "#6b7280", // gray-500
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6b7280", // gray-500
      },
    },
    series: [
      {
        name: "Buyurtmalar",
        type: "line",
        smooth: true,
        data: weeklyData.map((item) => item.orders),
        itemStyle: {
          color: "#10B981", // green-500
        },
        lineStyle: {
          width: 3,
        },
        symbolSize: 8, // Dot size
      },
    ],
  }

  // ECharts options for Driver Approval Status (Pie Chart)
  const driverStatusOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "#4b5563", // gray-700
      },
    },
    series: [
      {
        name: "Haydovchi holati",
        type: "pie",
        radius: "50%",
        data: driverStatusData.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          formatter: "{b}: {c} ({d}%)", // Show name, value, and percentage
          color: "#1f2937", // gray-900
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 ml-16 lg:ml-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h1>
                <p className="text-sm text-gray-500">Yo'l yo'lakay tizimi statistikasi</p>
              </div>
            </div>
            <Button onClick={fetchStats} variant="outline">
              Yangilash
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Jami buyurtmalar</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total_orders.toLocaleString()}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                Bugun: {stats.today_orders}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Foydalanuvchilar</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total_users.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Ro'yxatdan o'tgan</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Haydovchilar</CardTitle>
              <Car className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total_drivers.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                Tasdiqlangan: {stats.approved_drivers} / Kutilmoqda: {stats.pending_drivers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Yakunlangan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.completed_orders.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total_orders > 0
                  ? `${((stats.completed_orders / stats.total_orders) * 100).toFixed(1)}% jami buyurtmalardan`
                  : "0% jami buyurtmalardan"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Kutilayotgan</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending_orders.toLocaleString()}</div>
              <Badge className="bg-yellow-100 text-yellow-800 mt-2">Jarayon davomida</Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Bugungi buyurtmalar</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.today_orders.toLocaleString()}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stats.today_orders >= stats.yesterday_orders ? (
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                )}
                Kecha: {stats.yesterday_orders}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Haftalik</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.this_week_orders.toLocaleString()}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stats.this_week_orders >= stats.last_week_orders ? (
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                )}
                O'tgan hafta: {stats.last_week_orders}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Orders Chart (Bar Chart) */}
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader>
              <CardTitle>Haftalik buyurtmalar</CardTitle>
              <CardDescription>So'nggi 7 kunlik statistika</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ReactECharts option={weeklyOrdersOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </CardContent>
          </Card>

          {/* Order Types Pie Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader>
              <CardTitle>Buyurtma turlari</CardTitle>
              <CardDescription>Turlar bo'yicha taqsimot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ReactECharts option={orderTypeOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </CardContent>
          </Card>

          {/* Daily Order Trend (Line Chart) - NEW */}
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader>
              <CardTitle>Kunlik buyurtmalar trendi</CardTitle>
              <CardDescription>So'nggi 7 kunlik buyurtmalar o'zgarishi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ReactECharts option={dailyTrendOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </CardContent>
          </Card>

          {/* Driver Approval Status (Pie Chart) - NEW */}
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg hover-lift">
            <CardHeader>
              <CardTitle>Haydovchilar tasdiqlash holati</CardTitle>
              <CardDescription>Tasdiqlangan va kutilayotgan haydovchilar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ReactECharts option={driverStatusOption} style={{ height: "100%", width: "100%" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Types Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border shadow-lg mt-6 hover-lift">
          <CardHeader>
            <CardTitle>Buyurtma turlari bo'yicha batafsil</CardTitle>
            <CardDescription>Har bir tur bo'yicha statistika</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🚕</div>
                <div className="text-2xl font-bold text-blue-600">{stats.taxi_orders}</div>
                <div className="text-sm text-gray-600">Taksi</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📦</div>
                <div className="text-2xl font-bold text-green-600">{stats.package_orders}</div>
                <div className="text-sm text-gray-600">Paket</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">🚚</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.cargo_orders}</div>
                <div className="text-sm text-gray-600">Yuk</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl mb-2">✈️</div>
                <div className="text-2xl font-bold text-red-600">{stats.plane_orders}</div>
                <div className="text-sm text-gray-600">Aviabilet</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🚆</div>
                <div className="text-2xl font-bold text-purple-600">{stats.train_orders}</div>
                <div className="text-sm text-gray-600">Poyezd</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

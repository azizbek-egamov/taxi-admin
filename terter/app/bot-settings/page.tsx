"use client"

import { useState } from "react"
import { Settings, MessageSquare, Users, DollarSign, Globe, CreditCard, ReceiptText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import GroupIdSettingsTab from "@/components/bot-settings/group-id-settings-tab"
import AdminSettingsTab from "@/components/bot-settings/admin-settings-tab"
import PointPricesTab from "@/components/bot-settings/point-prices-tab"
import CountriesTab from "@/components/bot-settings/countries-tab"
import CardsTab from "@/components/bot-settings/cards-tab"
import PointPurchaseRequestsTab from "@/components/bot-settings/point-purchase-requests-tab" // New import

export default function BotSettingsPage() {
  const [activeTab, setActiveTab] = useState("group-ids")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 ml-16 lg:ml-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bot sozlamalari</h1>
                <p className="text-sm text-gray-500">Bot va admin panel sozlamalarini boshqarish</p>
              </div>
            </div>
            {/* The main save button is removed as each tab will have its own save functionality */}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="group-ids" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto flex-wrap">
            <TabsTrigger value="group-ids" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Guruh ID lari
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Adminlar
            </TabsTrigger>
            <TabsTrigger value="point-prices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ball Narxlari
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Davlat/Viloyat/Shahar
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              To'lov Kartalari
            </TabsTrigger>
            <TabsTrigger value="point-purchase-requests" className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4" />
              Ball So'rovlari
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="group-ids">
              <GroupIdSettingsTab />
            </TabsContent>
            <TabsContent value="admins">
              <AdminSettingsTab />
            </TabsContent>
            <TabsContent value="point-prices">
              <PointPricesTab />
            </TabsContent>
            <TabsContent value="countries">
              <CountriesTab />
            </TabsContent>
            <TabsContent value="cards">
              <CardsTab />
            </TabsContent>
            <TabsContent value="point-purchase-requests">
              <PointPurchaseRequestsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

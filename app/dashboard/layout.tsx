import AppSidebar from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const DashboardLayout = () => {
  return (
    <SidebarProvider>
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-120 h-120 bg-chart-2/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[32px_32px]opacity-20" />
      </div>
      <AppSidebar/> 
    </SidebarProvider>
  )
}

export default DashboardLayout
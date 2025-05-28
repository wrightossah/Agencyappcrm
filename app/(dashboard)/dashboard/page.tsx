import { SMSBalanceWidget } from "@/components/sms-balance-widget"
import { SMSTestComponent } from "@/components/sms-test-component"

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example Metric Cards - Replace with your actual metrics */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-3xl">1,234</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold">Active Users</h2>
          <p className="text-3xl">567</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold">New Users Today</h2>
          <p className="text-3xl">89</p>
        </div>

        <SMSBalanceWidget />
      </div>

      {/* Add this after the existing dashboard cards */}
      <div className="col-span-full lg:col-span-2">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <SMSBalanceWidget />
          <SMSTestComponent />
        </div>
      </div>
    </div>
  )
}

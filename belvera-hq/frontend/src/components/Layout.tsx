import Navbar from "@/components/Navbar";
import { Link, useLocation } from 'react-router-dom'

const nav = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/rd', label: 'R&D Lab', icon: '🧪' },
  { path: '/suppliers', label: 'Suppliers', icon: '🏢' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/production', label: 'Production', icon: '🏭' },
  { path: '/orders', label: 'Orders & Sales', icon: '🧾' },
  { path: '/finance', label: 'Finance & P&L', icon: '💵' },
  { path: '/reports', label: 'Reports & Labels', icon: '🏷️' },
  { path: '/team', label: 'Team & Staff', icon: '👥' },
  { path: '/sops', label: 'SOP Library', icon: '📖' },
  { path: '/franchise', label: 'Franchise Prep', icon: '🏢' },
]

export default function Layout({ children, user, onLogout }: { children: React.ReactNode, user:any, onLogout:()=>void }) {
  const loc = useLocation()
  const isFounder = user?.role==='founder'
  return (
    <div className="flex min-h-screen bg-[#fdf8f0]">
      <div className="w-64 bg-white border-r p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight">BELVERA</h1>
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">HQ OS • Phase 10 FINAL</p>
          <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border">
            <p className="text-xs font-bold">{user?.name}</p>
            <p className="text- text-gray-500 truncate">{user?.email}</p>
            <p className={`text- mt-1.5 px-2 py-0.5 rounded-full inline-block font-bold ${isFounder?'bg-black text-white':'bg-blue-100 text-blue-700'}`}>{isFounder?'FOUNDER - Full Access':'MANAGER - View + Create'}</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {nav.map(item => {
            const active = loc.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${active? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-6 border-t space-y-2">
          <button onClick={onLogout} className="w-full text-xs border py-2.5 rounded-xl hover:bg-gray-50">Logout</button>
          <p className="text- text-gray-400 leading-tight">Phase 10 FINAL HQ<br/>Founder delete protected<br/>Reports + Labels + ROI + Auth<br/>All editable/deletable</p>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  )
}
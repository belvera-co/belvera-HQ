import { Link, useLocation } from 'react-router-dom'

const nav = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/rd', label: 'R&D Laboratory', icon: '🧪' },
  { path: '/suppliers', label: 'Suppliers', icon: '🚚' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/sops', label: 'SOP Library', icon: '📖' },
  { path: '/franchise', label: 'Franchise Prep', icon: '🏢' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-belvera-sand p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-belvera-navy">BELVERA</h1>
          <p className="text-xs tracking-widest text-belvera-blue">HQ SYSTEM v1.0</p>
        </div>
        <nav className="space-y-2">
          {nav.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                loc.pathname === item.path ? 'bg-belvera-navy text-white' : 'hover:bg-belvera-cream text-belvera-navy'
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-12 p-4 bg-belvera-mint rounded-xl">
          <p className="text-xs font-semibold">Franchise-Ready</p>
          <p className="text-[11px] mt-1 text-gray-600">Built for scale. Every record is location-aware.</p>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

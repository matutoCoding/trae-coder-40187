import { NavLink, Outlet } from 'react-router-dom'
import { MapPin, PenLine, ClipboardList } from 'lucide-react'

const tabs = [
  { to: '/', icon: MapPin, label: '行程生成' },
  { to: '/itinerary', icon: PenLine, label: '路书编辑' },
  { to: '/checklist', icon: ClipboardList, label: '出发清单' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col max-w-md mx-auto relative font-body">
      <main className="flex-1 pb-20 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-sand-200 z-50">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-forest-500 scale-105'
                    : 'text-sand-400 hover:text-sand-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'drop-shadow-sm' : ''}
                  />
                  <span className={`text-xs ${isActive ? 'font-medium' : 'font-normal'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

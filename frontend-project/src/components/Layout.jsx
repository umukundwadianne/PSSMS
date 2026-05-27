import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Footer from './footer'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/cars', label: 'Cars', icon: '🚗' },
  { to: '/parking-slots', label: 'Parking Slots', icon: '🅿️' },
  { to: '/parking-records', label: 'Parking Records', icon: '📒' },
  { to: '/payments', label: 'Payments', icon: '💳' },
  { to: '/reports', label: 'Reports', icon: '📊' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <div className="flex min-h-screen">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="text-xl font-bold text-slate-950">PSSMS</div>
            <div className="mt-1 text-sm text-slate-500">Parking Space Sales</div>
          </div>
          <nav className="px-4 py-5">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900/5 border border-slate-200 text-sm">
                      {item.icon}
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto px-4 pb-6">
            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed in</div>
              <div className="mt-1 truncate text-sm font-medium text-slate-900">{user?.username}</div>
            </div>
            <button
              className="btn-secondary w-full"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div>
                <div className="font-semibold text-slate-950">WELCOME TO PSSMS</div>
                <div className="text-xs text-slate-500 md:hidden">{user?.username}</div>
              </div>
              <button
                className="btn-secondary md:hidden"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
              >
                Logout
              </button>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `mobile-nav-link whitespace-nowrap ${isActive ? 'mobile-nav-link-active' : ''}`
                  }
                >
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-slate-900/5 border border-slate-200">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </div>



          <Footer />
        </main>
      </div>
    </div>
  )
}


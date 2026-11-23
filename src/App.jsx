import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Homepage    from './pages/Homepage'
const Agents = lazy(() => import('./pages/Agents'))
const Journey = lazy(() => import('./pages/Journey'))
const Community = lazy(() => import('./pages/Community'))
const Waitlist = lazy(() => import('./pages/Waitlist'))
const OSPage = lazy(() => import('./pages/os'))
const YATI = lazy(() => import('./pages/yAtI'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const Login = lazy(() => import('./pages/Login'))
const YatiFlow = lazy(() => import('./pages/YatiFlow'))
const BrandCampaign = lazy(() => import('./pages/BrandCampaign'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const AgentsPage = lazy(() => import('./pages/dashboard/AgentsPage'))
const ContactsPage = lazy(() => import('./pages/dashboard/ContactsPage'))
const DraftsPage = lazy(() => import('./pages/dashboard/DraftsPage'))
const InboxPage = lazy(() => import('./pages/dashboard/InboxPage'))
const DealsPage = lazy(() => import('./pages/dashboard/DealsPage'))
const MeetingsPage = lazy(() => import('./pages/dashboard/MeetingsPage'))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'))
import { AuthProvider, RequireAuth, RequireFounderOS } from './lib/auth'
import { ChatProvider } from './lib/chatContext'
import { CartProvider } from './lib/cart'
import SessionExpiredDialog from './components/SessionExpiredDialog'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Client-side fallback for the old campaign URL (the 301 itself is set in vercel.json / _redirects).
function RedirectKeepQuery({ to }) {
  const { search, hash } = useLocation()
  return <Navigate to={to + search + hash} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
      <CartProvider>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
        <Routes>
          <Route path="/"             element={<Homepage />}    />
          <Route path="/wearables"    element={<RedirectKeepQuery to="/yati-flow" />} />
          <Route path="/agents"       element={<Agents />}      />
          <Route path="/journey"      element={<Journey />}     />
          <Route path="/community"    element={<Community />}   />
          <Route path="/waitlist"     element={<Waitlist />}    />
          {/* PARKED until the ring and store launch: pages kept in src/pages (SignalRing, EarlyAccess, Order, Checkout).
              To bring back: restore the lazy imports, swap these redirects for the routes, re-add <CartDrawer /> and the nav cart button. */}
          <Route path="/signal-ring"  element={<RedirectKeepQuery to="/yati-flow" />} />
          <Route path="/early-access" element={<RedirectKeepQuery to="/yati-flow" />} />
          <Route path="/order"        element={<RedirectKeepQuery to="/yati-flow" />} />
          <Route path="/checkout"     element={<RedirectKeepQuery to="/yati-flow" />} />
          <Route path="/yAtI" element={<YATI />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/terms" element={<Terms />} />
           <Route path="/founder-os" element={<OSPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/start" element={<BrandCampaign />} />
          {/* Parked: its CTA goes to /login. Back to this element when the CRM campaign resumes. */}
          <Route path="/sales-agent" element={<RedirectKeepQuery to="/start" />} />
          <Route path="/yati-flow" element={<YatiFlow />} />
          <Route path="/pendant" element={<RedirectKeepQuery to="/yati-flow" />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/plan"
            element={
              <RequireAuth>
                <PlanPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/agents"
            element={
              <RequireAuth>
                <RequireFounderOS>
                  <AgentsPage />
                </RequireFounderOS>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/contacts"
            element={
              <RequireAuth>
                <RequireFounderOS>
                  <ContactsPage />
                </RequireFounderOS>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/inbox"
            element={
              <RequireAuth>
                <RequireFounderOS>
                  <InboxPage />
                </RequireFounderOS>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/drafts"
            element={
              <RequireAuth>
                <RequireFounderOS>
                  <DraftsPage />
                </RequireFounderOS>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/deals"
            element={
              <RequireAuth>
                <RequireFounderOS>
                  <DealsPage />
                </RequireFounderOS>
              </RequireAuth>
            }
          />
          {/* Recorder-pen meetings: every signed-in user, no Founder OS needed */}
          <Route
            path="/dashboard/meetings"
            element={
              <RequireAuth>
                <MeetingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
        </Routes>
        </Suspense>
        {/* <CartDrawer /> hidden until checkout launches */}
        <SessionExpiredDialog />
      </CartProvider>
      </ChatProvider>
    </AuthProvider>
  )
}

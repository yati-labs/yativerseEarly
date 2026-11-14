import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Homepage    from './pages/Homepage'
import Wearables   from './pages/Wearables'
import Agents      from './pages/Agents'
import Journey     from './pages/Journey'
import Community   from './pages/Community'
import Waitlist    from './pages/Waitlist'
import SignalRing  from './pages/SignalRing'
import EarlyAccess from './pages/EarlyAccess'
import Order       from './pages/Order'
import Checkout    from './pages/Checkout'
import OSPage from './pages/os'
import YATI from './pages/yAtI'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'
import Login from './pages/Login'
import CampaignLanding from './pages/CampaignLanding'
import PendantCampaign from './pages/PendantCampaign'
import BrandCampaign from './pages/BrandCampaign'
import Dashboard from './pages/Dashboard'
import PlanPage from './pages/PlanPage'
import AgentsPage from './pages/dashboard/AgentsPage'
import ContactsPage from './pages/dashboard/ContactsPage'
import DraftsPage from './pages/dashboard/DraftsPage'
import InboxPage from './pages/dashboard/InboxPage'
import DealsPage from './pages/dashboard/DealsPage'
import MeetingsPage from './pages/dashboard/MeetingsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import { AuthProvider, RequireAuth, RequireFounderOS } from './lib/auth'
import { ChatProvider } from './lib/chatContext'
import { CartProvider } from './lib/cart'
import CartDrawer from './components/CartDrawer'
import SessionExpiredDialog from './components/SessionExpiredDialog'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/"             element={<Homepage />}    />
          <Route path="/wearables"    element={<Wearables />}   />
          <Route path="/agents"       element={<Agents />}      />
          <Route path="/journey"      element={<Journey />}     />
          <Route path="/community"    element={<Community />}   />
          <Route path="/waitlist"     element={<Waitlist />}    />
          <Route path="/signal-ring"  element={<SignalRing />}  />
          <Route path="/early-access" element={<EarlyAccess />} />
          <Route path="/order"        element={<Order />}       />
          <Route path="/checkout"     element={<Checkout />}    />
          <Route path="/yAtI" element={<YATI />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
           <Route path="/founder-os" element={<OSPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/start" element={<BrandCampaign />} />
          <Route path="/sales-agent" element={<CampaignLanding />} />
          <Route path="/pendant" element={<PendantCampaign />} />
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
        <CartDrawer />
        <SessionExpiredDialog />
      </CartProvider>
      </ChatProvider>
    </AuthProvider>
  )
}

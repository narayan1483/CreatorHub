import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { SuperStorePage } from './pages/SuperStorePage';
import { AutoDMPage } from './pages/AutoDMPage';
import { AudiencePage } from './pages/AudiencePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { LearnPage } from './pages/LearnPage';
import { ReferAndEarnPage } from './pages/ReferAndEarnPage';
import { ConnectedAgentsPage } from './pages/ConnectedAgentsPage';
import { AppsMarketplacePage } from './pages/AppsMarketplacePage';
import { SchedulePage } from './pages/SchedulePage';
import { SuperLinksPage } from './pages/SuperLinksPage';
import { LeadMagnetPage } from './pages/LeadMagnetPage';
import { PaymentPagesPage } from './pages/PaymentPagesPage';
import { BookingsPage } from './pages/BookingsPage';
import { AIContentStudioPage } from './pages/AIContentStudioPage';
import { BroadcastStudioPage } from './pages/BroadcastStudioPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PublicStorePage } from './pages/PublicStorePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* CreatorHub SuperProfile Core Dashboard */}
                <Route element={<DashboardLayout />}>
                  <Route index element={<GettingStartedPage />} />
                  <Route path="store" element={<SuperStorePage />} />
                  <Route path="autodm" element={<AutoDMPage />} />
                  <Route path="audience" element={<AudiencePage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="learn" element={<LearnPage />} />
                  <Route path="refer-and-earn" element={<ReferAndEarnPage />} />
                  <Route path="connected-agents" element={<ConnectedAgentsPage />} />
                  <Route path="apps" element={<AppsMarketplacePage />} />
                  <Route path="apps/schedule" element={<SchedulePage />} />
                  <Route path="apps/superlinks" element={<SuperLinksPage />} />
                  <Route path="apps/lead-magnet" element={<LeadMagnetPage />} />
                  <Route path="apps/payment-pages" element={<PaymentPagesPage />} />
                  <Route path="apps/bookings" element={<BookingsPage />} />
                  <Route path="apps/content-studio" element={<AIContentStudioPage />} />
                  <Route path="content-studio" element={<AIContentStudioPage />} />
                  <Route path="apps/broadcast" element={<BroadcastStudioPage />} />
                  <Route path="broadcast" element={<BroadcastStudioPage />} />
                </Route>

                {/* Authentication Routes */}
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />

                {/* Public Buyer-Facing Storefront */}
                <Route path="store/:username" element={<PublicStorePage />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


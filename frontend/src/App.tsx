import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AnalyticsPage } from './pages/admin/Analytics';
import { DocumentsPage } from './pages/admin/Documents';
import { ConversationsPage } from './pages/admin/Conversations';
import { FlaggedPage } from './pages/admin/Flagged';
import { UsersPage } from './pages/admin/Users';
import { WidgetSettingsPage } from './pages/admin/WidgetSettings';
import { SystemSettingsPage } from './pages/admin/SystemSettings';
import './i18n'; // Initialize i18n

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AnalyticsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="flagged" element={<FlaggedPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="widget" element={<WidgetSettingsPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

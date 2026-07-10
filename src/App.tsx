import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { HotelsPage } from "./pages/HotelsPage";
import { HotelDetailPage } from "./pages/HotelDetailPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { OffersPage } from "./pages/OffersPage";
import { OfferDetailPage } from "./pages/OfferDetailPage";
import { TravelGuidePage } from "./pages/TravelGuidePage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { BookingLookupPage } from "./pages/BookingLookupPage";
import { ContactPage } from "./pages/ContactPage";
import { BookingDetailPage } from "./pages/BookingDetailPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { StaffBookingsPage } from "./pages/StaffBookingsPage";
import { ManagerHotelsPage } from "./pages/ManagerHotelsPage";
import { ManagerRoomsPage } from "./pages/ManagerRoomsPage";
import { ManagerUsersPage } from "./pages/ManagerUsersPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { Role } from "./types/auth";
import { ROUTES } from "./constants/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/vi-vn">
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.HOTELS} element={<HotelsPage />} />
          <Route path={ROUTES.HOTEL_DETAIL} element={<HotelDetailPage />} />
          <Route path={ROUTES.OFFERS} element={<OffersPage />} />
          <Route path={ROUTES.OFFER_DETAIL} element={<OfferDetailPage />} />
          <Route path={ROUTES.TRAVEL_GUIDE} element={<TravelGuidePage />} />
          <Route path={ROUTES.ARTICLE_DETAIL} element={<ArticleDetailPage />} />
          <Route path={ROUTES.BOOKING_LOOKUP} element={<BookingLookupPage />} />
          <Route path={ROUTES.CONTACT} element={<ContactPage />} />

          {/* Customer Routes */}
          <Route
            path={ROUTES.MY_BOOKINGS}
            element={
              <PrivateRoute allowedRoles={[Role.CUSTOMER]}>
                <MyBookingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.BOOKING_DETAIL}
            element={
              <PrivateRoute allowedRoles={[Role.CUSTOMER]}>
                <BookingDetailPage />
              </PrivateRoute>
            }
          />

          {/* Authenticated Routes */}
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />

          {/* Staff Space */}
          <Route
            path={ROUTES.STAFF_BOOKINGS}
            element={
              <PrivateRoute allowedRoles={[Role.STAFF, Role.MANAGER, Role.ADMIN]}>
                <StaffBookingsPage />
              </PrivateRoute>
            }
          />

          {/* Manager / Admin Space */}
          <Route
            path={ROUTES.MANAGER_HOTELS}
            element={
              <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <ManagerHotelsPage />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.MANAGER_ROOMS}
            element={
              <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <ManagerRoomsPage />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.MANAGER_USERS}
            element={
              <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <ManagerUsersPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

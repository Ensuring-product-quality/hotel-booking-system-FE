import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { LoadingFallback } from "../components/LoadingFallback";
import { PrivateRoute } from "../components/PrivateRoute";
import { Role } from "../types/auth";
import { ROUTES } from "../constants/routes";

// Code Splitting (React.lazy)
const HomePage = lazy(() => import("../pages/HomePage").then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));
const HotelsPage = lazy(() => import("../pages/HotelsPage").then((m) => ({ default: m.HotelsPage })));
const HotelDetailPage = lazy(() => import("../pages/HotelDetailPage").then((m) => ({ default: m.HotelDetailPage })));
const MyBookingsPage = lazy(() => import("../pages/MyBookingsPage").then((m) => ({ default: m.MyBookingsPage })));
const OffersPage = lazy(() => import("../pages/OffersPage").then((m) => ({ default: m.OffersPage })));
const OfferDetailPage = lazy(() => import("../pages/OfferDetailPage").then((m) => ({ default: m.OfferDetailPage })));
const BookingLookupPage = lazy(() => import("../pages/BookingLookupPage").then((m) => ({ default: m.BookingLookupPage })));
const ContactPage = lazy(() => import("../pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const BookingDetailPage = lazy(() => import("../pages/BookingDetailPage").then((m) => ({ default: m.BookingDetailPage })));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const StaffBookingsPage = lazy(() => import("../pages/StaffBookingsPage").then((m) => ({ default: m.StaffBookingsPage })));
const ManagerHotelsPage = lazy(() => import("../pages/ManagerHotelsPage").then((m) => ({ default: m.ManagerHotelsPage })));
const ManagerRoomsPage = lazy(() => import("../pages/ManagerRoomsPage").then((m) => ({ default: m.ManagerRoomsPage })));
const ManagerUsersPage = lazy(() => import("../pages/ManagerUsersPage").then((m) => ({ default: m.ManagerUsersPage })));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const ProfilePage = lazy(() => import("../pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const DiningPage = lazy(() => import("../pages/DiningPage").then((m) => ({ default: m.DiningPage })));
const EventsPage = lazy(() => import("../pages/EventsPage").then((m) => ({ default: m.EventsPage })));
const TransfersPage = lazy(() => import("../pages/TransfersPage").then((m) => ({ default: m.TransfersPage })));
const WellnessPage = lazy(() => import("../pages/WellnessPage").then((m) => ({ default: m.WellnessPage })));

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      children: [
        { path: ROUTES.HOME, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
        { path: ROUTES.HOTELS, element: <SuspenseWrapper><HotelsPage /></SuspenseWrapper> },
        { path: ROUTES.HOTEL_DETAIL, element: <SuspenseWrapper><HotelDetailPage /></SuspenseWrapper> },
        { path: ROUTES.OFFERS, element: <SuspenseWrapper><OffersPage /></SuspenseWrapper> },
        { path: ROUTES.OFFER_DETAIL, element: <SuspenseWrapper><OfferDetailPage /></SuspenseWrapper> },
        { path: ROUTES.BOOKING_LOOKUP, element: <SuspenseWrapper><BookingLookupPage /></SuspenseWrapper> },
        { path: ROUTES.CONTACT, element: <SuspenseWrapper><ContactPage /></SuspenseWrapper> },
        { path: "/dining", element: <SuspenseWrapper><DiningPage /></SuspenseWrapper> },
        { path: "/events", element: <SuspenseWrapper><EventsPage /></SuspenseWrapper> },
        { path: "/transfers", element: <SuspenseWrapper><TransfersPage /></SuspenseWrapper> },
        { path: "/wellness", element: <SuspenseWrapper><WellnessPage /></SuspenseWrapper> },

        // Protected Customer Routes
        {
          path: ROUTES.MY_BOOKINGS,
          element: (
            <PrivateRoute allowedRoles={[Role.CUSTOMER]}>
              <SuspenseWrapper><MyBookingsPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
        {
          path: ROUTES.BOOKING_DETAIL,
          element: (
            <PrivateRoute allowedRoles={[Role.CUSTOMER]}>
              <SuspenseWrapper><BookingDetailPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },

        // Protected Authenticated Routes
        {
          path: ROUTES.NOTIFICATIONS,
          element: (
            <PrivateRoute>
              <SuspenseWrapper><NotificationsPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
        {
          path: ROUTES.PROFILE,
          element: (
            <PrivateRoute>
              <SuspenseWrapper><ProfilePage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        { path: ROUTES.LOGIN, element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
        { path: ROUTES.REGISTER, element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
        { path: ROUTES.FORGOT_PASSWORD, element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },
        { path: ROUTES.VERIFY_EMAIL, element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper> },
      ],
    },
    {
      element: <AdminLayout />,
      children: [
        {
          path: ROUTES.STAFF_BOOKINGS,
          element: (
            <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
              <SuspenseWrapper><StaffBookingsPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
        {
          path: ROUTES.MANAGER_HOTELS,
          element: (
            <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
              <SuspenseWrapper><ManagerHotelsPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
        {
          path: ROUTES.MANAGER_ROOMS,
          element: (
            <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
              <SuspenseWrapper><ManagerRoomsPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
        {
          path: ROUTES.MANAGER_USERS,
          element: (
            <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
              <SuspenseWrapper><ManagerUsersPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
        {
          path: ROUTES.ADMIN_DASHBOARD,
          element: (
            <PrivateRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
              <SuspenseWrapper><AdminDashboardPage /></SuspenseWrapper>
            </PrivateRoute>
          ),
        },
      ],
    },
  ],
  {
    basename: "/vi-vn",
  }
);

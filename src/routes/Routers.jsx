import { useRoutes } from "react-router-dom";
import { HomePage } from "../pages/common/home-page/HomePage";
import LoginPage from "../pages/login/Login";
import CartPage from "../pages/common/cart/CartPage";
import MenuPage from "../pages/common/menu-page/MenuPage";
import ProductDetail from "../pages/common/product-detail/ProductDetail";
import ReservationPage from "../pages/common/reservation/ReservationPage";
import UserLayout from "../layouts/common/UserLayout";
import PersonalOrder from "../pages/common/personal-information/PersonalOrder";
import PersonalTransaction from "../pages/common/personal-information/PersonalTransaction";
import ManagerLayout from "../layouts/common/ManagerLayout";
import CommonLayout from "../layouts/common/CommonLayout";
import { AdminOrderHistoryPage } from "../pages/admin/AdminOrderHistoryPage";
import { AdminReservationPage } from "../pages/admin/AdminReservationPage";
import MessengerApp from "../pages/common/chat/ChatComponent";
import SettingsPage from "../pages/admin/SettingsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ErrorPage from "../pages/common/error/ErrorPage";
import SearchResults from "../components/search/SearchResult";
import AboutUs from "../pages/common/about-us/AboutUs";
import { ComboDetailPage } from "../pages/common/menu-page/ComboDetailPage";
import { OrderHistory } from "../pages/common/customer/OrderHistory";
import OrderDetailView from "../pages/common/customer/OrderDetailView";
import VerifyPayment from "../pages/common/verify-payment/VerifyPayment";
import { AdminDevicePage } from "../pages/admin/AdminDevicePage";
import RestaurantCheckout from "../pages/common/customer/RestaurentCheckout";
import { TransactionPage } from "../pages/admin/TransactionPage";
import KitchenLayout from "../layouts/common/KitchenLayout";
import OrderManagement from "../pages/kitchen/order-management/OrderManagement";
import DishManagement from "../pages/kitchen/dish-management/DishManagement";
import OptimizeProcess from "../pages/kitchen/optimize-process/OptimizeProcess";
import { AdminMealHistoryPage } from "../pages/admin/AdminMealHistoryPage";
import { ProtectedRoute } from "./ProtectedRoute";
import PolicyPage from "../pages/common/policy/PolicyPage";
import PersonalReservation from "../pages/common/personal-information/PersonalReservation";
import AdminDishPage from "../pages/admin/AdminDishPage";
import NavigateCreateMenu from "../pages/admin/menu/NavigateCreateMenu";
import CreateMenuPage from "../pages/admin/menu/CreateMenuPage";
import CreateComboPage from "../pages/admin/menu/CreateComboPage";
import DailySellManagement from "../pages/admin/daily-sell/DailySellManagement";
import UpdateProfile from "../pages/common/personal-information/UpdateProfile";
import PersonalAddress from "../pages/common/personal-information/PersonalAddress";
import PersonalSetting from "../pages/common/personal-information/PersonalSetting";
import AdminUserPage from "../pages/admin/user/AdminUserPage";
import AdminShipperPage from "../pages/admin/user/AdminShipperPage";
import Landing from "../pages/common/landing/Landing";
import TiviShow from "../pages/common/tivi/tivi-show";
import DiningArea from "../pages/admin/table-management/DiningArea";

function Routers() {
  const routing = useRoutes([
    {
      path: "*",
      element: <ErrorPage />,
    },
    {
      path: "restaurant-checkout",
      element: <RestaurantCheckout />,
    },
    {
      path: "order-tivi",
      element: <TiviShow />,
    },
    {
      path: "/",
      element: <CommonLayout></CommonLayout>,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "policy",
          element: <PolicyPage />,
        },
        {
          path: "cart",
          element: <CartPage />,
        },
        {
          path: "combo",
          element: <MenuPage />,
        },
        {
          path: "product/:id",
          element: <ProductDetail />,
        },
        {
          path: "booking",
          element: <ReservationPage />,
        },
        {
          path: "search",
          element: <SearchResults />,
        },
        {
          path: "about",
          element: <AboutUs />,
        },
        {
          path: "combo/:id",
          element: <ComboDetailPage />,
        },
        {
          path: "order-history",
          element: <OrderHistory />,
        },
        {
          path: "order-history/:id",
          element: <OrderDetailView />,
        },
        {
          path: "payment/*",
          element: <VerifyPayment />,
        },
        {
          path: "landing",
          element: <Landing />,
        },
      ],
    },
    {
      path: "/user",
      element: (
        <ProtectedRoute role="user">
          <UserLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <UpdateProfile />,
        },
        {
          path: "info",
          element: <UpdateProfile />,
        },
        {
          path: "order",
          element: <PersonalOrder />,
        },
        {
          path: "reservation-history",
          element: <PersonalReservation />,
        },
        {
          path: "transaction-history",
          element: <PersonalTransaction />,
        },
        {
          path: "personal",
          element: <UpdateProfile />,
        },
        {
          path: "address",
          element: <PersonalAddress />,
        },
        {
          path: "settings",
          element: <PersonalSetting />,
        },
      ],
    },
    {
      path: "admin",
      element: (
        <ProtectedRoute role="admin">
          <ManagerLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <AdminDashboardPage />,
        },
        {
          path: "order-history",
          element: <AdminOrderHistoryPage />,
        },
        {
          path: "dish-management",
          element: <AdminDishPage />,
        },
        {
          path: "action-management",
          element: <NavigateCreateMenu />,
        },
        {
          path: "create-menu/:id",
          element: <CreateMenuPage />,
        },
        {
          path: "create-combo",
          element: <CreateComboPage />,
        },
        {
          path: "create-combo/:id",
          element: <CreateComboPage />,
        },
        {
          path: "transaction-history",
          element: <TransactionPage />,
        },
        {
          path: "reservation-history",
          element: <AdminReservationPage />,
        },
        {
          path: "meal-history",
          element: <AdminMealHistoryPage />,
        },
        {
          path: "messages",
          element: <MessengerApp />,
        },
        {
          path: "settings",
          element: <SettingsPage />,
        },
        {
          path: "overviews",
          element: <AdminDashboardPage />,
        },
        {
          path: "manage-devices",
          element: <AdminDevicePage />,
        },
        {
          path: "daily-sell-management",
          element: <DailySellManagement />,
        },
        {
          path: "user-management",
          element: <AdminUserPage />,
        },
        {
          path: "shipper-management",
          element: <AdminShipperPage />,
        },
        {
          path: "dining-area",
          element: <DiningArea />,
        },
      ],
    },
    {
      path: "kitchen",
      element: (
        <ProtectedRoute role={"kitchen"}>
          <KitchenLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <OrderManagement />,
        },
        {
          path: "order-management",
          element: <OrderManagement />,
        },
        {
          path: "optimize-process",
          element: <OptimizeProcess />,
        },
        {
          path: "dish-management",
          element: <DishManagement />,
        },
      ],
    },
  ]);
  return routing;
}
export default Routers;

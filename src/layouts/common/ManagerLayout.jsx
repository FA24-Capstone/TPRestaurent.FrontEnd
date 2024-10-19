import { MultiLevelSidebar } from "../../components/sidebar/MultiLevelSidebar";
import { Outlet } from "react-router-dom";
import HeaderManager from "../../components/manager/HeaderManager";
import {
  FaChartBar,
  FaCog,
  FaEnvelope,
  FaShoppingBag,
  FaSignOutAlt,
} from "react-icons/fa";
import { GiCampCookingPot } from "react-icons/gi";
import { TbTransactionDollar } from "react-icons/tb";
import { useSelector } from "react-redux";

const menuItems = [
  {
    title: "Tổng quan",
    icon: <FaChartBar className="h-5 w-5 text-white" />,
    subItems: [
      { title: "Bảng điều khiển", path: "/overview/dashboard" },
      { title: "Báo cáo", path: "/overview/reports" },
    ],
  },
  {
    title: "Quản lý món ăn",
    icon: <GiCampCookingPot className="h-5 w-5 text-white" />,
    subItems: [
      { title: "Quản lý món ăn", path: "/admin/dish-management" },
      { title: "Quản lý bán hàng ngày", path: "/admin/daily-sell-management" },
    ],
  },
  {
    title: "Quản lý đơn hàng",
    icon: <FaShoppingBag className="h-5 w-5 text-white" />,
    subItems: [
      { title: "Yêu cầu đặt bàn", path: "/admin/reservation-history" },
      { title: "Đơn hàng online", path: "/admin/order-history" },
      { title: "Đặt món tại quán", path: "/admin/meal-history" },
    ],
  },
  {
    title: "Quản lý giao dịch",
    icon: <TbTransactionDollar className="h-5 w-5 text-white" />,
    path: "/admin/transaction-history",
  },
  {
    title: "Tin nhắn",
    icon: <FaEnvelope className="h-5 w-5 text-white" />,
    path: "/admin/messages",
  },
  {
    title: "Cấu hình hệ thống",
    icon: <FaCog className="h-5 w-5 text-white" />,
    subItems: [
      { title: "Cài đặt", path: "/admin/settings" },
      { title: "Quản lý thiết bị", path: "/admin/manage-devices" },
    ],
  },
];
const ManagerLayout = () => {
  const user = useSelector((state) => state.user.user || {});
  return (
    <div className="flex">
      <MultiLevelSidebar menuItems={menuItems} />
      <div className=" flex-1 w-full min-h-dvh bg-blue-gray-50">
        <div className="mx-2">
          <HeaderManager userName={user.lastName} />
        </div>
        <div className="m-2 mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagerLayout;

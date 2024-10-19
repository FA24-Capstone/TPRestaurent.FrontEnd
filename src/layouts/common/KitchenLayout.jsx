import React from "react";
import { MultiLevelSidebar } from "../../components/sidebar/MultiLevelSidebar";
import { Outlet } from "react-router-dom";
import HeaderManager from "../../components/manager/HeaderManager";
import {
  FaChartBar,
  FaCog,
  FaEnvelope,
  FaNewspaper,
  FaSignOutAlt,
} from "react-icons/fa";
const menuItems = [
  {
    title: "Danh sách đơn đặt món",
    icon: <FaChartBar className="h-5 w-5 text-white" />,
    path: "/kitchen/order-management",
  },
  {
    title: "Tối ưu chế biến",
    icon: <FaNewspaper className="h-5 w-5 text-white" />,
    path: "/kitchen/optimize-process",
  },
];
const KitchenLayout = () => {
  return (
    <div className="flex">
      <MultiLevelSidebar menuItems={menuItems} />
      <div className=" flex-1 w-full min-h-dvh bg-blue-gray-50">
        <HeaderManager />
        <div className="m-2 mt-8 ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default KitchenLayout;

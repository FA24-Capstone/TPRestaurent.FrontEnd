import React from "react";
import { Tag } from "antd";
import {
  TableOutlined,
  DollarCircleOutlined,
  CoffeeOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
const OrderStatus = [
  {
    label: "Đã xếp bàn",
    value: 1,
    color: "blue",
    text: "Đã phân bàn",
    icon: <TableOutlined />,
  },
  {
    label: "Đã thanh toán cọc",
    value: 2,
    color: "cyan",
    text: "Đã đặt cọc",
    icon: <DollarCircleOutlined />,
  },
  {
    label: "Đã xử lý xong",
    value: 3,
    color: "geekblue",
    text: "Đã nấu xong",
    icon: <CoffeeOutlined />,
  },
  {
    label: "Đã đặt trước",
    value: 4,
    color: "purple",
    text: "Đặt trước",
    icon: <ClockCircleOutlined />,
  },
  {
    label: "Đang nấu",
    value: 5,
    color: "processing",
    text: "Đang xử lý",
    icon: <SyncOutlined spin />,
  },
  {
    label: "Sẵn sàng giao hàng",
    value: 6,
    color: "green",
    text: "Chuẩn bị giao hàng",
    icon: <TruckOutlined />,
  },
  {
    label: "Đã bàn giao cho nhân viên giao hàng",
    value: 7,
    color: "orange",
    text: "Đã bàn giao cho shipper",
    icon: <CarOutlined />,
  },
  {
    label: "Đã giao hàng",
    value: 8,
    color: "orange",
    text: "Đang giao hàng",
    icon: <CarOutlined />,
  },
  {
    label: "Hoàn thành",
    value: 9,
    color: "success",
    text: "Hoàn thành",
    icon: <CheckCircleOutlined />,
  },
  {
    label: "Đã hủy",
    value: 10,
    color: "error",
    text: "Đã hủy",
    icon: <CloseCircleOutlined />,
  },
];
const OrderTag = ({ orderStatusId }) => {
  const getTagInfo = (statusId) => {
    return OrderStatus.find((status) => status.value === statusId);
  };

  const { color, text, icon } = getTagInfo(orderStatusId) || {};

  return (
    <Tag color={color} icon={icon}>
      {text}
    </Tag>
  );
};

export default OrderTag;

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

const OrderTag = ({ orderStatusId }) => {
  const getTagInfo = (statusId) => {
    switch (statusId) {
      case 1:
        return { color: "blue", text: "Đã phân bàn", icon: <TableOutlined /> };
      case 2:
        return {
          color: "cyan",
          text: "Đã đặt cọc",
          icon: <DollarCircleOutlined />,
        };
      case 3:
        return {
          color: "geekblue",
          text: "Đang dùng bữa",
          icon: <CoffeeOutlined />,
        };
      case 4:
        return {
          color: "purple",
          text: "Đặt trước",
          icon: <ClockCircleOutlined />,
        };
      case 5:
        return {
          color: "processing",
          text: "Đang xử lý",
          icon: <SyncOutlined spin />,
        };
      case 6:
        return {
          color: "green",
          text: "Chuẩn bị giao hàng",
          icon: <TruckOutlined />,
        };
      case 7:
        return {
          color: "orange",
          text: "Đã bàn giao cho shipper",
          icon: <CarOutlined />,
        };
      case 8:
        return {
          color: "orange",
          text: "Đang giao hàng",
          icon: <CarOutlined />,
        };
      case 9:
        return {
          color: "success",
          text: "Hoàn thành",
          icon: <CheckCircleOutlined />,
        };
      case 10:
        return {
          color: "error",
          text: "Đã hủy",
          icon: <CloseCircleOutlined />,
        };
    }
  };

  const { color, text, icon } = getTagInfo(orderStatusId);

  return (
    <Tag color={color} icon={icon}>
      {text}
    </Tag>
  );
};

export default OrderTag;

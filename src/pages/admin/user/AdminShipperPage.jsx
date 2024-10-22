import React, { useEffect, useState } from "react";
import {
  List,
  Typography,
  Table,
  Skeleton,
  Empty,
  Avatar,
  Tag,
  Input,
  Tooltip,
} from "antd";
import styled from "styled-components";
import useCallApi from "../../../api/useCallApi";
import { AccountApi, OrderApi } from "../../../api/endpoint";
import TabMananger from "../../../components/tab/TabManager";
import Pagination from "../../../components/pagination/Pagination";
import { formatDate, formatDateTime, formatPrice } from "../../../util/Utility";
import { StyledTable } from "../../../components/custom-ui/StyledTable";
import ReservationDetail from "../../../components/reservation/reservation-detail/ReservationDetail";
import ModalReservationDetail from "../../../components/reservation/modal/ModalReservationDetail";
import { set } from "lodash";

const { Title } = Typography;

// Styled Components
const StyledTitle = styled(Title)`
  &.ant-typography {
    color: #ad0303;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
`;

const StyledList = styled(List)`
  .ant-list-item {
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
      background-color: #ffe6e6;
    }

    &.selected {
      background-color: #ad0303;
      color: white;

      .ant-list-item-meta {
        .ant-list-item-meta-avatar {
          color: white;
        }
        .ant-list-item-meta-title {
          color: white;
        }
        .ant-list-item-meta-description {
          color: white;
        }
      }
    }

    .ant-list-item-meta {
      .ant-list-item-meta-title {
        color: black;
      }
      font-size: 24px;
    }
  }
`;

const AdminShipperPage = () => {
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [shippers, setShippers] = useState([]);
  const { callApi, loading } = useCallApi();
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 10;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const menuItems = [
    {
      label: "Đang giao",
      value: "8",
    },
    {
      label: "Đã giao",
      value: "9",
    },
    {
      label: "Đã hủy",
      value: "10",
    },
  ];

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      width: 100,
      fixed: "left",

      render: (_, record) => (
        <span
          className="hover:cursor-pointer"
          onClick={() => setSelectedOrder(record.orderId)}
        >
          {record.orderId.substring(0, 8)}
        </span>
      ),
    },
    {
      title: "Tên khách hàng",
      dataIndex: ["account", "firstName"],
      key: "customerName",
      align: "center",
      width: 150,
      render: (_, record) =>
        `${record.account.firstName} ${record.account.lastName}`,
    },
    {
      title: "Số điện thoại",
      dataIndex: ["account", "phoneNumber"],
      key: "phoneNumber",
      align: "center",
      width: 120,
    },
    {
      title: "Địa chỉ",
      dataIndex: ["customerInfoAddress", "customerInfoAddressName"],
      key: "address",
      align: "center",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      align: "center",
      width: 120,
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      align: "center",
      width: 120,
      render: (text) => formatDate(text),
    },
    {
      title: "Thời gian nhận đơn",
      dataIndex: "assignedTime",
      key: "assignedTime",
      align: "center",
      width: 150,
      render: (text) => formatDateTime(text),
    },
    {
      title: "Thời gian bắt đầu giao",
      dataIndex: "startDeliveringTime",
      key: "startDeliveringTime",
      align: "center",
      width: 150,
      render: (text) => formatDateTime(text),
    },
    {
      title: "Thời gian giao",
      dataIndex: "deliveredTime",
      key: "deliveredTime",
      align: "center",
      width: 150,
      render: (text) => (text ? formatDateTime(text) : "N/A"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "center",
      width: 120,
      render: (text) => `${formatPrice(text)} `,
    },
    {
      title: "Trạng thái",
      dataIndex: ["status", "vietnameseName"],
      key: "status",
      align: "center",
      width: 120,
    },

    {
      title: "Loại đơn",
      dataIndex: ["orderType", "vietnameseName"],
      key: "orderType",
      align: "center",
      width: 120,
    },
    {
      title: "Tổng khoảng cách giao",
      dataIndex: "totalDistance",
      key: "totalDistance",
      align: "center",
      width: 150,
    },
  ];

  const fetchShippers = async () => {
    const result = await callApi(
      `${AccountApi.GET_ACCOUNTS_BY_ROLE_NAME}/shipper/1/100`,
      "GET"
    );
    if (result.isSuccess) {
      setShippers(result.result?.items);
    }
  };

  const fetchDeliveryHistory = async () => {
    const response = await callApi(
      `${OrderApi.GET_ALL_ORDER_BY_SHIPPER}/${selectedShipper.id}/${currentPage}/${totalItems}?status=${activeTab}`,
      "GET"
    );
    if (response.isSuccess) {
      setDeliveryHistory(response.result?.items);
      setTotalPages(response.result?.totalPages);
    } else {
      setDeliveryHistory([]);
    }
  };

  useEffect(() => {
    fetchShippers();
    if (selectedShipper) {
      fetchDeliveryHistory();
    }
  }, [selectedShipper, currentPage, activeTab]);
  console.log("selectedOrder", selectedOrder);
  const fetchOrderDetail = async () => {
    const response = await callApi(
      `${OrderApi.GET_DETAIL}/${selectedOrder}`,
      "GET"
    );
    if (response.isSuccess) {
      setOrderDetail(response.result);
    }
  };
  useEffect(() => {
    if (selectedOrder) {
      fetchOrderDetail();
      setIsModalOpen(true);
    }
  }, [selectedOrder]);

  return (
    <div className="bg-white w-full p-4">
      <Typography className="text-center uppercase text-xl font-bold text-red-800 my-4 p-4">
        Quản lý NHÂN VIÊN GIAO HÀNG
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-2">
        <div className=" md:col-span-1">
          <StyledTitle level={5}>Danh sách Nhân viên giao hàng</StyledTitle>
          <Input.Search
            className="my-2"
            placeholder="Tìm kiếm..."
            classNames={{
              input: "border border-gray-400 rounded-lg border-radius-8",
            }}
          />
          <StyledList
            dataSource={shippers}
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelectedShipper(item)}
                className={selectedShipper?.id === item.id ? "selected" : ""}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={item.avatar} />}
                  title={`${item.firstName} ${item.lastName}`}
                  description={`0${item.phoneNumber}`}
                />
                <div>
                  {item.isDelivering ? (
                    <Tag color="#fc9003">Đang giao hàng</Tag>
                  ) : (
                    <Tag color="#318209">Đang rảnh</Tag>
                  )}
                </div>
              </List.Item>
            )}
          />
        </div>

        <div className=" md:col-span-2">
          <StyledTitle level={5}>
            {selectedShipper
              ? `Lịch sử giao hàng của ${selectedShipper.firstName} ${selectedShipper.lastName}`.toUpperCase()
              : "Chọn một nhân viên giao hàng để xem lịch sử giao hàng".toUpperCase()}
          </StyledTitle>
          <TabMananger
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            items={menuItems}
            enableCount={false}
          />
          {loading && <Skeleton active />}
          {selectedShipper && deliveryHistory.length === 0 && !loading && (
            <Empty />
          )}
          {selectedShipper && deliveryHistory.length > 0 && !loading && (
            <div className="overflow-auto min-w-96 max-h-[400px]">
              <StyledTable
                dataSource={deliveryHistory}
                columns={columns}
                pagination={false}
                scroll={{ x: 400 }}
              />
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <ModalReservationDetail
        onClose={() => setIsModalOpen(!isModalOpen)}
        reservation={orderDetail}
        visible={isModalOpen}
      />
    </div>
  );
};

export default AdminShipperPage;

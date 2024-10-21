import React, { useEffect, useState } from "react";
import {
  List,
  Card,
  Typography,
  Table,
  Skeleton,
  Empty,
  Avatar,
  Tag,
  Input,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import styled from "styled-components";
import useCallApi from "../../../api/useCallApi";
import { AccountApi, OrderApi } from "../../../api/endpoint";
import { StyledTable } from "../../../components/custom-ui/StyledTable";
import TabMananger from "../../../components/tab/TabManager";
import Pagination from "../../../components/pagination/Pagination";

const { Title } = Typography;

// Styled Components
const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;

  @media (min-width: 768px) {
    flex-direction: row;
  }

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const SidebarWrapper = styled.div`
  @media (min-width: 768px) {
    width: 30%;
  }

  @media (max-width: 767px) {
    width: 100%;
  }

  padding: 20px;
  background-color: #ffffff;
`;

const MainContentWrapper = styled.div`
  @media (min-width: 768px) {
    width: 70%;
  }

  @media (max-width: 767px) {
    width: 100%;
  }
  padding: 20px;
  background-color: #ffffff;
`;

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
  const { callApi, error, loading } = useCallApi();
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 10;
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
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      align: "center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Thời gian nhận đơn",
      dataIndex: "assignedTime",
      key: "assignedTime",
      align: "center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Thời gian bắt đầu giao",
      dataIndex: "startDeliveringTime",
      key: "startDeliveringTime",
      align: "center",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Thời gian giao",
      dataIndex: "deliveredTime",
      key: "deliveredTime",
      align: "center",
      render: (text) => (text ? new Date(text).toLocaleString() : "N/A"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "center",
      render: (text) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: ["status", "vietnameseName"],
      key: "status",
      align: "center",
    },
    {
      title: "Tên khách hàng",
      dataIndex: ["account", "firstName"],
      key: "customerName",
      align: "center",
      render: (_, record) =>
        `${record.account.firstName} ${record.account.lastName}`,
    },
    {
      title: "Số điện thoại",
      dataIndex: ["account", "phoneNumber"],
      key: "phoneNumber",
      align: "center",
    },
    {
      title: "Địa chỉ",
      dataIndex: ["customerInfoAddress", "customerInfoAddressName"],
      key: "address",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      align: "center",
    },
    {
      title: "Loại đơn",
      dataIndex: ["orderType", "vietnameseName"],
      key: "orderType",
      align: "center",
    },
    {
      title: "Tổng khoảng cách giao",
      dataIndex: "totalDistance",
      key: "totalDistance",
      align: "center",
    },
    {
      title: "Giao hàng trong",
      dataIndex: "totalDuration",
      key: "totalDuration",
      align: "center",
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
  return (
    <div className="bg-white">
      <Typography className="text-center uppercase text-4xl font-bold text-red-800 my-4 p-4">
        Quản lý NHÂN VIÊN GIAO HÀNG
      </Typography>
      <Container>
        <SidebarWrapper>
          <StyledTitle level={3}>Danh sách Nhân viên giao hàng</StyledTitle>
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
        </SidebarWrapper>

        <MainContentWrapper>
          <StyledTitle level={3}>
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
            <div className="overflow-auto max-h-[600px]">
              <StyledTable
                dataSource={deliveryHistory}
                columns={columns}
                pagination={false}
              />
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </MainContentWrapper>
      </Container>
    </div>
  );
};

export default AdminShipperPage;

import React, { useState } from "react";
import {
  Modal,
  Table,
  Button,
  Checkbox,
  Badge,
  Tag,
  Image,
  Divider,
  Statistic,
} from "antd";
import {
  FireOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { uniqueId } from "lodash";
import { formatDateTime } from "../../../util/Utility";
import { StyledTable } from "../../../components/custom-ui/StyledTable";

const OrderDetailModal = ({
  selectedDish,
  handleUpdateStatus,
  loading,
  setSelectedDish,
}) => {
  console.log(selectedDish);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getTotalQuantities = () => {
    const total = selectedDish?.Total?.reduce(
      (acc, item) => ({
        unchecked: acc.unchecked + item.UncheckedQuantity,
        processing: acc.processing + item.ProcessingQuantity,
      }),
      { unchecked: 0, processing: 0 }
    );
    return total || { unchecked: 0, processing: 0 };
  };
  const getStatusColor = (status) => {
    const colors = {
      1: "yellow",
      2: "blue",
      3: "orange",
      4: "green",
      5: "default",
    };
    return colors[status] || "default";
  };

  const getOrderTypeColor = (typeId) => {
    return typeId === 3 ? "error" : "processing";
  };

  const orderColumns = [
    {
      title: "Mã bàn",
      render: (_, record) => (
        <Tag
          color={record.table ? "success" : "default"}
          className="px-3 py-1 text-base"
        >
          {record.table ? record.table?.tableName : "N/A"}
        </Tag>
      ),
    },
    {
      title: "Món",
      dataIndex: ["dish", "name"],
      render: () => (
        <span className="text-lg font-medium text-gray-800">
          {selectedDish?.dish?.name}
        </span>
      ),
    },
    {
      title: "Size",
      dataIndex: ["quantity", "dishSize", "vietnameseName"],
      render: (_, record) => (
        <Tag className="px-3 py-1 text-base font-medium">
          {record?.quantity?.dishSize?.vietnameseName}
        </Tag>
      ),
    },
    {
      title: "Số lượng",
      width: 200,
      render: (_, record) => (
        <span className="text-lg font-medium">{record.quantity.quantity}</span>
      ),
    },

    {
      title: "Loại đơn",
      render: (_, record) => (
        <Badge
          status={getOrderTypeColor(record?.order.orderTypeId)}
          text={
            <span className="text-base">
              {record.order?.orderType?.vietnameseName}
            </span>
          }
        />
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: ["note"],
      render: (_, record) => (
        <span className="text-base text-gray-600">
          {record.orderDetail.note}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      render: (_, record) => (
        <Tag
          color={getStatusColor(record.orderDetail.orderDetailStatusId)}
          className="px-3 py-1 text-base"
        >
          {record.orderDetail.orderDetailStatus?.vietnameseName || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Đặt lúc",
      render: (_, record) => {
        const date =
          record.order.orderTypeId === 1
            ? record.order.reservationDate
            : record.order.orderTypeId === 2
            ? record.order.orderDate
            : record.order.mealTime;
        return (
          <span className="text-base text-gray-600">
            {formatDateTime(date)}
          </span>
        );
      },
    },
  ];
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <Modal
      open={selectedDish}
      onCancel={() => setSelectedDish(null)}
      width={1800}
      footer={null}
    >
      <div className="flex flex-col space-y-6 p-10">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Chi tiết đơn hàng
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 ">
              {/* Dish Header */}
              <div className="bg-red-50 p-4 border-b border-red-100">
                <h2 className="text-xl font-bold text-red-800 uppercase text-center">
                  {selectedDish?.dish?.name}
                </h2>
              </div>

              <div className="w-full">
                <Image
                  src={selectedDish?.dish?.image}
                  alt={selectedDish?.dish?.name}
                  className="w-full h-52 object-cover"
                />
              </div>

              {/* Overall Statistics */}
              <div className="p-4 bg-gray-50 border-t border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <Statistic
                    title={<span className="text-gray-600">Tổng chưa đọc</span>}
                    value={getTotalQuantities().unchecked}
                    valueStyle={{ color: "#d4b106" }}
                    prefix={<ClockCircleOutlined />}
                  />
                  <Statistic
                    title={<span className="text-gray-600">Tổng đang nấu</span>}
                    value={getTotalQuantities().processing}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<FireOutlined />}
                  />
                </div>
              </div>

              {/* Size Details */}
              <div className="p-4 rounded-lg shadow-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3 uppercase text-center">
                  Chi tiết theo Size
                </h3>
                <div className="space-y-4">
                  {selectedDish?.total?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      {/* Size Header */}
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-800">
                          {item.dishSize.vietnameseName}
                        </span>
                      </div>

                      {/* Size Statistics */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ClockCircleOutlined className="text-yellow-500" />
                            <span className="text-sm text-gray-600">
                              Chưa đọc:
                            </span>
                          </div>
                          <Badge
                            count={item.uncheckedQuantity}
                            showZero
                            style={{ backgroundColor: "#d4b106" }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FireOutlined className="text-blue-500" />
                            <span className="text-sm text-gray-600">
                              Đang nấu:
                            </span>
                          </div>
                          <Badge
                            count={item.processingQuantity}
                            showZero
                            style={{ backgroundColor: "#1890ff" }}
                          />
                        </div>

                        {/* Progress Indicators */}
                        <div className="pt-2">
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{
                                width: `${
                                  (item.uncheckedQuantity /
                                    (item.uncheckedQuantity +
                                      item.processingQuantity)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Update Time */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <FieldTimeOutlined className="mr-2" />
                  Cập nhật lúc: {formatDateTime(new Date())}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Orders Table (keep existing code) */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 max-h-[600px] overflow-y-auto">
              <StyledTable
                dataSource={selectedDish?.uncheckedDishFromTableOrders}
                columns={orderColumns}
                scroll={{ x: 800 }}
                pagination={false}
                rowSelection={rowSelection}
                rowKey={(record) => record.orderDetail.orderDetailId}
                onRow={(record) => ({
                  onClick: () => {
                    const selectedKey = record.orderDetail.orderDetailId;
                    const newSelectedRowKeys = selectedRowKeys.includes(
                      selectedKey
                    )
                      ? selectedRowKeys.filter((key) => key !== selectedKey)
                      : [...selectedRowKeys, selectedKey];
                    setSelectedRowKeys(newSelectedRowKeys);
                  },
                })}
              />

              {selectedRowKeys.length > 0 && (
                <div className="flex justify-center py-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleUpdateStatus(selectedRowKeys)}
                    loading={loading}
                    className="h-10 px-8 text-base font-medium bg-red-800 text-white"
                  >
                    {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;

import React from "react";
import { formatDateTime, formatPrice } from "../../../util/Utility";
import { CheckCircleIcon, ClockIcon, XIcon } from "lucide-react";
import { Table } from "antd";
import { StyledTable } from "../../../components/custom-ui/StyledTable";

export default function OrderSessionModal({ orderSession, open, onClose }) {
  const { orderSession: session, table, order, orderDetails } = orderSession;

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!open) return null;
  const columns = [
    {
      title: "Tên món",
      dataIndex: ["orderDetail", "dishSizeDetail", "dish", "name"],
      key: "name",
      render: (text, record) =>
        record.orderDetail.dishSizeDetail?.dish?.name ||
        record.orderDetail.combo?.name,
    },
    {
      title: "Số lượng",
      dataIndex: ["orderDetail", "quantity"],
      key: "quantity",
    },
    {
      title: "Giá",
      dataIndex: ["orderDetail", "price"],
      key: "price",
      render: (price) => formatPrice(price),
    },
    {
      title: "Ghi chú",
      dataIndex: ["orderDetail", "note"],
      key: "note",
      render: (note) => note || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: ["orderDetail", "orderDetailStatusId"],
      key: "status",
      render: (statusId, record) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium text-nowrap uppercase ${getStatusColor(
            statusId
          )}`}
        >
          {record.orderDetail.orderDetailStatus.vietnameseName}
        </span>
      ),
    },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-center text-red-800 uppercase">
              Thông tin phiên đặt món
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 uppercase">
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Tổng cộng đơn:
                    </span>
                    <span className="font-bold text-green-600">
                      {formatPrice(order?.totalAmount)}
                    </span>
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">
                      Trạng thái:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getStatusColor(
                        order?.statusId
                      )}`}
                    >
                      {order?.status.vietnameseName}
                    </span>
                  </div>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">Loại đơn:</span>
                    <span>{order?.orderType.vietnameseName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">Note:</span>
                    <span>{order?.note || "N/A"}</span>
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 uppercase">
                  Thông tin phiên
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Số thứ tự phiên đặt món:
                    </span>
                    <span>{session.orderSessionNumber}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600">
                      Thời gian đặt:
                    </span>
                    <span>{formatDateTime(session?.orderSessionTime)}</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">
                      Trạng thái:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        session?.orderSessionStatusId
                      )}`}
                    >
                      {session?.orderSessionStatus.vietnameseName}
                    </span>
                  </div>
                </div>
              </div>

              {table && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 uppercase">
                    Thông tin bàn
                  </h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Mã bàn:</span>
                      <span>{table?.tableName}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Bàn:</span>
                      <span>{table?.tableSize.vietnameseName} người</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium text-gray-600">Loại:</span>
                      <span>{table?.room.name}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h3 className="text-xl font-semibold text-red-800 uppercase  text-center">
                Chi tiết món
              </h3>
              <div className="space-y-4">
                <StyledTable
                  columns={columns}
                  dataSource={orderDetails}
                  rowKey={(record) => record.orderDetail.id}
                  pagination={false}
                  scroll={{ x: true }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

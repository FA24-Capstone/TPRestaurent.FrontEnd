import React from "react";
import { Button, Modal, Table, Tag, Tooltip } from "antd";
import { formatDateTime, formatPrice } from "../../util/Utility";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { StyledTable } from "../custom-ui/StyledTable";

const ComboTable = ({
  data,
  loading,
  isAction,
  deleteCombo,
  handleSelectRow,
}) => {
  const navigate = useNavigate();
  const renderTag = (combo) => {
    let statusConfig = {};
    if (combo.quantityLeft > 0 || combo.quantityLeft === null) {
      statusConfig = {
        color: "success",
        text: "Còn món",
        icon: <CheckCircleOutlined />,
        quantityLeft: combo.quantityLeft || 0,
      };
    } else if (combo.quantityLeft === 0) {
      statusConfig = {
        color: "error",
        text: "Hết món",
        icon: <CloseCircleOutlined />,
        quantityLeft: combo.quantityLeft || 0,
      };
    } else {
      statusConfig = {
        color: "warning",
        text: "Ngưng bán",
        icon: <ExclamationCircleOutlined />,
        quantityLeft: combo.quantityLeft || 0,
      };
    }

    return (
      <div className="flex items-center space-x-2 my-2">
        <Tooltip title={`Trạng thái: ${statusConfig.text}`}>
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="px-2 py-1 rounded-full text-sm font-semibold text-wrap"
          >
            {statusConfig.text} ({statusConfig.quantityLeft})
          </Tag>
        </Tooltip>
      </div>
    );
  };
  const columns = [
    {
      title: "Tên combo",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: ["category", "vietnameseName"],
      key: "category",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${formatPrice(price)} `,
    },
    {
      title: "Hạn bán",
      key: "dateRange",
      render: (_, record) => (
        <span>
          {formatDateTime(record.startDate)} - {formatDateTime(record.endDate)}
        </span>
      ),
    },
    {
      title: "Đánh giá",
      key: "rating",
      render: (_, record) => (
        <span>
          {record.averageRating} ({record.numberOfRating} lượt đánh giá)
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "rating",
      render: (_, record) => <span>{renderTag(record)}</span>,
    },
    ...(isAction
      ? [
          {
            title: "Hành động",
            dataIndex: "",
            key: "action",
            render: (_, record) => (
              <div className="flex gap-4">
                <Button
                  size="sm"
                  className="bg-white text-blue-800"
                  onClick={() => {
                    navigate(`/admin/create-combo/${record.comboId}`);
                  }}
                >
                  <FaEdit />
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-red-800"
                  onClick={() => {
                    Modal.confirm({
                      title: "Xác nhận xóa",
                      content: "Bạn có chắc chắn muốn xóa combo này?",
                      onOk: () => {
                        deleteCombo(record.comboId);
                      },
                    });
                  }}
                >
                  <FaTrash />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];
  return (
    <StyledTable
      columns={columns}
      dataSource={data}
      rowKey="comboId"
      pagination={false}
      loading={loading}
      size="small"
      scroll={{ x: 600 }}
      onRow={(record) => {
        return {
          onClick: () => {
            handleSelectRow(record);
          },
        };
      }}
    />
  );
};

export default ComboTable;

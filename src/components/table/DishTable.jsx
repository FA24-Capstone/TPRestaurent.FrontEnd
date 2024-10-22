import { Button, Image, Modal, Select, Table, Tag } from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { uniqueId } from "lodash";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../util/Utility";
import { StyledTable } from "../custom-ui/StyledTable";

const DishTable = ({
  dishes,
  loading,
  isAction = false,
  handleSelectRow,
  deleteDish,
}) => {
  const navigate = useNavigate();
  const renderTag = (dishSizeDetails, dish) => {
    return dishSizeDetails.map((dishSizeDetail, index) => {
      let statusConfig = {
        color: "",
        text: "",
        icon: null,
        quantityLeft: dishSizeDetail.quantityLeft,
      };

      if (
        dish.isAvailable &&
        (dishSizeDetail.quantityLeft > 0 ||
          dishSizeDetail.quantityLeft === null)
      ) {
        statusConfig = {
          color: "success",
          text: "Còn món",
          icon: <CheckCircleOutlined />,
          quantityLeft: dishSizeDetail.quantityLeft,
        };
      } else if (dish.isAvailable && dishSizeDetail.quantityLeft === 0) {
        statusConfig = {
          color: "error",
          text: "Hết món",
          icon: <CloseCircleOutlined />,
          quantityLeft: dishSizeDetail.quantityLeft,
        };
      } else {
        statusConfig = {
          color: "warning",
          text: "Ngưng bán",
          icon: <ExclamationCircleOutlined />,
          quantityLeft: dishSizeDetail.quantityLeft,
        };
      }

      return (
        <div key={index} className="flex items-center space-x-2 my-2">
          <span className="font-medium">
            {dishSizeDetail.dishSize.vietnameseName}:
          </span>
          <Tooltip title={`Trạng thái: ${statusConfig.text}`}>
            <Tag
              color={statusConfig.color}
              // icon={statusConfig.icon}
              className="px-2 py-1 rounded-full text-sm font-semibold"
            >
              {statusConfig.text} ({statusConfig.quantityLeft})
            </Tag>
          </Tooltip>
        </div>
      );
    });
  };

  const handleSelectChange = (value, record) => {
    if (value === "edit") {
      navigate(`/admin/create-menu/${record.dish.dishId}`);
    } else if (value === "delete") {
      Modal.confirm({
        title: "Xác nhận xóa món ăn",
        content: `Bạn có chắc chắn muốn xóa món ăn ${record.dish.name}?`,
        onOk: () => deleteDish(record.dish.dishId),
        okText: "Xác nhận",
        cancelText: "Hủy",
      });
    }
  };
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: uniqueId(),
      align: "center",
      fixed: "left",

      render: (_, record) => <span>{record.dish.dishId.substring(0, 8)}</span>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      align: "center",
      fixed: "left",
      width: 150,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src={record.dish.image}
            alt={record.dish.name}
            width={100}
            height={100}
            style={{
              objectFit: "cover",
              borderRadius: "20px",
              display: "block",
            }}
          />
        </div>
      ),
    },
    {
      title: "Tên món ",
      dataIndex: "name",
      key: "name",
      align: "center",
      fixed: "left",
      render: (_, record) => (
        <span className="uppercase">{record.dish.name}</span>
      ),
    },
    {
      title: "Danh mục ",
      dataIndex: "category",
      key: "category",
      render: (_, record) => (
        <span className="uppercase">
          {record.dish.dishItemType.vietnameseName}
        </span>
      ),
    },
    {
      title: "Size nhỏ",
      dataIndex: "dishSizeDetails",
      key: "small",
      render: (sizes) =>
        `${formatPrice(
          sizes.find((s) => s.dishSize?.name === "SMALL")?.price
        )}`,
    },
    {
      title: "Size vừa",
      dataIndex: "dishSizeDetails",
      key: "medium",
      render: (sizes) =>
        `${formatPrice(
          sizes.find((s) => s.dishSize?.name === "MEDIUM")?.price
        )} `,
    },
    {
      title: "Size lớn",
      dataIndex: "dishSizeDetails",
      key: "large",
      render: (sizes) =>
        `${formatPrice(
          sizes.find((s) => s.dishSize?.name === "LARGE")?.price
        )} `,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 250,
      render: (_, record) => renderTag(record.dishSizeDetails, record.dish),
    },
    ...(isAction
      ? [
          {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            width: 140,
            render: (_, record) => (
              <div className="">
                <Select
                  defaultValue="actions"
                  style={{ width: 120 }}
                  onChange={(value) => handleSelectChange(value, record)}
                >
                  <Option value="actions" disabled>
                    Hành động
                  </Option>
                  <Option value="edit">
                    <div className="flex items-center">
                      <FaEdit color="blue" />{" "}
                      <span className="ml-2">Chỉnh sửa</span>
                    </div>
                  </Option>
                  <Option value="delete">
                    <div className="flex items-center">
                      <FaTrash color="red" /> <span className="ml-2">Xoá</span>
                    </div>
                  </Option>
                </Select>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <StyledTable
      columns={columns}
      dataSource={dishes}
      pagination={false}
      loading={loading}
      key={uniqueId()}
      onRow={(record) => {
        return {
          onClick: () => {
            handleSelectRow(record);
          },
        };
      }}
      scroll={{ x: 768 }}
    />
  );
};
export default DishTable;

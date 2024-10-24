import { Table, Tag, Space, DatePicker, Button } from "antd";
import Cash_Logo from "../../../assets/imgs/payment-icon/Cash_Logo.png";
import VNpay_Logo from "../../../assets/imgs/payment-icon/VNpay_Logo.png";
import MoMo_Logo from "../../../assets/imgs/payment-icon/MoMo_Logo.png";
import { CreditCard, DollarSign, ShoppingCart } from "lucide-react";
import { formatDateTime, formatPrice } from "../../../util/Utility";
import { StyledTable } from "../../../components/custom-ui/StyledTable";
const { RangePicker } = DatePicker;

const statusMap = {
  0: { text: "Đang xử lý", color: "blue" },
  1: { text: "Thất bại", color: "red" },
  2: { text: "Thành công", color: "green" },
};

const transactionTypeMap = {
  1: { text: "Đặt cọc", color: "yellow", icon: <DollarSign /> },
  2: { text: "Đặt hàng", color: "red", icon: <ShoppingCart /> },
  3: { text: "Nạp số dư", color: "green", icon: <CreditCard /> },
  4: { text: "Hoàn tiền", color: "blue", icon: <DollarSign /> },
};

const getMethodIcon = (method) => {
  switch (method) {
    case 1:
      return <img src={Cash_Logo} alt="" className="w-12 h-12" />;
    case 2:
      return <img src={VNpay_Logo} alt="" className="w-12 h-12" />;
    case 3:
      return <img src={MoMo_Logo} alt="" className="w-12 h-12" />;

    default:
      return null;
  }
};
const TransactionTable = ({ data, loading }) => {
  const renderName = (record) => {
    if (record.order?.account) {
      return `${record.order?.account?.lastName} ${record.order?.account?.firstName}`;
    }
    if (record.storeCredit) {
      return `${record.storeCredit?.account?.lastName} ${record.storeCredit?.account?.firstName}`;
    } else {
      return "Khách vãng lai";
    }
  };
  const columns = [
    {
      title: "Mã giao dịch",
      dataIndex: "id",
      key: "id",
      align: "center",

      render: (text) => <a>{text.substring(0, 8)}</a>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      align: "center",

      render: (_, record) => <span>{renderName(record)}</span>,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      align: "center",

      render: (date) => formatDateTime(date),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "center",

      render: (amount) => `${formatPrice(amount)} `,
    },

    {
      title: "Trạng thái",
      key: "transationStatusId",
      dataIndex: ["transationStatusId"],
      align: "center",

      render: (_, record) =>
        statusMap[record.transationStatusId] ? (
          <Tag color={statusMap[record.transationStatusId].color}>
            {statusMap[record.transationStatusId].text}
          </Tag>
        ) : null,
    },

    {
      title: "Phương thức thanh toán",
      dataIndex: ["paymentMethodId"],
      key: "paymentMethod",

      render: (paymentMethod) => (
        <div className="flex justify-center">
          {getMethodIcon(paymentMethod)}
        </div>
      ),
      align: "center",
    },
    {
      title: "Loại giao dịch",
      key: "transactionType",
      dataIndex: ["transactionTypeId"],
      align: "center",
      render: (transactionTypeId) =>
        transactionTypeMap[transactionTypeId] ? (
          <Tag
            color={transactionTypeMap[transactionTypeId].color}
            className="flex items-center  justify-center border-none "
          >
            {transactionTypeMap[transactionTypeId].icon}
            {transactionTypeMap[transactionTypeId].text}
          </Tag>
        ) : null,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",

      render: (_, record) => (
        <Space size="middle">
          <Button>Xem chi tiết</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <StyledTable
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default TransactionTable;

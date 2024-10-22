import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { EyeIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  IconButton,
  Tooltip,
  Chip,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Table } from "antd";
import { formatDateTime, formatPrice } from "../../util/Utility";
import useCallApi from "../../api/useCallApi";
import Pagination from "../../components/pagination/Pagination";
import TabMananger from "../../components/tab/TabManager";
import { OrderApi } from "../../api/endpoint";
import OrderTag from "../../components/tag/OrderTag";
import ModalReservationDetail from "../../components/reservation/modal/ModalReservationDetail";
import { StyledTable } from "../../components/custom-ui/StyledTable";

const TABS = [
  {
    label: "Đang dùng bữa",
    value: "3",
  },
  {
    label: "Hoàn thành",
    value: "8",
  },
  {
    label: "Huỷ đơn",
    value: "9",
  },
];

export function AdminMealHistoryPage() {
  const [activeTab, setActiveTab] = useState("3");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const [selectedOrderType, setSelectedOrderType] = useState(1);
  const { callApi, error, loading } = useCallApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const [orderDetail, setOrderDetail] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (_, record) => (
        <Typography>{record.order.orderId.substring(0, 8)}</Typography>
      ),
    },
    {
      title: "Mã bàn",
      dataIndex: "tableName",
      key: "tableName",
      render: (_, record) => (
        <Typography>{`${record.table.tableName} `}</Typography>
      ),
    },
    {
      title: "Loại bàn",
      dataIndex: "tableSize",
      key: "tableSize",
      render: (_, record) => (
        <Typography>
          {`Bàn ${record.table.tableSize.vietnameseName} người`}
        </Typography>
      ),
    },
    {
      title: "Loại phòng",
      dataIndex: "room",
      key: "room",
      render: (_, record) => <Typography>{record.table.room.name}</Typography>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, record) => (
        <Typography>{formatPrice(record.order.totalAmount)} </Typography>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => <OrderTag orderStatusId={record.order.statusId} />,
    },
    {
      title: "Ngày dùng bữa",
      dataIndex: "mealTime",
      key: "mealTime",
      render: (_, record) => (
        <Typography>{formatDateTime(record.order.mealTime)}</Typography>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      dataIndex: "orderId",
      render: (_, record) => (
        <Tooltip content="Xem chi tiết">
          <IconButton
            variant="text"
            onClick={() => fetchOrderDetail(record.order.orderId)}
          >
            <EyeIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const fetchOrder = async () => {
    const response = await callApi(
      `${OrderApi.GET_ALL_TABLE_DETAIL}/${currentPage}/${totalItems}?orderStatus=${activeTab}`,
      "GET"
    );
    if (response?.isSuccess) {
      setData(response?.result?.items);
      setTotalPages(response?.result?.totalPages);
    } else {
      setData([]);
      setTotalPages(0);
    }
  };

  const fetchOrderDetail = async (id) => {
    const response = await callApi(`${OrderApi.GET_DETAIL}/${id}`, "GET");
    if (response?.isSuccess) {
      setOrderDetail(response?.result);
      setIsModalOpen(true);
    }
  };
  useEffect(() => {
    fetchOrder();
  }, [activeTab, selectedOrderType, currentPage]);

  return (
    <>
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Lịch sử đơn hàng
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Xem và quản lý tất cả các đơn hàng
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button variant="outlined" size="sm">
                Xuất báo cáo
              </Button>
              <Button
                className="flex items-center bg-red-700 gap-3"
                size="sm"
                onClick={fetchOrder}
              >
                <ArrowPathIcon strokeWidth={2} className="h-4 w-4" /> Làm mới
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="mb-4">
              <TabMananger
                items={TABS}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            <div className="w-full md:w-72">
              <Input
                label="Tìm kiếm"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-auto h-[550px]">
          <StyledTable
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey="orderId"
            loading={loading}
          />
        </CardBody>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleCurrentPageChange}
        />
      </Card>
      <ModalReservationDetail
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(!isModalOpen);
        }}
        reservation={orderDetail}
      />
    </>
  );
}

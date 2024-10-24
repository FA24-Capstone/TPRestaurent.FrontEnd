import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { EyeIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { formatDateTime, formatPrice } from "../../util/Utility";
import { Table } from "antd";
import Pagination from "../../components/pagination/Pagination";
import useCallApi from "../../api/useCallApi";
import TabMananger from "../../components/tab/TabManager";
import OrderTag from "../../components/tag/OrderTag";
import { OrderApi } from "../../api/endpoint";
import ModalReservationDetail from "../../components/reservation/modal/ModalReservationDetail";
import { StyledTable } from "../../components/custom-ui/StyledTable";
import { OrderStatus } from "../../util/GlobalType";

const TABS = OrderStatus.filter(
  (item) => item.value == 1 || item.value == 2 || item.value == 10
);

export function AdminReservationPage() {
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { callApi, error, loading } = useCallApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const [orderDetail, setOrderDetail] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchReservations = async () => {
    const response = await callApi(
      `${
        OrderApi.GET_ALL
      }/${currentPage}/${totalItems}?status=${activeTab}&orderType=${1}`,
      "GET"
    );
    if (response?.isSuccess) {
      setReservations(response?.result?.items);
      setTotalPages(response?.result?.totalPages);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [activeTab, currentPage]);

  const fetchOrderDetail = async (id) => {
    const response = await callApi(`${OrderApi.GET_DETAIL}/${id}`, "GET");
    if (response?.isSuccess) {
      setOrderDetail(response?.result);
      setIsModalOpen(true);
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <Typography>{text.substring(0, 8)}</Typography>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerInfo",
      key: "customerInfo",
      render: (_, record) => (
        <Typography>
          {`${record.account?.firstName} ${record.account?.lastName}`}
        </Typography>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, record) => (
        <Typography>{formatPrice(record.totalAmount)} </Typography>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => <OrderTag orderStatusId={record.statusId} />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (_, record) => (
        <Typography>{formatDateTime(record.reservationDate)}</Typography>
      ),
    },
    {
      title: "Ngày dùng bữa",
      dataIndex: "mealTime",
      key: "mealTime",
      render: (_, record) => (
        <Typography>{`${formatDateTime(record.mealTime)} ${formatDateTime(
          record.endTime
        )}`}</Typography>
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
            onClick={() => fetchOrderDetail(record.orderId)}
          >
            <EyeIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Quản lý đặt bàn
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Xem và quản lý tất cả các đơn đặt bàn
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outlined" size="sm">
              Xuất báo cáo
            </Button>
            <Button
              className="flex items-center bg-red-700 gap-3"
              size="sm"
              onClick={fetchReservations}
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
          dataSource={reservations}
          rowKey="reservationId"
          pagination={false}
          loading={loading}
        />
      </CardBody>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleCurrentPageChange}
      />
      <ModalReservationDetail
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(!isModalOpen);
        }}
        reservation={orderDetail}
      />
    </Card>
  );
}

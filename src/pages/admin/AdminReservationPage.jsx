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
import { Calendar, DatePicker, Table } from "antd";
import Pagination from "../../components/pagination/Pagination";
import useCallApi from "../../api/useCallApi";
import TabMananger from "../../components/tab/TabManager";
import OrderTag from "../../components/tag/OrderTag";
import { OrderApi } from "../../api/endpoint";
import ModalReservationDetail from "../../components/reservation/modal/ModalReservationDetail";
import { StyledTable } from "../../components/custom-ui/StyledTable";
import { OrderStatus } from "../../util/GlobalType";
import dayjs from "dayjs";
import { configCalendar } from "./AdminMealHistoryPage";
const { RangePicker } = DatePicker;

const TABS = OrderStatus.filter(
  (item) => item.value == 1 || item.value == 2 || item.value == 10
);
TABS.unshift({ value: 0, label: "Tất cả" });
export function AdminReservationPage() {
  const [activeTab, setActiveTab] = useState("0");
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
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedRange, setSelectedRange] = useState([dayjs(), dayjs()]);
  const [showCalendar, setShowCalendar] = useState(true);
  const handleRangeChange = (dates) => {
    setSelectedRange(dates);
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchReservations = async () => {
    const response = await callApi(
      `${OrderApi.GET_ORDER_WITH_FILTER}`,
      "POST",
      {
        startDate: !showCalendar
          ? selectedRange[0].format("YYYY-MM-DD")
          : selectedDate.format("YYYY-MM-DD"),
        endDate: !showCalendar
          ? selectedRange[1].format("YYYY-MM-DD")
          : selectedDate.format("YYYY-MM-DD"),
        status: activeTab || undefined,
        type: 1,
      }
    );
    if (response?.isSuccess) {
      setReservations(response?.result?.items);
      setTotalPages(response?.result?.totalPages);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [activeTab, currentPage, selectedDate, selectedRange]);

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
        <Typography>
          {formatPrice(record.totalAmount || record.deposit)}
        </Typography>
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
            <Button
              className="flex items-center bg-red-700 gap-3"
              size="sm"
              onClick={fetchReservations}
            >
              <ArrowPathIcon strokeWidth={2} className="h-4 w-4" /> Làm mới
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="grid grid-cols-3 max-h-[650px] overflow-y-scroll gap-2">
        <div className="col-span-1  overflow-auto">
          <Typography className="text-red-800 uppercase font-semibold">
            Chọn khoảng thời gian
          </Typography>

          <div className="flex justify-end">
            {!showCalendar && (
              <RangePicker
                locale={configCalendar}
                onChange={handleRangeChange}
                className="mt-4 w-full"
                format={"DD-MM-YYYY"}
                value={selectedRange}
              />
            )}
            <Button
              onClick={toggleCalendar}
              className="mt-4 bg-red-800 text-white ml-4 my-2"
            >
              {showCalendar ? "Ẩn lịch" : "Hiển thị lịch"}
            </Button>
          </div>

          {showCalendar && (
            <div className="max-h-[500px] overflow-y-auto">
              <Calendar
                locale={configCalendar}
                value={selectedDate}
                className="mt-4"
                onChange={handleDateChange}
              />
            </div>
          )}
        </div>

        <div className="col-span-2">
          <TabMananger
            items={TABS}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <StyledTable
            columns={columns}
            dataSource={reservations}
            rowKey="reservationId"
            pagination={false}
            loading={loading}
          />
        </div>
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

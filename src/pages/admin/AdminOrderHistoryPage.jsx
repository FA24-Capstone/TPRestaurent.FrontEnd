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
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { message, Table, Checkbox, Select, DatePicker, Calendar } from "antd";
import { formatDateTime, formatPrice, showError } from "../../util/Utility";
import useCallApi from "../../api/useCallApi";
import Pagination from "../../components/pagination/Pagination";
import TabMananger from "../../components/tab/TabManager";
import { AccountApi, OrderApi } from "../../api/endpoint";
import OrderTag from "../../components/tag/OrderTag";
import ModalReservationDetail from "../../components/reservation/modal/ModalReservationDetail";
import { StyledTable } from "../../components/custom-ui/StyledTable";
import { OrderStatus } from "../../util/GlobalType";
import dayjs from "dayjs";
import { configCalendar } from "./AdminMealHistoryPage";

const TABS = OrderStatus.filter((item) => item.value > 3 && item.value < 10);
const { RangePicker } = DatePicker;

export function AdminOrderHistoryPage() {
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const { callApi, loading, error } = useCallApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const [orderSelected, setOrderSelected] = useState({});
  const [shipperAvailable, setShipperAvailable] = useState([]);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
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

  const fetchShipperAvailable = async () => {
    const response = await callApi(
      `${AccountApi.LOAD_AVAILABLE_SHIPPER}`,
      "GET"
    );
    if (response?.isSuccess) {
      setShipperAvailable(response?.result?.items);
    } else {
      showError(error);
    }
  };

  const handleSubmitShipper = async () => {
    if (!selectedShipper) {
      message.error("Vui lòng chọn shipper");
      return;
    }
    if (selectedOrders.length === 0) {
      message.error("Vui lòng chọn ít nhất một đơn hàng");
      return;
    }
    const response = await callApi(
      `${OrderApi.ASSIGN_ORDER_TO_SHIPPER}?shipperId=${selectedShipper}`,
      "POST",
      selectedOrders
    );
    if (response?.isSuccess) {
      message.success("Đã cập nhật shipper thành công");
      await fetchOrder();
      setSelectedOrders([]);
    } else {
      showError(error);
    }
  };

  const handleOrderSelection = (orderId, checked) => {
    setSelectedOrders((prev) =>
      checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
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
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (_, record) => (
        <Typography>{formatDateTime(record.orderDate)}</Typography>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      dataIndex: "action",
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
  if (activeTab === 6) {
    columns.unshift({
      title: "Chọn",
      key: "select",
      render: (_, record) => (
        <Checkbox
          checked={selectedOrders.includes(record.orderId)}
          onChange={(e) =>
            handleOrderSelection(record.orderId, e.target.checked)
          }
        />
      ),
    });
  }
  if ([7, 8, 9].includes(activeTab)) {
    columns.splice(columns.length - 1, 0, {
      title: "Shipper",
      dataIndex: "shipper",
      key: "shipper",
      render: (_, record) => (
        <Typography>
          {record.shipper?.firstName} {record.shipper?.lastName}
        </Typography>
      ),
    });
  }
  const fetchOrder = async () => {
    const response = await callApi(
      `${OrderApi.GET_ORDER_WITH_FILTER}`,
      "POST",
      {
        startDate:
          selectedRange[0].format("YYYY-MM-DD") ||
          selectedDate.format("YYYY-MM-DD"),
        endDate:
          selectedRange[1].format("YYYY-MM-DD") ||
          selectedDate.format("YYYY-MM-DD"),
        status: activeTab || undefined,
        type: 2,
      }
    );
    if (response?.isSuccess) {
      setData(response?.result?.items);
      setTotalPages(response?.result?.totalPages);
    }
  };

  useEffect(() => {
    fetchOrder();
    if (activeTab === 6) {
      fetchShipperAvailable();
    }
  }, [activeTab, currentPage, selectedShipper, selectedDate, selectedRange]);

  const fetchOrderDetail = async (orderId) => {
    const response = await callApi(`${OrderApi.GET_DETAIL}/${orderId}`, "GET");
    if (response?.isSuccess) {
      setOrderSelected(response?.result);
      handleOpen();
    }
  };
  if (["7", "8", "9"].includes(activeTab)) {
    columns.splice(columns.length - 1, 0, {
      title: "Shipper",
      dataIndex: "shipper",
      key: "shipper",
      render: (_, record) => (
        <Typography>
          {record.shipper?.firstName} {record.shipper?.lastName}
        </Typography>
      ),
    });
  }
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
        </CardHeader>
        <CardBody className="grid grid-cols-3 gap-2">
          <div className="col-span-1  overflow-auto">
            {activeTab !== 6 && (
              <>
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
              </>
            )}

            {activeTab === 6 && (
              <div className="flex flex-col mb-4">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="uppercase text-red-800 text-xl my-4"
                >
                  Chọn shipper để giao hàng
                </Typography>
                <Select
                  value={selectedShipper}
                  onChange={(value) => setSelectedShipper(value)}
                  className="mb-4"
                >
                  {shipperAvailable.map((shipper) => (
                    <Option key={shipper.id} value={shipper.id}>
                      {shipper.firstName} {shipper.lastName}
                    </Option>
                  ))}
                </Select>
                <Button
                  className="bg-red-700 text-white"
                  onClick={handleSubmitShipper}
                >
                  Xác nhận shipper
                </Button>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="mb-4">
              <TabMananger
                items={TABS}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            <StyledTable
              columns={columns}
              dataSource={data}
              pagination={false}
              rowKey="orderId"
              loading={loading}
            />
          </div>
        </CardBody>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleCurrentPageChange}
        />
      </Card>
      <ModalReservationDetail
        visible={open}
        onClose={() => setOpen(!open)}
        reservation={orderSelected}
      />
    </>
  );
}

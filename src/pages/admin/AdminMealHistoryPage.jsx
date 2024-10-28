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
import { Calendar, DatePicker, Select, Table } from "antd";
import {
  combineTimes,
  formatDateTime,
  formatPrice,
  showError,
} from "../../util/Utility";
import useCallApi from "../../api/useCallApi";
import Pagination from "../../components/pagination/Pagination";
import TabMananger from "../../components/tab/TabManager";
import { OrderApi, TableApi } from "../../api/endpoint";
import OrderTag from "../../components/tag/OrderTag";
import ModalReservationDetail from "../../components/order/modal/ModalReservationDetail";
import { StyledTable } from "../../components/custom-ui/StyledTable";
import { OrderStatus } from "../../util/GlobalType";
import dayjs from "dayjs";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import ModalOrderDetailAdmin from "../../components/order/modal/ModalOrderDetailAdmin";
const { RangePicker } = DatePicker;

const TABS = OrderStatus.filter(
  (item) => item.value == 5 || item.value == 3 || item.value == 9
);
TABS.unshift({ value: 0, label: "Tất cả" });

export const configCalendar = {
  lang: {
    locale: "vi_VN",
    placeholder: "Chọn ngày",
    rangePlaceholder: ["Ngày bắt đầu", "Ngày kết thúc"],
    today: "Hôm nay",
    now: "Bây giờ",
    backToToday: "Trở về hôm nay",
    ok: "OK",
    clear: "Xóa",
    month: "Tháng",
    year: "Năm",
    timeSelect: "Chọn thời gian",
    dateSelect: "Chọn ngày",
    monthSelect: "Chọn tháng",
    yearSelect: "Chọn năm",
    decadeSelect: "Chọn thập kỷ",
    yearFormat: "YYYY",
    dateFormat: "DD-MM-YYYY",
    dayFormat: "D",
    dateTimeFormat: "DD-MM-YYYY HH:mm:ss",
    monthFormat: "MMMM",
    monthBeforeYear: true,
    previousMonth: "Tháng trước (PageUp)",
    nextMonth: "Tháng sau (PageDown)",
    previousYear: "Năm trước (Control + left)",
    nextYear: "Năm sau (Control + right)",
    previousDecade: "Thập kỷ trước",
    nextDecade: "Thập kỷ sau",
    previousCentury: "Thế kỷ trước",
    nextCentury: "Thế kỷ sau",
    shortWeekDays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    shortMonths: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
  },
  timePickerLocale: {
    placeholder: "Chọn thời gian",
  },
  dateFormat: "DD-MM-YYYY",
  dateTimeFormat: "DD-MM-YYYY HH:mm:ss",
  weekFormat: "wo-YYYY",
  monthFormat: "MM-YYYY",
};
export function AdminMealHistoryPage() {
  const [activeTab, setActiveTab] = useState("0");
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
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedRange, setSelectedRange] = useState([dayjs(), dayjs()]);
  const [showCalendar, setShowCalendar] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const handleRangeChange = (dates) => {
    setSelectedRange(dates);
  };
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (_, record) => (
        <Typography>{record.orderId.substring(0, 8)}</Typography>
      ),
    },
    {
      title: "Mã bàn",
      dataIndex: "tableName",
      key: "tableName",
      render: (_, record) => (
        <>
          {record.tables.map((table) => (
            <Typography>{table.table?.tableName}</Typography>
          ))}
        </>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, record) => (
        <Typography>{formatPrice(record?.totalAmount)} </Typography>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => <OrderTag orderStatusId={record?.statusId} />,
    },
    {
      title: "Ngày dùng bữa",
      dataIndex: "mealTime",
      key: "mealTime",
      render: (_, record) => (
        <Typography>
          {combineTimes(record?.mealTime, record?.endTime)}
        </Typography>
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
  const fetchTable = async () => {
    const response = await callApi(`${TableApi.GET_ALL}/1/1000`, "GET");
    if (response?.isSuccess) {
      setTables(response?.result?.items);
    } else {
      showError(error);
    }
  };
  useEffect(() => {
    fetchTable();
  }, []);
  const fetchOrder = async () => {
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
        status: Number(activeTab) || undefined,
        type: Number(selectedOrderType),
        tableId: selectedTable,
      }
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
  }, [
    activeTab,
    selectedOrderType,
    currentPage,
    selectedTable,
    selectedDate,
    selectedRange,
  ]);
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  if (loading) {
    return <LoadingOverlay isLoading={true} />;
  }
  return (
    <>
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography
                variant="h5"
                className="text-red-800 uppercase text-center"
              >
                Lịch sử đặt món tại quán
              </Typography>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
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
        <CardBody className="grid grid-cols-1 xl:grid-cols-3 max-h-[900px] overflow-y-scroll ">
          <div className="col-span-1 p-10">
            <div className="w-full  overflow-auto">
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
                  className="mt-4 bg-red-800 text-white ml-4"
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

            <div>
              <div className="flex items-center justify-between">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="mt-4 text-red-800 font-bold my-1"
                >
                  CÁC BÀN TẠI NHÀ HÀNG THIÊN PHÚ
                </Typography>
                <IconButton className="bg-transparent shadow-none rounded-none hover:shadow-none hover:text-red-500  hover:scale-105">
                  <ArrowPathIcon
                    strokeWidth={2}
                    onClick={() => setSelectedTable(null)}
                    className="h-6 w-6 text-red-800 cursor-pointer"
                  />
                </IconButton>
              </div>
              <div className="grid grid-cols-3 gap-2   rounded-xl shadow-xl p-4 border-2 ">
                {tables.length > 0 &&
                  tables.map((table) => (
                    <div
                      onClick={() => setSelectedTable(table.tableId)}
                      style={{
                        border: "1px solid #e5e7eb",
                      }}
                      className={`${
                        selectedTable === table.tableId
                          ? "bg-red-800 text-white  hover:bg-red-400"
                          : "bg-white text-red-700 hover:bg-red-100"
                      } rounded-lg  font-semibold text-center h-12 flex justify-center items-center hover:cursor-pointer`}
                    >
                      <span className="block">{table.tableName}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="col-span-2 ">
            <div className="mb-4 flex items-center justify-between">
              <TabMananger
                items={TABS}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <Select
                className=""
                onChange={(value) => setSelectedOrderType(value)}
                defaultValue="1"
              >
                <Select.Option value="1">Đặt trước</Select.Option>
                <Select.Option value="3">Không đặt trước</Select.Option>
              </Select>
            </div>
            <div className="overflow-auto h-[550px]">
              <StyledTable
                columns={columns}
                dataSource={data}
                pagination={false}
                rowKey="orderId"
                loading={loading}
              />
            </div>
          </div>
        </CardBody>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleCurrentPageChange}
        />
      </Card>
      <ModalOrderDetailAdmin
        visible={isModalOpen}
        onClose={() => {
          setIsModalOpen(!isModalOpen);
        }}
        reservation={orderDetail}
      />
    </>
  );
}

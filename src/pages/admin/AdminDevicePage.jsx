import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Typography,
} from "@material-tailwind/react";
import { Skeleton, Table } from "antd";
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { MdEditNote } from "react-icons/md";
import useCallApi from "../../api/useCallApi";
import Pagination from "../../components/pagination/Pagination";

export function AdminDevicePage() {
  const [devices, setDevices] = useState([]);
  const { callApi, error, loading } = useCallApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchData = async () => {
    const response = await callApi(
      `/device/get-all-device?pageNumber=${currentPage}&pageSize=${totalItems}`,
      "GET"
    );
    if (response?.isSuccess) {
      setDevices(response?.result?.items);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const columns = [
    {
      title: "Mã thiết bị ",
      dataIndex: "deviceCode",
      key: "deviceCode",
    },
    {
      title: "Tên bàn",
      dataIndex: ["table", "tableName"],
      key: "tableName",
    },
    {
      title: " Loại bàn",
      dataIndex: ["table", "tableSizeId"],
      key: "tableSizeId",
      render: (tableSizeId) => {
        switch (tableSizeId) {
          case 1:
            return "Bàn 1 người";
          case 2:
            return "Bàn 2 người";
          case 3:
            return "Bàn 3 người";
          case 4:
            return "Bàn 4 người";
          case 5:
            return "Bàn 5 người";
          case 6:
            return "Bàn 6 người";
          case 7:
            return "Bàn 7 người";
          case 8:
            return "Bàn 8 người";
          case 9:
            return "Bàn 9 người";
          case 10:
            return "Bàn 10 người";
          default:
            return "Bàn 2 người";
        }
      },
    },
    {
      title: "Hành động",
      dataIndex: "",
      key: "",
      render: () => (
        <div className="flex gap-4">
          <Button size="sm" className="bg-white text-yellow-800">
            <FaLock />
          </Button>
          <Button size="sm" className="bg-white text-red-800">
            <MdEditNote />
          </Button>
        </div>
      ),
    },
  ];
  if (loading) {
    return <Skeleton />;
  }
  return (
    <Card className="h-full w-full">
      {/* <LoadingOverlay /> */}
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Quản lý thiết bị
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Xem và quản lý tất cả các thiết bị tại nhà hàng
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outlined" size="sm">
              Xuất báo cáo
            </Button>
            <Button
              className="flex items-center bg-red-700 gap-3"
              size="sm"
              //   onClick={fetchReservations}
            >
              <ArrowPathIcon strokeWidth={2} className="h-4 w-4" /> Làm mới
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="mb-4">
            <div className="flex border-b border-gray-200"></div>
          </div>
          <div className="w-full md:w-72">
            <Input
              label="Tìm kiếm"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-auto h-[550px]">
        <Table dataSource={devices} columns={columns} rowKey="deviceId" />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleCurrentPageChange}
        />
      </CardBody>
    </Card>
  );
}

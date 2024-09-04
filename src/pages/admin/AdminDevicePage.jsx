import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Typography,
} from "@material-tailwind/react";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import { Table } from "antd";
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { getAllDevices } from "../../api/deviceApi";
import { useEffect, useState } from "react";

export function AdminDevicePage() {
  const [devices, setDevices] = useState([]);
  const fetchData = async () => {
    const response = await getAllDevices(1, 10);
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
      title: "Bàn",
      dataIndex: ["table", "tableSizeId"],
      key: "tableSizeId",
    },
  ];
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
              //   value={searchQuery}
              //   onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-auto h-[550px]">
        <Table dataSource={devices} columns={columns} rowKey="deviceId" />
      </CardBody>
    </Card>
  );
}

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import TransactionTable from "./transaction/TransactionTable";
import useCallApi from "../../api/useCallApi";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import TabMananger from "../../components/tab/TabManager";
import Pagination from "../../components/pagination/Pagination";
import { Skeleton } from "antd";
import { TransactionStatus } from "../../util/GlobalType";

const TABS = TransactionStatus;

export function TransactionPage() {
  const [activeTab, setActiveTab] = useState("");
  const [transactionData, setTransactionData] = useState([]);
  const { callApi, error, loading } = useCallApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchData = async () => {
    const response = await callApi(
      `/transaction/get-all-payment/${currentPage}/${totalItems}?transationStatus=${activeTab}`,
      "GET"
    );
    if (response?.isSuccess) {
      setTransactionData(response.result?.items);
      setTotalPages(response.result.totalPages);
    }
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, activeTab]);
  if (loading) {
    return <Skeleton />;
  }
  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Danh sách giao dịch
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Xem và quản lý tất cả các giao dịch
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outlined" size="sm">
              Xuất báo cáo
            </Button>
            <Button className="flex items-center gap-3 bg-red-800" size="sm">
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
            />
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll max-h-[500px] px-0">
        <TransactionTable data={transactionData} loading={loading} />
      </CardBody>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleCurrentPageChange}
      />
    </Card>
  );
}

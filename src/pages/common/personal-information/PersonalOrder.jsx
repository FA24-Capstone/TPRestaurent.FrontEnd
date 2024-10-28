import { useEffect, useState } from "react";
import useCallApi from "../../../api/useCallApi";
import { useSelector } from "react-redux";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import Pagination from "../../../components/pagination/Pagination";
import TabMananger from "../../../components/tab/TabManager";
import { OrderApi } from "../../../api/endpoint";
import OrderHistoryList from "../../../components/order/order-history/OrderHistoryList";

const PersonalOrder = () => {
  const { callApi, error, loading } = useCallApi();
  const user = useSelector((state) => state.user.user || {});
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const [activeTab, setActiveTab] = useState(4);

  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchData = async () => {
    const res = await callApi(
      `${OrderApi.GET_BY_PHONE}/${currentPage}/${totalItems}?phoneNumber=${user.phoneNumber}&status=${activeTab}&orderType=2`,
      "GET"
    );
    if (res.isSuccess) {
      setOrders(res.result.items);
      setTotalPages(res.result.totalPages);
    }
  };
  console.log(activeTab);
  useEffect(() => {
    fetchData();
  }, [user, currentPage, activeTab]);
  const tabs = [
    { value: 4, label: "Chờ xác nhận" },
    { value: 5, label: "Đã thanh toán" },
    { value: 6, label: "Chuẩn bị giao hàng" },
    { value: 7, label: "Đang giao" },
    { value: 8, label: "Đã nhận hàng" },
    { value: 9, label: "Đã huỷ" },
  ];

  if (loading) {
    return <LoadingOverlay isLoading={loading} />;
  }
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="uppercase text-red-700 font-bold text-2xl mb-6">
        Thông tin của tôi
      </h1>

      <div className="mb-4">
        <TabMananger
          items={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="mt-4">
        <div className="h-[38rem] overflow-auto">
          <OrderHistoryList orders={orders} />
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handleCurrentPageChange}
        />
      </div>
    </div>
  );
};
export default PersonalOrder;

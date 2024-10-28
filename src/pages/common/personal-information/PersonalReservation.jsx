import { useEffect, useState } from "react";
import useCallApi from "../../../api/useCallApi";
import { useSelector } from "react-redux";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import Pagination from "../../../components/pagination/Pagination";
import TabMananger from "../../../components/tab/TabManager";
import { OrderApi } from "../../../api/endpoint";
import ReservationList from "../../../components/order/order-list/ReservationList";

const PersonalReservation = () => {
  const { callApi, error, loading } = useCallApi();
  const user = useSelector((state) => state.user.user || {});
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 10;
  const [activeTab, setActiveTab] = useState("");

  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchData = async () => {
    const res = await callApi(
      `${OrderApi.GET_BY_PHONE}/${currentPage}/${totalItems}?phoneNumber=${user.phoneNumber}&status=${activeTab}&orderType=1`,
      "GET"
    );
    if (res.isSuccess) {
      setOrders(res.result.items);
      setTotalPages(res.result.totalPages);
    }
  };
  useEffect(() => {
    fetchData();
  }, [user, currentPage, activeTab]);
  const tabs = [
    { value: "", label: "Tất cả" },
    { value: 1, label: "Đã xếp bàn" },
    { value: 2, label: "Đã thanh toán cọc" },
    { value: 3, label: "Đang dùng bữa" },
    { value: 8, label: "Đã huỷ" },
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
          <ReservationList reservations={orders} />
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
export default PersonalReservation;

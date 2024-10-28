import { useEffect, useState } from "react";
import useCallApi from "../../../api/useCallApi";
import { formatDateTime, formatPrice, showError } from "../../../util/Utility";
import LoadingOverlay from "../../loading/LoadingOverlay";
import { OrderApi } from "../../../api/endpoint";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import OrderDetail from "../order-detail/OrderDetail";

const OrderHistoryItem = ({ order }) => {
  const { callApi, error, loading } = useCallApi();
  const { orderDetail } = order;
  const [showDetails, setShowDetails] = useState(false);
  const [reservationData, setReservationData] = useState({});

  const handleChange = async () => {
    const response = await callApi(
      `${OrderApi.GET_DETAIL}/${order.orderId}`,
      "GET"
    );
    if (response?.isSuccess) {
      setReservationData(response?.result);
      setCurrentReservationId(id);
    }
  };
  useEffect(() => {
    if (showDetails) {
      handleChange(order.orderId);
    }
  }, [showDetails]);

  if (loading) {
    return <LoadingOverlay isLoading={loading} />;
  }
  const renderOrderTime = () => {
    switch (order.orderTypeId) {
      case 1:
        return formatDateTime(order.reservationDate);
      case 2:
        return formatDateTime(order.orderDate);
      case 3:
        return formatDateTime(order.mealTime);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center mb-2 md:mb-0">
            <p className="text-gray-600 mr-2">
              Ngày tạo đơn: {renderOrderTime()}
            </p>
            <span className="text-gray-400">|</span>
            <p className="text-gray-600 ml-2">
              ID: {order.orderId.substring(0, 8)}
            </p>
          </div>
          <p className="text-green-600 font-semibold uppercase">
            {order.status?.vietnameseName}
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center mb-2 md:mb-0">
            <img
              src={
                orderDetail?.dishSizeDetail?.dish?.image ||
                orderDetail?.combo?.image
              }
              alt=""
              className="w-16 h-16 object-cover rounded-md mr-4"
            />
            <div>
              <p className="font-semibold">
                {orderDetail?.dishSizeDetail?.dish?.name ||
                  orderDetail?.combo?.name}
              </p>
              <p className="text-gray-600">
                {`Số lượng: ${orderDetail?.quantity}`}
              </p>
              <p className="text-gray-800 font-medium">
                {formatPrice(
                  orderDetail?.dishSizeDetail?.price ||
                    orderDetail?.combo?.price
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">
            Thành tiền:{" "}
            <span className="text-red-700">
              {formatPrice(order.totalAmount)}
            </span>
          </p>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center mx-2 text-red-900 font-semibold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            {showDetails ? <FaAngleUp /> : <FaAngleDown />}
            Xem chi tiết
          </button>
        </div>
        {!loading && showDetails && (
          <OrderDetail reservationData={reservationData} />
        )}
      </div>
    </div>
  );
};

export default OrderHistoryItem;

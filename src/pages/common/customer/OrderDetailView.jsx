import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { useParams } from "react-router-dom";
import useCallApi from "../../../api/useCallApi";
import { OrderApi } from "../../../api/endpoint";
import { formatDate, formatPrice } from "../../../util/Utility";

const OrderDetailView = () => {
  const [orderData, setOrderData] = useState({});
  const { id } = useParams();
  const { callApi, error, loading } = useCallApi();
  const fetchData = async () => {
    const data = await callApi(`${OrderApi.GET_DETAIL}/${id}`, "GET");

    if (data?.isSuccess) {
      setOrderData(data.result);
    }
  };
  useEffect(() => {
    fetchData();
  }, [id]);
  const { order, orderDetails } = orderData;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <Card className="w-full max-w-[64rem] mx-auto shadow-xl">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="flex items-center justify-between p-4">
            <div>
              <Typography variant="h3">Chi tiết đơn hàng</Typography>
              <Typography color="white" className="mt-1 font-normal opacity-80">
                Mã đơn hàng: {order?.orderId.substring(0, 8)}
              </Typography>
            </div>
            <Chip
              value={order?.status === 1 ? "Đang hoạt động" : "Không hoạt động"}
              color={order?.status === 1 ? "green" : "red"}
              className="font-bold"
            />
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-gray-50 p-4 rounded-lg">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Thông tin khách hàng
              </Typography>
              <Typography className="font-semibold">
                {order?.customerInfo?.name}
              </Typography>
              <Typography color="gray">
                SĐT: {order?.customerInfo?.phoneNumber}
              </Typography>
              <Typography color="gray">
                Địa chỉ: {order?.customerInfo?.address}
              </Typography>
            </div>
            <div className="bg-blue-gray-50 p-4 rounded-lg">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Thông tin đơn hàng
              </Typography>
              <Typography>Ngày đặt: {formatDate(order?.orderDate)}</Typography>
              <Typography>
                Tổng tiền:{" "}
                <span className="font-semibold">
                  {formatPrice(order?.totalAmount)}
                </span>
              </Typography>
              <Typography>
                Thanh toán: {order?.paymentMethod?.vietnameseName}
              </Typography>
              <Typography>
                Giao hàng: {order?.isDelivering ? "Có" : "Không"}
              </Typography>
            </div>
          </div>

          <Typography variant="h5" color="blue-gray" className="mb-4">
            Các món đã đặt
          </Typography>
          {orderDetails?.length > 0 &&
            orderDetails?.map((item, index) => (
              <Card key={index} className="mb-4 overflow-hidden">
                <CardBody className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={
                        item.orderDetail?.dishSizeDetail
                          ? item.orderDetail?.dishSizeDetail?.dish?.image
                          : item.orderDetail?.combo?.image
                      }
                      alt="dish"
                      className="h-48 w-full md:w-48 object-cover"
                    />
                    <div className="p-4 flex-grow">
                      <Typography variant="h6" color="blue-gray">
                        {item.orderDetail?.dishSizeDetail
                          ? item.orderDetail?.dishSizeDetail?.dish?.name
                          : item.orderDetail?.combo?.name}
                      </Typography>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-normal mb-2"
                      >
                        {item.orderDetail?.dishSizeDetail
                          ? item.orderDetail?.dishSizeDetail?.dish?.description
                          : item.orderDetail?.combo?.description}
                      </Typography>
                      <div className="flex justify-between items-center">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          Số lượng: {item.orderDetai?.quantity}
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          Giá: {formatPrice(item.orderDetail?.price)}
                        </Typography>
                      </div>
                      {item.orderDetail?.note && (
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal mt-2"
                        >
                          Ghi chú: {item.orderDetail?.note}
                        </Typography>
                      )}
                    </div>
                  </div>
                  {item.comboOrderDetails &&
                    item.comboOrderDetails.length > 0 && (
                      <div className=" shadow-md p-4">
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="mb-2"
                        >
                          Món trong combo:
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {item.comboOrderDetails?.length > 0 &&
                            item.comboOrderDetails.map(
                              (comboItem, comboIndex) => (
                                <div
                                  key={comboIndex}
                                  className="flex items-center space-x-2"
                                >
                                  <img
                                    src={
                                      comboItem.dishCombo?.dishSizeDetail?.dish
                                        ?.image
                                    }
                                    alt="combo dish"
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                  <div>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                    >
                                      {
                                        comboItem.dishCombo?.dishSizeDetail
                                          ?.dish?.name
                                      }
                                    </Typography>
                                    <Typography
                                      variant="small"
                                      color="gray"
                                      className="font-normal"
                                    >
                                      x{comboItem.dishCombo?.quantity}
                                    </Typography>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )}
                </CardBody>
              </Card>
            ))}
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderDetailView;

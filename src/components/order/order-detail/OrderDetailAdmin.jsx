import React, { useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { Button, Input, message, Modal, Table } from "antd";
import moment from "moment/moment";
import Momo_logo from "../../../assets/imgs/payment-icon/MoMo_Logo.png";
import VNPAY_logo from "../../../assets/imgs/payment-icon/VNpay_Logo.png";
import Cash_Logo from "../../../assets/imgs/payment-icon/Cash_Logo.png";
import { PaymentMethod } from "../../../util/GlobalType";
import { formatDateTime, formatPrice, showError } from "../../../util/Utility";
import { StyledTable } from "../../custom-ui/StyledTable";
import { WarningOutlined } from "@ant-design/icons";
import useCallApi from "../../../api/useCallApi";
import { ConfigurationApi, OrderApi } from "../../../api/endpoint";
import dayjs from "dayjs";
import { DollarSign } from "lucide-react";
import LoadingOverlay from "../../loading/LoadingOverlay";

const OrderDetailAdmin = ({ reservationData, fetchData }) => {
  const { order, orderDishes, orderTables } = reservationData;
  const { callApi, error, loading } = useCallApi();
  const [amount, setAmount] = useState("");
  const totalAmount = order.totalAmount;

  const handlePayment = async () => {
    if (!amount) {
      message.error("Vui lòng nhập số tiền khách đưa");
      return;
    }
    if (amount < totalAmount) {
      message.error("Số tiền khách đưa không đủ");
      return;
    }
    const response = await callApi(
      `${OrderApi.MAKE_DINE_IN_ORDER_BILL}`,
      "POST",
      {
        orderId: order.orderId,
        paymentMethod: 1,
        couponIds: [],
        loyalPointsToUse: 0,
        cashReceived: amount,
        changeReturned: amount - totalAmount,
      }
    );
    if (response?.isSuccess) {
      message.success("Thanh toán thành công");
    } else {
      showError(error);
    }
  };
  if (loading) {
    return <LoadingOverlay isLoading={loading} />;
  }
  const renderPaymentMethod = () => {
    switch (order?.transaction?.paymentMethodId) {
      case PaymentMethod.MOMO:
        return (
          <div className="flex items-center">
            <img src={Momo_logo} className="h-6 w-6 mr-2" alt="Momo" />
            <span className="text-pink-600 font-semibold">Momo</span>
          </div>
        );
      case PaymentMethod.VNPAY:
        return (
          <div className="flex items-center">
            <img src={VNPAY_logo} className="h-6 w-6 mr-2" alt="VNPAY" />
            <span className="text-blue-600 font-semibold">VNPAY</span>
          </div>
        );
      case PaymentMethod.STORE_CREDIT:
        return (
          <div className="flex items-center">
            <img src={Cash_Logo} className="h-6 w-6 mr-2" alt="VNPAY" />
            <span className="text-yellow-800 font-semibold">
              Tài khoản Thiên Phú
            </span>
          </div>
        );
      default:
        return <span className="text-gray-600">Không xác định</span>;
    }
  };
  console.log(reservationData);
  const renderOrderTime = () => {
    switch (order?.orderTypeId) {
      case 1:
        return formatDateTime(order.reservationDate);
      case 2:
        return formatDateTime(order.orderDate);
      case 3:
        return formatDateTime(order.mealTime);
    }
  };
  const columns = [
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <img
            src={record.image}
            alt=""
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <div>
            <p className="font-semibold">{text}</p>
            {record.comboDishes && (
              <ul className="text-sm text-gray-600 mt-1">
                {record.comboDishes.map((dish) => (
                  <li key={dish.dishComboId}>
                    + {dish.name} ({dish.size})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => <span className="font-medium">{quantity}</span>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-medium">{formatPrice(price)} </span>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => (
        <span className="text-gray-600">{note || "Không có ghi chú"}</span>
      ),
    },
    {
      title: "Thời gian đặt",
      dataIndex: "orderTime",
      key: "orderTime",
      render: (orderTime) => (
        <span className="text-gray-600">
          {moment(orderTime).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
  ];

  const dataSource = orderDishes?.flatMap((order) => {
    if (order.comboDish) {
      return {
        key: order.orderDetailsId,
        name: order.comboDish.combo.name,
        quantity: order.quantity,
        price: order.comboDish.combo.price,
        note: order.note,
        image: order.comboDish.combo.image,
        orderTime: order.orderTime,
        comboDishes: order.comboDish.dishCombos.map((comboDish) => ({
          dishComboId: comboDish.dishComboId,
          name: comboDish.dishSizeDetail.dish.name,
          size: comboDish.dishSizeDetail.dishSize.vietnameseName,
          image: comboDish.dishSizeDetail.dish.image,
        })),
      };
    } else {
      return {
        key: order.orderDetailsId,
        name: `${order.dishSizeDetail.dish.name} (${order.dishSizeDetail.dishSize.vietnameseName})`,
        quantity: order.quantity,
        price: order.dishSizeDetail.price,
        note: order.note,
        orderTime: order.orderTime,
        image: order.dishSizeDetail.dish.image,
      };
    }
  });
  const renderIsPayment = () => {
    switch (order?.orderTypeId) {
      case 1:
        if (order?.statusId == 3 || order?.statusId == 5) {
          return true;
        } else {
          return false;
        }
      case 2:
        if (order?.statusId == 4) {
          return true;
        } else {
          return false;
        }
      case 3:
        if (order?.statusId == 3 || order?.statusId == 5) {
          return true;
        } else {
          return false;
        }
    }
  };
  const handleCancelOrder = async (orderId) => {
    debugger;
    const response = await callApi(
      `${ConfigurationApi.GET_CONFIG_BY_NAME}/TIME_TO_RESERVATION_WITH_DISHES_LAST`,
      "GET"
    );
    let time = response?.result?.currentValue;

    const currentTime = dayjs();

    switch (order?.orderTypeId) {
      case 1:
        const reservationDate = dayjs(order?.reservationDate.split(".")[0]);
        const targetTime = reservationDate.add(time, "hour");

        if (currentTime.isAfter(targetTime)) {
          Modal.error({
            title: "Hủy đơn hàng",
            content: (
              <div>
                <p>
                  Đơn hàng đã được tạo trong thời gian quy định không thể hủy
                </p>
              </div>
            ),
          });
          return;
        }
        break;
      case 2:
        const orderDate = dayjs(order?.orderDate.split(".")[0]);
        const targetTimeOrder = orderDate.add(time, "hour");

        if (currentTime.isAfter(targetTimeOrder)) {
          Modal.error({
            title: "Hủy đơn hàng",
            content: (
              <div>
                <p>
                  Đơn hàng đã được tạo trong thời gian quy định không thể hủy
                </p>
              </div>
            ),
          });
          return;
        }
        break;
      case 3:
        const mealTime = dayjs(order?.mealTime.split(".")[0]);
        const targetMealTime = mealTime.add(time, "hour");

        if (currentTime.isAfter(targetMealTime)) {
          Modal.error({
            title: "Hủy đơn hàng",
            content: (
              <div>
                <p>
                  Đơn hàng đã được tạo trong thời gian quy định không thể hủy
                </p>
              </div>
            ),
          });
          return;
        }
    }

    Modal.confirm({
      title: "Hủy đơn hàng",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
          <p> </p>
          <p className="text-red-600 font-semibold">
            Lưu ý: Hủy đơn hàng sẽ không thể khôi phục lại
          </p>
        </div>
      ),
      async onOk() {
        const response = await callApi(
          `${OrderApi.UPDATE_ORDER_STATUS}/${order.orderId}?isSuccessful=false`,
          "PUT"
        );
        if (response?.isSuccess) {
          await fetchData(order.orderId);
          Modal.success({
            title: "Hủy đơn hàng",
            content: (
              <div>
                <p>Hủy đơn hàng thành công</p>
              </div>
            ),
          });
        }
      },
      onCancel() {},
    });
  };
  return (
    <Card className="w-full shadow-none border-none">
      <CardBody className="p-6">
        <Typography
          variant="h4"
          color="blue-gray"
          className="mb-6 text-center font-bold"
        >
          Thông Tin Đơn Hàng
        </Typography>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <Typography
                variant="h5"
                color="blue-gray"
                className="mb-4 font-semibold"
              >
                Thông Tin Đặt Bàn
              </Typography>
              <InfoItem
                label="Mã đơn đặt hàng"
                value={order?.orderId.substring(0, 8)}
              />
              <InfoItem label="Thời gian tạo" value={renderOrderTime()} />
              {order?.account && (
                <>
                  <InfoItem
                    label="Họ và tên"
                    value={`${order?.account?.lastName} ${order?.account?.firstName}`}
                  />
                  <InfoItem
                    label="Điện thoại"
                    value={`0${order?.account?.phoneNumber}`}
                  />
                  {order?.orderTypeId != 2 && (
                    <InfoItem
                      label="Số lượng khách"
                      value={
                        orderTables && orderTables.length > 0
                          ? orderTables
                              .map(
                                (item, index) => `Bàn ${item.table?.tableName}`
                              )
                              .join(", ")
                          : "Chưa có thông tin"
                      }
                    />
                  )}
                </>
              )}
              <InfoItem
                label="Ghi chú"
                value={order?.note || "Không có ghi chú"}
              />
              {order?.orderTypeId != 2 && (
                <InfoItem
                  label="Loại bàn"
                  value={
                    orderTables && orderTables.length > 0
                      ? orderTables
                          .map(
                            (item, index) =>
                              `Bàn ${item.table?.tableSizeId} người - ${item.table?.room?.name}`
                          )
                          .join(", ")
                      : "Chưa có thông tin"
                  }
                />
              )}

              <InfoItem
                label="Ghi chú"
                value={order?.note || "Không có ghi chú"}
              />
              <InfoItem
                label="Tổng giá trị đơn hàng"
                value={formatPrice(order?.totalAmount)}
              />
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <Typography
                variant="h5"
                color="blue-gray"
                className="mb-4 font-semibold"
              >
                Thông Tin Giao Dịch
              </Typography>
              <InfoItem
                label={
                  order?.orderTypeId === 1
                    ? "Số tiền cọc"
                    : "Tổng tiền thanh toán"
                }
                value={
                  order?.orderTypeId === 1
                    ? `${formatPrice(order?.deposit)} `
                    : `${formatPrice(order?.totalAmount)}`
                }
              />
              {order?.orderTypeId === 1 && (
                <>
                  <InfoItem
                    label="Phương thức thanh toán"
                    value={renderPaymentMethod()}
                    isComponent
                  />
                  {order.transaction?.transactionTypeId == 4 ? (
                    <InfoItem
                      label={"Đã hoàn lại tiền vào lúc"}
                      value={moment(order?.transaction?.paidDate).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    />
                  ) : (
                    <InfoItem
                      label={
                        order?.orderTypeId === 1
                          ? "Đã đặt cọc lúc"
                          : "Đã thanh toán lúc"
                      }
                      value={
                        order.orderTypeId === 1 &&
                        moment(order?.depositDate).format("DD/MM/YYYY HH:mm")
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            <Typography
              variant="h5"
              color="blue-gray"
              className="mb-4 font-semibold"
            >
              Chi Tiết Đơn Hàng
            </Typography>
            <StyledTable
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              className="border border-gray-200 rounded-lg overflow-hidden"
            />
            {renderIsPayment() && (
              <Card className="max-w-md mx-auto">
                <div className="flex flex-col space-y-4">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    placeholder="Tiền khách đưa"
                    label="Tiền khách đưa"
                    prefix={<DollarSign className="mr-2" size={16} />}
                  />

                  {amount - totalAmount !== 0 && (
                    <Typography
                      type={amount - totalAmount >= 0 ? "success" : "danger"}
                    >
                      {amount - totalAmount >= 0
                        ? `Tiền thối lại: ${formatPrice(amount - totalAmount)}`
                        : "Tiền khách trả không đủ"}
                    </Typography>
                  )}
                  <Button
                    type="primary"
                    className="bg-red-900 hover:bg-red-800"
                    onClick={handlePayment}
                  >
                    Thanh toán bằng tiền mặt
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const InfoItem = ({ label, value, isComponent = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
    <span className="text-gray-600 font-medium">{label}:</span>
    {isComponent ? value : <span className="font-semibold">{value}</span>}
  </div>
);

export default OrderDetailAdmin;

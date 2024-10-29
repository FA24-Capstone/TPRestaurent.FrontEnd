import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { Button, Modal, Table } from "antd";
import moment from "moment/moment";
import Momo_logo from "../../../assets/imgs/payment-icon/MoMo_Logo.png";
import VNPAY_logo from "../../../assets/imgs/payment-icon/VNpay_Logo.png";
import { PaymentMethod } from "../../../util/GlobalType";
import { formatDateTime, formatPrice } from "../../../util/Utility";
import { StyledTable } from "../../custom-ui/StyledTable";
import { WarningOutlined } from "@ant-design/icons";
import useCallApi from "../../../api/useCallApi";
import { ConfigurationApi, OrderApi } from "../../../api/endpoint";
import dayjs from "dayjs";
import OrderTag from "../../tag/OrderTag";

const OrderDetail = ({ reservationData, fetchData }) => {
  const { order, orderDishes, orderTables } = reservationData;
  const { callApi, error, loading } = useCallApi();
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
        if (order?.statusId == 1) {
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
        if (order?.statusId == 3) {
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
            <InfoItem
              label="Trạng thái đơn"
              value={<OrderTag orderStatusId={order?.statusId} />}
            />
            {order.shipper && (
              <InfoItem
                label="Shipper đảm nhận giao"
                value={`${order.shipper.lastName} ${order.shipper.firstName} - 0${order.shipper.phoneNumber}`}
              />
            )}
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
                    order.orderTypeId === 1
                      ? moment(order?.depositDate).format("DD/MM/YYYY HH:mm")
                      : moment(order?.transaction?.paidDate).format(
                          "DD/MM/YYYY HH:mm"
                        )
                  }
                />
              )}
            </>
          </div>
        </div>
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
          <div className="flex justify-center my-4">
            <Button className="bg-red-900 text-white mx-auto">
              Thanh toán ngay
            </Button>
          </div>
        )}
        {order?.statusId == 2 && (
          <div
            className="p-4 flex items-center gap-1 cursor-pointer"
            onClick={() => handleCancelOrder(order?.orderId)}
          >
            <WarningOutlined className="text-yellow-800 text-2xl " />
            <Typography variant="h6" className="font-semibold text-yellow-800">
              Tôi muốn hủy đơn hàng
            </Typography>
          </div>
        )}
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

export default OrderDetail;

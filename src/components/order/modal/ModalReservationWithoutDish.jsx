import { Button, message, Modal } from "antd";
import PaymentMethodSelector from "../../cart/PaymentMethodSelector";
import { useEffect, useState } from "react";
import ReservationInformation from "../ReservationInformation";
import { OrderApi } from "../../../api/endpoint";
import { formatPrice, mergeCartData, showError } from "../../../util/Utility";
import useCallApi from "../../../api/useCallApi";
import { Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const ModalReservationWithoutDish = ({ show, handleClose, information }) => {
  console.log(information);
  const [selectedMethod, setSelectedMethod] = useState(2);
  const [deposit, setDeposit] = useState(0);
  const { callApi, error, loading } = useCallApi();
  const navigate = useNavigate();
  const handleDeposit = async () => {
    debugger;
    const data = await callApi(
      `${OrderApi.CALCULATE_RESERVATION}`,
      "POST",
      mergeCartData([], [], {
        reservationDate: information.startTime,
        endTime: information.endTime,
        customerInfoId: information.customerId,
        numberOfPeople: information.numberOfPeople,
        deposit: 0,
      })
    );
    if (data.isSuccess) {
      setDeposit(data?.result);
    } else {
      showError(data.messages);
    }
  };
  const handleChangeMethod = (data) => {
    setSelectedMethod(data);
  };
  useEffect(() => {
    handleDeposit();
  }, [show]);

  const handleCheckOut = async () => {
    const updatedData = {
      customerId: information.customerId,
      orderType: 1,
      note: information.note || "Không có",
      reservationOrder: {
        numberOfPeople: information.numberOfPeople,
        mealTime: information.startTime,
        endTime: information.endTime,
        isPrivate: information.isPrivate,
        deposit: deposit,
        paymentMethod: selectedMethod,
      },
    };
    const response = await callApi(
      `${OrderApi.CREATE_ORDER}`,
      "POST",
      updatedData
    );
    if (response.isSuccess) {
      message.success(`Đặt thành công`);

      if (selectedMethod === 3 || selectedMethod === 2) {
        if (response.result.paymentLink) {
          window.location.href = response.result.paymentLink;
        }
      } else {
        navigate(`/order-history?phoneNumber=${information.phoneNumber}`);
      }
    } else {
      showError(error);
    }
  };
  return (
    <Modal
      title=""
      open={show}
      onCancel={handleClose}
      footer={null}
      width={700}
    >
      <ReservationInformation reservation={information} />
      <Typography className="text-lg text-red-800 font-bold mt-4 text-center">
        Số tiền bạn cần phải cọc là: {formatPrice(deposit)}
      </Typography>
      <PaymentMethodSelector handleChange={handleChangeMethod} />
      <div className="flex justify-center">
        <Button
          className="bg-red-800 text-white"
          loading={loading}
          onClick={handleCheckOut}
        >
          Tiến hành đặt cọc ngay
        </Button>
      </div>
    </Modal>
  );
};
export default ModalReservationWithoutDish;

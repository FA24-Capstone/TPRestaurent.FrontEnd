import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { HomePage } from "../home-page/HomePage";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { formatPrice } from "../../../util/Utility";
import useCallApi from "../../../api/useCallApi";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { TransactionApi } from "../../../api/endpoint";

const VerifyPayment = () => {
  const location = useLocation();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVNPAY, setIsVNPAY] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const { callApi, error, loading } = useCallApi();
  const handleUrl = async () => {
    const searchParams = new URLSearchParams(location.search);
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const partnerCode = searchParams.get("partnerCode");
    const resultCode = searchParams.get("resultCode");
    const orderInfo = searchParams.get("vnp_OrderInfo");
    const id = searchParams.get("vnp_TxnRef");
    const getOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent)) {
        return "Android";
      }
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
      }
      return "unknown";
    };

    setTotalAmount(
      searchParams.get("vnp_Amount") || searchParams.get("amount") * 100
    );

    if (vnpResponseCode) {
      setIsVNPAY(true);
      const vnpOrderInfo = decodeURIComponent(
        searchParams.get("vnp_OrderInfo")
      );
      if (vnpResponseCode === "00") {
        const data = await callApi(
          `${TransactionApi.UPDATE_STATUS}/${id}/2`,
          "PUT"
        );
        if (data.isSuccess) {
          setIsSuccess(true);
        }
      } else {
        const data = await callApi(
          `${TransactionApi.UPDATE_STATUS}/${id}/1`,
          "PUT"
        );
        if (data.isSuccess) {
          setIsSuccess(true);
        }
        setModalMessage(`Thanh toán VNPay thất bại . Vui lòng thanh toán lại`);
        setIsSuccess(false);
      }
    } else if (partnerCode === "MOMO") {
      debugger;
      const orderInfo = decodeURIComponent(searchParams.get("orderId"));
      if (resultCode === "0") {
        const data = await callApi(
          `${TransactionApi.UPDATE_STATUS}/${orderInfo}/2`,
          "PUT"
        );
        if (data.isSuccess) {
          setModalMessage(
            `Thanh toán Momo thành công cho đơn hàng: ${orderInfo}.`
          );
          setIsSuccess(true);
        }
      } else {
        const data = await callApi(
          `${TransactionApi.UPDATE_STATUS}/${orderInfo}/1`,
          "PUT"
        );
        if (data.isSuccess) {
          setIsSuccess(false);
          setModalMessage(
            `Thanh toán Momo thất bại cho đơn hàng: ${orderInfo}. Vui lòng thanh toán lại`
          );
        }
      }
    }
    if (getOS() === "Android") {
      window.location.href = `thienphurestaurant://transaction?isSuccess=${isSuccess}`;
    }
    setModalIsOpen(true);
  };
  useEffect(() => {
    handleUrl();
  }, [location]);

  const closeModal = () => {
    setModalIsOpen(false);
  };
  if (loading) {
    <LoadingOverlay isLoading={loading} />;
  }
  return (
    <>
      <HomePage />
      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-[500px] shadow-xl">
            <CardBody className="flex flex-col items-center px-6">
              <div className="flex flex-col items-center">
                {isSuccess ? (
                  <CheckCircleIcon className="w-36 h-36 text-green-500 mb-4" />
                ) : (
                  <XCircleIcon className="w-20 h-20 text-red-500 mb-4" />
                )}
              </div>
              <Typography
                variant="h5"
                color={isSuccess ? "green" : "red"}
                className="mb-2 font-bold text-center"
              >
                Thanh toán {isSuccess ? "thành công" : "thất bại"}
              </Typography>
              <div className="flex flex-col p-6 w-full">
                <div className="flex justify-between w-full">
                  <span className="font-bold"> Phương thức thanh toán:</span>
                  <span>{isVNPAY ? "VNPAY" : "MOMO"}</span>
                </div>
                <div className="flex justify-between w-full">
                  <span className="font-bold"> Tổng tiền:</span>
                  <span>{formatPrice(totalAmount / 100)}</span>
                </div>
                <hr className="border-t-2 border-dashed border-gray-300 my-4" />
                <p className="text-center text-gray-600 ">
                  Cảm ơn bạn đã luôn tin tưởng Thiên Phú
                </p>
              </div>
            </CardBody>
            <CardFooter className="pt-0">
              <Button
                onClick={closeModal}
                fullWidth
                className="shadow-md hover:shadow-lg transition-all duration-300 bg-red-800 text-white"
              >
                Đóng
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default VerifyPayment;

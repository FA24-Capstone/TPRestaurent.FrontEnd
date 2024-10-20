import { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { author, login } from "../../redux/features/authSlice";
import useCallApi from "../../api/useCallApi";
import { AccountApi } from "../../api/endpoint";
import { showError } from "../../util/Utility";
import OTP from "antd/es/input/OTP";

const OtpConfirmModal = ({
  visible,
  onClose,
  resOtp,
  phoneNumber,
  otpType,
  handleSuccess,
}) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { loading, error, callApi } = useCallApi();
  // const handleChange = (value, index) => {
  //   const newOtp = [...otp];
  //   newOtp[index] = value;
  //   // Move focus to the next inputß if value is entered and it's not the last input
  //   if (value && index < 5) {
  //     document.getElementById(`otp-${index + 1}`).focus();
  //   }

  //   // Handle clearing the OTP if the last input is deleted
  //   if (value === "" && index === 5) {
  //     // Clear all OTP inputs
  //     setOtp(["", "", "", "", "", ""]);
  //     // Move focus to the first input
  //     document.getElementById(`otp-0`).focus();
  //   } else {
  //     // Update the OTP state
  //     setOtp(newOtp);
  //   }
  // };
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    switch (otpType) {
      case 0:
        const resposne = await callApi(`/api/account/login`, "POST", {
          phoneNumber: phoneNumber,
          otpCode: otp,
        });
        if (resposne?.isSuccess) {
          localStorage.setItem("token", resposne?.result?.token);
          localStorage.setItem("refreshToken", resposne?.result?.refreshToken);
          dispatch(login(resposne?.result?.account));
          dispatch(author(resposne?.result?.mainRole));
          message.success("Đăng nhập thành công");
          navigate("/");
          onClose();
        } else {
          message.error("Đăng nhập thất bại");
        }
        break;
      case 1:
        const data = await callApi(
          `${
            AccountApi.VERIFY_ACCOUNT_OTP
          }?phoneNumber=${phoneNumber}&code=${otp}&otpType=${1}`,
          "POST"
        );
        if (data?.isSuccess) {
          handleSuccess(true);
          onClose();
        } else {
          showError(error);
        }
        break;
      case 9:
        // Send OTP to your backend for verification

        break;
      default:
        message.error("Đã xảy ra loi, vui lòng thử lại sau");
        break;
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-[rgb(192,29,46)]">
          Nhập mã xác thực OTP
        </h2>
        <p className="text-center mb-8 text-gray-600">
          Vui lòng điền mã OTP được gửi đến số điện thoại của bạn.
        </p>
        <div className="flex justify-center space-x-2 mb-8">
          <OTP value={otp} onChange={setOtp} />
        </div>
        <Button
          onClick={handleSubmit}
          className="w-full h-12 bg-[rgb(192,29,46)] hover:bg-[rgb(172,26,41)] focus:bg-[rgb(172,26,41)] border-none text-white text-lg font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          loading={loading}
        >
          Xác nhận
        </Button>

        <p className="text-center mt-4 text-gray-600">
          Không nhận được mã OTP?
          <p>Vui lòng nhập mã OTP được gửi đến số điện thoại của bạn.</p>
          <a href="#" className="text-[rgb(192,29,46)] hover:underline">
            Gửi lại OTP
          </a>
        </p>
      </div>
    </Modal>
  );
};

export default OtpConfirmModal;

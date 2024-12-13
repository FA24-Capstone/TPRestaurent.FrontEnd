import { Button, Input, Form } from "antd"; // Import Form from antd
import { useState, useEffect } from "react";
import OtpConfirmModal from "./OtpConfirmModal";
import loginImage from "../../assets/imgs/login.png";
import useCallApi from "../../api/useCallApi";
import { useLocation } from "react-router-dom";
import { showError } from "../../util/Utility";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resOtp, setResOtp] = useState(null);
  const { callApi, error, loading } = useCallApi();
  const location = useLocation();

  const handleLogin = async (values) => {
    const { phone } = values; // Get phone number from the form values
    const data = await callApi(
      `/api/account/send-otp?phoneNumber=${phone}&otp=${0}`,
      "POST"
    );
    if (data?.isSuccess) {
      setResOtp(data?.result);
      setIsOtpModalVisible(true);
      setCountdown(60);
    } else {
      showError(data?.messages);
    }
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("phoneNumber");
    if (query) {
      setPhone(query);
      handleLogin({ phone: query });
    }
  }, [location.search]);
  useEffect(() => {
    let timer;
    if (isOtpModalVisible && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsOtpModalVisible(false);
    }
    return () => clearInterval(timer);
  }, [isOtpModalVisible, countdown]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row max-w-6xl bg-white rounded-lg shadow-lg w-full">
        <div className="w-full md:w-1/2 p-6">
          <img
            src={loginImage}
            alt="Login"
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-center text-red-700 mb-4">
            Đăng nhập
          </h1>
          <Form
            className="flex flex-col gap-4"
            onFinish={handleLogin} // Use onFinish for form submission
          >
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^[1-9]\d{8,9}$/,
                  message: "Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.",
                },
              ]}
            >
              <Input
                id="phone"
                placeholder="Nhập số điện thoại"
                prefix="+84"
                className="border border-gray-300 rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                className="bg-red-700 hover:bg-red-800 w-full"
                htmlType="submit"
                loading={loading}
              >
                Đăng nhập ngay
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <OtpConfirmModal
        visible={isOtpModalVisible}
        countdown={countdown}
        onClose={() => setIsOtpModalVisible(false)}
        resOtp={resOtp}
        phoneNumber={phone}
        otpType={0}
        resend={() => handleLogin({ phone })}
      />
    </div>
  );
};

export default LoginPage;

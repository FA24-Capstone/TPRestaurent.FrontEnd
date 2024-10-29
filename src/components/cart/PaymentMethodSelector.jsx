import { useState } from "react";
import { Card, CardBody, Typography, Radio } from "@material-tailwind/react";
import Card_Logo from "../../assets/imgs/payment-icon/Cash_Logo.png";
import MoMo_Logo from "../../assets/imgs/payment-icon/MoMo_Logo.png";
import VNpay_Logo from "../../assets/imgs/payment-icon/VNpay_Logo.png";
import { PaymentMethod } from "../../util/GlobalType";
import { useSelector } from "react-redux";
import { formatPrice } from "../../util/Utility";

const PaymentMethodSelector = ({ handleChange }) => {
  const [selectedMethod, setSelectedMethod] = useState(PaymentMethod.VNPAY);
  const user = useSelector((state) => state.user.user || {});
  const handleMethodChange = (value) => {
    setSelectedMethod(parseInt(value));
    handleChange(parseInt(value));
  };
  const mapLanguage = (key) => {
    switch (key) {
      case "VNPAY":
        return { name: "VNPay", description: "Tài khoản ví VNPAY" };
      case "MOMO":
        return { name: "MOMO", description: "Tài khoản ví MOMO" };
      case "STORE_CREDIT":
        return {
          name: "Số dư Thiên Phú",
          description: `Số dư Thiên Phú ${formatPrice(user.amount)}`,
        };

      default:
        return "Chưa chọn phương thức";
    }
  };
  return (
    <Card className="mt-6 shadow-none border-none">
      <CardBody className="flex flex-col gap-4 ">
        <Typography
          variant="h5"
          color="black"
          className="text-center text-red-800 uppercase"
        >
          Chọn phương thức thanh toán
        </Typography>
        {Object.entries(PaymentMethod).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center bg-[#F3F3F3] py-2 px-4 rounded-md"
          >
            <div>{getMethodIcon(key)}</div>
            <div className="flex-1 flex justify-between px-4">
              <div>
                <Typography className="ml-2 font-bold uppercase">
                  {mapLanguage(key).name}
                </Typography>
                <Typography className="ml-2 text-sm">
                  {mapLanguage(key).description}
                </Typography>
              </div>
              <div className="ml-10">
                <Radio
                  name="payment-method"
                  color="red"
                  checked={selectedMethod === value}
                  onChange={() => handleMethodChange(value)}
                />
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};

const getMethodIcon = (method) => {
  switch (method) {
    case "STORE_CREDIT":
      return <img src={Card_Logo} alt="" className="w-12 h-12" />;
    case "VNPAY":
      return <img src={VNpay_Logo} alt="" className="w-12 h-12" />;
    case "MOMO":
      return <img src={MoMo_Logo} alt="" className="w-12 h-12" />;

    default:
      return null;
  }
};

export default PaymentMethodSelector;

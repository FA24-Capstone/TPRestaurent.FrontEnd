import React, { useState } from "react";
import { Space, Row, Col, Input, Modal, Button } from "antd";
import { useSelector } from "react-redux";
import { Mail, Phone, DollarSign, CreditCard } from "lucide-react";
import PaymentMethodSelector from "../cart/PaymentMethodSelector";
import { Typography } from "@material-tailwind/react";
import { formatPrice, numberToWords, showError } from "../../util/Utility";
import useCallApi from "../../api/useCallApi";
import { TransactionApi } from "../../api/endpoint";

const CreateStoreCreditModal = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.user.user || {});
  const [selectedMethod, setSelectedMethod] = useState(2);
  const [inputValue, setInputValue] = useState(0);
  const [numberToWord, setNumberToWord] = useState("");
  const { callApi, error, loading } = useCallApi();
  const handleChangeMethod = (data) => {
    setSelectedMethod(data);
  };
  const handleSubmit = async () => {
    const response = await callApi(`${TransactionApi.CREATE_PAYMENT}`, "POST", {
      accountId: user.id,
      storeCreditAmount: inputValue,
      paymentMethod: selectedMethod,
    });
    if (response.isSuccess) {
      if (response.result) {
        window.location.href = response.result;
      } else {
        showError(["Có lỗi xảy ra"]);
      }
    } else {
      showError(error);
    }
  };
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} centered>
      <div className="flex flex-col px-10">
        <Typography className="text-center text-red-800 font-bold uppercase text-xl my-2">
          Nạp tiền vào tài khoản
        </Typography>
        <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-lg mb-1">Thông tin của bạn</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail style={{ marginRight: 8 }} className="text-sm" />

              <Typography className="text-sm">Email:</Typography>
            </div>
            <div>
              <Typography className="text-sm">{user.email}</Typography>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Phone style={{ marginRight: 8 }} />

              <Typography className="text-sm">Số điện thoại:</Typography>
            </div>
            <div>
              <Typography className="text-sm">0{user.phoneNumber}</Typography>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign style={{ marginRight: 8 }} />

              <Typography className="text-sm"> Số dư hiện tại:</Typography>
            </div>
            <div>
              <Typography className="text-sm font-bold">
                {formatPrice(user.storeCredit) || formatPrice(0)}
              </Typography>
            </div>
          </div>
        </div>
        <PaymentMethodSelector handleChange={handleChangeMethod} />

        <Input
          placeholder="Nhập số tiền cần nạp"
          type="number"
          onChange={(e) => {
            setInputValue(e.target.value);
            setNumberToWord(numberToWords(e.target.value));
          }}
          prefix={<CreditCard style={{ marginRight: 8 }} />}
        />
        {numberToWord && (
          <Typography className="text-sm w-full break-words font-bold">
            Bằng chữ: {numberToWord}
          </Typography>
        )}
        <Button
          className="text-white bg-red-900 my-2"
          onClick={handleSubmit}
          loading={loading}
        >
          Nạp tiền
        </Button>
      </div>
    </Modal>
  );
};

export default CreateStoreCreditModal;

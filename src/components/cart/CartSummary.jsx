import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  message,
  Modal,
  Switch,
  Typography,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  FileTextOutlined,
  TagOutlined,
  StarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import CartCombosTable from "./CartCombosTable";
import { CartSingleTable } from "./CartSingleTable";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCartReservation,
  decreaseComboQuantity,
  increaseComboQuantity,
  removeCombo,
} from "../../redux/features/cartSlice";
import { formatPrice, mergeCartData, showError } from "../../util/Utility";

import Card_Logo from "../../assets/imgs/payment-icon/Cash_Logo.png";
import MoMo_Logo from "../../assets/imgs/payment-icon/MoMo_Logo.png";
import VNpay_Logo from "../../assets/imgs/payment-icon/VNpay_Logo.png";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { clearCart, getTotal } from "../../redux/features/cartReservationSlice";
import useCallApi from "../../api/useCallApi";
const { Title, Text } = Typography;
import { OrderApi } from "../../api/endpoint";
import LoadingOverlay from "../loading/LoadingOverlay";
import AddressModal from "../user/AddressModal";
import PolicyOrder from "../policy/PolicyOrder";
import { IconButton } from "@material-tailwind/react";
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center mb-2">
    {icon}
    <Text strong className="mr-2 ml-2">
      {label}:
    </Text>
    <Text>{value}</Text>
  </div>
);

const ActionItem = ({ icon, label, children }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center">
      {React.cloneElement(icon, { className: "text-red-900" })}
      <Text strong className="ml-2">
        {label}
      </Text>
    </div>
    {children}
  </div>
);

const CartSummary = ({ handleClose }) => {
  const cartReservation = useSelector((state) => state.cartReservation);
  const user = useSelector((state) => state.user.user || {});
  const cartTotal = useSelector(getTotal);

  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [selectedMethod, setSelectedMethod] = useState(2);
  const [open, setOpen] = useState(false);
  const { callApi, error, loading } = useCallApi();
  const [isLoyaltyEnabled, setIsLoyaltyEnabled] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState("");
  const handleSwitchChange = (event) => {
    setIsLoyaltyEnabled(event);
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleChangeMethod = (data) => {
    setSelectedMethod(data);
  };
  const selectedPaymentMethodIcon = () => {
    switch (selectedMethod) {
      case 1:
        return <img src={Card_Logo} alt="" className="w-10 h-10" />;
      case 2:
        return <img src={VNpay_Logo} alt="" className="w-10 h-10" />;
      case 3:
        return <img src={MoMo_Logo} alt="" className="w-10 h-10" />;

      default:
        return null;
    }
  };
  const handleDecreaseComboQuantity = (comboId, selectedDishes) => {
    dispatch(decreaseComboQuantity({ comboId, selectedDishes }));
  };
  const handleIncreaseComboQuantity = (comboId, selectedDishes) => {
    dispatch(increaseComboQuantity({ comboId, selectedDishes }));
  };
  const handleRemoveCombo = (comboId, selectedDishes) => {
    dispatch(removeCombo({ comboId, selectedDishes }));
  };
  const currentAddress = user.addresses?.filter(
    (address) => address.isCurrentUsed
  )[0];
  const customerInfoAddressName = currentAddress?.customerInfoAddressName || "";
  const handleCheckOut = async () => {
    const { reservationDishDtos } = mergeCartData(cartReservation, cart);

    const updatedData = {
      customerId: user.id,
      orderType: 2,
      note: "string",
      orderDetailsDtos: reservationDishDtos,

      deliveryOrder: {
        couponIds: [],
        loyalPointToUse: isLoyaltyEnabled ? user.loyaltyPoint : 0,
        paymentMethod: selectedMethod,
        address: customerInfoAddressName,
      },
    };
    const response = await callApi(
      `${OrderApi.CREATE_ORDER}`,
      "POST",
      updatedData
    );
    if (response.isSuccess) {
      message.success(`Đặt thành công`);
      dispatch(clearCart());
      dispatch(clearCartReservation());
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
  const totalPrice = cart.total ? cart.total + (cartTotal || 0) : cartTotal;
  const afterPrice = cart.total
    ? cart.total + (cartTotal || 0) - user.loyalPoint
    : cartTotal - user.loyalPoint;
  if (loading) {
    return <LoadingOverlay isLoading={loading} />;
  }
  return (
    <div className="container my-4 p-6 bg-white">
      <Title level={3} className="uppercase text-center mb-6">
        Xác nhận đơn hàng
      </Title>
      <div>
        <Title level={4} className="text-start mb-4">
          Thông tin giao hàng
        </Title>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          <div className="shadow-md rounded-md border border-collapse p-4 relative">
            <Button
              className="bg-red-800 text-white ml-auto absolute top-2 right-2"
              onClick={() => setIsModalVisible(!isModalVisible)}
            >
              Chỉnh sửa
            </Button>
            <InfoItem
              icon={<UserOutlined />}
              label="Họ tên"
              value={`${user.firstName} ${user.lastName}`}
            />
            <InfoItem
              icon={<PhoneOutlined />}
              label="Số điện thoại"
              value={`0${user.phoneNumber}`}
            />
            <InfoItem
              icon={<HomeOutlined />}
              label="Địa chỉ"
              value={customerInfoAddressName}
            />
            <InfoItem
              icon={<FileTextOutlined />}
              label="Ghi chú"
              value={note}
            />
          </div>

          <div>
            <Title level={4} className="text-start mb-4">
              Ưu đãi và điểm thưởng
            </Title>
            <ActionItem icon={<TagOutlined />} label="Voucher">
              <div className="flex items-center">
                <Text className="mr-2">Giảm 10% hóa đơn</Text>
                <button className="bg-red-800 hover:bg-red-800 text-white px-4 py-1 rounded-md transition duration-300">
                  Chọn
                </button>
              </div>
            </ActionItem>

            {user.loyalPoint > 0 && (
              <ActionItem icon={<StarOutlined />} label="Tích điểm">
                <div className="flex">
                  <Typography className="text-[#333333] mx-2">
                    {user.loyalPoint} điểm
                  </Typography>
                  <Switch
                    checked={isLoyaltyEnabled}
                    onChange={(e) => handleSwitchChange(e)}
                  />
                </div>
              </ActionItem>
            )}

            {user.storeCredit > 0 && (
              <ActionItem icon={<DollarOutlined />} label="Sử dụng số dư">
                <div className="flex">
                  <Typography className="text-[#333333] mx-2">
                    {user.storeCredit} coin
                  </Typography>
                  <Switch />
                </div>
              </ActionItem>
            )}
            <ActionItem icon={<FileTextOutlined />} label="Ghi chú">
              {isEditing ? (
                <div className="flex">
                  <Input
                    className="w-[25vw]"
                    placeholder="Nhập ghi chú"
                    onChange={(e) => setNote(e.target.value)}
                    value={note}
                  />
                  <IconButton
                    className="bg-white text-red-900 shadow-none text-2xl"
                    onClick={() => {
                      setIsEditing(!isEditing);
                    }}
                  >
                    <i className="fas fa-save"></i>
                  </IconButton>
                </div>
              ) : (
                <div>
                  <span>{note}</span>
                  <IconButton
                    className="bg-white text-red-900 shadow-none"
                    onClick={() => {
                      setIsEditing(!isEditing);
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </IconButton>
                </div>
              )}
            </ActionItem>
            <div className="flex justify-between items-center my-4">
              <Typography className="text-[#333333] ">
                Chọn phương thức thanh toán:
              </Typography>{" "}
              <div className="flex items-center">
                <span className="mx-2"> {selectedPaymentMethodIcon()}</span>
                <Button
                  className="bg-red-800 text-white hover:bg-red-600"
                  onClick={handleClickOpen}
                >
                  Chọn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="bg-red-900 text-white" onClick={handleClose}>
          Sửa giỏ hàng
        </Button>
      </div>
      <CartSingleTable
        cartItems={cartReservation}
        formatPrice={formatPrice}
        isDisabled={true}
      />
      <CartCombosTable
        cartCombos={cart}
        formatPrice={formatPrice}
        handleDecreaseComboQuantity={handleDecreaseComboQuantity}
        handleIncreaseComboQuantity={handleIncreaseComboQuantity}
        handleRemoveCombo={handleRemoveCombo}
        isDisabled={true}
      />
      <PolicyOrder />
      <Checkbox
        onChange={() => {
          setIsAgree(!isAgree);
        }}
        className="font-bold text-lg my-2"
      >
        Tôi đồng ý các điều khoản và chính sách mua hàng tại nhà hàng Thiên Phú
      </Checkbox>
      <div>
        <div className="flex justify-between items-center mb-4 bg-gray-100 shadow-md py-6 px-4">
          <span className="text-lg text-black">Tạm tính:</span>
          <Typography
            variant="h2"
            className="font-bold text-red-700 text-center"
          >
            {formatPrice(totalPrice)}
          </Typography>
        </div>

        {isLoyaltyEnabled && (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg">Điểm thành viên:</span>
              <Typography
                variant="h2"
                className="font-bold text-red-700 text-center"
              >
                {`- ${formatPrice(user.loyalPoint)}`}
              </Typography>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg">Tổng cộng:</span>
              <Typography
                variant="h2"
                className="font-bold text-red-700 text-center"
              >
                {`${formatPrice(afterPrice)}`}
              </Typography>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center">
        {isAgree && (
          <>
            <Button className="bg-red-900 text-white" onClick={handleCheckOut}>
              Xác nhận thanh toán
            </Button>
          </>
        )}
      </div>
      <div>
        <Modal open={open} onCancel={handleModalClose} footer={null}>
          <PaymentMethodSelector handleChange={handleChangeMethod} />
          <div className="flex justify-center">
            <Button
              className="bg-red-900 text-white"
              onClick={handleModalClose}
            >
              Xác nhận
            </Button>
          </div>
        </Modal>
      </div>

      <AddressModal
        editingAddress={editingAddress}
        isModalVisible={isModalVisible}
        setEditingAddress={setEditingAddress}
        setIsModalVisible={setIsModalVisible}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        key={"address"}
      />
    </div>
  );
};

export default CartSummary;

import React, { useState } from "react";
import { Modal, List, Checkbox, Button, Typography } from "antd";
import { Ticket, Calendar, DollarSign } from "lucide-react";
import { formatDate, formatDateTime, formatPrice } from "../../util/Utility";

const { Text } = Typography;

const CouponSelectionModal = ({
  visible,
  onClose,
  coupons,
  onSelectCoupons,
  totalPrice,
}) => {
  const [selectedCoupons, setSelectedCoupons] = useState([]);

  const handleSelectCoupon = (couponId) => {
    setSelectedCoupons((prev) =>
      prev.includes(couponId)
        ? prev.filter((id) => id !== couponId)
        : [...prev, couponId]
    );
  };

  const handleConfirm = () => {
    onSelectCoupons(selectedCoupons);
    onClose();
  };
  console.log(totalPrice);
  return (
    <Modal
      title="Select Coupons"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="confirm"
          className="bg-red-900 text-white"
          onClick={handleConfirm}
        >
          Xác nhận
        </Button>,
      ]}
      width={600}
    >
      <List
        dataSource={coupons}
        renderItem={(coupon) => (
          <List.Item>
            <Checkbox
              onChange={() => handleSelectCoupon(coupon.couponProgramId)}
              checked={selectedCoupons.includes(coupon.couponProgramId)}
              disabled={totalPrice < coupon.minimumAmount}
            >
              <div
                className={
                  totalPrice < coupon.minimumAmount
                    ? `bg-gray-50 flex items-center `
                    : `bg-white flex items-center`
                }
              >
                <img
                  src={coupon.img}
                  alt={coupon.code}
                  className="w-16 h-16 mr-4 object-cover rounded"
                />
                <div>
                  <Text strong>{coupon.code}</Text>
                  <div className="flex items-center">
                    <Ticket className="w-4 h-4 mr-1" />
                    <Text>Giảm {coupon.discountPercent}% </Text>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <Text>{formatDate(coupon.expiryDate)}</Text>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <Text>
                      Mua sắm tổi thiểu {formatPrice(coupon.minimumAmount)}
                    </Text>
                  </div>
                </div>
              </div>
            </Checkbox>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default CouponSelectionModal;

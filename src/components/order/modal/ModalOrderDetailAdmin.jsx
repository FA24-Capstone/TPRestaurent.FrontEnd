import { Modal } from "antd";
import OrderDetail from "../order-detail/OrderDetail";
import OrderDetailAdmin from "../order-detail/OrderDetailAdmin";

const ModalOrderDetailAdmin = ({ reservation, visible, onClose }) => {
  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={1400}>
      <div className="h-[650px] overflow-y-scroll">
        <OrderDetailAdmin reservationData={reservation} />
      </div>
    </Modal>
  );
};
export default ModalOrderDetailAdmin;

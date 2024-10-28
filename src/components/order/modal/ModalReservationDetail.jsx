import { Modal } from "antd";
import OrderDetail from "../order-detail/OrderDetail";

const ModalReservationDetail = ({ reservation, visible, onClose }) => {
  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={950}>
      <div className="h-[650px] overflow-auto">
        <OrderDetail reservationData={reservation} />
      </div>
    </Modal>
  );
};
export default ModalReservationDetail;

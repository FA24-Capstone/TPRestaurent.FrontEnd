import OrderHistoryItem from "./OrderHistoryItem";

const OrderHistoryList = ({ orders }) => {
  return (
    <div>
      {orders &&
        orders.length > 0 &&
        orders?.map((order) => (
          <OrderHistoryItem key={order.orderId} order={order} />
        ))}
    </div>
  );
};
export default OrderHistoryList;

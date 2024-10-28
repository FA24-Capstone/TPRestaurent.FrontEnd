import ReservationRequestItem from "./ReservationRequestItem";

const ReservationList = ({ reservations }) => {
  return (
    <div>
      {reservations.map((reservation) => (
        <ReservationRequestItem reservation={reservation} />
      ))}
    </div>
  );
};

export default ReservationList;

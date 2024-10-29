import Draggable from "react-draggable";

const Table = ({ id, position, onStop }) => {
  return (
    <Draggable
      defaultPosition={position}
      onStop={(e, data) => onStop(id, data)}
    >
      <div className="table">
        {/* Tạo phần hiển thị bàn ăn */}
        🪑 Bàn {id}
      </div>
    </Draggable>
  );
};

export default Table;

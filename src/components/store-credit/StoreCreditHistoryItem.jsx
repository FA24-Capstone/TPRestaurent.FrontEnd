import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { formatDateTime, formatPrice } from "../../util/Utility";

const StoreCreditHistoryItem = ({ storeCredit }) => {
  return (
    <div
      className={
        storeCredit?.amount > 0
          ? "bg-green-50 p-2 my-1 rounded-lg"
          : "bg-red-50 p-2 my-1"
      }
    >
      <div className="flex items-center">
        <div
          className={`p-3 rounded-full mr-4 ${
            storeCredit?.amount > 0 ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {storeCredit?.amount > 0 ? (
            <FaArrowDown className="text-green-600 text-xl" />
          ) : (
            <FaArrowUp className="text-red-600 text-xl" />
          )}
        </div>
        <div>
          <p
            className={`font-semibold ${
              storeCredit?.amount > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {storeCredit?.amount > 0 ? "Nhận" : "Trừ"}{" "}
            {formatPrice(storeCredit?.amount)}
          </p>
          <p className="text-gray-500 text-sm">
            {formatDateTime(storeCredit?.paidDate)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-bold ${
            storeCredit?.amount > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {storeCredit?.amount > 0 && "+"}
          {formatPrice(storeCredit?.amount)}
        </p>
        <p className="text-gray-600 text-sm">
          Số dư: {formatPrice(storeCredit?.balance)}
        </p>
      </div>
    </div>
  );
};
export default StoreCreditHistoryItem;

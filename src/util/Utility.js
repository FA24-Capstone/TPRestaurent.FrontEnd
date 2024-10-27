import { message } from "antd";
import dayjs from "dayjs";
import moment from "moment-timezone";
function formatPrice(gia) {
  /**
   * Định dạng giá tiền Việt Nam từ số nguyên thành chuỗi có dấu phân cách và ký tự đồng.
   *
   * @param {number} gia - Giá tiền cần định dạng.
   * @returns {string} - Chuỗi đã định dạng giá tiền.
   */
  if (gia !== null && gia !== undefined) {
    return gia.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  } else {
    return "0";
  }
}

function formatDateTime(ngayGio) {
  /**
   * Định dạng thời gian thành chuỗi dd/mm/yyyy hh/mm/ss.
   *
   * @param {Date} ngayGio - Thời gian cần định dạng.
   * @returns {string} - Chuỗi đã định dạng thời gian.
   */
  var date = new Date(ngayGio);
  var ngay = date.getDate();
  var thang = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
  var nam = date.getFullYear();
  var gio = date.getHours();
  var phut = date.getMinutes();
  var giay = date.getSeconds();

  // Thêm số 0 vào trước nếu số chỉ có 1 chữ số
  if (ngay < 10) ngay = "0" + ngay;
  if (thang < 10) thang = "0" + thang;
  if (gio < 10) gio = "0" + gio;
  if (phut < 10) phut = "0" + phut;
  if (giay < 10) giay = "0" + giay;

  return ngay + "/" + thang + "/" + nam + " " + gio + ":" + phut + ":" + giay;
}

function formatDate(ngayGio) {
  /**
   * Định dạng thời gian thành chuỗi dd/mm/yyyy hh:mm:ss.
   *
   * @param {Date} ngayGio - Thời gian cần định dạng.
   * @returns {string} - Chuỗi đã định dạng thời gian.
   */
  var date = new Date(ngayGio);
  var ngay = String(date.getDate()).padStart(2, "0");
  var thang = String(date.getMonth() + 1).padStart(2, "0"); // Tháng trong JavaScript bắt đầu từ 0
  var nam = date.getFullYear();

  return `${ngay}/${thang}/${nam}`;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function mergeCartData(cartReservation, cartCombos, options = {}) {
  // Default values or from options
  const {
    reservationDate = options.reservationDate,
    numberOfPeople = options.numberOfPeople,
    endTime = options.endTime,
    customerInfoId = options.customerInfoId,
    deposit = options.deposit,
  } = options;

  const reservationDishDtos = [];

  // Process cart reservation data
  cartReservation.forEach((item) => {
    reservationDishDtos.push({
      dishSizeDetailId: item.size.dishSizeDetailId, // Using dishId for this example
      combo: null,
      quantity: item.quantity,
      note: item.note, // Combine name and size for note
    });
  });
  // Process cart combos data
  cartCombos?.items?.forEach((comboOrigin) => {
    const dishComboIds = [];

    comboOrigin.selectedDishes.forEach((dishes) => {
      dishComboIds.push(dishes.dishComboId);
    });

    reservationDishDtos.push({
      combo: {
        comboId: comboOrigin.combo.comboId,
        dishComboIds,
      },
      quantity: comboOrigin.quantity,
      note: comboOrigin.note,
    });
  });

  return {
    reservationDate,
    numberOfPeople,
    endTime,
    customerInfoId,
    deposit,
    reservationDishDtos,
  };
}
export const getKeyByValue = (obj, value) => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");

  // Match and format the phone number
  let match;
  if (cleaned.length === 9) {
    match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  } else if (cleaned.length === 10) {
    match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
  }

  return phoneNumber;
}

function showError(errors) {
  if (Array.isArray(errors) && errors.length > 0) {
    const errorMessage = errors.join(", ");
    message.error(errorMessage);
  }
}
const padZero = (num) => (num < 10 ? "0" + num : num);

export const formatLocalDateTime = (date) => {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const day = padZero(startDate.getDate());
  const month = padZero(startDate.getMonth() + 1); // Months are zero-based
  const year = startDate.getFullYear();

  const startHours = padZero(startDate.getHours());
  const startMinutes = padZero(startDate.getMinutes());

  const endHours = padZero(endDate.getHours());
  const endMinutes = padZero(endDate.getMinutes());

  return `${day}/${month}/${year} ${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
};
function numberToWords(number) {
  const units = ["", "ngàn", "triệu", "tỷ"];
  const digits = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  if (number === 0) return "không đồng";

  let words = [];
  let unitIndex = 0;

  while (number > 0) {
    let part = number % 1000;
    if (part > 0) {
      let partWords = [];
      if (part >= 100) {
        partWords.push(digits[Math.floor(part / 100)]);
        partWords.push("trăm");
        part %= 100;
      }
      if (part >= 20) {
        partWords.push(digits[Math.floor(part / 10)]);
        partWords.push("mươi");
        part %= 10;
      } else if (part >= 10) {
        if (part === 10) {
          partWords.push("mười");
        } else {
          partWords.push(digits[10 + (part % 10)]);
        }
        part = 0;
      }
      if (part > 0) {
        partWords.push(digits[part]);
      }
      partWords.push(units[unitIndex]);
      words.unshift(partWords.join(" ").trim());
    }
    number = Math.floor(number / 1000);
    unitIndex++;
  }

  return words.join(" ").trim() + " đồng";
}

const combineTimes = (mealTime, endTime) => {
  const mealMoment = dayjs(mealTime);
  const endMoment = dayjs(endTime);

  if (mealMoment.isValid() && endMoment.isValid()) {
    const sameDay = mealMoment.format("DD-MM-YYYY");
    const mealHour = mealMoment.format("HH:mm");
    const endHour = endMoment.format("HH:mm");
    return `${sameDay} ${mealHour} - ${endHour}`;
  }
  return "Invalid Date";
};
export {
  formatPrice,
  formatDateTime,
  formatDate,
  isEmptyObject,
  mergeCartData,
  formatPhoneNumber,
  showError,
  numberToWords,
  combineTimes,
};

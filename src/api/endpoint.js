export const AccountApi = {
  SEND_OTP: "/api/account/send-otp",
  LOGIN: "/api/account/login",
  VERIFY_FOR_RESERVATION: "/api/account/verify-for-reservation",
  GET_BY_PHONE: "/api/account/get-account-by-phone-number",
  CREATE_ACCOUNT: "/api/account/create-account",
  UPDATE_ACCOUNT: "/api/account/update-account",
  VERIFY_ACCOUNT_OTP: "/api/account/verify-account-otp",
  CREATE_ADDRESS: "/api/account/create-customer-info-address",
  UPDATE_ADDRESS: "/api/account/update-customer-info-address",
  DELETE_ADDRESS: "/api/account/delete-customer-info-address",
  GET_ADDRESS: "/api/account/get-customer-info-address",
};

export const ComboApi = {
  GET_ALL: "/combo/get-all-combo/",
  GET_BY_ID: "/combo/get-combo-by-id-ver-2",
  CREATE_COMBO: "/combo/create-combo",
  UPDATE_COMBO: "/combo/update-combo",
  UPLOAD_COMBO_IMAGE: "/combo/upload-combo-image",
  DELETE_COMBO_BY_ID: "/combo/delete-combo-by-id",
};

export const ConfigurationApi = {
  GET_ALL: "/configuration/get-all-config",
};
export const CouponApi = {
  GET_ALL: "/coupon/get-available-coupon",
};
export const DeviceApi = {
  GET_ALL: "/device/get-all-device",
};
export const HashingApi = {
  DECODE_HASHING: "/api/hashing/decode-hashing",
};

export const OrderApi = {
  CREATE_ORDER: "/order/create-order",
  GET_BY_PHONE: "/order/get-all-order-by-phone-number",
  GET_DETAIL: "/order/get-order-detail",
  CHANGE_ORDER_STATUS: "/order/change-order-status",
  GET_ALL: "/order/get-all-order-by-status",
  SUGGEST_TABLE: "/order/suggest-table",
  ADD_TABLE_TO_RESEVATION: "/reservation/add-table-to-reservation",
  UPDATE_RESERVATION: "/reservation/update-reservation-status",
  CALCULATE_RESERVATION: "/order/calculate-reservation",
  GET_ALL_TABLE_DETAIL: "/order/get-all-table-details",
  CALCULATE_DELIVER_ORDER: "/order/calculate-deliver-order",
  UPDATE_ORDER_DETAIL_STATUS: "/order/update-order-detail-status",
};

export const ReservationApi = {
  GET_ALL: "/reservation/get-all-reservation",
  CALCULATE_DEPOSIT: "/reservation/calculate-deposit",
  CREATE_RESERVATION: "/reservation/create-reservation",
  GET_BY_PHONE: "/reservation/get-all-reservation-by-phone-number",
  GET_DETAIL: "/reservation/get-reservation-detail",
};

export const StoreCreditApi = {
  ADD: "/store-credit/add-to-store-credit",
};

export const TableSessionApi = {
  GET_CURRENT_TABLE_SESSION: "/table-session/get-current-table-session",
  GET_DETAIL: "/table-session/get-table-session-by-id",
  UPDATE_PRELIST_ORDER_STATUS: "/table-session/update-prelist-order-status",
};

export const TransactionApi = {
  CREATE_PAYMENT: "/transaction/create-payment",
  GET_ALL: "/transaction/get-all-payment",
  UPDATE_STATUS: "/transaction/update-transaction-status",
  GET_LOYALTY_POINT_BY_CUSTOMER:
    "/transaction/get-loyalty-point-history-by-customer-id",
  GET_TRANSACTION_HISTORY_BY_CUSTOMER_ID:
    "/transaction/get-transaction-history-by-customer-id",
  GET_STORE_CREDIT_TRANSACTION_HISTORY_BY_CUSTOMER_ID:
    "/transaction/get-stored-credit-transaction-history-by-customer-id",
};

export const DishApi = {
  GET_ALL: "/dish/get-all-dish/",
  GET_ALL_DISH_TYPE: "/dish/get-all-dish-type",
  GET_BY_ID: "/dish/get-dish-by-id",
  GET_ALL_DISH_SIZE: "/dish/get-all-dish-size",
  GET_ALL_DISH_TAG: "/dish/get-all-dish-tag",
  CREATE_DISH: "/dish/create-dish",
  UPDATE_DISH: "/dish/update-dish",
  UPDATE_DISH_IMAGE: "/dish/update-dish-image",
  DELETE_DISH: "/dish/delete-dish",
};
export const MapApi = {
  AUTO_COMPLETE: "/map/auto-complete",
};

export const OrderSessionApi = {
  GET_GROUPED_DISH: "/order-session/get-grouped-dish",
  GET_ALL_ORDER_SESSION: "/order-session/get-all-order-session",
  GET_ORDER_SESSION_BY_ID: "/order-session/get-order-session-by-id",
  UPDATE_ORDER_SESSION_STATUS: "/order-session/update-order-session-status",
};

export const DishManagementApi = {
  UPDATE_DISH_QUANTITY: "/dish-management/update-dish-quantity",
};

export const TokenApi = {
  ENABLE_NOTIFICATION: "/token/enable-notification",
  GET_ALL_TOKEN_BY_USER: "/token/get-all-token-by-user",
  LOG_OUT_ALL_DEVICE: "/token/log-out-all-device",
  DELETE_TOKEN: "/token/delete-token",
  GET_USER_TOKEN_BY_IP: "/token/get-user-token-by-ip",
};

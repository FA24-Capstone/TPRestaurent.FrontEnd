import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Tabs, message, Button } from "antd";
import { Typography } from "@material-tailwind/react";

import {
  addToCart,
  getTotal,
} from "../../../redux/features/cartReservationSlice";

import ComboDetail2 from "../../../pages/common/menu-page/ComboDetail";

import {
  formatDate,
  formatDateTime,
  formatPrice,
  isEmptyObject,
  mergeCartData,
  showError,
} from "../../../util/Utility";
import useCallApi from "../../../api/useCallApi";
import {
  ComboApi,
  ConfigurationApi,
  DishApi,
  OrderApi,
} from "../../../api/endpoint";
import DishCard from "../../dish/DishCard";
import ComboCard from "../../combo/ComboCard";
import OrderSummary from "../order-list/OrderSummary";
import LoadingOverlay from "../../loading/LoadingOverlay";
import moment from "moment-timezone";
import { ReservationCart } from "../reservation/ReservationCart";
const { TabPane } = Tabs;
import ReservationInformation from "../reservation/ReservationInformation";

const ModalReservationWithDish = ({
  visible,
  onCancel,
  information,
  handleOpenOtp,
}) => {
  const [dishes, setDishes] = useState([]);
  const [combos, setCombos] = useState([]);
  const [activeTab, setActiveTab] = useState("0");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedCombos, setSelectedCombos] = useState(null);
  const [combo, setCombo] = useState({});
  const [isOpenComboDetail, setIsOpenComboDetail] = useState(false);
  const [deposit, setDeposit] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cartReservation);
  const cartCombo = useSelector((state) => state.cart);
  const cartTotal = useSelector(getTotal);
  const user = useSelector((state) => state.user.user || {});
  const [totalItems, setTotalItems] = useState(0);
  const { callApi, error, loading } = useCallApi();
  const [isSummary, setIsSummary] = useState(false);
  const [dataSend, setDataSend] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(false);

  const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);
  const [dateDeposit, setDateDeposit] = useState("");

  const fetchRangeDeposit = async () => {
    debugger;
    const response = await callApi(
      `${ConfigurationApi.GET_CONFIG_BY_NAME}/TIME_TO_RESERVATION_WITH_DISHES_LAST`,
      "GET"
    );
    if (response.isSuccess) {
      let date = moment().tz("Asia/Ho_Chi_Minh");
      date.add(response.result.currentValue, "hours");
      const formattedDate = date.format("DD/MM/YYYY HH:mm");
      setDateDeposit(formattedDate);
    } else {
      showError(error);
    }
  };
  const caculatorItems = () => {
    let total = 0;
    total += cart?.length;
    total += cartCombo?.items.length;
    return total;
  };
  useEffect(() => {
    setTotalItems(caculatorItems());
  }, [cart, cartCombo]);
  const fetchData = async () => {
    try {
      if (activeTab === "0") {
        const dishesData = await callApi(
          `${DishApi.GET_ALL}/${1}/${10}`,
          "GET"
        );
        if (dishesData?.result?.items) {
          setDishes(dishesData?.result?.items);
        }
      } else {
        const combosData = await callApi(
          `${ComboApi.GET_ALL}/${1}/${10}`,
          "GET"
        );
        if (combosData?.result) {
          setCombos(combosData?.result);
        }
      }
    } catch (error) {
      message.error("Failed to load products: " + error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (selectedCombos) {
      fetchComboDetail();
    }
  }, [selectedCombos, isOpenComboDetail]);

  useEffect(() => {
    handleDeposit();
  }, [cartCombo, cart]);
  useEffect(() => {
    fetchRangeDeposit();
  }, []);
  const handleAddToCart = (dish, size) => {
    if (!size.isAvailable) {
      message.error("Sản phẩm với size này đã hết hàng");
      return;
    }
    dispatch(addToCart({ dish, size, quantity: 1 }));
  };

  const handleTabChange = (key) => setActiveTab(key);

  const handleSizeClick = (dish, size) => {
    setSelectedSizes((prevSizes) => ({
      ...prevSizes,
      dish: dish,
      size: size,
    }));
  };

  const getCurrentPrice = (dishId) => {
    const dish = dishes.find((dish) => dish.dish.dishId === dishId);
    if (dish && selectedSizes) {
      const sizeDetail = dish.dishSizeDetails.find(
        (size) => size === selectedSizes.size
      );
      return sizeDetail ? sizeDetail.price : 0;
    }
    return 0;
  };

  const fetchComboDetail = async () => {
    const response = await callApi(
      `${ComboApi.GET_BY_ID}/${selectedCombos}`,
      "GET"
    );
    if (response.isSuccess) {
      setCombo(response.result);
    }
  };
  const handleCheckout = async () => {
    if (!information.customerId || information.isVerified === false) {
      const response = await callApi(
        `/api/account/send-customer-info-otp?phoneNumber=${
          information.phone
        }&otpType=${1}`,
        "POST"
      );
      if (response?.isSuccess) {
        handleOpenOtp();
        return;
      } else {
        message.error("Failed to send OTP");
      }
    }

    const data = mergeCartData(cart, cartCombo, {
      reservationDate: information?.startTime,
      endTime: information?.endTime,
      customerId: information.customerId,
      deposit: deposit,
      numberOfPeople: information.numberOfPeople,
    });
    const { reservationDishDtos } = data;
    setDataSend({
      customerId: information.customerId,
      orderType: 1,
      note: information.note,
      orderDetailsDtos: reservationDishDtos,
      reservationOrder: {
        numberOfPeople: information.numberOfPeople,
        mealTime: information.startTime,
        endTime: information.endTime,
        isPrivate: information.isPrivate,
        deposit: deposit,
      },
    });
  };

  const handleDeposit = async () => {
    if (cartCombo.length > 0 || cart.length > 0) {
      const data = await callApi(
        `${OrderApi.CALCULATE_RESERVATION}`,
        "POST",
        mergeCartData(cart, cartCombo, {
          reservationDate: information.startTime,
          endTime: information.endTime,
          customerInfoId: information.customerId,
          numberOfPeople: information.numberOfPeople,
          deposit: 0,
        })
      );
      if (data.isSuccess) {
        setDeposit(data?.result);
      } else {
        showError(data.messages);
      }
    }
  };

  const renderDishCard = (dish) => (
    <DishCard
      dish={dish}
      formatPrice={formatPrice}
      getCurrentPrice={getCurrentPrice}
      handleAddToCart={handleAddToCart}
      handleSizeClick={handleSizeClick}
      selectedSizes={selectedSizes}
      key={"card"}
    />
  );

  const renderComboCard = (combo) => (
    <ComboCard
      formatDate={formatDate}
      formatPrice={formatPrice}
      onClick={() => {
        setIsOpenComboDetail(true);
        setSelectedCombos(combo.comboId);
      }}
      combo={combo}
      key={"cardcombo"}
    />
  );

  return (
    <div className=" p-4 bg-gray-50 min-h-screen">
      {visible && (
        <div className="mx-10">
          {!isSummary ? (
            <div className="  grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
              <div className=" col-span-1 lg:col-span-9 bg-white rounded-lg shadow-md p-6">
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  className="mb-6"
                >
                  <TabPane
                    tab="Món ăn"
                    key="0"
                    className="max-h-[800px] overflow-y-auto "
                  >
                    {loading && <LoadingOverlay isLoading={loading} />}
                    {!loading && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
                        {dishes.map(renderDishCard)}
                      </div>
                    )}
                  </TabPane>
                  <TabPane
                    tab="Combo món"
                    key="1"
                    className="max-h-[800px] overflow-y-auto "
                  >
                    {isOpenComboDetail ? (
                      <ComboDetail2
                        comboData={combo}
                        handleBack={() => setIsOpenComboDetail(false)}
                      />
                    ) : (
                      <>
                        {loading && <LoadingOverlay isLoading={loading} />}
                        {!loading && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
                            {combos?.map(renderComboCard)}
                          </div>
                        )}
                      </>
                    )}
                  </TabPane>
                </Tabs>
              </div>
              <div className=" col-span-1 lg:col-span-3 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <ReservationInformation reservation={information} />
                </div>
                <div className="max-h-[800px] overflow-auto bg-white rounded-lg shadow-md p-6">
                  <ReservationCart />
                  {cart.length > 0 && (
                    <div className="mt-4 text-center">
                      <Typography
                        variant="h5"
                        className="font-bold text-red-700"
                      >
                        Tổng cộng: {formatPrice(cartTotal + cartCombo.total)}
                      </Typography>
                      <p className="text-gray-600">
                        Số tiền cọc dự kiến: {formatPrice(deposit)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-1 lg:col-span-12 flex justify-end ">
                <Button
                  className="bg-gray-300 text-gray-800 rounded-md px-6 py-2 hover:bg-gray-400 transition-colors"
                  onClick={onCancel}
                >
                  Quay lại
                </Button>
                <Button
                  className="bg-red-800 text-white rounded-md px-6 py-2 hover:bg-red-900 transition-colors"
                  onClick={() => {
                    if (isEmptyObject(user)) {
                      message.error("Vui lòng đăng nhập để tiếp tục");
                      return;
                    } else if (
                      cartCombo.items.length === 0 &&
                      cart.length === 0
                    ) {
                      message.error("Vui lòng chọn món ăn hoặc combo");
                      return;
                    }
                    setIsSummary(true);
                    handleCheckout();
                  }}
                >
                  Đặt bàn ngay
                </Button>
              </div>
            </div>
          ) : (
            <OrderSummary
              data={dataSend}
              information={information}
              back={() => setIsSummary(false)}
              dateDeposit={dateDeposit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ModalReservationWithDish;

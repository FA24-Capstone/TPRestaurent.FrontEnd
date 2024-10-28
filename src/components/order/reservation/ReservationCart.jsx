import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from "../../../redux/features/cartReservationSlice";
import { formatPrice } from "../../../util/Utility";
import {
  Card,
  CardBody,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  decreaseComboQuantity,
  increaseComboQuantity,
  removeCombo,
} from "../../../redux/features/cartSlice";
import useSyncCart from "../../../hook/useSyncCart";

export function ReservationCart() {
  const cartReservation = useSelector((state) => state.cartReservation);
  const cartCombos = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const syncCart = useSyncCart(cartReservation, cartCombos);

  // Handlers for combo actions
  const handleIncreaseComboQuantity = (comboId, selectedDishes) => {
    dispatch(increaseComboQuantity({ comboId, selectedDishes }));
  };

  const handleDecreaseComboQuantity = (comboId, selectedDishes) => {
    dispatch(decreaseComboQuantity({ comboId, selectedDishes }));
  };

  const handleRemoveCombo = (comboId, selectedDishes) => {
    dispatch(removeCombo({ comboId, selectedDishes }));
  };
  // Handlers for reservation actions
  const handleIncreaseQuantity = (dish, size) => {
    dispatch(
      increaseQuantity({
        dish,
        size,
      })
    );
  };

  const handleDecreaseQuantity = (dish, size) => {
    dispatch(
      decreaseQuantity({
        dish,
        size,
      })
    );
  };

  const handleRemoveFromCart = (dish, size) => {
    dispatch(
      removeFromCart({
        dish,
        size,
      })
    );
  };
  useEffect(() => {
    syncCart();
  }, []);
  return (
    <div className=" mx-auto bg-white ">
      <Typography variant="h4" className="mb-4 text-center">
        Danh sách món order
      </Typography>

      {/* Reservation Cart Section */}
      <div className="w-full ">
        <div className="p-2 ">
          {cartReservation.length === 0 ? (
            <Typography color="blue-gray" className="text-center my-4">
              Giỏ hàng trống
            </Typography>
          ) : (
            cartReservation.map((item) => (
              <div
                key={`${item?.dish.dishId}-${item?.size?.dishSizeDetailId}`}
                className="flex items-center mb-4 bg-[#EAF0F0] p-2 rounded-md"
              >
                <img
                  src={item?.dish?.image}
                  alt={item?.dish?.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-grow flex flex-col ml-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Typography
                        variant="h6"
                        color="blue-gray"
                        className="text-sm"
                      >
                        {item?.dish?.name}
                        <span className="lowercase font-normal mx-1">
                          (
                          {item?.size.dishSize?.vietnameseName ||
                            item?.size.dishSize?.name}
                          )
                        </span>
                      </Typography>

                      <Typography
                        color="blue-gray"
                        className="font-medium text-sm"
                      >
                        {formatPrice(item?.size?.price)}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-1">
                    <div className="flex items-center  bg-white my-1 rounded-2xl p-1 border border-[#EAF0F0] shadow-md">
                      <IconButton
                        variant="text"
                        color="blue-gray"
                        size="sm"
                        onClick={() =>
                          handleDecreaseQuantity(item?.dish, item?.size)
                        }
                        className="rounded-full bg-[#EAF0F0] "
                      >
                        <MinusIcon className="h-4 w-4" />
                      </IconButton>
                      <Typography
                        color="blue-gray"
                        className="font-medium w-6 text-center"
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        variant="text"
                        color="blue-gray"
                        size="sm"
                        onClick={() =>
                          handleIncreaseQuantity(item?.dish, item?.size)
                        }
                        className="rounded-full bg-[#EAF0F0] "
                      >
                        <PlusIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                    <IconButton
                      variant="text"
                      color="red"
                      size="sm"
                      onClick={() =>
                        handleRemoveFromCart(item?.dish, item?.size)
                      }
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))
          )}
          {cartCombos.items.length === 0 ? (
            <Typography color="blue-gray" className="text-center my-4">
              Chưa có combo nào trong giỏ hàng
            </Typography>
          ) : (
            cartCombos?.items?.map((item) => (
              <div
                key={item.comboId}
                className="mb-4  bg-[#EAF0F0] p-2 rounded-md"
              >
                <h3 className="text-center font-bold text-xl my-2">Combo</h3>
                <div className="flex flex-col justify-between items-start mb-4 border-b-2">
                  <div className="w-full flex flex-col md:flex-row justify-between mb-2">
                    <span className="font-semibold">{item?.combo?.name}</span>
                    <span className="text-black font-bold mx-2">
                      {formatPrice(item?.combo?.price)}
                    </span>
                  </div>
                  <div className="flex flex-col w-full">
                    {Object.values(item.selectedDishes).map(
                      (dishCombo, dishIndex) => (
                        <div key={`${dishIndex}`} className="space-y-4">
                          <div className="flex flex-row items-center justify-between">
                            <img
                              src={dishCombo.dishSizeDetail?.dish?.image}
                              alt={dishCombo.dishSizeDetail?.dish?.name}
                              className="w-16 h-16 object-cover rounded-full border border-gray-200"
                            />
                            <div className="flex-1 ml-4">
                              <p className="font-medium">
                                {dishCombo.dishSizeDetail?.dish?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                    <div className="w-full">
                      <div className="flex justify-between ml-20 items-center">
                        <div className="flex items-center  bg-white my-1 rounded-2xl p-1 border border-[#EAF0F0] shadow-md">
                          <IconButton
                            variant="text"
                            color="blue-gray"
                            size="sm"
                            onClick={() =>
                              handleDecreaseComboQuantity(
                                item.comboId,
                                item.selectedDishes
                              )
                            }
                            className="rounded-full bg-[#EAF0F0] "
                          >
                            <MinusIcon className="h-4 w-4" />
                          </IconButton>
                          <Typography className="mx-2">
                            {item.quantity}
                          </Typography>
                          <IconButton
                            variant="text"
                            color="blue-gray"
                            size="sm"
                            onClick={() =>
                              handleIncreaseComboQuantity(
                                item.comboId,
                                item.selectedDishes
                              )
                            }
                            className="rounded-full bg-[#EAF0F0] "
                          >
                            <PlusIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                        <IconButton
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={() =>
                            handleRemoveCombo(item.comboId, item.selectedDishes)
                          }
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

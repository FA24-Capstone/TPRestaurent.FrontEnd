import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { OrderApi } from "../api/endpoint";
import useCallApi from "../api/useCallApi";
import { setCart } from "../redux/features/cartReservationSlice";
import { setCartCombo } from "../redux/features/cartSlice";

const useSyncCart = (cartReservation, cart) => {
  const dispatch = useDispatch();
  const { callApi, error, loading } = useCallApi();
  const syncCart = useCallback(async () => {
    const resposeSyncCartReservation = await callApi(
      `${OrderApi.GET_CART_DISH_ITEM}`,
      "POST",
      cartReservation
    );
    if (
      resposeSyncCartReservation.isSuccess &&
      resposeSyncCartReservation.result
    ) {
      dispatch(setCart(resposeSyncCartReservation.result));
    }
    const resposeSyncCartCombo = await callApi(
      `${OrderApi.GET_CART_COMBO_ITEM}`,
      "POST",
      cart
    );
    if (resposeSyncCartCombo.isSuccess && resposeSyncCartCombo.result) {
      dispatch(setCartCombo(resposeSyncCartCombo.result));
    }
  }, [dispatch, cartReservation, cart]);

  return syncCart;
};

export default useSyncCart;

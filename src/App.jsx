import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { StateProvider } from "./context/StateProvider";
import { ToastContainer } from "react-toastify";
import "aos/dist/aos.css";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { registerables } from "chart.js";
import Chart from "chart.js/auto";
Chart.register(...registerables);
import moment from "moment-timezone";
import Routers from "./routes/Routers";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase/firebase";
import { useEffect } from "react";
import { message } from "antd";
import { NotificationProvider } from "./context/NotificationContext";
import { useNotification } from "./hook/useNotification";
moment.tz.setDefault("Asia/Ho_Chi_Minh");

export async function requestPermission() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
    });
    return token;
  } else if (permission === "denied") {
    message.error("You denied for the notification");
  }
  return null;
}
export const NotificationListener = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      addNotification({
        title: payload?.notification?.title || "New Notification",
        body: payload?.notification?.body || "You have a new message",
        type: "default",
        duration: 5000,
        data: payload?.notification.body,
      });
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [addNotification]);
  useEffect(() => {
    requestPermission();
  }, []);
  return null;
};
function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StateProvider>
            <BrowserRouter>
              <NotificationProvider>
                <NotificationListener />

                <Routers />

                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
                <ToastContainer />
              </NotificationProvider>
            </BrowserRouter>
          </StateProvider>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;

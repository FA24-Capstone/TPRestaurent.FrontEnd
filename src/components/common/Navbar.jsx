import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, IconButton } from "@material-tailwind/react";
import { Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { isEmptyObject } from "../../util/Utility";
import { FaUser } from "react-icons/fa";
import NotificationDemo from "../notification/NotificationDemo";
import { logout } from "../../redux/features/authSlice";
import { Search, SearchIcon } from "lucide-react";
import useCallApi from "../../api/useCallApi";
import { NotificationApi } from "../../api/endpoint";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuUserOpen, setIsMenuUserOpen] = useState(false);

  const cart = useSelector((state) => state.cart);
  const cartReservation = useSelector((state) => state.cartReservation);
  const user = useSelector((state) => state.user.user || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { callApi, error } = useCallApi();
  const [notifications, setNotifications] = useState([]);

  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const fetchNotifications = async () => {
    const response = await callApi(
      `${NotificationApi.GET_ALL_NOTIFICATION_BY_USER}/${user.id}`,
      "GET"
    );
    if (response.isSuccess) {
      setNotifications(response.result?.items);
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsMenuUserOpen(false);
    setIsOpen(false);
  };

  const toggleMenuUser = () => {
    setIsMenuUserOpen(!isMenuUserOpen);
    setIsNotificationOpen(false);
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const caculatorItems = () => {
    let total = 0;
    total += cart?.items?.length;
    total += cartReservation?.length;
    return total;
  };

  useEffect(() => {
    setTotalItems(caculatorItems());
  }, [cart, cartReservation]);

  const navItems = [
    { name: "Thực đơn", path: "/search" },
    { name: "Combo", path: "/combo" },
    { name: "Đặt bàn", path: "/booking" },
    { name: "Giới thiệu", path: "/about" },
    { name: "Chính sách", path: "/policy" },
    { name: "Tra cứu đơn hàng", path: "/order-history" },
  ];

  const icons = [
    {
      icon: "fa-cart-shopping",
      path: "/cart",
      name: "Giỏ hàng",
      value: totalItems,
    },
    { icon: "fa-bell", path: "/notifications", name: "Thông báo", value: 1 },
  ];

  const handleSearch = () => {
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsNotificationOpen(false);
    setIsMenuUserOpen(false);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      notificationRef.current &&
      !notificationRef.current.contains(event.target) &&
      searchRef.current &&
      !searchRef.current.contains(event.target) &&
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target)
    ) {
      setIsMenuOpen(false);
      setIsNotificationOpen(false);
      setIsOpen(false);
      setIsMenuUserOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-[#9A0E1D] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-20">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <NavLink
              to="/"
              className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
            >
              Thiên Phú
            </NavLink>
          </h1>

          <button
            onClick={toggleMenu}
            className="xl:hidden text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <CloseOutlined className="text-2xl" />
            ) : (
              <MenuOutlined className="text-2xl" />
            )}
          </button>

          {/* Desktop menu */}
          <ul className="hidden xl:flex space-x-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className="text-base lg:text-lg font-medium hover:text-yellow-300 transition duration-300 ease-in-out relative group text-nowrap"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden xl:flex items-center space-x-4">
            {icons
              .filter((i) => i.name !== "Thông báo")
              .map((item) => (
                <NavLink
                  key={item.icon}
                  to={item.path}
                  className="hover:text-yellow-300 transition duration-300 ease-in-out"
                >
                  <Badge count={item.value}>
                    <i
                      className={`fa-solid ${item.icon} text-xl text-white`}
                    ></i>
                  </Badge>
                </NavLink>
              ))}
            <div className="relative" ref={notificationRef}>
              {icons
                .filter((i) => i.name === "Thông báo")
                .map((item, index) => (
                  <Badge count={notifications.length} key={index}>
                    <IconButton
                      className="bg-transparent rounded-full shadow-none mx-0 px-0"
                      onClick={toggleNotification}
                    >
                      <i
                        className={`fa-solid ${item.icon} text-xl text-white`}
                      ></i>
                    </IconButton>
                  </Badge>
                ))}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-20">
                  <NotificationDemo notifications={notifications} />
                </div>
              )}
            </div>

            {isOpen && (
              <div
                className="left-1/2 -translate-x-1/2 top-20 absolute w-full px-4 sm:px-6 lg:px-8 z-50"
                ref={searchRef}
              >
                <div className="max-w-7xl mx-auto">
                  <form className="flex flex-col sm:flex-row items-center gap-2 bg-white rounded-lg shadow-2xl p-2 mt-10">
                    <input
                      placeholder="Tìm kiếm..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-full focus:outline-none text-black px-4 py-2 text-lg"
                    />
                    <Button
                      type="submit"
                      className="sm:w-auto bg-red-900 hover:bg-red-600 transition-all duration-300 text-nowrap rounded-full"
                      onClick={handleSearch}
                    >
                      <SearchIcon />
                    </Button>
                  </form>
                </div>
              </div>
            )}
            <IconButton
              variant="text"
              className="rounded-full text-white hover:bg-white/20 transition-all"
              onClick={() => {
                setIsOpen(!isOpen);
                setIsNotificationOpen(false);
                setIsMenuUserOpen(false);
              }}
            >
              <Search />
            </IconButton>
            {isEmptyObject(user) ? (
              <NavLink
                to="/login"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-4 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                Đăng nhập
              </NavLink>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button onClick={toggleMenuUser}>
                  <FaUser className="inline-block mr-2" />
                </button>
                {isMenuUserOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                    <NavLink
                      to="/user/"
                      className="block px-4 py-2 text-center text-gray-800 hover:bg-gray-200"
                    >
                      Hồ sơ của tôi
                    </NavLink>
                    {user.mainRole === "ADMIN" && (
                      <NavLink
                        to="/admin"
                        className="block px-4 py-2 text-center text-gray-800 hover:bg-gray-200"
                      >
                        Quản trị
                      </NavLink>
                    )}
                    {user.mainRole === "CHEF" && (
                      <NavLink
                        to="/kitchen"
                        className="block px-4 py-2 text-center text-gray-800 hover:bg-gray-200"
                      >
                        Quản trị
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-center px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="xl:hidden" ref={menuRef}>
            <ul className="pt-2 pb-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              {icons.map((item) => (
                <li key={item.icon}>
                  <NavLink
                    to={item.path}
                    className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              {isEmptyObject(user) ? (
                <li>
                  <NavLink
                    to="/login"
                    className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                    onClick={toggleMenu}
                  >
                    Đăng nhập
                  </NavLink>
                </li>
              ) : (
                <>
                  <NavLink
                    to="/user/"
                    className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                  >
                    Hồ sơ của tôi
                  </NavLink>
                  {user.mainRole === "ADMIN" && (
                    <NavLink
                      to="/admin"
                      className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                    >
                      Quản trị
                    </NavLink>
                  )}
                  {user.mainRole === "CHEF" && (
                    <NavLink
                      to="/kitchen"
                      className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                    >
                      Quản trị
                    </NavLink>
                  )}

                  <NavLink
                    onClick={handleLogout}
                    className="block py-2 px-4 text-md hover:bg-red-700 transition duration-300 ease-in-out text-center"
                  >
                    Đăng xuất
                  </NavLink>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaChartBar,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaNewspaper,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { close } from "../../redux/features/sidebarSlice";

const AccordionItem = ({ item, open, handleOpen, index, navigate }) => (
  <Accordion
    open={open === index}
    icon={
      item.subItems && (
        <FaChevronDown
          className={`h-4 w-4 transition-transform text-white ${
            open === index ? "rotate-180" : ""
          }`}
        />
      )
    }
  >
    <ListItem
      className="p-0"
      selected={open === index}
      onClick={() => navigate(item.path)}
    >
      <AccordionHeader
        onClick={() => handleOpen(index)}
        className="border-b-0 px-4 py-4 cursor-pointer"
      >
        <NavLink className="flex items-center w-full text-white">
          <ListItemPrefix>{item.icon}</ListItemPrefix>
          <Typography className="mr-auto text-white font-bold text-nowrap">
            {item.title}
          </Typography>
        </NavLink>
      </AccordionHeader>
    </ListItem>
    {item.subItems && (
      <AccordionBody className="py-1">
        <List className="p-0">
          {item.subItems.map((subItem, subIndex) => (
            <ListItem
              key={subIndex}
              onClick={() => {
                navigate(subItem.path);
              }}
            >
              <NavLink className="flex items-center w-full text-white">
                <ListItemPrefix>
                  <FaChevronRight className="h-3 w-3" />
                </ListItemPrefix>
                <Typography className="text-white font-semibold">
                  {subItem.title}
                </Typography>
              </NavLink>
            </ListItem>
          ))}
        </List>
      </AccordionBody>
    )}
  </Accordion>
);

export function MultiLevelSidebar({ menuItems }) {
  const [open, setOpen] = useState(0);
  const sidebar = useSelector((state) => state.sidebar);
  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        dispatch(close());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(close());
  }, [location, dispatch]);

  return (
    <div className="flex min-h-full bg-gray-100 ">
      <div
        ref={sidebarRef}
        className={`fixed min-h-full inset-y-0 left-0 z-50 w-64 bg-[#970C1A] rounded-tr-2xl rounded-br-2xl text-white transition-transform duration-300 ease-in-out ${
          sidebar.isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <NavLink
            to={"/"}
            className="font-bold text-2xl text-center text-white w-full"
          >
            Thien Phu
          </NavLink>
          <button
            onClick={() => dispatch(sidebar.isOpen ? close() : open())}
            className="md:hidden text-white focus:outline-none"
          >
            <FaTimes className="h-6 w-6 text" />
          </button>
        </div>
        <List className="text-white p-2">
          {menuItems?.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              open={open}
              handleOpen={handleOpen}
              index={index + 1}
              navigate={navigate}
            />
          ))}
        </List>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import TabMananger from "../../components/tab/TabManager";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
} from "@material-tailwind/react";
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import useCallApi from "../../api/useCallApi";
import DishTable from "../../components/table/DishTable";
import Pagination from "../../components/pagination/Pagination";
import { ComboApi, DishApi } from "../../api/endpoint";
import CreateMenuPage from "./menu/CreateMenuPage";
import ComboTable from "../../components/table/ComboTable";
import NavigateCreateMenu from "./menu/NavigateCreateMenu";
import { uniqueId } from "lodash";
import { message } from "antd";
import { showError } from "../../util/Utility";
import { NavLink } from "react-router-dom";
const AdminDishPage = ({ initData, tab }) => {
  const MenuTab = [
    {
      label: "Món lẻ",
      value: "1",
    },

    {
      label: "Món Combo",
      value: "2",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [dishes, setDishes] = useState([]);
  const [combos, setCombos] = useState([]);
  const { callApi, error, loading } = useCallApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMenuTab, setSelectedMenuTab] = useState("1");
  const totalItems = 10;
  const [isCreateDishModalVisible, setIsCreateDishModalVisible] =
    useState(false);
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const renderMenuTab = () => {
    return (
      <div className="flex gap-1 my-1">
        {MenuTab.map((tab) => (
          <Button
            key={uniqueId()}
            className={`${
              Number(selectedMenuTab) === Number(tab.value)
                ? "bg-red-800 text-white"
                : "bg-white text-gray-800"
            }    min-w-40  rounded-tl-md rounded-tr-md rounded-bl-none rounded-br-none border`}
            size="sm"
            onClick={() => setSelectedMenuTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    );
  };
  const fetchDishes = async () => {
    if (Number(selectedMenuTab) === 1) {
      const response = await callApi(
        `${DishApi.GET_ALL}/${currentPage}/${totalItems}`,
        "GET"
      );
      if (response?.isSuccess) {
        setDishes(response.result.items);
        setTotalPages(response.result.totalPages);
      }
    } else {
      const response = await callApi(
        `${ComboApi.GET_ALL}/${currentPage}/${totalItems}`,
        "GET"
      );
      if (response?.isSuccess) {
        setCombos(response.result);
        setTotalPages(response.result.totalPages);
      }
    }
  };
  useEffect(() => {
    fetchDishes();
  }, [currentPage, selectedMenuTab]);
  if (tab === "tab1" && initData) {
    return <NavigateCreateMenu initData={initData} tab={tab} />;
  }
  if (isCreateDishModalVisible) {
    return (
      <NavigateCreateMenu back={() => setIsCreateDishModalVisible(false)} />
    );
  }

  const deleteDish = async (dishId) => {
    const response = await callApi(
      `${DishApi.DELETE_DISH}?dishId=${dishId}`,
      "POST"
    );
    if (response?.isSuccess) {
      message.success("Xóa món thành công");
      await fetchDishes();
    } else {
      showError(error);
    }
  };
  const deleteCombo = async (comboId) => {
    const response = await callApi(
      `${ComboApi.DELETE_COMBO_BY_ID}?comboId=${comboId}`,
      "POST"
    );
    if (response?.isSuccess) {
      message.success("Xóa combo thành công");
      await fetchDishes();
    } else {
      showError(error);
    }
  };
  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Quản lý món ăn
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Xem và quản lý tất cả các món ăn
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setIsCreateDishModalVisible(true)}
            >
              Thêm món mới
            </Button>
            <Button
              className="flex items-center bg-red-700 gap-3"
              size="sm"
              onClick={fetchDishes}
            >
              <ArrowPathIcon strokeWidth={2} className="h-4 w-4" /> Làm mới
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="mb-4">{renderMenuTab()}</div>

          <div className="w-full md:w-72">
            <Input
              label="Tìm kiếm"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <NavLink
        to="/admin/daily-sell-management"
        className={"text-red-600 px-6 font-bold uppercase underline"}
      >
        Cập nhật số lượng món ăn
      </NavLink>
      <CardBody key={uniqueId()} className="overflow-y-scroll h-[500px]">
        {Number(selectedMenuTab) === 1 ? (
          <DishTable
            key={uniqueId()}
            dishes={dishes}
            loading={loading}
            isAction={true}
            deleteDish={deleteDish}
          />
        ) : (
          Number(selectedMenuTab) === 2 && (
            <ComboTable
              key={uniqueId()}
              data={combos}
              loading={loading}
              isAction={true}
              deleteCombo={deleteCombo}
            />
          )
        )}
      </CardBody>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleCurrentPageChange}
      />
    </Card>
  );
};
export default AdminDishPage;

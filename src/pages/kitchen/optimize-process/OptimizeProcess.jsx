import { useEffect, useRef, useState } from "react";
import {
  Typography,
  Table,
  message,
  Tag,
  Badge,
  Skeleton,
  Space,
  Button,
  Image,
  Checkbox,
  Modal,
} from "antd";
import useCallApi from "../../../api/useCallApi";
import {
  ConfigurationApi,
  GroupedDishCraftApi,
  OrderApi,
} from "../../../api/endpoint";
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../../../api/config/axios";
import notification_sound from "../../../assets/sound/kitchen.mp3";
import styled from "styled-components";
import { EyeOutlined } from "@ant-design/icons";
import OrderDetailModal from "./OrderDetailModal";
import { combineTimes, showError } from "../../../util/Utility";
import { SignalRMethod } from "../../../util/GlobalType";
import { set } from "lodash";
import sound from "../../../assets/sound/kitchen.mp3";

const { Title, Text } = Typography;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: center;
    vertical-align: middle;
    border-bottom: none;
  }
  .ant-table-tbody > tr > td {
    text-align: center;
    vertical-align: middle;
    border-bottom: none;
  }
`;
const QuantityBadge = ({ label, count, color }) => (
  <div className="flex items-center space-x-1">
    <Badge
      count={count}
      showZero
      className="flex items-center"
      style={{ backgroundColor: color }}
    >
      <Tag color={color} className="px-3 py-1 text-sm font-medium">
        {label}
      </Tag>
    </Badge>
  </div>
);

const OptimizeProcess = () => {
  const [connection, setConnection] = useState(null);
  const audioRef = useRef(null);
  const [groupedDishCraft, setGroupedDishCraft] = useState([]);
  const { callApi, error, loading } = useCallApi();
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedGroupedDishId, setSelectedGroupedDishId] = useState(null);
  const [type, setType] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [timeConfig, setTimeConfig] = useState(0);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [selectedMutualDishes, setSelectedMutualDishes] = useState([]);
  const [selectedSingleDishes, setSelectedSingleDishes] = useState([]);
  const filteredSingleData = groupedDishCraft?.filter((item) => {
    const dishes = JSON.parse(item.groupedDishJson).SingleOrderDishes;
    return dishes.length > 0;
  });
  const filteredData = groupedDishCraft?.filter((item) => {
    const dishes = JSON.parse(item.groupedDishJson).MutualOrderDishes;
    return dishes.length > 0;
  });
  const handleSelectAllMutual = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const allMutualDishes = filteredData.flatMap((record) => {
        const dishes = JSON.parse(record.groupedDishJson).MutualOrderDishes;
        return dishes.map((dishItem) => ({
          dishId: dishItem?.Dish?.DishId,
          groupedDishId: record.groupedDishCraftId,
        }));
      });
      setSelectedMutualDishes(allMutualDishes);
      setSelectedDishes([...selectedSingleDishes, ...allMutualDishes]);
    } else {
      setSelectedMutualDishes([]);
      setSelectedDishes(selectedSingleDishes);
    }
  };

  const handleSelectAllSingle = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const allSingleDishes = filteredSingleData.flatMap((record) => {
        const dishes = JSON.parse(record.groupedDishJson).SingleOrderDishes;
        return dishes.map((dishItem) => ({
          dishId: dishItem?.Dish?.DishId,
          groupedDishId: record.groupedDishCraftId,
        }));
      });
      setSelectedSingleDishes(allSingleDishes);
      setSelectedDishes([...selectedMutualDishes, ...allSingleDishes]);
    } else {
      setSelectedSingleDishes([]);
      setSelectedDishes(selectedMutualDishes);
    }
  };

  const DishSizeInfo = ({
    sizeData,
    dishData,
    groupedDishId,
    fetchDetail,
    type,
    setType,
    setSelectedGroupedDishId,
    selectedDishes,
    setSelectedDishes,
    isMutual,
  }) => {
    const handleCheckboxChange = (e, dishId, groupedDishId) => {
      const isChecked = e.target.checked;
      const newDish = { dishId, groupedDishId };

      if (isMutual) {
        const updatedMutualDishes = isChecked
          ? [...selectedMutualDishes, newDish]
          : selectedMutualDishes.filter(
              (dish) =>
                dish.dishId !== dishId || dish.groupedDishId !== groupedDishId
            );
        setSelectedMutualDishes(updatedMutualDishes);
      } else {
        const updatedSingleDishes = isChecked
          ? [...selectedSingleDishes, newDish]
          : selectedSingleDishes.filter(
              (dish) =>
                dish.dishId !== dishId || dish.groupedDishId !== groupedDishId
            );
        setSelectedSingleDishes(updatedSingleDishes);
      }

      // Update overall selected dishes
      const updatedSelectedDishes = isChecked
        ? [...selectedDishes, newDish]
        : selectedDishes.filter(
            (dish) =>
              dish.dishId !== dishId || dish.groupedDishId !== groupedDishId
          );
      setSelectedDishes(updatedSelectedDishes);
    };

    return (
      <div
        className={`flex w-full items-center justify-start rounded-lg p-4 my-1 ${
          dishData.IsLate ? "bg-yellow-700 bg-opacity-40" : "bg-white"
        }`}
        style={{
          border: "1px solid #ccc",
        }}
      >
        <Checkbox
          onChange={(e) =>
            handleCheckboxChange(e, dishData?.Dish?.DishId, groupedDishId)
          }
          checked={
            isMutual
              ? selectedMutualDishes?.some(
                  (dish) =>
                    dish.dishId === dishData?.Dish?.DishId &&
                    dish.groupedDishId === groupedDishId
                )
              : selectedSingleDishes?.some(
                  (dish) =>
                    dish.dishId === dishData?.Dish?.DishId &&
                    dish.groupedDishId === groupedDishId
                )
          }
        />
        <Text strong className="ml-2 text-nowrap">
          {dishData?.Dish?.Name}
        </Text>
        <div>
          {sizeData.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-9 items-center gap-1 p- rounded"
            >
              <div className="col-span-4 px-2 flex items-center">
                <Image
                  src={dishData.Dish.Image}
                  alt="dish"
                  width={30}
                  height={30}
                  className="rounded-full w-full h-full"
                />
                <span className="text-nowrap text-sm ml-1">
                  {item.DishSize.VietnameseName}:
                </span>
              </div>

              <Space className="flex flex-wrap  col-span-4">
                <QuantityBadge
                  label="Chưa đọc"
                  count={item.UncheckedQuantity}
                  color="#a8181c"
                />
                <QuantityBadge
                  label="Đang nấu"
                  count={item.ProcessingQuantity}
                  color="#1890ff"
                />
              </Space>
              <div className=" col-span-1 pl-2">
                <span
                  style={{
                    border: "1px solid #ccc",
                  }}
                  className="px-2 py-1 rounded-lg cursor-pointer"
                  onClick={async () => {
                    setType(type);
                    setSelectedGroupedDishId(groupedDishId);
                    await fetchDetail(
                      groupedDishId,
                      dishData?.Dish.DishId,
                      type
                    );
                  }}
                >
                  <EyeOutlined size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: (
        <Checkbox
          onChange={handleSelectAllMutual}
          checked={
            selectedMutualDishes.length > 0 &&
            selectedMutualDishes.length ===
              filteredData?.flatMap(
                (record) => JSON.parse(record.groupedDishJson).MutualOrderDishes
              ).length
          }
        />
      ),
      key: "selection",
      width: 50,
      render: () => null, // No extra rendering needed for this column
    },
    {
      dataIndex: "id",
      key: "id",
      title: "STT",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: "timeGrouped",
      key: "timeGrouped",
      title: "Thời gian gom món",
      width: 200,
      render: (_, record) => (
        <span className="text-nowrap">
          {combineTimes(record.startTime, record.endTime)}
        </span>
      ),
    },
    {
      title: "MÓN ĂN",
      dataIndex: "groupedDishJson",
      key: "name",
      render: (_, record) => {
        const dishes = JSON.parse(record.groupedDishJson).MutualOrderDishes;
        return (
          dishes.length > 0 &&
          dishes.map((dishItem, index) => (
            <DishSizeInfo
              key={index}
              dishData={dishItem}
              sizeData={dishItem.Dish?.Total || []}
              groupedDishId={record.groupedDishCraftId}
              fetchDetail={fetchDetail}
              type={true}
              setType={setType}
              setSelectedGroupedDishId={setSelectedGroupedDishId}
              selectedDishes={selectedDishes}
              setSelectedDishes={setSelectedDishes}
              isMutual={true}
            />
          ))
        );
      },
    },
  ];

  const columnSingle = [
    {
      title: (
        <Checkbox
          onChange={handleSelectAllSingle}
          checked={
            selectedSingleDishes.length > 0 &&
            selectedSingleDishes.length ===
              filteredSingleData.flatMap(
                (record) => JSON.parse(record.groupedDishJson).SingleOrderDishes
              ).length
          }
        />
      ),
      key: "selection",
      width: 50,
      render: () => null, // No extra rendering needed for this column
    },
    {
      dataIndex: "id",
      key: "id",
      title: "STT",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: "timeGrouped",
      key: "timeGrouped",
      title: "Thời gian gom món",
      width: 200,
      render: (_, record) => (
        <span className="text-nowrap">
          {combineTimes(record.startTime, record.endTime)}
        </span>
      ),
    },
    {
      title: "MÓN ĂN",
      dataIndex: "groupedDishJson",
      key: "name",
      render: (_, record) => {
        const dishes = JSON.parse(record.groupedDishJson).SingleOrderDishes;
        return (
          dishes.length > 0 &&
          dishes.map((dishItem, index) => (
            <DishSizeInfo
              key={index}
              dishData={dishItem}
              sizeData={dishItem.Dish?.Total || []}
              groupedDishId={record.groupedDishCraftId}
              fetchDetail={fetchDetail}
              type={false}
              setSelectedGroupedDishId={setSelectedGroupedDishId}
              setType={setType}
              selectedDishes={selectedDishes}
              setSelectedDishes={setSelectedDishes}
              isMutual={false}
            />
          ))
        );
      },
    },
  ];

  const fetchData = async () => {
    const result = await callApi(`${GroupedDishCraftApi.GET_ALL}`, "GET");
    if (result.isSuccess) {
      setGroupedDishCraft(result.result.items);
    }
    const response = await callApi(
      `${ConfigurationApi.GET_CONFIG_BY_NAME}/TIME_FOR_GROUPED_DISH`,
      "GET"
    );
    if (response.isSuccess) {
      setTimeConfig(response.result.currentValue);
    }
  };
  const fetchDetail = async (groupedDishId, dishId, type) => {
    const result = await callApi(
      `${GroupedDishCraftApi.GET_BY_ID}/${groupedDishId}?dishId=${dishId}&isMutual=${type}`,
      "GET"
    );
    if (result.isSuccess) {
      setSelectedDish(result.result);
    }
  };
  const fetchAfterHandle = async () => {
    await fetchData();
    const response = await fetchDetail(
      selectedGroupedDishId,
      selectedDish.dish.dishId,
      type
    );
    if (response.isSuccess) {
      setSelectedDish(response.result);
    }
  };

  const handleUpdateStatus = async (selectedOrderDetail) => {
    const result = await callApi(
      `${OrderApi.UPDATE_ORDER_DETAIL_STATUS}`,
      "PUT",
      selectedOrderDetail
    );
    if (result.isSuccess) {
      setSelectedDish(null);
      s;
      message.success("Cập nhật trạng thái thành công");
      await fetchData();
    } else {
      showError(response.messages);
    }
  };

  const handleTriggerGroupedDish = async () => {
    await callApi(`${GroupedDishCraftApi.ADD_GROUPED_DISH}`, "POST");
    await fetchData();
    message.success("Gom món thành công");
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/notifications`, {
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .withStatefulReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    const startConnection = async () => {
      if (connection) {
        try {
          await connection.start();
          message.success("Connected to SignalR");
          connection.on(SignalRMethod.LOAD_ORDER, async () => {
            playNotificationSound();

            await fetchData();
          });
        } catch (error) {
          console.error("SignalR connection error:", error);
          message.error("Unable to connect to SignalR server.");
        }
      }
    };

    const MAX_RETRIES = 5;
    let retryCount = 0;
    const RETRY_DELAY = 3000;

    const attemptReconnect = () => {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => startConnection(), RETRY_DELAY);
      } else {
        message.error("Maximum retry attempts reached. Please check server.");
      }
    };

    startConnection();

    // Cleanup the connection on component unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);
  const playNotificationSound = () => {
    const audio = new Audio(sound); // Change path to your sound file
    audio.play();
  };
  return (
    <div className="px-10 bg-white rounded-lg py-4 shadow-lg">
      <h5 className="text-center text-red-800 font-bold text-2xl">
        TỐI ƯU HOÁ CHẾ BIẾN MÓN
      </h5>
      <audio ref={audioRef}>
        <source src={notification_sound} type="audio/mpeg" />
      </audio>

      <div>
        <Text type="danger" style={{ display: "block", margin: "16px 0" }}>
          Note: Sau {timeConfig} phút, hệ thống sẽ tự động kiểm tra đơn và tối
          ưu món liên tục trên list.
        </Text>

        <div className="flex justify-between items-center">
          <Title level={3}>BẢNG ƯU TIÊN MÓN CẦN CHẾ BIẾN</Title>
          <Button
            className="bg-red-800 text-white"
            loading={loading}
            onClick={async () => await handleTriggerGroupedDish()}
          >
            Gom món ngay
          </Button>
        </div>
        <div className="grid  grid-cols-1 xl:grid-cols-2 gap-4 ">
          <div className="">
            <h3 className="bg-[#E3B054] text-white px-4 py-6 text-center rounded-lg shadow-lg uppercase font-bold">
              Món trùng đơn
            </h3>
            <div className="w-full">
              <StyledTable
                dataSource={filteredData}
                columns={columns}
                pagination={false}
                rowKey={(record) => record.groupedDishCraftId}
                scroll={{ x: 600, y: 500 }}
                loading={loading}
              />
            </div>
          </div>
          <div className="">
            <h3 className="bg-[#C40519] text-white px-4 py-6 text-center rounded-lg shadow-lg uppercase font-bold">
              Món lẻ đơn
            </h3>
            <div className="w-full ">
              <StyledTable
                dataSource={filteredSingleData}
                columns={columnSingle}
                pagination={false}
                scroll={{ x: 600, y: 500 }}
                rowKey={(record) => record.groupedDishCraftId}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center my-2">
        <Button
          loading={loading}
          className="bg-red-800 text-white"
          onClick={async () => {
            Modal.confirm({
              title: "Xác nhận",
              content: "Bạn có chắc chắn muốn cập nhật trạng thái món ăn?",
              onOk: async () => {
                const response = await callApi(
                  `${GroupedDishCraftApi.UPDATE_GROUPED_DISH}`,
                  "POST",
                  selectedDishes
                );
                if (response.isSuccess) {
                  message.success("Cập nhật trạng thái thành công");
                  setSelectedDishes([]);
                  setSelectedSingleDishes([]);
                  setSelectedMutualDishes([]);
                  await fetchData();
                }
              },
              onCancel() {
                console.log("Cancel");
              },
            });
          }}
        >
          Cập nhật
        </Button>
      </div>
      <OrderDetailModal
        handleUpdateStatus={handleUpdateStatus}
        loading={loading}
        selectedDish={selectedDish}
        setSelectedDish={setSelectedDish}
        isRefresh={isRefresh}
      />
    </div>
  );
};

export default OptimizeProcess;

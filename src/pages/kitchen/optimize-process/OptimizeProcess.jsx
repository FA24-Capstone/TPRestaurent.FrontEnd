import { useEffect, useRef, useState } from "react";
import {
  Typography,
  Table,
  message,
  Image,
  Tag,
  Badge,
  Skeleton,
  Space,
  Button,
} from "antd";
import useCallApi from "../../../api/useCallApi";
import { GroupedDishCraftApi, OrderApi } from "../../../api/endpoint";
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../../../api/config/axios";
import notification_sound from "../../../assets/sound/kitchen.mp3";
import styled from "styled-components";
import { EyeOutlined } from "@ant-design/icons";

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
  <div className="flex items-center space-x-2">
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

const DishSizeInfo = ({ sizeData, dishData }) => (
  <div
    className="flex items-center justify-start rounded-lg p-4 my-1"
    style={{
      border: "1px solid #ccc",
    }}
  >
    <Text strong className="w-32">
      {dishData?.Dish?.Name}
    </Text>
    <div>
      {sizeData.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-2 rounded">
          <Text strong className="min-w-[100px]">
            {item.DishSize.VietnameseName}:
          </Text>
          <Space>
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
        </div>
      ))}
    </div>
    <Button className="ml-4">
      <EyeOutlined />
    </Button>
  </div>
);

const OptimizeProcess = () => {
  const [connection, setConnection] = useState(null);
  const audioRef = useRef(null);
  const [groupedDishCraft, setGroupedDishCraft] = useState([]);
  const { callApi, error, loading } = useCallApi();

  const fetchData = async () => {
    const result = await callApi(`${GroupedDishCraftApi.GET_ALL}`, "GET");
    if (result.isSuccess) {
      setGroupedDishCraft(result.result.items);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      dataIndex: "id",
      key: "id",
      title: "STT",
      width: 80,
      render: (_, __, index) => index + 1,
      fixed: "left",
    },
    {
      title: "MÓN ĂN",
      dataIndex: "groupedDishJson",
      key: "name",

      render: (text) => {
        const dishes = JSON.parse(text).MutualOrderDishes;
        return (
          dishes.length > 0 &&
          dishes.map((dishItem, index) => (
            <DishSizeInfo
              key={index}
              dishData={dishItem}
              sizeData={dishItem.Dish?.Total || []}
            />
          ))
        );
      },
    },
  ];

  const columnSingle = [
    {
      dataIndex: "id",
      key: "id",
      title: "STT",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "MÓN ĂN",
      dataIndex: "groupedDishJson",
      key: "name",

      render: (text) => {
        const dishes = JSON.parse(text).SingleOrderDishes;
        return (
          dishes.length > 0 &&
          dishes.map((dishItem, index) => (
            <DishSizeInfo
              key={index}
              dishData={dishItem}
              sizeData={dishItem.Dish?.Total || []}
            />
          ))
        );
      },
    },
  ];

  useEffect(() => {
    // Create connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/notifications`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      // Start the connection
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR");
          message.success("Connected to SignalR");
          // Subscribe to SignalR events
          connection.on("LOAD_ORDER_SESIONS", () => {
            fetchData();
            if (audioRef.current) {
              audioRef.current.play();
            }
          });
        })
        .catch((error) => console.log("Connection failed: ", error));
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  const filteredData = groupedDishCraft.filter((item) => {
    const dishes = JSON.parse(item.groupedDishJson).MutualOrderDishes;
    return dishes.length > 0;
  });

  const filteredSingleData = groupedDishCraft.filter((item) => {
    const dishes = JSON.parse(item.groupedDishJson).SingleOrderDishes;
    return dishes.length > 0;
  });
  console.log(filteredSingleData);
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
          Note: Sau 3 phút, hệ thống sẽ tự động kiểm tra đơn và tối ưu món liên
          tục trên list.
        </Text>

        <Title level={3}>BẢNG ƯU TIÊN MÓN CẦN CHẾ BIẾN</Title>

        <div className="grid grid-cols-2 gap-4 ">
          <div className="">
            <h3 className="bg-[#E3B054] text-white px-4 py-6 text-center rounded-lg shadow-lg uppercase font-bold">
              Món trùng đơn
            </h3>
            <div className="w-full">
              {loading && <Skeleton />}
              {!loading && (
                <StyledTable
                  dataSource={filteredData}
                  columns={columns}
                  pagination={false}
                  rowKey={(record) => record.id}
                  loading={loading}
                  scroll={{ x: 600 }}
                />
              )}
            </div>
          </div>
          <div className="">
            <h3 className="bg-[#C40519] text-white px-4 py-6 text-center rounded-lg shadow-lg uppercase font-bold">
              Món lẻ đơn
            </h3>
            <div className="overflow-x-auto w-full">
              {loading && <Skeleton />}
              {!loading && (
                <StyledTable
                  dataSource={filteredSingleData}
                  columns={columnSingle}
                  pagination={false}
                  scroll={{ x: 600 }}
                  rowKey={(record) => record.id}
                  size="small"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizeProcess;

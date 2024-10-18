import { useEffect, useRef, useState } from "react";
import { Typography, Table, message, Image, Tag, Badge, Skeleton } from "antd";
import useCallApi from "../../../api/useCallApi";
import { OrderApi, OrderSessionApi } from "../../../api/endpoint";
import { IconButton } from "@material-tailwind/react";
import { Clock, Eye } from "lucide-react";
import { uniqueId } from "lodash";
import { showError } from "../../../util/Utility";
import OrderDetailModal from "./OrderDetailModal";
import * as signalR from "@microsoft/signalr";
import { baseUrl } from "../../../api/config/axios";
import notification_sound from "../../../assets/sound/kitchen.mp3";
const { Title, Text } = Typography;

const OptimizeProcess = () => {
  const [mutualOrderDishes, setMutualOrderDishes] = useState([]);
  const [singleOrderDishes, setSingleOrderDishes] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [connection, setConnection] = useState(null);
  const audioRef = useRef(null);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  const { callApi, error, loading } = useCallApi();

  const fetchData = async () => {
    const result = await callApi(`${OrderSessionApi.GET_GROUPED_DISH}`, "GET");
    if (result.isSuccess) {
      setMutualOrderDishes(result.result?.mutualOrderDishes);
      setSingleOrderDishes(result.result?.singleOrderDishes);
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
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "MÓN ĂN",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <Image
            className="rounded-md"
            src={record.dish?.image}
            alt="Food"
            width={100}
            height={100}
          />
          <p className="ml-10 font-semibold uppercase">{record.dish?.name}</p>
        </div>
      ),
    },
    {
      title: "SỐ LƯỢNG",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (_, record) => (
        <div className="space-y-4">
          {record.total.map((item, index) => (
            <div key={index} className="p-4  rounded-lg">
              <div className="flex space-x-4">
                <span className="block text-sm font-bold mb-2">
                  {item.dishSize.vietnameseName}
                </span>
                <Badge count={item.uncheckedQuantity} showZero>
                  <Tag color="green">Chưa đọc</Tag>
                </Badge>
                <Badge count={item.processingQuantity} showZero>
                  <Tag color="green">Đang nấu</Tag>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Xem chi tiết",
      dataIndex: "detail",
      key: "detail",
      align: "center",
      render: (_, record) => (
        <div>
          <IconButton
            onClick={() => {
              setSelectedDish(record);
            }}
            className="cursor-pointer bg-white shadow-none text-black hover:shadow-none hover:bg-white"
          >
            <Eye />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleUpdateStatus = async () => {
    const response = await callApi(
      `${OrderApi.UPDATE_ORDER_DETAIL_STATUS}?isSuccessful=true`,
      "PUT",
      selectedRows
    );
    if (response.isSuccess) {
      message.success("Cập nhật trạng thái thành công");
      await fetchData();
    } else {
      showError(error);
    }
  };
  useEffect(() => {
    // Create connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/notifications`) // Replace with your SignalR hub URL
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
          connection.on("LOAD_ORDER_SESIONS", (data) => {
            fetchData();
            if (audioRef.current) {
              audioRef.current.play().catch((error) => {
                console.error("Error playing audio:", error);
              });
            }
          });
        })
        .catch((error) => console.log("Connection failed: ", error));
    }

    // Cleanup on component unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);
  if (loading) {
    return <Skeleton active />;
  }
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

        <div className="grid grid-cols-1 2xl:grid-cols-12 ">
          <div className=" col-span-12  2xl:col-span-9 ">
            <div className="grid  grid-cols-1 xl:grid-cols-2 gap-2">
              <div className="shadow-md rounded-md">
                <div className="">
                  <div className="shadow-md rounded-md">
                    <h3 className="bg-[#E3B054] text-white px-4 py-6 text-center rounded-lg shadow-lg uppercase font-bold">
                      Món trùng đơn
                    </h3>
                    <div className="w-full">
                      <Table
                        dataSource={mutualOrderDishes}
                        columns={columns}
                        pagination={false}
                        rowKey={uniqueId()}
                        size="small"
                        loading={loading}
                        scroll={{ x: 600 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="shadow-md rounded-md">
                <h3 className="bg-[#C40519] text-white px-4 py-6 text-center rounded-lg shadow-lg uppercase font-bold">
                  Món lẻ đơn
                </h3>
                <div className="overflow-x-auto w-full">
                  <Table
                    dataSource={singleOrderDishes}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 600 }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-span-3 w-full  border-l-2 border-gray-300">
            <div className="xl:bg-white rounded-lg p-6 h-full flex flex-col justify-between">
              <div className="flex justify-center mb-4">
                <h3 className="text-red-800 uppercase text-2xl font-bold text-center">
                  Thông báo về đặt món
                </h3>
              </div>
              <div className="flex-grow flex flex-col space-y-4 max-h-[30rem]  overflow-y-auto">
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>{" "}
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-red-600 rounded-full shadow-md w-fit px-6 py-3 flex items-center ">
                  <div className="flex flex-col items-start">
                    <p className="text-red-600 font-semibold text-sm">
                      BÀN TBL1 MỚI ĐẶT MÓN
                    </p>
                    <div className="flex justify-center  text-sm text-gray-600">
                      <Clock className="mr-2" size={16} />
                      <p>2 phút trước</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      {selectedDish && (
        <OrderDetailModal
          selectedDish={selectedDish}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          handleUpdateStatus={handleUpdateStatus}
          loading={loading}
          setSelectedDish={setSelectedDish}
        />
      )}
    </div>
  );
};

export default OptimizeProcess;

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  Skeleton,
} from "antd";
import moment from "moment";
import useCallApi from "../../api/useCallApi";
import { ConfigurationApi } from "../../api/endpoint";
import Pagination from "../../components/pagination/Pagination";

const { Title } = Typography;

const SettingsPage = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { callApi, error, loading } = useCallApi();
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 20;
  const handleCurrentPageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchData = async () => {
    const response = await callApi(
      `${ConfigurationApi.GET_ALL}/${currentPage}/${totalItems}`,
      "GET"
    );
    if (response?.isSuccess) {
      setData(response.result?.items);
      setTotalPages(response.result.totalPages);
    } else {
      console.log("error", response);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const columns = [
    {
      title: "Tên cấu hình",
      dataIndex: "name",
      key: "name",
      render(_, record) {
        return <span>{`${record.vietnameseName}  (${record.unit})`}</span>;
      },
    },
    {
      title: "Giá trị hiện tại",
      dataIndex: "currentValue",
      key: "currentValue",
    },

    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Sửa
        </Button>
      ),
    },
  ];
  if (loading) {
    return <Skeleton />;
  }
  return (
    <Card
      className="max-w-4xl mx-auto my-8"
      title={
        <div>
          <Title level={4} style={{ color: "black", margin: 0 }}>
            Cấu hình hệ thống
          </Title>
        </div>
      }
    >
      <div className="overflow-y-scroll h-[550px]">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={loading}
        />
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        key={currentPage}
        onPageChange={handleCurrentPageChange}
      />
    </Card>
  );
};

export default SettingsPage;

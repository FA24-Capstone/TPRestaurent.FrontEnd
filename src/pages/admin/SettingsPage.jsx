import { act, useEffect, useState } from "react";
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
  Tabs,
  message,
} from "antd";
import moment from "moment";
import useCallApi from "../../api/useCallApi";
import { ConfigurationApi } from "../../api/endpoint";
import Pagination from "../../components/pagination/Pagination";
import { StyledTable } from "../../components/custom-ui/StyledTable";
import { EditIcon, ShowerHead } from "lucide-react";
import dayjs from "dayjs";
import { formatDateTime, showError } from "../../util/Utility";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import TabMananger from "../../components/tab/TabManager";

const { Title } = Typography;
const { TabPane } = Tabs;

const SettingsPage = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedHistories, setSelectedHistories] = useState([]);
  const { callApi, error, loading } = useCallApi();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 100;
  const [activeTab, setActiveTab] = useState(1);
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

  const handleEdit = async (record) => {
    setSelectedRecord(record);
    const response = await callApi(
      `${ConfigurationApi.GET_ALL_CONFIG_VERSION_BY_ID}/${record.configurationId}/1/100`,
      "GET"
    );
    if (response?.isSuccess) {
      setSelectedHistories(response.result.items);
    } else {
      showError(response.messages);
    }
    form.setFieldsValue({
      configurationId: record.configurationId,
      name: record.name,
      currentValue: record.currentValue,
      unit: record.unit,
    });
    form2.setFieldsValue({
      configurationId: record.configurationId,
      activeDate: dayjs(),
      activeValue: record.currentValue,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
  };

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
          <EditIcon />
        </Button>
      ),
    },
  ];
  const handleCreateConfigService = async (values) => {
    const payload = {
      ...values,
      activeDate: dayjs(values.activeDate).format("YYYY-MM-DD"),
    };
    console.log("payload", payload);
    const data = {
      activeValue: payload.activeValue,
      activeDate: dayjs(payload.activeDate).format("YYYY-MM-DD"),
      configurationId: payload.configurationId,
    };
    const response = await callApi(
      `${ConfigurationApi.CREATE_CONFIG_SERVICE}`,
      "POST",
      data
    );
    if (response?.isSuccess) {
      setIsModalVisible(false);
      setSelectedRecord(null);
      await fetchData();
      message.success("Cấu hình thành công");
    } else {
      showError(response.messages);
    }
  };
  const handleSubmitUpdateConfigService = async (values) => {
    console.log("values", values);
    const response = await callApi(
      `${ConfigurationApi.UPDATE_CONFIG}`,
      "PUT",
      values
    );
    if (response?.isSuccess) {
      setIsModalVisible(false);
      setSelectedRecord(null);
      await fetchData();
      message.success("Cập nhật cấu hình thành công");
    } else {
      showError(response.messages);
    }
  };
  const renderTab = () => {
    if (activeTab === 1) {
      return (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitUpdateConfigService}
        >
          <Form.Item hidden label="ID" name="configurationId">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Tên cấu hình" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Gía trị hiện tại" name="currentValue">
            <Input />
          </Form.Item>
          <Form.Item hidden label="Đơn vị" name="unit">
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button className="bg-red-800 text-white" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      );
    } else {
      return (
        <Form
          form={form2}
          layout="vertical"
          onFinish={handleCreateConfigService}
        >
          <Form.Item hidden label="ID" name="configurationId">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Gía trị cấu hình tiếp theo"
            name="activeValue"
            rules={[
              {
                required: true,
                message: "Please input the Active Value!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày áp dụng"
            name="activeDate"
            rules={[
              {
                required: true,
                message: "Please select the Active Date!",
              },
            ]}
          >
            <DatePicker needConfirm={false} format={"DD/MM/YYYY"} showTime />
          </Form.Item>

          <Form.Item>
            <Button className="bg-red-800 text-white" htmlType="submit">
              Cấu hình
            </Button>
          </Form.Item>
        </Form>
      );
    }
  };
  return (
    <Card className="max-w-7xl mx-auto my-8">
      <LoadingOverlay isLoading={loading} />
      <div>
        <h3 className="uppercase text-center text-xl text-red-800 my-4 font-semibold">
          Cấu hình hệ thống
        </h3>
      </div>
      <div>
        {loading && <Skeleton active />}
        {!loading && (
          <StyledTable
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={loading}
            scroll={{ x: 768, y: 700 }}
          />
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        key={currentPage}
        onPageChange={handleCurrentPageChange}
      />
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1400}
      >
        <div style={{ display: "flex" }}>
          <div>
            <TabMananger
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              items={[
                {
                  label: "Cập nhật cấu hình hiện tại",
                  value: 1,
                },
                {
                  label: "Cập nhật cấu hình theo lịch",
                  value: 2,
                },
              ]}
            />

            {renderTab()}
          </div>
          <div className="flex-1 ml-4 overflow-auto">
            <h3 className="font-semibold text-red-800 uppercase my-4 text-lg text-center">
              Lịch sử cấu hình
            </h3>
            <StyledTable
              columns={[
                {
                  title: "Ngày áp dụng",
                  dataIndex: "activeDate",
                  key: "activeDate",
                  render: (text) => <span>{formatDateTime(text)}</span>,
                },
                {
                  title: "Gía trị cấu hình",
                  dataIndex: "activeValue",
                  key: "activeValue",
                },
                {
                  title: "Tên cấu hình",
                  dataIndex: ["configuration", "vietnameseName"],
                  key: "vietnameseName",
                },
                {
                  title: "Đơn vị",
                  dataIndex: ["configuration", "unit"],
                  key: "unit",
                },
              ]}
              scroll={{ x: 768, y: 700 }}
              dataSource={selectedHistories}
              pagination={false}
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default SettingsPage;

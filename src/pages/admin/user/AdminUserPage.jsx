import { useEffect, useState } from "react";
import useCallApi from "../../../api/useCallApi";
import TabMananger from "../../../components/tab/TabManager";
import { AccountApi } from "../../../api/endpoint";
import { Avatar, Input, Menu, Select, Skeleton, Tag } from "antd";
import { StyledTable } from "../../../components/custom-ui/StyledTable";
import { UserOutlined } from "@ant-design/icons";
import Pagination from "../../../components/pagination/Pagination";

const AdminUserPage = () => {
  const { callApi, error, loading } = useCallApi();
  const [activeTab, setActiveTab] = useState("0");
  const [accounts, setAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const totalItems = 20;
  const menu = [
    { label: "Người dùng", value: "0" },
    { label: "Nhân viên bếp", value: "1" },
    { label: "Shipper", value: "2" },
    { label: "Quản lý", value: "3" },
  ];
  const mapName = {
    0: "customer",
    1: "chef",
    2: "shipper",
    3: "admin",
  };
  const fetchData = async () => {
    const response = await callApi(
      `${AccountApi.GET_ACCOUNTS_BY_ROLE_NAME}/${mapName[activeTab]}/${currentPage}/${totalItems}`,
      "GET"
    );
    if (response.isSuccess) {
      setAccounts(response.result?.items);
      setTotalPages(response.result?.totalPages);
    }
  };

  const columns = [
    {
      title: "Mã người dùng",
      dataIndex: "id",
      key: "id",
      render: (id) => <span>{id.substring(0, 8)}</span>,
    },
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => <Avatar src={avatar} icon={<UserOutlined />} />,
    },
    {
      title: "Họ và tên",
      key: "name",
      render: (text, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => <span>0{text}</span>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (text, record) => (
        <>
          {record.isVerified && (
            <Tag className="text-wrap" color="green-inverse">
              Hoạt động
            </Tag>
          )}
          {!record.isVerified && (
            <Tag className="text-wrap" color="red-inverse">
              Chưa kích hoạt
            </Tag>
          )}

          {record.isDeleted && (
            <Tag className="text-wrap" color="red-inverse">
              Bị khoá
            </Tag>
          )}
        </>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (text, record) => (
        <Select className="w-fit " value={"Hành động"}>
          <Select.Option value="view">Xem</Select.Option>
          <Select.Option value="edit">Chỉnh sửa</Select.Option>
          <Select.Option value="ban">Cấm</Select.Option>
        </Select>
      ),
    },
  ];
  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage]);
  return (
    <div className="w-full  px-4 py-2 bg-white rounded-xl shadow-lg">
      <h1 className="text-xl font-bold text-center my-2 text-red-900 uppercase">
        QUẢN LÝ NGƯỜI DÙNG TRONG HỆ THỐNG
      </h1>
      <div className="flex justify-end">
        <Input.Search className="w-80" placeholder="Tìm theo từ khoá" />
      </div>
      <TabMananger
        activeTab={activeTab}
        items={menu}
        setActiveTab={setActiveTab}
        enableCount={false}
      />
      <div className="h-[600px] overflow-auto my-4">
        {!loading && (
          <StyledTable
            columns={columns}
            dataSource={accounts}
            loading={loading}
            size="middle"
            pagination={false}
          />
        )}
        {loading && <Skeleton active />}
      </div>
      <Pagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        key={"pagination"}
      />
    </div>
  );
};
export default AdminUserPage;

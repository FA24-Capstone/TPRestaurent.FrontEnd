import React, { useState, useEffect } from "react";
import { Switch, Button, List, Modal, Typography, Space } from "antd";
import { requestPermission } from "../../../App";
import {
  Bell,
  Smartphone,
  Laptop,
  Tablet,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import useCallApi from "../../../api/useCallApi";
import { TokenApi } from "../../../api/endpoint";
import { formatDateTime, showError } from "../../../util/Utility";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/features/authSlice";

const { Title, Text } = Typography;

const PersonalSetting = () => {
  const [devices, setDevices] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { callApi, error, loading } = useCallApi();
  const user = useSelector((state) => state.user.user || {});
  const dispatch = useDispatch();
  const fetchDevices = async () => {
    const response = await callApi(
      `${TokenApi.GET_ALL_TOKEN_BY_USER}/${user.id}/1/100`,
      "GET"
    );
    if (response.isSuccess) {
      setDevices(response.result?.items);
      
    } else {
      showError(error);
    }
  };
  console.log(devices)

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleNotificationChange = async (checked) => {
    if (checked) {
      const permission = await requestPermission();
      if (permission) {
        const response = await callApi(
          `${TokenApi.ENABLE_NOTIFICATION}?deviceToken=${permission}`,
          "POST"
        );
        if (response.isSuccess) {
          localStorage.setItem("device_token", permission);
          setNotificationsEnabled(true);
          await fetchDevices();
        } else {
          showError(error);
        }
      }
    } else {
      localStorage.removeItem("device_token");
      setNotificationsEnabled(false);
    }
  };

  const handleLogoutDevice =  async(tokenId) => {
    const response= await callApi(`${TokenApi.DELETE_TOKEN}?tokenId=${tokenId}`, "DELETE");
    if (response.isSuccess) {
     const data= devices.filter((device) => device.accessToken === device.some((device) => device.accessToken));
     console.log(data)
      // fetchDevices();
    } else {
      showError(error);
    }
  };

  const handleLogoutAllDevices = async () => {
    Modal.confirm({
      title: "Đăng xuất tất cả thiết bị",
      content: "Bạn có chắc chắn muốn đăng xuất khỏi tất cả thiết bị?",
      onOk: async () => {
       const response = await callApi(`${TokenApi.LOG_OUT_ALL_DEVICE}?accountId=${user.id}`, "POST");
        if (response.isSuccess) {
          fetchDevices();
          dispatch(logout());
        } else {
          showError(error);
        }
      },
    });
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "iPhone":
        return <Smartphone size={20} />;
        case "android":
        return <Smartphone size={20} />;
      case "Windows PC":
        return <Laptop size={20} />;
        case "Mac":
        return <Laptop size={20} />;
      case "tablet":
        return <Tablet size={20} />;
      default:
        return <Smartphone size={20} />;
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <Title level={2}>Các thiết bị gần đây bạn đã đăng nhập</Title>

      <Space style={{ marginBottom: "24px" }}>
        <Bell size={20} />
        <Text>Cho phép thông báo</Text>
        <Switch
          checked={notificationsEnabled}
          onChange={handleNotificationChange}
        />
      </Space>

      <List
        itemLayout="horizontal"
        dataSource={devices}
        renderItem={(device) => (
          <List.Item
            actions={[
              <Button
                key="logout"
                type="link"
                danger
              onClick={() => handleLogoutDevice(device.tokenId)}
                icon={<LogOut size={16} />}
              >
                Đăng xuất
              </Button>,
            ]}
          >
            
            <List.Item.Meta
              avatar={getDeviceIcon(device.deviceName)}
              title={device.deviceName}
             description={`Đăng nhập lần cuối: ${formatDateTime(device.lastLogin)}`}
            />
               <List.Item.Meta
             description={` Địa chỉ IP: ${device.deviceIP}`}
            />

          </List.Item>
        )}
      />

      {devices.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<AlertTriangle size={16} />}
          onClick={handleLogoutAllDevices}
          style={{ marginTop: "24px" }}
        >
          Đăng xuất tất cả thiết bị
        </Button>
      )}
    </div>
  );
};

export default PersonalSetting;

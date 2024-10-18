import { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Switch,
  Modal,
  Form,
  Input,
  AutoComplete,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { render } from "react-dom";
import useCallApi from "../../../api/useCallApi";
import { debounce, set } from "lodash";
import { IconButton, Typography } from "@material-tailwind/react";
import { Edit2, Trash2 } from "lucide-react";
import { AccountApi, MapApi } from "../../../api/endpoint";
import { login } from "../../../redux/features/authSlice";
import { showError } from "../../../util/Utility";

const PersonalAddress = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const user = useSelector((state) => state.user.user || {});
  const addresses = user.addresses || [];
  const [options, setOptions] = useState([]);
  const { callApi, error } = useCallApi();
  const [form] = Form.useForm();
  const [location, setLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const dispatch = useDispatch();
  const fetchData = async () => {
    const response = await callApi(
      `${AccountApi.GET_BY_PHONE}?phoneNumber=${user.phoneNumber}`,
      "GET"
    );
    if (response.isSuccess) {
      dispatch(login(response.result));
    } else {
      showError(error);
    }
  };
  const handleSearch = async (value) => {
    getLocation();
    const response = await callApi(`${MapApi.AUTO_COMPLETE}`, "POST", {
      address: value,
      destination: location ? [location.lat, location.lng] : null,
    });
    if (response.isSuccess) {
      setOptions(
        response.result?.map((address) => ({
          label: address.description,
          value: address.description,
          item: address,
        }))
      );
    } else {
      showError(error);
    }
  };

  const debouncedHandleSearch = useCallback(debounce(handleSearch, 1000), []);

  const handleSelect = (value, option) => {
    setSelectedAddress(option.item);
    form.setFieldsValue({ address: value });
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          getLocation();
        } else if (result.state === "prompt") {
          getLocation();
        } else {
          console.log("Geolocation permission denied");
        }
      });
    } else {
      getLocation();
    }
    if (isEditing) {
      form.setFieldValue("address", editData?.customerInfoAddressName);
      form.setFieldValue("isPrimary", editData?.isCurrentUsed);
    } else {
      form.resetFields();
    }
  }, [isModalVisible, editData]);

  const onsubmit = async () => {
    form.validateFields().then(async (values) => {
      console.log("Form values:", values);
      console.log("Selected address:", selectedAddress);
      let response = null;
      if (isEditing) {
        response = await callApi(`${AccountApi.UPDATE_ADDRESS}`, "PUT", {
          customerInfoAddressId: editData?.customerInfoAddressId,
          customerInfoAddressName: form.getFieldValue("address"),
          isCurrentUsed: form.getFieldValue("isPrimary"),
          accountId: user.id,
          lat: editData?.lat || "",
          lng: editData?.lng || "",
        });
      } else {
        response = await callApi(`${AccountApi.CREATE_ADDRESS}`, "POST", {
          customerInfoAddressName: form.getFieldValue("address"),
          isCurrentUsed: form.getFieldValue("isPrimary"),
          accountId: user.id,
          lat: selectedAddress?.lat || "",
          lng: selectedAddress?.lng || "",
        });
      }

      if (response.isSuccess) {
        message.success("Thêm địa chỉ thành công!");
        setIsAdding(false);
        setIsModalVisible(false);
        await fetchData();
      } else {
        showError(error);
      }
    });
  };

  const renderAddressForm = () => (
    <Form form={form} layout="vertical" className="mt-4 space-y-4">
      <Form.Item
        name="address"
        label="Địa chỉ của bạn"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ của bạn!" }]}
      >
        <AutoComplete
          onSearch={(e) => debouncedHandleSearch(e)}
          placeholder="Nhập đỉa chỉ của bạn"
          options={options}
          className="w-fit"
          onSelect={handleSelect}
        />
      </Form.Item>

      <Form.Item name="isPrimary" valuePropName="checked" label="Địa chỉ chính">
        <Switch />
      </Form.Item>

      <Form.Item>
        <div>
          <Button className="bg-red-800 text-white mr-2" onClick={onsubmit}>
            {isAdding ? "Thêm" : "Chỉnh sửa"} địa chỉ
          </Button>
          <Button
            className="bg-gray-500 text-white"
            onClick={() => {
              setIsAdding(false);
              setIsEditing(false);
              setIsModalVisible(false);
            }}
          >
            Huỷ
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
  const renderAddressList = () => {
    if (addresses.length === 0) {
      return (
        <Typography
          variant="lead"
          color="gray"
          className="text-center text-sm mt-4"
        >
          Không tìm thấy địa chỉ nào của bạn. Vui lòng thêm ít nhất 1 địa chỉ để
          đơn hàng của bạn được giao đến một cách sớm nhất.
        </Typography>
      );
    } else {
      const columns = [
        {
          title: "Tên địa chỉ",
          dataIndex: "customerInfoAddressName",
          key: "customerInfoAddressName",
        },

        {
          title: "Địa chỉ chính",
          dataIndex: "addressPrimary",
          key: "addressPrimary",
          render: (_, record) => (
            <Switch
              checked={record.isCurrentUsed}
              onChange={async () => {
                const response = await callApi(
                  `${AccountApi.UPDATE_ADDRESS}`,
                  "PUT",
                  {
                    customerInfoAddressId: record.customerInfoAddressId,
                    customerInfoAddressName: record.customerInfoAddressName,
                    isCurrentUsed: !record.isCurrentUsed,
                    accountId: user.id,
                    lat: record.lat || "",
                    lng: record.lng || "",
                  }
                );
                if (response.isSuccess) {
                  message.success("Cập nhật địa chỉ chính thành công!");
                  await fetchData();
                } else {
                  showError(error);
                }
              }}
            />
          ),
        },
        {
          title: "Hành động",
          key: "action",
          render: (_, record) => (
            <div className="flex gap-2">
              <IconButton
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setEditData(record);
                  setIsModalVisible(true);
                }}
                className="bg-white"
              >
                <Edit2 size={16} className="text-blue-800" />
              </IconButton>
              <IconButton
                color="red"
                size="sm"
                onClick={async () => {
                  console.log(
                    "Delete address with ID:",
                    record.customerInfoAddressId
                  );

                  const response = await callApi(
                    `${AccountApi.DELETE_ADDRESS}?customerInfoAddressId=${record.customerInfoAddressId}`,
                    "DELETE"
                  );
                  if (response.isSuccess) {
                    message.success("Xóa địa chỉ thành công!");
                    await fetchData();
                  } else {
                    showError(error);
                  }
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          ),
        },
      ];

      return (
        <Table
          columns={columns}
          dataSource={addresses}
          rowKey="customerInfoAddressId"
          pagination={false}
          size="small"
        />
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-900">Địa chỉ của bạn</h1>
      {renderAddressList()}
      <Button
        onClick={() => setIsModalVisible(true)}
        className="bg-red-800 text-white border-red-800 hover:bg-red-700 hover:border-red-700"
      >
        Thêm địa chỉ
      </Button>
      <Modal
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
        open={isModalVisible}
        footer={null}
      >
        {renderAddressForm()}
      </Modal>
    </div>
  );
};

export default PersonalAddress;

import { Modal, Form, Switch, AutoComplete, Table } from "antd";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { Edit2, Trash2, Plus, MapPin } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import useCallApi from "../../api/useCallApi";
import { AccountApi, MapApi } from "../../api/endpoint";
import _, { debounce } from "lodash";
import { toast } from "react-toastify";
import { showError } from "../../util/Utility";
import { StyledTable } from "../custom-ui/StyledTable";

const AddressModal = ({
  isModalVisible,
  setIsModalVisible,
  isAdding,
  setIsAdding,
  isEditing,
  setIsEditing,
  editData,
  setEditData,
  fetchData,
}) => {
  const user = useSelector((state) => state.user.user || {});
  const addresses = user.addresses || [];
  const [options, setOptions] = useState([]);
  const { callApi, error } = useCallApi();
  const [form] = Form.useForm();
  const [location, setLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
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

  const handleOk = () => {
    setIsModalVisible(false);
    setIsAdding(false);
    setIsEditing(false);
  };

  const handleCancel = handleOk;

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
    form.setFieldValue("address", editData?.customerInfoAddressName);
    form.setFieldValue("isPrimary", editData?.isCurrentUsed);
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
          lat: editData?.lat || null,
          lng: editData?.lng || null,
        });
      } else {
        response = await callApi(`${AccountApi.CREATE_ADDRESS}`, "POST", {
          customerInfoAddressName: form.getFieldValue("address"),
          isCurrentUsed: form.getFieldValue("isPrimary"),
          accountId: user.id,
          lat: selectedAddress?.lat || null,
          lng: selectedAddress?.lng || null,
        });
      }

      if (response.isSuccess) {
        toast.success("Thêm địa chỉ thành công!");
        setIsAdding(false);
        setIsModalVisible(false);
        fetchData();
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
            className="bg-gray-500"
            onClick={() => {
              setIsAdding(false);
              setIsEditing(false);
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
          title: "Địa chỉ",
          dataIndex: "address",
          key: "address",
        },
        {
          title: "Địa chỉ chính",
          dataIndex: "addressPrimary",
          key: "addressPrimary",
          render: (_, record) => <Switch checked={record.isCurrentUsed} />,
        },
        {
          title: "Hành động",
          key: "action",
          render: (text, record) => (
            <div className="flex gap-2">
              <IconButton
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setEditData(record);
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
                    "PUT"
                  );
                  if (response.isSuccess) {
                    toast.success("Xóa địa chỉ thành công!");
                    fetchData();
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
        <StyledTable
          columns={columns}
          dataSource={addresses}
          rowKey="customerInfoAddressId"
          pagination={false}
        />
      );
    }
  };

  return (
    <div>
      <Modal
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg"
        width={750}
      >
        <Typography variant="h4" className="text-center text-red-800 mb-4">
          ĐỊA CHỈ GIAO HÀNG
        </Typography>
        {isAdding || isEditing ? (
          renderAddressForm()
        ) : (
          <>
            {renderAddressList()}
            <Button
              className="mt-4 flex items-center gap-2 bg-red-800"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={16} />
              Tạo thêm địa chỉ
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AddressModal;

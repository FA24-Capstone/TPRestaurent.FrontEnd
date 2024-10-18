import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Upload, message, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import useCallApi from "../../../api/useCallApi";
import { AccountApi } from "../../../api/endpoint";
import { showError } from "../../../util/Utility";
import { login } from "../../../redux/features/authSlice";
import { set } from "lodash";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const UpdateProfile = () => {
  const [form] = Form.useForm();
  const user = useSelector((state) => state.user.user || {});
  const { callApi, error, loading } = useCallApi();
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null); // State to store the file object
  const [isDisabled, setIsDisabled] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("accountId", user.id);
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("dob", values.dob.format("DD/MM/YYYY"));
    if (file) {
      formData.append("Image", file);
    }
    const response = await callApi(
      `${AccountApi.UPDATE_ACCOUNT}`,
      "PUT",
      formData
    );
    if (response.isSuccess) {
      message.success("Profile updated successfully");
      const fetchUser = await callApi(
        `${AccountApi.GET_BY_PHONE}?phoneNumber=${user.phoneNumber}`,
        "GET"
      );
      if (fetchUser.isSuccess) {
        dispatch(login(fetchUser.result));
        if (user.isManuallyCreated) {
          message.warning(
            "Bạn cần cập nhật địa chỉ mua hàng tại đây, chúng tôi sẽ chuyển bạn trong vòng 3s tiếp theo"
          );
          setTimeout(() => {
            navigate("/user/address");
          }, 3000);
        }
      }
    } else {
      showError(error);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const handleAvatarChange = (info) => {
    getBase64(info.file.originFileObj, (imageUrl) => setPreviewImage(imageUrl));
    setFile(info.file.originFileObj);
  };

  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phoneNumber,
      dob: moment("2002-12-03"),
      gender: user.gender,
      email: user.email,
    });
    setPreviewImage(user.avatar);
  }, [form, user]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-2/3">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-6"
              >
                <Form.Item name="phone" label="Điện thoại">
                  <Input
                    prefix={"+84"}
                    disabled
                    className="w-full rounded-md"
                  />
                </Form.Item>
                <Form.Item name="email" label="Email">
                  <Input className="w-full rounded-md" />
                </Form.Item>
                {isDisabled && (
                  <Button
                    className="bg-red-900 text-white"
                    onClick={() => setIsDisabled(!isDisabled)}
                  >
                    Xác nhận email
                  </Button>
                )}

                <div className="lg:flex flex-1 gap-1">
                  <Form.Item
                    name="lastName"
                    label="Họ"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ của bạn!",
                      },
                    ]}
                  >
                    <Input
                      disabled={isDisabled}
                      className="w-full rounded-md"
                    />
                  </Form.Item>
                  <Form.Item
                    name="firstName"
                    label="Tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên của bạn!" },
                    ]}
                  >
                    <Input
                      disabled={isDisabled}
                      className="w-full rounded-md"
                    />
                  </Form.Item>
                </div>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Select disabled={isDisabled} className="w-full rounded-md">
                    <Option value={true}>Nam</Option>
                    <Option value={false}>Nữ</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="dob" label="Ngày sinh">
                  <DatePicker format={"DD/MM/YYYY"} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full bg-red-800 hover:bg-red-600 rounded-md"
                    loading={loading}
                  >
                    Cập nhật thông tin
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="w-full lg:w-1/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ảnh đại diện
              </h2>
              <Form.Item
                name="avatar"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isJpgOrPng =
                      file.type === "image/jpeg" || file.type === "image/png";
                    if (!isJpgOrPng) {
                      message.error("Hệ thống chỉ nhận file JPG/PNG !");
                    }
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      message.error("Hệ thống chỉ cho phép tải ảnh dưới 2MB!");
                    }
                    return isJpgOrPng && isLt2M;
                  }}
                  onChange={handleAvatarChange}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="avatar"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-200 transition duration-300">
                      <UploadOutlined className="text-4xl text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600">Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;

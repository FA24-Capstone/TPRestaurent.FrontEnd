import {
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Select,
  Checkbox,
} from "antd";
import { UserOutlined, MailOutlined, TeamOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import OtpConfirmModal from "../../pages/login/OtpConfirmModal";
import ModalReservationWithDish from "./modal/ModalReservationWithDish";
import reservationImage from "../../assets/imgs/reservation.png";
import moment from "moment";
import {
  formatPhoneNumber,
  isEmptyObject,
  showError,
} from "../../util/Utility";
import { useSelector } from "react-redux";
import useCallApi from "../../api/useCallApi";
import { AccountApi, OrderApi } from "../../api/endpoint";
import ModalPolicy from "../policy/PolicyModal";
import ModalReservationWithoutDish from "./modal/ModalReservationWithoutDish";
import dayjs from "dayjs";
const { TextArea } = Input;

const Reservation = () => {
  const [form] = Form.useForm();
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [isReservationModalVisible, setIsReservationModalVisible] =
    useState(false);
  const [isValid, setIsValid] = useState(false);
  const [information, setInformation] = useState({});
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [endTimeSlots, setEndTimeSlots] = useState([]);
  const [isValidatePhone, setIsValidatePhone] = useState(false);
  const user = useSelector((state) => state.user.user || {});
  const { loading, callApi, error } = useCallApi();
  const [show, setShow] = useState(false);
  const [showModalWithoutDish, setShowModalWithoutDish] = useState(false);

  const handleCloseModalWithoutDish = () => {
    setShowModalWithoutDish(false);
  };
  const handleClose = () => {
    setShow(false);
  };
  const initData = () => {
    if (!isEmptyObject(user)) {
      form.setFieldValue("firstName", user.firstName);
      form.setFieldValue("lastName", user.lastName);
      form.setFieldValue("email", user.email);
      form.setFieldValue("phone", user.phoneNumber);
      form.setFieldValue("isPrivate", false);
      form.setFieldValue("numberOfPeople", 1);
      form.setFieldValue("note", "");
      form.setFieldValue("date", dayjs(momentDate, "DD/MM/YYYY"));
    }
  };
  useEffect(() => {
    initData();
    const now = moment();
    const roundedStartTime = now
      .clone()
      .minute(Math.ceil(now.minute() / 30) * 30)
      .second(0);
    const initialStartTime = roundedStartTime.isBefore(now)
      ? roundedStartTime.add(30, "minutes")
      : roundedStartTime;
    const initialEndTime = initialStartTime
      .clone()
      .add(1, "hour")
      .format("HH:mm");
    form.setFieldsValue({
      startTime: initialStartTime.format("HH:mm"),
      endTime: initialEndTime,
    });
    setSelectedEndTime(initialEndTime);
    setEndTimeSlots(generateEndTimeSlots(initialStartTime));
  }, [form]);

  const handlePhoneChange = (e) => {
    const cleanedPhone = e.target.value.replace(/\s+/g, "");
    form.setFieldsValue({ phone: cleanedPhone });
    if (form.getFieldValue("phone") && isValidatePhone) {
      setIsValid(false);
    }
  };

  const handlePhoneBlur = async (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    form.setFieldsValue({ phone: formattedPhone });
  };

  const onChoosePolicy = () => {
    const startTime = form.getFieldValue("startTime");
    const endTime = form.getFieldValue("endTime");
    const date = form.getFieldValue("date");

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    let combinedStartTime = moment(date)
      .hour(startHour)
      .minute(startMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    let combinedEndTime;
    if (endHour === 0) {
      combinedEndTime = moment(date)
        .day(1)
        .hour(endHour)
        .minute(endMinute)
        .format("YYYY-MM-DDTHH:mm:ss");
    }
    combinedEndTime = moment(date)
      .hour(endHour)
      .minute(endMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    setInformation({
      ...information,
      numberOfPeople: form.getFieldValue("numberOfPeople"),
      startTime: combinedStartTime,
      endTime: combinedEndTime,
      note: form.getFieldValue("note"),
      isPrivate: form.getFieldValue("isPrivate"),
    });
    setShow(true);
  };
  const onChoose = (data) => {
    if (data === 1) {
      setShowModalWithoutDish(true);
    } else {
      onFinish();
    }
  };

  const onFinish = async () => {
    const date = form.getFieldValue("date");
    const startTime = form.getFieldValue("startTime");
    const endTime = form.getFieldValue("endTime");

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const combinedStartTime = moment(date)
      .hour(startHour)
      .minute(startMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    let combinedEndTime;
    if (endHour === 0) {
      combinedEndTime = moment(date)
        .day(1)
        .hour(endHour)
        .minute(endMinute)
        .format("YYYY-MM-DDTHH:mm:ss");
    }
    combinedEndTime = moment(date)
      .hour(endHour)
      .minute(endMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    debugger;
    const responseSuggessTable = await callApi(
      `${OrderApi.SUGGEST_TABLE}`,
      "POST",
      {
        startTime: combinedStartTime,
        endTime: combinedEndTime,
        numOfPeople: Number(form.getFieldValue("numberOfPeople")),
        isPrivate: form.getFieldValue("isPrivate"),
      }
    );

    if (responseSuggessTable?.isSuccess) {
      if (responseSuggessTable?.result?.length > 0) {
        setInformation({
          ...information,
          startTime: combinedStartTime,
          endTime: combinedEndTime,
          numberOfPeople: form.getFieldValue("numberOfPeople"),
          note: form.getFieldValue("note"),
          isPrivate: form.getFieldValue("isPrivate"),
        });
        message.success("Hệ thống chúng tôi đã tìm ra bàn phù hợp với bạn");
        setIsReservationModalVisible(true);
      }
    } else {
      showError(error);
    }
  };

  const handleSuccess = async (isSuccess) => {
    if (isSuccess) {
      message.success("Xác thực thành công");
      setIsValidatePhone(true);
      setIsValid(true);
    } else {
      message.error("Xác thực thất bại");
    }
  };

  const handleOpenOtp = () => {
    setIsOtpModalVisible(true);
  };
  const handleCloseOtp = () => {
    setIsOtpModalVisible(false);
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };

  const generateTimeSlots = () => {
    const times = [];
    const start = moment().startOf("day").hour(6); // Start at 10:00
    const end = moment().startOf("day").hour(23); // End at 22:00
    while (start <= end) {
      times.push(start.format("HH:mm"));
      start.add(30, "minutes");
    }
    return times;
  };

  const generateEndTimeSlots = (startTime) => {
    const times = generateTimeSlots();
    const startMoment = moment(startTime, "HH:mm");
    return times.filter((time) => moment(time, "HH:mm").isAfter(startMoment));
  };

  const timeSlots = generateTimeSlots();

  const handleStartTimeChange = (value) => {
    const newEndTime = moment(value, "HH:mm").add(1, "hour").format("HH:mm");
    setSelectedEndTime(newEndTime);
    form.setFieldsValue({ endTime: newEndTime });
    setEndTimeSlots(generateEndTimeSlots(value));
  };

  const filteredTimeSlots = timeSlots.filter((time) =>
    moment(time, "HH:mm").isAfter(moment())
  );
  const handleValidatePhone = async () => {
    const data = await callApi(
      `${AccountApi.GET_BY_PHONE}?phoneNumber=${form
        .getFieldValue("phone")
        .replace(/\s+/g, "")}`,
      "GET"
    );
    if (data.isSuccess) {
      if (!data.result?.isVerified) {
        setIsOtpModalVisible(true);
      }
      setInformation({
        firstName: data?.result?.firstName,
        lastName: data?.result?.lastName,
        phoneNumber: data?.result?.phoneNumber,
        email: form.getFieldValue("email"),
        note: form.getFieldValue("note"),
        customerId: data?.result?.id,
        isPrivate: form.getFieldValue("isPrivate"),
      });
      setIsValid(true);
      setIsValidatePhone(true);
    } else {
      const responseCreate = await callApi(
        `${AccountApi.CREATE_ACCOUNT}`,
        "POST",
        {
          email: form.getFieldValue("email"),
          firstName: form.getFieldValue("firstName"),
          lastName: form.getFieldValue("lastName"),
          gender: true,
          phoneNumber: form.getFieldValue("phone").replace(/\s+/g, ""),
        }
      );
      if (responseCreate?.isSuccess) {
        message.success("Tài khoản của bạn đã được tạo thành công.");
        setIsOtpModalVisible(true);
      } else {
        showError(error);
      }
    }
  };
  if (isReservationModalVisible) {
    return (
      <>
        <ModalReservationWithDish
          visible={isReservationModalVisible}
          onCancel={() => setIsReservationModalVisible(false)}
          information={information}
          handleCloseOtp={handleCloseOtp}
          handleOpenOtp={handleOpenOtp}
          isOtpSuccess={isOtpSuccess}
        />
        <OtpConfirmModal
          visible={isOtpModalVisible}
          onClose={() => setIsOtpModalVisible(false)}
          resOtp={null}
          phoneNumber={form.getFieldValue("phone")?.replace(/\s+/g, "")}
          otpType={1}
          handleSuccess={handleSuccess}
        />
      </>
    );
  }
  const momentDate = moment().format("DD/MM/YYYY");
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 rounded-2xl shadow-2xl">
      <h1 className="text-2xl font-bold uppercase mb-6 text-center">Đặt bàn</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="hidden md:block">
          <img
            src={reservationImage}
            alt="Restaurant interior"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#A31927] mb-4">
            THÔNG TIN KHÁCH HÀNG
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đặt bàn trước giờ dùng ít nhất 1 giờ
          </p>
          <Form
            layout="vertical"
            form={form}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onChoosePolicy}
          >
            <div className="flex justify-between">
              <Form.Item
                label="Họ"
                name="lastName"
                className="w-1/2"
                rules={[{ required: true, message: "Vui lòng nhập họ" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ" />
              </Form.Item>
              <Form.Item
                label="Tên"
                name="firstName"
                className="w-1/2 mx-2"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Tên" />
              </Form.Item>
            </div>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input
                prefix={`+84`}
                placeholder="Số điện thoại"
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
              />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            {!isValid && (
              <Button
                onClick={handleValidatePhone}
                className="bg-red-800 text-white mb-4"
                loading={loading}
              >
                Xác thực số điện thoại{" "}
              </Button>
            )}

            <Form.Item
              label="Số lượng người"
              name="numberOfPeople"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng người" },
              ]}
            >
              <Input
                prefix={<TeamOutlined />}
                type="number"
                min={1}
                placeholder="Số lượng người"
                disabled={!isValidatePhone}
              />
            </Form.Item>
            <div className="flex flex-col md:flex-row">
              <Form.Item
                label="Ngày"
                name="date"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  className="w-full"
                  format={"DD/MM/YYYY"}
                  disabledDate={disabledDate}
                  placeholder="Chọn ngày"
                  disabled={!isValidatePhone}
                  allowClear
                  defaultValue={dayjs(momentDate, "DD/MM/YYYY")}
                />
              </Form.Item>
              <Form.Item
                label="Giờ bắt đầu"
                name="startTime"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ bắt đầu" },
                ]}
                className="md:mx-4"
              >
                <Select
                  className="w-full"
                  placeholder="Chọn giờ bắt đầu"
                  onChange={handleStartTimeChange}
                  disabled={!isValidatePhone}
                >
                  {filteredTimeSlots.map((time) => (
                    <Select.Option key={time} value={time}>
                      {time}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Giờ kết thúc"
                name="endTime"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ kết thúc" },
                ]}
              >
                <Select
                  className="w-full"
                  placeholder="Chọn giờ kết thúc"
                  value={selectedEndTime}
                  disabled={!isValidatePhone}
                >
                  {endTimeSlots.map((time) => (
                    <Select.Option key={time} value={time}>
                      {time}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <Form.Item name="isPrivate" valuePropName="checked">
              <Checkbox disabled={!isValidatePhone} defaultChecked={false}>
                Đặt bàn riêng tư
              </Checkbox>
            </Form.Item>
            <Form.Item name="note" label="Ghi chú">
              <TextArea
                rows={4}
                placeholder="Ghi chú"
                disabled={!isValidatePhone}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-[#A31927] hover:bg-[#8B1621] text-white hover:text-white"
                disabled={!isValidatePhone}
                loading={loading}
              >
                Đặt bàn
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <ModalPolicy handleClose={handleClose} show={show} setChoose={onChoose} />
      <ModalReservationWithoutDish
        handleClose={handleCloseModalWithoutDish}
        show={showModalWithoutDish}
        information={information}
      />
      <OtpConfirmModal
        visible={isOtpModalVisible}
        onClose={() => setIsOtpModalVisible(false)}
        resOtp={null}
        phoneNumber={form.getFieldValue("phone")?.replace(/\s+/g, "")}
        otpType={1}
        handleSuccess={handleSuccess}
      />
    </div>
  );
};

export default Reservation;

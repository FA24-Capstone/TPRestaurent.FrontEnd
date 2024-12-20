import {
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Select,
  Checkbox,
  Modal,
} from "antd";
import { UserOutlined, MailOutlined, TeamOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import reservationImage from "../../../assets/imgs/reservation.png";
import moment from "moment";
import {
  formatPhoneNumber,
  isEmptyObject,
  showError,
} from "../../../util/Utility";
import { useSelector } from "react-redux";
import useCallApi from "../../../api/useCallApi";
import {
  AccountApi,
  ConfigurationApi,
  OrderApi,
  TableApi,
} from "../../../api/endpoint";
import ModalPolicy from "../../policy/PolicyModal";
import dayjs from "dayjs";
import ModalReservationWithDish from "../modal/ModalReservationWithDish";
import ModalReservationWithoutDish from "../modal/ModalReservationWithoutDish";
import OtpConfirmModal from "../../../pages/login/OtpConfirmModal";
const { TextArea } = Input;

const Reservation = () => {
  const [form] = Form.useForm();
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [isReservationModalVisible, setIsReservationModalVisible] =
    useState(false);
  const [isValid, setIsValid] = useState(false);
  const [information, setInformation] = useState({});
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);

  const [endTimeSlots, setEndTimeSlots] = useState([]);
  const [isValidatePhone, setIsValidatePhone] = useState(false);
  const user = useSelector((state) => state.user.user || {});
  const { loading, callApi, error } = useCallApi();
  const [show, setShow] = useState(false);
  const [showModalWithoutDish, setShowModalWithoutDish] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeBeforeReservation, setTimeBeforeReservation] = useState(1);
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
      setInformation({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        note: "",
        isPrivate: false,
        customerId: user.id,
      });
    }
  };

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
    const numOfPeople = form.getFieldValue("numberOfPeople");
    if (numOfPeople < 1 || numOfPeople > 50) {
      return message.error("Số lượng người không hợp lệ");
    }
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    let combinedStartTime = moment()
      .set("date", form.getFieldValue("date").date())
      .hour(startHour)
      .minute(startMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    let combinedEndTime;
    if (endHour === 0) {
      combinedEndTime = moment()
        .set("date", form.getFieldValue("date").date())
        .day(1)
        .hour(endHour)
        .minute(endMinute)
        .format("YYYY-MM-DDTHH:mm:ss");
    }
    combinedEndTime = moment()
      .set("date", form.getFieldValue("date").date())
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
    const combinedStartTime = moment()
      .set("date", form.getFieldValue("date").date())
      .hour(startHour)
      .minute(startMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    let combinedEndTime;
    if (endHour === 0) {
      combinedEndTime = moment()
        .set("date", form.getFieldValue("date").date())

        .hour(endHour)
        .minute(endMinute)
        .format("YYYY-MM-DDTHH:mm:ss");
    }
    combinedEndTime = moment()
      .set("date", form.getFieldValue("date").date())
      .hour(endHour)
      .minute(endMinute)
      .format("YYYY-MM-DDTHH:mm:ss");
    const responseSuggessTable = await callApi(
      `${TableApi.FIND_TABLE}`,
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
      } else if (
        responseSuggessTable?.result?.length > 0 &&
        responseSuggessTable?.result?.messages > 0
      ) {
        Modal.confirm({
          title: "Xác nhận",
          content: responseSuggessTable?.messages.join("\n"),
          onOk: async () => {
            setInformation({
              ...information,
              startTime: combinedStartTime,
              endTime: combinedEndTime,
              numberOfPeople: form.getFieldValue("numberOfPeople"),
              note: form.getFieldValue("note"),
              isPrivate: form.getFieldValue("isPrivate"),
            });
          },
          onCancel: async () => {
            close();
          },
        });
      } else if (
        responseSuggessTable?.result?.length > 0 &&
        responseSuggessTable?.result == null
      ) {
        showError(responseSuggessTable.messages);
      }
    } else {
      showError(responseSuggessTable.messages);
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
  console.log(timeSlots);
  const generateTimeSlots = async () => {
    try {
      // Fetch opening time
      const openTimeResponse = await callApi(
        `${ConfigurationApi.GET_CONFIG_BY_NAME}/OPEN_TIME`,
        "GET"
      );

      // Fetch closing time
      const closeTimeResponse = await callApi(
        `${ConfigurationApi.GET_CONFIG_BY_NAME}/CLOSED_TIME`,
        "GET"
      );

      if (!openTimeResponse?.isSuccess || !closeTimeResponse?.isSuccess) {
        showError(openTimeResponse.messages || closeTimeResponse.messages);
        return [];
      }

      // Convert API values to hours and minutes
      const parseTimeValue = (timeValue) => {
        const hours = Math.floor(parseFloat(timeValue));
        const minutes = (parseFloat(timeValue) % 1) * 60;
        return { hours, minutes };
      };

      const startTime = parseTimeValue(openTimeResponse.result.currentValue);
      const endTime = parseTimeValue(closeTimeResponse.result.currentValue);

      const times = [];
      let start;
      let end;
      let selectedDate = form.getFieldValue("date");
      selectedDate = moment()
        .set("date", selectedDate.date())
        .set("month", selectedDate.month())
        .set("year", selectedDate.year());

      if (moment().format("DD/MM/YYYY") === selectedDate.format("DD/MM/YYYY")) {
        start = moment()
          .set("hour", startTime.hours)
          .set("minute", startTime.minutes);
        end = moment()
          .set("hour", endTime.hours)
          .set("minute", endTime.minutes);
      } else {
        start = moment()
          .set("date", form.getFieldValue("date").date())
          .set("month", form.getFieldValue("date").month() + 1)
          .set("year", form.getFieldValue("date").year())
          .set("hour", startTime.hours)
          .set("minute", startTime.minutes);

        end = moment()
          .set("date", form.getFieldValue("date").date())
          .set("month", form.getFieldValue("date").month() + 1)
          .set("year", form.getFieldValue("date").year())
          .set("hour", endTime.hours)
          .set("minute", endTime.minutes);
      }

      // Generate time slots
      while (start <= end) {
        times.push(start.format("HH:mm"));
        start.add(30, "minutes");
      }

      if (
        moment().format("DD/MM/YYYY") === selectedDate?.format("DD/MM/YYYY")
      ) {
        return times.filter((time) => moment(time, "HH:mm").isAfter(moment()));
      }

      return times;
    } catch (error) {
      console.error("Error generating time slots:", error);
      showError("Failed to generate time slots");
      return [];
    }
  };

  const generateEndTimeSlots = (startTime) => {
    const startMoment = moment(startTime, "HH:mm");
    let arr = timeSlots.filter((time) =>
      moment(time, "HH:mm").isAfter(startMoment)
    );
    const shift = arr.shift();
    return arr.filter((item) => item !== shift);
  };

  const handleStartTimeChange = (value) => {
    generateTimeSlots().then((slots) => {
      setTimeSlots(slots);
      const newEndTime = moment(value, "HH:mm").add(1, "hour").format("HH:mm");
      setSelectedEndTime(newEndTime);
      form.setFieldsValue({ startTime: value });
      form.setFieldsValue({ endTime: newEndTime });
      setEndTimeSlots(generateEndTimeSlots(value));
    });
  };
  useEffect(() => {
    handleStartTimeChange(timeSlots[0]);
  }, [timeSlots.length]);

  const handleValidatePhone = async () => {
    const data = await callApi(
      `${AccountApi.IS_EXIST_ACCOUNT}/${form
        .getFieldValue("phone")
        .replace(/\s+/g, "")}`,
      "GET"
    );
    if (data.isSuccess) {
      if (data.result == null) {
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
          message.success("Vui lòng đăng nhập vào hệ thống để đặt bàn.");
          setTimeout(() => {
            window.location.href =
              "/login?phoneNumber=" +
              form.getFieldValue("phone").replace(/\s+/g, "");
          }, 2000);
        } else {
          showError(response.messages);
        }
        return;
      } else {
        message.success(
          "Số điện thoại đã tồn tại trong hệ thống. Bạn vui lòng đăng nhập để đặt bàn."
        );
        setTimeout(() => {
          window.location.href =
            "/login?phoneNumber=" +
            form.getFieldValue("phone").replace(/\s+/g, "");
        }, 3000);
      }
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
      showError(data.messages);
    }
  };

  const fetchConfig = async () => {
    const response = await callApi(
      `${ConfigurationApi.GET_CONFIG_BY_NAME}/TIME_BEFORE_RESERVATION`,
      "GET"
    );
    if (response.isSuccess) {
      setTimeBeforeReservation(response.result.currentValue);
    } else {
      showError(response.messages);
    }
  };

  useEffect(() => {
    if (!isEmptyObject(user) && user.isVerified) {
      setIsValidatePhone(true);
      setIsValid(true);
    }
    initData();
    fetchConfig();
  }, []);

  useEffect(() => {
    const now = moment();
    const selectedDate = form.getFieldValue("date");
    let roundedStartTime;
    let initialStartTime;
    let initialEndTime;
    if (selectedDate?.format("DD/MM/YYYY") !== now.format("DD/MM/YYYY")) {
      if (timeSlots.length > 0) {
        form.setFieldsValue({ startTime: timeSlots[0] });
      }
    } else {
      console.log(moment().format("HH:mm"));
      if (!timeSlots.includes(moment().format("HH:mm"))) {
        form.setFieldsValue({ startTime: "", endTime: "" });
        return;
      }

      roundedStartTime = now
        .clone()
        .minute(Math.ceil(now.minute() / 30) * 30)
        .second(0);
      initialStartTime = roundedStartTime.isBefore(now)
        ? roundedStartTime.add(30, "minutes")
        : roundedStartTime;
      initialEndTime = initialStartTime.clone().add(1, "hour").format("HH:mm");
      form.setFieldsValue({
        startTime: initialStartTime.format("HH:mm"),
        endTime: initialEndTime,
      });
    }
    setSelectedEndTime(initialEndTime);
    setSelectedStartTime(initialStartTime);
    generateTimeSlots().then((slots) => {
      setTimeSlots(slots);
    });
  }, [form.getFieldValue("date")]);

  const momentDate = moment().format("DD/MM/YYYY");

  if (isReservationModalVisible) {
    return (
      <>
        <ModalReservationWithDish
          visible={isReservationModalVisible}
          onCancel={() => setIsReservationModalVisible(false)}
          information={information}
          handleCloseOtp={handleCloseOtp}
          handleOpenOtp={handleOpenOtp}
        />
        <OtpConfirmModal
          visible={isOtpModalVisible}
          onClose={() => setIsOtpModalVisible(false)}
          resOtp={null}
          phoneNumber={form.getFieldValue("phone")?.replace(/\s+/g, "")}
          otpType={1}
          resend={handleValidatePhone}
          // handleSuccess={handleSuccess}
        />
      </>
    );
  }

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
            Vui lòng đặt bàn trước giờ dùng ít nhất {timeBeforeReservation} giờ
          </p>
          <Form
            layout="vertical"
            form={form}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onChoosePolicy}
          >
            {isEmptyObject(user) && (
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
            )}

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  pattern: /^[1-9]\d{8,9}$/,
                  message: "Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.",
                },
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input
                prefix={`+84`}
                placeholder="Số điện thoại"
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                disabled={isValidatePhone}
              />
            </Form.Item>
            {isEmptyObject(user) && (
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            )}

            {isEmptyObject(user) && (
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
                  onChange={(date) => {
                    form.setFieldsValue({ date });
                    generateTimeSlots();
                  }}
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
                  defaultValue={selectedEndTime}
                >
                  {timeSlots?.length > 0 &&
                    timeSlots?.map((time) => (
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
                  {endTimeSlots &&
                    endTimeSlots.length > 0 &&
                    endTimeSlots.map((time) => (
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
        // handleSuccess={handleSuccess}
      />
    </div>
  );
};

export default Reservation;

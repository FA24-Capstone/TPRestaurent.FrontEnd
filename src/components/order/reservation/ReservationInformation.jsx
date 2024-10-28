import { Card, CardBody, Typography } from "@material-tailwind/react";
import moment from "moment/moment";

const ReservationInformation = ({ reservation }) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    note,
    startTime,
    endTime,
    numberOfPeople,
  } = reservation;
  const startMoment = moment(startTime);
  const endMoment = moment(endTime);
  const isSameDay = startMoment.isSame(endMoment, "day");

  return (
    <div className="w-full">
      <Card className="shadow-none border-none">
        <CardBody>
          <Typography variant="h5" className="mb-4 text-center">
            Thông tin đặt bàn
          </Typography>
          <div className="  gap-4">
            <div className="grid grid-cols-2 items-center">
              <Typography variant="h6">Họ và tên</Typography>
              <Typography variant="body1">
                {firstName} {lastName}
              </Typography>
            </div>
            <div className="grid grid-cols-2 items-center ">
              <Typography variant="h6">Số điện thoại</Typography>
              <Typography variant="body1">0{phoneNumber}</Typography>
            </div>
            <div className="grid grid-cols-2 items-center">
              <Typography variant="h6">Email</Typography>
              <Typography className="break-words">{email}</Typography>
            </div>
            <div className="grid grid-cols-2 items-center">
              <Typography variant="h6">Số khách</Typography>
              <Typography variant="body1">{numberOfPeople} khách</Typography>
            </div>
            <div className="grid grid-cols-2 items-center text-wrap col-span-2">
              <Typography variant="h6">Thời gian dùng bữa</Typography>
              <Typography variant="body1">
                {isSameDay
                  ? `${startMoment.format(
                      "DD/MM/YYYY HH:mm"
                    )} - ${endMoment.format("HH:mm")}`
                  : `${startMoment.format(
                      "DD/MM/YYYY HH:mm"
                    )} - ${endMoment.format("DD/MM/YYYY HH:mm")}`}
              </Typography>
            </div>
            <div className="grid grid-cols-2 items-center col-span-2">
              <Typography variant="h6">Ghi chú</Typography>
              <Typography variant="body1">{note}</Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ReservationInformation;

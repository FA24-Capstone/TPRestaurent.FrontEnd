import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { formatDate, formatPrice } from "../../util/Utility";
import { NavLink } from "react-router-dom";

const ComboCard = ({ combo }) => {
  return (
    <Card className=" m-4 ">
      <CardHeader color="blue" className="relative h-56">
        <img
          src={combo?.image}
          alt={combo?.name}
          className="h-full w-full object-cover"
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" className="mb-2">
          {combo?.name}
        </Typography>
        <Typography>{combo?.description}</Typography>
        <Typography className="mt-4">
          <span className="font-bold">Giá:</span> {formatPrice(combo?.price)}
        </Typography>
        {combo?.discount > 0 && (
          <Typography className="mt-2 text-red-500">
            <span className="font-bold">Giảm:</span> {combo?.discount}%
          </Typography>
        )}
        <Typography className="mt-4">
          <span className="font-bold">Ngày bắt đầu:</span>{" "}
          {formatDate(combo?.startDate)}
        </Typography>
        <Typography className="mt-2">
          <span className="font-bold">Ngày kết thúc:</span>{" "}
          {formatDate(combo?.endDate)}
        </Typography>
      </CardBody>
      <CardFooter className="pt-0 mt-auto">
        <div className="flex justify-center ">
          <NavLink
            className="bg-red-700 text-white py-2 px-4 rounded-md "
            to={`/combo/${combo?.comboId}`}
          >
            Đặt ngay
          </NavLink>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ComboCard;
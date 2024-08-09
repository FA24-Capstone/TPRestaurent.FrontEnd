import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Avatar,
} from "@material-tailwind/react";
import { formatPrice } from "../../util/Utility";

const DishComboCard = ({ dishCombo }) => {
  return (
    <Card className="w-full max-w-[48rem] shadow-lg">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Combo bao gồm
        </Typography>
        <List>
          {dishCombo.map((item) => (
            <ListItem key={item.dishComboId} className="py-3">
              <ListItemPrefix>
                <Avatar
                  variant="circular"
                  alt={item.dishSizeDetail?.dish?.name}
                  src={item.dishSizeDetail?.dish?.image}
                />
              </ListItemPrefix>
              <div className="flex flex-col">
                <Typography variant="h6" color="blue-gray">
                  {item.dishSizeDetail?.dish?.name}
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal"
                >
                  {item.dishSizeDetail?.dish?.description}
                </Typography>
                <div className="flex justify-between mt-2">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    Số lượng: {item.quantity}
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium md:mx-2"
                  >
                    Giá: {formatPrice(item.dishSizeDetail?.price)}
                  </Typography>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
        <p className="mt-4 text-xl text-red-800  font-bold mx-2">
          Giá bán lẻ tổng cộng: &nbsp;
          {dishCombo?.length > 0 &&
            dishCombo
              .reduce(
                (total, item) =>
                  total + item.dishSizeDetail?.price * item.quantity,
                0
              )
              .toLocaleString()}{" "}
          VND
        </p>
      </CardBody>
    </Card>
  );
};

export default DishComboCard;

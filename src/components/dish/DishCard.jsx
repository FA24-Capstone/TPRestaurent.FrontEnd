import {
  CardBody,
  CardFooter,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import { Button, Card, message } from "antd";
import React from "react";

function DishCard({
  handleAddToCart,
  dish,
  handleSizeClick,
  getCurrentPrice,
  formatPrice,
  selectedSizes,
}) {
  return (
    <div>
      <Card
        key={dish?.dish?.dishId}
        className="mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <CardHeader color="blue-gray" className="relative h-56">
          <img
            src={dish?.dish?.image}
            alt={dish?.dish?.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-red-800 text-white px-2 py-1 rounded-full text-xs">
            {dish.dish?.dishItemType?.name}
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <Typography
            variant="h5"
            className="mb-2 text-center text-red-800 font-bold"
          >
            {dish?.dish?.name}
          </Typography>
          <Typography className="text-gray-600 text-sm text-center">
            {dish?.dish?.description}
          </Typography>
        </CardBody>
        <CardFooter className="pt-0 pb-4">
          <div className="flex justify-center space-x-2 mb-3">
            {dish?.dishSizeDetails?.map((size) => (
              <button
                key={size.dishSizeDetailId}
                onClick={() => handleSizeClick(dish.dish, size)}
                className={`px-2 py-1 rounded-md border ${
                  selectedSizes?.size?.dishSizeDetailId ===
                  size.dishSizeDetailId
                    ? "bg-red-800 text-white"
                    : "bg-white text-red-800"
                } font-semibold transition-colors duration-300`}
              >
                {size.dishSize?.vietnameseName || size.dishSize?.name}
              </button>
            ))}
          </div>
          <Typography className="text-center text-lg font-semibold mb-3">
            Giá:{" "}
            <span className="text-red-800">
              {getCurrentPrice(dish.dish.dishId) === 0
                ? formatPrice(dish?.dishSizeDetails?.[0].price)
                : formatPrice(getCurrentPrice(dish.dish.dishId))}
            </span>
          </Typography>
          <Button
            onClick={() => {
              handleAddToCart(
                dish.dish,
                selectedSizes?.size || dish.dishSizeDetails[0]
              );
              message.success("Đã thêm vào giỏ hàng");
            }}
            className="w-full mx-auto bg-red-800 text-white"
          >
            Chọn
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default DishCard;

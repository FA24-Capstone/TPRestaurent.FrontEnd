import { useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { formatDate, formatPrice } from "../../../util/Utility";
import { useDispatch } from "react-redux";
import { addCombo } from "../../../redux/features/cartSlice";
import { message } from "antd";
import { CategoryTag } from "../../../components/badge/RestaurantCategoryBadges";

const ComboDetail = ({ comboData, handleBack }) => {
  const { combo, dishCombo, imgs } = comboData;
  const dispatch = useDispatch();

  const [selectedDishes, setSelectedDishes] = useState({});
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [note, setNote] = useState("");

  const handleImageClick = (index) => {
    setMainImageIndex(index);
  };

  const handleDishSelect = (dishOptionSetIndex, dish) => {
    setSelectedDishes((prev) => {
      const currentSelected = prev[dishOptionSetIndex] || [];
      const dishIndex = currentSelected.findIndex(
        (d) => d.dishSizeDetailId === dish.dishSizeDetailId
      );

      let updatedSelected;
      if (dishIndex > -1) {
        // Remove the dish if it's already selected
        updatedSelected = currentSelected.filter(
          (d) => d.dishSizeDetailId !== dish.dishSizeDetailId
        );
      } else {
        // Add the dish if it's not selected
        updatedSelected = [...currentSelected, dish];
      }

      return { ...prev, [dishOptionSetIndex]: updatedSelected };
    });
  };
  const isDishSelected = (dishOptionSetIndex, dishSizeDetailId) => {
    return (
      selectedDishes[dishOptionSetIndex]?.some(
        (d) => d.dishSizeDetailId === dishSizeDetailId
      ) || false
    );
  };

  const handleAddToCart = () => {
    let isValid = true;
    let errorMessage = [];

    dishCombo.forEach((optionSet, index) => {
      const selectedCount = selectedDishes[index]?.length || 0;
      if (selectedCount !== optionSet.numOfChoice) {
        isValid = false;
        errorMessage.push(
          `Bạn cần chọn đúng ${optionSet.numOfChoice} món cho ${optionSet.dishItemType.vietnameseName}.`
        );
      }
    });

    if (isValid) {
      const data = flattenComboData();
      dispatch(addCombo({ combo, selectedDishes: data, note: note }));
      message.success("Đã thêm combo vào giỏ hàng");
    } else {
      message.error(errorMessage.join(`\n`), 5); // Display for 5 seconds
    }
  };
  const flattenComboData = () => {
    return Object.values(selectedDishes).flat();
  };
  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <button onClick={handleBack} className="text-red-700 font-bold text-lg">
        Back
      </button>

      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 relative">
            <img
              src={imgs?.[mainImageIndex]?.path || combo?.image}
              alt={combo?.name}
              className="w-full rounded-lg min-h-[400px] object-cover"
            />

            <div className="mt-4 grid grid-cols-4 gap-2">
              {imgs?.length > 0 &&
                [...imgs, { path: combo?.image }].map((img, index) => (
                  <img
                    key={index}
                    src={img.path}
                    alt={`Hình ảnh ${index}`}
                    className={`w-full h-24 object-cover cursor-pointer ${
                      index === mainImageIndex ? "border-2 border-red-500" : ""
                    }`}
                    onClick={() => handleImageClick(index)}
                  />
                ))}
            </div>
          </div>
          <div className="md:w-1/2 p-10">
            <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center">
              <h5 className="mb-2 font-bold text-2xl uppercase">
                {combo?.name}
              </h5>
              {combo?.category && <CategoryTag category={combo?.category} />}
            </div>
            <p className="mb-2">
              Thời gian<span>: {formatDate(combo?.startDate)}</span>
              <span className="mx-2">- {formatDate(combo?.endDate)}</span>
            </p>
            <hr />
            <p className="mb-4">
              <span className="text-red-700 text-2xl">
                {formatPrice(combo?.price)}
              </span>
            </p>
            <div>
              <p className="text-gray-800 text-lg mb-4">Ghi chú của bạn</p>
              <input
                type="text"
                placeholder="Nhập nội dung của bạn"
                className="w-full p-4 border bg-[#F6F6F7] border-gray-200 rounded-xl"
                onChange={(e) => setNote(e.target.value)}
                value={note}
              />
            </div>
            <Typography variant="h5" color="blue-gray" className="mb-4 mt-6">
              Chọn món ăn của bạn
            </Typography>

            {comboData.dishCombo?.map((dishOptionSet, index) => (
              <div key={index}>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="mb-2 uppercase"
                >
                  {`Món ${dishOptionSet.dishItemType?.vietnameseName} (Chọn
                  ${dishOptionSet.numOfChoice})`}
                </Typography>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {dishOptionSet?.dishCombo?.map((dish, dishIndex) => (
                    <div
                      key={dishIndex}
                      className="relative cursor-pointer"
                      onClick={() => handleDishSelect(index, dish)}
                    >
                      <div className="relative">
                        <img
                          src={dish.dishSizeDetail.dish.image}
                          alt={dish.dishSizeDetail.dish.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {isDishSelected(index, dish.dishSizeDetailId) && (
                          <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center rounded-lg">
                            <CheckCircleIcon className="h-10 w-10 text-white" />
                          </div>
                        )}
                      </div>
                      <Typography variant="small" className="mt-1 text-center">
                        {dish.dishSizeDetail.dish.name}
                      </Typography>
                      <Typography
                        variant="tiny"
                        className="text-center text-gray-600"
                      >
                        Giá: {formatPrice(dish.dishSizeDetail.price)}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button
              className="w-full mt-4 border border-red-500 bg-white text-red-600"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComboDetail;

import { useEffect, useState } from "react";
import TopVoucherDetail from "./top-voucher-detail/TopVoucherDetail";
import Slider from "react-slick";
import useCallApi from "../../api/useCallApi";
import { CouponApi } from "../../api/endpoint";

const TopVoucher = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000, // Auto-scroll every 3 seconds
    pauseOnHover: true, // Pause auto-scroll on hover
  };
  const [coupons, setCoupons] = useState([]);
  const { callApi, error, loading } = useCallApi();
  const fetchData = async () => {
    const response = await callApi(`${CouponApi.GET_ALL}/1/100`, "GET");
    if (response?.isSuccess) {
      setCoupons(response?.result?.items);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold my-5">Khuyến mãi hot</h1>
        <h3 className="text-lg font-bold my-5 text-mainColor">Xem thêm</h3>
      </div>
      <div className="">
        <Slider {...settings}>
          {coupons.length > 0 &&
            coupons.map((coupon, index) => (
              <TopVoucherDetail key={index} coupon={coupon} />
            ))}
        </Slider>
      </div>
      {/* <div className="md:hidden grid grid-cols-1  gap-4">
        {coupons.length > 0 &&
          coupons.map((coupon, index) => (
            <TopVoucherDetail key={index} coupon={coupon} />
          ))}
      </div> */}
    </>
  );
};
export default TopVoucher;

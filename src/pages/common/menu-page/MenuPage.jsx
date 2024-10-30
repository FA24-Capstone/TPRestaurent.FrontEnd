import { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import ComboCard from "../../../components/menu-dish/ComboCard";
import Pagination from "../../../components/pagination/Pagination";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import useCallApi from "../../../api/useCallApi";
import { ComboApi } from "../../../api/endpoint";

const MenuPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [combos, setCombos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // Example total number of pages
  const [isLoading, setIsLoading] = useState(true);
  const { callApi, error, loading } = useCallApi();
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchCombos = async () => {
    try {
      setIsLoading(true);
      let data;
      if (searchQuery != "") {
        data = await callApi(
          `${ComboApi.GET_ALL}/${currentPage}/${totalPages}?keyword=${searchQuery}`,
          "GET"
        );
      } else {
        data = await callApi(
          `${ComboApi.GET_ALL}/${currentPage}/${totalPages}`,
          "GET"
        );
      }
      if (data?.isSuccess) {
        setCombos(data?.result);
        setTotalPages(data?.result?.totalPages);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, [searchQuery, currentPage]);

  const categories = [
    "Món khai vị",
    "Món chính",
    "Món tráng miệng",
    "Đồ uống",
    "Đặc sản",
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="my-16">
      <LoadingOverlay isLoading={loading} />
      <h1 className="uppercase font-bold text-center text-3xl mb-8">
        Khám phá thực đơn của chúng tôi
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant="outlined"
            color="red"
            className="rounded-md transition-colors duration-300"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full max-w-md border border-gray-500 rounded-md p-2"
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3  gap-2">
        {combos?.map((combo) => (
          <motion.div
            key={combo.comboId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ComboCard combo={combo} />
          </motion.div>
        ))}
      </div>
      <Pagination
        page={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MenuPage;

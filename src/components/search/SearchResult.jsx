import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MenuDish from "../menu-dish/MenuDish";
import LoadingOverlay from "../loading/LoadingOverlay";
import useCallApi from "../../api/useCallApi";
import { DishApi } from "../../api/endpoint";

function SearchResults() {
  const location = useLocation();
  const [dishes, setDishes] = useState([]);
  const [totalPage, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const { callApi, error, loading } = useCallApi();
  const fetchData = async (query) => {
    try {
      let response;
      if (!query) {
        response = await callApi(`${DishApi.GET_ALL}/${currentPage}/10`, "GET");
      } else {
        response = await callApi(
          `${DishApi.GET_ALL}/${currentPage}/10?keyword=${query}`,
          "GET"
        );
      }

      if (response.isSuccess) {
        setDishes(response?.result?.items);
        setTotalPages(response?.result?.totalPages);
      } else {
      }
    } catch (error) {}
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q");

    if (query) {
      fetchData(query);
    } else {
      fetchData();
    }
  }, [location.search, pageSize]);

  const handleAddItem = () => {
    setPageSize(pageSize + 3);
  };

  return (
    <div>
      <LoadingOverlay loading={loading} />
      <MenuDish dishes={dishes} handleAddItem={handleAddItem} />
    </div>
  );
}

export default SearchResults;

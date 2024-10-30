import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import ComboDetail from "./ComboDetail";
import useCallApi from "../../../api/useCallApi";
import { ComboApi } from "../../../api/endpoint";
import { showError } from "../../../util/Utility";

export function ComboDetailPage() {
  const { id } = useParams();
  const [comboData, setComboData] = useState({});
  const { callApi, error, loading } = useCallApi();
  const fetchData = async () => {
    const response = await callApi(`${ComboApi.GET_BY_ID}/${id}`, "GET");
    if (response?.isSuccess) {
      setComboData(response?.result);
    } else {
      showError(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [id]);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <LoadingOverlay loading={loading} />
      <ComboDetail
        comboData={comboData}
        key={`combodetail`}
        handleBack={handleBack}
      />
    </div>
  );
}

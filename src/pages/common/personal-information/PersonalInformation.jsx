import React, { useState } from "react";
import UpdateProfile from "./UpdateProfile";
import PersonalAddress from "./PersonalAddress";
import TabMananger from "../../../components/tab/TabManager";
import PersonalSetting from "./PersonalSetting";

const PersonalInformation = ({ activeTab = 0, setActiveTab }) => {
  const tabs = [
    { value: "0", label: "Thông tin cá nhân" },
    { value: "1", label: "Địa chỉ giao hàng" },
    { value: "2", label: "Cài đặt tài khoản" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="uppercase text-red-700 font-bold text-2xl mb-6">
        Thông tin của tôi
      </h1>

      <div className="mb-4">
        <TabMananger
          items={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};

export default PersonalInformation;

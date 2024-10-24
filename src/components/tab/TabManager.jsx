import { Badge } from "antd";
import React from "react";

function TabMananger({ items, activeTab, setActiveTab, enableCount = false }) {
  console.log(activeTab);
  const renderItems = () => {
    if (enableCount) {
      return items?.map((tab) => (
        <Badge count={tab.count}>
          <button
            key={tab.value}
            className={`py-2 px-4 font-medium text-xs bg-white  focus:outline-none cursor-pointer ${
              activeTab === tab.value
                ? "border-b-2 border-red-700 text-red-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        </Badge>
      ));
    } else {
      return items?.map((tab) => (
        <button
          key={tab.value}
          className={`py-2 px-4 border-gray-200 border font-medium text-sm bg-white mx-1 rounded-lg  focus:outline-none cursor-pointer ${
            Number(activeTab) === Number(tab.value)
              ? "border-b-2 border-red-700 text-red-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </button>
      ));
    }
  };

  return (
    <div className="flex border-b border-gray-200 overflow-x-auto my-1">
      {renderItems()}
    </div>
  );
}

export default TabMananger;

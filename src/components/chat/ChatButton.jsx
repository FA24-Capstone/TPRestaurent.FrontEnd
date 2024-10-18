import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import AI from "../../assets/imgs/AI.png";
// Fake chat data
const initialMessages = [
  { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
  { id: 2, text: "I have a question about your services.", sender: "user" },
  {
    id: 3,
    text: "Of course! I'd be happy to help. What would you like to know?",
    sender: "bot",
  },
];

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: newMessage, sender: "user" },
      ]);
      setNewMessage("");
      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Thank you for your message. How else can I assist you?",
            sender: "bot",
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="fixed z-50 bottom-[0.5rem] right-[0.5rem]">
      {isOpen ? (
        <div className="bg-white  rounded-lg shadow-lg w-80 h-96 flex flex-col">
          <div
            onClick={toggleChat}
            className="bg-red-900 flex justify-start items-center text-white rounded-tr-lg rounded-tl-lg px-4 py-2 cursor-pointer"
          >
            <img src={AI} alt="" className="h-12 w-12" />
            <span className="">MR.CHEF AI</span>
            <span className="bg-[#4F970F] animate-pulse  h-3 w-3 rounded-full inline-block ml-2"></span>{" "}
          </div>
          <div className="flex-grow p-4 overflow-y-auto bg-[#FFF9EF]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === "user" ? "bg-gray-100" : "bg-red-100"
                  }`}
                >
                  {message.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2 border rounded-xl mx-2"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-red-900 text-white p-2 rounded-xl hover:bg-red-800"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={toggleChat}
          className="bg-red-900 animate-bounce flex justify-between items-center text-white rounded-tr-lg rounded-tl-lg px-4 py-2 cursor-pointer"
        >
          <img src={AI} alt="" className="h-12 w-12" />
          <span className="animate-pulse ">MR.CHEF AI</span>
          <span className="bg-[#4F970F] animate-pulse  h-3 w-3 rounded-full inline-block ml-2"></span>{" "}
        </div>
      )}
    </div>
  );
};

export default ChatButton;

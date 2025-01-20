import React, { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import "./App.css";
import axios from "axios"

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/messages");
      const data = response.data;
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/messages", {
        content,
      });
      const data = response.data;
      setMessages([...messages, data.userMessage, data.botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };
  const clearHandle = async () =>{
    setIsClearing(true);
    try {
       await axios.delete("http://localhost:3000/api/messages/delete");
        setMessages([]);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative">
      <h1 className="text-3xl font-bold text-center text-blue-500 py-4">
        React Chat Interface
      </h1>
      <div className=" max-w-4xl mx-auto w-full flex flex-col bg-white rounded-lg shadow-lg">
        <ChatWindow messages={messages} />
        <MessageInput onSend={sendMessage} disabled={loading} />
      </div>
      <button
        onClick={clearHandle}
        className={`absolute bottom-8 right-16 px-7 py-2 ${
          isClearing
            ? "bg-gray-500 "
            : "bg-gray-500 hover:bg-gray-600"
        } rounded-full text-white duration-500`}
      >
        Clear Chat
      </button>
    </div>
  );
}
export default App
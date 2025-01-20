import { useEffect, useRef } from "react";


function ChatWindow({ messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="overflow-y-scroll h-[28rem]  p-4">
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-4 ${
            message.sender === "user" ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`inline-block max-w-[70%] rounded-lg px-4 py-2 ${
              message.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            <p className="break-words">{message.content}</p>
            <span className="text-xs opacity-75 block mt-1">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
export default ChatWindow

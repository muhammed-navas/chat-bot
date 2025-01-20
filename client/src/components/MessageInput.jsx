import { useState } from "react";

function MessageInput({ onSend, disabled }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-4 bg-white rounded-b-lg"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={disabled}
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 focus:outline-none disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}

export default MessageInput;
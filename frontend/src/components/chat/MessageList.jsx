import Message from "./Message";

export default function MessageList({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <Message key={message.id ?? index} message={message} />
      ))}
    </div>
  );
}

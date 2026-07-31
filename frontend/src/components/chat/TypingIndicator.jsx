export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-slate-400 px-2">
      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
    </div>
  );
}
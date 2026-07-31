export default function Badge({
  children,
}) {
  return (
    <span
      className="
        rounded-full
        border
        border-cyan-500/20
        bg-cyan-500/10
        px-3
        py-1
        text-xs
        text-cyan-400
      "
    >
      {children}
    </span>
  );
}
export default function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-[#1F2A37]
        bg-[#121B26]
        shadow-[0_0_30px_rgba(0,212,216,.05)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
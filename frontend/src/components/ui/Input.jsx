export default function Input({ children, className = "" }) {
  return (
    <div
      className={`
        w-full
        rounded-2xl
        border
        border-[#30384B]
        bg-[#111725]
        px-4
        py-3

        shadow-[0_8px_35px_rgba(0,0,0,0.25)]

        transition-all
        duration-200

        focus-within:border-[#7C3AED]
        focus-within:shadow-[0_0_0_1px_rgba(124,58,237,0.25),0_0_25px_rgba(124,58,237,0.12)]

        ${className}
      `}
    >
      {children}
    </div>
  );
}

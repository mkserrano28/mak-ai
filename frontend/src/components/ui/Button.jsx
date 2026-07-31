export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const styles = {
    primary:
      "bg-[#182330] hover:bg-[#dceeff] text-black",

    secondary:
      "bg-[#182330] border border-[#253446] hover:bg-[#202c3b] text-white",

    ghost:
      "hover:bg-[#182330] text-slate-300",
  };

  return (
    <button
      className={`
        rounded-2xl
        px-5
        py-3
        transition
        duration-200
        font-medium
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
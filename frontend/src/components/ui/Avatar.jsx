export default function Avatar({
  name = "M",
}) {
  return (
    <div
      className="
        h-11
        w-11
        rounded-full
        bg-cyan-500
        flex
        items-center
        justify-center
        font-bold
        text-black
      "
    >
      {name[0]}
    </div>
  );
}
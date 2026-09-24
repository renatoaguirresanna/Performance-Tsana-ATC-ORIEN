export function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  const cls = size === "lg" ? "text-6xl md:text-7xl" : "text-2xl";
  return (
    <h1 className={`${cls} font-semibold tracking-tight select-none`}>
      <span className="text-[#4285F4]">B</span>
      <span className="text-[#EA4335]">u</span>
      <span className="text-[#FBBC05]">s</span>
      <span className="text-[#4285F4]">c</span>
      <span className="text-[#34A853]">a</span>
      <span className="text-[#EA4335]">d</span>
      <span className="text-[#4285F4]">or</span>{" "}
      <span className="text-zinc-500 dark:text-zinc-400 font-normal">de</span>{" "}
      <span className="text-[#34A853]">Tsana</span>
    </h1>
  );
}

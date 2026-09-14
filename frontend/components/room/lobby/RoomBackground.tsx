export default function RoomBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-[180px] top-[80px] h-[500px] w-[500px] rounded-full bg-purple-700/10 blur-[140px]" />
      <div className="absolute -right-[180px] top-[160px] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />
      <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.025) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute left-1/2 top-0 h-[350px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/[0.05] blur-[100px]" />
    </div>
  );
}
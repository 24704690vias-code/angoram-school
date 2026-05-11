// Header.jsx 
export default function Header({ title = "Student Registry" }) {
  return (
    <header
      className="px-6 py-4 flex items-center justify-between"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <h1 className="font-bold text-base tracking-tight" style={{ color: "var(--text)" }}>
        {title}
      </h1>
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "var(--muted)",
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "var(--accent)", color: "#0f172a" }}
        >
          U
        </div>
        User
      </div>
    </header>
  );
}
export function SocialCard({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, color: "white", background: "linear-gradient(135deg,#070b12,#12233f)" }}>
    <div style={{ display: "flex", fontSize: 25, color: "#71a7ff", letterSpacing: 4 }}>NEROVIAX · {eyebrow.toUpperCase()}</div>
    <div style={{ display: "flex", marginTop: 28, maxWidth: 1020, fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
    <div style={{ display: "flex", marginTop: 30, fontSize: 27, color: "#a8b3c7" }}>{detail}</div>
  </div>;
}

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-${i}`}>{part}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

export default function RichText({ text }: { text: string }) {
  const paragraphs = text.split("\n");
  return (
    <div className="cf-richtext">
      {paragraphs.map((p, idx) => (
        <p key={idx} style={{ margin: p ? "0 0 8px" : "0 0 4px" }}>
          {p ? renderInline(p, String(idx)) : " "}
        </p>
      ))}
    </div>
  );
}

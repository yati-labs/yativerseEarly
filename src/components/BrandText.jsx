// Keeps the brand spelled "yAtI" / "yAtIverse" even inside CSS `uppercase` labels.
export default function BrandText({ children }) {
  if (typeof children !== "string") return children;
  return children.split(/(yAtIverse|yAtI)/).map((part, i) =>
    part === "yAtI" || part === "yAtIverse" ? <span key={i} className="normal-case">{part}</span> : part
  );
}

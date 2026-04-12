export function JavaScriptIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#F7DF1E" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fill="#1a1a1a"
        fontSize="12"
        fontWeight="700"
        fontFamily="monospace"
      >
        JS
      </text>
    </svg>
  );
}

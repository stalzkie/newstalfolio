export function SQLIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#F29111" />
      <ellipse cx="16" cy="11" rx="8" ry="4" fill="white" opacity="0.9" />
      <path
        d="M8 11V16C8 18.2 11.6 20 16 20C20.4 20 24 18.2 24 16V11"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M8 16V21C8 23.2 11.6 25 16 25C20.4 25 24 23.2 24 21V16"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.7"
      />
    </svg>
  );
}

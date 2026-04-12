export function JiraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#0052CC" />
      <path
        d="M16.5 7L9 16.5L13 20.5L16.5 17L20 20.5L24 16.5L16.5 7Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M16.5 25L20 21L16.5 17L13 21L16.5 25Z"
        fill="white"
      />
    </svg>
  );
}

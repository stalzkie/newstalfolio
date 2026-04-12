export function VSCodeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#007ACC" />
      <path
        d="M22 7L12 15.5V10L8 12V20L12 22V17L22 25L24 23V9L22 7Z"
        fill="white"
      />
    </svg>
  );
}

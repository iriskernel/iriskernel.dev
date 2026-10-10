/** The personal mark: a small terminal prompt in a rounded box */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="none" stroke="var(--ac)" strokeWidth="2" />
      <path d="m6.5 8 4 4-4 4" fill="none" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 16.5h5" stroke="var(--ac2)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

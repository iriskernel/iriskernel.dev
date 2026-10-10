/** Only ever visible during `npm run dev`; drafts don't exist on the live site */
export function DraftLabel() {
  return <span className="rounded-full border border-danger px-2 text-xs leading-5 text-danger">Draft</span>;
}

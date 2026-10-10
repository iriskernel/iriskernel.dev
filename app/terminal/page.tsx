import { Terminal } from "./Terminal";

export const metadata = { title: "Terminal", description: "A small terminal easter egg.", alternates: { canonical: "/terminal" } };

export default function TerminalPage() {
  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="mb-6 text-2xl font-medium">
        <span aria-hidden="true" className="text-mu">&gt;_ </span>Terminal
      </h1>
      <Terminal />
    </div>
  );
}

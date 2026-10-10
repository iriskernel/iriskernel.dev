import Link from "next/link";

export const metadata = { title: "Kernel panic" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] py-8">
      <h1 className="text-2xl font-medium text-danger">Kernel panic: page not found</h1>
      <pre className="mt-6 overflow-x-auto rounded-xl border border-ln bg-sf p-4 text-sm leading-6 text-mu">
        {`[ 0.000404] Kernel panic - not syncing: VFS: unable to mount page
[ 0.000404] Error 404: no such file or directory
[ 0.000405] Call trace: visitor -> link -> nowhere
[ 0.000406] ---[ end Kernel panic ]---`}
      </pre>
      <p className="mt-6">The page you asked for doesn&apos;t exist. Maybe the link is old or mistyped.</p>
      <p className="mt-4">
        <Link href="/" className="font-medium text-ac2 hover:underline">
          <span aria-hidden="true">← </span>Go home
        </Link>
      </p>
    </div>
  );
}

/** A terminal-style box with its title set into the top border */
export function Panel({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative scroll-mt-6 rounded-xl border border-ln px-4 pb-4 pt-6 ${className}`}>
      <h2 id={`${id}-title`} className="absolute -top-2.5 left-3 bg-bg px-2 text-sm font-medium leading-5 text-ac">
        <span aria-hidden="true" className="text-mu">
          ─{" "}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

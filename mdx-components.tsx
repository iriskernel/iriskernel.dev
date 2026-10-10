import type { MDXComponents } from "mdx/types";
import Image from "next/image";

/**
 * Marks unfinished text in a case study or devlog entry. A page that still
 * contains a <Todo> is never published, even if its meta says draft: false.
 */
function Todo({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-dashed border-danger bg-danger-bg px-4 py-3 text-sm text-danger">
      <strong className="font-medium">TODO: </strong>
      {children}
    </div>
  );
}

/** A screenshot with a caption. Put the image in /public/projects/<slug>/ */
function Screenshot({ src, alt, caption, width = 1200, height = 750 }: { src: string; alt: string; caption?: string; width?: number; height?: number }) {
  return (
    <figure className="my-6">
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full rounded-xl border border-ln" />
      {caption && <figcaption className="mt-2 text-sm text-mu">{caption}</figcaption>}
    </figure>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Todo, Screenshot, ...components };
}

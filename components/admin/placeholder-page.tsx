export function AdminPlaceholder({
  title,
  spec,
}: {
  title: string;
  spec: string;
}) {
  return (
    <section className="max-w-2xl">
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        Later spec
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">{title}</h1>
      <p className="text-text/55 mt-4 text-sm leading-relaxed">
        This section is specified in {spec}. It is listed here so the desk
        navigation is complete; editing is not wired yet.
      </p>
    </section>
  );
}

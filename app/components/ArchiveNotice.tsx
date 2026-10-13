/** 6 · Inline info row above archive-only results. Not dismissible. */
export function ArchiveNotice({ text }: { text: string }) {
  return (
    <div className="notice" role="note">
      <span className="icon" aria-hidden="true">history</span>
      <span>{text}</span>
    </div>
  );
}

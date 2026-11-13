/** Shared Jana Vani identity, with the unofficial demo label beside its original mark. */
export function BrandLockup() {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white p-1 ring-1 ring-[#e8d6be]">
        <img src="/jana-vani-mark.png" alt="" className="h-full w-full object-contain" />
      </span>
      <span className="min-w-0">
        <span className="brand-title block text-[16px] font-extrabold leading-tight tracking-[-0.03em] text-foreground">Jana Vani</span>
        <span className="brand-subtitle mt-0.5 block max-w-[190px] text-[9px] font-semibold uppercase leading-3 tracking-[0.08em] text-muted-foreground">Unofficial community poll demo</span>
      </span>
    </span>
  );
}

type BrandLogoProps = { light?: boolean; compact?: boolean; iconClassName?: string };

export default function BrandLogo({ light = false, compact = false, iconClassName = 'h-9 w-9' }: BrandLogoProps) {
  return <span className="inline-flex items-center gap-2.5">
    <img src="/buildspace-mark.svg" alt="" aria-hidden="true" className={`${iconClassName} shrink-0`} />
    {!compact && <span className={`font-[Manrope] text-[15px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      Buildspace<span className={light ? 'text-indigo-200' : 'text-indigo-600'}>.</span>
    </span>}
  </span>;
}

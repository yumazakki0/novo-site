export default function CencursaLogo({ size = 'md', className = '' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' };
  return (
    <div className={`${sizes[size]} font-grimoire tracking-widest ${className}`}>
      <span className="text-gold opacity-80">✦</span>
      <span className="text-cold mx-2">CENCURSA</span>
      <span className="text-gold opacity-80">✦</span>
      <div className="font-terminal text-xs tracking-[0.3em] text-muted-foreground mt-1 text-center">
        INTERNAL SYSTEM — CLASSIFIED
      </div>
    </div>
  );
}
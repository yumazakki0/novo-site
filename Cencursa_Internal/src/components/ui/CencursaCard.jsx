export default function CencursaCard({ children, className = '', title, subtitle, cornerOrnaments = true, ...props }) {
  return (
    <div
      className={`cencursa-card ornament-border relative p-5 ${className}`}
      {...props}
    >
      {cornerOrnaments && (
        <>
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: 'rgba(196,169,90,0.3)' }} />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: 'rgba(196,169,90,0.3)' }} />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: 'rgba(196,169,90,0.3)' }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: 'rgba(196,169,90,0.3)' }} />
        </>
      )}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="font-grimoire text-lg" style={{ color: 'var(--gold)', letterSpacing: '0.05em' }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs font-terminal tracking-widest mt-0.5" style={{ color: 'var(--gold-dark)', opacity: 0.6 }}>
              {subtitle}
            </p>
          )}
          <div className="divider-gold mt-2" />
        </div>
      )}
      {children}
    </div>
  );
}
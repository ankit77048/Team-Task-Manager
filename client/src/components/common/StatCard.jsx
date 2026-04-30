export default function StatCard({ title, value, icon: Icon, color = 'brand', trend, subtitle }) {
  const colors = {
    brand:   { bg: 'bg-brand-500/10',   icon: 'text-brand-400',   border: 'border-brand-500/20' },
    green:   { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    yellow:  { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20' },
    red:     { bg: 'bg-red-500/10',     icon: 'text-red-400',     border: 'border-red-500/20' },
    purple:  { bg: 'bg-violet-500/10',  icon: 'text-violet-400',  border: 'border-violet-500/20' },
    cyan:    { bg: 'bg-cyan-500/10',    icon: 'text-cyan-400',    border: 'border-cyan-500/20' },
  };

  const c = colors[color] || colors.brand;

  return (
    <div className="card glass-hover animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-2 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
            <Icon className={`w-6 h-6 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
}

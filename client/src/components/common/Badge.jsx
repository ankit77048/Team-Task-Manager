export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    // Status
    todo:       'bg-slate-700/60 text-slate-300 border-slate-600/40',
    inprogress: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    done:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    // Priority
    low:        'bg-slate-600/40 text-slate-300 border-slate-500/30',
    medium:     'bg-amber-500/15 text-amber-300 border-amber-500/30',
    high:       'bg-red-500/15 text-red-300 border-red-500/30',
    // Role
    admin:      'bg-brand-500/15 text-brand-300 border-brand-500/30',
    member:     'bg-slate-600/40 text-slate-300 border-slate-500/30',
    // Project status
    active:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    planning:   'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    completed:  'bg-violet-500/15 text-violet-300 border-violet-500/30',
    'on-hold':  'bg-slate-600/40 text-slate-300 border-slate-500/30',
    // Generic
    default:    'bg-slate-700/60 text-slate-300 border-slate-600/40',
    overdue:    'bg-red-500/15 text-red-300 border-red-500/30',
  };

  const sizes = { xs: 'px-2 py-0.5 text-xs', sm: 'px-2.5 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };

  const label = {
    todo: 'To Do', inprogress: 'In Progress', done: 'Done',
    low: 'Low', medium: 'Medium', high: 'High',
    admin: 'Admin', member: 'Member',
    active: 'Active', planning: 'Planning', completed: 'Completed', 'on-hold': 'On Hold',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold border ${variants[variant] || variants.default} ${sizes[size]}`}>
      {label[variant] || children}
    </span>
  );
}

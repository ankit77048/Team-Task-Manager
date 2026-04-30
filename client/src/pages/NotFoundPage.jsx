import { Link } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center justify-center text-center p-4"
      style={{background:'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, #0a0f1e 60%)'}}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-6">
        <BoltIcon className="w-9 h-9 text-white" />
      </div>
      <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-md">Oops! The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn-primary px-6 py-3 text-base">← Back to Dashboard</Link>
    </div>
  );
}

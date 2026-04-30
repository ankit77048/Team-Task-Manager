import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BoltIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '', role: 'member' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Welcome to TaskFlow, ${user.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4" style={{background:'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, #0a0f1e 60%)'}}>
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg shadow-brand-500/25 mb-4">
            <BoltIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">TaskFlow</h1>
          <p className="text-slate-400 mt-1 text-sm">Create your account</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                className="input-field" placeholder="John Doe" autoComplete="name" required />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div>
              <label className="form-label">Account Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="input-field">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange} className="input-field pr-10"
                  placeholder="Min. 6 characters" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input id="confirm" name="confirm" type="password" value={form.confirm} onChange={handleChange}
                className="input-field" placeholder="Repeat password" required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

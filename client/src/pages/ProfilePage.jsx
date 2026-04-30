import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { UserCircleIcon, KeyIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passForm, setPassForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading]       = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name is required');
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setProfileLoading(false); }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    setPassLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setPassLoading(false); }
  };

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Profile hero */}
      <div className="card flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
          {user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={user?.role} />
            {user?.createdAt && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Joined {format(new Date(user.createdAt), 'MMM yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl">
        {[{ id: 'profile', label: 'Profile', Icon: UserCircleIcon }, { id: 'password', label: 'Password', Icon: KeyIcon }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.Icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {activeTab === 'profile' && (
        <div className="card animate-fade-in">
          <h2 className="text-base font-semibold text-white mb-4">Edit Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="input-field"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input value={user?.email || ''} className="input-field opacity-60 cursor-not-allowed" disabled />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password form */}
      {activeTab === 'password' && (
        <div className="card animate-fade-in">
          <h2 className="text-base font-semibold text-white mb-4">Change Password</h2>
          <form onSubmit={handlePassSubmit} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passForm.currentPassword}
                onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={passForm.newPassword}
                onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                className="input-field"
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={passForm.confirmPassword}
                onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="input-field"
                placeholder="Repeat new password"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={passLoading}>
              {passLoading ? <LoadingSpinner size="sm" /> : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { PadelProvider, usePadel } from '../../context/PadelContext';
import { Trophy, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
  const { resetPasswordAction } = usePadel();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await resetPasswordAction(password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to reset password');
    } else {
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white font-display">Reset Password</h1>
          <p className="text-xs text-slate-400">Set a new password for your account</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PadelProvider>
      <ResetPasswordContent />
    </PadelProvider>
  );
}

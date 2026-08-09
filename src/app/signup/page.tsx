'use client';

import React, { useState } from 'react';
import { PadelProvider, usePadel } from '../../context/PadelContext';
import { Trophy, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function SignUpPageContent() {
  const { signUpAction } = usePadel();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await signUpAction({ firstName, lastName, email, password });
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account');
    } else {
      setSuccess('Account created. Please check your email to verify your account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white font-display">Create Account</h1>
          <p className="text-xs text-slate-400">Join Padel Manager in the UAE</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ahmed"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-3 outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Al Mansoori"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-3 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
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
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm Password</label>
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
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 font-bold hover:underline">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <PadelProvider>
      <SignUpPageContent />
    </PadelProvider>
  );
}

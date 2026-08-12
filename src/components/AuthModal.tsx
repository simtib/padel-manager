import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { ShieldCheck, Mail, Lock, User, Phone, Check, X, Chrome } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signUpAction, loginAction, currentUser, allPlayers, switchUser } = usePadel();

  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (isRegister) {
      if (!firstName || !lastName || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      setLoading(true);
      const res = await signUpAction({ firstName, lastName, email, password });
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Signup failed');
      } else {
        setInfo('Account created. Please check your email to verify your account.');
      }
    } else {
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
      setLoading(true);
      const res = await loginAction(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 relative shadow-2xl text-slate-200 mx-auto my-3 sm:my-8 max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            🎾
          </div>
          <h3 className="font-extrabold text-xl text-white font-display">
            {isRegister ? 'Create Player Account' : 'Welcome to Padel Manager'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Organize & join private padel tournaments in the UAE
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs mb-4 text-center">
            {error}
          </div>
        )}

        {info && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs mb-4 text-center">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Simone"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rossi"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="simone@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Mobile Number (UAE Optional)
              </label>
              <input
                type="tel"
                placeholder="+971 50 123 4567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-emerald-400 hover:underline"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Demo Persona Selection */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 text-center">
            Or switch active user persona for demo:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {allPlayers.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  switchUser(p.id);
                  onClose();
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                  currentUser.id === p.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <img src={p.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                {p.firstName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

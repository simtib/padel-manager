import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { FeedbackItem, FeedbackType } from '../types';
import { X, Check, AlertCircle, MessageCircle, Bug, Lightbulb, Sparkles, HelpCircle } from 'lucide-react';

interface ProvideFeedbackModalProps {
  onClose: () => void;
  onOpenAuthModal: () => void;
}

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: React.ElementType }[] = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
  { value: 'feature_request', label: 'Feature Request', icon: Sparkles },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

export const ProvideFeedbackModal: React.FC<ProvideFeedbackModalProps> = ({ onClose, onOpenAuthModal }) => {
  const { submitFeedback, currentUser, isAuthenticated } = usePadel();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      onOpenAuthModal();
      onClose();
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your feedback.');
      return;
    }

    if (!description.trim()) {
      setError('Please describe your feedback in detail.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitFeedback({
      type: feedbackType,
      title: title.trim(),
      description: description.trim(),
      pageRoute: typeof window !== 'undefined' ? window.location.pathname : undefined,
      contactConsent,
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || 'Failed to submit feedback.');
    }
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const selectedType = FEEDBACK_TYPES.find((t) => t.value === feedbackType);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 relative shadow-2xl text-slate-200 mx-auto my-3 sm:my-8 max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white font-display">
              Provide Feedback
            </h3>
            <p className="text-xs text-slate-400">
              Help us improve Padel Manager
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Confirmation */}
        {isSuccess ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-white">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your submission has been recorded and is under review. We appreciate your input.
            </p>
            <button
              onClick={handleSuccessClose}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Feedback Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = feedbackType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedbackType(type.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null); }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                placeholder="Brief summary of your feedback"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Description *
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => { setDescription(e.target.value); setError(null); }}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500 resize-none"
                placeholder="Please describe your feedback in detail..."
                rows={5}
              />
            </div>

            {/* Contact Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="contactConsent"
                checked={contactConsent}
                onChange={(e) => setContactConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/20 focus:ring-2"
              />
              <label htmlFor="contactConsent" className="text-xs text-slate-300 cursor-pointer">
                I consent to being contacted about this feedback (optional)
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

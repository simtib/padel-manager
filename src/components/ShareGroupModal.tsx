import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { PlayerGroup } from '../types';
import { Share2, Copy, Check, X, Send, Users, Link2, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ShareGroupModalProps {
  group: PlayerGroup;
  onClose: () => void;
  isNew?: boolean;
}

export const ShareGroupModal: React.FC<ShareGroupModalProps> = ({ group, onClose, isNew }) => {
  const { currentUser } = usePadel();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const isOwnerSharing = currentUser.id === group.ownerId;

  const shareUrl = `${window.location.origin}/?group=${encodeURIComponent(group.id)}&name=${encodeURIComponent(group.name)}&sharer=${encodeURIComponent(currentUser.id)}&owner=${encodeURIComponent(group.ownerId)}${
    group.description ? `&desc=${encodeURIComponent(group.description)}` : ''
  }`;
  const whatsappMessage = `🎾 You're invited to join our Padel group *${group.name}*!\n${
    group.description ? `\n📝 ${group.description}` : ''
  }\n\nClick the link below to join:\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="share-group-title">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-200 mx-auto max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 id="share-group-title" className="font-bold text-lg text-white">
              {isNew ? '🎉 Group Created!' : 'Share Group Invite Link'}
            </h3>
            <p className="text-xs text-slate-400">
              Invite players to join <span className="text-emerald-400 font-semibold">{group.name}</span>
            </p>
          </div>
        </div>

        {/* Group Info Summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">{group.name}</h4>
            {group.description && <p className="text-xs text-slate-400 mt-0.5">{group.description}</p>}
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {group.memberIds.length} Members
          </span>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Invite Link
            </label>
            {isOwnerSharing ? (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Direct Join Link
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Approval Required Link
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
            <Link2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-slate-300 w-full outline-none font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all shrink-0 flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 px-1">
            {isOwnerSharing
              ? 'As group admin, anyone who opens this link will be added directly to the group.'
              : 'As a group member, anyone who opens this link will submit a join request for admin approval.'}
          </p>
        </div>

        {/* WhatsApp Preview Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Send className="w-3.5 h-3.5" /> WhatsApp Message Format
          </div>
          <p className="text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            {whatsappMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopyWhatsApp}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
          >
            {copiedWhatsApp ? (
              <>
                <Check className="w-4 h-4" /> Copied WhatsApp Invite!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Message for WhatsApp
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { EventItem } from '../types';
import { Share2, Copy, Check, X, QrCode, Send } from 'lucide-react';

interface ShareModalProps {
  event: EventItem;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/join/${event.id}`;
  const whatsappMessage = `🎾 You're invited to *${event.name}*!\n\n📅 Date: ${event.date} at ${event.startTime}\n📍 Venue: ${event.facilityName}\n👥 Capacity: ${event.maxPlayers} Players (${event.maxTeams} Teams)\n\nTap the link to register, choose your preferred partner, or add a guest:\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Share Invitation</h3>
            <p className="text-xs text-slate-400">Invite players & partners to {event.name}</p>
          </div>
        </div>

        {/* WhatsApp Preview Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Send className="w-3.5 h-3.5" /> WhatsApp Message Format
          </div>
          <p className="text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            {whatsappMessage}
          </p>
        </div>

        {/* Copy Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCopyWhatsAppText}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied WhatsApp Text!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Message for WhatsApp
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <Share2 className="w-4 h-4" /> Copy Direct Link Only
          </button>
        </div>

        {/* Simulated QR Code */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center">
            <QrCode className="w-14 h-14 text-slate-950" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white">Court QR Code</p>
            <p className="text-[11px] text-slate-400">Scan at facility to view live matches & scores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import { Button } from "@/components/ui/button";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function UpgradeModal({ open, onClose, onUpgrade }: UpgradeModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100">Run limit reached</h2>
        <p className="mt-2 text-sm text-slate-400">
          You have used all free runs for this month. Upgrade to Pro to continue running automations.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onUpgrade}>Upgrade to Pro</Button>
        </div>
      </div>
    </div>
  );
}

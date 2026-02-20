import React from 'react';

type LeaveQuizModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const LeaveQuizModal: React.FC<LeaveQuizModalProps> = ({
  isOpen,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-label="Close leave quick review dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-quiz-title"
        className="relative w-full max-w-sm rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-xl"
      >
        <h3 id="leave-quiz-title" className="text-lg font-extrabold text-ink">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wide btn-unselected"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wide btn-selected"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};



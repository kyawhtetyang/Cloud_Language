import React from 'react';
import { LeaveQuizModal } from '../modals/LeaveQuizModal';

type AppDialogsProps = {
  leaveQuizModalProps: React.ComponentProps<typeof LeaveQuizModal>;
  leaveCompletedUnitModalProps: React.ComponentProps<typeof LeaveQuizModal>;
  unitCompleteModalProps: React.ComponentProps<typeof LeaveQuizModal>;
  isSidebarOpen: boolean;
  onDismissSidebarOverlay: () => void;
};

export const AppDialogs: React.FC<AppDialogsProps> = ({
  leaveQuizModalProps,
  leaveCompletedUnitModalProps,
  unitCompleteModalProps,
  isSidebarOpen,
  onDismissSidebarOverlay,
}) => (
  <>
    <LeaveQuizModal {...leaveQuizModalProps} />
    <LeaveQuizModal {...leaveCompletedUnitModalProps} />
    <LeaveQuizModal {...unitCompleteModalProps} />
    {isSidebarOpen && (
      <button
        className="fixed inset-0 bg-black/30 z-30 md:hidden"
        onClick={onDismissSidebarOverlay}
        aria-label="Close sidebar"
      />
    )}
  </>
);


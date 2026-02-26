import React from 'react';
import { LessonActionFooter } from '../LessonActionFooter';
import { MobileBottomNav } from '../MobileBottomNav';

type AppBottomBarsProps = {
  showLessonActions: boolean;
  lessonActionFooterProps: React.ComponentProps<typeof LessonActionFooter>;
  mobileBottomNavProps: React.ComponentProps<typeof MobileBottomNav>;
};

export const AppBottomBars: React.FC<AppBottomBarsProps> = ({
  showLessonActions,
  lessonActionFooterProps,
  mobileBottomNavProps,
}) => (
  <>
    {showLessonActions && <LessonActionFooter {...lessonActionFooterProps} />}
    <MobileBottomNav {...mobileBottomNavProps} />
  </>
);


import { DefaultLanguage } from './appConfig';

export type LessonModalText = {
  leaveQuizConfirmMessage: string;
  leaveQuizModalTitle: string;
  leaveQuizCancelLabel: string;
  leaveQuizConfirmLabel: string;
  leaveCompletedUnitModalTitle: string;
  leaveCompletedUnitConfirmMessage: string;
  leaveCompletedUnitCancelLabel: string;
  leaveCompletedUnitConfirmLabel: string;
  unitCompleteModalTitle: string;
  unitCompleteModalMessage: string;
  unitCompleteModalCancelLabel: string;
  unitCompleteModalConfirmLabel: string;
  lessonUnitBoundaryModalTitle: string;
  lessonUnitBoundaryModalMessage: string;
  lessonUnitBoundaryModalCancelLabel: string;
  lessonUnitBoundaryModalConfirmLabel: string;
};

export function getLessonModalText(defaultLanguage: DefaultLanguage): LessonModalText {
  if (defaultLanguage === 'burmese') {
    return {
      leaveQuizConfirmMessage: 'Quick Review မှ ထွက်မလား? ဒီ review အတွင်း တိုးတက်မှုတွေ ပျက်သွားပါမယ်။',
      leaveQuizModalTitle: 'Quick Review မှ ထွက်ရန်',
      leaveQuizCancelLabel: 'မထွက်တော့ပါ',
      leaveQuizConfirmLabel: 'ထွက်မယ်',
      leaveCompletedUnitModalTitle: 'ဒီယူနစ်ကို အရင်ပြီးပါ',
      leaveCompletedUnitConfirmMessage: 'ဒီယူနစ် 10/10 ပြီးထားပါတယ်။ Review ကို အခုစမလား၊ ဒါမှမဟုတ် တခြားယူနစ်သို့ ပြောင်းမလား?',
      leaveCompletedUnitCancelLabel: 'ဒီယူနစ်မှာ ဆက်မယ်',
      leaveCompletedUnitConfirmLabel: 'ယူနစ်ပြောင်းမယ်',
      unitCompleteModalTitle: 'ယူနစ်ပြီးဆုံးပါပြီ',
      unitCompleteModalMessage: 'ဒီယူနစ်ကို အောင်မြင်စွာပြီးပါပြီ။ နောက်ယူနစ်သို့ ဆက်သွားမလား?',
      unitCompleteModalCancelLabel: 'ပြန်စမယ်',
      unitCompleteModalConfirmLabel: 'နောက်ယူနစ်',
      lessonUnitBoundaryModalTitle: '10/10 ပြီးပါပြီ',
      lessonUnitBoundaryModalMessage: 'ဒီယူနစ် Lesson ပိုင်းကို ပြီးပါပြီ။ ရှေ့ဆက်မလား?',
      lessonUnitBoundaryModalCancelLabel: 'ဒီနေရာမှာ နေမယ်',
      lessonUnitBoundaryModalConfirmLabel: 'နောက်ယူနစ်သို့ ဆက်မယ်',
    };
  }

  return {
    leaveQuizConfirmMessage: 'Leave quick review? Progress in this review will be lost.',
    leaveQuizModalTitle: 'Leave quick review?',
    leaveQuizCancelLabel: 'Cancel',
    leaveQuizConfirmLabel: 'Leave quick review',
    leaveCompletedUnitModalTitle: 'Finish this unit first?',
    leaveCompletedUnitConfirmMessage: 'You reached 10/10 for this unit. Start quick review now, or leave this unit?',
    leaveCompletedUnitCancelLabel: 'Stay on Unit',
    leaveCompletedUnitConfirmLabel: 'Leave Unit',
    unitCompleteModalTitle: 'Unit Complete',
    unitCompleteModalMessage: 'You finished this unit successfully. Continue to the next unit?',
    unitCompleteModalCancelLabel: 'Again',
    unitCompleteModalConfirmLabel: 'Next Unit',
    lessonUnitBoundaryModalTitle: '10/10 Complete',
    lessonUnitBoundaryModalMessage: 'You finished the lesson part of this unit. Continue?',
    lessonUnitBoundaryModalCancelLabel: 'Stay here',
    lessonUnitBoundaryModalConfirmLabel: 'Continue to next unit',
  };
}



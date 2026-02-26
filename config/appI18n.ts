import { DefaultLanguage } from './appConfig';

export type AppTextPack = {
  logoutModal: {
    title: string;
    message: string;
    cancelLabel: string;
    confirmLabel: string;
  };
  library: {
    searchLabel: string;
    searchPlaceholder: string;
    playAllLabel: string;
    noAlbumsMatch: string;
  };
  lesson: {
    unitPrefix: string;
  };
  modals: {
    leaveCompletedUnit: {
      title: string;
      message: string;
      cancelLabel: string;
      confirmLabel: string;
    };
  };
};

const APP_TEXT_ENGLISH: AppTextPack = {
  logoutModal: {
    title: 'Log out?',
    message: 'Are you sure you want to log out from this profile?',
    cancelLabel: 'Cancel',
    confirmLabel: 'Log out',
  },
  library: {
    searchLabel: 'Search library',
    searchPlaceholder: 'Search library',
    playAllLabel: 'Play all',
    noAlbumsMatch: 'No albums match your search.',
  },
  lesson: {
    unitPrefix: 'Unit',
  },
  modals: {
    leaveCompletedUnit: {
      title: 'Finish this unit first?',
      message: 'You reached 10/10 for this unit. Stay on this unit or leave it?',
      cancelLabel: 'Stay on Unit',
      confirmLabel: 'Leave Unit',
    },
  },
};

const APP_TEXT_BY_LANGUAGE: Record<DefaultLanguage, AppTextPack> = {
  english: APP_TEXT_ENGLISH,
  burmese: {
    logoutModal: {
      title: 'Log out လုပ်မလား?',
      message: 'အကောင့်ကနေထွက်မယ်ဆိုတာ အတည်ပြုပါ။',
      cancelLabel: 'မထွက်တော့ဘူး',
      confirmLabel: 'Log out',
    },
    library: {
      searchLabel: 'Library ကို ရှာမယ်',
      searchPlaceholder: 'Library ကို ရှာမယ်',
      playAllLabel: 'အားလုံးဖတ်',
      noAlbumsMatch: 'ရှာဖွေမှုနှင့် ကိုက်ညီသော album မရှိသေးပါ။',
    },
    lesson: {
      unitPrefix: 'ယူနစ်',
    },
    modals: {
      leaveCompletedUnit: {
        title: 'ဒီယူနစ်ကို အရင်ပြီးပါ',
        message: 'ဒီယူနစ် 10/10 ပြီးထားပါတယ်။ ဒီယူနစ်မှာ ဆက်မလား၊ တခြားယူနစ်သို့ ပြောင်းမလား?',
        cancelLabel: 'ဒီယူနစ်မှာ ဆက်မယ်',
        confirmLabel: 'ယူနစ်ပြောင်းမယ်',
      },
    },
  },
  vietnamese: {
    logoutModal: {
      title: 'Đăng xuất?',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi hồ sơ này không?',
      cancelLabel: 'Hủy',
      confirmLabel: 'Đăng xuất',
    },
    library: {
      searchLabel: 'Tìm kiếm thư viện',
      searchPlaceholder: 'Tìm kiếm thư viện',
      playAllLabel: 'Đọc tất cả',
      noAlbumsMatch: 'Không có album phù hợp với tìm kiếm của bạn.',
    },
    lesson: {
      unitPrefix: 'Bài',
    },
    modals: {
      leaveCompletedUnit: {
        title: 'Hoàn thành bài học này trước?',
        message: 'Bạn đã đạt 10/10 cho bài học này. Ở lại bài học này hay chuyển sang bài học khác?',
        cancelLabel: 'Ở lại bài học này',
        confirmLabel: 'Rời bài học',
      },
    },
  },
};

export function getAppText(defaultLanguage: DefaultLanguage): AppTextPack {
  return APP_TEXT_BY_LANGUAGE[defaultLanguage] || APP_TEXT_ENGLISH;
}

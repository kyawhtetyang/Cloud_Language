import { AppTheme, CourseFramework, DefaultLanguage, LearnLanguage, VoiceProvider } from './appConfig';

export type AppTextPack = {
  navigation: {
    feedLabel: string;
    libraryLabel: string;
    lessonLabel: string;
    profileLabel: string;
    settingsLabel: string;
    reloadPageAriaLabel: string;
    closeAriaLabel: string;
  };
  appState: {
    loadingLessonsLabel: string;
    lessonsUnavailableTitle: string;
    lessonsUnavailableDefaultMessage: string;
    lessonsUnavailableHealthPrefix: string;
    lessonsLoadFailedMessage: string;
    completedTitle: string;
    completedMessage: string;
    completedRestartLabel: string;
    unexpectedErrorTitle: string;
    unexpectedErrorMessage: string;
    reloadLabel: string;
  };
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
    removeDownloadedConfirmMessage: string;
    downloadingLabel: string;
    offlineReadyLabel: string;
    downloadedLabel: string;
    downloadLabel: string;
    openGroupAriaPrefix: string;
    completedUnitAriaLabel: string;
    openLessonAriaPrefix: string;
    openLessonTitle: string;
    backToAlbumsAriaLabel: string;
    unitSingularLabel: string;
    unitPluralLabel: string;
    collectionFallbackPrefix: string;
    untitledSourceLabel: string;
  };
  lesson: {
    revisionReviewTabLabel: string;
    revisionQuizTabLabel: string;
    unitPrefix: string;
    previousLabel: string;
    nextLabel: string;
    readLabel: string;
    stopLabel: string;
    enableShuffleLabel: string;
    disableShuffleLabel: string;
    enableRepeatAllLabel: string;
    enableRepeatOneLabel: string;
    disableRepeatLabel: string;
    playAudioAriaPrefix: string;
    highlightHintTitle: string;
    highlightCancelLabel: string;
    highlightClearLabel: string;
    highlightAllLabel: string;
    highlightSaveLabel: string;
    pronunciationSomeMissingHint: string;
    pronunciationAllMissingHint: string;
    backToLibraryAriaLabel: string;
  };
  welcome: {
    title: string;
    description: string;
    usernamePlaceholder: string;
    usernameWhitespaceError: string;
    continueLabel: string;
  };
  profile: {
    accountSectionLabel: string;
    welcomeBackTitle: string;
    progressStatsSectionLabel: string;
    currentCourseLabel: string;
    downloadedLessonsLabel: string;
    downloadedUnitsTracksLabel: string;
    courseNotAvailableLabel: string;
    changeDisplayNameSectionLabel: string;
    displayNamePlaceholder: string;
    saveLabel: string;
    usernameWhitespaceError: string;
    sessionSectionLabel: string;
    logoutLabel: string;
    openSettingsAriaLabel: string;
  };
  settings: {
    profileContextLabel: string;
    settingsTitle: string;
    preferencesSectionLabel: string;
    displaySectionLabel: string;
    audioSectionLabel: string;
    keepEnglishUiLabel: string;
    defaultLanguageLabel: string;
    learnLanguageLabel: string;
    courseFrameworkLabel: string;
    appearanceLabel: string;
    voiceProviderLabel: string;
    boldTextLabel: string;
    autoScrollLabel: string;
    textSizeLabel: string;
    pronunciationLabel: string;
    backToProfileAriaLabel: string;
    backToSettingsAriaLabel: string;
    decreaseTextSizeAriaLabel: string;
    increaseTextSizeAriaLabel: string;
    onLabel: string;
    offLabel: string;
    defaultLanguageOptions: Record<DefaultLanguage, string>;
    learnLanguageOptions: Record<LearnLanguage, string>;
    courseFrameworkOptions: Record<CourseFramework, string>;
    appearanceOptions: Record<AppTheme, string>;
    voiceProviderOptions: Record<VoiceProvider, string>;
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
  navigation: {
    feedLabel: 'Revision',
    libraryLabel: 'Library',
    lessonLabel: 'Lesson',
    profileLabel: 'Profile',
    settingsLabel: 'Settings',
    reloadPageAriaLabel: 'Reload page',
    closeAriaLabel: 'Close',
  },
  appState: {
    loadingLessonsLabel: 'Loading lessons...',
    lessonsUnavailableTitle: 'Lessons unavailable',
    lessonsUnavailableDefaultMessage: 'No lessons available right now.',
    lessonsUnavailableHealthPrefix: 'Check backend API at',
    lessonsLoadFailedMessage: 'Could not load lessons from backend or offline storage.',
    completedTitle: 'All Units Passed',
    completedMessage: 'You completed all sections and passed the random checks.',
    completedRestartLabel: 'Restart Unit 1',
    unexpectedErrorTitle: 'Something went wrong',
    unexpectedErrorMessage: 'The app hit an unexpected error. Reload to recover.',
    reloadLabel: 'Reload',
  },
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
    removeDownloadedConfirmMessage: 'Remove downloaded offline lessons for this group?',
    downloadingLabel: 'Downloading',
    offlineReadyLabel: 'Offline ready',
    downloadedLabel: 'Downloaded',
    downloadLabel: 'Download',
    openGroupAriaPrefix: 'Open group',
    completedUnitAriaLabel: 'Completed unit',
    openLessonAriaPrefix: 'Open lesson',
    openLessonTitle: 'Open lesson',
    backToAlbumsAriaLabel: 'Back',
    unitSingularLabel: 'unit',
    unitPluralLabel: 'units',
    collectionFallbackPrefix: 'Collection',
    untitledSourceLabel: 'Untitled',
  },
  lesson: {
    revisionReviewTabLabel: 'Review',
    revisionQuizTabLabel: 'Quiz',
    unitPrefix: 'Unit',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    readLabel: 'Read',
    stopLabel: 'Stop',
    enableShuffleLabel: 'Enable shuffle',
    disableShuffleLabel: 'Disable shuffle',
    enableRepeatAllLabel: 'Enable repeat all',
    enableRepeatOneLabel: 'Enable repeat one',
    disableRepeatLabel: 'Disable repeat',
    playAudioAriaPrefix: 'Play audio for',
    highlightHintTitle: 'Tap to hear pronunciation. Tap and hold, then drag to highlight phrase.',
    highlightCancelLabel: 'Cancel',
    highlightClearLabel: 'Clear',
    highlightAllLabel: 'All',
    highlightSaveLabel: 'Save',
    pronunciationSomeMissingHint: 'Some pronunciation is coming soon.',
    pronunciationAllMissingHint: 'Pronunciation coming soon.',
    backToLibraryAriaLabel: 'Back',
  },
  welcome: {
    title: 'Welcome',
    description: 'Enter your name to create a local profile.',
    usernamePlaceholder: 'Username (no spaces)',
    usernameWhitespaceError: 'Username cannot contain spaces.',
    continueLabel: 'Continue',
  },
  profile: {
    accountSectionLabel: 'Account',
    welcomeBackTitle: 'Welcome back',
    progressStatsSectionLabel: 'Progress Stats',
    currentCourseLabel: 'Current Course',
    downloadedLessonsLabel: 'Bookmark Album',
    downloadedUnitsTracksLabel: 'Bookmark Lesson',
    courseNotAvailableLabel: 'Not available',
    changeDisplayNameSectionLabel: 'Change Display Name',
    displayNamePlaceholder: 'Display name (no spaces)',
    saveLabel: 'Save',
    usernameWhitespaceError: 'Username cannot contain spaces.',
    sessionSectionLabel: 'Session',
    logoutLabel: 'Log out',
    openSettingsAriaLabel: 'Open settings',
  },
  settings: {
    profileContextLabel: 'Profile',
    settingsTitle: 'Settings',
    preferencesSectionLabel: 'Preferences',
    displaySectionLabel: 'Display',
    audioSectionLabel: 'Audio',
    keepEnglishUiLabel: 'English UI',
    defaultLanguageLabel: 'Default Language',
    learnLanguageLabel: 'Learn Language',
    courseFrameworkLabel: 'Course Framework',
    appearanceLabel: 'Appearance',
    voiceProviderLabel: 'Voice Provider',
    boldTextLabel: 'Bold Text',
    autoScrollLabel: 'Auto Scroll',
    textSizeLabel: 'Text Size',
    pronunciationLabel: 'Pronunciation',
    backToProfileAriaLabel: 'Back to profile',
    backToSettingsAriaLabel: 'Back to settings',
    decreaseTextSizeAriaLabel: 'Decrease text size',
    increaseTextSizeAriaLabel: 'Increase text size',
    onLabel: 'On',
    offLabel: 'Off',
    defaultLanguageOptions: {
      burmese: 'Burmese',
      english: 'English',
      thai: 'Thai',
      vietnamese: 'Vietnamese',
    },
    learnLanguageOptions: {
      english: 'English',
      chinese: 'Chinese',
      vietnamese: 'Vietnamese',
      thai: 'Thai',
      hsk_chinese: 'HSK Chinese',
    },
    courseFrameworkOptions: {
      cefr: 'CEFR',
      hsk: 'HSK',
    },
    appearanceOptions: {
      light: 'Light Mode',
      dark: 'Dark Mode',
    },
    voiceProviderOptions: {
      default: 'Default',
      apple_siri: 'Apple (Siri)',
    },
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
  thai: APP_TEXT_ENGLISH,
  burmese: {
    navigation: {
      feedLabel: 'ပြန်လေ့ကျင့်',
      libraryLabel: 'စာကြည့်တိုက်',
      lessonLabel: 'သင်ခန်းစာ',
      profileLabel: 'ပရိုဖိုင်',
      settingsLabel: 'ဆက်တင်များ',
      reloadPageAriaLabel: 'Page ပြန်တင်မယ်',
      closeAriaLabel: 'ပိတ်မယ်',
    },
    appState: {
      loadingLessonsLabel: 'သင်ခန်းစာများ ဖတ်နေသည်...',
      lessonsUnavailableTitle: 'သင်ခန်းစာမရနိုင်ပါ',
      lessonsUnavailableDefaultMessage: 'ယခုအချိန်တွင် သင်ခန်းစာများ မရှိသေးပါ။',
      lessonsUnavailableHealthPrefix: 'Backend API ကိုစစ်ပါ',
      lessonsLoadFailedMessage: 'Backend သို့မဟုတ် offline storage မှ သင်ခန်းစာများကို မတင်နိုင်ပါ။',
      completedTitle: 'ယူနစ်အားလုံး အောင်မြင်ပြီး',
      completedMessage: 'အပိုင်းအားလုံးကိုပြီးမြောက်ပြီး စစ်ဆေးမှုများကို အောင်မြင်ပါတယ်။',
      completedRestartLabel: 'Unit 1 ကို ပြန်စမယ်',
      unexpectedErrorTitle: 'တစ်ခုခု မှားယွင်းသွားပါသည်',
      unexpectedErrorMessage: 'App တွင် မမျှော်လင့်ထားသော error ဖြစ်ခဲ့သည်။ ပြန်တင်ပြီး ဆက်လုပ်ပါ။',
      reloadLabel: 'ပြန်တင်မယ်',
    },
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
      removeDownloadedConfirmMessage: 'ဒီ group အတွက် download လုပ်ထားတဲ့ offline lessons ကို ဖျက်မလား?',
      downloadingLabel: 'ဒေါင်းလုဒ်လုပ်နေသည်',
      offlineReadyLabel: 'Offline အဆင်သင့်',
      downloadedLabel: 'ဒေါင်းလုဒ်ပြီး',
      downloadLabel: 'ဒေါင်းလုဒ်',
      openGroupAriaPrefix: 'Group ဖွင့်မယ်',
      completedUnitAriaLabel: 'ပြီးဆုံးယူနစ်',
      openLessonAriaPrefix: 'Lesson ဖွင့်မယ်',
      openLessonTitle: 'Lesson ဖွင့်မယ်',
      backToAlbumsAriaLabel: 'နောက်သို့',
      unitSingularLabel: 'unit',
      unitPluralLabel: 'units',
      collectionFallbackPrefix: 'စုစည်းမှု',
      untitledSourceLabel: 'ခေါင်းစဉ်မရှိ',
    },
    lesson: {
      revisionReviewTabLabel: 'Review',
      revisionQuizTabLabel: 'Quiz',
      unitPrefix: 'ယူနစ်',
      previousLabel: 'နောက်သို့',
      nextLabel: 'ရှေ့သို့',
      readLabel: 'ဖတ်မယ်',
      stopLabel: 'ရပ်မယ်',
      enableShuffleLabel: 'Shuffle ဖွင့်မယ်',
      disableShuffleLabel: 'Shuffle ပိတ်မယ်',
      enableRepeatAllLabel: 'Repeat all ဖွင့်မယ်',
      enableRepeatOneLabel: 'Repeat one ဖွင့်မယ်',
      disableRepeatLabel: 'Repeat ပိတ်မယ်',
      playAudioAriaPrefix: 'အသံဖွင့်မယ်',
      highlightHintTitle: 'အသံထွက်ကို နားထောင်ရန် နှိပ်ပါ။ နှိပ်ထားပြီး ဆွဲကာ စကားစုကို ရွေးချယ်ပါ။',
      highlightCancelLabel: 'မလုပ်တော့',
      highlightClearLabel: 'ဖျက်မယ်',
      highlightAllLabel: 'အားလုံး',
      highlightSaveLabel: 'သိမ်းမယ်',
      pronunciationSomeMissingHint: 'အသံထွက်အချို့ကို မကြာမီ ထည့်ပေးပါမည်။',
      pronunciationAllMissingHint: 'အသံထွက်ကို မကြာမီ ထည့်ပေးပါမည်။',
      backToLibraryAriaLabel: 'နောက်သို့',
    },
    welcome: {
      title: 'ကြိုဆိုပါတယ်',
      description: 'Local profile တစ်ခုဖန်တီးရန် သင့်နာမည်ထည့်ပါ။',
      usernamePlaceholder: 'Username (space မပါ)',
      usernameWhitespaceError: 'Username တွင် space မပါရပါ။',
      continueLabel: 'ဆက်သွားမယ်',
    },
    profile: {
      accountSectionLabel: 'အကောင့်',
      welcomeBackTitle: 'ပြန်လည်ကြိုဆိုပါတယ်',
      progressStatsSectionLabel: 'တိုးတက်မှု အချက်အလက်',
      currentCourseLabel: 'လက်ရှိသင်တန်း',
      downloadedLessonsLabel: 'မှတ်သားထားသော အယ်လ်ဘမ်',
      downloadedUnitsTracksLabel: 'မှတ်သားထားသော သင်ခန်းစာ',
      courseNotAvailableLabel: 'မရရှိသေးပါ',
      changeDisplayNameSectionLabel: 'ဖော်ပြမည့်နာမည် ပြောင်းမယ်',
      displayNamePlaceholder: 'ဖော်ပြမည့်နာမည် (space မပါ)',
      saveLabel: 'သိမ်းမည်',
      usernameWhitespaceError: 'Username တွင် space မပါရပါ။',
      sessionSectionLabel: 'Session',
      logoutLabel: 'Log out',
      openSettingsAriaLabel: 'Settings ဖွင့်မယ်',
    },
    settings: {
      profileContextLabel: 'Profile',
      settingsTitle: 'Settings',
      preferencesSectionLabel: 'Preferences',
      displaySectionLabel: 'Display',
      audioSectionLabel: 'Audio',
      keepEnglishUiLabel: 'English UI',
      defaultLanguageLabel: 'မူလဘာသာစကား',
      learnLanguageLabel: 'လေ့လာမည့်ဘာသာစကား',
      courseFrameworkLabel: 'သင်တန်းစံနစ်',
      appearanceLabel: 'မြင်ကွင်း',
      voiceProviderLabel: 'အသံပံ့ပိုးမှု',
      boldTextLabel: 'စာလုံးအထူ',
      autoScrollLabel: 'Auto Scroll',
      textSizeLabel: 'စာလုံးအရွယ်အစား',
      pronunciationLabel: 'အသံထွက်',
      backToProfileAriaLabel: 'Profile သို့ ပြန်မယ်',
      backToSettingsAriaLabel: 'Settings သို့ ပြန်မယ်',
      decreaseTextSizeAriaLabel: 'စာလုံးအရွယ်အစား လျှော့မယ်',
      increaseTextSizeAriaLabel: 'စာလုံးအရွယ်အစား တိုးမယ်',
      onLabel: 'ဖွင့်',
      offLabel: 'ပိတ်',
      defaultLanguageOptions: {
        burmese: 'မြန်မာ',
        english: 'အင်္ဂလိပ်',
        thai: 'ထိုင်း',
        vietnamese: 'ဗီယက်နမ်',
      },
      learnLanguageOptions: {
        english: 'အင်္ဂလိပ်',
        chinese: 'တရုတ်',
        vietnamese: 'ဗီယက်နမ်',
        thai: 'ထိုင်း',
        hsk_chinese: 'HSK တရုတ်',
      },
      courseFrameworkOptions: {
        cefr: 'CEFR',
        hsk: 'HSK',
      },
      appearanceOptions: {
        light: 'အလင်း',
        dark: 'အမှောင်',
      },
      voiceProviderOptions: {
        default: 'မူလ',
        apple_siri: 'Apple (Siri)',
      },
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
    navigation: {
      feedLabel: 'Ôn tập',
      libraryLabel: 'Thư viện',
      lessonLabel: 'Bài học',
      profileLabel: 'Hồ sơ',
      settingsLabel: 'Cài đặt',
      reloadPageAriaLabel: 'Tải lại trang',
      closeAriaLabel: 'Đóng',
    },
    appState: {
      loadingLessonsLabel: 'Đang tải bài học...',
      lessonsUnavailableTitle: 'Không có bài học',
      lessonsUnavailableDefaultMessage: 'Hiện không có bài học nào.',
      lessonsUnavailableHealthPrefix: 'Kiểm tra backend API tại',
      lessonsLoadFailedMessage: 'Không thể tải bài học từ backend hoặc bộ nhớ offline.',
      completedTitle: 'Đã hoàn thành tất cả bài',
      completedMessage: 'Bạn đã hoàn thành mọi phần và vượt qua các kiểm tra ngẫu nhiên.',
      completedRestartLabel: 'Bắt đầu lại Bài 1',
      unexpectedErrorTitle: 'Đã xảy ra lỗi',
      unexpectedErrorMessage: 'Ứng dụng gặp lỗi không mong muốn. Hãy tải lại để khôi phục.',
      reloadLabel: 'Tải lại',
    },
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
      removeDownloadedConfirmMessage: 'Xóa các bài học offline đã tải của nhóm này?',
      downloadingLabel: 'Đang tải',
      offlineReadyLabel: 'Sẵn sàng offline',
      downloadedLabel: 'Đã tải',
      downloadLabel: 'Tải xuống',
      openGroupAriaPrefix: 'Mở nhóm',
      completedUnitAriaLabel: 'Bài đã hoàn thành',
      openLessonAriaPrefix: 'Mở bài',
      openLessonTitle: 'Mở bài',
      backToAlbumsAriaLabel: 'Quay lại',
      unitSingularLabel: 'bài',
      unitPluralLabel: 'bài',
      collectionFallbackPrefix: 'Bộ',
      untitledSourceLabel: 'Chưa đặt tên',
    },
    lesson: {
      revisionReviewTabLabel: 'Review',
      revisionQuizTabLabel: 'Quiz',
      unitPrefix: 'Bài',
      previousLabel: 'Trước',
      nextLabel: 'Tiếp',
      readLabel: 'Đọc',
      stopLabel: 'Dừng',
      enableShuffleLabel: 'Bật trộn',
      disableShuffleLabel: 'Tắt trộn',
      enableRepeatAllLabel: 'Bật lặp tất cả',
      enableRepeatOneLabel: 'Bật lặp một',
      disableRepeatLabel: 'Tắt lặp',
      playAudioAriaPrefix: 'Phát âm thanh cho',
      highlightHintTitle: 'Chạm để nghe phát âm. Chạm giữ rồi kéo để tô sáng cụm từ.',
      highlightCancelLabel: 'Hủy',
      highlightClearLabel: 'Xóa',
      highlightAllLabel: 'Tất cả',
      highlightSaveLabel: 'Lưu',
      pronunciationSomeMissingHint: 'Một số phần phát âm sẽ sớm có.',
      pronunciationAllMissingHint: 'Phát âm sẽ sớm có.',
      backToLibraryAriaLabel: 'Quay lại',
    },
    welcome: {
      title: 'Chào mừng',
      description: 'Nhập tên của bạn để tạo hồ sơ cục bộ.',
      usernamePlaceholder: 'Tên người dùng (không có khoảng trắng)',
      usernameWhitespaceError: 'Tên người dùng không được chứa khoảng trắng.',
      continueLabel: 'Tiếp tục',
    },
    profile: {
      accountSectionLabel: 'Tài khoản',
      welcomeBackTitle: 'Chào mừng quay lại',
      progressStatsSectionLabel: 'Thống kê tiến độ',
      currentCourseLabel: 'Khóa học hiện tại',
      downloadedLessonsLabel: 'Album đã đánh dấu',
      downloadedUnitsTracksLabel: 'Bài học đã đánh dấu',
      courseNotAvailableLabel: 'Chưa có',
      changeDisplayNameSectionLabel: 'Đổi tên hiển thị',
      displayNamePlaceholder: 'Tên hiển thị (không có khoảng trắng)',
      saveLabel: 'Lưu',
      usernameWhitespaceError: 'Tên người dùng không được chứa khoảng trắng.',
      sessionSectionLabel: 'Phiên',
      logoutLabel: 'Đăng xuất',
      openSettingsAriaLabel: 'Mở cài đặt',
    },
    settings: {
      profileContextLabel: 'Hồ sơ',
      settingsTitle: 'Cài đặt',
      preferencesSectionLabel: 'Tùy chọn',
      displaySectionLabel: 'Hiển thị',
      audioSectionLabel: 'Âm thanh',
      keepEnglishUiLabel: 'English UI',
      defaultLanguageLabel: 'Ngôn ngữ mặc định',
      learnLanguageLabel: 'Ngôn ngữ học',
      courseFrameworkLabel: 'Khung khóa học',
      appearanceLabel: 'Giao diện',
      voiceProviderLabel: 'Nhà cung cấp giọng nói',
      boldTextLabel: 'Chữ đậm',
      autoScrollLabel: 'Tự cuộn',
      textSizeLabel: 'Cỡ chữ',
      pronunciationLabel: 'Phát âm',
      backToProfileAriaLabel: 'Quay lại hồ sơ',
      backToSettingsAriaLabel: 'Quay lại cài đặt',
      decreaseTextSizeAriaLabel: 'Giảm cỡ chữ',
      increaseTextSizeAriaLabel: 'Tăng cỡ chữ',
      onLabel: 'Bật',
      offLabel: 'Tắt',
      defaultLanguageOptions: {
        burmese: 'Tiếng Miến Điện',
        english: 'Tiếng Anh',
        thai: 'Tiếng Thái',
        vietnamese: 'Tiếng Việt',
      },
      learnLanguageOptions: {
        english: 'Tiếng Anh',
        chinese: 'Tiếng Trung',
        vietnamese: 'Tiếng Việt',
        thai: 'Tiếng Thái',
        hsk_chinese: 'Tiếng Trung HSK',
      },
      courseFrameworkOptions: {
        cefr: 'CEFR',
        hsk: 'HSK',
      },
      appearanceOptions: {
        light: 'Sáng',
        dark: 'Tối',
      },
      voiceProviderOptions: {
        default: 'Mặc định',
        apple_siri: 'Apple (Siri)',
      },
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

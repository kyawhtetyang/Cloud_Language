import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelSpeech, speakText } from './AudioButton';

type MockAudioPlan = {
  delayMs: number;
  fireEnd: boolean;
};

class MockAudio {
  static instances: MockAudio[] = [];
  static nextPlan: MockAudioPlan = { delayMs: 0, fireEnd: true };

  src: string;
  currentTime = 0;
  onplaying: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  pause = vi.fn();
  load = vi.fn();
  private plan: MockAudioPlan;

  constructor(url: string) {
    this.src = url;
    this.plan = MockAudio.nextPlan;
    MockAudio.instances.push(this);
  }

  play = vi.fn(() => {
    window.setTimeout(() => {
      this.onplaying?.();
      if (this.plan.fireEnd) {
        this.onended?.();
      }
    }, this.plan.delayMs);
    return Promise.resolve();
  });
}

class MockUtterance {
  text: string;
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('AudioButton audio behavior', () => {
  const speechSynthesisMock = {
    cancel: vi.fn(),
    getVoices: vi.fn(() => [] as SpeechSynthesisVoice[]),
    speak: vi.fn((utterance: MockUtterance) => {
      window.setTimeout(() => utterance.onend?.(), 0);
    }),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    MockAudio.instances = [];
    MockAudio.nextPlan = { delayMs: 0, fireEnd: true };
    vi.stubGlobal('Audio', MockAudio as unknown as typeof Audio);
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance as unknown as typeof SpeechSynthesisUtterance);
    vi.stubGlobal('speechSynthesis', speechSynthesisMock);
    speechSynthesisMock.cancel.mockClear();
    speechSynthesisMock.speak.mockClear();
  });

  afterEach(() => {
    cancelSpeech();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falls back to speech synthesis when audioUrl is missing', async () => {
    const playPromise = speakText('Hello fallback');
    await vi.runAllTimersAsync();
    await playPromise;

    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    const utteranceArg = speechSynthesisMock.speak.mock.calls[0][0] as MockUtterance;
    expect(utteranceArg.text).toBe('Hello fallback');
    expect(utteranceArg.lang).toBe('en-US');
  });

  it('uses Chinese locale/voice for chinese learning speech fallback', async () => {
    const zhVoice = { lang: 'zh-CN', name: 'Chinese Voice' } as SpeechSynthesisVoice;
    speechSynthesisMock.getVoices.mockReturnValue([zhVoice]);

    const playPromise = speakText('请问。', { learnLanguage: 'chinese' });
    await vi.runAllTimersAsync();
    await playPromise;

    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
    const utteranceArg = speechSynthesisMock.speak.mock.calls[0][0] as MockUtterance;
    expect(utteranceArg.lang).toBe('zh-CN');
    expect(utteranceArg.voice).toBe(zhVoice);
  });

  it('stops timed-out clip playback and falls back to speech synthesis', async () => {
    MockAudio.nextPlan = { delayMs: 600, fireEnd: true };

    const playPromise = speakText('Needs fallback', { audioUrl: '/clip.mp3' });
    await vi.advanceTimersByTimeAsync(460);

    const createdAudio = MockAudio.instances[0];
    expect(createdAudio).toBeDefined();
    expect(createdAudio.pause).toHaveBeenCalled();
    expect(createdAudio.load).toHaveBeenCalled();
    expect(createdAudio.src).toBe('');
    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();
    await playPromise;
  });
});


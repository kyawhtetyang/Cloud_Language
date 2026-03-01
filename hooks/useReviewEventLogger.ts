import { useCallback } from 'react';
import { LearnLanguage } from '../config/appConfig';

type ReviewEventMetadata = Record<string, unknown>;

type UseReviewEventLoggerParams = {
  apiBaseUrl: string;
  profileName: string;
  learnLanguage: LearnLanguage;
};

type LogReviewEvent = (eventType: string, metadata?: ReviewEventMetadata) => void;

export function useReviewEventLogger({
  apiBaseUrl,
  profileName,
  learnLanguage,
}: UseReviewEventLoggerParams): { logReviewEvent: LogReviewEvent } {
  const logReviewEvent = useCallback<LogReviewEvent>((eventType, metadata = {}) => {
    const normalizedProfileName = profileName.trim();
    const normalizedEventType = String(eventType || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!normalizedProfileName || !normalizedEventType) return;

    void fetch(`${apiBaseUrl}/api/review-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileName: normalizedProfileName,
        eventType: normalizedEventType,
        learnLanguage,
        metadata,
        clientCreatedAt: new Date().toISOString(),
      }),
    }).catch(() => {
      // Event logging is best effort and must not block the lesson flow.
    });
  }, [apiBaseUrl, learnLanguage, profileName]);

  return { logReviewEvent };
}

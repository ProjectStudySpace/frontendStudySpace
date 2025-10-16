export interface GoogleCalendarAuthProps {
  onAuthComplete?: () => void;
}

export interface GoogleCalendarSyncInfo {
  synced: number;
  total: number;
  message: string;
}

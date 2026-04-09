export type NotificationType = "error" | "warning" | "info" | "success";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string; // ISO string for serialization
  read: boolean;
}

type Listener = () => void;

const STORAGE_KEY = "finlo_notifications";

function loadFromStorage(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
}

let notifications: AppNotification[] = loadFromStorage();
export const EMPTY_NOTIFICATIONS: AppNotification[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const notificationStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): AppNotification[] {
    return notifications;
  },

  add(n: Omit<AppNotification, "id" | "createdAt" | "read">) {
    // Deduplicate: same title already stored today → skip
    const today = new Date().toISOString().slice(0, 10);
    const exists = notifications.some(
      (e) => e.title === n.title && e.createdAt.slice(0, 10) === today
    );
    if (exists) return;

    const next: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifications = [next, ...notifications];
    saveToStorage(notifications);
    notify();
  },

  markAllRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    saveToStorage(notifications);
    notify();
  },

  clearAll() {
    notifications = [];
    saveToStorage(notifications);
    notify();
  },
};

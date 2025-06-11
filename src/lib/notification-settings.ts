// Notification preferences management

type NotificationStyle = "toast" | "browser" | "both";

const NOTIFICATION_STYLE_KEY = "loft5_notification_style";

export function getNotificationStyle(): NotificationStyle {
  const savedStyle = localStorage.getItem(NOTIFICATION_STYLE_KEY);
  return (savedStyle as NotificationStyle) || "toast";
}

export function setNotificationStyle(style: NotificationStyle): void {
  localStorage.setItem(NOTIFICATION_STYLE_KEY, style);
}

export function shouldShowToastNotification(): boolean {
  const style = getNotificationStyle();
  return style === "toast" || style === "both";
}

export function shouldShowBrowserNotification(): boolean {
  const style = getNotificationStyle();
  return style === "browser" || style === "both";
}

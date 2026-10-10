"use client";

import * as React from "react";
import { Bell, BellOff, BellRing, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { savePushSubscription, deletePushSubscription } from "@/lib/actions/reminders";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function NotificationPermission() {
  const [permission, setPermission] = React.useState<PermissionState>("default");
  const [loading, setLoading] = React.useState(false);
  const [subscriptionCount, setSubscriptionCount] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
    // Check existing subscriptions
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscriptionCount(sub ? 1 : 0);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result === "granted" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
          ),
        });

        const subData = sub.toJSON();
        await savePushSubscription({
          endpoint: subData.endpoint || "",
          p256dh: subData.keys?.p256dh || "",
          auth: subData.keys?.auth || "",
        });
        setSubscriptionCount(1);
      }
    } catch (err) {
      console.error("Failed to enable notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await deletePushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
      }
      setPermission("denied");
      setSubscriptionCount(0);
    } catch (err) {
      console.error("Failed to disable notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "unsupported") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
              <BellOff className="h-5 w-5" />
            </div>
            <Badge variant="secondary">Not supported</Badge>
          </div>
          <CardTitle className="pt-2 text-base">Web Push Notifications</CardTitle>
          <CardDescription>
            Your browser does not support push notifications. You can still use in-app reminders.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]">
            {permission === "granted" ? (
              <BellRing className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </div>
          {permission === "granted" ? (
            <Badge variant="default">Enabled</Badge>
          ) : permission === "denied" ? (
            <Badge variant="terracotta">Blocked</Badge>
          ) : (
            <Badge variant="secondary">Not enabled</Badge>
          )}
        </div>
        <CardTitle className="pt-2 text-base">Web Push Notifications</CardTitle>
        <CardDescription>
          {permission === "granted"
            ? "You'll receive gentle reminders even when the app is in the background."
            : permission === "denied"
            ? "Notifications are blocked. Enable them in your browser settings to receive reminders."
            : "Allow notifications to receive gentle medication reminders."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {permission === "granted" && subscriptionCount > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Active on this device. Reminders include Taken, Snooze, and Skip actions.</span>
          </div>
        )}
        <div className="flex gap-2">
          {permission !== "granted" && (
            <Button
              onClick={handleEnable}
              disabled={loading || permission === "denied"}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              {loading ? "Enabling..." : "Enable Notifications"}
            </Button>
          )}
          {permission === "granted" && (
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={loading}
              className="gap-2"
            >
              <BellOff className="h-4 w-4" />
              Disable
            </Button>
          )}
        </div>
        {permission === "denied" && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            To enable notifications, click the lock/tune icon in your browser's address bar and allow notifications for this site.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

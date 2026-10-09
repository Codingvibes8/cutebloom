"use client";

import * as React from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  areNotificationsSupported,
  areNotificationsGranted,
  requestNotificationPermission,
} from "@/lib/push/notifications";
import { getVapidPublicKey, subscribeToPush, unsubscribeFromAllPush } from "@/lib/actions/push-subscriptions";

/**
 * EnableNotifications — Consent flow for Web Push notifications.
 * 
 * Requests notification permission, subscribes to push notifications,
 * and stores the subscription in the database.
 */
export function EnableNotifications() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("default");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [publicKey, setPublicKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supported = areNotificationsSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      // Fetch VAPID public key
      getVapidPublicKey().then((res) => {
        if (res.publicKey) {
          setPublicKey(res.publicKey);
        }
      });
    } else {
      setPermission("unsupported");
    }
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Request permission
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result !== "granted") {
        setError("Notification permission was not granted. Please enable notifications in your browser settings.");
        setIsLoading(false);
        return;
      }

      // Step 2: Subscribe to push notifications
      if (!publicKey) {
        setError("Push notifications are not configured. Please contact support.");
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setError("Service worker not registered. Please refresh the page and try again.");
        setIsLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // Step 3: Store subscription in database
      const subData = subscription.toJSON();
      const result2 = await subscribeToPush({
        subscription: {
          endpoint: subData.endpoint || "",
          keys: {
            p256dh: subData.keys?.p256dh || "",
            auth: subData.keys?.auth || "",
          },
          userAgent: navigator.userAgent,
        },
      });

      if (result2.error) {
        setError(result2.error);
      }
    } catch (err) {
      console.error("[CuteBloom] Failed to enable notifications:", err);
      setError("Failed to enable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      const result = await unsubscribeFromAllPush();
      if (result.error) {
        setError(result.error);
      } else {
        setPermission("denied");
      }
    } catch (err) {
      console.error("[CuteBloom] Failed to disable notifications:", err);
      setError("Failed to disable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser does not support push notifications. You can still use CuteBloom, but medication reminders will not appear as notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Medication Reminders
        </CardTitle>
        <CardDescription>
          Get gentle notifications when it&apos;s time for your medication.
          No pressure, no guilt — just a friendly nudge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "granted" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <BellRing className="h-4 w-4" />
              <span>Notifications are enabled</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive reminders at your scheduled medication times.
              You can snooze for 10 minutes or skip if needed.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisable}
              disabled={isLoading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Disable Notifications
            </Button>
          </div>
        ) : permission === "denied" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
              <BellOff className="h-4 w-4" />
              <span>Notifications are blocked</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Notifications are blocked in your browser settings. To receive medication reminders,
              please enable notifications for this site in your browser settings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive gentle medication reminders. You can
              always disable them later.
            </p>
            <Button
              onClick={handleEnable}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Convert a base64 string to a Uint8Array for VAPID key.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

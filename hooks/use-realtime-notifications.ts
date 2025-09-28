"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types"

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Load initial notifications
    const loadNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      }
    }

    loadNotifications()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[v0] Real-time notification update:", payload)

          if (payload.eventType === "INSERT") {
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
            if (!newNotification.is_read) {
              setUnreadCount((prev) => prev + 1)
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedNotification = payload.new as Notification
            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === updatedNotification.id ? updatedNotification : notification,
              ),
            )
            // Recalculate unread count
            setNotifications((prev) => {
              setUnreadCount(prev.filter((n) => !n.is_read).length)
              return prev
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const markAsRead = async (notificationId: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)
  }

  const markAllAsRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}

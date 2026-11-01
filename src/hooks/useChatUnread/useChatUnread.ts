"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnreadCount } from "@/services/chatService";

/** Sent by an open chat when it has shown new messages, so the red badge updates at once. */
export const CHAT_READ_EVENT = "chat:read";

const CHECK_MS = 15000;

/** How many chat messages the signed-in person has not read yet (for the red badge on "Messages"). */
export function useChatUnread() {
  const [count, setCount] = useState(0);

  const check = useCallback(async () => {
    try {
      setCount((await getUnreadCount()).count);
    } catch {
      // Keep the number we have; the next check tries again.
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(() => {
      if (!document.hidden) check();
    }, CHECK_MS);
    window.addEventListener(CHAT_READ_EVENT, check);
    return () => {
      clearInterval(timer);
      window.removeEventListener(CHAT_READ_EVENT, check);
    };
  }, [check]);

  return count;
}

"use client";

import { calendarFile } from "@/lib/groups";
import type { MyGroup } from "@/types";
import styles from "./AddToCalendar.module.css";

/** Downloads a calendar file for the group's weekly session, which opens in Google, Apple or Outlook calendar. */
export default function AddToCalendar({ group }: { group: Pick<MyGroup, "name" | "dayOfWeek" | "startTime" | "endTime" | "zoomLink"> }) {
  function download() {
    const url = URL.createObjectURL(new Blob([calendarFile(group)], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${group.name.replace(/\W+/g, "-").toLowerCase()}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <button type="button" className={styles.button} onClick={download}>Add to calendar</button>;
}

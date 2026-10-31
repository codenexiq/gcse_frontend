"use client";

import { useEffect, useState } from "react";
import { getSubjects } from "@/services/subjectService";
import type { Subject } from "@/types";

// Subjects and topics are reference data that almost never change, so we load them ONCE
// and reuse them instead of calling the API every time a component needs them:
//   1. memory       - shared by every component while the tab is open
//   2. localStorage - survives page reloads and new tabs for CACHE_MS
//   3. the API      - only when both of the above are empty or too old
const STORAGE_KEY = "educ:subjects:v1";
const CACHE_MS = 60 * 60 * 1000; // 1 hour

let memory: Subject[] | null = null; // the cached data
let inflight: Promise<Subject[]> | null = null; // a request already on its way (so 5 components cause only 1 request)

function readStored(): Subject[] | null {
  try {
    const { savedAt, data } = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
    return Date.now() - savedAt < CACHE_MS && Array.isArray(data) ? data : null;
  } catch {
    return null; // nothing stored, corrupt, or storage blocked
  }
}

function load(): Promise<Subject[]> {
  if (memory) return Promise.resolve(memory);

  const stored = readStored();
  if (stored) {
    memory = stored;
    return Promise.resolve(stored);
  }

  inflight ??= getSubjects()
    .then((data) => {
      memory = data;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
      } catch {}
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Forget the cached data (used on log out). */
export function clearSubjectsCache() {
  memory = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/** Returns { subjects, loading, error }. Subjects look like { id, name, topics: [{ id, name }] }. */
export function useSubjects() {
  const [state, setState] = useState<{ subjects: Subject[]; loading: boolean; error: string | null }>({
    subjects: memory ?? [],
    loading: !memory,
    error: null,
  });

  useEffect(() => {
    let active = true;
    load()
      .then((subjects) => active && setState({ subjects, loading: false, error: null }))
      .catch((err) => active && setState({ subjects: [], loading: false, error: err.message }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}

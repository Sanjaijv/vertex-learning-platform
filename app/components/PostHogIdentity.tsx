"use client";

import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

export function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (
      !isLoaded ||
      !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
      !process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) return;

    if (user) {
      if (identifiedUserId.current && identifiedUserId.current !== user.id) {
        posthog.reset();
      }

      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
      });
      identifiedUserId.current = user.id;
      return;
    }

    if (identifiedUserId.current) {
      posthog.reset();
      identifiedUserId.current = null;
    }
  }, [isLoaded, user]);

  return null;
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as m from "@/paraglide/messages.js";
import { usePostHog } from "posthog-js/react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.albert.impulseguard";
const APP_STORE_URL = "https://apps.apple.com/us/app/impulseguard/id6746700335";

function DownloadButtons({ className }: { className?: string }) {
  const posthog = usePostHog();

  const handleStoreClick = (platform: "google_play" | "app_store") => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    posthog?.capture("store_button_clicked", {
      platform,
      current_url: window.location.href,
      referrer: document.referrer || undefined,
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_content: params.get("utm_content") || undefined,
      utm_term: params.get("utm_term") || undefined,
    });
  };

  return (
    <div
      className={cn(
        "flex flex-row justify-center gap-8 mx-9 mt-7 md:mt-14 md:mx-0 md:flex",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleStoreClick("google_play")}
          >
            <Image
              className={twMerge("cursor-pointer")}
              src={"/google_play.png"}
              width={167}
              height={56}
              alt={"Google Play"}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{m.get_started_free()}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleStoreClick("app_store")}
          >
            <Image
              className={twMerge("cursor-pointer")}
              src={"/app_store.png"}
              width={167}
              height={56}
              alt={"App store"}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{m.get_started_appstore()}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default DownloadButtons;

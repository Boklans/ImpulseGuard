"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { twJoin } from "tailwind-merge";
import { fontRobotoBold } from "@/app/fonts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { apiClient } from "@/app/globals";
import JSConfetti from "js-confetti";
import { languageTag } from "@/paraglide/runtime";
import * as m from "@/paraglide/messages";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

let confetti: JSConfetti | undefined = undefined;

if (typeof window !== "undefined") {
  confetti = new JSConfetti();
}

export type Platform = "google_play" | "app_store";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function SubscribeModal({
  display,
  hide,
  platform,
}: {
  display: boolean;
  hide: () => void;
  platform: Platform;
}) {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const { toast } = useToast();
  const language = languageTag();

  function validateEmail(value: string) {
    if (value === "") {
      setEmailError("");
      return false;
    }
    if (!isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  }

  async function subscribe() {
    if (!validateEmail(email)) return;

    setIsLoading(true);
    try {
      await apiClient.post(`/subscribe`, {
        email,
        platform,
        language,
      });

      if (typeof window !== "undefined") {
        confetti?.addConfetti();
      }
      hide();
      setEmail("");
    } catch (e) {
      toast({
        variant: "destructive",
        title: m.toast_already_subscribed_title(),
      });
      hide();
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={display} onOpenChange={hide}>
      <DialogContent className=" max-w-[90%] md:w-auto p-4 md:p-6 rounded-[20px] bg-[url(/subscribe_modal_bg.svg)] gap-[10px] bg-cover ">
        <h3
          className={twJoin(
            fontRobotoBold.variable,
            "text-sm mt-4 md:text-[20px] col-span-3 font-semibold text-center self-center"
          )}
        >
          {m.modal_subscribe()}
        </h3>
        <div className="w-full">
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => email && validateEmail(email)}
            type="email"
            placeholder="example@gmail.com"
            className={twJoin(
              "px-2 md:px-6 rounded-[10px] md:w-80",
              emailError && "border-red-500 focus-visible:ring-red-500"
            )}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-red-500 text-xs mt-1">
              {emailError}
            </p>
          )}
        </div>
        <Button
          onClick={subscribe}
          disabled={isLoading || !email}
          className="bg-subscribeButton hover:bg-subscribeButton/80 gap-2 flex flex-row items-center justify-center disabled:opacity-50"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Image
              src="/icons/heart.svg"
              alt=""
              width={36}
              height={40}
              className="aspect-square w-6 h-6"
            />
          )}
          <span className="text-white text-sm md:text-[18px]">
            {m.modal_subscribe_button()}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

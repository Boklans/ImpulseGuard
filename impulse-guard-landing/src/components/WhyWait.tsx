"use client";

import { twJoin, twMerge } from "tailwind-merge";
import { fontInterVariable } from "@/app/fonts";
import Image from "next/image";
import * as m from "@/paraglide/messages";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import DownloadButtons from "./DownloadButtons";

export function WhyWait({ className }: { className?: string }) {
  const containerRef = useRef<any>();

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          start: "10% 85%",
          trigger: containerRef.current,
        },
      });

      tl.from(
        ".gsapTitle",
        {
          opacity: 0,
          y: -20,
            lazy: false,
        },
        "start"
      );
      tl.from(
        ".gsapDesc",
        {
          opacity: 0,
          y: 20,
            lazy: false,
        },
        "<+=0.5"
      );
      tl.from(
        ".gsapDownloads",
        {
          opacity: 0,
            lazy: false,
        },
        "<+=0.5"
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      className={twMerge(
        className,
        "flex flex-col items-center overflow-hidden"
      )}
      ref={containerRef}
    >
      <div
        className={
          "grid-flow-row rounded-[20px] px-3 md:px-[64px] md:pt-6 lg:pt-[91px] md:grid md:grid-cols-4 grid-rows-1  bg-[url(/why_wait_bg.svg)] md:bg-[url(/why_wait_bg_lg.svg)] bg-cover overflow-hidden md:h-[555px]"
        }
        id={"why_wait"}
      >
        <div className={"flex flex-col col-span-1 sm:col-span-2 h-min"}>
          <h2
            className={twJoin(
              fontInterVariable.variable,
              "gsapTitle text-[32px] mt-6 font-medium leading-10 text-center md:text-left"
            )}
          >
            {m.why_wait()}
          </h2>
          <p
            className={"gsapDesc hidden md:flex md:mt-2 text-[20px] leading-6"}
          >
            {m.title_2()}
          </p>
          <DownloadButtons className="gsapDownloads mt-10 mb-28 md:flex flex-row justify-center md:justify-start" />
        </div>
        <div className="hidden md:flex col-span-3 col-start-3 overflow-hidden justify-center">
          <Image
            src={"/smartphone2.png"}
            alt={"smartphone"}
            width={369}
            height={729}
            className="relative top-1/4 w-[341px] h-max hidden md:block"
          />
        </div>
      </div>
    </div>
  );
}

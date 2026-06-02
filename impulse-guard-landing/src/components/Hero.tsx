import { twJoin, twMerge } from "tailwind-merge";
import { fontInterVariable, fontRobotoMedium } from "@/app/fonts";
import Image from "next/image";
import * as m from "@/paraglide/messages.js";
import DownloadButtons from "./DownloadButtons";
import { AnimatedText } from "@/components/AnimatedText";

export function Hero({ className }: { className?: string }) {
  return (
    <main className={twMerge(className, "flex flex-col md:flex-row-reverse")}>
      <div className="flex flex-col md:mt-[120px] md:ml-10 items-center md:items-start">
        <h1
          className={twJoin(
            fontInterVariable.variable,
            "text-[32px] font-bold leading-10 text-center md:text-left"
          )}
        >
          <AnimatedText texts={m.title_1().split("%")} />
        </h1>
        <p
          className={twJoin(
            fontRobotoMedium.variable,
            "text-[20px] leading-6 text-center mt-3 mx-4 md:mx-0 md:text-left"
          )}
        >
          {m.title_2()}
        </p>
        <DownloadButtons />
        <div
          className={
            "hidden md:flex flex-col justify-center items-center flex-1 w-full"
          }
        >
          <Image
            src={"/arrow_down.svg"}
            alt={"hero image"}
            width={128}
            height={128}
            className={"mt-6 relative left-10 select-none"}
          />
        </div>
      </div>
      <Image
        className={"mt-6  md:min-h-[60vh] md:min-w-[40vw]"}
        src={"/hero_image.png"}
        alt={"hero image"}
        width={788}
        height={912}
      />
    </main>
  );
}

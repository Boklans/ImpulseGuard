"use client"

import {twJoin, twMerge} from "tailwind-merge";
import Image from "next/image";
import {fontRobotoMedium} from "@/app/fonts";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {useRef} from "react";

export function Row(props: { className?: string; image: string; text: string }) {
  const container = useRef<any>()

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top 85%",
        end: "bottom 25%",
      }
    })
    tl.from(".gsapImage", {
      x: -20,
      opacity: 0,
      lazy: false,
    })
    tl.from(".gsapText", {
      y: -20,
      opacity: 0,
      lazy: false,
    })
  }, {scope: container})

  return (
    <div
      className={twMerge(props.className, "flex flex-row gap-5 items-center")}
      ref={container}
    >
      <Image
        src={props.image}
        alt={"icon"}
        className="gsapImage aspect-square w-12 h-auto"
        width={48}
        height={48}
      />
      <span
        className={twJoin(
          fontRobotoMedium.variable,
          "gsapText text-wrap font-normal leading-6 ",
          "text-[24px]"
        )}
      >
        {props.text}
      </span>
    </div>
  );
}

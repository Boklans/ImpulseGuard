"use client"

import {twJoin, twMerge} from "tailwind-merge";
import Image from "next/image";
import {fontInterVariable} from "@/app/fonts";
import {useRef} from "react";
import {useGSAP} from "@gsap/react";
import {gsap} from "gsap";



export function Step(props: {className?: string, imagePath: string, title: string, description: string, isLast?: boolean}) {
  const container = useRef<any>()

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        end: "bottom 15%",
        start: "top 85%",
      }
    })


    tl.from(".gsapTitle", {
      opacity: 0,
      x: -18,
      duration: 1,
      lazy: false,
    }, "")
    tl.from(".gsapDesc", {
      opacity: 0,
      y: -18,
      duration: 1,
      lazy: false,
    }, "<+=0.5")
  }, {scope: container})

  return <div className={twMerge(props.className, "-mb-9 flex flex-row")} ref={container}>
    <Image src={props.imagePath} alt={"step"} width={172/1.5} height={!props.isLast ? 322/1.5 : 64} />
    <div className={twJoin(fontInterVariable.variable, "flex flex-col mt-4 mx-2")}>
      <h3 className={"gsapTitle text-[24px] leading-8 font-medium mb-2"}>{props.title}</h3>
      <p className={"gsapDesc md:text-xl text-[14px] leading-4 font-light"}>
        {props.description}
      </p>
    </div>
  </div>
}
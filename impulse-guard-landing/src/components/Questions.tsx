"use client"

import {twJoin, twMerge} from "tailwind-merge";
import {fontInterVariable, fontRobotoBold, fontRobotoLight, fontRobotoMedium, fontRobotoThin} from "@/app/fonts";
import Image from "next/image";
import * as m from "@/paraglide/messages"
import {useRef} from "react";
import {useGSAP} from "@gsap/react";
import {gsap} from "gsap";
import {Link} from "@/lib/i18n";



export function Questions({className}: {className?: string}) {

  return <div className={twMerge(className, "flex flex-col mx-6")}>
    <h2 className={twJoin(fontInterVariable.variable, "text-[48px] font-medium leading-tight text-center md:text-left md:font-bold")}>
      {m.faq_title()}
    </h2>
    <div className={"flex flex-col gap-9 mt-9 md:mt-7"}>
      <FaqRow q={m.faq_1_question()} a={m.faq_1_answer()} />
      <FaqRow q={m.faq_2_question()} a={m.faq_2_answer()} />
      <FaqRow q={m.faq_3_question()} a={m.faq_3_answer()} />
    </div>
    <Link href={"mailto:support@impulseguard.app"} className={"flex flex-row mt-9 text-link gap-1.5 text-[16px] font-medium leading-4 items-center cursor-pointer"}>
      <Image src={"/icons/mail.svg"} alt={"mail"} width={23} height={19} />
      Ask a question
    </Link>
  </div>
}

function FaqRow(props: { className?: string, q: string, a: string }) {
  const containerRef = useRef<any>()

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
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
  }, {scope: containerRef})

  return <div className={twMerge(props.className, "flex flex-col")} ref={containerRef}>
    <h4 className={twJoin(fontRobotoBold.variable, "gsapTitle font-bold text-[24px] leading-8")}>{props.q}</h4>
    <p className={twJoin(fontRobotoLight.variable, "gsapDesc font-light mt-2")}>{props.a}</p>
  </div>
}
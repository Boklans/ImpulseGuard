"use client";

import { twJoin, twMerge } from "tailwind-merge";
import { fontInterVariable } from "@/app/fonts";
import { Step } from "@/components/Step";
import { useRef, useState } from "react";
import Image from "next/image";
import * as m from "@/paraglide/messages";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

interface StepTexts {
  title: string;
  description: string;
}

export function HowItWorks({ className }: { className?: string }) {
  const steps: StepTexts[] = [
    {
      title: m.step_1(),
      description: m.step_1_description(),
    },
    {
      title: m.step_2(),
      description: m.step_2_description(),
    },
    {
      title: m.step_3(),
      description: m.step_3_description(),
    },
    {
      title: m.step_4(),
      description: m.step_4_description(),
    },
  ];

  const container = useRef<any>();

  useGSAP(
    () => {
      gsap.from(".gsapImage", {
        x: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: container.current,
          end: "10% 25%",
          start: "top 75%",
        },
        lazy: false,
      });
    },
    { scope: container }
  );

  return (
    <div
      className={twMerge(className, "flex flex-row justify-between")}
      ref={container}
    >
      <div className="flex flex-col">
        <h2
          className={twJoin(
            fontInterVariable.variable,
            "text-[48px] font-medium mb-8  leading-10 text-center md:text-left"
          )}
        >
          {m.how_it_works()}
        </h2>
        <div className={" flex flex-col"}>
          {steps.map((v, i) => {
            return (
              <Step
                key={"step" + i}
                imagePath={`/steps/${i + 1}.png`}
                title={v.title}
                description={v.description}
                isLast={i == steps.length - 1}
              />
            );
          })}
        </div>
      </div>
      <Image
        src={"/smartphone.png"}
        alt={"smartphone"}
        width={369}
        height={729}
        className="gsapImage hidden md:block"
      />
    </div>
  );
}

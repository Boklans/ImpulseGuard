import { twJoin, twMerge } from "tailwind-merge";
import { fontInterVariable, fontRobotoMedium } from "@/app/fonts";
import Image from "next/image";
import * as m from "@/paraglide/messages";
import { Row } from "@/components/Row";

export function Tools({ className }: { className?: string }) {
  return (
    <div className={twMerge(className, "flex flex-col items-center")}>
      <h2
        className={twJoin(
          fontInterVariable.variable,
          "text-[48px] font-medium leading-tight text-center"
        )}
      >
        {m.tools_for_your_journey()}
      </h2>
      <div className="flex flex-col items-center md:flex-row md:justify-between md:gap-28">
        <div className="flex flex-1 flex-col items-center justify-center w-full px-6 md:px-0">
          <div className="relative flex items-center justify-center py-10">
            <div className="w-48 h-16 bg-[#ADC8FF] blur-lg rounded-full absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-white z-20 text-center font-medium text-[36px] relative">
              {m.achieve()}
            </p>
          </div>

          <div className={"flex flex-col gap-12 w-full"}>
            <Row image={"/icons/clock.svg"} text={m.tool_1()} />
            <Row image={"/icons/flame.svg"} text={m.tool_2()} />
            <Row image={"/icons/books.svg"} text={m.tool_3()} />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center w-full px-6 md:px-0">
          <div className="relative flex items-center justify-center py-10">
            <div className="w-48 h-16 bg-[#ADC8FF] blur-lg rounded-full absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-white z-20 text-center font-medium text-[36px] relative">
              {m.play()}
            </p>
          </div>
          <div className={"flex flex-col gap-12 w-full"}>
            <Row image={"/icons/cat.svg"} text={m.tool_4()} />
            <Row image={"/icons/trophy.svg"} text={m.tool_5()} />
            <Row image={"/icons/crown.svg"} text={m.tool_6()} />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center px-6 md:px-0">
          <div className="relative flex items-center justify-center py-10">
            <div className="w-64 h-16 bg-[#ADC8FF] blur-lg rounded-full absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-white z-20 text-center font-medium text-[36px] relative">
              {m.personalize()}
            </p>
          </div>
          <div className={"flex flex-col gap-12 w-full"}>
            <Row image={"/icons/man.svg"} text={m.tool_7()} />
            <Row image={"/icons/glasses.svg"} text={m.tool_8()} />
            <Row image={"/icons/brush.svg"} text={m.tool_9()} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {twJoin, twMerge} from "tailwind-merge";
import {fontRobotoMedium} from "@/app/fonts";
import Image from "next/image";
import {ReactNode, useState} from "react";
import LanguageSelector from "@/components/LangSelector";
import * as m from "@/paraglide/messages";
import {Sheet, SheetContent} from "@/components/ui/sheet";
import {Link} from "@/lib/i18n";
import {gsap} from "gsap";

export function Navbar({className}: { className?: string }) {
  const [menuState, setMenuState] = useState(false);

  return (
    <nav
      className={twMerge(
        className,
        "justify-between mx-[22px] md:mx-0 flex-row flex"
      )}
      aria-label="Main navigation"
    >
      <div
        className={twJoin(
          fontRobotoMedium.variable,
          "md:text-4xl text-3xl flex flex-row gap-4 font-medium items-center"
        )}
      >
        <Image
          src={"/logo.png"}
          alt="Logo"
          className=" w-12 h-12 md:w-16 md:h-16"
          width={64}
          height={64}
        />
        ImpulseGuard
      </div>

      <div
        className={twMerge("flex gap-2 md:gap-8 items-center justify-center")}
      >
        <LanguageSelector/>
        <ButtonLink onClick={() => {
          gsap.to(window, { duration: 1, scrollTo: "#why_wait" })
        }} className="hidden md:block">{m.download()}</ButtonLink>
        <ButtonLink href={"mailto:support@impulseguard.app"} className="hidden md:block">{m.contact()}</ButtonLink>
        <Hamburger
          handler={() => setMenuState(!menuState)}
          className="md:hidden"
        />
      </div>

      <Sheet open={menuState} onOpenChange={() => setMenuState(false)}>
        <SheetContent
          side={"top"}
          className="w-full flex flex-col gap-4 bg-background"
        >
          <ButtonLink href={"#why_wait"}>{m.download()}</ButtonLink>
          <ButtonLink href={"#why_wait"}>{m.contact()}</ButtonLink>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

function Hamburger({
                     className = "",
                     handler = () => null,
                     isCross = false,
                   }: {
  className?: string;
  handler?: () => void;
  isCross?: boolean;
}) {
  return (
    <button
      className={twMerge(className, "p-1")}
      onClick={handler}
      aria-label={isCross ? "Close menu" : "Open menu"}
      aria-expanded={isCross}
    >
      {!isCross ? (
        <Image
          src={"/hamburger.svg"}
          alt=""
          width={30}
          height={30}
        />
      ) : (
        <Image
          className="rotate-45"
          src={"/icons/add.svg"}
          alt=""
          width={30}
          height={30}
        />
      )}
    </button>
  );
}

function ButtonLink({
                      className = "",
                      href = "",
                      children,
                      onClick = () => null
                    }: {
  className?: string;
  href?: string;
  children?: ReactNode;
  onClick?: () => void
}) {
  return (
    <Link
      className={twMerge(
        "text-[24px] font-medium leading-7 cursor-pointer",
        className
      )}
      href={href ?? ""}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

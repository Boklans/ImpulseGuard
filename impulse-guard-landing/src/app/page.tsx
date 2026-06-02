'use client'

import {Navbar} from "@/components/Navbar";
import {Hero} from "@/components/Hero";
import {HowItWorks} from "@/components/HowItWorks";
import {Tools} from "@/components/Tools";
import {WhyWait} from "@/components/WhyWait";
import {Questions} from "@/components/Questions";
import {Pitfall} from "@/components/Pitfall";
import {GsapProvider} from "@/components/GsapProvider";

export default function Home() {
  return <GsapProvider>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-subscribeButton focus:text-white focus:rounded-md focus:outline-none"
    >
      Skip to main content
    </a>
    <div className={"md:px-16 lg:px-32"}>
      <Navbar className={"mt-4 md:my-10"}/>
      <main id="main-content">
        <Hero className={"mt-4 md:mt-0"}/>
        <HowItWorks className={"mt-12"}/>
        <Tools className={"mt-20 mx-5"}/>
        <WhyWait className={"my-20 mx-5"}/>
        <Questions className={"mb-24"}/>
      </main>
      <Pitfall className={"w-full"}/>
    </div>
  </GsapProvider>;
}

"use client"

import {useGSAP} from "@gsap/react";
import {useMemo, useRef, useState} from "react";
import gsap from "gsap";

export function AnimatedText({texts= ["example text", "example text 2"]}: {texts?: string[]}) {
  const ref = useRef<any>()
  const [index, setIndex] = useState(0);
  const currentText  = useMemo(() => texts[index % texts.length], [index])

  function onRepeat() {
    setIndex((prev) => prev + 1)
    console.log(currentText)
  }

  useGSAP(() => {
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
      onRepeat
    })

    tl.from(ref.current, {
      opacity: 0,
      duration: 2,
      ease: "expo.out",
    })

  })

  return (
    <span ref={ref}>{currentText}</span>
  )
}
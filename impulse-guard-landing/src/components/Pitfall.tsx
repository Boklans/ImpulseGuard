import {twJoin, twMerge} from "tailwind-merge";
import {fontInterVariable} from "@/app/fonts";
import {Link} from "@/lib/i18n";

export function Pitfall({className}: {className?: string}) {
  return <div className={twMerge(className, "gap-9 flex flex-row justify-around bg-pitfall rounded-t-[32px] p-7")}>
    <L href={"/docs/policy"} text={"Privacy Policy"} />
    <L href={"/docs/terms"} text={"Terms of Use"} />
    <L href={"mailto:support@impulseguard.app"} text={"Contact"} />
  </div>
}

function L(props: {text: string, href?: string}) {
  return <Link href={props.href ?? ""} className={twJoin(fontInterVariable.variable, "text-[12px] md:text-[20px] md:leading06 leading-4 font-bold cursor-pointer")}>{props.text}</Link>
}

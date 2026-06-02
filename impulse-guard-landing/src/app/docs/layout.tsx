import {ReactNode} from "react";

export default function DocsLayout({children}: {children: ReactNode}) {
  return (<div className={"flex flex-col items-center p-8 py-10 bg-background"}>
    {children}
  </div>)
}
'use client'

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {useEffect} from "react";
import {languageTag} from "@/paraglide/runtime";
import {useRouter} from "@/lib/i18n";
import {cn} from "@/lib/utils";
import {fontEmojiVariable} from "@/app/fonts";

type Code = "en" | "es" | "fr" | "de" | "it" | "ja" | "cn" | "ru" | "ua" | undefined

const languages = [
  { code: "cn", name: "China", flag: "🇨🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ua", name: "Українська", flag: "🇺🇦" },
]

interface LanguageSelectorProps {
  className?: string
}

export default function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const router = useRouter()
  const [selectedLang, _] = React.useState((languageTag() as any | null) ?? languages[0].code)

  return (
    <Select value={selectedLang} onValueChange={value => {
      router.push("/", { locale: value as Code })
    }}>
      <SelectTrigger className={`w-[40px] bg-transparent border-none h-min p-1  ${className}`}>
        <SelectValue className={fontEmojiVariable.variable}>
          {languages.find(lang => lang.code === selectedLang)?.flag}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="sr-only">Languages</SelectLabel>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className={cn("flex items-center", fontEmojiVariable.variable)}>
                <span className="mr-2 text-base">{lang.flag}</span>
                <span className="hidden sm:inline">{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
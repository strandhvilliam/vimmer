"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { useChangeLocale, useCurrentLocale, useI18n } from "@/locales/client";

const languages = [
  { label: "English", value: "en" },
  { label: "Svenska", value: "sv" },
] as const;

export function LanguageToggle() {
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();

  return (
    <Select defaultValue={locale} onValueChange={changeLocale}>
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

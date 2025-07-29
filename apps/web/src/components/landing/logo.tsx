import { Icon } from "@iconify/react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-sm">
      {/* <img src="/vimmer-black.svg" alt="vimmer" className="w-8" /> */}
      <Icon icon="camera" className="w-8 h-8" />
      <span className="font-rocgrotesk font-bold text-4xl underline">
        blicka
      </span>
    </div>
  );
}

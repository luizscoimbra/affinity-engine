import { useState } from "react";
import { cn } from "@/lib/utils";

const EMOJI_CATEGORIES = [
  {
    name: "Populares",
    emojis: ["❤️", "😍", "🔥", "✨", "😂", "🥰", "🥺", "😊", "😘", "🥳", "🙈", "🥂"],
  },
  {
    name: "Reações",
    emojis: ["👍", "👏", "🙌", "💯", "💖", "💕", "💘", "🌹", "💋", "💫", "🌟", "🎉"],
  },
  {
    name: "Encontros & Lazer",
    emojis: ["☕", "🍕", "🍷", "🍹", "🍣", "🍦", "🏖️", "✈️", "🎵", "🎸", "🎬", "🍿"],
  },
  {
    name: "Emoções",
    emojis: ["🤩", "😎", "😜", "🤭", "🤤", "😇", "🤔", "😴", "😏", "💃", "🕺", "🐱"],
  },
];

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  className?: string;
}

export function EmojiPickerPopover({ onSelectEmoji, onClose, className }: EmojiPickerPopoverProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      className={cn(
        "absolute bottom-16 left-2 right-2 sm:left-4 sm:right-auto sm:w-80 z-50 rounded-2xl border border-white/15 bg-[#221828]/95 p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 zoom-in-95 duration-200",
        className,
      )}
    >
      {/* Category Tabs */}
      <div className="flex border-b border-white/10 pb-2 mb-2 gap-1 overflow-x-auto scrollbar-hide">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0",
              activeTab === idx
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-2 p-1 max-h-48 overflow-y-auto">
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-transform hover:scale-125 hover:bg-white/10 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Close button indicator */}
      <div className="pt-2 mt-1 border-t border-white/5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

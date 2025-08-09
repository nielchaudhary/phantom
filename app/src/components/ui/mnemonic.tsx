export default function Mnemonic({ mnemonic }: { mnemonic: string[] }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-4 p-3 mx-auto max-w-md">
        {mnemonic.map((word, index) => (
          <MnemonicWord key={index} word={word} index={index} />
        ))}
      </div>
    </div>
  );
}

function MnemonicWord({ word, index }: { word: string; index: number }) {
  return (
    <div className="px-3 py-2 bg-black border border-zinc-700 transition-all duration-300 hover:-translate-y-0.5 rounded-lg text-white text-sm text-center cursor-pointer flex items-center justify-center min-h-[40px]">
      <span className="text-xs text-zinc-400 mr-2">{index + 1}.</span>
      {word}
    </div>
  );
}

export function MnemonicInput({
  mnemonic = [],
  onChange,
}: {
  mnemonic?: string[];
  onChange?: (mnemonic: string[]) => void;
}) {
  const words = mnemonic.length > 0 ? mnemonic : Array(12).fill("");

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    onChange?.(newWords);
  };

  const handlePasteWords = (pastedWords: string[]) => {
    const newWords = Array(words.length).fill("");
    for (let i = 0; i < Math.min(words.length, pastedWords.length); i++) {
      newWords[i] = pastedWords[i];
    }
    onChange?.(newWords);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-4 p-3 mx-auto max-w-md">
        {words.map((word, index) => (
          <MnemonicInputWord
            key={index}
            word={word}
            index={index}
            onChange={(value) => handleWordChange(index, value)}
            onPasteWords={handlePasteWords}
          />
        ))}
      </div>
    </div>
  );
}

function MnemonicInputWord({
  word,
  index,
  onChange,
  onPasteWords,
}: {
  word: string;
  index: number;
  onChange?: (value: string) => void;
  onPasteWords?: (words: string[]) => void;
}) {
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const words = pastedText.trim().split(/\s+/);
    if (words.length > 1 && onPasteWords) {
      e.preventDefault();
      onPasteWords(words);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-zinc-400 z-10">
        {index + 1}.
      </span>
      <input
        type="text"
        className="w-full pl-8 pr-3 py-2 bg-black border border-zinc-700 transition-all duration-300 hover:-translate-y-0.5 focus:border-zinc-500 rounded-lg text-white text-sm text-center outline-none min-h-[40px]"
        value={word}
        onChange={(e) => onChange?.(e.target.value)}
        onPaste={handlePaste}
        placeholder=""
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

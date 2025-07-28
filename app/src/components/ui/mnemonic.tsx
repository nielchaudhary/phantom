export default function Mnemonic({ mnemonic }: { mnemonic: string[] }) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-6 p-3 mx-auto max-w-4xl">
        {mnemonic.map((word, index) => (
          <MnemonicWord key={index} word={word} />
        ))}
      </div>
    </div>
  );
}

function MnemonicWord({ word }: { word: string }) {
  return (
    <div className="px-4 py-2 bg-black border border-zinc-700 transition-all duration-300 hover:-translate-y-0.5 rounded-lg text-white text-sm min-w-[100px] text-center cursor-pointer">
      {word}
    </div>
  );
}

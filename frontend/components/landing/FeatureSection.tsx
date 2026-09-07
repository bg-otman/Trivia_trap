import { ArrowRight, BrainCircuit, Check, Crown, Users, Zap } from "lucide-react";

const players = [
  { name: "Alex", score: 2600, avatar: "🧑🏾‍🦱" },
  { name: "Maya", score: 2300, avatar: "👩🏽" },
  { name: "You", score: 3100, avatar: "🧑🏻‍🦰", active: true },
  { name: "James", score: 1800, avatar: "👨🏿" },
  { name: "Luna", score: 1500, avatar: "👩🏻" },
];

const panel = "relative z-[4] min-h-[242px] rounded-[19px] border border-[rgba(142,158,213,.18)] bg-[linear-gradient(145deg,rgba(9,17,43,.76),rgba(3,9,27,.82))] p-4 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] backdrop-blur-[18px]";

export default function FeatureSection() {
  return (
    <div className="mx-auto grid max-w-[1390px] grid-cols-[31%_1fr] gap-4 max-[1050px]:grid-cols-1 max-[760px]:hidden">
      <section className={panel} id="features">
        <h2 className="m-0 flex items-center gap-2 text-base">💗 Why you&apos;ll love Trivia Trap</h2>
        <Benefit icon={<Zap className="w-[22px]" />} title="Easy to learn" text="Jump in a room and start the fun in seconds." />
        <Benefit icon={<BrainCircuit className="w-[22px]" />} title="Bluff & Outsmart" text="Not sure of the answer? Bluff your way to victory." />
        <Benefit tone="amber" icon={<Users className="w-[22px]" />} title="Play with anyone" text="Friends or random players, the party is always on!" />
      </section>
      <section className={panel} id="leaderboard">
        <div className="grid grid-cols-[120px_1fr_160px] items-center gap-4">
          <div><small className="block text-[.65rem] text-[#a8aec1]">Room Code</small><strong className="block text-[.88rem]">7X4K2B</strong></div>
          <div className="text-center"><strong className="text-[.88rem]">Round 3 / 10</strong><div className="mt-[.45rem] flex justify-center gap-1"><i className="h-1 w-11 rounded-[9px] bg-[linear-gradient(90deg,#5c65ff,#ad42ff)]" /><i className="h-1 w-11 rounded-[9px] bg-[linear-gradient(90deg,#5c65ff,#ad42ff)]" /><i className="h-1 w-11 rounded-[9px] bg-[#202744]" /><i className="h-1 w-11 rounded-[9px] bg-[#202744]" /><i className="h-1 w-11 rounded-[9px] bg-[#202744]" /></div></div>
          <span className="flex items-center justify-end gap-[.45rem] text-[.72rem] text-[#b8bdcc]"><Crown className="w-[27px] fill-[#ffc51f] text-[#ffc51f] drop-shadow-[0_0_9px_#ff9f00]" /> Leaderboard <ArrowRight className="w-4" /></span>
        </div>
        <div className="my-3 grid grid-cols-5 gap-[.7rem]">
          {players.map((player) => <div className="relative flex items-center justify-center gap-[.45rem]" key={player.name}><span className={`grid h-[43px] w-[43px] place-items-center rounded-full border-2 bg-[#112149] text-[1.75rem] ${player.active ? "border-[#f067ff] shadow-[0_0_18px_rgba(238,79,255,.5)]" : "border-[#2b67b8]"}`}>{player.avatar}</span><div><small className="block text-[.67rem]">{player.name}</small><strong className="mt-[.15rem] block text-[.85rem]">{player.score}</strong></div>{player.active && <Crown className="absolute right-[18%] top-[-6px] w-[14px] fill-[#ffd225] text-[#ffd225]" />}</div>)}
        </div>
        <div className="relative rounded-[13px] border border-[rgba(112,132,192,.12)] bg-[rgba(4,11,31,.72)] p-[.6rem_.8rem]"><p className="m-0 mb-2 text-[.84rem]"><span className="mr-[.55rem] rounded-md bg-[#0e6b9e] px-2 py-1 text-[.65rem]">Science</span>Which element has the chemical symbol ‘O’?</p><div className="grid grid-cols-4 gap-[.55rem] pr-[3.6rem]"><Answer text="A  Gold" /><Answer text="B  Oxygen" selected /><Answer text="C  Iron" /><Answer text="D  Silver" /></div><div className="absolute right-[.6rem] top-1/2 grid h-[43px] w-[43px] -translate-y-[18%] place-items-center rounded-full border-2 border-[#7777ff] text-[.78rem]">12s</div></div>
      </section>
    </div>
  );
}

function Benefit({ icon, title, text, tone = "purple" }: { icon: React.ReactNode; title: string; text: string; tone?: string }) {
  return <div className="mt-[.85rem] grid grid-cols-[43px_1fr] items-start gap-[.85rem]"><span className={`grid h-[39px] w-[39px] place-items-center rounded-xl border border-[rgba(154,75,255,.23)] ${tone === "amber" ? "bg-[rgba(255,178,20,.09)] text-[#ffc326]" : "bg-[rgba(137,48,255,.14)] text-[#d84fff]"}`}>{icon}</span><div><h3 className="m-0 mb-[.12rem] text-[.86rem]">{title}</h3><p className="m-0 text-[.73rem] leading-[1.35] text-[#b0b5c6]">{text}</p></div></div>;
}

function Answer({ text, selected = false }: { text: string; selected?: boolean }) {
  return <button className={`flex min-h-[34px] items-center justify-between rounded-[9px] border px-[.7rem] text-left text-[.7rem] ${selected ? "border-[#d14ff0] bg-[linear-gradient(90deg,#5041e5,#b22bd3)] text-white" : "border-[rgba(82,97,143,.14)] bg-[#091126] text-[#d9dbe4]"}`}>{text}{selected && <Check className="w-4" />}</button>;
}

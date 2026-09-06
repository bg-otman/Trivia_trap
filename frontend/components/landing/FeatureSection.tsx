import {
  Zap,
  Drama,
  Users,
  Crown,
  Timer,
} from "lucide-react";

const players = [
  ["Alex", "2600"],
  ["Maya", "2300"],
  ["You", "3100"],
  ["James", "1800"],
  ["Luna", "1500"],
];

export default function FeatureSection() {
  return (
    <section className="mx-auto max-w-[1450px] px-5 pb-20 md:px-8">

      <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">

        {/* LEFT */}
        <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-6 md:p-8">

          <h2 className="text-xl font-bold">
            <span className="mr-2 text-pink-400">♥</span>
            Why you'll love Trivia Trap
          </h2>

          <div className="mt-8 space-y-7">

            <Feature
              icon={<Zap size={20} />}
              title="Easy to learn"
              description="Jump in a room and start the fun in seconds."
            />

            <Feature
              icon={<Drama size={20} />}
              title="Bluff & Outsmart"
              description="Not sure of the answer? Bluff your way to victory."
            />

            <Feature
              icon={<Users size={20} />}
              title="Play with anyone"
              description="Friends or random players, the party is always on."
            />

          </div>

        </div>

        {/* GAME PREVIEW */}
        <div className="overflow-hidden rounded-[28px] border border-purple-400/15 bg-[#07091a] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] md:p-7">

          {/* Header */}
          <div className="flex items-center justify-between">

            <div>
              <span className="text-[10px] text-white/35">
                ROOM CODE
              </span>

              <div className="font-mono text-sm">
                7X4K2B
              </div>
            </div>

            <div className="text-sm font-semibold">
              Round 3 / 10
            </div>

            <button className="text-sm text-purple-300">
              Leaderboard →
            </button>

          </div>

          {/* Progress */}
          <div className="mt-5 flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < 3
                    ? "bg-gradient-to-r from-purple-500 to-blue-400"
                    : "bg-white/[0.07]"
                }`}
              />
            ))}
          </div>

          {/* Players */}
          <div className="mt-6 grid grid-cols-5 gap-2">

            {players.map(([name, score], index) => (
              <div
                key={name}
                className={`rounded-xl p-2 text-center ${
                  name === "You"
                    ? "border border-purple-400/40 bg-purple-500/10"
                    : "bg-white/[0.025]"
                }`}
              >

                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/70 to-cyan-400/50 text-xs font-bold">
                  {name[0]}
                </div>

                <div className="mt-2 truncate text-[10px] text-white/60">
                  {name}
                </div>

                <div className="text-xs font-bold">
                  {score}
                </div>

                {name === "You" && (
                  <Crown
                    size={12}
                    className="mx-auto mt-1 text-yellow-400"
                  />
                )}

              </div>
            ))}

          </div>

          {/* Question */}
          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

            <div className="flex items-center justify-between">

              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] text-purple-300">
                Science
              </span>

              <div className="flex items-center gap-1 text-xs text-white/40">
                <Timer size={13} />
                12s
              </div>

            </div>

            <h3 className="mt-5 text-lg font-semibold md:text-xl">
              Which element has the chemical symbol
              <span className="text-yellow-400"> 'O'</span>?
            </h3>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {["Gold", "Oxygen", "Iron", "Silver"].map(
                (answer, index) => (
                  <button
                    key={answer}
                    className={`rounded-xl border p-3 text-left text-sm transition ${
                      answer === "Oxygen"
                        ? "border-purple-400/60 bg-gradient-to-r from-purple-600/70 to-blue-500/60 shadow-[0_0_25px_rgba(139,92,246,0.18)]"
                        : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="mr-3 text-white/35">
                      {String.fromCharCode(65 + index)}
                    </span>

                    {answer}

                    {answer === "Oxygen" && (
                      <span className="float-right">✓</span>
                    )}
                  </button>
                ),
              )}

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 max-w-[300px] text-sm leading-6 text-white/45">
          {description}
        </p>
      </div>

    </div>
  );
}



type ReadyBarProps = {
  categoryCount: number;
  totalRounds: number;
  bluffTime: number;
  voteTime: number;
  onStart: () => void;
};

export default function ReadyBar({
  categoryCount,
  totalRounds,
  bluffTime,
  voteTime,
  onStart,
}: ReadyBarProps) {
  return (
    <section
      className="
        group relative mt-5 overflow-hidden
        rounded-[24px]
        border border-white/[0.08]
        bg-gradient-to-r
        from-[#080F25]/95
        via-[#0A102B]/95
        to-[#100A25]/95
        p-4
        shadow-[0_20px_70px_rgba(0,0,0,.25)]
        backdrop-blur-2xl
        sm:p-5
      "
    >
      <div
        className="
          pointer-events-none absolute
          -right-20 -top-24
          h-56 w-56
          rounded-full
          bg-purple-500/[0.10]
          blur-[90px]
          transition-opacity duration-500
          group-hover:opacity-80
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-24 left-1/3
          h-40 w-40
          rounded-full
          bg-cyan-400/[0.06]
          blur-[80px]
        "
      />

      <div
        className="
          relative z-10
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              relative flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              border border-emerald-400/20
              bg-emerald-400/[0.07]
            "
          >
            <span
              className="
                absolute h-2.5 w-2.5
                animate-pulse
                rounded-full
                bg-emerald-400
                shadow-[0_0_12px_rgba(52,211,153,.7)]
              "
            />
            <span
              className="
                absolute h-5 w-5
                rounded-full
                border border-emerald-400/20
              "
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">
                Ready to play?
              </p>
              <span
                className="
                  hidden rounded-full
                  border border-emerald-400/20
                  bg-emerald-400/[0.06]
                  px-2 py-0.5
                  text-[9px] font-medium
                  uppercase tracking-wider
                  text-emerald-300
                  sm:block
                "
              >
                Host
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] text-white/35 sm:text-xs">
                {categoryCount} categories
              </span>
              <span className="text-white/15">•</span>
              <span className="text-[10px] text-white/35 sm:text-xs">
                {totalRounds} rounds
              </span>
              <span className="text-white/15">•</span>
              <span className="text-[10px] text-white/35 sm:text-xs">
                {bluffTime}s bluff
              </span>
              <span className="text-white/15">•</span>
              <span className="text-[10px] text-white/35 sm:text-xs">
                {voteTime}s vote
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="
            group/start relative
            flex h-[56px] w-full shrink-0
            items-center justify-center
            gap-3
            overflow-hidden
            rounded-2xl
            border border-white/20
            bg-[linear-gradient(135deg,#FF4F81_0%,#7047F5_52%,#19D9ED_100%)]
            px-7
            text-[14px] font-bold tracking-[-0.01em] text-white
            shadow-[0_10px_35px_rgba(112,71,245,.30),inset_0_1px_0_rgba(255,255,255,.25)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:scale-[1.015]
            hover:shadow-[0_14px_45px_rgba(112,71,245,.48),0_0_25px_rgba(25,217,237,.16),inset_0_1px_0_rgba(255,255,255,.3)]
            active:translate-y-0
            active:scale-[0.985]
            disabled:pointer-events-none
            disabled:opacity-50
            sm:w-auto
            sm:min-w-[220px]
          "
        >
          <span
            className="
              pointer-events-none absolute inset-0
              -translate-x-[130%]
              skew-x-[-18deg]
              bg-gradient-to-r
              from-transparent
              via-white/25
              to-transparent
              transition-transform
              duration-700
              ease-out
              group-hover/start:translate-x-[130%]
            "
          />
          <span
            className="
              pointer-events-none absolute inset-[1px]
              rounded-[15px]
              border border-white/[0.14]
              bg-gradient-to-b
              from-white/[0.08]
              to-transparent
            "
          />
          <span
            className="
              pointer-events-none absolute
              -bottom-8 left-1/2
              h-12 w-3/4
              -translate-x-1/2
              rounded-full
              bg-white/20
              blur-2xl
              opacity-0
              transition-opacity
              duration-300
              group-hover/start:opacity-100
            "
          />

          <span className="relative z-10 flex items-center gap-3">
            <span
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-full
                border border-white/25
                bg-black/10
                text-[10px]
                shadow-[inset_0_1px_0_rgba(255,255,255,.15)]
                backdrop-blur-sm
                transition-all duration-300
                group-hover/start:scale-110
                group-hover/start:bg-white/15
              "
            >
              <span className="ml-[1px]">▶</span>
            </span>
            <span className="whitespace-nowrap">Start Game</span>
            <span
              className="
                text-[16px] font-light
                opacity-50
                transition-all duration-300
                group-hover/start:translate-x-1
                group-hover/start:opacity-100
              "
            >
              →
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
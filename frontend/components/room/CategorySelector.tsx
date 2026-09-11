"use client";

import { Check, Grid2X2 } from "lucide-react";

const categories = [
  {
    name: "Geography",
    icon: "🌍",
    color: "cyan",
  },
  {
    name: "History",
    icon: "🏛️",
    color: "amber",
  },
  {
    name: "Science",
    icon: "🧪",
    color: "blue",
  },
  {
    name: "Movies & TV",
    icon: "🎬",
    color: "purple",
  },
  {
    name: "Sports",
    icon: "⚽",
    color: "emerald",
  },
  {
    name: "Art & Culture",
    icon: "🎨",
    color: "orange",
  },
  {
    name: "Technology",
    icon: "💻",
    color: "indigo",
  },
  {
    name: "Music",
    icon: "🎵",
    color: "pink",
  },
  {
    name: "Food & Drink",
    icon: "🍔",
    color: "yellow",
  },
  {
    name: "Animals",
    icon: "🦁",
    color: "green",
  },
  {
    name: "Space",
    icon: "🚀",
    color: "violet",
  },
  {
    name: "Gaming",
    icon: "🎮",
    color: "fuchsia",
  },
];

const colors: Record<string, string> = {
  cyan:
    "border-cyan-400/40 bg-cyan-400/[0.10] text-cyan-300",

  amber:
    "border-amber-400/40 bg-amber-400/[0.10] text-amber-300",

  blue:
    "border-blue-400/40 bg-blue-400/[0.10] text-blue-300",

  purple:
    "border-purple-400/50 bg-purple-500/[0.13] text-purple-300",

  emerald:
    "border-emerald-400/40 bg-emerald-400/[0.10] text-emerald-300",

  orange:
    "border-orange-400/40 bg-orange-400/[0.10] text-orange-300",

  indigo:
    "border-indigo-400/40 bg-indigo-400/[0.10] text-indigo-300",

  pink:
    "border-pink-400/40 bg-pink-400/[0.10] text-pink-300",

  yellow:
    "border-yellow-400/40 bg-yellow-400/[0.10] text-yellow-300",

  green:
    "border-green-400/40 bg-green-400/[0.10] text-green-300",

  violet:
    "border-violet-400/40 bg-violet-400/[0.10] text-violet-300",

  fuchsia:
    "border-fuchsia-400/40 bg-fuchsia-400/[0.10] text-fuchsia-300",
};

type CategorySelectorProps = {
  selectedCategories: string[];

  setSelectedCategories: (
    categories: string[]
  ) => void;
};

export default function CategorySelector({
  selectedCategories,
  setSelectedCategories,
}: CategorySelectorProps) {
  const toggleCategory = (
    categoryName: string
  ) => {
    const alreadySelected =
      selectedCategories.includes(categoryName);

    /*
     * Don't allow zero categories.
     */
    if (
      alreadySelected &&
      selectedCategories.length === 1
    ) {
      return;
    }

    if (alreadySelected) {
      setSelectedCategories(
        selectedCategories.filter(
          (category) =>
            category !== categoryName
        )
      );

      return;
    }

    setSelectedCategories([
      ...selectedCategories,
      categoryName,
    ]);
  };

  return (
    <section
      className="
        rounded-[24px]
        border
        border-white/[0.08]
        bg-[#071126]/80
        p-5
        backdrop-blur-2xl
      "
    >

      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-purple-400/25
              bg-purple-500/[0.10]
              text-purple-300
            "
          >
            <Grid2X2 size={19} />
          </div>

          <div>

            <h2 className="font-semibold">
              Categories
            </h2>

            <p className="text-xs text-white/35">
              Choose the topics for your game
            </p>

          </div>

        </div>

        <span className="text-xs text-purple-300">
          {selectedCategories.length} selected
        </span>

      </div>

      {/* CATEGORY GRID */}

      <div
        className="
          grid
          grid-cols-2
          gap-2
          sm:grid-cols-3
          xl:grid-cols-4
        "
      >

        {categories.map((category) => {
          const selected =
            selectedCategories.includes(
              category.name
            );

          return (
            <button
              type="button"
              key={category.name}
              onClick={() =>
                toggleCategory(category.name)
              }
              className={`
                relative
                flex
                min-h-[85px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                transition-all
                duration-200
                ${
                  selected
                    ? colors[category.color]
                    : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.14] hover:bg-white/[0.04]"
                }
              `}
            >

              {/* CHECK */}

              {selected && (
                <span
                  className="
                    absolute
                    right-2
                    top-2
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                  "
                >
                  <Check size={12} />
                </span>
              )}

              {/* EMOJI */}

              <span className="text-2xl">
                {category.icon}
              </span>

              {/* NAME */}

              <span className="mt-2 text-[10px] font-semibold">
                {category.name}
              </span>

            </button>
          );
        })}

      </div>

      {/* CATEGORY INFO */}

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-white/[0.05]
          bg-white/[0.02]
          px-3
          py-2.5
          text-[10px]
          text-white/30
        "
      >
        <span>
          Questions will be picked from your selected topics.
        </span>

        <span className="hidden text-purple-300 sm:block">
          {selectedCategories.length}/12
        </span>
      </div>

    </section>
  );
}
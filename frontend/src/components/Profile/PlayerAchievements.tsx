'use client';
import { useState } from "react";
import { UserAchievements } from "@/types/userData";
import { ChevronRight, LockKeyhole } from "lucide-react";
import Image from "next/image";


type AllAchievementsProps = {
    achievements: UserAchievements[];
    toggleAchievements: (value: boolean) => void;
    onAchievementClick?: (a: UserAchievements) => void;
};

function Achievement({ achievement, onClick } : { achievement: UserAchievements, onClick?: (a: UserAchievements) => void })
{
    return (
        <div className={`border-2 border-indigo-500/50 outline-2 outline-[#F7C948] rounded-lg p-1 my-2 mx-auto flex w-[112px] min-w-[112px] shrink-0 flex-col gap-1 items-center
            min-h-[155px] bg-[#0b1329] hover:bg-[#1c2541] transition-colors hover:scale-[1.02]
            transition-transform duration-300 ease-in-out ${achievement.unlocked ? "opacity-100" : "opacity-80"} relative
        `} title={achievement.description}>
            <div onClick={() => onClick && onClick(achievement)} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <Image
                src={achievement.img}
                alt={achievement.name + " img"}
                width={100}
                height={100}
                loading="lazy"
                className="size-[100px] object-contain"/>
            <p className="text-sm w-full text-center">{achievement.name}</p>
            </div>
                {!achievement.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                        <LockKeyhole className="text-white" />
                    </div>
                )}
        </div>
    );
}

function AllAchievements({ achievements, toggleAchievements, onAchievementClick } : AllAchievementsProps) {
    return (
        <div className="absolute z-50 min-h-[155px] min-w-full overflow-y-auto rounded-xl border border-trap-secondary bg-trap-panel p-4 shadow-2xl">
            <div className="flex mb-4 flex-col p-2 relative">
                <h2 className="text-md sm:text-lg">All Achievements</h2>
                <button className="absolute right-2 top-2 z-50 cursor-pointer rounded-lg bg-trap-danger/20 p-2 text-trap-danger-soft transition-colors hover:bg-trap-danger hover:text-white"
                        onClick={() => toggleAchievements(false)}>
                    Close
                </button>
            </div>
            <div className="min-w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-10 gap-4">
                {achievements.map((a, index) => (
                    <Achievement key={index} achievement={a} onClick={(ach) => onAchievementClick && onAchievementClick(ach)} />
                ))}
            </div>
        </div>
    );
}

export default function PlayerAchievements({ achievements }: { achievements: UserAchievements[] }) {

    const achievements_count: number = achievements.length;
    const unlocked_achievements: number = achievements.filter(a => a.unlocked === true).length;

    const [displayAll, toggleAchievements] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<UserAchievements | null>(null);



    return (
        <div className="relative w-full rounded-xl border border-trap-border bg-trap-panel p-3 font-display">
            {displayAll && <AllAchievements achievements={achievements} toggleAchievements={toggleAchievements} onAchievementClick={(a) => setSelectedAchievement(a)} />}
            {selectedAchievement && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-lg rounded-xl border border-trap-secondary bg-trap-panel p-6 shadow-2xl">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-4">
                                <Image src={selectedAchievement.img} alt={selectedAchievement.name + " img"} width={80} height={80} />
                                <div>
                                    <h3 className="text-lg font-bold">{selectedAchievement.name}</h3>
                                    <p className={`text-sm opacity-80 ${selectedAchievement.unlocked ? 'text-green-500' : 'text-red-500'}`}>{selectedAchievement.unlocked ? 'Unlocked' : 'Locked'}</p>
                                </div>
                            </div>
                            <button className="rounded-lg bg-trap-danger/20 p-2 text-trap-danger-soft hover:bg-trap-danger hover:text-white" onClick={() => setSelectedAchievement(null)}>Close</button>
                        </div>
                        <div className="mt-4">
                            <p>{selectedAchievement.description}</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between flex-col xs:flex-row gap-2 items-center">
                <span className="font-blackops text-lg text-trap-text"><span aria-hidden="true">🏆</span><strong className="mx-2">Achievements</strong></span>
                <button className="flex cursor-pointer items-center rounded-lg bg-trap-secondary px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-trap-secondary-strong"
                        onClick={() => toggleAchievements(displayAll ? false : true)} >
                    <p>View All <span>{unlocked_achievements.toLocaleString()}/{achievements_count.toLocaleString()}</span></p>
                    <ChevronRight />
                </button>
            </div>
            <div className="flex overflow-hidden min-h-24 mt-2 flex-col xs:flex-row gap-3 justify-center items-center px-2">
                {achievements.slice(0, 11).map((a, index) => (
                    <div   className={`
                        hidden w-auto flex justify-center items-center
                        [&:nth-child(-n+4)]:flex
                        sm:[&:nth-child(-n+5)]:flex
                        md:[&:nth-child(-n+6)]:flex
                        lg:[&:nth-child(-n+8)]:flex
                        xl:[&:nth-child(-n+10)]:flex
                    `}
                        key={index} title={a.description}>
                            <Achievement achievement={a} onClick={(ach) => setSelectedAchievement(ach)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

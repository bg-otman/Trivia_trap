'use client';
import { useState } from "react";
import { UserAchievements } from "./ProfilePage";
import { ChevronRight, LockKeyhole } from "lucide-react";
import Image from "next/image";


type AllAchievementsProps = {
    achievements: UserAchievements[];
    toggleAchievements: (value: boolean) => void;
};

function Achievement({ achievement } : { achievement: UserAchievements })
{
    return (
        <div className={`border-2 border-indigo-500/50 outline-2 outline-[#F7C948] rounded-lg p-1 my-2 flex flex-col gap-1 items-center
            min-w-full xs:min-w-auto min-h-[155px] bg-[#0b1329] hover:bg-[#1c2541] transition-colors hover:scale-[1.02]
            transition-transform duration-300 ease-in-out ${achievement.unlocked ? "opacity-100" : "opacity-80"} relative
        `} title={achievement.description}>
            <Image
                src={achievement.img}
                alt={achievement.name + " img"}
                width={100}
                height={100}
                loading="lazy"/>
            <p className="text-sm w-min  text-center">{achievement.name}</p>
            {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <LockKeyhole className="text-white" />
                </div>
            )}
        </div>
    );
}

function AllAchievements({ achievements, toggleAchievements } : AllAchievementsProps) {
    return (
        <div className="absolute border-2 border-[#5B5FEF] min-w-full min-h-[155px] bg-[#0b1329] z-50 p-4 rounded-lg overflow-y-auto">
            <div className="flex mb-4 flex-col p-2 relative">
                <h2 className="text-md sm:text-lg">All Achievements</h2>
                <button className="bg-[#b8192e] p-2 rounded-lg hover:bg-[#ff1131] transition-colors cursor-pointer absolute top-2 right-2 z-50"
                        onClick={() => toggleAchievements(false)}>
                    Close
                </button>
            </div>
            <div className="min-w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-10 gap-4">
                {achievements.map((a, index) => (
                    <Achievement key={index} achievement={a}/>
                ))}
            </div>
        </div>
    );
}

export default function PlayerAchievements({ achievements }: { achievements: UserAchievements[] }) {

    const achievements_count: Number = achievements.length;
    const unlocked_achievements: Number = achievements.filter(a => a.unlocked === true).length;

    const [displayAll, toggleAchievements] = useState(false);



    return (
        <div className="w-full border border-2 border-[#5B5FEF] rounded-lg p-2 font-blackops relative">
            {displayAll && <AllAchievements achievements={achievements} toggleAchievements={toggleAchievements} />}
            <div className="flex justify-between flex-col xs:flex-row gap-2 items-center">
                <span>🏆 <strong className="mx-2">Achievements</strong></span>
                <button className="flex cursor-pointer bg-[#5700B8] p-2 rounded-lg hover:bg-[#6c20c2] transition-colors"
                        onClick={() => toggleAchievements(displayAll ? false : true)} >
                    <p>View All <span>{unlocked_achievements.toLocaleString()}/{achievements_count.toLocaleString()}</span></p>
                    <ChevronRight />
                </button>
            </div>
            <div className="flex overflow-hidden min-h-24 mt-2 flex-col xs:flex-row gap-3 justify-center items-center px-2">
                {achievements.slice(0, 11).map((a, index) => (
                    <div   className={`
                        hidden w-full
                        [&:nth-child(-n+4)]:flex
                        sm:[&:nth-child(-n+5)]:flex
                        md:[&:nth-child(-n+6)]:flex
                        lg:[&:nth-child(-n+8)]:flex
                        xl:[&:nth-child(-n+10)]:flex
                    `}
                        key={index} title={a.description}>
                            <Achievement achievement={a}  />
                    </div>
                ))}
            </div>
        </div>
    );
}
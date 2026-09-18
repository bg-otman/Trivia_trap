'use client';
import { useState } from "react";
import { UserAchievements } from "./ProfilePage";
import { ChevronRight, LockKeyhole } from "lucide-react";
import Image from "next/image";


type AllAchievementsProps = {
    achievements: UserAchievements[];
    toggleAchievements: (value: boolean) => void;
};

function AllAchievements({ achievements, toggleAchievements } : AllAchievementsProps) {
    return (
        <div className="absolute top-0 border-2 border-white-500 min-h-[1300px] min-w-full bg-[#0b1329] z-50 p-4 rounded-lg overflow-y-auto">
            <div className="flex mb-4 flex-col p-2 relative">
                <h2 className="text-md sm:text-lg">All Achievements</h2>
                <button className="bg-[#b8192e] p-2 rounded-lg hover:bg-[#ff1131] transition-colors cursor-pointer absolute top-2 right-2 z-50"
                        onClick={() => toggleAchievements(false)}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default function PlayerAchievements({ achievements }: { achievements: UserAchievements[] }) {

    const achievements_count: Number = achievements.length;
    const unlocked_achievements: Number = achievements.filter(a => a.unlocked === true).length;

    const [displayAll, toggleAchievements] = useState(false);



    return (
        <div className="w-full border border-2 border-indigo-500/50 rounded-lg p-2 font-blackops relative">
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
                        border-2 border-indigo-500/50 outline-2 outline-cyan-500 rounded-lg flex flex-col gap-1 p-1 my-2 items-center hidden
                        [&:nth-child(-n+4)]:flex
                        sm:[&:nth-child(-n+5)]:flex
                        md:[&:nth-child(-n+6)]:flex
                        lg:[&:nth-child(-n+8)]:flex
                        xl:[&:nth-child(-n+10)]:flex
                        min-w-full xs:min-w-auto min-h-[155px] bg-[#0b1329] hover:bg-[#1c2541] transition-colors hover:scale-[1.02]
                        transition-transform duration-300 ease-in-out ${a.unlocked ? "opacity-100" : "opacity-80"} relative
                    `} 
                        key={index} title={a.description}>
                        <Image
                            src={a.img}
                            alt={a.name + " img"}
                            width={100}
                            height={100}
                            loading="lazy"
                        />
                        <p className="text-sm w-min  text-center">{a.name}</p>
                        {!a.unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <LockKeyhole className="text-white" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
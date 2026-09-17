import { UserAchievements } from "./ProfilePage";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

export default function PlayerAchievements({ achievements }: { achievements: UserAchievements[] }) {

    const achievements_count: Number = achievements.length;
    const unlocked_achievements: Number = achievements.filter(a => a.unlocked === true).length;

    return (
        <div className="w-full border border-2 border-indigo-500/50 rounded-lg p-2 font-blackops">
            <div className="flex justify-between flex-col xs:flex-row gap-2 items-center">
                <span>🏆 <strong className="mx-2">Achievements</strong></span>
                <button className="flex cursor-pointer bg-[#5700B8] p-2 rounded-lg hover:bg-[#6c20c2] transition-colors">
                    <p>View All <span>{unlocked_achievements.toLocaleString()}/{achievements_count.toLocaleString()}</span></p>
                    <ChevronRight />
                </button>
            </div>
            <div className="flex overflow-hidden min-h-24 mt-2 flex-col xs:flex-row gap-3 justify-center items-center px-2">
                {achievements.slice(0, 11).map((a, index) => (
                    <div   className="
                        border-2 border-indigo-500/50 outline-2 outline-cyan-500 rounded-lg flex flex-col gap-1 p-1 my-2 items-center hidden
                        [&:nth-child(-n+4)]:flex
                        sm:[&:nth-child(-n+5)]:flex
                        md:[&:nth-child(-n+6)]:flex
                        lg:[&:nth-child(-n+8)]:flex
                        xl:[&:nth-child(-n+10)]:flex
                        min-w-full xs:min-w-auto min-h-[155px] bg-[#0b1329] hover:bg-[#1c2541] transition-colors
                    "
                        key={index} title={a.description}>
                        <Image
                            src={a.img}
                            alt={a.name + " img"}
                            width={100}
                            height={100}
                        />
                        <p className="text-sm w-min  text-center">{a.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
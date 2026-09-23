'use client';
import { Trophy, CircleStar, Award } from "lucide-react";
import { MatchHistory } from "./ProfilePage";
import Link from 'next/link';

export default function PlayerMatchHistory({ matchHistory }: { matchHistory: MatchHistory[] }) {
    return (
        <div className="min-h-[300px] w-full border-2 rounded-lg border-[var(--secondary)] p-4">
            <h2 className="text-lg font-bold font-blackops">⏳Recent Matches</h2>
            <div className="mt-4 bg-[var(--background)] border border-[var(--secondary)/50] rounded-lg">
                <table className="w-full border-collapse text-left text-sm text-gray-300">
                    <thead className=" bg-gray-900/50">
                        <tr className="border-b border-gray-800 text-xs font-semibold uppercase text-gray-400 bg-gray-900/50">
                            <th className="py-2 px-4 border-b border-[var(--secondary)/50]">Rank</th>
                            <th className="py-2 px-4 border-b border-[var(--secondary)/50]">Score</th>
                            <th className="py-2 px-4 border-b border-[var(--secondary)/50] hidden sm:table-cell">Correct Answers</th>
                            <th className="py-2 px-4 border-b border-[var(--secondary)/50]">Bluffs</th>
                            <th className="py-2 px-4 border-b border-[var(--secondary)/50]">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matchHistory.map((match, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/50">
                                <td className="py-2 px-4 border-b border-[var(--secondary)/50] font-bold">
                                {match.rank === 1 ? (
                                    <Trophy className="inline-block w-4 h-4 text-[var(--accent)] mr-1"/>
                                ) : match.rank === 2 ? (
                                    <CircleStar className="inline-block w-4 h-4 text-[var(--primary)] mr-1" />
                                ) : match.rank === 3 ? (
                                    <Award className="inline-block w-4 h-4 text-sky-500 mr-1" />
                                ) : null}
                                #{match.rank}
                                </td>
                                <td className="py-2 px-4 border-b border-[var(--secondary)/50]">{match.score}</td>
                                <td className="py-2 px-4 border-b border-[var(--secondary)/50] hidden sm:table-cell">{match.correct_answers}</td>
                                <td className="py-2 px-4 border-b border-[var(--secondary)/50]">{match.bluffs}</td>
                                <td className="py-2 px-4 border-b border-[var(--secondary)/50]">
                                    <Link href={`/match/${match.id}`} className="text-blue-500 hover:underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}

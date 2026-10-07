import { Trophy, CircleStar, Award } from "lucide-react";
import { MatchHistory } from "@/types/userData";
import Link from 'next/link';
import { Button } from "../ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


export function MatchHistoryPagination() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}


export default function PlayerMatchHistory({ matchHistory }: { matchHistory: MatchHistory[] }) {
    return (
        <div className="min-h-[300px] w-full rounded-xl border border-trap-border bg-trap-panel p-4">
            <h2 className="font-blackops text-lg text-trap-text">Recent Matches</h2>
            <div className="mb-4 mt-4 overflow-hidden rounded-lg border border-trap-border bg-trap-bg">
                <table className="w-full border-collapse text-center text-trap-text-soft">
                    <thead className="bg-trap-raised">
                        <tr className="border-b border-trap-border text-xs font-semibold uppercase text-trap-text-dim sm:text-base
                        *:border-b *:border-trap-border *:px-4 *:py-2">
                            <th>Rank</th>
                            <th>Score</th>
                            <th className="hidden sm:table-cell">Correct Answers</th>
                            <th>Bluffs</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold text-sm md:text-base">
                        {!matchHistory.length && (
                            <tr>
                                <td colSpan={5} className="py-4 text-center text-gray-500">
                                    No recent matches.
                                </td>
                            </tr>
                        )}
                        {matchHistory.map((match, index) => (
                            <tr key={index} className="border-b border-trap-border transition-colors hover:bg-trap-raised
                            *:border-b *:border-trap-border *:px-2 *:py-2">
                                <td>
                                    <div className="flex items-center justify-center gap-1">
                                        {match.rank === 1 ? (
                                        <Trophy className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                                        ) : match.rank === 2 ? (
                                        <CircleStar className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                                        ) : match.rank === 3 ? (
                                        <Award className="h-4 w-4 shrink-0 text-sky-500" />
                                        ) : null}
                                        <span className="leading-none">#{match.rank}</span>
                                    </div>
                                </td>
                                <td>{match.score}</td>
                                <td className="hidden sm:table-cell">{match.correct_answers}/{match.total_rounds}</td>
                                <td>{match.bluffs} 🎭</td>
                                <td>
                                    <Button variant="outline"  size="sm">
                                        <Link href={`/match/${match.id}`} className="text-[var(--primary)] hover:underline font-mono" >View</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <MatchHistoryPagination/>
        </div>
    );

}

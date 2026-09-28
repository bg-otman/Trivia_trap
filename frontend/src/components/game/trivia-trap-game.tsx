"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animationPacing } from "@/animations/pacing";
import { mockChatMessages } from "@/mocks/chat";
import { mockGame } from "@/mocks/game";
import { mockQuestions } from "@/mocks/questions";
import {
  mockAnswerReveal,
  mockFinalResults,
  mockRoundResults,
} from "@/mocks/results";
import { GameHud } from "./hud/game-hud";
import { PlayerActivityDock } from "./players/player-activity-dock";
import { FullScreenPhaseTransition } from "./transitions/phase-transition";
import { GameIntro } from "./system/game-intro";
import { LobbyPhase, type LobbyConnectionState } from "./phases/lobby-phase";
import { CategoryPhase } from "./phases/category-phase";
import { TrapPhase } from "./phases/trap-phase";
import { VotingPhase } from "./phases/voting-phase";
import { ResultsRevealPhase } from "./phases/results-reveal-phase";
import { RoundResultsPhase } from "./phases/round-results-phase";
import { FinalResultsPhase } from "./phases/final-results-phase";
import { WaitingArena } from "./voting/waiting/waiting-arena";
import { WaitingMotionContext } from "./voting/waiting/waiting-motion";
import type { Category } from "./question/category-card";
import type { ChatMessageData } from "@/types/chat";
import type { GamePhase, GameSettings } from "@/types/game";
import type { Player } from "@/types/player";
import type { Question, VotingOption } from "@/types/question";
import type { AnswerReveal, FinalResults, RoundResults } from "@/types/results";

interface MockGameFlowState {
  currentPhase: GamePhase;
  roomCode: string;
  settings: GameSettings;
  players: Player[];
  chatMessages: ChatMessageData[];
  currentRound: number;
  totalRounds: number;
  selectedCategory: Category | null;
  currentQuestion: Question;
  submittedTrapAnswer: string;
  votingOptions: VotingOption[];
  selectedVote: VotingOption["id"] | null;
  playerSubmitted: boolean;
  playerVoted: boolean;
  revealState: AnswerReveal | null;
  roundStandings: RoundResults;
  finalStandings: FinalResults;
  timeRemaining: number;
}

const timedPhases: GamePhase[] = ["CATEGORY", "TRAP", "VOTING"];
// Simulated remote-player latency for this mock flow, not an animation/UI lock.
// A real multiplayer connection advances immediately on the server's phase event.
const mockPlayerWaitMs = 4800;
const activePlayerIds = new Set(mockGame.players.map((player) => player.id));
const mockRoundStandings: RoundResults = {
  players: mockRoundResults.players.filter((player) =>
    activePlayerIds.has(player.id),
  ),
};
const mockGameFinalStandings: FinalResults = {
  standings: mockFinalResults.standings.filter((player) =>
    activePlayerIds.has(player.id),
  ),
};

interface TriviaTrapGameProps {
  roomCode: string;
  mockState?: string;
}

export function TriviaTrapGame({ roomCode, mockState }: TriviaTrapGameProps) {
  const router = useRouter();
  const [game, setGame] = useState<MockGameFlowState>(() =>
    createInitialState(roomCode, undefined, mockState),
  );
  const [showGameIntro, setShowGameIntro] = useState(false);
  const [connectionState, setConnectionState] = useState<LobbyConnectionState>(() => lobbyConnectionForMockState(mockState));
  const introTimeoutRef = useRef<number | null>(null);
  const isHost = game.players.some(
    (player) => player.isYou && player.role === "HOST",
  );
  const voteDeadlinePassed =
    game.currentPhase === "VOTING" && game.timeRemaining <= 0;
  const playerScores = Object.fromEntries(
    game.roundStandings.players.map((player) => [player.id, player.totalScore]),
  );

  useEffect(() => {
    return () => {
      if (introTimeoutRef.current !== null) {
        window.clearTimeout(introTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!timedPhases.includes(game.currentPhase) || game.timeRemaining <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setGame((current) => {
        const next = {
          ...current,
          timeRemaining: Math.max(0, current.timeRemaining - 1),
        };
        return next.timeRemaining === 0 ? advanceExpiredPhase(next) : next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [game.currentPhase, game.timeRemaining]);

  useEffect(() => {
    const phase = game.currentPhase;
    const round = game.currentRound;
    if (!(
      (phase === "TRAP" && game.playerSubmitted) ||
      (phase === "VOTING" && (game.playerVoted || voteDeadlinePassed))
    ))
      return;

    const completedStatus = phase === "TRAP" ? "SUBMITTED" : "VOTED";
    const markRemotePlayers = (count: number) => {
      setGame((current) => {
        if (current.currentPhase !== phase || current.currentRound !== round)
          return current;
        let completed = 0;
        return {
          ...current,
          players: current.players.map((player) => {
            if (
              player.isYou ||
              player.status === "OFFLINE" ||
              completed >= count
            )
              return player;
            completed += 1;
            return { ...player, status: completedStatus };
          }),
        };
      });
    };

    const activityTimers = voteDeadlinePassed
      ? []
      : [
          window.setTimeout(() => markRemotePlayers(2), 900),
          window.setTimeout(() => markRemotePlayers(4), 2300),
        ];

    const timeout = window.setTimeout(
      () => {
        setGame((current) => {
          if (current.currentPhase !== phase || current.currentRound !== round)
            return current;
          return phase === "TRAP"
            ? {
                ...current,
                currentPhase: "VOTING",
                timeRemaining: current.settings.voteTime,
                players: current.players.map((player) =>
                  player.status === "OFFLINE"
                    ? player
                    : { ...player, status: "THINKING" },
                ),
              }
            : { ...current, currentPhase: "RESULTS_REVEAL", timeRemaining: 0 };
        });
      },
      voteDeadlinePassed ? 0 : mockPlayerWaitMs,
    );

    return () => {
      window.clearTimeout(timeout);
      activityTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [
    game.currentPhase,
    game.currentRound,
    game.playerSubmitted,
    game.playerVoted,
    voteDeadlinePassed,
  ]);

  function startGame() {
    setGame((current) =>
      resetRound({ ...current, totalRounds: current.settings.totalRounds }, 1),
    );
    setShowGameIntro(true);
    if (introTimeoutRef.current !== null) {
      window.clearTimeout(introTimeoutRef.current);
    }
    introTimeoutRef.current = window.setTimeout(() => {
      setShowGameIntro(false);
      introTimeoutRef.current = null;
    }, 1650);
  }

  function toggleReady() {
    setGame((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.isYou && player.role !== "HOST"
          ? {
              ...player,
              status: player.status === "READY" ? "NOT_READY" : "READY",
            }
          : player,
      ),
    }));
  }

  function kickPlayer(playerId: Player["id"]) {
    setGame((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
      roundStandings: {
        players: current.roundStandings.players.filter(
          (player) => player.id !== playerId,
        ),
      },
      finalStandings: {
        standings: current.finalStandings.standings.filter(
          (player) => player.id !== playerId,
        ),
      },
    }));
  }

  function updateSettings(settings: GameSettings) {
    setGame((current) => ({
      ...current,
      settings,
      totalRounds: settings.totalRounds,
    }));
  }

  function selectCategory(category: Category) {
    setGame((current) => ({
      ...current,
      selectedCategory: category,
      currentQuestion: questionForRound(current.currentRound, category),
    }));

    window.setTimeout(() => {
      setGame((current) =>
        current.currentPhase === "CATEGORY" &&
        current.selectedCategory === category
          ? {
              ...current,
              currentPhase: "TRAP",
              timeRemaining: current.settings.bluffTime,
              players: current.players.map((player) =>
                player.status === "OFFLINE"
                  ? player
                  : { ...player, status: "THINKING" },
              ),
            }
          : current,
      );
    }, animationPacing.categoryReactionMs);
  }

  function sendChatMessage(text: string) {
    setGame((current) => {
      const player = current.players.find((candidate) => candidate.isYou);
      if (!player) return current;

      return {
        ...current,
        chatMessages: [
          ...current.chatMessages,
          {
            id: `message-${Date.now()}`,
            playerId: player.id,
            playerName: player.name,
            playerAvatar: player.avatar,
            text,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isYou: true,
          },
        ],
      };
    });
  }

  function submitTrapAnswer(answer: string) {
    setGame((current) => {
      if (current.currentPhase !== "TRAP" || current.playerSubmitted)
        return current;
      const revealState = buildRevealState(
        answer,
        current.players,
        correctAnswerForQuestion(current.currentQuestion),
      );
      return {
        ...current,
        submittedTrapAnswer: answer,
        playerSubmitted: true,
        players: current.players.map((player) =>
          player.isYou ? { ...player, status: "SUBMITTED" } : player,
        ),
        revealState,
        votingOptions: buildVotingOptions(revealState, current.currentRound),
        selectedVote: null,
        playerVoted: false,
      };
    });
  }

  function castVote(optionId: VotingOption["id"]) {
    setGame((current) => {
      if (
        current.currentPhase !== "VOTING" ||
        current.playerVoted ||
        current.timeRemaining <= 0
      )
        return current;
      return {
        ...current,
        selectedVote: optionId,
        playerVoted: true,
        players: current.players.map((player) =>
          player.isYou ? { ...player, status: "VOTED" } : player,
        ),
      };
    });
  }

  function continueAfterRound() {
    setGame((current) => {
      if (current.currentRound >= current.totalRounds) {
        return { ...current, currentPhase: "FINAL_RESULTS" };
      }

      const nextRound = current.currentRound + 1;
      return resetRound(current, nextRound);
    });
  }

  function playAgain() {
    setGame(createInitialState(roomCode, "CATEGORY"));
  }

  function retryConnection() {
    setConnectionState("connecting");
    window.setTimeout(() => {
      setConnectionState("restored");
      window.setTimeout(() => setConnectionState("connected"), 1200);
    }, 700);
  }

  function leaveRoom() {
    setShowGameIntro(false);
    router.push("/");
  }

  function renderPhase(phase: GamePhase) {
    switch (phase) {
      case "LOBBY":
        return (
          <LobbyPhase
            players={game.players}
            roomCode={game.roomCode}
            settings={game.settings}
            chatMessages={game.chatMessages}
            isHost={isHost}
            onStartGame={startGame}
            onToggleReady={toggleReady}
            onKickPlayer={kickPlayer}
            onSettingsChange={updateSettings}
            onSendMessage={sendChatMessage}
            connectionState={connectionState}
            onRetryConnection={retryConnection}
            onLeaveRoom={leaveRoom}
          />
        );
      case "CATEGORY":
        return (
          <CategoryPhase
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
            selectedCategory={game.selectedCategory}
            onSelectCategory={selectCategory}
            canChoose={isHost}
          />
        );
      case "TRAP":
        return (
          <TrapPhase
            players={game.players}
            question={game.currentQuestion}
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
            answer={game.submittedTrapAnswer}
            submitted={game.playerSubmitted}
            onAnswerChange={(answer) =>
              setGame((current) => ({
                ...current,
                submittedTrapAnswer: answer,
              }))
            }
            onSubmitAnswer={submitTrapAnswer}
          />
        );
      case "VOTING":
        return (
          <VotingPhase
            players={game.players}
            question={game.currentQuestion}
            options={game.votingOptions}
            selectedVote={game.selectedVote}
            hasVoted={game.playerVoted}
            seconds={game.timeRemaining}
            onCastVote={castVote}
          />
        );
      case "RESULTS_REVEAL":
        return game.revealState ? (
          <ResultsRevealPhase
            reveal={game.revealState}
            onShowResults={() =>
              setGame((current) => ({
                ...current,
                currentPhase: "ROUND_RESULTS",
              }))
            }
          />
        ) : (
          <div className="mx-auto w-full max-w-4xl px-4 py-8">
            <WaitingArena
              players={game.players}
              message="WAITING FOR RESULTS"
            />
          </div>
        );
      case "ROUND_RESULTS":
        return (
          <RoundResultsPhase
            players={game.players}
            results={game.roundStandings}
            currentRound={game.currentRound}
            totalRounds={game.totalRounds}
            isHost={isHost}
            onContinue={continueAfterRound}
          />
        );
      case "FINAL_RESULTS":
        return (
          <FinalResultsPhase
            players={game.players}
            results={game.finalStandings}
            onPlayAgain={playAgain}
            onLeaveRoom={leaveRoom}
          />
        );
    }
  }

  const showHud = game.currentPhase !== "LOBBY";
  const showRoster =
    game.currentPhase !== "LOBBY" &&
    game.currentPhase !== "ROUND_RESULTS" &&
    game.currentPhase !== "FINAL_RESULTS";

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute left-[-12rem] top-[-12rem] size-[min(38rem,60vw)] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-14rem] right-[-12rem] size-[min(42rem,65vw)] rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-white/[0.025] to-transparent" />
      </div>

      {showGameIntro ? <GameIntro round={game.currentRound} /> : null}

      <div className="relative flex min-h-dvh flex-col">
        {showHud ? (
          <GameHud
            round={game.currentRound}
            totalRounds={game.totalRounds}
            seconds={game.timeRemaining}
            roomCode={game.roomCode}
            phase={game.currentPhase}
          />
        ) : null}

        <FullScreenPhaseTransition phase={game.currentPhase}>
          {(displayedPhase) => (
            <WaitingMotionContext.Provider
              value={displayedPhase === game.currentPhase}
            >
              {renderPhase(displayedPhase)}
            </WaitingMotionContext.Provider>
          )}
        </FullScreenPhaseTransition>

        {showRoster && (
          <PlayerActivityDock players={game.players} scores={playerScores} />
        )}
      </div>
    </main>
  );
}

function playersForMockState(mockState?: string): Player[] {
  const players = mockGame.players.map((player) => ({ ...player }));
  if (mockState === "lobby-empty") return players.filter((player) => player.role === "HOST");
  if (mockState === "lobby-player") {
    return players.map((player) =>
      player.id === "mehdi"
        ? { ...player, isYou: false }
        : player.id === "alex"
          ? { ...player, isYou: true, role: "PLAYER" }
          : player,
    );
  }
  return players;
}

function lobbyConnectionForMockState(mockState?: string): LobbyConnectionState {
  if (mockState === "lobby-loading") return "joining";
  if (mockState === "lobby-reconnecting") return "reconnecting";
  if (mockState === "lobby-connection-lost") return "failed";
  if (mockState === "lobby-restored") return "restored";
  return "connected";
}

function createInitialState(
  roomCode: string,
  currentPhase: GamePhase = mockGame.phase,
  mockState?: string,
): MockGameFlowState {
  const state: MockGameFlowState = {
    currentPhase,
    roomCode,
    settings: { ...mockGame.settings },
    players: playersForMockState(mockState),
    chatMessages: mockState === "lobby-empty" ? [] : mockChatMessages.map((message) => ({ ...message })),
    currentRound: 1,
    totalRounds: mockGame.totalRounds,
    selectedCategory: null,
    currentQuestion: questionForRound(1),
    submittedTrapAnswer: "",
    votingOptions: [],
    selectedVote: null,
    playerSubmitted: false,
    playerVoted: false,
    revealState: null,
    roundStandings: mockRoundStandings,
    finalStandings: mockGameFinalStandings,
    timeRemaining: mockGame.settings.bluffTime,
  };

  if (!mockState || mockState.startsWith("lobby-")) return state;

  if (mockState === "category-waiting") {
    state.currentPhase = "CATEGORY";
    state.players = playersForMockState("lobby-player");
    return state;
  }

  if (mockState === "trap-normal") state.currentPhase = "TRAP";
  if (mockState === "trap-submitted" || mockState === "trap-timeout") {
    state.currentPhase = "TRAP";
    state.submittedTrapAnswer = mockState === "trap-timeout" ? "No answer submitted" : "The Royal Observatory";
    state.playerSubmitted = true;
  }

  if (mockState.startsWith("voting-") || mockState === "reveal") {
    state.currentPhase = mockState === "reveal" ? "RESULTS_REVEAL" : "VOTING";
    state.submittedTrapAnswer = "The Royal Observatory";
    state.playerSubmitted = true;
  }

  if (state.playerSubmitted && mockState !== "voting-preparing") {
    state.revealState = buildRevealState(state.submittedTrapAnswer, state.players, correctAnswerForQuestion(state.currentQuestion));
    state.votingOptions = buildVotingOptions(state.revealState, state.currentRound);
  }
  if (mockState === "voting-voted") {
    state.selectedVote = state.votingOptions[0]?.id ?? null;
    state.playerVoted = state.selectedVote !== null;
  }
  if (mockState === "voting-timeout") state.timeRemaining = 0;
  if (mockState === "results") state.currentPhase = "ROUND_RESULTS";
  if (mockState === "final") state.currentPhase = "FINAL_RESULTS";
  return state;
}

function advanceExpiredPhase(current: MockGameFlowState): MockGameFlowState {
  if (current.currentPhase === "CATEGORY" && !current.selectedCategory) {
    const fallbackCategory =
      current.currentQuestion.category.toLowerCase() as Category;
    return {
      ...current,
      selectedCategory: fallbackCategory,
      currentPhase: "TRAP",
      timeRemaining: current.settings.bluffTime,
      players: current.players.map((player) =>
        player.status === "OFFLINE"
          ? player
          : { ...player, status: "THINKING" },
      ),
    };
  }

  if (current.currentPhase === "TRAP" && !current.playerSubmitted) {
    const timedOutAnswer = "No answer submitted";
    const revealState = buildRevealState(
      timedOutAnswer,
      current.players,
      correctAnswerForQuestion(current.currentQuestion),
    );
    return {
      ...current,
      submittedTrapAnswer: timedOutAnswer,
      playerSubmitted: true,
      revealState,
      votingOptions: buildVotingOptions(revealState, current.currentRound),
      players: current.players.map((player) =>
        player.isYou ? { ...player, status: "SUBMITTED" } : player,
      ),
    };
  }

  return current;
}

function resetRound(
  current: MockGameFlowState,
  nextRound: number,
): MockGameFlowState {
  return {
    ...current,
    currentPhase: "CATEGORY",
    currentRound: nextRound,
    selectedCategory: null,
    currentQuestion: questionForRound(nextRound),
    submittedTrapAnswer: "",
    votingOptions: [],
    selectedVote: null,
    playerSubmitted: false,
    playerVoted: false,
    revealState: null,
    timeRemaining: current.settings.bluffTime,
  };
}

function questionForRound(round: number, category?: Category): Question {
  const categoryQuestion = category
    ? mockQuestions.find(
        (question) => question.category.toLowerCase() === category,
      )
    : undefined;
  const question =
    categoryQuestion ?? mockQuestions[(round - 1) % mockQuestions.length];

  if (!question) {
    throw new Error(
      "At least one mock question is required to start the game.",
    );
  }

  return {
    ...question,
    category: category ? category.toUpperCase() : question.category,
  };
}

function buildRevealState(
  submittedAnswer: string,
  players: Player[],
  correctAnswer: string,
): AnswerReveal {
  const currentPlayer = players.find((player) => player.isYou);
  const playerIds = new Set(players.map((player) => player.id));
  const submissions = mockAnswerReveal.submissions
    .filter((submission) => playerIds.has(submission.author.id))
    .map((submission) =>
      submission.author.id === currentPlayer?.id
        ? { ...submission, text: submittedAnswer }
        : submission,
    );

  if (
    currentPlayer &&
    !submissions.some((submission) => submission.author.id === currentPlayer.id)
  ) {
    submissions.push({
      id: `trap_${currentPlayer.id}`,
      text: submittedAnswer,
      author: {
        id: currentPlayer.id,
        name: currentPlayer.name,
        avatar: currentPlayer.avatar,
      },
    });
  }

  return {
    correctAnswer,
    submissions,
  };
}

const correctAnswersByQuestionId: Record<Question["id"], string> = {
  "history-printing": "The Inca civilization",
  "science-element": "Tungsten",
  "geography-capital": "Peru",
  "sports-trophy": "Uruguay",
  "gaming-character": "Jumpman",
  "movies-award": "Wings",
  "music-instrument": "The piano",
};

function correctAnswerForQuestion(question: Question) {
  return correctAnswersByQuestionId[question.id] ?? mockAnswerReveal.correctAnswer;
}

function buildVotingOptions(
  reveal: AnswerReveal,
  round: number,
): VotingOption[] {
  const answerTexts = [
    reveal.correctAnswer,
    ...reveal.submissions.map((submission) => submission.text),
  ];
  const offset = answerTexts.length > 0 ? round % answerTexts.length : 0;
  const randomized = [
    ...answerTexts.slice(offset),
    ...answerTexts.slice(0, offset),
  ];

  return randomized.map((text, index) => ({
    id: `choice_${round}_${String(index + 1).padStart(2, "0")}`,
    text,
  }));
}

"use client";

import { useState } from "react";
import RoomLobby from "./lobby/RoomLobby";

type RoomPhase =
  | "lobby"
  | "category"
  | "question"
  | "voting"
  | "results"
  | "podium";

type RoomProps = {
  roomCode: string;
};

export default function Room({ roomCode }: RoomProps) {
  const [phase, setPhase] = useState<RoomPhase>("lobby");

  switch (phase) {
    case "lobby":
      return <RoomLobby roomCode={roomCode} onStartGame={() => setPhase("category")} />;

    // case "category":
    //   return <CategoryPhase />;

    // case "question":
    //   return <QuestionPhase />;

    // case "voting":
    //   return <VotingPhase />;

    // case "results":
    //   return <ResultsPhase />;

    // case "podium":
    //   return <PodiumPhase />;
  }
}
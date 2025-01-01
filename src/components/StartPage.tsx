"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import TITLE from "@/assets/images/title.webp";
import Navbar from "./SpecialNavbar";
import ShipSelector from "./ShipSelector";
import { ShipDetails } from "@/constants";
import ParticlesComponent from "./ParticlesBackground";
import { refreshTheAccessToken } from "../utils/authUtils";

const Game = dynamic(() => import("./Game"), { ssr: false });
const Loading = dynamic(() => import("./Loading"), { ssr: false });

const StartPage = () => {
  const [selectedShip, setSelectedShip] = useState(ShipDetails[0]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highScore, setHighScore] = useState<number | string | null>(null);
  const [rank, setRank] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchScoreAndRank = async () => {
      const token = await refreshTheAccessToken();
      if (!token) {
        console.error("Failed to refresh token.");
        return;
      }
  
      try {
        const response = await fetch(
          "https://space-shooter-nfxj.onrender.com/doodle/score",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch score and rank.");
        }
  
        const data = await response.json();
  
        // Update state with fetched data or 'N/A' if missing
        setHighScore(data.highScore ?? "N/A");
        setRank(data.rank ?? "N/A");
      } catch (error) {
        console.error("Error fetching score and rank:", error);
        setHighScore("N/A");
        setRank("N/A");
      }
    };
  
    fetchScoreAndRank();
  }, []);
  

  const playClickSound = () => {
    const audio = new Audio("/audio/click.mp3");
    audio.play().catch((error) => {
      if (error.name === "NotAllowedError") {
        console.warn(
          "Audio playback failed due to autoplay restrictions. The user needs to interact with the document first."
        );
      } else {
        console.error("Audio playback failed:", error);
      }
    });
  };

  const handleShipSelect = (ship: { src: string; alt: string; name: string }) => {
    setSelectedShip(ship);
    playClickSound();
  };

  const startGame = () => {
    playClickSound();
    setIsLoading(true);
    setTimeout(() => {
      setIsGameStarted(true);
      setIsLoading(false);
    }, 9000);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isGameStarted) {
    return <Game selectedShip={selectedShip} />;
  }

  return (
    <div className="w-full h-full bg-black max-w-[480px] mx-auto">
      <div className="flex relative bg-black max-w-md mx-auto max-h-screen pb-[16px] overflow-x-hidden flex-col items-center h-screen font-pixeboy border-smaller">
        <ParticlesComponent />
        <Navbar />
        <div className="flex relative items-center flex-col justify-between f-full">
          <Image
            src={TITLE}
            alt="DOODLE BLAST"
            className="max-w-[258px] mt-[148px] mb-[5px]"
          />
          <div className="flex flex-col gap-[15px] scale-90">
            <div className="flex flex-col justify-center items-center gap-0">
              <p className="text-[30px] text-white mt-[6px]">Select Ship</p>
              <p className="text-skyblue_btn text-[18px] mt-[-7px]">
                {selectedShip.name || "No Ship Selected"}
              </p>
            </div>
            <div>
              <ShipSelector
                onShipSelect={handleShipSelect}
                ships={ShipDetails}
              />
            </div>
          </div>
          <div className="flex flex-col gap-[27px] mt-[-8px]">
            <div className="flex justify-center gap-[6px] items-center flex-col text-[18px]">
              <div className="text-center flex flex-col text-cherryPink_text">
                <p>YOUR RANK : {rank || "Fetching..."}</p>
                <p className="mt-[-8px]">YOUR HIGH SCORE : {highScore || "Fetching..."}</p>
              </div>
              <div className="text-center flex flex-col text-[16px]">
                <a
                  href="/leaderboard"
                  className="text-skyblue_btn underline underline-offset-2"
                  onClick={playClickSound}
                >
                  VISIT LEADERBOARD
                </a>
                <a
                  href="/"
                  className="text-coralRed_btn cursor-pointer underline underline-offset-2 mt-[-4px]"
                  onClick={playClickSound}
                >
                  GO BACK
                </a>
              </div>
            </div>
            <div className="borderGradient scale-95 mt-[-16px]">
              <button onClick={startGame} className="specialBg">
                <p className="pt-[3.5px]">Start Game</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;

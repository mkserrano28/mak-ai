import { useState } from "react";
import { generateBamboozleQuestions } from "../../services/bamboozleApi";
import { useNavigate } from "react-router-dom";

const subjects = [
  {
    id: "science",
    name: "Science",
    icon: "🔬",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "➗",
  },
  {
    id: "ict",
    name: "ICT & Programming",
    icon: "💻",
  },
  {
    id: "english",
    name: "English",
    icon: "📚",
  },
  {
    id: "general",
    name: "General Knowledge",
    icon: "🌎",
  },
  {
    id: "ai",
    name: "AI & Technology",
    icon: "🤖",
  },
];

export default function Bamboozle() {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);

  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [teams, setTeams] = useState(2);

  const [teamNames, setTeamNames] = useState({
    1: "Team 1",
    2: "Team 2",
    3: "Team 3",
    4: "Team 4",
  });

  const [teamScores, setTeamScores] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  const [selectedTeam, setSelectedTeam] = useState(1);
  const [selectedTile, setSelectedTile] = useState(null);
  const [usedTiles, setUsedTiles] = useState([]);
  const [specialMessage, setSpecialMessage] = useState("");
  const [doubleNext, setDoubleNext] = useState({});

  // AI question generation state
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const startGame = async () => {
    if (!grade || !subject || loadingQuestions) return;

    setLoadingQuestions(true);
    setGenerationError("");
    setSelectedTile(null);
    setShowAnswer(false);
    setSpecialMessage("");

    try {
      const data = await generateBamboozleQuestions(grade, subject);

      if (!data?.questions || data.questions.length < 20) {
        throw new Error("Mak-AI did not generate enough questions.");
      }

      setQuestions(data.questions.slice(0, 20));
      setGameStarted(true);
    } catch (error) {
      console.error("Bamboozle generation failed:", error);
      setGenerationError(error?.message || "Unable to generate questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleTileClick = (tile) => {
    if (usedTiles.includes(tile.id)) return;

    setSelectedTile(tile);
    setShowAnswer(false);
    setSpecialMessage("");
  };

  const handleAnswer = (correct) => {
    if (!selectedTile) return;

    if (correct) {
      let earnedPoints = selectedTile.points;

      if (doubleNext[selectedTeam]) {
        earnedPoints *= 2;

        setDoubleNext((current) => ({
          ...current,
          [selectedTeam]: false,
        }));
      }

      setTeamScores((current) => ({
        ...current,
        [selectedTeam]: current[selectedTeam] + earnedPoints,
      }));
    }

    setUsedTiles((current) => [...current, selectedTile.id]);

    setSelectedTile(null);
    setShowAnswer(false);

    setSelectedTeam((currentTeam) =>
      currentTeam === teams ? 1 : currentTeam + 1,
    );
  };

  const handleSpecialTile = () => {
    if (!selectedTile) return;

    switch (selectedTile.type) {
      case "bonus":
        setTeamScores((current) => ({
          ...current,
          [selectedTeam]: current[selectedTeam] + 50,
        }));

        setSpecialMessage(`🎁 ${teamNames[selectedTeam]} earned +50 points!`);
        break;

      case "bomb":
        setTeamScores((current) => ({
          ...current,
          [selectedTeam]: Math.max(0, current[selectedTeam] - 25),
        }));

        setSpecialMessage(`💣 ${teamNames[selectedTeam]} lost 25 points!`);
        break;

      case "double":
        setDoubleNext((current) => ({
          ...current,
          [selectedTeam]: true,
        }));

        setSpecialMessage(
          "⭐ Double Points! Your next correct answer is worth 2× points!",
        );
        break;

      case "swap": {
        const otherTeams = Array.from(
          { length: teams },
          (_, index) => index + 1,
        ).filter((team) => team !== selectedTeam);

        const randomTeam =
          otherTeams[Math.floor(Math.random() * otherTeams.length)];

        if (!randomTeam) {
          setSpecialMessage("🔄 Swap requires at least two teams.");
          break;
        }

        setTeamScores((current) => ({
          ...current,
          [selectedTeam]: current[randomTeam],
          [randomTeam]: current[selectedTeam],
        }));

        setSpecialMessage(
          `🔄 ${teamNames[selectedTeam]} swapped scores with ${teamNames[randomTeam]}!`,
        );

        break;
      }

      case "random": {
        const bonus = Math.random() > 0.5;

        const amount = bonus ? 50 : 25;

        setTeamScores((current) => ({
          ...current,
          [selectedTeam]: Math.max(
            0,
            current[selectedTeam] + (bonus ? amount : -amount),
          ),
        }));

        setSpecialMessage(
          bonus
            ? `🎲 Lucky! ${teamNames[selectedTeam]} gained ${amount} points!`
            : `🎲 Unlucky! ${teamNames[selectedTeam]} lost ${amount} points!`,
        );

        break;
      }

      default:
        break;
    }
  };
  const resetGame = () => {
    setTeamScores({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

    setUsedTiles([]);
    setSelectedTile(null);
    setShowAnswer(false);
    setSelectedTeam(1);
    setDoubleNext({});
    setSpecialMessage("");
  };

  const backToSetup = () => {
    resetGame();
    setGameStarted(false);
  };
  const specialTiles = {
    5: {
      id: 5,
      points: 50,
      type: "bonus",
      label: "🎁",
    },
    10: {
      id: 10,
      points: 50,
      type: "bomb",
      label: "💣",
    },
    15: {
      id: 15,
      points: 50,
      type: "double",
      label: "⭐",
    },
    20: {
      id: 20,
      points: 50,
      type: "swap",
      label: "🔄",
    },
    25: {
      id: 25,
      points: 50,
      type: "random",
      label: "🎲",
    },
  };

  const specialStyles = {
    bonus:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
    bomb: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20",
    double:
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20",
    swap: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20",
    random:
      "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20",
  };

  const gameTiles = Array.from({ length: 25 }, (_, index) => {
    const tileId = index + 1;

    if (specialTiles[tileId]) {
      return specialTiles[tileId];
    }

    const questionIndex =
      tileId < 5
        ? tileId - 1
        : tileId < 10
          ? tileId - 2
          : tileId < 15
            ? tileId - 3
            : tileId < 20
              ? tileId - 4
              : tileId - 5;

    const question = questions[questionIndex];

    return {
      id: tileId,
      points: (((tileId - 1) % 5) + 1) * 10,
      type: "question",
      question: question?.question || "Question unavailable.",
      answer: question?.answer || "",
      explanation: question?.explanation || "",
    };
  });

  const gameOver = gameStarted && usedTiles.length === 25;

  const winner = gameOver
    ? Object.entries(teamScores)
        .slice(0, teams)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)[0]
    : null;

  const winnerTeamNumber = winner ? Number(winner[0]) : null;
  const winnerName = winnerTeamNumber ? teamNames[winnerTeamNumber] : "";

  // -----------------------------
  // GAME SETUP
  // -----------------------------

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <button
          onClick={() => navigate("/chat")}
          className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-700
                bg-gradient-to-r
                from-[#5B4CFF]
                via-[#7C3AED]
                to-[#A855F7]
                px-4
                py-2
                text-xs
                font-medium
                text-slate-300
                transition
                hover:bg-slate-800
                hover:text-white
            "
        >
          ← Back to Dashboard
        </button>
        <div className="max-w-4xl mx-auto">
          <div className="text-center pt-10">
            <div className="text-6xl mb-5">🎮</div>

            <h1 className="text-4xl font-bold">Mak-AI Bamboozle</h1>

            <p className="text-slate-400 mt-3">
              Create a classroom team challenge
            </p>
          </div>

          {/* Setup Card */}
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8">
            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Grade
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[10, 11, 12].map((value) => (
                  <button
                    key={value}
                    onClick={() => setGrade(String(value))}
                    className={`
                      rounded-xl border p-5
                      transition-all
                      ${
                        grade === String(value)
                          ? "border-purple-500 bg-purple-500/15 text-white"
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                      }
                    `}
                  >
                    <div className="text-2xl font-bold">Grade {value}</div>

                    <div className="text-xs mt-1 text-slate-500">
                      Grade {value} Challenge
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Subject
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSubject(item.id)}
                    className={`
                      rounded-xl border p-4
                      text-left
                      transition-all
                      ${
                        subject === item.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 bg-slate-950 hover:border-slate-500"
                      }
                    `}
                  >
                    <div className="text-2xl">{item.icon}</div>

                    <div className="mt-2 font-medium">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Teams */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Number of Teams
              </label>

              <div className="flex gap-3">
                {[2, 3, 4].map((value) => (
                  <button
                    key={value}
                    onClick={() => setTeams(value)}
                    className={`
                      flex-1 rounded-xl border py-4
                      font-semibold
                      ${
                        teams === value
                          ? "border-purple-500 bg-purple-500/15"
                          : "border-slate-700 bg-slate-950 text-slate-400"
                      }
                    `}
                  >
                    {value} Teams
                  </button>
                ))}
              </div>
            </div>

            {/* Team Names */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Team Names
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: teams }, (_, index) => {
                  const teamNumber = index + 1;

                  return (
                    <div key={teamNumber}>
                      <label className="block text-xs text-slate-500 mb-1">
                        Team {teamNumber}
                      </label>

                      <input
                        type="text"
                        value={teamNames[teamNumber]}
                        onChange={(event) =>
                          setTeamNames((current) => ({
                            ...current,
                            [teamNumber]:
                              event.target.value || `Team ${teamNumber}`,
                          }))
                        }
                        maxLength={30}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-700
                          bg-slate-950
                          px-4
                          py-3
                          text-white
                          outline-none
                          placeholder:text-slate-600
                          focus:border-purple-500
                        "
                        placeholder={`Team ${teamNumber}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start */}
            <button
              onClick={startGame}
              disabled={!grade || !subject || loadingQuestions}
              className="
                mt-10
                w-full
                rounded-xl
                bg-gradient-to-r
                from-[#5B4CFF]
                via-[#7C3AED]
                to-[#A855F7]
                py-4
                font-semibold
                text-white
                transition
                hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loadingQuestions
                ? "🤖 Mak-AI is creating your game..."
                : "🎮 Start Bamboozle"}
            </button>

            {generationError && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-red-500/30
                  bg-red-500/10
                  px-4
                  py-3
                  text-sm
                  text-red-300
                  text-center
                "
              >
                ⚠️ {generationError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // GAME BOARD
  // -----------------------------

  if (gameOver) {
    const rankings = Object.entries(teamScores)
      .slice(0, teams)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto pt-10">
          <div className="text-center">
            <div className="text-6xl mb-5">🏆</div>

            <h1 className="text-4xl font-bold">Game Over!</h1>

            <p className="text-slate-400 mt-2">
              All 25 tiles have been played.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-sm uppercase tracking-wider text-yellow-400">
              🥇 Winner
            </p>

            <h2 className="text-3xl font-bold mt-2">{winnerName}</h2>

            <p className="text-5xl font-bold text-yellow-400 mt-3">
              {teamScores[winnerTeamNumber]}
            </p>

            <p className="text-slate-500 mt-1">points</p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="font-semibold mb-4">Final Scores</h3>

            <div className="space-y-3">
              {rankings.map(([teamNumber, score], index) => (
                <div
                  key={teamNumber}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-slate-950
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : "🏅"}
                    </span>

                    <span className="font-medium">
                      {teamNames[Number(teamNumber)]}
                    </span>
                  </div>

                  <span className="font-bold">{score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={resetGame}
              className="
                flex-1
                rounded-xl
                bg-gradient-to-r
                from-[#5B4CFF]
                to-[#A855F7]
                py-3
                font-semibold
                hover:brightness-110
              "
            >
              🔄 Play Again
            </button>

            <button
              onClick={backToSetup}
              className="
                flex-1
                rounded-xl
                bg-slate-800
                py-3
                font-semibold
                hover:bg-slate-700
              "
            >
              ⚙️ Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">🎮 Mak-AI Bamboozle</h1>

            <p className="text-slate-400 mt-1">
              Grade {grade} •{" "}
              {subjects.find((item) => item.id === subject)?.name}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={backToSetup}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              ⚙️ Setup
            </button>

            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              🔄 New Game
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div
          className={`
    grid gap-4 mb-8
    ${
      teams === 2
        ? "grid-cols-2"
        : teams === 3
          ? "grid-cols-3"
          : "grid-cols-2 lg:grid-cols-4"
    }
  `}
        >
          {Array.from({ length: teams }, (_, index) => {
            const teamNumber = index + 1;

            const teamStyles = [
              "border-blue-500 bg-blue-500/10 text-blue-400",
              "border-purple-500 bg-purple-500/10 text-purple-400",
              "border-emerald-500 bg-emerald-500/10 text-emerald-400",
              "border-orange-500 bg-orange-500/10 text-orange-400",
            ];

            const activeStyle =
              teamStyles[index] ||
              "border-purple-500 bg-purple-500/10 text-purple-400";

            return (
              <div
                key={teamNumber}
                className={`
          rounded-2xl
          p-5
          border
          transition-all
          ${
            selectedTeam === teamNumber
              ? activeStyle
              : "border-slate-800 bg-slate-900"
          }
        `}
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">
                    {teamNames[teamNumber]}
                  </p>

                  {selectedTeam === teamNumber && (
                    <span className="text-xs text-white">🎯 Turn</span>
                  )}
                </div>

                <p
                  className={`
            text-4xl
            font-bold
            mt-2
            ${selectedTeam === teamNumber ? "" : "text-white"}
          `}
                >
                  {teamScores[teamNumber]}
                </p>

                <p className="text-xs text-slate-500 mt-1">points</p>
              </div>
            );
          })}
        </div>

        {/* Turn */}
        <div className="text-center mb-6">
          <span className="inline-flex px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-sm">
            🎯 {teamNames[selectedTeam]}'s turn
          </span>
        </div>

        {/* Board */}
        <div className="grid grid-cols-5 gap-3">
          {gameTiles.map((tile) => {
            const used = usedTiles.includes(tile.id);

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={used}
                className={`
        aspect-square
        rounded-xl
        border
        flex
        flex-col
        items-center
        justify-center
        font-bold
        transition-all
        duration-200
        ${
          used
            ? "bg-slate-900 border-slate-900 text-slate-700 cursor-not-allowed"
            : tile.type === "question"
              ? "bg-slate-800 border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:scale-105"
              : `${specialStyles[tile.type]} hover:scale-105`
        }
      `}
              >
                {used ? (
                  <span className="text-xl">✓</span>
                ) : tile.type === "question" ? (
                  <>
                    <span className="text-2xl">{tile.points}</span>

                    <span className="text-[10px] text-slate-400 mt-1">
                      points
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">{tile.label}</span>

                    <span className="text-[10px] mt-1 opacity-70">SPECIAL</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Modal */}
      {selectedTile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-blue-400 font-semibold">
                  {teamNames[selectedTeam]}
                </p>

                <h2 className="text-3xl font-bold mt-1">
                  {selectedTile.points} Points
                </h2>
              </div>

              <button
                onClick={() => setSelectedTile(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-8 mb-8">
              {selectedTile.type === "question" ? (
                <>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Question
                  </div>

                  <p className="text-xl leading-relaxed">
                    {selectedTile.question}
                  </p>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-6xl mb-5">{selectedTile.label}</div>

                  <h3 className="text-2xl font-bold">Special Tile!</h3>

                  <p className="text-slate-400 mt-2">
                    {selectedTile.type === "bonus" &&
                      "Your team gets 50 bonus points."}

                    {selectedTile.type === "bomb" &&
                      "Your team loses 25 points."}

                    {selectedTile.type === "double" &&
                      "Your next correct answer earns double points."}

                    {selectedTile.type === "swap" &&
                      "Swap your score with another team."}

                    {selectedTile.type === "random" &&
                      "Take your chances! You may gain or lose points."}
                  </p>
                </div>
              )}
            </div>

            {specialMessage && (
              <div
                className="
                mb-4
                rounded-xl
                border
                border-purple-500/20
                bg-purple-500/10
                px-4
                py-3
                text-center
                text-purple-200
              "
              >
                {specialMessage}
              </div>
            )}

            {selectedTile.type === "question" ? (
              <>
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="
                      w-full
                      mb-4
                      py-3
                      rounded-xl
                      border
                      border-purple-500/30
                      bg-purple-500/10
                      text-purple-300
                      font-semibold
                      hover:bg-purple-500/20
                      transition
                    "
                  >
                    👁️ Reveal Answer
                  </button>
                ) : (
                  <div
                    className="
                    mb-4
                    rounded-xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/10
                    p-5
                  "
                  >
                    <p
                      className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-emerald-400
                      mb-2
                    "
                    >
                      Answer
                    </p>

                    <p className="text-lg font-semibold text-white">
                      {selectedTile.answer || "No answer provided."}
                    </p>

                    {selectedTile.explanation && (
                      <>
                        <p
                          className="
                          text-xs
                          uppercase
                          tracking-wider
                          text-slate-500
                          mt-5
                          mb-2
                        "
                        >
                          Explanation
                        </p>

                        <p
                          className="
                          text-sm
                          text-slate-300
                          leading-relaxed
                        "
                        >
                          {selectedTile.explanation}
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="
        flex-1
        py-3
        rounded-xl
        bg-green-600
        hover:bg-green-500
        font-semibold
      "
                  >
                    ✅ Correct
                  </button>

                  <button
                    onClick={() => handleAnswer(false)}
                    className="
        flex-1
        py-3
        rounded-xl
        bg-red-600
        hover:bg-red-500
        font-semibold
      "
                  >
                    ❌ Wrong
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  handleSpecialTile();

                  setShowAnswer(false);

                  setUsedTiles((current) => [...current, selectedTile.id]);

                  setSelectedTile(null);

                  setSelectedTeam((currentTeam) =>
                    currentTeam === teams ? 1 : currentTeam + 1,
                  );
                }}
                className="
      w-full
      py-3
      rounded-xl
      bg-gradient-to-r
      from-[#5B4CFF]
      to-[#A855F7]
      hover:brightness-110
      font-semibold
    "
              >
                🎯 Apply Special Tile
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

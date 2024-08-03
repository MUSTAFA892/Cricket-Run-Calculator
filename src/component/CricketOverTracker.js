import React, { useState, useEffect } from 'react';
import cricket from "../Assets/cricket.webp"

const CricketOverTracker = () => {
  // State hooks
  const [ballCount, setBallCount] = useState(0);
  const [currentOverScore, setCurrentOverScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentOver, setCurrentOver] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overScores, setOverScores] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [teamScores, setTeamScores] = useState([[], []]); // Stores the scores for both teams
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [inningEnded, setInningEnded] = useState(false);
  const [targetScore, setTargetScore] = useState(null);
  const [totalOvers, setTotalOvers] = useState(6); // Default total overs

  useEffect(() => {
    const storedScores = localStorage.getItem("teamScores");
    if (storedScores) {
      setTeamScores(JSON.parse(storedScores));
    }
  }, []);

  const addBall = (type) => {
    if (wickets < 10) {
      if (ballCount >= 6) {
        endOver();
        return;
      }

      const ballContainer = document.getElementById("balls-container");
      const ball = document.createElement("div");
      ball.classList.add("ball");
      ball.innerText = type === "dot" ? "." : type;

      if (ballCount < 6) {
        ballContainer.appendChild(ball);
        setBallCount(prev => prev + 1);
      }

      if (type !== "dot") {
        if (type !== "wicket") {
          const runs = parseInt(type);
          setCurrentOverScore(prev => prev + runs);
          setCurrentScore(prev => prev + runs);
        } else {
          setWickets(prev => prev + 1);
          if (wickets === 10) {
            endOver();
            return;
          }
        }
      }
    }
  };

  const addExtraBall = (type) => {
    if (wickets < 10) {
      const ballContainer = document.getElementById("balls-container");
      const ball = document.createElement("div");
      ball.classList.add("ball");
      if (type === "wide" || type === "no") {
        ball.innerText = type === "wide" ? "WD1" : "NB1";
        setCurrentOverScore(prev => prev + 1);
        setCurrentScore(prev => prev + 1);
      }
      ballContainer.appendChild(ball);
      updateTeamScore();
    }
  };

  const displayCurrentScore = () => {
    document.getElementById("current-score").innerText = `Current Score: ${currentScore} Runs and ${wickets} wickets`;
  };

  const updateTeamScore = () => {
    const team1Score = teamScores[0].reduce((total, score) => total + score, 0);
    const team2Score = teamScores[1].reduce((total, score) => total + score, 0);

    if (currentTeam === 2 && team2Score >= targetScore) {
      declareWinner(2, team2Score - targetScore, "runs");
    }
  };

  const endOver = () => {
    setOverScores(prev => [...prev, currentOverScore]);
    setTeamScores(prev => {
      const newScores = [...prev];
      newScores[currentTeam - 1].push(currentOverScore);
      return newScores;
    });
    setTotalScore(prev => prev + currentOverScore);
    updateLocalStorage();

    const cumulativeScoreDisplay = document.getElementById("cumulative-score");
    const overScoreElement = document.createElement("div");
    overScoreElement.innerText = `Team ${currentTeam} (${currentTeam === 1 ? team1Name : team2Name}), Over ${currentOver}: ${currentOverScore} runs`;
    cumulativeScoreDisplay.appendChild(overScoreElement);

    setCurrentOver(prev => prev + 1);
    setBallCount(0);
    setCurrentOverScore(0);

    const scoreDisplay = document.getElementById("score-display");
    scoreDisplay.innerText = `Team ${currentTeam} (${currentTeam === 1 ? team1Name : team2Name}) Total Score: ${totalScore} runs, Wickets: ${wickets}`;

    if (currentOver > totalOvers || wickets === 10) {
      if (inningEnded) {
        declareWinner();
      } else {
        switchInnings();
      }
    } else {
      disableButtons();
      showNewOverButton();
    }

    displayCurrentScore();
  };

  const switchInnings = () => {
    if (currentTeam === 1) {
      setCurrentTeam(2);
      setTargetScore(totalScore + 1); // Set target score for the second innings
      resetForNextTeam();
    } else {
      endInnings();
    }
  };

  const endInnings = () => {
    declareWinner();
    setInningEnded(true);
  };

  const resetForNextTeam = () => {
    setOverScores([]);
    setTotalScore(0);
    setWickets(0);
    setCurrentOver(1);
    setBallCount(0);
    setCurrentOverScore(0);
    setCurrentScore(0);
    document.getElementById("balls-container").innerHTML = "";
    document.getElementById("cumulative-score").innerHTML = "";
    document.getElementById("score-display").innerText = `Team ${currentTeam === 1 ? 2 : 1} (${currentTeam === 1 ? team2Name : team1Name}) starts their innings`;
    document.querySelectorAll(".buttons-container button").forEach(button => {
      button.disabled = false;
    });

  };

  const declareWinner = (winningTeam = null, margin = 0, unit = "") => {
    const scoreDisplay = document.getElementById("score-display");
    if (winningTeam) {
      alert(`Match complete! Team ${winningTeam} (${winningTeam === 1 ? team1Name : team2Name}) wins by ${margin} ${unit}!`);
      scoreDisplay.innerText = `Match complete! Team ${winningTeam} (${winningTeam === 1 ? team1Name : team2Name}) wins by ${margin} ${unit}!`;
    } else {
      const team1Score = teamScores[0].reduce((total, score) => total + score, 0);
      const team2Score = teamScores[1].reduce((total, score) => total + score, 0);
      if (team1Score > team2Score) {
        alert(`Match complete! Team 1 (${team1Name}) wins by ${team1Score - team2Score} runs!`);
        scoreDisplay.innerText = `Match complete! Team 1 (${team1Name}) wins by ${team1Score - team2Score} runs!`;
      } else if (team2Score > team1Score) {
        alert(`Match complete! Team 2 (${team2Name}) wins by ${team2Score - team1Score} runs!`);
        scoreDisplay.innerText = `Match complete! Team 2 (${team2Name}) wins by ${team2Score - team1Score} runs!`;
      } else {
        alert("Match complete! It's a tie!");
        scoreDisplay.innerText = "Match complete! It's a tie!";
      }
    }
    disableButtons();

    setTimeout(() => {
      localStorage.clear();
      console.log("Local storage cleared after 5 seconds.");
    }, 5000);
  };

  const disableButtons = () => {
    document.querySelectorAll(".buttons-container button").forEach(button => {
      button.disabled = true;
    });
  };

  const showNewOverButton = () => {
    const newOverButton = document.createElement("button");
    newOverButton.innerText = "New Over";
    newOverButton.onclick = resetOver;
    document.querySelector(".buttons-container").appendChild(newOverButton);
  };

  const resetOver = () => {
    document.getElementById("balls-container").innerHTML = "";
    document.querySelectorAll(".buttons-container button").forEach(button => {
      button.disabled = false;
    });
    document.querySelector(".buttons-container").removeChild(
      document.querySelector(".buttons-container button:last-child")
    );
    document.getElementById("score-display").innerText = "";
  };

  const updateLocalStorage = () => {
    localStorage.setItem("teamScores", JSON.stringify(teamScores));
  };

  const handleTeamNames = () => {
    if (team1Name && team2Name) {
      document.querySelector(".team-names-container").style.display = "none";
      document.querySelector(".over-container").style.display = "block";
      resetForNextTeam();
    } else {
      alert("Please enter names for both teams.");
    }
  };

  const handleResetInnings = () => {
    setCurrentTeam(1);
    setTargetScore(null);
    resetForNextTeam();
  };

  return (
    <div>
      <div className="team-names-container">
        <input
          type="text"
          placeholder="Team 1 Name"
          value={team1Name}
          onChange={(e) => setTeam1Name(e.target.value)}
        />
        <input
          type="text"
          placeholder="Team 2 Name"
          value={team2Name}
          onChange={(e) => setTeam2Name(e.target.value)}
        />
        <button onClick={handleTeamNames}>Start Match</button>
      </div>

      <div id="cricket-tracker" className="over-container" style={{ display: 'none' }}>
        <div id="balls-container" className="balls-container">
          {/* Circles representing balls in an over will be added here dynamically */}
        </div>
        <div className="buttons-container">
          <button onClick={() => addBall("1")}>1</button>
          <button onClick={() => addBall("2")}>2</button>
          <button onClick={() => addBall("3")}>3</button>
          <button onClick={() => addBall("4")}>4</button>
          <button onClick={() => addBall("5")}>5</button>
          <button onClick={() => addBall("6")}>6</button><br />
          <button onClick={() => addBall("dot")}>Dot Ball</button>
          <button onClick={() => addBall("wicket")}>Wicket</button>
          <button onClick={() => addExtraBall("wide")}>Wide Ball</button>
          <button onClick={() => addExtraBall("no")}>No Ball</button>
        </div>
        <div id="score-display" className="score-display">
          {/* Total score after each over will be displayed here */}
        </div>
        <div id="cumulative-score" className="cumulative-score">
          {/* Cumulative scores for each over will be displayed here */}
        </div>
        <div id="current-score"></div>
        <div id="target-score" className="target-score">
          {/* Target score for the second innings */}
        </div>
        <button onClick={handleResetInnings} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px' }}>Reset Innings</button>
        <style>{`
          /* CSS styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            background: url('${cricket}') no-repeat center center fixed;
            background-size: cover; /* Makes sure the image covers the whole page */
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }

          .over-container {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .balls-container {
            margin-bottom: 20px;
          }

          .ball {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #000;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            margin: 0 5px;
            font-size: 18px;
            background-color: #fff;
          }

          .buttons-container {
            margin-bottom: 20px;
          }

          .buttons-container button {
            margin: 5px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            transition: background-color 0.3s;
          }

          .buttons-container button:hover {
            background-color: #0056b3;
          }

          .score-display,
          .cumulative-score,
          .target-score {
            margin-top: 20px;
            font-size: 20px;
            font-weight: bold;
          }

          #current-score {
            margin-top: 10px;
            font-size: 18px;
          }

          button:disabled {
            background-color: gray;
            cursor: not-allowed;
          }

          button:disabled:hover {
            background-color: gray;
          }

          .team-names-container {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .team-names-container input {
            margin: 5px;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }

          .team-names-container button {
            margin: 10px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            transition: background-color 0.3s;
          }

          .team-names-container button:hover {
            background-color: #0056b3;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CricketOverTracker;

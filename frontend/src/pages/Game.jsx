import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { getQuestion, submitAnswer, nextQuestion } from '../services/api';
import '../styles/Game.css';

export default function Game() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real-time room state
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Question details (fetched from server to avoid leak)
  const [questionData, setQuestionData] = useState(null);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);

  // Local game state for current round
  const [selectedAnswer, setSelectedAnswer] = useState(null); // index
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState(null); // { isCorrect, pointsEarned, correctAnswer, speedBonus }
  const [timeLeft, setTimeLeft] = useState(15);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Scoreboard tracking
  const [scoreboard, setScoreboard] = useState([]);

  // Ref for timer loop
  const timerRef = useRef(null);
  const questionIndexRef = useRef(-1);

  // 1. Sync room state and index changes
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(
      roomRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          setError('Room disappeared or has been deleted.');
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setRoom({ id: docSnap.id, ...data });
        setLoading(false);

        // Redirect to results if game finishes
        if (data.status === 'finished') {
          navigate(`/results/${docSnap.id}`);
          return;
        }

        // Build sorted scoreboard
        const sortedPlayers = data.players
          .map((p) => ({
            uid: p.uid,
            displayName: p.displayName,
            score: data.scores[p.uid] || 0,
          }))
          .sort((a, b) => b.score - a.score);
        setScoreboard(sortedPlayers);

        // If current index increments, fetch next question!
        const nextIndex = data.currentQuestionIndex;
        if (nextIndex !== questionIndexRef.current) {
          questionIndexRef.current = nextIndex;
          // Trigger transition to next question
          handleNewQuestion(nextIndex);
        }

        // Monitor if everyone has submitted answers
        const totalPlayers = data.players.length;
        const answerKeys = Object.keys(data.answers || {}).filter(
          (key) => key.startsWith(`${nextIndex}_`)
        );
        
        if (answerKeys.length === totalPlayers && totalPlayers > 0) {
          setRoundCompleted(true);
        }
      },
      (err) => {
        console.error(err);
        setError('Lobby sync error.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      clearInterval(timerRef.current);
    };
  }, [roomId, navigate]);

  // 2. Fetch the question details when index shifts
  const handleNewQuestion = async (index) => {
    // Reset local states
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setAnswerResult(null);
    setRoundCompleted(false);
    setFetchingQuestion(true);
    clearInterval(timerRef.current);

    try {
      const res = await getQuestion(roomId);
      if (res.success) {
        if (res.data.gameOver) {
          navigate(`/results/${roomId}`);
          return;
        }
        setQuestionData(res.data);
        const limit = res.data.timeLimit || 15;
        setTimeLeft(limit);
        
        // Start countdown timer
        startCountdown(limit);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load next question.');
    } finally {
      setFetchingQuestion(false);
    }
  };

  // 3. Countdown timer implementation
  const startCountdown = (startSecs) => {
    clearInterval(timerRef.current);
    let currentVal = startSecs;
    
    timerRef.current = setInterval(() => {
      currentVal -= 1;
      setTimeLeft(currentVal);

      if (currentVal <= 0) {
        clearInterval(timerRef.current);
        // Time ran out! Force submit wrong answer if not answered yet
        handleTimeOut();
      }
    }, 1000);
  };

  // 4. Force reveal when timer hits 0
  const handleTimeOut = async () => {
    if (answerSubmitted) {
      setRoundCompleted(true);
      return;
    }
    
    // Automatically submit a -1 answer (wrong)
    setSubmitting(true);
    try {
      const res = await submitAnswer(roomId, -1, 0); // index -1, speed 0
      if (res.success) {
        setAnswerResult(res.data);
        setAnswerSubmitted(true);
        setRoundCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Submit answer click handler
  const handleAnswerSelect = async (optionIndex) => {
    if (answerSubmitted || submitting || timeLeft <= 0) return;
    
    setSelectedAnswer(optionIndex);
    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeLimit = questionData?.timeLimit || 15;
    const timeTaken = timeLimit - timeLeft;

    try {
      const res = await submitAnswer(roomId, optionIndex, timeTaken);
      if (res.success) {
        setAnswerResult(res.data);
        setAnswerSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Host button: move to next question
  const handleNextQuestion = async () => {
    if (!room || room.hostId !== user.uid) return;
    try {
      await nextQuestion(room.id);
    } catch (err) {
      console.error(err);
      setError('Failed to move to next question.');
    }
  };

  if (loading || fetchingQuestion) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Fetching Question...</p>
      </div>
    );
  }

  if (error || !room || !questionData) {
    return (
      <div className="game-container">
        <div className="glass-panel error-panel">
          <h2>⚠️ Arena Disruption</h2>
          <p>{error || 'Game not initialized'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === user.uid;
  const currentQ = questionData.question;
  const optionPrefixes = ['A', 'B', 'C', 'D'];

  return (
    <div className="game-container">
      {/* Top Banner: Question Count & Category */}
      <div className="game-header">
        <div className="header-meta">
          <span className="category-tag">{currentQ.category}</span>
          <span className={`difficulty-tag ${currentQ.difficulty}`}>
            {currentQ.difficulty}
          </span>
        </div>
        <div className="header-counter">
          Question {questionData.questionNumber} of {questionData.totalQuestions}
        </div>
      </div>

      <div className="game-layout">
        {/* Main Arena Section */}
        <div className="arena-panel">
          {/* Circular Progress Timer */}
          <div className="timer-wrapper">
            <div className={`timer-ring ${timeLeft <= 5 ? 'critical' : ''}`}>
              <span className="timer-val">{timeLeft}</span>
              <span className="timer-lbl">sec</span>
            </div>
            {answerResult && (
              <div className={`score-popup ${answerResult.isCorrect ? 'correct' : 'wrong'}`}>
                {answerResult.isCorrect ? `+${answerResult.pointsEarned} PTS` : '+0 PTS'}
              </div>
            )}
          </div>

          {/* Question Text */}
          <div className="glass-panel question-box">
            <h2>{currentQ.question}</h2>
          </div>

          {/* Options Grid */}
          <div className="options-grid">
            {currentQ.options.map((option, idx) => {
              let btnClass = '';
              const isCorrectIdx = answerResult?.correctAnswer === idx;
              const isSelectedIdx = selectedAnswer === idx;

              if (answerSubmitted) {
                if (isCorrectIdx) {
                  btnClass = 'reveal-correct';
                } else if (isSelectedIdx && !answerResult?.isCorrect) {
                  btnClass = 'reveal-wrong';
                } else {
                  btnClass = 'disabled';
                }
              } else if (selectedAnswer === idx) {
                btnClass = 'selected';
              }

              return (
                <button
                  key={idx}
                  className={`option-btn ${btnClass}`}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={answerSubmitted || submitting || timeLeft <= 0}
                >
                  <span className="option-badge">{optionPrefixes[idx]}</span>
                  <span className="option-text">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Action State / Feedback Footer */}
          <div className="game-footer-actions">
            {answerSubmitted && (
              <div className="answer-status-feedback">
                {answerResult?.isCorrect ? (
                  <p className="success-text">🎉 Excellent! Fast response bonus added.</p>
                ) : (
                  <p className="danger-text">
                    ❌ Incorrect. The correct answer was: <strong>{currentQ.options[answerResult?.correctAnswer]}</strong>
                  </p>
                )}
              </div>
            )}

            {isHost && (roundCompleted || timeLeft <= 0) && (
              <button className="btn btn-primary next-btn" onClick={handleNextQuestion}>
                {questionData.questionNumber === questionData.totalQuestions ? 'Finish Match' : 'Next Question ➡️'}
              </button>
            )}

            {!isHost && (roundCompleted || timeLeft <= 0) && (
              <div className="waiting-host-game">
                <div className="small-spinner" />
                <span>Host preparing next question...</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Scoreboard Section */}
        <div className="glass-panel scoreboard-panel">
          <h3>🏆 Live Scoreboard</h3>
          <div className="scoreboard-list">
            {scoreboard.map((player, index) => {
              const answeredThisQ = room.answers && room.answers[`${room.currentQuestionIndex}_${player.uid}`];
              
              return (
                <div key={player.uid} className={`score-item ${player.uid === user.uid ? 'is-me' : ''}`}>
                  <span className="rank-badge">#{index + 1}</span>
                  <span className="name-lbl">{player.displayName}</span>
                  <span className="indicator-answered">
                    {answeredThisQ ? '✅' : '⏳'}
                  </span>
                  <span className="score-val">{player.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

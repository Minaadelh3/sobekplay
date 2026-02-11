import React from 'react';
import { useGameSession } from '../hooks/game/useGameSession';

const GameLogicTest: React.FC = () => {
    const { score, answeredQuestionIds, isProcessing, startGame, handleAnswer } = useGameSession({
        gameId: 'test_game_001',
        gameType: 'test_quiz'
    });

    const questions = [
        { id: 'q1', text: 'Question 1 (Correct Answer)', points: 10, isCorrect: true },
        { id: 'q2', text: 'Question 2 (Wrong Answer)', points: 10, isCorrect: false },
        { id: 'q3', text: 'Question 3 (Correct Answer)', points: 20, isCorrect: true },
    ];

    return (
        <div className="p-8 text-white bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Game Logic Test</h1>

            <div className="mb-8 p-4 bg-gray-800 rounded">
                <h2 className="text-xl mb-2">Session State</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-400">Score:</p>
                        <p className="text-2xl font-mono text-green-400">{score}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Processing:</p>
                        <p className={`text-xl ${isProcessing ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {isProcessing ? 'YES' : 'NO'}
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-gray-400">Answered Questions:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {answeredQuestionIds.length === 0 ? <span className="text-gray-600">None</span> :
                            answeredQuestionIds.map(id => (
                                <span key={id} className="px-2 py-1 bg-blue-900 rounded text-xs">{id}</span>
                            ))
                        }
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={startGame}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
                >
                    Reset Game
                </button>
            </div>

            <div className="space-y-4">
                {questions.map(q => {
                    const isAnswered = answeredQuestionIds.includes(q.id);
                    return (
                        <div key={q.id} className={`p-4 border rounded ${isAnswered ? 'border-gray-700 opacity-50' : 'border-blue-500 bg-blue-900/20'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{q.text}</h3>
                                    <p className="text-sm text-gray-400">{q.points} points</p>
                                </div>
                                <button
                                    disabled={isAnswered || isProcessing}
                                    onClick={() => handleAnswer(q.id, q.isCorrect, q.points)}
                                    className={`px-4 py-2 rounded ${isAnswered
                                            ? 'bg-gray-700 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-500'
                                        }`}
                                >
                                    {isAnswered ? 'Answered' : 'Answer'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GameLogicTest;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MatchState, VersusPlayer } from '../lib/versus';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import UserAvatar from '../components/UserAvatar';
import VersusGameEngine from '../components/games/VersusGameEngine';
import VersusLobby from '../components/games/VersusLobby';
import { motion, AnimatePresence } from 'framer-motion';

const VersusPage = () => {
    const { matchId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [matchData, setMatchData] = useState<MatchState | null>(null);
    const [loading, setLoading] = useState(true);

    // If Admin, block access (Soft check, backend rules should also exist)
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            alert("المشرفين ممنوعين من اللعب لضمان العدالة 👮");
            navigate('/app/games');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!matchId) {
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, 'matches', matchId), (docSnap) => {
            if (docSnap.exists()) {
                setMatchData(docSnap.data() as MatchState);
            } else {
                setMatchData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Match sync error:", err);
            setLoading(false);
        });

        return () => unsub();
    }, [matchId]);

    // --- Actions ---
    const handleStartGame = async () => {
        if (!matchId || !matchData) return;
        try {
            await updateDoc(doc(db, 'matches', matchId), {
                status: 'in_progress',
                roundStartTime: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to start match:", err);
            alert("حصل مشكلة في بدء الماتش");
        }
    };

    const handleTeamSelect = async (team: 'A' | 'B') => {
        if (!matchId || !user) return;
        try {
            await updateDoc(doc(db, 'matches', matchId), {
                [`players.${user.id}.versusTeam`]: team
            });
        } catch (err) {
            console.error("Team select failed", err);
        }
    };

    // --- Sub-Components for States ---

    if (!matchId) return (
        <div className="min-h-screen bg-[#0B0F14] pt-20">
            <Navbar onSearchOpen={() => { }} />
            <VersusLobby />
        </div>
    );

    if (loading) return <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center text-white">جاري التحميل...</div>;

    if (!matchData) return (
        <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">الماتش مش موجود 🤷‍♂️</h2>
            <button onClick={() => navigate('/app/games')} className="text-accent-gold underline">العودة</button>
        </div>
    );

    // Game Active or Finished
    if (matchData.status === 'in_progress' || matchData.status === 'finished') {
        return (
            <VersusGameEngine
                matchId={matchId}
                currentUser={{ id: user!.id, name: user!.name }}
                initialMatchState={matchData}
                onExit={() => navigate('/app/games')}
            />
        );
    }

    // Waiting Room (Default)
    return (
        <div className="min-h-screen bg-[#0B0F14] text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-900/10 via-black to-blue-900/10 pointer-events-none" />
            <WaitingRoom
                match={matchData}
                currentUserId={user?.id}
                onStart={handleStartGame}
                onSelectTeam={handleTeamSelect}
            />
        </div>
    );
};

const WaitingRoom = ({ match, currentUserId, onStart, onSelectTeam }: {
    match: MatchState,
    currentUserId?: string,
    onStart: () => void,
    onSelectTeam: (t: 'A' | 'B') => void
}) => {
    const players = Object.values(match.players);
    const maxPlayers = match.maxPlayers || 2;
    const isHost = match.createdBy === currentUserId;

    // Group players by versusTeam
    const teamA = players.filter(p => p.versusTeam === 'A'); // Red
    const teamB = players.filter(p => p.versusTeam === 'B'); // Blue
    const unassigned = players.filter(p => !p.versusTeam);

    const teamSize = maxPlayers / 2;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10 w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10 text-center">
                <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-400 font-mono mb-4 inline-block">
                    CODE: <span className="text-accent-gold font-black text-lg tracking-widest ml-2 selectable select-all">{match.code}</span>
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3 justify-center">
                    <span>🥊</span> {maxPlayers === 4 ? 'حرب الفرق (2v2)' : 'مبارزة (1v1)'}
                </h1>
                <p className="text-gray-400">
                    {players.length}/{maxPlayers} لاعبين في الروم
                </p>
            </div>

            {/* Arena Layout */}
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 w-full mb-12">

                {/* Team A (Red) */}
                <TeamColumn
                    teamId="A"
                    color="red"
                    players={teamA}
                    maxSize={teamSize}
                    currentUserId={currentUserId}
                    onJoin={() => onSelectTeam('A')}
                    title={maxPlayers === 4 ? 'الفريق الأحمر' : 'المنافس الأول'}
                />

                {/* VS Badge */}
                <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl">
                        <span className="text-red-600">V</span>
                        <span className="text-blue-600">S</span>
                    </div>
                </div>

                {/* Team B (Blue) */}
                <TeamColumn
                    teamId="B"
                    color="blue"
                    players={teamB}
                    maxSize={teamSize}
                    currentUserId={currentUserId}
                    onJoin={() => onSelectTeam('B')}
                    title={maxPlayers === 4 ? 'الفريق الأزرق' : 'المنافس الثاني'}
                />
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
                {players.length < maxPlayers ? (
                    <div className="animate-pulse text-gray-400 font-bold bg-white/5 px-6 py-3 rounded-xl border border-white/5 inline-flex items-center gap-2">
                        <span>⏳</span>
                        <span>ابعت الكود</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-white font-mono select-all cursor-text">{match.code}</span>
                        <span>لأصحابك</span>
                    </div>
                ) : (
                    <div className="text-green-400 font-bold text-xl mb-4 animate-bounce">
                        العدد اكتمل! 🔥
                    </div>
                )}

                {/* Unassigned Warning */}
                {unassigned.length > 0 && (
                    <div className="text-yellow-500 text-sm">
                        ⚠️ في لاعبين لسه مختارش فريق!
                    </div>
                )}

                {isHost && (
                    <button
                        onClick={onStart}
                        // Allow start if >= 2 players AND at least 1 in each team
                        disabled={players.length < 2 || teamA.length === 0 || teamB.length === 0}
                        className={`
                            bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 
                            text-white font-black text-xl px-12 py-4 rounded-full shadow-lg hover:scale-105 transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
                        `}
                    >
                        {players.length < maxPlayers ? 'في انتظار الجميع...' : 'ابدأ المعركة ▶️'}
                    </button>
                )}
            </div>
        </div>
    );
};

const TeamColumn = ({ teamId, color, players, maxSize, currentUserId, onJoin, title }: any) => {
    const isRed = color === 'red';
    const borderColor = isRed ? 'border-red-500/30' : 'border-blue-500/30';
    const bgColor = isRed ? 'bg-red-900/10' : 'bg-blue-900/10';
    const textColor = isRed ? 'text-red-400' : 'text-blue-400';

    return (
        <div className={`flex-1 ${bgColor} border ${borderColor} rounded-3xl p-6 min-w-[280px] max-w-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-opacity-20`}>
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className={`font-bold text-xl ${textColor}`}>{title}</h3>
                <span className="text-xs text-gray-500 font-mono">{players.length}/{maxSize}</span>
            </div>

            {/* Slots */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
                {Array.from({ length: maxSize }).map((_, i) => {
                    const player = players[i];
                    return (
                        <div key={i} className="relative">
                            {player ? (
                                <PlayerCard player={player} isCurrentUser={player.id === currentUserId} color={color} />
                            ) : (
                                <button
                                    onClick={onJoin}
                                    className={`
                                        w-full h-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center gap-2 group
                                        hover:border-${color}-500/50 hover:bg-${color}-500/10 transition-all text-gray-500 hover:text-white
                                    `}
                                >
                                    <span className="text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform">+</span>
                                    <span className="text-sm font-bold">انضم للفريق</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Decoration */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${isRed ? 'bg-red-500' : 'bg-blue-500'} blur-[80px] opacity-20 pointer-events-none`} />
        </div>
    );
};

const PlayerCard = ({ player, isCurrentUser, color }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 relative overflow-hidden group"
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${color === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />

            <UserAvatar src={player.avatar} name={player.name} size="sm" className="shrink-0" />

            <div className="min-w-0">
                <div className="font-bold text-white truncate flex items-center gap-2">
                    {player.name}
                    {isCurrentUser && <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400">YOU</span>}
                </div>
            </div>
        </motion.div>
    );
};

export default VersusPage;

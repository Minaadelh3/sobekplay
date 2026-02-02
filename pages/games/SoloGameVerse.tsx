import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VERSES } from '../../lib/questionBank';
import MalahyEngine from '../../components/games/MalahyEngine';
import GameContainer from '../../components/games/GameContainer';

const SoloGameVerse = () => {
    const navigate = useNavigate();

    return (
        <GameContainer gameId="verse">
            {(config) => (
                <MalahyEngine
                    gameConfig={config}
                    questions={VERSES}
                    onExit={() => navigate('/app/games')}
                />
            )}
        </GameContainer>
    );
};

export default SoloGameVerse;

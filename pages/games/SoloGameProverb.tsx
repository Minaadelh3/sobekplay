import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PROVERBS } from '../../lib/questionBank';
import MalahyEngine from '../../components/games/MalahyEngine';
import GameContainer from '../../components/games/GameContainer';

const SoloGameProverb = () => {
    const navigate = useNavigate();

    return (
        <GameContainer gameId="proverb">
            {(config) => (
                <MalahyEngine
                    gameConfig={config}
                    questions={PROVERBS}
                    onExit={() => navigate('/app/games')}
                />
            )}
        </GameContainer>
    );
};

export default SoloGameProverb;

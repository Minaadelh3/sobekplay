import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WHO } from '../../lib/questionBank';
import MalahyEngine from '../../components/games/MalahyEngine';
import GameContainer from '../../components/games/GameContainer';

const SoloGameWho = () => {
    const navigate = useNavigate();

    return (
        <GameContainer gameId="who">
            {(config) => (
                <MalahyEngine
                    gameConfig={config}
                    questions={WHO}
                    onExit={() => navigate('/app/games')}
                />
            )}
        </GameContainer>
    );
};

export default SoloGameWho;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIC } from '../../lib/questionBank';
import MalahyEngine from '../../components/games/MalahyEngine';
import GameContainer from '../../components/games/GameContainer';

const SoloGameSobek = () => {
    const navigate = useNavigate();

    return (
        <GameContainer gameId="sobek_intel">
            {(config) => (
                <MalahyEngine
                    gameConfig={config}
                    questions={LOGIC}
                    onExit={() => navigate('/app/games')}
                />
            )}
        </GameContainer>
    );
};

export default SoloGameSobek;

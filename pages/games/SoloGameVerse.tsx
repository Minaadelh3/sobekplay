import React from 'react';
import { useNavigate } from 'react-router-dom';
import VerseCompletionEngine from '../../components/games/VerseCompletionEngine';
import GameContainer from '../../components/games/GameContainer';

const SoloGameVerse = () => {
    const navigate = useNavigate();

    return (
        <GameContainer gameId="kamel-elayah">
            {(config) => (
                <VerseCompletionEngine
                    gameConfig={config}
                    onExit={() => navigate('/app/games')}
                />
            )}
        </GameContainer>
    );
};

export default SoloGameVerse;

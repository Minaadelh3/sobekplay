import React from 'react';
import GameContainer from '../../components/games/GameContainer';
import WhoGame from '../../components/games/WhoGame';

const SoloGameWho = () => {
    return (
        <GameContainer gameId="who">
            {(config) => (
                <WhoGame config={config} />
            )}
        </GameContainer>
    );
};

export default SoloGameWho;

import React from 'react';
import GameContainer from '../../components/games/GameContainer';
import WhoGame from '../../components/games/WhoGame';

const SoloGameWho = () => {
    return (
        <GameContainer gameId="who">
            {() => (
                <WhoGame />
            )}
        </GameContainer>
    );
};

export default SoloGameWho;

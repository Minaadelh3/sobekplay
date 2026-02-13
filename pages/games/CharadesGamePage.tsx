import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CharadesGame as CharadesGameComponent } from '../../components/CharadesGame';
import GameContainer from '../../components/games/GameContainer';

const CharadesGame = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Track Game Open
    useEffect(() => {
        if (user) {
            import('../../lib/events').then(m => m.trackEvent(user.id, 'GAME_OPENED', { gameId: 'charades' }));
        }
    }, [user]);

    // Note: CharadesGameComponent might need updates to accept config for custom rewards later
    // For now, we wrap it to ensure at least Start/Stop functionality works.

    return (
        <GameContainer gameId="matlha_law_adak">
            {() => <CharadesGameComponent onExit={() => navigate('/app/games')} />}
        </GameContainer>
    );
};

export default CharadesGame;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CharadesGame as CharadesGameComponent } from '../../components/CharadesGame';

const CharadesGame = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Track Game Open
    useEffect(() => {
        if (user) {
            import('../../lib/events').then(m => m.trackEvent(user.id, 'GAME_OPENED', { gameId: 'charades' }));
        }
    }, [user]);

    return <CharadesGameComponent onExit={() => navigate('/app/games')} />;
};

export default CharadesGame;

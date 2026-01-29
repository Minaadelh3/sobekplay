import { GAMES_CATALOG } from '../pages/GamesPage';
import { EPISODES } from '../pages/ProgramPage';
import { Assignment } from '../data/rooms/types';

export const getWebsiteContext = (currentGuestName?: string, assignment?: Assignment | null): string => {

    // 1. Build Games Context
    const gamesList = GAMES_CATALOG.map(g => `- ${g.title}: ${g.desc} (${g.details.intro})`).join('\n');

    // 2. Build Program Context
    const programList = EPISODES.map(ep => `- ${ep.title} (${ep.date}): ${ep.intro}`).join('\n');

    // 3. Current User Context
    let userContext = "User is currently anonymous.";
    if (currentGuestName && assignment) {
        userContext = `
        User Name: ${currentGuestName}
        Room: ${assignment.room} (Floor ${assignment.floor})
        Bed: ${assignment.bedLabel}
        `;
    }

    // 4. Combine
    return `
    [WEBSITE DATA START]
    ## AVAILABLE GAMES (Tab: /games):
    ${gamesList}

    ## TRIP PROGRAM (Tab: /program):
    ${programList}

    ## CURRENT USER CONTEXT:
    ${userContext}
    [WEBSITE DATA END]
    `;
};

export type GameEventType =
    // Auth & Onboarding
    | 'USER_LOGIN'
    | 'USER_CREATED'
    | 'DAILY_LOGIN'
    | 'LOGIN_STREAK'
    | 'ONBOARDING_COMPLETED'

    // Profile
    | 'PROFILE_UPDATED'
    | 'PROFILE_PICTURE_UPLOADED'
    | 'SETTINGS_OPENED'
    | 'NOTIFICATIONS_ENABLED'
    | 'CITY_INFO_OPENED'
    | 'LOCATION_SET'

    // Navigation / Discovery
    | 'APP_OPEN'
    | 'SECTION_OPENED'
    | 'MOVIE_POSTER_OPENED'
    | 'IMAGES_SECTION_OPENED'
    | 'AUDIO_PLAYED'
    | 'SOUNDCLOUD_CLICKED'
    | 'GOOGLE_PHOTOS_CLICKED'

    // Community
    | 'TEAM_JOINED'
    | 'CHAT_MESSAGE_SENT'
    | 'ROOM_ASSIGNED'

    // Games
    | 'GAMES_OPENED'
    | 'GAME_OPENED'
    | 'GAME_COMPLETED'
    | 'GAME_SCORE_SUBMITTED'
    | 'EL_HELWA_SAVED'

    // Admin / Special
    | 'ADMIN_GRANT'
    ;

export interface GameEventPayload {
    userId: string;
    timestamp: number;
    sessionId?: string;
    metadata?: Record<string, any>;
}

export interface GameEvent {
    type: GameEventType;
    payload: GameEventPayload;
}

import * as notifications from './notifications';
import * as events from './src/events';

// Exporting the function for deployment
export const sendPushNotification = notifications.sendPushNotification;
export const onEventCreated = events.onEventCreated;

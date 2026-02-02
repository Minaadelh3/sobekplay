import { User, UserRole } from '../types/auth';

/**
 * Roles & Capabilities Matrix
 * 
 * SUPER_ADMIN:     Full Access
 * POINTS_MANAGER:  Adjust Points (< 500), View All, Export
 * GAMES_MODERATOR: Manage Games, View All
 * VIEWER:          Read Only
 * USER:            Standard Player
 */

export type Action =
    | 'view_dashboard'
    | 'manage_teams'
    | 'manage_users'
    | 'adjust_points'
    | 'adjust_points_limitless' // Can adjust > 500 points
    | 'manage_games'
    | 'export_data'
    | 'rollback_ledger'
    | 'view_audit_log';

const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
    'SUPER_ADMIN': [
        'view_dashboard',
        'manage_teams',
        'manage_users',
        'adjust_points',
        'adjust_points_limitless',
        'manage_games',
        'export_data',
        'rollback_ledger',
        'view_audit_log'
    ],
    'ADMIN': [ // Legacy support, treats as Super Admin for now
        'view_dashboard',
        'manage_teams',
        'manage_users',
        'adjust_points',
        'adjust_points_limitless',
        'manage_games',
        'export_data',
        'rollback_ledger',
        'view_audit_log'
    ],
    'POINTS_MANAGER': [
        'view_dashboard',
        'adjust_points',
        'export_data',
        'view_audit_log'
    ],
    'GAMES_MODERATOR': [
        'view_dashboard',
        'manage_games'
    ],
    'VIEWER': [
        'view_dashboard',
        'view_audit_log'
    ],
    'USER': []
};

/**
 * Checks if a user has permission to perform an action.
 */
export function can(user: User | null | undefined, action: Action): boolean {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(action);
}

/**
 * Throws an error if the user is not authorized.
 */
export function authorize(user: User | null | undefined, action: Action) {
    if (!can(user, action)) {
        throw new Error("صلاحياتك لا تسمح بهذا الإجراء 🚫");
    }
}

/**
 * Returns a label for the role in Arabic
 */
export function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
        'SUPER_ADMIN': 'مدير عام',
        'ADMIN': 'مدير',
        'POINTS_MANAGER': 'مسؤول نقاط',
        'GAMES_MODERATOR': 'مشرف ألعاب',
        'VIEWER': 'مراقب',
        'USER': 'لاعب'
    };
    return labels[role] || role;
}

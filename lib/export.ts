import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { User, TeamProfile } from '../types/auth'; // Ensure types
import { LedgerEntry } from './ledger';

/**
 * Converts an array of objects to CSV string
 */
function convertToCSV(data: any[], columns: string[]) {
    const header = columns.join(',') + '\n';
    const rows = data.map(obj => {
        return columns.map(col => {
            const val = obj[col] !== undefined ? obj[col] : '';
            // Escape quotes and wrap in quotes if contains comma
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        }).join(',');
    }).join('\n');
    return header + rows;
}

/**
 * Triggers a browser download for the given content
 */
function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); // UTF-8 for Arabic
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// --- EXPORTERS ---

export async function exportUsersToCSV() {
    const snap = await getDocs(collection(db, 'users'));
    const data = snap.docs.map(d => {
        const u = d.data() as User;
        return {
            id: u.id,
            name: u.name,
            email: u.email || '',
            role: u.role,
            teamId: u.teamId || '',
            points: u.points || 0,
            xp: u.points || 0 // Assuming points field holds score? Wait, need to check if XP/Score separate fields exist in DB yet. 
            // In MalahyEngine we saved both.
        };
    });

    const csv = convertToCSV(data, ['id', 'name', 'email', 'role', 'teamId', 'points']);
    downloadFile('\ufeff' + csv, `sobek_users_${Date.now()}.csv`); // Prepend BOM for Excel Arabic support
}

export async function exportTeamsToCSV() {
    const snap = await getDocs(collection(db, 'teams'));
    const data = snap.docs.map(d => d.data() as TeamProfile);
    const csv = convertToCSV(data, ['id', 'name', 'points', 'membersCount']); // membersCount might not exist on type, check
    downloadFile('\ufeff' + csv, `sobek_teams_${Date.now()}.csv`);
}

export async function exportLedgerToCSV() {
    const q = query(collection(db, 'ledger'), orderBy('timestamp', 'desc')); // Might be large
    const snap = await getDocs(q);

    const data = snap.docs.map(d => {
        const l = d.data() as LedgerEntry;
        return {
            id: l.id,
            type: l.type,
            amount: l.amount,
            from: `${l.fromName} (${l.fromType})`,
            to: `${l.toName} (${l.toType})`,
            reason: l.reason,
            admin: l.adminId,
            time: l.timestamp?.toDate ? l.timestamp.toDate().toISOString() : ''
        };
    });

    const csv = convertToCSV(data, ['id', 'type', 'amount', 'from', 'to', 'reason', 'admin', 'time']);
    downloadFile('\ufeff' + csv, `sobek_ledger_${Date.now()}.csv`);
}

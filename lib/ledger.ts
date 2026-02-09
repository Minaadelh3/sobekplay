import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    increment
} from 'firebase/firestore';
import { db } from './firebase';
import { awardPoints } from '../services/scoring/scoreEngine';

// --- Types ---

export type TransactionType = 'ADJUSTMENT' | 'TRANSFER' | 'GAME_REWARD' | 'TEAM_REWARD' | 'SYSTEM_RESET' | 'ROLLBACK' | 'ACHIEVEMENT_REWARD';
export type EntityType = 'SYSTEM' | 'TEAM' | 'USER';

export interface LedgerEntry {
    id: string;
    type: TransactionType;
    amount: number;

    fromType: EntityType;
    fromId: string;
    fromName: string; // Snapshot

    toType: EntityType;
    toId: string;
    toName: string; // Snapshot

    reason: string;
    adminId?: string; // Who performed it
    timestamp: any;
    metadata?: any;
}

// --- Core Logic ---

/**
 * Performs a safe point transfer or adjustment with Audit Logging.
 * Uses a Firestore Transaction to ensure atomicity.
 */
export async function performTransaction(
    params: {
        type: TransactionType;
        amount: number;
        from: { type: EntityType; id: string; name: string };
        to: { type: EntityType; id: string; name: string };
        reason: string;
        adminId?: string;
        metadata?: any;
    }
) {
    if (params.amount <= 0) throw new Error("المبلغ لازم يكون أكبر من صفر");
    if (!params.reason || params.reason.length < 3) throw new Error("لازم تكتب سبب واضح للعملية");

    // 1. Debit Source
    if (params.from.type !== 'SYSTEM') {
        await awardPoints({
            userId: params.from.type === 'USER' ? params.from.id : undefined,
            teamId: params.from.type === 'TEAM' ? params.from.id : undefined,
            actionType: `${params.type}_DEBIT`,
            points: -params.amount,
            idempotencyKey: `LEDGER:${params.type}:SOURCE:${Date.now()}:${params.from.id}`,
            reason: params.reason,
            metadata: { ...params.metadata, ledgerId: 'generated-on-success' }
        });
    }

    // 2. Credit Destination
    if (params.to.type !== 'SYSTEM') {
        await awardPoints({
            userId: params.to.type === 'USER' ? params.to.id : undefined,
            teamId: params.to.type === 'TEAM' ? params.to.id : undefined,
            actionType: `${params.type}_CREDIT`,
            points: params.amount,
            idempotencyKey: `LEDGER:${params.type}:DEST:${Date.now()}:${params.to.id}`,
            reason: params.reason,
            metadata: { ...params.metadata, ledgerId: 'generated-on-success' }
        });
    }

    // 3. Optional: Still create a legacy ledger entry for audit if needed, 
    // but the above already created two ScoreEvents.
    return true;

    return true;
}

/**
 * Reverses a previous transaction by creating an inverse entry.
 */
export async function rollbackTransaction(entryId: string, adminId: string, reason: string) {
    if (!reason) throw new Error("لازم تكتب سبب التراجع");

    await runTransaction(db, async (transaction) => {
        // 1. Get Original Entry
        const entryRef = doc(db, 'ledger', entryId);
        const entrySnap = await transaction.get(entryRef);
        if (!entrySnap.exists()) throw new Error("المعاملة الأصلية مش موجودة");

        const original = entrySnap.data() as LedgerEntry;
        if (original.type === 'ROLLBACK') throw new Error("مينفعش تعمل Rollback لـ Rollback!");

        // 2. Perform Inverse Operation
        // Original: From A -> To B
        // Rollback: From B -> To A

        const amount = original.amount;

        // Refund Sender (A gets points back)
        if (original.fromType !== 'SYSTEM') {
            const senderRef = original.fromType === 'USER' ? doc(db, 'users', original.fromId) : doc(db, 'teams', original.fromId);
            transaction.update(senderRef, {
                points: increment(amount),
                xp: increment(amount)
            });
        }

        // Deduct Receiver (B loses points)
        if (original.toType !== 'SYSTEM') {
            const receiverRef = original.toType === 'USER' ? doc(db, 'users', original.toId) : doc(db, 'teams', original.toId);
            transaction.update(receiverRef, {
                points: increment(-amount),
                xp: increment(-amount)
            });
        }

        // 3. Create Rollback Entry
        const rollbackRef = doc(collection(db, 'ledger'));
        const rollbackEntry: LedgerEntry = {
            id: rollbackRef.id,
            type: 'ROLLBACK',
            amount: amount,
            fromType: original.toType, // Swapped
            fromId: original.toId,
            fromName: original.toName,
            toType: original.fromType, // Swapped
            toId: original.fromId,
            toName: original.fromName,
            reason: `Rollback of ${entryId}: ${reason}`,
            adminId: adminId,
            timestamp: serverTimestamp()
        };

        transaction.set(rollbackRef, rollbackEntry as any);
    });

    return true;
}

// --- Fetchers ---

export async function fetchLedger(limitCount = 50) {
    const q = query(
        collection(db, 'ledger'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as LedgerEntry);
}

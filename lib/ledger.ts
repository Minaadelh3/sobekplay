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

// --- Types ---

export type TransactionType = 'ADJUSTMENT' | 'TRANSFER' | 'GAME_REWARD' | 'TEAM_REWARD' | 'SYSTEM_RESET' | 'ROLLBACK';
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

    await runTransaction(db, async (transaction) => {
        // References
        const ledgerRef = doc(collection(db, 'ledger'));
        const fromRef = params.from.type === 'USER' ? doc(db, 'users', params.from.id) :
            params.from.type === 'TEAM' ? doc(db, 'teams', params.from.id) : null;
        const toRef = params.to.type === 'USER' ? doc(db, 'users', params.to.id) :
            params.to.type === 'TEAM' ? doc(db, 'teams', params.to.id) : null;

        // 1. Validate & Deduct from Sender (if not SYSTEM)
        if (fromRef && params.from.type !== 'SYSTEM') {
            const fromSnap = await transaction.get(fromRef);
            if (!fromSnap.exists()) throw new Error(`المصدر مش موجود: ${params.from.name}`);

            const currentBalance = fromSnap.data().points || 0;
            // Prevent negative balance check could go here if strict
            // if (currentBalance < params.amount) throw new Error("رصيد المصدر غير كافي");

            transaction.update(fromRef, {
                points: currentBalance - params.amount
            });
        }

        // 2. Add to Receiver (if not SYSTEM)
        if (toRef && params.to.type !== 'SYSTEM') {
            const toSnap = await transaction.get(toRef);
            if (!toSnap.exists()) throw new Error(`المستلم مش موجود: ${params.to.name}`);

            const currentBalance = toSnap.data().points || 0;
            transaction.update(toRef, {
                points: currentBalance + params.amount
            });
        }

        // 3. Create Ledger Entry
        const entry: LedgerEntry = {
            id: ledgerRef.id,
            type: params.type,
            amount: params.amount,
            fromType: params.from.type,
            fromId: params.from.id,
            fromName: params.from.name,
            toType: params.to.type,
            toId: params.to.id,
            toName: params.to.name,
            reason: params.reason,
            adminId: params.adminId || 'system',
            timestamp: serverTimestamp(),
            metadata: params.metadata || null
        };

        transaction.set(ledgerRef, entry as any);
    });

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
            transaction.update(senderRef, { points: increment(amount) });
        }

        // Deduct Receiver (B loses points)
        if (original.toType !== 'SYSTEM') {
            const receiverRef = original.toType === 'USER' ? doc(db, 'users', original.toId) : doc(db, 'teams', original.toId);
            transaction.update(receiverRef, { points: increment(-amount) });
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

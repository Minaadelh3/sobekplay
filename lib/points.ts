
import { db } from "./firebase";
import { doc, runTransaction, serverTimestamp, collection } from "firebase/firestore";

type UpdatePointsArgs = {
    actorUid: string;
    teamId?: string;
    userId?: string;
    delta: number; // positive or negative
    reason?: string;
};

export async function updatePoints(args: UpdatePointsArgs) {
    const { actorUid, teamId, userId, delta, reason } = args;

    if (!delta || !Number.isFinite(delta)) throw new Error("Invalid delta");
    if (!teamId && !userId) throw new Error("Must provide teamId or userId");

    await runTransaction(db, async (tx) => {
        let finalTeamId = teamId;

        // 1) If userId provided: update user personalPoints
        if (userId) {
            const userRef = doc(db, "users", userId);
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists()) throw new Error("User not found");

            const userData = userSnap.data();
            const current = Number(userData.personalPoints ?? 0);
            const next = Math.max(0, current + delta);
            tx.update(userRef, { personalPoints: next, updatedAt: serverTimestamp() });

            // if teamId not provided, derive it from user to update team logs/total correctly
            if (!finalTeamId) finalTeamId = String(userData.teamId);
        }

        // 2) If teamId provided (or derived): update team totalPoints
        if (finalTeamId) {
            const teamRef = doc(db, "teams", finalTeamId);
            const teamSnap = await tx.get(teamRef);
            if (!teamSnap.exists()) {
                // If team doesn't exist, we might want to create it or skip
                // For robust apps, assume it exists or throw. Let's optionally create or throw. 
                // Given existing code creates/reads teams freely, let's just log or set.
                // Safe route: throw if strict, or setAtMerge. Prompt asked for "update".
                // Let's assume seeded.
                // throw new Error("Team not found"); 
                // Actually, let's safe set in case.
                const currentTeam = 0; // Default
                const nextTeam = Math.max(0, currentTeam + delta);
                tx.set(teamRef, { totalPoints: nextTeam, id: finalTeamId }, { merge: true });
            } else {
                const currentTeam = Number(teamSnap.data().totalPoints ?? 0);
                const nextTeam = Math.max(0, currentTeam + delta);
                tx.update(teamRef, { totalPoints: nextTeam, updatedAt: serverTimestamp() });
            }
        }

        // 3) Log
        const logRef = doc(collection(db, "points_logs"));
        tx.set(logRef, {
            actorUid,
            teamId: finalTeamId ?? null,
            userId: userId ?? null,
            delta,
            reason: reason ?? "",
            createdAt: serverTimestamp(),
        });
    });
}

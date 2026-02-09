import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Ensure admin is initialized (it might be in index.ts too, but safe here if not)
if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Enhanced resetUserPassword with debug logging
export const resetUserPassword = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    console.log("🔒 [resetUserPassword] Function triggered.");

    // 1. Permission Check
    if (!context.auth) {
        console.error("❌ [resetUserPassword] Unauthenticated call.");
        throw new functions.https.HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    const callerUid = context.auth.uid;
    console.log(`👤 [resetUserPassword] Caller: ${callerUid}`);

    try {
        // Verify Caller Role
        const callerRef = admin.firestore().collection("users").doc(callerUid);
        const callerSnap = await callerRef.get();

        if (!callerSnap.exists) {
            console.error(`❌ [resetUserPassword] Caller profile not found: ${callerUid}`);
            throw new functions.https.HttpsError("permission-denied", "Caller user not found.");
        }

        const callerData = callerSnap.data();
        const allowedRoles = ["SUPER_ADMIN", "ADMIN"];

        if (!callerData || !allowedRoles.includes(callerData.role)) {
            console.error(`❌ [resetUserPassword] Permission Denied. Role: ${callerData?.role}`);
            throw new functions.https.HttpsError("permission-denied", "Only admins can reset passwords.");
        }

        // 2. Input Validation
        const { targetUid, newPassword } = data;
        console.log(`🎯 [resetUserPassword] Target: ${targetUid}`);

        if (!targetUid || typeof targetUid !== "string") {
            throw new functions.https.HttpsError("invalid-argument", "Valid 'targetUid' required.");
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
            throw new functions.https.HttpsError("invalid-argument", "Valid 'newPassword' (min 6 chars) required.");
        }

        // 3. Execution
        console.log(`🔄 [resetUserPassword] Updating password for ${targetUid}...`);
        await admin.auth().updateUser(targetUid, {
            password: newPassword
        });
        console.log(`✅ [resetUserPassword] Password updated for ${targetUid}`);

        // 4. Logging
        await admin.firestore().collection("admin_logs").add({
            action: "RESET_PASSWORD",
            targetUid: targetUid,
            adminId: callerUid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: "SUCCESS"
        });

        return { success: true, message: "Password updated successfully." };

    } catch (error: any) {
        console.error("❌ [resetUserPassword] CRITICAL ERROR:", error);

        // Log failure to DB for audit
        try {
            await admin.firestore().collection("admin_logs").add({
                action: "RESET_PASSWORD_FAILED",
                adminId: callerUid,
                error: error.message || "Unknown Error",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (logErr) {
            console.error("Failed to log error to Firestore:", logErr);
        }

        // Re-throw standardized error
        if (error instanceof functions.https.HttpsError) throw error;

        throw new functions.https.HttpsError(
            "internal",
            "Failed to reset password. Check server logs.",
            error.message
        );
    }
});

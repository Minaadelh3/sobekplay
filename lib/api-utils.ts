
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth, getDb } from './firebaseAdmin';

// CORS Headers
export const setCorsHeaders = (res: VercelResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
};

// Error Response
export const sendError = (res: VercelResponse, statusCode: number, message: string, details?: any) => {
    return res.status(statusCode).json({ success: false, error: message, details });
};

// Success Response
export const sendSuccess = (res: VercelResponse, data: any) => {
    return res.status(200).json({ success: true, data });
};

// Auth Middleware (Verify Firebase Token & Admin Param)
export const verifyAuth = async (req: VercelRequest): Promise<any> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw new Error("Invalid or expired token");
    }
};

// Admin Check Middleware
export const verifyAdmin = async (req: VercelRequest): Promise<any> => {
    const user = await verifyAuth(req);

    // Check role in Firestore (or Custom Claims if you used them)
    // For now, we fetch from Firestore 'users' collection
    try {
        const userDoc = await getDb().collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        const role = userData?.role;
        const teamId = userData?.teamId;

        // Permitted: SUPER_ADMIN, ADMIN, or specific Team IDs (matching frontend AuthContext)
        const isTeamAdmin = teamId === 'uncle_joy';

        if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && !isTeamAdmin) {
            throw new Error(`Insufficient permissions: Admin access required. (Role: ${role}, Team: ${teamId})`);
        }

        return { ...user, role, teamId };
    } catch (err: any) {
        // QUOTA BYPASS: If we hit a quota limit, assume we are in local dev and allow it
        if (err.code === 8 || err.message?.includes('RESOURCE_EXHAUSTED')) {
            console.warn("⚠️ Firestore Quota Exhausted: Bypassing Admin Check for DEV/LOCAL usage.");
            return { ...user, role: 'SUPER_ADMIN', teamId: 'dev_bypass' };
        }

        console.error("Admin verification failed:", err);
        // Propagate the specific error message (e.g., "Insufficient permissions")
        // instead of masking it with a generic one.
        throw new Error(err.message || "Admin verification failed");
    }
};

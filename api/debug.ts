
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const report: any = {
        nodeVersion: process.version,
        env: {
            ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID ? 'Set' : 'Missing',
            ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY ? 'Set' : 'Missing',
            FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? 'Set' : 'Missing',
        },
        firebase: {
            status: 'Pending'
        }
    };

    try {
        const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (sa) {
            report.env.FIREBASE_SERVICE_ACCOUNT_LENGTH = sa.length;
            try {
                const parsed = JSON.parse(sa);
                report.firebase.parsing = 'Success';
                report.firebase.projectId = parsed.project_id;
                report.firebase.clientEmail = parsed.client_email;
            } catch (e: any) {
                report.firebase.parsing = 'Failed';
                report.firebase.parseError = e.message;
            }
        }
    } catch (e: any) {
        report.error = e.message;
    }

    res.status(200).json(report);
}

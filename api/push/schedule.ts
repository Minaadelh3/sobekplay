
import type { VercelRequest, VercelResponse } from "@vercel/node";
import sendHandler from './send'; // Reuse send logic for now, as send handles 'sendAfter'
import { setCorsHeaders, sendError } from '../../lib/api-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);
    if (req.method === "OPTIONS") return res.status(200).end();

    // Just forward to send handler which supports scheduling
    return sendHandler(req, res);
}

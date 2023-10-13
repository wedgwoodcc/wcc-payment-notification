import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createKysely } from '@vercel/postgres-kysely';
import type { Database } from '../lib/kysely.types';
// import { verifyPaypalRequest } from '../lib/verify_paypal_request';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed, use POST' })
    }

    try {

        // if (!await verifyPaypalRequest(req)) {
        //     return res.status(400).json({ error: 'Invalid request' });
        // }

        const db = createKysely<Database>();

        await db
            .insertInto('paypal_notification')
            .values({
                body: JSON.stringify(req.body),
                received_on: new Date(Date.now()).toISOString()
            })
            .execute();

    } catch (error) {
        return res.status(500).json({ error })
    }

    return res.status(200).json({
        message: `Message received!`,
    })
}
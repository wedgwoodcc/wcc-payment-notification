import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres';

export default async function handler(
    req: VercelRequest, 
    res: VercelResponse
) {
    
    //const { name = 'World' } = req.query

    try {
        await sql`insert into paypal_notification(body, received_on) values ('${req.body}', '${new Date(Date.now()).toISOString()}');`;
    } catch (error) {
        return res.status(500).json({ error })
    }

    // change this if an error occurs
    res.status(200)

    return res.json({
        message: `Message received!`,
    })
}
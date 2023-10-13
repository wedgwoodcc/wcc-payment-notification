const forge = require('node-forge');
const crypto = require('crypto')
const CRC32 = require('crc-32');
const axios = require('axios');

import type { VercelRequest } from '@vercel/node'

// https://stackoverflow.com/a/70844011/22588924

export async function verifyPaypalRequest(paypalSubsEvent: VercelRequest) : Promise<boolean> {

    const transmissionId = paypalSubsEvent.headers['PAYPAL-TRANSMISSION-ID'];
    const transmissionTime = paypalSubsEvent.headers['PAYPAL-TRANSMISSION-TIME'];
    const signature = paypalSubsEvent.headers['PAYPAL-TRANSMISSION-SIG'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const certUrl = paypalSubsEvent.headers['PAYPAL-CERT-URL'] as string;
    const bodyCrc32 = CRC32.str(paypalSubsEvent.body);
    const unsigned_crc = bodyCrc32 >>> 0;     // found by trial and error

    // verify domain is actually paypal.com, or else someone
    // could spoof in their own cert
    const urlObj = new URL(certUrl);
    if (!urlObj.hostname.endsWith('.paypal.com')) {
        throw new Error(
            `URL ${certUrl} is not in the domain paypal.com, refusing to fetch cert for security reasons`);
    }

    const validationString =
        transmissionId + '|'
        + transmissionTime + '|'
        + webhookId + '|'
        + unsigned_crc;

    const certResult = await axios.get(certUrl);   // Trust TLS to check the URL is really from *.paypal.com
    const cert = forge.pki.certificateFromPem(certResult.data);
    const publicKey = forge.pki.publicKeyToPem(cert.publicKey);
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(validationString);
    verifier.end();

    return verifier.verify(publicKey, signature, 'base64');
}
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { BrevoClient } from '@getbrevo/brevo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Brevo API client explicitly (v4 syntax)
const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY || ''
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, 'dist')));

// Get configured sender emails as an array
const getSenderEmails = () => {
    const fromEmails = process.env.BREVO_FROM_EMAILS || 'Acme <onboarding@brevo.com>';
    return fromEmails.split(',').map(e => e.trim()).filter(e => e);
};

// API Endpoint to get configuration (like available sender emails)
app.get('/api/config', (req, res) => {
    res.status(200).json({
        senderEmails: getSenderEmails()
    });
});

// API Endpoint to send emails
app.post('/api/send-email', async (req, res) => {
    try {
        const { recipients, message, senderEmail, subject, senderName: customSenderName } = req.body;

        if (!process.env.BREVO_API_KEY) {
            return res.status(500).json({ error: 'BREVO_API_KEY is not configured on the server.' });
        }

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of recipient emails.' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Please provide a message body.' });
        }

        const validSenderEmails = getSenderEmails();
        // Use the provided senderEmail if it is in the valid list, otherwise fallback to the first one in the list
        const chosenSenderEmail = validSenderEmails.includes(senderEmail) ? senderEmail : validSenderEmails[0];

        // Parse the sender string "Name <email@domain.com>" if present
        let defaultSenderName = "Acme";
        let senderAddress = "onboarding@brevo.com";

        const senderMatch = chosenSenderEmail.match(/(?:(.+?)\s*<)?(.+?@.+?)>?$/);
        if (senderMatch) {
            if (senderMatch[1]) defaultSenderName = senderMatch[1].trim();
            senderAddress = senderMatch[2].trim();
        }

        // Use custom sender name if provided, otherwise use the one extracted from the email string
        const finalSenderName = customSenderName || defaultSenderName;

        // Helper: random delay between min and max milliseconds
        const randomDelay = (min, max) => new Promise(resolve =>
            setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
        );

        // Send emails individually with a random delay between each
        const results = [];
        for (let i = 0; i < recipients.length; i++) {
            const recipientEmail = recipients[i];

            // Add a random 2–5 second delay between sends (skip delay before the first send)
            if (i > 0) {
                const delay = Math.floor(Math.random() * 3000) + 2000; // 2000–5000ms
                console.log(`Waiting ${delay}ms before sending to ${recipientEmail}...`);
                await randomDelay(delay, delay);
            }

            try {
                const data = await brevo.transactionalEmails.sendTransacEmail({
                    subject: subject || "Message from Contacts App",
                    htmlContent: message,
                    sender: { name: finalSenderName, email: senderAddress },
                    to: [{ email: recipientEmail }]
                });
                console.log(`[${i + 1}/${recipients.length}] Sent to ${recipientEmail}:`, data);
                results.push({ email: recipientEmail, success: true });
            } catch (sendErr) {
                console.error(`[${i + 1}/${recipients.length}] Failed to send to ${recipientEmail}:`, sendErr.body || sendErr);
                results.push({ email: recipientEmail, success: false, error: sendErr.body?.message || sendErr.message });
            }
        }

        const succeeded = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        console.log(`Bulk send complete: ${succeeded} sent, ${failed} failed`);
        res.status(200).json({ success: failed === 0, sent: succeeded, failed, results });

    } catch (error) {
        console.error('Brevo Server Error:', error.body || error);

        // Extract a clean error message from Brevo if possible
        const errorMessage = error.body?.message || error.message || 'Failed to send email';
        res.status(500).json({ error: errorMessage });
    }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

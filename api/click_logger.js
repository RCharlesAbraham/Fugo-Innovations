module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
        let body = '';
        await new Promise((resolve, reject) => {
            req.on('data', chunk => body += chunk);
            req.on('end', resolve);
            req.on('error', reject);
        });
        let data = {};
        try { data = JSON.parse(body || '{}'); } catch (e) { data = {}; }
        // Log to serverless function logs (visible in Vercel deployment logs)
        console.log('[chatbot_click]', { time: new Date().toISOString(), payload: data, ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress });
        // Not writing to disk (serverless ephemeral). For persistent storage, wire to an external service.
        res.json({ ok: true });
    } catch (err) {
        console.error('click_logger error', err);
        res.status(500).json({ ok: false, error: 'internal' });
    }
};

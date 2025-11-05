const fs = require('fs');
const path = require('path');

function listHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const d of list) {
        const full = path.join(dir, d.name);
        if (d.isDirectory()) {
            // skip node_modules and .git
            if (d.name === 'node_modules' || d.name === '.git') continue;
            results = results.concat(listHtmlFiles(full));
        } else if (d.isFile() && d.name.toLowerCase().endsWith('.html')) {
            results.push(full);
        }
    }
    return results;
}

function stripTags(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
}

function extractLinks(html) {
    const links = [];
    const re = /<a[^>]+href=["']?([^"'>\s]+)["']?[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        links.push({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() });
    }
    return links;
}

function makeExcerpt(content, query) {
    const len = 400;
    const low = content.toLowerCase();
    const q = query.toLowerCase();
    const pos = low.indexOf(q);
    if (pos >= 0) {
        const start = Math.max(0, pos - Math.floor(len / 2));
        const snippet = content.substr(start, len).trim();
        return (start > 0 ? '... ' : '') + snippet + (start + len < content.length ? ' ...' : '');
    }
    return content.substr(0, 400).trim();
}

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
        const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); }
            });
            req.on('error', reject);
        });
        const query = (body.message || '').toString().trim();
        if (!query) return res.json({ ok: true, reply: 'Please type a message.', source: 'local' });

        const root = process.cwd();
        const files = listHtmlFiles(root);
        const results = [];
        for (const f of files) {
            try {
                const html = fs.readFileSync(f, 'utf8');
                const clean = stripTags(html).replace(/\s+/g, ' ');
                if (clean.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                    const excerpt = makeExcerpt(clean, query);
                    const links = extractLinks(html);
                    const rel = '/' + path.relative(root, f).replace(/\\/g, '/');
                    results.push({ path: rel, excerpt, links });
                }
            } catch (e) { /* ignore file read errors */ }
        }

        if (results.length === 0) {
            // return top pages as hint
            const top = listHtmlFiles(root).slice(0, 6).map(f => ({ title: path.basename(f, '.html'), href: '/' + path.relative(root, f).replace(/\\/g, '/') }));
            const reply = "I couldn't find a close match for your question on the site. Try rephrasing or ask about a specific area (e.g. 'services', 'pricing'). Here are some pages you can check:";
            return res.json({ ok: true, reply: reply, source: 'local', links: top });
        }

        // consolidate results into reply + links
        const replyParts = results.slice(0, 4).map(r => `Page: ${r.path}\n${r.excerpt}`);
        const linksOut = [];
        for (const r of results.slice(0, 4)) {
            for (const lk of (r.links || []).slice(0, 4)) {
                let href = lk.href;
                if (!href.startsWith('http') && !href.startsWith('/')) href = path.posix.join(path.posix.dirname(r.path), href);
                linksOut.push({ title: lk.text || href, href });
            }
        }
        const reply = 'I found the following excerpt(s) on the website that match your question:\n\n' + replyParts.join('\n\n');
        return res.json({ ok: true, reply, source: 'local', links: linksOut.slice(0, 6) });
    } catch (err) {
        console.error('chat_proxy error', err);
        res.status(500).json({ ok: false, error: 'internal' });
    }
};

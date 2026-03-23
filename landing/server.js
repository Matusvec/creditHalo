require('dotenv').config({ path: __dirname + '/.env' });

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'waitlist.json');

// Use Supabase if configured, otherwise fall back to JSON file
let supabase = null;
try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.startsWith('http')) {
        const { createClient } = require('@supabase/supabase-js');
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        console.log('Using Supabase for waitlist storage');
    }
} catch {}

if (!supabase) {
    console.log('Using local JSON file for waitlist storage');
}

function readLocalWaitlist() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch { return []; }
}

function saveLocalWaitlist(list) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function serveStatic(res, filePath, contentType) {
    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
}

function json(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    // API: Add to waitlist
    if (req.method === 'POST' && req.url === '/api/waitlist') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { email } = JSON.parse(body);

                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return json(res, 400, { error: 'Please enter a valid email.' });
                }

                if (supabase) {
                    const { error } = await supabase
                        .from('waitlist')
                        .insert({ email: email.toLowerCase() });

                    if (error) {
                        if (error.code === '23505') {
                            return json(res, 409, { error: "You're already on the waitlist!" });
                        }
                        console.error('Supabase insert error:', error);
                        return json(res, 500, { error: 'Something went wrong. Please try again.' });
                    }
                } else {
                    const list = readLocalWaitlist();
                    if (list.some(e => e.email.toLowerCase() === email.toLowerCase())) {
                        return json(res, 409, { error: "You're already on the waitlist!" });
                    }
                    list.push({ email: email.toLowerCase(), joinedAt: new Date().toISOString() });
                    saveLocalWaitlist(list);
                }

                json(res, 200, { message: "You're on the list! We'll be in touch." });
            } catch (err) {
                console.error('Request error:', err);
                json(res, 400, { error: 'Invalid request.' });
            }
        });
        return;
    }

    // API: Get count
    if (req.method === 'GET' && req.url === '/api/waitlist/count') {
        try {
            let count = 0;
            if (supabase) {
                const result = await supabase
                    .from('waitlist')
                    .select('*', { count: 'exact', head: true });
                count = result.count || 0;
            } else {
                count = readLocalWaitlist().length;
            }
            return json(res, 200, { count });
        } catch (err) {
            console.error('Count error:', err);
            return json(res, 500, { count: 0 });
        }
    }

    // Serve static files
    if (req.method === 'GET') {
        const filePath = req.url === '/' ? '/index.html' : req.url;
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
        serveStatic(res, path.join(__dirname, filePath), types[ext] || 'text/plain');
        return;
    }

    res.writeHead(405);
    res.end();
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Credit Halo landing page running on http://127.0.0.1:${PORT}`);
});

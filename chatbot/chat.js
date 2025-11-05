// chat.js - demo local chatbot widget
(function () {
    // Configuration
    const proxyPaths = [
        '/api/chat_proxy',
        '/chatbot/chat_proxy.php',
        '/Chat%20bot%20Integration/chat_proxy.php',
        '/Chat bot Integration/chat_proxy.php',
        '/chat_proxy.php'
    ];

    // Build DOM elements
    function buildWidget() {
        // button
        const btn = document.createElement('button');
        btn.className = 'fugo-chat-btn';
        btn.setAttribute('aria-label', 'Open chat');
        btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        document.body.appendChild(btn);

        // panel
        const panel = document.createElement('div');
        panel.className = 'fugo-chat-panel';
        panel.style.display = 'none';

        panel.innerHTML = `
      <div class="fugo-chat-header">
        <div class="fugo-chat-title">Fugo Assistant</div>
        <button class="fugo-chat-close" aria-label="Close">✕</button>
      </div>
      <div class="fugo-chat-body" id="fugoChatBody">
        <div class="fugo-empty">Hello — ask about our services or pricing.</div>
      </div>
      <div class="fugo-chat-footer">
        <input class="fugo-chat-input" id="fugoChatInput" placeholder="Type your message..." />
        <button class="fugo-chat-send" id="fugoChatSend">Send</button>
      </div>
    `;

        document.body.appendChild(panel);

        const closeBtn = panel.querySelector('.fugo-chat-close');
        const sendBtn = panel.querySelector('#fugoChatSend');
        const input = panel.querySelector('#fugoChatInput');
        const body = panel.querySelector('#fugoChatBody');

        // Open/close
        btn.addEventListener('click', () => { panel.style.display = 'flex'; input.focus(); });
        closeBtn.addEventListener('click', () => { panel.style.display = 'none'; btn.focus(); });

        // send handler
        async function handleSend() {
            const text = input.value.trim();
            if (!text) return;
            appendMessage(body, text, 'user');
            input.value = '';
            // typing indicator
            const typing = document.createElement('div');
            typing.className = 'fugo-msg bot';
            typing.innerHTML = '<div class="fugo-bubble bot">...</div>';
            body.appendChild(typing);
            body.scrollTop = body.scrollHeight;

            // try proxy paths one by one
            let serverReply = null;
            for (const p of proxyPaths) {
                try {
                    const res = await fetch(p, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text })
                    });
                    if (res && res.ok) {
                        const data = await res.json();
                        if (data && data.ok && data.reply) { serverReply = data; break; }
                    }
                } catch (e) { /* ignore and try next */ }
            }

            typing.remove();
            if (serverReply) { appendMessage(body, serverReply, 'bot'); }
            else { appendMessage(body, { reply: mockRespond(text), source: 'mock', links: [] }, 'bot'); }
        }

        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });

        // Quick suggestion chips - helpful starters for demo
        const suggestions = [
            'Tell me about your services',
            'How much does a web app cost?',
            'What is your development process?',
            'Tell me about your analytics services'
        ];
        const chipsWrap = document.createElement('div');
        chipsWrap.style.display = 'flex';
        chipsWrap.style.flexWrap = 'wrap';
        chipsWrap.style.gap = '8px';
        chipsWrap.style.marginTop = '8px';
        suggestions.forEach(s => {
            const b = document.createElement('button');
            b.textContent = s;
            b.style.padding = '6px 10px';
            b.style.borderRadius = '9999px';
            b.style.border = '1px solid #e6e9ef';
            b.style.background = '#fff';
            b.style.cursor = 'pointer';
            b.addEventListener('click', function () {
                input.value = s;
                handleSend();
            });
            chipsWrap.appendChild(b);
        });
        // insert chips at top of body
        body.insertAdjacentElement('afterbegin', chipsWrap);
    }

    function appendMessage(container, textOrObj, from) {
        // remove empty tip if present
        const empty = container.querySelector('.fugo-empty'); if (empty) empty.remove();
        const wrapper = document.createElement('div');
        wrapper.className = 'fugo-msg ' + (from === 'user' ? 'user' : 'bot');
        const bubble = document.createElement('div');
        bubble.className = 'fugo-bubble ' + (from === 'user' ? 'user' : 'bot');

        // support object messages from server: { reply, source, links, sources }
        if (typeof textOrObj === 'object' && textOrObj !== null) {
            const reply = textOrObj.reply || '';
            // create a short summary for the bubble (first line or 220 chars)
            let summary = (reply.split('\n')[0] || reply).trim();
            if (summary.length > 220) summary = summary.slice(0, 220).trim() + '...';
            bubble.innerHTML = nl2br(escapeHtml(summary));
            wrapper.appendChild(bubble);

            // if full text is longer, add a show-more button to expand
            if (reply && reply.length > summary.length) {
                const moreBtn = document.createElement('button');
                moreBtn.className = 'fugo-more-btn';
                moreBtn.textContent = 'Show more';
                moreBtn.style.marginTop = '6px';
                moreBtn.style.background = 'transparent';
                moreBtn.style.border = 'none';
                moreBtn.style.color = 'var(--accent)';
                moreBtn.style.cursor = 'pointer';
                moreBtn.addEventListener('click', function () {
                    bubble.innerHTML = nl2br(escapeHtml(reply));
                    this.remove();
                });
                wrapper.appendChild(moreBtn);
            }

            // render link cards if provided
            if (Array.isArray(textOrObj.links) && textOrObj.links.length) {
                const cards = document.createElement('div');
                cards.className = 'fugo-link-cards';
                textOrObj.links.slice(0, 6).forEach(lk => {
                    const a = document.createElement('a');
                    a.className = 'fugo-link-card';
                    // normalize href to absolute when possible
                    let href = lk.href || lk.href || '#';
                    try {
                        const url = new URL(href, window.location.href);
                        href = url.href;
                    } catch (e) { /* leave href as-is */ }
                    a.href = href;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';

                    // thumbnail: try favicon or leave placeholder
                    const img = document.createElement('img');
                    img.className = 'fugo-link-thumb';
                    // try site favicon as a light-weight thumbnail
                    try { img.src = new URL('/favicon.ico', window.location.href).href; } catch (e) { img.src = ''; }
                    img.onerror = function () { this.style.display = 'none'; };

                    const meta = document.createElement('div');
                    meta.className = 'fugo-link-meta';
                    const title = document.createElement('div');
                    title.className = 'fugo-link-title';
                    title.textContent = lk.title || lk.text || lk.href || 'Link';
                    const hrefdiv = document.createElement('div');
                    hrefdiv.className = 'fugo-link-href';
                    hrefdiv.textContent = lk.href || '';

                    meta.appendChild(title);
                    meta.appendChild(hrefdiv);
                    a.appendChild(img);
                    a.appendChild(meta);

                    // analytics: log click back to server when opened
                    a.addEventListener('click', function (ev) {
                        try {
                            const payload = JSON.stringify({ link: href, page: window.location.pathname, query: (textOrObj && textOrObj._query) || '' });
                            const loggerEndpoint = '/api/click_logger';
                            try {
                                if (navigator.sendBeacon) {
                                    navigator.sendBeacon(loggerEndpoint, payload);
                                } else {
                                    fetch(loggerEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
                                }
                            } catch (e) { /* ignore analytics errors */ }
                        } catch (e) { /* ignore analytics errors */ }
                    });

                    cards.appendChild(a);
                });
                wrapper.appendChild(cards);
            }

            // render sources array (from LLM) if present
            if (Array.isArray(textOrObj.sources) && textOrObj.sources.length) {
                const src = document.createElement('div');
                src.className = 'fugo-sources';
                src.textContent = 'Sources: ' + textOrObj.sources.join(', ');
                wrapper.appendChild(src);
            }
        } else {
            bubble.textContent = String(textOrObj || '');
            wrapper.appendChild(bubble);
        }

        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function nl2br(s) { return String(s).replace(/\n/g, '<br>'); }

    function mockRespond(userText) {
        const text = userText.toLowerCase();
        if (!text.trim()) return "Could you type something so I can help?";

        // Greetings
        if (text.includes('hello') || text.includes('hi') || text.includes('hey')) return `Hi there! I'm Fugo's demo assistant — happy to help. You can ask about our services, pricing, technologies, or hiring process.`;

        // Services overview
        if (text.includes('service') || text.includes('services') || text.includes('offer')) return `We provide end-to-end product & engineering services:\n\n- Custom Software Development: Full-stack web and mobile applications (React, Next.js, Node.js, Python/Django) with CI/CD and QA pipelines. We handle requirements, architecture, development, testing and maintenance.\n\n- Cloud & DevOps: Cloud-native architectures on AWS/Azure/GCP, infrastructure as code, containerization (Docker) and orchestration (Kubernetes), monitoring and cost optimization.\n\n- Mobile Apps: Native and cross-platform apps (iOS/Android/Flutter/React Native) with backend integration, offline support, and app-store deployment.\n\n- Data & Analytics: Data engineering, ETL, dashboards, BI and ML model integration for actionable insights and predictive analytics.`;

        // Detailed service-specific answers
        if (text.includes('custom') || text.includes('software') || text.includes('development')) return `Custom Software Development:\n\nWe build bespoke applications tailored to your workflows. Typical engagements include discovery, solution design, MVP delivery (4-12 weeks), and iterative product development. We provide UX, backend, frontend, testing and DevOps as needed.`;

        if (text.includes('cloud') || text.includes('devops') || text.includes('infrastructure')) return `Cloud & DevOps:\n\nOur cloud practice designs scalable, secure, and cost-effective systems. Services include cloud migration, microservices, IaC (Terraform), containerization, automated deployments, and SRE/monitoring setup.`;

        if (text.includes('mobile') || text.includes('app')) return `Mobile Apps:\n\nWe deliver native and cross-platform mobile applications with polished UX, push notifications, offline sync, and backend APIs. Typical timelines: small app MVP 6-10 weeks; larger platforms 3+ months.`;

        if (text.includes('analytics') || text.includes('data') || text.includes('ml') || text.includes('ai')) return `Analytics & AI:\n\nWe help ingest, store and transform data, build dashboards (Power BI/Tableau/Looker), and integrate ML models into products. Our team focuses on reliability, feature engineering and deploying models to production.`;

        if (text.includes('process') || text.includes('engagement') || text.includes('how do')) return `Our process:\n1) Discovery and scoping (requirements & wireframes)\n2) Proposal and roadmap (milestones & cost estimate)\n3) Iterative delivery (2-week sprints, demos)\n4) Launch and support (monitoring & maintenance)\nWe adapt to fixed-price or time-and-materials models.`;

        if (text.includes('pricing') || text.includes('cost') || text.includes('estimate')) return `Pricing & estimates:\n\nCost depends on scope, complexity and timeline. For a rough guide: a simple web app MVP often starts in the low five-figure range, while enterprise platforms vary widely. Share your high-level requirements and we'll provide a quick estimate or a detailed proposal.`;

        if (text.includes('team') || text.includes('hire') || text.includes('talent')) return `Team & delivery model:\n\nYou can engage us as a dedicated team (long-term), or for a fixed-scope project. Typical team compositions: product manager, 1-2 frontend, 1-2 backend engineers, QA and DevOps as required.`;

        if (text.includes('security') || text.includes('compliance')) return `Security & compliance:\n\nWe follow secure development lifecycle practices, conduct code reviews, and can assist with compliance (GDPR, SOC2 readiness) depending on your needs.`;

        if (text.includes('contact') || text.includes('talk') || text.includes('call')) return `To get started, share a summary of your project goals, timeline and budget at contact@fugo.example or request a discovery call and we'll schedule a short meeting to discuss next steps.`;

        // fallback
        return `Thanks — I'll get back to you on that. (This is a local demo response.) If you'd like examples of our work or a quick estimate, ask: "How much to build a [web app/mobile app]".`;
    }

    // Initialize
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildWidget); else buildWidget();
})();

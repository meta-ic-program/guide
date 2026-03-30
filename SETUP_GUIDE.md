# Chatbot Setup Guide — Cloudflare Worker Proxy

This guide explains how to deploy the secure chatbot proxy so the IC Assistant works reliably long-term. The entire process takes about 10 minutes and is completely free.

---

## Why This Approach?

The previous chatbot had its Groq API key hardcoded directly in the page source. Because the site is public, automated security scanners detect and revoke exposed keys — which is why the chatbot stopped working. The fix is to route all AI requests through a **Cloudflare Worker**, a tiny serverless function that runs in the cloud and holds the API key securely on the server side. The browser never sees the key.

---

## Step 1 — Create a Free Cloudflare Account

If you don't already have one, sign up at [cloudflare.com](https://cloudflare.com). The free plan is sufficient — no credit card required.

---

## Step 2 — Create a New Worker

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. In the left sidebar, click **Workers & Pages**.
3. Click **Create** → **Create Worker**.
4. Give it a name, e.g. `ic-chat-proxy`.
5. Click **Deploy** (this creates a placeholder worker).

---

## Step 3 — Paste the Worker Code

1. After deploying, click **Edit code**.
2. Delete all the placeholder code in the editor.
3. Open the file `worker.js` from this repository and paste its entire contents into the editor.
4. Click **Deploy** again to save.

---

## Step 4 — Add Your Groq API Key as a Secret

> **Never paste the API key directly into the worker code.** Use Cloudflare Secrets instead — they are encrypted and never visible in the dashboard.

1. In your Worker's settings, go to **Settings → Variables**.
2. Under **Environment Variables**, click **Add variable**.
3. Set the **Variable name** to exactly: `GROQ_API_KEY`
4. Set the **Value** to your Groq API key (get one free at [console.groq.com](https://console.groq.com)).
5. Click the **Encrypt** toggle so it becomes a Secret.
6. Click **Save and deploy**.

---

## Step 5 — Get Your Worker URL

Your Worker URL will look like:

```
https://ic-chat-proxy.YOUR-SUBDOMAIN.workers.dev
```

You can find it on the Worker overview page under **Preview URL**.

---

## Step 6 — Update index.html

Open `index.html` and find this line near the bottom of the `<script>` section:

```javascript
const CHAT_PROXY_URL = 'REPLACE_WITH_YOUR_CLOUDFLARE_WORKER_URL';
```

Replace the placeholder with your actual Worker URL:

```javascript
const CHAT_PROXY_URL = 'https://ic-chat-proxy.YOUR-SUBDOMAIN.workers.dev';
```

Save the file, commit, and push to GitHub. The chatbot will then work reliably.

---

## Summary

| Step | What you do |
|------|-------------|
| 1 | Create a free Cloudflare account |
| 2 | Create a new Worker named `ic-chat-proxy` |
| 3 | Paste the contents of `worker.js` into the editor |
| 4 | Add `GROQ_API_KEY` as an encrypted Secret |
| 5 | Copy your Worker URL |
| 6 | Paste the URL into `index.html` and push to GitHub |

---

## Why This Is a Long-Term Fix

- The API key lives only inside Cloudflare's encrypted secret store — it is never in the HTML or JavaScript that users can view.
- The Worker enforces an origin check: only requests from `https://meta-ic-program.github.io` are accepted, blocking abuse from other sites.
- Cloudflare Workers have a generous free tier (100,000 requests/day), which is more than sufficient for internal use.
- If you ever need to rotate the API key, you update only the Cloudflare Secret — no code changes needed.

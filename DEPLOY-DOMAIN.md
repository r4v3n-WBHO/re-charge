# Going live on a custom domain (bought at domains.co.za)

Two paths. Path A keeps everything as-is (repo stays public). Path B lets you
make the repo private, hosted free on Cloudflare Pages.

In both cases, first run the URL swap and push:

```powershell
.\scripts\set-domain.ps1 -Domain "your-domain.co.za"
git add -A; git commit -m "Point site at custom domain"; git push
```

---

## Path A — keep GitHub Pages (repo stays public)

1. **GitHub side** (I/Claude can do via API, or you): repo → Settings → Pages →
   Custom domain → enter the domain → Save. Tick **Enforce HTTPS** once the
   certificate is issued (can take up to an hour after DNS resolves).

2. **domains.co.za side** — in the DNS management panel for the domain, add:

   | Type  | Host | Value               |
   |-------|------|---------------------|
   | A     | @    | 185.199.108.153     |
   | A     | @    | 185.199.109.153     |
   | A     | @    | 185.199.110.153     |
   | A     | @    | 185.199.111.153     |
   | CNAME | www  | r4v3n-wbho.github.io |

3. Wait for DNS (minutes to a few hours). Old
   `r4v3n-wbho.github.io/re-charge` links keep working — GitHub 301-redirects
   them to the new domain automatically once the custom domain is set.

## Path B — Cloudflare Pages (repo can go PRIVATE, hosting still free)

1. Create/log in at cloudflare.com (your account). Add the domain as a site;
   Cloudflare gives you two nameservers.
2. At **domains.co.za**: replace the domain's nameservers with Cloudflare's
   (Manage Domain → Nameservers). Propagation: up to 24h, usually faster.
3. In Cloudflare: Workers & Pages → Create → Pages → **Connect to Git** →
   authorise GitHub → pick `r4v3n-WBHO/re-charge`.
   - Framework preset: None. Build command: (empty). Output directory: `/`
4. Pages → Custom domains → add the domain (Cloudflare wires DNS itself).
5. Make the GitHub repo private: repo → Settings → General → Danger Zone →
   Change visibility. Cloudflare keeps deploying on every push.
6. Optional cleanup: disable GitHub Pages on the repo (Settings → Pages) —
   but only after the Cloudflare site is confirmed live. Note: old
   github.io links stop working on this path; share the new domain going
   forward.

---

## After either path

- [ ] Re-run a share-preview check (WhatsApp/LinkedIn paste) — OG URLs now
      point at the new domain
- [ ] Add the new domain in GoatCounter (Settings → Sites) if it filters
      by domain
- [ ] Submit `https://your-domain/sitemap.xml` to Google Search Console
- [ ] If using the Apps Script backend: nothing to change (it accepts any origin)

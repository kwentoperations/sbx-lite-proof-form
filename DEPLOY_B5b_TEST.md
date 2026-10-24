# B5b TEST github.io deploy — 2026-10-24 Asia/Taipei

**Auth:** t376s1714 (Alwin). TEST only. No LIVE customer traffic. No ManyChat/Messenger publish. Listener stays DISABLED.

## Public URL (Alwin-ready page)

`https://kwentoperations.github.io/sbx-lite-proof-form/`

Repo: `https://github.com/kwentoperations/sbx-lite-proof-form` (public, Pages from `main` `/`).

Soft spam filter (ships in page): `formKey=fk-b5b-test`, `origin=https://kwentoperations.github.io` (matches `BS_B5B_FORM_KEY` / `BS_B5B_FORM_ORIGIN` defaults on box).

## How POST reaches the box (gap)

| Piece | Status |
| --- | --- |
| Static form on github.io | **Live** (this deploy) |
| Browser POST target in `config.js` | Still `http://127.0.0.1:8765/proof` (local-box pattern) |
| Public tunnel / webhook → box `b4.proof_form --serve` | **Not running** — gap |
| Apps Script / Drive O5 hop | Out of scope (later live unit) |

From a phone or laptop, submit will hit **that machine's** localhost (or fail mixed-content / network), not the bot box. To close the gap for hosted TEST:

1. On the box: `cd /workspace/bot-staff && python3 -m b4.proof_form --serve --port 8765` (add `--stage` only with go).
2. Expose with a short-lived HTTPS tunnel (e.g. cloudflared quick tunnel) to `http://127.0.0.1:8765`.
3. Regenerate hosted `config.js` with `apiUrl: 'https://<tunnel-host>/proof'` (keep `formKey` / `origin`). Do **not** commit production secrets; form_key is non-secret spam filter only.
4. Push and wait for Pages rebuild.

Until then: local box TEST remains `http://127.0.0.1:8765/` after `--serve`.

## Rollback

1. Disable Pages: `gh api -X DELETE repos/kwentoperations/sbx-lite-proof-form/pages` (or Settings → Pages → None).
2. Or archive/delete the repo after Alwin go: `gh repo delete kwentoperations/sbx-lite-proof-form --yes`.
3. Box binder rollback (pre-B5b offline unit): `/workspace/bot-fbm-lite/rollback/botstaff_preB5b_20261024_163923/` — unrelated to Pages; use if reverting bot-staff code.

## Do not

- Point customers / LIVE Page / ManyChat at this URL
- Start bot-staff listener without a separate go
- Enable Make image hop

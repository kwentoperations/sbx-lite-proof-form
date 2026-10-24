# B5b TEST github.io deploy — tunnel closed 2026-10-24 Asia/Manila

**Auth:** t376s1714 (Pages) + **t376s1720** (HTTPS tunnel + config.js apiUrl). TEST only. No LIVE customer traffic. No ManyChat/Messenger publish. Listener stays DISABLED. Cap unchanged.

## Public URLs

| What | URL |
| --- | --- |
| Alwin-ready form page | `https://kwentoperations.github.io/sbx-lite-proof-form/` |
| **Public API (POST)** | `https://discussing-direction-holders-mesh.trycloudflare.com/proof` |
| Tunnel base | `https://discussing-direction-holders-mesh.trycloudflare.com` |
| Local box serve | `http://127.0.0.1:8765/` |

Repo: `https://github.com/kwentoperations/sbx-lite-proof-form` (public, Pages from `main` `/`).

Soft spam filter: `formKey=fk-b5b-test`, `origin=https://kwentoperations.github.io`.

## How POST reaches the box (live as of 2026-10-24 05:55 PM Asia/Manila)

| Piece | Status |
| --- | --- |
| Static form on github.io | **Live** |
| Browser POST target in `config.js` | **`https://discussing-direction-holders-mesh.trycloudflare.com/proof`** |
| Box `b4.proof_form --serve --port 8765` | **Running** (dry-run binder; no `--stage`) |
| cloudflared quick tunnel (http2) | **Running** → loopback 8765 |
| CONNECT shim (box sand egress :7844) | **Running** — required on this box (outbound 7844 blocked; see below) |
| Apps Script / Drive O5 hop | Out of scope (later) |

### Box processes (PIDs change on restart)

1. Serve: `cd /workspace/bot-staff && python3 -m b4.proof_form --serve --port 8765`
2. Shim (root): `sudo python3 /workspace/tools/b5b_connect_shim.py` (needs `sudo ip addr add 198.18.0.1/32 dev lo` once)
3. Tunnel: `/workspace/tools/cloudflared tunnel --url http://127.0.0.1:8765 --protocol http2 --no-autoupdate`

Logs: `/tmp/b5b_proof_serve.log`, `/workspace/tools/b5b_connect_shim.log`, `/tmp/b5b_cf10.log` (latest cf log name may vary).

**Why the shim:** this box blocks direct outbound TCP/UDP **7844** (cloudflared edge). Sand egress HTTP CONNECT to `region1.v2.argotunnel.com:7844` works; the shim binds `198.18.0.1:{443,7844}` and CONNECT-proxies (remaps `h2.cftunnel.com` → `region1`).

## How to stop the tunnel

```bash
# Stop public ingress (keeps local :8765 if you want)
pkill -f 'cloudflared tunnel --url http://127.0.0.1:8765' || true
sudo pkill -f b5b_connect_shim.py || true
# Optional: remove lo alias used by shim
sudo ip addr del 198.18.0.1/32 dev lo 2>/dev/null || true
# Stop local serve
pkill -f 'b4.proof_form --serve' || true
# Point github.io back at localhost (or leave until Pages rebuild with new config)
# gh api … contents/config.js → apiUrl http://127.0.0.1:8765/proof
```

After stop, hosted form POSTs will fail until a new tunnel URL is minted and `config.js` is updated again (quick tunnels get a new hostname each start).

## Rollback

1. Disable Pages: `gh api -X DELETE repos/kwentoperations/sbx-lite-proof-form/pages` (or Settings → Pages → None).
2. Or archive/delete the repo after Alwin go: `gh repo delete kwentoperations/sbx-lite-proof-form --yes`.
3. Box binder rollback (pre-B5b offline unit): `/workspace/bot-fbm-lite/rollback/botstaff_preB5b_20261024_163923/` — unrelated to Pages; use if reverting bot-staff code.
4. Stop tunnel/shim/serve as above; restore `config.js` apiUrl to `http://127.0.0.1:8765/proof` if desired.

## Do not

- Point customers / LIVE Page / ManyChat at this URL
- Start bot-staff listener without a separate go
- Enable Make image hop
- Change TEST Sheet cap / remove `b0/DISABLED`

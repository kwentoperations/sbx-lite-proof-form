# sbx-lite-proof-form (B5b + O5 TEST)

Static proof-upload fallback for BOT-FBM Lite / Bot Staff (TEST Page only).

**O5 Spec choice 1 (offline staged):** file picker → Apps Script `route=proof_upload` → Drive public https → Submissions col Q / thin proof row → form POSTs that URL to box `b4.proof_form` → `cashier.receive_proof`.

When `config.uploadUrl` is empty, paste-https fallback stays (current B5b path).

## Messenger customer link

`https://kwentoperations.github.io/sbx-lite-proof-form/?subscriber_id=<SID>&order_id=<OID>`

## config.js

| Key | Purpose |
| --- | --- |
| `apiUrl` | Box binder POST `/proof` |
| `uploadUrl` | Apps Script web app `/exec` (proof_upload). **Blank until live go** |
| `formKey` | Soft spam filter (same key as Apps Script `FORM_KEY` after rotate on deploy) |

## Local serve (binder only; no Drive)

```bash
cd /workspace/bot-staff
python3 -m b4.proof_form --serve --port 8765
# paste https URL — file picker needs uploadUrl
```

## Live-go leftovers (not this offline unit)

1. Create Drive folder via Apps Script `setupProofFolder` (Kwent HQ Clients / SBX-LITE / Proof Uploads (TEST))
2. Redeploy Code.gs `v3lite-p0-0.3.8-o5proof` + set WRITE_BUDGET 142 + FORM_KEY into page
3. `installProofPurgeTrigger` (30d)
4. Set `uploadUrl` + push github.io; serve+tunnel for `apiUrl`
5. Phone prove allowlisted …7804 — **no** Make / LIVE Page / listener unless separate go

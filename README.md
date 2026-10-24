# sbx-lite-proof-form (B5b TEST)

Minimal **form-upload proof fallback** for Bot Staff SBX-LITE when ManyChat caption-less T-IMG is skipped/fails (LOCKED v0.6 Q9 / §14 B5b).

Posts `https` image URL + `subscriber_id` (+ optional `order_id`) to the box binder `b4.proof_form` → **same** `cashier.receive_proof` (no fork).

## Local TEST (box)

```bash
cd /workspace/bot-staff
python3 -m b4.proof_form --serve --port 8765
# open http://127.0.0.1:8765/
```

Default server mode = **dry_run** (plan only). Add `--stage` for box-only outbox/cards; `--live` needs `BS_B4_LIVE_GO=1` + allowlisted sid …7804.

`config.js` ships with `apiUrl: http://127.0.0.1:8765/proof` and non-secret `formKey: fk-b5b-test`.

## Hosted (later Alwin go)

Target pattern (same as order-form): `https://kwentoperations.github.io/sbx-lite-proof-form/`  
Point `apiUrl` at the box webhook / tunnel that runs `proof_form` (or a future Apps Script that stores the file in Drive per O5 then POSTs the https link here).

## Not in this offline unit

- Drive binary upload + Submissions column + 30-day purge (O5 full B5b)
- ManyChat / Messenger publish
- Make
- LIVE Page

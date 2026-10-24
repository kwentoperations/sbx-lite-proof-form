# sbx-lite-proof-form (B5b TEST)

Static proof-upload fallback for BOT-FBM Lite / Bot Staff (TEST Page only).

Posts `https` image URL + `subscriber_id` (+ optional `order_id`) to the box binder `b4.proof_form` → **same** `cashier.receive_proof` (no fork).

## Messenger customer link (required shape)

Links from Messenger **must** append both bound ids (never hand-typed):

`https://kwentoperations.github.io/sbx-lite-proof-form/?subscriber_id=<SID>&order_id=<OID>`

On load the page reads `?subscriber_id=` / `?sid=` and `?order_id=` / `?oid=` / `?o=`, prefills both fields, and **hides/locks** them. Bare URL still shows fields for staff/local TEST.

T6 `BS_payment_checking` and prepaid confirm (order_clerk) build this URL from the bound order automatically.

## Local serve

```bash
cd /workspace/bot-staff
python3 -m b4.proof_form --serve --port 8765
# open http://127.0.0.1:8765/?subscriber_id=28252042787717804&order_id=TEST-SBX-LITE-261024-001
```

Default server mode = **dry_run**. `--live` needs `BS_B4_LIVE_GO=1` + allowlisted sid …7804.

## github.io

`https://kwentoperations.github.io/sbx-lite-proof-form/`  
`config.js` tunnel URL left as-is unless regenerating. Soft key `fk-b5b-test`.

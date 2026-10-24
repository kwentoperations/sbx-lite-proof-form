# sbx-lite-proof-form (B5b TEST)

Static proof-upload fallback for BOT-FBM Lite / Bot Staff (TEST Page only).

Posts `https` image URL + `subscriber_id` (+ optional `order_id`) to the box binder `b4.proof_form` → **same** `cashier.receive_proof` (no fork).

## Subscriber ID (Messenger link)

Customer links from Messenger **must** append `?subscriber_id=<ManyChat user id>`:

`https://kwentoperations.github.io/sbx-lite-proof-form/?subscriber_id=2825…7804`

The page reads that query param, prefills the SID, and **hides/locks** the field (customers never type it). Bare URL still shows the field for staff/local TEST.

T6 `BS_payment_checking` and prepaid confirm (order_clerk) append this link automatically.

## Local serve

```bash
cd /workspace/bot-staff
python3 -m b4.proof_form --serve --port 8765
# open http://127.0.0.1:8765/?subscriber_id=28252042787717804
```

Default server mode = **dry_run** (plan only). Add `--stage` for box-only outbox/cards; `--live` needs `BS_B4_LIVE_GO=1` + allowlisted sid …7804.

## github.io

`https://kwentoperations.github.io/sbx-lite-proof-form/`  
`apiUrl` in `config.js` points at the box tunnel when armed (leave as-is unless regenerating tunnel). Soft key `fk-b5b-test`.

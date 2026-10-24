/* PLACEHOLDER config for B5b TEST proof form.
 * Local box: python3 -m b4.proof_form --serve  → apiUrl http://127.0.0.1:8765/proof
 * Hosted (later): set apiUrl to the box/webhook URL; formKey = BS_B5B_FORM_KEY (non-secret spam filter).
 * Do not commit real production keys. */
window.SBX_PROOF_CONFIG = {
  apiUrl: 'http://127.0.0.1:8765/proof',
  formKey: 'fk-b5b-test',
  origin: 'https://kwentoperations.github.io',
  clientCode: 'SBX-LITE',
  pageId: '692676333929511',
  source: 'form_upload'
};

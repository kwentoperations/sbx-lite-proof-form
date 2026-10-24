(function () {
  var cfg = window.SBX_PROOF_CONFIG || {};
  var form = document.getElementById('proof');
  var statusEl = document.getElementById('status');
  var submitBtn = document.getElementById('submit');

  function setStatus(msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
  }
  function setErr(name, msg) {
    var el = document.querySelector('.err[data-for="' + name + '"]');
    if (el) el.textContent = msg || '';
  }
  /** Read ?subscriber_id= (or ?sid=) from the Messenger customer link. */
  function sidFromUrl() {
    try {
      var p = new URLSearchParams(location.search || '');
      return (p.get('subscriber_id') || p.get('sid') || '').trim();
    } catch (e) { return ''; }
  }
  /** Prefill SID from URL; hide+lock the field so customers never type it (Alwin 2026-10-24). */
  function applySidPrefill() {
    var sid = sidFromUrl();
    var inp = document.getElementById('subscriber_id');
    var wrap = document.getElementById('sid_wrap');
    var locked = document.getElementById('sid_locked');
    if (!inp || !sid) return false;
    inp.value = sid;
    inp.readOnly = true;
    inp.setAttribute('aria-readonly', 'true');
    inp.classList.add('locked');
    if (wrap) wrap.hidden = true;
    if (locked) {
      locked.hidden = false;
      locked.textContent = 'Messenger account linked.';
    }
    return true;
  }
  function validate() {
    var ok = true;
    var sid = (document.getElementById('subscriber_id').value || '').trim();
    var img = (document.getElementById('image_url').value || '').trim();
    setErr('subscriber_id', ''); setErr('image_url', '');
    if (!sid) { setErr('subscriber_id', 'Kailangan ang subscriber id.'); ok = false; }
    if (!img) { setErr('image_url', 'Kailangan ang https image URL.'); ok = false; }
    else if (!/^https:\/\//i.test(img) && !/^http:\/\/127\.0\.0\.1/.test(img) && !/^http:\/\/localhost/.test(img)) {
      setErr('image_url', 'HTTPS URL lang (o localhost TEST).'); ok = false;
    }
    return ok;
  }

  applySidPrefill();

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!validate()) return;
    if (!cfg.apiUrl || String(cfg.apiUrl).indexOf('__') === 0) {
      setStatus('Hindi pa naka-configure ang proof form (config.js apiUrl).', 'error');
      return;
    }
    var body = {
      client_code: cfg.clientCode || 'SBX-LITE',
      page_id: cfg.pageId || '692676333929511',
      subscriber_id: (document.getElementById('subscriber_id').value || '').trim(),
      image_url: (document.getElementById('image_url').value || '').trim(),
      order_id: (document.getElementById('order_id').value || '').trim() || undefined,
      source: cfg.source || 'form_upload',
      form_key: cfg.formKey || '',
      origin: cfg.origin || 'https://kwentoperations.github.io'
    };
    submitBtn.disabled = true;
    setStatus('Sending…', '');
    fetch(cfg.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (j) { return { res: res, j: j }; });
    }).then(function (x) {
      if (x.j && x.j.ok) {
        setStatus('Natanggap. Order ' + (x.j.order_id || '') +
          (x.j.to_status ? ' → ' + x.j.to_status : '') +
          (x.j.mode ? ' [' + x.j.mode + ']' : ''), 'ok');
      } else {
        setStatus('Hindi natanggap: ' + ((x.j && (x.j.reason || x.j.error)) || x.res.status), 'error');
      }
    }).catch(function (e) {
      setStatus('Network error: ' + (e && e.message ? e.message : e), 'error');
    }).finally(function () { submitBtn.disabled = false; });
  });

  // Expose for offline node tests (no phone / no network).
  window.SBX_PROOF_FORM = { sidFromUrl: sidFromUrl, applySidPrefill: applySidPrefill };
})();

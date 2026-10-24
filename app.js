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
  /** Read ?subscriber_id= (or ?sid=) and ?order_id= (or ?oid= / ?o=) from Messenger customer link. */
  function paramsFromUrl() {
    try {
      var p = new URLSearchParams(location.search || '');
      return {
        subscriber_id: (p.get('subscriber_id') || p.get('sid') || '').trim(),
        order_id: (p.get('order_id') || p.get('oid') || p.get('o') || '').trim()
      };
    } catch (e) { return { subscriber_id: '', order_id: '' }; }
  }
  function sidFromUrl() { return paramsFromUrl().subscriber_id; }
  function orderIdFromUrl() { return paramsFromUrl().order_id; }

  /** Prefill SID + order_id from URL; hide+lock so customer never types (Alwin t382u / t377s1736). */
  function applyPrefill() {
    var q = paramsFromUrl();
    var any = false;
    var sidInp = document.getElementById('subscriber_id');
    var oidInp = document.getElementById('order_id');
    var sidWrap = document.getElementById('sid_wrap');
    var oidWrap = document.getElementById('oid_wrap');
    var locked = document.getElementById('prefill_locked');
    var bits = [];

    if (sidInp && q.subscriber_id) {
      sidInp.value = q.subscriber_id;
      sidInp.readOnly = true;
      sidInp.setAttribute('aria-readonly', 'true');
      sidInp.classList.add('locked');
      if (sidWrap) sidWrap.hidden = true;
      bits.push('Messenger account');
      any = true;
    }
    if (oidInp && q.order_id) {
      oidInp.value = q.order_id;
      oidInp.readOnly = true;
      oidInp.setAttribute('aria-readonly', 'true');
      oidInp.classList.add('locked');
      if (oidWrap) oidWrap.hidden = true;
      bits.push('order');
      any = true;
    }
    if (locked && any) {
      locked.hidden = false;
      locked.textContent = 'Linked from Messenger (' + bits.join(' + ') + ').';
    }
    return any;
  }
  // backward-compatible alias used by offline tests
  function applySidPrefill() { return applyPrefill(); }

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

  applyPrefill();

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

  window.SBX_PROOF_FORM = {
    paramsFromUrl: paramsFromUrl,
    sidFromUrl: sidFromUrl,
    orderIdFromUrl: orderIdFromUrl,
    applyPrefill: applyPrefill,
    applySidPrefill: applySidPrefill
  };
})();

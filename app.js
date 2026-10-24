(function () {
  var cfg = window.SBX_PROOF_CONFIG || {};
  var form = document.getElementById('proof');
  var statusEl = document.getElementById('status');
  var submitBtn = document.getElementById('submit');
  var MAX_BYTES = 1572864; // match Apps Script MAX_PROOF_BYTES (~1.5 MB)
  var ALLOWED_MIME = { 'image/jpeg': 1, 'image/png': 1, 'image/webp': 1, 'image/gif': 1 };

  function setStatus(msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
  }
  function setErr(name, msg) {
    var el = document.querySelector('.err[data-for="' + name + '"]');
    if (el) el.textContent = msg || '';
  }
  function uploadConfigured() {
    var u = (cfg.uploadUrl || '').trim();
    return !!(u && u.indexOf('__') !== 0);
  }
  function apiConfigured() {
    var u = (cfg.apiUrl || '').trim();
    return !!(u && u.indexOf('__') !== 0);
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
  function applySidPrefill() { return applyPrefill(); }

  function fileToB64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        var s = String(r.result || '');
        var i = s.indexOf(',');
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      r.onerror = function () { reject(new Error('read_failed')); };
      r.readAsDataURL(file);
    });
  }

  /** O5: POST base64 to Apps Script proof_upload → {ok, proof_url}. Offline-tested via exports. */
  function buildUploadPayload(fileMeta, b64) {
    return {
      route: 'proof_upload',
      origin: cfg.origin || 'https://kwentoperations.github.io',
      form_key: cfg.formKey || '',
      subscriber_id: (document.getElementById('subscriber_id').value || '').trim(),
      order_id: (document.getElementById('order_id').value || '').trim() || undefined,
      filename: fileMeta.name || 'proof.jpg',
      mime: fileMeta.type || 'image/jpeg',
      bytes_b64: b64
    };
  }

  function uploadToDrive(file) {
    if (!uploadConfigured()) {
      return Promise.reject(new Error('upload_not_configured'));
    }
    if (!file) return Promise.reject(new Error('no_file'));
    if (!ALLOWED_MIME[file.type]) return Promise.reject(new Error('bad_mime'));
    if (file.size > MAX_BYTES) return Promise.reject(new Error('too_large'));
    return fileToB64(file).then(function (b64) {
      var body = buildUploadPayload({ name: file.name, type: file.type }, b64);
      return fetch(cfg.uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
      }).then(function (res) {
        return res.json().then(function (j) { return { res: res, j: j }; });
      }).then(function (x) {
        if (x.j && x.j.ok && x.j.proof_url) return x.j.proof_url;
        throw new Error((x.j && (x.j.error || x.j.reason)) || ('http_' + x.res.status));
      });
    });
  }

  function buildBinderBody(imageUrl) {
    return {
      client_code: cfg.clientCode || 'SBX-LITE',
      page_id: cfg.pageId || '692676333929511',
      subscriber_id: (document.getElementById('subscriber_id').value || '').trim(),
      image_url: imageUrl,
      order_id: (document.getElementById('order_id').value || '').trim() || undefined,
      source: cfg.source || 'form_upload',
      form_key: cfg.formKey || '',
      origin: cfg.origin || 'https://kwentoperations.github.io'
    };
  }

  function validate(hasFile) {
    var ok = true;
    var sid = (document.getElementById('subscriber_id').value || '').trim();
    var img = (document.getElementById('image_url').value || '').trim();
    setErr('subscriber_id', ''); setErr('image_url', ''); setErr('proof_file', '');
    if (!sid) { setErr('subscriber_id', 'Kailangan ang subscriber id.'); ok = false; }
    if (hasFile) {
      /* file path — image_url filled after Drive hop */
    } else if (!img) {
      setErr('image_url', uploadConfigured()
        ? 'Pumili ng file o mag-paste ng https URL.'
        : 'Kailangan ang https image URL (uploadUrl hindi pa naka-set).');
      ok = false;
    } else if (!/^https:\/\//i.test(img) && !/^http:\/\/127\.0\.0\.1/.test(img) && !/^http:\/\/localhost/.test(img)) {
      setErr('image_url', 'HTTPS URL lang (o localhost TEST).'); ok = false;
    }
    return ok;
  }

  function syncPickerUi() {
    var hint = document.getElementById('picker_hint');
    var urlOpt = document.getElementById('url_opt');
    if (uploadConfigured()) {
      if (hint) hint.textContent = 'O5 ready: file → Apps Script Drive → public https → binder.';
      if (urlOpt) urlOpt.textContent = '(optional paste fallback)';
    } else {
      if (hint) hint.textContent = 'O5 offline: config.uploadUrl empty — use HTTPS paste until live go.';
      if (urlOpt) urlOpt.textContent = '(required until uploadUrl set)';
    }
  }

  applyPrefill();
  syncPickerUi();

  var fileInp = document.getElementById('proof_file');
  if (fileInp) {
    fileInp.addEventListener('change', function () {
      var f = fileInp.files && fileInp.files[0];
      var prev = document.getElementById('upload_preview');
      setErr('proof_file', '');
      if (!f) { if (prev) { prev.hidden = true; prev.textContent = ''; } return; }
      if (!ALLOWED_MIME[f.type]) { setErr('proof_file', 'JPEG/PNG/WebP/GIF lang.'); fileInp.value = ''; return; }
      if (f.size > MAX_BYTES) { setErr('proof_file', 'Max ~1.5 MB.'); fileInp.value = ''; return; }
      if (prev) {
        prev.hidden = false;
        prev.textContent = 'Selected: ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
      }
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var file = fileInp && fileInp.files && fileInp.files[0];
    if (!validate(!!file)) return;
    if (!apiConfigured()) {
      setStatus('Hindi pa naka-configure ang proof form (config.js apiUrl).', 'error');
      return;
    }
    submitBtn.disabled = true;

    var chain = Promise.resolve(null);
    if (file) {
      if (!uploadConfigured()) {
        setErr('proof_file', 'File picker needs config.uploadUrl (Apps Script). Paste https instead.');
        submitBtn.disabled = false;
        return;
      }
      setStatus('Uploading to Drive…', '');
      chain = uploadToDrive(file).then(function (url) {
        document.getElementById('image_url').value = url;
        return url;
      });
    } else {
      chain = Promise.resolve((document.getElementById('image_url').value || '').trim());
    }

    chain.then(function (imageUrl) {
      setStatus('Sending to cashier…', '');
      return fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(buildBinderBody(imageUrl))
      }).then(function (res) {
        return res.json().then(function (j) { return { res: res, j: j }; });
      });
    }).then(function (x) {
      if (x.j && x.j.ok) {
        setStatus('Natanggap. Order ' + (x.j.order_id || '') +
          (x.j.to_status ? ' → ' + x.j.to_status : '') +
          (x.j.mode ? ' [' + x.j.mode + ']' : ''), 'ok');
      } else {
        setStatus('Hindi natanggap: ' + ((x.j && (x.j.reason || x.j.error)) || x.res.status), 'error');
      }
    }).catch(function (e) {
      var msg = (e && e.message) ? e.message : String(e);
      if (msg === 'bad_mime') setErr('proof_file', 'JPEG/PNG/WebP/GIF lang.');
      else if (msg === 'too_large') setErr('proof_file', 'Max ~1.5 MB.');
      else if (msg === 'upload_not_configured') setStatus('uploadUrl hindi pa naka-set.', 'error');
      else setStatus('Error: ' + msg, 'error');
    }).finally(function () { submitBtn.disabled = false; });
  });

  window.SBX_PROOF_FORM = {
    paramsFromUrl: paramsFromUrl,
    sidFromUrl: sidFromUrl,
    orderIdFromUrl: orderIdFromUrl,
    applyPrefill: applyPrefill,
    applySidPrefill: applySidPrefill,
    uploadConfigured: uploadConfigured,
    buildUploadPayload: buildUploadPayload,
    buildBinderBody: buildBinderBody,
    MAX_BYTES: MAX_BYTES,
    ALLOWED_MIME: ALLOWED_MIME
  };
})();

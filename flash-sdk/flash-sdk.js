/**
 * Flash Pay SDK v1.0.0
 * Bitcoin Lightning x Mobile Money - Afrique de l'Ouest Francophone
 *
 * Integrez des paiements Bitcoin Lightning sur votre site ou application web
 * en quelques lignes de code. Compatible avec les Mobile Money locaux :
 * MTN MoMo, Moov Money, Celtiis, Togocel (Benin, Togo, Cote d'Ivoire).
 *
 * Documentation officielle : https://docs.bitcoinflash.xyz
 * Depot GitHub              : https://github.com/Prosper1107/flash-planB
 *
 * (c) 2026 Flash - MIT License
 */

(function (root) {
  "use strict";

  // ================================================================
  // CONSTANTES
  // ================================================================

  var VERSION = "1.0.0";

  var DEFAULTS = {
    apiBase: "https://staging.bitcoinflash.xyz",
    apiVersion: "/api/v1",
    merchantTag: "",
    token: "",
    stagingUserId: "",
    theme: "light",
    locale: "fr",
    primaryColor: "#1B4FE8",
    ratePerSat: 0.38,
    currency: "XOF",
    onSuccess: null,
    onError: null,
    onClose: null,
  };

  // Operateurs Mobile Money supportes par pays
  var OPERATORS = {
    BJ: [
      { id: "mtn", label: "MTN MoMo", apiId: "MTN_OPEN", prefix: "+229" },
      { id: "moov", label: "Moov Money", apiId: "MOOV_BENIN", prefix: "+229" },
      { id: "celtiis", label: "Celtiis", apiId: "CELTIIS_BENIN", prefix: "+229" },
    ],
    TG: [
      { id: "mtn", label: "MTN MoMo", apiId: "MTN_OPEN", prefix: "+228" },
      { id: "moov", label: "Moov Money", apiId: "MOOV_BENIN", prefix: "+228" },
      { id: "togocel", label: "Togocel", apiId: "MTN_TOGO", prefix: "+228" },
    ],
    CI: [
      { id: "moov", label: "Moov Money", apiId: "MOOV_BENIN", prefix: "+225" },
    ],
  };

  var COUNTRIES = [
    { code: "BJ", name: "Benin", flag: "BJ" },
    { code: "TG", name: "Togo", flag: "TG" },
    { code: "CI", name: "Cote d'Ivoire", flag: "CI" },
  ];

  // ================================================================
  // ETAT INTERNE
  // ================================================================

  var _config = Object.assign({}, DEFAULTS);
  var _modal = null;
  var _stylesInjected = false;

  // ================================================================
  // STYLES
  // ================================================================

  var CSS = "\n\
/* ===== Flash Pay SDK - Styles ===== */\n\
\n\
/* ---- Bouton de paiement ---- */\n\
.fp-btn {\n\
  display: inline-flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  gap: 8px;\n\
  padding: 8px 16px;\n\
  background: linear-gradient(135deg, #1B4FE8 0%, #0D37B8 100%);\n\
  color: #fff;\n\
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n\
  font-weight: 600;\n\
  font-size: 14px;\n\
  border: none;\n\
  border-radius: 14px;\n\
  cursor: pointer;\n\
  transition: transform 0.15s ease, box-shadow 0.15s ease;\n\
  box-shadow: 0 4px 14px rgba(27,79,232,0.30);\n\
  text-decoration: none;\n\
  line-height: 1.4;\n\
  white-space: normal;\n\
}\n\
.fp-btn:hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,79,232,0.40); }\n\
.fp-btn:active { transform: translateY(0); }\n\
.fp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }\n\
.fp-btn svg { width: 18px; height: 18px; flex-shrink: 0; }\n\
\n\
.fp-btn--sm   { padding: 6px 12px; font-size: 13px; border-radius: 10px; }\n\
.fp-btn--lg   { padding: 12px 20px; font-size: 15px; border-radius: 16px; }\n\
.fp-btn--full { width: 100%; }\n\
\n\
.fp-btn--outline {\n\
  background: transparent;\n\
  color: #1B4FE8;\n\
  border: 2px solid #1B4FE8;\n\
  box-shadow: none;\n\
}\n\
.fp-btn--outline:hover {\n\
  background: rgba(27,79,232,0.05);\n\
  box-shadow: none;\n\
}\n\
.fp-btn--dark {\n\
  background: linear-gradient(135deg, #0D37B8 0%, #061E6E 100%);\n\
}\n\
.fp-btn--ghost {\n\
  background: #f5f7ff;\n\
  color: #1B4FE8;\n\
  box-shadow: none;\n\
}\n\
.fp-btn--ghost:hover {\n\
  background: #e8eeff;\n\
  box-shadow: none;\n\
}\n\
\n\
/* ---- Overlay modal ---- */\n\
.fp-overlay {\n\
  position: fixed;\n\
  inset: 0;\n\
  z-index: 99999;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  padding: 16px;\n\
  background: rgba(0,0,0,0.55);\n\
  backdrop-filter: blur(4px);\n\
  -webkit-backdrop-filter: blur(4px);\n\
  opacity: 0;\n\
  transition: opacity 0.25s ease;\n\
}\n\
.fp-overlay.fp-open { opacity: 1; }\n\
\n\
/* ---- Modal ---- */\n\
.fp-modal {\n\
  background: #fff;\n\
  border-radius: 24px;\n\
  width: 100%;\n\
  max-width: 440px;\n\
  max-height: 90vh;\n\
  overflow-y: auto;\n\
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);\n\
  transform: translateY(16px) scale(0.98);\n\
  transition: transform 0.25s ease;\n\
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n\
  scrollbar-width: none;\n\
}\n\
.fp-modal::-webkit-scrollbar { display: none; }\n\
.fp-overlay.fp-open .fp-modal { transform: translateY(0) scale(1); }\n\
\n\
/* ---- En-tete modal ---- */\n\
.fp-header {\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: space-between;\n\
  padding: 20px 24px 16px;\n\
  border-bottom: 1px solid #f0f2f8;\n\
}\n\
.fp-brand {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 10px;\n\
}\n\
.fp-logo {\n\
  width: 38px;\n\
  height: 38px;\n\
  background: linear-gradient(135deg, #1B4FE8, #0D37B8);\n\
  border-radius: 12px;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  flex-shrink: 0;\n\
}\n\
.fp-logo svg { width: 20px; height: 20px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }\n\
.fp-title {\n\
  font-weight: 700;\n\
  font-size: 16px;\n\
  color: #111827;\n\
  line-height: 1.2;\n\
}\n\
.fp-subtitle {\n\
  font-size: 11px;\n\
  color: #9ca3af;\n\
  margin-top: 1px;\n\
}\n\
.fp-close {\n\
  width: 32px;\n\
  height: 32px;\n\
  border: none;\n\
  background: #f5f7ff;\n\
  border-radius: 10px;\n\
  cursor: pointer;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  color: #6b7280;\n\
  font-size: 20px;\n\
  line-height: 1;\n\
  transition: background 0.15s;\n\
  flex-shrink: 0;\n\
}\n\
.fp-close:hover { background: #e5e7f5; color: #374151; }\n\
\n\
/* ---- Corps modal ---- */\n\
.fp-body { padding: 20px 24px; }\n\
\n\
/* ---- Carte montant ---- */\n\
.fp-amount-card {\n\
  background: linear-gradient(135deg, #1B4FE8 0%, #0D37B8 100%);\n\
  border-radius: 18px;\n\
  padding: 20px;\n\
  color: #fff;\n\
  text-align: center;\n\
  margin-bottom: 20px;\n\
}\n\
.fp-amount-label { font-size: 11px; opacity: 0.75; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }\n\
.fp-amount-value { font-size: 30px; font-weight: 800; letter-spacing: -1px; }\n\
.fp-amount-sats  { font-size: 13px; opacity: 0.65; margin-top: 4px; }\n\
.fp-amount-desc  { font-size: 12px; opacity: 0.55; margin-top: 8px; font-style: italic; }\n\
\n\
/* ---- Onglets mode de paiement ---- */\n\
.fp-tabs {\n\
  display: flex;\n\
  gap: 6px;\n\
  background: #f5f7ff;\n\
  border-radius: 12px;\n\
  padding: 4px;\n\
  margin-bottom: 16px;\n\
}\n\
.fp-tab {\n\
  flex: 1;\n\
  padding: 9px 12px;\n\
  border: none;\n\
  background: transparent;\n\
  border-radius: 9px;\n\
  font-family: inherit;\n\
  font-size: 13px;\n\
  font-weight: 600;\n\
  color: #6b7280;\n\
  cursor: pointer;\n\
  transition: all 0.15s;\n\
}\n\
.fp-tab.fp-tab--active {\n\
  background: #fff;\n\
  color: #1B4FE8;\n\
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);\n\
}\n\
\n\
/* ---- Adresse Lightning ---- */\n\
.fp-ln-row {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 10px;\n\
  background: #f5f7ff;\n\
  border: 1.5px solid #e5e8f5;\n\
  border-radius: 14px;\n\
  padding: 12px 14px;\n\
  margin-bottom: 14px;\n\
}\n\
.fp-ln-icon {\n\
  width: 36px;\n\
  height: 36px;\n\
  background: #fef3c7;\n\
  border-radius: 10px;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  flex-shrink: 0;\n\
}\n\
.fp-ln-icon svg { width: 18px; height: 18px; fill: none; stroke: #f59e0b; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }\n\
.fp-ln-addr {\n\
  font-size: 13px;\n\
  font-weight: 600;\n\
  color: #1B4FE8;\n\
  word-break: break-all;\n\
  flex: 1;\n\
  min-width: 0;\n\
}\n\
.fp-copy {\n\
  padding: 6px 12px;\n\
  background: #1B4FE8;\n\
  color: #fff;\n\
  border: none;\n\
  border-radius: 9px;\n\
  font-family: inherit;\n\
  font-size: 11px;\n\
  font-weight: 700;\n\
  cursor: pointer;\n\
  white-space: normal;\n\
  transition: background 0.15s;\n\
  flex-shrink: 0;\n\
}\n\
.fp-copy:hover   { background: #0D37B8; }\n\
.fp-copy--ok     { background: #10b981; }\n\
.fp-copy--ok:hover { background: #059669; }\n\
\n\
/* ---- QR code ---- */\n\
.fp-qr {\n\
  background: #fff;\n\
  border: 1.5px solid #e5e8f5;\n\
  border-radius: 14px;\n\
  padding: 16px;\n\
  text-align: center;\n\
  margin-bottom: 14px;\n\
}\n\
.fp-qr img { max-width: 180px; margin: 0 auto; display: block; border-radius: 8px; }\n\
.fp-qr-hint { font-size: 11px; color: #9ca3af; margin-top: 8px; }\n\
\n\
/* ---- Separateur ---- */\n\
.fp-sep {\n\
  display: flex;\n\
  align-items: center;\n\
  gap: 10px;\n\
  margin: 14px 0;\n\
  color: #d1d5db;\n\
  font-size: 11px;\n\
  font-weight: 600;\n\
  text-transform: uppercase;\n\
  letter-spacing: 0.5px;\n\
}\n\
.fp-sep::before,\n\
.fp-sep::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }\n\
\n\
/* ---- Formulaire Mobile Money ---- */\n\
.fp-field { margin-bottom: 14px; }\n\
.fp-label {\n\
  display: block;\n\
  font-size: 12px;\n\
  font-weight: 600;\n\
  color: #374151;\n\
  margin-bottom: 6px;\n\
  text-transform: uppercase;\n\
  letter-spacing: 0.4px;\n\
}\n\
.fp-select,\n\
.fp-input {\n\
  width: 100%;\n\
  padding: 11px 14px;\n\
  background: #f5f7ff;\n\
  border: 1.5px solid #e5e8f5;\n\
  border-radius: 12px;\n\
  font-family: inherit;\n\
  font-size: 14px;\n\
  color: #111827;\n\
  outline: none;\n\
  transition: border-color 0.15s;\n\
  box-sizing: border-box;\n\
  -webkit-appearance: none;\n\
  appearance: none;\n\
}\n\
.fp-select { background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; cursor: pointer; }\n\
.fp-select:focus,\n\
.fp-input:focus { border-color: #1B4FE8; }\n\
\n\
/* ---- Operateurs grille ---- */\n\
.fp-operators {\n\
  display: grid;\n\
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));\n\
  gap: 8px;\n\
}\n\
.fp-op-btn {\n\
  padding: 10px 8px;\n\
  border: 1.5px solid #e5e8f5;\n\
  background: #f5f7ff;\n\
  border-radius: 12px;\n\
  font-family: inherit;\n\
  font-size: 12px;\n\
  font-weight: 600;\n\
  color: #374151;\n\
  cursor: pointer;\n\
  text-align: center;\n\
  transition: all 0.15s;\n\
  line-height: 1.3;\n\
}\n\
.fp-op-btn:hover       { border-color: #1B4FE8; color: #1B4FE8; background: #f0f4ff; }\n\
.fp-op-btn.fp-op--sel  { border-color: #1B4FE8; background: #eff3ff; color: #1B4FE8; }\n\
\n\
/* ---- Etat paiement ---- */\n\
.fp-state {\n\
  text-align: center;\n\
  padding: 28px 0 16px;\n\
}\n\
.fp-state-icon {\n\
  width: 64px;\n\
  height: 64px;\n\
  border-radius: 50%;\n\
  display: flex;\n\
  align-items: center;\n\
  justify-content: center;\n\
  margin: 0 auto 16px;\n\
}\n\
.fp-state-icon svg { width: 30px; height: 30px; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }\n\
.fp-state-icon--ok  { background: #d1fae5; }\n\
.fp-state-icon--ok svg { stroke: #10b981; }\n\
.fp-state-icon--err { background: #fee2e2; }\n\
.fp-state-icon--err svg { stroke: #ef4444; }\n\
.fp-state-icon--wait { background: #fef3c7; }\n\
.fp-state-icon--wait svg { stroke: #f59e0b; }\n\
\n\
.fp-state-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 6px; }\n\
.fp-state-msg   { font-size: 13px; color: #6b7280; }\n\
\n\
/* ---- Recap ---- */\n\
.fp-recap {\n\
  background: #f5f7ff;\n\
  border-radius: 14px;\n\
  padding: 14px 16px;\n\
  margin: 16px 0;\n\
}\n\
.fp-recap-row {\n\
  display: flex;\n\
  justify-content: space-between;\n\
  align-items: center;\n\
  font-size: 13px;\n\
  padding: 4px 0;\n\
}\n\
.fp-recap-row + .fp-recap-row { border-top: 1px solid #e5e8f5; }\n\
.fp-recap-label { color: #6b7280; }\n\
.fp-recap-value { font-weight: 700; color: #111827; }\n\
.fp-recap-value--ok { color: #10b981; }\n\
\n\
/* ---- Pied de modal ---- */\n\
.fp-footer {\n\
  padding: 8px 16px;\n\
  background: #f9fafb;\n\
  border-top: 1px solid #f0f2f8;\n\
  text-align: center;\n\
  border-radius: 0 0 24px 24px;\n\
}\n\
.fp-footer p {\n\
  font-size: 10px;\n\
  color: #9ca3af;\n\
  font-weight: 700;\n\
  text-transform: uppercase;\n\
  letter-spacing: 0.8px;\n\
  margin: 0;\n\
}\n\
.fp-footer a { color: #1B4FE8; text-decoration: none; }\n\
.fp-footer a:hover { text-decoration: underline; }\n\
\n\
/* ---- Spinner ---- */\n\
@keyframes fp-spin { to { transform: rotate(360deg); } }\n\
.fp-spinner {\n\
  display: inline-block;\n\
  width: 18px;\n\
  height: 18px;\n\
  border: 2.5px solid rgba(255,255,255,0.3);\n\
  border-top-color: #fff;\n\
  border-radius: 50%;\n\
  animation: fp-spin 0.6s linear infinite;\n\
  vertical-align: middle;\n\
}\n\
.fp-spinner--dark {\n\
  border-color: rgba(27,79,232,0.2);\n\
  border-top-color: #1B4FE8;\n\
}\n\
\n\
/* ---- Alerte info ---- */\n\
.fp-info {\n\
  background: #eff6ff;\n\
  border: 1px solid #bfdbfe;\n\
  border-radius: 12px;\n\
  padding: 12px 14px;\n\
  font-size: 12px;\n\
  color: #1d4ed8;\n\
  margin-bottom: 14px;\n\
  line-height: 1.5;\n\
}\n\
\n\
/* ---- Badge demo ---- */\n\
.fp-demo-badge {\n\
  display: inline-block;\n\
  background: #fef3c7;\n\
  color: #92400e;\n\
  font-size: 10px;\n\
  font-weight: 700;\n\
  text-transform: uppercase;\n\
  letter-spacing: 0.5px;\n\
  padding: 3px 8px;\n\
  border-radius: 6px;\n\
  margin-left: 6px;\n\
  vertical-align: middle;\n\
}\n\
\n\
/* ---- Responsive ---- */\n\
@media (max-width: 480px) {\n\
  .fp-modal   { border-radius: 20px; }\n\
  .fp-header  { padding: 16px 18px 14px; }\n\
  .fp-body    { padding: 16px 18px; }\n\
  .fp-footer  { padding: 10px 18px; }\n\
  .fp-amount-value { font-size: 26px; }\n\
}\n\
";

  // ================================================================
  // UTILITAIRES PRIVES
  // ================================================================

  function injectStyles() {
    if (_stylesInjected || document.getElementById("fp-styles")) return;
    var s = document.createElement("style");
    s.id = "fp-styles";
    s.textContent = CSS;
    document.head.appendChild(s);
    _stylesInjected = true;
  }

  function fmt_xof(n) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(n || 0);
  }

  function fmt_sats(n) {
    n = n || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(2) + "M sats";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k sats";
    return n.toLocaleString("fr-FR") + " sats";
  }

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function qr_url(data, size) {
    size = size || 200;
    return (
      "https://api.qrserver.com/v1/create-qr-code/?size=" +
      size + "x" + size +
      "&data=" + encodeURIComponent(data) +
      "&color=1B4FE8&bgcolor=F5F7FF&margin=10"
    );
  }

  function lightning_svg() {
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polygon></svg>';
  }

  function check_svg() {
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  }

  function x_svg() {
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  }

  function clock_svg() {
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
  }

  function get_merchant_addr() {
    if (!_config.merchantTag) return "merchant@bitcoinflash.xyz";
    return _config.merchantTag + "@bitcoinflash.xyz";
  }

  function get_operators(country_code) {
    return OPERATORS[country_code] || OPERATORS.BJ;
  }

  function copy_to_clipboard(text, btn_el, ok_label, default_label) {
    if (!navigator.clipboard) {
      // Fallback textarea
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;top:0;left:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      if (btn_el) {
        btn_el.textContent = ok_label || "Copie !";
        btn_el.classList.add("fp-copy--ok");
        setTimeout(function () {
          btn_el.textContent = default_label || "Copier";
          btn_el.classList.remove("fp-copy--ok");
        }, 2000);
      }
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
      if (btn_el) {
        btn_el.textContent = ok_label || "Copie !";
        btn_el.classList.add("fp-copy--ok");
        setTimeout(function () {
          btn_el.textContent = default_label || "Copier";
          btn_el.classList.remove("fp-copy--ok");
        }, 2000);
      }
    });
  }

  // ================================================================
  // CLIENT API FLASH
  // ================================================================

  function api_request(endpoint, options) {
    options = options || {};
    var url = _config.apiBase + _config.apiVersion + endpoint;
    var headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (_config.token) {
      headers["Authorization"] = _config.token.startsWith("Bearer ")
        ? _config.token
        : "Bearer " + _config.token;
    }
    if (_config.stagingUserId) {
      headers["X-Staging-User-Id"] = _config.stagingUserId;
    }
    return fetch(url, {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            var err = new Error(data.message || "Erreur API Flash (" + res.status + ")");
            err.status = res.status;
            err.data = data;
            throw err;
          }
          return data;
        });
      })
      .catch(function (err) {
        if (_config.onError) _config.onError(err);
        throw err;
      });
  }

  // ================================================================
  // MODAL PRINCIPALE
  // ================================================================

  function Modal(options) {
    var self = this;
    options = options || {};

    self._options = options;
    self._tab = "lightning"; // "lightning" | "mobilemoney"
    self._country = "BJ";
    self._operator = null;
    self._phone = "";
    self._step = "pay"; // "pay" | "processing" | "success" | "error"
    self._error_msg = "";

    // Calculer l'element DOM
    self._amount = options.amount || 0;
    self._currency = options.currency || _config.currency || "XOF";
    self._desc = options.description || "";
    self._sats = FlashPay.xofToSats(self._amount);
    self._ln_addr = get_merchant_addr();

    // Merge callbacks
    self._on_success = options.onSuccess || _config.onSuccess;
    self._on_error = options.onError || _config.onError;
    self._on_close = options.onClose || _config.onClose;

    self._el = null;
    self._build();
  }

  Modal.prototype._build = function () {
    var self = this;
    if (self._el) self._el.remove();

    var operators = get_operators(self._country);
    if (!self._operator) self._operator = operators[0].id;

    var lightning_uri = "lightning:" + self._ln_addr;
    if (self._sats > 0) lightning_uri += "?amount=" + self._sats;
    var qr_src = qr_url(lightning_uri, 200);

    var ops_html = operators.map(function (op) {
      return (
        '<button class="fp-op-btn' +
        (self._operator === op.id ? " fp-op--sel" : "") +
        '" data-op="' + esc(op.id) + '">' +
        esc(op.label) +
        "</button>"
      );
    }).join("");

    var countries_html = COUNTRIES.map(function (c) {
      return '<option value="' + c.code + '"' + (self._country === c.code ? " selected" : "") + ">" + esc(c.name) + "</option>";
    }).join("");

    var html = "";

    if (self._step === "pay") {
      html = (
        // ---- En-tete ----
        '<div class="fp-header">' +
        '<div class="fp-brand">' +
        '<div class="fp-logo">' + lightning_svg() + '</div>' +
        '<div>' +
        '<div class="fp-title">Flash Pay</div>' +
        '<div class="fp-subtitle">Paiement Bitcoin Lightning</div>' +
        '</div>' +
        '</div>' +
        '<button class="fp-close" id="fp-close-btn" aria-label="Fermer">&times;</button>' +
        '</div>' +

        // ---- Corps ----
        '<div class="fp-body">' +

        // Carte montant
        '<div class="fp-amount-card">' +
        '<div class="fp-amount-label">Montant a payer</div>' +
        '<div class="fp-amount-value">' + fmt_xof(self._amount) + '</div>' +
        '<div class="fp-amount-sats">' + fmt_sats(self._sats) + '</div>' +
        (self._desc ? '<div class="fp-amount-desc">' + esc(self._desc) + '</div>' : '') +
        '</div>' +

        // Onglets
        '<div class="fp-tabs">' +
        '<button class="fp-tab' + (self._tab === "lightning" ? " fp-tab--active" : "") + '" data-tab="lightning">Lightning</button>' +
        '<button class="fp-tab' + (self._tab === "mobilemoney" ? " fp-tab--active" : "") + '" data-tab="mobilemoney">Mobile Money</button>' +
        '</div>' +

        // ---- Onglet Lightning ----
        (self._tab === "lightning" ? (
          // Adresse Lightning
          '<div class="fp-ln-row">' +
          '<div class="fp-ln-icon">' + lightning_svg() + '</div>' +
          '<div class="fp-ln-addr" id="fp-ln-addr">' + esc(self._ln_addr) + '</div>' +
          '<button class="fp-copy" id="fp-copy-ln">Copier</button>' +
          '</div>' +

          // QR Code
          '<div class="fp-qr">' +
          '<img src="' + qr_src + '" alt="QR Code Lightning" width="180" height="180" />' +
          '<div class="fp-qr-hint">Scannez avec Phoenix, Breez, Muun ou tout wallet Lightning compatible</div>' +
          '</div>' +

          '<div class="fp-info">' +
          'Votre wallet Lightning enverra les sats directement a l\'adresse du marchand. La conversion Mobile Money est automatique cote Flash.' +
          '</div>' +

          // Bouton demo
          '<button class="fp-btn fp-btn--full" id="fp-simulate">' +
          '<span class="fp-spinner" style="display:none;" id="fp-sim-spin"></span>' +
          '<span id="fp-sim-label">' + lightning_svg() + ' Simuler un paiement (demo)</span>' +
          '</button>' +
          '<span class="fp-demo-badge">Demo</span>'

        ) : (
          // ---- Onglet Mobile Money ----
          '<div class="fp-field">' +
          '<label class="fp-label">Pays</label>' +
          '<select class="fp-select" id="fp-country-sel">' + countries_html + '</select>' +
          '</div>' +

          '<div class="fp-field">' +
          '<label class="fp-label">Operateur</label>' +
          '<div class="fp-operators" id="fp-ops-grid">' + ops_html + '</div>' +
          '</div>' +

          '<div class="fp-field">' +
          '<label class="fp-label">Numero Mobile Money</label>' +
          '<input class="fp-input" id="fp-phone-input" type="tel" placeholder="+229 97 000 000" value="' + esc(self._phone) + '" />' +
          '</div>' +

          '<div class="fp-info">' +
          'Flash convertira les satoshis en ' + fmt_xof(self._amount) + ' et les enverra sur votre compte Mobile Money apres confirmation Lightning.' +
          '</div>' +

          '<button class="fp-btn fp-btn--full" id="fp-pay-momo">' +
          lightning_svg() + ' Payer ' + fmt_xof(self._amount) + ' via Mobile Money' +
          '</button>'
        )) +

        '</div>' +

        // ---- Pied ----
        '<div class="fp-footer"><p>Securise par <a href="https://bitcoinflash.xyz" target="_blank" rel="noopener">Flash</a> - Bitcoin Lightning</p></div>'
      );

    } else if (self._step === "processing") {
      html = (
        '<div class="fp-header">' +
        '<div class="fp-brand"><div class="fp-logo">' + lightning_svg() + '</div><div><div class="fp-title">Flash Pay</div></div></div>' +
        '<button class="fp-close" id="fp-close-btn">&times;</button>' +
        '</div>' +
        '<div class="fp-body">' +
        '<div class="fp-state">' +
        '<div class="fp-state-icon fp-state-icon--wait">' + clock_svg() + '</div>' +
        '<div class="fp-state-title">Traitement en cours...</div>' +
        '<div class="fp-state-msg">Verification du paiement Lightning.<br>Cela prend quelques secondes.</div>' +
        '</div>' +
        '</div>' +
        '<div class="fp-footer"><p>Securise par <a href="https://bitcoinflash.xyz" target="_blank" rel="noopener">Flash</a></p></div>'
      );

    } else if (self._step === "success") {
      html = (
        '<div class="fp-header">' +
        '<div class="fp-brand"><div class="fp-logo">' + lightning_svg() + '</div><div><div class="fp-title">Flash Pay</div></div></div>' +
        '<button class="fp-close" id="fp-close-btn">&times;</button>' +
        '</div>' +
        '<div class="fp-body">' +
        '<div class="fp-state">' +
        '<div class="fp-state-icon fp-state-icon--ok">' + check_svg() + '</div>' +
        '<div class="fp-state-title">Paiement confirme</div>' +
        '<div class="fp-state-msg">La transaction a ete traitee avec succes.</div>' +
        '</div>' +
        '<div class="fp-recap">' +
        '<div class="fp-recap-row"><span class="fp-recap-label">Montant</span><span class="fp-recap-value">' + fmt_xof(self._amount) + '</span></div>' +
        '<div class="fp-recap-row"><span class="fp-recap-label">Satoshis</span><span class="fp-recap-value">' + fmt_sats(self._sats) + '</span></div>' +
        '<div class="fp-recap-row"><span class="fp-recap-label">Statut</span><span class="fp-recap-value fp-recap-value--ok">Confirme</span></div>' +
        '</div>' +
        '<button class="fp-btn fp-btn--full fp-btn--ghost" id="fp-close-btn-2">Fermer</button>' +
        '</div>' +
        '<div class="fp-footer"><p>Securise par <a href="https://bitcoinflash.xyz" target="_blank" rel="noopener">Flash</a></p></div>'
      );

    } else if (self._step === "error") {
      html = (
        '<div class="fp-header">' +
        '<div class="fp-brand"><div class="fp-logo">' + lightning_svg() + '</div><div><div class="fp-title">Flash Pay</div></div></div>' +
        '<button class="fp-close" id="fp-close-btn">&times;</button>' +
        '</div>' +
        '<div class="fp-body">' +
        '<div class="fp-state">' +
        '<div class="fp-state-icon fp-state-icon--err">' + x_svg() + '</div>' +
        '<div class="fp-state-title">Paiement echoue</div>' +
        '<div class="fp-state-msg">' + esc(self._error_msg || "Une erreur est survenue.") + '</div>' +
        '</div>' +
        '<button class="fp-btn fp-btn--full" id="fp-retry-btn" style="margin-bottom:10px;">' + lightning_svg() + ' Reessayer</button>' +
        '<button class="fp-btn fp-btn--ghost fp-btn--full" id="fp-close-btn-2">Fermer</button>' +
        '</div>' +
        '<div class="fp-footer"><p>Securise par <a href="https://bitcoinflash.xyz" target="_blank" rel="noopener">Flash</a></p></div>'
      );
    }

    // Construire l'overlay
    var overlay = document.createElement("div");
    overlay.className = "fp-overlay";
    var modal_el = document.createElement("div");
    modal_el.className = "fp-modal";
    modal_el.setAttribute("role", "dialog");
    modal_el.setAttribute("aria-modal", "true");
    modal_el.innerHTML = html;
    overlay.appendChild(modal_el);
    document.body.appendChild(overlay);
    self._el = overlay;

    // Animation ouverture
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("fp-open");
      });
    });

    // --- Attacher les evenements ---

    // Fermeture
    var close_btns = overlay.querySelectorAll("#fp-close-btn, #fp-close-btn-2");
    for (var i = 0; i < close_btns.length; i++) {
      close_btns[i].addEventListener("click", function () { self.close(); });
    }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) self.close();
    });
    document.addEventListener("keydown", function _esc(e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        self.close();
        document.removeEventListener("keydown", _esc);
      }
    });

    if (self._step !== "pay") return;

    // Onglets
    var tabs = overlay.querySelectorAll(".fp-tab");
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener("click", function () {
        self._tab = this.dataset.tab;
        self._rebuild();
      });
    }

    // Copier l'adresse Lightning
    var copy_ln = overlay.querySelector("#fp-copy-ln");
    if (copy_ln) {
      copy_ln.addEventListener("click", function () {
        copy_to_clipboard(self._ln_addr, this, "Copie !", "Copier");
      });
    }

    // Simuler paiement
    var sim_btn = overlay.querySelector("#fp-simulate");
    if (sim_btn) {
      sim_btn.addEventListener("click", function () {
        var spin = overlay.querySelector("#fp-sim-spin");
        var lbl = overlay.querySelector("#fp-sim-label");
        sim_btn.disabled = true;
        if (spin) spin.style.display = "inline-block";
        if (lbl) lbl.style.display = "none";

        self._step = "processing";
        setTimeout(function () { self._rebuild(); }, 600);

        setTimeout(function () {
          self._step = "success";
          self._rebuild();
          if (self._on_success) {
            self._on_success({
              amount: self._amount,
              currency: self._currency,
              sats: self._sats,
              lightningAddress: self._ln_addr,
              description: self._desc,
              timestamp: new Date().toISOString(),
              status: "simulated",
            });
          }
        }, 2200);
      });
    }

    // Mobile Money : pays
    var country_sel = overlay.querySelector("#fp-country-sel");
    if (country_sel) {
      country_sel.addEventListener("change", function () {
        self._country = this.value;
        var ops = get_operators(self._country);
        self._operator = ops[0].id;
        self._rebuild();
      });
    }

    // Mobile Money : operateurs
    var op_btns = overlay.querySelectorAll(".fp-op-btn");
    for (var o = 0; o < op_btns.length; o++) {
      op_btns[o].addEventListener("click", function () {
        self._operator = this.dataset.op;
        self._rebuild();
      });
    }

    // Mobile Money : telephone
    var phone_input = overlay.querySelector("#fp-phone-input");
    if (phone_input) {
      phone_input.addEventListener("input", function () {
        self._phone = this.value;
      });
    }

    // Mobile Money : payer
    var pay_momo = overlay.querySelector("#fp-pay-momo");
    if (pay_momo) {
      pay_momo.addEventListener("click", function () {
        if (!self._phone || self._phone.trim().length < 8) {
          alert("Veuillez entrer un numero de telephone valide.");
          return;
        }
        self._submit_mobilemoney();
      });
    }

    // Reessayer
    var retry_btn = overlay.querySelector("#fp-retry-btn");
    if (retry_btn) {
      retry_btn.addEventListener("click", function () {
        self._step = "pay";
        self._rebuild();
      });
    }
  };

  Modal.prototype._rebuild = function () {
    var self = this;
    if (!self._el) return;
    var overlay = self._el;
    overlay.classList.remove("fp-open");

    setTimeout(function () {
      self._build();
      // _build() cree un nouveau overlay et l'attache, l'ancien est retire
    }, 150);
  };

  // Surcharger _build pour remplacer proprement l'overlay
  var _orig_build = Modal.prototype._build;
  Modal.prototype._build = function () {
    var self = this;
    if (self._el && self._el.parentNode) {
      self._el.parentNode.removeChild(self._el);
      self._el = null;
    }
    _orig_build.call(self);
  };

  Modal.prototype._submit_mobilemoney = function () {
    var self = this;
    var operators = get_operators(self._country);
    var op = operators.find(function (o) { return o.id === self._operator; });
    if (!op) return;

    var phone = self._phone.replace(/[\s\-()]/g, "");
    if (!phone.startsWith("+")) {
      phone = (op.prefix || "+229") + phone;
    }

    self._step = "processing";
    self._rebuild();

    // Appel API Flash : POST /transactions/create
    api_request("/transactions/create", {
      method: "POST",
      body: {
        type: "SELL_BITCOIN",
        amount: self._sats,
        number: phone,
        provider: op.apiId,
      },
    })
      .then(function (data) {
        self._step = "success";
        self._rebuild();
        if (self._on_success) {
          self._on_success({
            amount: self._amount,
            currency: self._currency,
            sats: self._sats,
            lightningAddress: self._ln_addr,
            mobileNumber: phone,
            operator: op.apiId,
            description: self._desc,
            timestamp: new Date().toISOString(),
            status: "completed",
            apiResponse: data,
          });
        }
      })
      .catch(function (err) {
        self._step = "error";
        self._error_msg = err.message || "Erreur lors de la transaction.";
        self._rebuild();
        if (self._on_error) self._on_error(err);
      });
  };

  Modal.prototype.close = function () {
    var self = this;
    if (!self._el) return;
    self._el.classList.remove("fp-open");
    setTimeout(function () {
      if (self._el && self._el.parentNode) {
        self._el.parentNode.removeChild(self._el);
        self._el = null;
      }
      if (self._on_close) self._on_close();
    }, 250);
  };

  // ================================================================
  // API PUBLIQUE - window.FlashPay
  // ================================================================

  var FlashPay = {

    version: VERSION,

    /**
     * Initialiser le SDK avec la configuration du marchand.
     *
     * @param {Object}   config
     * @param {string}   config.merchantTag      - Tag Flash du marchand (ex: "maboutique")
     * @param {string}   [config.apiBase]        - URL de l'API Flash (defaut: staging)
     * @param {string}   [config.token]          - JWT Bearer token pour les requetes authentifiees
     * @param {string}   [config.stagingUserId]  - X-Staging-User-Id pour l'environnement de staging
     * @param {string}   [config.theme]          - "light" ou "dark" (defaut: "light")
     * @param {number}   [config.ratePerSat]     - Taux XOF par satoshi (defaut: 0.38)
     * @param {Function} [config.onSuccess]      - Callback (payment) => void apres paiement confirme
     * @param {Function} [config.onError]        - Callback (error) => void en cas d'erreur
     * @param {Function} [config.onClose]        - Callback () => void a la fermeture du modal
     */
    init: function (config) {
      config = config || {};
      _config = Object.assign({}, DEFAULTS, config);
      injectStyles();
    },

    /**
     * Inserer un bouton de paiement Flash dans un conteneur DOM.
     *
     * @param {string|HTMLElement} selector - Selecteur CSS ou element DOM cible
     * @param {Object}   options
     * @param {number}   options.amount      - Montant en XOF
     * @param {string}   [options.currency]  - Devise (defaut: XOF)
     * @param {string}   [options.description] - Description du paiement
     * @param {string}   [options.label]     - Texte personnalise du bouton
     * @param {string}   [options.size]      - "sm", "md" (defaut), "lg"
     * @param {string}   [options.variant]   - "default", "outline", "dark", "ghost"
     * @param {Function} [options.onSuccess] - Override du callback succes
     * @param {Function} [options.onError]   - Override du callback erreur
     * @returns {HTMLButtonElement|null}
     */
    button: function (selector, options) {
      injectStyles();
      options = options || {};

      var container = typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

      if (!container) {
        console.error("[FlashPay] Conteneur introuvable :", selector);
        return null;
      }

      var size = options.size || "md";
      var variant = options.variant || "default";
      var label = options.label || ("Payer " + fmt_xof(options.amount || 0));

      var cls = "fp-btn";
      if (size === "sm") cls += " fp-btn--sm";
      if (size === "lg") cls += " fp-btn--lg";
      if (variant === "outline") cls += " fp-btn--outline";
      else if (variant === "dark") cls += " fp-btn--dark";
      else if (variant === "ghost") cls += " fp-btn--ghost";

      var btn = document.createElement("button");
      btn.className = cls;
      btn.innerHTML = lightning_svg() + " " + esc(label);
      btn.addEventListener("click", function () {
        FlashPay.checkout(options);
      });

      container.innerHTML = "";
      container.appendChild(btn);
      return btn;
    },

    /**
     * Ouvrir directement le modal de paiement Flash.
     *
     * @param {Object}   options
     * @param {number}   options.amount       - Montant en XOF
     * @param {string}   [options.currency]   - Devise (defaut: XOF)
     * @param {string}   [options.description]- Description affichee dans le modal
     * @param {Function} [options.onSuccess]  - Override du callback succes
     * @param {Function} [options.onError]    - Override du callback erreur
     * @param {Function} [options.onClose]    - Override du callback fermeture
     * @returns {{ close: Function }}         - Objet avec methode close()
     */
    checkout: function (options) {
      injectStyles();
      if (_modal) _modal.close();
      _modal = new Modal(options || {});
      return { close: function () { _modal.close(); } };
    },

    /**
     * Obtenir la Lightning Address du marchand configure.
     * @returns {string}  ex: "maboutique@bitcoinflash.xyz"
     */
    getLightningAddress: function () {
      return get_merchant_addr();
    },

    /**
     * Convertir un montant en XOF vers des satoshis.
     * @param {number} xof
     * @returns {number}
     */
    xofToSats: function (xof) {
      return Math.floor((xof || 0) / _config.ratePerSat);
    },

    /**
     * Convertir des satoshis vers XOF.
     * @param {number} sats
     * @returns {number}
     */
    satsToXof: function (sats) {
      return Math.round((sats || 0) * _config.ratePerSat);
    },

    /**
     * Formater un montant XOF en texte lisible.
     * @param {number} xof
     * @returns {string}  ex: "5 000 FCFA"
     */
    formatXof: fmt_xof,

    /**
     * Formater un montant en satoshis en texte lisible.
     * @param {number} sats
     * @returns {string}  ex: "13 157 sats"
     */
    formatSats: fmt_sats,

    /**
     * Creer une transaction via l'API Flash.
     * Necessite que config.token ou config.stagingUserId soit defini.
     *
     * @param {Object} payload
     * @param {string} payload.type              - "SELL_BITCOIN" ou "BUY_BITCOIN"
     * @param {number} payload.amount            - Montant en satoshis (SELL) ou XOF (BUY)
     * @param {string} payload.number            - Numero Mobile Money avec indicatif
     * @param {string} payload.provider          - ID operateur (ex: "MTN_OPEN", "MOOV_BENIN")
     * @param {string} [payload.receiver_address]- Adresse Lightning destinataire (optionnel)
     * @returns {Promise<Object>}
     */
    createTransaction: function (payload) {
      return api_request("/transactions/create", {
        method: "POST",
        body: payload,
      });
    },

    /**
     * Recuperer la liste des transactions du compte configure.
     * Necessite que config.token ou config.stagingUserId soit defini.
     * @returns {Promise<Object>}
     */
    getTransactions: function () {
      return api_request("/transactions");
    },

    /**
     * Verifier le solde du compte Flash.
     * Necessite que config.token ou config.stagingUserId soit defini.
     * @returns {Promise<Object>}
     */
    getBalance: function () {
      return api_request("/wallet/balance");
    },

    /**
     * Recuperer le taux de change XOF/sats depuis l'API Flash.
     * @returns {Promise<Object>}
     */
    getRate: function () {
      return api_request("/rate");
    },

    /**
     * Mettre a jour le taux de conversion interne apres appel a getRate().
     * @param {number} ratePerSat
     */
    setRate: function (ratePerSat) {
      if (typeof ratePerSat === "number" && ratePerSat > 0) {
        _config.ratePerSat = ratePerSat;
      }
    },

    /**
     * Obtenir la configuration courante (lecture seule).
     * @returns {Object}
     */
    getConfig: function () {
      return Object.assign({}, _config, { token: "***" });
    },
  };

  // ================================================================
  // EXPORT - Compatible CommonJS, AMD et navigateur global
  // ================================================================

  if (typeof module !== "undefined" && module.exports) {
    module.exports = FlashPay;
  } else if (typeof define === "function" && define.amd) {
    define(function () { return FlashPay; });
  } else {
    root.FlashPay = FlashPay;
  }

})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this);

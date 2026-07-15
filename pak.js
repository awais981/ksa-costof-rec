<script>
/* ============================================================
   Pakistan Recruitment Cost Calculator
   
   Step 1 inputs:
       Annual salary:              name="annual-salary"          (required)
       No. of positions:           name="positions"              (required)
       Hiring city/province:       name="hiring-city"            (optional — drives EOBI + PSS)
       Job board advertising:      name="job-board-advertising"  (optional)
       Agency fee:                 name="agency-fee"             (optional)
       EOBI Contribution:          name="eobi"                   (auto-filled, read-only)
       Provincial Social Security: name="provincial-ss"          (auto-filled, read-only)
       Background checks:          name="background-checks"      (optional)
       Relocation package:         name="relocation-package"     (optional)
       Onboarding & training:      name="onboarding-training"    (optional)

   Province flat rates:
       Punjab / Sindh / KP / ICT  → EOBI: PKR 24,000 | PSS: PKR 28,800 (ICT PSS = 0)
       Balochistan                 → EOBI: PKR 22,200 | PSS: PKR 26,640

   Formula:
       Total Cost / Hire = Job Board + Agency Fee + EOBI + PSS
                         + Background Checks + Relocation + Onboarding
       % of Annual Salary = Total Cost / Hire ÷ Annual Salary × 100
       Total All Positions = Total Cost / Hire × Positions
   ============================================================ */

(function () {
  "use strict";

  /* ─── Province → flat rate map ────────────────────────────── */
  const PROVINCE_RATES = {
    "lahore":      { province: "Punjab",      eobi: 24000, pss: 28800 },
    "karachi":     { province: "Sindh",       eobi: 24000, pss: 28800 },
    "peshawar":    { province: "KP",          eobi: 24000, pss: 28800 },
    "islamabad":   { province: "ICT",         eobi: 24000, pss: 0     },
    "quetta":      { province: "Balochistan", eobi: 22200, pss: 26640 },
    "punjab":      { province: "Punjab",      eobi: 24000, pss: 28800 },
    "sindh":       { province: "Sindh",       eobi: 24000, pss: 28800 },
    "kp":          { province: "KP",          eobi: 24000, pss: 28800 },
    "ict":         { province: "ICT",         eobi: 24000, pss: 0     },
    "balochistan": { province: "Balochistan", eobi: 22200, pss: 26640 },
  };

  const DEFAULT_EOBI = 24000;
  const DEFAULT_PSS  = 28800;

  const state = {
    currentStep: 1,
    currency: "PKR",
    userType: "",
    formData: {
      annualSalary: 0,
      positions: 0,
      hiringCity: "",
      jobBoardAdvertising: 0,
      agencyFee: 0,
      eobi: DEFAULT_EOBI,
      provincialSS: DEFAULT_PSS,
      backgroundChecks: 0,
      relocationPackage: 0,
      onboardingTraining: 0,
      hiringStatus: "",
      businessEmail: "",
      phoneNumber: "",
      dialCode: "+92",
    },
    results: {},
  };

  const CURRENCY_SYMBOLS = {
    PKR: "PKR", USD: "USD", AED: "AED",
    SAR: "SAR", GBP: "GBP", EUR: "EUR",
  };

  function getField(nameAttr) {
    return document.querySelector(`[name="${nameAttr}"]`);
  }

  function getStep(n) {
    return document.querySelector(`[step="${n}"]`);
  }

  function formatNumber(n) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function parseVal(name) {
    const f = getField(name);
    const v = parseFloat(f?.value || 0);
    return isNaN(v) ? 0 : v;
  }

  /* ─── Get province rates for selected city ─────────────────── */
  function getRatesForCity() {
    const cityField = getField("hiring-city");
    const raw = (cityField?.value || "").toLowerCase().trim();
    if (!raw) return { province: "Punjab", eobi: DEFAULT_EOBI, pss: DEFAULT_PSS };
    if (PROVINCE_RATES[raw]) return PROVINCE_RATES[raw];
    for (const key of Object.keys(PROVINCE_RATES)) {
      if (raw.includes(key) || key.includes(raw)) return PROVINCE_RATES[key];
    }
    return { province: "Punjab", eobi: DEFAULT_EOBI, pss: DEFAULT_PSS };
  }

  /* ─── Auto-fill EOBI and PSS when city changes ─────────────── */
  function updateFlatRateFields() {
    const rates    = getRatesForCity();
    const eobiField = getField("eobi");
    const pssField  = getField("provincial-ss");

    if (eobiField) {
      eobiField.value = rates.eobi;
      eobiField.setAttribute("readonly", "true");
      eobiField.style.background    = "#f7f9fc";
      eobiField.style.cursor        = "not-allowed";
      eobiField.style.color         = "#718096";
    }
    if (pssField) {
      pssField.value = rates.pss;
      pssField.setAttribute("readonly", "true");
      pssField.style.background = "#f7f9fc";
      pssField.style.cursor     = "not-allowed";
      pssField.style.color      = "#718096";
    }

    state.formData.eobi        = rates.eobi;
    state.formData.provincialSS = rates.pss;

    const provinceLabel = document.getElementById("province-label");
    if (provinceLabel) provinceLabel.textContent = rates.province;
  }

  /* ─── Step transitions ──────────────────────────────────────── */
  function showStep(n, direction) {
    const current = getStep(state.currentStep);
    const next    = getStep(n);
    if (!next) return;
    if (current) {
      current.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      current.style.opacity    = "0";
      current.style.transform  = direction === "forward" ? "translateX(-20px)" : "translateX(20px)";
      setTimeout(() => {
        current.style.display   = "none";
        current.style.opacity   = "";
        current.style.transform = "";
        next.style.display      = "block";
        next.style.opacity      = "0";
        next.style.transform    = direction === "forward" ? "translateX(20px)" : "translateX(-20px)";
        void next.offsetWidth;
        next.style.transition   = "opacity 0.3s ease, transform 0.3s ease";
        next.style.opacity      = "1";
        next.style.transform    = "translateX(0)";
        state.currentStep       = n;
        updateCurrencyLock();
      }, 300);
    } else {
      next.style.display = "block";
      state.currentStep  = n;
      updateCurrencyLock();
    }
  }

  function updateCurrencyLock() {
    document.querySelectorAll(".currency-dropdown-link").forEach((link) => {
      if (state.currentStep === 1) {
        link.style.pointerEvents = "";
        link.style.opacity       = "";
        link.style.cursor        = "";
      } else {
        link.style.pointerEvents = "none";
        link.style.opacity       = "0.4";
        link.style.cursor        = "not-allowed";
      }
    });
  }

  /* ─── Step 1: only annual-salary + positions required ──────── */
  function validateStep1() {
    return parseVal("annual-salary") > 0 && parseVal("positions") > 0;
  }

  function updateCalcCostBtn() {
    const btn = document.getElementById("calc-cost-btn");
    if (!btn) return;
    if (validateStep1()) {
      btn.style.opacity       = "1";
      btn.style.pointerEvents = "auto";
      btn.style.cursor        = "pointer";
      btn.removeAttribute("data-disabled");
    } else {
      btn.style.opacity       = "0.5";
      btn.style.pointerEvents = "none";
      btn.style.cursor        = "not-allowed";
      btn.setAttribute("data-disabled", "true");
    }
  }

  function showStep1Error() {
    let errEl = document.getElementById("step1-error-msg");
    if (!errEl) {
      errEl = document.createElement("div");
      errEl.id = "step1-error-msg";
      errEl.style.cssText = "color:#e53e3e;font-size:13px;margin-top:6px;display:none;";
      errEl.textContent = "Please enter annual salary and number of positions.";
      const btn = document.getElementById("calc-cost-btn");
      if (btn && btn.parentNode) btn.parentNode.insertBefore(errEl, btn.nextSibling);
    }
    errEl.style.display = !validateStep1() ? "block" : "none";
  }

  /* ─── Email validation ──────────────────────────────────────── */
  const PERSONAL_EMAIL_DOMAINS = [
    "gmail.com","yahoo.com","hotmail.com","outlook.com","live.com",
    "icloud.com","me.com","mac.com","aol.com","msn.com","ymail.com",
    "yahoo.co.uk","yahoo.in","yahoo.fr","yahoo.de","yahoo.es",
    "hotmail.co.uk","hotmail.fr","hotmail.de","hotmail.es",
    "protonmail.com","proton.me","tutanota.com","gmx.com","gmx.net",
    "mail.com","zohomail.com","yandex.com","yandex.ru","mail.ru",
    "rediffmail.com","rocketmail.com","inbox.com","fastmail.com",
  ];

  function isBusinessEmail(email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    return !PERSONAL_EMAIL_DOMAINS.includes(email.split("@")[1].toLowerCase());
  }

  function validateStep3() {
    const hiring = getField("hiring-status")?.value?.trim() || "";
    const email  = getField("business-email")?.value?.trim() || "";
    const phone  = getField("phone-number")?.value?.trim() || "";
    return hiring !== "" && isBusinessEmail(email) && phone !== "";
  }

  function showEmailError(msg) {
    const emailField = getField("business-email");
    if (!emailField) return;
    let errEl = document.getElementById("email-error-msg");
    if (!errEl) {
      errEl = document.createElement("div");
      errEl.id = "email-error-msg";
      errEl.style.cssText = "color:#e53e3e;font-size:12px;margin-top:4px;display:none;";
      emailField.parentNode.insertBefore(errEl, emailField.nextSibling);
    }
    if (msg) { errEl.textContent = msg; errEl.style.display = "block"; }
    else { errEl.style.display = "none"; }
  }

  function updateViewCalcBtn() {
    const btn = document.getElementById("view-calc-btn");
    if (!btn) return;
    if (validateStep3()) {
      btn.style.opacity          = "1";
      btn.style.pointerEvents    = "auto";
      btn.style.cursor           = "pointer";
      btn.style.backgroundColor  = "#1a9b6e";
      btn.style.color            = "#ffffff";
      btn.removeAttribute("data-disabled");
    } else {
      btn.style.opacity         = "0.5";
      btn.style.pointerEvents   = "none";
      btn.style.cursor          = "not-allowed";
      btn.style.backgroundColor = "";
      btn.style.color           = "";
      btn.setAttribute("data-disabled", "true");
    }
  }

  /* ─── Pakistan Recruitment Cost Formula ─────────────────────
     Total Cost / Hire = Job Board Advertising + Agency Fee
       + EOBI Contribution (flat, province-based)
       + Provincial Social Security (flat, province-based)
       + Background Checks + Relocation Package
       + Onboarding & Training
  ─────────────────────────────────────────────────────────── */
  function calculateCost() {
    const annualSalary        = parseVal("annual-salary");
    const positions           = parseVal("positions");
    const hiringCity          = getField("hiring-city")?.value?.trim() || "";
    const jobBoardAdvertising = parseVal("job-board-advertising");
    const agencyFee           = parseVal("agency-fee");
    const eobi                = parseVal("eobi");
    const provincialSS        = parseVal("provincial-ss");
    const backgroundChecks    = parseVal("background-checks");
    const relocationPackage   = parseVal("relocation-package");
    const onboardingTraining  = parseVal("onboarding-training");

    const rates = getRatesForCity();

    const totalCostPerHire = jobBoardAdvertising + agencyFee + eobi
      + provincialSS + backgroundChecks + relocationPackage + onboardingTraining;

    const totalCostAllPositions = totalCostPerHire * positions;
    const costAsPercentage = annualSalary > 0
      ? (totalCostPerHire / annualSalary) * 100
      : 0;

    // Write back to formData
    state.formData.annualSalary        = annualSalary;
    state.formData.positions           = positions;
    state.formData.hiringCity          = hiringCity;
    state.formData.jobBoardAdvertising = jobBoardAdvertising;
    state.formData.agencyFee           = agencyFee;
    state.formData.eobi                = eobi;
    state.formData.provincialSS        = provincialSS;
    state.formData.backgroundChecks    = backgroundChecks;
    state.formData.relocationPackage   = relocationPackage;
    state.formData.onboardingTraining  = onboardingTraining;

    state.results = {
      annualSalary,
      positions,
      hiringCity,
      province: rates.province,
      jobBoardAdvertising,
      agencyFee,
      eobi,
      provincialSS,
      backgroundChecks,
      relocationPackage,
      onboardingTraining,
      totalCostPerHire,
      totalCostAllPositions,
      costAsPercentage,
      currency: state.currency,
    };

    console.log('[Pakistan Calc] Calculated results:', state.results);
    return state.results;
  }

  /* ─── Render Result Table ───────────────────────────────────── */
  function renderResultTable(results) {
    const container = document.getElementById("result-table");
    if (!container) return;
    const cur = results.currency;

    const rows = [
      { label: "Annual Salary (per hire)",  value: formatNumber(results.annualSalary),        isMoney: true  },
      { label: "Number of Positions",        value: results.positions.toString(),               isMoney: false },
      results.hiringCity
        ? { label: `Hiring City`,            value: `${results.hiringCity} (${results.province})`, isMoney: false }
        : null,
      { label: "", value: "", divider: true },
      { label: "Job Board Advertising",     value: formatNumber(results.jobBoardAdvertising),  isMoney: true  },
      { label: "Agency Fee",                value: formatNumber(results.agencyFee),            isMoney: true  },
      {
        label: "EOBI Contribution",
        labelExtra: `<span style="font-size:12px;color:#718096;">(Flat rate — ${results.province})</span>`,
        value: formatNumber(results.eobi),
        isMoney: true,
      },
      {
        label: "Provincial Social Security",
        labelExtra: `<span style="font-size:12px;color:#718096;">(Flat rate — ${results.province})</span>`,
        value: formatNumber(results.provincialSS),
        isMoney: true,
      },
      { label: "Background Checks",         value: formatNumber(results.backgroundChecks),    isMoney: true  },
      { label: "Relocation Package",        value: formatNumber(results.relocationPackage),   isMoney: true  },
      { label: "Onboarding & Training",     value: formatNumber(results.onboardingTraining),  isMoney: true  },
      { label: "", value: "", divider: true },
      {
        label: "Total Cost / Hire",
        value: formatNumber(results.totalCostPerHire),
        isMoney: true, bold: true, green: true, large: true,
      },
      {
        label: "% of Annual Salary",
        value: results.costAsPercentage.toFixed(1) + "%",
        isMoney: false, bold: true, green: true,
      },
      {
        label: `Total All Positions (${results.positions})`,
        value: formatNumber(results.totalCostAllPositions),
        isMoney: true, bold: true, green: true, large: true,
      },
    ].filter(Boolean);

    let html = `
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <thead>
          <tr style="background:#f7f9fc;border-bottom:2px solid #e2e8f0;">
            <th style="text-align:left;padding:12px 16px;color:#4a5568;font-weight:600;">Description</th>
            <th style="text-align:right;padding:12px 16px;color:#4a5568;font-weight:600;">Amount (${cur})</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach((row) => {
      if (row.divider) {
        html += `<tr><td colspan="2" style="padding:0;border-bottom:2px solid #e2e8f0;"></td></tr>`;
        return;
      }
      const boldStyle  = row.bold  ? "font-weight:700;" : "";
      const colorStyle = row.green ? "color:#1a9b6e;"   : "";
      const fontSz     = row.large ? "font-size:17px;"  : "";
      html += `
        <tr style="border-bottom:1px solid #edf2f7;">
          <td style="padding:12px 16px;color:#4a5568;${boldStyle}${fontSz}">
            ${row.label}
            ${row.labelExtra ? `<div style="margin-top:2px;">${row.labelExtra}</div>` : ""}
          </td>
          <td style="padding:12px 16px;text-align:right;${boldStyle}${colorStyle}${fontSz}">
            ${row.isMoney ? `${cur} ${row.value}` : row.value}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  /* ─── PDF Generation ────────────────────────────────────────── */
  function loadJsPDF(callback) {
    if (window.jspdf) { callback(); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  function downloadPDF() {
    loadJsPDF(() => {
      const { jsPDF } = window.jspdf;
      const doc   = new jsPDF({ unit: "mm", format: "a4" });
      const r     = state.results;
      const cur   = r.currency;
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(26, 155, 110);
      doc.rect(0, 0, pageW, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Qureos", 14, 12);
      doc.setFontSize(18);
      doc.text("Pakistan Recruitment Cost Breakdown", pageW / 2, 22, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on ${new Date().toLocaleDateString("en-GB")}`, pageW / 2, 31, { align: "center" });
      doc.setTextColor(44, 62, 80);

      let y = 52;
      const labelX = 20;
      const valX   = pageW - 20;
      const lineH  = 12;

      function drawRow(label, value, opts = {}) {
        if (opts.borderTop) {
          y += 3;
          doc.setDrawColor(200, 210, 220);
          doc.line(labelX, y - 2, valX, y - 2);
        }
        doc.setFont("helvetica", opts.bold ? "bold" : "normal");
        doc.setFontSize(opts.large ? 13 : 11);
        if (opts.green) doc.setTextColor(26, 155, 110);
        else doc.setTextColor(74, 85, 104);
        doc.text(label, labelX, y);
        if (opts.green) doc.setTextColor(26, 155, 110);
        else doc.setTextColor(44, 62, 80);
        doc.text(value, valX, y, { align: "right" });
        y += lineH;
      }

      drawRow("Annual Salary (per hire)",              `${cur} ${formatNumber(r.annualSalary)}`);
      drawRow("Number of Positions",                    r.positions.toString());
      if (r.hiringCity) drawRow("Hiring City",          `${r.hiringCity} (${r.province})`);
      y += 4;
      doc.setDrawColor(200, 210, 220);
      doc.line(labelX, y - 2, valX, y - 2);
      drawRow("Job Board Advertising",                  `${cur} ${formatNumber(r.jobBoardAdvertising)}`);
      drawRow("Agency Fee",                             `${cur} ${formatNumber(r.agencyFee)}`);
      drawRow(`EOBI Contribution (${r.province})`,      `${cur} ${formatNumber(r.eobi)}`);
      drawRow(`Prov. Social Security (${r.province})`,  `${cur} ${formatNumber(r.provincialSS)}`);
      drawRow("Background Checks",                      `${cur} ${formatNumber(r.backgroundChecks)}`);
      drawRow("Relocation Package",                     `${cur} ${formatNumber(r.relocationPackage)}`);
      drawRow("Onboarding & Training",                  `${cur} ${formatNumber(r.onboardingTraining)}`);
      y += 4;
      doc.setDrawColor(200, 210, 220);
      doc.line(labelX, y - 2, valX, y - 2);
      drawRow("Total Cost / Hire",                      `${cur} ${formatNumber(r.totalCostPerHire)}`,          { bold: true, green: true, large: true });
      drawRow("% of Annual Salary",                     `${r.costAsPercentage.toFixed(1)}%`,                   { bold: true, green: true });
      drawRow(`Total All Positions (${r.positions})`,   `${cur} ${formatNumber(r.totalCostAllPositions)}`,     { bold: true, green: true, large: true });

      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text("Generated by Qureos — qureos.com", pageW / 2, pageH - 10, { align: "center" });
      doc.save(`Pakistan-Recruitment-Cost-${Date.now()}.pdf`);
    });
  }

  /* ─── Submit to Qureos API ──────────────────────────────────── */
  function submitRecruiterFormToWebflow() {
    try {
      const sourceName = window.location.pathname
        .replace(/^\//, "").replace(/\/$/, "") || "home";

      const payload = {
        hiringStatus:  state.formData.hiringStatus,
        businessEmail: state.formData.businessEmail,
        phoneNumber:   (state.formData.dialCode || "+92") + state.formData.phoneNumber,
        dialCode:      state.formData.dialCode || "+92",
        source:        sourceName,
        baseId:        "app47x5vmXROTUwNZ",
      };

      console.log("[Pakistan Calc] Sending payload:", JSON.stringify(payload, null, 2));

      fetch("https://misc-api.qureos.com/form-submissions/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          console.log("[Pakistan Calc] API response status:", res.status);
          return res.json().catch(() => null);
        })
        .then((body) => {
          if (body) console.log("[Pakistan Calc] API response body:", body);
        })
        .catch((err) => console.warn("[Pakistan Calc] API fetch failed:", err));

    } catch (err) {
      console.warn("[Pakistan Calc] submitRecruiterFormToWebflow error:", err);
    }
  }

  /* ─── Dial Code Selector ────────────────────────────────────── */
  const DIAL_CODES = [
    { code: "+92",  flag: "🇵🇰", name: "Pakistan"     },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+971", flag: "🇦🇪", name: "UAE"          },
    { code: "+965", flag: "🇰🇼", name: "Kuwait"       },
    { code: "+974", flag: "🇶🇦", name: "Qatar"        },
    { code: "+973", flag: "🇧🇭", name: "Bahrain"      },
    { code: "+968", flag: "🇴🇲", name: "Oman"         },
    { code: "+1",   flag: "🇺🇸", name: "USA"          },
    { code: "+44",  flag: "🇬🇧", name: "UK"           },
    { code: "+91",  flag: "🇮🇳", name: "India"        },
    { code: "+20",  flag: "🇪🇬", name: "Egypt"        },
    { code: "+962", flag: "🇯🇴", name: "Jordan"       },
    { code: "+961", flag: "🇱🇧", name: "Lebanon"      },
    { code: "+880", flag: "🇧🇩", name: "Bangladesh"   },
    { code: "+94",  flag: "🇱🇰", name: "Sri Lanka"    },
    { code: "+63",  flag: "🇵🇭", name: "Philippines"  },
  ];

  function injectDialCodeSelector() {
    const phoneField = getField("phone-number");
    if (!phoneField || document.getElementById("dial-code-wrapper")) return;
    state.formData.dialCode = "+92";

    const wrapper = document.createElement("div");
    wrapper.id = "dial-code-wrapper";
    wrapper.style.cssText = "display:flex;align-items:stretch;gap:0;width:100%;";

    const dropdownBtn = document.createElement("button");
    dropdownBtn.type = "button";
    dropdownBtn.id   = "dial-code-btn";
    dropdownBtn.style.cssText = "display:flex;align-items:center;gap:6px;padding:0 10px;height:100%;background:#f7f9fc;border:1px solid #cbd5e0;border-right:none;border-radius:4px 0 0 4px;cursor:pointer;white-space:nowrap;font-size:14px;color:#2d3748;min-width:90px;transition:background 0.2s;";
    dropdownBtn.innerHTML = `<span id="dial-flag">🇵🇰</span><span id="dial-code-label">+92</span><span style="font-size:10px;opacity:0.5;">▼</span>`;

    const dropdownList = document.createElement("div");
    dropdownList.id = "dial-code-list";
    dropdownList.style.cssText = "display:none;position:absolute;z-index:9999;background:#fff;border:1px solid #cbd5e0;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.12);max-height:220px;overflow-y:auto;min-width:220px;top:100%;left:0;margin-top:4px;";

    DIAL_CODES.forEach((dc) => {
      const item = document.createElement("div");
      item.style.cssText = "display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;font-size:14px;color:#2d3748;";
      item.innerHTML = `<span>${dc.flag}</span><span>${dc.code}</span><span style="color:#718096;font-size:12px;">${dc.name}</span>`;
      item.addEventListener("mouseenter", () => item.style.background = "#f0fdf4");
      item.addEventListener("mouseleave", () => item.style.background = "");
      item.addEventListener("click", () => {
        state.formData.dialCode = dc.code;
        document.getElementById("dial-flag").textContent      = dc.flag;
        document.getElementById("dial-code-label").textContent = dc.code;
        dropdownList.style.display = "none";
        updateViewCalcBtn();
      });
      dropdownList.appendChild(item);
    });

    const relContainer = document.createElement("div");
    relContainer.style.cssText = "position:relative;flex-shrink:0;";
    relContainer.appendChild(dropdownBtn);
    relContainer.appendChild(dropdownList);

    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      dropdownList.style.display = dropdownList.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!relContainer.contains(e.target)) dropdownList.style.display = "none";
    });

    phoneField.style.cssText += "border-radius:0 4px 4px 0;border-left:none;flex:1;";
    phoneField.parentNode.insertBefore(wrapper, phoneField);
    wrapper.appendChild(relContainer);
    wrapper.appendChild(phoneField);
  }

  /* ─── Reset ─────────────────────────────────────────────────── */
  function resetForm() {
    [
      "annual-salary", "positions", "job-board-advertising",
      "agency-fee", "background-checks", "relocation-package",
      "onboarding-training", "business-email", "phone-number",
    ].forEach((name) => {
      const f = getField(name);
      if (f) f.value = "";
    });

    const cityField = getField("hiring-city");
    if (cityField) { cityField.selectedIndex = 0; cityField.value = ""; }

    const eobiField = getField("eobi");
    if (eobiField) eobiField.value = DEFAULT_EOBI;
    const pssField = getField("provincial-ss");
    if (pssField) pssField.value = DEFAULT_PSS;

    const hiringField = getField("hiring-status");
    if (hiringField) hiringField.selectedIndex = 0;

    document.querySelectorAll('[name="user-type"]').forEach((r) => (r.checked = false));
    state.currency = "PKR";

    document.querySelectorAll(".currency-selector-label, .text-l").forEach((el) => {
      if (el.textContent.match(/^(PKR|USD|AED|SAR|GBP|EUR)$/)) el.textContent = "PKR";
    });

    for (let i = 1; i <= 4; i++) {
      const s = getStep(i);
      if (s) {
        s.style.display   = i === 1 ? "block" : "none";
        s.style.opacity   = "";
        s.style.transform = "";
        s.style.transition = "";
      }
    }

    state.currentStep = 1;
    updateCalcCostBtn();
    updateViewCalcBtn();
    updateCurrencyLock();
  }

  /* ─── Init ──────────────────────────────────────────────────── */
  function init() {
    for (let i = 1; i <= 4; i++) {
      const s = getStep(i);
      if (s) s.style.display = i === 1 ? "block" : "none";
    }

    // Pre-fill EOBI / PSS on load
    updateFlatRateFields();

    // Watch required fields
    ["annual-salary", "positions"].forEach((name) => {
      const f = getField(name);
      if (f) {
        f.addEventListener("input", () => {
          updateCalcCostBtn();
          const err = document.getElementById("step1-error-msg");
          if (err && validateStep1()) err.style.display = "none";
        });
      }
    });

    // Watch city → auto-update EOBI + PSS (optional field)
    const cityField = getField("hiring-city");
    if (cityField) {
      cityField.addEventListener("change", updateFlatRateFields);
      cityField.addEventListener("input",  updateFlatRateFields);
    }

    updateCalcCostBtn();

    const calcCostBtn = document.getElementById("calc-cost-btn");
    if (calcCostBtn) {
      calcCostBtn.style.pointerEvents = "auto";
      calcCostBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!validateStep1()) { showStep1Error(); return; }
        showStep(2, "forward");
      });
    }

    // Step 2: radio auto-advance
    const step2El        = getStep(2);
    const allStep2Radios = step2El
      ? step2El.querySelectorAll('input[type="radio"]')
      : document.querySelectorAll('[name="user-type"]');

    function handleRadioChange(radio) {
      const userType = radio.value || radio.getAttribute("value") || radio.id;
      if (!userType) return;
      state.formData.userType = userType;
      state.userType          = userType;
      const isJobSeeker = userType.toLowerCase().replace(/[\s_]/g, "-") === "job-seeker"
        || userType.toLowerCase().includes("job");
      setTimeout(() => {
        if (isJobSeeker) {
          calculateCost();
          renderResultTable(state.results);
          showStep(4, "forward");
          updatePostJobLink();
        } else {
          showStep(3, "forward");
        }
      }, 250);
    }

    allStep2Radios.forEach((radio) => {
      radio.addEventListener("change", () => handleRadioChange(radio));
    });

    const prevBtn = document.getElementById("step-2-prev");
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => { e.preventDefault(); showStep(1, "backward"); });
    }

    // Step 3
    updateViewCalcBtn();
    injectDialCodeSelector();

    ["hiring-status", "phone-number"].forEach((name) => {
      const f = getField(name);
      if (f) f.addEventListener(f.tagName === "SELECT" ? "change" : "input", updateViewCalcBtn);
    });

    const emailField = getField("business-email");
    if (emailField) {
      emailField.addEventListener("input", () => { updateViewCalcBtn(); showEmailError(null); });
      emailField.addEventListener("blur", () => {
        const val = emailField.value.trim();
        if (!val) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          showEmailError("Please enter a valid email address.");
        } else if (!isBusinessEmail(val)) {
          showEmailError("Please use a business email address (not Gmail, Yahoo, etc.)");
        } else {
          showEmailError(null);
        }
      });
    }

    const step3PrevBtn = document.getElementById("step-3-prev");
    if (step3PrevBtn) {
      step3PrevBtn.addEventListener("click", (e) => { e.preventDefault(); showStep(2, "backward"); });
    }

    const viewCalcBtn = document.getElementById("view-calc-btn");
    if (viewCalcBtn) {
      viewCalcBtn.style.pointerEvents = "auto";
      viewCalcBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const emailVal = getField("business-email")?.value.trim() || "";
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          showEmailError("Please enter a valid email address.");
        } else if (emailVal && !isBusinessEmail(emailVal)) {
          showEmailError("Please use a business email address (not Gmail, Yahoo, etc.)");
        }
        if (!validateStep3()) return;
        showEmailError(null);
        state.formData.hiringStatus  = getField("hiring-status")?.value || "";
        state.formData.businessEmail = getField("business-email")?.value || "";
        state.formData.phoneNumber   = getField("phone-number")?.value || "";
        submitRecruiterFormToWebflow();
        calculateCost();
        renderResultTable(state.results);
        showStep(4, "forward");
        updatePostJobLink();
      });
    }

    // Step 4
    const getPdfBtn = document.getElementById("get-pdf");
    if (getPdfBtn) {
      getPdfBtn.addEventListener("click", (e) => { e.preventDefault(); downloadPDF(); });
    }

    const newCalcWrapper = document.getElementById("new-calc-wrapper");
    if (newCalcWrapper) {
      newCalcWrapper.style.cursor = "pointer";
      newCalcWrapper.addEventListener("click", (e) => { e.preventDefault(); resetForm(); });
    }

   function updatePostJobLink() {
  const postJobLink = document.getElementById("post-job");
  if (!postJobLink) return;

  const innerDiv = postJobLink.querySelector("div");

  // Get current page name from URL pathname
  // e.g. /hiring-advice/recruitment-cost-calculator-lebanon → recruitment-cost-calculator-lebanon
  const pageName = window.location.pathname
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .split("/")
    .pop()
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");

  const ut = (state.userType || "").toLowerCase().replace(/[\s_]/g, "-");
  const isJobSeekerType = ut === "job-seeker" || ut.includes("job");

  if (isJobSeekerType) {
    if (innerDiv) innerDiv.textContent = "Explore jobs";
    postJobLink.setAttribute("href", "https://app.qureos.com/jobs");
    postJobLink.setAttribute("target", "_blank");
    postJobLink.setAttribute("data-analytics", "webflowClick");
    postJobLink.setAttribute("data-property-from", pageName);
    postJobLink.setAttribute("data-property-value", "form-last-step-explore-job-cta");
  } else {
    if (innerDiv) innerDiv.textContent = "Post a FREE job";
    postJobLink.setAttribute("href", "https://app.qureos.com/corporate/signup?utm_campaign=post_free_job");
    postJobLink.setAttribute("target", "_blank");
    postJobLink.setAttribute("data-analytics", "webflowClick");
    postJobLink.setAttribute("data-property-from", pageName);
    postJobLink.setAttribute("data-property-value", "form-last-step-post-a-free-job-cta");
  }
}

    // Currency selector
    document.querySelectorAll(".currency-dropdown-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentStep !== 1) return;
        const cur = link.textContent.trim();
        if (CURRENCY_SYMBOLS[cur]) {
          state.currency = cur;
          document.querySelectorAll(".text-l").forEach((el) => {
            if (Object.keys(CURRENCY_SYMBOLS).includes(el.textContent.trim())) el.textContent = cur;
          });
        }
      });
    });

    updateCurrencyLock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>

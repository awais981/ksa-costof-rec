
(function () {
  "use strict";

  const state = {
    currentStep: 1,
    currency: "SAR",
    userType: "",
    formData: {
      annualSalary: 0,
      positions: 0,
      jobBoardAdvertising: 0,
      agencyFee: 0,
      iqama: 0,
      gosi: 0,
      nitaqatLevy: 0,
      backgroundChecks: 0,
      relocationPackage: 0,
      onboardingTraining: 0,
      hiringStatus: "",
      businessEmail: "",
      phoneNumber: "",
      dialCode: "+966",
    },
    results: {},
  };

  const CURRENCY_SYMBOLS = {
    SAR: "SAR", AED: "AED", KWD: "KWD",
    QAR: "QAR", BHD: "BHD", OMR: "OMR", USD: "USD",
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

  function showStep(n, direction) {
    const current = getStep(state.currentStep);
    const next = getStep(n);
    if (!next) return;
    if (current) {
      current.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      current.style.opacity = "0";
      current.style.transform = direction === "forward" ? "translateX(-20px)" : "translateX(20px)";
      setTimeout(() => {
        current.style.display = "none";
        current.style.opacity = "";
        current.style.transform = "";
        next.style.display = "block";
        next.style.opacity = "0";
        next.style.transform = direction === "forward" ? "translateX(20px)" : "translateX(-20px)";
        void next.offsetWidth;
        next.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        next.style.opacity = "1";
        next.style.transform = "translateX(0)";
        state.currentStep = n;
        updateCurrencyLock();
      }, 300);
    } else {
      next.style.display = "block";
      state.currentStep = n;
      updateCurrencyLock();
    }
  }

  function updateCurrencyLock() {
    document.querySelectorAll(".currency-dropdown-link").forEach((link) => {
      if (state.currentStep === 1) {
        link.style.pointerEvents = "";
        link.style.opacity = "";
        link.style.cursor = "";
      } else {
        link.style.pointerEvents = "none";
        link.style.opacity = "0.4";
        link.style.cursor = "not-allowed";
      }
    });
  }

  function validateStep1() {
    return parseVal("annual-salary") > 0 && parseVal("positions") > 0;
  }

  function updateCalcCostBtn() {
    const btn = document.getElementById("calc-cost-btn");
    if (!btn) return;
    if (validateStep1()) {
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";
      btn.removeAttribute("data-disabled");
    } else {
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
      btn.style.cursor = "not-allowed";
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

  function isValidPhoneNumber(fullNumber) {
  try {
    var phoneNumber = window.libphonenumber.parsePhoneNumber(fullNumber);
    return phoneNumber.isValid();
  } catch (e) {
    return false;
  }
}
  
  function validateStep3() {
  const hiringField = getField("hiring-status");
  const emailField = getField("business-email");
  const phoneField = getField("phone-number");

  const hiring = hiringField ? hiringField.value.trim() : "";
  const email = emailField ? emailField.value.trim() : "";
  const phone = phoneField ? phoneField.value.trim() : "";
  const dialCode = state.formData.dialCode || "+966";

  const fullNumber = dialCode + phone.replace(/^0+/, "");

  return hiring !== "" && isBusinessEmail(email) && isValidPhoneNumber(fullNumber);
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
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
      btn.style.cursor = "pointer";
      btn.style.backgroundColor = "#1a9b6e";
      btn.style.color = "#ffffff";
      btn.removeAttribute("data-disabled");
    } else {
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
      btn.style.cursor = "not-allowed";
      btn.style.backgroundColor = "";
      btn.style.color = "";
      btn.setAttribute("data-disabled", "true");
    }
  }

  /* ─── KSA Formula ───────────────────────────────────────────
     Total Cost = Job Board Advertising + Agency Fee
               + Iqama & Work Permit + GOSI Contribution
               + Nitaqat Levy + Background Checks
               + Relocation Package + Onboarding & Training
  ─────────────────────────────────────────────────────────── */
  function calculateCost() {
    const annualSalary        = parseVal("annual-salary");
    const positions           = parseVal("positions");
    const jobBoardAdvertising = parseVal("job-board-advertising");
    const agencyFee           = parseVal("agency-fee");
    const iqama               = parseVal("iqama");               // ✅ updated
    const gosi                = parseVal("gosi");                // ✅ updated
    const nitaqatLevy         = parseVal("nitaqat-levy");
    const backgroundChecks    = parseVal("background-checks");
    const relocationPackage   = parseVal("relocation-package");
    const onboardingTraining  = parseVal("onboarding-training");

    const totalCostPerHire = jobBoardAdvertising + agencyFee + iqama
      + gosi + nitaqatLevy + backgroundChecks
      + relocationPackage + onboardingTraining;

    const totalCostAllPositions = totalCostPerHire * positions;
    const costAsPercentage = annualSalary > 0
      ? (totalCostPerHire / annualSalary) * 100
      : 0;

    state.results = {
      annualSalary,
      positions,
      jobBoardAdvertising,
      agencyFee,
      iqama,
      gosi,
      nitaqatLevy,
      backgroundChecks,
      relocationPackage,
      onboardingTraining,
      totalCostPerHire,
      totalCostAllPositions,
      costAsPercentage,
      currency: state.currency,
    };

    // cs code
    console.log('[Calc] Field values:', {
  annualSalary:        parseVal("annual-salary"),
  positions:           parseVal("positions"),
  jobBoardAdvertising: parseVal("job-board-advertising"),
  agencyFee:           parseVal("agency-fee"),
  iqama:               parseVal("iqama"),
  gosi:                parseVal("gosi"),
  nitaqatLevy:         parseVal("nitaqat-levy"),    // ← likely 0
  backgroundChecks:    parseVal("background-checks"),
  relocationPackage:   parseVal("relocation-package"),
  onboardingTraining:  parseVal("onboarding-training"),
});

    return state.results;
  }

  /* ─── Render Result Table ───────────────────────────────── */
  function renderResultTable(results) {
    const container = document.getElementById("result-table");
    if (!container) return;
    const cur = results.currency;

    const rows = [
      { label: "Annual Salary (per hire)",   value: formatNumber(results.annualSalary),        isMoney: true },
      { label: "Number of Positions",         value: results.positions.toString(),               isMoney: false },
      { label: "", value: "", divider: true },
      { label: "Job Board Advertising",       value: formatNumber(results.jobBoardAdvertising),  isMoney: true },
      { label: "Agency Fee",                  value: formatNumber(results.agencyFee),            isMoney: true },
      { label: "Iqama & Work Permit",         value: formatNumber(results.iqama),               isMoney: true },
      { label: "GOSI Contribution",           value: formatNumber(results.gosi),                isMoney: true },
      { label: "Nitaqat Levy",                value: formatNumber(results.nitaqatLevy),          isMoney: true },
      { label: "Background Checks",           value: formatNumber(results.backgroundChecks),     isMoney: true },
      { label: "Relocation Package",          value: formatNumber(results.relocationPackage),    isMoney: true },
      { label: "Onboarding & Training",       value: formatNumber(results.onboardingTraining),   isMoney: true },
      { label: "", value: "", divider: true },
      {
        label: "Total Cost / Hire",
        value: formatNumber(results.totalCostPerHire),
        isMoney: true, bold: true, green: true, large: true,
      },
      {
        label: "% of Salary",
        value: results.costAsPercentage.toFixed(1) + "%",
        isMoney: false, bold: true, green: true,
      },
      {
        label: `Total All Positions (${results.positions})`,
        value: formatNumber(results.totalCostAllPositions),
        isMoney: true, bold: true, green: true, large: true,
      },
    ];

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
      const borderTop  = row.borderTop ? "border-top:2px solid #e2e8f0;" : "";
      const boldStyle  = row.bold ? "font-weight:700;" : "";
      const colorStyle = row.green ? "color:#1a9b6e;" : "";
      const fontSz     = row.large ? "font-size:17px;" : "";
      html += `
        <tr style="border-bottom:1px solid #edf2f7;${borderTop}">
          <td style="padding:12px 16px;color:#4a5568;${boldStyle}${fontSz}">${row.label}</td>
          <td style="padding:12px 16px;text-align:right;${boldStyle}${colorStyle}${fontSz}">
            ${row.isMoney ? `${cur} ${row.value}` : row.value}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  /* ─── PDF ───────────────────────────────────────────────── */
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
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const r = state.results;
      const cur = r.currency;
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(26, 155, 110);
      doc.rect(0, 0, pageW, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Qureos", 14, 12);
      doc.setFontSize(18);
      doc.text("KSA Recruitment Cost Breakdown", pageW / 2, 22, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on ${new Date().toLocaleDateString("en-GB")}`, pageW / 2, 31, { align: "center" });
      doc.setTextColor(44, 62, 80);

      let y = 52;
      const labelX = 20;
      const valX = pageW - 20;
      const lineH = 12;

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

      drawRow("Annual Salary (per hire)",     `${cur} ${formatNumber(r.annualSalary)}`);
      drawRow("Number of Positions",           r.positions.toString());
      y += 4;
      doc.setDrawColor(200, 210, 220);
      doc.line(labelX, y - 2, valX, y - 2);
      drawRow("Job Board Advertising",         `${cur} ${formatNumber(r.jobBoardAdvertising)}`);
      drawRow("Agency Fee",                    `${cur} ${formatNumber(r.agencyFee)}`);
      drawRow("Iqama & Work Permit",           `${cur} ${formatNumber(r.iqama)}`);
      drawRow("GOSI Contribution",             `${cur} ${formatNumber(r.gosi)}`);
      drawRow("Nitaqat Levy",                  `${cur} ${formatNumber(r.nitaqatLevy)}`);
      drawRow("Background Checks",             `${cur} ${formatNumber(r.backgroundChecks)}`);
      drawRow("Relocation Package",            `${cur} ${formatNumber(r.relocationPackage)}`);
      drawRow("Onboarding & Training",         `${cur} ${formatNumber(r.onboardingTraining)}`);
      y += 4;
      doc.setDrawColor(200, 210, 220);
      doc.line(labelX, y - 2, valX, y - 2);
      drawRow("Total Cost / Hire",             `${cur} ${formatNumber(r.totalCostPerHire)}`,         { bold: true, green: true, large: true });
      drawRow("% of Salary",                   `${r.costAsPercentage.toFixed(1)}%`,                  { bold: true, green: true });
      drawRow(`Total All Positions (${r.positions})`, `${cur} ${formatNumber(r.totalCostAllPositions)}`, { bold: true, green: true, large: true });

      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text("Generated by Qureos — qureos.com", pageW / 2, pageH - 10, { align: "center" });
      doc.save(`KSA-Recruitment-Cost-${Date.now()}.pdf`);
    });
  }

  /* ─── Submit to Qureos API ──────────────────────────────── */
  function submitRecruiterFormToWebflow() {
  try {
    const sourceName = window.location.pathname
      .replace(/^\//, "")
      .replace(/\/$/, "") || "home";

    const payload = {
      hiringStatus:  state.formData.hiringStatus,
      businessEmail: state.formData.businessEmail,
      phoneNumber:   (state.formData.dialCode || "+966") + state.formData.phoneNumber,
      dialCode:      state.formData.dialCode || "+966",
      source:        sourceName,
      baseId:        "app47x5vmXROTUwNZ",
    };

    // ✅ Log exactly what's being sent before the request fires
    console.log("[KSA Calculator] Sending payload:", JSON.stringify(payload, null, 2));

    fetch("https://misc-api.qureos.com/form-submissions/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log("[KSA Calculator] API response status:", res.status);
        return res.json().catch(() => null);   // ← safely parse JSON if available
      })
      .then((body) => {
        if (body) console.log("[KSA Calculator] API response body:", body);
      })
      .catch((err) => {
        console.warn("[KSA Calculator] API fetch failed:", err);
      });

  } catch (err) {
    console.warn("[KSA Calculator] submitRecruiterFormToWebflow error:", err);
  }
}

  /* ─── Dial Code Selector ────────────────────────────────── */
  const DIAL_CODES = [
  { code: "+93", name: "Afghanistan" },
  { code: "+355", name: "Albania" },
  { code: "+213", name: "Algeria" },
  { code: "+376", name: "Andorra" },
  { code: "+244", name: "Angola" },
  { code: "+54", name: "Argentina" },
  { code: "+374", name: "Armenia" },
  { code: "+61", name: "Australia" },
  { code: "+43", name: "Austria" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+973", name: "Bahrain" },
  { code: "+880", name: "Bangladesh" },
  { code: "+375", name: "Belarus" },
  { code: "+32", name: "Belgium" },
  { code: "+591", name: "Bolivia" },
  { code: "+387", name: "Bosnia and Herzegovina" },
  { code: "+55", name: "Brazil" },
  { code: "+359", name: "Bulgaria" },
  { code: "+855", name: "Cambodia" },
  { code: "+237", name: "Cameroon" },
  { code: "+1", name: "Canada" },
  { code: "+56", name: "Chile" },
  { code: "+86", name: "China" },
  { code: "+57", name: "Colombia" },
  { code: "+385", name: "Croatia" },
  { code: "+357", name: "Cyprus" },
  { code: "+420", name: "Czech Republic" },
  { code: "+45", name: "Denmark" },
  { code: "+593", name: "Ecuador" },
  { code: "+20", name: "Egypt" },
  { code: "+372", name: "Estonia" },
  { code: "+251", name: "Ethiopia" },
  { code: "+358", name: "Finland" },
  { code: "+33", name: "France" },
  { code: "+995", name: "Georgia" },
  { code: "+49", name: "Germany" },
  { code: "+233", name: "Ghana" },
  { code: "+30", name: "Greece" },
  { code: "+502", name: "Guatemala" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+91", name: "India" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+964", name: "Iraq" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+81", name: "Japan" },
  { code: "+962", name: "Jordan" },
  { code: "+7", name: "Kazakhstan" },
  { code: "+254", name: "Kenya" },
  { code: "+965", name: "Kuwait" },
  { code: "+371", name: "Latvia" },
  { code: "+961", name: "Lebanon" },
  { code: "+218", name: "Libya" },
  { code: "+370", name: "Lithuania" },
  { code: "+352", name: "Luxembourg" },
  { code: "+60", name: "Malaysia" },
  { code: "+356", name: "Malta" },
  { code: "+52", name: "Mexico" },
  { code: "+373", name: "Moldova" },
  { code: "+212", name: "Morocco" },
  { code: "+95", name: "Myanmar" },
  { code: "+977", name: "Nepal" },
  { code: "+31", name: "Netherlands" },
  { code: "+64", name: "New Zealand" },
  { code: "+234", name: "Nigeria" },
  { code: "+47", name: "Norway" },
  { code: "+968", name: "Oman" },
  { code: "+92", name: "Pakistan" },
  { code: "+970", name: "Palestine" },
  { code: "+507", name: "Panama" },
  { code: "+51", name: "Peru" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+974", name: "Qatar" },
  { code: "+40", name: "Romania" },
  { code: "+7", name: "Russia" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+221", name: "Senegal" },
  { code: "+381", name: "Serbia" },
  { code: "+65", name: "Singapore" },
  { code: "+421", name: "Slovakia" },
  { code: "+386", name: "Slovenia" },
  { code: "+252", name: "Somalia" },
  { code: "+27", name: "South Africa" },
  { code: "+82", name: "South Korea" },
  { code: "+34", name: "Spain" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+249", name: "Sudan" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+963", name: "Syria" },
  { code: "+886", name: "Taiwan" },
  { code: "+255", name: "Tanzania" },
  { code: "+66", name: "Thailand" },
  { code: "+216", name: "Tunisia" },
  { code: "+90", name: "Turkey" },
  { code: "+256", name: "Uganda" },
  { code: "+380", name: "Ukraine" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+44", name: "United Kingdom" },
  { code: "+1", name: "United States" },
  { code: "+598", name: "Uruguay" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+58", name: "Venezuela" },
  { code: "+84", name: "Vietnam" },
  { code: "+967", name: "Yemen" },
  { code: "+263", name: "Zimbabwe" },
];

  function injectDialCodeSelector() {
  const phoneField = getField("phone-number");
  if (!phoneField || document.getElementById("dial-code-wrapper")) return;

  const URL_TO_DIAL = {
    "saudi-arabia": "+966", "ksa": "+966", "sa": "+966",
    "uae": "+971", "dubai": "+971", "abu-dhabi": "+971",
    "qatar": "+974",
    "kuwait": "+965",
    "bahrain": "+973",
    "oman": "+968",
    "pakistan": "+92",
    "india": "+91",
    "bangladesh": "+880",
    "sri-lanka": "+94",
    "nepal": "+977",
    "philippines": "+63",
    "indonesia": "+62",
    "malaysia": "+60",
    "singapore": "+65",
    "china": "+86",
    "japan": "+81",
    "south-korea": "+82",
    "egypt": "+20",
    "jordan": "+962",
    "lebanon": "+961",
    "iraq": "+964",
    "syria": "+963",
    "yemen": "+967",
    "palestine": "+970",
    "israel": "+972",
    "turkey": "+90",
    "germany": "+49",
    "france": "+33",
    "united-kingdom": "+44", "uk": "+44",
    "netherlands": "+31",
    "belgium": "+32",
    "spain": "+34",
    "italy": "+39",
    "poland": "+48",
    "sweden": "+46",
    "denmark": "+45",
    "norway": "+47",
    "austria": "+43",
    "romania": "+40",
    "czech-republic": "+420",
    "hungary": "+36",
    "lithuania": "+370",
    "croatia": "+385",
    "bulgaria": "+359",
    "cyprus": "+357",
    "united-states": "+1", "usa": "+1",
    "canada": "+1",
    "morocco": "+212",
    "nigeria": "+234",
    "kenya": "+254",
    "south-africa": "+27",
    "ghana": "+233",
    "ethiopia": "+251",
    "sudan": "+249",
    "algeria": "+213",
    "tunisia": "+216",
    "australia": "+61",
    "new-zealand": "+64",
  };

  const segments = window.location.pathname.replace(/\/$/,'').split('/').filter(Boolean);
  const lastSeg = segments[segments.length - 1] || '';
  const secondLastSeg = segments[segments.length - 2] || '';
  const defaultDial = URL_TO_DIAL[lastSeg] || URL_TO_DIAL[secondLastSeg] || '+966';
  state.formData.dialCode = defaultDial;

  const wrapper = document.createElement('div');
  wrapper.id = 'dial-code-wrapper';
  wrapper.style.cssText = 'display:flex;align-items:stretch;gap:0;width:100%;';

  const dropdownBtn = document.createElement('button');
  dropdownBtn.type = 'button';
  dropdownBtn.id = 'dial-code-btn';
  dropdownBtn.style.cssText = [
    'display:flex;align-items:center;gap:6px;',
    'padding:0 10px;height:100%;',
    'background:#f7f9fc;border:1px solid #cbd5e0;border-right:none;',
    'border-radius:4px 0 0 4px;cursor:pointer;white-space:nowrap;',
    'font-size:14px;color:#2d3748;min-width:80px;',
    'transition:background 0.2s;',
  ].join('');
  dropdownBtn.innerHTML = `<span id="dial-code-label">${defaultDial}</span>` +
    '<span style="font-size:10px;opacity:0.5;">▼</span>';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search...';
  searchInput.style.cssText = [
    'width:100%;padding:8px 12px;border:none;',
    'border-bottom:1px solid #e2e8f0;font-size:13px;',
    'outline:none;color:#2d3748;',
  ].join('');

  const dropdownList = document.createElement('div');
  dropdownList.id = 'dial-code-list';
  dropdownList.style.cssText = [
    'display:none;position:absolute;z-index:9999;',
    'background:#fff;border:1px solid #cbd5e0;border-radius:6px;',
    'box-shadow:0 4px 16px rgba(0,0,0,0.12);',
    'top:100%;left:0;margin-top:4px;min-width:220px;',
  ].join('');

  const listInner = document.createElement('div');
  listInner.style.cssText = 'max-height:200px;overflow-y:auto;';
  dropdownList.appendChild(searchInput);
  dropdownList.appendChild(listInner);

  function renderDialList(filter) {
    listInner.innerHTML = '';
    const filtered = filter
      ? DIAL_CODES.filter(dc =>
          dc.name.toLowerCase().includes(filter.toLowerCase()) ||
          dc.code.includes(filter)
        )
      : DIAL_CODES;
    if (filtered.length === 0) {
      listInner.innerHTML = '<div style="padding:12px;font-size:13px;color:#9ca3af;text-align:center;">No results</div>';
      return;
    }
    filtered.forEach(dc => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:9px 14px;cursor:pointer;font-size:13px;color:#2d3748;';
      item.innerHTML = `<span>${dc.name}</span><span style="color:#718096;">${dc.code}</span>`;
      item.addEventListener('mouseenter', () => item.style.background = '#f0fdf4');
      item.addEventListener('mouseleave', () => item.style.background = dc.code === state.formData.dialCode ? '#f0fdf4' : '');
      if (dc.code === state.formData.dialCode) item.style.background = '#f0fdf4';
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        state.formData.dialCode = dc.code;
        document.getElementById('dial-code-label').textContent = dc.code;
        dropdownList.style.display = 'none';
        updateViewCalcBtn();
        const phoneField = getField('phone-number');
        if (phoneField && phoneField.value.trim() !== '') {
          const fullNumber = dc.code + phoneField.value.trim().replace(/^0+/, '');
          const valid = isValidPhoneNumber(fullNumber);
          let phoneErrEl = document.getElementById('phone-error-msg');
          if (!phoneErrEl) {
            phoneErrEl = document.createElement('div');
            phoneErrEl.id = 'phone-error-msg';
            phoneErrEl.style.cssText = 'color:#e53e3e;font-size:12px;margin-top:4px;display:none;';
            phoneErrEl.textContent = 'Please enter a valid phone number.';
            const dw = document.getElementById('dial-code-wrapper');
            const ia = dw || phoneField.parentNode;
            ia.parentNode.insertBefore(phoneErrEl, ia.nextSibling);
          }
          phoneErrEl.style.display = valid ? 'none' : 'block';
        }
      });
      listInner.appendChild(item);
    }); // closes filtered.forEach
  } // closes renderDialList

  searchInput.addEventListener('input', () => renderDialList(searchInput.value));

  const relContainer = document.createElement('div');
  relContainer.style.cssText = 'position:relative;flex-shrink:0;';
  relContainer.appendChild(dropdownBtn);
  relContainer.appendChild(dropdownList);

  dropdownBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = dropdownList.style.display === 'block';
    if (isOpen) {
      dropdownList.style.display = 'none';
    } else {
      dropdownList.style.display = 'block';
      searchInput.value = '';
      renderDialList('');
      setTimeout(() => searchInput.focus(), 30);
    }
  });

  document.addEventListener('click', e => {
    if (!relContainer.contains(e.target)) dropdownList.style.display = 'none';
  });

  phoneField.style.cssText += 'border-radius:0 4px 4px 0;border-left:none;flex:1;';
  phoneField.parentNode.insertBefore(wrapper, phoneField);
  wrapper.appendChild(relContainer);
  wrapper.appendChild(phoneField);

  let phoneErrEl = document.getElementById('phone-error-msg');
  if (!phoneErrEl) {
    phoneErrEl = document.createElement('div');
    phoneErrEl.id = 'phone-error-msg';
    phoneErrEl.style.cssText = 'color:#e53e3e;font-size:12px;margin-top:4px;display:none;';
    phoneErrEl.textContent = 'Please enter a valid phone number.';
    wrapper.parentNode.insertBefore(phoneErrEl, wrapper.nextSibling);
  }

  renderDialList('');
}


  /* ─── Reset ─────────────────────────────────────────────── */
  function resetForm() {
    [
      "annual-salary", "positions", "job-board-advertising",
      "agency-fee", "iqama", "gosi",                          // ✅ updated
      "nitaqat-levy", "background-checks", "relocation-package",
      "onboarding-training", "business-email", "phone-number",
    ].forEach((name) => {
      const f = getField(name);
      if (f) f.value = "";
    });
    const hiringField = getField("hiring-status");
    if (hiringField) hiringField.selectedIndex = 0;
    document.querySelectorAll('[name="user-type"]').forEach((r) => (r.checked = false));
    state.currency = "SAR";
    document.querySelectorAll(".currency-selector-label, .text-l").forEach((el) => {
      if (el.textContent.match(/^(SAR|AED|KWD|QAR|BHD|OMR|USD)$/)) el.textContent = "SAR";
    });
    for (let i = 1; i <= 4; i++) {
      const s = getStep(i);
      if (s) {
        s.style.display = i === 1 ? "block" : "none";
        s.style.opacity = "";
        s.style.transform = "";
        s.style.transition = "";
      }
    }
    state.currentStep = 1;
    updateCalcCostBtn();
    updateViewCalcBtn();
    updateCurrencyLock();
  }

  /* ─── Init ──────────────────────────────────────────────── */
  function init() {
    for (let i = 1; i <= 4; i++) {
      const s = getStep(i);
      if (s) s.style.display = i === 1 ? "block" : "none";
    }

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

    const step2El = getStep(2);
    const allStep2Radios = step2El
      ? step2El.querySelectorAll('input[type="radio"]')
      : document.querySelectorAll('[name="user-type"]');

    function handleRadioChange(radio) {
      const userType = radio.value || radio.getAttribute("value") || radio.id;
      if (!userType) return;
      state.formData.userType = userType;
      state.userType = userType;
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

    updateViewCalcBtn();
    injectDialCodeSelector();

   ["hiring-status", "phone-number"].forEach((name) => {
  const f = getField(name);
  if (f) {
    f.addEventListener(f.tagName === "SELECT" ? "change" : "input", () => {
      updateViewCalcBtn();
      if (name === "phone-number" && f.value.trim() !== "") {
        const dialCode = state.formData.dialCode || "+966";
        const fullNumber = dialCode + f.value.trim().replace(/^0+/, "");
        const valid = isValidPhoneNumber(fullNumber);
        let phoneErrEl = document.getElementById("phone-error-msg");
        if (!phoneErrEl) {
          phoneErrEl = document.createElement("div");
          phoneErrEl.id = "phone-error-msg";
          phoneErrEl.style.cssText = "color:#e53e3e;font-size:12px;margin-top:4px;display:none;";
          phoneErrEl.textContent = "Please enter a valid phone number.";
          const dialWrapper = document.getElementById("dial-code-wrapper");
          const insertAfter = dialWrapper || f.parentNode;
          insertAfter.parentNode.insertBefore(phoneErrEl, insertAfter.nextSibling);
        }
        phoneErrEl.style.display = valid ? "none" : "block";
      }
    });
  }
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

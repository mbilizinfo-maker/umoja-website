// ===== Simple FX rates (you can update anytime) =====
const FX_RATES = {
  USD: 1,     // USD cash
  UGX: 3800,  // <-- update these to your real black-market rates
  KES: 130,
  TZS: 2600,
  RWF: 1350,
  BIF: 2800
};

// Backend URL (your Node server on the Mac)
const API_BASE = "http://localhost:4000";

// Grab DOM elements
const amountInput   = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const quoteBox      = document.getElementById("quote-box");
const orderResult   = document.getElementById("order-result");

const recName   = document.getElementById("rec-name");
const recPhone  = document.getElementById("rec-phone");
const recCountry = document.getElementById("rec-country");

// Treasury address from the HTML box (so we only keep it in one place)
const treasuryAddress = document.querySelector(".wallet-address").innerText.trim();


// ===== 1. CALCULATE QUOTE =====
async function getQuote() {
  const amount = Number(amountInput.value);
  const currency = currencySelect.value; // USD, UGX, KES, ...

  if (!amount || amount <= 0) {
    alert("Please enter a valid USDT amount.");
    return;
  }

  try {
    // Ask backend for fee + payout
    const res = await fetch(`${API_BASE}/api/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_usdt: amount })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    const feeUSDT    = Number(data.fee_usdt);
    const payoutUSDT = Number(data.payout_usdt);

    // FX and local amount (frontend side)
    const fx = FX_RATES[currency] || 1;
    const localAmount = payoutUSDT * fx;

    quoteBox.classList.remove("hidden");
    quoteBox.innerHTML = `
      <p><strong>Amount:</strong> ${amount.toFixed(2)} USDT</p>
      <p><strong>Fee:</strong> ${feeUSDT.toFixed(2)} USDT</p>
      <p><strong>Payout (USD):</strong> ${payoutUSDT.toFixed(2)} USD</p>
      <p><strong>FX Rate:</strong> 1 USD = ${fx.toLocaleString()} ${currency}</p>
      <p><strong>Local Amount:</strong> ${localAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}</p>
      <hr>
      <p><strong>Send USDT (BEP-20) to:</strong><br>${treasuryAddress}</p>
      <p style="font-size: 12px; opacity: 0.8;">⚠️ Only send USDT on BNB Smart Chain (BEP-20).</p>
    `;
  } catch (err) {
    console.error(err);
    alert("Server error. Is the backend running on your Mac?");
  }
}


// ===== 2. SUBMIT TRANSFER (for your internal log / agent) =====
function submitOrder() {
  const amount   = Number(amountInput.value);
  const currency = currencySelect.value;
  const name     = recName.value.trim();
  const phone    = recPhone.value.trim();
  const country  = recCountry.value;

  if (!amount || amount <= 0) {
    alert("Please enter the amount and calculate first.");
    return;
  }
  if (!name || !phone) {
    alert("Please enter recipient name and phone.");
    return;
  }

  // Simple local FX again for confirmation
  const fx = FX_RATES[currency] || 1;
  const feeUSDT = amount * 0.04;               // 4% (must match backend)
  const payoutUSDT = amount - feeUSDT;
  const localAmount = payoutUSDT * fx;

  // Simple reference ID (you can later replace with DB ID)
  const ref = "UMJ-" + Date.now().toString(36).toUpperCase();

  orderResult.classList.remove("hidden");
  orderResult.innerHTML = `
    <p><strong>Transfer Reference:</strong> ${ref}</p>
    <p><strong>Sender Amount:</strong> ${amount.toFixed(2)} USDT</p>
    <p><strong>Recipient:</strong> ${name} (${phone}) – ${country}</p>
    <p><strong>Payout:</strong> ${localAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}</p>
    <p><strong>Agent Instruction:</strong> Pay the above amount in ${currency} once you confirm the USDT has arrived in the treasury wallet:</p>
    <p style="word-break: break-all;">${treasuryAddress}</p>
  `;

  alert("Transfer submitted! Share the reference with your payout agent.");
}

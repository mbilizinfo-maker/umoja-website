// Simple FX table (YOU can update these numbers anytime)
const FX_RATES = {
  USD: 1,     // cash USD
  UGX: 3800,  // example rates – adjust daily or weekly
  KES: 130,
  TZS: 2600,
  RWF: 1350,
  BIF: 2800
};

const apiBase = "http://localhost:4000"; // backend running on your Mac

const amountInput = document.getElementById("amount");
const payoutSelect = document.getElementById("payoutCurrency");
const resultBox = document.getElementById("resultBox");
const treasuryAddrSpan = document.getElementById("treasuryAddress");
const form = document.getElementById("transferForm");

// Handle Calculate button
document.getElementById("calcBtn").addEventListener("click", async () => {
  const amount = Number(amountInput.value);
  const currency = payoutSelect.value; // e.g. "USD", "UGX", "KES"...

  if (!amount || amount <= 0) {
    alert("Enter a valid USDT amount");
    return;
  }

  try {
    const res = await fetch(`${apiBase}/api/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_usdt: amount })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    const fee = data.fee_usdt;
    const payoutUsdt = data.payout_usdt;
    const treasury = data.treasury_address;

    // FX + local amount (frontend side)
    const fx = FX_RATES[currency] || 1;
    const localAmount = payoutUsdt * fx;

    treasuryAddrSpan.textContent = treasury;

    resultBox.innerHTML = `
      <p><strong>Amount:</strong> ${amount.toFixed(2)} USDT</p>
      <p><strong>Fee:</strong> ${fee.toFixed(2)} USDT</p>
      <p><strong>Payout (USD):</strong> ${payoutUsdt.toFixed(2)} USD</p>
      <p><strong>FX Rate:</strong> 1 USD = ${fx.toLocaleString()} ${currency}</p>
      <p><strong>Local Amount:</strong> ${localAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} ${currency}</p>
      <p><strong>Send USDT (BEP-20) to:</strong><br>${treasury}</p>
    `;
  } catch (err) {
    console.error(err);
    alert("Server error. Make sure backend is running.");
  }
});

// (Optional) prevent full-page reload on form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Transfer submitted! (internal log step comes next)");
});

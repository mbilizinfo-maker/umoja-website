// API Base URL (change when backend goes live)
const API_BASE = "http://localhost:4000";

async function getQuote() {
  const amt = document.getElementById("amount").value;
  const cur = document.getElementById("currency").value;

  const r = await fetch(`${API_BASE}/api/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount_usdt: amt,
      payout_currency: cur
    })
  });

  const data = await r.json();

  const box = document.getElementById("quote-box");
  box.classList.remove("hidden");

  box.innerHTML = `
    <b>Amount:</b> ${data.amount_usdt} USDT<br>
    <b>Fee:</b> ${data.fee_usdt} USDT<br>
    <b>Payout (USD):</b> ${data.payout_usd}<br>
    <b>FX Rate:</b> ${data.fx_rate}<br>
    <b>Local Amount:</b> ${data.payout_local} ${data.payout_currency}<br>
    <hr>
    <b>Send USDT to:</b><br>
    ${data.treasury_address}
  `;
}

function submitOrder() {
  const out = document.getElementById("order-result");
  out.classList.remove("hidden");
  out.innerHTML = `Transfer submitted. Our agent will contact your recipient shortly.`;
}

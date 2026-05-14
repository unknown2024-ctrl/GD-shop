const form = document.querySelector("#orderForm");
const levelGrid = document.querySelector("#levelGrid");
const levelInput = document.querySelector("#levelName");
const orderStatus = document.querySelector("#orderStatus");
const CASHAPP_URL = "https://cash.app/$jropmsosgsgshs173";

const fields = {
  buyerName: document.querySelector("#buyerName"),
  buyerEmail: document.querySelector("#buyerEmail"),
  gdUsername: document.querySelector("#gdUsername"),
  levelName: levelInput,
  paymentNote: document.querySelector("#paymentNote"),
};

function clean(value, fallback) {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildOrderDetails() {
  const buyer = clean(fields.buyerName.value, "{buyer_name}");
  const email = clean(fields.buyerEmail.value, "{buyer_email}");
  const gdUser = clean(fields.gdUsername.value, "{gd_username}");
  const levelName = clean(fields.levelName.value, "{level_name}");
  const paymentNote = clean(fields.paymentNote.value, "{cash_app_note}");

  return `GD Level Shop Order
Buyer: ${buyer}
Email: ${email}
Geometry Dash username: ${gdUser}
Level requested: ${levelName}
Cash App payment note/name: ${paymentNote}
Cash App paid to: $jropmsosgsgshs173`;
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadFallbackLevelsFile() {
  return new Promise((resolve) => {
    if (Array.isArray(window.GD_LEVELS)) {
      resolve();
      return;
    }

    const fallbackScript = document.createElement("script");
    fallbackScript.src = "./levals.js";
    fallbackScript.onload = () => resolve();
    fallbackScript.onerror = () => resolve();
    document.head.appendChild(fallbackScript);
  });
}

function renderLevels() {
  const levels = Array.isArray(window.GD_LEVELS) ? window.GD_LEVELS : [];

  if (!levels.length) {
    levelGrid.innerHTML = '<p class="muted-empty">No paid levels are listed yet.</p>';
    return;
  }

  levelGrid.innerHTML = levels
    .map((level) => {
      const name = escapeText(level.name);
      const price = escapeText(level.price);
      const difficulty = escapeText(level.difficulty);
      const difficultyClass = escapeText(level.difficultyClass || "hard");
      const description = escapeText(level.description);

      return `
        <article class="level-card">
          <div class="level-top">
            <span class="difficulty ${difficultyClass}">${difficulty}</span>
            <span class="price">${price}</span>
          </div>
          <h3>${name}</h3>
          <p>${description}</p>
          <div class="level-actions">
            <button class="select-level" type="button" data-level="${name}" data-price="${price}">Select</button>
            <a class="cashapp-link" href="${CASHAPP_URL}" target="_blank" rel="noopener" data-level="${name}" data-price="${price}">
              Pay ${price}
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".select-level").forEach((button) => {
    button.addEventListener("click", () => {
      fields.levelName.value = `${button.dataset.level} (${button.dataset.price})`;
      fields.levelName.focus();
    });
  });

  document.querySelectorAll(".cashapp-link").forEach((link) => {
    link.addEventListener("click", () => {
      fields.levelName.value = `${link.dataset.level} (${link.dataset.price})`;
    });
  });
}

loadFallbackLevelsFile().then(renderLevels);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const text = buildOrderDetails();

  try {
    await navigator.clipboard.writeText(text);
    orderStatus.textContent = "Order details copied. Send them to me after paying on Cash App.";
  } catch {
    orderStatus.textContent = "Copy failed. Screenshot this form or message me the same order details.";
  }
});

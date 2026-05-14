const form = document.querySelector("#orderForm");
const emailPreview = document.querySelector("#emailPreview");
const copyEmail = document.querySelector("#copyEmail");
const levelGrid = document.querySelector("#levelGrid");
const levelInput = document.querySelector("#levelName");

const fields = {
  buyerName: document.querySelector("#buyerName"),
  buyerEmail: document.querySelector("#buyerEmail"),
  gdUsername: document.querySelector("#gdUsername"),
  levelName: levelInput,
  levelId: document.querySelector("#levelId"),
  paymentNote: document.querySelector("#paymentNote"),
};

function clean(value, fallback) {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function buildEmail() {
  const buyer = clean(fields.buyerName.value, "{buyer_name}");
  const gdUser = clean(fields.gdUsername.value, "{gd_username}");
  const levelName = clean(fields.levelName.value, "{level_name}");
  const levelId = clean(fields.levelId.value, "Sent after payment approval");
  const paymentNote = clean(fields.paymentNote.value, "Payment approved by shop owner");

  return `Subject: Thanks for your Geometry Dash level purchase

Hi ${buyer},

Thanks for purchasing one of my Geometry Dash levels.

Level: ${levelName}
Geometry Dash username: ${gdUser}
Level ID: ${levelId}
Payment note: ${paymentNote}
Cash App: $jropmsosgsgshs173

Please keep this level ID private. By purchasing this level, you agree not to copy, reupload, distribute, resell, leak, or share the level without my permission.

If the level is copied, leaked, or distributed without permission, your account on my site may be banned, and copied versions of the level may be reported in Geometry Dash.

Refund policy:
If copied or leaked content is taken down within 24 hours, I may consider giving a refund depending on how serious the issue was. If the copied or leaked content is not taken down, or the situation is serious, a refund may not be given.

Thanks again,
GD Level Shop`;
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
          <button class="select-level" type="button" data-level="${name}" data-price="${price}">Select</button>
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
}

loadFallbackLevelsFile().then(renderLevels);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  emailPreview.textContent = buildEmail();
  emailPreview.scrollIntoView({ behavior: "smooth", block: "center" });
});

copyEmail.addEventListener("click", async () => {
  const text = emailPreview.textContent.trim();

  if (!text || text === "Fill out the order form to create the buyer email.") {
    copyEmail.textContent = "Nothing to copy";
    setTimeout(() => {
      copyEmail.textContent = "Copy email";
    }, 1600);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyEmail.textContent = "Copied";
  } catch {
    copyEmail.textContent = "Copy failed";
  }

  setTimeout(() => {
    copyEmail.textContent = "Copy email";
  }, 1600);
});

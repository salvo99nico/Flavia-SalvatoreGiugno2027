const $ = (id) => document.getElementById(id);

/* ====== DA CONFIGURARE ====== */
const SALVATORE_PHONE = "393924914903";
/* ============================ */

$("openButton")?.addEventListener("click", () => {
  $("details")?.scrollIntoView({ behavior: "smooth" });
});

// Countdown
const weddingDate = new Date("2027-06-19T16:00:00+02:00");
const pad = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const diff = weddingDate - new Date();
  if (diff <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((i) => ($(i).textContent = "0"));
    return;
  }
  const s = Math.floor(diff / 1000);
  $("days").textContent = Math.floor(s / 86400);
  $("hours").textContent = pad(Math.floor((s % 86400) / 3600));
  $("minutes").textContent = pad(Math.floor((s % 3600) / 60));
  $("seconds").textContent = pad(s % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Animazioni allo scroll
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal, .reveal-start").forEach((el) => observer.observe(el));
setTimeout(() => {
  document.querySelectorAll(".reveal-start").forEach((el) => el.classList.add("visible"));
}, 150);


// Modulo di conferma
const form = $("rsvpForm");

function refreshForm() {
  const yes = form.presence.value === "si";
  $("details-yes").classList.toggle("hide", !yes);
  $("agesBox").classList.toggle("hide", !(yes && Number($("kids").value) > 0));
}
form.addEventListener("change", refreshForm);
form.addEventListener("input", refreshForm);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("name").value.trim();
  const notes = $("notes").value.trim();
  let text;

  if (form.presence.value === "si") {
    const adults = $("adults").value || "1";
    const kids = Number($("kids").value) || 0;
    const ages = $("ages").value.trim();
    const allergies = $("allergies").value.trim();
    text =
      `Ciao Flavia e Salvatore, confermo la mia presenza al matrimonio del 19 giugno 2027.\n\n` +
      `Nome: ${name}\n` +
      `Adulti: ${adults}\n` +
      `Bambini: ${kids}${kids > 0 ? ` (età: ${ages || "non indicata"})` : ""}\n` +
      `Allergie/intolleranze: ${allergies || "Nessuna"}\n` +
      `Messaggio: ${notes || "-"}`;
  } else {
    text =
      `Ciao Flavia e Salvatore, purtroppo non potrò essere presente al matrimonio del 19 giugno 2027.\n\n` +
      `Nome: ${name}\n` +
      `Messaggio: ${notes || "Vi auguro tanta felicità!"}`;
  }

  window.open(`https://wa.me/${SALVATORE_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
});

// Petali che cadono
(function () {
  const box = document.querySelector(".petals");
  if (!box) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = window.innerWidth < 720 ? 16 : 30;
  const fromCss = getComputedStyle(document.documentElement).getPropertyValue("--petals").split(",").map((s) => s.trim()).filter(Boolean);
  const colors = fromCss.length ? fromCss : ["#c46f4d", "#b85c3b", "#d88b68", "#9f4f38", "#e5a077"];
  const rnd = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const w = rnd(10, 22);
    p.className = "petal";
    p.style.width = w + "px";
    p.style.height = w * 1.3 + "px";
    p.style.left = rnd(0, 100) + "%";
    p.style.background = `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 2) % colors.length]})`;
    p.style.setProperty("--dx", rnd(-120, 120) + "px");
    p.style.setProperty("--rot", rnd(240, 720) + "deg");
    p.style.setProperty("--dur", rnd(11, 20) + "s");
    p.style.setProperty("--delay", -rnd(0, 20) + "s");
    if (still) { p.style.top = rnd(0, 95) + "%"; p.style.transform = `rotate(${rnd(0, 360)}deg)`; }
    box.appendChild(p);
  }
})();

// Musica di sottofondo (parte solo quando l'ospite la attiva)
(function () {
  const audio = $("bgm"), btn = $("musicBtn");
  if (!audio || !btn) return;
  audio.volume = 0.35;
  const set = (on) => {
    btn.classList.toggle("on", on);
    btn.classList.remove("hint");
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Metti in pausa la musica" : "Attiva la musica");
  };
  const play = () => audio.play().then(() => set(true)).catch(() => set(false));
  let touched = false;
  btn.addEventListener("click", () => {
    touched = true;
    audio.paused ? play() : (audio.pause(), set(false));
  });
  $("openButton")?.addEventListener("click", () => { if (!touched && audio.paused) play(); touched = true; });
})();

// Il video parte da solo (muto, in loop)
$("coupleVideo")?.play?.().catch(() => {});

// Pulsanti "Copia IBAN"
document.querySelectorAll(".copy-iban").forEach((btn) => {
  btn.addEventListener("click", () => {
    navigator.clipboard?.writeText(btn.dataset.iban);
    const old = btn.textContent;
    btn.textContent = "Copiato!";
    setTimeout(() => (btn.textContent = old), 2000);
  });
});

// Sondaggio dei colori
// Per far vedere a tutti i voti, incolla qui l'indirizzo del tuo database Firebase (vedi istruzioni), ad esempio:
// "https://NOME-PROGETTO-default-rtdb.europe-west1.firebasedatabase.app/sondaggio"
// Se resta vuoto, il sondaggio funziona in "prova" e i voti si vedono solo su questo dispositivo.
const POLL_URL = "";

(function () {
  const opts = [...document.querySelectorAll(".opt")];
  const meta = $("pollMeta");
  if (!opts.length || !meta) return;
  const local = !POLL_URL;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  let mine = store.get("votoColore");

  async function counts() {
    const votes = {};
    if (local) {
      try { Object.assign(votes, JSON.parse(store.get("votiLocali") || "{}")); } catch (e) {}
    } else {
      const r = await fetch(POLL_URL + "/votes.json");
      if (!r.ok) throw new Error("lettura");
      const data = (await r.json()) || {};
      Object.values(data).forEach((v) => { if (v && v.k) votes[v.k] = (votes[v.k] || 0) + 1; });
    }
    return votes;
  }

  function render(votes) {
    const total = opts.reduce((s, o) => s + (votes[o.dataset.k] || 0), 0);
    opts.forEach((o) => {
      const n = votes[o.dataset.k] || 0;
      const p = total ? Math.round((n * 100) / total) : 0;
      o.style.setProperty("--p", p + "%");
      o.querySelector(".pc").textContent = p + "%";
      o.classList.toggle("mine", mine === o.dataset.k);
      o.disabled = !!mine;
    });
    let t = total + (total === 1 ? " voto" : " voti");
    t += mine ? " · grazie per aver votato!" : " · toccate un colore per votare";
    if (local) t += " (prova: risultati visibili solo su questo dispositivo)";
    meta.textContent = t;
  }

  async function refresh() {
    try { render(await counts()); }
    catch (e) { meta.textContent = "Al momento non riusciamo a caricare i voti."; }
  }

  opts.forEach((o) => o.addEventListener("click", async () => {
    if (mine) return;
    const k = o.dataset.k;
    try {
      if (local) {
        const v = await counts(); v[k] = (v[k] || 0) + 1;
        store.set("votiLocali", JSON.stringify(v));
      } else {
        const r = await fetch(POLL_URL + "/votes.json", { method: "POST", body: JSON.stringify({ k, t: Date.now() }) });
        if (!r.ok) throw new Error("scrittura");
      }
      mine = k; store.set("votoColore", k);
      await refresh();
    } catch (e) {
      meta.textContent = "Non siamo riusciti a registrare il voto. Riprovate tra poco.";
    }
  }));

  refresh();
  if (!local) setInterval(refresh, 30000);
})();

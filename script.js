const $ = (id) => document.getElementById(id);

/* ====== DA CONFIGURARE ====== */
// Numero WhatsApp che riceve le conferme (prefisso internazionale, senza + e senza spazi)
const SALVATORE_PHONE = "393924914903";
/* ============================ */

$("openButton")?.addEventListener("click", () => {
  $("details")?.scrollIntoView({ behavior: "smooth" });
});

// Countdown
const weddingDate = new Date("2027-06-19T15:30:00+02:00");
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

// Petali che cadono (pochi, per non distrarre e non consumare batteria)
(function () {
  const box = document.querySelector(".petals");
  if (!box) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = window.innerWidth < 720 ? 12 : 16;
  const fromCss = getComputedStyle(document.documentElement).getPropertyValue("--petals").split(",").map((s) => s.trim()).filter(Boolean);
  const colors = fromCss.length ? fromCss : ["#d8cdbd", "#c9bba6", "#e8dfd0", "#b8aa94", "#efe7da", "#a89a85"];
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

// Musica di sottofondo: parte solo se l'ospite la sceglie (all'ingresso o con il pulsante ♪)
const audio = $("bgm");
const musicBtn = $("musicBtn");
function setMusicState(on) {
  if (!musicBtn) return;
  musicBtn.classList.toggle("on", on);
  musicBtn.classList.remove("hint");
  musicBtn.setAttribute("aria-pressed", String(on));
  musicBtn.setAttribute("aria-label", on ? "Metti in pausa la musica" : "Attiva la musica");
}
function playMusic() {
  if (!audio) return;
  audio.volume = 0.35;
  audio.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
}
musicBtn?.addEventListener("click", () => {
  if (!audio) return;
  if (audio.paused) playMusic();
  else { audio.pause(); setMusicState(false); }
});

// Pulsante "Copia IBAN" (con alternativa per i browser che non permettono la copia diretta)
function copyText(text) {
  const legacy = () =>
    new Promise((resolve, reject) => {
      const t = document.createElement("textarea");
      t.value = text;
      t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(t);
      t.select();
      t.setSelectionRange(0, text.length);
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      t.remove();
      ok ? resolve() : reject();
    });
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(legacy);
  }
  return legacy();
}
document.querySelectorAll(".copy-iban").forEach((btn) => {
  const old = btn.textContent;
  let timer;
  btn.addEventListener("click", () => {
    copyText(btn.dataset.iban)
      .then(() => { btn.textContent = "Copiato!"; })
      .catch(() => { btn.textContent = "Copialo a mano"; })
      .finally(() => {
        clearTimeout(timer);
        timer = setTimeout(() => (btn.textContent = old), 2200);
      });
  });
});

// Apertura: l'ospite sceglie se entrare con o senza musica
(function () {
  const intro = $("intro");
  if (!intro) return;
  const root = document.documentElement;
  if (root.classList.contains("intro-done")) { intro.remove(); return; }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opened = false;
  function finish() {
    root.classList.add("intro-done");
    try { sessionStorage.setItem("introVisto", "1"); } catch (e) {}
    intro.remove();
    window.scrollTo(0, 0);
  }
  function open(withMusic) {
    if (opened) return;
    opened = true;
    if (withMusic) playMusic();
    else musicBtn?.classList.remove("hint");
    if (reduce) { finish(); return; }
    intro.classList.add("open");
    setTimeout(() => intro.classList.add("leave"), 1900);
    setTimeout(finish, 3100);
  }
  $("introMusicBtn")?.addEventListener("click", () => open(true));
  $("introSilentBtn")?.addEventListener("click", () => open(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !opened) open(false); });
  $("introMusicBtn")?.focus({ preventScroll: true });
})();

// Il video parte solo quando si vede e si ferma quando si esce (meno dati e meno batteria)
(function () {
  const v = $("coupleVideo");
  if (!v) return;
  if (!("IntersectionObserver" in window)) { v.play?.().catch(() => {}); return; }
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) v.play?.().catch(() => {});
      else v.pause?.();
    });
  }, { threshold: 0.35 }).observe(v);
})();

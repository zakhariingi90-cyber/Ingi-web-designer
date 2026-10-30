// Menu mobile a scomparsa
const menuToggle = document.querySelector(".nav__toggle");
const drawer = document.getElementById("menu-mobile");
const drawerClose = drawer.querySelector(".drawer__close");

function apriMenu() {
  drawer.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  drawerClose.focus();
}
function chiudiMenu() {
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  menuToggle.focus();
}

menuToggle.addEventListener("click", apriMenu);
drawerClose.addEventListener("click", chiudiMenu);
drawer.querySelector(".drawer__backdrop").addEventListener("click", chiudiMenu);
drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", chiudiMenu));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") chiudiMenu(); });
// Se lo schermo torna largo, il menu si chiude da solo
matchMedia("(min-width: 761px)").addEventListener("change", (e) => { if (e.matches) chiudiMenu(); });

// Hero: laptop e telefono mostrano a turno i progetti realizzati
const PROGETTI = [
  { nome: "M.I. Costruzioni", desktop: "assets/lavori/micostruzioni-desktop.jpg", mobile: "assets/lavori/micostruzioni-mobile.jpg" },
  { nome: "L'arabo è un gioco da ragazzi!", desktop: "assets/lavori/arabo-landing-desktop.jpg", mobile: "assets/lavori/arabo-landing-mobile.jpg" },
];
const mockups = document.querySelector(".mockups");
const shotLaptop = mockups.querySelector(".laptop .shot");
const shotPhone = mockups.querySelector(".shot--phone");
const captionName = mockups.querySelector(".mockups__caption-name");
let progettoCorrente = 0;

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // Precarica le immagini così il cambio è immediato
  PROGETTI.forEach((p) => { new Image().src = p.desktop; new Image().src = p.mobile; });

  setInterval(() => {
    mockups.classList.add("mockups--switching");
    setTimeout(() => {
      progettoCorrente = (progettoCorrente + 1) % PROGETTI.length;
      const p = PROGETTI[progettoCorrente];
      shotLaptop.src = p.desktop;
      shotPhone.src = p.mobile;
      captionName.textContent = p.nome;
      // Fa ripartire lo scorrimento dall'alto
      [shotLaptop, shotPhone].forEach((img) => {
        img.style.animation = "none";
        img.offsetHeight;
        img.style.animation = "";
      });
      mockups.classList.remove("mockups--switching");
    }, 500);
  }, 16000);
}

// Servizi: "Scopri di più" apre una finestra con i dettagli
const modal = document.getElementById("modal-servizio");
let servizioAperto = null;

document.querySelectorAll(".card__more").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    servizioAperto = card.dataset.servizio;
    modal.querySelector(".modal__num").textContent = card.querySelector(".card__num").textContent;
    modal.querySelector("h3").textContent = card.querySelector("h3").textContent;
    const body = modal.querySelector(".modal__body");
    body.replaceChildren(card.querySelector("template").content.cloneNode(true));
    modal.showModal();
    modal.scrollTop = 0;
  });
});

modal.querySelector(".modal__close").addEventListener("click", () => modal.close());
// Chiude cliccando fuori dalla finestra
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

// Dal bottone della finestra: va al modulo con il servizio già selezionato
modal.querySelector(".modal__cta").addEventListener("click", () => {
  const box = document.querySelector(`.chip input[value="${servizioAperto}"]`);
  if (box) box.checked = true;
  modal.close();
});

// Modulo di richiesta: compone il messaggio e lo apre su WhatsApp
const WHATSAPP = "393285834828";

const form = document.getElementById("richiesta");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");
const successLink = document.getElementById("form-success-link");

// Se il visitatore ricomincia a scrivere, il messaggio di conferma sparisce
form.addEventListener("input", () => { successBox.hidden = true; });

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const nome = data.get("nome").trim();
  const idea = data.get("idea").trim();
  const servizi = data.getAll("servizi");

  const errori = [];
  if (!nome) errori.push("il tuo nome");
  if (!servizi.length) errori.push("almeno un servizio");
  if (!idea) errori.push("una breve descrizione del progetto");
  if (errori.length) {
    errorBox.textContent = "Manca ancora: " + errori.join(", ") + ".";
    errorBox.hidden = false;
    successBox.hidden = true;
    return;
  }
  errorBox.hidden = true;

  const righe = [
    "Ciao Ingi! Ti scrivo dal tuo sito.",
    "",
    "*Nome:* " + nome,
  ];
  const attivita = data.get("attivita").trim();
  const link = data.get("link").trim();
  const tempi = data.get("tempi");
  if (attivita) righe.push("*Attività:* " + attivita);
  righe.push("*Mi serve:* " + servizi.join(", "));
  if (link) righe.push("*Sito/social attuale:* " + link);
  if (tempi) righe.push("*Tempistiche:* " + tempi);
  righe.push("", "*Il mio progetto:*", idea);

  const url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(righe.join("\n"));
  window.open(url, "_blank", "noopener");

  // Conferma: svuota il modulo e mostra il messaggio di ringraziamento
  successLink.href = url;
  form.reset();
  successBox.hidden = false;
  successBox.scrollIntoView({ behavior: "smooth", block: "center" });
});

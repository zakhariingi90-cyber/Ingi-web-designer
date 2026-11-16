// Testi che cambiano in base alla lingua della pagina (italiano o inglese in /en/)
const INGLESE = document.documentElement.lang === "en";
const RADICE = INGLESE ? "../" : "";
const T = INGLESE ? {
  arabo: "Learning Arabic made easy",
  manca: "Still missing: ",
  nome: "your name", servizio: "at least one service", idea: "a short description of your project",
  saluto: "Hi Ingi! I'm writing from your website.",
  campoNome: "Name", campoAttivita: "Business", campoServizi: "I need",
  campoLink: "Current website/social", campoTempi: "Timing", campoIdea: "My project",
} : {
  arabo: "L'arabo è un gioco da ragazzi!",
  manca: "Manca ancora: ",
  nome: "il tuo nome", servizio: "almeno un servizio", idea: "una breve descrizione del progetto",
  saluto: "Ciao Ingi! Ti scrivo dal tuo sito.",
  campoNome: "Nome", campoAttivita: "Attività", campoServizi: "Mi serve",
  campoLink: "Sito/social attuale", campoTempi: "Tempistiche", campoIdea: "Il mio progetto",
};

// Animazioni: comparsa degli elementi mentre si scorre la pagina
const MOVIMENTO = !matchMedia("(prefers-reduced-motion: reduce)").matches;

if (MOVIMENTO && "IntersectionObserver" in window) {
  document.documentElement.classList.add("anim");

  const DA_ANIMARE = [
    ".section .eyebrow", ".section h2", ".card", ".work", ".step", ".about__logo", ".about p",
    ".stats", ".faq__intro", ".faq__item", ".contact__intro > p", ".contact__direct a", ".form",
    ".footer__quote", ".footer__col",
  ].join(", ");

  const osservatore = new IntersectionObserver((voci) => {
    voci.forEach((v) => {
      if (!v.isIntersecting) return;
      v.target.classList.add("is-visible");
      osservatore.unobserve(v.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(DA_ANIMARE).forEach((el) => {
    // Gli elementi vicini compaiono uno dopo l'altro (effetto a cascata)
    const fratelli = [...el.parentElement.children].filter((f) => f.matches(DA_ANIMARE));
    el.style.setProperty("--ritardo", Math.min(fratelli.indexOf(el), 5) * 70 + "ms");
    el.classList.add("reveal");
    // Finita la comparsa, tolgo la classe così tornano gli effetti al passaggio del mouse
    el.addEventListener("transitionend", function fine(e) {
      if (e.target !== el || e.propertyName !== "opacity" || !el.classList.contains("is-visible")) return;
      el.classList.remove("reveal", "is-visible");
      el.style.removeProperty("--ritardo");
      el.removeEventListener("transitionend", fine);
    });
    osservatore.observe(el);
  });

  // Numeri di "Chi sono" che contano da zero quando diventano visibili
  const contatore = new IntersectionObserver((voci) => {
    voci.forEach((v) => {
      if (!v.isIntersecting) return;
      contatore.unobserve(v.target);
      const el = v.target;
      const [, numero, suffisso] = el.textContent.match(/(\d+)(.*)/);
      const fine = Number(numero);
      const inizio = performance.now();
      const durata = 1400;
      (function passo(ora) {
        const t = Math.min((ora - inizio) / durata, 1);
        el.textContent = Math.round(fine * (1 - Math.pow(1 - t, 3))) + suffisso;
        if (t < 1) requestAnimationFrame(passo);
      })(inizio);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".stat__num").forEach((el) => contatore.observe(el));
}

if (MOVIMENTO) {
  // Titolo dell'hero: divide il testo in parole che salgono una dopo l'altra
  const titolo = document.querySelector(".hero h1");
  let n = 0;
  const avvolgi = (contenuto) => {
    const parola = document.createElement("span");
    parola.className = "parola";
    const dentro = document.createElement("span");
    dentro.style.setProperty("--ritardo", 250 + n++ * 80 + "ms");
    dentro.append(contenuto);
    parola.append(dentro);
    return parola;
  };
  [...titolo.childNodes].forEach((nodo) => {
    if (nodo.nodeType === Node.TEXT_NODE) {
      const pezzi = nodo.textContent.split(/(\s+)/).filter(Boolean);
      nodo.replaceWith(...pezzi.map((p) => (/^\s+$/.test(p) ? p : avvolgi(p))));
    } else {
      nodo.replaceWith(avvolgi(nodo.cloneNode(true)));
    }
  });

  // Fascia dei servizi: duplica il contenuto così lo scorrimento non si interrompe mai
  const fascia = document.querySelector(".marquee__track");
  if (fascia) fascia.append(...[...fascia.children].map((el) => el.cloneNode(true)));
}

// Header: bordo e ombra quando la pagina non è più in cima, più barra di avanzamento dorata
const header = document.querySelector(".nav");
const barra = document.createElement("div");
barra.className = "progresso";
header.append(barra);
const aggiornaHeader = () => {
  header.classList.toggle("is-scrolled", scrollY > 10);
  const totale = document.documentElement.scrollHeight - innerHeight;
  barra.style.setProperty("--avanzamento", totale > 0 ? (scrollY / totale).toFixed(4) : 0);
};
addEventListener("scroll", aggiornaHeader, { passive: true });
addEventListener("resize", aggiornaHeader);
aggiornaHeader();

// Effetti che seguono il mouse: solo su computer (non su touch) e se il movimento è consentito
if (MOVIMENTO && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.documentElement.classList.add("fx");

  // Mockup dell'hero in 3D: laptop e telefono si inclinano, le etichette si spostano su piani diversi
  const hero = document.querySelector(".hero");
  const scena = document.createElement("div");
  scena.className = "mockups__scena";
  const mock = hero.querySelector(".mockups");
  scena.append(...mock.querySelectorAll(":scope > .hero__emblem-ring, :scope > .laptop, :scope > .phone"));
  mock.prepend(scena);
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mock.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
    mock.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
  });
  hero.addEventListener("pointerleave", () => {
    mock.style.setProperty("--mx", 0);
    mock.style.setProperty("--my", 0);
  });

  // Blocchetti dei servizi: un leggero riflesso di luce che segue il cursore
  document.querySelectorAll(".card").forEach((card) => {
    const luce = document.createElement("span");
    luce.className = "card__luce";
    luce.setAttribute("aria-hidden", "true");
    card.append(luce);
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--px", (e.clientX - r.left) / r.width * 100 + "%");
      card.style.setProperty("--py", (e.clientY - r.top) / r.height * 100 + "%");
    });
  });
}

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
  { nome: T.arabo, desktop: "assets/lavori/arabo-landing-desktop.jpg", mobile: "assets/lavori/arabo-landing-mobile.jpg" },
].map((p) => ({ ...p, desktop: RADICE + p.desktop, mobile: RADICE + p.mobile }));
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
  if (!nome) errori.push(T.nome);
  if (!servizi.length) errori.push(T.servizio);
  if (!idea) errori.push(T.idea);
  if (errori.length) {
    errorBox.textContent = T.manca + errori.join(", ") + ".";
    errorBox.hidden = false;
    successBox.hidden = true;
    return;
  }
  errorBox.hidden = true;

  const righe = [
    T.saluto,
    "",
    `*${T.campoNome}:* ` + nome,
  ];
  const attivita = data.get("attivita").trim();
  const link = data.get("link").trim();
  const tempi = data.get("tempi");
  if (attivita) righe.push(`*${T.campoAttivita}:* ` + attivita);
  righe.push(`*${T.campoServizi}:* ` + servizi.join(", "));
  if (link) righe.push(`*${T.campoLink}:* ` + link);
  if (tempi) righe.push(`*${T.campoTempi}:* ` + tempi);
  righe.push("", `*${T.campoIdea}:*`, idea);

  const url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(righe.join("\n"));
  window.open(url, "_blank", "noopener");

  // Conferma: svuota il modulo e mostra il messaggio di ringraziamento
  successLink.href = url;
  form.reset();
  successBox.hidden = false;
  successBox.scrollIntoView({ behavior: "smooth", block: "center" });
});

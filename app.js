const TRIPS = [
  ["Bonito", "bonito", "bonito.jpg"],
  ["Chapada das Mesas", "chapada-das-mesas", "chapada-das-mesas.jpg"],
  ["Chapada Diamantina", "chapada-diamantina", "chapada-diamantina.jpg"],
  ["Chapada dos Guimarães & Nobres", "chapada-dos-guimaraes-nobres", "chapada-dos-guimaraes-nobres.jpg"],
  ["Chapada dos Veadeiros", "chapada-dos-veadeiros", "chapada-dos-veadeiros.jpg"],
  ["Maragogi & São Miguel dos Milagres", "maragogi-sao-miguel-dos-milagres", "maragogi-sao-miguel-dos-milagres.jpg"],
  ["Patagônia Argentina: El Calafate e Ushuaia", "patagonia-argentina-el-calafate-e-ushuaia", "patagonia-argentina-el-calafate-e-ushuaia.jpg"],
  ["São Miguel do Gostoso", "sao-miguel-do-gostoso", "sao-miguel-do-gostoso.jpg"],
  ["Alter do Chão", "alter-do-chao", "alter-do-chao.jpg"],
  ["Amazônia", "amazonia", "amazonia.jpg"],
  ["Atacama", "atacama", "atacama.jpg"],
  ["Chile: Santiago, Viña del Mar e Valparaíso", "chile-santiago-vina-del-mar-e-valparaiso", "chile-santiago-vina-del-mar-e-valparaiso.jpg"],
  ["Egito", "egito", "egito.jpg"],
  ["Fernando de Noronha", "fernando-de-noronha", "fernando-de-noronha.jpg"],
  ["Grécia", "grecia", "grecia.jpg"],
  ["Jalapão", "jalapao", "jalapao.jpg"],
  ["Jericoacoara", "jericoacoara", "jericoacoara.jpg"],
  ["Lençóis Maranhenses", "lenuois-maranhenses", "lencois-maranhenses.jpg"],
  ["Marrocos", "marrocos", "marrocos.jpg"],
  ["Peru", "peru", "peru.jpg"],
  ["Turquia", "turquia", "turquia.jpg"],
  ["Arraial D'Ajuda", "arraial-dajuda", "arraial-dajuda.jpg"],
  ["Cartagena", "cartagena", "cartagena.jpg"],
  ["Jalapão Carnaval 2027", "jalapao-carnaval-2027", "jalapao-carnaval-2027.jpg"],
  ["Maceió e Maragogi", "maceii-e-maragogi", "maceio-e-maragogi.jpg"],
  ["Tailândia", "tailandia", "tailandia.jpg"],
  ["Tanzânia & Zanzibar", "tanzania-zanzibar", "tanzania-zanzibar.jpg"],
].map(([name, product, file]) => ({
  name,
  product,
  image: `assets/viagens/${file}`,
  url: tripUrl(product),
}));

const START = Date.parse("2026-11-23T00:00:00-03:00");
const END = Date.parse("2026-11-30T00:00:00-03:00");
const SHOP = withUtm("https://womantrip.com.br/shop");
const CONTACT = withUtm("https://womantrip.com.br/contato");

const track = document.querySelector("#viagens-carrossel");
const searchInput = document.querySelector("#busca");
const counter = document.querySelector("#contador");
const prevButton = document.querySelector("#anterior");
const nextButton = document.querySelector("#proxima");
const emptyState = document.querySelector("#vazio");
const dialog = document.querySelector("#lembrete");
const dialogBody = document.querySelector("#lembrete-corpo");
let query = "";
let activeTrip = null;
let reminderTime = "09:00";
let lastFocus = null;

document.querySelectorAll("[data-shop]").forEach((link) => {
  link.href = SHOP;
});
document.querySelectorAll("[data-contact]").forEach((link) => {
  link.href = CONTACT;
});

let renderedPhase = phase();
renderTrips();
tick();
setInterval(tick, 1000);
bindCarousel();
bindDialog();
bindChrome();

function withUtm(href) {
  const url = new URL(href);
  url.searchParams.set("utm_source", "lp");
  url.searchParams.set("utm_medium", "black-week");
  url.searchParams.set("utm_campaign", "black-week-2026");
  return url.toString();
}

function tripUrl(product) {
  return withUtm(`https://womantrip.com.br/product/${product}`);
}

function phase(now = Date.now()) {
  if (now >= END) return "ended";
  if (now >= START) return "active";
  return "before";
}

function visibleTrips() {
  const term = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (!term) return TRIPS;
  return TRIPS.filter((trip) =>
    trip.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(term)
  );
}

function renderTrips() {
  const trips = visibleTrips();
  const state = phase();
  track.innerHTML = trips.map((trip, index) => cardMarkup(trip, index, trips.length, state)).join("");
  emptyState.hidden = trips.length > 0;
  updateCounter();
  track.querySelectorAll("[data-reminder]").forEach((button) => {
    button.addEventListener("click", () => openReminder(button.dataset.reminder));
  });
}

function cardMarkup(trip, index, total, state) {
  const badge = state === "ended"
    ? "EXPLORE O DESTINO"
    : state === "active"
      ? "BLACK WEEK · ATÉ 29/11"
      : "NA BLACK WEEK · 23/11";
  const action = state === "active"
    ? `<a class="trip-reminder" href="${trip.url}" target="_blank" rel="noopener noreferrer">Confira os detalhes e compre pelo site ${arrowIcon()}</a>`
    : state === "before"
      ? `<button class="trip-reminder" type="button" data-reminder="${trip.product}" aria-label="Criar lembrete para ${escapeHtml(trip.name)}">${bellIcon()} Quero um lembrete</button>`
      : "";
  return `<article class="trip-card" aria-label="${escapeHtml(trip.name)}, ${index + 1} de ${total}">
    <a class="trip-image" href="${trip.url}" target="_blank" rel="noopener noreferrer" aria-label="Conhecer ${escapeHtml(trip.name)}">
      <img src="${trip.image}" alt="${escapeHtml(trip.name)}" loading="lazy">
      <span>${badge}</span>
    </a>
    <div class="trip-card-body">
      <h3>${escapeHtml(trip.name)}</h3>
      <a class="trip-details" href="${trip.url}" target="_blank" rel="noopener noreferrer">Conhecer a viagem ${arrowIcon()}</a>
      ${action}
    </div>
  </article>`;
}

function tick() {
  const now = Date.now();
  const state = phase(now);
  if (state !== renderedPhase) {
    renderedPhase = state;
    renderTrips();
  }
  const target = state === "active" ? END : START;
  const remaining = Math.max(0, Math.floor((target - now) / 1000));
  const parts = [
    Math.floor(remaining / 86400),
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ];
  const labels = ["dias", "horas", "minutos", "segundos"];
  const html = parts.map((value, index) => `<div><b>${String(value).padStart(2, "0")}</b><span>${labels[index]}</span></div>`).join("");
  document.querySelectorAll("[data-clock]").forEach((node) => {
    node.innerHTML = state === "ended" ? "" : html;
    node.hidden = state === "ended";
  });

  const label = document.querySelector("#status-campanha");
  label.textContent = state === "ended" ? "CAMPANHA ENCERRADA" : state === "active" ? "TERMINA EM" : "COMEÇA EM";

  const note = document.querySelector("#fase-texto");
  const noteLink = document.querySelector("#fase-link");
  if (state === "before") {
    note.textContent = "A Black Week abre em 23 de novembro. Até lá, escolha a viagem e crie o lembrete. O valor, as datas e as regras de cada roteiro ficam na página da viagem.";
    noteLink.textContent = "Acompanhe no Instagram";
    noteLink.href = "https://www.instagram.com/womantrip/";
  } else if (state === "active") {
    note.textContent = "A oferta está no ar até 29 de novembro. O desconto muda de roteiro para roteiro: confira o total, o que está incluído e as condições na página da viagem antes de comprar.";
    noteLink.textContent = "Ver o catálogo";
    noteLink.href = SHOP;
  } else {
    note.textContent = "A campanha encerrou em 29 de novembro. As viagens continuam no site, nas condições vigentes de cada roteiro.";
    noteLink.textContent = "Ver viagens no site";
    noteLink.href = SHOP;
  }

  const caption = document.querySelector("#contagem-legenda");
  caption.textContent = state === "active" ? "A OFERTA TERMINA EM" : "O ENCONTRO É DAQUI A";
  document.querySelector("#contagem").hidden = state === "ended";
  document.querySelector("#encerrada").hidden = state !== "ended";

  const calendar = document.querySelector("#agenda-geral");
  if (state === "before") {
    calendar.hidden = false;
    calendar.textContent = "Abrir no Google Agenda";
    calendar.href = calendarUrl({ name: "Abertura da Black Week", url: SHOP }, "09:00");
  } else if (state === "active") {
    calendar.hidden = false;
    calendar.textContent = "Confira as ofertas no site";
    calendar.href = SHOP;
  } else {
    calendar.hidden = true;
  }

  const closing = document.querySelector("#cta-final");
  const closingLabel = document.querySelector("#cta-final-rotulo");
  if (state === "active") {
    closingLabel.textContent = "Confira as ofertas no site";
    closing.href = SHOP;
    closing.target = "_blank";
  } else if (state === "ended") {
    closingLabel.textContent = "Ver viagens no site";
    closing.href = SHOP;
    closing.target = "_blank";
  } else {
    closingLabel.textContent = "Quero encontrar minha próxima viagem";
    closing.href = "#campanha";
    closing.removeAttribute("target");
  }
}

function bindCarousel() {
  searchInput.addEventListener("input", () => {
    query = searchInput.value;
    renderTrips();
    track.scrollTo({ left: 0 });
  });
  prevButton.addEventListener("click", () => scrollByCard(-1));
  nextButton.addEventListener("click", () => scrollByCard(1));
  track.addEventListener("scroll", updateCounter, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(event.key === "ArrowRight" ? 1 : -1);
    }
  });
}

function scrollByCard(direction) {
  const card = track.querySelector(".trip-card");
  if (!card) return;
  track.scrollBy({ left: direction * (card.offsetWidth + 22), behavior: "smooth" });
}

function updateCounter() {
  const cards = [...track.querySelectorAll(".trip-card")];
  const total = TRIPS.length;
  const shown = cards.length;
  if (!shown) {
    counter.textContent = "0 viagens";
    prevButton.disabled = true;
    nextButton.disabled = true;
    document.querySelector("#legenda-total").textContent = `0 de ${total} viagens`;
    return;
  }
  const index = cards.reduce((closest, card, cardIndex) => {
    const distance = Math.abs(card.offsetLeft - track.scrollLeft);
    return distance < closest.distance ? { distance, cardIndex } : closest;
  }, { distance: Infinity, cardIndex: 0 }).cardIndex;
  counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(shown).padStart(2, "0")}`;
  prevButton.disabled = index === 0;
  const lastVisible = cards[cards.length - 1].offsetLeft + cards[cards.length - 1].offsetWidth <= track.scrollLeft + track.clientWidth + 8;
  nextButton.disabled = lastVisible;
  document.querySelector("#legenda-total").textContent = query
    ? `${shown} de ${total} viagens`
    : `${total} viagens para descobrir`;
}

function bindDialog() {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeReminder();
  });
  dialog.addEventListener("close", () => lastFocus?.focus());
}

function openReminder(product) {
  activeTrip = TRIPS.find((trip) => trip.product === product);
  reminderTime = "09:00";
  lastFocus = document.activeElement;
  dialogBody.innerHTML = `<button class="dialog-close" type="button" id="fechar-lembrete" aria-label="Fechar lembrete">${closeIcon()}</button>
    <p class="eyebrow">${bellIcon()} AQUELA VIAGEM, NA SUA AGENDA</p>
    <h2 id="lembrete-titulo">Um lembrete.<br>Um passo mais perto.</h2>
    <div class="reminder-trip">
      <img src="${activeTrip.image}" alt="">
      <div>
        <strong>${escapeHtml(activeTrip.name)}</strong>
        <span>${calendarIcon()} 23 de novembro de 2026</span>
      </div>
    </div>
    <label class="reminder-time" for="horario">Que horas você quer ser lembrada?
      <input id="horario" type="time" value="09:00" required>
    </label>
    <p class="reminder-help">Horário de Brasília. É o horário do seu lembrete, não o de abertura das ofertas.</p>
    <a class="button primary google-calendar-link" id="abrir-agenda" href="${calendarUrl(activeTrip, reminderTime)}" target="_blank" rel="noopener noreferrer">Continuar no Google Agenda ${arrowIcon()}</a>
    <p class="reminder-save"><strong>Falta só salvar:</strong> no Google Agenda, clique em “Adicionar notificação”, escolha quando receber o aviso e salve. O lembrete só fica ativo depois de salvar o evento. Ele não reserva vaga e não confirma a compra.</p>`;
  dialog.showModal();
  dialog.querySelector("#fechar-lembrete").addEventListener("click", closeReminder);
  dialog.querySelector("#horario").addEventListener("input", (event) => {
    reminderTime = event.target.value;
    const link = dialog.querySelector("#abrir-agenda");
    const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime);
    if (valid) {
      link.href = calendarUrl(activeTrip, reminderTime);
      link.removeAttribute("aria-disabled");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }
  });
  dialog.querySelector("#horario").focus();
}

function closeReminder() {
  dialog.close();
}

function calendarUrl(trip, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const start = new Date(`2026-11-23T${time}:00-03:00`);
  const finish = new Date(start.getTime() + 15 * 60 * 1000);
  const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const details = `A Black Week Woman Trip começa em 23/11/2026!\n\nMinha viagem: ${trip.name}\nConheça o roteiro e confira a oferta: ${trip.url}\n\nCampanha de 23 a 29/11/2026. Os descontos variam por roteiro. Use WOMANBLACK na hora da compra para participar do brinde, entregue após o pagamento integral do pacote.\n\nEste evento é um lembrete pessoal para consultar a viagem, às ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} (horário de Brasília). Não é o horário de abertura das ofertas nem uma reserva. Adicione uma notificação ao evento antes de salvar.`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Black Week Woman Trip: ${trip.name}`,
    dates: `${stamp(start)}/${stamp(finish)}`,
    ctz: "America/Sao_Paulo",
    details,
    location: trip.url,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function bindChrome() {
  const menuButton = document.querySelector("#menu");
  const nav = document.querySelector("#menu-principal");
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...nav.querySelectorAll("a")];
  const mark = () => {
    const line = Math.min(window.innerHeight * 0.3, 220);
    let current = "inicio";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section.id;
    });
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${current}`;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };
  mark();
  window.addEventListener("scroll", mark, { passive: true });

  const copyButton = document.querySelector("#copiar");
  const feedback = document.querySelector("#cupom-feedback");
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("WOMANBLACK");
      feedback.textContent = "Cupom copiado. Use na compra pelo site, entre 23 e 29 de novembro.";
    } catch {
      feedback.textContent = "Não foi possível copiar. O cupom é WOMANBLACK.";
    }
  });

  document.querySelector("#limpar").addEventListener("click", () => {
    searchInput.value = "";
    query = "";
    renderTrips();
    searchInput.focus();
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function arrowIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;
}
function bellIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 21a2 2 0 0 0 3.4 0"/><path d="M4 17h16l-1.4-1.7C17.4 14 16 12.5 16 8a4 4 0 1 0-8 0c0 4.5-1.4 6-2.6 7.3z"/></svg>`;
}
function calendarIcon() {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 2v3M16 2v3"/><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18"/></svg>`;
}
function closeIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
}

// В стартовом проекте нет готовой логики домашней работы.
// Спроектируйте модель данных и переходы между состояниями самостоятельно.

console.log("Стартовый проект подключен")
const form = document.querySelector(".card-form");
const createButtons = document.querySelectorAll('[data-action="create"]');
const emptyPanel = document.querySelector('[data-state-panel="empty"]');
const editorPanel = document.querySelector('[data-state-panel="editor"]');

const viewerPanel = document.querySelector('[data-state-panel="viewer"]');

const editButton = document.querySelector('[data-action="edit"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const cancelButton = document.querySelector('[data-action="cancel"]');

const cardTitle = document.querySelector(".saved-card__title");
const cardDetails = document.querySelector(".saved-card__details");
const statusText = document.querySelector(".workspace__status");

const typeSelect = form.elements.namedItem("type");
const durationInput = form.elements.namedItem("duration");
const durationError = document.querySelector('[data-error="duration"]');

const collectionList = document.querySelector("[data-collection-list]");
const collectionEmpty = document.querySelector("[data-collection-empty]");
const collectionCreateButton = document.querySelector(".card-collection__create");

const STORAGE_KEY = "workout-cards";
const DRAFT_KEY = "workout-draft";

let cards = [];
let currentCardId = null;

const CALM_TYPES = ["Йога", "Растяжка", "Пилатес"];
const CALM_MAX_DURATION = 60;

function getDurationError() {
  const type = typeSelect.value;
  const raw = durationInput.value;

  if (raw === "") {
    return "Укажите длительность";
  }

  const duration = Number(raw);

  if (Number.isNaN(duration)) {
    return "Длительность должна быть числом";
  }

  if (duration < 1) {
    return "Длительность должна быть не меньше 1 минуты";
  }

  if (duration > 180) {
    return "Длительность не должна превышать 180 минут";
  }

  if (CALM_TYPES.includes(type) && duration > CALM_MAX_DURATION) {
    return `Для «${type}» длительность не должна превышать ${CALM_MAX_DURATION} минут`;
  }

  return "";
}

function updateDurationError() {
  const message = getDurationError();

  durationInput.setCustomValidity(message);

  durationError.textContent = message;
  durationError.hidden = message === "";
  durationInput.classList.toggle("field__control--invalid", message !== "");
}

function clearDurationError() {
  durationInput.setCustomValidity("");
  durationError.textContent = "";
  durationError.hidden = true;
  durationInput.classList.remove("field__control--invalid");
}

function loadCards() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(data)) {
      return [];
    }

      return data.filter(function (card) {
    return card &&
      typeof card.id === "string" &&
      typeof card.title === "string" &&
      typeof card.type === "string";
  });
  } catch {
    return [];
  }
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function saveCard(card) {
  const index = cards.findIndex(function (item) {
    return item.id === card.id;
  });

  if (index === -1) {
    cards.push(card);
  } else {
    cards[index] = card;
  }

  currentCardId = card.id;
  saveCards();
  renderCollection();
}

function renderCollection() {
  collectionList.replaceChildren();
  collectionEmpty.hidden = cards.length > 0;
  collectionCreateButton.hidden = cards.length === 0;

  cards.forEach(function (card) {
    const item = document.createElement("li");
    item.className = "card-collection__item";

    const title = document.createElement("span");
    title.textContent = card.title ?? card.type;

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "button button--secondary";
    openButton.textContent = "Открыть";
    openButton.dataset.action = "open";
    openButton.dataset.cardId = card.id;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "button button--danger";
    removeButton.textContent = "Удалить";
    removeButton.dataset.action = "delete";
    removeButton.dataset.cardId = card.id;

    const actions = document.createElement("div");
    actions.className = "card-collection__actions";
    actions.append(openButton, removeButton);

    item.append(title, actions);
    collectionList.append(item);
  });
}

function showCard(card) {
  currentCardId = card.id;
  cardTitle.textContent = card.title ?? card.type;
  cardDetails.replaceChildren();

  const details = [
    ["Вид тренировки", card.type],
    ["Длительность", `${card.duration} мин`],
    ["Тренер", card.trainer],
    ["Количество участников", card.capacity],
    ["Место проведения", card.location],
    ["Описание", card.description]
  ];

  details.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "saved-card__row";

    const label = document.createElement("dt");
    label.textContent = item[0];

    const value = document.createElement("dd");
    value.textContent = item[1];

    row.append(label, value);
    cardDetails.append(row);
  });

  emptyPanel.hidden = true;
  editorPanel.hidden = true;
  viewerPanel.hidden = false;

  statusText.textContent = "Карточка сохранена";
}

function startNewCard() {
  currentCardId = null;
  form.reset();
  clearDurationError(); 
  sessionStorage.removeItem(DRAFT_KEY);
  emptyPanel.hidden = true;
  viewerPanel.hidden = true;
  editorPanel.hidden = false;
  statusText.textContent = "Новая тренировка";
}

createButtons.forEach(function (button) {
  button.addEventListener("click", startNewCard);
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);

  const card = {
  id: currentCardId ?? crypto.randomUUID(),
   title: formData.get("title"),
  type: formData.get("type"),
  duration: formData.get("duration"),
  trainer: formData.get("trainer"),
  capacity: formData.get("capacity"),
  location: formData.get("location"),
  description: formData.get("description")
};

  saveCard(card);
  sessionStorage.removeItem(DRAFT_KEY);
  showCard(card); 
});

editButton.addEventListener("click", function () {
  const card = cards.find(function (item) {
    return item.id === currentCardId;
  });

  if (!card) {
    return;
  }

  const savedDraft = sessionStorage.getItem(DRAFT_KEY);
  let draft = null;

  if (savedDraft !== null) {
    try {
      draft = JSON.parse(savedDraft);
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }

  const data = draft && draft.cardId === currentCardId
    ? draft
    : card;

    form.elements.namedItem("title").value = data.title ?? "";
  form.elements.namedItem("type").value = data.type ?? "";
  form.elements.namedItem("duration").value = data.duration ?? "";
  form.elements.namedItem("trainer").value = data.trainer ?? "";
  form.elements.namedItem("capacity").value = data.capacity ?? "";
  form.elements.namedItem("location").value = data.location ?? "";
  form.elements.namedItem("description").value = data.description ?? "";

  updateDurationError();
  viewerPanel.hidden = true;
  emptyPanel.hidden = true;
  editorPanel.hidden = false;
});

deleteButton.addEventListener("click", function () {
  cards = cards.filter(function (card) {
    return card.id !== currentCardId;
  });

  saveCards();
  renderCollection();
  sessionStorage.removeItem(DRAFT_KEY);

  if (cards.length > 0) {
    showCard(cards[0]);
  } else {
    currentCardId = null;
    viewerPanel.hidden = true;
    editorPanel.hidden = true;
    emptyPanel.hidden = false;
    statusText.textContent = "Карточка удалена";
  }
});

collectionList.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-card-id]");

  if (!button) {
    return;
  }

  const id = button.dataset.cardId;

  if (button.dataset.action === "delete") {
    cards = cards.filter(function (card) {
      return card.id !== id;
    });
    saveCards();
    renderCollection();

    if (id === currentCardId) {
      currentCardId = null;
      sessionStorage.removeItem(DRAFT_KEY);

      if (cards.length > 0) {
        showCard(cards[0]);
      } else {
        viewerPanel.hidden = true;
        editorPanel.hidden = true;
        emptyPanel.hidden = false;
        statusText.textContent = "Карточка удалена";
      }
    }
    return;
  }

  const card = cards.find(function (item) {
    return item.id === id;
  });

  if (card) {
    showCard(card);
  }
});

cancelButton.addEventListener("click", function () {
  sessionStorage.removeItem(DRAFT_KEY);

  const card = cards.find(function (item) {
    return item.id === currentCardId;
  });

  if (card) {
    showCard(card);
    return;
  }

  if (cards.length > 0) {
    showCard(cards[0]);
    return;
  }

  currentCardId = null;
  editorPanel.hidden = true;
  viewerPanel.hidden = true;
  emptyPanel.hidden = false;
  statusText.textContent = "Карточка не создана";
});

cards = loadCards();
renderCollection();

if (cards.length > 0) {
  showCard(cards[0]);
} else {
  emptyPanel.hidden = false;
  editorPanel.hidden = true;
  viewerPanel.hidden = true;
}

typeSelect.addEventListener("change", updateDurationError);
durationInput.addEventListener("input", updateDurationError);

form.addEventListener("input", function () {
  const formData = new FormData(form);

  const draft = {
    cardId: currentCardId,
    title: formData.get("title"),
    type: formData.get("type"),
    duration: formData.get("duration"),
    trainer: formData.get("trainer"),
    capacity: formData.get("capacity"),
    location: formData.get("location"),
    description: formData.get("description")
  };

  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
});

window.addEventListener("storage", function (event) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  cards = loadCards();
  renderCollection();

  if (!editorPanel.hidden) {
    return;
  }

  if (cards.length === 0) {
    currentCardId = null;
    viewerPanel.hidden = true;
    emptyPanel.hidden = false;
    statusText.textContent = "Карточка удалена в другой вкладке";
    return;
  }

  const stillExists = cards.find(function (card) {
    return card.id === currentCardId;
  });

  showCard(stillExists ?? cards[0]);
  statusText.textContent = "Данные обновлены из другой вкладки";
});
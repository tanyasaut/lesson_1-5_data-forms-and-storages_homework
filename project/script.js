// В стартовом проекте нет готовой логики домашней работы.
// Спроектируйте модель данных и переходы между состояниями самостоятельно.

console.log("Стартовый проект подключен")
const form = document.querySelector(".card-form");
const createButton = document.querySelector('[data-action="create"]');
const emptyPanel = document.querySelector('[data-state-panel="empty"]');
const editorPanel = document.querySelector('[data-state-panel="editor"]');

const viewerPanel = document.querySelector('[data-state-panel="viewer"]');

const editButton = document.querySelector('[data-action="edit"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const cancelButton = document.querySelector('[data-action="cancel"]');

const cardTitle = document.querySelector(".saved-card__title");
const cardDetails = document.querySelector(".saved-card__details");
const statusText = document.querySelector(".workspace__status");

const STORAGE_KEY = "workout-card";

function saveCard(card) {
  const json = JSON.stringify(card);
  localStorage.setItem(STORAGE_KEY, json);
}

function showCard(card) {
  cardTitle.textContent = card.type;
  cardDetails.replaceChildren();

  const details = [
    ["Длительность", `${card.duration} минут`],
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

createButton.addEventListener("click", function () {
  form.reset();

  emptyPanel.hidden = true;
  viewerPanel.hidden = true;
  editorPanel.hidden = false;
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);

  const card = {
    type: formData.get("type"),
    duration: formData.get("duration"),
    trainer: formData.get("trainer"),
    capacity: formData.get("capacity"),
    location: formData.get("location"),
    description: formData.get("description")
  };

  saveCard(card);
  showCard(card);
});

editButton.addEventListener("click", function () {
  const savedCard = localStorage.getItem(STORAGE_KEY);

  if (savedCard === null) {
    return;
  }

  const card = JSON.parse(savedCard);

  form.elements["type"].value = card.type;
  form.elements["duration"].value = card.duration;
  form.elements["trainer"].value = card.trainer;
  form.elements["capacity"].value = card.capacity;
  form.elements["location"].value = card.location;
  form.elements["description"].value = card.description;

  viewerPanel.hidden = true;
  emptyPanel.hidden = true;
  editorPanel.hidden = false;
});

deleteButton.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);

  viewerPanel.hidden = true;
  editorPanel.hidden = true;
  emptyPanel.hidden = false;

  statusText.textContent = "Карточка удалена";
});

cancelButton.addEventListener("click", function () {
  const savedCard = localStorage.getItem(STORAGE_KEY);

  if (savedCard !== null) {
    showCard(JSON.parse(savedCard));
  } else {
    editorPanel.hidden = true;
    viewerPanel.hidden = true;
    emptyPanel.hidden = false;
  }
});

const savedCard = localStorage.getItem(STORAGE_KEY);

if (savedCard !== null) {
  showCard(JSON.parse(savedCard));
} else {
  emptyPanel.hidden = false;
  editorPanel.hidden = true;
  viewerPanel.hidden = true;
}
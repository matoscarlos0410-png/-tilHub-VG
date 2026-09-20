const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const TOOLS = [

  ["calc","🧮","Calculadora",
   "Cálculos seguros con + − × ÷ y paréntesis.","cálculo"],

  ["percent","％","Porcentajes",
   "Calcula porcentajes rápidamente.","cálculo"],

  ["discount","🏷️","Descuento",
   "Precio final y ahorro.","cálculo"],

  ["rule3","📐","Regla de 3",
   "Resuelve proporciones directas.","cálculo"],

  ["length","📏","Longitud",
   "Convierte mm, cm, m y km.","conversiones"],

  ["weight","⚖️","Peso",
   "Convierte g, kg, lb y oz.","conversiones"],

  ["temp","🌡️","Temperatura",
   "Celsius, Fahrenheit y Kelvin.","conversiones"],

  ["volume","🧪","Volumen",
   "Convierte ml, l y m³.","conversiones"],

  ["timeconv","⏳","Tiempo",
   "Convierte segundos, minutos y horas.","conversiones"],

  ["currency","💱","Moneda",
   "Convierte con tasas guardadas.","conversiones"],

  ["dates","📅","Fechas",
   "Calcula diferencias entre fechas.","tiempo"],

  ["age","🎂","Edad",
   "Calcula edad desde una fecha.","tiempo"],

  ["timer","⏱️","Temporizador",
   "Cuenta atrás precisa.","tiempo"],

  ["stopwatch","⏲️","Cronómetro",
   "Cronómetro preciso.","tiempo"],

  ["notes","📝","Notas",
   "Guarda notas en este navegador.","organización"],

  ["tasks","✅","Tareas",
   "Lista de tareas persistente.","organización"],

  ["shoppinglist","🛒","Lista de compras",
   "Productos y cantidades.","organización"],

  ["study","📚","Organizador de estudio",
   "Planifica sesiones y temas.","estudio"],

  ["password","🔐","Contraseña",
   "Genera contraseñas aleatorias.","seguridad"],

  ["random","🎲","Aleatorio",
   "Número aleatorio y dado.","diversión"],

  ["qr","▦","Código QR",
   "Crea un QR desde texto o enlace.","utilidades"],

  ["text","🔤","Texto",
   "Cuenta palabras y caracteres.","texto"],

  ["case","Aa","Mayúsculas / minúsculas",
   "Transforma texto.","texto"],

  ["dictionary","📖","Diccionario",
   "Busca definiciones con conexión.","estudio"],

  ["tip","💡","Consejo",
   "Muestra un consejo práctico.","utilidades"]

];

const STORAGE_KEY = "utilhub_v12";

let state =
  JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
  ||
  {
    favorites: [],
    recent: [],
    notes: "",
    tasks: [],
    shopping: [],
    study: [],

    settings: {
      theme: "dark",
      animations: true,
      cursor: true
    },

    currency: null
  };

function save() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

  updateStats();
}

function escapeHTML(value) {

  return String(value).replace(
    /[&<>"']/g,

    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}

/* =========================
   MODAL
========================= */

function openModal(title, html) {

  $("#modalTitle").textContent = title;

  $("#modalBody").innerHTML = html;

  $("#modal").hidden = false;
}

function closeModal() {

  $("#modal").hidden = true;
}

$("#modalClose").onclick = closeModal;

$("#modal").addEventListener(
  "click",
  event => {

    if (event.target.id === "modal") {
      closeModal();
    }

  }
);

/* =========================
   FAVORITOS / RECIENTES
========================= */

function addRecent(id) {

  state.recent =
    [
      id,
      ...state.recent.filter(item => item !== id)
    ].slice(0, 12);

  save();
}

function isFavorite(id) {

  return state.favorites.includes(id);
}

function toggleFavorite(id) {

  if (isFavorite(id)) {

    state.favorites =
      state.favorites.filter(item => item !== id);

  } else {

    state.favorites.push(id);

  }

  save();

  renderTools();
}

function updateStats() {

  $("#toolCount").textContent =
    TOOLS.length;

  $("#favoriteCount").textContent =
    state.favorites.length;

  $("#recentCount").textContent =
    state.recent.length;

  $("#networkState").textContent =
    navigator.onLine ? "●" : "○";
}

/* =========================
   CATEGORÍAS
========================= */

const categories = [
  "todo",
  "cálculo",
  "conversiones",
  "tiempo",
  "organización",
  "estudio",
  "seguridad",
  "diversión",
  "utilidades",
  "texto"
];

let activeCategory = "todo";

function renderFilters() {

  $("#filters").innerHTML =
    categories
      .map(category => `

        <button
          class="filter ${
            category === activeCategory
              ? "active"
              : ""
          }"
          data-category="${category}"
        >
          ${
            category.charAt(0).toUpperCase()
            +
            category.slice(1)
          }
        </button>

      `)
      .join("");

  $$(".filter").forEach(button => {

    button.onclick = () => {

      activeCategory =
        button.dataset.category;

      renderFilters();
      renderTools();

    };

  });

}

/* =========================
   HERRAMIENTAS
========================= */

function renderTools() {

  const query =
    ($("#globalSearch").value || "")
      .toLowerCase()
      .trim();

  let tools =
    TOOLS.filter(tool => {

      const categoryOK =
        activeCategory === "todo"
        ||
        tool[4] === activeCategory;

      const searchOK =
        !query
        ||
        `${tool[2]} ${tool[3]} ${tool[4]}`
          .toLowerCase()
          .includes(query);

      return categoryOK && searchOK;

    });

  $("#toolGrid").innerHTML =
    tools.map(tool => `

      <article
        class="tool-card"
        id="tool-${tool[0]}"
      >

        <button
          class="fav ${
            isFavorite(tool[0])
              ? "active"
              : ""
          }"
          data-favorite="${tool[0]}"
          title="Favorito"
        >
          ${
            isFavorite(tool[0])
              ? "★"
              : "☆"
          }
        </button>

        <div>

          <div class="tool-icon">
            ${tool[1]}
          </div>

          <h3>
            ${escapeHTML(tool[2])}
          </h3>

          <p>
            ${escapeHTML(tool[3])}
          </p>

        </div>

        <button
          class="btn ghost tool-open"
          data-open="${tool[0]}"
        >
          Abrir
        </button>

      </article>

    `).join("");

  $$("[data-favorite]").forEach(button => {

    button.onclick = () => {

      toggleFavorite(
        button.dataset.favorite
      );

    };

  });

  $$("[data-open]").forEach(button => {

    button.onclick = () => {

      openTool(
        button.dataset.open
      );

    };

  });

  updateStats();
}

/* =========================
   ABRIR HERRAMIENTA
========================= */

function openTool(id) {

  addRecent(id);

  const tool =
    TOOLS.find(item => item[0] === id);

  if (!tool) return;

  openModal(
    `${tool[1]} ${tool[2]}`,
    toolBody(id)
  );

  bindTool(id);
}

/* =========================
   CONTENIDO DE HERRAMIENTAS
========================= */

function toolBody(id) {

  switch (id) {

    case "calc":

      return `

        <form class="tool-form" id="toolForm">

          <input
            id="calcInput"
            placeholder="Ej.: (25+5)*2-10/2"
          >

          <button class="btn primary">
            Calcular
          </button>

          <div
            id="result"
            class="result"
          >
            Resultado: —
          </div>

        </form>

      `;

    case "percent":

      return `

        <form class="tool-form" id="toolForm">

          <div class="row">

            <input
              id="percentValue"
              type="number"
              placeholder="Porcentaje"
            >

            <input
              id="percentBase"
              type="number"
              placeholder="Cantidad"
            >

          </div>

          <button class="btn primary">
            Calcular
          </button>

          <div
            id="result"
            class="result"
          >
            Resultado: —
          </div>

        </form>

      `;

    case "discount":

      return `

        <form class="tool-form" id="toolForm">

          <div class="row">

            <input
              id="price"
              type="number"
              placeholder="Precio"
            >

            <input
              id="discount"
              type="number"
              placeholder="Descuento %"
            >

          </div>

          <button class="btn primary">
            Calcular
          </button>

          <div
            id="result"
            class="result"
          >
            Resultado: —
          </div>

        </form>

      `;

    case "rule3":

      return `

        <form class="tool-form" id="toolForm">

          <div class="row">

            <input id="rA" type="number" placeholder="A">
            <input id="rB" type="number" placeholder="B">

          </div>

          <input id="rC" type="number" placeholder="C">

          <button class="btn primary">
            Resolver
          </button>

          <div
            id="result"
            class="result"
          >
            D = B × C ÷ A
          </div>

        </form>

      `;

    case "length":

      return converter(
        ["mm","cm","m","km"],
        {
          mm: 0.001,
          cm: 0.01,
          m: 1,
          km: 1000
        }
      );

    case "weight":

      return converter(
        ["g","kg","lb","oz"],
        {
          g: 0.001,
          kg: 1,
          lb: 0.45359237,
          oz: 0.028349523125
        }
      );

    case "volume":

      return converter(
        ["ml","l","m³"],
        {
          ml: 0.001,
          l: 1,
          "m³": 1000
        }
      );

    case "timeconv":

      return converter(
        ["s","min","h","d"],
        {
          s: 1,
          min: 60,
          h: 3600,
          d: 86400
        }
      );

    case "temp":

      return `

        <form
          class="tool-form"
          id="toolForm"
        >

          <div class="row">

            <input
              id="temperature"
              type="number"
              placeholder="Valor"
            >

            <select id="tempFrom">

              <option value="C">Celsius</option>
              <option value="F">Fahrenheit</option>
              <option value="K">Kelvin</option>

            </select>

          </div>

          <select id="tempTo">

            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
            <option value="K">Kelvin</option>

          </select>

          <button class="btn primary">
            Convertir
          </button>

          <div
            id="result"
            class="result"
          >
            Resultado: —
          </div>

        </form>

      `;

    case "dates":

      return `

        <form
          class="tool-form"
          id="toolForm"
        >

          <div class="row">

            <input id="date1" type="date">
            <input id="date2" type="date">

          </div>

          <button class="btn primary">
            Calcular diferencia
          </button>

          <div
            id="result"
            class="result"
          >
            Resultado: —
          </div>

        </form>

      `;

    case "age":

      return `

        <form
          class="tool-form"
          id="toolForm"
        >

          <input
            id="birthDate"
            type="date"
          >

          <button class="btn primary">
            Calcular edad
          </button>

          <div
            id="result"
            class="result"
          >
            Resultado: —
          </div>

        </form>

      `;

    case "timer":

      return `

        <div class="tool-form">

          <div class="row">

            <input
              id="timerMinutes"
              type="number"
              min="0"
              placeholder="Minutos"
            >

            <input
              id="timerSeconds"
              type="number"
              min="0"
              placeholder="Segundos"
            >

          </div>

          <div
            id="timerDisplay"
            class="result"
          >
            00:00
          </div>

          <div class="row">

            <button
              class="btn primary"
              id="timerStart"
            >
              Iniciar
            </button>

            <button
              class="btn ghost"
              id="timerStop"
            >
              Detener
            </button>

          </div>

        </div>

      `;

    case "stopwatch":

      return `

        <div class="tool-form">

          <div
            id="stopwatchDisplay"
            class="result"
          >
            00:00.00
          </div>

          <div class="row">

            <button
              class="btn primary"
              id="stopwatchStart"
            >
              Iniciar
            </button>

            <button
              class="btn ghost"
              id="stopwatchStop"
            >
              Detener
            </button>

          </div>

          <button
            class="btn ghost"
            id="stopwatchReset"
          >
            Reiniciar
          </button>

        </div>

      `;

    case "notes":

      return `

        <div class="tool-form">

          <textarea
            id="notesText"
            placeholder="Escribe aquí tus notas..."
          >${escapeHTML(state.notes)}</textarea>

          <button
            class="btn primary"
            id="saveNotes"
          >
            Guardar nota
          </button>

          <span
            id="noteMessage"
            class="small"
          ></span>

        </div>

      `;

    case "tasks":

      return listTemplate(
        "tasks",
        "Nueva tarea",
        "Añadir tarea"
      );

    case "shoppinglist":

      return listTemplate(
        "shopping",
        "Nuevo producto",
        "Añadir producto"
      );

    case "study":

      return `

        <form
          class="tool-form"
          id="studyForm"
        >

          <input
            id="studyName"
            placeholder="Tema o asignatura"
          >

          <div class="row">

            <input
              id="studyDate"
              type="date"
            >

            <input
              id="studyMinutes"
              type="number"
              min="1"
              placeholder="Minutos"
            >

          </div>

          <button class="btn primary">
            Agregar sesión
          </button>

        </form>

        <div
          id="studyList"
          class="list"
        ></div>

      `;

    case "password":

      return `

        <div class="tool-form">

          <div class="row">

            <input
              id="passwordLength"
              type="number"
              min="6"
              max="128"
              value="16"
            >

            <select id="passwordType">

              <option value="strong">
                Fuerte
              </option>

              <option value="simple">
                Letras y números
              </option>

            </select>

          </div>

          <button
            class="btn primary"
            id="passwordButton"
          >
            Generar
          </button>

          <div
            id="result"
            class="result"
          >
            —
          </div>

        </div>

      `;

    case "random":

      return `

        <div class="tool-form">

          <div class="row">

            <input
              id="randomMin"
              type="number"
              value="1"
            >

            <input
              id="randomMax"
              type="number"
              value="100"
            >

          </div>

          <div class="row">

            <button
              class="btn primary"
              id="randomButton"
            >
              Número
            </button>

            <button
              class="btn ghost"
              id="diceButton"
            >
              🎲 Dado
            </button>

          </div>

          <div
            id="result"
            class="result"
          >
            —
          </div>

        </div>

      `;

    case "qr":

      return `

        <div class="tool-form">

          <input
            id="qrText"
            placeholder="Texto o enlace"
          >

          <button
            class="btn primary"
            id="qrButton"
          >
            Crear QR
          </button>

          <div
            id="qrResult"
            class="result"
          >
            Introduce un texto o enlace.
          </div>

        </div>

      `;

    case "text":

      return `

        <div class="tool-form">

          <textarea
            id="textInput"
            placeholder="Escribe o pega un texto..."
          ></textarea>

          <button
            class="btn primary"
            id="textAnalyze"
          >
            Analizar
          </button>

          <div
            id="result"
            class="result"
          >
            —
          </div>

        </div>

      `;

    case "case":

      return `

        <div class="tool-form">

          <textarea
            id="caseInput"
            placeholder="Escribe un texto..."
          ></textarea>

          <div class="row">

            <button
              class="btn primary"
              id="upperCase"
            >
              MAYÚSCULAS
            </button>

            <button
              class="btn ghost"
              id="lowerCase"
            >
              minúsculas
            </button>

          </div>

          <button
            class="btn ghost"
            id="titleCase"
          >
            Tipo título
          </button>

        </div>

      `;

    case "dictionary":

      return `

        <form
          class="tool-form"
          id="toolForm"
        >

          <input
            id="dictionaryWord"
            placeholder="Ej.: útil"
          >

          <button class="btn primary">
            Buscar definición
          </button>

          <div
            id="result"
            class="result"
          >
            Necesita conexión.
          </div>

        </form>

      `;

    case "tip":

      return `

        <div class="tool-form">

          <div
            class="result"
            id="tipResult"
          ></div>

          <button
            class="btn primary"
            id="newTip"
          >
            Otro consejo
          </button>

        </div>

      `;

    case "currency":

      return `

        <div class="tool-form">

          <p class="small">
            Las tasas se actualizan cuando hay conexión
            y se conserva la última tasa disponible.
          </p>

          <div class="row">

            <input
              id="currencyAmount"
              type="number"
              placeholder="Cantidad"
            >

            <select id="currencyFrom">

              <option>USD</option>
              <option>EUR</option>
              <option>PEN</option>
              <option>GBP</option>
              <option>JPY</option>
              <option>BRL</option>
              <option>MXN</option>

            </select>

          </div>

          <select id="currencyTo">

            <option>PEN</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>JPY</option>
            <option>BRL</option>
            <option>MXN</option>

          </select>

          <button
            class="btn primary"
            id="currencyButton"
          >
            Convertir
          </button>

          <div
            id="result"
            class="result"
          >
            —
          </div>

        </div>

      `;

  }

}

/* =========================
   CONVERSORES
========================= */

function converter(units, factors) {

  return `

    <form
      class="tool-form"
      id="toolForm"
    >

      <div class="row">

        <input
          id="convertValue"
          type="number"
          placeholder="Valor"
        >

        <select id="convertFrom">

          ${
            units
              .map(unit =>
                `<option>${unit}</option>`
              )
              .join("")
          }

        </select>

      </div>

      <select id="convertTo">

        ${
          units
            .map(unit =>
              `<option>${unit}</option>`
            )
            .join("")
        }

      </select>

      <button class="btn primary">
        Convertir
      </button>

      <div
        id="result"
        class="result"
      >
        Resultado: —
      </div>

    </form>

  `;
}

/* =========================
   LISTAS
========================= */

function listTemplate(
  type,
  placeholder,
  buttonText
) {

  const list = state[type] || [];

  return `

    <form
      class="tool-form"
      id="listForm"
    >

      <input
        id="listInput"
        placeholder="${placeholder}"
      >

      <button class="btn primary">
        ${buttonText}
      </button>

    </form>

    <div
      id="listOutput"
      class="list"
    >

      ${
        list.length

        ?

        list.map((item,index) => `

          <div class="list-item">

            <input
              type="checkbox"
              data-check="${type}:${index}"
              ${item.done ? "checked" : ""}
            >

            <span>
              ${escapeHTML(item.text)}
            </span>

            <button
              class="btn ghost"
              data-delete="${type}:${index}"
            >
              ×
            </button>

          </div>

        `).join("")

        :

        `<span class="small">
          Aún no hay elementos.
        </span>`

      }

    </div>

  `;
}

/* =========================
   CALCULADORA SEGURA
========================= */

function safeCalculator(expression) {

  const clean =
    expression.replace(/\s+/g,"");

  const tokens =
    clean.match(
      /(?:\d+(?:\.\d+)?)|[()+\-*/]/g
    );

  if (
    !tokens ||
    tokens.join("") !== clean
  ) {
    throw new Error(
      "Expresión inválida"
    );
  }

  let index = 0;

  function factor() {

    if (tokens[index] === "(") {

      index++;

      const value = addition();

      if (tokens[index++] !== ")") {
        throw new Error(
          "Paréntesis incorrecto"
        );
      }

      return value;
    }

    if (tokens[index] === "-") {

      index++;

      return -factor();
    }

    const number =
      Number(tokens[index++]);

    if (!Number.isFinite(number)) {
      throw new Error(
        "Número inválido"
      );
    }

    return number;
  }

  function multiplication() {

    let value = factor();

    while (
      tokens[index] === "*" ||
      tokens[index] === "/"
    ) {

      const operator =
        tokens[index++];

      const next = factor();

      if (
        operator === "/" &&
        next === 0
      ) {
        throw new Error(
          "No se puede dividir entre cero"
        );
      }

      value =
        operator === "*"
          ? value * next
          : value / next;
    }

    return value;
  }

  function addition() {

    let value =
      multiplication();

    while (
      tokens[index] === "+" ||
      tokens[index] === "-"
    ) {

      const operator =
        tokens[index++];

      const next =
        multiplication();

      value =
        operator === "+"
          ? value + next
          : value - next;
    }

    return value;
  }

  const result = addition();

  if (
    index !== tokens.length ||
    !Number.isFinite(result)
  ) {
    throw new Error(
      "Expresión inválida"
    );
  }

  return result;
}

/* =========================
   VINCULAR HERRAMIENTAS
========================= */

function bindTool(id) {

  const form = $("#toolForm");

  if (form) {

    form.onsubmit = event => {

      event.preventDefault();

      const result =
        $("#result");

      try {

        if (id === "calc") {

          result.textContent =
            "Resultado: " +
            safeCalculator(
              $("#calcInput").value
            );

        }

        if (id === "percent") {

          const percentage =
            Number(
              $("#percentValue").value
            );

          const base =
            Number(
              $("#percentBase").value
            );

          result.textContent =
            "Resultado: " +
            (
              percentage * base / 100
            ).toLocaleString("es-PE");

        }

        if (id === "discount") {

          const price =
            Number($("#price").value);

          const discount =
            Number($("#discount").value);

          const saving =
            price * discount / 100;

          const finalPrice =
            price - saving;

          result.textContent =
            `Precio final: ${finalPrice.toFixed(2)}
             · Ahorras: ${saving.toFixed(2)}`;

        }

        if (id === "rule3") {

          const A =
            Number($("#rA").value);

          const B =
            Number($("#rB").value);

          const C =
            Number($("#rC").value);

          result.textContent =
            `D = ${(B * C / A).toFixed(4)}`;

        }

        if (
          ["length",
           "weight",
           "volume",
           "timeconv"].includes(id)
        ) {

          const maps = {

            length: {
              mm:.001,
              cm:.01,
              m:1,
              km:1000
            },

            weight: {
              g:.001,
              kg:1,
              lb:.45359237,
              oz:.028349523125
            },

            volume: {
              ml:.001,
              l:1,
              "m³":1000
            },

            timeconv: {
              s:1,
              min:60,
              h:3600,
              d:86400
            }

          };

          const value =
            Number(
              $("#convertValue").value
            );

          const from =
            $("#convertFrom").value;

          const to =
            $("#convertTo").value;

          const base =
            value * maps[id][from];

          const converted =
            base / maps[id][to];

          result.textContent =
            "Resultado: " +
            converted;

        }

        if (id === "temp") {

          const value =
            Number(
              $("#temperature").value
            );

          const from =
            $("#tempFrom").value;

          const to =
            $("#tempTo").value;

          let celsius;

          if (from === "C") {
            celsius = value;
          }

          if (from === "F") {
            celsius =
              (value - 32) * 5 / 9;
          }

          if (from === "K") {
            celsius =
              value - 273.15;
          }

          let finalValue;

          if (to === "C") {
            finalValue = celsius;
          }

          if (to === "F") {
            finalValue =
              celsius * 9 / 5 + 32;
          }

          if (to === "K") {
            finalValue =
              celsius + 273.15;
          }

          result.textContent =
            `Resultado: ${finalValue.toFixed(3)} °${to}`;

        }

        if (id === "dates") {

          const first =
            new Date(
              $("#date1").value
            );

          const second =
            new Date(
              $("#date2").value
            );

          const days =
            Math.abs(
              Math.round(
                (second - first) /
                86400000
              )
            );

          result.textContent =
            `Diferencia: ${days} días`;

        }

        if (id === "age") {

          const birth =
            new Date(
              $("#birthDate").value
            );

          const today =
            new Date();

          let age =
            today.getFullYear()
            -
            birth.getFullYear();

          const birthday =
            new Date(
              today.getFullYear(),
              birth.getMonth(),
              birth.getDate()
            );

          if (birthday > today) {
            age--;
          }

          result.textContent =
            `Edad: ${age} años`;

        }

        if (id === "dictionary") {

          dictionarySearch(
            $("#dictionaryWord").value,
            result
          );

        }

      } catch {

        result.textContent =
          "Revisa los datos introducidos.";

      }

    };

  }

  if (id === "notes") {

    $("#saveNotes").onclick = () => {

      state.notes =
        $("#notesText").value;

      save();

      $("#noteMessage").textContent =
        "Guardado ✓";

    };

  }

  if (
    id === "tasks" ||
    id === "shoppinglist"
  ) {

    const type =
      id === "tasks"
        ? "tasks"
        : "shopping";

    $("#listForm").onsubmit =
      event => {

        event.preventDefault();

        const text =
          $("#listInput")
            .value
            .trim();

        if (!text) return;

        state[type].push({
          text,
          done: false
        });

        save();

        openTool(id);

      };

    $$(
      `[data-check^="${type}:"]`
    ).forEach(input => {

      input.onchange = () => {

        const index =
          Number(
            input.dataset.check
              .split(":")[1]
          );

        state[type][index].done =
          input.checked;

        save();

      };

    });

    $$(
      `[data-delete^="${type}:"]`
    ).forEach(button => {

      button.onclick = () => {

        const index =
          Number(
            button.dataset.delete
              .split(":")[1]
          );

        state[type].splice(
          index,
          1
        );

        save();

        openTool(id);

      };

    });

  }

  if (id === "study") {

    renderStudy();

    $("#studyForm").onsubmit =
      event => {

        event.preventDefault();

        state.study.push({

          text:
            $("#studyName").value,

          date:
            $("#studyDate").value,

          minutes:
            Number(
              $("#studyMinutes").value
            ) || 0

        });

        save();

        openTool(id);

      };

  }

  if (id === "password") {

    $("#passwordButton").onclick =
      () => {

        let characters;

        if (
          $("#passwordType").value ===
          "strong"
        ) {

          characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ" +
            "abcdefghijkmnopqrstuvwxyz" +
            "23456789!@#$%&*?";

        } else {

          characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ" +
            "abcdefghijkmnopqrstuvwxyz" +
            "23456789";

        }

        const length =
          Math.min(
            128,
            Math.max(
              6,
              Number(
                $("#passwordLength").value
              ) || 16
            )
          );

        const random =
          new Uint32Array(length);

        crypto.getRandomValues(random);

        const password =
          Array.from(
            random,
            number =>
              characters[
                number %
                characters.length
              ]
          ).join("");

        $("#result").textContent =
          password;

      };

  }

  if (id === "random") {

    $("#randomButton").onclick =
      () => {

        let min =
          Number(
            $("#randomMin").value
          );

        let max =
          Number(
            $("#randomMax").value
          );

        if (min > max) {
          [min,max] =
            [max,min];
        }

        const number =
          Math.floor(
            Math.random() *
            (max - min + 1)
          ) + min;

        $("#result").textContent =
          number;

      };

    $("#diceButton").onclick =
      () => {

        $("#result").textContent =
          Math.floor(
            Math.random() * 6
          ) + 1;

      };

  }

  if (id === "qr") {

    $("#qrButton").onclick =
      () => {

        const text =
          $("#qrText")
            .value
            .trim();

        if (!text) return;

        $("#qrResult").innerHTML = `

          <img
            alt="Código QR"
            width="220"
            height="220"
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}"
          >

          <div class="small">
            El servicio QR necesita Internet.
          </div>

        `;

      };

  }

  if (id === "text") {

    $("#textAnalyze").onclick =
      () => {

        const text =
          $("#textInput").value;

        const withoutSpaces =
          text.replace(/\s/g,"");

        const words =
          text.trim()
            ? text.trim().split(/\s+/).length
            : 0;

        const lines =
          text
            ? text.split(/\n/).length
            : 0;

        $("#result").innerHTML = `

          Caracteres: ${text.length}<br>
          Sin espacios: ${withoutSpaces.length}<br>
          Palabras: ${words}<br>
          Líneas: ${lines}

        `;

      };

  }

  if (id === "case") {

    const textarea =
      $("#caseInput");

    $("#upperCase").onclick =
      () => {

        textarea.value =
          textarea.value.toUpperCase();

      };

    $("#lowerCase").onclick =
      () => {

        textarea.value =
          textarea.value.toLowerCase();

      };

    $("#titleCase").onclick =
      () => {

        textarea.value =
          textarea.value
            .toLowerCase()
            .replace(
              /\b\w/g,
              letter =>
                letter.toUpperCase()
            );

      };

  }

  if (id === "tip") {

    const tips = [

      "Organiza tus tareas por prioridad.",

      "Guarda una copia de seguridad de tus datos importantes.",

      "Usa favoritos para acceder rápidamente a tus herramientas.",

      "Reduce las animaciones si tu dispositivo va lento.",

      "Divide una tarea grande en pasos pequeños.",

      "Revisa tus pendientes antes de comenzar el día."

    ];

    function showTip() {

      $("#tipResult").textContent =
        tips[
          Math.floor(
            Math.random() * tips.length
          )
        ];

    }

    showTip();

    $("#newTip").onclick =
      showTip;

  }

  if (id === "timer") {

    setupTimer();

  }

  if (id === "stopwatch") {

    setupStopwatch();

  }

  if (id === "currency") {

    $("#currencyButton").onclick =
      convertCurrency;

  }

}

/* =========================
   TEMPORIZADOR
========================= */

function setupTimer() {

  let endTime = 0;

  let animationFrame = null;

  function update() {

    const remaining =
      Math.max(
        0,
        endTime - Date.now()
      );

    const totalSeconds =
      Math.ceil(
        remaining / 1000
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    $("#timerDisplay").textContent =
      `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

    if (remaining > 0) {

      animationFrame =
        requestAnimationFrame(update);

    } else {

      cancelAnimationFrame(
        animationFrame
      );

      alert(
        "Temporizador terminado."
      );

    }

  }

  $("#timerStart").onclick =
    () => {

      const total =
        (
          Number(
            $("#timerMinutes").value
          ) * 60
          +
          Number(
            $("#timerSeconds").value
          )
        ) * 1000;

      if (total <= 0) return;

      endTime =
        Date.now() + total;

      update();

    };

  $("#timerStop").onclick =
    () => {

      cancelAnimationFrame(
        animationFrame
      );

    };

}

/* =========================
   CRONÓMETRO
========================= */

function setupStopwatch() {

  let startTime = 0;

  let elapsed = 0;

  let running = false;

  let animationFrame = null;

  function update() {

    const elapsedNow =
      running
        ? Date.now() - startTime + elapsed
        : elapsed;

    const minutes =
      Math.floor(
        elapsedNow / 60000
      );

    const seconds =
      Math.floor(
        elapsedNow / 1000
      ) % 60;

    const hundredths =
      Math.floor(
        elapsedNow / 10
      ) % 100;

    $("#stopwatchDisplay").textContent =
      `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(hundredths).padStart(2,"0")}`;

    if (running) {

      animationFrame =
        requestAnimationFrame(update);

    }

  }

  $("#stopwatchStart").onclick =
    () => {

      if (running) return;

      startTime =
        Date.now();

      running = true;

      update();

    };

  $("#stopwatchStop").onclick =
    () => {

      if (!running) return;

      elapsed +=
        Date.now() - startTime;

      running = false;

      cancelAnimationFrame(
        animationFrame
      );

      update();

    };

  $("#stopwatchReset").onclick =
    () => {

      running = false;

      elapsed = 0;

      startTime = 0;

      cancelAnimationFrame(
        animationFrame
      );

      update();

    };

}

/* =========================
   ESTUDIO
========================= */

function renderStudy() {

  const container =
    $("#studyList");

  if (!container) return;

  container.innerHTML =
    state.study.map(
      (item,index) => `

        <div class="list-item">

          <span>

            <b>
              ${escapeHTML(item.text)}
            </b>

            <br>

            <span class="small">
              ${
                escapeHTML(
                  item.date ||
                  "Sin fecha"
                )
              }
              ·
              ${item.minutes} min
            </span>

          </span>

          <button
            class="btn ghost"
            data-study="${index}"
          >
            ×
          </button>

        </div>

      `
    ).join("")
    ||
    `<span class="small">
      Aún no hay sesiones.
    </span>`;

  $$("[data-study]").forEach(
    button => {

      button.onclick = () => {

        state.study.splice(
          Number(
            button.dataset.study
          ),
          1
        );

        save();

        openTool("study");

      };

    }
  );

}

/* =========================
   DICCIONARIO
========================= */

async function dictionarySearch(
  word,
  result
) {

  if (!word.trim()) return;

  result.textContent =
    "Buscando…";

  try {

    const response =
      await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word.trim())}`
      );

    if (!response.ok) {
      throw new Error();
    }

    const data =
      await response.json();

    const meaning =
      data[0]
        ?.meanings?.[0];

    const definition =
      meaning
        ?.definitions?.[0]
        ?.definition;

    result.innerHTML = `

      <b>
        ${escapeHTML(
          data[0]?.word || word
        )}
      </b>

      <br>

      ${escapeHTML(
        meaning?.partOfSpeech || ""
      )}

      <br>

      ${escapeHTML(
        definition ||
        "No encontrada"
      )}

    `;

  } catch {

    result.textContent =
      "No se pudo consultar. Revisa tu conexión.";

  }

}

/* =========================
   MONEDAS
========================= */

async function convertCurrency() {

  const amount =
    Number(
      $("#currencyAmount").value
    );

  const from =
    $("#currencyFrom").value;

  const to =
    $("#currencyTo").value;

  const result =
    $("#result");

  if (!Number.isFinite(amount)) {
    result.textContent =
      "Introduce una cantidad.";
    return;
  }

  if (from === to) {

    result.textContent =
      `Resultado: ${amount} ${to}`;

    return;

  }

  try {

    let rates;

    if (navigator.onLine) {

      const response =
        await fetch(
          `https://api.frankfurter.app/latest?from=${from}`
        );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        await response.json();

      rates = {
        base: from,
        date: data.date,
        rates: data.rates
      };

      state.currency =
        rates;

      save();

    } else {

      rates =
        state.currency;

    }

    if (
      !rates ||
      !rates.rates ||
      !rates.rates[to]
    ) {

      throw new Error();

    }

    const converted =
      amount *
      rates.rates[to];

    result.textContent =
      `Resultado: ${converted.toFixed(2)} ${to} · ${rates.date || "guardado"}`;

  } catch {

    result.textContent =
      "No hay una tasa disponible. Conéctate para actualizarla.";

  }

}

/* =========================
   NOVA FLOW
========================= */

function createParticles() {

  const container =
    $("#particles");

  const fragment =
    document.createDocumentFragment();

  for (
    let i = 0;
    i < 65;
    i++
  ) {

    const particle =
      document.createElement("i");

    particle.className =
      "particle";

    particle.style.left =
      Math.random() * 100 + "%";

    particle.style.top =
      Math.random() * 100 + "%";

    particle.style.opacity =
      .2 + Math.random() * .6;

    particle.style.transform =
      `scale(${.4 + Math.random() * 1.6})`;

    fragment.appendChild(
      particle
    );

  }

  container.appendChild(
    fragment
  );

}

/* =========================
   AJUSTES
========================= */

function initializeSettings() {

  document.body.classList.toggle(
    "light",
    state.settings.theme === "light"
  );

  document.body.classList.toggle(
    "no-animation",
    !state.settings.animations
  );

  $("#themeToggle").checked =
    state.settings.theme === "dark";

  $("#animToggle").checked =
    state.settings.animations;

  $("#cursorToggle").checked =
    state.settings.cursor;

  $("#themeToggle").onchange =
    event => {

      state.settings.theme =
        event.target.checked
          ? "dark"
          : "light";

      save();

      initializeSettings();

    };

  $("#animToggle").onchange =
    event => {

      state.settings.animations =
        event.target.checked;

      save();

      initializeSettings();

    };

  $("#cursorToggle").onchange =
    event => {

      state.settings.cursor =
        event.target.checked;

      save();

    };

}

/* =========================
   MENÚ
========================= */

$("#menuBtn").onclick =
  () => {

    $("#mainNav")
      .classList
      .toggle("open");

  };

/* =========================
   BUSCADOR
========================= */

$("#globalSearch").oninput =
  () => {

    renderTools();

    const query =
      $("#globalSearch")
        .value
        .toLowerCase()
        .trim();

    const results =
      $("#searchResults");

    if (!query) {

      results.classList.remove(
        "show"
      );

      return;

    }

    const found =
      TOOLS.filter(tool =>
        `${tool[2]} ${tool[3]} ${tool[4]}`
          .toLowerCase()
          .includes(query)
      ).slice(0,7);

    results.innerHTML =
      found.map(
        tool => `

          <button
            class="search-item"
            data-search="${tool[0]}"
          >

            <span>
              ${tool[1]}
              ${escapeHTML(tool[2])}
            </span>

            <span class="small">
              ${escapeHTML(tool[4])}
            </span>

          </button>

        `
      ).join("");

    results.classList.toggle(
      "show",
      found.length > 0
    );

    $$("[data-search]").forEach(
      button => {

        button.onclick = () => {

          results.classList.remove(
            "show"
          );

          openTool(
            button.dataset.search
          );

        };

      }
    );

  };

document.addEventListener(
  "keydown",
  event => {

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      $("#globalSearch").focus();

    }

  }
);

/* =========================
   COMIDA
========================= */

$("#foodForm").onsubmit =
  event => {

    event.preventDefault();

    const query =
      $("#foodQuery")
        .value
        .trim();

    const place =
      $("#foodPlace")
        .value
        .trim();

    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(
        query + " " + place
      )}`,
      "_blank"
    );

  };

/* =========================
   COMPRAS
========================= */

$("#shopForm").onsubmit =
  event => {

    event.preventDefault();

    const query =
      $("#shopQuery")
        .value
        .trim();

    window.open(
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
      "_blank"
    );

  };

/* =========================
   CERCA DE MÍ
========================= */

$$("[data-near]").forEach(
  button => {

    button.onclick = () => {

      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(
          button.dataset.near +
          " cerca de mí"
        )}`,
        "_blank"
      );

    };

  }
);

/* =========================
   EXPORTAR
========================= */

$("#exportBtn").onclick =
  () => {

    const blob =
      new Blob(
        [
          JSON.stringify(
            state,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );

    const link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

    link.download =
      "utilhub-v12-backup.json";

    link.click();

    URL.revokeObjectURL(
      link.href
    );

  };

/* =========================
   IMPORTAR
========================= */

$("#importFile").onchange =
  async event => {

    const file =
      event.target.files[0];

    if (!file) return;

    try {

      const imported =
        JSON.parse(
          await file.text()
        );

      if (
        !imported ||
        typeof imported !== "object"
      ) {

        throw new Error();

      }

      state = {

        ...state,

        ...imported,

        settings: {

          ...state.settings,

          ...(imported.settings || {})

        }

      };

      save();

      location.reload();

    } catch {

      alert(
        "El archivo de respaldo no es válido."
      );

    }

  };

/* =========================
   BORRAR DATOS
========================= */

$("#clearBtn").onclick =
  () => {

    if (
      confirm(
        "¿Borrar notas, tareas, listas, favoritos e historial?"
      )
    ) {

      localStorage.removeItem(
        STORAGE_KEY
      );

      location.reload();

    }

  };

/* =========================
   CONEXIÓN
========================= */

window.addEventListener(
  "online",
  updateStats
);

window.addEventListener(
  "offline",
  updateStats
);

/* =========================
   INICIO
========================= */

createParticles();

renderFilters();

renderTools();

initializeSettings();

updateStats();

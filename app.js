// =====================
// LocalStorage Keys
// =====================

const STORAGE_PLAYERS = "ito_players";
const STORAGE_CUSTOM_THEMES = "ito_custom_themes";

// =====================
// State
// =====================

let players = [];
let customThemes = [];

let currentTheme = "";

let playerNumbers = {};

let currentPlayerIndex = 0;

let predictedOrder = [];

let revealIndex = 0;

// =====================
// Screen Helper
// =====================

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.remove("active");
        });

    document
        .getElementById(id)
        .classList.add("active");
}

// =====================
// Load
// =====================

window.addEventListener("DOMContentLoaded", () => {

    loadStorage();

    renderPlayers();

    bindEvents();

});

// =====================
// Storage
// =====================

function loadStorage() {

    players =
        JSON.parse(
            localStorage.getItem(STORAGE_PLAYERS)
        ) || [""];

    customThemes =
        JSON.parse(
            localStorage.getItem(STORAGE_CUSTOM_THEMES)
        ) || [];

}

function savePlayers() {

    localStorage.setItem(
        STORAGE_PLAYERS,
        JSON.stringify(players)
    );

}

function saveCustomThemes() {

    localStorage.setItem(
        STORAGE_CUSTOM_THEMES,
        JSON.stringify(customThemes)
    );

}

// =====================
// Player UI
// =====================

function renderPlayers() {

    const list =
        document.getElementById("player-list");

    list.innerHTML = "";

    players.forEach((name, index) => {

        const input =
            document.createElement("input");

        input.type = "text";

        input.className = "player-input";

        input.value = name;

        input.placeholder =
            `プレイヤー${index + 1}`;

        input.addEventListener("input", e => {

            players[index] = e.target.value;

            savePlayers();

        });

        list.appendChild(input);

    });

    document.getElementById(
        "player-count"
    ).textContent =
        `登録人数：${players.filter(v => v.trim()).length}人`;

}

// =====================
// Events
// =====================

function bindEvents() {

    document
        .getElementById("add-player-btn")
        .addEventListener("click", addPlayer);

    document
        .getElementById("start-game-btn")
        .addEventListener("click", startGame);

    document
        .getElementById("reroll-theme-btn")
        .addEventListener("click", renderThemeOptions);

    document
        .getElementById("custom-theme-btn")
        .addEventListener("click", () => {
            showScreen("screen-custom-theme");
        });

    document
        .getElementById("save-theme-btn")
        .addEventListener("click", saveCustomTheme);

    document
        .getElementById("cancel-theme-btn")
        .addEventListener("click", () => {
            showScreen("screen-theme");
        });

    document
        .getElementById("show-number-btn")
        .addEventListener("click", showCurrentNumber);

    document
        .getElementById("confirm-number-btn")
        .addEventListener("click", nextPlayer);

    document
        .getElementById("begin-discussion-btn")
        .addEventListener("click", startDiscussion);

    document
        .getElementById("recheck-btn")
        .addEventListener("click", openRecheck);

    document
        .getElementById("back-to-game-btn")
        .addEventListener("click", () => {
            showScreen("screen-game");
        });

    document
        .getElementById("result-input-btn")
        .addEventListener("click", openSort);

    document
        .getElementById("confirm-order-btn")
        .addEventListener("click", previewOrder);

    document
        .getElementById("back-to-sort-btn")
        .addEventListener("click", () => {
            showScreen("screen-sort");
        });

    document
        .getElementById("finalize-order-btn")
        .addEventListener("click", startReveal);

    document
        .getElementById("rematch-btn")
        .addEventListener("click", rematch);

    document
        .getElementById("back-top-btn")
        .addEventListener("click", () => {
            showScreen("screen-top");
        });

    document
        .getElementById("abort-btn")
        .addEventListener("click", abortGame);

    document
        .getElementById("screen-reveal")
        .addEventListener("click", nextReveal);

}

// =====================
// Player
// =====================

function addPlayer() {

    if (players.length >= 10) return;

    players.push("");

    renderPlayers();

    savePlayers();

}

// =====================
// Game Start
// =====================

function startGame() {

    players =
        players
            .map(v => v.trim())
            .filter(v => v);

    if (players.length < 2) {

        alert("2人以上登録してください");

        return;
    }

    savePlayers();

    showScreen("screen-theme");

    renderThemeOptions();

}

// =====================
// Themes
// =====================

function renderThemeOptions() {

    const container =
        document.getElementById(
            "theme-options"
        );

    container.innerHTML = "";

    const allThemes =
        [...THEMES, ...customThemes];

    const selected = [];

    while (
        selected.length < 3 &&
        selected.length < allThemes.length
    ) {

        const theme =
            allThemes[
                Math.floor(
                    Math.random() *
                    allThemes.length
                )
            ];

        if (!selected.includes(theme)) {

            selected.push(theme);

        }
    }

    selected.forEach(theme => {

        const btn =
            document.createElement("button");

        btn.className = "theme-option";

        btn.textContent = theme;

        btn.addEventListener(
            "click",
            () => selectTheme(theme)
        );

        container.appendChild(btn);

    });

}

function selectTheme(theme) {

    currentTheme = theme;

    setupNumbers();

}

function saveCustomTheme() {

    const input =
        document.getElementById(
            "custom-theme-input"
        );

    const theme =
        input.value.trim();

    if (!theme) return;

    currentTheme = theme;

    if (
        document.getElementById(
            "save-custom-theme"
        ).checked
    ) {

        if (!customThemes.includes(theme)) {

            customThemes.push(theme);

            saveCustomThemes();

        }

    }

    setupNumbers();

}

// =====================
// Numbers
// =====================

function setupNumbers() {

    playerNumbers = {};

    const numbers = [];

    while (
        numbers.length < players.length
    ) {

        const num =
            Math.floor(
                Math.random() * 100
            ) + 1;

        if (!numbers.includes(num)) {

            numbers.push(num);

        }

    }

    players.forEach((p, i) => {

        playerNumbers[p] = numbers[i];

    });

    currentPlayerIndex = 0;

    document.getElementById(
        "current-player-name"
    ).textContent =
        players[currentPlayerIndex];

    showScreen("screen-card-check");

}

function showCurrentNumber() {

    const player =
        players[currentPlayerIndex];

    document.getElementById(
        "number-player-name"
    ).textContent = player;

    document.getElementById(
        "player-number"
    ).textContent =
        playerNumbers[player];

    showScreen("screen-card-show");

}

function nextPlayer() {

    currentPlayerIndex++;

    if (
        currentPlayerIndex >=
        players.length
    ) {

        showScreen("screen-ready");

        return;
    }

    document.getElementById(
        "current-player-name"
    ).textContent =
        players[currentPlayerIndex];

    showScreen("screen-card-check");

}

function startDiscussion() {

    document.getElementById(
        "current-theme-display"
    ).textContent =
        currentTheme;

    showScreen("screen-game");

}


// ↓ここから後半を追記

// =====================
// Recheck
// =====================

function openRecheck() {

    const container =
        document.getElementById(
            "recheck-player-list"
        );

    container.innerHTML = "";

    players.forEach(player => {

        const btn =
            document.createElement("button");

        btn.className = "theme-option";

        btn.textContent = player;

        btn.addEventListener(
            "click",
            () => {

                const ok =
                    confirm(
                        `${player} の数字を表示しますか？`
                    );

                if (!ok) return;

                alert(
                    `${player}\n\n${playerNumbers[player]}`
                );

            }
        );

        container.appendChild(btn);

    });

    showScreen("screen-recheck");

}

// =====================
// Sort
// =====================

function openSort() {

    const list =
        document.getElementById(
            "sortable-list"
        );

    list.innerHTML = "";

    // プレイヤー登録順
    players.forEach(player => {

        const item =
            document.createElement("div");

        item.className =
            "sort-item";

        item.dataset.player =
            player;

        item.textContent =
            `☰ ${player}`;

        list.appendChild(item);

    });

    new Sortable(list, {

        animation: 150

    });

    showScreen("screen-sort");

}

function previewOrder() {

    const items =
        document.querySelectorAll(
            "#sortable-list .sort-item"
        );

    predictedOrder =
        [...items].map(item =>
            item.dataset.player
        );

    const preview =
        document.getElementById(
            "order-preview"
        );

    preview.innerHTML = "";

    predictedOrder.forEach(
        (player, index) => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "result-row";

            div.textContent =
                `${index + 1}. ${player}`;

            preview.appendChild(div);

        }
    );

    showScreen(
        "screen-confirm-order"
    );

}

// =====================
// Reveal
// =====================

let revealOrder = [];

function startReveal() {

    revealOrder =
        Object.entries(
            playerNumbers
        )
        .sort(
            (a, b) => a[1] - b[1]
        );

    revealIndex = 0;

    renderReveal();

    showScreen("screen-reveal");

}

function renderReveal() {

    const current =
        revealOrder[
            revealIndex
        ];

    document.getElementById(
        "reveal-player"
    ).textContent =
        current[0];

    document.getElementById(
        "reveal-number"
    ).textContent =
        current[1];

}

function nextReveal() {

    revealIndex++;

    if (
        revealIndex >=
        revealOrder.length
    ) {

        showResults();

        return;
    }

    renderReveal();

}

// =====================
// Result
// =====================

function showResults() {

    document.getElementById(
        "result-theme"
    ).textContent =
        currentTheme;

    renderPredictedResults();

    renderActualResults();

    showScreen("screen-result");

}

function renderPredictedResults() {

    const container =
        document.getElementById(
            "predicted-result"
        );

    container.innerHTML = "";

    predictedOrder.forEach(
        player => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "result-row";

            row.innerHTML =
                `
                <span>${player}</span>
                <span>${playerNumbers[player]}</span>
                `;

            container.appendChild(
                row
            );

        }
    );

}

function renderActualResults() {

    const container =
        document.getElementById(
            "actual-result"
        );

    container.innerHTML = "";

    revealOrder.forEach(
        ([player, number]) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "result-row";

            row.innerHTML =
                `
                <span>${player}</span>
                <span>${number}</span>
                `;

            container.appendChild(
                row
            );

        }
    );

}

// =====================
// Rematch
// =====================

function rematch() {

    currentTheme = "";

    playerNumbers = {};

    predictedOrder = [];

    revealOrder = [];

    showScreen("screen-theme");

    renderThemeOptions();

}

// =====================
// Abort
// =====================

function abortGame() {

    const ok =
        confirm(
            "本当に中断しますか？"
        );

    if (!ok) return;

    currentTheme = "";

    playerNumbers = {};

    predictedOrder = [];

    revealOrder = [];

    showScreen("screen-top");

}




// =====================================
// Storage
// =====================================

const STORAGE_PLAYERS = "ito_players";
const STORAGE_CUSTOM_THEMES = "ito_custom_themes";
const STORAGE_DARKMODE = "ito_darkmode";
const STORAGE_RECENT_THEMES = "ito_recent_themes";
const STORAGE_EXCLUDE_RECENT_THEMES = "ito_exclude_recent_themes";

const RECENT_THEME_LIMIT = 30;

// =====================================
// State
// =====================================

let players = [];
let customThemes = [];
let recentThemes = [];

let darkMode = false;
let excludeRecentThemes = true;

let currentTheme = "";
let playerNumbers = {};

let currentPlayerIndex = 0;

let predictedOrder = [];
let revealOrder = [];
let revealIndex = 0;

let sortableInstance = null;
let recheckPlayer = null;

// =====================================
// Init
// =====================================

window.addEventListener("DOMContentLoaded", () => {
    loadStorage();
    applyDarkMode();
    renderPlayers();
    bindEvents();
});

// =====================================
// Screen
// =====================================

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}

// =====================================
// Storage
// =====================================

function loadStorage() {
    players =
        JSON.parse(localStorage.getItem(STORAGE_PLAYERS)) || ["", ""];

    customThemes =
        JSON.parse(localStorage.getItem(STORAGE_CUSTOM_THEMES)) || [];

    recentThemes =
        JSON.parse(localStorage.getItem(STORAGE_RECENT_THEMES)) || [];

    darkMode =
        JSON.parse(localStorage.getItem(STORAGE_DARKMODE)) || false;

    const savedExclude =
        localStorage.getItem(STORAGE_EXCLUDE_RECENT_THEMES);

    excludeRecentThemes =
        savedExclude === null
            ? true
            : JSON.parse(savedExclude);
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

function saveRecentThemes() {
    localStorage.setItem(
        STORAGE_RECENT_THEMES,
        JSON.stringify(recentThemes)
    );
}

function saveSettingsStorage() {
    localStorage.setItem(
        STORAGE_DARKMODE,
        JSON.stringify(darkMode)
    );

    localStorage.setItem(
        STORAGE_EXCLUDE_RECENT_THEMES,
        JSON.stringify(excludeRecentThemes)
    );
}

// =====================================
// Events
// =====================================

function bindEvents() {
    document
        .getElementById("add-player-btn")
        .addEventListener("click", addPlayer);

    document
        .getElementById("remove-player-btn")
        .addEventListener("click", removePlayer);

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
        .getElementById("screen-card-check")
        .addEventListener("click", showCurrentNumber);

    document
        .getElementById("screen-card-show")
        .addEventListener("click", nextPlayer);

    document
        .getElementById("screen-ready")
        .addEventListener("click", startDiscussion);

    document
        .getElementById("result-input-btn")
        .addEventListener("click", openSort);

    document
        .getElementById("recheck-btn")
        .addEventListener("click", openRecheck);

    document
        .getElementById("abort-btn")
        .addEventListener("click", abortGame);

    document
        .getElementById("screen-recheck-confirm")
        .addEventListener("click", showRecheckNumber);

    document
        .getElementById("screen-recheck-number")
        .addEventListener("click", () => {
            showScreen("screen-game");
        });

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
        .getElementById("screen-reveal")
        .addEventListener("click", nextReveal);

    document
        .getElementById("rematch-btn")
        .addEventListener("click", rematch);

    document
        .getElementById("back-top-btn")
        .addEventListener("click", backToTop);

    const settingsBtn =
        document.getElementById("settings-btn");

    if (settingsBtn) {
        settingsBtn.addEventListener("click", openSettings);
    }

    const closeSettingsBtn =
        document.getElementById("close-settings-btn");

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", () => {
            showScreen("screen-top");
        });
    }

    const saveSettingsBtn =
        document.getElementById("save-settings-btn");

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", saveSettings);
    }

    const resetRecentBtn =
        document.getElementById("reset-recent-themes-btn");

    if (resetRecentBtn) {
        resetRecentBtn.addEventListener("click", resetRecentThemes);
    }

    const clearStorageBtn =
        document.getElementById("clear-storage-btn");

    if (clearStorageBtn) {
        clearStorageBtn.addEventListener("click", clearAllStorage);
    }
}

// =====================================
// Settings
// =====================================

function openSettings() {
    const darkmodeToggle =
        document.getElementById("darkmode-toggle");

    if (darkmodeToggle) {
        darkmodeToggle.checked = darkMode;
    }

    const excludeRecentToggle =
        document.getElementById("exclude-recent-toggle");

    if (excludeRecentToggle) {
        excludeRecentToggle.checked = excludeRecentThemes;
    }

    showScreen("screen-settings");
}

function saveSettings() {
    const darkmodeToggle =
        document.getElementById("darkmode-toggle");

    if (darkmodeToggle) {
        darkMode = darkmodeToggle.checked;
    }

    const excludeRecentToggle =
        document.getElementById("exclude-recent-toggle");

    if (excludeRecentToggle) {
        excludeRecentThemes = excludeRecentToggle.checked;
    }

    saveSettingsStorage();
    applyDarkMode();

    showScreen("screen-top");
}

function applyDarkMode() {
    document.body.classList.toggle("dark", darkMode);
}

function resetRecentThemes() {
    const ok = confirm("最近遊んだお題履歴を削除しますか？");

    if (!ok) {
        return;
    }

    recentThemes = [];
    saveRecentThemes();

    alert("最近遊んだお題履歴を削除しました");
}

function clearAllStorage() {
    const ok = confirm("保存データを削除しますか？");

    if (!ok) {
        return;
    }

    localStorage.removeItem(STORAGE_PLAYERS);
    localStorage.removeItem(STORAGE_CUSTOM_THEMES);
    localStorage.removeItem(STORAGE_DARKMODE);
    localStorage.removeItem(STORAGE_RECENT_THEMES);
    localStorage.removeItem(STORAGE_EXCLUDE_RECENT_THEMES);

    players = ["", ""];
    customThemes = [];
    recentThemes = [];
    darkMode = false;
    excludeRecentThemes = true;

    applyDarkMode();
    renderPlayers();

    showScreen("screen-top");
}

// =====================================
// Players
// =====================================

function renderPlayers() {
    const container =
        document.getElementById("player-list");

    container.innerHTML = "";

    players.forEach((player, index) => {
        const input =
            document.createElement("input");

        input.className = "player-input";
        input.value = player;
        input.placeholder = `プレイヤー${index + 1}`;

        input.addEventListener("input", e => {
            players[index] = e.target.value;
            savePlayers();
        });

        container.appendChild(input);
    });

    document.getElementById("player-count").textContent =
        `参加人数：${players.length}人`;
}

function addPlayer() {
    if (players.length >= 10) {
        return;
    }

    players.push("");

    savePlayers();
    renderPlayers();
}

function removePlayer() {
    if (players.length <= 2) {
        return;
    }

    players.pop();

    savePlayers();
    renderPlayers();
}

// =====================================
// Theme
// =====================================

function startGame() {
    players =
        [...document.querySelectorAll(".player-input")]
            .map(input => input.value.trim())
            .filter(name => name !== "");

    if (players.length < 2) {
        alert("2人以上入力してください");
        return;
    }

    savePlayers();

    renderThemeOptions();

    showScreen("screen-theme");
}

function getAllThemes() {
    return [
        ...THEMES,
        ...customThemes
    ];
}

function renderThemeOptions() {
    const container =
        document.getElementById("theme-options");

    container.innerHTML = "";

    const allThemes = getAllThemes();

    let candidates = allThemes;

    if (excludeRecentThemes) {
        const filtered =
            allThemes.filter(theme =>
                !recentThemes.includes(theme)
            );

        if (filtered.length >= 3) {
            candidates = filtered;
        }
    }

    const pool =
        shuffleArray(candidates).slice(0, 3);

    addRecentThemes(pool);

    pool.forEach(theme => {
        const button =
            document.createElement("button");

        button.className = "theme-option";
        button.textContent = theme;

        button.addEventListener("click", () => {
            selectTheme(theme);
        });

        container.appendChild(button);
    });
}

function selectTheme(theme) {
    currentTheme = theme;

    addRecentThemes([theme]);

    startCardCheck();
}

function saveCustomTheme() {
    const input =
        document.getElementById("custom-theme-input");

    const theme =
        input.value.trim();

    if (!theme) {
        return;
    }

    currentTheme = theme;

    const save =
        document.getElementById("save-custom-theme").checked;

    if (
        save &&
        !customThemes.includes(theme)
    ) {
        customThemes.push(theme);
        saveCustomThemes();
    }

    addRecentThemes([theme]);

    input.value = "";

    document.getElementById("save-custom-theme").checked = false;

    startCardCheck();
}

function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}

function addRecentThemes(themes) {
    themes.forEach(theme => {
        recentThemes =
            recentThemes.filter(item => item !== theme);

        recentThemes.push(theme);
    });

    while (recentThemes.length > RECENT_THEME_LIMIT) {
        recentThemes.shift();
    }

    saveRecentThemes();
}

// =====================================
// Number Distribution
// =====================================

function startCardCheck() {
    playerNumbers = {};
    currentPlayerIndex = 0;

    const numbers =
        generateUniqueNumbers(players.length);

    players.forEach((player, index) => {
        playerNumbers[player] = numbers[index];
    });

    showCurrentPlayer();
}

function generateUniqueNumbers(count) {
    const numbers = [];

    while (numbers.length < count) {
        const number =
            Math.floor(Math.random() * 100) + 1;

        if (!numbers.includes(number)) {
            numbers.push(number);
        }
    }

    return numbers;
}

function showCurrentPlayer() {
    document.getElementById("current-player-name").textContent =
        players[currentPlayerIndex];

    showScreen("screen-card-check");
}

function showCurrentNumber() {
    const player =
        players[currentPlayerIndex];

    document.getElementById("number-player-name").textContent =
        player;

    document.getElementById("player-number").textContent =
        playerNumbers[player];

    showScreen("screen-card-show");
}

function nextPlayer() {
    currentPlayerIndex++;

    if (currentPlayerIndex >= players.length) {
        showScreen("screen-ready");
        return;
    }

    showCurrentPlayer();
}

// =====================================
// Discussion
// =====================================

function startDiscussion() {
    document.getElementById("current-theme-display").textContent =
        currentTheme;

    showScreen("screen-game");
}

// =====================================
// Recheck
// =====================================

function openRecheck() {
    const container =
        document.getElementById("recheck-player-list");

    container.innerHTML = "";

    players.forEach(player => {
        const button =
            document.createElement("button");

        button.className = "theme-option";
        button.textContent = player;

        button.addEventListener("click", () => {
            recheckPlayer = player;

            document.getElementById("recheck-confirm-name").textContent =
                player;

            showScreen("screen-recheck-confirm");
        });

        container.appendChild(button);
    });

    showScreen("screen-recheck");
}

function showRecheckNumber() {
    document.getElementById("recheck-player-name").textContent =
        recheckPlayer;

    document.getElementById("recheck-player-number").textContent =
        playerNumbers[recheckPlayer];

    showScreen("screen-recheck-number");
}

// =====================================
// Sort
// =====================================

function openSort() {
    const list =
        document.getElementById("sortable-list");

    list.innerHTML = "";

    players.forEach(player => {
        const item =
            document.createElement("div");

        item.className = "sort-item";
        item.dataset.player = player;
        item.textContent = player;

        list.appendChild(item);
    });

    if (sortableInstance) {
        sortableInstance.destroy();
    }

    sortableInstance =
        new Sortable(list, {
            animation: 150
        });

    showScreen("screen-sort");
}

function previewOrder() {
    predictedOrder =
        [...document.querySelectorAll("#sortable-list .sort-item")]
            .map(item => item.dataset.player);

    const preview =
        document.getElementById("order-preview");

    preview.innerHTML = "";

    predictedOrder.forEach(player => {
        const row =
            document.createElement("div");

        row.className = "result-row";
        row.textContent = player;

        preview.appendChild(row);
    });

    showScreen("screen-confirm-order");
}

// =====================================
// Reveal
// =====================================

function startReveal() {
    revealOrder =
        Object.entries(playerNumbers)
            .sort((a, b) => a[1] - b[1]);

    revealIndex = 0;

    renderReveal();

    showScreen("screen-reveal");
}

function renderReveal() {
    const current =
        revealOrder[revealIndex];

    document.getElementById("reveal-player").textContent =
        current[0];

    document.getElementById("reveal-number").textContent =
        current[1];
}

function nextReveal() {
    revealIndex++;

    if (revealIndex >= revealOrder.length) {
        showResults();
        return;
    }

    renderReveal();
}

// =====================================
// Results
// =====================================

function showResults() {
    document.getElementById("result-theme").textContent =
        currentTheme;

    renderPredictedResults();
    renderActualResults();

    showScreen("screen-result");
}

function renderPredictedResults() {
    const container =
        document.getElementById("predicted-result");

    container.innerHTML = "";

    predictedOrder.forEach(player => {
        container.appendChild(
            createResultRow(
                player,
                playerNumbers[player]
            )
        );
    });
}

function renderActualResults() {
    const container =
        document.getElementById("actual-result");

    container.innerHTML = "";

    revealOrder.forEach(([player, number]) => {
        container.appendChild(
            createResultRow(
                player,
                number
            )
        );
    });
}

function createResultRow(player, number) {
    const row =
        document.createElement("div");

    row.className = "result-row";

    const name =
        document.createElement("span");

    name.textContent = player;

    const value =
        document.createElement("span");

    value.textContent = number;

    row.appendChild(name);
    row.appendChild(value);

    return row;
}

// =====================================
// Restart
// =====================================

function rematch() {
    currentTheme = "";
    playerNumbers = {};
    predictedOrder = [];
    revealOrder = [];

    renderThemeOptions();

    showScreen("screen-theme");
}

function backToTop() {
    currentTheme = "";
    playerNumbers = {};
    predictedOrder = [];
    revealOrder = [];

    renderPlayers();

    showScreen("screen-top");
}

// =====================================
// Abort
// =====================================

function abortGame() {
    const ok =
        confirm("本当にゲームを中断しますか？");

    if (!ok) {
        return;
    }

    backToTop();
}
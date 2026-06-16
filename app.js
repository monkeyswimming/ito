// =====================================
// Storage Keys
// =====================================

const STORAGE_PLAYERS = "ito_players";
const STORAGE_CUSTOM_THEMES = "ito_custom_themes";

// =====================================
// State
// =====================================

let players = [];
let customThemes = [];

let currentTheme = "";

let playerNumbers = {};

let currentPlayerIndex = 0;

let predictedOrder = [];

let revealOrder = [];

let revealIndex = 0;

let sortableInstance = null;

// =====================================
// Initialize
// =====================================

window.addEventListener("DOMContentLoaded", () => {

    loadStorage();

    renderPlayers();

    bindEvents();

});

// =====================================
// Screen Control
// =====================================

function showScreen(screenId) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.remove("active");
        });

    document
        .getElementById(screenId)
        .classList.add("active");
}

// =====================================
// Storage
// =====================================

function loadStorage() {

    players =
        JSON.parse(
            localStorage.getItem(STORAGE_PLAYERS)
        ) || ["", ""];

    customThemes =
        JSON.parse(
            localStorage.getItem(
                STORAGE_CUSTOM_THEMES
            )
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

// =====================================
// Event Bindings
// =====================================

function bindEvents() {

    document
        .getElementById("add-player-btn")
        .addEventListener(
            "click",
            addPlayer
        );

    document
        .getElementById("remove-player-btn")
        .addEventListener(
            "click",
            removePlayer
        );

    document
        .getElementById("start-game-btn")
        .addEventListener(
            "click",
            startGame
        );

    document
        .getElementById("reroll-theme-btn")
        .addEventListener(
            "click",
            renderThemeOptions
        );

    document
        .getElementById("custom-theme-btn")
        .addEventListener(
            "click",
            () => {
                showScreen(
                    "screen-custom-theme"
                );
            }
        );

    document
        .getElementById("save-theme-btn")
        .addEventListener(
            "click",
            saveCustomTheme
        );

    document
        .getElementById("cancel-theme-btn")
        .addEventListener(
            "click",
            () => {
                showScreen(
                    "screen-theme"
                );
            }
        );

    // 数字確認

    document
        .getElementById("screen-card-check")
        .addEventListener(
            "click",
            showCurrentNumber
        );

    document
        .getElementById("screen-card-show")
        .addEventListener(
            "click",
            nextPlayer
        );

    document
        .getElementById("screen-ready")
        .addEventListener(
            "click",
            startDiscussion
        );

    // ゲーム中

    document
        .getElementById("recheck-btn")
        .addEventListener(
            "click",
            openRecheck
        );

    document
        .getElementById("result-input-btn")
        .addEventListener(
            "click",
            openSort
        );

    document
        .getElementById("abort-btn")
        .addEventListener(
            "click",
            abortGame
        );

    // 再確認

    document
        .getElementById("back-to-game-btn")
        .addEventListener(
            "click",
            () => {
                showScreen(
                    "screen-game"
                );
            }
        );

    // 並び替え

    document
        .getElementById("confirm-order-btn")
        .addEventListener(
            "click",
            previewOrder
        );

    document
        .getElementById("back-to-sort-btn")
        .addEventListener(
            "click",
            () => {
                showScreen(
                    "screen-sort"
                );
            }
        );

    document
        .getElementById("finalize-order-btn")
        .addEventListener(
            "click",
            startReveal
        );

    // 結果

    document
        .getElementById("rematch-btn")
        .addEventListener(
            "click",
            rematch
        );

    document
        .getElementById("back-top-btn")
        .addEventListener(
            "click",
            backToTop
        );

    // 発表

    document
        .getElementById("screen-reveal")
        .addEventListener(
            "click",
            nextReveal
        );
}

// =====================================
// Player UI
// =====================================

function renderPlayers() {

    const container =
        document.getElementById(
            "player-list"
        );

    container.innerHTML = "";

    players.forEach(
        (player, index) => {

            const input =
                document.createElement(
                    "input"
                );

            input.type = "text";

            input.className =
                "player-input";

            input.placeholder =
                `プレイヤー${index + 1}`;

            input.value =
                player;

            input.addEventListener(
                "input",
                e => {

                    players[index] =
                        e.target.value;

                    savePlayers();

                    updatePlayerCount();

                }
            );

            container.appendChild(
                input
            );

        }
    );

    updatePlayerCount();
}

function updatePlayerCount() {

    const count =
        players.filter(
            p => p.trim() !== ""
        ).length;

    document.getElementById(
        "player-count"
    ).textContent =
        `登録人数：${count}人`;
}

function addPlayer() {

    if (players.length >= 10) {

        alert(
            "プレイヤーは最大10人です"
        );

        return;
    }

    players.push("");

    renderPlayers();

    savePlayers();
}

function removePlayer() {

    if (players.length <= 2) {

        alert(
            "2人未満にはできません"
        );

        return;
    }

    players.pop();

    renderPlayers();

    savePlayers();
}

// =====================================
// Game Start
// =====================================

function startGame() {

    players =
        players
            .map(
                p => p.trim()
            )
            .filter(
                p => p !== ""
            );

    if (players.length < 2) {

        alert(
            "2人以上入力してください"
        );

        return;
    }

    savePlayers();

    renderThemeOptions();

    showScreen(
        "screen-theme"
    );
}

// =====================================
// Theme Selection
// =====================================

function renderThemeOptions() {

    const container =
        document.getElementById(
            "theme-options"
        );

    container.innerHTML = "";

    const allThemes = [
        ...THEMES,
        ...customThemes
    ];

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

        if (
            !selected.includes(
                theme
            )
        ) {

            selected.push(
                theme
            );
        }
    }

    selected.forEach(
        theme => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "theme-option";

            button.textContent =
                theme;

            button.addEventListener(
                "click",
                () => {

                    currentTheme =
                        theme;

                    setupNumbers();

                }
            );

            container.appendChild(
                button
            );

        }
    );
}

function saveCustomTheme() {

    const input =
        document.getElementById(
            "custom-theme-input"
        );

    const theme =
        input.value.trim();

    if (!theme) {

        alert(
            "お題を入力してください"
        );

        return;
    }

    currentTheme = theme;

    const save =
        document.getElementById(
            "save-custom-theme"
        ).checked;

    if (
        save &&
        !customThemes.includes(theme)
    ) {

        customThemes.push(
            theme
        );

        saveCustomThemes();
    }

    input.value = "";

    setupNumbers();
}

// =====================================
// Number Distribution
// =====================================

function setupNumbers() {

    playerNumbers = {};

    const numbers = [];

    while (
        numbers.length <
        players.length
    ) {

        const num =
            Math.floor(
                Math.random() * 100
            ) + 1;

        if (
            !numbers.includes(num)
        ) {

            numbers.push(num);
        }
    }

    players.forEach(
        (player, index) => {

            playerNumbers[player] =
                numbers[index];
        }
    );

    currentPlayerIndex = 0;

    showPlayerCheckScreen();
}

function showPlayerCheckScreen() {

    document.getElementById(
        "current-player-name"
    ).textContent =
        players[
            currentPlayerIndex
        ];

    showScreen(
        "screen-card-check"
    );
}

function showCurrentNumber() {

    const player =
        players[
            currentPlayerIndex
        ];

    document.getElementById(
        "number-player-name"
    ).textContent =
        player;

    document.getElementById(
        "player-number"
    ).textContent =
        playerNumbers[player];

    showScreen(
        "screen-card-show"
    );
}

function nextPlayer() {

    currentPlayerIndex++;

    if (
        currentPlayerIndex >=
        players.length
    ) {

        showScreen(
            "screen-ready"
        );

        return;
    }

    showPlayerCheckScreen();
}

// =====================================
// Discussion Start
// =====================================

function startDiscussion() {

    document.getElementById(
        "current-theme-display"
    ).textContent =
        currentTheme;

    showScreen(
        "screen-game"
    );
}

// =====================================
// Recheck
// =====================================

function openRecheck() {

    const container =
        document.getElementById(
            "recheck-player-list"
        );

    container.innerHTML = "";

    players.forEach(player => {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "theme-option";

        button.textContent =
            player;

        button.addEventListener(
            "click",
            () => {

                const ok =
                    confirm(
                        `${player} の数字を表示しますか？`
                    );

                if (!ok) {
                    return;
                }

                alert(
                    `${player}\n\n${playerNumbers[player]}`
                );

                showScreen(
                    "screen-game"
                );

            }
        );

        container.appendChild(
            button
        );

    });

    showScreen(
        "screen-recheck"
    );
}

// =====================================
// Sort
// =====================================

function openSort() {

    const list =
        document.getElementById(
            "sortable-list"
        );

    list.innerHTML = "";

    players.forEach(player => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "sort-item";

        item.dataset.player =
            player;

        item.textContent =
            `☰ ${player}`;

        list.appendChild(item);

    });

    if (sortableInstance) {
        sortableInstance.destroy();
    }

    sortableInstance =
        new Sortable(list, {
            animation: 150
        });

    showScreen(
        "screen-sort"
    );
}

function previewOrder() {

    const items =
        document.querySelectorAll(
            "#sortable-list .sort-item"
        );

    predictedOrder =
        [...items].map(
            item =>
                item.dataset.player
        );

    const preview =
        document.getElementById(
            "order-preview"
        );

    preview.innerHTML = "";

    predictedOrder.forEach(
        player => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "result-row";

            row.textContent =
                player;

            preview.appendChild(
                row
            );

        }
    );

    showScreen(
        "screen-confirm-order"
    );
}

// =====================================
// Reveal
// =====================================

function startReveal() {

    revealOrder =
        Object.entries(
            playerNumbers
        )
        .sort(
            (a, b) =>
                a[1] - b[1]
        );

    revealIndex = 0;

    renderReveal();

    showScreen(
        "screen-reveal"
    );
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

// =====================================
// Results
// =====================================

function showResults() {

    document.getElementById(
        "result-theme"
    ).textContent =
        currentTheme;

    renderPredictedResults();

    renderActualResults();

    showScreen(
        "screen-result"
    );
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

// =====================================
// Rematch
// =====================================

function rematch() {

    currentTheme = "";

    playerNumbers = {};

    predictedOrder = [];

    revealOrder = [];

    renderThemeOptions();

    showScreen(
        "screen-theme"
    );
}

// =====================================
// Back To Top
// =====================================

function backToTop() {

    currentTheme = "";

    playerNumbers = {};

    predictedOrder = [];

    revealOrder = [];

    renderPlayers();

    showScreen(
        "screen-top"
    );
}

// =====================================
// Abort Game
// =====================================

function abortGame() {

    const ok =
        confirm(
            "本当にゲームを中断しますか？"
        );

    if (!ok) {
        return;
    }

    backToTop();
}
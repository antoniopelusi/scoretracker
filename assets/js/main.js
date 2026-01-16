const $ = (id) => document.getElementById(id);
let players = JSON.parse(localStorage.getItem("players") || "[]");
let pending = null;
let timeout = null;
let randomTimeout = null;

const save = () =>
    localStorage.setItem(
        "players",
        JSON.stringify(players.filter((p) => p.name.trim())),
    );

const clearPending = () => {
    clearTimeout(timeout);
    document
        .querySelectorAll(".pending")
        .forEach((el) => el.classList.remove("pending"));
    pending = null;
};

const danger = (id, action) => {
    if (pending === id) {
        clearPending();
        action();
    } else {
        clearPending();
        document
            .querySelector(`[data-action="${id}"]`)
            ?.classList.add("pending");
        pending = id;
        timeout = setTimeout(clearPending, 1000);
    }
};

const getRank = (i) =>
    players.filter((p) => p.score > players[i].score).length + 1;

const getRankClass = (rank) =>
    rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "";

const playerHTML = (p, i) => {
    const rank = getRank(i);
    const noname = p.name.trim() ? "" : " noname";
    return `<article id="p${i}" class="${noname}">
        <output class="${getRankClass(rank)}">${rank}</output>
        <input type="text" value="${p.name}" placeholder="Name" enterkeyhint="done" data-index="${i}">
        <span>
            <button aria-label="Decrement score by one" data-score="-" data-index="${i}"><img src="/assets/icons/minus.svg"></button>
            <input type="number" value="${p.score}" data-index="${i}" enterkeyhint="done">
            <button aria-label="Increment score by one" data-score="+" data-index="${i}"><img src="/assets/icons/plus.svg"></button>
        </span>
        <button aria-label="Remove player (double click)" data-action="del${i}"><img src="/assets/icons/user-xmark.svg"></button>
    </article>`;
};

const updateNoname = (i) => {
    $("p" + i).classList.toggle("noname", !players[i].name.trim());
    updateButtons();
};

const updateButtons = () => {
    const named = players.filter((p) => p.name.trim()).length;
    const btns = [
        { el: $("random"), condition: named < 2 },
        { el: $("ranking"), condition: named < 2 },
        { el: $("add"), condition: players.length >= 100 },
        { el: $("reset"), condition: players.length < 1 },
    ];
    btns.forEach(({ el, condition }) => {
        if (!el) return;
        el.disabled = condition;
        el.classList.toggle("disabled", condition);
    });
};

const updateRanks = () => {
    document.querySelectorAll("#list output").forEach((el, j) => {
        const rank = getRank(j);
        el.textContent = rank;
        el.className = getRankClass(rank);
    });
};

const updateScore = (i) => {
    $("p" + i).querySelector('input[type="number"]').value = players[i].score;
    updateRanks();
};

const render = () => {
    updateButtons();
    $("list").innerHTML = players.length
        ? players.map((p, i) => playerHTML(p, i)).join("")
        : `<aside class="fadeIn">
            <p>Score Tracker</p>
            <div class="info-item">
                <img src="/assets/icons/user-plus.svg" alt="" />
                <span>Add a new player</span>
            </div>
            <div class="info-item">
                <img src="/assets/icons/user-xmark.svg" alt="" />
                <span>Remove player (double click)</span>
            </div>
            <div class="info-item">
                <img src="/assets/icons/restart.svg" alt="" />
                <span>Reset all (double click)</span>
            </div>
            <div class="info-item">
                <img src="/assets/icons/ranking.svg" alt="" />
                <span>Show current rankings</span>
            </div>
            <div class="info-item">
                <img src="/assets/icons/hexagon-dice.svg" alt="" />
                <span>Pick a random player</span>
            </div>
        </aside>`;
};

const add = () => {
    if (players.length >= 100) return;
    clearPending();
    const empty = $("list").querySelector("aside");
    if (empty) {
        empty.classList.add("fadeOut");
        setTimeout(() => empty.remove(), 200);
    }
    players.push({ name: "", score: 0 });
    updateButtons();
    const div = document.createElement("div");
    div.innerHTML = playerHTML(players[players.length - 1], players.length - 1);
    const newEl = div.firstElementChild;
    newEl.classList.add("fadeIn");
    $("list").appendChild(newEl);
    newEl.querySelector('input[type="text"]').focus();
};

const del = (i) =>
    danger("del" + i, () => {
        const el = $("p" + i);
        el.classList.add("fadeOut");
        setTimeout(() => {
            players.splice(i, 1);
            save();
            render();
        }, 200);
    });

const reset = () => {
    if (!players.length) return;
    danger("reset", () => {
        document
            .querySelectorAll("#list > article")
            .forEach((el) => el.classList.add("fadeOut"));
        setTimeout(() => {
            players = [];
            save();
            render();
        }, 200);
    });
};

const random = () => {
    const named = players
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => p.name.trim());
    if (named.length < 2) return;
    clearPending();
    clearTimeout(randomTimeout);
    document
        .querySelectorAll("#list > article")
        .forEach((el) => el.classList.remove("highlight"));
    const { i } = named[Math.floor(Math.random() * named.length)];
    const el = $("p" + i);
    el.classList.add("highlight");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    randomTimeout = setTimeout(() => el?.classList.remove("highlight"), 2000);
};

const buildRankingSnapshot = () => {
    const ranked = players
        .filter((p) => p.name.trim())
        .sort((a, b) => b.score - a.score);
    return ranked
        .map((p) => {
            const rank = ranked.filter((x) => x.score > p.score).length + 1;
            const cls = getRankClass(rank);
            return `<div class="ranking-row ${cls}">
            <span>${rank}. ${p.name}</span>
            <span>${p.score} pt.</span>
        </div>`;
        })
        .join("");
};

const openRanking = () => {
    $("ranking-content").innerHTML = buildRankingSnapshot();
    $("ranking-overlay").classList.add("show");
};

const closeRanking = () => $("ranking-overlay").classList.remove("show");

document.addEventListener("DOMContentLoaded", render);

document.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) {
        if (!e.target.closest("[data-action]")) clearPending();
        return;
    }
    if (target.id === "random") random();
    else if (target.id === "add") add();
    else if (target.id === "reset") reset();
    else if (target.dataset.action?.startsWith("del"))
        del(+target.dataset.action.replace("del", ""));
    else if (target.id === "ranking") openRanking();
    else if (target.dataset.score) {
        const i = +target.dataset.index;
        players[i].score += target.dataset.score === "+" ? 1 : -1;
        save();
        updateScore(i);
    }
});

document.addEventListener("input", (e) => {
    const i = +e.target.dataset.index;
    if (e.target.type === "text") {
        players[i].name = e.target.value;
        save();
        updateNoname(i);
    } else if (e.target.type === "number") {
        players[i].score = +e.target.value;
        save();
        updateRanks();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") e.target.blur();
    if (e.key === "Escape" && $("ranking-overlay").classList.contains("show"))
        closeRanking();
});

document.addEventListener(
    "focus",
    (e) => {
        if (e.target.type === "number") e.target.select();
    },
    true,
);

["visibilitychange", "beforeunload", "pagehide", "blur"].forEach((event) =>
    (event === "beforeunload" || event === "blur"
        ? window
        : document
    ).addEventListener(event, save),
);

document.addEventListener("freeze", save, { capture: true });

$("ranking-close").addEventListener("click", closeRanking);
document
    .querySelector(".ranking-backdrop")
    .addEventListener("click", closeRanking);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () =>
        navigator.serviceWorker.register("/service-worker.js"),
    );
}

import "./style.css";

const statusMessage = document.querySelector("#status-message");
const loadStatus = document.querySelector("#load-status");
const modeCards = document.querySelectorAll("[data-mode]");

const modeNames = {
  combat: "일반 전투",
  tower: "로그라이크 타워",
  shooter: "슈터",
};

function showStatus(message) {
  statusMessage.textContent = message;
}

modeCards.forEach((card) => {
  card.addEventListener("click", () => {
    const mode = card.dataset.mode;
    const modeName = modeNames[mode];

    if (!modeName) return;

    showStatus(`${modeName} 모드는 아직 개발 전입니다. 기본 화면과 버튼 연결은 정상 작동 중입니다.`);

    modeCards.forEach((item) => {
      item.classList.toggle("is-selected", item === card);
    });
  });
});

loadStatus.textContent = "HTML · CSS · JS 연결 완료";
document.documentElement.classList.add("app-ready");
console.info("[Hodumaroo] HTML, CSS, JS loaded successfully.");

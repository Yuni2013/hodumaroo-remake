import "./style.css";

const statusMessage = document.querySelector("#status-message");
const actionButtons = document.querySelectorAll("[data-action]");

const actionNames = {
  play: "전투 모드와 맵 선택 화면은 다음 단계에서 원작 구조를 참고해 구현할 예정입니다.",
  shop: "상점 화면은 아직 구현 전입니다.",
  jobs: "직업 화면은 아직 구현 전입니다.",
  upgrades: "영구 업그레이드 화면은 아직 구현 전입니다.",
  equipment: "장비 화면은 아직 구현 전입니다.",
  achievements: "업적 화면은 아직 구현 전입니다.",
  quests: "퀘스트 화면은 아직 구현 전입니다.",
  events: "이벤트 화면은 아직 구현 전입니다.",
  inventory: "인벤토리는 아직 구현 전입니다.",
  settings: "설정 화면은 아직 구현 전입니다.",
};

for (const button of actionButtons) {
  button.addEventListener("click", () => {
    const message = actionNames[button.dataset.action];
    if (message && statusMessage) statusMessage.textContent = message;
  });
}

document.documentElement.classList.add("app-ready");
console.info("[Hodumaroo] Original-inspired lobby UI loaded.");

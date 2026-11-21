import "./style.css";

const statusMessage = document.querySelector("#status-message");
const buttons = document.querySelectorAll("[data-action]");

const messages = {
  play: "맵 선택 화면은 다음 단계에서 구현할 예정입니다.",
  shop: "상점 화면은 아직 구현 전입니다.",
  jobs: "직업 화면은 아직 구현 전입니다.",
  upgrades: "영구 업그레이드 화면은 아직 구현 전입니다.",
  equipment: "장비 화면은 아직 구현 전입니다.",
  pets: "펫 기능은 아직 구현 전입니다.",
  relics: "유물 기능은 아직 구현 전입니다.",
  achievements: "업적 화면은 아직 구현 전입니다.",
  quests: "퀘스트 화면은 아직 구현 전입니다.",
  events: "이벤트 화면은 아직 구현 전입니다.",
  season: "시즌패스 화면은 아직 구현 전입니다.",
  enchant: "인챈트 화면은 아직 구현 전입니다.",
  inventory: "인벤토리는 아직 구현 전입니다.",
  notice: "새로운 공지사항이 없습니다.",
  level: "플레이어 경험치와 레벨 정보입니다.",
  star: "차원의 별 뽑기는 아직 구현 전입니다.",
  code: "쿠폰 코드 입력 기능은 아직 구현 전입니다.",
  settings: "설정 화면은 아직 구현 전입니다.",
  audio: "배경음악 재생 기능은 아직 연결되지 않았습니다.",
};

function showStatus(message) {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.classList.remove("is-visible");
  requestAnimationFrame(() => statusMessage.classList.add("is-visible"));
  window.clearTimeout(showStatus.timeout);
  showStatus.timeout = window.setTimeout(() => {
    statusMessage.classList.remove("is-visible");
  }, 2600);
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "audio") {
      const volume = document.querySelector("#bgm-volume");
      showStatus(volume?.value === "0" ? "배경음악 음량을 조절할 수 있습니다." : "배경음악 기능은 아직 연결되지 않았습니다.");
      return;
    }
    showStatus(messages[action] ?? "아직 준비 중인 기능입니다.");
  });
});

document.documentElement.classList.add("app-ready");
console.info("[Hodumaroo] Lobby layout initialized.");

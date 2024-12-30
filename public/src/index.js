const sectors = [
  { color: "#C70005", img: "./coin.png", label: "$50" },
  { color: "#FEFBF4", img: "./bomb.png", label: "Bomb!" },
  { color: "#C70005", img: "./coin.png", label: "$100" },
  { color: "#FEFBF4", img: "./bomb.png", label: "Bomb!" },
  {
    color: "#C70005",
    img: "./coin.png",
    label: "$200 + Bonus",
  },
  { color: "#FEFBF4", img: "./bomb.png", label: "Bomb!" },
  { color: "#C70005", img: "./coin.png", label: "$75" },
  { color: "#FEFBF4", img: "./coin.png", label: "$25" },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991;
let angVel = 0;
let ang = 0;
let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  const img = new Image();
  img.src = sector.img;
  img.onload = () => {
    const imgX = rad + (rad / 2) * Math.cos(ang + arc / 2);
    const imgY = rad + (rad / 2) * Math.sin(ang + arc / 2);
    const imgSize = rad / 3;

    ctx.save();

    ctx.translate(imgX, imgY);

    ctx.rotate(ang + arc / 2 + Math.PI / 2);

    ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

    ctx.restore();
  };

  ctx.restore();
}

function rotate() {
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
}

function frame() {
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false;
    return;
  }

  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel;
  ang %= TAU;
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate();
  engine();
  spinEl.addEventListener("click", () => {
    if (!angVel) angVel = rand(0.25, 0.45);
    spinButtonClicked = true;
  });
}

init();
const lottieAnimations = [
  "https://lottie.host/9ca48b1d-4c7b-4635-8e8b-0ccc1ad33259/hGZzyADqpu.lottie",
];
let userBalance = 100; // Initial balance
let lastAmount = 0;

// Update balance and last amount in the UI
function updateBalanceUI() {
  const balanceEl = document.querySelector("#balance");
  const lastAmountEl = document.querySelector("#last-amount");

  balanceEl.textContent = `Balance: $${userBalance}`;
  lastAmountEl.textContent = `Last Amount: $${lastAmount}`;
}

events.addListener("spinEnd", (sector) => {
  const popup = document.querySelector("#popup");
  const popupText = document.querySelector("#popup-text");
  const lottieContainer = document.querySelector("#lottie");
  const sectorImage = document.querySelector("#sector-image");

  // Update balance and last amount
  if (sector.label.includes("Bomb")) {
    lastAmount = -userBalance; // Lose all balance if it's a bomb
    userBalance = 0;
  } else {
    const amountWon = parseInt(sector.label.match(/\d+/)[0]); // Extract amount
    lastAmount = amountWon;
    userBalance += amountWon;
  }

  // Update balance UI
  updateBalanceUI();

  popupText.textContent = `You ${lastAmount > 0 ? "won" : "lost"} $${Math.abs(
    lastAmount
  )}!`;
  sectorImage.src = sector.img;

  // Handle lottie animation
  lottieContainer.innerHTML = "";
  const randomLottie =
    lottieAnimations[Math.floor(Math.random() * lottieAnimations.length)];
  const lottieElement = document.createElement("dotlottie-player");
  lottieElement.setAttribute("src", randomLottie);
  lottieElement.setAttribute("background", "transparent");
  lottieElement.setAttribute("speed", "1");
  lottieElement.style.width = "500px";
  lottieElement.style.height = "500px";
  lottieElement.setAttribute("loop", "");
  lottieElement.setAttribute("autoplay", "");

  lottieContainer.style.position = "absolute";
  lottieContainer.style.top = "20%";
  lottieContainer.style.left = "45%";
  lottieContainer.style.transform = "translate(-70%, -70%)";

  sectorImage.style.position = "relative";
  sectorImage.style.width = "200px";
  sectorImage.style.height = "200px";
  sectorImage.style.zIndex = "999";

  lottieContainer.appendChild(lottieElement);

  popup.classList.add("show");
});

document.querySelector("#close-popup").addEventListener("click", () => {
  const popup = document.querySelector("#popup");
  popup.classList.remove("show");
});

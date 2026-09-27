const CORRECT_PASSWORD = "1111";
let enteredPassword = "";

// Screens
const lockScreen = document.getElementById("lock-screen");
const envelopeScreen = document.getElementById("envelope-screen");
const notebookScreen = document.getElementById("notebook-screen");

// Numpad Elements
const dots = document.querySelectorAll(".dot");
const numBtns = document.querySelectorAll(".num-btn");
const envelopeBtn = document.getElementById("envelope-btn");

// Notebook Elements
const pageContent = document.getElementById("page-content");
const pageIndicator = document.getElementById("page-indicator");
const pageFooter = document.getElementById("page-footer");
const notebookContainer = document.getElementById("notebook-container");

// Final Form Elements
const finalForm = document.getElementById("final-form");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const answerSection = document.getElementById("answer-section");
const btnSubmit = document.getElementById("btn-submit");
const customAnswer = document.getElementById("custom-answer");
const successMsg = document.getElementById("success-msg");

// --- NUMPAD LOGIC ---
const burstHeartIcons = ["❤️", "💖", "💕", "💗", "🌸", "✨"];

function triggerHeartBurst(x, y) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");
        particle.className = "heart-burst-particle";
        particle.innerText = burstHeartIcons[Math.floor(Math.random() * burstHeartIcons.length)];

        // Góc bung ngẫu nhiên và khoảng cách bay
        const angle = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const scale = 0.8 + Math.random() * 0.7;
        const rot = (Math.random() - 0.5) * 60;
        const fontSize = 14 + Math.random() * 8;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.fontSize = `${fontSize}px`;
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        particle.style.setProperty("--scale", scale);
        particle.style.setProperty("--rot", `${rot}deg`);

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 680);
    }
}

numBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        triggerHeartBurst(centerX, centerY);

        const val = btn.getAttribute("data-val");

        if (val === "clear") {
            enteredPassword = enteredPassword.slice(0, -1);
        } else if (val !== null && val !== "" && enteredPassword.length < 4) {
            enteredPassword += val;
        }

        updateDots();

        if (enteredPassword.length === 4) {
            setTimeout(checkPassword, 300);
        }
    });
});

function updateDots() {
    dots.forEach((dot, index) => {
        if (index < enteredPassword.length) {
            dot.classList.add("filled");
            dot.classList.remove("error");
        } else {
            dot.classList.remove("filled");
            dot.classList.remove("error");
        }
    });
}

function checkPassword() {
    if (enteredPassword === CORRECT_PASSWORD) {
        lockScreen.classList.remove("active");
        envelopeScreen.classList.add("active");
        startFloatingImages(); // Bắt đầu cho ảnh bay ngay khi vừa mở khóa thành công
    } else {
        dots.forEach(dot => dot.classList.add("error"));
        setTimeout(() => {
            enteredPassword = "";
            updateDots();
        }, 500);
    }
}

const mainEnvelope = document.getElementById("main-envelope");
const envelopeHint = document.getElementById("envelope-hint");
const cardStack = document.getElementById("card-stack");
const swipeHint = document.getElementById("swipe-hint");

// --- ENVELOPE LOGIC ---
let isEnvelopeOpened = false;
envelopeBtn.addEventListener("click", () => {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Kích hoạt hiệu ứng mở nắp phong bì và lá thư trồi lên
    mainEnvelope.classList.add("opened");
    if (envelopeHint) {
        envelopeHint.innerText = "Đang mở thư... ✨";
        envelopeHint.style.animation = "none";
    }

    // Chờ hiệu ứng trồi thư hoàn tất rồi chuyển cảnh mượt sang các lá thư xếp chồng
    setTimeout(() => {
        envelopeScreen.classList.remove("active");
        notebookScreen.classList.add("active");
        startFloatingImages();
        initCardStack();
    }, 1800);
});

// --- STACKED CARDS LOGIC ---
const pages = [
    "chữ dòng dòng một trang một.\n tối đa bảy chữ trên 1 dòng.",
    "tối đa ba dòng trên 1 trang.\ntối đa bảy chữ trên 1 dòng.\ntối đa bảy chữ trên 1 dòng.",
    "tối đa bảy chữ trên 1 dòng.\ntối đa bảy chữ trên 1 dòng.\ntối đa bảy chữ trên 1 dòng."
];

const gifList = ["gif/1.gif", "gif/2.gif", "gif/3.gif"];
let activeCardIndex = 0;
let typingTimeout = null;

function initCardStack() {
    cardStack.innerHTML = "";
    activeCardIndex = 0;

    pages.forEach((text, index) => {
        const card = document.createElement("div");
        card.className = "letter-card";
        card.dataset.index = index;

        // Xếp chồng các lá thư với góc xoay ngẫu nhiên nhẹ nhàng
        const rot = index === 0 ? 0 : (index === 1 ? 2.5 : -3);
        const offsetY = index * 6;
        const scale = 1 - index * 0.02;
        const zIndex = 10 - index;

        card.style.transform = `rotate(${rot}deg) translateY(${offsetY}px) scale(${scale})`;
        card.style.zIndex = zIndex;

        const currentGif = gifList[index % gifList.length];

        card.innerHTML = `
            <div class="card-text" id="card-text-${index}"></div>
            <div class="card-bottom-bar">
                <span class="sticker-badge"><img src="${currentGif}" alt="sticker" class="card-sticker-gif"></span>
                <span class="card-counter">${index + 1}/${pages.length}</span>
            </div>
        `;

        cardStack.appendChild(card);
        setupCardSwipe(card, index);
    });

    // Bắt đầu gõ chữ cho lá thư đầu tiên
    typeCardText(0);
}

function typeCardText(index) {
    if (index >= pages.length) return;

    const textElem = document.getElementById(`card-text-${index}`);
    if (!textElem) return;

    const fullText = pages[index];
    textElem.innerHTML = "";
    let charIdx = 0;

    if (typingTimeout) clearTimeout(typingTimeout);

    function typeChar() {
        if (charIdx < fullText.length) {
            textElem.innerHTML += fullText.charAt(charIdx);
            charIdx++;
            typingTimeout = setTimeout(typeChar, 45);
        }
    }

    typeChar();
}

function setupCardSwipe(card, index) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasMoved = false;

    // Touch events for Mobile
    card.addEventListener("touchstart", (e) => {
        if (parseInt(card.dataset.index) !== activeCardIndex) return;
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        hasMoved = false;
        card.classList.add("dragging");
    }, { passive: true });

    card.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;

        if (Math.abs(diffX) > 5) {
            hasMoved = true;
            card.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.08}deg)`;
        }
    }, { passive: true });

    card.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove("dragging");

        const diffX = currentX - startX;
        if (Math.abs(diffX) > 60 || !hasMoved) {
            // Vuốt đủ mạnh hoặc chỉ chạm nhẹ -> Cho lá thư bay đi
            discardCard(card, diffX >= 0 ? 1 : -1);
        } else {
            // Chưa đủ lực vuốt -> Trở về vị trí cũ
            card.style.transform = `rotate(0deg) translateY(0) scale(1)`;
        }
    });

    // Mouse events for Desktop
    card.addEventListener("mousedown", (e) => {
        if (parseInt(card.dataset.index) !== activeCardIndex) return;
        startX = e.clientX;
        currentX = startX;
        isDragging = true;
        hasMoved = false;
        card.classList.add("dragging");
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging || parseInt(card.dataset.index) !== activeCardIndex) return;
        currentX = e.clientX;
        const diffX = currentX - startX;

        if (Math.abs(diffX) > 5) {
            hasMoved = true;
            card.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.08}deg)`;
        }
    });

    window.addEventListener("mouseup", () => {
        if (!isDragging || parseInt(card.dataset.index) !== activeCardIndex) return;
        isDragging = false;
        card.classList.remove("dragging");

        const diffX = currentX - startX;
        if (Math.abs(diffX) > 60) {
            discardCard(card, diffX >= 0 ? 1 : -1);
        } else if (!hasMoved) {
            // Click thông thường trên desktop -> Tự bay sang phải
            discardCard(card, 1);
        } else {
            card.style.transform = `rotate(0deg) translateY(0) scale(1)`;
        }
    });
}

function discardCard(card, direction) {
    if (card.dataset.discarded === "true") return;
    card.dataset.discarded = "true";

    // Thêm class bay biến mất
    if (direction > 0) {
        card.classList.add("fly-right");
    } else {
        card.classList.add("fly-left");
    }

    activeCardIndex++;

    setTimeout(() => {
        card.remove();

        // Cập nhật vị trí của các lá thư còn lại trong chồng
        const remainingCards = cardStack.querySelectorAll(".letter-card:not([data-discarded='true'])");

        if (remainingCards.length > 0) {
            remainingCards.forEach((c, idx) => {
                c.dataset.index = activeCardIndex + idx;
                if (idx === 0) {
                    c.style.transform = `rotate(0deg) translateY(0) scale(1)`;
                    c.style.zIndex = "10";
                } else {
                    const rot = idx === 1 ? 2.5 : -3;
                    const offsetY = idx * 6;
                    const scale = 1 - idx * 0.02;
                    c.style.transform = `rotate(${rot}deg) translateY(${offsetY}px) scale(${scale})`;
                    c.style.zIndex = 10 - idx;
                }
            });

            // Gõ chữ lá thư tiếp theo
            typeCardText(activeCardIndex);
        } else {
            // Đã đọc hết tất cả các lá thư -> Hiện câu hỏi tỏ tình
            if (swipeHint) swipeHint.style.display = "none";
            cardStack.style.display = "none";
            finalForm.style.display = "block";
        }
    }, 350);
}

// --- FLOATING IMAGES LOGIC ---
const photoList = [
    "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg",
    "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg",
    "13.jpg", "14.png", "15.jpg", "16.png", "17.jpg", "18.jpg", "19.jpg"
];

let isFloatingStarted = false;
function startFloatingImages() {
    if (isFloatingStarted) return;
    isFloatingStarted = true;

    const container = document.getElementById("floating-images-container");
    if (!container) return;

    function spawnPhoto() {
        const randomPhoto = photoList[Math.floor(Math.random() * photoList.length)];
        const img = document.createElement("img");
        img.src = `pic/${randomPhoto}`;
        img.className = "float-img";

        // Vị trí ngang ngẫu nhiên
        const maxX = Math.max(20, window.innerWidth - 120);
        const startX = Math.random() * maxX;
        img.style.left = `${startX}px`;

        // Kích thước ngẫu nhiên hài hòa
        const scale = 0.6 + Math.random() * 0.6;
        img.style.transform = `scale(${scale})`;

        container.appendChild(img);

        // Xóa sau khi hoàn tất animation bay lên
        setTimeout(() => {
            img.remove();
        }, 15000);
    }

    // Xuất hiện 1 ảnh đầu tiên ngay khi mở khóa
    spawnPhoto();

    // Điều chỉnh tần suất thưa hơn: 3 giây trên mobile, 2.2 giây trên máy tính
    const isMobile = window.innerWidth <= 768;
    const intervalTime = isMobile ? 3000 : 2200;
    setInterval(spawnPhoto, intervalTime);
}

// --- FINAL FORM LOGIC (DODGING BUTTON) ---
btnNo.addEventListener("mouseover", moveBtn);
btnNo.addEventListener("pointerdown", moveBtn);
btnNo.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveBtn(e);
}, { passive: false });
btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveBtn(e);
});

function moveBtn(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }

    // Gắn trực tiếp vào body để không bị ảnh hưởng bởi transform hay overflow của phần tử cha
    if (btnNo.parentElement !== document.body) {
        document.body.appendChild(btnNo);
    }

    const btnWidth = btnNo.offsetWidth || 90;
    const btnHeight = btnNo.offsetHeight || 44;

    const padding = 20;
    const maxX = Math.max(padding, window.innerWidth - btnWidth - padding);
    const maxY = Math.max(padding, window.innerHeight - btnHeight - padding);

    let randomX = padding;
    let randomY = padding;
    let attempts = 0;

    const currentRect = btnNo.getBoundingClientRect();
    do {
        randomX = Math.floor(Math.random() * (maxX - padding)) + padding;
        randomY = Math.floor(Math.random() * (maxY - padding)) + padding;
        attempts++;
    } while (
        attempts < 20 &&
        Math.abs(randomX - currentRect.left) < 80 &&
        Math.abs(randomY - currentRect.top) < 80
    );

    btnNo.style.position = 'fixed';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.right = 'auto';
    btnNo.style.bottom = 'auto';
    btnNo.style.zIndex = '999999';
    btnNo.style.transition = 'left 0.2s ease-out, top 0.2s ease-out, transform 0.2s ease';
}

btnYes.addEventListener("click", () => {
    answerSection.style.display = "block";
    btnYes.style.display = "none";
    btnNo.style.display = "none";
    document.querySelector(".question-text").innerText = "Yêu em! Cho anh một câu trả lời nhé 😘";
});

btnSubmit.addEventListener("click", async () => {
    const answer = customAnswer.value.trim();
    if (!answer) return;

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Đang gửi...";

    try {
        await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answer: answer })
        });
    } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
    }

    // Chuyển sang hiệu ứng đóng gói thư ngược lại
    setTimeout(() => {
        // Cập nhật chữ trên lá thư trước khi rút vào trong bao
        const paperText = document.querySelector(".paper-preview-text");
        if (paperText) {
            paperText.innerText = "Đã nhận lời ❤️";
        }

        // Hiện phong bì ở trạng thái đang mở
        notebookScreen.classList.remove("active");
        envelopeScreen.classList.add("active");
        mainEnvelope.classList.add("opened");

        if (envelopeHint) {
            envelopeHint.innerText = "Đang đóng gói và niêm phong thư... 💌";
            envelopeHint.style.animation = "pulse-opacity 1.5s infinite";
        }

        // Bắt đầu chu trình gập thư ngược lại:
        setTimeout(() => {
            // Rút thư vào -> Nắp gập xuống -> Dán sáp trái tim niêm phong
            mainEnvelope.classList.remove("opened");

            // Sau khi con dấu dán kín hoàn tất (khoảng 1.4s):
            setTimeout(() => {
                if (envelopeHint) {
                    envelopeHint.innerHTML = "Thư đã được gửi đi thành công! Cảm ơn em ❤️✨";
                    envelopeHint.style.color = "#fff";
                    envelopeHint.style.fontSize = "19px";
                    envelopeHint.style.textShadow = "0 2px 10px rgba(255, 77, 109, 0.8)";
                    envelopeHint.style.animation = "pulse-opacity 2.5s infinite";
                }
            }, 1400);
        }, 600);
    }, 400);
});

// --- BACKGROUND HEARTS LOGIC ---
function startBackgroundHearts() {
    const container = document.getElementById("bg-hearts-container");
    if (!container) return;

    setInterval(() => {
        const heart = document.createElement("div");
        heart.innerHTML = "❤️";
        heart.className = "bg-heart";

        // Random horizontal position
        heart.style.left = Math.random() * 100 + "vw";

        // Random animation duration between 5s and 15s
        heart.style.animationDuration = (Math.random() * 10 + 5) + "s";

        // Random size between 10px and 25px
        const size = Math.random() * 15 + 10;
        heart.style.fontSize = size + "px";

        container.appendChild(heart);

        // Remove heart after animation finishes
        setTimeout(() => {
            heart.remove();
        }, 15000);
    }, 500); // Create a new heart every 0.5s
}

// Khởi chạy ngay khi load trang
startBackgroundHearts();

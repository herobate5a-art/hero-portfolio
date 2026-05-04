const firebaseConfig = {
    apiKey: "AIzaSyA9rjaTxTY5mBPg1VDrjFkNV7yv78nqCeo",
    authDomain: "hero-portfolio-1c64b.firebaseapp.com",
    projectId: "hero-portfolio-1c64b",
    storageBucket: "hero-portfolio-1c64b.firebasestorage.app",
    messagingSenderId: "442956210324",
    appId: "1:442956210324:web:b43e09be0e06d018831481",
    measurementId: "G-LDP1QBFRND"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUser = null;
let completeLoaderSequence = null;

function showUserUI(name, photo) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("user-info").style.display = "flex";
    document.getElementById("user-name").innerText = name;
    document.getElementById("user-photo").src = photo;

    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.cancel();
    }
}

function restoreUserSession() {
    if (localStorage.getItem("hero_is_logged") === "true") {
        currentUser = {
            name: localStorage.getItem("hero_user_name"),
            photo: localStorage.getItem("hero_user_photo")
        };
        showUserUI(currentUser.name, currentUser.photo);
    }
}

function handleCredentialResponse(response) {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));
    currentUser = { name: payload.name, photo: payload.picture };
    localStorage.setItem("hero_user_name", currentUser.name);
    localStorage.setItem("hero_user_photo", currentUser.photo);
    localStorage.setItem("hero_is_logged", "true");
    showUserUI(currentUser.name, currentUser.photo);
}

const reviewForm = document.getElementById("reviewForm");
reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
        alert("Please sign in with Google to leave a review!");
        return;
    }

    const rating = document.querySelector('input[name="rating"]:checked').value;
    const text = document.getElementById("reviewText").value;

    try {
        await db.collection("reviews").add({
            name: currentUser.name,
            photo: currentUser.photo,
            rating: parseInt(rating, 10),
            text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        reviewForm.reset();
        alert("Thank you for your feedback!");
    } catch (error) {
        console.error("Error adding review:", error);
    }
});

db.collection("reviews").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    const list = document.getElementById("reviewsList");
    list.innerHTML = "";
    let totalRating = 0;
    let count = 0;

    snapshot.forEach((doc) => {
        const data = doc.data();
        totalRating += data.rating;
        count += 1;
        const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);

        list.innerHTML += `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${data.photo}" alt="${data.name}">
                        <span class="reviewer-name">${data.name}</span>
                    </div>
                    <span class="review-stars">${stars}</span>
                </div>
                <div class="review-text">"${data.text}"</div>
            </div>
        `;
    });

    if (count > 0) {
        const avg = (totalRating / count).toFixed(1);
        document.getElementById("avg-score").innerText = avg;
        document.getElementById("avg-stars").innerText = "★".repeat(Math.round(avg));
        document.getElementById("review-count").innerText = `Based on ${count} reviews`;
    }
    // Re-run tilt setup to include new review cards
    setupCardTilt();
});

const cSound = document.getElementById("clickSound");
function playSound() {
    cSound.currentTime = 0;
    cSound.volume = 0.2;
    cSound.play();
}

function initLoaderExperience() {
    const loader = document.getElementById("loader");
    const bar = document.getElementById("loaderBarFill");
    const percent = document.getElementById("loaderPercent");
    const subtitle = document.getElementById("loaderSubtitle");
    const title = document.getElementById("loaderTitle");

    if (!loader || !bar || !percent || !subtitle || !title) {
        completeLoaderSequence = () => {};
        return;
    }

    // Idle animation for loader title
    title.style.animation = "loaderFloat 2s ease-in-out infinite";
    subtitle.style.animation = "loaderPulse 1.5s ease-in-out infinite";

    const steps = [
        "Calibrating live visuals...",
        "Syncing interaction physics...",
        "Optimizing portfolio performance...",
        "Applying 2026 interface polish...",
        "Finalizing immersive experience..."
    ];

    let progress = 0;
    let loaded = false;
    let stageIndex = 0;
    let stageTick = 0;

    const tick = setInterval(() => {
        const cap = loaded ? 100 : 93;
        const speed = loaded ? 2.8 : 0.95;
        progress = Math.min(cap, progress + Math.random() * speed + 0.35);
        const p = Math.floor(progress);
        bar.style.width = `${p}%`;
        percent.textContent = `${p}%`;

        stageTick += 1;
        if (stageTick % 18 === 0 && stageIndex < steps.length - 1) {
            stageIndex += 1;
            subtitle.textContent = steps[stageIndex];
        }

        if (progress >= 100) {
            clearInterval(tick);
            subtitle.textContent = "Experience ready.";
            setTimeout(() => loader.classList.add("loader-hidden"), 260);
        }
    }, 42);

    title.textContent = "Booting Hero Portfolio • 2026 Edition";
    completeLoaderSequence = () => {
        loaded = true;
    };
}

// Add keyframes for loader animations via JS
const style = document.createElement('style');
style.innerHTML = `
@keyframes loaderFloat {
    0%, 100% { transform: translateY(0); text-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
    50% { transform: translateY(-5px); text-shadow: 0 0 35px rgba(56, 189, 248, 0.7); }
}
@keyframes loaderPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
}
`;
document.head.appendChild(style);

function initLiveBackground() {
    const canvas = document.getElementById("liveBg");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    const particleCount = 52;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2.2 + 0.7
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(56, 189, 248, 0.65)";

        for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i += 1) {
            for (let j = i + 1; j < particles.length; j += 1) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 120) {
                    const alpha = 0.16 * (1 - dist / 120);
                    ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
}

const details = {
    camel: {
        title: "🐫 Full Movement Controlled Animal + Animations",
        body: `<h3>🐪 Full Mount Mechanics</h3><ul><li>Seamless mounting and dismounting system for players.</li><li>Custom physics integration for realistic movement across terrain.</li><li>Smooth camera transition when riding.</li></ul><h3>🎬 Complex Animation States</h3><ul><li>Full suite of custom animations: Idle, Walking, Running, and Sitting.</li><li>Frame-perfect synchronization between player and animal animations.</li></ul>`
    },
    inventory: {
        title: "🚀 Advanced Roblox Inventory System",
        body: `<h3>🎒 Smart Inventory Management</h3><ul><li>Clean and organized grid layout for items.</li><li>Supports multiple categories: Weapons, Armor, Consumables.</li><li>Automatic real-time updates on item gain or loss.</li></ul><h3>🧠 Object-Oriented Architecture</h3><ul><li>Built with scalable OOP principles for easy expansion.</li><li>Modular design for seamless integration with shops and trading.</li></ul><h3>🛡️ Secure Server Validation</h3><ul><li>All inventory actions are verified on the server to prevent exploits.</li><li>DataStore integration for persistent item saving.</li></ul>`
    },
    cannon: {
    title: "💣 Advanced Physics Cannon System",
    body: `
    <h3>🧠 Object-Oriented Architecture</h3>
    <ul>
        <li>Modular cannon system built using OOP principles.</li>
        <li>Separate classes for Cannon, Projectile, and Physics Handler.</li>
        <li>Easily extendable for multiple weapon types.</li>
    </ul>

    <h3>🌍 Realistic Physics Simulation</h3>
    <ul>
        <li>Projectile motion based on real physics equations.</li>
        <li>Velocity, gravity, and force applied dynamically.</li>
        <li>Arc-based shooting instead of straight raycasting.</li>
    </ul>

    <h3>⚙️ Dynamic Force & Power Control</h3>
    <ul>
        <li>Adjustable launch power affecting distance and speed.</li>
        <li>Angle-based shooting system.</li>
        <li>Supports different projectile weights and behaviors.</li>
    </ul>

    <h3>🛡️ Server-Side Handling</h3>
    <ul>
        <li>All physics calculations validated on server.</li>
        <li>Prevents client-side manipulation.</li>
    </ul>
    `
},
    spin: {
        title: "🎡 Advanced Roblox Spin Wheel System",
        body: `<h3>🎯 Weighted Reward System</h3><ul><li>Advanced rarity-based rewards with custom drop chances.</li><li>Dynamic Luck Multiplier system for GamePass boosts.</li></ul><h3>🎨 Dynamic Generation</h3><ul><li>Wheel UI builds automatically based on reward tables.</li><li>Smooth TweenService animations with immersive audio feedback.</li></ul><h3>🛡️ Anti-Exploit Measures</h3><ul><li>Server-authoritative spin results to prevent reward manipulation.</li><li>Daily free spin system with DataStore-backed cooldowns.</li></ul>`
    },
    stamina: {
        title: "⚡ Advanced Stamina, Sprint & Dash System",
        body: `<h3>⚡ Stamina-Based Movement</h3><ul><li>Dynamic stamina drain for sprinting and dashing.</li><li>Smart regeneration system with configurable delays.</li></ul><h3>🏃 Sprint & Dash Mechanics</h3><ul><li>Toggle or Hold sprint modes with custom FOV effects.</li><li>State detection (Jumping, Falling, Running) to adjust behavior.</li></ul><h3>🎬 Animation Integration</h3><ul><li>Smooth blending between walk and sprint animations based on speed.</li><li>Animation slows down when airborne.</li></ul>`
    },
    clicker: {
        title: "🖱️ Advanced Click Simulator & Rebirth System",
        body: `<h3>🖱️ Clicker Gameplay Loop</h3><ul><li>Highly optimized click progression with anti-spam protection.</li><li>Dynamic multipliers that scale based on player stats.</li></ul><h3>🔄 Rebirth Progression</h3><ul><li>Exponential rebirth cost scaling for long-term engagement.</li><li>Permanent bonuses and gem rewards upon rebirthing.</li></ul><h3>📊 Visual Feedback</h3><ul><li>Animated reward pop-ups and real-time progress bars.</li></ul>`
    },
    trading: {
        title: "🔄 Advanced Player Trading System",
        body: `<h3>🔐 Secure Trade Validation</h3><ul><li>Double confirmation system with countdown timers to prevent scams.</li><li>Unique Trading IDs to track every item and prevent duplication.</li></ul><h3>🖼️ Item Preview System</h3><ul><li>High-quality 3D Viewport previews for items during trade.</li><li>Real-time inventory synchronization for both players.</li></ul>`
    },
    hatching: {
        title: "🥚 Full Advanced Pet Hatching System",
        body: `<h3>🎲 Weighted Drop Rates</h3><ul><li>Fully configurable pet rarities: Common to Mythic and Secret.</li><li>Dramatic hatch sequence with camera manipulation and effects.</li></ul><h3>⚡ Auto-Hatch & Multi-Hatch</h3><ul><li>Support for continuous auto-hatching and triple hatching features.</li><li>Inventory integration to automatically store new pets.</li></ul>`
    },
    hitbox: {
        title: "⚔️ Advanced Modular Combat System",
        body: `<h3>⚔️ Custom Server-Side Hitboxes</h3><ul><li>Accurate melee detection to ensure fair PvP interactions.</li><li>Prevents fake hits and range-based client exploits.</li></ul><h3>🛡️ Universal Blocking & Combos</h3><ul><li>Weapon-agnostic blocking system with high-quality animations.</li><li>Preloaded animation system to eliminate combat lag.</li></ul>`
    },
    gsm: {
        title: "⏳ GameSystemsManager (Open Source Library)",
        body: `<h3>⏱️ High-Performance Timer System</h3><p>GameSystemsManager (GSM) is a professional Open-Source Luau module designed for high-performance management of game rounds, timers, and automated reward cycles.</p><h3>🧩 Key Features</h3><ul><li>Scalable timer architecture for complex round-based games.</li><li>Frame-independent synchronization across client and server.</li><li>Lightweight and modular, easily integrated into any codebase.</li></ul>`
    }
};

const systemVideoFiles = {
    camel: "Full control and animations CamelSystem.mp4",
    inventory: "InventorySystem&Armor.mp4",
    spin: "SpienWheel.mp4",
    stamina: "Stamina and Sprint System.mp4",
    clicker: "ClickSemlutor&RebirthSystem.mp4",
    hatching: "HatchingPets.mp4",
    hitbox: "CombatSystem.mp4",
    trading: null,
    gsm: null
};

function getModalMediaMarkup(key) {
    const fileName = systemVideoFiles[key];
    const fallbackMarkup = `
        <div class="modal-media-fallback">
            <span class="pro-logo-text">HeroDev!</span>
        </div>
    `;

    // Trading is intentionally logo-only; missing files also gracefully fall back.
    if (!fileName) {
        return `<div class="modal-media">${fallbackMarkup}</div>`;
    }

    const encodedSrc = encodeURI(`SystemsVideos/${fileName}`);
    return `
        <div class="modal-media is-loading">
            <video class="modal-system-video" autoplay muted loop playsinline preload="metadata">
                <source src="${encodedSrc}" type="video/mp4">
            </video>
            <div class="modal-media-fallback is-hidden">
                <span class="pro-logo-text">HeroDev!</span>
            </div>
        </div>
    `;
}

function wireModalMediaFallback() {
    const body = document.getElementById("mBody");
    if (!body) return;
    const media = body.querySelector(".modal-media");
    const video = body.querySelector(".modal-system-video");
    const fallback = body.querySelector(".modal-media-fallback");
    if (!media || !video || !fallback) return;

    const showFallback = () => {
        media.classList.remove("is-loading");
        video.classList.add("is-hidden");
        fallback.classList.remove("is-hidden");
    };

    video.addEventListener("error", showFallback, { once: true });
    const source = video.querySelector("source");
    if (source) source.addEventListener("error", showFallback, { once: true });

    video.addEventListener("loadeddata", () => {
        media.classList.remove("is-loading");
        fallback.classList.add("is-hidden");
        video.classList.remove("is-hidden");
    }, { once: true });
}

function openSystem(key) {
    const data = details[key];
    if (!data) return;

    const modalTitle = document.getElementById("mTitle");
    const modalBody = document.getElementById("mBody");
    if (!modalTitle || !modalBody) return;

    modalTitle.innerText = data.title;
    modalBody.innerHTML = `${getModalMediaMarkup(key)}${data.body}`;
    wireModalMediaFallback();
    document.getElementById("modalOverlay").style.display = "flex";
    playSound();
}

function closeModal() {
    const modalVideo = document.querySelector("#mBody .modal-system-video");
    if (modalVideo) {
        modalVideo.pause();
        modalVideo.currentTime = 0;
    }
    document.getElementById("modalOverlay").style.display = "none";
    playSound();
}

function joinGame(url) {
    playSound();
    window.open(url, "_blank");
}

function showCopyToast(message) {
    const toast = document.getElementById("copyToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showCopyToast._t);
    showCopyToast._t = setTimeout(() => {
        toast.classList.remove("show");
    }, 1350);
}

function setupDiscordCopy() {
    const discordBtn = document.getElementById("discordCopyBtn");
    if (!discordBtn) return;
    discordBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const discordId = discordBtn.getAttribute("data-discord-id") || "";
        if (!discordId) return;
        try {
            await navigator.clipboard.writeText(discordId);
            playSound();
            showCopyToast("Discord ID copied!");
        } catch (err) {
            console.error("Failed to copy Discord ID:", err);
            showCopyToast("Copy failed");
        }
    });
}

function setupEmailCopy() {
    const copyEmailBtn = document.getElementById("copyEmailBtn");
    if (!copyEmailBtn) return;
    copyEmailBtn.addEventListener("click", async () => {
        const email = copyEmailBtn.getAttribute("data-email") || "";
        if (!email) return;
        try {
            await navigator.clipboard.writeText(email);
            playSound();
            showCopyToast("Copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy email:", err);
            showCopyToast("Copy failed");
        }
    });
}

function setupProjectFilters() {
    const filtersWrap = document.getElementById("projectFilters");
    if (!filtersWrap) return;
    const chips = filtersWrap.querySelectorAll(".filter-chip");
    const cards = document.querySelectorAll(".projects .card");
    const fadeMs = 220;

    const applyFilter = (filterKey) => {
        cards.forEach((card) => {
            const categories = (card.getAttribute("data-category") || "").split(/\s+/).filter(Boolean);
            const visible = filterKey === "all" || categories.includes(filterKey);
            if (visible) {
                card.classList.remove("filter-hidden");
                requestAnimationFrame(() => card.classList.remove("filter-out"));
            } else {
                card.classList.add("filter-out");
                setTimeout(() => {
                    if (card.classList.contains("filter-out")) card.classList.add("filter-hidden");
                }, fadeMs);
            }
        });
    };

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((x) => x.classList.remove("active"));
            chip.classList.add("active");
            const key = chip.getAttribute("data-filter") || "all";
            applyFilter(key);
        });
    });
}

function setupStatsCountup() {
    const counters = document.querySelectorAll(".stat-number[data-target], [data-countup][data-target]");
    if (counters.length === 0) return;

    const animateCounter = (el, duration = 1200) => {
        const target = Number(el.getAttribute("data-target") || 0);
        const suffix = el.getAttribute("data-suffix") || "";
        const prefix = el.getAttribute("data-prefix") || "";
        if (!Number.isFinite(target)) return;
        let start = null;
        const step = (ts) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            el.textContent = `${prefix}${value}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                if (counter.dataset.counted === "true") {
                    observer.unobserve(counter);
                    return;
                }
                counter.dataset.counted = "true";
                animateCounter(counter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    counters.forEach((counter) => io.observe(counter));
}

const cursor = document.querySelector(".cursor");
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let cursorCurrentX = cursorX;
let cursorCurrentY = cursorY;

document.addEventListener("mousemove", (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    cursorCurrentX += (cursorX - cursorCurrentX) * 0.28;
    cursorCurrentY += (cursorY - cursorCurrentY) * 0.28;
    cursor.style.left = `${cursorCurrentX}px`;
    cursor.style.top = `${cursorCurrentY}px`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll(".hidden").forEach((el) => observer.observe(el));

function setupStaggerReveal() {
    const groups = [
        document.querySelectorAll("#libraries .book-card"),
        document.querySelectorAll("#contact .social-btn"),
        document.querySelectorAll("#feedback .feedback-form-box, #feedback .feedback-list-box")
    ];

    groups.forEach((group) => {
        group.forEach((item, index) => {
            item.classList.add("reveal-item");
            item.style.transitionDelay = `${index * 40}ms`;
        });
    });
}
setupStaggerReveal();

function setupProjectCardViewportReveal() {
    const cards = document.querySelectorAll(".projects .card");
    if (cards.length === 0) return;

    cards.forEach((card, index) => {
        card.dataset.revealed = "false";
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.transitionDelay = `${(index % 3) * 120}ms`;
        card.style.willChange = "opacity, transform";
    });

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            if (card.dataset.revealed === "true") {
                observer.unobserve(card);
                return;
            }

            const viewportH = window.innerHeight || document.documentElement.clientHeight;
            const fullyVisibleByBounds = entry.boundingClientRect.top >= 0 && entry.boundingClientRect.bottom <= viewportH;
            const sufficientlyVisible = entry.intersectionRatio >= 0.6 || fullyVisibleByBounds;
            if (!sufficientlyVisible) return;

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

            const finalizeReveal = () => {
                card.dataset.revealed = "true";
                card.style.transitionDelay = "0ms";
                card.style.willChange = "";
                card.style.transition = "";
                card.style.opacity = "";
                card.style.transform = "";
                observer.unobserve(card);
            };

            card.addEventListener("transitionend", finalizeReveal, { once: true });
            // Fallback in case transitionend is skipped by user interactions.
            setTimeout(finalizeReveal, 750);
        });
    }, {
        threshold: [0.1, 0.25, 0.45, 0.6, 0.8, 1],
        rootMargin: "0px 0px -10px 0px"
    });

    cards.forEach((card) => cardObserver.observe(card));
}

const header = document.querySelector("header");
const navLinks = document.querySelectorAll("#nav-menu a");
const sections = document.querySelectorAll("section[id]");
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
const stickyHireCta = document.getElementById("stickyHireCta");

function updateOnScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;

    if (scrollTop > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

    if (scrollTop > 500) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }

    if (stickyHireCta) {
        if (scrollTop > 360) stickyHireCta.classList.add("show");
        else stickyHireCta.classList.remove("show");
    }

    let activeId = "";
    sections.forEach((section) => {
        const top = section.offsetTop - 180;
        if (scrollTop >= top) activeId = section.getAttribute("id");
    });

    navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${activeId}`) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

if (stickyHireCta) {
    stickyHireCta.addEventListener("click", () => {
        playSound();
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    });
}

window.onclick = function (event) {
    if (event.target === document.getElementById("modalOverlay")) closeModal();
};

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navMenu = document.getElementById("nav-menu");
mobileMenuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

document.querySelectorAll("#nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
    });
});

function setupCardTilt() {
    // Select all types of cards: Projects, Libraries, Reviews, and Feedback boxes
    const cards = document.querySelectorAll(".card, .book-card, .review-card, .feedback-form-box, .feedback-list-box");
    
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    cards.forEach((card) => {
        if (card.dataset.tiltBound === "true") return;
        card.dataset.tiltBound = "true";

        let rafId = null;
        let currentRx = 0;
        let currentRy = 0;
        let currentLift = 0;
        let targetRx = 0;
        let targetRy = 0;
        let targetLift = 0;
        let targetMx = 50;
        let targetMy = 50;

        const animate = () => {
            // High precision easing for the 3D look
            const ease = 0.12; 
            currentRx += (targetRx - currentRx) * ease;
            currentRy += (targetRy - currentRy) * ease;
            currentLift += (targetLift - currentLift) * ease;

            card.style.setProperty("--rx", `${currentRx.toFixed(4)}deg`);
            card.style.setProperty("--ry", `${currentRy.toFixed(4)}deg`);
            card.style.setProperty("--mx", `${targetMx.toFixed(2)}%`);
            card.style.setProperty("--my", `${targetMy.toFixed(2)}%`);
            card.style.setProperty("--lift", `${currentLift.toFixed(2)}px`);

            const settled =
                Math.abs(targetRx - currentRx) < 0.01 &&
                Math.abs(targetRy - currentRy) < 0.01 &&
                Math.abs(targetLift - currentLift) < 0.01;

            if (settled && targetRx === 0 && targetRy === 0 && targetLift === 0) {
                rafId = null;
                return;
            }

            rafId = requestAnimationFrame(animate);
        };

        card.addEventListener("pointerenter", () => {
            card.classList.add("is-tilting");
            card.style.setProperty("--glow-opacity", "1");
        });

        card.addEventListener("pointermove", (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate relative position 0 to 1
            const relX = (e.clientX - rect.left) / rect.width;
            const relY = (e.clientY - rect.top) / rect.height;
            
            // Constrain 
            const clampedX = Math.min(Math.max(relX, 0), 1);
            const clampedY = Math.min(Math.max(relY, 0), 1);

            // Tilt logic: aggressive 3D lean toward cursor (20-25deg range)
            targetRy = (clampedX - 0.5) * 24;
            targetRx = (0.5 - clampedY) * 22;
            
            // Glow follows mouse exactly
            targetMx = clampedX * 100;
            targetMy = clampedY * 100;

            // Subtle lift based on center distance
            const distFromCenter = Math.hypot(clampedX - 0.5, clampedY - 0.5);
            targetLift = distFromCenter * 5;

            if (!rafId) rafId = requestAnimationFrame(animate);
        });

        card.addEventListener("pointerleave", () => {
            card.classList.remove("is-tilting");
            targetRx = 0;
            targetRy = 0;
            targetLift = 0;
            card.style.setProperty("--glow-opacity", "0");
            if (!rafId) rafId = requestAnimationFrame(animate);
        });
    });
}

window.addEventListener("load", () => {
    restoreUserSession();
    if (typeof completeLoaderSequence === "function") completeLoaderSequence();
    if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
    }
    setupDiscordCopy();
    setupEmailCopy();
    setupProjectFilters();
    setupStatsCountup();
    setupProjectCardViewportReveal();
    setupCardTilt(); // Initialize tilt on all cards
});

initLoaderExperience();
initLiveBackground();

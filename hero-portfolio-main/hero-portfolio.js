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
    const authContainer = document.getElementById("auth-container");
    const userInfo = document.getElementById("user-info");
    const userName = document.getElementById("user-name");
    const userPhoto = document.getElementById("user-photo");

    if (!authContainer || !userInfo || !userName || !userPhoto) return;

    authContainer.style.display = "none";
    userInfo.style.display = "flex";
    userName.innerText = name;
    userPhoto.src = photo;

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
if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("Please sign in with Google to leave a review!");
            return;
        }

        const selectedRating = document.querySelector('input[name="rating"]:checked');
        const reviewText = document.getElementById("reviewText");
        if (!selectedRating || !reviewText) return;

        try {
            await db.collection("reviews").add({
                name: currentUser.name,
                photo: currentUser.photo,
                rating: parseInt(selectedRating.value, 10),
                text: reviewText.value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            reviewForm.reset();
            alert("Thank you for your feedback!");
        } catch (error) {
            console.error("Error adding review:", error);
        }
    });
}

db.collection("reviews").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    const list = document.getElementById("reviewsList");
    if (!list) return;
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
        const avgScore = document.getElementById("avg-score");
        const avgStars = document.getElementById("avg-stars");
        const reviewCount = document.getElementById("review-count");
        if (avgScore) avgScore.innerText = avg;
        if (avgStars) avgStars.innerText = "★".repeat(Math.round(avg));
        if (reviewCount) reviewCount.innerText = `Based on ${count} reviews`;
    }
    // Re-run tilt setup to include new review cards
    setupCardTilt();
});

const cSound = document.getElementById("clickSound");
function playSound() {
    if (!cSound) return;
    cSound.currentTime = 0;
    cSound.volume = 0.2;
    void cSound.play().catch(() => {});
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
    spincards: {
        title: "🃏 SpinCards - Advanced Roblox Card Spin System",
        body: `<h3>🧠 Full OOP Architecture</h3><ul><li>Built with object-oriented design for clean, maintainable systems.</li><li>Clear class responsibilities for card logic, spin control, and reward handling.</li></ul><h3>🧩 ModuleScript-Based Design</h3><ul><li>Core features are split into reusable ModuleScripts for easy updates.</li><li>Supports fast iteration and extension without rewriting base systems.</li></ul><h3>📈 Scalable & Production Ready</h3><ul><li>Designed to scale with more card sets, rarities, and effects.</li><li>Structured for long-term growth and integration into larger game economies.</li></ul>`
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
    },
    projectiles: {
        title: "🎯 Projectiles Handler (Open Source Library)",
        body: `<h3>🧠 Full OOP Projectile Framework</h3><ul><li>Built with full object-oriented architecture for maintainable weapon systems.</li><li>Modular structure makes behavior easy to extend and tune per weapon type.</li></ul><h3>🔫 Multi-Weapon Ammo Support</h3><ul><li>Handles sniper, pistol, machine gun, and other weapon categories.</li><li>Supports physical ammo workflows for realistic projectile behavior.</li></ul><h3>⚙️ Scalable Integration</h3><ul><li>Designed for scalable combat systems in larger Roblox projects.</li><li>Easy to plug into existing module-based game architectures.</li></ul>`
    },
    animepets: {
        title: "🎌 Anime Pets Inventory System",
        body: `<h3>📋 Core Inventory Layout</h3><ul><li>Organized grid layout for pet cards with rarity colors.</li><li>Smooth pagination and search filters for large collections.</li></ul><h3>🖼️ Pet Preview & Details</h3><ul><li>Click to view pet stats, level, and traits in detail modal.</li><li>Visual rarity borders and particle highlights.</li></ul><h3>🔒 Secure Server Validation</h3><ul><li>All inventory interactions verified on the server.</li><li>DataStore2 / ProfileService backed persistence.</li></ul>`
    },
    attackpets: {
        title: "⚔️ Attack Pets System",
        body: `<h3>🎯 Smart Targeting AI</h3><ul><li>Auto-targets nearest enemies with configurable range and priority.</li><li>Supports multi-pet attacking simultaneously.</li></ul><h3>💥 Combat & Damage Engine</h3><ul><li>Critical hit system, element bonuses, and level scaling.</li><li>Server-authoritative damage to prevent exploits.</li></ul><h3>📈 Pet Progression</h3><ul><li>Per-pet XP, leveling, and stat growth.</li><li>Skill unlocks as pets level up.</li></ul>`
    },
    dailyreward: {
        title: "🎁 Daily Reward System",
        body: `<h3>📅 Streak-Based Rewards</h3><ul><li>7-day and 30-day reward cycles with escalating value.</li><li>Missed-day protection with streak restore.</li></ul><h3>🎨 Animated Claim UI</h3><ul><li>Card-flip animation with confetti on premium days.</li><li>Preview locked days with faded rewards.</li></ul><h3>🕒 Accurate Cooldowns</h3><ul><li>UTC-based scheduler with server time checks.</li><li>DataStore-backed streaks with anti-tamper.</li></ul>`
    },
    fpsweapons: {
        title: "🔫 FPS Weapons System",
        body: `<h3>🎯 Realistic Ballistics</h3><ul><li>FastCast-based projectile with bullet drop and travel time.</li><li>Penetration, wall-bang, and ricochet support.</li></ul><h3>🎬 Viewmodel & Animations</h3><ul><li>Smooth viewmodel bobbing, recoil, and sprint sway.</li><li>Preloaded animations for zero combat lag.</li></ul><h3>🛡️ Anti-Exploit Layer</h3><ul><li>Server-side hit validation with sanity checks.</li><li>Rate limiting and spread randomization.</li></ul>`
    },
    floating: {
        title: "☁️ Floating System",
        body: `<h3>🌊 Buoyancy Simulation</h3><ul><li>Procedural floating math with wave height offsets.</li><li>Supports multiple objects at scale.</li></ul><h3>✨ Decorative Visuals</h3><ul><li>Trail particles, splash effects, and soft shadows.</li><li>Oscillating rotation for natural look.</li></ul><h3>⚡ Performance Optimized</h3><ul><li>Heartbeat-driven updates throttled by distance.</li><li>Streaming-aware activation.</li></ul>`
    },
    profile: {
        title: "👤 Profile System",
        body: `<h3>🎨 Player Identity</h3><ul><li>Custom display names, bios, and theme colors.</li><li>Avatar preview and accessories showcase.</li></ul><h3>📊 Stats & Leaderboard</h3><ul><li>Tracked playtime, wins, currency, and achievements.</li><li>Global and friend leaderboards integration.</li></ul><h3>🔧 Admin & Moderation</h3><ul><li>Report, mute, and moderation flag hooks.</li><li>Server-only profile writes.</li></ul>`
    },
    shop: {
        title: "🛒 Shop System",
        body: `<h3>💰 Multi-Currency Engine</h3><ul><li>Coins, gems, and premium currencies with validation.</li><li>Discounts, sales, and bulk pricing tiers.</li></ul><h3>🗂️ Organized Categories</h3><ul><li>Weapons, pets, cosmetics, and bundles tabs.</li><li>New / featured ribbons with custom sort orders.</li></ul><h3>🔐 Secure Purchase Flow</h3><ul><li>Atomic transactions with rollback safety.</li><li>GamePass and DevProduct integrations.</li></ul>`
    },
    teleport: {
        title: "🌀 Teleport System",
        body: `<h3>🗺️ Map-Based Fast Travel</h3><ul><li>Interactive map UI with unlocked waypoints.</li><li>Cost-based teleport with cooldown options.</li></ul><h3>🚪 Cross-Place Teleportation</h3><ul><li>TeleportService integration with reserved servers.</li><li>Teleport GUI and loading progress bar.</li></ul><h3>✅ Data Carryover</h3><ul><li>Attribute and inventory data transfer across places.</li><li>Arrival welcome animation and save confirmation.</li></ul>`
    },
    upgradepets: {
        title: "⬆️ Upgrading Pets System",
        body: `<h3>🧬 Tier & Rank Progression</h3><ul><li>Common to Mythic rank paths with visual badges.</li><li>Multi-copy merge (x3, x5, x10) for upgrades.</li></ul><h3>📊 Stat Scaling Curves</h3><ul><li>Damage, crit, and HP scale per rank formula.</li><li>Configurable config table for designers.</li></ul><h3>🎟️ Enchant & Reroll</h3><ul><li>Random enchantment slots with reroll costs.</li><li>Lock slots for premium reroll tokens.</li></ul>`
    }
};

const systemVideoFiles = {
    camel: "Full control and animations CamelSystem.mp4",
    inventory: "InventorySystem&Armor.mp4",
    spin: "SpienWheel.mp4",
    spincards: "SpinCards.mp4",
    stamina: "Stamina and Sprint System.mp4",
    clicker: "ClickSemlutor&RebirthSystem.mp4",
    hatching: "HatchingPets.mp4",
    hitbox: "CombatSystem.mp4",
    cannon: "Cannon.mp4",
    trading: null,
    gsm: null,
    projectiles: null,
    animepets: "Anime Pets Inventory System.mp4",
    attackpets: "Attack Pets System.mp4",
    dailyreward: "Daily Reward.mp4",
    fpsweapons: "FPS Weapons System.mp4",
    floating: "Floating system.mp4",
    profile: "Profile System.mp4",
    shop: "Shop System.mp4",
    teleport: "Teleport System.mp4",
    upgradepets: "Upgrading Pets System.mp4"
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
    const demoUnavailableKeys = new Set([
        "animepets", "attackpets", "dailyreward", "fpsweapons",
        "floating", "profile", "shop", "teleport", "upgradepets",
        "secretmap"
    ]);
    const isDemoAvailable = !demoUnavailableKeys.has(key);
    const systemKeyLabel = key;
    const actionsRow = `
        <div class="modal-actions-row">
            <button class="modal-action-btn modal-copy-btn" type="button"
                    onclick="copySystemKey('${systemKeyLabel.replace(/'/g, "\\'")}', ${JSON.stringify(data.title).replace(/"/g, '&quot;')})">
                📋 Copy System Key
            </button>
            <button class="modal-action-btn modal-download-btn" type="button"
                    onclick="downloadDemo('${systemKeyLabel.replace(/'/g, "\\'")}', ${isDemoAvailable})">
                ⬇️ Download Demo
            </button>
        </div>
    `;
    modalBody.innerHTML = `${getModalMediaMarkup(key)}${data.body}${actionsRow}`;
    wireModalMediaFallback();
    const modalOverlay = document.getElementById("modalOverlay");
    if (!modalOverlay) return;
    modalOverlay.style.display = "flex";
    playSound();
}

async function copySystemKey(key, title) {
    playSound();
    const text = `[${key}] ${title}`;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        showCopyToast("✅ System key copied!");
    } catch (err) {
        console.error("Copy failed:", err);
        showCopyToast("Copy failed");
    }
}

function downloadDemo(key, isDemoAvailable) {
    playSound();
    if (!isDemoAvailable) {
        showCopyToast("🚧 Demo not available yet — under development");
        return;
    }
    showCopyToast("📁 Demo file will be uploaded soon");
}

function closeModal() {
    const modalVideo = document.querySelector("#mBody .modal-system-video");
    if (modalVideo) {
        modalVideo.pause();
        modalVideo.currentTime = 0;
    }
    const modalOverlay = document.getElementById("modalOverlay");
    if (!modalOverlay) return;
    modalOverlay.style.display = "none";
    playSound();
}

function joinGame(url) {
    playSound();
    window.open(url, "_blank");
}

function showUnderDev() {
    playSound();
    showCopyToast("🚧 Under Development — Cannot enter at this time");
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

if (cursor) {
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
}

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
    const cards = document.querySelectorAll(".projects .card, .languages-grid .card");
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
            const sufficientlyVisible = entry.intersectionRatio >= 0.08 || fullyVisibleByBounds;
            if (!sufficientlyVisible) return;

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

            let finalized = false;
            const finalizeReveal = () => {
                if (finalized) return;
                finalized = true;
                card.dataset.revealed = "true";
                card.style.transitionDelay = "0ms";
                card.style.willChange = "";
                card.style.transition = "";
                card.style.opacity = "";
                card.style.transform = "";
                observer.unobserve(card);
            };

            card.addEventListener("transitionend", finalizeReveal, { once: true });
            setTimeout(finalizeReveal, 750);
        });
    }, {
        threshold: [0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1],
        rootMargin: "0px 0px 80px 0px"
    });

    cards.forEach((card) => cardObserver.observe(card));

    // Guarantee fallback: reveal every card after a short window even if observer missed them.
    setTimeout(() => {
        cards.forEach((card, i) => {
            if (card.dataset.revealed === "true") return;
            setTimeout(() => {
                if (card.dataset.revealed === "true") return;
                card.style.transitionDelay = "0ms";
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
                card.dataset.revealed = "true";
                setTimeout(() => {
                    card.style.willChange = "";
                    card.style.transition = "";
                    card.style.opacity = "";
                    card.style.transform = "";
                }, 700);
            }, i * 60);
        });
    }, 1500);
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
    if (scrollProgress) {
        scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    }

    if (header) {
        if (scrollTop > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    if (backToTop) {
        if (scrollTop > 500) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
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

if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if (stickyHireCta) {
    stickyHireCta.addEventListener("click", () => {
        playSound();
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    });
}

window.addEventListener("click", (event) => {
    const modalOverlay = document.getElementById("modalOverlay");
    if (modalOverlay && event.target === modalOverlay) closeModal();
});

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navMenu = document.getElementById("nav-menu");
if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });
}

document.querySelectorAll("#nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
        if (navMenu) navMenu.classList.remove("active");
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

    // New creative enhancements
    initTypewriter();
    expandCursorInteractivity();
    initHeadingSpotlight();
    initInnerParallax();
    expandStaggerReveal();
    initTrustBounce();
});

/* ========== NEW CREATIVE JS ENHANCEMENTS ========== */

// 1. TYPEWRITER EFFECT — rotates between 3 taglines for the hero
function initTypewriter() {
    const tw = document.getElementById("typewriter");
    if (!tw) return;
    const phrases = [
        "Professional Roblox Developer & Lua Scripter",
        "Roblox Systems Architect • UI • Combat • Economy",
        "Crafting Secure & High-Performance Gameplay"
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const START_DELAY = 600;
    const TYPE_SPEED = 52;
    const DELETE_SPEED = 28;
    const PAUSE_AFTER = 1700;

    function tick() {
        const current = phrases[phraseIdx];
        if (!isDeleting) {
            charIdx += 1;
            tw.textContent = current.slice(0, charIdx);
            if (charIdx === current.length) {
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
            setTimeout(tick, TYPE_SPEED);
        } else {
            charIdx -= 1;
            tw.textContent = current.slice(0, charIdx);
            if (charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                setTimeout(tick, 350);
                return;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    }
    setTimeout(tick, START_DELAY);
}

// 2. EXPAND CURSOR INTERACTIVITY — hover + click pulse
function expandCursorInteractivity() {
    if (!cursor) return;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine) return;

    const selectors = [
        "button", "a", "input", "textarea", "select",
        ".card", ".pricing-card", ".feedback-card", ".repo-card",
        ".trust-item", ".stat-item", ".language-card",
        ".scroll-indicator", "[role='button']", ".social-btn",
        ".filter-btn", ".pagination button", ".modal-close",
        ".logo", ".menu-toggle", ".sticky-hire-cta"
    ].join(", ");

    const toggleHover = (state) => {
        cursor.classList.toggle("cursor-hover", state);
    };

    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(selectors)) toggleHover(true);
    });
    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(selectors)) toggleHover(false);
    });

    document.addEventListener("mousedown", () => {
        cursor.classList.add("cursor-click");
    });
    document.addEventListener("mouseup", () => {
        setTimeout(() => cursor.classList.remove("cursor-click"), 160);
    });
}

// 3. HEADING SPOTLIGHT — follows mouse on section titles
function initHeadingSpotlight() {
    const headings = Array.from(document.querySelectorAll("section[id] > h2, .hero-title.heading-spotlight"));
    if (headings.length === 0) return;

    headings.forEach((h) => {
        let raf = null;
        let tx = 50, ty = 50;
        const apply = () => {
            h.style.setProperty("--spot-x", `${tx.toFixed(1)}%`);
            raf = null;
        };
        h.addEventListener("pointerenter", () => {
            h.classList.add("spotlight-active");
        });
        h.addEventListener("pointermove", (e) => {
            const r = h.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width) * 100;
            ty = ((e.clientY - r.top) / r.height) * 100;
            if (!raf) raf = requestAnimationFrame(apply);
        });
        h.addEventListener("pointerleave", () => {
            h.classList.remove("spotlight-active");
        });
    });
}

// 4. CARD INNER IMAGE PARALLAX — logo moves slightly on hover
function initInnerParallax() {
    const cards = document.querySelectorAll(".card-image-placeholder");
    if (cards.length === 0) return;
    const isFine = window.matchMedia("(pointer: fine)").matches;

    cards.forEach((ph) => {
        const card = ph.closest(".card");
        if (!card) return;
        let raf = null;
        let px = 0, py = 0, tpx = 0, tpy = 0;
        const ease = 0.16;
        const step = () => {
            px += (tpx - px) * ease;
            py += (tpy - py) * ease;
            card.style.setProperty("--parallax-x", `${px.toFixed(1)}px`);
            card.style.setProperty("--parallax-y", `${py.toFixed(1)}px`);
            const settled = Math.abs(tpx - px) < 0.1 && Math.abs(tpy - py) < 0.1;
            if (settled && tpx === 0 && tpy === 0) {
                raf = null;
                return;
            }
            raf = requestAnimationFrame(step);
        };

        if (isFine) {
            card.addEventListener("pointermove", (e) => {
                const r = card.getBoundingClientRect();
                const cx = ((e.clientX - r.left) / r.width) - 0.5;
                const cy = ((e.clientY - r.top) / r.height) - 0.5;
                tpx = -cx * 14; // invert so it moves toward cursor's side
                tpy = -cy * 12;
                if (!raf) raf = requestAnimationFrame(step);
            });
        }
        card.addEventListener("pointerleave", () => {
            tpx = 0; tpy = 0;
            if (!raf) raf = requestAnimationFrame(step);
        });
    });
}

// 5. EXPAND STAGGER REVEAL — pricing, feedback, libraries, contact social
function expandStaggerReveal() {
    const groups = [
        document.querySelectorAll(".pricing-grid .pricing-card"),
        document.querySelectorAll("#libraries .repo-card"),
        document.querySelectorAll("#feedback .feedback-card, #feedback .feedback-form-box, #feedback .feedback-list-box")
    ];
    groups.forEach((group) => {
        group.forEach((item, idx) => {
            item.style.transitionDelay = `${idx * 90}ms`;
        });
    });
}

// 6. TRUST BADGE BOUNCE — kick off when hero appears
function initTrustBounce() {
    const hero = document.querySelector("section.hero");
    const strip = document.querySelector(".bounce-wave");
    if (!hero || !strip) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                strip.classList.add("animate");
                io.disconnect();
            }
        });
    }, { threshold: 0.35 });
    io.observe(hero);
}

initLoaderExperience();
initLiveBackground();

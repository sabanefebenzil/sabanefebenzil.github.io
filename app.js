/* =====================================================================
   sabanefebenzil.dev — Ana Sayfa Motoru (index.html)
   Yatay Windows 8 Start Screen, Asenkron Windows Phone Live Tiles,
   TR/EN Dil Motoru, Canvas, Saat, Open-Meteo Hava Durumu + Atmosfer Tema
   Önerisi, 40 Hadis, YT Music, GitHub, @nptechtr Videoları, 51 Oyunluk
   Arcade Merkezi (Sinema Modu), Sistem/IP, Format & ISO, Android & ADB
   Mod Arşivi, EV Şarj & Yol Maliyeti Karşılaştırıcı, Ctrl+K Search Charm
   ve Şifreli Admin Paneli
   ===================================================================== */

const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => root.querySelectorAll(sel);
const clone = obj => JSON.parse(JSON.stringify(obj));

const store = {
    get(k, fallback = null) { try { const v = localStorage.getItem(k); return v !== null ? v : fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
};

const escapeHtml = str => String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function hexToRgba(hex, alpha) {
    const c = String(hex || "#0078D7").replace("#", "");
    const n = parseInt(c.length === 3 ? c.replace(/(.)/g, "$1$1") : c, 16);
    return isNaN(n) ? `rgba(0, 120, 215, ${alpha})` : `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function calculateAge(birthStr) {
    const [y, m, d] = (birthStr || "2007-09-20").split("-").map(Number);
    const now = new Date();
    let age = now.getFullYear() - y;
    if ((now.getMonth() + 1) < m || ((now.getMonth() + 1) === m && now.getDate() < d)) age--;
    return age;
}

/* =====================================================================
   1. UYGULAMA DURUMU, TR/EN DİL SÖZLÜĞÜ & KALICI CONFIG
   ===================================================================== */
let SITE_CONFIG = clone(DEFAULT_SITE_CONFIG);

const state = {
    lang: "tr",
    view: "home", projectFilter: "all", hadithSearch: "",
    gameCat: "Tümü", gameSearch: "", gameCinema: false,
    toolkitCat: "Tümü", selectedToolkitIds: null,
    androidCmdCat: "Tümü", adbFile: "magisk_patched.img", adbPkg: "com.miui.analytics",
    adbRes: "1920x1080", adbDpi: "240", webUsbInfo: "",
    evPresetId: "togg-ac", evCapacity: 88.5, evSocStart: 20, evSocTarget: 80,
    evPowerKw: 11, evEfficiency: 92, evConsumption: 16.8, evTariff: 2.85,
    evTripKm: 320, evIceL100: 5.8, evFuelPrice: 46.50,
    searchQuery: "",
    theme: "harmony", accentHex: "#0078D7", lowEnd: false,
    charmsOpen: false, charmTab: "theme",
    weatherTemp: 8, weatherFeels: 6, weatherDesc: "parçalı bulutlu",
    weatherCode: 2, weatherIsDay: 1, weatherHumidity: 62, weatherWind: 11,
    weatherMin: 2, weatherMax: 11, weatherRainProb: 15, weatherLive: false,
    activePlaylistIdx: 0, ytmEmbedOpen: false,
    todayHadithIdx: 0, hadithIdx: 0,
    sysInfo: {
        ip: "Algılanıyor...", ipVersion: "IPv4 / IPv6", isp: "Sorgulanıyor...", asn: "—",
        city: "—", country: "—", ipSource: "Bekleniyor", pingMs: null,
        os: "Algılanıyor...", arch: "—", browser: "Algılanıyor...", engine: "—",
        cores: "—", ram: "—", gpu: "Algılanıyor...", screenRes: "—", viewport: "—",
        dpr: "—", colorDepth: "—", timezone: "—", utcOffset: "—", language: "—",
        connType: "—", downlink: "—", rtt: "—", online: true, battery: "Kontrol ediliyor...", fps: 60
    },
    adminUnlocked: false, adminTab: "social", adminEditSocialId: null,
    adminEditBlogId: null, adminEditProjectId: null, adminEditAppId: null,
    adminEditGameId: null, uploadedBlogImage: "", confirmResetStep: false
};

const I18N = {
    tr: {
        topSearch: "Ara", navBlog: "blog", badgeBlog: "yazı",
        navProjects: "projeler", badgeProjects: "işler",
        navGames: "oyunlar", badgeGames: "arcade",
        navAbout: "hakkımda", navSetup: "setup", badgeSetup: "garaj",
        navHadis: "40 hadis", badgeHadis: "günlük",
        navToolkit: "format & iso", badgeToolkit: "araç", navAndroid: "android & adb",
        navEv: "ev şarj", navContact: "iletişim", navSysinfo: "sistem & ip",
        navToolkitShort: "ISO", navAndroidShort: "ADB", navEvShort: "EV", navContactShort: "iletişim",
        ltLatestBlog: "son yazı", ltRandomGame: "oyun önerisi", ltClickPlay: "tıkla & oyna ▶", ltFeaturedProj: "öne çıkan",
        aboutTileSummary: "Makine Mühendisliği · 3D CAD · Donanım & @nptechtr",
        copyIpBtn: "IP Kopyala", socialHead: "sosyal ağlar & steam",
        hadithOfDay: "Günün Hadisi", btnToday: "Bugün", btnAllHadiths: "40 Hadis →",
        weatherTitle: "Kayseri Hava Durumu", btnRefresh: "↻ Yenile",
        ghRepoLbl: "Repo", ghFollowerLbl: "Takipçi",
        charmTheme: "Tema", charmPerf: "Hız", charmNav: "Gezin",
        feedsHead: "canlı akış", accountsWord: "hesap", close: "kapat",
        lowOn: "⚡ Düşük Performans: AÇIK", lowOff: "⚡ Standart",
        toastLowOn: "Düşük Performans Modu açıldı: Canvas, blur ve canlı kutucuk döngüleri durduruldu.",
        toastLowOff: "Standart Mod açıldı: Canlı arka plan ve Metro animasyonları aktif.",
        toastTheme: "Tema değiştirildi:", toastAccent: "Vurgu rengi:",
        toastLang: "Dil değiştirildi: Türkçe", toastRefreshed: "Canlı kutucuklar yenilendi.",
        copyFail: "Kopyalama başarısız.", copiedPrefix: "Kopyalandı:",
        play: "Oynat", hide: "Gizle",
        ytmHint: "Dinlemek için <strong>Oynat</strong> düğmesine tıkla.",
        liveApi: "Canlı API", cacheBadge: "Önbellek", liveRss: "Canlı RSS", channelArchive: "Kanal Arşivi",
        watchYt: "YouTube'da İzle ↗", weatherLiveBadge: "Canlı · Open-Meteo",
        feelsLbl: "Hissedilen", dailyLbl: "Günlük", humLbl: "Nem", windLbl: "Rüzgâr", rainLbl: "Yağış",
        windUnit: "km/s", greetMorn: "Günaydın", greetDay: "İyi Günler", greetEve: "İyi Akşamlar", greetNight: "İyi Geceler",
        hadithWord: "Hadis", todayHadithToast: "Bugünün hadisi gösteriliyor",
        titleTheme: "Tema & Vurgu", visualThemes: "Görsel Temalar (6)", metroAccent: "Metro Vurgu Rengi (6)",
        titlePerf: "Performans Modu",
        perfDesc: "Düşük güçlü cihazlarda Canvas döngüsünü, tüm bulanıklık (blur) filtrelerini, 3D eğilmeyi ve canlı kutucuk animasyonlarını tek tıkla kapatır.",
        perfBtnOff: "⚡ Düşük Performans Modunu Kapat", perfBtnOn: "⚡ Düşük Performans Modunu Aç",
        perfStatus: "Durum:", perfStateLow: "Animasyonsuz, sıfır Canvas & blur", perfStateStd: "Standart 60fps Canvas & Aero cam efektleri",
        titleNav: "Hızlı Gezinme", homeHub: "Ana Sayfa (Start Hub)", adminBtn: "⚙ Yönetim Paneli (Alt+A)",
        searchPlaceholder: "Blog, proje, oyun, 40 hadis, format programı veya ADB komutu ara...",
        quickJumps: "Hızlı Geçişler", noSearchRes: "için sonuç bulunamadı.", resultsFound: "Sonuç Bulundu",
        detailArrow: "detay →", openLink: "Bağlantıyı Aç ↗", closeBtn: "Kapat",
        playGame: "Oyna ▶", fullscreen: "Tam Ekran", cinemaMode: "Sinema Modu", normalSize: "Normal Boyut",
        newTab: "Yeni Sekme ↗", reload: "↻ Yenile",
        atmoApplyBtn: "Temayı Uygula:", atmoMatched: "Atmosferle uyumlu ✓"
    },
    en: {
        topSearch: "Search", navBlog: "blog", badgeBlog: "posts",
        navProjects: "projects", badgeProjects: "work",
        navGames: "games", badgeGames: "arcade",
        navAbout: "about", navSetup: "setup", badgeSetup: "garage",
        navHadis: "40 hadiths", badgeHadis: "daily",
        navToolkit: "format & iso", badgeToolkit: "tools", navAndroid: "android & adb",
        navEv: "ev charge", navContact: "contact", navSysinfo: "system & ip",
        navToolkitShort: "ISO", navAndroidShort: "ADB", navEvShort: "EV", navContactShort: "contact",
        ltLatestBlog: "latest post", ltRandomGame: "try this game", ltClickPlay: "click to play ▶", ltFeaturedProj: "featured",
        aboutTileSummary: "Mechanical Eng. · 3D CAD · Hardware & @nptechtr",
        copyIpBtn: "Copy IP", socialHead: "socials & steam",
        hadithOfDay: "Hadith of the Day", btnToday: "Today", btnAllHadiths: "40 Hadiths →",
        weatherTitle: "Kayseri Weather", btnRefresh: "↻ Refresh",
        ghRepoLbl: "Repos", ghFollowerLbl: "Followers",
        charmTheme: "Theme", charmPerf: "Speed", charmNav: "Nav",
        feedsHead: "live feed", accountsWord: "accounts", close: "close",
        lowOn: "⚡ Low-End Mode: ON", lowOff: "⚡ Standard",
        toastLowOn: "Low-End Mode enabled: Canvas, blur and live tile loops paused.",
        toastLowOff: "Standard Mode enabled: Live background and Metro animations active.",
        toastTheme: "Theme changed:", toastAccent: "Accent color:",
        toastLang: "Language switched: English", toastRefreshed: "Live tiles refreshed.",
        copyFail: "Copy failed.", copiedPrefix: "Copied:",
        play: "Play", hide: "Hide",
        ytmHint: "Click <strong>Play</strong> to listen.",
        liveApi: "Live API", cacheBadge: "Cached", liveRss: "Live RSS", channelArchive: "Channel Archive",
        watchYt: "Watch on YouTube ↗", weatherLiveBadge: "Live · Open-Meteo",
        feelsLbl: "Feels like", dailyLbl: "Daily", humLbl: "Humidity", windLbl: "Wind", rainLbl: "Rain",
        windUnit: "km/h", greetMorn: "Good Morning", greetDay: "Good Afternoon", greetEve: "Good Evening", greetNight: "Good Night",
        hadithWord: "Hadith", todayHadithToast: "Showing today's hadith",
        titleTheme: "Theme & Accent", visualThemes: "Visual Themes (6)", metroAccent: "Metro Accent Color (6)",
        titlePerf: "Performance Mode",
        perfDesc: "Disables Canvas loop, blur filters, 3D tilt and live tile animations in one click on low-end devices.",
        perfBtnOff: "⚡ Turn Off Low-End Mode", perfBtnOn: "⚡ Turn On Low-End Mode",
        perfStatus: "Status:", perfStateLow: "No animations, zero Canvas & blur", perfStateStd: "Standard 60fps Canvas & Aero glass effects",
        titleNav: "Quick Navigation", homeHub: "Home (Start Hub)", adminBtn: "⚙ Admin Panel (Alt+A)",
        searchPlaceholder: "Search blog, projects, games, 40 hadiths, toolkit apps or ADB commands...",
        quickJumps: "Quick Jumps", noSearchRes: "returned no results.", resultsFound: "Results Found",
        detailArrow: "details →", openLink: "Open Link ↗", closeBtn: "Close",
        playGame: "Play ▶", fullscreen: "Fullscreen", cinemaMode: "Cinema Mode", normalSize: "Normal Size",
        newTab: "New Tab ↗", reload: "↻ Reload",
        atmoApplyBtn: "Apply Theme:", atmoMatched: "Matches weather ✓"
    }
};

const GAME_CAT_EN = {
    "Tümü": "All",
    "Arcade": "Arcade",
    "Bulmaca": "Puzzle",
    "Strateji & Masa": "Strategy & Board",
    "Hız & Refleks": "Speed & Reflex",
    "Kart & Şans": "Card & Chance"
};

const EN_SUBTITLE = "Mechanical Engineering Student, 3D CAD, Hardware Modding & @nptechtr";
const EN_BIO_PARAGRAPHS = [
    "Hello! I'm Şaban Efe Benzil (aka NeonPeekr, {{AGE}}), based in Melikgazi, Kayseri — it's currently {{WEATHER}} here. I'm a Mechanical Engineering undergraduate student at Erciyes University.",
    "I combine mechanical design and 3D modeling with embedded systems, custom Android ROM/Kernel tinkering, and PC hardware. I build sheet-metal and part designs in SolidWorks and AutoCAD.",
    "I also work on thermal cooling optimizations, home server setups, Oracle Cloud automation, and Arduino/TENG experiments, sharing my notes on @nptechtr YouTube and my blog."
];
const EN_SKILLS = [
    { title: "SolidWorks & 3D Modeling", desc: "Mechanical part design, sheet metal bending/flat-pattern layouts, assembly studies, and STEP/DWG/DXF conversions." },
    { title: "Home Server & Cloud Automation", desc: "Self-hosted home servers on repurposed hardware, Python/Telegram automation bots on Oracle Cloud, and local networking." },
    { title: "PC Hardware & Cooling Mods", desc: "GPU/CPU thermal optimization, case airflow planning, BIOS/UEFI tuning, and Resizable BAR setups." },
    { title: "Android ROM & System Modding", desc: "Custom ROM flashing, Root & Magisk modules, battery charge control (ACC), and repurposing old flagships as 24/7 media stations." },
    { title: "DIY Electronics & Energy Harvesting", desc: "Arduino prototyping, sensor circuits, and TENG (Triboelectric Nanogenerator) energy harvesting experiments." },
    { title: "Automotive & Vehicle Mechanics", desc: "Internal combustion dynamics, drivetrains, mechanical maintenance, and EV battery/tire efficiency research." }
];

const t = key => (I18N[state.lang] || I18N.tr)[key] || key;
const isEn = () => state.lang === "en";
const gameCatLabel = cat => isEn() ? (GAME_CAT_EN[cat] || cat) : cat;

function showToast(msg) {
    const stack = $("metro-toast-stack");
    if (!stack) return;
    const toast = document.createElement("div");
    toast.className = "metro-toast";
    toast.innerHTML = `<span>${escapeHtml(msg)}</span><button type="button" style="background:none;border:none;color:rgba(255,255,255,0.68);cursor:pointer;font-size:0.7rem;">${escapeHtml(t("close"))}</button>`;
    const close = () => toast.remove();
    toast.querySelector("button").addEventListener("click", close);
    stack.appendChild(toast);
    setTimeout(close, 3600);
}

function copyText(text, label) {
    try {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast(label || `${t("copiedPrefix")} ${text}`));
            return;
        }
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        showToast(ok ? (label || `${t("copiedPrefix")} ${text}`) : t("copyFail"));
    } catch {
        showToast(t("copyFail"));
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function hashPin(pin) {
    let h = 2166136261;
    const s = "se_metro_" + String(pin);
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
}

const getStoredPinHash = () => SITE_CONFIG.customPinHash || store.get("seb_admin_pin_hash") || hashPin("Sucukluyumurta2042@");

function loadConfigFromStorage() {
    SITE_CONFIG = clone(DEFAULT_SITE_CONFIG);
    const raw = store.get("seb_metro_config_v1");
    if (raw && raw !== "null") {
        try {
            const parsed = JSON.parse(raw);
            const defaultVer = DEFAULT_SITE_CONFIG.configVersion || 0;
            const storedVer = parsed?.configVersion || 0;
            if (parsed && parsed.fullName && Array.isArray(parsed.blogPosts) && storedVer >= defaultVer) {
                SITE_CONFIG = Object.assign(clone(DEFAULT_SITE_CONFIG), parsed);
            }
        } catch {}
    }
    delete SITE_CONFIG.xFeed;
    SITE_CONFIG.toolkit = SITE_CONFIG.toolkit || clone(DEFAULT_SITE_CONFIG.toolkit);
    SITE_CONFIG.androidModding = SITE_CONFIG.androidModding || clone(DEFAULT_SITE_CONFIG.androidModding);
    SITE_CONFIG.androidModding.deviceArchive = SITE_CONFIG.androidModding.deviceArchive || clone(DEFAULT_SITE_CONFIG.androidModding.deviceArchive || []);
    SITE_CONFIG.nptechYoutube = SITE_CONFIG.nptechYoutube || clone(DEFAULT_SITE_CONFIG.nptechYoutube);
    SITE_CONFIG.evPresets = SITE_CONFIG.evPresets || clone(DEFAULT_SITE_CONFIG.evPresets);
    SITE_CONFIG.evCompare = Object.assign(clone(DEFAULT_SITE_CONFIG.evCompare || {}), SITE_CONFIG.evCompare || {});
    SITE_CONFIG.games = Array.isArray(SITE_CONFIG.games) ? SITE_CONFIG.games : clone(DEFAULT_SITE_CONFIG.games || []);
}

function saveConfigToStorage() {
    delete SITE_CONFIG.xFeed;
    SITE_CONFIG.configVersion = Date.now();
    store.set("seb_metro_config_v1", JSON.stringify(SITE_CONFIG));
}

function getMonogramSvg() {
    const mono = escapeHtml(SITE_CONFIG.monogram || "SEB").slice(0, 3).toUpperCase();
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="seG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1268c4"/><stop offset="100%" stop-color="#07182f"/></linearGradient></defs><rect width="100" height="100" fill="url(#seG)"/><rect x="64" y="64" width="36" height="36" fill="rgba(255,255,255,0.14)"/><text x="50" y="61" text-anchor="middle" fill="#fff" font-family="Segoe UI Light,Work Sans,sans-serif" font-weight="300" font-size="${mono.length > 2 ? 30 : 40}">${mono}</text><rect x="0" y="94" width="100" height="6" fill="var(--accent,#0078D7)"/></svg>`;
}

function getAvatarMarkup() {
    const url = SITE_CONFIG.avatarUrl?.trim();
    return url
        ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(SITE_CONFIG.fullName)}" onerror="this.onerror=null;this.parentElement.innerHTML=getMonogramSvg()">`
        : getMonogramSvg();
}

const getSocialIconSvg = key => SOCIAL_ICON_SVGS[key] || SOCIAL_ICON_SVGS.globe;

/* =====================================================================
   2. HTML5 CANVAS ANİMASYON MOTORU (SANİYE TABANLI & YAVAŞLATILMIŞ)
   ===================================================================== */
const canvasEngine = {
    canvas: null, ctx: null, w: 0, h: 0, t: 0, elapsed: 0, lastTime: 0, rafId: null, orbs: [], particles: [],
    palettes: {
        harmony:  { rib: ["rgba(145,236,255,0.28)", "rgba(255,255,255,0.22)", "rgba(72,219,251,0.24)"], orb: ["rgba(186,242,255,0.26)", "rgba(255,255,255,0.22)", "rgba(76,204,255,0.22)"] },
        aurora:   { rib: ["rgba(0,242,176,0.30)", "rgba(0,198,255,0.26)", "rgba(74,222,128,0.22)"], orb: ["rgba(52,211,153,0.22)", "rgba(56,189,248,0.22)", "rgba(167,243,208,0.18)"] },
        meadow:   { rib: ["rgba(255,255,255,0.28)", "rgba(134,239,172,0.28)", "rgba(186,230,253,0.24)"], orb: ["rgba(255,255,255,0.26)", "rgba(167,243,208,0.24)", "rgba(186,230,253,0.22)"] },
        twilight: { rib: ["rgba(192,132,252,0.24)", "rgba(96,165,250,0.22)", "rgba(232,121,249,0.20)"], orb: ["rgba(216,180,254,0.20)", "rgba(147,197,253,0.20)", "rgba(255,255,255,0.16)"] }
    },

    init() {
        this.canvas = $("theme-canvas");
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d", { alpha: true });
        this.resize();
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stop();
                liveTilesEngine.stop();
            } else if (!state.lowEnd) {
                this.start();
                liveTilesEngine.start();
            }
        });
        this.orbs = Array.from({ length: 12 }, (_, i) => ({
            x: Math.random(), y: Math.random(), r: 24 + Math.random() * 54,
            vx: (Math.random() - 0.5) * 0.00018, vy: -0.00007 - Math.random() * 0.00014, cIdx: i % 3
        }));
        this.particles = Array.from({ length: 32 }, () => ({
            x: Math.random(), y: Math.random(), r: 1.1 + Math.random() * 2.1,
            vx: (Math.random() - 0.5) * 0.006, vy: -0.008 - Math.random() * 0.012,
            phase: Math.random() * Math.PI * 2
        }));
    },

    resize() {
        if (!this.canvas || !this.ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = Math.floor(this.w * dpr);
        this.canvas.height = Math.floor(this.h * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    start() {
        if (this.rafId || state.lowEnd || document.hidden) return;
        this.lastTime = 0;
        const tick = now => {
            if (state.lowEnd || document.hidden) { this.rafId = null; return; }
            const dt = this.lastTime ? Math.min(Math.max((now - this.lastTime) / 1000, 0), 0.05) : 0.016;
            this.lastTime = now;
            this.elapsed += dt;
            this.t += dt * 60;
            this.draw(dt);
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    },

    stop() {
        if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
        this.ctx?.clearRect(0, 0, this.w, this.h);
    },

    draw(dt = 0.016) {
        const { ctx, w, h, t, elapsed: sec } = this;
        const th = state.theme;
        ctx.clearRect(0, 0, w, h);

        if (th === "gothic" || th === "lale") {
            for (const p of this.particles) {
                const sway = Math.sin(sec * 0.4 + p.phase) * 0.004;
                p.x += (p.vx + sway) * dt;
                if (p.x < -0.04) p.x = 1.04;
                else if (p.x > 1.04) p.x = -0.04;

                p.y += p.vy * dt;
                if (p.y < -0.04) { p.y = 1.04; p.x = Math.random(); }
            }
            if (th === "gothic") {
                for (let i = 0; i < 2; i++) {
                    const cx = w * (0.3 + i * 0.4), my = h * (0.4 + i * 0.28) + Math.sin(sec * 0.15 + i) * 28;
                    const g = ctx.createRadialGradient(cx, my, 20, cx, my, w * 0.45);
                    g.addColorStop(0, "rgba(122, 18, 32, 0.16)");
                    g.addColorStop(1, "rgba(11, 9, 12, 0)");
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, w, h);
                }
                for (const p of this.particles) {
                    const a = 0.20 + 0.45 * (0.5 + 0.5 * Math.sin(sec * 0.7 + p.phase));
                    ctx.fillStyle = p.r > 2.2 ? `rgba(194,42,60,${a.toFixed(2)})` : `rgba(218,206,190,${(a * 0.55).toFixed(2)})`;
                    ctx.beginPath();
                    ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                const g = ctx.createRadialGradient(w * 0.78, h * 0.18, 10, w * 0.78, h * 0.18, Math.max(w, h) * 0.55);
                g.addColorStop(0, "rgba(212, 175, 55, 0.14)");
                g.addColorStop(1, "rgba(11, 37, 56, 0)");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
                for (const p of this.particles) {
                    const a = 0.20 + 0.48 * (0.5 + 0.5 * Math.sin(sec * 0.65 + p.phase));
                    const px = p.x * w, py = p.y * h;
                    ctx.fillStyle = `rgba(232,198,92,${a.toFixed(2)})`;
                    ctx.beginPath();
                    ctx.moveTo(px, py - p.r * 1.4); ctx.lineTo(px + p.r, py);
                    ctx.lineTo(px, py + p.r * 1.4); ctx.lineTo(px - p.r, py);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            return;
        }

        const pal = this.palettes[th] || this.palettes.harmony;
        const step = dt * 60;
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        pal.rib.forEach((col, idx) => {
            const yB = h * (0.28 + idx * 0.18), amp = 74 + idx * 16, thick = 104 + idx * 20;
            const cp1 = yB + Math.sin(t * 0.0055 + idx * 1.4) * amp;
            const cp2 = yB + Math.cos(t * 0.005 + idx * 1.9) * amp;
            const g = ctx.createLinearGradient(0, yB - thick, 0, yB + thick);
            g.addColorStop(0, "rgba(255,255,255,0)");
            g.addColorStop(0.5, col);
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(-40, yB);
            ctx.bezierCurveTo(w * 0.33, cp1, w * 0.66, cp2, w + 40, yB);
            ctx.lineTo(w + 40, yB + thick);
            ctx.bezierCurveTo(w * 0.66, cp2 + thick * 0.85, w * 0.33, cp1 + thick, -40, yB + thick * 0.8);
            ctx.closePath();
            ctx.fill();
        });

        for (const o of this.orbs) {
            o.x += o.vx * step; o.y += o.vy * step;
            if (o.y < -0.14) { o.y = 1.14; o.x = Math.random(); }
            if (o.x < -0.14) o.x = 1.14; else if (o.x > 1.14) o.x = -0.14;
            const ox = o.x * w, oy = o.y * h;
            const og = ctx.createRadialGradient(ox - o.r * 0.25, oy - o.r * 0.25, 2, ox, oy, o.r);
            og.addColorStop(0, "rgba(255,255,255,0.34)");
            og.addColorStop(0.5, pal.orb[o.cIdx]);
            og.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = og;
            ctx.beginPath();
            ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
};

/* =====================================================================
   2.5 WINDOWS PHONE ASENKRON LIVE TILES MOTORU
   ===================================================================== */
const liveTilesEngine = {
    entries: new Map(),
    running: false,
    bound: false,
    suggestedGameId: null,
    projCursor: 0,
    setupCursor: 0,
    blogCursor: 0,

    specs: [
        { key: "blog",     initialDelay: 1600, frontMin: 6200, frontMax: 9600, backMin: 4400, backMax: 6000 },
        { key: "games",    initialDelay: 4100, frontMin: 5800, frontMax: 9000, backMin: 4600, backMax: 6200 },
        { key: "projects", initialDelay: 6700, frontMin: 6800, frontMax: 10200, backMin: 4200, backMax: 5800 },
        { key: "hadis",    initialDelay: 9200, frontMin: 7200, frontMax: 10800, backMin: 4800, backMax: 6400 },
        { key: "setup",    initialDelay: 11600, frontMin: 6500, frontMax: 9800, backMin: 4300, backMax: 5900 }
    ],

    rand(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    },

    init() {
        if (!this.bound) {
            this.bound = true;
            this.specs.forEach(spec => {
                const el = document.querySelector(`[data-live-tile="${spec.key}"]`);
                if (!el) return;
                const rec = { el, spec, timerId: null, hovered: false, flipped: false };
                el.addEventListener("mouseenter", () => { rec.hovered = true; }, { passive: true });
                el.addEventListener("mouseleave", () => { rec.hovered = false; }, { passive: true });
                this.entries.set(spec.key, rec);
            });
        }
        this.refreshAllContent();
        if (!state.lowEnd && !document.hidden) this.start();
    },

    updateBackFace(key) {
        const back = $(`lt-back-${key}`);
        if (!back) return;

        if (key === "blog") {
            const posts = SITE_CONFIG.blogPosts || [];
            if (!posts.length) return;
            const post = posts[this.blogCursor % posts.length];
            this.blogCursor++;
            back.innerHTML = `
                <span class="lt-back-kicker">${escapeHtml(t("ltLatestBlog"))} · ${escapeHtml(post.day)} ${escapeHtml(post.month)}</span>
                <span class="lt-back-title">${escapeHtml(post.title)}</span>
                <span class="lt-back-meta">${escapeHtml(post.readTime || "blog.html")} →</span>`;
            return;
        }

        if (key === "games") {
            const games = SITE_CONFIG.games || [];
            if (!games.length) return;
            const g = games[Math.floor(Math.random() * games.length)];
            this.suggestedGameId = g.id;
            back.innerHTML = `
                <span class="lt-back-kicker">${escapeHtml(t("ltRandomGame"))} · #${escapeHtml(g.num || "00")}</span>
                <span class="lt-back-title">${escapeHtml(g.icon || "🎮")} ${escapeHtml(g.title)}</span>
                <span class="lt-back-meta">${escapeHtml(t("ltClickPlay"))}</span>`;
            return;
        }

        if (key === "projects") {
            const list = SITE_CONFIG.projects || [];
            if (!list.length) return;
            const p = list[this.projCursor % list.length];
            this.projCursor++;
            back.innerHTML = `
                <span class="lt-back-kicker">${escapeHtml(t("ltFeaturedProj"))}</span>
                <span class="lt-back-title">${escapeHtml(p.title)}</span>
                <span class="lt-back-meta">${escapeHtml(p.year)} · ${escapeHtml(t("detailArrow"))}</span>`;
            return;
        }

        if (key === "hadis") {
            const h = FORTY_HADITHS[state.todayHadithIdx % FORTY_HADITHS.length];
            if (!h) return;
            back.innerHTML = `
                <span class="lt-back-kicker">${escapeHtml(t("hadithOfDay"))}</span>
                <span class="lt-back-title">${escapeHtml(h.title)}</span>
                <span class="lt-back-meta">${escapeHtml(t("hadithWord"))} #${h.id} / 40</span>`;
            return;
        }

        if (key === "setup") {
            const slides = isEn()
                ? [
                    { k: "Main PC", title: "Ryzen 5 5500 · Arc B580 12GB", meta: "16GB DDR4 · Lian Li V100" },
                    { k: "Garage", title: "Togg T10F V2 Long Range", meta: "Gemlik · LFP · 88.5 kWh" },
                    { k: "Mobile Lab", title: "Xiaomi 14T Pro · Galaxy S8 TV", meta: "Rothko · Taiko · merlinx" }
                ]
                : [
                    { k: "Ana PC", title: "Ryzen 5 5500 · Arc B580 12GB", meta: "16GB DDR4 · Lian Li V100" },
                    { k: "Garaj", title: "Togg T10F V2 Long Range", meta: "Gemlik · LFP · 88.5 kWh" },
                    { k: "Mobil Lab", title: "Xiaomi 14T Pro · Galaxy S8 TV", meta: "Rothko · Taiko · merlinx" }
                ];
            const sl = slides[this.setupCursor % slides.length];
            this.setupCursor++;
            back.innerHTML = `
                <span class="lt-back-kicker">${escapeHtml(sl.k)}</span>
                <span class="lt-back-title">${escapeHtml(sl.title)}</span>
                <span class="lt-back-meta">${escapeHtml(sl.meta)}</span>`;
        }
    },

    refreshAllContent() {
        this.specs.forEach(s => this.updateBackFace(s.key));
    },

    scheduleNext(rec, delayOverride = null) {
        if (rec.timerId) clearTimeout(rec.timerId);
        if (!this.running || state.lowEnd || document.hidden) return;

        const wait = delayOverride !== null
            ? delayOverride
            : (rec.flipped
                ? this.rand(rec.spec.backMin, rec.spec.backMax)
                : this.rand(rec.spec.frontMin, rec.spec.frontMax));

        rec.timerId = setTimeout(() => {
            if (!this.running || state.lowEnd || document.hidden) return;
            if (state.view !== "home" || rec.hovered) {
                this.scheduleNext(rec, 2200);
                return;
            }

            rec.flipped = !rec.flipped;
            rec.el.classList.toggle("is-flipped", rec.flipped);

            if (!rec.flipped) {
                setTimeout(() => {
                    if (!rec.flipped) this.updateBackFace(rec.spec.key);
                }, 760);
            }
            this.scheduleNext(rec);
        }, wait);
    },

    start() {
        if (state.lowEnd || document.hidden || this.running) return;
        this.running = true;
        this.entries.forEach(rec => {
            this.scheduleNext(rec, rec.spec.initialDelay + this.rand(0, 900));
        });
    },

    stop() {
        this.running = false;
        this.entries.forEach(rec => {
            if (rec.timerId) { clearTimeout(rec.timerId); rec.timerId = null; }
            rec.flipped = false;
            rec.el.classList.remove("is-flipped");
        });
    }
};

function handleGamesLiveTileClick() {
    const rec = liveTilesEngine.entries.get("games");
    if (rec?.flipped && liveTilesEngine.suggestedGameId) {
        openGameModal(liveTilesEngine.suggestedGameId);
        return;
    }
    navigateTo("games");
}

/* =====================================================================
   3. DİL DEĞİŞTİRME, LOW-END MODU, TEMA, VURGU RENGİ & 3D METRO TILT
   ===================================================================== */
function applyLanguage(lang, notify = true) {
    state.lang = lang === "en" ? "en" : "tr";
    document.documentElement.lang = state.lang;
    store.set("seb_site_lang", state.lang);

    $$("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (key && I18N[state.lang][key]) el.textContent = I18N[state.lang][key];
    });

    const langBadge = isEn() ? "🌐 EN" : "🌐 TR";
    if ($("lang-pill-text")) $("lang-pill-text").textContent = langBadge;
    if ($("sub-lang-label")) $("sub-lang-label").textContent = langBadge;
    if ($("about-tile-summary")) $("about-tile-summary").textContent = t("aboutTileSummary");

    const lowLbl = state.lowEnd ? t("lowOn") : t("lowOff");
    if ($("lowend-pill-text")) $("lowend-pill-text").textContent = lowLbl;
    if ($("sub-lowend-label")) $("sub-lowend-label").textContent = lowLbl;
    if ($("ytm-hint-text")) $("ytm-hint-text").innerHTML = t("ytmHint");
    if ($("feeds-head-title")) $("feeds-head-title").textContent = t("feedsHead");

    state.weatherDesc = wmoToText(state.weatherCode);
    renderWhoamiAndBrand();
    renderHadithTile();
    renderYtmTile();
    updateLiveClock();
    loadNptechVideosTile();
    loadGitHubTile();
    updateHomeSysInfoTile();
    liveTilesEngine.refreshAllContent();

    if (state.view !== "home") renderSubpage();
    if (state.charmsOpen) renderCharmsPane();
    if (notify) showToast(t("toastLang"));
}

const toggleLanguage = () => applyLanguage(state.lang === "tr" ? "en" : "tr", true);

function setLowEndMode(enabled, notify = true) {
    state.lowEnd = Boolean(enabled);
    document.body.classList.toggle("low-end", state.lowEnd);
    if (state.lowEnd) {
        canvasEngine.stop();
        liveTilesEngine.stop();
        $$("[data-metro-tilt]").forEach(el => { el.style.transform = ""; });
    } else {
        canvasEngine.start();
        liveTilesEngine.start();
    }

    const label = state.lowEnd ? t("lowOn") : t("lowOff");
    $("lowend-top-btn")?.classList.toggle("active-flag", state.lowEnd);
    if ($("lowend-pill-text")) $("lowend-pill-text").textContent = label;
    if ($("sub-lowend-label")) $("sub-lowend-label").textContent = label;

    store.set("seb_low_end_mode", state.lowEnd ? "1" : "0");
    if (state.charmsOpen) renderCharmsPane();
    if (notify) showToast(state.lowEnd ? t("toastLowOn") : t("toastLowOff"));
}

const toggleLowEndMode = () => setLowEndMode(!state.lowEnd, true);

function applyTheme(id, notify = true) {
    const found = VISUAL_THEMES.find(tObj => tObj.id === id) || VISUAL_THEMES[0];
    state.theme = found.id;
    document.body.setAttribute("data-theme", found.id);
    if ($("theme-pill-text")) $("theme-pill-text").textContent = found.short;
    if ($("sub-theme-label")) $("sub-theme-label").textContent = found.short;
    store.set("seb_visual_theme", found.id);
    renderWeatherTile();
    if (state.charmsOpen) renderCharmsPane();
    if (notify) showToast(`${t("toastTheme")} ${found.name}`);
}

function cycleTheme() {
    const idx = VISUAL_THEMES.findIndex(tObj => tObj.id === state.theme);
    applyTheme(VISUAL_THEMES[(idx + 1) % VISUAL_THEMES.length].id, true);
}

function applyAccent(hex, notify = true) {
    const found = METRO_ACCENTS.find(c => c.hex.toLowerCase() === String(hex).toLowerCase()) || METRO_ACCENTS[0];
    state.accentHex = found.hex;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--accent", found.hex);
    rootStyle.setProperty("--accent-rgb", found.rgb);
    rootStyle.setProperty("--accent-light", found.light);
    store.set("seb_metro_accent", found.hex);
    if (state.charmsOpen) renderCharmsPane();
    if (notify) showToast(`${t("toastAccent")} ${found.name}`);
}

function bindMetroTilt(root = document) {
    $$("[data-metro-tilt]", root).forEach(tile => {
        if (tile.dataset.tiltBound) return;
        tile.dataset.tiltBound = "1";
        let pending = false, lx = 0, ly = 0;
        const update = () => {
            pending = false;
            if (state.lowEnd) return;
            const r = tile.getBoundingClientRect();
            const rx = (0.5 - (ly - r.top) / r.height) * 7;
            const ry = ((lx - r.left) / r.width - 0.5) * 7;
            tile.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.005)`;
        };
        tile.addEventListener("mousemove", e => {
            if (state.lowEnd) return;
            lx = e.clientX; ly = e.clientY;
            if (!pending) { pending = true; requestAnimationFrame(update); }
        }, { passive: true });
        tile.addEventListener("mouseleave", () => { tile.style.transform = ""; }, { passive: true });
    });
}

/* =====================================================================
   4. CANLI KAYSERİ SAATİ & 40 HADİS
   ===================================================================== */
const istanbulTimeFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const istanbulDateFmtTr = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric", weekday: "long" });
const istanbulDateFmtEn = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric", weekday: "long" });
const istanbulPartsFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" });

function getIstanbulDayOfYear() {
    try {
        const p = Object.fromEntries(istanbulPartsFmt.formatToParts(new Date()).map(x => [x.type, Number(x.value)]));
        return Math.floor((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 1)) / 86400000) + 1;
    } catch { return 1; }
}

function updateLiveClock() {
    if (document.hidden) return;
    try {
        const now = new Date();
        const p = Object.fromEntries(istanbulTimeFmt.formatToParts(now).map(x => [x.type, x.value]));
        if ($("top-clock-text")) $("top-clock-text").textContent = `${p.hour}:${p.minute}:${p.second}`;
        if ($("tile-clock-hm")) $("tile-clock-hm").textContent = `${p.hour}:${p.minute}`;
        if ($("tile-clock-sec")) $("tile-clock-sec").textContent = `:${p.second}`;
        if ($("tile-clock-date")) {
            const dStr = (isEn() ? istanbulDateFmtEn : istanbulDateFmtTr).format(now);
            $("tile-clock-date").textContent = dStr.charAt(0).toUpperCase() + dStr.slice(1);
        }
        if ($("clock-greeting")) {
            const h = Number(p.hour);
            $("clock-greeting").textContent = h >= 5 && h < 12 ? t("greetMorn") : h >= 12 && h < 18 ? t("greetDay") : h >= 18 && h < 22 ? t("greetEve") : t("greetNight");
        }
        const doyIdx = (getIstanbulDayOfYear() - 1) % FORTY_HADITHS.length;
        if (doyIdx !== state.todayHadithIdx) {
            state.todayHadithIdx = state.hadithIdx = doyIdx;
            renderHadithTile();
            liveTilesEngine.updateBackFace("hadis");
        }
    } catch {}
}

function renderHadithTile() {
    const h = FORTY_HADITHS[state.hadithIdx % FORTY_HADITHS.length];
    const body = $("hadith-tile-body");
    if (!h || !body) return;
    if ($("hadith-num-badge")) $("hadith-num-badge").textContent = `${t("hadithWord")} #${h.id} / 40`;
    if ($("hadith-source-el")) $("hadith-source-el").textContent = h.source;
    if ($("hadith-today-btn")) $("hadith-today-btn").style.opacity = state.hadithIdx === state.todayHadithIdx ? "0.45" : "1";
    body.innerHTML = `<div style="font-size:0.8rem;font-weight:600;color:var(--accent-light);margin-top:5px;">${escapeHtml(h.title)}</div><p class="hadith-quote">“${escapeHtml(h.text)}”</p>`;
}

const stepHadith = delta => { state.hadithIdx = (state.hadithIdx + delta + FORTY_HADITHS.length) % FORTY_HADITHS.length; renderHadithTile(); };
function resetHadithToToday() {
    state.hadithIdx = state.todayHadithIdx;
    renderHadithTile();
    showToast(`${t("todayHadithToast")} (#${FORTY_HADITHS[state.todayHadithIdx].id}).`);
}

/* =====================================================================
   5. SOSYAL KUTUCUKLAR, WHOAMI, KAYSERİ HAVA & ATMOSFER, YT MUSIC, GITHUB
   ===================================================================== */
function renderSocialTiles(containerId) {
    const el = $(containerId);
    if (!el) return;
    const list = SITE_CONFIG.socialTiles || [];
    if (containerId === "home-social-grid" && $("social-count-label")) {
        $("social-count-label").textContent = `${list.length} ${t("accountsWord")}`;
    }
    el.innerHTML = list.map(s => `
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer"
           class="metro-tile social-metro-tile" data-metro-tilt style="background:${hexToRgba(s.color, 0.88)};">
            <div class="social-logo-box">${getSocialIconSvg(s.icon)}</div>
            <div class="min-w-0" style="flex:1;">
                <div class="social-name"><span>${escapeHtml(s.name)}</span><span style="font-size:0.74rem;opacity:0.86;">↗</span></div>
                <div class="social-handle truncate">${escapeHtml(s.handle)}</div>
            </div>
        </a>
    `).join("");
    bindMetroTilt(el);
}

function renderWhoamiAndBrand() {
    const age = calculateAge(SITE_CONFIG.birthDate);
    const temp = Math.round(state.weatherTemp);
    const weatherStr = isEn() ? `${temp}°C and ${state.weatherDesc}` : `${temp}°C ve ${state.weatherDesc}`;

    if ($("weather-pill-text")) $("weather-pill-text").textContent = `Kayseri · ${temp}°C · ${state.weatherDesc}`;
    if ($("tile-clock-weather")) $("tile-clock-weather").textContent = `Kayseri · ${temp}°C (${state.weatherDesc})`;
    if ($("site-title-el")) $("site-title-el").innerHTML = `${escapeHtml(SITE_CONFIG.domainPrefix)}<span class="domain-tld">${escapeHtml(SITE_CONFIG.domainSuffix)}</span>`;
    if ($("site-subtitle-el")) $("site-subtitle-el").textContent = isEn() ? EN_SUBTITLE : SITE_CONFIG.subtitle;
    if ($("home-avatar-slot")) $("home-avatar-slot").innerHTML = getAvatarMarkup();

    if ($("whoami-bio-box")) {
        const paras = isEn() ? EN_BIO_PARAGRAPHS : (SITE_CONFIG.bioParagraphs || []);
        $("whoami-bio-box").innerHTML = paras.map(p => `<p>${
            escapeHtml(p)
                .replace(/\{\{AGE\}\}/g, `<span class="whoami-highlight">${age}</span>`)
                .replace(/\{\{WEATHER\}\}/g, `<span class="whoami-highlight">${escapeHtml(weatherStr)}</span>`)
        }</p>`).join("");
    }

    if ($("tile-count-projects")) $("tile-count-projects").textContent = String(SITE_CONFIG.projects.length);
    if ($("tile-count-blog")) $("tile-count-blog").textContent = String(SITE_CONFIG.blogPosts.length);
    if ($("tile-count-games")) $("tile-count-games").textContent = String((SITE_CONFIG.games || []).length);
    renderSocialTiles("home-social-grid");
    renderWeatherTile();
}

function wmoToText(code) {
    if (isEn()) {
        if (code === 0) return "clear & sunny";
        if (code <= 2) return "partly cloudy";
        if (code === 3) return "overcast";
        if (code === 45 || code === 48) return "foggy";
        if (code >= 51 && code <= 67) return "rainy";
        if (code >= 71 && code <= 86) return "snowy";
        if (code >= 95) return "thunderstorm";
        return "variable clouds";
    }
    if (code === 0) return "açık ve güneşli";
    if (code <= 2) return "parçalı bulutlu";
    if (code === 3) return "bulutlu";
    if (code === 45 || code === 48) return "sisli";
    if (code >= 51 && code <= 67) return "yağmurlu";
    if (code >= 71 && code <= 86) return "kar yağışlı";
    if (code >= 95) return "sağanak yağışlı";
    return "değişken bulutlu";
}

function wmoToEmoji(code, isDay = 1) {
    if (code === 0) return isDay ? "☀️" : "🌙";
    if (code <= 2) return isDay ? "⛅" : "☁️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 86) return "❄️";
    if (code >= 95) return "⛈️";
    return "🌤️";
}

function getKayseriAtmosphere() {
    const code = Number(state.weatherCode || 0);
    const isDay = Number(state.weatherIsDay ?? 1);
    const temp = Math.round(state.weatherTemp);
    const en = isEn();

    let themeId = "harmony";
    let mood = en ? "Crisp Kayseri Sky" : "Kayseri Ferah Hava";
    let icon = "🌤️";

    if (code >= 95 || code === 45 || code === 48) {
        themeId = "gothic";
        mood = code >= 95 ? (en ? "Stormy Mood" : "Fırtınalı Atmosfer") : (en ? "Misty & Foggy" : "Sisli & Puslu");
        icon = code >= 95 ? "⛈️" : "🌫️";
    } else if ((code >= 71 && code <= 86) || (code >= 51 && code <= 67)) {
        themeId = "aurora";
        mood = code >= 71 ? (en ? "Snowy Kayseri" : "Karlı Kayseri") : (en ? "Rainy Breeze" : "Yağışlı Hava");
        icon = code >= 71 ? "❄️" : "🌧️";
    } else if (!isDay) {
        themeId = "twilight";
        mood = en ? "Kayseri Night" : "Kayseri Gecesi";
        icon = "🌙";
    } else if (code === 0 && temp >= 18) {
        themeId = "meadow";
        mood = en ? "Warm & Sunny" : "Güneşli & Sıcak";
        icon = "☀️";
    } else if (code === 3) {
        themeId = "lale";
        mood = en ? "Calm Overcast" : "Sakin & Bulutlu";
        icon = "☁️";
    }

    const themeObj = VISUAL_THEMES.find(th => th.id === themeId) || VISUAL_THEMES[0];
    return { icon, mood, themeId: themeObj.id, themeName: themeObj.short };
}

function buildWeatherAdvice() {
    const feels = Math.round(state.weatherFeels);
    const code = Number(state.weatherCode || 0);
    const rainProb = Number(state.weatherRainProb || 0);
    const wind = Math.round(state.weatherWind || 0);
    const minT = Math.round(state.weatherMin);
    const maxT = Math.round(state.weatherMax);

    const isRainCode = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
    const isSnowCode = (code >= 71 && code <= 77) || code === 85 || code === 86;

    if (isEn()) {
        let outfit = "";
        if (feels <= 0) outfit = "Wear a heavy winter coat, scarf, beanie, gloves, and sturdy insulated boots.";
        else if (feels <= 7) outfit = "A warm winter jacket layered over a sweater or hoodie is recommended.";
        else if (feels <= 14) outfit = "A mid-season jacket, cardigan, or thick sweatshirt will feel right.";
        else if (feels <= 20) outfit = "A light jacket or long-sleeve shirt is enough; watch for cool evenings.";
        else if (feels <= 27) outfit = "A T-shirt and comfortable breathable clothing are ideal.";
        else outfit = "Wear light-colored, breathable fabrics; carry water and sunglasses.";

        let rainTip = "";
        if (isSnowCode) rainTip = "Snow expected — wear waterproof boots and a hooded coat.";
        else if (isRainCode || rainProb >= 55) rainTip = `Definitely bring an umbrella and water-resistant shoes (${rainProb}% rain chance).`;
        else if (rainProb >= 30) rainTip = `Brief showers possible (${rainProb}%); keep a compact umbrella in your bag.`;
        else rainTip = `No umbrella needed today (${rainProb}% rain chance).`;

        const items = [
            { icon: "🧥", label: "Outfit", text: outfit },
            { icon: isSnowCode ? "❄️" : "☂️", label: isSnowCode ? "Snow" : "Umbrella", text: rainTip }
        ];
        if (wind >= 28) items.push({ icon: "💨", label: "Wind", text: `Strong wind (${wind} km/h); a windproof outer layer is advised.` });
        else if (code === 45 || code === 48) items.push({ icon: "🌫️", label: "Visibility", text: "Fog may reduce visibility; drive carefully." });
        else if (maxT - minT >= 10) items.push({ icon: "🌡️", label: "Temp Swing", text: `Wide day/night swing in Kayseri (${minT}°C / ${maxT}°C); bring an extra layer for evening.` });
        else if (code === 0 && state.weatherIsDay && feels >= 22) items.push({ icon: "🕶️", label: "Sun", text: "Clear and sunny — sunglasses and sunscreen are helpful." });
        return items;
    }

    let outfit = "";
    if (feels <= 0) outfit = "Kalın kışlık mont, atkı, bere ve eldiven giy; don ve buzlanmaya karşı sağlam bot tercih et.";
    else if (feels <= 7) outfit = "Kalın mont veya kaban içine kazak/hoodie ile katmanlı giyinmen iyi olur.";
    else if (feels <= 14) outfit = "Mevsimlik ceket, hırka veya kalın sweatshirt tam kıvamında olur.";
    else if (feels <= 20) outfit = "İnce ceket, gömlek veya uzun kollu tişört yeterli; akşam serinliğine dikkat.";
    else if (feels <= 27) outfit = "Tişört ve rahat, nefes alan kıyafetler uygun.";
    else outfit = "Açık renkli, ince ve pamuklu kıyafetler giy; yanına su ve güneş gözlüğü al.";

    let rainTip = "";
    if (isSnowCode) rainTip = "Kar yağışı görülüyor; su geçirmez bot ve kapüşonlu mont tercih et.";
    else if (isRainCode || rainProb >= 55) rainTip = `Yanına mutlaka şemsiye ve suya dayanıklı ayakkabı al (yağış ihtimali %${rainProb}).`;
    else if (rainProb >= 30) rainTip = `Gün içinde kısa süreli yağış olabilir (%${rainProb}); çantada küçük bir şemsiye bulundur.`;
    else rainTip = `Şemsiyeye gerek görünmüyor (yağış ihtimali %${rainProb}).`;

    const items = [
        { icon: "🧥", label: "Kıyafet", text: outfit },
        { icon: isSnowCode ? "❄️" : "☂️", label: isSnowCode ? "Kar" : "Şemsiye", text: rainTip }
    ];
    if (wind >= 28) items.push({ icon: "💨", label: "Rüzgâr", text: `Rüzgâr kuvvetli (${wind} km/s); rüzgâr kesen dış katman konfor sağlar.` });
    else if (code === 45 || code === 48) items.push({ icon: "🌫️", label: "Görüş", text: "Sis nedeniyle görüş mesafesi düşebilir, sürüşte dikkatli ol." });
    else if (maxT - minT >= 10) items.push({ icon: "🌡️", label: "Sıcaklık Farkı", text: `Kayseri'de gece-gündüz farkı yüksek (${minT}°C / ${maxT}°C); akşam dışarıdaysan ekstra katman al.` });
    else if (code === 0 && state.weatherIsDay && feels >= 22) items.push({ icon: "🕶️", label: "Güneş", text: "Hava açık ve güneşli; güneş gözlüğü ve güneş kremi işine yarar." });
    return items;
}

function renderWeatherTile() {
    if (!$("weather-live-tile")) return;
    const temp = Math.round(state.weatherTemp);
    const feels = Math.round(state.weatherFeels);
    const minT = Math.round(state.weatherMin);
    const maxT = Math.round(state.weatherMax);
    const hum = Math.round(state.weatherHumidity);
    const wind = Math.round(state.weatherWind);
    const rain = Math.round(state.weatherRainProb);

    const badge = $("weather-mode-badge");
    if (badge) {
        badge.textContent = state.weatherLive ? t("weatherLiveBadge") : t("cacheBadge");
        badge.classList.toggle("live", state.weatherLive);
    }
    if ($("weather-icon-el")) $("weather-icon-el").textContent = wmoToEmoji(state.weatherCode, state.weatherIsDay);
    if ($("weather-temp-big")) $("weather-temp-big").textContent = `${temp}°C`;
    if ($("weather-desc-big")) $("weather-desc-big").textContent = state.weatherDesc;
    if ($("weather-meta-line")) $("weather-meta-line").textContent = `${t("feelsLbl")} ${feels}°C · ${t("dailyLbl")} ${minT}°C / ${maxT}°C`;
    if ($("weather-sub-line")) $("weather-sub-line").textContent = `${t("humLbl")} ${hum}% · ${t("windLbl")} ${wind} ${t("windUnit")} · ${t("rainLbl")} ${rain}%`;

    const atmoSlot = $("weather-atmosphere-slot");
    if (atmoSlot) {
        const atmo = getKayseriAtmosphere();
        const isMatched = state.theme === atmo.themeId;
        atmoSlot.classList.remove("hidden");
        atmoSlot.innerHTML = `
            <span class="weather-atmo-label">
                <span aria-hidden="true">${atmo.icon}</span>
                <span class="weather-atmo-chip">${escapeHtml(atmo.mood)}</span>
            </span>
            ${isMatched
                ? `<span class="mono-sm" style="color:#a7f3d0;">${escapeHtml(t("atmoMatched"))}</span>`
                : `<button type="button" class="metro-flat-btn xs" onclick="applyTheme('${escapeHtml(atmo.themeId)}',true)">🎨 ${escapeHtml(t("atmoApplyBtn"))} ${escapeHtml(atmo.themeName)}</button>`}`;
    }

    const slot = $("weather-advice-slot");
    if (slot) {
        slot.innerHTML = buildWeatherAdvice().map(it => `
            <div class="weather-advice-item">
                <span aria-hidden="true">${it.icon}</span>
                <span><strong>${escapeHtml(it.label)}:</strong> ${escapeHtml(it.text)}</span>
            </div>`).join("");
    }
}

async function fetchKayseriWeather(notify = false) {
    const { lat, lon } = SITE_CONFIG.weather;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=Europe%2FIstanbul`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw 0;
        const data = await res.json();
        const c = data?.current;
        const d = data?.daily;
        if (c) {
            state.weatherTemp = c.temperature_2m;
            state.weatherFeels = c.apparent_temperature ?? c.temperature_2m;
            state.weatherHumidity = c.relative_humidity_2m ?? state.weatherHumidity;
            state.weatherWind = c.wind_speed_10m ?? state.weatherWind;
            state.weatherCode = c.weather_code ?? 0;
            state.weatherIsDay = c.is_day ?? 1;
            state.weatherDesc = wmoToText(state.weatherCode);
            if (d) {
                if (Array.isArray(d.temperature_2m_min) && d.temperature_2m_min.length) state.weatherMin = d.temperature_2m_min[0];
                if (Array.isArray(d.temperature_2m_max) && d.temperature_2m_max.length) state.weatherMax = d.temperature_2m_max[0];
                if (Array.isArray(d.precipitation_probability_max) && d.precipitation_probability_max.length) state.weatherRainProb = d.precipitation_probability_max[0] ?? 0;
            }
            state.weatherLive = true;
            if (notify) showToast(isEn()
                ? `Kayseri weather updated: ${Math.round(state.weatherTemp)}°C, ${state.weatherDesc}`
                : `Kayseri hava durumu güncellendi: ${Math.round(state.weatherTemp)}°C, ${state.weatherDesc}`);
        }
    } catch {
        state.weatherLive = false;
        if (notify) showToast(isEn() ? "Weather update failed, showing cached data." : "Hava durumu güncellenemedi, önbellek gösteriliyor.");
    }
    renderWhoamiAndBrand();
}

function renderYtmTile() {
    const list = SITE_CONFIG.youtubeMusic.playlists || [];
    if (!list.length) return;
    if (state.activePlaylistIdx >= list.length) state.activePlaylistIdx = 0;
    const active = list[state.activePlaylistIdx];

    $("ytm-tabs").innerHTML = list.map((p, i) =>
        `<button type="button" class="ytm-tab ${i === state.activePlaylistIdx ? "active" : ""}" onclick="selectYtmPlaylist(${i})">${escapeHtml(p.name)}</button>`
    ).join("");
    $("ytm-active-title").textContent = active.name;
    $("ytm-active-mood").textContent = active.artist || "";
    $("ytm-open-link").href = active.url || (active.playlistId
        ? `https://music.youtube.com/playlist?list=${encodeURIComponent(active.playlistId)}`
        : `https://music.youtube.com/watch?v=${encodeURIComponent(active.videoId || "")}`);

    const embedUrl = active.playlistId
        ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(active.playlistId)}`
        : (active.videoId ? `https://www.youtube.com/embed/${encodeURIComponent(active.videoId)}?rel=0` : "");

    const showEmbed = state.ytmEmbedOpen && Boolean(embedUrl);
    $("ytm-embed-toggle").textContent = showEmbed ? t("hide") : t("play");
    if ($("ytm-hint-text")) $("ytm-hint-text").innerHTML = t("ytmHint");
    $("ytm-strip").classList.toggle("hidden", showEmbed);
    $("ytm-embed-wrap").classList.toggle("hidden", !showEmbed);
    const iframe = $("ytm-iframe");
    if (showEmbed && iframe.src !== embedUrl) iframe.src = embedUrl;
    else if (!showEmbed && iframe.src) iframe.src = "";
}

const selectYtmPlaylist = i => { state.activePlaylistIdx = i; renderYtmTile(); };
const toggleYtmEmbed = () => { state.ytmEmbedOpen = !state.ytmEmbedOpen; renderYtmTile(); };

async function loadNptechVideosTile() {
    const slot = $("nptech-videos-slot");
    if (!slot) return;
    const np = SITE_CONFIG.nptechYoutube || DEFAULT_SITE_CONFIG.nptechYoutube;
    const chUrl = np.channelUrl || "https://www.youtube.com/@nptechtr";
    if ($("nptech-channel-link")) $("nptech-channel-link").href = chUrl;

    let videos = (np.videos || []).map(v => ({ ...v }));
    let live = false;

    const chId = (np.channelId || "").trim();
    if (chId) {
        try {
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(chId)}`;
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === "ok" && Array.isArray(data.items) && data.items.length) {
                    videos = data.items.slice(0, 3).map((it, idx) => ({
                        id: "yt-live-" + idx,
                        title: it.title,
                        date: String(it.pubDate || "").slice(0, 10),
                        duration: isEn() ? "New" : "Yeni",
                        url: it.link || chUrl
                    }));
                    live = true;
                }
            }
        } catch {}
    }

    const badge = $("nptech-mode-badge");
    if (badge) {
        badge.textContent = live ? t("liveRss") : t("channelArchive");
        badge.classList.toggle("live", live);
    }

    slot.innerHTML = videos.map(v => `
        <a href="${escapeHtml(v.url || chUrl)}" target="_blank" rel="noopener noreferrer" class="gh-repo-link">
            <div class="row-between" style="font-size:0.76rem;font-weight:600;gap:8px;">
                <span class="truncate">${escapeHtml(v.title)}</span>
                <span class="mono-sm" style="color:#ff9e9e;flex-shrink:0;">${escapeHtml(v.duration || "▶")}</span>
            </div>
            <div class="truncate" style="font-size:0.68rem;opacity:0.82;">${escapeHtml(v.date || "@nptechtr")} · ${escapeHtml(t("watchYt"))}</div>
        </a>`).join("");
}

async function loadGitHubTile() {
    const u = SITE_CONFIG.username || "sabanefebenzil";
    const ghUrl = SITE_CONFIG.socialTiles.find(s => s.icon === "github")?.url || `https://github.com/${u}`;
    $("gh-profile-link").href = ghUrl;

    let name = SITE_CONFIG.fullName, bio = `@${u}`, reposCount = 12, followers = 18, live = false, avHtml = getAvatarMarkup();
    let repos = [
        { name: "teng-wear-signal-analyzer", description: "Triboelektrik Nanogeneratör motor aşınma analizörü", stars: 9, url: ghUrl },
        { name: "ai-adfilter-rss-bot", description: "Oracle Cloud AI reklam filtreli Telegram otomasyon botu", stars: 14, url: ghUrl },
        { name: "sabanefebenzil.github.io", description: "Kişisel portfolyo & Metro UI web sitesi", stars: 11, url: ghUrl }
    ];

    try {
        const [uRes, rRes] = await Promise.all([
            fetch(`https://api.github.com/users/${encodeURIComponent(u)}`),
            fetch(`https://api.github.com/users/${encodeURIComponent(u)}/repos?sort=updated&per_page=3`)
        ]);
        if (uRes.ok) {
            const ud = await uRes.json();
            name = ud.name || ud.login || name;
            bio = ud.bio || `@${ud.login}`;
            reposCount = ud.public_repos ?? reposCount;
            followers = ud.followers ?? followers;
            if (ud.avatar_url) avHtml = `<img src="${escapeHtml(ud.avatar_url)}" alt="GitHub" style="width:100%;height:100%;object-fit:cover;">`;
            live = true;
        }
        if (rRes.ok) {
            const rd = await rRes.json();
            if (Array.isArray(rd) && rd.length) {
                repos = rd.slice(0, 3).map(r => ({ name: r.name, description: r.description || "GitHub repository", stars: r.stargazers_count || 0, url: r.html_url }));
            }
        }
    } catch {}

    $("gh-name-el").textContent = name;
    $("gh-bio-el").textContent = bio;
    $("gh-repo-count").textContent = reposCount;
    $("gh-follower-count").textContent = followers;
    $("gh-avatar-slot").innerHTML = avHtml;
    $("gh-mode-badge").textContent = live ? t("liveApi") : t("cacheBadge");
    $("gh-mode-badge").classList.toggle("live", live);

    $("gh-repos-slot").innerHTML = repos.map(r => `
        <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="gh-repo-link">
            <div class="row-between" style="font-size:0.75rem;font-weight:600;">
                <span class="truncate">${escapeHtml(r.name)}</span>
                <span class="mono-sm">★ ${r.stars}</span>
            </div>
            <div class="truncate" style="font-size:0.68rem;opacity:0.82;">${escapeHtml(r.description)}</div>
        </a>`).join("");
}

function refreshAllLiveTiles() {
    fetchKayseriWeather(false);
    loadGitHubTile();
    loadNptechVideosTile();
    fetchVisitorIpInfo(false);
    measureVisitorLatency(false);
    liveTilesEngine.refreshAllContent();
    showToast(t("toastRefreshed"));
}

/* =====================================================================
   6. ZİYARETÇİ SİSTEM BİLGİLERİ, IP ADRESİ, PİNG & CANLI FPS
   ===================================================================== */
let sysFpsRafId = null;

function startSysFpsMonitor() {
    if (sysFpsRafId) return;
    let frames = 0, last = performance.now();
    const loop = now => {
        if (state.view !== "sysinfo" || document.hidden) { sysFpsRafId = null; return; }
        frames++;
        if (now - last >= 500) {
            state.sysInfo.fps = Math.round((frames * 1000) / (now - last));
            frames = 0; last = now;
            if ($("sys-fps-val")) $("sys-fps-val").textContent = `${state.sysInfo.fps} FPS`;
        }
        sysFpsRafId = requestAnimationFrame(loop);
    };
    sysFpsRafId = requestAnimationFrame(loop);
}

const stopSysFpsMonitor = () => { if (sysFpsRafId) { cancelAnimationFrame(sysFpsRafId); sysFpsRafId = null; } };

function updateHomeSysInfoTile() {
    const s = state.sysInfo;
    if ($("home-sysinfo-ip")) $("home-sysinfo-ip").textContent = s.ip;
    if ($("home-sysinfo-os")) $("home-sysinfo-os").textContent = `${s.os} · ${s.browser}`;
    if ($("home-sysinfo-ping")) $("home-sysinfo-ping").textContent = s.pingMs !== null ? `${s.pingMs} ms` : (isEn() ? "measuring" : "ölçülüyor");
}

function detectWebGLGpu() {
    try {
        const gl = document.createElement("canvas").getContext("webgl") || document.createElement("canvas").getContext("experimental-webgl");
        if (!gl) return "WebGL N/A";
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        const raw = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        return raw ? String(raw).replace(/^ANGLE \((.+)\)$/, "$1") : "Standard GPU";
    } catch { return "Hidden by browser"; }
}

function parseUA() {
    const ua = navigator.userAgent || "";
    const osRules = [
        [/Windows NT 10\.0/, () => "Windows 10 / 11"],
        [/Windows NT 6\.3/, () => "Windows 8.1"],
        [/Windows NT 6\.2/, () => "Windows 8"],
        [/Windows NT 6\.1/, () => "Windows 7"],
        [/Android\s+([0-9.]+)/, m => `Android ${m[1]}`],
        [/iPhone OS\s+([0-9_]+)/, m => `iOS ${m[1].replace(/_/g, ".")}`],
        [/iPad; CPU OS\s+([0-9_]+)/, m => `iPadOS ${m[1].replace(/_/g, ".")}`],
        [/Mac OS X\s+([0-9_]+)/, m => `macOS ${m[1].replace(/_/g, ".")}`],
        [/CrOS/, () => "ChromeOS"],
        [/Linux/, () => "Linux"]
    ];
    let os = "Unknown OS";
    for (const [re, fn] of osRules) { const m = ua.match(re); if (m) { os = fn(m); break; } }

    const brRules = [
        [/Edg\/([0-9.]+)/, m => [`Microsoft Edge ${m[1]}`, "Blink"]],
        [/OPR\/([0-9.]+)/, m => [`Opera ${m[1]}`, "Blink"]],
        [/Firefox\/([0-9.]+)/, m => [`Mozilla Firefox ${m[1]}`, "Gecko"]],
        [/Chrome\/([0-9.]+)/, m => !/Chromium/.test(ua) ? [`Google Chrome ${m[1]}`, "Blink"] : null],
        [/Version\/([0-9.]+).*Safari/, m => [`Apple Safari ${m[1]}`, "WebKit"]]
    ];
    let browser = "Unknown Browser", engine = "Unknown";
    for (const [re, fn] of brRules) {
        const m = ua.match(re);
        const hit = m && fn(m);
        if (hit) { [browser, engine] = hit; break; }
    }
    return { os, browser, engine };
}

async function detectClientHardwareAndBrowser() {
    const s = state.sysInfo;
    Object.assign(s, parseUA(), { arch: navigator.platform || "—" });

    if (navigator.userAgentData?.getHighEntropyValues) {
        try {
            const h = await navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion", "architecture", "bitness"]);
            if (h.platform === "Windows" && h.platformVersion) {
                s.os = parseInt(h.platformVersion.split(".")[0], 10) >= 13 ? "Windows 11" : "Windows 10";
            } else if (h.platform && h.platformVersion) {
                s.os = `${h.platform} ${h.platformVersion}`;
            }
            if (h.architecture) s.arch = `${h.architecture}${h.bitness ? ` (${h.bitness}-bit)` : ""}`;
        } catch {}
    }

    s.cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : "Hidden";
    s.ram = navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : "Hidden";
    s.gpu = detectWebGLGpu();
    s.screenRes = `${screen.width} × ${screen.height} px`;
    s.viewport = `${innerWidth} × ${innerHeight} px`;
    s.dpr = `${(devicePixelRatio || 1).toFixed(2).replace(/\.00$/, "")}x`;
    s.colorDepth = `${screen.colorDepth || 24}-bit`;

    try {
        s.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "—";
        const off = -new Date().getTimezoneOffset();
        s.utcOffset = `UTC${off >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(off) / 60)).padStart(2, "0")}:${String(Math.abs(off) % 60).padStart(2, "0")}`;
    } catch {}

    s.language = navigator.languages?.length
        ? `${navigator.language} (${navigator.languages.slice(0, 3).join(", ")})`
        : (navigator.language || "tr-TR");

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    s.online = navigator.onLine !== false;
    s.connType = conn?.effectiveType ? String(conn.effectiveType).toUpperCase() : (s.online ? "Online" : "Offline");
    s.downlink = typeof conn?.downlink === "number" ? `${conn.downlink} Mbps` : "—";
    s.rtt = typeof conn?.rtt === "number" ? `${conn.rtt} ms` : "—";

    if (navigator.getBattery) {
        try {
            const b = await navigator.getBattery();
            s.battery = `${Math.round(b.level * 100)}% · ${b.charging ? "Charging ⚡" : "Battery"}`;
        } catch { s.battery = "Desktop / Hidden"; }
    } else {
        s.battery = "Desktop / N/A";
    }

    updateHomeSysInfoTile();
    if (state.view === "sysinfo") renderSubpage();
}

async function fetchVisitorIpInfo(notify = false) {
    const s = state.sysInfo;
    const providers = [
        {
            url: "https://ipapi.co/json/", name: "ipapi.co",
            parse: d => d?.ip && !d.error ? { ip: d.ip, isp: d.org, asn: d.asn, city: d.city || d.region, country: d.country_name || d.country } : null
        },
        {
            url: "https://ipwho.is/", name: "ipwho.is",
            parse: d => d?.success && d.ip ? { ip: d.ip, ipVersion: d.type, isp: d.connection?.isp || d.connection?.org, asn: d.connection?.asn ? `AS${d.connection.asn}` : "—", city: d.city || d.region, country: d.country } : null
        },
        {
            url: "https://api.ipify.org?format=json", name: "ipify.org",
            parse: d => d?.ip ? { ip: d.ip } : null
        }
    ];

    for (const p of providers) {
        try {
            const res = await fetch(p.url, { cache: "no-store" });
            if (!res.ok) continue;
            const info = p.parse(await res.json());
            if (info) {
                Object.assign(s, {
                    ip: info.ip,
                    ipVersion: info.ipVersion || (info.ip.includes(":") ? "IPv6" : "IPv4"),
                    isp: info.isp || s.isp,
                    asn: info.asn || s.asn,
                    city: info.city || s.city,
                    country: info.country || s.country,
                    ipSource: p.name
                });
                updateHomeSysInfoTile();
                if (state.view === "sysinfo") renderSubpage();
                if (notify) showToast(isEn() ? `IP updated: ${s.ip}` : `IP bilgileri güncellendi: ${s.ip}`);
                return;
            }
        } catch {}
    }

    s.ip = isEn() ? "Blocked (AdBlock/VPN)" : "Engellendi (AdBlock/VPN)";
    s.ipSource = isEn() ? "Unreachable" : "Erişilemedi";
    updateHomeSysInfoTile();
    if (state.view === "sysinfo") renderSubpage();
    if (notify) showToast(isEn() ? "Could not reach IP service." : "IP servisine ulaşılamadı.");
}

async function measureVisitorLatency(notify = false) {
    const endpoints = [
        { url: "https://www.cloudflare.com/cdn-cgi/trace", mode: "no-cors" },
        { url: "https://api.ipify.org?format=json", mode: "cors" }
    ];
    for (const ep of endpoints) {
        try {
            const t0 = performance.now();
            await fetch(`${ep.url}${ep.url.includes("?") ? "&" : "?"}_t=${Date.now()}`, { mode: ep.mode, cache: "no-store" });
            state.sysInfo.pingMs = Math.max(1, Math.round(performance.now() - t0));
            updateHomeSysInfoTile();
            if (state.view === "sysinfo") renderSubpage();
            if (notify) showToast(isEn() ? `HTTP Latency: ${state.sysInfo.pingMs} ms` : `Ağ gecikmesi (HTTP Ping): ${state.sysInfo.pingMs} ms`);
            return;
        } catch {}
    }
    if (notify) showToast(isEn() ? "Could not measure latency." : "Gecikme ölçülemedi.");
}

function copyVisitorIp() {
    const ip = state.sysInfo.ip;
    if (!ip || /Algılanıyor|Engellendi|Blocked/i.test(ip)) return showToast(isEn() ? "No copyable IP yet." : "Kopyalanabilir bir IP adresi henüz alınmadı.");
    copyText(ip, isEn() ? `IP copied: ${ip}` : `IP adresi kopyalandı: ${ip}`);
}

function copySystemReport() {
    const s = state.sysInfo;
    copyText([
        "=== sabanefebenzil.dev — System & Network Report ===",
        `Public IP   : ${s.ip} (${s.ipVersion})`,
        `ISP / Org   : ${s.isp} (${s.asn})`,
        `Location    : ${s.city}, ${s.country}`,
        `HTTP Ping   : ${s.pingMs !== null ? s.pingMs + " ms" : "N/A"}`,
        `Connection  : ${s.connType} · Downlink: ${s.downlink} · RTT: ${s.rtt}`,
        `Timezone    : ${s.timezone} (${s.utcOffset})`,
        `OS          : ${s.os} [${s.arch}]`,
        `Browser     : ${s.browser} (${s.engine})`,
        `CPU / RAM   : ${s.cores} / ${s.ram}`,
        `GPU         : ${s.gpu}`,
        `Display     : ${s.screenRes} / ${s.viewport} (DPR ${s.dpr}, ${s.colorDepth})`,
        `Battery     : ${s.battery}`,
        `Language    : ${s.language}`
    ].join("\n"), isEn() ? "System report copied to clipboard." : "Sistem ve IP raporu panoya kopyalandı.");
}

/* =====================================================================
   7. NAVİGASYON, ALT SAYFALAR, OYUNLAR, FORMAT/ISO, ANDROID & EV ŞARJ
   ===================================================================== */
const VALID_SUBPAGES = new Set(["projects", "games", "about", "setup", "hadis", "sysinfo", "toolkit", "android", "evcharge", "contact"]);

function navigateTo(view, updateHash = true) {
    if (view === "blog") {
        window.location.href = "blog.html";
        return;
    }
    const target = VALID_SUBPAGES.has(view) ? view : "home";
    state.view = target;
    target === "sysinfo" ? startSysFpsMonitor() : stopSysFpsMonitor();

    const isHome = target === "home";
    document.body.classList.toggle("metro-home-desktop", isHome);
    $("home-view").classList.toggle("hidden", !isHome);
    $("subpage-view").classList.toggle("hidden", isHome);
    $("subpage-veil").classList.toggle("active", !isHome);

    if (updateHash && history.replaceState) {
        const nextUrl = isHome ? window.location.pathname : `${window.location.pathname}#${target}`;
        history.replaceState(null, "", nextUrl);
    }

    if (!isHome) {
        $$("#pivot-bar .pivot-tab").forEach(b => b.classList.toggle("active", b.dataset.pivot === target));
        const activeTab = document.querySelector("#pivot-bar .pivot-tab.active");
        activeTab?.scrollIntoView({ behavior: state.lowEnd ? "auto" : "smooth", inline: "center", block: "nearest" });
        renderSubpage();
    }
    window.scrollTo(0, 0);
}

const handleBackAction = () => navigateTo("home");

const SUBPAGE_RENDERERS = {
    projects(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "PROJECTS" : "PROJELER";
        const filters = [
            { id: "all", label: en ? "All" : "Tümü" },
            { id: "muhendislik", label: en ? "Engineering / CAD" : "Mühendislik / CAD" },
            { id: "donanim", label: en ? "Hardware / Android" : "Donanım / Android" },
            { id: "yazilim", label: en ? "Software / Server" : "Yazılım / Sunucu" }
        ];
        const list = state.projectFilter === "all" ? SITE_CONFIG.projects : SITE_CONFIG.projects.filter(p => p.category === state.projectFilter);
        c.innerHTML = `
            <div class="filter-row">
                ${filters.map(f => `<button type="button" class="filter-pill ${state.projectFilter === f.id ? "active" : ""}" onclick="state.projectFilter='${f.id}';renderSubpage()">${f.label}</button>`).join("")}
            </div>
            <div class="two-col-grid">
                ${list.map((p, idx) => `
                    <article class="project-card" onclick="openProjectModal('${escapeHtml(p.id)}')">
                        <div>
                            <div class="row-between" style="margin-bottom:8px;">
                                <span class="metro-display" style="font-size:1.6rem;color:var(--accent-light);">${String(idx + 1).padStart(2, "0")}</span>
                                <span class="source-badge">${escapeHtml(p.year)}</span>
                            </div>
                            <h3 class="metro-display" style="font-size:1.3rem;margin-bottom:7px;">${escapeHtml(p.title)}</h3>
                            <p style="font-size:0.86rem;color:var(--text-secondary);line-height:1.54;">${escapeHtml(p.description)}</p>
                            <div class="tag-wrap">${(p.tech || []).map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join("")}</div>
                        </div>
                        <div class="row-between divider-top" style="font-size:0.75rem;margin-top:13px;padding-top:11px;">
                            <span class="mono-sm" style="opacity:0.75;">${escapeHtml(p.category)}</span>
                            <span style="color:var(--accent-light);font-weight:600;">${escapeHtml(t("detailArrow"))}</span>
                        </div>
                    </article>`).join("")}
            </div>`;
    },

    games(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "GAMES (ARCADE)" : "OYUNLAR (ARCADE)";
        const games = SITE_CONFIG.games || [];
        const cats = ["Tümü", ...new Set(games.map(g => g.cat))];
        const activeCat = state.gameCat || "Tümü";

        c.innerHTML = `
            <div class="row-between flex-wrap" style="gap:10px;margin-bottom:14px;">
                <div class="filter-row" style="margin-bottom:0;">
                    ${cats.map(cat => `<button type="button" class="filter-pill ${activeCat === cat ? "active" : ""}" onclick="state.gameCat='${escapeHtml(cat)}';renderSubpage()">${escapeHtml(gameCatLabel(cat))}</button>`).join("")}
                </div>
                <div style="flex:1;min-width:210px;max-width:300px;">
                    <input type="search" class="metro-input" placeholder="${en ? `Search ${games.length} games...` : `${games.length} oyun içinde ara...`}" value="${escapeHtml(state.gameSearch)}" oninput="state.gameSearch=this.value;renderGamesGridOnly()">
                </div>
            </div>
            <div class="three-col-grid" id="games-list-grid"></div>`;
        renderGamesGridOnly();
    },

    about(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "ABOUT" : "HAKKIMDA";
        const skills = en ? EN_SKILLS : (SITE_CONFIG.skills || DEFAULT_SITE_CONFIG.skills);
        const age = calculateAge(SITE_CONFIG.birthDate);
        c.innerHTML = `
            <div class="metro-panel row-center flex-wrap" style="margin-bottom:15px;gap:16px;">
                <div class="avatar-square" style="width:72px;height:72px;cursor:default;">${getAvatarMarkup()}</div>
                <div style="flex:1;min-width:220px;">
                    <h2 class="metro-display" style="font-size:1.9rem;">${escapeHtml(SITE_CONFIG.fullName)} <span style="font-size:1.05rem;opacity:0.68;">(NeonPeekr)</span></h2>
                    <div class="mono-sm" style="color:var(--accent-light);font-size:0.77rem;">@${escapeHtml(SITE_CONFIG.username)} · ${en ? `${age} y/o · Male · Turkish · Muslim` : `${age} yaşında · Erkek · Türk · Müslüman`} · ${escapeHtml(SITE_CONFIG.district)}</div>
                    <p style="font-size:0.86rem;color:var(--text-secondary);margin-top:5px;">${en
                        ? "Mechanical Engineering student at Erciyes University. Focused on 3D CAD, PC hardware, Android modding, and @nptechtr content."
                        : "Erciyes Üniversitesi Makine Mühendisliği öğrencisi. 3D CAD, bilgisayar donanımı, Android modifikasyonu ve @nptechtr içerikleri üzerine çalışıyor."}</p>
                </div>
            </div>
            <div class="two-col-grid">
                <div class="metro-panel">
                    <h3 class="metro-section-head" style="font-size:1.32rem;">${en ? "profile, languages & education" : "profil, diller & eğitim"}</h3>
                    <div class="info-stripe"><strong>${en ? "Languages:" : "Diller:"}</strong> ${en ? "C2 Turkish · B2 English · Basic Japanese & Arabic." : "C2 Türkçe · B2 İngilizce · Temel düzey Japonca ve Arapça."}</div>
                    <div class="info-stripe"><strong>${en ? "Interests:" : "İlgi Alanları:"}</strong> ${en ? "Phones, PCs, cars, and 3D modeling." : "Telefonlar, bilgisayarlar, otomobiller ve 3B modelleme."}</div>
                    <div class="info-stripe"><strong>${en ? "Erciyes University Mechanical Engineering:" : "Erciyes Üniversitesi Makine Mühendisliği:"}</strong> ${en ? "Kayseri · Freshman undergraduate (first-principles learning approach)." : "Kayseri · 1. sınıf lisans öğrencisi (First-principles öğrenme yaklaşımı)."}</div>
                    <div class="info-stripe"><strong>TÜBİTAK 2209-A:</strong> ${en ? "Triboelectric Nanogenerator (TENG) engine wear signal research completed in July 2026." : "Temmuz 2026'da tamamlanan Triboelektrik Nanogeneratör (TENG) motor aşınma sinyali araştırması."}</div>
                </div>
                <div class="metro-panel">
                    <h3 class="metro-section-head" style="font-size:1.32rem;">${en ? "daily life, sports & hobbies" : "günlük yaşam, spor & hobiler"}</h3>
                    <div class="info-stripe"><strong>${en ? "Coffee & Fitness:" : "Kahve & Spor:"}</strong> ${en ? "1:17 mild filter coffee; 4+ days/week 17 kg dumbbell, push-up variations & jumping jacks (tracked with Redmi Watch 6 Active)." : "1:17 yumuşak filtre kahve; haftada 4+ gün 17 kg dumbbell, şınav çeşitleri ve jumping jack (Redmi Watch 6 Active ile takip)."}</div>
                    <div class="info-stripe"><strong>${en ? "Gaming, Music & Cats:" : "Oyun, Müzik & Kediler:"}</strong> ${en ? "Forza Horizon 6, Clash Royale (9000 trophies), Cyberpunk 2077, Minecraft; Tame Impala; 4 indoor cats plus rescued kittens." : "Forza Horizon 6, Clash Royale (9000 kupa), Cyberpunk 2077, Minecraft; Tame Impala; evde 4 kedi ve merdiven altı barınaktaki yavrular."}</div>
                </div>
            </div>
            <div style="margin-top:20px;">
                <div class="metro-micro">${en ? "Interests & Skills" : "İlgi Alanlarım & Yetkinlikler"}</div>
                <h3 class="metro-section-head" style="font-size:1.42rem;margin-top:2px;">${en ? "6 areas of interest" : "6 ilgi alanı"}</h3>
                <div class="three-col-grid">
                    ${skills.map(s => `<article class="skill-card"><h4>${escapeHtml(s.title)}</h4><p>${escapeHtml(s.desc)}</p></article>`).join("")}
                </div>
            </div>`;
    },

    setup(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "SETUP & GARAGE" : "SETUP & GARAJ";
        c.innerHTML = `
            <div class="two-col-grid">
                <div class="metro-panel">
                    <div class="metro-micro">${en ? "Desktop" : "Masaüstü"}</div>
                    <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "main pc" : "ana pc"}</h3>
                    <div class="info-stripe"><strong>${en ? "CPU & Cooler:" : "İşlemci & Soğutucu:"}</strong> AMD Ryzen 5 5500 · MSI MAG CoreFrozr AA13</div>
                    <div class="info-stripe"><strong>${en ? "GPU:" : "Ekran Kartı:"}</strong> Intel Arc B580 12GB Limited Edition</div>
                    <div class="info-stripe"><strong>${en ? "Motherboard & RAM:" : "Anakart & RAM:"}</strong> MSI A520M-A PRO · 16 GB DDR4</div>
                    <div class="info-stripe"><strong>${en ? "Storage:" : "Depolama:"}</strong> Kingston A400 240GB SSD + Seagate Barracuda 1TB HDD</div>
                    <div class="info-stripe"><strong>${en ? "Case, PSU & OS:" : "Kasa, PSU & OS:"}</strong> Lian Li Vector V100 Mini · MSI MAG A550BN · Windows 11 / Ghost Spectre</div>
                </div>
                <div class="metro-panel">
                    <div class="metro-micro">${en ? "Self-Hosted" : "Ev Sunucusu"}</div>
                    <h3 class="metro-section-head" style="font-size:1.34rem;">home server</h3>
                    <div class="info-stripe"><strong>${en ? "CPU:" : "İşlemci:"}</strong> Intel Core 2 Quad Q6600</div>
                    <div class="info-stripe"><strong>${en ? "GPU:" : "Ekran Kartı:"}</strong> ASUS GeForce 9500GT 1GB</div>
                    <div class="info-stripe"><strong>${en ? "Motherboard & RAM:" : "Anakart & RAM:"}</strong> ASUS P5KC Stack Cool 2 · 8 GB DDR2 (4×2 GB)</div>
                    <div class="info-stripe"><strong>${en ? "Storage:" : "Depolama:"}</strong> James Donkey 120GB SSD + Samsung 160GB HDD</div>
                </div>
                <div class="metro-panel">
                    <div class="metro-micro">${en ? "Mobile & Modding Lab" : "Mobil & Modding Laboratuvarı"}</div>
                    <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "phones & tablets" : "telefon & tabletler"}</h3>
                    <div class="info-stripe"><strong>${en ? "Main Devices:" : "Ana Cihazlar:"}</strong> Xiaomi 14T Pro 256GB (<em>Rothko</em> · TW ROM) · Xiaomi Redmi Pad 2 256GB (<em>Taiko</em> + Smart Pen)</div>
                    <div class="info-stripe"><strong>${en ? "Active & Dev:" : "Aktif & Geliştirme:"}</strong> Samsung Galaxy S8 (Modem / TV Box · Magisk + AccA + SecondScreen) · Galaxy A54 5G · Galaxy J7 Prime (One UI 6.1 · Dev) · Samsung B310-E</div>
                    <div class="info-stripe"><strong>${en ? "Custom ROM & Archive:" : "Custom ROM & Arşiv:"}</strong> 2× Redmi Note 9 (<em>merlinx</em>: Matrixx A15 &amp; MIUI 12.5) · Wileyfox Swift (Project Kasumi A11) · Vestel Venus 5000 2GB (Rooted)</div>
                    <div class="info-stripe"><strong>${en ? "Dead / Parts:" : "Parça / Arızalı:"}</strong> Wileyfox Swift (${en ? "Dead Motherboard" : "Anakart arızalı"}) · Samsung Galaxy S Duos (${en ? "Dead Motherboard" : "Anakart arızalı"})</div>
                </div>
                <div class="metro-panel">
                    <div class="metro-micro">${en ? "Audio & Wearables" : "Ses & Giyilebilir"}</div>
                    <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "headphones & watches" : "kulaklık & saatler"}</h3>
                    <div class="info-stripe"><strong>${en ? "Daily Headphones:" : "Günlük Kulaklıklar:"}</strong> Xiaomi Buds 3 (Daily) · EarFun Wave Pro (Daily Drive 2)</div>
                    <div class="info-stripe"><strong>${en ? "Other Headphones:" : "Diğer Kulaklıklar:"}</strong> TaoTronics SoundLiberty T2 · Lenovo ThinkPlus TH-30 · Fresh 'n Rebel (10€) · Lenovo HF130 · Fake AirPods 1st Gen</div>
                    <div class="info-stripe"><strong>${en ? "Smartwatches:" : "Akıllı Saatler:"}</strong> Redmi Watch 6 Active (Daily) · Haylou Solar</div>
                </div>
                <div class="metro-panel">
                    <div class="metro-micro">${en ? "CAD & Electronics Bench" : "CAD & Elektronik Tezgâhı"}</div>
                    <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "software & tools" : "yazılım & ekipman"}</h3>
                    <div class="info-stripe"><strong>3D CAD:</strong> SolidWorks (2017–2026), AutoCAD (2007–2026), FreeCAD · STEP / DWG / DXF</div>
                    <div class="info-stripe"><strong>${en ? "Electronics Bench:" : "Elektronik Tezgâh:"}</strong> ${en ? "Soldering iron, multimeter, Arduino kits, copper shims & thermal pads" : "Havya, multimetre, Arduino kitleri, bakır şim & termal ped"}</div>
                </div>
                <div class="metro-panel">
                    <div class="metro-micro">${en ? "Automotive" : "Otomotiv"}</div>
                    <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "garage" : "garaj"}</h3>
                    <div class="info-stripe">
                        <strong>Togg T10F V2 Long Range (Gemlik · LFP):</strong> ${en ? "245/40 R19 XL tires & residential 90 kWh solar charging research." : "245/40 R19 XL lastik & 90 kWh konut tipi solar şarj araştırmaları."}
                        <div style="margin-top:9px;border:1px solid var(--border-subtle);background:rgba(6,11,20,0.72);overflow:hidden;">
                            <img src="togg-t10f.jpg" alt="Togg T10F V2 Long Range" loading="lazy" style="width:100%;height:175px;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='https://placehold.co/640x320/0b2538/64beff?text=togg-t10f.jpg'">
                        </div>
                    </div>
                    <div class="info-stripe">
                        <strong>2015/2016 Skoda Octavia 1.6 TDI Optimal (7-speed DSG):</strong> ${en ? "Sold — holds a special, unforgettable memory for me. (Plus 26\" bicycle)" : "Satıldı — bende yeri ayrı, unutamadığım bir anı. (Ayrıca 26\" bisiklet)"}
                        <div style="margin-top:9px;border:1px solid var(--border-subtle);background:rgba(6,11,20,0.72);overflow:hidden;">
                            <img src="octavia.jpg" alt="Skoda Octavia 1.6 TDI Optimal" loading="lazy" style="width:100%;height:175px;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='https://placehold.co/640x320/141b2d/94a3b8?text=octavia.jpg'">
                        </div>
                    </div>
                </div>
            </div>`;
    },

    hadis(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "40 HADITHS" : "40 HADİS";
        const todayH = FORTY_HADITHS[state.todayHadithIdx];
        const q = state.hadithSearch.trim().toLowerCase();
        const filtered = FORTY_HADITHS.filter(h => !q || `${h.id} ${h.title} ${h.text} ${h.source}`.toLowerCase().includes(q));
        c.innerHTML = `
            <div class="hadith-card today" style="margin-bottom:16px;">
                <div class="row-between flex-wrap" style="margin-bottom:6px;">
                    <span class="metro-micro" style="color:#ffffff;">★ ${escapeHtml(t("hadithOfDay"))} · ${escapeHtml(t("hadithWord"))} #${todayH.id} / 40</span>
                    <span class="source-badge">${escapeHtml(todayH.source)}</span>
                </div>
                <h3 class="metro-display" style="font-size:1.42rem;margin-bottom:6px;">${escapeHtml(todayH.title)}</h3>
                <p style="font-size:0.98rem;line-height:1.66;">“${escapeHtml(todayH.text)}”</p>
            </div>
            <div style="margin-bottom:16px;">
                <input type="search" class="metro-input" placeholder="${en ? "Search 40 hadiths..." : "40 hadis içinde ara (ör. niyet, merhamet, ilim, Buhârî)..."}" value="${escapeHtml(state.hadithSearch)}" oninput="state.hadithSearch=this.value;renderHadithGridOnly()">
            </div>
            <div class="two-col-grid" id="hadith-list-grid">
                ${filtered.map(h => `
                    <article class="hadith-card ${h.id === todayH.id ? "today" : ""}">
                        <div class="row-between" style="margin-bottom:6px;">
                            <span class="mono-sm" style="color:var(--accent-light);font-weight:600;">${escapeHtml(t("hadithWord"))} #${h.id}</span>
                            <span class="mono-sm" style="opacity:0.74;">${escapeHtml(h.source)}</span>
                        </div>
                        <h4 style="font-size:0.96rem;font-weight:600;margin-bottom:6px;">${escapeHtml(h.title)}</h4>
                        <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.58;">“${escapeHtml(h.text)}”</p>
                    </article>`).join("")}
            </div>`;
    },

    sysinfo(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "SYSTEM & IP" : "SİSTEM & IP";
        const s = state.sysInfo;
        const renderTiles = arr => arr.map(item => `
            <article class="sys-metric-tile">
                <div class="sys-metric-label">${escapeHtml(item.label)}</div>
                <div class="sys-metric-val">${escapeHtml(item.val)}</div>
                <div class="sys-metric-sub">${item.rawSub ? item.sub : escapeHtml(item.sub)}</div>
            </article>`).join("");

        const netTiles = [
            { label: en ? "Public IP Address" : "Genel IP Adresi", val: s.ip, sub: `${s.ipVersion} · ${en ? "Source" : "Kaynak"}: ${s.ipSource}` },
            { label: en ? "ISP / Organization" : "İSS / Organizasyon", val: s.isp, sub: `ASN: ${s.asn}` },
            { label: en ? "Approx. Location" : "Tahmini Konum", val: `${s.city}, ${s.country}`, sub: `${s.timezone} (${s.utcOffset})` },
            { label: en ? "HTTP Ping / Latency" : "HTTP Ping / Gecikme", val: s.pingMs !== null ? `${s.pingMs} ms` : (en ? "Measuring..." : "Ölçülüyor..."), sub: s.online ? (en ? "Online" : "Çevrimiçi (Online)") : (en ? "Offline" : "Çevrimdışı (Offline)") },
            { label: en ? "Network Link" : "Ağ Bağlantısı", val: s.connType, sub: `Downlink: ${s.downlink} · RTT: ${s.rtt}` },
            { label: en ? "Browser Language" : "Tarayıcı Dili", val: s.language, sub: `${en ? "Cookies" : "Çerezler"}: ${navigator.cookieEnabled ? (en ? "Enabled" : "Etkin") : (en ? "Disabled" : "Kapalı")}` }
        ];
        const hwTiles = [
            { label: en ? "Operating System" : "İşletim Sistemi", val: s.os, sub: `${en ? "Arch / Platform" : "Mimari / Platform"}: ${s.arch}` },
            { label: en ? "Browser & Engine" : "Tarayıcı & Motor", val: s.browser, sub: `${en ? "Engine" : "Render Motoru"}: ${s.engine}` },
            { label: en ? "Graphics (GPU)" : "Ekran Kartı (GPU)", val: s.gpu, sub: "WebGL Renderer" },
            { label: en ? "CPU Logical Cores" : "CPU Mantıksal Çekirdek", val: s.cores, sub: `RAM: ${s.ram}` },
            { label: en ? "Screen & Viewport" : "Ekran & Görünüm Alanı", val: `${s.screenRes} / ${s.viewport}`, sub: `DPR: ${s.dpr} · ${s.colorDepth}` },
            { label: en ? "Battery & Live FPS" : "Pil & Canlı Kare Hızı", val: s.battery, sub: `<span id="sys-fps-val">${s.fps} FPS</span> (${en ? "Real-time" : "Gerçek Zamanlı"})`, rawSub: true }
        ];

        c.innerHTML = `
            <div class="row-between flex-wrap" style="gap:10px;margin-bottom:16px;">
                <div>
                    <div class="metro-micro">${en ? "Browser & Network Diagnostics" : "Tarayıcı & Ağ Tanılama"}</div>
                    <p style="font-size:0.84rem;color:var(--text-secondary);margin-top:2px;">${en ? "Computed locally in your browser; nothing is stored on any server." : "Tüm veriler yalnızca kendi tarayıcınızda anlık olarak hesaplanır; sunucuya kaydedilmez."}</p>
                </div>
                <div class="row-center flex-wrap">
                    <button type="button" class="metro-btn-primary" onclick="copyVisitorIp()">${escapeHtml(t("copyIpBtn"))}</button>
                    <button type="button" class="metro-flat-btn" onclick="copySystemReport()">${en ? "Copy System Report" : "Sistem Raporunu Kopyala"}</button>
                    <button type="button" class="metro-flat-btn" onclick="measureVisitorLatency(true)">${en ? "Measure Ping" : "Ping / Gecikme Ölç"}</button>
                    <button type="button" class="metro-flat-btn" onclick="detectClientHardwareAndBrowser();fetchVisitorIpInfo(true);measureVisitorLatency(false)">${escapeHtml(t("btnRefresh"))}</button>
                </div>
            </div>
            <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "network & ip address" : "ağ & ip adresi"}</h3>
            <div class="sys-grid">${renderTiles(netTiles)}</div>
            <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "hardware, os & browser" : "donanım, işletim sistemi & tarayıcı"}</h3>
            <div class="sys-grid">${renderTiles(hwTiles)}</div>`;
        startSysFpsMonitor();
    },

    toolkit(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "FORMAT & ISO HUB" : "FORMAT & ISO MERKEZİ";
        const tk = SITE_CONFIG.toolkit || DEFAULT_SITE_CONFIG.toolkit;
        const cats = ["Tümü", ...new Set(tk.apps.map(a => a.cat))];
        const activeCat = state.toolkitCat || "Tümü";
        if (!state.selectedToolkitIds) {
            state.selectedToolkitIds = new Set(tk.apps.filter(a => a.defaultChecked).map(a => a.id));
        }
        const selectedIds = state.selectedToolkitIds;

        const filteredApps = activeCat === "Tümü" ? tk.apps : tk.apps.filter(a => a.cat === activeCat);
        const wingetApps = tk.apps.filter(a => selectedIds.has(a.id) && a.winget);
        const downloadableApps = tk.apps.filter(a => selectedIds.has(a.id) && a.url);

        const wingetCmd = wingetApps.length
            ? `winget install --id ${wingetApps.map(a => a.winget).join(" --exact --silent --accept-package-agreements --accept-source-agreements; winget install --id ")} --exact --silent --accept-package-agreements --accept-source-agreements`
            : (en ? "Select at least one Winget-supported app..." : "En az bir Winget destekli program seçin...");

        c.innerHTML = `
            <h3 class="metro-section-head" style="font-size:1.36rem;">${en ? "windows iso & usb tools" : "windows iso & usb hazırlama"}</h3>
            <div class="two-col-grid" style="margin-bottom:22px;">
                ${tk.windowsIsos.map(iso => `
                    <article class="metro-panel" style="border-left:4px solid var(--accent);display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
                        <div>
                            <div class="row-between" style="margin-bottom:6px;">
                                <strong style="font-size:1.02rem;">${escapeHtml(iso.name)}</strong>
                                <span class="source-badge live">${escapeHtml(iso.badge)}</span>
                            </div>
                            <p style="font-size:0.82rem;color:var(--text-secondary);">${escapeHtml(iso.edition)}</p>
                        </div>
                        <div class="row-center flex-wrap">
                            <a href="${escapeHtml(iso.url)}" target="_blank" rel="noopener noreferrer" class="metro-btn-primary" style="padding:7px 14px;font-size:0.78rem;">${en ? "Download Page ↗" : "İndirme Sayfası ↗"}</a>
                            ${iso.directToolUrl ? `<a href="${escapeHtml(iso.directToolUrl)}" target="_blank" rel="noopener noreferrer" class="metro-flat-btn">${escapeHtml(iso.directToolLabel || (en ? "Direct Download" : "Doğrudan İndir"))} ⬇</a>` : ""}
                        </div>
                    </article>`).join("")}
            </div>

            <div class="row-between flex-wrap" style="margin-bottom:10px;">
                <h3 class="metro-section-head" style="font-size:1.36rem;margin-bottom:0;">${en ? "post-format one-click or individual install" : "formattan sonra tek tıkla veya ayrı ayrı kurulum"}</h3>
                <div class="row-center">
                    <button type="button" class="metro-flat-btn xs" onclick="toggleAllToolkitApps(true)">${en ? "Select All" : "Tümünü Seç"}</button>
                    <button type="button" class="metro-flat-btn xs" onclick="toggleAllToolkitApps(false)">${en ? "Clear" : "Temizle"}</button>
                </div>
            </div>

            <div class="metro-panel" style="margin-bottom:16px;border-left:4px solid #10b981;">
                <div class="row-between flex-wrap" style="margin-bottom:8px;gap:8px;">
                    <span class="metro-micro" style="color:var(--accent-light);">${en ? "Batch Action" : "Toplu İşlem"} (${wingetApps.length} Winget · ${downloadableApps.length} ${en ? "Direct Links" : "İndirme Linki"})</span>
                    <div class="row-center flex-wrap" style="gap:6px;">
                        <button type="button" class="metro-btn-primary" style="padding:6px 13px;font-size:0.77rem;" onclick="copyToolkitCommand()">${en ? "1. Copy PowerShell Command" : "1. PowerShell Komutunu Kopyala"}</button>
                        <button type="button" class="metro-flat-btn" style="padding:6px 12px;font-size:0.77rem;" onclick="downloadSelectedToolkitApps()">${en ? "2. Download Selected ⬇" : "2. Seçilileri Tarayıcıdan İndir ⬇"}</button>
                    </div>
                </div>
                <input type="text" id="toolkit-winget-box" class="metro-input mono-sm" readonly value="${escapeHtml(wingetCmd)}" onclick="this.select()">
            </div>

            <div class="filter-row">
                ${cats.map(cat => `<button type="button" class="filter-pill ${activeCat === cat ? "active" : ""}" onclick="state.toolkitCat='${escapeHtml(cat)}';renderSubpage()">${escapeHtml(en && cat === "Tümü" ? "All" : cat)}</button>`).join("")}
            </div>

            <div class="three-col-grid">
                ${filteredApps.map(app => {
                    const hasWinget = Boolean(app.winget);
                    const hasUrl = Boolean(app.url);
                    const checked = selectedIds.has(app.id);
                    return `
                        <article class="skill-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:10px;border-top-color:${checked ? "var(--accent)" : "rgba(255,255,255,0.22)"};">
                            <label class="row-between" style="cursor:pointer;align-items:flex-start;">
                                <div class="min-w-0">
                                    <div style="font-weight:600;font-size:0.94rem;">${escapeHtml(app.name)}</div>
                                    <div class="mono-sm" style="color:var(--accent-light);">${escapeHtml(app.cat)} · ${hasWinget ? escapeHtml(app.winget) : (en ? "Manual" : "Tekil / Manuel")}</div>
                                    ${app.note && !hasUrl ? `<div style="font-size:0.71rem;color:#fcd34d;margin-top:3px;">${escapeHtml(app.note)}</div>` : ""}
                                </div>
                                <input type="checkbox" ${checked ? "checked" : ""} ${!hasWinget && !hasUrl ? "disabled" : ""} onchange="toggleToolkitApp('${escapeHtml(app.id)}')" style="width:17px;height:17px;accent-color:var(--accent);cursor:pointer;flex-shrink:0;margin-top:2px;">
                            </label>
                            <div class="row-between divider-top" style="padding-top:8px;margin-top:4px;">
                                <span style="font-size:0.72rem;color:var(--text-muted);">${hasWinget ? (checked ? (en ? "Included in batch" : "Toplu kuruluma dahil") : (en ? "Not selected" : "Seçili değil")) : (en ? "Direct link only" : "Sadece ayrı indirme")}</span>
                                ${hasUrl
                                    ? `<a href="${escapeHtml(app.url)}" target="_blank" rel="noopener noreferrer" class="metro-flat-btn xs">${en ? "Download ⬇" : "Ayrı İndir ⬇"}</a>`
                                    : `<span class="corner-badge" style="opacity:0.65;">${en ? "No Link" : "Link Bekliyor"}</span>`}
                            </div>
                        </article>`;
                }).join("")}
            </div>`;
    },

    android(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "ANDROID & ADB HUB" : "ANDROID & ADB MERKEZİ";
        const am = SITE_CONFIG.androidModding || DEFAULT_SITE_CONFIG.androidModding;
        const cats = ["Tümü", ...new Set(am.commands.map(cmd => cmd.cat))];
        const activeCat = state.androidCmdCat || "Tümü";
        const archive = am.deviceArchive || [];

        c.innerHTML = `
            <div class="metro-panel row-between flex-wrap" style="margin-bottom:18px;border-left:4px solid #10b981;gap:12px;">
                <div class="min-w-0" style="flex:1;">
                    <div class="metro-micro" style="color:var(--accent-light);">${en ? "Browser USB Hardware Inspector (WebUSB)" : "Tarayıcı USB Donanım Algılayıcı (WebUSB)"}</div>
                    <div id="webusb-status-text" style="font-size:0.88rem;color:var(--text-secondary);margin-top:3px;">
                        ${escapeHtml(state.webUsbInfo || (en ? "Read connected Android ADB/Fastboot hardware IDs (VID/PID) directly from your browser." : "USB ile bağlı Android cihazın ADB/Fastboot donanım kimliğini (VID/PID) tarayıcıdan doğrudan okuyabilirsiniz."))}
                    </div>
                </div>
                <button type="button" class="metro-btn-primary" style="padding:8px 14px;font-size:0.8rem;" onclick="inspectConnectedAndroidUsb()">${en ? "Scan USB Device" : "USB Cihazı Tara"}</button>
            </div>

            <h3 class="metro-section-head" style="font-size:1.36rem;">${en ? "device & mod archive notes" : "cihaz & mod arşivi notları"}</h3>
            <div class="two-col-grid" style="margin-bottom:22px;">
                ${archive.map((dev, idx) => `
                    <article class="mod-archive-card">
                        <div>
                            <div class="row-between flex-wrap" style="margin-bottom:6px;">
                                <strong style="font-size:0.98rem;">${escapeHtml(dev.device)}</strong>
                                <span class="source-badge live">${escapeHtml(dev.codename)}</span>
                            </div>
                            <div class="mono-sm" style="color:var(--accent-light);margin-bottom:8px;">${escapeHtml(dev.rom)} · ${escapeHtml(dev.status)}</div>
                            <div class="tag-wrap" style="margin:0 0 9px;">${(dev.modules || []).map(m => `<span class="tech-tag">${escapeHtml(m)}</span>`).join("")}</div>
                            <ul class="mod-steps-list">
                                ${(dev.steps || []).map(st => `<li>${escapeHtml(st)}</li>`).join("")}
                            </ul>
                        </div>
                        ${dev.quickCmd ? `
                            <div class="divider-top" style="padding-top:9px;">
                                <div class="mono-sm" style="background:rgba(0,0,0,0.42);border:1px solid rgba(255,255,255,0.16);padding:6px 8px;color:var(--accent-light);word-break:break-all;margin-bottom:7px;">${escapeHtml(dev.quickCmd)}</div>
                                <div class="row-between">
                                    <span class="mono-sm" style="opacity:0.65;">${en ? "Quick Setup Command" : "Hızlı Kurulum Komutu"}</span>
                                    <button type="button" class="metro-btn-primary" style="padding:5px 11px;font-size:0.74rem;" onclick="copyDeviceArchiveCmd(${idx})">${en ? "Copy Command" : "Komutu Kopyala"}</button>
                                </div>
                            </div>` : ""}
                    </article>`).join("")}
            </div>

            <h3 class="metro-section-head" style="font-size:1.36rem;">${en ? "platform-tools, root & modding utilities" : "güncel platform-tools, root & modlama araçları"}</h3>
            <div class="two-col-grid" style="margin-bottom:22px;">
                ${am.tools.map(tool => `
                    <article class="metro-panel" style="border-left:4px solid var(--accent);display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                        <div>
                            <div class="row-between" style="margin-bottom:5px;">
                                <strong style="font-size:0.98rem;">${escapeHtml(tool.name)}</strong>
                                <span class="source-badge live">${escapeHtml(tool.badge)}</span>
                            </div>
                            <p style="font-size:0.82rem;color:var(--text-secondary);">${escapeHtml(tool.desc)}</p>
                        </div>
                        <div class="row-between divider-top" style="padding-top:8px;">
                            <span class="mono-sm" style="color:var(--accent-light);">${escapeHtml(tool.cat)}</span>
                            <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="metro-flat-btn xs">${en ? "Download / Open ↗" : "İndir / Aç ↗"}</a>
                        </div>
                    </article>`).join("")}
            </div>

            <h3 class="metro-section-head" style="font-size:1.36rem;">${en ? "live adb & fastboot command builder" : "canlı adb & fastboot komut oluşturucu"}</h3>
            <div class="metro-panel" style="margin-bottom:14px;">
                <div class="metro-micro" style="margin-bottom:8px;">${en ? "Command Parameters (Updates all commands live)" : "Komut Parametreleri (Yazdığınız anda alttaki tüm komutlar güncellenir)"}</div>
                <div class="two-col-grid" style="gap:10px;">
                    <div>
                        <label class="mono-sm" style="opacity:0.78;">${en ? "Image / ZIP File" : "İmaj / ZIP Dosyası"} ({{FILE}})</label>
                        <input type="text" class="metro-input mono-sm" style="margin-top:4px;" value="${escapeHtml(state.adbFile)}" oninput="state.adbFile=this.value;updateAndroidCmdGrid()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.78;">${en ? "Package Name" : "Paket Adı"} ({{PKG}})</label>
                        <input type="text" class="metro-input mono-sm" style="margin-top:4px;" value="${escapeHtml(state.adbPkg)}" oninput="state.adbPkg=this.value;updateAndroidCmdGrid()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.78;">${en ? "TV Box Resolution" : "TV Box Çözünürlük"} ({{RES}})</label>
                        <input type="text" class="metro-input mono-sm" style="margin-top:4px;" value="${escapeHtml(state.adbRes)}" oninput="state.adbRes=this.value;updateAndroidCmdGrid()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.78;">${en ? "Display Density" : "Ekran Yoğunluğu"} ({{DPI}})</label>
                        <input type="text" class="metro-input mono-sm" style="margin-top:4px;" value="${escapeHtml(state.adbDpi)}" oninput="state.adbDpi=this.value;updateAndroidCmdGrid()">
                    </div>
                </div>
            </div>

            <div class="filter-row">
                ${cats.map(cat => `<button type="button" class="filter-pill ${activeCat === cat ? "active" : ""}" onclick="state.androidCmdCat='${escapeHtml(cat)}';renderSubpage()">${escapeHtml(en && cat === "Tümü" ? "All" : cat)}</button>`).join("")}
            </div>

            <div class="two-col-grid" id="android-cmd-grid"></div>`;
        updateAndroidCmdGrid();
    },

    evcharge(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "EV CHARGE & TRIP COST" : "EV ŞARJ & YOL MALİYETİ";
        const presets = SITE_CONFIG.evPresets || DEFAULT_SITE_CONFIG.evPresets;
        const cmp = SITE_CONFIG.evCompare || DEFAULT_SITE_CONFIG.evCompare;
        const routes = cmp.routes || [];

        c.innerHTML = `
            <div class="metro-micro" style="margin-bottom:8px;">${en ? "Vehicle & Charger Presets" : "Hazır Araç & Şarj Profilleri"}</div>
            <div class="filter-row">
                ${presets.map(pr => `<button type="button" class="filter-pill ${state.evPresetId === pr.id ? "active" : ""}" onclick="applyEvPreset('${escapeHtml(pr.id)}')">${escapeHtml(pr.name)}</button>`).join("")}
            </div>

            <div class="metro-panel" style="margin-bottom:18px;border-left:4px solid var(--accent);">
                <div class="two-col-grid" style="gap:12px;">
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Battery Capacity (kWh)" : "Batarya Kapasitesi (kWh)"}</label>
                        <input type="number" step="0.5" min="10" max="200" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evCapacity}" oninput="state.evCapacity=parseFloat(this.value)||0;recalcEvCharge()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Avg Consumption (kWh / 100 km)" : "Ortalama Tüketim (kWh / 100 km)"}</label>
                        <input type="number" step="0.1" min="8" max="40" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evConsumption}" oninput="state.evConsumption=parseFloat(this.value)||1;recalcEvCharge()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Start SoC (%)" : "Başlangıç Şarjı (% SoC)"}</label>
                        <input type="number" step="1" min="0" max="99" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evSocStart}" oninput="state.evSocStart=Math.max(0,Math.min(99,parseFloat(this.value)||0));recalcEvCharge()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Target SoC (%)" : "Hedef Şarj (% SoC)"}</label>
                        <input type="number" step="1" min="1" max="100" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evSocTarget}" oninput="state.evSocTarget=Math.max(1,Math.min(100,parseFloat(this.value)||100));recalcEvCharge()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Charging Power (kW)" : "Şarj Gücü (kW)"}</label>
                        <input type="number" step="0.1" min="1" max="350" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evPowerKw}" oninput="state.evPowerKw=parseFloat(this.value)||1;recalcEvCharge()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Electricity Rate (TL / kWh)" : "Elektrik Birim Fiyatı (TL / kWh)"}</label>
                        <input type="number" step="0.05" min="0" max="50" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evTariff}" oninput="state.evTariff=parseFloat(this.value)||0;recalcEvCharge()">
                    </div>
                </div>
            </div>

            <div class="sys-grid" id="ev-results-grid"></div>

            <h3 class="metro-section-head" style="font-size:1.36rem;margin-top:8px;">${en ? "trip cost comparator (solar / home ac / fast dc vs ice)" : "yol maliyeti karşılaştırıcı (solar / ev ac / hızlı dc vs yakıt)"}</h3>
            <div class="filter-row">
                ${routes.map(r => `<button type="button" class="filter-pill ${Number(state.evTripKm) === Number(r.km) ? "active" : ""}" onclick="state.evTripKm=${Number(r.km)};renderSubpage()">${escapeHtml(r.label)}</button>`).join("")}
            </div>
            <div class="metro-panel" style="border-left:4px solid #10b981;">
                <div class="three-col-grid" style="gap:10px;">
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Trip Distance (km)" : "Güzergâh Mesafesi (km)"}</label>
                        <input type="number" step="10" min="10" max="5000" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evTripKm}" oninput="state.evTripKm=Math.max(1,parseFloat(this.value)||0);recalcEvCompare()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "ICE Fuel Consumption (L / 100 km)" : "Benzin/Dizel Tüketim (L / 100 km)"}</label>
                        <input type="number" step="0.1" min="2" max="25" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evIceL100}" oninput="state.evIceL100=Math.max(0.5,parseFloat(this.value)||0);recalcEvCompare()">
                    </div>
                    <div>
                        <label class="mono-sm" style="opacity:0.8;">${en ? "Fuel Price (TL / L)" : "Akaryakıt Litre Fiyatı (TL / L)"}</label>
                        <input type="number" step="0.5" min="1" max="200" class="metro-input mono-sm" style="margin-top:4px;" value="${state.evFuelPrice}" oninput="state.evFuelPrice=Math.max(0,parseFloat(this.value)||0);recalcEvCompare()">
                    </div>
                </div>
            </div>
            <div class="ev-compare-wrap" id="ev-compare-slot"></div>`;
        recalcEvCharge();
    },

    contact(c, crumb) {
        const en = isEn();
        crumb.textContent = en ? "CONTACT" : "İLETİŞİM";
        c.innerHTML = `
            <div class="metro-panel" style="margin-bottom:14px;border-left:4px solid var(--accent);">
                <p style="font-size:0.88rem;color:var(--text-secondary);">${en
                    ? "Reach out via the social & Steam tiles below or the quick message form for project collaborations, 3D CAD ideas, or hardware/tech questions."
                    : "Proje işbirlikleri, 3D CAD tasarımları veya donanım/teknik sorularınız için aşağıdaki sosyal ağlar ve Steam kutucuklarından ya da hızlı mesaj formundan ulaşabilirsiniz."}</p>
            </div>
            <div class="three-col-grid" id="contact-social-grid" style="margin-bottom:16px;"></div>
            <div class="row-center flex-wrap" style="margin-bottom:16px;">
                <button type="button" class="metro-flat-btn" onclick="copyText('${escapeHtml(SITE_CONFIG.email)}','${en ? "Email copied" : "E-posta kopyalandı"}')">${en ? "Copy Email" : "E-posta Kopyala"} (${escapeHtml(SITE_CONFIG.email)})</button>
                <button type="button" class="metro-flat-btn" onclick="copyText('@${escapeHtml(SITE_CONFIG.username)}','@${escapeHtml(SITE_CONFIG.username)} ${en ? "copied" : "kopyalandı"}')">@${escapeHtml(SITE_CONFIG.username)} ${en ? "Copy" : "Kopyala"}</button>
                <button type="button" class="metro-flat-btn" onclick="copyText('@nptechtr','@nptechtr ${en ? "copied" : "kopyalandı"}')">@nptechtr ${en ? "Copy" : "Kopyala"}</button>
            </div>
            <form class="metro-panel" onsubmit="event.preventDefault();this.reset();showToast('${en ? "Message received! Thank you." : "Mesajın alındı! Teşekkürler."}')">
                <h3 class="metro-section-head" style="font-size:1.34rem;">${en ? "quick message" : "hızlı mesaj"}</h3>
                <div class="two-col-grid" style="gap:10px;margin-bottom:10px;">
                    <input type="text" class="metro-input" required placeholder="${en ? "Full Name" : "Adınız Soyadınız"}">
                    <input type="text" class="metro-input" required placeholder="${en ? "Email or Telegram (@user)" : "E-posta veya Telegram (@kullanici)"}">
                </div>
                <textarea rows="4" class="metro-textarea" required placeholder="${en ? "Your message..." : "Mesajınız..."}" style="margin-bottom:12px;"></textarea>
                <button type="submit" class="metro-btn-primary">${en ? "Send Message" : "Mesajı Gönder"}</button>
            </form>`;
        renderSocialTiles("contact-social-grid");
    }
};

function copyDeviceArchiveCmd(idx) {
    const dev = (SITE_CONFIG.androidModding?.deviceArchive || [])[idx];
    if (!dev?.quickCmd) return;
    copyText(dev.quickCmd, isEn() ? `Command copied for ${dev.codename}!` : `${dev.codename} kurulum komutu kopyalandı!`);
}

function renderGamesGridOnly() {
    const grid = $("games-list-grid");
    if (!grid) return;
    const games = SITE_CONFIG.games || [];
    const activeCat = state.gameCat || "Tümü";
    const q = (state.gameSearch || "").trim().toLowerCase();
    const list = games.filter(g =>
        (activeCat === "Tümü" || g.cat === activeCat) &&
        (!q || `${g.num} ${g.title} ${g.cat}`.toLowerCase().includes(q))
    );

    if (!list.length) {
        grid.innerHTML = `<div class="metro-panel" style="grid-column:1 / -1;"><p style="color:var(--text-secondary);">${isEn() ? "No games matched your search." : "Aramanızla eşleşen oyun bulunamadı."}</p></div>`;
        return;
    }

    grid.innerHTML = list.map(g => `
        <article class="game-card" onclick="openGameModal('${escapeHtml(g.id)}')" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGameModal('${escapeHtml(g.id)}');}">
            <div class="row-center" style="gap:10px;">
                <div class="game-card-icon" aria-hidden="true">${escapeHtml(g.icon || "🎮")}</div>
                <div class="min-w-0" style="flex:1;">
                    <div class="mono-sm" style="color:var(--accent-light);">#${escapeHtml(g.num || "00")} · ${escapeHtml(gameCatLabel(g.cat))}</div>
                    <div class="truncate" style="font-size:0.95rem;font-weight:600;margin-top:2px;">${escapeHtml(g.title)}</div>
                </div>
            </div>
            <div class="row-between divider-top" style="padding-top:8px;margin-top:2px;">
                <span class="mono-sm truncate" style="opacity:0.62;max-width:65%;">${escapeHtml(g.path)}</span>
                <span style="color:var(--accent-light);font-size:0.78rem;font-weight:600;">${escapeHtml(t("playGame"))}</span>
            </div>
        </article>`).join("");
}

function openGameModal(id) {
    const g = (SITE_CONFIG.games || []).find(item => item.id === id);
    if (!g) return;
    state.gameCinema = false;
    const box = $("metro-modal-body");
    box.classList.add("game-modal");
    box.classList.remove("cinema-mode");
    box.innerHTML = `
        <div class="row-between flex-wrap" style="margin-bottom:8px;gap:8px;">
            <div class="row-center min-w-0" style="gap:8px;">
                <span style="font-size:1.2rem;">${escapeHtml(g.icon || "🎮")}</span>
                <div class="min-w-0">
                    <div class="metro-micro" style="color:var(--accent-light);">#${escapeHtml(g.num || "00")} · ${escapeHtml(gameCatLabel(g.cat))}</div>
                    <h3 class="metro-display truncate" style="font-size:1.28rem;">${escapeHtml(g.title)}</h3>
                </div>
            </div>
            <div class="row-center flex-wrap" style="gap:6px;">
                <button type="button" class="metro-flat-btn xs" onclick="reloadGameFrame()">${escapeHtml(t("reload"))}</button>
                <button type="button" class="metro-flat-btn xs" id="game-cinema-btn" onclick="toggleGameCinemaMode()">⤢ ${escapeHtml(t("cinemaMode"))}</button>
                <button type="button" class="metro-flat-btn xs" onclick="toggleGameFullscreen()">⛶ ${escapeHtml(t("fullscreen"))}</button>
                <a href="${escapeHtml(g.path)}" target="_blank" rel="noopener noreferrer" class="metro-flat-btn xs">${escapeHtml(t("newTab"))}</a>
                <button type="button" class="win-circle-btn sm" onclick="closeMetroModal()" aria-label="Close">✕</button>
            </div>
        </div>
        <div class="game-stage-wrap" id="game-stage-wrap">
            <iframe id="game-stage-frame" class="game-stage-frame" src="${escapeHtml(g.path)}" title="${escapeHtml(g.title)}" allowfullscreen allow="autoplay; fullscreen; gamepad"></iframe>
        </div>`;
    $("metro-modal-backdrop").classList.remove("hidden");
}

function toggleGameCinemaMode() {
    state.gameCinema = !state.gameCinema;
    const box = $("metro-modal-body");
    box?.classList.toggle("cinema-mode", state.gameCinema);
    const btn = $("game-cinema-btn");
    if (btn) btn.textContent = state.gameCinema ? `⤡ ${t("normalSize")}` : `⤢ ${t("cinemaMode")}`;
}

function reloadGameFrame() {
    const f = $("game-stage-frame");
    if (f) f.src = f.src;
}

function toggleGameFullscreen() {
    const wrap = $("game-stage-wrap");
    if (!wrap) return;
    if (!document.fullscreenElement) {
        (wrap.requestFullscreen || wrap.webkitRequestFullscreen)?.call(wrap);
    } else {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    }
}

function applyEvPreset(id) {
    const presets = SITE_CONFIG.evPresets || DEFAULT_SITE_CONFIG.evPresets;
    const found = presets.find(p => p.id === id);
    if (!found) return;
    state.evPresetId = found.id;
    state.evCapacity = found.capacityKwh;
    state.evConsumption = found.consumption;
    state.evPowerKw = found.powerKw;
    state.evTariff = found.tariffTl;
    state.evEfficiency = found.efficiency || 92;
    renderSubpage();
}

function recalcEvCharge() {
    const grid = $("ev-results-grid");
    if (!grid) return;
    const en = isEn();

    const deltaPct = Math.max(0, state.evSocTarget - state.evSocStart);
    const netKwh = (state.evCapacity * deltaPct) / 100;
    const eff = (state.evEfficiency || 92) / 100;
    const gridKwh = eff > 0 ? netKwh / eff : netKwh;
    const hoursTotal = state.evPowerKw > 0 ? gridKwh / state.evPowerKw : 0;
    const h = Math.floor(hoursTotal);
    const m = Math.round((hoursTotal - h) * 60);

    const totalCost = gridKwh * state.evTariff;
    const gainedKm = state.evConsumption > 0 ? (netKwh / state.evConsumption) * 100 : 0;
    const fullRangeKm = state.evConsumption > 0 ? (state.evCapacity / state.evConsumption) * 100 : 0;
    const costPerKm = gainedKm > 0 ? totalCost / gainedKm : 0;

    const metrics = [
        { label: en ? "Est. Charge Time" : "Tahmini Dolum Süresi", val: en ? `${h}h ${m}m` : `${h} sa ${m} dk`, sub: `${state.evSocStart}% → ${state.evSocTarget}% (+${deltaPct}%)` },
        { label: en ? "Total Cost" : "Toplam Şarj Maliyeti", val: `${totalCost.toFixed(2)} TL`, sub: `${en ? "From Grid" : "Şebekeden Çekilen"}: ${gridKwh.toFixed(1)} kWh` },
        { label: en ? "Range Gained" : "Kazanılan Menzil", val: `+${Math.round(gainedKm)} km`, sub: `${en ? "Full Range" : "Tam Dolu Menzil"}: ~${Math.round(fullRangeKm)} km` },
        { label: en ? "Cost per km" : "Kilometre Başı Maliyet", val: `${costPerKm.toFixed(2)} TL / km`, sub: `100 km: ${(costPerKm * 100).toFixed(1)} TL` },
        { label: en ? "Net Energy Added" : "Bataryaya Aktarılan", val: `${netKwh.toFixed(1)} kWh`, sub: `${en ? "Efficiency" : "Şarj Verimliliği"}: ${state.evEfficiency || 92}%` },
        { label: en ? "Power & Rate" : "Anlık Güç & Tarife", val: `${state.evPowerKw} kW`, sub: `${en ? "Unit Rate" : "Birim Fiyat"}: ${state.evTariff.toFixed(2)} TL/kWh` }
    ];

    grid.innerHTML = metrics.map(item => `
        <article class="sys-metric-tile">
            <div class="sys-metric-label">${escapeHtml(item.label)}</div>
            <div class="sys-metric-val">${escapeHtml(item.val)}</div>
            <div class="sys-metric-sub">${escapeHtml(item.sub)}</div>
        </article>`).join("");

    recalcEvCompare();
}

function recalcEvCompare() {
    const slot = $("ev-compare-slot");
    if (!slot) return;
    const en = isEn();
    const cmp = SITE_CONFIG.evCompare || DEFAULT_SITE_CONFIG.evCompare;

    const km = Math.max(1, Number(state.evTripKm) || 320);
    const evNetKwh = (km / 100) * Math.max(1, state.evConsumption || 16.8);
    const eff = (state.evEfficiency || 92) / 100;
    const evGridKwh = eff > 0 ? evNetKwh / eff : evNetKwh;
    const fullRangeKm = state.evConsumption > 0 ? (state.evCapacity / state.evConsumption) * 100 : 450;
    const estStops = Math.max(0, Math.ceil((km / Math.max(100, fullRangeKm * 0.8)) - 1));

    const fmtDur = hrs => {
        const hh = Math.floor(hrs);
        const mm = Math.round((hrs - hh) * 60);
        return en ? `${hh}h ${mm}m` : `${hh} sa ${mm} dk`;
    };

    const iceLiters = (km / 100) * Math.max(0.5, state.evIceL100 || 5.8);
    const iceTotal = iceLiters * Math.max(0, state.evFuelPrice || 46.5);

    const rows = [
        {
            name: en ? "Home Solar (6.6 kW)" : "Konut Solar (6.6 kW)",
            energy: `${evGridKwh.toFixed(1)} kWh`,
            total: evGridKwh * (cmp.solarTariffTl ?? 0.45),
            time: fmtDur(evGridKwh / (cmp.solarKw || 6.6)),
            best: true
        },
        {
            name: en ? "Home AC Wallbox (11 kW)" : "Ev AC Wallbox (11 kW)",
            energy: `${evGridKwh.toFixed(1)} kWh`,
            total: evGridKwh * (cmp.homeAcTariffTl ?? 2.85),
            time: fmtDur(evGridKwh / (cmp.homeAcKw || 11)),
            best: false
        },
        {
            name: en ? `Fast DC Station (${cmp.fastDcKw || 135} kW)` : `Hızlı DC İstasyon (${cmp.fastDcKw || 135} kW)`,
            energy: `${evGridKwh.toFixed(1)} kWh`,
            total: evGridKwh * (cmp.fastDcTariffTl ?? 9.90),
            time: `${fmtDur(evGridKwh / (cmp.fastDcKw || 135))} · ${estStops} ${en ? "stop(s)" : "mola"}`,
            best: false
        },
        {
            name: en ? `ICE Vehicle (${state.evIceL100} L/100km)` : `İçten Yanmalı (${state.evIceL100} L/100km)`,
            energy: `${iceLiters.toFixed(1)} L`,
            total: iceTotal,
            time: en ? "~5m refuel" : "~5 dk yakıt",
            best: false
        }
    ];

    const homeAcSaving = Math.max(0, iceTotal - rows[1].total);
    const solarSaving = Math.max(0, iceTotal - rows[0].total);

    slot.innerHTML = `
        <table class="ev-compare-table">
            <thead>
                <tr>
                    <th>${en ? "Energy Source" : "Enerji Kaynağı"} (${km} km)</th>
                    <th>${en ? "Required" : "Gereken Enerji"}</th>
                    <th>${en ? "Total Cost" : "Toplam Maliyet"}</th>
                    <th>${en ? "Cost / km" : "TL / km"}</th>
                    <th>${en ? "Charge / Stops" : "Süre / Mola"}</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(r => `
                    <tr class="${r.best ? "ev-best-row" : ""}">
                        <td><strong>${escapeHtml(r.name)}</strong></td>
                        <td class="mono-sm">${escapeHtml(r.energy)}</td>
                        <td class="mono-cell">${r.total.toFixed(2)} TL</td>
                        <td class="mono-sm">${(r.total / km).toFixed(2)} TL</td>
                        <td class="mono-sm">${escapeHtml(r.time)}</td>
                    </tr>`).join("")}
            </tbody>
        </table>
        <div class="row-between flex-wrap" style="padding:10px 13px;background:rgba(16,185,129,0.12);border-top:1px solid rgba(255,255,255,0.12);font-size:0.8rem;">
            <span>${en ? "Savings vs Fuel (Home AC):" : "Yakıta Göre Tasarruf (Ev AC):"} <strong style="color:#6ee7b7;">+${homeAcSaving.toFixed(0)} TL</strong></span>
            <span>${en ? "Savings vs Fuel (Solar):" : "Yakıta Göre Tasarruf (Solar):"} <strong style="color:#6ee7b7;">+${solarSaving.toFixed(0)} TL</strong></span>
        </div>`;
}

function updateAndroidCmdGrid() {
    const grid = $("android-cmd-grid");
    if (!grid) return;
    const en = isEn();
    const am = SITE_CONFIG.androidModding || DEFAULT_SITE_CONFIG.androidModding;
    const activeCat = state.androidCmdCat || "Tümü";
    const filteredCmds = activeCat === "Tümü" ? am.commands : am.commands.filter(cmd => cmd.cat === activeCat);
    const formatCmd = raw => raw
        .replace(/\{\{FILE\}\}/g, state.adbFile || "magisk_patched.img")
        .replace(/\{\{PKG\}\}/g, state.adbPkg || "com.miui.analytics")
        .replace(/\{\{RES\}\}/g, state.adbRes || "1920x1080")
        .replace(/\{\{DPI\}\}/g, state.adbDpi || "240");

    grid.innerHTML = filteredCmds.map(item => {
        const finalCmd = formatCmd(item.cmd);
        return `
            <article class="skill-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                <div>
                    <div class="row-between" style="margin-bottom:6px;">
                        <strong style="font-size:0.94rem;">${escapeHtml(item.title)}</strong>
                        <span class="corner-badge">${escapeHtml(item.cat)}</span>
                    </div>
                    <div class="mono-sm" style="background:rgba(0,0,0,0.42);border:1px solid rgba(255,255,255,0.18);padding:8px 10px;color:var(--accent-light);word-break:break-all;margin-bottom:7px;">
                        ${escapeHtml(finalCmd)}
                    </div>
                    <p style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(item.note)}</p>
                </div>
                <div class="row-between divider-top" style="padding-top:8px;">
                    <span class="mono-sm" style="opacity:0.65;">Terminal / PowerShell</span>
                    <button type="button" class="metro-btn-primary" style="padding:5px 12px;font-size:0.75rem;" onclick="copyText('${escapeHtml(finalCmd).replace(/'/g, "\\'")}','${en ? "Command copied!" : "Komut kopyalandı!"}')">${en ? "Copy Command" : "Komutu Kopyala"}</button>
                </div>
            </article>`;
    }).join("");
}

async function inspectConnectedAndroidUsb() {
    const en = isEn();
    if (!navigator.usb) {
        state.webUsbInfo = en ? "WebUSB is not supported in this browser (use Chrome, Edge, or Brave)." : "Bu tarayıcı WebUSB desteklemiyor (Chrome, Edge veya Brave kullanın).";
        renderSubpage();
        return showToast(en ? "WebUSB not supported." : "WebUSB desteklenmiyor.");
    }
    try {
        const device = await navigator.usb.requestDevice({
            filters: [
                { classCode: 0xff, subclassCode: 0x42, protocolCode: 0x01 },
                { classCode: 0xff, subclassCode: 0x42, protocolCode: 0x03 }
            ]
        });
        const vid = device.vendorId.toString(16).padStart(4, "0").toUpperCase();
        const pid = device.productId.toString(16).padStart(4, "0").toUpperCase();
        state.webUsbInfo = `${en ? "Detected Device" : "Algılanan Cihaz"}: ${device.manufacturerName || "Android"} ${device.productName || "USB Device"} · VID: 0x${vid} / PID: 0x${pid}${device.serialNumber ? ` · S/N: ${device.serialNumber}` : ""}`;
        renderSubpage();
        showToast(en ? "Android USB device read successfully." : "Android USB cihazı başarıyla okundu.");
    } catch (err) {
        if (err?.name !== "NotFoundError") {
            showToast(en ? "Could not access USB device (ADB server might be holding the port)." : "USB cihazına erişilemedi (başka bir ADB sunucusu portu tutuyor olabilir).");
        }
    }
}

function toggleToolkitApp(id) {
    if (!state.selectedToolkitIds) return;
    state.selectedToolkitIds.has(id) ? state.selectedToolkitIds.delete(id) : state.selectedToolkitIds.add(id);
    renderSubpage();
}

function toggleAllToolkitApps(selectAll) {
    const apps = (SITE_CONFIG.toolkit || DEFAULT_SITE_CONFIG.toolkit).apps;
    state.selectedToolkitIds = selectAll ? new Set(apps.filter(a => a.winget || a.url).map(a => a.id)) : new Set();
    renderSubpage();
}

function copyToolkitCommand() {
    const val = $("toolkit-winget-box")?.value;
    if (!val || val.startsWith("En az") || val.startsWith("Select")) return showToast(isEn() ? "Select at least one Winget app first." : "Önce Winget destekli en az bir program işaretleyin.");
    copyText(val, isEn() ? "Winget command copied! Paste into PowerShell." : "Winget toplu kurulum komutu kopyalandı! PowerShell'e yapıştırıp Enter'a basın.");
}

function downloadSelectedToolkitApps() {
    const apps = (SITE_CONFIG.toolkit || DEFAULT_SITE_CONFIG.toolkit).apps;
    const targets = apps.filter(a => state.selectedToolkitIds?.has(a.id) && a.url);
    if (!targets.length) return showToast(isEn() ? "Select at least one app with a download link." : "İndirme linki olan en az bir program seçin.");
    showToast(isEn() ? `Opening ${targets.length} download links...` : `${targets.length} programın indirme bağlantısı açılıyor (pop-up izni gerekebilir)...`);
    targets.forEach((app, i) => {
        setTimeout(() => window.open(app.url, "_blank", "noopener,noreferrer"), i * 450);
    });
}

function renderHadithGridOnly() {
    const grid = $("hadith-list-grid");
    if (!grid) return;
    const todayH = FORTY_HADITHS[state.todayHadithIdx];
    const q = state.hadithSearch.trim().toLowerCase();
    const filtered = FORTY_HADITHS.filter(h => !q || `${h.id} ${h.title} ${h.text} ${h.source}`.toLowerCase().includes(q));
    grid.innerHTML = filtered.map(h => `
        <article class="hadith-card ${h.id === todayH.id ? "today" : ""}">
            <div class="row-between" style="margin-bottom:6px;">
                <span class="mono-sm" style="color:var(--accent-light);font-weight:600;">${escapeHtml(t("hadithWord"))} #${h.id}</span>
                <span class="mono-sm" style="opacity:0.74;">${escapeHtml(h.source)}</span>
            </div>
            <h4 style="font-size:0.96rem;font-weight:600;margin-bottom:6px;">${escapeHtml(h.title)}</h4>
            <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.58;">“${escapeHtml(h.text)}”</p>
        </article>`).join("");
}

function renderSubpage() {
    const c = $("subpage-content"), crumb = $("breadcrumb-section");
    if (c && SUBPAGE_RENDERERS[state.view]) SUBPAGE_RENDERERS[state.view](c, crumb);
}

function openProjectModal(id) {
    const p = SITE_CONFIG.projects.find(item => item.id === id);
    if (!p) return;
    const box = $("metro-modal-body");
    box.classList.remove("game-modal", "cinema-mode");
    box.innerHTML = `
        <div class="row-between" style="align-items:flex-start;margin-bottom:12px;">
            <div>
                <div class="metro-micro" style="color:var(--accent-light);">${escapeHtml(p.category)} · ${escapeHtml(p.year)}</div>
                <h3 class="metro-display" style="font-size:1.65rem;margin-top:4px;">${escapeHtml(p.title)}</h3>
            </div>
            <button type="button" class="win-circle-btn sm" onclick="closeMetroModal()">✕</button>
        </div>
        <p style="font-size:0.93rem;line-height:1.68;color:rgba(255,255,255,0.88);margin-bottom:14px;">${escapeHtml(p.description)}</p>
        <div class="tag-wrap" style="margin-bottom:18px;">${(p.tech || []).map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="row-between flex-wrap">
            ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer" class="metro-flat-btn">${escapeHtml(t("openLink"))}</a>` : "<span></span>"}
            <button type="button" class="metro-btn-primary" onclick="closeMetroModal()">${escapeHtml(t("closeBtn"))}</button>
        </div>`;
    $("metro-modal-backdrop").classList.remove("hidden");
}

function closeMetroModal() {
    $("metro-modal-backdrop").classList.add("hidden");
    const box = $("metro-modal-body");
    if (box) {
        box.classList.remove("game-modal", "cinema-mode");
        box.innerHTML = "";
    }
    state.gameCinema = false;
    state.confirmResetStep = false;
}

/* =====================================================================
   8. CTRL+K HIZLI ARAMA (WINDOWS 8 SEARCH CHARM)
   ===================================================================== */
function openSearchCharm() {
    closeCharms();
    const box = $("metro-modal-body");
    box.classList.remove("game-modal", "cinema-mode");
    $("metro-modal-backdrop").classList.remove("hidden");
    box.innerHTML = `
        <div class="row-between" style="margin-bottom:12px;">
            <div class="row-center">
                <span class="metro-micro" style="color:var(--accent-light);">Windows 8 Search Charm</span>
                <span class="kbd-chip">Ctrl+K</span>
            </div>
            <button type="button" class="win-circle-btn sm" onclick="closeMetroModal()">✕</button>
        </div>
        <input type="search" id="global-search-input" class="metro-input" placeholder="${escapeHtml(t("searchPlaceholder"))}" value="${escapeHtml(state.searchQuery)}" oninput="state.searchQuery=this.value;renderSearchResults()" autofocus>
        <div id="global-search-results" style="margin-top:14px;"></div>`;
    renderSearchResults();
    setTimeout(() => $("global-search-input")?.focus(), 20);
}

function renderSearchResults() {
    const slot = $("global-search-results");
    if (!slot) return;
    const q = (state.searchQuery || "").trim().toLowerCase();

    if (!q) {
        slot.innerHTML = `
            <div class="metro-micro" style="margin-bottom:8px;">${escapeHtml(t("quickJumps"))}</div>
            <div class="two-col-grid" style="gap:8px;">
                <button type="button" class="wp-choice-btn" onclick="closeMetroModal();navigateTo('games')"><span>🎮 ${escapeHtml(t("navGames"))} (${(SITE_CONFIG.games || []).length})</span></button>
                <button type="button" class="wp-choice-btn" onclick="closeMetroModal();navigateTo('toolkit')"><span>⬇ ${escapeHtml(t("navToolkit"))}</span></button>
                <button type="button" class="wp-choice-btn" onclick="closeMetroModal();navigateTo('android')"><span>📱 ${escapeHtml(t("navAndroid"))}</span></button>
                <button type="button" class="wp-choice-btn" onclick="closeMetroModal();navigateTo('evcharge')"><span>⚡ ${escapeHtml(t("navEv"))}</span></button>
            </div>`;
        return;
    }

    const hits = [];
    for (const g of SITE_CONFIG.games || []) {
        if (`${g.num} ${g.title} ${g.cat}`.toLowerCase().includes(q)) {
            hits.push({ badge: isEn() ? "Game" : "Oyun", title: `${g.icon || "🎮"} ${g.title}`, sub: `#${g.num} · ${gameCatLabel(g.cat)}`, action: `openGameModal('${escapeHtml(g.id)}')` });
        }
    }
    for (const b of SITE_CONFIG.blogPosts || []) {
        if (`${b.title} ${b.excerpt} ${b.category}`.toLowerCase().includes(q)) {
            hits.push({ badge: "Blog", title: b.title, sub: `${b.day} ${b.month} ${b.year} · ${b.category}`, action: `window.location.href='blog.html?post=${encodeURIComponent(b.id)}'` });
        }
    }
    for (const p of SITE_CONFIG.projects || []) {
        if (`${p.title} ${p.description} ${(p.tech || []).join(" ")}`.toLowerCase().includes(q)) {
            hits.push({ badge: isEn() ? "Project" : "Proje", title: p.title, sub: p.year, action: `closeMetroModal();navigateTo('projects');openProjectModal('${escapeHtml(p.id)}')` });
        }
    }
    for (const a of (SITE_CONFIG.toolkit?.apps || [])) {
        if (`${a.name} ${a.cat} ${a.winget}`.toLowerCase().includes(q)) {
            hits.push({ badge: "Format & ISO", title: a.name, sub: `${a.cat}${a.winget ? " · " + a.winget : ""}`, action: `closeMetroModal();state.toolkitCat='Tümü';navigateTo('toolkit')` });
        }
    }
    for (const cmd of (SITE_CONFIG.androidModding?.commands || [])) {
        if (`${cmd.title} ${cmd.cmd} ${cmd.note}`.toLowerCase().includes(q)) {
            hits.push({ badge: "ADB / Fastboot", title: cmd.title, sub: cmd.cmd, action: `closeMetroModal();navigateTo('android')` });
        }
    }
    for (const h of FORTY_HADITHS) {
        if (`${h.id} ${h.title} ${h.text} ${h.source}`.toLowerCase().includes(q)) {
            hits.push({ badge: `${t("hadithWord")} #${h.id}`, title: h.title, sub: h.text.slice(0, 95) + "…", action: `closeMetroModal();state.hadithSearch='${escapeHtml(q.replace(/'/g, ""))}';navigateTo('hadis')` });
        }
    }

    if (!hits.length) {
        slot.innerHTML = `<p style="font-size:0.86rem;color:var(--text-muted);padding:10px 0;">“${escapeHtml(state.searchQuery)}” ${escapeHtml(t("noSearchRes"))}</p>`;
        return;
    }

    slot.innerHTML = `<div class="metro-micro" style="margin-bottom:8px;">${hits.length} ${escapeHtml(t("resultsFound"))}</div>` +
        hits.slice(0, 14).map(item => `
            <button type="button" class="wp-choice-btn" style="justify-content:space-between;" onclick="${item.action}">
                <div class="min-w-0" style="flex:1;">
                    <div style="font-size:0.86rem;font-weight:600;color:#fff;">${escapeHtml(item.title)}</div>
                    <div class="truncate" style="font-size:0.73rem;color:rgba(255,255,255,0.72);">${escapeHtml(item.sub)}</div>
                </div>
                <span class="source-badge" style="flex-shrink:0;">${escapeHtml(item.badge)}</span>
            </button>`).join("");
}

/* =====================================================================
   9. WINDOWS 8 CHARMS BAR
   ===================================================================== */
function setCharmsOpen(open, tab) {
    state.charmsOpen = open;
    if (tab) state.charmTab = tab;
    $("charms-backdrop").classList.toggle("open", open);
    $("charms-drawer").classList.toggle("open", open);
    $("charms-drawer").setAttribute("aria-hidden", String(!open));
    if (open) renderCharmsPane();
}
const openCharms = (tab = "theme") => setCharmsOpen(true, tab);
const closeCharms = () => setCharmsOpen(false);
const switchCharmTab = tab => { state.charmTab = tab; renderCharmsPane(); };

function renderCharmsPane() {
    $$(".charm-rail-btn").forEach(b => b.classList.toggle("active", b.dataset.charm === state.charmTab));
    const tEl = $("charms-title"), bEl = $("charms-body");
    if (!bEl) return;

    if (state.charmTab === "theme") {
        tEl.textContent = t("titleTheme");
        bEl.innerHTML = `
            <div class="metro-micro" style="margin-bottom:8px;">${escapeHtml(t("visualThemes"))}</div>
            ${VISUAL_THEMES.map(th => `
                <button type="button" class="wp-choice-btn ${state.theme === th.id ? "active" : ""}" onclick="applyTheme('${th.id}')">
                    <div class="wp-preview-chip" style="background:${th.preview};"></div>
                    <div>
                        <div style="font-size:0.83rem;font-weight:600;color:#fff;">${escapeHtml(th.name)}</div>
                        <div style="font-size:0.7rem;color:rgba(255,255,255,0.68);">${escapeHtml(th.desc)}</div>
                    </div>
                </button>`).join("")}
            <div class="metro-micro" style="margin:14px 0 8px;">${escapeHtml(t("metroAccent"))}</div>
            <div class="accent-grid">
                ${METRO_ACCENTS.map(c => `
                    <button type="button" class="accent-btn ${state.accentHex.toLowerCase() === c.hex.toLowerCase() ? "active" : ""}" style="background:${c.hex};" onclick="applyAccent('${c.hex}')">
                        <span>${c.name}</span><span>${state.accentHex.toLowerCase() === c.hex.toLowerCase() ? "✓" : ""}</span>
                    </button>`).join("")}
            </div>`;
        return;
    }

    if (state.charmTab === "perf") {
        tEl.textContent = t("titlePerf");
        bEl.innerHTML = `
            <p style="font-size:0.83rem;color:rgba(255,255,255,0.82);margin-bottom:14px;">${escapeHtml(t("perfDesc"))}</p>
            <button type="button" class="metro-btn-primary" style="width:100%;margin-bottom:14px;" onclick="toggleLowEndMode()">
                ${escapeHtml(state.lowEnd ? t("perfBtnOff") : t("perfBtnOn"))}
            </button>
            <div class="info-stripe" style="font-size:0.78rem;"><strong>${escapeHtml(t("perfStatus"))}</strong> ${escapeHtml(state.lowEnd ? t("perfStateLow") : t("perfStateStd"))}</div>`;
        return;
    }

    tEl.textContent = t("titleNav");
    const navs = [
        { type: "view", target: "home", label: t("homeHub") },
        { type: "link", target: "blog.html", label: `${t("navBlog")} (${SITE_CONFIG.blogPosts.length})` },
        { type: "view", target: "projects", label: `${t("navProjects")} (${SITE_CONFIG.projects.length})` },
        { type: "view", target: "games", label: `${t("navGames")} (${(SITE_CONFIG.games || []).length})` },
        { type: "view", target: "about", label: t("navAbout") },
        { type: "view", target: "setup", label: t("navSetup") },
        { type: "view", target: "hadis", label: t("navHadis") },
        { type: "view", target: "sysinfo", label: t("navSysinfo") },
        { type: "view", target: "toolkit", label: t("navToolkit") },
        { type: "view", target: "android", label: t("navAndroid") },
        { type: "view", target: "evcharge", label: t("navEv") },
        { type: "view", target: "contact", label: t("navContact") }
    ];
    bEl.innerHTML = navs.map(n => n.type === "link"
        ? `<a href="${n.target}" class="wp-choice-btn" style="justify-content:space-between;"><span style="font-size:0.85rem;font-weight:600;text-transform:capitalize;">${escapeHtml(n.label)}</span><span>→</span></a>`
        : `<button type="button" class="wp-choice-btn" style="justify-content:space-between;" onclick="navigateTo('${n.target}');closeCharms()"><span style="font-size:0.85rem;font-weight:600;text-transform:capitalize;">${escapeHtml(n.label)}</span><span>→</span></button>`
    ).join("") + `<button type="button" class="metro-btn-primary" style="width:100%;margin-top:10px;" onclick="closeCharms();openAdminModal()">${escapeHtml(t("adminBtn"))}</button>`;
}

/* =====================================================================
   10. YÖNETİM PANELİ (ŞİFRE İPUCU YOKTUR · OYUNLAR, PROJE & FORMAT DAHİL)
   ===================================================================== */
function openAdminModal() {
    $("metro-modal-body")?.classList.remove("game-modal", "cinema-mode");
    $("metro-modal-backdrop").classList.remove("hidden");
    renderAdminModal();
}

function renderAdminModal() {
    const body = $("metro-modal-body");
    const en = isEn();
    if (!state.adminUnlocked) {
        body.innerHTML = `
            <div class="row-between" style="margin-bottom:14px;">
                <h3 style="font-size:1.42rem;font-weight:300;">⚙ ${en ? "Admin Login" : "Yönetici Girişi"}</h3>
                <button type="button" class="win-circle-btn sm" onclick="closeMetroModal()">✕</button>
            </div>
            <p style="font-size:0.84rem;color:rgba(255,255,255,0.78);margin-bottom:14px;">${en ? "Enter your authorized password to access the admin panel." : "Yönetim paneline erişmek için yetkili şifrenizi girin."}</p>
            <form onsubmit="handleAdminLogin(event)" class="row-center flex-wrap">
                <input type="password" id="admin-pin-input" class="metro-input" style="flex:1;min-width:190px;" placeholder="${en ? "Admin Password" : "Yönetici Şifresi"}" autocomplete="current-password" autofocus required>
                <button type="submit" class="metro-btn-primary">${en ? "Sign In" : "Giriş Yap"}</button>
            </form>`;
        return;
    }

    const tabs = [
        { id: "social",   label: `Sosyal & Steam (${SITE_CONFIG.socialTiles.length})` },
        { id: "blog",     label: `Blog (${SITE_CONFIG.blogPosts.length})` },
        { id: "projects", label: `Projeler (${SITE_CONFIG.projects.length})` },
        { id: "games",    label: `Oyunlar (${(SITE_CONFIG.games || []).length})` },
        { id: "toolkit",  label: `Format & ISO (${SITE_CONFIG.toolkit.apps.length})` },
        { id: "export",   label: "Ayarlar & data.js" }
    ];

    let tabHtml = "";
    if (state.adminTab === "social") {
        const steamItem = SITE_CONFIG.socialTiles.find(s => s.icon === "steam");
        const edit = SITE_CONFIG.socialTiles.find(s => s.id === state.adminEditSocialId);
        const iconOptions = Object.keys(SOCIAL_ICON_SVGS);

        tabHtml = `
            <form onsubmit="adminQuickSaveSteam(event)" style="padding:12px;background:rgba(27,40,56,0.65);border:1px solid rgba(255,255,255,0.2);margin-bottom:14px;">
                <div class="metro-micro" style="color:#66c0f4;margin-bottom:6px;">Hızlı Steam Hesabı Ayarı</div>
                <div class="row-center flex-wrap">
                    <input id="adm-steam-handle" class="metro-input" style="flex:1;min-width:140px;" placeholder="Steam Kullanıcı Adı" value="${escapeHtml(steamItem ? steamItem.handle : "@sabanefebenzil")}" required>
                    <input id="adm-steam-url" class="metro-input" style="flex:2;min-width:210px;" placeholder="https://steamcommunity.com/id/..." value="${escapeHtml(steamItem ? steamItem.url : "https://steamcommunity.com/id/sabanefebenzil")}" required>
                    <button type="submit" class="metro-btn-primary">Steam Kaydet</button>
                </div>
            </form>
            <form onsubmit="adminSaveSocialTile(event)" style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div class="metro-micro">${edit ? "Sosyal Medya Kutucuğunu Düzenle" : "Yeni Sosyal Medya / Platform Kutucuğu Ekle"}</div>
                <div class="two-col-grid" style="gap:8px;">
                    <input id="as-name" class="metro-input" placeholder="Platform Adı" value="${escapeHtml(edit?.name || "")}" required>
                    <input id="as-handle" class="metro-input" placeholder="Kullanıcı Adı / Alt Yazı" value="${escapeHtml(edit?.handle || "")}" required>
                </div>
                <div style="display:grid;grid-template-columns:2fr 1fr 72px;gap:8px;">
                    <input id="as-url" class="metro-input" placeholder="Bağlantı URL (https://...)" value="${escapeHtml(edit?.url || "")}" required>
                    <select id="as-icon" class="metro-select">${iconOptions.map(ic => `<option value="${ic}" ${edit?.icon === ic ? "selected" : ""}>İkon: ${ic}</option>`).join("")}</select>
                    <input type="color" id="as-color" class="metro-input" style="padding:3px;height:40px;cursor:pointer;" value="${escapeHtml(edit?.color || "#0078D7")}" title="Marka Rengi">
                </div>
                <div class="row-center">
                    <button type="submit" class="metro-btn-primary">${edit ? "Kutucuğu Güncelle" : "Kutucuk Ekle"}</button>
                    ${edit ? `<button type="button" class="metro-flat-btn" onclick="state.adminEditSocialId=null;renderAdminModal()">İptal</button>` : ""}
                </div>
            </form>
            <div>${SITE_CONFIG.socialTiles.map((s, idx) => `
                <div class="admin-list-item">
                    <div class="row-center min-w-0" style="gap:9px;">
                        <span style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;background:${escapeHtml(s.color)};border:1px solid rgba(255,255,255,0.3);flex-shrink:0;">
                            <span style="width:15px;height:15px;display:block;">${getSocialIconSvg(s.icon)}</span>
                        </span>
                        <div class="min-w-0">
                            <div style="font-size:0.83rem;font-weight:600;">${escapeHtml(s.name)} <span class="mono-sm" style="opacity:0.7;">(${escapeHtml(s.handle)})</span></div>
                            <div class="truncate" style="font-size:0.7rem;opacity:0.68;max-width:340px;">${escapeHtml(s.url)}</div>
                        </div>
                    </div>
                    <div class="row-center" style="gap:5px;">
                        <button type="button" class="metro-flat-btn" onclick="adminMoveSocial(${idx},-1)" title="Yukarı Taşı">↑</button>
                        <button type="button" class="metro-flat-btn" onclick="adminMoveSocial(${idx},1)" title="Aşağı Taşı">↓</button>
                        <button type="button" class="metro-flat-btn" onclick="state.adminEditSocialId='${escapeHtml(s.id)}';renderAdminModal()">Düzenle</button>
                        <button type="button" class="metro-btn-danger" onclick="adminDeleteSocial('${escapeHtml(s.id)}')">Sil</button>
                    </div>
                </div>`).join("")}</div>`;
    } else if (state.adminTab === "blog") {
        const edit = SITE_CONFIG.blogPosts.find(b => b.id === state.adminEditBlogId);
        const cats = ["Makine & CAD", "Donanım", "Yazılım & ROM", "Genel & Otomotiv"];
        tabHtml = `
            <form onsubmit="adminSaveBlog(event)" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div class="row-between flex-wrap">
                    <div class="metro-micro">${edit ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı Ekle"}</div>
                    <a href="blog.html" target="_blank" rel="noopener noreferrer" class="metro-flat-btn xs">blog.html'de Önizle ↗</a>
                </div>
                <input id="ab-title" class="metro-input" required placeholder="Yazı Başlığı" value="${escapeHtml(edit?.title || "")}">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
                    <input id="ab-day" class="metro-input" placeholder="Gün (25)" value="${escapeHtml(edit?.day || "25")}" required>
                    <input id="ab-month" class="metro-input" placeholder="Ay (KAS)" value="${escapeHtml(edit?.month || "KAS")}" required>
                    <input id="ab-year" class="metro-input" placeholder="Yıl (2026)" value="${escapeHtml(edit?.year || "2026")}" required>
                    <select id="ab-cat" class="metro-select">${cats.map(c => `<option value="${c}" ${edit?.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
                </div>
                <div class="row-center flex-wrap">
                    <label class="metro-flat-btn" style="cursor:pointer;">📷 Kapak Fotoğrafı Seç<input type="file" accept="image/*" style="display:none;" onchange="handleImageUpload(event,'blog')"></label>
                    <input id="ab-image" class="metro-input" style="flex:1;min-width:180px;" placeholder="veya görsel URL (https://...)" value="${escapeHtml(edit?.image && !edit.image.startsWith("data:") ? edit.image : "")}">
                    <input id="ab-readtime" class="metro-input" style="width:130px;" placeholder="4 dk okuma" value="${escapeHtml(edit?.readTime || "4 dk okuma")}">
                </div>
                <input id="ab-excerpt" class="metro-input" required placeholder="Kısa özet" value="${escapeHtml(edit?.excerpt || "")}">
                <textarea id="ab-content" rows="4" class="metro-textarea" required placeholder="Tam içerik (paragraflar için boş satır, alt başlık için ###, kod bloğu için \`\`\`bash ... \`\`\` kullanın)">${escapeHtml(edit?.content || "")}</textarea>
                <div class="row-center">
                    <button type="submit" class="metro-btn-primary">${edit ? "Güncelle" : "Yazıyı Yayınla"}</button>
                    ${edit ? `<button type="button" class="metro-flat-btn" onclick="state.adminEditBlogId=null;state.uploadedBlogImage='';renderAdminModal()">İptal</button>` : ""}
                </div>
            </form>
            <div>${SITE_CONFIG.blogPosts.map(b => `
                <div class="admin-list-item">
                    <span style="font-size:0.82rem;"><strong>${escapeHtml(b.day)} ${escapeHtml(b.month)}</strong> · ${escapeHtml(b.title)}</span>
                    <div class="row-center" style="gap:6px;">
                        <a href="blog.html?post=${encodeURIComponent(b.id)}" target="_blank" rel="noopener noreferrer" class="metro-flat-btn">Aç ↗</a>
                        <button type="button" class="metro-flat-btn" onclick="state.adminEditBlogId='${escapeHtml(b.id)}';state.uploadedBlogImage='';renderAdminModal()">Düzenle</button>
                        <button type="button" class="metro-btn-danger" onclick="adminDeleteBlog('${escapeHtml(b.id)}')">Sil</button>
                    </div>
                </div>`).join("")}</div>`;
    } else if (state.adminTab === "projects") {
        const edit = SITE_CONFIG.projects.find(p => p.id === state.adminEditProjectId);
        const pCats = [
            { id: "muhendislik", label: "Mühendislik / CAD" },
            { id: "donanim", label: "Donanım / Android" },
            { id: "yazilim", label: "Yazılım / Sunucu" }
        ];
        tabHtml = `
            <form onsubmit="adminSaveProject(event)" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div class="metro-micro">${edit ? "Projeyi Düzenle" : "Yeni Proje Ekle"}</div>
                <div class="two-col-grid" style="gap:8px;">
                    <input id="ap-title" class="metro-input" required placeholder="Proje Başlığı" value="${escapeHtml(edit?.title || "")}">
                    <select id="ap-cat" class="metro-select">${pCats.map(c => `<option value="${c.id}" ${edit?.category === c.id ? "selected" : ""}>${c.label}</option>`).join("")}</select>
                </div>
                <div class="two-col-grid" style="gap:8px;">
                    <input id="ap-year" class="metro-input" required placeholder="Etiket / Yıl (ör. CAD & Tasarım)" value="${escapeHtml(edit?.year || "2026")}">
                    <input id="ap-link" class="metro-input" placeholder="Proje Bağlantısı (Opsiyonel https://...)" value="${escapeHtml(edit?.link || "")}">
                </div>
                <input id="ap-tech" class="metro-input" placeholder="Etiketler (virgülle ayır: SolidWorks, Python, Flask)" value="${escapeHtml((edit?.tech || []).join(", "))}">
                <textarea id="ap-desc" rows="3" class="metro-textarea" required placeholder="Proje açıklaması...">${escapeHtml(edit?.description || "")}</textarea>
                <div class="row-center">
                    <button type="submit" class="metro-btn-primary">${edit ? "Projeyi Güncelle" : "Proje Ekle"}</button>
                    ${edit ? `<button type="button" class="metro-flat-btn" onclick="state.adminEditProjectId=null;renderAdminModal()">İptal</button>` : ""}
                </div>
            </form>
            <div>${SITE_CONFIG.projects.map(p => `
                <div class="admin-list-item">
                    <div class="min-w-0">
                        <div style="font-size:0.83rem;font-weight:600;">${escapeHtml(p.title)} <span class="mono-sm" style="opacity:0.7;">(${escapeHtml(p.year)})</span></div>
                        <div class="truncate" style="font-size:0.71rem;opacity:0.7;max-width:420px;">${escapeHtml(p.description)}</div>
                    </div>
                    <div class="row-center" style="gap:6px;">
                        <button type="button" class="metro-flat-btn" onclick="state.adminEditProjectId='${escapeHtml(p.id)}';renderAdminModal()">Düzenle</button>
                        <button type="button" class="metro-btn-danger" onclick="adminDeleteProject('${escapeHtml(p.id)}')">Sil</button>
                    </div>
                </div>`).join("")}</div>`;
    } else if (state.adminTab === "games") {
        const games = SITE_CONFIG.games || [];
        const edit = games.find(g => g.id === state.adminEditGameId);
        const gCats = ["Arcade", "Bulmaca", "Strateji & Masa", "Hız & Refleks", "Kart & Şans"];
        tabHtml = `
            <form onsubmit="adminSaveGame(event)" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div class="metro-micro">${edit ? "Oyunu Düzenle" : "Yeni Oyun Ekle"}</div>
                <div style="display:grid;grid-template-columns:72px 1fr 1fr 72px;gap:8px;">
                    <input id="ag-num" class="metro-input" placeholder="No" value="${escapeHtml(edit?.num || String(games.length + 1).padStart(2, "0"))}" required>
                    <input id="ag-title" class="metro-input" placeholder="Oyun Adı" value="${escapeHtml(edit?.title || "")}" required>
                    <select id="ag-cat" class="metro-select">${gCats.map(c => `<option value="${c}" ${edit?.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select>
                    <input id="ag-icon" class="metro-input" placeholder="🎮" value="${escapeHtml(edit?.icon || "🎮")}">
                </div>
                <input id="ag-path" class="metro-input mono-sm" placeholder="Dosya Yolu (ör. games/01-Candy-Crush-Game/index.html)" value="${escapeHtml(edit?.path || "")}" required>
                <div class="row-center">
                    <button type="submit" class="metro-btn-primary">${edit ? "Oyunu Güncelle" : "Oyun Ekle"}</button>
                    ${edit ? `<button type="button" class="metro-flat-btn" onclick="state.adminEditGameId=null;renderAdminModal()">İptal</button>` : ""}
                </div>
            </form>
            <div style="max-height:300px;overflow-y:auto;">${games.map(g => `
                <div class="admin-list-item">
                    <div class="min-w-0">
                        <div style="font-size:0.82rem;font-weight:600;">${escapeHtml(g.icon || "🎮")} #${escapeHtml(g.num)} ${escapeHtml(g.title)} <span class="mono-sm" style="opacity:0.68;">[${escapeHtml(g.cat)}]</span></div>
                        <div class="truncate mono-sm" style="opacity:0.65;max-width:420px;">${escapeHtml(g.path)}</div>
                    </div>
                    <div class="row-center" style="gap:6px;">
                        <button type="button" class="metro-flat-btn" onclick="state.adminEditGameId='${escapeHtml(g.id)}';renderAdminModal()">Düzenle</button>
                        <button type="button" class="metro-btn-danger" onclick="adminDeleteGame('${escapeHtml(g.id)}')">Sil</button>
                    </div>
                </div>`).join("")}</div>`;
    } else if (state.adminTab === "toolkit") {
        const edit = SITE_CONFIG.toolkit.apps.find(a => a.id === state.adminEditAppId);
        const appCats = ["Tarayıcı & Ağ", "Sistem & Ofis", "Araçlar", "Oyun & Yayın", "Donanım & Medya", "İletişim"];
        tabHtml = `
            <form onsubmit="adminSaveToolkitApp(event)" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div class="metro-micro">${edit ? "Programı Düzenle (ör. Microsoft Office Linki Ekle)" : "Format & ISO Arşivine Yeni Program Ekle"}</div>
                <div class="two-col-grid" style="gap:8px;">
                    <input id="atk-name" class="metro-input" required placeholder="Program Adı (ör. Microsoft Office)" value="${escapeHtml(edit?.name || "")}">
                    <select id="atk-cat" class="metro-select">${appCats.map(c => `<option value="${c}" ${edit?.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select>
                </div>
                <div class="two-col-grid" style="gap:8px;">
                    <input id="atk-winget" class="metro-input" placeholder="Winget ID (opsiyonel, ör. Valve.Steam)" value="${escapeHtml(edit?.winget || "")}">
                    <input id="atk-url" class="metro-input" placeholder="Doğrudan İndirme URL (https://...)" value="${escapeHtml(edit?.url || "")}">
                </div>
                <label class="row-center" style="font-size:0.8rem;cursor:pointer;">
                    <input type="checkbox" id="atk-checked" ${edit?.defaultChecked ? "checked" : ""} style="width:16px;height:16px;accent-color:var(--accent);">
                    <span>Varsayılan olarak toplu kurulumda seçili gelsin</span>
                </label>
                <div class="row-center">
                    <button type="submit" class="metro-btn-primary">${edit ? "Programı Güncelle" : "Program Ekle"}</button>
                    ${edit ? `<button type="button" class="metro-flat-btn" onclick="state.adminEditAppId=null;renderAdminModal()">İptal</button>` : ""}
                </div>
            </form>
            <div>${SITE_CONFIG.toolkit.apps.map(a => `
                <div class="admin-list-item">
                    <div class="min-w-0">
                        <div style="font-size:0.83rem;font-weight:600;">${escapeHtml(a.name)} <span class="mono-sm" style="opacity:0.7;">[${escapeHtml(a.cat)}]</span></div>
                        <div class="truncate mono-sm" style="opacity:0.68;max-width:420px;">${a.winget ? `winget: ${escapeHtml(a.winget)}` : "Sadece URL"} · ${a.url ? escapeHtml(a.url) : "URL eklenmedi"}</div>
                    </div>
                    <div class="row-center" style="gap:6px;">
                        <button type="button" class="metro-flat-btn" onclick="state.adminEditAppId='${escapeHtml(a.id)}';renderAdminModal()">Düzenle</button>
                        <button type="button" class="metro-btn-danger" onclick="adminDeleteToolkitApp('${escapeHtml(a.id)}')">Sil</button>
                    </div>
                </div>`).join("")}</div>`;
    } else {
        tabHtml = `
            <form onsubmit="adminSaveGeneralSettings(event)" style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div>
                    <label class="metro-micro">Profil Fotoğrafı (Dosya Seç veya URL)</label>
                    <div class="row-center" style="gap:6px;margin-top:4px;">
                        <label class="metro-flat-btn" style="cursor:pointer;white-space:nowrap;">📷 Seç<input type="file" accept="image/*" style="display:none;" onchange="handleImageUpload(event,'avatar')"></label>
                        <input id="adm-avatar" class="metro-input" value="${escapeHtml(SITE_CONFIG.avatarUrl && !SITE_CONFIG.avatarUrl.startsWith("data:") ? SITE_CONFIG.avatarUrl : "")}" placeholder="profil.jpg veya https://...">
                    </div>
                </div>
                <div class="two-col-grid" style="gap:8px;">
                    <div>
                        <label class="metro-micro">@nptechtr YouTube Kanal ID (Canlı RSS için Opsiyonel)</label>
                        <input id="adm-ytchid" class="metro-input" style="margin-top:4px;" value="${escapeHtml(SITE_CONFIG.nptechYoutube?.channelId || "")}" placeholder="UC...">
                    </div>
                    <div>
                        <label class="metro-micro">Yeni Yönetici Şifresi (Boş bırakılabilir)</label>
                        <input type="password" id="adm-newpin" class="metro-input" style="margin-top:4px;" placeholder="Yeni şifre...">
                    </div>
                </div>
                <button type="submit" class="metro-btn-primary">Ayarları Kaydet</button>
            </form>
            <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.14);">
                <div class="metro-micro" style="margin-bottom:7px;">YouTube Music Oynatma Listeleri</div>
                <form onsubmit="adminAddYtm(event)" class="two-col-grid" style="gap:8px;margin-bottom:10px;">
                    <input id="af-yt-name" class="metro-input" required placeholder="Sanatçı / Liste Adı">
                    <input id="af-yt-artist" class="metro-input" placeholder="Açıklama">
                    <input id="af-yt-id" class="metro-input" required placeholder="YouTube URL, Playlist ID veya Video ID" style="grid-column:1 / -1;">
                    <button type="submit" class="metro-btn-primary" style="grid-column:1 / -1;">YT Music Listesi Ekle</button>
                </form>
                ${SITE_CONFIG.youtubeMusic.playlists.map((pl, i) => `
                    <div class="admin-list-item">
                        <span style="font-size:0.81rem;">♪ <strong>${escapeHtml(pl.name)}</strong> — ${escapeHtml(pl.artist || "")}</span>
                        <button type="button" class="metro-btn-danger" onclick="adminDeleteYtm(${i})">Sil</button>
                    </div>`).join("")}
            </div>
            <div>
                <div class="metro-micro" style="margin-bottom:6px;">Kalıcı Yayınlama &amp; Yedekleme</div>
                <p style="font-size:0.79rem;color:rgba(255,255,255,0.75);margin-bottom:10px;">İndirdiğiniz <strong>data.js</strong> dosyasını proje klasöründe değiştirmeniz yeterlidir; hem <strong>index.html</strong> hem <strong>blog.html</strong> kalıcı olarak güncellenir.</p>
                <div class="row-center flex-wrap">
                    <button type="button" class="metro-btn-primary" onclick="exportDataJs()">⬇ Güncel data.js İndir</button>
                    <button type="button" class="metro-flat-btn" onclick="downloadConfigJson()">⬇ config.json İndir</button>
                    <button type="button" class="metro-btn-danger" onclick="handleResetDefaults()">
                        ${state.confirmResetStep ? "⚠ Emin misin? Tekrar Tıkla (Sıfırla)" : "↺ Varsayılana Sıfırla"}
                    </button>
                </div>
            </div>`;
    }

    body.innerHTML = `
        <div class="row-between" style="margin-bottom:12px;">
            <h3 style="font-size:1.38rem;font-weight:300;">⚙ sabanefebenzil.dev — Yönetim Paneli</h3>
            <div class="row-center" style="gap:6px;">
                <button type="button" class="metro-flat-btn" onclick="state.adminUnlocked=false;closeMetroModal();showToast('Oturum kilitlendi.')">Kilitle</button>
                <button type="button" class="win-circle-btn sm" onclick="closeMetroModal()">✕</button>
            </div>
        </div>
        <div class="admin-tabs">
            ${tabs.map(tab => `<button type="button" class="admin-tab-btn ${state.adminTab === tab.id ? "active" : ""}" onclick="state.adminTab='${tab.id}';state.confirmResetStep=false;renderAdminModal()">${tab.label}</button>`).join("")}
        </div>
        <div>${tabHtml}</div>`;
}

function handleAdminLogin(e) {
    e.preventDefault();
    if (hashPin($("admin-pin-input").value.trim()) === getStoredPinHash()) {
        state.adminUnlocked = true;
        showToast(isEn() ? "Signed in to admin panel." : "Yönetim paneline giriş yapıldı.");
        renderAdminModal();
    } else {
        showToast(isEn() ? "Incorrect password." : "Hatalı şifre.");
    }
}

function syncAllViewsAfterEdit(msg) {
    saveConfigToStorage();
    renderWhoamiAndBrand();
    renderYtmTile();
    loadGitHubTile();
    loadNptechVideosTile();
    liveTilesEngine.refreshAllContent();
    if (state.view !== "home") renderSubpage();
    renderAdminModal();
    if (msg) showToast(msg);
}

function adminQuickSaveSteam(e) {
    e.preventDefault();
    const handle = $("adm-steam-handle").value.trim(), url = $("adm-steam-url").value.trim();
    const existing = SITE_CONFIG.socialTiles.find(s => s.icon === "steam");
    if (existing) Object.assign(existing, { handle, url });
    else SITE_CONFIG.socialTiles.push({ id: "soc-steam-" + Date.now(), name: "Steam", handle, url, color: "#1B2838", icon: "steam" });
    syncAllViewsAfterEdit("Steam hesabı güncellendi.");
}

function adminSaveSocialTile(e) {
    e.preventDefault();
    const entry = {
        id: state.adminEditSocialId || ("soc-" + Date.now()),
        name: $("as-name").value.trim(), handle: $("as-handle").value.trim(),
        url: $("as-url").value.trim(), icon: $("as-icon").value, color: $("as-color").value || "#0078D7"
    };
    const idx = SITE_CONFIG.socialTiles.findIndex(s => s.id === entry.id);
    idx >= 0 ? (SITE_CONFIG.socialTiles[idx] = entry) : SITE_CONFIG.socialTiles.push(entry);
    state.adminEditSocialId = null;
    syncAllViewsAfterEdit("Sosyal medya kutucuğu kaydedildi.");
}

function adminMoveSocial(idx, delta) {
    const target = idx + delta, arr = SITE_CONFIG.socialTiles;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    syncAllViewsAfterEdit("Sıralama güncellendi.");
}

function adminDeleteSocial(id) {
    SITE_CONFIG.socialTiles = SITE_CONFIG.socialTiles.filter(s => s.id !== id);
    syncAllViewsAfterEdit("Sosyal medya kutucuğu silindi.");
}

function adminSaveProject(e) {
    e.preventDefault();
    const entry = {
        id: state.adminEditProjectId || ("p-" + Date.now()),
        title: $("ap-title").value.trim(),
        category: $("ap-cat").value,
        year: $("ap-year").value.trim(),
        link: $("ap-link").value.trim(),
        tech: $("ap-tech").value.split(",").map(s => s.trim()).filter(Boolean),
        description: $("ap-desc").value.trim()
    };
    const idx = SITE_CONFIG.projects.findIndex(p => p.id === entry.id);
    idx >= 0 ? (SITE_CONFIG.projects[idx] = entry) : SITE_CONFIG.projects.unshift(entry);
    state.adminEditProjectId = null;
    syncAllViewsAfterEdit("Proje kaydedildi.");
}

function adminDeleteProject(id) {
    SITE_CONFIG.projects = SITE_CONFIG.projects.filter(p => p.id !== id);
    syncAllViewsAfterEdit("Proje silindi.");
}

function adminSaveGame(e) {
    e.preventDefault();
    SITE_CONFIG.games = SITE_CONFIG.games || [];
    const entry = {
        id: state.adminEditGameId || ("g-" + Date.now()),
        num: $("ag-num").value.trim(),
        title: $("ag-title").value.trim(),
        cat: $("ag-cat").value,
        icon: $("ag-icon").value.trim() || "🎮",
        path: $("ag-path").value.trim()
    };
    const idx = SITE_CONFIG.games.findIndex(g => g.id === entry.id);
    idx >= 0 ? (SITE_CONFIG.games[idx] = entry) : SITE_CONFIG.games.push(entry);
    state.adminEditGameId = null;
    syncAllViewsAfterEdit("Oyun kaydedildi.");
}

function adminDeleteGame(id) {
    SITE_CONFIG.games = (SITE_CONFIG.games || []).filter(g => g.id !== id);
    syncAllViewsAfterEdit("Oyun silindi.");
}

function adminSaveToolkitApp(e) {
    e.preventDefault();
    const entry = {
        id: state.adminEditAppId || ("app-" + Date.now()),
        name: $("atk-name").value.trim(),
        cat: $("atk-cat").value,
        winget: $("atk-winget").value.trim(),
        url: $("atk-url").value.trim(),
        defaultChecked: $("atk-checked").checked
    };
    const idx = SITE_CONFIG.toolkit.apps.findIndex(a => a.id === entry.id);
    idx >= 0 ? (SITE_CONFIG.toolkit.apps[idx] = entry) : SITE_CONFIG.toolkit.apps.push(entry);
    state.adminEditAppId = null;
    state.selectedToolkitIds = null;
    syncAllViewsAfterEdit("Format & ISO programı kaydedildi.");
}

function adminDeleteToolkitApp(id) {
    SITE_CONFIG.toolkit.apps = SITE_CONFIG.toolkit.apps.filter(a => a.id !== id);
    state.selectedToolkitIds = null;
    syncAllViewsAfterEdit("Program silindi.");
}

function compressImage(file, maxW = 860, quality = 0.78) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = ev => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement("canvas");
                let w = img.width, h = img.height;
                if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
                c.width = w; c.height = h;
                c.getContext("2d").drawImage(img, 0, 0, w, h);
                resolve(c.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject;
            img.src = ev.target.result;
        };
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

async function handleImageUpload(e, target) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        if (target === "avatar") {
            SITE_CONFIG.avatarUrl = await compressImage(file, 480, 0.84);
            syncAllViewsAfterEdit("Profil fotoğrafı güncellendi.");
        } else {
            state.uploadedBlogImage = await compressImage(file, 900, 0.78);
            showToast("Kapak fotoğrafı hazırlandı.");
        }
    } catch {
        showToast("Fotoğraf işlenemedi.");
    }
}

function adminSaveBlog(e) {
    e.preventDefault();
    const existing = SITE_CONFIG.blogPosts.find(b => b.id === state.adminEditBlogId);
    const entry = {
        id: state.adminEditBlogId || ("b-" + Date.now()),
        title: $("ab-title").value.trim(),
        day: $("ab-day").value.trim(),
        month: $("ab-month").value.trim().toUpperCase(),
        year: $("ab-year").value.trim(),
        category: $("ab-cat").value,
        readTime: $("ab-readtime").value.trim() || "4 dk okuma",
        image: state.uploadedBlogImage || $("ab-image").value.trim() || existing?.image || "",
        excerpt: $("ab-excerpt").value.trim(),
        content: $("ab-content").value.trim()
    };
    const idx = SITE_CONFIG.blogPosts.findIndex(b => b.id === entry.id);
    idx >= 0 ? (SITE_CONFIG.blogPosts[idx] = entry) : SITE_CONFIG.blogPosts.unshift(entry);
    state.adminEditBlogId = null;
    state.uploadedBlogImage = "";
    syncAllViewsAfterEdit("Blog yazısı kaydedildi.");
}

function adminDeleteBlog(id) {
    SITE_CONFIG.blogPosts = SITE_CONFIG.blogPosts.filter(b => b.id !== id);
    syncAllViewsAfterEdit("Blog yazısı silindi.");
}

function adminSaveGeneralSettings(e) {
    e.preventDefault();
    const avUrl = $("adm-avatar").value.trim();
    if (avUrl) SITE_CONFIG.avatarUrl = avUrl;
    if (SITE_CONFIG.nptechYoutube) {
        SITE_CONFIG.nptechYoutube.channelId = $("adm-ytchid").value.trim();
    }
    const newPin = $("adm-newpin").value.trim();
    if (newPin.length >= 4) {
        const hashed = hashPin(newPin);
        SITE_CONFIG.customPinHash = hashed;
        store.set("seb_admin_pin_hash", hashed);
        showToast("Yönetici şifresi güncellendi.");
    }
    syncAllViewsAfterEdit("Ayarlar kaydedildi.");
}

function adminAddYtm(e) {
    e.preventDefault();
    const name = $("af-yt-name").value.trim(), artist = $("af-yt-artist").value.trim(), raw = $("af-yt-id").value.trim();
    const listM = raw.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    const vidM = raw.match(/(?:[?&]v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    const playlistId = listM ? listM[1] : (/^[a-zA-Z0-9_-]{14,}$/.test(raw) ? raw : "");
    const videoId = vidM ? vidM[1] : (!playlistId && /^[a-zA-Z0-9_-]{11}$/.test(raw) ? raw : "");
    if (!playlistId && !videoId) return showToast("Geçerli bir YouTube playlist/video ID veya URL girin.");
    SITE_CONFIG.youtubeMusic.playlists.push({
        id: "yt-" + Date.now(), name, artist, playlistId, videoId,
        url: playlistId ? `https://music.youtube.com/playlist?list=${playlistId}` : `https://music.youtube.com/watch?v=${videoId}`
    });
    syncAllViewsAfterEdit("YouTube Music listesi eklendi.");
}

function adminDeleteYtm(idx) {
    if (SITE_CONFIG.youtubeMusic.playlists.length <= 1) return showToast("En az 1 liste kalmalıdır.");
    SITE_CONFIG.youtubeMusic.playlists.splice(idx, 1);
    syncAllViewsAfterEdit("Oynatma listesi silindi.");
}

function exportDataJs() {
    try {
        delete SITE_CONFIG.xFeed;
        SITE_CONFIG.configVersion = Date.now();
        saveConfigToStorage();
        const jsSource = [
            "/* =====================================================================",
            "   sabanefebenzil.dev — Ortak Veri Deposu (index.html & blog.html)",
            "   Admin Paneli üzerinden dışa aktarıldı.",
            "   ===================================================================== */\n",
            `const SOCIAL_ICON_SVGS = ${JSON.stringify(SOCIAL_ICON_SVGS, null, 4)};\n`,
            `const DEFAULT_SITE_CONFIG = ${JSON.stringify(SITE_CONFIG, null, 4)};\n`,
            `const FORTY_HADITHS = ${JSON.stringify(FORTY_HADITHS, null, 4)};\n`,
            `const VISUAL_THEMES = ${JSON.stringify(VISUAL_THEMES, null, 4)};\n`,
            `const METRO_ACCENTS = ${JSON.stringify(METRO_ACCENTS, null, 4)};\n`
        ].join("\n");
        downloadFile(jsSource, "data.js", "application/javascript;charset=utf-8");
        showToast("Güncel data.js indirildi. Dosyayı proje klasöründe değiştirmeniz yeterlidir.");
    } catch {
        showToast("data.js oluşturulurken hata oluştu.");
    }
}

function downloadConfigJson() {
    delete SITE_CONFIG.xFeed;
    downloadFile(JSON.stringify(SITE_CONFIG, null, 2), "config.json", "application/json");
    showToast("config.json yedeği indirildi.");
}

function handleResetDefaults() {
    if (!state.confirmResetStep) { state.confirmResetStep = true; return renderAdminModal(); }
    state.confirmResetStep = false;
    SITE_CONFIG = clone(DEFAULT_SITE_CONFIG);
    store.del("seb_metro_config_v1");
    syncAllViewsAfterEdit("Site ayarları varsayılana sıfırlandı.");
}

/* =====================================================================
   11. YATAY METRO START SCREEN GRUP & YUMUŞAK WHEEL KAYDIRMA MOTORU
   ===================================================================== */
const horizontalMetro = {
    grid: null,
    targetX: 0,
    rafId: null,
    bound: false,

    setupGroups() {
        const grid = document.querySelector("#home-view .hub-grid");
        if (!grid || grid.dataset.metroGrouped === "1") return;

        const sections = grid.querySelectorAll(":scope > section");
        if (sections.length < 2) return;

        const [leftSec, rightSec] = sections;
        const mkGroup = (modClass, label) => {
            const sec = document.createElement("section");
            sec.className = `metro-group metro-group--${modClass}`;
            sec.setAttribute("aria-label", label);
            return sec;
        };

        const whoamiBox = leftSec.querySelector("#whoami-bio-box");
        const whoamiHead = whoamiBox?.previousElementSibling;
        const jumpGrid = leftSec.querySelector(".jump-grid");
        const jumpHead = jumpGrid?.previousElementSibling;
        const sysinfoTile = leftSec.querySelector(".sysinfo-wide-tile");
        const socialGrid = leftSec.querySelector("#home-social-grid");
        const socialHead = socialGrid?.previousElementSibling;
        const metaLine = leftSec.querySelector(".hub-meta-line");

        const topLiveRow = rightSec.querySelector(".top-live-row");
        const liveHead = topLiveRow?.previousElementSibling;
        const weatherTile = rightSec.querySelector("#weather-live-tile");
        const ytmTile = rightSec.querySelector(".tile-ytm");
        const feedsGrid = rightSec.querySelector(".live-tiles-grid");
        const nptechTile = rightSec.querySelector("#nptech-live-tile");

        const g1 = mkGroup("whoami", "Hakkımda");
        [whoamiHead, whoamiBox, metaLine].forEach(el => el && g1.appendChild(el));

        const g2 = mkGroup("jump", "Hızlı Erişim ve Sistem");
        [jumpHead, jumpGrid, sysinfoTile].forEach(el => el && g2.appendChild(el));

        const g3 = mkGroup("social", "Sosyal Ağlar ve Steam");
        [socialHead, socialGrid].forEach(el => el && g3.appendChild(el));

        const g4 = mkGroup("live", "Canlı Kutucuklar, Hava Durumu ve Müzik");
        [liveHead, topLiveRow, weatherTile, ytmTile].forEach(el => el && g4.appendChild(el));

        const g5 = mkGroup("feeds", "GitHub ve nptech Akışı");
        const feedsHead = document.createElement("div");
        feedsHead.className = "row-between";
        feedsHead.style.marginBottom = "11px";
        feedsHead.innerHTML = `<h2 class="metro-section-head" id="feeds-head-title" style="margin-bottom:0;">${escapeHtml(t("feedsHead"))}</h2><span class="metro-micro">GitHub · YouTube</span>`;
        g5.appendChild(feedsHead);
        if (feedsGrid) g5.appendChild(feedsGrid);
        if (nptechTile) g5.appendChild(nptechTile);

        grid.innerHTML = "";
        [g4, g1, g2, g3, g5].forEach(g => grid.appendChild(g));
        grid.dataset.metroGrouped = "1";
        this.grid = grid;
    },

    canScrollHorizontally() {
        return Boolean(
            this.grid &&
            state.view === "home" &&
            window.innerWidth > 980 &&
            !state.charmsOpen &&
            $("metro-modal-backdrop")?.classList.contains("hidden") &&
            this.grid.scrollWidth > this.grid.clientWidth + 4
        );
    },

    scrollByDelta(delta) {
        if (!this.grid) return;
        const maxScroll = Math.max(0, this.grid.scrollWidth - this.grid.clientWidth);

        if (state.lowEnd) {
            this.grid.scrollLeft = Math.max(0, Math.min(maxScroll, this.grid.scrollLeft + delta));
            this.targetX = this.grid.scrollLeft;
            return;
        }

        if (!this.rafId) this.targetX = this.grid.scrollLeft;
        this.targetX = Math.max(0, Math.min(maxScroll, this.targetX + delta));

        if (!this.rafId) {
            const animate = () => {
                if (!this.grid || state.lowEnd || state.view !== "home") {
                    this.rafId = null;
                    return;
                }
                const diff = this.targetX - this.grid.scrollLeft;
                if (Math.abs(diff) < 0.6) {
                    this.grid.scrollLeft = this.targetX;
                    this.rafId = null;
                    return;
                }
                this.grid.scrollLeft += diff * 0.16;
                this.rafId = requestAnimationFrame(animate);
            };
            this.rafId = requestAnimationFrame(animate);
        }
    },

    bindEvents() {
        if (this.bound) return;
        this.bound = true;

        window.addEventListener("wheel", e => {
            if (!this.canScrollHorizontally()) return;
            if (e.target.closest?.(".charms-pane, .metro-modal-box, textarea, select")) return;

            const factor = e.deltaMode === 1 ? 32 : (e.deltaMode === 2 ? window.innerWidth * 0.8 : 1);
            const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (!rawDelta) return;

            e.preventDefault();
            this.scrollByDelta(rawDelta * factor * 1.15);
        }, { passive: false });

        document.addEventListener("keydown", e => {
            if (!this.canScrollHorizontally()) return;
            const tag = document.activeElement?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            if (e.key === "ArrowRight") {
                e.preventDefault();
                this.scrollByDelta(360);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.scrollByDelta(-360);
            }
        });
    },

    init() {
        this.setupGroups();
        this.bindEvents();
        document.body.classList.toggle("metro-home-desktop", state.view === "home");
    }
};

/* =====================================================================
   12. BAŞLATMA (DOMContentLoaded)
   ===================================================================== */
function syncRouteFromHash() {
    const hash = window.location.hash.replace(/^#/, "").trim().toLowerCase();
    if (hash === "blog") {
        window.location.href = "blog.html";
    } else if (VALID_SUBPAGES.has(hash)) {
        navigateTo(hash, false);
    } else if (!hash && state.view !== "home") {
        navigateTo("home", false);
    }
}

function initApp() {
    loadConfigFromStorage();
    state.lang = store.get("seb_site_lang", "tr") === "en" ? "en" : "tr";
    state.weatherTemp = SITE_CONFIG.weather.fallbackTemp;
    state.weatherFeels = SITE_CONFIG.weather.fallbackTemp - 2;
    state.weatherDesc = wmoToText(state.weatherCode);
    state.theme = store.get("seb_visual_theme", SITE_CONFIG.defaultTheme);
    state.accentHex = store.get("seb_metro_accent", SITE_CONFIG.defaultAccent);
    state.todayHadithIdx = state.hadithIdx = (getIstanbulDayOfYear() - 1) % FORTY_HADITHS.length;

    const cmp = SITE_CONFIG.evCompare || {};
    state.evTripKm = cmp.defaultDistanceKm ?? 320;
    state.evIceL100 = cmp.iceConsumptionPer100 ?? 5.8;
    state.evFuelPrice = cmp.fuelPriceTl ?? 46.50;

    canvasEngine.init();
    applyTheme(state.theme, false);
    applyAccent(state.accentHex, false);

    horizontalMetro.init();
    liveTilesEngine.init();

    const savedLow = store.get("seb_low_end_mode");
    const autoLow = matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4);
    setLowEndMode(savedLow === "1" || savedLow === "0" ? savedLow === "1" : Boolean(autoLow), false);

    applyLanguage(state.lang, false);
    bindMetroTilt();
    syncRouteFromHash();

    fetchKayseriWeather(false);
    detectClientHardwareAndBrowser();
    fetchVisitorIpInfo(false);
    measureVisitorLatency(false);

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            canvasEngine.resize();
            state.sysInfo.viewport = `${innerWidth} × ${innerHeight} px`;
            if (state.view === "sysinfo") renderSubpage();
        }, 150);
    }, { passive: true });

    window.addEventListener("hashchange", syncRouteFromHash);
    window.addEventListener("online", () => { state.sysInfo.online = true; if (state.view === "sysinfo") renderSubpage(); });
    window.addEventListener("offline", () => { state.sysInfo.online = false; if (state.view === "sysinfo") renderSubpage(); });

    window.addEventListener("storage", e => {
        if (e.key === "seb_site_lang" && e.newValue) applyLanguage(e.newValue, false);
        if (e.key === "seb_visual_theme" && e.newValue) applyTheme(e.newValue, false);
        if (e.key === "seb_metro_accent" && e.newValue) applyAccent(e.newValue, false);
        if (e.key === "seb_low_end_mode" && e.newValue !== null) setLowEndMode(e.newValue === "1", false);
    });

    setInterval(updateLiveClock, 1000);

    document.addEventListener("keydown", e => {
        const key = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && key === "k") {
            e.preventDefault();
            openSearchCharm();
        } else if (e.altKey && key === "c") {
            e.preventDefault();
            state.charmsOpen ? closeCharms() : openCharms("theme");
        } else if (e.altKey && key === "a") {
            e.preventDefault();
            openAdminModal();
        } else if (e.key === "Escape") {
            if (!$("metro-modal-backdrop").classList.contains("hidden")) closeMetroModal();
            else if (state.charmsOpen) closeCharms();
            else if (state.view !== "home") handleBackAction();
        }
    });
}

document.addEventListener("DOMContentLoaded", initApp);
/* =====================================================================
   sabanefebenzil.dev — Bağımsız Blog Modülü (blog.html)
   Ortak data.js ve style.css ile senkronize çalışır. (TR / EN Destekli)
   ===================================================================== */

const $ = id => document.getElementById(id);
const $$ = (sel, root = document) => root.querySelectorAll(sel);
const clone = obj => JSON.parse(JSON.stringify(obj));

const store = {
    get(k, fallback = null) { try { const v = localStorage.getItem(k); return v !== null ? v : fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

const escapeHtml = str => String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* =====================================================================
   1. KONFİGÜRASYON, DİL SÖZLÜĞÜ & DURUM
   ===================================================================== */
let SITE_CONFIG = clone(DEFAULT_SITE_CONFIG);

const blogState = {
    lang: "tr",
    category: "Tümü",
    search: "",
    activePostId: null,
    theme: "harmony",
    accentHex: "#0078D7",
    lowEnd: false,
    charmsOpen: false,
    charmTab: "theme"
};

const BLOG_I18N = {
    tr: {
        navBlog: "blog", navProjects: "projeler", navGames: "oyunlar", navAbout: "hakkımda", navSetup: "setup",
        navHadis: "40 hadis", navSysinfo: "sistem & ip", navToolkit: "format & iso",
        navAndroid: "android & adb", navEv: "ev şarj", navContact: "iletişim",
        charmTheme: "Tema", charmPerf: "Hız", charmNav: "Gezin",
        searchPh: "Yazılarda ara...", noPosts: "Bu kriterde yazı bulunamadı.",
        allPosts: "Tüm Yazılar", copyLink: "Bağlantıyı Kopyala", closeReader: "Okuyucuyu Kapat",
        linkCopied: "Makale bağlantısı panoya kopyalandı.", close: "kapat",
        lowOn: "⚡ Düşük Performans: AÇIK", lowOff: "⚡ Standart",
        toastLowOn: "Düşük Performans Modu açıldı: Canvas, blur ve animasyonlar durduruldu.",
        toastLowOff: "Standart Mod açıldı: Canlı arka plan ve Metro animasyonları aktif.",
        toastTheme: "Tema değiştirildi:", toastAccent: "Vurgu rengi:",
        toastLang: "Dil değiştirildi: Türkçe",
        titleTheme: "Tema & Vurgu", visualThemes: "Görsel Temalar (6)", metroAccent: "Metro Vurgu Rengi (6)",
        titlePerf: "Performans Modu",
        perfDesc: "Düşük güçlü cihazlarda Canvas döngüsünü, bulanıklık (blur) filtrelerini ve CSS animasyonlarını tek tıkla kapatır.",
        perfBtnOff: "⚡ Düşük Performans Modunu Kapat", perfBtnOn: "⚡ Düşük Performans Modunu Aç",
        perfStatus: "Durum:", perfStateLow: "Animasyonsuz, sıfır Canvas & blur", perfStateStd: "Standart 60fps Canvas & Aero cam efektleri",
        titleNav: "Hızlı Gezinme", homeHub: "Ana Sayfa (Start Hub)",
        copyOk: "Panoya kopyalandı.", copyFail: "Kopyalama başarısız."
    },
    en: {
        navBlog: "blog", navProjects: "projects", navGames: "games", navAbout: "about", navSetup: "setup",
        navHadis: "40 hadiths", navSysinfo: "system & ip", navToolkit: "format & iso",
        navAndroid: "android & adb", navEv: "ev charge", navContact: "contact",
        charmTheme: "Theme", charmPerf: "Speed", charmNav: "Nav",
        searchPh: "Search articles...", noPosts: "No articles matched this filter.",
        allPosts: "All Articles", copyLink: "Copy Link", closeReader: "Close Reader",
        linkCopied: "Article link copied to clipboard.", close: "close",
        lowOn: "⚡ Low-End Mode: ON", lowOff: "⚡ Standard",
        toastLowOn: "Low-End Mode enabled: Canvas, blur and animations paused.",
        toastLowOff: "Standard Mode enabled: Live background and Metro animations active.",
        toastTheme: "Theme changed:", toastAccent: "Accent color:",
        toastLang: "Language switched: English",
        titleTheme: "Theme & Accent", visualThemes: "Visual Themes (6)", metroAccent: "Metro Accent Color (6)",
        titlePerf: "Performance Mode",
        perfDesc: "Disables Canvas loop, blur filters and CSS animations in one click on low-end devices.",
        perfBtnOff: "⚡ Turn Off Low-End Mode", perfBtnOn: "⚡ Turn On Low-End Mode",
        perfStatus: "Status:", perfStateLow: "No animations, zero Canvas & blur", perfStateStd: "Standard 60fps Canvas & Aero glass effects",
        titleNav: "Quick Navigation", homeHub: "Home (Start Hub)",
        copyOk: "Copied to clipboard.", copyFail: "Copy failed."
    }
};

const CAT_LABELS_EN = {
    "Tümü": "All",
    "Makine & CAD": "Mechanical & CAD",
    "Donanım": "Hardware",
    "Yazılım & ROM": "Software & ROM",
    "Genel & Otomotiv": "General & Auto"
};

const tr = key => (BLOG_I18N[blogState.lang] || BLOG_I18N.tr)[key] || key;
const catLabel = cat => blogState.lang === "en" ? (CAT_LABELS_EN[cat] || cat) : cat;

function showToast(msg) {
    const stack = $("metro-toast-stack");
    if (!stack) return;
    const toast = document.createElement("div");
    toast.className = "metro-toast";
    toast.innerHTML = `<span>${escapeHtml(msg)}</span><button type="button" style="background:none;border:none;color:rgba(255,255,255,0.68);cursor:pointer;font-size:0.7rem;">${escapeHtml(tr("close"))}</button>`;
    const close = () => toast.remove();
    toast.querySelector("button").addEventListener("click", close);
    stack.appendChild(toast);
    setTimeout(close, 3600);
}

function copyText(text, label) {
    try {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast(label || tr("copyOk")));
            return;
        }
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        showToast(ok ? (label || tr("copyOk")) : tr("copyFail"));
    } catch {
        showToast(tr("copyFail"));
    }
}

function loadConfigFromStorage() {
    SITE_CONFIG = clone(DEFAULT_SITE_CONFIG);
    const raw = store.get("seb_metro_config_v1");
    if (!raw || raw === "null") return;
    try {
        const parsed = JSON.parse(raw);
        const defaultVer = DEFAULT_SITE_CONFIG.configVersion || 0;
        const storedVer = parsed?.configVersion || 0;
        if (parsed && parsed.fullName && Array.isArray(parsed.blogPosts) && storedVer >= defaultVer) {
            SITE_CONFIG = Object.assign(clone(DEFAULT_SITE_CONFIG), parsed);
        }
    } catch {}
}

/* =====================================================================
   2. CANVAS ARKA PLAN MOTORU (SANİYE TABANLI & YAVAŞLATILMIŞ)
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
        document.addEventListener("visibilitychange", () => document.hidden ? this.stop() : (!blogState.lowEnd && this.start()));
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
        if (this.rafId || blogState.lowEnd || document.hidden) return;
        this.lastTime = 0;
        const tick = now => {
            if (blogState.lowEnd || document.hidden) { this.rafId = null; return; }
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
        const th = blogState.theme;
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
   3. DİL, TEMA, VURGU RENGİ, LOW-END MODU & CHARMS BAR
   ===================================================================== */
function applyLanguage(lang, notify = true) {
    blogState.lang = lang === "en" ? "en" : "tr";
    document.documentElement.lang = blogState.lang;
    store.set("seb_site_lang", blogState.lang);

    $$("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (key && BLOG_I18N[blogState.lang][key]) el.textContent = BLOG_I18N[blogState.lang][key];
    });

    if ($("blog-lang-label")) $("blog-lang-label").textContent = blogState.lang === "en" ? "🌐 EN" : "🌐 TR";
    if ($("blog-search-input")) $("blog-search-input").placeholder = tr("searchPh");
    if ($("blog-lowend-label")) $("blog-lowend-label").textContent = blogState.lowEnd ? tr("lowOn") : tr("lowOff");

    renderCategoryFilters();
    renderBlogList();
    if (blogState.activePostId) openArticle(blogState.activePostId, false);
    if (blogState.charmsOpen) renderCharmsPane();
    if (notify) showToast(tr("toastLang"));
}

const toggleLanguage = () => applyLanguage(blogState.lang === "tr" ? "en" : "tr", true);

function setLowEndMode(enabled, notify = true) {
    blogState.lowEnd = Boolean(enabled);
    document.body.classList.toggle("low-end", blogState.lowEnd);
    blogState.lowEnd ? canvasEngine.stop() : canvasEngine.start();

    const label = blogState.lowEnd ? tr("lowOn") : tr("lowOff");
    $("blog-lowend-btn")?.classList.toggle("active-flag", blogState.lowEnd);
    if ($("blog-lowend-label")) $("blog-lowend-label").textContent = label;

    store.set("seb_low_end_mode", blogState.lowEnd ? "1" : "0");
    if (blogState.charmsOpen) renderCharmsPane();
    if (notify) showToast(blogState.lowEnd ? tr("toastLowOn") : tr("toastLowOff"));
}

const toggleLowEndMode = () => setLowEndMode(!blogState.lowEnd, true);

function applyTheme(id, notify = true) {
    const found = VISUAL_THEMES.find(t => t.id === id) || VISUAL_THEMES[0];
    blogState.theme = found.id;
    document.body.setAttribute("data-theme", found.id);
    if ($("blog-theme-label")) $("blog-theme-label").textContent = found.short;
    store.set("seb_visual_theme", found.id);
    if (blogState.charmsOpen) renderCharmsPane();
    if (notify) showToast(`${tr("toastTheme")} ${found.name}`);
}

function cycleTheme() {
    const idx = VISUAL_THEMES.findIndex(t => t.id === blogState.theme);
    applyTheme(VISUAL_THEMES[(idx + 1) % VISUAL_THEMES.length].id, true);
}

function applyAccent(hex, notify = true) {
    const found = METRO_ACCENTS.find(c => c.hex.toLowerCase() === String(hex).toLowerCase()) || METRO_ACCENTS[0];
    blogState.accentHex = found.hex;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--accent", found.hex);
    rootStyle.setProperty("--accent-rgb", found.rgb);
    rootStyle.setProperty("--accent-light", found.light);
    store.set("seb_metro_accent", found.hex);
    if (blogState.charmsOpen) renderCharmsPane();
    if (notify) showToast(`${tr("toastAccent")} ${found.name}`);
}

function setCharmsOpen(open, tab) {
    blogState.charmsOpen = open;
    if (tab) blogState.charmTab = tab;
    $("charms-backdrop").classList.toggle("open", open);
    $("charms-drawer").classList.toggle("open", open);
    $("charms-drawer").setAttribute("aria-hidden", String(!open));
    if (open) renderCharmsPane();
}
const openCharms = (tab = "theme") => setCharmsOpen(true, tab);
const closeCharms = () => setCharmsOpen(false);
const switchCharmTab = tab => { blogState.charmTab = tab; renderCharmsPane(); };

function renderCharmsPane() {
    $$(".charm-rail-btn").forEach(b => b.classList.toggle("active", b.dataset.charm === blogState.charmTab));
    const tEl = $("charms-title"), bEl = $("charms-body");
    if (!bEl) return;

    if (blogState.charmTab === "theme") {
        tEl.textContent = tr("titleTheme");
        bEl.innerHTML = `
            <div class="metro-micro" style="margin-bottom:8px;">${escapeHtml(tr("visualThemes"))}</div>
            ${VISUAL_THEMES.map(th => `
                <button type="button" class="wp-choice-btn ${blogState.theme === th.id ? "active" : ""}" onclick="applyTheme('${th.id}')">
                    <div class="wp-preview-chip" style="background:${th.preview};"></div>
                    <div>
                        <div style="font-size:0.83rem;font-weight:600;color:#fff;">${escapeHtml(th.name)}</div>
                        <div style="font-size:0.7rem;color:rgba(255,255,255,0.68);">${escapeHtml(th.desc)}</div>
                    </div>
                </button>`).join("")}
            <div class="metro-micro" style="margin:14px 0 8px;">${escapeHtml(tr("metroAccent"))}</div>
            <div class="accent-grid">
                ${METRO_ACCENTS.map(c => `
                    <button type="button" class="accent-btn ${blogState.accentHex.toLowerCase() === c.hex.toLowerCase() ? "active" : ""}" style="background:${c.hex};" onclick="applyAccent('${c.hex}')">
                        <span>${c.name}</span><span>${blogState.accentHex.toLowerCase() === c.hex.toLowerCase() ? "✓" : ""}</span>
                    </button>`).join("")}
            </div>`;
        return;
    }

    if (blogState.charmTab === "perf") {
        tEl.textContent = tr("titlePerf");
        bEl.innerHTML = `
            <p style="font-size:0.83rem;color:rgba(255,255,255,0.82);margin-bottom:14px;">${escapeHtml(tr("perfDesc"))}</p>
            <button type="button" class="metro-btn-primary" style="width:100%;margin-bottom:14px;" onclick="toggleLowEndMode()">
                ${escapeHtml(blogState.lowEnd ? tr("perfBtnOff") : tr("perfBtnOn"))}
            </button>
            <div class="info-stripe" style="font-size:0.78rem;"><strong>${escapeHtml(tr("perfStatus"))}</strong> ${escapeHtml(blogState.lowEnd ? tr("perfStateLow") : tr("perfStateStd"))}</div>`;
        return;
    }

    tEl.textContent = tr("titleNav");
    const gamesCount = (SITE_CONFIG.games || []).length;
    const navs = [
        ["index.html", tr("homeHub")],
        ["blog.html", `${tr("navBlog")} (${SITE_CONFIG.blogPosts.length})`],
        ["index.html#projects", `${tr("navProjects")} (${SITE_CONFIG.projects.length})`],
        ["index.html#games", `${tr("navGames")} (${gamesCount})`],
        ["index.html#about", tr("navAbout")],
        ["index.html#setup", tr("navSetup")],
        ["index.html#hadis", tr("navHadis")],
        ["index.html#sysinfo", tr("navSysinfo")],
        ["index.html#toolkit", tr("navToolkit")],
        ["index.html#android", tr("navAndroid")],
        ["index.html#evcharge", tr("navEv")],
        ["index.html#contact", tr("navContact")]
    ];
    bEl.innerHTML = navs.map(([href, label]) => `
        <a href="${href}" class="wp-choice-btn" style="justify-content:space-between;">
            <span style="font-size:0.85rem;font-weight:600;text-transform:capitalize;">${escapeHtml(label)}</span><span>→</span>
        </a>`).join("");
}

/* =====================================================================
   4. KATEGORİ FİLTRELERİ, ARAMA & TAM EKRAN MAKALE OKUYUCU
   ===================================================================== */
function getBlogCategories() {
    const defaults = ["Tümü", "Makine & CAD", "Donanım", "Yazılım & ROM", "Genel & Otomotiv"];
    const extras = (SITE_CONFIG.blogPosts || []).map(p => p.category).filter(c => c && !defaults.includes(c));
    return [...defaults, ...new Set(extras)];
}

function renderCategoryFilters() {
    const el = $("blog-category-filters");
    if (!el) return;
    el.innerHTML = getBlogCategories().map(cat => `
        <button type="button" class="filter-pill ${blogState.category === cat ? "active" : ""}" onclick="setBlogCategory('${escapeHtml(cat)}')">
            ${escapeHtml(catLabel(cat))}
        </button>`).join("");
}

function setBlogCategory(cat) {
    blogState.category = cat;
    renderCategoryFilters();
    renderBlogList();
}

function renderBlogList() {
    const container = $("blog-list-container");
    if (!container) return;

    const q = blogState.search.toLowerCase().trim();
    const posts = (SITE_CONFIG.blogPosts || []).filter(p =>
        (blogState.category === "Tümü" || p.category === blogState.category) &&
        (!q || `${p.title} ${p.excerpt} ${p.content} ${p.category}`.toLowerCase().includes(q))
    );

    if (!posts.length) {
        container.innerHTML = `<div class="metro-panel"><p style="color:var(--text-secondary);">${escapeHtml(tr("noPosts"))}</p></div>`;
        return;
    }

    const byYear = {};
    for (const p of posts) {
        const yr = p.year || "2026";
        (byYear[yr] = byYear[yr] || []).push(p);
    }

    const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
    container.innerHTML = years.map(yr => `
        <div style="margin-bottom:24px;">
            <div class="year-badge-square" style="margin-bottom:12px;">${escapeHtml(yr)}</div>
            <div>
                ${byYear[yr].map(post => `
                    <article class="blog-row" onclick="openArticle('${escapeHtml(post.id)}')" role="button" tabindex="0"
                             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openArticle('${escapeHtml(post.id)}');}">
                        <div class="blog-date-tile">
                            <span class="blog-day-num">${escapeHtml(post.day)}</span>
                            <span class="blog-month-lbl">${escapeHtml(post.month)}</span>
                        </div>
                        ${post.image ? `<div class="blog-thumb-box"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/320x200/0f172a/0078D7?text=SEB+Blog'"></div>` : ""}
                        <div class="min-w-0" style="flex:1;">
                            <h3 class="blog-row-title">${escapeHtml(post.title)}</h3>
                            <p style="font-size:0.89rem;color:var(--text-secondary);margin-bottom:5px;">${escapeHtml(post.excerpt)}</p>
                            <div class="mono-sm" style="opacity:0.68;">${escapeHtml(catLabel(post.category))} · ${escapeHtml(post.year)}${post.readTime ? " · " + escapeHtml(post.readTime) : ""}</div>
                        </div>
                    </article>`).join("")}
            </div>
        </div>`).join("");
}

function openArticle(id, pushUrl = true) {
    const list = SITE_CONFIG.blogPosts || [];
    const idx = list.findIndex(b => b.id === id);
    if (idx < 0) return;

    const post = list[idx];
    const prevPost = list[idx - 1] || null;
    const nextPost = list[idx + 1] || null;

    blogState.activePostId = post.id;
    document.title = `${post.title} — sabanefebenzil.dev`;
    if ($("blog-breadcrumb")) $("blog-breadcrumb").textContent = `BLOG / ${post.day} ${post.month}`;

    if (pushUrl && history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.set("post", post.id);
        history.replaceState(null, "", url.toString());
    }

    const blocks = String(post.content || "").split(/\n\s*\n/).map(blk => {
        const t = blk.trim();
        return t.startsWith("### ") ? `<h3>${escapeHtml(t.slice(4))}</h3>` : `<p>${escapeHtml(t).replace(/\n/g, "<br>")}</p>`;
    }).join("");

    $("blog-reader-body").innerHTML = `
        <div class="row-between flex-wrap" style="padding-bottom:14px;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.16);">
            <div class="row-center" style="gap:10px;">
                <button type="button" class="win-backbutton" style="width:36px;height:36px;min-width:36px;" onclick="closeArticle()" title="Esc" aria-label="Back">←</button>
                <button type="button" class="metro-flat-btn" onclick="closeArticle()">${escapeHtml(tr("allPosts"))}</button>
                <button type="button" class="metro-flat-btn" onclick="copyArticleLink('${escapeHtml(post.id)}')">${escapeHtml(tr("copyLink"))}</button>
            </div>
            <span class="mono-sm" style="opacity:0.82;">${escapeHtml(post.day)} ${escapeHtml(post.month)} ${escapeHtml(post.year)} · ${escapeHtml(catLabel(post.category))}${post.readTime ? " · " + escapeHtml(post.readTime) : ""}</span>
        </div>
        ${post.image ? `<div class="article-cover-wrap"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" class="article-cover-img" onerror="this.onerror=null;this.src='https://placehold.co/900x400/0f172a/0078D7?text=SEB+Blog'"></div>` : ""}
        <h1 class="metro-display" style="font-size:clamp(1.7rem,3.6vw,2.5rem);margin-bottom:10px;">${escapeHtml(post.title)}</h1>
        <p style="color:var(--accent-light);font-size:1.02rem;margin-bottom:20px;">${escapeHtml(post.excerpt)}</p>
        <div class="article-prose">${blocks}</div>
        <div class="row-between flex-wrap divider-top" style="margin-top:26px;padding-top:16px;gap:10px;">
            ${prevPost ? `<button type="button" class="metro-flat-btn" onclick="openArticle('${escapeHtml(prevPost.id)}')">← ${escapeHtml(prevPost.title.slice(0, 36))}${prevPost.title.length > 36 ? "…" : ""}</button>` : "<span></span>"}
            ${nextPost ? `<button type="button" class="metro-flat-btn" onclick="openArticle('${escapeHtml(nextPost.id)}')">${escapeHtml(nextPost.title.slice(0, 36))}${nextPost.title.length > 36 ? "…" : ""} →</button>` : `<button type="button" class="metro-btn-primary" onclick="closeArticle()">${escapeHtml(tr("closeReader"))}</button>`}
        </div>`;

    const overlay = $("blog-reader-overlay");
    overlay.classList.remove("hidden");
    overlay.scrollTop = 0;
    document.body.style.overflow = "hidden";
}

function closeArticle() {
    blogState.activePostId = null;
    $("blog-reader-overlay")?.classList.add("hidden");
    document.body.style.overflow = "";
    document.title = "Blog — sabanefebenzil.dev | Şaban Efe Benzil";
    if ($("blog-breadcrumb")) $("blog-breadcrumb").textContent = "BLOG";
    if (history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete("post");
        history.replaceState(null, "", url.pathname + url.search);
    }
}

function copyArticleLink(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("post", id);
    copyText(url.toString(), tr("linkCopied"));
}

function handleBlogBack() {
    if (blogState.activePostId) closeArticle();
    else window.location.href = "index.html";
}

/* =====================================================================
   5. BAŞLATMA
   ===================================================================== */
function initBlogPage() {
    loadConfigFromStorage();

    blogState.lang = store.get("seb_site_lang", "tr") === "en" ? "en" : "tr";
    blogState.theme = store.get("seb_visual_theme", SITE_CONFIG.defaultTheme);
    blogState.accentHex = store.get("seb_metro_accent", SITE_CONFIG.defaultAccent);

    canvasEngine.init();
    applyTheme(blogState.theme, false);
    applyAccent(blogState.accentHex, false);

    const savedLow = store.get("seb_low_end_mode");
    const autoLow = matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4);
    setLowEndMode(savedLow === "1" || savedLow === "0" ? savedLow === "1" : Boolean(autoLow), false);

    applyLanguage(blogState.lang, false);

    const searchInput = $("blog-search-input");
    if (searchInput) {
        searchInput.addEventListener("input", e => {
            blogState.search = e.target.value;
            renderBlogList();
        });
    }

    const postParam = new URLSearchParams(window.location.search).get("post");
    if (postParam) openArticle(postParam, false);

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => canvasEngine.resize(), 150);
    }, { passive: true });

    window.addEventListener("storage", e => {
        if (e.key === "seb_site_lang" && e.newValue) applyLanguage(e.newValue, false);
        if (e.key === "seb_visual_theme" && e.newValue) applyTheme(e.newValue, false);
        if (e.key === "seb_metro_accent" && e.newValue) applyAccent(e.newValue, false);
        if (e.key === "seb_low_end_mode" && e.newValue !== null) setLowEndMode(e.newValue === "1", false);
        if (e.key === "seb_metro_config_v1") {
            loadConfigFromStorage();
            renderCategoryFilters();
            renderBlogList();
        }
    });

    document.addEventListener("keydown", e => {
        const key = e.key.toLowerCase();
        if (e.altKey && key === "c") { e.preventDefault(); blogState.charmsOpen ? closeCharms() : openCharms("theme"); }
        else if (e.key === "Escape") {
            if (blogState.charmsOpen) closeCharms();
            else if (blogState.activePostId) closeArticle();
            else window.location.href = "index.html";
        }
    });
}

document.addEventListener("DOMContentLoaded", initBlogPage);
/**
 * KOÜ Yemekhanem - Application Logic
 * Implements State Management, Local Storage, Review System, character counter, PWA Install and Statistics.
 */

// --- SEED & MOCK DATABASE ---
const INITIAL_FOOD_DATABASE = {
    // Menus indexed by date (YYYY-MM-DD)
    menus: {
        "2026-06-08": { // Today
            soup: { name: "Süzme Mercimek Çorbası", image: "" },
            main: { name: "İzmir Köfte", image: "" },
            side: { name: "Pirinç Pilavı", image: "" },
            extra: { name: "Kemalpaşa Tatlısı", image: "" }
        },
        "2026-06-07": {
            soup: { name: "Ezogelin Çorbası", image: "" },
            main: { name: "Tavuk Sote", image: "" },
            side: { name: "Bulgur Pilavı", image: "" },
            extra: { name: "Mevsim Meyvesi (Karpuz)", image: "" }
        },
        "2026-06-05": {
            soup: { name: "Yayla Çorbası", image: "" },
            main: { name: "Fırın Baget", image: "" },
            side: { name: "Soslu Makarna", image: "" },
            extra: { name: "Yoğurt", image: "" }
        },
        "2026-06-04": {
            soup: { name: "Domates Çorbası", image: "" },
            main: { name: "Orman Kebabı", image: "" },
            side: { name: "Pirinç Pilavı", image: "" },
            extra: { name: "Kakaolu Puding", image: "" }
        },
        "2026-06-03": {
            soup: { name: "Süzme Mercimek Çorbası", image: "" },
            main: { name: "Karnıyarık", image: "" },
            side: { name: "Bulgur Pilavı", image: "" },
            extra: { name: "Cacık", image: "" }
        },
        "2026-06-02": {
            soup: { name: "Tarhana Çorbası", image: "" },
            main: { name: "Tavuklu Şnitzel", image: "" },
            side: { name: "Fırın Patates", image: "" },
            extra: { name: "Meyve Suyu", image: "" }
        },
        "2026-06-01": {
            soup: { name: "Ezogelin Çorbası", image: "" },
            main: { name: "Kuru Fasulye", image: "" },
            side: { name: "Pirinç Pilavı", image: "" },
            extra: { name: "Kemalpaşa Tatlısı", image: "" }
        },
        // May menus for richer frequency stats
        "2026-05-28": {
            soup: { name: "Süzme Mercimek Çorbası", image: "" },
            main: { name: "İzmir Köfte", image: "" },
            side: { name: "Soslu Makarna", image: "" },
            extra: { name: "Yoğurt", image: "" }
        },
        "2026-05-27": {
            soup: { name: "Domates Çorbası", image: "" },
            main: { name: "Karnıyarık", image: "" },
            side: { name: "Pirinç Pilavı", image: "" },
            extra: { name: "Kemalpaşa Tatlısı", image: "" }
        },
        "2026-05-26": {
            soup: { name: "Ezogelin Çorbası", image: "" },
            main: { name: "Tavuk Sote", image: "" },
            side: { name: "Bulgur Pilavı", image: "" },
            extra: { name: "Mevsim Meyvesi (Karpuz)", image: "" }
        },
        "2026-05-25": {
            soup: { name: "Yayla Çorbası", image: "" },
            main: { name: "Kuru Fasulye", image: "" },
            side: { name: "Pirinç Pilavı", image: "" },
            extra: { name: "Cacık", image: "" }
        }
    },
    // Reviews database indexed by food name (normalized)
    reviews: {
        "süzme mercimek çorbası": [
            { rating: 5, comment: "Harika kıvamı var, sıcak servis ediliyor.", date: "2026-06-08", author: "21*****45" },
            { rating: 4, comment: "Limonu biraz azdı ama lezzeti yerinde.", date: "2026-06-03", author: "22*****91" }
        ],
        "izmir köfte": [
            { rating: 5, comment: "Köfteler yumuşacık ve patatesler tam pişmiş, favorim!", date: "2026-06-08", author: "20*****12" },
            { rating: 4, comment: "Porsiyon biraz daha büyük olabilirdi ancak lezzetli.", date: "2026-05-28", author: "21*****88" }
        ],
        "pirinç pilavı": [
            { rating: 4, comment: "Tane tane dökülüyor, tuzu kıvamında.", date: "2026-06-08", author: "21*****45" },
            { rating: 3, comment: "Biraz yağlıydı ama güzel.", date: "2026-06-04", author: "23*****02" }
        ],
        "kemalpaşa tatlısı": [
            { rating: 5, comment: "Şerbeti tam çekmiş, üzerindeki hindistan cevizi yakışmış.", date: "2026-06-08", author: "22*****91" },
            { rating: 5, comment: "Çok tatlı sevmeme rağmen baymadı, başarılı.", date: "2026-06-01", author: "20*****12" }
        ],
        "karnıyarık": [
            { rating: 4, comment: "Patlıcanlar acı değildi, kıyması boldu.", date: "2026-06-03", author: "21*****88" }
        ]
    }
};

// --- FIREBASE CONFIGURATION ---
// Defaulting to the existing Firebase project config from caritakip
const firebaseConfig = {
  apiKey: "AIzaSyBYWzRUj4V_juJOn02UnM-jw6Az6v8kfzw",
  authDomain: "caritakip-a0db2.firebaseapp.com",
  databaseURL: "https://caritakip-a0db2-default-rtdb.firebaseio.com",
  projectId: "caritakip-a0db2",
  storageBucket: "caritakip-a0db2.firebasestorage.app",
  messagingSenderId: "625888714175",
  appId: "1:625888714175:web:106657023af149de0b550a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firebaseDb = firebase.database();
const dbRef = firebaseDb.ref('kouyemekhanem');

// Global App State
let db = INITIAL_FOOD_DATABASE;
let currentSelectedDate = "";
let currentReviewFood = { category: "", name: "", date: "" };
let activeRating = 0;
let deferredPrompt = null;
let currentUser = null;
let generatedAuthCode = "";
let pendingAuthEmail = "";

// --- INITIALIZATION ---
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker registered successfully.", reg.scope))
            .catch(err => console.error("Service Worker registration failed.", err));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initDatabase();
    initAuth();
    setupDatePickers();
    setupNavigation();
    setupFormPreviews();
    setupReviewModal();
    setupPWAInstall();
    
    // Load Today's Menu initially
    const todayStr = getLocalDateString(new Date());
    document.getElementById("menu-date-select").value = todayStr;
    currentSelectedDate = todayStr;
    loadMenu(todayStr);
    
    // Load stats configuration
    populateStatsMonths();
    const statsSelect = document.getElementById("stats-month-select");
    if (statsSelect) {
        statsSelect.addEventListener("change", updateStatistics);
    }
    updateStatistics();
});

// Load DB from Firebase Realtime Database
function initDatabase() {
    // Real-time synchronization
    dbRef.on('value', (snapshot) => {
        const firebaseData = snapshot.val();
        if (firebaseData) {
            // Parse reviews object to arrays of reviews
            const parsedReviews = {};
            if (firebaseData.reviews) {
                Object.entries(firebaseData.reviews).forEach(([foodName, reviewList]) => {
                    if (reviewList) {
                        parsedReviews[foodName] = Object.values(reviewList);
                    }
                });
            }
            db = {
                menus: firebaseData.menus || {},
                reviews: parsedReviews
            };
        } else {
            // Seed database to Firebase if database is completely empty
            db = INITIAL_FOOD_DATABASE;
            dbRef.set(INITIAL_FOOD_DATABASE);
        }

        // Refresh UI components
        populateStatsMonths();
        loadMenu(currentSelectedDate);
        updateStatistics();
    }, (error) => {
        console.error("Firebase connection error, falling back to local storage:", error);
        // Offline / Error Fallback to LocalStorage
        const savedDB = localStorage.getItem("kou_yemekhanem_db");
        if (savedDB) {
            try {
                db = JSON.parse(savedDB);
            } catch (e) {
                db = INITIAL_FOOD_DATABASE;
            }
        } else {
            db = INITIAL_FOOD_DATABASE;
        }
        loadMenu(currentSelectedDate);
        updateStatistics();
    });
}

// Keep local backup as fallback in case Firebase is offline
function saveDBToLocalStorage() {
    localStorage.setItem("kou_yemekhanem_db", JSON.stringify(db));
}

// Convert native date to Local YYYY-MM-DD
function getLocalDateString(date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
}

// Format date for visual display (e.g. "8 Haziran Pazartesi")
function formatVisualDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    return date.toLocaleDateString('tr-TR', options);
}

// --- NAVIGATION & TABS ---
function setupNavigation() {
    const tabs = document.querySelectorAll(".nav-tab");
    const contents = document.querySelectorAll(".tab-content");
    const progressBar = document.querySelector(".progress-bar");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");
            
            // Progress bar animation
            progressBar.style.width = "40%";
            setTimeout(() => { progressBar.style.width = "100%"; }, 150);
            setTimeout(() => { progressBar.style.width = "0%"; }, 500);

            // Active Tab UI
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Active Tab Content
            contents.forEach(c => {
                c.classList.remove("active-content");
                if (c.id === targetTab) {
                    c.classList.add("active-content");
                }
            });

            // Specific Tab Actions
            if (targetTab === "tab-stats") {
                updateStatistics();
            } else if (targetTab === "tab-add") {
                // Set default date for menu entry to today
                document.getElementById("form-menu-date").value = getLocalDateString(new Date());
            }
        });
    });

    // Trigger Add Tab from Empty State link
    document.querySelectorAll(".trigger-add-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            const addTabBtn = document.querySelector('[data-tab="tab-add"]');
            if (addTabBtn) addTabBtn.click();
        });
    });
}

// --- MENU DISPLAY AND INTERACTION ---
function setupDatePickers() {
    const dateInput = document.getElementById("menu-date-select");
    const prevBtn = document.getElementById("prev-date-btn");
    const nextBtn = document.getElementById("next-date-btn");

    dateInput.addEventListener("change", (e) => {
        currentSelectedDate = e.target.value;
        loadMenu(currentSelectedDate);
    });

    prevBtn.addEventListener("click", () => {
        adjustDate(-1);
    });

    nextBtn.addEventListener("click", () => {
        adjustDate(1);
    });
}

function adjustDate(daysOffset) {
    const dateInput = document.getElementById("menu-date-select");
    const currentDate = new Date(dateInput.value);
    currentDate.setDate(currentDate.getDate() + daysOffset);
    const newDateStr = getLocalDateString(currentDate);
    dateInput.value = newDateStr;
    currentSelectedDate = newDateStr;
    loadMenu(newDateStr);
}

function loadMenu(dateStr) {
    const menuGrid = document.getElementById("food-cards-grid");
    const emptyState = document.getElementById("empty-menu-state");
    const dayLabel = document.getElementById("day-display-name");
    
    // Set Day Display Name
    const todayStr = getLocalDateString(new Date());
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
    const tomorrowStr = getLocalDateString(new Date(Date.now() + 86400000));

    if (dateStr === todayStr) {
        dayLabel.textContent = "Bugün (" + formatVisualDate(dateStr) + ")";
    } else if (dateStr === yesterdayStr) {
        dayLabel.textContent = "Dün (" + formatVisualDate(dateStr) + ")";
    } else if (dateStr === tomorrowStr) {
        dayLabel.textContent = "Yarın (" + formatVisualDate(dateStr) + ")";
    } else {
        dayLabel.textContent = formatVisualDate(dateStr);
    }

    const menu = db.menus[dateStr];
    menuGrid.innerHTML = "";

    if (!menu) {
        menuGrid.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    menuGrid.style.display = "grid";
    emptyState.style.display = "none";

    // Categories
    const categories = [
        { key: "soup", label: "Çorba", badgeClass: "badge-soup", icon: "fa-soup" },
        { key: "main", label: "Ana Yemek", badgeClass: "badge-main", icon: "fa-bowl-food" },
        { key: "side", label: "Yardımcı Yemek", badgeClass: "badge-side", icon: "fa-wheat-awn" },
        { key: "extra", label: "Tatlı / Meyve / Ek", badgeClass: "badge-extra", icon: "fa-cookie-bite" }
    ];

    categories.forEach(cat => {
        const foodItem = menu[cat.key];
        if (foodItem) {
            const cardHTML = buildFoodCard(foodItem, cat, dateStr);
            menuGrid.appendChild(cardHTML);
        }
    });
}

function buildFoodCard(foodItem, cat, dateStr) {
    const normalizedName = foodItem.name.trim().toLowerCase();
    const reviews = db.reviews[normalizedName] || [];
    
    // Calculate Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
        : "Puan Yok";

    const card = document.createElement("div");
    card.className = "food-card";
    
    // Build image section
    let imageHTML = "";
    if (foodItem.image) {
        imageHTML = `<img src="${foodItem.image}" alt="${foodItem.name}" loading="lazy">`;
    } else {
        // SVG or Icon fallback
        imageHTML = `
            <div class="food-img-fallback">
                <i class="fa-solid ${getCategoryIcon(cat.key)}"></i>
                <span>Görsel Yüklenmedi</span>
            </div>
        `;
    }

    // Build star display elements
    let starsHTML = "";
    if (totalReviews > 0) {
        const score = parseFloat(avgRating);
        for (let i = 1; i <= 5; i++) {
            if (score >= i) {
                starsHTML += `<i class="fa-solid fa-star"></i>`;
            } else if (score >= i - 0.5) {
                starsHTML += `<i class="fa-solid fa-star-half-stroke"></i>`;
            } else {
                starsHTML += `<i class="fa-regular fa-star"></i>`;
            }
        }
    } else {
        starsHTML = `
            <i class="fa-regular fa-star"></i>
            <i class="fa-regular fa-star"></i>
            <i class="fa-regular fa-star"></i>
            <i class="fa-regular fa-star"></i>
            <i class="fa-regular fa-star"></i>
        `;
    }

    // Build comments list preview HTML
    let commentsHTML = "";
    if (totalReviews > 0) {
        commentsHTML = `
            <div class="comments-preview-container">
                ${reviews.slice(-2).reverse().map(rev => `
                    <div class="preview-comment-item">
                        <div class="comment-meta">
                            <span class="comment-author"><i class="fa-solid fa-user-graduate"></i> ${escapeHtml(rev.author || "Öğrenci")}</span>
                            <span class="comment-rating">${'<i class="fa-solid fa-star"></i>'.repeat(rev.rating)}</span>
                        </div>
                        <p class="comment-text">"${escapeHtml(rev.comment)}"</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    card.innerHTML = `
        <div class="food-img-wrapper">
            <span class="badge ${cat.badgeClass}">${cat.label}</span>
            ${imageHTML}
        </div>
        <div class="food-card-body">
            <h3 class="food-title">${escapeHtml(foodItem.name)}</h3>
            <div class="rating-display">
                <div class="stars-wrapper">${starsHTML}</div>
                <span class="rating-value">${avgRating}</span>
                <span class="rating-count">(${totalReviews} oy)</span>
            </div>
            ${commentsHTML}
            <div class="review-action-area">
                <button class="btn btn-outline btn-review-trigger" data-food-name="${escapeHtml(foodItem.name)}" data-category="${cat.label}" data-category-key="${cat.key}">
                    <i class="fa-solid fa-star-half-stroke"></i> Değerlendir
                </button>
            </div>
        </div>
    `;

    // Add event listener to rating button
    card.querySelector(".btn-review-trigger").addEventListener("click", () => {
        openReviewModal(cat.label, foodItem.name, dateStr, cat.badgeClass);
    });

    return card;
}

function getCategoryIcon(categoryKey) {
    switch(categoryKey) {
        case "soup": return "fa-soup";
        case "main": return "fa-bowl-food";
        case "side": return "fa-wheat-awn";
        default: return "fa-cookie-bite";
    }
}

// --- FILE UPLOADS PREVIEWS ---
function setupFormPreviews() {
    const fileInputs = [
        { fileId: "food-soup-file", previewId: "soup-preview" },
        { fileId: "food-main-file", previewId: "main-preview" },
        { fileId: "food-side-file", previewId: "side-preview" },
        { fileId: "food-extra-file", previewId: "extra-preview" }
    ];

    fileInputs.forEach(item => {
        const input = document.getElementById(item.fileId);
        const preview = document.getElementById(item.previewId);

        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                    showToast("Görsel boyutu 2MB'tan küçük olmalıdır.", "error");
                    input.value = "";
                    preview.innerHTML = "Henüz görsel yüklenmedi";
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `
                        <img src="${event.target.result}" class="preview-thumb" alt="Yemek önizleme">
                        <span class="preview-name">${escapeHtml(file.name)} (${(file.size/1024).toFixed(0)} KB)</span>
                    `;
                    // Store the base64 string on the element data attribute
                    input.dataset.base64 = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = "Henüz görsel yüklenmedi";
                delete input.dataset.base64;
            }
        });
    });

    // Handle form submit
    const menuForm = document.getElementById("add-menu-form");
    menuForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            showToast("Menü eklemek için önce giriş yapmalısınız.", "warning");
            openAuthModal();
            return;
        }
        
        const date = document.getElementById("form-menu-date").value;
        const soupName = document.getElementById("food-soup-name").value.trim();
        const soupImg = document.getElementById("food-soup-file").dataset.base64 || "";

        const mainName = document.getElementById("food-main-name").value.trim();
        const mainImg = document.getElementById("food-main-file").dataset.base64 || "";

        const sideName = document.getElementById("food-side-name").value.trim();
        const sideImg = document.getElementById("food-side-file").dataset.base64 || "";

        const extraName = document.getElementById("food-extra-name").value.trim();
        const extraImg = document.getElementById("food-extra-file").dataset.base64 || "";

        if (!date || !soupName || !mainName || !sideName || !extraName) {
            showToast("Lütfen tüm alanları doldurun.", "warning");
            return;
        }

        // Save to Firebase Database
        dbRef.child('menus').child(date).set({
            soup: { name: soupName, image: soupImg },
            main: { name: mainName, image: mainImg },
            side: { name: sideName, image: sideImg },
            extra: { name: extraName, image: extraImg }
        }).then(() => {
            showToast(`${formatVisualDate(date)} menüsü başarıyla kaydedildi!`, "success");
        }).catch((err) => {
            console.error("Firebase write error:", err);
            showToast("Menü kaydedilirken bir hata oluştu.", "error");
        });
        
        // Reset form and UI immediately (optimistic UI update)
        menuForm.reset();
        fileInputs.forEach(item => {
            document.getElementById(item.previewId).innerHTML = "Henüz görsel yüklenmedi";
            delete document.getElementById(item.fileId).dataset.base64;
        });

        // Navigate to menu tab
        document.getElementById("menu-date-select").value = date;
        currentSelectedDate = date;
        
        const menuTabBtn = document.querySelector('[data-tab="tab-menu"]');
        if (menuTabBtn) menuTabBtn.click();
    });
}

// --- RATING & COMMENT MODAL SYSTEM ---
function setupReviewModal() {
    const modal = document.getElementById("review-modal");
    const closeBtn = document.getElementById("close-modal-btn");
    const cancelBtn = document.getElementById("cancel-review-btn");
    const form = document.getElementById("review-form");
    const textarea = document.getElementById("review-comment");
    const charCounter = document.getElementById("char-counter");
    const stars = document.querySelectorAll("#modal-star-selector i");
    const ratingExp = document.getElementById("rating-explanation");
    const submitBtn = document.getElementById("submit-review-btn");

    const explanations = {
        0: "Puan seçin",
        1: "Çok Kötü 🤢",
        2: "Kötü 😕",
        3: "Orta / İdare Eder 🙂",
        4: "Güzel 😋",
        5: "Harika! Çok Lezzetli 😍"
    };

    // Close Actions
    const closeModal = () => {
        modal.style.display = "none";
        form.reset();
        resetStars();
        charCounter.textContent = "0 / 100";
        charCounter.className = "char-counter";
        submitBtn.disabled = true;
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Star Selection
    stars.forEach(star => {
        star.addEventListener("click", () => {
            activeRating = parseInt(star.getAttribute("data-rating"));
            updateStarUI(activeRating);
            checkSubmitValidity();
        });

        star.addEventListener("mouseover", () => {
            const hoverVal = parseInt(star.getAttribute("data-rating"));
            updateStarUI(hoverVal, true);
        });

        star.addEventListener("mouseout", () => {
            updateStarUI(activeRating);
        });
    });

    function resetStars() {
        activeRating = 0;
        stars.forEach(s => {
            s.className = "fa-regular fa-star";
        });
        ratingExp.textContent = explanations[0];
    }

    function updateStarUI(val, isHover = false) {
        stars.forEach(s => {
            const starVal = parseInt(s.getAttribute("data-rating"));
            if (starVal <= val) {
                s.className = "fa-solid fa-star";
            } else {
                s.className = "fa-regular fa-star";
            }
        });
        ratingExp.textContent = explanations[val];
        if (isHover) {
            ratingExp.style.color = "var(--primary)";
        } else {
            ratingExp.style.color = "var(--text-muted)";
        }
    }

    // Comment 100 character restriction logic
    textarea.addEventListener("input", (e) => {
        const len = e.target.value.length;
        charCounter.textContent = `${len} / 100`;

        // Character classes and shake animations
        if (len >= 100) {
            charCounter.className = "char-counter char-danger";
        } else if (len >= 85) {
            charCounter.className = "char-counter char-warning";
        } else {
            charCounter.className = "char-counter";
        }
        checkSubmitValidity();
    });

    function checkSubmitValidity() {
        const commentVal = textarea.value.trim();
        if (activeRating > 0 && commentVal.length > 0 && commentVal.length <= 100) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    // Form submit review
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const comment = textarea.value.trim();
        
        if (activeRating === 0 || comment.length === 0 || comment.length > 100) {
            return;
        }

        const normalizedName = currentReviewFood.name.trim().toLowerCase();
        
        // Add review to Firebase Database
        dbRef.child('reviews').child(normalizedName).push({
            rating: activeRating,
            comment: comment,
            date: getLocalDateString(new Date()),
            author: currentUser ? currentUser.maskedId : "Öğrenci"
        }).then(() => {
            showToast("Değerlendirmeniz başarıyla kaydedildi!", "success");
        }).catch((err) => {
            console.error("Firebase write error:", err);
            showToast("Yorum gönderilirken bir hata oluştu.", "error");
        });

        closeModal();
    });
}

function openReviewModal(categoryLabel, foodName, dateStr, badgeClass) {
    if (!currentUser) {
        showToast("Yemek değerlendirmek ve yorum yapmak için önce giriş yapmalısınız.", "warning");
        openAuthModal();
        return;
    }

    const modal = document.getElementById("review-modal");
    const categoryBadge = document.getElementById("modal-food-category");
    const foodNameEl = document.getElementById("modal-food-name");

    currentReviewFood = { category: categoryLabel, name: foodName, date: dateStr };
    
    // UI details
    categoryBadge.className = "badge " + badgeClass;
    categoryBadge.textContent = categoryLabel;
    foodNameEl.textContent = foodName;

    // Reset and Show modal
    modal.style.display = "flex";
    
    // Focus comment
    setTimeout(() => {
        document.getElementById("review-comment").focus();
    }, 150);
}

// --- STATISTICS CALCULATIONS ---
function populateStatsMonths() {
    const selector = document.getElementById("stats-month-select");
    if (!selector) return;

    // Preserve the current selection if any
    const previousSelection = selector.value;
    selector.innerHTML = "";

    // Months translation
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    // Find all distinct months in our database menus
    const monthsSet = new Set();
    Object.keys(db.menus).forEach(dateStr => {
        const parts = dateStr.split("-"); // [YYYY, MM, DD]
        if (parts.length === 3) {
            monthsSet.add(`${parts[0]}-${parts[1]}`); // "YYYY-MM"
        }
    });

    // Ensure current month is always in the list
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(currentMonthStr);

    // Sort months descending
    const sortedMonths = Array.from(monthsSet).sort().reverse();

    sortedMonths.forEach(mStr => {
        const parts = mStr.split("-");
        const year = parts[0];
        const monthIndex = parseInt(parts[1]) - 1;
        const option = document.createElement("option");
        option.value = mStr;
        option.textContent = `${monthNames[monthIndex]} ${year}`;
        selector.appendChild(option);
    });

    // Restore previous selection if it exists in the new list
    if (previousSelection && sortedMonths.includes(previousSelection)) {
        selector.value = previousSelection;
    }
}

function updateStatistics() {
    const selectedMonth = document.getElementById("stats-month-select").value; // YYYY-MM
    const freqTableBody = document.getElementById("frequency-table-body");
    const popTableBody = document.getElementById("popularity-table-body");

    // Clear tables
    freqTableBody.innerHTML = "";
    popTableBody.innerHTML = "";

    let totalMealsCount = 0;
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;
    let totalCommentsCount = 0;

    // Map to count frequencies: { normalizedName: { name, categoryKey, count } }
    const foodFrequency = {};

    // Filter menus by selected month
    Object.entries(db.menus).forEach(([dateStr, menu]) => {
        if (dateStr.startsWith(selectedMonth)) {
            const categories = [
                { key: "soup", label: "Çorba" },
                { key: "main", label: "Ana Yemek" },
                { key: "side", label: "Yardımcı Yemek" },
                { key: "extra", label: "Tatlı / Meyve / Ek" }
            ];

            categories.forEach(cat => {
                const food = menu[cat.key];
                if (food && food.name) {
                    totalMealsCount++;
                    const name = food.name.trim();
                    const norm = name.toLowerCase();

                    if (!foodFrequency[norm]) {
                        foodFrequency[norm] = {
                            name: name,
                            category: cat.label,
                            count: 0
                        };
                    }
                    foodFrequency[norm].count++;
                }
            });
        }
    });

    // Populate data for frequency table and gather ratings
    const foodsList = Object.values(foodFrequency);

    foodsList.forEach(food => {
        const norm = food.name.toLowerCase();
        const reviews = db.reviews[norm] || [];
        
        let avgRating = 0;
        let ratingCount = 0;
        
        reviews.forEach(rev => {
            // Count total comment count (all reviews)
            if (rev.comment && rev.comment.trim().length > 0) {
                totalCommentsCount++;
            }
            // Count ratings
            totalRatingsSum += rev.rating;
            totalRatingsCount++;
            
            ratingCount++;
            avgRating += rev.rating;
        });

        food.avgRating = ratingCount > 0 ? (avgRating / ratingCount) : null;
        food.ratingCount = ratingCount;
    });

    // Sort by count descending for frequency table
    const sortedByFrequency = [...foodsList].sort((a, b) => b.count - a.count);

    // Render Frequency Table
    if (sortedByFrequency.length === 0) {
        freqTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Bu ay için veri bulunmamaktadır.</td></tr>`;
    } else {
        sortedByFrequency.forEach(food => {
            // Determine frequency degree label
            let freqBadge = "";
            if (food.count >= 4) {
                freqBadge = `<span class="frequency-meter freq-high">Sık Çıkan (${food.count} Kez)</span>`;
            } else if (food.count >= 2) {
                freqBadge = `<span class="frequency-meter freq-medium">Normal (${food.count} Kez)</span>`;
            } else {
                freqBadge = `<span class="frequency-meter freq-low">Seyrek (${food.count} Kez)</span>`;
            }

            const ratingDisplay = food.avgRating !== null 
                ? `<span class="comment-rating"><i class="fa-solid fa-star"></i></span> <strong>${food.avgRating.toFixed(1)}</strong>` 
                : `<span style="color: var(--text-muted); font-size:12px;">Puan Yok</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${escapeHtml(food.name)}</strong></td>
                <td>${food.category}</td>
                <td>${food.count} gün</td>
                <td>${ratingDisplay}</td>
                <td>${freqBadge}</td>
            `;
            freqTableBody.appendChild(tr);
        });
    }

    // Sort by average rating descending, only showing those with ratings
    const sortedByRating = foodsList
        .filter(food => food.avgRating !== null)
        .sort((a, b) => b.avgRating - a.avgRating);

    // Render Popularity Table
    if (sortedByRating.length === 0) {
        popTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Henüz puanlanmış yemek bulunmamaktadır.</td></tr>`;
    } else {
        sortedByRating.slice(0, 10).forEach(food => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${escapeHtml(food.name)}</strong></td>
                <td>${food.category}</td>
                <td><span class="comment-rating">${'<i class="fa-solid fa-star"></i>'.repeat(Math.round(food.avgRating))}</span> <strong>${food.avgRating.toFixed(1)}</strong></td>
                <td>${food.ratingCount} oylama</td>
            `;
            popTableBody.appendChild(tr);
        });
    }

    // Update Quick Stat Cards
    document.getElementById("stat-total-meals").textContent = Object.keys(foodFrequency).length;
    document.getElementById("stat-total-comments").textContent = totalCommentsCount;

    const overallAvg = totalRatingsCount > 0 ? (totalRatingsSum / totalRatingsCount).toFixed(1) : "0.0";
    document.getElementById("stat-avg-rating").textContent = overallAvg;
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Remove toast after duration
    setTimeout(() => {
        toast.style.animation = "slideInRight var(--transition-normal) reverse";
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// --- PWA INSTALLATION SYSTEM ---
function setupPWAInstall() {
    const installBtn = document.getElementById("pwa-install-btn");

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        installBtn.style.display = "inline-flex";
    });

    installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again
        deferredPrompt = null;
        // Hide our install button
        installBtn.style.display = "none";
    });

    window.addEventListener("appinstalled", () => {
        // Hide the app-provided install promotion
        installBtn.style.display = "none";
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        showToast("KOÜ Yemekhanem bilgisayarınıza başarıyla kuruldu!", "success");
    });
}

// Helper: Escape HTML
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// --- AUTHENTICATION & SESSION MANAGEMENT ---
function initAuth() {
    // Load user from localStorage
    const savedUser = localStorage.getItem("kou_currentUser");
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (e) {
            currentUser = null;
        }
    }
    
    updateHeaderProfile();
    setupAuthListeners();
}

function updateHeaderProfile() {
    const profileArea = document.getElementById("user-profile-area");
    if (!profileArea) return;
    
    if (currentUser) {
        profileArea.innerHTML = `
            <div class="profile-badge">
                <i class="fa-solid fa-user-graduate"></i>
                <span>${escapeHtml(currentUser.maskedId)}</span>
            </div>
            <button id="header-logout-btn" class="btn-logout">
                <i class="fa-solid fa-right-from-bracket"></i> Çıkış Yap
            </button>
        `;
        
        // Bind logout event
        document.getElementById("header-logout-btn").addEventListener("click", handleLogout);
    } else {
        profileArea.innerHTML = `
            <button id="header-login-btn" class="btn btn-primary">
                <i class="fa-solid fa-right-to-bracket"></i> Giriş Yap
            </button>
        `;
        
        // Bind login event
        document.getElementById("header-login-btn").addEventListener("click", openAuthModal);
    }
}

function openAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.style.display = "flex";
    
    // Reset forms
    document.getElementById("auth-email-form").style.display = "block";
    document.getElementById("auth-code-form").style.display = "none";
    document.getElementById("auth-email").value = "";
    document.getElementById("auth-code").value = "";
    document.getElementById("email-simulator-box").style.display = "none";
    
    setTimeout(() => {
        document.getElementById("auth-email").focus();
    }, 150);
}

function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.style.display = "none";
    document.getElementById("email-simulator-box").style.display = "none";
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem("kou_currentUser");
    updateHeaderProfile();
    showToast("Başarıyla çıkış yapıldı.", "success");
    loadMenu(currentSelectedDate); // Re-render menu
}

function maskStudentNumber(email) {
    const localPart = email.split('@')[0].trim();
    // Check if local part is a student number (all digits)
    if (/^\d+$/.test(localPart)) {
        if (localPart.length >= 4) {
            // First 2 digits + stars + last 2 digits
            return localPart.slice(0, 2) + '*'.repeat(localPart.length - 4) + localPart.slice(-2);
        }
        return localPart;
    } else {
        // Staff/Teacher name masking (e.g. ahmet.yilmaz -> ah*****az)
        if (localPart.length > 4) {
            return localPart.slice(0, 2) + '*'.repeat(localPart.length - 4) + localPart.slice(-2);
        }
        return localPart;
    }
}

function setupAuthListeners() {
    const closeBtn = document.getElementById("close-auth-modal-btn");
    const cancelBtn = document.getElementById("cancel-auth-btn");
    const emailForm = document.getElementById("auth-email-form");
    const codeForm = document.getElementById("auth-code-form");
    const backBtn = document.getElementById("back-auth-btn");
    const closeSimBtn = document.getElementById("close-simulator-btn");

    closeBtn.addEventListener("click", closeAuthModal);
    cancelBtn.addEventListener("click", closeAuthModal);
    
    // Close modal when clicking background
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("auth-modal");
        if (e.target === modal) closeAuthModal();
    });

    backBtn.addEventListener("click", () => {
        codeForm.style.display = "none";
        emailForm.style.display = "block";
        document.getElementById("email-simulator-box").style.display = "none";
        document.getElementById("auth-email").focus();
    });

    if (closeSimBtn) {
        closeSimBtn.addEventListener("click", () => {
            document.getElementById("email-simulator-box").style.display = "none";
        });
    }

    // Step 1: E-Mail Form Submit
    emailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-email").value.trim().toLowerCase();
        
        // Domain validation
        if (!email.endsWith("@ogr.kocaeli.edu.tr") && !email.endsWith("@kocaeli.edu.tr")) {
            showToast("Lütfen geçerli bir KOÜ e-posta adresi girin (@ogr.kocaeli.edu.tr veya @kocaeli.edu.tr)", "error");
            return;
        }

        pendingAuthEmail = email;
        
        // Generate random 6-digit code
        generatedAuthCode = String(Math.floor(100000 + Math.random() * 900000));
        
        // Display inside simulator
        document.getElementById("simulator-code-display").textContent = generatedAuthCode;
        
        // Show simulator box
        const simBox = document.getElementById("email-simulator-box");
        simBox.style.display = "block";
        
        // Transition to verification code form
        emailForm.style.display = "none";
        codeForm.style.display = "block";
        document.getElementById("code-sent-label").textContent = `${email} adresine onay kodu gönderildi. (Simülatör kutusunu kontrol edin)`;
        
        showToast("Onay kodunuz gönderildi!", "success");
        
        setTimeout(() => {
            document.getElementById("auth-code").focus();
        }, 150);
    });

    // Step 2: Code verification form submit
    codeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const enteredCode = document.getElementById("auth-code").value.trim();
        
        if (enteredCode !== generatedAuthCode) {
            showToast("Doğrulama kodu hatalı! Lütfen tekrar deneyin.", "error");
            // Shake the input
            const input = document.getElementById("auth-code");
            input.classList.add("char-danger");
            setTimeout(() => input.classList.remove("char-danger"), 500);
            return;
        }

        // Login successful
        const maskedId = maskStudentNumber(pendingAuthEmail);
        
        currentUser = {
            email: pendingAuthEmail,
            maskedId: maskedId
        };
        
        localStorage.setItem("kou_currentUser", JSON.stringify(currentUser));
        updateHeaderProfile();
        closeAuthModal();
        showToast(`Giriş yapıldı! Hoş geldiniz, ${maskedId}`, "success");
        
        // Refresh currently viewed menu to show rating buttons in case they were waiting
        loadMenu(currentSelectedDate);
    });
}

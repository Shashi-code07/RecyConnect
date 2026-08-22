const recyclers = [
    {
        name: "GreenCycle",
        initials: "GC",
        materials: ["Plastic", "Cardboard"],
        distance: 2.4,
        rating: 4.8,
        pickups: 127,
        baseScore: 92
    },
    {
        name: "EcoMetal Hub",
        initials: "EM",
        materials: ["Metal", "E-Waste"],
        distance: 4.2,
        rating: 4.7,
        pickups: 98,
        baseScore: 88
    },
    {
        name: "PaperGreen",
        initials: "PG",
        materials: ["Paper", "Cardboard"],
        distance: 2.8,
        rating: 4.9,
        pickups: 164,
        baseScore: 91
    },
    {
        name: "ReNew Glassworks",
        initials: "RG",
        materials: ["Glass"],
        distance: 5.1,
        rating: 4.6,
        pickups: 76,
        baseScore: 86
    },
    {
        name: "Circular E-Waste",
        initials: "CE",
        materials: ["E-Waste", "Metal"],
        distance: 6.3,
        rating: 4.8,
        pickups: 143,
        baseScore: 90
    }
];
// ===============================
// AVAILABLE RECYCLER MATCHES
// ===============================

function showAvailableRecyclers() {

    const matchGrid =
        document.querySelector(".match-grid");

    if (!matchGrid) return;

    matchGrid.innerHTML = "";

    recyclers
        .slice(0, 3)
        .forEach((recycler) => {

            const card =
                document.createElement("div");

            card.className = "match-card";

            card.innerHTML = `

                <div class="match-top">
                    <span class="material">♻️</span>

                    <span class="verified">
                        ✓ Verified
                    </span>
                </div>

                <h3>${recycler.name}</h3>

                <p>
                    ${recycler.materials.join(" & ")}
                </p>

                <div class="match-score">
                    <strong>
                        ${recycler.baseScore}% Available Match
                    </strong>
                </div>

                <div class="match-info">

                    <span>📍 ${recycler.distance} km</span>

                    <span>⭐ ${recycler.rating}</span>

                </div>

                <div class="match-reasons">

                    <span>
                        ♻️ Accepts ${recycler.materials[0]}
                    </span>

                    <span>
                        📍 ${
                            recycler.distance <= 3
                                ? "Nearby Recycler"
                                : "Available Nearby"
                        }
                    </span>

                    <span>
                        🚚 ${recycler.pickups}+ Pickups
                    </span>

                </div>

                <div class="match-actions">

                    <button class="details-btn">
                        View Recycler Details
                    </button>

                </div>
            `;

            const detailsButton =
                card.querySelector(".details-btn");

            detailsButton.onclick = function () {

                showRecyclerDetails({
                    ...recycler,
                    matchScore: recycler.baseScore
                });

            };

            matchGrid.appendChild(card);
        });
}
const form = document.getElementById("wasteForm");


// ===============================
// FAIR MATCH SCORE
// ===============================

function calculateMatchScore(recycler, listing) {

    let score = recycler.baseScore;

    // Material compatibility
    if (recycler.materials.includes(listing.wasteType)) {
        score += 5;
    } else {
        score -= 15;
    }

    // Distance factor
    if (recycler.distance <= 3) {
        score += 3;
    } else if (recycler.distance <= 5) {
        score += 1;
    }

    // Quantity factor
    if (listing.quantity >= 20) {
        score += 2;
    }

    return Math.min(99, Math.max(50, Math.round(score)));
}


// ===============================
// SAVE LISTING
// ===============================

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const listing = {

        id: Date.now(),

        name: document.getElementById("name").value,

        wasteType:
            document.getElementById("wasteType").value,

        quantity:
            Number(document.getElementById("quantity").value),

        location:
            document.getElementById("location").value,

        value:
            Number(document.getElementById("value").value),

        pickup:
            document.getElementById("pickup").value,

        status: "Looking for Recycler"

    };


    let listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];


    listings.push(listing);


    localStorage.setItem(
        "recyConnectListings",
        JSON.stringify(listings)
    );


    // Find best recyclers
    const rankedRecyclers = recyclers
        .map(recycler => {

            return {

                ...recycler,

                matchScore:
                    calculateMatchScore(
                        recycler,
                        listing
                    )

            };

        })
        .sort(
            (a, b) =>
                b.matchScore - a.matchScore
        );


    const best = rankedRecyclers[0];


    alert(
        "♻️ FairMatch Activated!\n\n" +

        "Best Match: " +
        best.name +

        "\nMatch Score: " +
        best.matchScore +
        "%" +

        "\nDistance: " +
        best.distance +
        " km" +

        "\nRating: ⭐ " +
        best.rating
    );


    form.reset();


    showMatches(
        rankedRecyclers,
        listing
    );
    updateListingHistory();

    document
        .getElementById("matches")
        .scrollIntoView({
            behavior: "smooth"
        });

});


// ===============================
// DISPLAY MATCHES
// ===============================

function showMatches(rankedRecyclers, listing) {

    const matchGrid = document.querySelector(".match-grid");

    if (!matchGrid) return;

    matchGrid.innerHTML = "";

    rankedRecyclers
        .slice(0, 3)
        .forEach((recycler, index) => {

            const materialMatch =
                recycler.materials.includes(listing.wasteType);

            const card = document.createElement("div");

            card.className = "match-card";

            card.innerHTML = `
                <div class="match-top">
                    <span class="material">♻️</span>
                    <span class="verified">✓ Verified</span>
                </div>

                <h3>${recycler.name}</h3>

                <p>${recycler.materials.join(" & ")}</p>

                <div class="match-score">
                    <strong>
                        ${recycler.matchScore}%
                        ${index === 0 ? "Best Match" : "Match"}
                    </strong>
                </div>

                <div class="match-info">
                    <span>📍 ${recycler.distance} km</span>
                    <span>⭐ ${recycler.rating}</span>
                </div>

                <div class="match-reasons">
                    <span>
                        ${materialMatch
                            ? "♻️ Material Compatible"
                            : "⚠️ Material Different"}
                    </span>

                    <span>
                        ${recycler.distance <= 3
                            ? "📍 Nearby Recycler"
                            : "📍 Moderate Distance"}
                    </span>

                    <span>💰 Fair Price</span>
                </div>

                <div class="match-actions">

                  <button class="accept-btn">
                    ${index === 0
                    ? `✓ Best Match — ${recycler.matchScore}%`
                     : `Choose Recycler — ${recycler.matchScore}%`}
                  </button>

                  <button class="details-btn">
                      View Recycler Details
                  </button>

                </div>
            `;

            const button = card.querySelector(".accept-btn");
            const detailsButton =
                    card.querySelector(".details-btn");

                    detailsButton.onclick = function () {

                  showRecyclerDetails(recycler);
            };
            button.onclick = function () {

                acceptMatch(
                    recycler.name,
                    recycler.matchScore
                );

            };

            matchGrid.appendChild(card);
        });
}

// ===============================
// ACCEPT MATCH
// ===============================

function acceptMatch(recyclerName, matchScore) {

    let listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];

    if (listings.length === 0) {
        alert("Please create a waste listing first.");
        return;
    }

    const latest =
        listings[listings.length - 1];

    latest.recycler = recyclerName;
    latest.matchScore = matchScore;
    latest.status = "Matched";

    localStorage.setItem(
        "recyConnectListings",
        JSON.stringify(listings)
    );

    // Update dashboard immediately
    updateDashboard();

    alert(
        "🎉 FairMatch Successful!\n\n" +
        "Recycler: " + recyclerName +
        "\nMatch Score: " + matchScore + "%" +
        "\n\nYour recyclable waste has been matched."
    );

    // Show dashboard progress
    document
        .getElementById("dashboard")
        .scrollIntoView({
            behavior: "smooth"
        });
}
// ===============================
// DASHBOARD + STATUS FLOW
// ===============================

function updateDashboard() {

    const listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];

    if (listings.length === 0) return;

    const latest =
        listings[listings.length - 1];

    const totalWaste =
        listings.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

    const totalValue =
        listings.reduce(
            (total, item) =>
                total + Number(item.value || 0),
            0
        );

    // Dashboard cards

    document.getElementById("totalWaste").textContent =
        totalWaste + " kg";

    document.getElementById("estimatedValue").textContent =
        "₹" + totalValue.toLocaleString("en-IN");

    document.getElementById("activeMatch").textContent =
        latest.recycler || "—";

    document.getElementById("matchStatus").textContent =
        latest.status || "Looking for Recycler";

    document.getElementById("wasteDiverted").textContent =
        latest.status === "Recycled"
            ? totalWaste + " kg"
            : "0 kg";


    // Reset journey

    document
        .getElementById("listedStep")
        .classList.add("active");

    document
        .getElementById("matchedStep")
        .classList.remove("completed");

    document
        .getElementById("pickupStep")
        .classList.remove("completed");

    document
        .getElementById("recycledStep")
        .classList.remove("completed");


    // ===============================
    // LISTED
    // ===============================

    document.getElementById("trackingTitle")
        .textContent =
        "Waste listing created successfully";

    document.getElementById("trackingStatus")
        .textContent =
        "LISTED";


    // ===============================
    // MATCHED
    // ===============================

    if (
        latest.status === "Matched" ||
        latest.status === "Pickup Scheduled" ||
        latest.status === "Recycled"
    ) {

        document
            .getElementById("matchedStep")
            .classList.add("completed");

        document.getElementById("trackingTitle")
            .textContent =
            "Waste matched with " +
            latest.recycler;

        document.getElementById("trackingStatus")
            .textContent =
            "MATCHED";
    }


    // ===============================
    // PICKUP SCHEDULED
    // ===============================

    if (
        latest.status === "Pickup Scheduled" ||
        latest.status === "Recycled"
    ) {

        document
            .getElementById("pickupStep")
            .classList.add("completed");

        document.getElementById("trackingTitle")
            .textContent =
            "Pickup scheduled with " +
            latest.recycler;

        document.getElementById("trackingStatus")
            .textContent =
            "PICKUP SCHEDULED";
    }


    // ===============================
    // RECYCLED
    // ===============================

    if (latest.status === "Recycled") {

        document
            .getElementById("recycledStep")
            .classList.add("completed");

        document.getElementById("trackingTitle")
            .textContent =
            "♻️ Waste successfully recycled";

        document.getElementById("trackingStatus")
            .textContent =
            "RECYCLED";
    }
}

// ===============================
// SCHEDULE PICKUP
// ===============================

function schedulePickup() {

    const listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];

    if (listings.length === 0) {

        alert(
            "Please create a waste listing first."
        );

        return;
    }

    const latest =
        listings[listings.length - 1];

    if (!latest.recycler) {

        alert(
            "Please select a recycler first."
        );

        return;
    }

    const date =
        document.getElementById("pickupDate").value;

    const time =
        document.getElementById("pickupTime").value;

    const location =
        document.getElementById("pickupLocation").value.trim();

    if (!date || !time || !location) {

        alert(
            "Please enter pickup date, time and location."
        );

        return;
    }

    const selectedDate =
        new Date(date + "T" + time);

    const now = new Date();

    if (selectedDate <= now) {

        alert(
            "Please select a future pickup date and time."
        );

        return;
    }

    latest.pickupDate = date;
    latest.pickupTime = time;
    latest.pickupLocation = location;
    latest.status = "Pickup Scheduled";

    localStorage.setItem(
        "recyConnectListings",
        JSON.stringify(listings)
    );

    updateDashboard();
    updateListingHistory();

    document.getElementById("trackingTitle")
        .textContent =
        "Pickup scheduled with " +
        latest.recycler;

    document.getElementById("trackingStatus")
        .textContent =
        "PICKUP SCHEDULED";

    alert(
        "🚚 Pickup Scheduled Successfully!\n\n" +
        "Recycler: " + latest.recycler +
        "\nDate: " + date +
        "\nTime: " + time +
        "\nLocation: " + location
    );
}


// ===============================
// COMPLETE RECYCLING
// ===============================

function completeRecycling() {

    const listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];

    if (listings.length === 0) {

        alert(
            "No active recycling listing found."
        );

        return;
    }


    const latest =
        listings[listings.length - 1];


    if (latest.status !== "Pickup Scheduled") {

        alert(
            "Please schedule the pickup first."
        );

        return;
    }


    latest.status =
        "Recycled";


    localStorage.setItem(
        "recyConnectListings",
        JSON.stringify(listings)
    );


    updateDashboard();


    alert(
        "🌱 Recycling Completed!\n\n" +
        latest.quantity +
        " kg of waste has been marked as recycled.\n\n" +
        "Thank you for contributing to a circular future ♻️"
    );
}


// Update dashboard when page loads

updateDashboard();
updateListingHistory();
updateImpactDashboard();
showAvailableRecyclers();
// ===============================
// MY LISTINGS / HISTORY
// ===============================

function updateListingHistory() {

    const historyContainer =
        document.getElementById("listingHistory");

    if (!historyContainer) return;

    const listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];

    if (listings.length === 0) {

        historyContainer.innerHTML = `
            <div class="empty-history">
                <span>♻️</span>
                <p>No recycling listings yet.</p>
                <small>Create your first waste listing to see it here.</small>
            </div>
        `;

        return;
    }

    historyContainer.innerHTML = "";

    [...listings]
        .reverse()
        .forEach((listing, index) => {

            const status = listing.status || "Looking for Recycler";

            const card = document.createElement("div");

            card.className = "history-card";

            card.innerHTML = `
                <div class="history-main">

                    <div class="history-icon">
                        ♻️
                    </div>

                    <div>
                        <h4>${listing.wasteType}</h4>

                        <p>
                            ${listing.quantity} kg
                            ${listing.location
                                ? " • " + listing.location
                                : ""}
                        </p>

                        <small>
                            ${listing.name || "Waste Listing"}
                        </small>
                    </div>

                </div>

                <div class="history-details">

                    <span class="history-value">
                        ₹${Number(listing.value || 0).toLocaleString("en-IN")}
                    </span>

                    <span class="history-status">
                        ${status}
                    </span>

                    ${
                        listing.recycler
                            ? `<small>🤝 ${listing.recycler}</small>`
                            : ""
                    }

                    ${
                        listing.matchScore
                            ? `<small>⭐ ${listing.matchScore}% Match</small>`
                            : ""
                    }

                </div>
            `;

            historyContainer.appendChild(card);
        });
}
// ===============================
// IMPACT DASHBOARD
// ===============================

function updateImpactDashboard() {

    const listings =
        JSON.parse(
            localStorage.getItem("recyConnectListings")
        ) || [];

    const recycledListings =
        listings.filter(
            item => item.status === "Recycled"
        );

    const recycledWaste =
        recycledListings.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

    const successfulPickups =
        recycledListings.length;

    const divertedWaste =
        recycledWaste;

    const impactScore =
        Math.min(
            100,
            Math.round(
                recycledWaste * 2 +
                successfulPickups * 10
            )
        );

    
    animateImpactNumber(
      document.getElementById("impactRecycled"),
      recycledWaste,
      " kg"
   );

    animateImpactNumber(
       document.getElementById("impactPickups"),
      successfulPickups
    );

    animateImpactNumber(
    
        document.getElementById("impactDiverted"),
    
        divertedWaste,
    
        " kg"
    );

    animateImpactNumber(
        document.getElementById("impactScore"),
        impactScore,
       "/100"
    );

    const message =
        document.getElementById("impactMessage");

    if (recycledWaste === 0) {

        message.textContent =
            "Start recycling to create your environmental impact.";

    } else if (recycledWaste < 10) {

        message.textContent =
            "🌱 Great start! Every kilogram recycled makes a difference.";

    } else if (recycledWaste < 50) {

        message.textContent =
            "🌿 Amazing progress! You are actively reducing recyclable waste.";

    } else {

        message.textContent =
            "🌍 Outstanding impact! You are making a meaningful contribution to a circular future.";
    }
}
// ===============================
// IMPACT COUNT-UP ANIMATION
// ===============================

function animateImpactNumber(element, target, suffix = "") {

    if (!element) return;

    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        const easedProgress =
            1 - Math.pow(1 - progress, 3);

        const value =
            Math.round(target * easedProgress);

        element.textContent =
            value + suffix;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}
// ===============================
// RECYCLER DETAILS
// ===============================

function showRecyclerDetails(recycler) {

    const modal =
        document.getElementById("recyclerModal");

    if (!modal) return;

    document.getElementById("recyclerName")
        .textContent = recycler.name;

    document.getElementById("recyclerInitials")
        .textContent = recycler.initials;

    document.getElementById("recyclerMaterials")
        .textContent =
        recycler.materials.join(" • ");

    document.getElementById("recyclerDistance")
        .textContent =
        recycler.distance + " km";

    document.getElementById("recyclerRating")
        .textContent =
        "⭐ " + recycler.rating;

    document.getElementById("recyclerPickups")
        .textContent =
        recycler.pickups + "+";

    document.getElementById("recyclerScore")
        .textContent =
        recycler.matchScore + "% Match";

    modal.classList.add("show");
}


function closeRecyclerModal() {

    const modal =
        document.getElementById("recyclerModal");

    if (modal) {
        modal.classList.remove("show");
    }
}
// ===============================
// IMPACT NUMBER ANIMATION
// ===============================

function animateNumber(element, target, suffix = "") {

    if (!element) return;

    const duration = 800;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) / duration,
                1
            );

        const eased =
            1 - Math.pow(1 - progress, 3);

        const value =
            Math.round(
                start + (target - start) * eased
            );

        element.textContent =
            value + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
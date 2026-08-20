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


    document
        .getElementById("matches")
        .scrollIntoView({
            behavior: "smooth"
        });

});


// ===============================
// DISPLAY MATCHES
// ===============================

function showMatches(
    rankedRecyclers,
    listing
) {

    const matchCards =
        document.querySelectorAll(
            ".match-card"
        );


    rankedRecyclers
        .slice(0, 3)
        .forEach((recycler, index) => {

            if (!matchCards[index]) return;


            const card =
                matchCards[index];


            const title =
                card.querySelector("h3");

            const description =
                card.querySelector("p");

            const button =
                card.querySelector("button");


            title.textContent =
                recycler.name;


            description.textContent =
                recycler.materials.join(" & ");


            button.textContent =
                index === 0
                    ? `✓ Best Match — ${recycler.matchScore}%`
                    : `Choose Recycler — ${recycler.matchScore}%`;


            button.onclick = function () {

                acceptMatch(
                    recycler.name,
                    recycler.matchScore
                );

            };

        });

}


// ===============================
// ACCEPT MATCH
// ===============================

function acceptMatch(
    recyclerName,
    matchScore
) {

    let listings =
        JSON.parse(
            localStorage.getItem(
                "recyConnectListings"
            )
        ) || [];


    if (listings.length === 0) {

        alert(
            "Please create a waste listing first."
        );

        return;
    }


    const latest =
        listings[listings.length - 1];


    latest.recycler =
        recyclerName;


    latest.matchScore =
        matchScore;


    latest.status =
        "Matched";


    localStorage.setItem(
        "recyConnectListings",
        JSON.stringify(listings)
    );


    alert(
        "🎉 FairMatch Successful!\n\n" +

        "Recycler: " +
        recyclerName +

        "\nMatch Score: " +
        matchScore +
        "%" +

        "\n\nYour recyclable waste has been matched."
    );

}
// ===============================
// DASHBOARD UPDATE
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


    document.getElementById("totalWaste").textContent =
        totalWaste + " kg";


    document.getElementById("estimatedValue").textContent =
        "₹" + totalValue.toLocaleString("en-IN");


    document.getElementById("activeMatch").textContent =
        latest.recycler || "—";


    document.getElementById("matchStatus").textContent =
        latest.recycler
            ? "✓ Recycler matched"
            : "Waiting for recycler";


    document.getElementById("wasteDiverted").textContent =
        latest.status === "Recycled"
            ? totalWaste + " kg"
            : "0 kg";


    if (latest.recycler) {

        document
            .getElementById("matchedStep")
            .classList.add("completed");

        document.getElementById("trackingTitle")
            .textContent =
            "Waste successfully matched with " +
            latest.recycler;

        document.getElementById("trackingStatus")
            .textContent = "MATCHED";
    }


    if (latest.status === "Pickup Scheduled") {

        document
            .getElementById("pickupStep")
            .classList.add("completed");

        document.getElementById("trackingTitle")
            .textContent =
            "Pickup has been scheduled";

        document.getElementById("trackingStatus")
            .textContent = "PICKUP SCHEDULED";
    }


    if (latest.status === "Recycled") {

        document
            .getElementById("recycledStep")
            .classList.add("completed");

        document.getElementById("trackingTitle")
            .textContent =
            "♻️ Waste successfully recycled";

        document.getElementById("trackingStatus")
            .textContent = "RECYCLED";
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


    latest.status =
        "Pickup Scheduled";


    localStorage.setItem(
        "recyConnectListings",
        JSON.stringify(listings)
    );


    updateDashboard();


    alert(
        "🚚 Pickup Scheduled!\n\n" +
        "Recycler: " +
        latest.recycler +
        "\n\nYour recyclable waste is ready for collection."
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
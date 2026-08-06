/* ==========================================================================
   OPENHEALTH | CYBER HUD CONTROLLER & FLASK API INTEGRATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. DATABASE & STATE MANAGEMENT
    const availableSymptoms = [
        "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering",
        "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting",
        "vomiting", "burning_micturition", "spotting_urination", "fatigue", "weight_gain",
        "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness",
        "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", "high_fever",
        "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion",
        "headache", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite",
        "pain_behind_the_eyes", "back_pain", "constipation", "abdominal_pain", "diarrhea",
        "mild_fever", "yellow_urine", "yellowing_of_eyes", "acute_liver_failure",
        "swelling_of_stomach", "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision",
        "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose",
        "congestion", "chest_pain", "weakness_in_limbs", "fast_heart_rate",
        "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritability_in_bottom",
        "neck_pain", "dizziness", "cramps", "bruising", "obesity", "swollen_legs",
        "swollen_blood_vessels", "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails",
        "swollen_extremeties", "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips",
        "slurred_speech", "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck",
        "swelling_joints", "movement_stiffness", "spinning_movements", "loss_of_balance",
        "unsteadiness", "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort",
        "foul_smell_of_urine", "continuous_feel_of_urine", "passage_of_gases", "internal_itching",
        "toxic_look_(typhos)", "depression", "irritability", "muscle_pain", "altered_sensorium",
        "red_spots_over_body", "belly_pain", "abnormal_menstruation", "dischromic_patches",
        "watering_from_eyes", "increased_appetite", "polyuria", "family_history", "mucoid_sputum",
        "rusty_sputum", "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion",
        "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen",
        "history_of_alcohol_consumption", "blood_in_sputum", "prominent_veins_on_calf",
        "palpitations", "painful_walking", "pus_filled_blisters", "blackheads", "scurring",
        "skin_peeling", "silver_like_scaling", "small_dents_in_nails", "inflammatory_nails",
        "blister", "red_sore_around_nose", "yellow_crust_ooze"
    ];

    let selectedSymptomsList = [];

    // 2. DOM ELEMENTS
    const symptomSearchInput = document.getElementById("symptomSearch");
    const symptomListContainer = document.getElementById("symptomList");
    const selectedSymptomsContainer = document.getElementById("selectedSymptoms");
    const predictBtn = document.getElementById("predictBtn");
    const resetBtn = document.getElementById("resetBtn");

    const loadingSection = document.getElementById("loadingSection");
    const resultSection = document.getElementById("resultSection");

    const diseaseNameElem = document.getElementById("diseaseName");
    const doctorNameElem = document.getElementById("doctorName");
    const dietPlanElem = document.getElementById("dietPlan");
    const descriptionElem = document.getElementById("description");
    const precautionsListElem = document.getElementById("precautionsList");

    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.querySelector(".nav-links");
    const scrollTopBtn = document.getElementById("scrollTop");

    // 3. SYMPTOM RENDERING & HUD INTERACTIONS
    function renderSymptomList(filterText = "") {
        if (!symptomListContainer) return;
        symptomListContainer.innerHTML = "";

        const filtered = availableSymptoms.filter(symptom =>
            symptom.toLowerCase().replace(/_/g, " ").includes(filterText.toLowerCase().trim())
        );

        if (filtered.length === 0) {
            symptomListContainer.innerHTML = `<span style="color: var(--cyber-magenta); font-size: 0.9rem; padding: 0.5rem;">⚠️ No matching symptoms found in neural database.</span>`;
            return;
        }

        filtered.forEach(symptom => {
            const isSelected = selectedSymptomsList.includes(symptom);
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = `symptom-item ${isSelected ? "active" : ""}`;
            chip.innerHTML = `<i class="fa-solid ${isSelected ? 'fa-check' : 'fa-plus'}"></i> ${formatSymptomName(symptom)}`;

            chip.addEventListener("click", () => {
                if (!isSelected) {
                    addSymptom(symptom);
                } else {
                    removeSymptom(symptom);
                }
            });

            symptomListContainer.appendChild(chip);
        });
    }

    function renderSelectedSymptoms() {
        if (!selectedSymptomsContainer) return;
        selectedSymptomsContainer.innerHTML = "";

        if (selectedSymptomsList.length === 0) {
            selectedSymptomsContainer.innerHTML = `<span style="color: var(--text-secondary); font-size: 0.85rem;">No symptoms selected. Choose at least 3 from below.</span>`;
            return;
        }

        selectedSymptomsList.forEach(symptom => {
            const chip = document.createElement("div");
            chip.className = "symptom-chip";
            chip.innerHTML = `
                <span>${formatSymptomName(symptom)}</span>
                <i class="fa-solid fa-xmark remove-chip" style="cursor: pointer; margin-left: 8px;"></i>
            `;

            chip.querySelector(".remove-chip").addEventListener("click", () => {
                removeSymptom(symptom);
            });

            selectedSymptomsContainer.appendChild(chip);
        });
    }

    function addSymptom(symptom) {
        if (!selectedSymptomsList.includes(symptom)) {
            selectedSymptomsList.push(symptom);
            renderSelectedSymptoms();
            if (symptomSearchInput) symptomSearchInput.value = "";
            renderSymptomList();
        }
    }

    function removeSymptom(symptom) {
        selectedSymptomsList = selectedSymptomsList.filter(item => item !== symptom);
        renderSelectedSymptoms();
        renderSymptomList(symptomSearchInput ? symptomSearchInput.value : "");
    }

    function formatSymptomName(name) {
        return name.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
    }

    if (symptomSearchInput) {
        symptomSearchInput.addEventListener("input", (e) => {
            renderSymptomList(e.target.value);
        });
    }

    // 4. ML DIAGNOSIS & FLASK API RUNNER
    // 4. ML DIAGNOSIS & FLASK API RUNNER
    if (predictBtn) {
        predictBtn.addEventListener("click", async () => {
            if (selectedSymptomsList.length < 3) {
                alert("⚠️ Diagnostic Minimum Requirement: Please select at least 3 symptoms.");
                return;
            }

            // Hide previous results and show the loader
            if (resultSection) resultSection.style.display = "none";
            if (loadingSection) {
                loadingSection.style.display = "block";
                loadingSection.scrollIntoView({ behavior: "smooth" });
            }

            // Elements for HUD animation
            const progressBar = document.getElementById("progressBar");
            const loadingPercent = document.getElementById("loadingPercent");
            const loadingStatus = document.getElementById("loadingStatus");

            // Diagnostic Status Messages
            const statusLogs = [
                "Initializing Neural Diagnostic Model...",
                "Formatting Symptom Vector Matrix...",
                "Querying 41-Disease Knowledge Core...",
                "Running Random Forest ML Classifier...",
                "Finalizing Diagnostic HUD Report..."
            ];

            // Start HUD Progress Animation
            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress < 90) { // Hold at 90% until API responds
                    progress += 2;
                    if (progressBar) progressBar.style.width = `${progress}%`;
                    if (loadingPercent) loadingPercent.innerText = progress;

                    // Dynamically update status text based on progress stage
                    if (progress === 20 && loadingStatus) loadingStatus.innerText = statusLogs[1];
                    if (progress === 45 && loadingStatus) loadingStatus.innerText = statusLogs[2];
                    if (progress === 70 && loadingStatus) loadingStatus.innerText = statusLogs[3];
                    if (progress === 85 && loadingStatus) loadingStatus.innerText = statusLogs[4];
                }
            }, 50);

            try {
                // Call Flask API Endpoint
                const response = await fetch("https://openhealth-mqrg.onrender.com/predict", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        symptoms: selectedSymptomsList
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server status ${response.status}`);
                }

                const data = await response.json();

                // Fill progress bar to 100% on success
                clearInterval(progressInterval);
                if (progressBar) progressBar.style.width = "100%";
                if (loadingPercent) loadingPercent.innerText = "100";

                // Brief pause for visual impact before rendering results
                setTimeout(() => {
                    displayResults(data);
                }, 400);

            } catch (err) {
                clearInterval(progressInterval);
                console.error("API Diagnostic Error:", err);
                if (loadingSection) loadingSection.style.display = "none";
                alert("⚠️ Could not reach Flask server node. Check network status or backend CORS.");
            }
        });
    }

function displayResults(data) {
        if (loadingSection) loadingSection.style.display = "none";
        if (resultSection) resultSection.style.display = "block";

        // 1. Disease Name
        if (diseaseNameElem) {
            diseaseNameElem.innerText =
                data.predicted_disease ||
                data.disease ||
                data.prediction ||
                "Condition Unspecified";
        }

        // 2. Extract Confidence
        let rawConfidence = data.confidence !== undefined ? data.confidence : (data.accuracy || 95);
        if (typeof rawConfidence === 'string') {
            rawConfidence = parseFloat(rawConfidence.replace('%', ''));
        }
        const percent = Math.round(rawConfidence);

        // 3. Update Text Inside Circle
        const gaugeValueText = document.getElementById("gaugeValueText");
        if (gaugeValueText) {
            gaugeValueText.innerText = percent;
        }

        // 4. Animate Circular Ring
        const circle = document.getElementById("gaugeCircle");
        if (circle) {
            const circumference = 2 * Math.PI * 42; // r=42 -> ~264
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }

        // 5. Populate Metadata
        if (doctorNameElem) doctorNameElem.innerText = data.doctor || data.specialist || "General Practitioner";
        if (dietPlanElem) dietPlanElem.innerText = data.diet || "Balanced, anti-inflammatory dietary plan.";
        if (descriptionElem) descriptionElem.innerText = data.description || "Medical analysis parameters computed successfully.";

        // 6. Precautions
        if (precautionsListElem) {
            precautionsListElem.innerHTML = "";
            const precautions = data.precautions || ["Consult a certified physician for immediate evaluation."];
            precautions.forEach(p => {
                const li = document.createElement("li");
                li.innerText = p;
                precautionsListElem.appendChild(li);
            });
        }

        if (resultSection) resultSection.scrollIntoView({ behavior: "smooth" });
    }

    // 5. HUD RESET
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            selectedSymptomsList = [];
            if (symptomSearchInput) symptomSearchInput.value = "";
            renderSelectedSymptoms();
            renderSymptomList();
            if (loadingSection) loadingSection.style.display = "none";
            if (resultSection) resultSection.style.display = "none";
        });
    }

    // 6. NAVIGATION & COUNTERS
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });

        // Auto close mobile navbar on click
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
            });
        });
    }

    window.addEventListener("scroll", () => {
        const header = document.querySelector("header");
        if (header) {
            header.classList.toggle("scrolled", window.scrollY > 40);
        }

        if (scrollTopBtn) {
            scrollTopBtn.style.display = window.scrollY > 300 ? "flex" : "none";
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const counters = document.querySelectorAll(".counter");
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute("data-target");
            const count = +counter.innerText;
            const increment = Math.max(1, Math.ceil(target / 40));

            if (count < target) {
                counter.innerText = Math.min(target, count + increment);
                setTimeout(updateCount, 30);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });

    // 7. INITIAL RENDER
    renderSymptomList();
    renderSelectedSymptoms();
});
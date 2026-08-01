/* ==========================================================================
   MEDIPREDICT  - INTERACTIVE LOGIC & FLASK API INTEGRATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // 1. DATA STORES & STATE
    // ----------------------------------------------------------------------
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

    // ----------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // ----------------------------------------------------------------------
    const symptomSearchInput = document.getElementById("symptomSearch");
    const symptomListContainer = document.getElementById("symptomList");
    const selectedSymptomsContainer = document.getElementById("selectedSymptoms");
    const predictBtn = document.getElementById("predictBtn");
    const resetBtn = document.getElementById("resetBtn");

    const loadingSection = document.getElementById("loadingSection");
    const resultSection = document.getElementById("resultSection");

    // Correct IDs mapping to HTML template
    const diseaseNameElem = document.getElementById("predictedDisease") || document.getElementById("diseaseName");
    const doctorNameElem = document.getElementById("recommendedDoctor") || document.getElementById("doctorName");
    const dietPlanElem = document.getElementById("recommendedDiet") || document.getElementById("dietPlan");
    const descriptionElem = document.getElementById("diseaseDescription") || document.getElementById("description");
    const precautionsListElem = document.getElementById("precautionsList");

    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");
    const scrollTopBtn = document.getElementById("scrollTop");

    // ----------------------------------------------------------------------
    // 3. RENDER & FILTER SYMPTOMS
    // ----------------------------------------------------------------------
    function renderSymptomList(filterText = "") {
        if (!symptomListContainer) return;
        symptomListContainer.innerHTML = "";

        const filtered = availableSymptoms.filter(symptom =>
            symptom.toLowerCase().replace(/_/g, " ").includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            symptomListContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem; padding: 0.5rem;">No matching symptoms found.</span>`;
            return;
        }

        filtered.forEach(symptom => {
            const isSelected = selectedSymptomsList.includes(symptom);
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = `symptom-item ${isSelected ? "active" : ""}`;
            chip.innerText = formatSymptomName(symptom);

            chip.addEventListener("click", () => {
                if (!isSelected) {
                    addSymptom(symptom);
                }
            });

            symptomListContainer.appendChild(chip);
        });
    }

    function renderSelectedSymptoms() {
        if (!selectedSymptomsContainer) return;
        selectedSymptomsContainer.innerHTML = "";

        if (selectedSymptomsList.length === 0) {
            selectedSymptomsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">No symptoms selected yet.</span>`;
            return;
        }

        selectedSymptomsList.forEach(symptom => {
            const chip = document.createElement("div");
            chip.className = "symptom-chip";
            chip.innerHTML = `
                <span>${formatSymptomName(symptom)}</span>
                <span class="remove-chip">&times;</span>
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

    // Search filter listener
    if (symptomSearchInput) {
        symptomSearchInput.addEventListener("input", (e) => {
            renderSymptomList(e.target.value);
        });
    }

    // ----------------------------------------------------------------------
    // 4. PREDICTION LOGIC & API INTEGRATION
    // ----------------------------------------------------------------------
    if (predictBtn) {
        predictBtn.addEventListener("click", async () => {
            if (selectedSymptomsList.length < 3) {
                alert("Please select at least 3 symptoms for a more accurate disease prediction.");
                return;
            }

            // Show Loading Indicator
            if (resultSection) resultSection.style.display = "none";
            if (loadingSection) {
                loadingSection.style.display = "block";
                loadingSection.scrollIntoView({ behavior: "smooth" });

                document.getElementById("step1").innerHTML = "⏳ Collecting Selected Symptoms...";
                document.getElementById("step2").innerHTML = "⏳ Waiting...";
                document.getElementById("step3").innerHTML = "⏳ Waiting...";
                document.getElementById("step4").innerHTML = "⏳ Waiting...";

                setTimeout(() => {
                    document.getElementById("step1").innerHTML = "✅ Symptoms Collected";
                }, 500);

                setTimeout(() => {
                    document.getElementById("step2").innerHTML = "✅ Comparing with 41 Diseases";
                }, 1200);

                setTimeout(() => {
                    document.getElementById("step3").innerHTML = "✅ Running Random Forest Model";
                }, 1900);

                setTimeout(() => {
                    document.getElementById("step4").innerHTML = "✅ Preparing Prediction Report";
                }, 2600);
            }

            try {
                const response = await fetch("https://openhealth.onrender.com", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        symptoms: selectedSymptomsList
                    })
                });

                if (!response.ok) {
                    throw new Error("Server Error");
                }

                // Keep loading animation visible
                await new Promise(resolve => setTimeout(resolve, 2000));

                const data = await response.json();
                console.log("Prediction:", data);

                displayResults(data);
            } catch (err) {
                console.error(err);
                if (loadingSection) loadingSection.style.display = "none";
                alert("Could not connect to Flask server.");
            }
        });
    }

    function displayResults(data) {
        if (loadingSection) loadingSection.style.display = "none";
        if (resultSection) resultSection.style.display = "block";

        if (diseaseNameElem) {
            diseaseNameElem.innerText =
                data.predicted_disease ||
                data.disease ||
                data.prediction ||
                "Unknown Disease";
        }

        // Display Confidence Score Badge
        const confidenceBadge = document.getElementById("confidenceBadge");
        const confidenceValue = document.getElementById("confidenceValue");

        if (data.confidence !== undefined && confidenceBadge && confidenceValue) {
            confidenceValue.innerText = `${data.confidence}%`;
            confidenceBadge.style.display = "inline-flex";
        }

        if (doctorNameElem) doctorNameElem.innerText = data.doctor || data.specialist || "General Physician";
        if (dietPlanElem) dietPlanElem.innerText = data.diet || "Balanced, nutrient-dense diet with adequate hydration.";
        if (descriptionElem) descriptionElem.innerText = data.description || "No specific description available.";

        if (precautionsListElem) {
            precautionsListElem.innerHTML = "";
            const precautions = data.precautions || ["Consult a certified physician for medical assistance."];
            precautions.forEach(p => {
                const li = document.createElement("li");
                li.innerText = p;
                precautionsListElem.appendChild(li);
            });
        }

        if (resultSection) resultSection.scrollIntoView({ behavior: "smooth" });
    }

    // ----------------------------------------------------------------------
    // 5. RESET FUNCTIONALITY
    // ----------------------------------------------------------------------
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

    // ----------------------------------------------------------------------
    // 6. UI & NAVIGATION CONTROLS
    // ----------------------------------------------------------------------
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // Scroll to Top Button Handler
    window.addEventListener("scroll", () => {
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.style.display = "flex";
            } else {
                scrollTopBtn.style.display = "none";
            }
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Animated Counters for Stats
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

    // ----------------------------------------------------------------------
    // 7. INITIALIZATION
    // ----------------------------------------------------------------------
    renderSymptomList();
    renderSelectedSymptoms();
});
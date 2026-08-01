import os
import joblib
import pandas as pd
from disease_info import get_disease_info

# ======================================
# Get project paths
# ======================================

current_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.join(current_dir, "..")

# ======================================
# Load Model
# ======================================

model = joblib.load(
    os.path.join(project_dir, "models", "disease_model.pkl")
)

label_encoder = joblib.load(
    os.path.join(project_dir, "models", "label_encoder.pkl")
)

# ======================================
# Load Dataset
# (Used only to get symptom names)
# ======================================

dataset = pd.read_csv(
    os.path.join(project_dir, "dataset", "Training.csv")
)

# Remove any unwanted empty columns
dataset = dataset.dropna(axis=1, how="all")

# Clean symptom column names (remove extra spaces and trailing formatting issues)
symptom_columns = [
    col.strip().lower() 
    for col in dataset.drop("prognosis", axis=1).columns.tolist()
]

print(f"Loaded {len(symptom_columns)} symptoms.")
print(f"Loaded {len(label_encoder.classes_)} diseases.")

# ======================================
# Prediction Function
# ======================================

def predict_disease(selected_symptoms):

    input_vector = [0] * len(symptom_columns)

    print("\nSelected Symptoms:", selected_symptoms)

    for symptom in selected_symptoms:
        clean_symptom = symptom.strip().lower()

        if clean_symptom in symptom_columns:
            index = symptom_columns.index(clean_symptom)
            input_vector[index] = 1
            print("✓ Matched:", clean_symptom)
        else:
            print("✗ Not Found:", clean_symptom)

    print("Active Symptoms:", sum(input_vector))

    input_df = pd.DataFrame([input_vector], columns=symptom_columns)

    # 1. Get prediction probabilities across all classes
    probabilities = model.predict_proba(input_df)[0]
    
    # 2. Get highest confidence score as a percentage
    confidence_score = round(max(probabilities) * 100, 2)

    # 3. Predict disease index
    prediction = model.predict(input_df)
    disease = label_encoder.inverse_transform(prediction)[0]

    print(f"Predicted Disease: {disease} ({confidence_score}% confidence)")

    info = get_disease_info(disease)

    return {
        "predicted_disease": disease,
        "confidence": confidence_score,  # <-- Added confidence score
        "description": info.get("description", "Information not available."),
        "precautions": info.get("precautions", []),
        "doctor": info.get("doctor", "General Physician"),
        "diet": info.get("diet", "Balanced diet")
    }

# ======================================
# Test the Predictor
# ======================================

if __name__ == "__main__":

    test_symptoms = [
        "itching",
        "skin_rash",
        "nodal_skin_eruptions",
        "dischromic_patches"
    ]
    result = predict_disease(test_symptoms)

    print("\nPrediction Result:\n")

    print("Disease:", result["predicted_disease"])
    print("Description:", result["description"])

    print("\nPrecautions:")
    for i, precaution in enumerate(result["precautions"], start=1):
        print(f"{i}. {precaution}")

    print("\nDoctor:", result["doctor"])
    print("Diet:", result["diet"])
print("Disease info module loaded")
import pandas as pd
import os

# ==========================
# Load disease_info.csv
# ==========================

current_dir = os.path.dirname(os.path.abspath(__file__))

csv_path = os.path.join(
    current_dir,
    "..",
    "dataset",
    "disease_info.csv"
)

df = pd.read_csv(csv_path)

# ==========================
# Normalize Disease Names
# ==========================

def normalize(text):
    return (
        str(text)
        .strip()
        .lower()
        .replace("  ", " ")
    )

df["normalized"] = df["disease"].apply(normalize)

# ==========================
# Get Disease Information
# ==========================

def get_disease_info(disease_name):

    disease_name = normalize(disease_name)

    result = df[df["normalized"] == disease_name]

    if result.empty:

        return {
            "description": "Information not available.",
            "precautions": [],
            "doctor": "General Physician",
            "diet": "Balanced diet"
        }

    row = result.iloc[0]

    precautions = []

    if pd.notna(row["precautions"]):
        precautions = [
            p.strip()
            for p in row["precautions"].split(";")
        ]

    return {

        "description": row["description"],

        "precautions": precautions,

        "doctor": row["doctor"],

        "diet": row["diet"]

    }
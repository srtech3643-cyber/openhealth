import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# ==========================
# Load Dataset
# ==========================

# Get the directory where train_model.py is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Build the absolute path to Training.csv
dataset_path = os.path.join(current_dir, "..", "dataset", "Training.csv")

print("Dataset path:", dataset_path)

print(current_dir)
print(dataset_path)
print(os.path.exists(dataset_path))

df = pd.read_csv(dataset_path)

# Remove any completely empty columns
df = df.dropna(axis=1, how="all")

# 1. Clean feature column headers (strips spaces and lowers characters)
df.columns = df.columns.str.strip().str.lower()

print("Dataset Loaded Successfully")
print(df.head())

# ===== Add these lines HERE =====
print("\nDataset Shape:", df.shape)
print("Number of Symptoms:", len(df.columns) - 1)
print("Number of Diseases:", df["prognosis"].nunique())

# ================================
# Separate Features and Target
# ================================

X = df.drop("prognosis", axis=1)
y = df["prognosis"]


# ==========================
# Encode Disease Names
# ==========================

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# ==========================
# Split Dataset
# ==========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)
# ==========================
# Train Model
# ==========================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# ==========================
# Test Model
# ==========================

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nAccuracy:", accuracy)

print("\nClassification Report:\n")
print(classification_report(y_test, predictions))

# ==========================
# Save Model
# ==========================

model_dir = os.path.join(current_dir, "..", "models")
os.makedirs(model_dir, exist_ok=True)

joblib.dump(model, os.path.join(model_dir, "disease_model.pkl"))
joblib.dump(label_encoder, os.path.join(model_dir, "label_encoder.pkl"))

print("\nModel Saved Successfully!")
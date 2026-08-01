import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# =========================================================================
# Set up paths to safely import predictor.py
# =========================================================================
current_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.join(current_dir, "..")

sys.path.append(current_dir)
sys.path.append(os.path.join(project_dir, "prediction"))

try:
    from predictor import predict_disease
except ModuleNotFoundError as e:
    print(f"Error importing predictor: {e}")
    print("Make sure predictor.py exists and models/ are trained!")

# =========================================================================
# Flask Application & CORS Setup
# =========================================================================
app = Flask(__name__)

# Full CORS configuration to allow requests from GitHub Pages
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "OpenHealth Disease Prediction API is Running"
    }), 200


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    # Handle preflight OPTIONS request from browser
    if request.method == "OPTIONS":
        return "", 200

    # Parse JSON payload safely
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "No JSON payload provided or invalid Content-Type header."
        }), 400

    symptoms = data.get("symptoms", [])

    if not symptoms or not isinstance(symptoms, list):
        return jsonify({
            "error": "No symptoms provided or 'symptoms' must be a list."
        }), 400

    try:
        # Run prediction engine
        result = predict_disease(symptoms)
        
        # Attach user-selected symptoms to the output
        result["selected_symptoms"] = symptoms

        return jsonify(result), 200

    except Exception as e:
        print(f"Prediction Error: {str(e)}")
        return jsonify({
            "error": f"An error occurred during prediction: {str(e)}"
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
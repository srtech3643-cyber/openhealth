import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # <--- ADD THIS LINE RIGHT AFTER 'app = Flask(__name__)'

@app.route('/predict', methods=['POST'])
def predict():
    # Your Random Forest prediction code stays here unchanged
    return jsonify({"result": "your prediction"})


# 4. AT THE VERY BOTTOM (App runner):
if __name__ == '__main__':
    app.run()

# =========================================================================
# Set up paths to safely import predictor.py
# =========================================================================
current_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.join(current_dir, "..")

# Add current directory and project root to system path
sys.path.append(current_dir)
sys.path.append(os.path.join(project_dir, "prediction"))

try:
    from predictor import predict_disease
except ModuleNotFoundError as e:
    print(f"Error importing predictor: {e}")
    print("Make sure predictor.py exists and models/ are trained!")

# =========================================================================
# Flask Application Setup
# =========================================================================
app = Flask(__name__)
CORS(app)  # Enables cross-origin requests for frontend index.html


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "OpenHealth Disease Prediction API is Running"
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    # Parse JSON safely without throwing 400 auto-errors
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
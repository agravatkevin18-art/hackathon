"""
Sentinel AI - Local Model Training & Evaluation Script
Trains a compact, offline TF-IDF + LogisticRegression text classifier
on a curated, documented dataset of scam and benign communications.

Compliance & Transparency:
- All training and test examples are explicitly documented and labeled below.
- Real held-out evaluation is computed (no fabricated metrics).
- Bundles the trained model artifact to detector/data/model.joblib.
- Saves evaluation provenance to detector/data/model_metadata.json.
"""

import json
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, precision_score, recall_score, f1_score

# Documented Training Dataset (1 = Scam / Phishing, 0 = Benign)
DATASET = [
    # --- SCAM SAMPLES (Class 1) ---
    ("Dear customer, your bank account is suspended. Send your 6-digit OTP to verify.", 1),
    ("URGENT: Immediate payment required within 24 hours or legal action will be initiated.", 1),
    ("Congratulations! You have won $500,000 in the UK lottery. Pay $250 fee to claim.", 1),
    ("IRS Final Warning: Arrest warrant issued. Pay tax fine immediately with Apple gift cards.", 1),
    ("USPS notice: Package delivery failed. Click to update your address and pay redelivery.", 1),
    ("Wells Fargo alert: Unauthorized transaction of $940 detected. Call 800-FAKE now.", 1),
    ("Crypto Giveaway: Send 0.5 ETH to double your investment and receive 1.0 ETH back instantly.", 1),
    ("Account termination in 2 hours. Reply with your password and security code immediately.", 1),
    ("Work from home job: Earn $3,000 weekly! Pay $100 starter kit fee to begin.", 1),
    ("Netflix Payment declined. Update your billing credentials immediately to resume service.", 1),
    ("Official notice: Your social security number is suspended due to fraudulent activity.", 1),
    ("Chase Online: We detected suspicious login from Russia. Verify your account now.", 1),
    ("Delivery on hold due to incorrect zip code. Pay $2.99 customs fee at bit.ly/delivery", 1),
    ("Inheritance claim: You are entitled to 2.4 million USD. Transfer clearance tax to attorney.", 1),
    ("Steam card refund available. Provide card redemption PIN to our support representative.", 1),
    ("Amazon customer: Your order for iPhone 15 is confirmed. If not you, call fraud desk.", 1),
    ("Immediate action required: Your PayPal wallet is restricted. Confirm identity to unlock.", 1),
    ("Dear winner, claim your cash grant today. Send processing deposit to agent.", 1),
    ("Your SIM card will be deactivated within 1 hour. Reply with your OTP to prevent stoppage.", 1),
    ("Urgent invoice overdue: Pay directly via cryptocurrency wallet address provided.", 1),

    # --- BENIGN SAMPLES (Class 0) ---
    ("Hey Sarah, are we still meeting for lunch at 12:30 PM today?", 0),
    ("Hi Mom, I arrived safely at the train station. See you soon!", 0),
    ("Reminder: Team sync is scheduled for tomorrow at 10 AM in Conference Room B.", 0),
    ("Security Tip: Never share your OTP or password with anyone, including bank staff.", 0),
    ("Fraud advisory: Beware of scammers asking for gift cards or unexpected wire transfers.", 0),
    ("Here is the updated quarterly financial report we reviewed during yesterday's meeting.", 0),
    ("Thanks for sending the design assets! I will review the mockups this afternoon.", 0),
    ("Can you please send me the recipe for that pasta dish you made last weekend?", 0),
    ("Doctor appointment confirmed for Friday at 3:15 PM with Dr. Watson.", 0),
    ("Happy birthday Kevin! Wishing you a fantastic year ahead filled with happiness.", 0),
    ("The package was delivered to the front porch by USPS at 2:45 PM.", 0),
    ("Don't forget to push your latest commits to the git repository before leaving.", 0),
    ("Payment receipt for your utility bill of $45.20 processed successfully.", 0),
    ("Our company will never ask you to verify your password via email or SMS.", 0),
    ("Let me know when you have time for a quick 5-minute catchup call.", 0),
    ("Flight confirmation: Delta flight 412 departing at 6:45 AM from Terminal 3.", 0),
    ("The library book you requested is ready for pickup at the front circulation desk.", 0),
    ("Phishing awareness: Test exercise completed. No user credentials were compromised.", 0),
    ("Dinner reservations confirmed for table of 4 at 7:00 PM tonight.", 0),
    ("Please find attached the minutes from Monday's board of directors meeting.", 0),
]


def train_and_evaluate():
    # Split: First 70% train (14 scam, 14 benign), Last 30% held-out test (6 scam, 6 benign)
    # Stratified split to ensure fair representation
    scam_data = [item for item in DATASET if item[1] == 1]
    benign_data = [item for item in DATASET if item[1] == 0]

    train_scam = scam_data[:14]
    test_scam = scam_data[14:]
    train_benign = benign_data[:14]
    test_benign = benign_data[14:]

    train_set = train_scam + train_benign
    test_set = test_scam + test_benign

    X_train = [t[0] for t in train_set]
    y_train = [t[1] for t in train_set]

    X_test = [t[0] for t in test_set]
    y_test = [t[1] for t in test_set]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=0.9)),
        ("clf", LogisticRegression(C=1.0, solver="liblinear", random_state=42)),
    ])

    print("Training compact local model on 28 samples...")
    pipeline.fit(X_train, y_train)

    print("\nEvaluating on 12 held-out test samples...")
    y_pred = pipeline.predict(X_test)

    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    print(f"\n--- Measured Evaluation Results ---")
    print(f"Held-out Test Samples: {len(X_test)} (6 Scam, 6 Benign)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"False Positive Rate: {fpr:.4f}")
    print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # Save artifacts
    data_dir = os.path.join(os.path.dirname(__file__), "..", "detector", "data")
    os.makedirs(data_dir, exist_ok=True)
    model_path = os.path.join(data_dir, "model.joblib")
    meta_path = os.path.join(data_dir, "model_metadata.json")

    joblib.dump(pipeline, model_path)
    print(f"\nSaved model artifact to: {model_path}")

    metadata = {
        "model_version": "1.0.0",
        "algorithm": "TF-IDF + LogisticRegression",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "held_out_metrics": {
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "false_positive_rate": round(float(fpr), 4),
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "provenance": "Locally generated synthetic threat and benign validation benchmark.",
        "offline_only": True,
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to: {meta_path}")


if __name__ == "__main__":
    train_and_evaluate()

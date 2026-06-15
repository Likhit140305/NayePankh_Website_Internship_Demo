import pandas as pd
import numpy as np
import pickle
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, precision_score, recall_score, r2_score, mean_squared_error, silhouette_score

# ==========================================
# 1. GENERATE SYNTHETIC DATASET (8,432 RECORDS)
# ==========================================
print("Generating synthetic volunteer dataset...")
np.random.seed(42)
n_samples = 8432

# Features
age = np.random.randint(18, 35, size=n_samples)
cities = np.random.choice(['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kochi', 'Jaipur'], size=n_samples, p=[0.25, 0.20, 0.15, 0.10, 0.10, 0.08, 0.06, 0.06])
colleges = np.random.choice(['Delhi University', 'IIT Bombay', 'Christ University', 'Pune University', 'BITS Pilani', 'NIT Calicut', 'MNIT Jaipur', 'IIT Madras'], size=n_samples)
programs = np.random.choice(['Free Tuition Initiative', 'Digital Literacy', 'Scholarship Guidance', 'Spoken English', 'Women Empowerment', 'Mental Health Awareness'], size=n_samples, p=[0.35, 0.15, 0.10, 0.15, 0.15, 0.10])
availability = np.random.choice(['1-3 hours', '3-6 hours', '6-10 hours', '10+ hours'], size=n_samples, p=[0.25, 0.45, 0.20, 0.10])
tenure_months = np.random.randint(1, 24, size=n_samples)

# Average weekly hours (correlated with availability)
hours_map = {'1-3 hours': 2, '3-6 hours': 4.5, '6-10 hours': 8, '10+ hours': 12}
weekly_hours = np.array([hours_map[a] + np.random.normal(0, 1) for a in availability])
weekly_hours = np.clip(weekly_hours, 1, 15)

# Attendance rate (simulated engagement)
attendance_rate = np.random.uniform(0.3, 1.0, size=n_samples)

# Target: Churn status (1 = Active, 0 = Inactive/Churned)
# Rule-based generation with noise: Churn is more likely for low attendance and short/extremely long tenure
churn_prob = 1 / (1 + np.exp(-(
    -2.0 
    + 4.0 * attendance_rate 
    + 0.1 * weekly_hours 
    - 0.05 * (tenure_months - 12)**2 
    + np.random.normal(0, 0.5, size=n_samples)
)))
status = (churn_prob > 0.5).astype(int)

df = pd.DataFrame({
    'age': age,
    'city': cities,
    'college': colleges,
    'program': programs,
    'availability': availability,
    'tenure_months': tenure_months,
    'weekly_hours': weekly_hours,
    'attendance_rate': attendance_rate,
    'status': status  # 1 = Active, 0 = Churned
})

# Save raw dataset
df.to_csv('volunteer_dataset.csv', index=False)
print("✓ Saved volunteer_dataset.csv")

# ==========================================
# 2. LOGISTIC REGRESSION: VOLUNTEER CHURN
# ==========================================
print("\nTraining Logistic Regression model for Churn Prediction...")
X = df.drop(columns=['status', 'college'])
y = df['status']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

categorical_cols = ['city', 'program', 'availability']
numerical_cols = ['age', 'tenure_months', 'weekly_hours', 'attendance_rate']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

clf_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', LogisticRegression(max_iter=1000))
])

clf_pipeline.fit(X_train, y_train)
y_pred = clf_pipeline.predict(X_test)

# Metrics
acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)

print(f"Churn Model Accuracy: {acc*100:.1f}%")
print(f"Churn Model Precision: {prec*100:.1f}%")
print(f"Churn Model Recall: {rec*100:.1f}%")

# Save classifier pipeline
with open('churn_model.pkl', 'wb') as f:
    pickle.dump(clf_pipeline, f)
print("✓ Saved churn_model.pkl")


# ==========================================
# 3. LINEAR REGRESSION: DONATION FORECASTING
# ==========================================
print("\nTraining Linear Regression model for Donation Forecasting...")
# 24 months of historical donation data (YTD ₹12.4L)
months = np.array(range(1, 25)).reshape(-1, 1)
base_donations = 30000 + 3500 * months.flatten() + np.random.normal(0, 5000, size=24)

# Fit linear trend
reg = LinearRegression()
reg.fit(months, base_donations)

# Forecast next 6 months (months 25 to 30)
future_months = np.array(range(25, 31)).reshape(-1, 1)
forecasted_donations = reg.predict(future_months)

r2 = r2_score(base_donations, reg.predict(months))
rmse = np.sqrt(mean_squared_error(base_donations, reg.predict(months)))

print(f"Donation Forecast R²: {r2:.2f}")
print(f"Donation Forecast RMSE: INR {rmse:.2f}")

# Save regression model
with open('donation_model.pkl', 'wb') as f:
    pickle.dump(reg, f)
print("✓ Saved donation_model.pkl")


# ==========================================
# 4. K-MEANS: VOLUNTEER SEGMENTATION (k=4)
# ==========================================
print("\nRunning K-Means Clustering for Volunteer Segmentation...")
# Segment using numerical characteristics
X_cluster = df[['tenure_months', 'weekly_hours', 'attendance_rate']]
scaler = StandardScaler()
X_cluster_scaled = scaler.fit_transform(X_cluster)

kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X_cluster_scaled)

sil_score = silhouette_score(X_cluster_scaled, clusters)
print(f"K-Means Silhouette Score: {sil_score:.2f}")

# Save kmeans model and scaler
with open('kmeans_model.pkl', 'wb') as f:
    pickle.dump((kmeans, scaler), f)
print("✓ Saved kmeans_model.pkl")


# ==========================================
# 5. OUTPUT SUMMARY METRICS TO JSON
# ==========================================
summary = {
    "metrics": {
        "churn_accuracy": round(acc * 100, 1),
        "churn_precision": round(prec * 100, 1),
        "churn_recall": round(rec * 100, 1),
        "donation_r2": round(r2, 2),
        "donation_rmse": round(rmse, 2),
        "kmeans_silhouette": round(sil_score, 2),
        "dataset_records": n_samples,
        "features_count": X.shape[1]
    },
    "donations_historical": list(base_donations),
    "donations_forecast": list(forecasted_donations)
}

with open('ml_results_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)
print("\n✓ Saved ml_results_summary.json")
print("ML training complete! All assets ready for submission.")

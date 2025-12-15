from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score
import pandas as pd
import joblib

# 1. Load data
df = pd.read_csv('synthetic_patients_data.csv')

target_cols = df.filter(regex='(Type|Glaucoma|glioma|Endometriosis|Suicide)').columns.tolist()
X = df.drop(columns=target_cols)
y = df[target_cols]

print(f"Input features: {X.shape[1]} SNPs")
print(f"Output diseases: {y.shape[1]}")

# 2 . Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3 . Scaling
print("\n Scaling input data...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save the scaler for later use
scaler_path = 'disease_scaler.pkl'
joblib.dump(scaler, scaler_path)
print(f"Scaler saved as: {scaler_path}")


# 4. Build Deep Model
def build_model(input_dim, output_dim):
    model = keras.Sequential([
        keras.layers.Input(shape=(input_dim,)),

        keras.layers.Dense(1024, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.3),

        keras.layers.Dense(512, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.3),

        keras.layers.Dense(256, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.3),

        keras.layers.Dense(128, activation='relu'),
        keras.layers.BatchNormalization(),

        keras.layers.Dense(output_dim, activation='sigmoid')  # multi-label
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0007),
        loss='binary_crossentropy',
        metrics=['accuracy',
                 keras.metrics.Precision(name='precision'),
                 keras.metrics.Recall(name='recall')]
    )
    return model


print("\n Building neural network model...")
model = build_model(X_train_scaled.shape[1], y_train.shape[1])

# 5. Callbacks
checkpoint_path = 'best_disease_model.keras'

callbacks = [
    keras.callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),
    keras.callbacks.ModelCheckpoint(
        filepath=checkpoint_path,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_accuracy',
        mode='max',
        factor=0.5,
        patience=5,
        min_lr=0.00001,
        verbose=1
    )
]

# 6. Train Model
print("\n Training model ...")
history = model.fit(
    X_train_scaled, y_train,
    validation_split=0.2,
    epochs=50,
    batch_size=32,
    callbacks=callbacks,
    verbose=1
)

# 7. Load best model
print(f"\n Loading best model from: {checkpoint_path}")
model = keras.models.load_model(checkpoint_path)

# 8. Evaluation
print("MODEL EVALUATION")
test_loss, test_acc, test_precision, test_recall = model.evaluate(
    X_test_scaled, y_test, verbose=0
)

# Predictions
y_pred_proba = model.predict(X_test_scaled, verbose=0)
y_pred = (y_pred_proba > 0.5).astype(int)

# Calculate F1 score
f1 = f1_score(y_test, y_pred, average='weighted')

# 9. Save the final model
print("\n Saving model ...")

# Save the final model
final_model_path = 'final_disease_model.keras'
model.save(final_model_path)
print(f" Final model saved as: {final_model_path}")

# Save the target column names
model_info = {
    'target_columns': target_cols,
    'feature_columns': X.columns.tolist(),
    'input_shape': X_train_scaled.shape[1],
    'output_shape': y_train.shape[1],
    'threshold': 0.5
}

model_info_path = 'model_info.pkl'
joblib.dump(model_info, model_info_path)
print(f" Model info saved as: {model_info_path}")

print("\n Model training complete!")

# FINAL SUMMARY

print("MODEL SUMMARY")
print(f"""Model Performance:
  • Accuracy:  {test_acc * 100:.2f}%
  • F1 Score:  {f1 * 100:.2f}%
  • Precision: {test_precision * 100:.2f}%
  • Recall:    {test_recall * 100:.2f}%
""")
import sys
import json
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import json
import os


def load_existing_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                print(f"Error decoding JSON from {file_path}")
                return []
    return []

def save_new_data(file_path, new_data):
    # Завантажуємо старі дані
    existing_data = load_existing_data(file_path)
    # Додаємо нові дані
    existing_data.extend(new_data)
    
    # Зберігаємо дані назад у файл
    with open(file_path, 'w') as file:
        json.dump(existing_data, file, indent=4)  # Додаємо indent для кращої читабельності

# Отримуємо дані з командного рядка
if len(sys.argv) > 1:
    new_data = json.loads(sys.argv[1])
    save_new_data('./MLmodels/transferringPennies/trainingData.json', new_data)
else:
    print("No data provided.")

# Завантажуємо всі збережені дані з файлу
coin_data = load_existing_data('./MLmodels/transferringPennies/trainingData.json')

# Перевірка вмісту
# print(f"Loaded {len(coin_data)} entries from the file.")

# Витягуємо потрібні параметри для кластеризації
features = [
    [
        entry["speedLeft"], entry["speedRight"], 
        entry["partLeft"], entry["partRight"], 
        entry["errNumLeft"], entry["errNumRight"], 
        entry["errTimeLeft"], entry["errTimeRight"]
    ]
    for entry in coin_data
]


# Перетворюємо в NumPy масив
X = np.array(features)

# Нормалізуємо дані для кращої роботи DBSCAN
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Використовуємо DBSCAN для кластеризації
dbscan = DBSCAN(eps=0.5, min_samples=2)  # eps - відстань для визначення сусідства, min_samples - мінімальна кількість точок для утворення кластера
labels = dbscan.fit_predict(X_scaled)

# Додаємо мітки до початкових даних
for i, entry in enumerate(coin_data):
    entry["cluster"] = int(labels[i])  # Перетворюємо в int для JSON

# Виводимо результат у JSON-форматі для Node.js
# print(json.dumps(coin_data))

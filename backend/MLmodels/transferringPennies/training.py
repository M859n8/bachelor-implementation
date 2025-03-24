import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Приклад даних для тренування (наприклад, час, відстань, кількість помилок, час помилки)
X_train = np.array([
    [10.5, 5.2, 1, 2.3],  # Дані для правої руки
    [11.2, 5.1, 2, 3.4],  # Дані для лівої руки
    # додайте більше прикладів
])

# Вихідні дані (наприклад, оцінка правої і лівої руки)
y_train = np.array([75, 60])  # 75% для правої руки, 60% для лівої руки

# Створення моделі
model = RandomForestRegressor(n_estimators=100)

# Навчання моделі
model.fit(X_train, y_train)

# Тестування моделі на нових даних
X_test = np.array([[9.8, 5.5, 0, 1.5]])  # Нові дані для тесту (права рука)
predictions = model.predict(X_test)

print("Calculated percent:", predictions)

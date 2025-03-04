# ../hooperVO/fish.png

import cv2
import os
import numpy as np

# Функція для обробки зображення
def process_image(image_path, output_path):
    # Завантажуємо зображення
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Фільтрація шуму (медіанний фільтр)
    denoised = cv2.medianBlur(image, 5)

    # Бінаризація (перетворюємо в чорно-біле)
    # _, binary = cv2.threshold(denoised, 50, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    _, binary = cv2.threshold(denoised, 200, 255, cv2.THRESH_BINARY)


    # Морфологічна обробка (видаляємо дрібні точки)
    kernel = np.ones((2, 2), np.uint8)
    # pre_cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)


    # Інвертуємо кольори (білий фон, чорні лінії)
    # cleaned = cv2.bitwise_not(pre_cleaned)

    # Зберігаємо результат
    cv2.imwrite(output_path, cleaned)

# Шлях до папки з оригінальними зображеннями
input_folder = '../hooperVO'

# Шлях до папки для збереження оброблених зображень
output_folder = '../hooperVO/results'

# Перевіряємо, чи існує папка для збереження результатів, якщо ні - створюємо її
if not os.path.exists(output_folder):
    os.makedirs(output_folder)


# Проходимо по всіх файлах у вказаній папці
for filename in os.listdir(input_folder):
    # Перевіряємо, чи є файл зображенням
    if filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg'):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, f"processed_{filename}")
        
        # Обробляємо зображення
        process_image(input_path, output_path)
        print(f"Processed {filename} and saved to {output_path}")




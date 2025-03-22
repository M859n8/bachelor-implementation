# ../hooperVO/fish.png

import cv2
import os
import numpy as np
from PIL import Image

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
    kernel = np.ones((8, 8), np.uint8)
    # pre_cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)


    # Інвертуємо кольори (білий фон, чорні лінії)
    # cleaned = cv2.bitwise_not(pre_cleaned)

    # Зберігаємо результат
    cv2.imwrite(output_path, cleaned)


def make_white_background_transparent(image_path, output_path):
    # Відкриваємо зображення
    img = Image.open(image_path).convert("RGBA")

    # Отримуємо пікселі зображення
    data = img.getdata()

    # Створюємо новий список пікселів, де білий фон стає прозорим
    new_data = []
    for item in data:
        # Перевіряємо, чи піксель білий
        if item[0] in range(200, 256) and item[1] in range(200, 256) and item[2] in range(200, 256):
            # Робимо піксель прозорим
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    # Оновлюємо пікселі в зображенні
    img.putdata(new_data)

    # Зберігаємо нове зображення
    img.save(output_path)

# # Шлях до папки з оригінальними зображеннями
# input_folder = '../hooperVO'
# input_folder = '../bellsCancellation'
input_folder = '.'


# # Шлях до папки для збереження оброблених зображень
# output_folder = '../hooperVO/results'
# output_folder = '../bellsCancellation/bells'
output_folder = './results'



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
        # make_white_background_transparent(input_path, output_path)
        print(f"Processed {filename} and saved to {output_path}")




import numpy as np
import sys

import svgpathtools
from sklearn.metrics.pairwise import cosine_similarity


def extract_lines(svg_path):
    # Зчитуємо всі шляхи з SVG
    paths, _ = svgpathtools.svg2paths(svg_path)
    
    extracted_lines = []

    for path in paths:
        # Для кожного шляху створюємо окремий масив точок
        path_points = []
        for segment in path:
            start_x, start_y = segment.start.real, segment.start.imag
            end_x, end_y = segment.end.real, segment.end.imag

            length = abs(segment.length())  # Довжина відрізка
            angle = np.arctan2(end_y - start_y, end_x - start_x)  # Кут нахилу
            
            # Додаємо точку до масиву поточного шляху
            path_points.append([start_x, start_y, end_x, end_y, length, angle])
        # Додаємо масив точок цього шляху до загального списку
        extracted_lines.append(path_points)
    
    return extracted_lines  # Повертаємо масив координат

def merge_lines(features, angle_threshold=np.deg2rad(20)):
    merged_features = []

    for path in features:
        merged_path = []
        i = 0  # Ітератор для сегментів в шляху

        while i < len(path) - 1:
            x1, y1, x2, y2, length1, angle1 = path[i]
            x3, y3, x4, y4, length2, angle2 = path[i + 1]

            # Якщо кут між лініями малий – об'єднуємо
            if abs(angle1 - angle2) < angle_threshold:
                # Продовжуємо об'єднувати, поки кути схожі
                new_line = [x1, y1, x4, y4, length1 + length2, (angle1 + angle2) / 2]

                # Замість додавання окремого сегмента, з'єднуємо їх
                while i < len(path) - 2:  # Перевірка для наступних сегментів
                    x3, y3, x4, y4, length3, angle3 = path[i + 2]
                    
                    # Якщо кут між останнім сегментом і наступним також малий, продовжуємо об'єднання
                    if abs(angle2 - angle3) < angle_threshold:
                        new_line[2] = x4  # Оновлюємо кінцеву точку
                        new_line[3] = y4
                        new_line[4] += length3  # Додаємо довжину
                        new_line[5] = (new_line[5] + angle3) / 2  # Оновлюємо середній кут
                        i += 1  # Переходимо до наступного сегмента
                    else:
                        break

                merged_path.append(new_line)
                i += 1  # Перехід до наступного сегмента після об'єднання
            else:
                merged_path.append(path[i])  # Якщо кути не схожі, додаємо поточний сегмент
                i += 1  # Переходимо до наступного сегмента

        merged_features.append(merged_path)

    return merged_features

def clean_small_lines(features, min_length):
    cleaned_lines = []

    for path in features:
        # Для кожного шляху створюємо окремий масив точок
        path_segments = []
        for segment in path:
            # Визначаємо довжину сегмента
            length = segment[4]
            
            # Якщо довжина сегмента більша за мінімальний поріг, додаємо його
            if length >= min_length:
                print("saving")
                path_segments.append(segment)
            else :
                print("cleaning")
        
        # Додаємо масив точок цього шляху до загального списку
        cleaned_lines.append(path_segments)
    
    return cleaned_lines

def save_lines_to_svg(lines, output_path):
    # Створюємо список шляхи (paths) для збереження
    paths = []
    
    for line in lines:
        for segment in line:

            x1, y1, x2, y2, _, _ = segment
            # Створюємо новий шлях, використовуючи лінійний сегмент
            path = svgpathtools.Path(svgpathtools.Line(complex(x1, y1), complex(x2, y2)))
            paths.append(path)
    
    # Створюємо SVG файл з цими шляхами
    svgpathtools.wsvg(paths, filename=output_path)



def normalize_drawings(svg_template, svg_user):
    template_features = extract_lines(svg_template)
    user_features = extract_lines(svg_user)
    merged_features = merge_lines(user_features)
    result_features = clean_small_lines(merged_features, 5.0)

    print(template_features)
    print("user features", len(user_features))
    # print("merged features", len(merged_features))
    print("merged features arr", result_features)


    save_lines_to_svg(result_features, './assets/normalizedOutput.svg')
    # print(merged_features)
    return

    # similarity = cosine_similarity([template_features], [user_features])[0][0]
    # return similarity


if __name__ == "__main__":
    template_path = './assets/example2.svg'
    user_path = sys.argv[1]
    
    similarity = normalize_drawings(template_path, user_path)
    print(similarity)
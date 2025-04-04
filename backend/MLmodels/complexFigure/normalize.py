import numpy as np
import sys

import svgpathtools
from svgwrite import Drawing
from sklearn.metrics.pairwise import cosine_similarity

# import convert_to_graph

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

def extract_example_lines(svg_path):
    # Зчитуємо всі шляхи з SVG
    paths, _ = svgpathtools.svg2paths(svg_path)
    
    extracted_lines = []

    for path in paths:
        # Для кожного шляху створюємо окремий масив точок
        path_points = []
        start_x, start_y = path.start.real, path.start.imag
        end_x, end_y = path.end.real, path.end.imag

        length = abs(path.length())  # Довжина відрізка
        angle = np.arctan2(end_y - start_y, end_x - start_x)  # Кут нахилу

		# Додаємо масив точок цього шляху до загального списку
        extracted_lines.append([start_x, start_y, end_x, end_y, length, angle])
    
    return extracted_lines


def distance(x1, y1, x2, y2):
    return np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

def angle_difference(angle1, angle2):
    diff = abs(angle1 - angle2)
    return min(diff, 2 * np.pi - diff)

def merge_lines(path, angle_threshold=np.deg2rad(30), distance_threshold=5):
    merged_path = []
    i = 0  

    while i < len(path):
        if i == len(path) - 1:  # Останній елемент, просто додаємо
            merged_path.append(path[i])
            x1, y1, x2, y2, length1, angle1 = path[i]
            # print('LASTMeging. startCoords', x1, ' ', y1,'end coords', x2, ' ', y2, 'length', length1 )

            break

        x1, y1, x2, y2, length1, angle1 = path[i]
        x3, y3, x4, y4, length2, angle2 = path[i + 1]

        if angle_difference(angle1, angle2) < angle_threshold and distance(x2, y2, x3, y3) < distance_threshold:
            new_line = [x1, y1, x4, y4, length1 + length2, (angle1 + angle2) / 2]
            i+=1
            while i < len(path) - 1:
                x5, y5, x6, y6, length3, angle3 = path[i + 1]

                if angle_difference(new_line[5], angle3) < angle_threshold and distance(new_line[2], new_line[3], x5, y5) < distance_threshold:
                    new_line[2] = x6  
                    new_line[3] = y6
                    new_line[4] += length3  
                    new_line[5] = (new_line[5] + angle3) / 2  
                    i += 1  
                else:
                    # print('break/ index is ', i+2, 'in range', len(path) )
                    break

            merged_path.append(new_line)

        else:
            merged_path.append(path[i])
            # print('notMerging. startCoords', x1, ' ', y1,'end coords', x2, ' ', y2, 'angles',  np.degrees(abs(angle1 - angle2)) , 'distance' , distance(x2, y2, x3, y3) )

        i += 1  

    return merged_path

def merge_segments(features, angle_threshold=np.deg2rad(30), distance_threshold=5):
    merged_features = []

    for path in features:
        merged_features.extend(merge_lines(path, angle_threshold, distance_threshold))

    return merged_features

def clean_small_lines(features, min_length):
    cleaned_lines = []

    for path in features:
        if not path: 
            continue

        # print('path is', path)
        length = path[4]
		# Якщо довжина сегмента більша за мінімальний поріг, додаємо його
        if length >= min_length:
        # Додаємо масив точок цього шляху до загального списку
            cleaned_lines.append(path)
    return cleaned_lines

def clean_zero_lines(features):
	cleaned_lines = []

	for path in features:
		# Для кожного шляху створюємо окремий масив точок
		path_segments = []
		for segment in path:
			# Визначаємо довжину сегмента
			length = segment[4]
			
			# Якщо довжина сегмента більша за мінімальний поріг, додаємо його
			if length > 0:
				path_segments.append(segment)
         
         # Додаємо масив точок цього шляху до загального списку
		cleaned_lines.append(path_segments)
     
	return cleaned_lines

#debug
def save_lines_to_svg(lines, output_path):
    # Створюємо список шляхи (paths) для збереження
    paths = []
    
    # for line in lines:
    for segment in lines:

        x1, y1, x2, y2, _, _ = segment
            # Створюємо новий шлях, використовуючи лінійний сегмент
        path = svgpathtools.Path(svgpathtools.Line(complex(x1, y1), complex(x2, y2)))
        paths.append(path)
    
    # Створюємо SVG файл з цими шляхами
    svgpathtools.wsvg(paths, filename=output_path)



def normalize_drawings(svg_user):
	# extract template features
	# template_features = extract_example_lines(svg_template)
	# print('template features ', template_features)
	# extract user features
	user_features = extract_lines(svg_user)
	# print('user features ', user_features)

	# clean zero lines . they could mess up next step
	maximaze_features = clean_zero_lines(user_features)
	# merge segments in one curve
	merged_features = merge_segments(maximaze_features)
	# merge all lines
	merged_lines = merge_lines(merged_features)
	# clean small lines 
	result_features = clean_small_lines(merged_lines, 5.0)

	# convert_to_graph.build_graph(result_features)
	# convert_to_graph.build_graph(template_features)

	save_lines_to_svg(result_features, './assets/normalizedOutput.svg')
	# print(merged_features)
	return result_features


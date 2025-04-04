import json
import random
import numpy as np
import os

import normalize  
import convert_to_graph  


def generate_graphs(template_graph, max_simularity, min_simularity,offset, num_graphs=5 ):
	output_dir="trainingData/trainingDataGenerated"
	os.makedirs(output_dir, exist_ok=True)

	# Базовий шаблонний граф (можеш змінити під свої потреби)
	# template_graph = {
	# 	"coords": [[450.0, 650.0], [200.0, 300.0], [700.0, 300.0], [200.0, 650.0], [700.0, 650.0], [755.0, 350.0], [755.0, 600.0], [900.0, 475.0], [200.0, 475.0], [700.0, 475.0], [450.0, 300.0]], 
	# 	"edges": [[1, 2], [1, 3], [2, 4], [3, 4], [8, 9], [10, 0], [1, 4], [3, 2], [2, 7], [4, 7], [2, 4], [9, 7], [5, 6]],
	# 	"similarity": 1.0
	# }
	template_graph = json.loads(template_graph) #transform string into dict

	for i in range(num_graphs):
		graph = template_graph.copy()
		similarity = round(random.uniform(min_simularity, max_simularity), 2)  # Генеруємо випадковий відсоток схожості
		# Додаємо шум у координати залежно від схожості
		# noise_level = (1.0 - similarity) * 0.5 * 100.0  # Чим менша схожість, тим більше змін
		noise_level = (1.0 - similarity) * 0.5 * 10.0 

		perturbed_coords = [[x + random.uniform(-noise_level, noise_level), 
								y + random.uniform(-noise_level, noise_level)] 
							for x, y in template_graph["coords"]]
		
		# Модифікуємо ребра з ймовірністю 1 - similarity
		# perturbed_edges = [edge for edge in template_graph["edges"] if random.random() < edge_similarity]

		
		graph["coords"] = perturbed_coords
		graph["edges"] =  template_graph["edges"]
		graph["similarity"] = similarity

		
		# Зберігаємо у файл
		file_path = os.path.join(output_dir, f"graph{i+offset}.json")
		with open(file_path, "w") as f:
			json.dump(graph, f, indent=4)
		
		print(f"Generated {file_path} with similarity {similarity}")

if __name__ == "__main__":
	# template_path = './assets/example2.svg'
	template_path = '../../assets/figure.svg'

	# user_path = sys.argv[1]

	template_features = normalize.extract_example_lines(template_path)
	# print('length of the features', len(template_features))
	total_lines = len(template_features)
	step_lines = 1 # Скільки ліній видаляємо на кожному кроці
	step_percent = 5

	max_sim = 100
	min_sim = 1

	# Максимальна кількість ітерацій, щоб не видалити більше ліній, ніж є
	max_iterations = total_lines // step_lines

	for i in range(max_iterations):
		current_min = max_sim - (i + 1) * step_percent
		current_max = current_min + step_percent
		print('range', current_min, current_max)
		if current_min < min_sim:
			break  # припиняємо, якщо вийшли за межі допустимої схожості



		# Копія та обрізання ліній
		current_features = template_features[:total_lines - i * step_lines]
		if len(current_features) < 2:
			break  # не можна побудувати граф з дуже малої кількості ліній

		# Побудова графа
		json_template = convert_to_graph.build_graph(current_features)

		# Генерація графів у заданому діапазоні схожості
		generate_graphs(json_template, current_max / 100.0, current_min / 100.0, i*5 )

import json
import random
import numpy as np
import os
import re
import shutil
import normalize  
import convert_to_graph  


def get_next_file_number(output_dir):
    existing_files = os.listdir(output_dir)
    numbers = []
    for filename in existing_files:
        match = re.search(r"graph(\d+)\.json", filename)
        if match:
            numbers.append(int(match.group(1)))
    return max(numbers) + 1 if numbers else 1

def generate_graphs(output_dir, template_graph, max_simularity, min_simularity,file_name_iterator, num_graphs=10):

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

		file_number = get_next_file_number(output_dir)

		# Зберігаємо у файл
		file_path = os.path.join(output_dir, f"graph{file_number}.json")
		with open(file_path, "w") as f:
			json.dump(graph, f, indent=4)
		
		# print(f"Generated {file_path} with similarity {similarity}")


def process_files(template_features,output_dir, max_sim,file_name_iterator, step_lines=2):

	min_sim=0.1
	# to lower max-min / to lower (total/step)
	total_lines = len(template_features)
	max_iterations = total_lines // step_lines

	print('total lines', total_lines)
	step_percent = (max_sim-min_sim)/max_iterations


	for i in range(max_iterations):
		current_min = max_sim - (i + 1) * step_percent
		current_max = current_min + step_percent
		# print('range', current_min, current_max, 'max iterations' , max_iterations)
		if current_min < min_sim:
			break  # припиняємо, якщо вийшли за межі допустимої схожості



		# Копія та обрізання ліній
		current_features = template_features[:total_lines - i * step_lines]
		if len(current_features) < 2:
			break  # не можна побудувати граф з дуже малої кількості ліній
		print('range', current_min, current_max, 'current features length' , len(current_features), 'max iterations' , max_iterations)

		# Побудова графа
		json_template = convert_to_graph.build_graph(current_features)

		# Генерація графів у заданому діапазоні схожості
		generate_graphs(output_dir, json_template, current_max / 100.0, current_min / 100.0, file_name_iterator)



if __name__ == "__main__":
	# template_path = './assets/example2.svg'
	# template_path = '../../assets/figure.svg' #MAIN
	# template_path = '../../assets/normalizedOutput.svg'
	template_dir = '../../assets/complexFigureTemplates'

	file_name_iterator = 0
	
	output_dir="trainingData/generated"
	# Видаляємо директорію, якщо існує
	if os.path.exists(output_dir):
		shutil.rmtree(output_dir)

	# Створюємо порожню директорію
	os.makedirs(output_dir)
	# user_path = sys.argv[1]

	# Перебираємо всі SVG-файли в папці
	for filename in os.listdir(template_dir):
		if filename.endswith('.svg'):
			# Шлях до файлу
			template_path = os.path.join(template_dir, filename)

			# Витягуємо число з назви файлу (наприклад: "template_80.svg" → 80)
			match = re.search(r'(\d+)', filename)
			if match:
				accuracy_percent = int(match.group(1))
			else:
				print(f"⚠️ Не знайдено відсоток у назві: {filename}")
				continue

			# Обробка файлу
			print(f"🔍 Обробляємо {filename} з accuracy {accuracy_percent}%")
			template_features = normalize.extract_example_lines(template_path)
			process_files(template_features, output_dir, accuracy_percent, file_name_iterator)
	# print('length of the features', len(template_features))
	# total_lines = len(template_features)
	# print('total lines', total_lines)
	# step_lines = 2 #на кожному кроці видаляємо по 4 лінії, бо так найбільш логічно видаляються фігури 
	# step_percent = 4.5 # 44/4= 11 , 100%/11 = 9

	# max_sim = 100
	# min_sim = 1

	# # Максимальна кількість ітерацій, щоб не видалити більше ліній, ніж є
	# max_iterations = total_lines // step_lines

	# for i in range(max_iterations):
	# 	current_min = max_sim - (i + 1) * step_percent
	# 	current_max = current_min + step_percent
	# 	# print('range', current_min, current_max, 'max iterations' , max_iterations)
	# 	if current_min < min_sim:
	# 		break  # припиняємо, якщо вийшли за межі допустимої схожості



	# 	# Копія та обрізання ліній
	# 	current_features = template_features[:total_lines - i * step_lines]
	# 	if len(current_features) < 2:
	# 		break  # не можна побудувати граф з дуже малої кількості ліній
	# 	print('range', current_min, current_max, 'current features length' , len(current_features), 'max iterations' , max_iterations)

	# 	# Побудова графа
	# 	json_template = convert_to_graph.build_graph(current_features)

	# 	# Генерація графів у заданому діапазоні схожості
	# 	generate_graphs(output_dir, json_template, current_max / 100.0, current_min / 100.0, i)

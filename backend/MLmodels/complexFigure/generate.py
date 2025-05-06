import json
import random
import numpy as np
import os
import re
import shutil
import normalize  
import convert_to_graph  


# finds last file number in output dir and returns number for a new file
def get_next_file_number(output_dir):
    existing_files = os.listdir(output_dir)
    numbers = []
    for filename in existing_files:
        match = re.search(r"graph(\d+)\.json", filename)
        if match:
            numbers.append(int(match.group(1)))
    return max(numbers) + 1 if numbers else 1

# generate variations from a template
def generate_graphs(output_dir, template_graph, max_simularity, min_simularity,file_name_iterator, num_graphs=10):

	template_graph = json.loads(template_graph) #transform string into dict

	for i in range(num_graphs):
		graph = template_graph.copy()
		# generate random similarity
		similarity = round(random.uniform(min_simularity, max_simularity), 2)  
		# add noise to the coordinates depending on similarity
		noise_level = (1.0 - similarity) * 0.5 * 10.0 

		perturbed_coords = [[x + random.uniform(-noise_level, noise_level), 
								y + random.uniform(-noise_level, noise_level)] 
							for x, y in template_graph["coords"]]
		
		# fill the values
		graph["coords"] = perturbed_coords
		graph["edges"] =  template_graph["edges"]
		graph["similarity"] = similarity
		
		file_number = get_next_file_number(output_dir)

		# save json representation of the graph
		file_path = os.path.join(output_dir, f"graph{file_number}.json")
		with open(file_path, "w") as f:
			json.dump(graph, f, indent=4)
		
		# print(f"Generated {file_path} with similarity {similarity}")

# process template graphs 
def process_files(template_features,output_dir, max_sim,file_name_iterator, step_lines=2):
	#minimum simularity value (max is set in the file name)
	min_sim=0.1
	total_lines = len(template_features)
	max_iterations = total_lines // step_lines # each step delete last two lines

	# print('total lines', total_lines)
	step_percent = (max_sim-min_sim)/max_iterations #calculate percentage reduction per step

	for i in range(max_iterations):
		# calculate percentage limits for the current number of features
		current_min = max_sim - (i + 1) * step_percent
		current_max = current_min + step_percent
		# print('range', current_min, current_max, 'max iterations' , max_iterations)
		if current_min < min_sim:
			break  # stop if we exceed the acceptable similarity limits

		# delete last two lines from features
		current_features = template_features[:total_lines - i * step_lines]
		if len(current_features) < 2:
			break  # can not build a graph from less then two lines
		# print('range', current_min, current_max, 'current features length' , len(current_features), 'max iterations' , max_iterations)

		# build the graph
		json_template = convert_to_graph.build_graph(current_features)

		# generating graphs in a given similarity range
		generate_graphs(output_dir, json_template, current_max / 100.0, current_min / 100.0, file_name_iterator)



if __name__ == "__main__":
	# directory with templates
	template_dir = '../../assets/complexFigureTemplates'

	file_name_iterator = 0
	
	output_dir="trainingData/generated"
	# recreate directory if exists
	if os.path.exists(output_dir):
		shutil.rmtree(output_dir)
	os.makedirs(output_dir)

	# go through all templates in directory
	for filename in os.listdir(template_dir):
		if filename.endswith('.svg'):
			
			template_path = os.path.join(template_dir, filename)

			# extract a number from the file that represents the percentage of similarity to the original
			match = re.search(r'(\d+)', filename)
			if match:
				accuracy_percent = int(match.group(1))
			else:
				print(f"No percent number in file: {filename}")
				continue

			# process template
			print(f"Process {filename} with accuracy {accuracy_percent}%")
			template_features = normalize.extract_example_lines(template_path)
			process_files(template_features, output_dir, accuracy_percent, file_name_iterator)


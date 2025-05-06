import numpy as np
import sys

import normalize
import convert_to_graph
import predict


if __name__ == "__main__":


	user_path = sys.argv[1] # get path to the user file

	#extract and normalize features
	result_features = normalize.normalize_drawings( user_path)

	# template_features = normalize.extract_example_lines(template_path)
	# print('length of the features', len(result_features))
	# json_template = convert_to_graph.build_graph(template_features)


	#convert features to graph
	json_user = convert_to_graph.build_graph(result_features)
	similarity = predict.predict_similarity(json_user) #calculate similarity
	#send it to stdout (backend will get it)
	print(similarity)

"""
Author: Maryna Kucher
Description: Main pipeline script. Handles SVG-to-graph conversion and
calls the trained model to assess similarity between user input and template.
Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
"""

import numpy as np
import sys

import normalize
import convert_to_graph
import predict


if __name__ == "__main__":


	user_path = sys.argv[1] # get path to the user file

	#extract and normalize features
	result_features = normalize.normalize_drawings( user_path)

	#convert features to graph
	json_user = convert_to_graph.build_graph(result_features)
	similarity = predict.predict_similarity(json_user) #calculate similarity
	#send it to stdout (backend contriller will get it)
	print(similarity)

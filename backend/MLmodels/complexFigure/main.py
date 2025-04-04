import numpy as np
import sys

import normalize
import convert_to_graph
import predict


if __name__ == "__main__":
	# template_path = './assets/example2.svg'
	template_path = '../../assets/figure.svg'

	# user_path = sys.argv[1]

	# result_features = normalize.normalize_drawings( user_path)
	template_features = normalize.extract_example_lines(template_path)
	# print('length of the features', len(template_features))

	# json_user = convert_to_graph.build_graph(result_features)
	json_template = convert_to_graph.build_graph(template_features)

	# predict.predict_similarity(json_user, json_template)

    # print(similarity)
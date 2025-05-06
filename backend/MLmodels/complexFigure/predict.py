import torch
from train import GCN, create_graph, load_data_from_json  # Імпортуємо модель 
import json
import sys

# get data from json string
def load_data_json_string(json_string):
	data = json.loads(json_string) 
	return create_graph(data, False)

# call model and predict similarity
def predict_similarity(graph_json):
	# initialize a GCN (Graph Convolutional Network) model with the given input and hidden layer sizes.
	# input_dim=2 — assumes that each vertex has two numeric attributes (x and y coordinates)
	model = GCN(input_dim=2, hidden_dim=36)  
	# load the saved model weights that were pre-trained on similar graphs
	model.load_state_dict(torch.load("./MLmodels/complexFigure/gcn_model.pth"))
	model.eval() # put the model into evaluation mode
	# convert the input JSON string into a format suitable for processing by the model
	graph = load_data_json_string(graph_json)

	# calculate the similarity of the graph to a reference or other sample.
	# torch.no_grad() disables gradient computation to speed up and reduce memory usage.
	with torch.no_grad():
		similarity = model(graph).item()

	return similarity

# def predict_similarity_test(num=1): #debug
# 	model = GCN(input_dim=2, hidden_dim=36)  # Ініціалізуємо архітектуру
# 	model.load_state_dict(torch.load("gcn_model.pth"))  # Завантажуємо збережені ваги
# 	model.eval()  # Переводимо в режим передбачення

# 	# graph = load_data_from_json(graph_json)
# 	graph = load_data_from_json(f"./trainingData/generated/graph{num}.json", False)
# 	# graph = load_data_from_json(f"./trainingData/graph{num}.json", False)


# 	with torch.no_grad():
# 		similarity = model(graph).item()

# 	print(f'Similarity: {similarity:.2f}')

# 	return similarity

# дебаг
# if len(sys.argv) > 1:
#     predict_similarity_test(int(sys.argv[1]))


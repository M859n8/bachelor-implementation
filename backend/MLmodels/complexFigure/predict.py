import torch
from train import GCN, create_graph, load_data_from_json  # Імпортуємо модель 
import json
import sys

# Замість читання з файлу, ми парсимо JSON з рядка
def load_data_json_string(json_string):
	data = json.loads(json_string)  # Парсимо JSON з рядка
	return create_graph(data["coords"], data["edges"])


def predict_similarity(graph_json):
	model = GCN(input_dim=2, hidden_dim=36)  # Ініціалізуємо архітектуру
	model.load_state_dict(torch.load("gcn_model.pth"))  # Завантажуємо збережені ваги
	model.eval()  # Переводимо в режим передбачення

	# model = torch.load("gcn_model.pth")
	# model.eval()

	graph = load_data_json_string(graph_json)


	with torch.no_grad():
		similarity = model(graph).item()

	print(f'Similarity: {similarity:.2f}')
	return similarity

def predict_similarity_test(num=1):
	model = GCN(input_dim=2, hidden_dim=36)  # Ініціалізуємо архітектуру
	model.load_state_dict(torch.load("gcn_model.pth"))  # Завантажуємо збережені ваги
	model.eval()  # Переводимо в режим передбачення

	# graph = load_data_from_json(graph_json)
	graph = load_data_from_json(f"./trainingData/generated/graph{num}.json", False)
	# graph = load_data_from_json(f"./trainingData/graph{num}.json", False)

	with torch.no_grad():
		similarity = model(graph).item()

	print(f'Similarity: {similarity:.2f}')

	return similarity

# дебаг
# if sys.argv[1]:
# 	predict_similarity_test(int(sys.argv[1]))

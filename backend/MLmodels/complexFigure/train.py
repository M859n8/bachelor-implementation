import torch
import torch.nn as nn
import torch.optim as optim
import json
from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.data import Data, Batch
import os
import random

# Graph Matching Network (GMN)
class GCN(nn.Module):
	def __init__(self, input_dim, hidden_dim):
		super(GCN, self).__init__()
		self.conv1 = GCNConv(input_dim, hidden_dim) #Це графові згорткові шари (Graph Convolutional Network, GCN), 
													#які обробляють графові структури.
		self.conv2 = GCNConv(hidden_dim, hidden_dim)
		self.conv3 = GCNConv(hidden_dim, hidden_dim)
		self.fc = nn.Linear(hidden_dim, 1) # Повнозв’язний шар, 
							# що зменшує розмірність прихованого представлення графів 
							# до одного числа (ймовірність схожості).

	#   Прямий прохід
	def forward(self, data):
		x, edge_index, batch = data.x, data.edge_index, data.batch
		
		# Проходимо через два GCN шари
		x = self.conv1(x, edge_index).relu()
		x = self.conv2(x, edge_index).relu()
		x = self.conv3(x, edge_index).relu()

		
		# Глобальний пулінг
		x = global_mean_pool(x, batch)
		
		# Прогноз схожості через повнозв'язний шар
		out = self.fc(x)
		# return out
		return torch.sigmoid(out)  # Оскільки схожість від 0 до 1, застосуємо сигмоїду

# Load graph data from JSON
def load_data_from_json(file_path, train=True):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return create_graph(data, train)

# Create graph with coordinates
def create_graph(data_json, train):

	coords = torch.tensor(data_json["coords"], dtype=torch.float)  # Вершини

	edges = data_json.get("edges", [])
	# if len(edges) == 0:
	#     # Якщо немає ребер, додаємо self-loop на кожну вершину
	#     num_nodes = len(coords)
	#     edge_index = torch.tensor([[i, i] for i in range(num_nodes)], dtype=torch.long).t().contiguous()
	# else:
	#     edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()


	edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()



	if train:
		# print('given similarity ', data_json["similarity"])
	# 	# y = torch.tensor([data_json["similarity"]], dtype=torch.float)
	# 	y = torch.tensor([data_json["similarity"]], dtype=torch.float).unsqueeze(0)
	# else:
	# 	y = None
		# print('given similarity ', data_json["similarity"]) #debug only
		y = torch.tensor([data_json["similarity"]], dtype=torch.float).unsqueeze(0) #ЯКЩО ПРОБЛЕМИ ПРИ ТРЕНУВАННІ ПРОСТО ВИНЕСИ ЦЕ З ІФУ
	else:
		y=None
	# print('given similarity ', data_json["similarity"]) #delete after test

	data = Data(x=coords, edge_index=edge_index, y=y)
	return data

def accuracy(pred_y, y, threshold=0.1):
    return ((pred_y - y).abs() < threshold).float().mean()  # Частка передбачень, які в межах 10%


# Тренування запускається тільки якщо файл виконується напряму
if __name__ == "__main__":
	# Load training graphs and similarity labels
	folder_path = "./trainingData/generated"
	# folder_path = "./trainingData"
	# train_data = [
	# 	load_data_from_json("./trainingData/graph1.json"),
	# 	load_data_from_json("./trainingData/graph2.json"),
	# 	load_data_from_json("./trainingData/graph3.json"),
	# 	load_data_from_json("./trainingData/graph4.json"),
	# 	load_data_from_json("./trainingData/graph5.json"),
	# 	load_data_from_json("./trainingData/graph6.json"),
	# ]


	# Отримуємо всі файли, які закінчуються на .json
	train_data_files = [f for f in os.listdir(folder_path) if f.endswith(".json")]

	# Перемішуємо список файлів
	random.shuffle(train_data_files)

	# Завантажуємо всі графи
	train_data = [load_data_from_json(os.path.join(folder_path, filename)) for filename in train_data_files]

	# for i, data in enumerate(train_data):
	# 		print(f"{i}: {data.y}")

	# Model setup
	# input_dim - Кількість ознак (features) на кожній вершині графа.
	# hidden_dim - Кількість нейронів у прихованому (hidden) шарі графової нейромережі.
	model = GCN(input_dim=2, hidden_dim=36)
	criterion = nn.MSELoss()
	# criterion = nn.BCEWithLogitsLoss()
	optimizer = optim.Adam(model.parameters(), lr=0.001) # останній аргумент це швидкість навчання. зменшуй коли великі дані на вході 
	# Training loop
	for epoch in range(200):
		model.train()
		total_loss = 0
		for data in train_data:
			optimizer.zero_grad()

			# Прогнозування схожості
			similarity_pred = model(data)
			# print("Raw output:", similarity_pred)
			# Обчислення втрат
			loss = criterion(similarity_pred, data.y)
			acc = accuracy(similarity_pred, data.y)
			loss.backward()
			# print(f"Before step: {model.fc.weight}")
			optimizer.step()
			# print(f"After step: {model.fc.weight}")


			total_loss += loss.item()
			# if epoch % 10 == 0: #bad debug
			# 	print(similarity_pred[:10], data.y[:10])
			# print("data.y:", data.y)  # має бути tensor([0.0]) або tensor([1.0])
			# print("similarity_pred:", similarity_pred)  # типу tensor([[0.23]])

		if epoch % 10 == 0:
			# print(similarity_pred, data.y)
			print(f'Epoch {epoch}, Loss: {total_loss / len(train_data)}, Accurancy: {acc*100:.2f}%')

		# for i, data in enumerate(train_data):
		# 	print(f"{i}: {data.y}")

    # Save trained model
	torch.save(model.state_dict(), "gcn_model.pth")
	# torch.save(model, "gcn_model.pth")


# predict_similarity("./trainingData/graph5.json", "./trainingData/graph6.json")

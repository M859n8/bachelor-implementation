import torch
import torch.nn as nn
import torch.optim as optim
import json
from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.data import Data, Batch

# Graph Matching Network (GMN)
class GCN(nn.Module):
	def __init__(self, input_dim, hidden_dim):
		super(GCN, self).__init__()
		self.conv1 = GCNConv(input_dim, hidden_dim) #Це графові згорткові шари (Graph Convolutional Network, GCN), 
													#які обробляють графові структури.
		self.conv2 = GCNConv(hidden_dim, hidden_dim)
		self.fc = nn.Linear(hidden_dim, 1) # Повнозв’язний шар, 
							# що зменшує розмірність прихованого представлення графів 
							# до одного числа (ймовірність схожості).

	#   Прямий прохід
	def forward(self, data):
		x, edge_index, batch = data.x, data.edge_index, data.batch
		
		# Проходимо через два GCN шари
		x = self.conv1(x, edge_index).relu()
		x = self.conv2(x, edge_index).relu()
		
		# Глобальний пулінг
		x = global_mean_pool(x, batch)
		
		# Прогноз схожості через повнозв'язний шар
		out = self.fc(x)
		return torch.sigmoid(out)  # Оскільки схожість від 0 до 1, застосуємо сигмоїду

# Load graph data from JSON
def load_data_from_json(file_path, train=True):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return create_graph(data, train)

# Create graph with coordinates
def create_graph(data_json, train):
    coords = torch.tensor(data_json["coords"], dtype=torch.float)  # Вершини
    edge_index = torch.tensor(data_json["edges"], dtype=torch.long).t().contiguous()  # Ребра
    y = torch.tensor([data_json["similarity"]], dtype=torch.float) if train else None  # Цільове значення
    
    return Data(x=coords, edge_index=edge_index, y=y)

def accuracy(pred_y, y, threshold=0.1):
    return ((pred_y - y).abs() < threshold).float().mean()  # Частка передбачень, які в межах 10%


# Тренування запускається тільки якщо файл виконується напряму
if __name__ == "__main__":
	# Load training graphs and similarity labels
	train_data = [
		load_data_from_json("./trainingData/graph1.json"),
		load_data_from_json("./trainingData/graph2.json"),
		load_data_from_json("./trainingData/graph3.json"),
		load_data_from_json("./trainingData/graph4.json"),
		load_data_from_json("./trainingData/graph5.json"),
		load_data_from_json("./trainingData/graph6.json"),
	]

	# Model setup
	model = GCN(input_dim=2, hidden_dim=16)
	criterion = nn.MSELoss()
	optimizer = optim.Adam(model.parameters(), lr=0.01)
	# Training loop
	for epoch in range(100):
		model.train()
		total_loss = 0
		for data in train_data:
			optimizer.zero_grad()

			# Прогнозування схожості
			similarity_pred = model(data)

			# Обчислення втрат
			loss = criterion(similarity_pred, data.y)
			acc = accuracy(similarity_pred, data.y)
			loss.backward()

			optimizer.step()

			total_loss += loss.item()
			# if epoch % 10 == 0: #bad debug
			# 	print(similarity_pred[:10], data.y[:10])
		if epoch % 10 == 0:
			print(similarity_pred[:10], data.y[:10])
			print(f'Epoch {epoch}, Loss: {total_loss / len(train_data)}, Accurancy: {acc*100:.2f}%')

    # Save trained model
	torch.save(model.state_dict(), "gcn_model.pth")

# predict_similarity("./trainingData/graph5.json", "./trainingData/graph6.json")

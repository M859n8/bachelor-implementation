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
		self.conv1 = GCNConv(input_dim, hidden_dim) #graph convolutional layers
		self.conv2 = GCNConv(hidden_dim, hidden_dim)
		self.conv3 = GCNConv(hidden_dim, hidden_dim)
		# fully connected layer to convert the global representation of a graph into a single number (similarity)
		self.fc = nn.Linear(hidden_dim, 1) 

	# direct interaction
	def forward(self, data):
		x, edge_index, batch = data.x, data.edge_index, data.batch # get data from object data
		
		# go through GCN layers
		x = self.conv1(x, edge_index).relu()
		x = self.conv2(x, edge_index).relu()
		x = self.conv3(x, edge_index).relu()

		
		# Pooling of features of all nodes within each graph (global averaging)
		x = global_mean_pool(x, batch)
		
		# Similarity estimation through a fully connected layer
		out = self.fc(x)
		# return values ​​in the range [0, 1] (similarity), so apply sigmoid
		return torch.sigmoid(out)  

# Load graph data from JSON
def load_data_from_json(file_path, train=True):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return create_graph(data, train)

# Create graph from nodes and edges
def create_graph(data_json, train):

	coords = torch.tensor(data_json["coords"], dtype=torch.float)  
	edges = data_json.get("edges", [])
	# Edge indices in PyTorch Geometric format
	edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous() 

	if train:
		# If training — add the correct answer (similarity value)
		y = torch.tensor([data_json["similarity"]], dtype=torch.float).unsqueeze(0) 
	else:
		y=None # In test mode, the label is missing
	data = Data(x=coords, edge_index=edge_index, y=y) # Form a graph object
	return data

def accuracy(pred_y, y, threshold=0.1):
	# Calculates how close the predicted value is to the correct one (within threshold)
    return ((pred_y - y).abs() < threshold).float().mean()  



if __name__ == "__main__":
	# Load training graphs and similarity labels
	folder_path = "./trainingData/generated"

	# Get all files that end with .json
	train_data_files = [f for f in os.listdir(folder_path) if f.endswith(".json")]

	# Shuffle files for a more random training order
	random.shuffle(train_data_files)

	# load all graphs
	train_data = [load_data_from_json(os.path.join(folder_path, filename)) for filename in train_data_files]

	# Initialize the model
	# input_dim — the number of features at each vertex (in this case 2 — x, y coordinates)
	# hidden_dim — the number of neurons in the hidden layers
	model = GCN(input_dim=2, hidden_dim=36)
	# Loss function
	criterion = nn.MSELoss()
	# Optimizer — Adam with learning rate 0.001
	optimizer = optim.Adam(model.parameters(), lr=0.001) 
	# Training loop
	for epoch in range(200):
		model.train() # Put the model into training mode
		total_loss = 0 # Total loss for the epoch
		for data in train_data: 
			optimizer.zero_grad() # Reset gradients

			similarity_pred = model(data) # Similarity prediction
			# Calculate loss and accuracy
			loss = criterion(similarity_pred, data.y)
			acc = accuracy(similarity_pred, data.y)
			loss.backward() # Backpropagation of error
			optimizer.step()# Update weights

			total_loss += loss.item()

		if epoch % 10 == 0: # Output statistics every 10 epochs
			print(f'Epoch {epoch}, Loss: {total_loss / len(train_data)}, Accurancy: {acc*100:.2f}%')

    # Save trained model
	torch.save(model.state_dict(), "gcn_model.pth")



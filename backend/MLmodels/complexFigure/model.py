import torch
import torch.nn as nn
import torch.optim as optim
import json
from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.data import Data, Batch

# Graph Matching Network (GMN)
class GMN(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(GMN, self).__init__()
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        self.fc = nn.Linear(hidden_dim * 2, 1)

    def forward(self, data1, data2):
        x1, edge_index1, batch1 = data1.x, data1.edge_index, data1.batch
        x2, edge_index2, batch2 = data2.x, data2.edge_index, data2.batch
        
        x1 = self.conv1(x1, edge_index1).relu()
        x1 = self.conv2(x1, edge_index1).relu()
        x1 = global_mean_pool(x1, batch1)
        
        x2 = self.conv1(x2, edge_index2).relu()
        x2 = self.conv2(x2, edge_index2).relu()
        x2 = global_mean_pool(x2, batch2)
        
        out = torch.cat([x1, x2], dim=1)
        out = self.fc(out)
        return torch.sigmoid(out)

# Load graph data from JSON
def load_data_from_json(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return create_graph(data["coords"], data["edges"])

# Create graph with coordinates
def create_graph(coords, edges):
    x = torch.tensor(coords, dtype=torch.float)  # Node features (coordinates)
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()  # Edge list
    data = Data(x=x, edge_index=edge_index)
    data.batch = torch.zeros(data.x.shape[0], dtype=torch.long)
    return data

# Load training graphs and similarity labels
train_data = [
    (load_data_from_json("../backend/MLmodels/complexFigure/trainingData/graph1.json"), load_data_from_json("../backend/MLmodels/complexFigure/trainingData/graph2.json"), 0.8),
    (load_data_from_json("../backend/MLmodels/complexFigure/trainingData/graph3.json"), load_data_from_json("../backend/MLmodels/complexFigure/trainingData/graph4.json"), 0.5)
]

# Model setup
model = GMN(input_dim=2, hidden_dim=16)
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# Training loop
for epoch in range(100):
    total_loss = 0
    for graph1, graph2, similarity in train_data:
        optimizer.zero_grad()
        similarity_pred = model(graph1, graph2)
        target_similarity = torch.tensor([[similarity]])
        loss = criterion(similarity_pred, target_similarity)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    if epoch % 10 == 0:
        print(f'Epoch {epoch}, Loss: {total_loss / len(train_data)}')

# Save trained model
torch.save(model.state_dict(), "gmn_model.pth")

def load_trained_model():
    trained_model = GMN(input_dim=2, hidden_dim=16)
    trained_model.load_state_dict(torch.load("gmn_model.pth"))
    trained_model.eval()
    return trained_model

# Prediction function
def predict_similarity(graph_file1, graph_file2):
    graph1 = load_data_from_json(graph_file1)
    graph2 = load_data_from_json(graph_file2)
    model = load_trained_model()
    with torch.no_grad():
        similarity = model(graph1, graph2).item()
    print(f'Similarity: {similarity:.2f}')
    return similarity

# predict_similarity("./trainingData/graph5.json", "./trainingData/graph6.json")

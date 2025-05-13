"""
Author: Maryna Kucher
Description: Loads a saved model and performs similarity prediction
between template and user-drawn graph.
Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
"""

import torch
from train import GCN, create_graph, load_data_from_json  
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
	# torch.no_grad() disables saving of calculation history to speed up and reduce memory usage.
	with torch.no_grad():
		similarity = model(graph).item()

	return similarity




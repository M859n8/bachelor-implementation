import networkx as nx
import json
import numpy as np
from scipy.spatial import KDTree
import matplotlib.pyplot as plt  #for drawing


 
# build graph from given lines
def build_graph(lines, threshold=30):
	edges = []
	points = []
	# collect all lines ends
	for line in lines:
		if len(line) >= 4:  # check if there are start and end coords
			x1, y1, x2, y2 = line[:4]
			edges.append(((x1, y1), (x2, y2)))

	# get all unique nodes
	points = list(set([pt for edge in edges for pt in edge]))

	# Use KDTree to cluster nearby points
	tree = KDTree(points)
	clusters = {}
	# dict with points where coordinates are keys and id is value
	merged_points = {}

	for i, pt in enumerate(points):
		if i in clusters:
			continue  # if point already belongs to a cluster, skip it

		# find all points within the threshold radius
		indices = tree.query_ball_point(pt, threshold)
		cluster_pts = [points[idx] for idx in indices]

		# calculate the average cluster position
		avg_pt = tuple(np.mean(cluster_pts, axis=0))
		merged_points[avg_pt] = len(merged_points)  # use the length of merged_points as an index

		# mark all these points as part of the cluster
		for idx in indices:
			clusters[idx] = avg_pt

	# create a list of edges, but instead of the original node coordinates 
	# use the average position of the cluster to which this node belongs
	new_edges = [(merged_points[clusters[points.index(start)]], merged_points[clusters[points.index(end)]]) for start, end in edges]


	normalized_edges = []
	num_nodes = len(merged_points)
	for u, v in new_edges: #make the graph undirected
		normalized_edges.append((u, v))
		normalized_edges.append((v, u))
	# add loop edges (from the node to itself)
	loop_index = [(i, i) for i in range(num_nodes)] 
	normalized_edges.extend(loop_index)  

	# create json data for model analysis
	json_data = {
		
		"coords": [[float(pt[0])/10.0, float(pt[1])/10.0] for pt in merged_points],
		"edges": normalized_edges

	}
	# convert to a JSON string
	json_str = json.dumps(json_data)


	return json_str


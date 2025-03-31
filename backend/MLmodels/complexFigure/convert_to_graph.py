import networkx as nx
import numpy as np
from scipy.spatial import KDTree
# from scipy.spatial import KDTree
import matplotlib.pyplot as plt  #for drawing

import model

def visualize_graph(G):
    plt.figure(figsize=(8, 8))
    pos = {node: node for node in G.nodes()}  # Вершини розташовані за їхніми координатами
    nx.draw(G, pos, with_labels=True, node_color='lightblue', edge_color='gray', node_size=300)
    plt.show()
 

def build_graph(lines, threshold=30):
	G = nx.Graph()
	edges = []
	points = []
	# 1️⃣ Збираємо всі кінці ліній
	for line in lines:
		if len(line) >= 4:  # Переконуємось, що є хоча б x1, y1, x2, y2
			x1, y1, x2, y2 = line[:4]
			edges.append(((x1, y1), (x2, y2)))

	# Витягуємо всі унікальні точки
	points = list(set([pt for edge in edges for pt in edge]))
	print('Points before cluster', points)

	# Використовуємо KDTree для кластеризації близьких точок
	tree = KDTree(points)
	clusters = {}
	merged_points = []

	for i, pt in enumerate(points):
		if i in clusters:
			continue  # Якщо точка вже належить до кластеру, пропускаємо її

		# Знаходимо всі точки в радіусі threshold
		indices = tree.query_ball_point(pt, threshold)
		cluster_pts = [points[idx] for idx in indices]

		# Обчислюємо середнє положення кластеру
		avg_pt = tuple(np.mean(cluster_pts, axis=0).astype(int))
		merged_points.append(avg_pt)

		# Позначаємо всі ці точки як частину кластеру
		for idx in indices:
			clusters[idx] = avg_pt

	# Створюємо оновлений список ребер
	# Цей вираз створює новий список ребер, але замість початкових точок використовує їхні згруповані версії
	new_edges = [(clusters[points.index(start)], clusters[points.index(end)]) for start, end in edges]

	# Видаляємо дублікати ребер
	edges = list(set(new_edges))

	# Додаємо вершини
	# Додаємо вершини та ребра у граф
	G.add_nodes_from(set(clusters.values()))  # Додаємо тільки унікальні вершини
	G.add_edges_from(new_edges)
	# Дебаг: Виводимо вершини графа
	print("Graph vershyny", G.nodes(data=True))
	# visualize_graph(G)

	model.predict_similarity("../backend/MLmodels/complexFigure/trainingData/graph5.json", "../backend/MLmodels/complexFigure/trainingData/graph6.json")

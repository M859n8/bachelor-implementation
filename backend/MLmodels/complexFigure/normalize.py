"""
Author: Maryna Kucher
Description: This script normalizes user-drawn SVG data, simplifying 
its path structure while preserving the overall topology.
Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions
"""

import numpy as np
import sys

import svgpathtools

# extract lines from svg image
def extract_lines(svg_path):
    # extract paths from svg
    paths, _ = svgpathtools.svg2paths(svg_path)
    # array for saving complete line
    extracted_lines = []

    for path in paths:
        # array for saving segments start, end and angle
        path_points = []
		# the user's drawing consists of curved lines, 
		# so there is a need to divide the path into separate segments
        for segment in path:
			# save start and end point for each segment in each line 
            start_x, start_y = segment.start.real, segment.start.imag
            end_x, end_y = segment.end.real, segment.end.imag

            length = abs(segment.length())  # save segment length
            angle = np.arctan2(end_y - start_y, end_x - start_x) # save angle
            
            # add segment to path 
            path_points.append([start_x, start_y, end_x, end_y, length, angle])
        # an array of segments forms a line
		# add a line to an array of lines
        extracted_lines.append(path_points)
    return extracted_lines  

# (required for generation)debug: example lines processing does not require a normalization
def extract_example_lines(svg_path):
    # get all paths from svg
    paths, _ = svgpathtools.svg2paths(svg_path)
    
    extracted_lines = []
	# the template consists of clear straight lines, 
	# so there is no need to divide them into segments
    for path in paths:
        # get information about each segment in path
        path_points = []
        start_x, start_y = path.start.real, path.start.imag
        end_x, end_y = path.end.real, path.end.imag
        length = abs(path.length())  
        angle = np.arctan2(end_y - start_y, end_x - start_x) 

		# append line
        extracted_lines.append([start_x, start_y, end_x, end_y, length, angle])
    
    return extracted_lines


# function for calculating the distance between two points
def distance(x1, y1, x2, y2):
    return np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

# function for calculating the angle difference
def angle_difference(angle1, angle2):
    diff = abs(angle1 - angle2)
    return min(diff, 2 * np.pi - diff)

# function for merging separate lines
def merge_lines(path, angle_threshold=np.deg2rad(30), distance_threshold=5):
    merged_path = []
    i = 0  

    while i < len(path):
        if i == len(path) - 1:  # if it the last element, there is nothing to merge with
            merged_path.append(path[i])
            x1, y1, x2, y2, length1, angle1 = path[i]
            break
		# get current and next line data
        x1, y1, x2, y2, length1, angle1 = path[i]
        x3, y3, x4, y4, length2, angle2 = path[i + 1]
		# if angle difference and disctance between end and start point are suitable
        if angle_difference(angle1, angle2) < angle_threshold and distance(x2, y2, x3, y3) < distance_threshold:
			# merge two lines into one
            new_line = [x1, y1, x4, y4, length1 + length2, (angle1 + angle2) / 2]
            i+=1
			# keep merging if distance and angle are suitable
            while i < len(path) - 1:
                x5, y5, x6, y6, length3, angle3 = path[i + 1]

                if angle_difference(new_line[5], angle3) < angle_threshold and distance(new_line[2], new_line[3], x5, y5) < distance_threshold:
                    new_line[2] = x6  
                    new_line[3] = y6
                    new_line[4] += length3  
                    new_line[5] = (new_line[5] + angle3) / 2  
                    i += 1  
                else:
                    break
			# append merged line
            merged_path.append(new_line)

        else:
			# append unmerged line
            merged_path.append(path[i])

        i += 1  

    return merged_path

# function for merging segments within individual paths
def merge_segments(features, angle_threshold=np.deg2rad(30), distance_threshold=5):
    merged_features = []
	# for each path merge lines
    for path in features:
        merged_features.extend(merge_lines(path, angle_threshold, distance_threshold))
		#after merging, segments from different paths will be on the same level
    return merged_features

# remove lines whose length is less than min_length
def clean_small_lines(features, min_length):
    cleaned_lines = []

    for path in features:
        if not path: 
            continue
		# get the length of the segment
        length = path[4]
		# check length
        if length >= min_length:
            cleaned_lines.append(path)
    return cleaned_lines

# function that removes anomaly zero length segments 
def clean_zero_lines(features):
	cleaned_lines = []

	for path in features:
	
		path_segments = []
		for segment in path:
			# get the length of the segment
			length = segment[4]
			
			# if line is not zero length
			if length > 0:
				path_segments.append(segment)
         
		cleaned_lines.append(path_segments)
	return cleaned_lines

#debug: saves normalized svg
def save_lines_to_svg(lines, output_path):
    paths = []
    
    for segment in lines:

        x1, y1, x2, y2, _, _ = segment
		# creat a new path from segment
        path = svgpathtools.Path(svgpathtools.Line(complex(x1, y1), complex(x2, y2)))
        paths.append(path)
    
    # create an svg file
    svgpathtools.wsvg(paths, filename=output_path)


# main function to handle normalization
def normalize_drawings(svg_user):

	# extract user features
	user_features = extract_lines(svg_user)

	# clean the features from invalid zero-length segments
	cleaned_features = clean_zero_lines(user_features)
	# merge segments in one line
	merged_features = merge_segments(cleaned_features)
	# merge all lines
	merged_lines = merge_lines(merged_features)
	# clean small lines 
	result_features = clean_small_lines(merged_lines, 5.0)

	# debug
	# save_lines_to_svg(result_features, './assets/normalizedOutput.svg') 
	return result_features


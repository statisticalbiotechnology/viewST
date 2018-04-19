import pandas as pd
import numpy as np
import networkx as nx
from networkx.readwrite import json_graph #key package
import json
import simplejson

data_path="C:/Users/Riley/Downloads/Databases"
relation_file = data_path + "/ReactomePathwaysRelation.txt" #import realtion file
infile= data_path + "/Sunburst/Rep1_MOB_info_raw.csv"   #import matrix information file
rel_df = pd.read_csv(relation_file, sep = "\t")
outname = data_path + '/Sunburst' + '/Rep1_MOB_tree.json' #set up output file and path
#before run this, make sure the version of reactome data keep same for both infile

def sunburst(infile):
    """generate hierarchical json file"""
    in_df = pd.read_csv(infile, sep = "\t")
    in_df.set_index(in_df["pathways"], inplace=True)
    #set up 'pathways' colum as index
    in_df = in_df.loc[[x for x in in_df.index if 'HSA' in x]]
    topPaths = rel_df.loc[(rel_df['parentId'] == 'HomoSapiens'), 'id']
    homoNgenes = np.sum(in_df.loc[[x in topPaths.tolist() for x in in_df["pathways"]],'ngenes'])
    homoNode = pd.DataFrame([["Homo Sapiens",1,homoNgenes]], columns = ["pathways", "explained_ratios", "ngenes"]).xs(0)
    homoNode.name = 'HomoSapiens'
    # add up HomoSapiens info into matrix file (info include:"pathways", "explained_ratios", "ngenes"), and set which as homenode

    in_df = in_df.append(homoNode)
    topDict = in_df.to_dict() #set up dictionary as the the key for node tree
    pathways = in_df["pathways"]

    subset_vec = [i in pathways for i in rel_df.iloc[:,0]] and [x in pathways for x in rel_df.iloc[:,1]] #filter the pathways in realtion file corelated to those pathways in matrix file.
    sub_rel_df = rel_df[subset_vec]
    #sub_rel_df.to_csv("test.csv", sep="\t")  #can test if the filter works here
    G = nx.DiGraph()
    G.add_nodes_from(pathways)
    G.add_edges_from(sub_rel_df.values)
    tree = nx.algorithms.dag.dag_to_branching(G)
    secondDict = nx.get_node_attributes(tree,'source') #set up the value of second dictionary (hierarchical dictionary)
    thirdDict = {'explained_ratios':{}, 'ngenes':{}, 'description':{}}  #set up the frame of third dictionary
    for key, value in secondDict.items():
        thirdDict['explained_ratios'].update({key : topDict['explained_ratios'][value]}) #valuation third dictionary with the key value from top dictionary
        thirdDict['ngenes'].update({key : topDict['ngenes'][value]})
        thirdDict['description'].update({key : topDict['pathways'][value]})
    nx.set_node_attributes(tree, thirdDict['explained_ratios'], name = 'explained_ratios')
    nx.set_node_attributes(tree, thirdDict['ngenes'], name = 'ngenes')
    nx.set_node_attributes(tree, thirdDict['description'], name = 'description')


    root = [v for v, d in tree.in_degree() if d == 0][0]
    out_json = json_graph.tree_data(tree, root)

    with open(outname, 'w') as outfile:
        simplejson.dump(out_json,outfile,ignore_nan=True)

#execute
result= sunburst(infile)

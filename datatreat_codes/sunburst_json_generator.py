import pandas as pd
import numpy as np
import analyze
import networkx as nx
from networkx.readwrite import json_graph #key package
import json
import simplejson

#Set up the data path
data_path = "../../Databases/"
experiment_name= 'Layer1_BC'
hugo2ensembl_file = data_path + "hugo2ensembl.txt"
reactome_file = data_path + "Ensembl2Reactome_All_Levels.txt"
count_file_name = data_path + 'matrix/' + experiment_name + '_count_matrix-1.tsv'  #set up input matrix data path
#outfile = data_path + 'Sunburst/' + experiment_name + '_info_raw.csv'  #set up output name and path
relation_file = data_path + "/ReactomePathwaysRelation.txt" #import realtion file
rel_df = pd.read_csv(relation_file, sep = "\t")
outname = data_path + 'Sunburst/' + experiment_name + '_tree.json' #set up output file and path

#before run this, make sure the version of reactome data keep same for both infile


def read_file(file_name, ensembl = True, clean = True):
    """read matrix file transfer into ensembl formate"""
    dictionary = pd.DataFrame.from_csv(hugo2ensembl_file, sep="\t") #use hugo2ensembl as dictionary
    data = pd.DataFrame.from_csv(file_name, sep="\t")
    gene_names = data.columns.tolist()
    gene_names = [w.upper() for w in gene_names]
    ensembl_names = dictionary.loc[gene_names]
    if ensembl:
        data.columns = ensembl_names.iloc[:,0]
    if clean:
        dataisnan = data.columns != data.columns
        data = data.iloc[:,~dataisnan]

    return data

def read_reactome(file_name, gene_name_start = "ENSG0"): #choose gene only belong to human
    """transfer the matrix from ensemnl formate into into reactome formate """
    df = pd.read_csv(file_name, sep='\t', header=None)
    subset_vec = df[0].str.startswith(gene_name_start)
    df = df.loc[subset_vec]

    out_df = pd.DataFrame()
    for pathway in np.unique(df[1]):
        subset_df = df.loc[df[1] == pathway]
        pathway_name = subset_df.iloc[0,3]
        genes = np.array(subset_df[0])
        pathway_id = pathway + '.csv'
        out_df = out_df.append([[pathway, genes, pathway_id, pathway_name]])

    out_df.columns = ['pathway', 'genes', 'pathway_id', 'pathway_name']
    out_df.set_index(out_df.columns[0], inplace=True)
    return out_df


def process(df, return_metrics = True, pathway_generator_df = pd.DataFrame()):
    """Combine pathway info with gene number and ratio value, generate final table """
    ngenes=[]
    explained_ratios =[]
    pathway_generator_df = read_reactome(reactome_file)
    pathways= pathway_generator_df.index
    pathway_id = pathway_generator_df["pathway_id"]
    pathway_name = pathway_generator_df["pathway_name"]
    for i in pathways: #loop the pathways to embed ngene and ratio info
        genes = pathway_generator_df.loc[i]
        test = [x in df.columns for x in genes.tolist()[0]] #gene number calculation
        ngene = sum(test)
        test = any(test)
        if test:
            sub_df = df.loc[:,genes.tolist()[0]].transpose()
            components, explained_ratio = analyze.my_pca(sub_df) #ratio calculation
            explained_ratio = np.array(explained_ratio)
        else:
            explained_ratio = float('nan')
            ngene = 0
        ngenes.append(ngene)
        explained_ratios = np.append(explained_ratios, explained_ratio)
    out_df = pd.DataFrame(columns = ["pathways",'pathway_id', 'pathway_name', "explained_ratios","ngenes"])  #set up columns beforehands
    if return_metrics:
        for i in range(len(pathways)): #fill up the column values from each lists
            out_df = out_df.append({"pathways":pathways[i],'pathway_id':pathway_id[i], 'pathway_name': pathway_name[i], "explained_ratios":explained_ratios[i], "ngenes":ngenes[i]}, ignore_index=True)
    return out_df

def sunburst():
    """generate hierarchical json file"""
    file_df=read_file(count_file_name)
    in_df = process(file_df)
    in_df.set_index(in_df["pathways"], inplace=True)
    #set up 'pathways' colum as index
    in_df = in_df.loc[[x for x in in_df.index if 'HSA' in x]]
    topPaths = rel_df.loc[(rel_df['parentId'] == 'HomoSapiens'), 'id']
    homoNgenes = np.sum(in_df.loc[[x in topPaths.tolist() for x in in_df["pathways"]],'ngenes'])
    homoNode = pd.DataFrame([["Homo Sapiens",1,homoNgenes,"homo.csv","Human being"]], columns = ["pathways", "explained_ratios", "ngenes", 'pathway_id', 'pathway_name']).xs(0)
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
    thirdDict = {'explained_ratios':{}, 'ngenes':{}, 'description':{}, 'identify':{}}  #set up the frame of third dictionary
    for key, value in secondDict.items():
        thirdDict['explained_ratios'].update({key : topDict['explained_ratios'][value]}) #valuation third dictionary with the key value from top dictionary
        thirdDict['ngenes'].update({key : topDict['ngenes'][value]})
        thirdDict['description'].update({key : topDict['pathway_name'][value]})
        thirdDict['identify'].update({key : topDict['pathway_id'][value]})

    nx.set_node_attributes(tree, thirdDict['explained_ratios'], name = 'explained_ratios')
    nx.set_node_attributes(tree, thirdDict['ngenes'], name = 'ngenes')
    nx.set_node_attributes(tree, thirdDict['description'], name = 'description')
    nx.set_node_attributes(tree, thirdDict['identify'], name = 'identify')

    root = [v for v, d in tree.in_degree() if d == 0][0]
    out_json = json_graph.tree_data(tree, root)

    with open(outname, 'w') as outfile:
        simplejson.dump(out_json,outfile,ignore_nan=True)
#execute
result= sunburst()

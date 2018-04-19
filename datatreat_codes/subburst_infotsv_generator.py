import pandas as pd
import numpy as np
import analyze

#Set up the data path
data_path = "C:/Users/Riley/Downloads/Databases"
universal_file_name= '/Rep2_MOB_'
hugo2ensembl_file = data_path + "/hugo2ensembl.txt"
reactome_file = data_path + "/Ensembl2Reactome_All_Levels.txt"
count_file_name = data_path + '/matrix' + universal_file_name + 'count_matrix-1.tsv'  #set up input matrix data path
outfile = data_path + '/Sunburst' + universal_file_name + 'info_raw.csv'  #set up output name and path

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
        out_df = out_df.append([[pathway,genes]])

    out_df.columns = ['pathway', 'genes']
    out_df.set_index(out_df.columns[0], inplace=True)
    return out_df


def process(df, return_metrics = True, pathway_generator_df = pd.DataFrame()):
    """Combine pathway info with gene number and ratio value, generate final table """
    ngenes=[]
    explained_ratios =[]
    pathway_generator_df = read_reactome(reactome_file)
    pathways= pathway_generator_df.index
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
    out_df = pd.DataFrame(columns = ["pathways","explained_ratios","ngenes"])  #set up columns beforehands
    if return_metrics:
        for i in range(len(pathways)): #fill up the column values from each lists
            out_df = out_df.append({"pathways":pathways[i],"explained_ratios":explained_ratios[i], "ngenes":ngenes[i]}, ignore_index=True)
    return out_df

#execute
file_df=read_file(count_file_name)
result = process(file_df)
result.to_csv(outfile, sep = "\t")

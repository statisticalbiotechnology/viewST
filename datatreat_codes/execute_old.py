
import pandas as pd
import numpy as np
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import griddata
from sklearn.metrics import log_loss
from skimage.transform import rescale
import sys

import analyze

data_path = "C:/Users/Riley/Documents/Master_thesis/datasets/MOB_R1/"
#sub_dir = "spatialTranscript/"
hugo2ensembl_file = data_path + "hugo2ensembl.txt"

reactome_file = data_path + "Ensembl2Reactome_All_Levels.txt"

def read_file(file_name, ensembl = True, clean = True):
    dictionary = pd.DataFrame.from_csv(hugo2ensembl_file, sep="\t")
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

def read_reactome(file_name, gene_name_start = "ENSG0"):
    # global subset_df
    df = pd.read_csv(file_name, sep='\t', header=None)
    subset_vec = df[0].str.startswith(gene_name_start)
    df = df.loc[subset_vec]

    out_df = pd.DataFrame()
    for pathway in np.unique(df[1]):
        subset_df = df.loc[df[1] == pathway]
        pathway_name = subset_df.iloc[0,3]
        genes = np.array(subset_df[0])
        out_df = out_df.append([[pathway,pathway_name,genes]])

    out_df.columns = ['pathway', 'pathway_name', 'genes']
    out_df.set_index('pathway', inplace=True)

    return out_df


def process(df, pathway, return_metrics = False, pathway_generator = pd.DataFrame()):

    if pathway_generator.empty:
        pathway_generator_df = read_reactome(reactome_file)
    else:
        pathway_generator_df = pathway_generator


    genes = pathway_generator_df.loc[pathway]

    test = [x in df.columns for x in genes.tolist()[1]]

    ngenes = sum(test)

    test = any(test)

    if test:
        sub_df = df.loc[:,genes.tolist()[1]].transpose()
        components, explained_ratio = analyze.my_pca(sub_df)

        pos = df.index.str.split('x')

        out_df = pd.DataFrame(components[1].tolist(), columns = ['pcomp'])
        out_df[['y','x']] = pd.DataFrame(pos.tolist())
        out_df['x'] = pd.to_numeric(out_df['x'])
        out_df['y'] = pd.to_numeric(out_df['y'])

    else:
        out_df=pd.DataFrame(columns=['x','y','pcomp'])
        explained_ratio = float('nan')
        ngenes = 0

    if return_metrics:
        return out_df, explained_ratio, ngenes
    else:
        return out_df

#show scaling data
def transformation(pathway, normalization = False):

    transformation_file_name = data_path + "Rep1_MOB_transformation.txt"
    count_file_name = data_path + "Rep1_MOB_count_matrix-1.tsv"

    file_df = read_file(count_file_name)

    if normalization:
        file_df = file_df.div(file_df.sum(axis = 1), axis = 0)

    if pathway != 'sum':
        results = process(file_df ,pathway)
        pathway_generator_df = read_reactome(reactome_file)
        path_name = pathway_generator_df.loc[pathway,'pathway_name']

    else:
        results = process(file_df , 'R-HSA-196854') # generic pathway
        results['pcomp'] = file_df.sum(axis=1).values
        path_name = 'Sum'

    with open(transformation_file_name) as f:
        transform_vector = f.read()

    transform_vector = transform_vector.split(" ")
    transform_vector = [float(x) for x in transform_vector]
    transform_matrix = np.matrix(np.reshape(transform_vector, (3,3)))
    transform_matrix = transform_matrix[0:2,0:2]

    pixel_coord = np.matrix(results[['x','y']] -1) * transform_matrix # transform to pixel coordinates acording to instruction on web page and email

    results[['x','y']] = pd.DataFrame(pixel_coord.tolist())

    return  results

Result=transformation("R-HSA-1430728")
Result.to_csv("R-HSA-1430728_trans3.csv", sep = ",")

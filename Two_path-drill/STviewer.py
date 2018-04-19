import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import griddata
from sklearn.metrics import log_loss
from skimage.transform import rescale
import os

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

def plot_results(pathway, output_image_file = "output.png", interpolation_method = 'linear', normalization = False):

    count_file_name = data_path + "Rep1_MOB_count_matrix-1.tsv"
    transformation_file_name = data_path + "Rep1_MOB_transformation.txt"
    image_file_name = data_path + "HE_" + "Rep1" + ".jpg"

    file_df = read_file(count_file_name)

    if normalization:
        file_df = file_df.div(file_df.sum(axis = 1), axis = 0)

    if pathway != 'sum':
        results = process(file_df ,pathway)
        pathway_generator_df = read_reactome(reactome_file)
        path_name = pathway_generator_df.loc[pathway,'pathway_name']

    else:
        results = process(file_df , 'R-HSA-109581') # generic pathway
        results['pcomp'] = file_df.sum(axis=1).values
        path_name = 'Sum'

    with open(transformation_file_name) as f:
        transform_vector = f.read()

    transform_vector = transform_vector.split(" ")
    transform_vector = [float(x) for x in transform_vector]
    transform_matrix = np.matrix(np.reshape(transform_vector, (3,3)))
    transform_matrix = transform_matrix[0:2,0:2]

    pixel_coord = np.matrix(results[['x','y']] - 1) * transform_matrix # transform to pixel coordinates acording to instruction on web page and email

    results[['x','y']] = pd.DataFrame(pixel_coord.tolist())

    im = plt.imread(image_file_name)

    x_lim = [0, im.shape[0]]
    y_lim = [0, im.shape[1]]

    resolution = 10

    grid_x, grid_y = np.mgrid[x_lim[0]:x_lim[1]:resolution, y_lim[0]:y_lim[1]:resolution]

    results_grid = griddata(np.array(results[['x', 'y']]), np.array(results['pcomp']), (grid_x, grid_y), method=interpolation_method)

    col_lim = np.nanmax(np.absolute(results_grid))


    if interpolation_method == 'nearest':
        mask = griddata(np.array(results[['x', 'y']]), np.array(results['pcomp']), (grid_x, grid_y), method = 'cubic')
        results_grid = np.ma.masked_where(np.isnan(mask), results_grid)

    fig, ax = plt.subplots()
    #implot = plt.imshow(rescale(im,1/resolution))


    # plt.imshow(results_grid, alpha = 0.5, extent = [x_lim[0], x_lim[1], y_lim[0], y_lim[1]], cmap = 'viridis')
    resultlayer = plt.imshow(results_grid, alpha = 0.75, cmap = 'coolwarm',  origin = "upper") #vmax = col_lim, vmin = -col_lim,

    cbar = fig.colorbar(resultlayer, ticks=[np.nanmin(results_grid), np.nanmax(results_grid)])
    cbar.ax.set_yticklabels(['Low', 'High'])

    plt.title(pathway + " - " + path_name)
    plt.axis("off")
    plt.savefig(output_image_file, dpi=600,  bbox_inches='tight')

    return output_image_file

# show ensembl data
#file_name= data_path + "Rep1_MOB_count_matrix-1.tsv"
#file_df=read_file(file_name, ensembl = True, clean = True)
#print(output)

#show reactome data
#file_name= data_path + "Ensembl2Reactome_All_Levels.txt"
#output= read_reactome(file_name, gene_name_start = "ENSG0")
#print(output)

#show plot

output= plot_results("R-HSA-1430728", output_image_file = "output5.png", interpolation_method = 'nearest', normalization = False)
os.rename("output5.png", data_path + "output5.png" )


# show scaling data
#output= process(file_df,"R-HSA-1430728", return_metrics = False, pathway_generator = pd.DataFrame())
#print(output)

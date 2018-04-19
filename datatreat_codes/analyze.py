import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from lifelines import CoxPHFitter
from lifelines.statistics import multivariate_logrank_test
from lifelines import KaplanMeierFitter
from lifelines import AalenAdditiveFitter
from sklearn import preprocessing
#import sksurv

def cox_analysis_old(in_df):
    df = in_df.transpose()
    assert(not df.isnull().values.any())
    cph = CoxPHFitter()
    cph.fit(df, duration_col='LivingDays', event_col='Dead')
    # cph.print_summary()
    pvals = cph._compute_p_values()
    return pvals[-1]

def cox_analysis(in_df, res_position='pathway', return_coeff = False):
    assert(not in_df.isnull().values.any())
    cph = CoxPHFitter()
    try:
        cph.fit(in_df, duration_col='LivingDays', event_col='Dead')
    except ValueError:
        print('Changing starting betas')
        try:
            cph.fit(in_df, duration_col='LivingDays', event_col='Dead', show_progress=True, initial_beta=np.array([[0],[0.1]]))
        except ValueError:
            print('Changing starting betas again')
            cph.fit(in_df, duration_col='LivingDays', event_col='Dead', show_progress=True, initial_beta=np.array([[0],[0.3]]))
    except np.linalg.LinAlgError:
            print('Sigular matrix, changing betas')
            cph.fit(in_df, duration_col='LivingDays', event_col='Dead', show_progress=True, initial_beta=np.array([[0],[0.1]]))
    # cph.print_summary()

    pval = cph._compute_p_values()[-1]
    summary = cph.summary
    # print(summary)
    coeff = summary.loc['pathway','coef']
    pval = summary.loc['pathway','p']

    if not return_coeff:
        return pval
    else:
        return coeff

def km_analysis(in_df):

    median = in_df.iloc[-1].median()
    df = in_df.transpose()
    level = df.iloc[:,-1]
    grp = np.array(level > median)
    E = np.array(df['Dead'])
    T = np.array(df['LivingDays'])
    results = multivariate_logrank_test(T, grp, E)
    p = results.p_value

    return p



def kmfit(in_df):

    median = in_df.iloc[:,-1].median()

    level = in_df.iloc[:,-1]
    grp = np.array(level > median)

    E = np.array(in_df['Dead'])
    T = np.array(in_df['LivingDays'])
    results = multivariate_logrank_test(T, grp, E)
    p = results.p_value

    kmf = KaplanMeierFitter()

    high = kmf.fit(T[grp], event_observed=E[grp], label='high')
    timelineHigh = high.survival_function_.index.tolist()
    high = high.survival_function_.transpose().values.tolist()
    low = kmf.fit(T[~grp], event_observed=E[~grp], label='low')
    timelineLow = low.survival_function_.index.tolist()
    low = low.survival_function_.transpose().values.tolist()




    return timelineHigh, timelineLow, high, low

def aalen_aditive(in_df):
    assert(not in_df.isnull().values.any())
    aaf = AalenAdditiveFitter(fit_intercept=False)
    aaf.fit(in_df, 'LivingDays', event_col='Dead')

def my_pca(df, n_pc=1, normalize=True, return_explained=True):

    df = df.dropna(axis = 0, how = 'all')

    X = df.values.T

    # if np.shape(X)[1] < 3:
    #     normalize = False

    if normalize:
        X2 = preprocessing.scale(X)
    else:
        X2 = X

    pca = PCA(n_components = n_pc)

    pca.fit(X2)

    Xnew = pca.fit_transform(X2)

    explained_ratio = pca.explained_variance_ratio_

    out_df = pd.DataFrame(Xnew.transpose(), index=list(range(1,n_pc+1)), columns=df.columns)

    out_df = out_df.transpose()

    if return_explained:
        return out_df, explained_ratio
    else:
        return out_df



def cox_analysis_mult(in_df, res_position=['pc1','pc2'], return_coeff = False):
    assert(not in_df.isnull().values.any())
    cph = CoxPHFitter()
    cph.fit(in_df, duration_col='LivingDays', event_col='Dead')
    # cph.print_summary()

    pval = cph._compute_p_values()[-1]
    summary = cph.summary
    print(summary)
    coeff = summary.loc[res_position,'coef']
    pval = summary.loc[res_position,'p']

    if not return_coeff:
        return pval
    else:
        return coeff

def my_pca_old(df):

    df = df.dropna(axis = 0, how = 'all')

    X = df.values.T
    pca = PCA(n_components = 1)
    Xnew = pca.fit_transform(X)

    out_vec = Xnew.T.tolist()[0]

    pca.fit(X)
    explained_ratio = pca.explained_variance_ratio_

    return out_vec, explained_ratio

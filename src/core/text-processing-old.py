import numpy as np

# Implementation of the GMM.
# see: https://www.youtube.com/watch?v=qMTuMa86NzU
#  or a more scientific explanation: http://www.ics.uci.edu/~smyth/courses/cs274/notes/EMnotes.pdf

data = np.array([
    [ 1, 0],
    [ 0, 1],
    ]).T;

def init_gmm(nr_documents, nr_clusters):
    # Start with random weights
    weights = np.random.random((nr_clusters, nr_documents))

    # But all rows have to add to 1
    sums = np.sum(weights, axis=0)
    weights = weights / sums

    # ret
    return weights

def m_step(weights, data):
    # weights.shape = (nr_clusters, nr_documents)
    # data.shape    = (nr_features, nr_documents)

    nr_clusters, nr_documents = weights.shape

    # the "number" of documents in each cluster.
    # cluster_sizes.shape = (nr_clusters)
    cluster_sizes = np.sum(weights, axis=1)

    # Calc the new heights of the gaussian components
    # gauss_height.shape = (nr_clusters)
    gauss_heights = cluster_sizes / nr_documents

    # Calc the new means of the gaussian components
    # gauss_means.shape = (nr_features, nr_clusters)
    weighted_data = weights.T * data[:,:,np.newaxis]
    gauss_means = np.sum(weighted_data, axis=1) / cluster_sizes

    # Calc the new covariance matrices of the gaussian components 
    # gauss_cov.shape = (nr_features, nr_features, nr_clusters)
    gauss_cov_step1 = gauss_means[:, np.newaxis, :] - data[:, :, np.newaxis]
    gauss_cov_step2 = gauss_cov_step1[np.newaxis, :, :, :] * gauss_cov_step1[:, np.newaxis, :, :]
    gauss_cov_step3 = gauss_cov_step2 * weights.T
    gauss_cov = np.sum(gauss_cov_step3, axis=2) / cluster_sizes

    print('Means: ')
    print(np.round(gauss_means, 2))
    print('Covs: ')
    print(np.round(gauss_cov, 2)[:,:,0])
    print(np.round(gauss_cov, 2)[:,:,1])


    return gauss_heights, gauss_means, gauss_cov


def e_step(gauss, data):
    gauss_heights, gauss_means, gauss_cov = gauss
    nr_features, nr_documents = data.shape
    pi = 3.14159

    # calc the values from the gaussian distributions for every datapoint / cluster 

    # calc the inverse matrices of the covariant matrices
    # gauss_cov_inverses.shape = (nr_features, nr_features, nr_clusters)
    gauss_cov_swappedaxis = np.rollaxis(gauss_cov, 2)
    gauss_cov_inverses = np.rollaxis(np.linalg.inv(gauss_cov_swappedaxis), 0, 3)

    # calc the determinants of the covariant matrices
    gauss_cov_dets = np.linalg.det(gauss_cov_swappedaxis)

    # first_factor.shape = (nr_clusters)
    first_factor = 1 / np.sqrt((2 * pi) ** nr_features * gauss_cov_dets)

    # Calculate the exponents of the gauss distributions
    # exponent.shape = (nr_documents, nr_clusters)
    exponent_step1 = data[:, :, np.newaxis] - gauss_means[:, np.newaxis, :]
    exponent_step2 = exponent_step1 * gauss_cov_inverses[:, :, np.newaxis, :]
    exponent_step3 = np.sum(exponent_step2, axis=1)
    exponent_step4 = exponent_step3 * exponent_step1 
    exponent_step5 = np.sum(exponent_step4, axis=0)
    exponent = -1/2*exponent_step5

    # calculate the gauss distribution density values
    # gauss_values.shape (nr_documents, nr_clusters)
    gauss_values = gauss_heights * first_factor * np.exp(exponent)

    # normalize the gauss stuff so that p (x is in cluster c) sums to 1 over all clusters for every x.
    # weights.shape = (nr_documents, nr_clusters)
    sum_of_clusters = np.sum(gauss_values, axis=1)
    weights = gauss_values / sum_of_clusters[:, np.newaxis]

    #print(np.round(gauss_values, 8))

    return weights.T

e = init_gmm(2, 2)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)
m = m_step(e, data)
e = e_step(m, data)



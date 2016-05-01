import numpy as np
from sklearn import mixture

data = np.array([
    [ 50, 50, 0],
    [ 51, 52, 0],
    [ 51, 50, 0],
    [ 50, 51, 0],
    [ 52, 0,  4],
    [ 51, 1,  3],
    [ 53, 2,  2],
    [ 54, 3,  1],
    [  0, 0,100],
    [ 10, 0,100],
    [  1, 1,100],
    ])

data2 = np.array([
    [50, 50, 0],
    [50, 40, 0],
    [50, 30, 0],
    [50, 20, 0],
    [50, 10, 0],
    [50, 00, 0],
    ])

g = mixture.GMM(n_components=3)
g.fit(data)

print(np.round(g.means_, 1))
print(np.round(g.weights_, 1))
print(np.round(g.covars_, 1))
print(g.predict_proba(data2))

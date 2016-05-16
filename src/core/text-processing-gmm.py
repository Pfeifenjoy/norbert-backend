#
# Author: Tobias Dorra
#

import numpy as np
from sklearn import mixture
import json
from pprint import pprint

nr_clusters = 5

# open the file with the data that should be clustered
with open('./files/tmp/gmm-in.json') as data_file:    
    data = np.array(json.load(data_file))

# Do the clustering (if there is enough data)
nr_samples = data.shape[0]

if nr_samples == 0:
    result_list = []
elif nr_samples <= nr_clusters:
    result = np.zeros((nr_samples, nr_clusters))
    for i in range(nr_samples):
        result[i, i] = 1
    result_list = result.tolist()
else:
    g = mixture.GMM(n_components=nr_clusters)
    g.fit(data)
    result = g.predict_proba(data)
    result_list = result.tolist()

# Output the result
print(json.dumps(result_list))

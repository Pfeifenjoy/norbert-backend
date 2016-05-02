import numpy as np
from sklearn import mixture
import json
from pprint import pprint

with open('./files/tmp/gmm-in.json') as data_file:    
    data = np.array(json.load(data_file))

g = mixture.GMM(n_components=10)
g.fit(data)
result = g.predict_proba(data)
print(json.dumps(result.tolist()))

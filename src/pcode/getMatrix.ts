//i need import Type to to check what i can import or not

export const getMatrix = (varName: string):string =>
`
import json
import numpy as np
import pandas as pd

def __get_matrix_content(var_name="${varName}", max_rows=10000, max_cols=10000):
    if var_name not in globals():
        return json.dumps({"error": f"Variable '{var_name}' not found."})
    obj = globals()[var_name]
    
    if isinstance(obj, np.ndarray):
        if obj.ndim > 2:
            return json.dumps({"error": "Numpy array has more than 2 dimensions."})
        if obj.ndim == 1:
            sliced = obj[:max_rows]
        else:
            sliced = obj[:max_rows, :max_cols]
        return json.dumps({"variable": var_name, "content": sliced.tolist()})
    
    if isinstance(obj, pd.DataFrame):
        sliced = obj.iloc[:max_rows, :max_cols]
        result = []
        for col in sliced.columns:
            col_values = [col] + sliced[col].tolist()
            result.append(col_values)
        return json.dumps({"variable": var_name, "content": result})
    
    if isinstance(obj, pd.Series):
        sliced = obj.iloc[:max_rows]
        return json.dumps({"variable": var_name, "content": sliced.to_json(orient="split")})
    
    if isinstance(obj, list):
        if all(isinstance(el, list) for el in obj):
            sliced = [row[:max_cols] for row in obj[:max_rows]]
            return json.dumps({"variable": var_name, "content": sliced})
        else:
            sliced = obj[:max_rows]
            return json.dumps({"variable": var_name, "content": sliced})
    
    return json.dumps({"error": f"Variable '{var_name}' is not a supported array type."})

__get_matrix_content()
`

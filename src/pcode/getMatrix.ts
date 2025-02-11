//i need import Type to to check what i can import or not

export const getMatrix = (varName: string): string =>
  `
import importlib
from IPython.display import JSON

def __get_matrix_content(var_name="${varName}", max_rows=10000, max_cols=10000):
    if var_name not in globals():
        return JSON({"error": f"Variable '{var_name}' not found."})
    obj = globals()[var_name]
    module_name = type(obj).__module__

    if "numpy" in module_name:
        try:
            np = importlib.import_module("numpy")
        except ImportError:
            return JSON({"error": "Numpy is not installed."})
        if isinstance(obj, np.ndarray):
            if obj.ndim > 2:
                return JSON({"error": "Numpy array has more than 2 dimensions."})
            if obj.ndim == 1:
                sliced = obj[:max_rows]
            else:
                sliced = obj[:max_rows, :max_cols]
            return JSON({"variable": var_name, "content": sliced.tolist()})

    if "pandas" in module_name:
        try:
            pd = importlib.import_module("pandas")
        except ImportError:
            return JSON({"error": "Pandas is not installed."})
        if isinstance(obj, pd.DataFrame):
            sliced = obj.iloc[:max_rows, :max_cols]
            result = []
            for col in sliced.columns:
                col_values = [col] + sliced[col].tolist()
                result.append(col_values)
            return JSON({"variable": var_name, "content": result})
        elif isinstance(obj, pd.Series):
            sliced = obj.iloc[:max_rows]
            df = sliced.to_frame()  
            result = []
            for col in df.columns:
                col_values = [col] + df[col].tolist()
                result.append(col_values)
            return JSON({"variable": var_name, "content": result})

    if isinstance(obj, list):
        if all(isinstance(el, list) for el in obj):
            sliced = [row[:max_cols] for row in obj[:max_rows]]
            return JSON({"variable": var_name, "content": sliced})
        else:
            sliced = obj[:max_rows]
            return JSON({"variable": var_name, "content": sliced})

    return JSON({"error": f"Variable '{var_name}' is not a supported array type."})

__get_matrix_content()
`;

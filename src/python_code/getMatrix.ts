export const getMatrix = (
  varName: string,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number
): string => `
import importlib
from IPython.display import JSON

def __get_variable_shape(obj):
    if hasattr(obj, 'shape'):
        return " x ".join(map(str, obj.shape))
    if isinstance(obj, list):
        if obj and all(isinstance(el, list) for el in obj):
            if len(set(map(len, obj))) == 1:
                return f"{len(obj)} x {len(obj[0])}"
            else:
                return f"{len(obj)}"
        return str(len(obj))
    return ""

def __format_content(item):
    if isinstance(item, list):
        return [__format_content(subitem) for subitem in item]
    elif isinstance(item, dict):
        return {k: __format_content(v) for k, v in item.items()}
    elif isinstance(item, str):
        return item[:50] + "..." if len(item) > 50 else item
    elif isinstance(item, (int, float, bool)) or item is None:
        return item
    else:
        if hasattr(item, "name"):
            return getattr(item, "name")
        return type(item).__name__

def __mljar_variable_inspector_get_matrix_content(
    var_name="${varName}",
    start_row=${startRow},
    end_row=${endRow},
    start_column=${startColumn},
    end_column=${endColumn}
):
    if var_name not in globals():
        return JSON({"error": "Variable not found."})
    
    obj = globals()[var_name]
    module_name = type(obj).__module__
    var_type = type(obj).__name__
    var_shape = __get_variable_shape(obj)
    
    if "numpy" in module_name:
        try:
            np = importlib.import_module("numpy")
        except ImportError:
            return JSON({"error": "Numpy is not installed."})
        if isinstance(obj, np.ndarray):
            if obj.ndim > 2:
                return JSON({
                    "variable": var_name,
                    "variableType": var_type,
                    "variableShape": var_shape,
                    "error": "Numpy array has more than 2 dimensions."
                })
            if obj.ndim == 1:
                actual_end_row = min(end_row, len(obj))
                sliced = obj[start_row:actual_end_row]
                returnedSize = [start_row, actual_end_row, 0, 1]
            else:
                actual_end_row = min(end_row, obj.shape[0])
                actual_end_column = min(end_column, obj.shape[1])
                sliced = obj[start_row:actual_end_row, start_column:actual_end_column]
                returnedSize = [start_row, actual_end_row, start_column, actual_end_column]
            return JSON({
                "variable": var_name,
                "variableType": var_type,
                "variableShape": var_shape,
                "returnedSize": returnedSize,
                "content": __format_content(sliced.tolist())
            })
    
    if "pandas" in module_name:
        try:
            pd = importlib.import_module("pandas")
        except ImportError:
            return JSON({"error": "Pandas is not installed."})
        if isinstance(obj, pd.DataFrame):
            actual_end_row = min(end_row, len(obj.index))
            actual_end_column = min(end_column, len(obj.columns))
            sliced = obj.iloc[start_row:actual_end_row, start_column:actual_end_column]
            result = []
            for col in sliced.columns:
                col_values = [col] + sliced[col].tolist()
                result.append(col_values)
            returnedSize = [start_row, actual_end_row, start_column, actual_end_column]
            return JSON({
                "variable": var_name,
                "variableType": var_type,
                "variableShape": var_shape,
                "returnedSize": returnedSize,
                "content": __format_content(result)
            })
        elif isinstance(obj, pd.Series):
            actual_end_row = min(end_row, len(obj))
            sliced = obj.iloc[start_row:actual_end_row]
            df = sliced.to_frame()
            result = []
            for col in df.columns:
                col_values = [col] + df[col].tolist()
                result.append(col_values)
            returnedSize = [start_row, actual_end_row, 0, 1]
            return JSON({
                "variable": var_name,
                "variableType": var_type,
                "variableShape": var_shape,
                "returnedSize": returnedSize,
                "content": __format_content(result)
            })
    
    if isinstance(obj, list):
        if all(isinstance(el, list) for el in obj):
            if len(set(map(len, obj))) == 1:
                actual_end_row = min(end_row, len(obj))
                actual_end_column = min(end_column, len(obj[0]))
                sliced = [row[start_column:actual_end_column] for row in obj[start_row:actual_end_row]]
                returnedSize = [start_row, actual_end_row, start_column, actual_end_column]
                content = __format_content(sliced)
            else:
                actual_end_row = min(end_row, len(obj))
                sliced = obj[start_row:actual_end_row]
                returnedSize = [start_row, actual_end_row, 0, 1]
                content = ["list" for _ in sliced]
                var_shape = f"{len(obj)}"
            return JSON({
                "variable": var_name,
                "variableType": var_type,
                "variableShape": var_shape,
                "returnedSize": returnedSize,
                "content": content
            })
        else:
            actual_end_row = min(end_row, len(obj))
            sliced = obj[start_row:actual_end_row]
            returnedSize = [start_row, actual_end_row, 0, 1]
            return JSON({
                "variable": var_name,
                "variableType": var_type,
                "variableShape": str(len(obj)),
                "returnedSize": returnedSize,
                "content": __format_content(sliced)
            })
    
    if isinstance(obj, dict):
        items = list(obj.items())[start_row:end_row]
        sliced_dict = dict(items)
        returnedSize = [start_row, end_row, 0, 1]
        var_shape = str(len(obj))
        return JSON({
            "variable": var_name,
            "variableType": var_type,
            "variableShape": var_shape,
            "returnedSize": returnedSize,
            "content": __format_content(sliced_dict)
        })
    
    return JSON({
        "variable": var_name,
        "variableType": var_type,
        "variableShape": "unknown",
        "error": "Variable is not a supported array type.",
        "content": [10, 10, 10]  
    })

__mljar_variable_inspector_get_matrix_content()
`;

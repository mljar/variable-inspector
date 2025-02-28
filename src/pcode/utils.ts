export const variableDict = `
import json
import sys
import math
from importlib import __import__
from IPython import get_ipython
from IPython.core.magics.namespace import NamespaceMagics

__mljar_variable_inspector_nms = NamespaceMagics()
__mljar_variable_inspector_Jupyter = get_ipython()
__mljar_variable_inspector_nms.shell = __mljar_variable_inspector_Jupyter.kernel.shell

__np = None
__pd = None
__pyspark = None
__tf = None
__K = None
__torch = None
__ipywidgets = None
__xr = None


def __mljar_variable_inspector_attempt_import(module):
    try:
        return __import__(module)
    except ImportError:
        return None


def __mljar_variable_inspector_check_imported():
    global __np, __pd, __pyspark, __tf, __K, __torch, __ipywidgets, __xr

    __np = __mljar_variable_inspector_attempt_import('numpy')
    __pd = __mljar_variable_inspector_attempt_import('pandas')
    __pyspark = __mljar_variable_inspector_attempt_import('pyspark')
    __tf = __mljar_variable_inspector_attempt_import('tensorflow')
    __K = __mljar_variable_inspector_attempt_import('keras.backend') or __mljar_variable_inspector_attempt_import('tensorflow.keras.backend')
    __torch = __mljar_variable_inspector_attempt_import('torch')
    __ipywidgets = __mljar_variable_inspector_attempt_import('ipywidgets')
    __xr = __mljar_variable_inspector_attempt_import('xarray')


def __mljar_variable_inspector_getshapeof(x):
    def get_list_shape(lst):
        if isinstance(lst, list):
            if not lst:
                return "0"
            sub_shape = get_list_shape(lst[0])
            return f"{len(lst)}" if sub_shape == "" else f"{len(lst)} x {sub_shape}"
        else:
            return ""

    if __pd and isinstance(x, __pd.DataFrame):
        return "%d x %d" % x.shape
    if __pd and isinstance(x, __pd.Series):
        return "%d" % x.shape
    if __np and isinstance(x, __np.ndarray):
        shape = " x ".join([str(i) for i in x.shape])
        return "%s" % shape
    if __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return "? x %d" % len(x.columns)
    if __tf and isinstance(x, __tf.Variable):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if __tf and isinstance(x, __tf.Tensor):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if __torch and isinstance(x, __torch.Tensor):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if __xr and isinstance(x, __xr.DataArray):
        shape = " x ".join([str(int(i)) for i in x.shape])
        return "%s" % shape
    if isinstance(x, list):
        return get_list_shape(x)
    if isinstance(x, dict):
        return "%s keys" % len(x)
    return None


def __mljar_variable_inspector_get_simple_value(x):
    if isinstance(x, bytes):
        return ""
    if x is None:
        return "None"
    if __np is not None and __np.isscalar(x) and not isinstance(x, bytes):
        return str(x)
    if isinstance(x, (int, float, complex, bool, str)):
        return str(x)
    return ""


def __mljar_variable_inspector_size_converter(size):
    if size == 0: 
        return '0B'
    units = ['B', 'kB', 'MB', 'GB', 'TB']
    index = math.floor(math.log(size, 1024))
    divider = math.pow(1024, index)
    converted_size = round(size / divider, 2)
    return f"{converted_size} {units[index]}"


def __mljar_variable_inspector_dict_list():
    __mljar_variable_inspector_check_imported()
    def __mljar_variable_inspector_keep_cond(v):
        try:
            obj = eval(v)
            if isinstance(obj, str):
                return True
            if __tf and isinstance(obj, __tf.Variable):
                return True
            if __pd and __pd is not None and (
                isinstance(obj, __pd.core.frame.DataFrame)
                or isinstance(obj, __pd.core.series.Series)):
                return True
            if __xr and __xr is not None and isinstance(obj, __xr.DataArray):
                return True
            if str(obj).startswith("<psycopg.Connection"):
                return True
            if str(obj).startswith("<module"):
                return False
            if str(obj).startswith("<class"):
                return False 
            if str(obj).startswith("<function"):
                return False 
            if  v in ['__np', '__pd', '__pyspark', '__tf', '__K', '__torch', '__ipywidgets', '__xr']:
                return obj is not None
            if str(obj).startswith("_Feature"):
                # removes tf/keras objects
                return False
            return True
        except:
            return False
    values = __mljar_variable_inspector_nms.who_ls()
    
    vardic = []
    for _v in values:
        if __mljar_variable_inspector_keep_cond(_v):
            _ev = eval(_v)
            vardic += [{
                'varName': _v,
                'varType': type(_ev).__name__, 
                'varShape': str(__mljar_variable_inspector_getshapeof(_ev)) if __mljar_variable_inspector_getshapeof(_ev) else '',
                'varDimension': __mljar_variable_inspector_getdim(_ev),
                'varSize': __mljar_variable_inspector_size_converter(__mljar_variable_inspector_get_size_mb(_ev)),
                'varSimpleValue': __mljar_variable_inspector_get_simple_value(_ev)[0:50] + "..." if isinstance(_ev, str) and len(__mljar_variable_inspector_get_simple_value(_ev)) > 50 else __mljar_variable_inspector_get_simple_value(_ev)
            }]
  
    return json.dumps(vardic, ensure_ascii=False)


def __mljar_variable_inspector_get_size_mb(obj):
    return sys.getsizeof(obj)


def __mljar_variable_inspector_getdim(x):
    """
    return dimension for object:
      - For Data frame -> 2
      - For Series -> 1
      - For NDarray -> korzysta z atrybutu ndim
      - For pyspark DataFrame -> 2
      - For TensorFlow, PyTorch, xarray -> shape length
      - For list -> nesting depth
      - For sklar type (int, float, itp.) -> 1
      - For other objects or dict -> 0
    """
    if __pd and isinstance(x, __pd.DataFrame):
        return 2
    if __pd and isinstance(x, __pd.Series):
        return 1
    if __np and isinstance(x, __np.ndarray):
        return x.ndim
    if __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return 2
    if __tf and (isinstance(x, __tf.Variable) or isinstance(x, __tf.Tensor)):
        try:
            return len(x.shape)
        except Exception:
            return 0
    if __torch and isinstance(x, __torch.Tensor):
        return len(x.shape)
    if __xr and isinstance(x, __xr.DataArray):
        return len(x.shape)
    if isinstance(x, list):
        def __mljar_variable_inspector_list_depth(lst):
            if isinstance(lst, list) and lst:
                subdepths = [__mljar_variable_inspector_list_depth(el) for el in lst if isinstance(el, list)]
                if subdepths:
                    return 1 + max(subdepths)
                else:
                    return 1
            else:
                return 0
        return __mljar_variable_inspector_list_depth(x)
    if isinstance(x, (int, float, complex, bool, str)):
        return 1
    if isinstance(x, dict):
        return 0
    return 0


def __mljar_variable_inspector_getmatrixcontent(x, max_rows=10000):
    # to do: add something to handle this in the future
    threshold = max_rows

    if __pd and __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        df = x.limit(threshold).toPandas()
        return __mljar_variable_inspector_getmatrixcontent(df.copy())
    elif __np and __pd and type(x).__name__ == "DataFrame":
        if threshold is not None:
            x = x.head(threshold)
        x.columns = x.columns.map(str)
        return x.to_json(orient="table", default_handler= __mljar_variable_inspector_default, force_ascii=False)
    elif __np and __pd and type(x).__name__ == "Series": 
        if threshold is not None:
            x = x.head(threshold)
        return x.to_json(orient="table", default_handler= __mljar_variable_inspector_default, force_ascii=False)
    elif __np and __pd and type(x).__name__ == "ndarray":
        df = __pd.DataFrame(x)
        return __mljar_variable_inspector_getmatrixcontent(df)
    elif __tf and (isinstance(x, __tf.Variable) or isinstance(x, __tf.Tensor)):
        df = __K.get_value(x)
        return __mljar_variable_inspector_getmatrixcontent(df)
    elif __torch and isinstance(x, __torch.Tensor):
        df = x.cpu().numpy()
        return __mljar_variable_inspector_getmatrixcontent(df)
    elif __xr and isinstance(x, __xr.DataArray):
        df = x.to_numpy()
        return __mljar_variable_inspector_getmatrixcontent(df)
    elif isinstance(x, list):
        s = __pd.Series(x)
        return __mljar_variable_inspector_getmatrixcontent(s)


def __mljar_variable_inspector_displaywidget(widget):
    display(widget)


def __mljar_variable_inspector_default(o):
    if isinstance(o, __np.number): return int(o)  
    raise TypeError


def __mljar_variable_inspector_deletevariable(x):
    exec("del %s" % x, globals())

__mljar_variable_inspector_dict_list()
`;

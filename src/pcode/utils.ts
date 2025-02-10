export const variableDict = `
import json
import sys
from importlib import __import__
from IPython import get_ipython
from IPython.core.magics.namespace import NamespaceMagics

_jupyterlab_variableinspector_nms = NamespaceMagics()
_jupyterlab_variableinspector_Jupyter = get_ipython()
_jupyterlab_variableinspector_nms.shell = _jupyterlab_variableinspector_Jupyter.kernel.shell

__np = None
__pd = None
__pyspark = None
__tf = None
__K = None
__torch = None
__ipywidgets = None
__xr = None


def _attempt_import(module):
    try:
        return __import__(module)
    except ImportError:
        return None


def _check_imported():
    global __np, __pd, __pyspark, __tf, __K, __torch, __ipywidgets, __xr

    __np = _attempt_import('numpy')
    __pd = _attempt_import('pandas')
    __pyspark = _attempt_import('pyspark')
    __tf = _attempt_import('tensorflow')
    __K = _attempt_import('keras.backend') or _attempt_import('tensorflow.keras.backend')
    __torch = _attempt_import('torch')
    __ipywidgets = _attempt_import('ipywidgets')
    __xr = _attempt_import('xarray')


def _jupyterlab_variableinspector_getsizeof(x):
    if type(x).__name__ in ['ndarray', 'Series']:
        return x.nbytes
    elif __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return "?"
    elif __tf and isinstance(x, __tf.Variable):
        return "?"
    elif __torch and isinstance(x, __torch.Tensor):
        return x.element_size() * x.nelement()
    elif __pd and type(x).__name__ == 'DataFrame':
        return x.memory_usage().sum()
    else:
        return sys.getsizeof(x)


def _jupyterlab_variableinspector_getshapeof(x):
    if __pd and isinstance(x, __pd.DataFrame):
        return "%d rows x %d cols" % x.shape
    if __pd and isinstance(x, __pd.Series):
        return "%d rows" % x.shape
    if __np and isinstance(x, __np.ndarray):
        shape = " x ".join([str(i) for i in x.shape])
        return "%s" % shape
    if __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return "? rows x %d cols" % len(x.columns)
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
        return "%s" % len(x)
    if isinstance(x, dict):
        return "%s keys" % len(x)
    return None

def _jupyterlab_variableinspector_getcolumnsof(x):
    if __pd and isinstance(x, __pd.DataFrame):
        return list(x.columns)
    return []

def _jupyterlab_variableinspector_getcolumntypesof(x):
    if __pd and isinstance(x, __pd.DataFrame):
        return [str(t) for t in x.dtypes]
    return []


def _jupyterlab_variableinspector_getcontentof(x):
    # returns content in a friendly way for python variables
    # pandas and numpy
    if __pd and isinstance(x, __pd.DataFrame):
        colnames = ', '.join(x.columns.map(str))
        content = "Columns: %s" % colnames
    elif __pd and isinstance(x, __pd.Series):
        content = str(x.values).replace(" ", ", ")[1:-1]
        content = content.replace("\\n", "")
    elif __np and isinstance(x, __np.ndarray):
        content = x.__repr__()
    elif __xr and isinstance(x, __xr.DataArray):
        content = x.values.__repr__()
    else:
        content = str(x)

    if len(content) > 150:
        return content[:150] + " ..."
    else:
        return content


def _jupyterlab_variableinspector_is_matrix(x):
    # True if type(x).__name__ in ["DataFrame", "ndarray", "Series"] else False
    if __pd and isinstance(x, __pd.DataFrame):
        return True
    if __pd and isinstance(x, __pd.Series):
        return True
    if __np and isinstance(x, __np.ndarray) and len(x.shape) <= 2:
        return True
    if __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        return True
    if __tf and isinstance(x, __tf.Variable) and len(x.shape) <= 2:
        return True
    if __tf and isinstance(x, __tf.Tensor) and len(x.shape) <= 2:
        return True
    if __torch and isinstance(x, __torch.Tensor) and len(x.shape) <= 2:
        return True
    if __xr and isinstance(x, __xr.DataArray) and len(x.shape) <= 2:
        return True
    if isinstance(x, list):
        return True
    return False


def _jupyterlab_variableinspector_is_widget(x):
    return __ipywidgets and issubclass(x, __ipywidgets.DOMWidget)


def _jupyterlab_variableinspector_dict_list():
    _check_imported()
    def keep_cond(v):
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
    values = _jupyterlab_variableinspector_nms.who_ls()
    
    vardic = []
    for _v in values:
        if keep_cond(_v):
            _ev = eval(_v)
            vardic += [{
                'varName': _v,
                'varType': type(_ev).__name__, 
                'varShape': str(_jupyterlab_variableinspector_getshapeof(_ev)) if _jupyterlab_variableinspector_getshapeof(_ev) else '',
                'varDimension': _jupyterlab_variableinspector_getdim(_ev)
                #'varSize': str(_jupyterlab_variableinspector_getsizeof(_ev)), 
                #'varContent': "", # str(_jupyterlab_variableinspector_getcontentof(_ev)), 
                #'isMatrix': _jupyterlab_variableinspector_is_matrix(_ev),
                #'isWidget': _jupyterlab_variableinspector_is_widget(type(_ev)),
                #'varColumns': _jupyterlab_variableinspector_getcolumnsof(_ev),
                #'varColumnTypes': _jupyterlab_variableinspector_getcolumntypesof(_ev),
            }]
  
    return json.dumps(vardic, ensure_ascii=False)



def _jupyterlab_variableinspector_getdim(x):
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
        def list_depth(lst):
            if isinstance(lst, list) and lst:
                subdepths = [list_depth(el) for el in lst if isinstance(el, list)]
                if subdepths:
                    return 1 + max(subdepths)
                else:
                    return 1
            else:
                return 0
        return list_depth(x)
    if isinstance(x, (int, float, complex, bool, str)):
        return 1
    if isinstance(x, dict):
        return 0
    return 0


def _jupyterlab_variableinspector_getmatrixcontent(x, max_rows=10000):
    # to do: add something to handle this in the future
    threshold = max_rows

    if __pd and __pyspark and isinstance(x, __pyspark.sql.DataFrame):
        df = x.limit(threshold).toPandas()
        return _jupyterlab_variableinspector_getmatrixcontent(df.copy())
    elif __np and __pd and type(x).__name__ == "DataFrame":
        if threshold is not None:
            x = x.head(threshold)
        x.columns = x.columns.map(str)
        return x.to_json(orient="table", default_handler=_jupyterlab_variableinspector_default, force_ascii=False)
    elif __np and __pd and type(x).__name__ == "Series":
        if threshold is not None:
            x = x.head(threshold)
        return x.to_json(orient="table", default_handler=_jupyterlab_variableinspector_default, force_ascii=False)
    elif __np and __pd and type(x).__name__ == "ndarray":
        df = __pd.DataFrame(x)
        return _jupyterlab_variableinspector_getmatrixcontent(df)
    elif __tf and (isinstance(x, __tf.Variable) or isinstance(x, __tf.Tensor)):
        df = __K.get_value(x)
        return _jupyterlab_variableinspector_getmatrixcontent(df)
    elif __torch and isinstance(x, __torch.Tensor):
        df = x.cpu().numpy()
        return _jupyterlab_variableinspector_getmatrixcontent(df)
    elif __xr and isinstance(x, __xr.DataArray):
        df = x.to_numpy()
        return _jupyterlab_variableinspector_getmatrixcontent(df)
    elif isinstance(x, list):
        s = __pd.Series(x)
        return _jupyterlab_variableinspector_getmatrixcontent(s)


def _jupyterlab_variableinspector_displaywidget(widget):
    display(widget)


def _jupyterlab_variableinspector_default(o):
    if isinstance(o, __np.number): return int(o)  
    raise TypeError


def _jupyterlab_variableinspector_deletevariable(x):
    exec("del %s" % x, globals())

_jupyterlab_variableinspector_dict_list()

`

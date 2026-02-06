import sys, traceback
print("Python:", sys.version)
try:
    import backend.server as s
    print("IMPORT_OK_FILE:", getattr(s,"__file__",None))
    print("HAS_APP:", hasattr(s,"app"))
    if not hasattr(s,"app"):
        raise RuntimeError("backend.server imported but has no 'app'")
except Exception as e:
    print("IMPORT_FAILED:", repr(e))
    traceback.print_exc()
    raise

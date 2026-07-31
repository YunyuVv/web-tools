var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@jsquash/jpeg/codec/enc/mozjpeg_enc.js
var Module, mozjpeg_enc_default;
var init_mozjpeg_enc = __esm({
  "node_modules/@jsquash/jpeg/codec/enc/mozjpeg_enc.js"() {
    Module = (() => {
      var _scriptDir = import.meta.url;
      return (function(moduleArg = {}) {
        var Module5 = moduleArg;
        var readyPromiseResolve, readyPromiseReject;
        var readyPromise = new Promise((resolve, reject) => {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject;
        });
        const isServiceWorker2 = globalThis.ServiceWorkerGlobalScope !== void 0;
        const isRunningInCloudFlareWorkers2 = isServiceWorker2 && typeof self !== "undefined" && globalThis.caches && globalThis.caches.default !== void 0;
        const isRunningInNode2 = typeof process === "object" && process.release && process.release.name === "node";
        if (isRunningInCloudFlareWorkers2 || isRunningInNode2) {
          if (!globalThis.ImageData) {
            globalThis.ImageData = class ImageData {
              constructor(data, width, height) {
                this.data = data;
                this.width = width;
                this.height = height;
              }
            };
          }
          if (import.meta.url === void 0) {
            import.meta.url = "https://localhost";
          }
          if (typeof self !== "undefined" && self.location === void 0) {
            self.location = { href: "" };
          }
        }
        var moduleOverrides = Object.assign({}, Module5);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module5["locateFile"]) {
            return Module5["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var read_, readAsync, readBinary;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            scriptDirectory = document.currentScript.src;
          }
          if (_scriptDir) {
            scriptDirectory = _scriptDir;
          }
          if (scriptDirectory.startsWith("blob:")) {
            scriptDirectory = "";
          } else {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
          }
          {
            read_ = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = (url, onload, onerror) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = () => {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
          }
        } else {
        }
        var out = Module5["print"] || console.log.bind(console);
        var err = Module5["printErr"] || console.error.bind(console);
        Object.assign(Module5, moduleOverrides);
        moduleOverrides = null;
        if (Module5["arguments"]) arguments_ = Module5["arguments"];
        if (Module5["thisProgram"]) thisProgram = Module5["thisProgram"];
        if (Module5["quit"]) quit_ = Module5["quit"];
        var wasmBinary;
        if (Module5["wasmBinary"]) wasmBinary = Module5["wasmBinary"];
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module5["HEAP8"] = HEAP8 = new Int8Array(b);
          Module5["HEAP16"] = HEAP16 = new Int16Array(b);
          Module5["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module5["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module5["HEAP32"] = HEAP32 = new Int32Array(b);
          Module5["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module5["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module5["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module5["preRun"]) {
            if (typeof Module5["preRun"] == "function") Module5["preRun"] = [Module5["preRun"]];
            while (Module5["preRun"].length) {
              addOnPreRun(Module5["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
          runtimeInitialized = true;
          callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
          if (Module5["postRun"]) {
            if (typeof Module5["postRun"] == "function") Module5["postRun"] = [Module5["postRun"]];
            while (Module5["postRun"].length) {
              addOnPostRun(Module5["postRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
          runDependencies++;
          Module5["monitorRunDependencies"]?.(runDependencies);
        }
        function removeRunDependency(id) {
          runDependencies--;
          Module5["monitorRunDependencies"]?.(runDependencies);
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          Module5["onAbort"]?.(what);
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
        var wasmBinaryFile;
        if (Module5["locateFile"]) {
          wasmBinaryFile = "mozjpeg_enc.wasm";
          if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
          }
        } else {
          wasmBinaryFile = new URL("mozjpeg_enc.wasm", import.meta.url).href;
        }
        function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          }
          throw "both async and sync fetching of the wasm failed";
        }
        function getBinaryPromise(binaryFile) {
          if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
            if (typeof fetch == "function") {
              return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
                if (!response["ok"]) {
                  throw `failed to load wasm binary file at '${binaryFile}'`;
                }
                return response["arrayBuffer"]();
              }).catch(() => getBinarySync(binaryFile));
            }
          }
          return Promise.resolve().then(() => getBinarySync(binaryFile));
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then((binary) => WebAssembly.instantiate(binary, imports)).then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
            return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
              var result = WebAssembly.instantiateStreaming(response, imports);
              return result.then(callback, function(reason) {
                err(`wasm streaming compile failed: ${reason}`);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback);
              });
            });
          }
          return instantiateArrayBuffer(binaryFile, imports, callback);
        }
        function createWasm() {
          var info = { "a": wasmImports };
          function receiveInstance(instance, module) {
            wasmExports = instance.exports;
            wasmMemory = wasmExports["C"];
            updateMemoryViews();
            wasmTable = wasmExports["H"];
            addOnInit(wasmExports["D"]);
            removeRunDependency("wasm-instantiate");
            return wasmExports;
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result) {
            receiveInstance(result["instance"]);
          }
          if (Module5["instantiateWasm"]) {
            try {
              return Module5["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err(`Module.instantiateWasm callback failed with error: ${e}`);
              readyPromiseReject(e);
            }
          }
          instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
          return {};
        }
        function ExitStatus(status) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${status})`;
          this.status = status;
        }
        var callRuntimeCallbacks = (callbacks) => {
          while (callbacks.length > 0) {
            callbacks.shift()(Module5);
          }
        };
        var noExitRuntime = Module5["noExitRuntime"] || true;
        class ExceptionInfo {
          constructor(excPtr) {
            this.excPtr = excPtr;
            this.ptr = excPtr - 24;
          }
          set_type(type) {
            HEAPU32[this.ptr + 4 >> 2] = type;
          }
          get_type() {
            return HEAPU32[this.ptr + 4 >> 2];
          }
          set_destructor(destructor) {
            HEAPU32[this.ptr + 8 >> 2] = destructor;
          }
          get_destructor() {
            return HEAPU32[this.ptr + 8 >> 2];
          }
          set_caught(caught) {
            caught = caught ? 1 : 0;
            HEAP8[this.ptr + 12] = caught;
          }
          get_caught() {
            return HEAP8[this.ptr + 12] != 0;
          }
          set_rethrown(rethrown) {
            rethrown = rethrown ? 1 : 0;
            HEAP8[this.ptr + 13] = rethrown;
          }
          get_rethrown() {
            return HEAP8[this.ptr + 13] != 0;
          }
          init(type, destructor) {
            this.set_adjusted_ptr(0);
            this.set_type(type);
            this.set_destructor(destructor);
          }
          set_adjusted_ptr(adjustedPtr) {
            HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
          }
          get_adjusted_ptr() {
            return HEAPU32[this.ptr + 16 >> 2];
          }
          get_exception_ptr() {
            var isPointer = ___cxa_is_pointer_type(this.get_type());
            if (isPointer) {
              return HEAPU32[this.excPtr >> 2];
            }
            var adjusted = this.get_adjusted_ptr();
            if (adjusted !== 0) return adjusted;
            return this.excPtr;
          }
        }
        var exceptionLast = 0;
        var uncaughtExceptionCount = 0;
        var ___cxa_throw = (ptr, type, destructor) => {
          var info = new ExceptionInfo(ptr);
          info.init(type, destructor);
          exceptionLast = ptr;
          uncaughtExceptionCount++;
          throw exceptionLast;
        };
        var structRegistrations = {};
        var runDestructors = (destructors) => {
          while (destructors.length) {
            var ptr = destructors.pop();
            var del = destructors.pop();
            del(ptr);
          }
        };
        function readPointer(pointer) {
          return this["fromWireType"](HEAPU32[pointer >> 2]);
        }
        var awaitingDependencies = {};
        var registeredTypes = {};
        var typeDependencies = {};
        var InternalError;
        var throwInternalError = (message) => {
          throw new InternalError(message);
        };
        var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
          myTypes.forEach(function(type) {
            typeDependencies[type] = dependentTypes;
          });
          function onComplete(typeConverters2) {
            var myTypeConverters = getTypeConverters(typeConverters2);
            if (myTypeConverters.length !== myTypes.length) {
              throwInternalError("Mismatched type converter count");
            }
            for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
            }
          }
          var typeConverters = new Array(dependentTypes.length);
          var unregisteredTypes = [];
          var registered = 0;
          dependentTypes.forEach((dt, i) => {
            if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
            } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(() => {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                  onComplete(typeConverters);
                }
              });
            }
          });
          if (0 === unregisteredTypes.length) {
            onComplete(typeConverters);
          }
        };
        var __embind_finalize_value_object = (structType) => {
          var reg = structRegistrations[structType];
          delete structRegistrations[structType];
          var rawConstructor = reg.rawConstructor;
          var rawDestructor = reg.rawDestructor;
          var fieldRecords = reg.fields;
          var fieldTypes = fieldRecords.map((field) => field.getterReturnType).concat(fieldRecords.map((field) => field.setterArgumentType));
          whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes2) => {
            var fields = {};
            fieldRecords.forEach((field, i) => {
              var fieldName = field.fieldName;
              var getterReturnType = fieldTypes2[i];
              var getter = field.getter;
              var getterContext = field.getterContext;
              var setterArgumentType = fieldTypes2[i + fieldRecords.length];
              var setter = field.setter;
              var setterContext = field.setterContext;
              fields[fieldName] = { read: (ptr) => getterReturnType["fromWireType"](getter(getterContext, ptr)), write: (ptr, o) => {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                runDestructors(destructors);
              } };
            });
            return [{ name: reg.name, "fromWireType": (ptr) => {
              var rv = {};
              for (var i in fields) {
                rv[i] = fields[i].read(ptr);
              }
              rawDestructor(ptr);
              return rv;
            }, "toWireType": (destructors, o) => {
              for (var fieldName in fields) {
                if (!(fieldName in o)) {
                  throw new TypeError(`Missing field: "${fieldName}"`);
                }
              }
              var ptr = rawConstructor();
              for (fieldName in fields) {
                fields[fieldName].write(ptr, o[fieldName]);
              }
              if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
              }
              return ptr;
            }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: rawDestructor }];
          });
        };
        var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
        };
        var embind_init_charCodes = () => {
          var codes = new Array(256);
          for (var i = 0; i < 256; ++i) {
            codes[i] = String.fromCharCode(i);
          }
          embind_charCodes = codes;
        };
        var embind_charCodes;
        var readLatin1String = (ptr) => {
          var ret = "";
          var c = ptr;
          while (HEAPU8[c]) {
            ret += embind_charCodes[HEAPU8[c++]];
          }
          return ret;
        };
        var BindingError;
        var throwBindingError = (message) => {
          throw new BindingError(message);
        };
        function sharedRegisterType(rawType, registeredInstance, options = {}) {
          var name = registeredInstance.name;
          if (!rawType) {
            throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
          }
          if (registeredTypes.hasOwnProperty(rawType)) {
            if (options.ignoreDuplicateRegistrations) {
              return;
            } else {
              throwBindingError(`Cannot register type '${name}' twice`);
            }
          }
          registeredTypes[rawType] = registeredInstance;
          delete typeDependencies[rawType];
          if (awaitingDependencies.hasOwnProperty(rawType)) {
            var callbacks = awaitingDependencies[rawType];
            delete awaitingDependencies[rawType];
            callbacks.forEach((cb) => cb());
          }
        }
        function registerType(rawType, registeredInstance, options = {}) {
          if (!("argPackAdvance" in registeredInstance)) {
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          }
          return sharedRegisterType(rawType, registeredInstance, options);
        }
        var GenericWireTypeSize = 8;
        var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(wt) {
            return !!wt;
          }, "toWireType": function(destructors, o) {
            return o ? trueValue : falseValue;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": function(pointer) {
            return this["fromWireType"](HEAPU8[pointer]);
          }, destructorFunction: null });
        };
        var emval_freelist = [];
        var emval_handles = [];
        var __emval_decref = (handle) => {
          if (handle > 9 && 0 === --emval_handles[handle + 1]) {
            emval_handles[handle] = void 0;
            emval_freelist.push(handle);
          }
        };
        var count_emval_handles = () => emval_handles.length / 2 - 5 - emval_freelist.length;
        var init_emval = () => {
          emval_handles.push(0, 1, void 0, 1, null, 1, true, 1, false, 1);
          Module5["count_emval_handles"] = count_emval_handles;
        };
        var Emval = { toValue: (handle) => {
          if (!handle) {
            throwBindingError("Cannot use deleted val. handle = " + handle);
          }
          return emval_handles[handle];
        }, toHandle: (value) => {
          switch (value) {
            case void 0:
              return 2;
            case null:
              return 4;
            case true:
              return 6;
            case false:
              return 8;
            default: {
              const handle = emval_freelist.pop() || emval_handles.length;
              emval_handles[handle] = value;
              emval_handles[handle + 1] = 1;
              return handle;
            }
          }
        } };
        var EmValType = { name: "emscripten::val", "fromWireType": (handle) => {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        }, "toWireType": (destructors, value) => Emval.toHandle(value), "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: null };
        var __embind_register_emval = (rawType) => registerType(rawType, EmValType);
        var floatReadValueFromPointer = (name, width) => {
          switch (width) {
            case 4:
              return function(pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2]);
              };
            case 8:
              return function(pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3]);
              };
            default:
              throw new TypeError(`invalid float width (${width}): ${name}`);
          }
        };
        var __embind_register_float = (rawType, name, size) => {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": (value) => value, "toWireType": (destructors, value) => value, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": floatReadValueFromPointer(name, size), destructorFunction: null });
        };
        var createNamedFunction = (name, body) => Object.defineProperty(body, "name", { value: name });
        function usesDestructorStack(argTypes) {
          for (var i = 1; i < argTypes.length; ++i) {
            if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
              return true;
            }
          }
          return false;
        }
        function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
          var argCount = argTypes.length;
          if (argCount < 2) {
            throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
          }
          var isClassMethodFunc = argTypes[1] !== null && classType !== null;
          var needsDestructorStack = usesDestructorStack(argTypes);
          var returns = argTypes[0].name !== "void";
          var expectedArgCount = argCount - 2;
          var argsWired = new Array(expectedArgCount);
          var invokerFuncArgs = [];
          var destructors = [];
          var invokerFn = function(...args) {
            if (args.length !== expectedArgCount) {
              throwBindingError(`function ${humanName} called with ${args.length} arguments, expected ${expectedArgCount}`);
            }
            destructors.length = 0;
            var thisWired;
            invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
            invokerFuncArgs[0] = cppTargetFunc;
            if (isClassMethodFunc) {
              thisWired = argTypes[1]["toWireType"](destructors, this);
              invokerFuncArgs[1] = thisWired;
            }
            for (var i = 0; i < expectedArgCount; ++i) {
              argsWired[i] = argTypes[i + 2]["toWireType"](destructors, args[i]);
              invokerFuncArgs.push(argsWired[i]);
            }
            var rv = cppInvokerFunc(...invokerFuncArgs);
            function onDone(rv2) {
              if (needsDestructorStack) {
                runDestructors(destructors);
              } else {
                for (var i2 = isClassMethodFunc ? 1 : 2; i2 < argTypes.length; i2++) {
                  var param = i2 === 1 ? thisWired : argsWired[i2 - 2];
                  if (argTypes[i2].destructorFunction !== null) {
                    argTypes[i2].destructorFunction(param);
                  }
                }
              }
              if (returns) {
                return argTypes[0]["fromWireType"](rv2);
              }
            }
            return onDone(rv);
          };
          return createNamedFunction(humanName, invokerFn);
        }
        var ensureOverloadTable = (proto, methodName, humanName) => {
          if (void 0 === proto[methodName].overloadTable) {
            var prevFunc = proto[methodName];
            proto[methodName] = function(...args) {
              if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
                throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
              }
              return proto[methodName].overloadTable[args.length].apply(this, args);
            };
            proto[methodName].overloadTable = [];
            proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
          }
        };
        var exposePublicSymbol = (name, value, numArguments) => {
          if (Module5.hasOwnProperty(name)) {
            if (void 0 === numArguments || void 0 !== Module5[name].overloadTable && void 0 !== Module5[name].overloadTable[numArguments]) {
              throwBindingError(`Cannot register public name '${name}' twice`);
            }
            ensureOverloadTable(Module5, name, name);
            if (Module5.hasOwnProperty(numArguments)) {
              throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
            }
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            if (void 0 !== numArguments) {
              Module5[name].numArguments = numArguments;
            }
          }
        };
        var heap32VectorToArray = (count, firstElement) => {
          var array = [];
          for (var i = 0; i < count; i++) {
            array.push(HEAPU32[firstElement + i * 4 >> 2]);
          }
          return array;
        };
        var replacePublicSymbol = (name, value, numArguments) => {
          if (!Module5.hasOwnProperty(name)) {
            throwInternalError("Replacing nonexistent public symbol");
          }
          if (void 0 !== Module5[name].overloadTable && void 0 !== numArguments) {
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            Module5[name].argCount = numArguments;
          }
        };
        var dynCallLegacy = (sig, ptr, args) => {
          sig = sig.replace(/p/g, "i");
          var f = Module5["dynCall_" + sig];
          return f(ptr, ...args);
        };
        var wasmTableMirror = [];
        var wasmTable;
        var getWasmTableEntry = (funcPtr) => {
          var func = wasmTableMirror[funcPtr];
          if (!func) {
            if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
            wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
          }
          return func;
        };
        var dynCall = (sig, ptr, args = []) => {
          if (sig.includes("j")) {
            return dynCallLegacy(sig, ptr, args);
          }
          var rtn = getWasmTableEntry(ptr)(...args);
          return rtn;
        };
        var getDynCaller = (sig, ptr) => (...args) => dynCall(sig, ptr, args);
        var embind__requireFunction = (signature, rawFunction) => {
          signature = readLatin1String(signature);
          function makeDynCaller() {
            if (signature.includes("j")) {
              return getDynCaller(signature, rawFunction);
            }
            return getWasmTableEntry(rawFunction);
          }
          var fp = makeDynCaller();
          if (typeof fp != "function") {
            throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
          }
          return fp;
        };
        var extendError = (baseErrorType, errorName) => {
          var errorClass = createNamedFunction(errorName, function(message) {
            this.name = errorName;
            this.message = message;
            var stack = new Error(message).stack;
            if (stack !== void 0) {
              this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
            }
          });
          errorClass.prototype = Object.create(baseErrorType.prototype);
          errorClass.prototype.constructor = errorClass;
          errorClass.prototype.toString = function() {
            if (this.message === void 0) {
              return this.name;
            } else {
              return `${this.name}: ${this.message}`;
            }
          };
          return errorClass;
        };
        var UnboundTypeError;
        var getTypeName = (type) => {
          var ptr = ___getTypeName(type);
          var rv = readLatin1String(ptr);
          _free(ptr);
          return rv;
        };
        var throwUnboundTypeError = (message, types) => {
          var unboundTypes = [];
          var seen = {};
          function visit(type) {
            if (seen[type]) {
              return;
            }
            if (registeredTypes[type]) {
              return;
            }
            if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return;
            }
            unboundTypes.push(type);
            seen[type] = true;
          }
          types.forEach(visit);
          throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([", "]));
        };
        var getFunctionName = (signature) => {
          signature = signature.trim();
          const argsIndex = signature.indexOf("(");
          if (argsIndex !== -1) {
            return signature.substr(0, argsIndex);
          } else {
            return signature;
          }
        };
        var __embind_register_function = (name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync) => {
          var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
          name = readLatin1String(name);
          name = getFunctionName(name);
          rawInvoker = embind__requireFunction(signature, rawInvoker);
          exposePublicSymbol(name, function() {
            throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes);
          }, argCount - 1);
          whenDependentTypesAreResolved([], argTypes, (argTypes2) => {
            var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
            replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn, isAsync), argCount - 1);
            return [];
          });
        };
        var integerReadValueFromPointer = (name, width, signed) => {
          switch (width) {
            case 1:
              return signed ? (pointer) => HEAP8[pointer] : (pointer) => HEAPU8[pointer];
            case 2:
              return signed ? (pointer) => HEAP16[pointer >> 1] : (pointer) => HEAPU16[pointer >> 1];
            case 4:
              return signed ? (pointer) => HEAP32[pointer >> 2] : (pointer) => HEAPU32[pointer >> 2];
            default:
              throw new TypeError(`invalid integer width (${width}): ${name}`);
          }
        };
        var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
          name = readLatin1String(name);
          if (maxRange === -1) {
            maxRange = 4294967295;
          }
          var fromWireType = (value) => value;
          if (minRange === 0) {
            var bitshift = 32 - 8 * size;
            fromWireType = (value) => value << bitshift >>> bitshift;
          }
          var isUnsignedType = name.includes("unsigned");
          var checkAssertions = (value, toTypeName) => {
          };
          var toWireType;
          if (isUnsignedType) {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value >>> 0;
            };
          } else {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value;
            };
          }
          registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": integerReadValueFromPointer(name, size, minRange !== 0), destructorFunction: null });
        };
        var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
          var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
          var TA = typeMapping[dataTypeIndex];
          function decodeMemoryView(handle) {
            var size = HEAPU32[handle >> 2];
            var data = HEAPU32[handle + 4 >> 2];
            return new TA(HEAP8.buffer, data, size);
          }
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
        };
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
          if (!(maxBytesToWrite > 0)) return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i);
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023;
            }
            if (u <= 127) {
              if (outIdx >= endIdx) break;
              heap[outIdx++] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              heap[outIdx++] = 192 | u >> 6;
              heap[outIdx++] = 128 | u & 63;
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              heap[outIdx++] = 224 | u >> 12;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            } else {
              if (outIdx + 3 >= endIdx) break;
              heap[outIdx++] = 240 | u >> 18;
              heap[outIdx++] = 128 | u >> 12 & 63;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            }
          }
          heap[outIdx] = 0;
          return outIdx - startIdx;
        };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        var lengthBytesUTF8 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        };
        var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
          var endIdx = idx + maxBytesToRead;
          var str = "";
          while (!(idx >= endIdx)) {
            var u0 = heapOrArray[idx++];
            if (!u0) return str;
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
          return str;
        };
        var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        var __embind_register_std_string = (rawType, name) => {
          name = readLatin1String(name);
          var stdStringIsUTF8 = name === "std::string";
          registerType(rawType, { name, "fromWireType"(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === void 0) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join("");
            }
            _free(value);
            return str;
          }, "toWireType"(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError("Cannot pass non-string to std::string");
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction(ptr) {
            _free(ptr);
          } });
        };
        var UTF16ToString = (ptr, maxBytesToRead) => {
          var str = "";
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        };
        var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
          maxBytesToWrite ?? (maxBytesToWrite = 2147483647);
          if (maxBytesToWrite < 2) return 0;
          maxBytesToWrite -= 2;
          var startPtr = outPtr;
          var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
          for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i);
            HEAP16[outPtr >> 1] = codeUnit;
            outPtr += 2;
          }
          HEAP16[outPtr >> 1] = 0;
          return outPtr - startPtr;
        };
        var lengthBytesUTF16 = (str) => str.length * 2;
        var UTF32ToString = (ptr, maxBytesToRead) => {
          var i = 0;
          var str = "";
          while (!(i >= maxBytesToRead / 4)) {
            var utf32 = HEAP32[ptr + i * 4 >> 2];
            if (utf32 == 0) break;
            ++i;
            if (utf32 >= 65536) {
              var ch = utf32 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            } else {
              str += String.fromCharCode(utf32);
            }
          }
          return str;
        };
        var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
          maxBytesToWrite ?? (maxBytesToWrite = 2147483647);
          if (maxBytesToWrite < 4) return 0;
          var startPtr = outPtr;
          var endPtr = startPtr + maxBytesToWrite - 4;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) {
              var trailSurrogate = str.charCodeAt(++i);
              codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
            }
            HEAP32[outPtr >> 2] = codeUnit;
            outPtr += 4;
            if (outPtr + 4 > endPtr) break;
          }
          HEAP32[outPtr >> 2] = 0;
          return outPtr - startPtr;
        };
        var lengthBytesUTF32 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
            len += 4;
          }
          return len;
        };
        var __embind_register_std_wstring = (rawType, charSize, name) => {
          name = readLatin1String(name);
          var decodeString, encodeString, readCharAt, lengthBytesUTF;
          if (charSize === 2) {
            decodeString = UTF16ToString;
            encodeString = stringToUTF16;
            lengthBytesUTF = lengthBytesUTF16;
            readCharAt = (pointer) => HEAPU16[pointer >> 1];
          } else if (charSize === 4) {
            decodeString = UTF32ToString;
            encodeString = stringToUTF32;
            lengthBytesUTF = lengthBytesUTF32;
            readCharAt = (pointer) => HEAPU32[pointer >> 2];
          }
          registerType(rawType, { name, "fromWireType": (value) => {
            var length = HEAPU32[value >> 2];
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || readCharAt(currentBytePtr) == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          }, "toWireType": (destructors, value) => {
            if (!(typeof value == "string")) {
              throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length / charSize;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction(ptr) {
            _free(ptr);
          } });
        };
        var __embind_register_value_object = (rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) => {
          structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
        };
        var __embind_register_value_object_field = (structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) => {
          structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
        };
        var __embind_register_void = (rawType, name) => {
          name = readLatin1String(name);
          registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": () => void 0, "toWireType": (destructors, o) => void 0 });
        };
        var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
        var emval_methodCallers = [];
        var __emval_call = (caller, handle, destructorsRef, args) => {
          caller = emval_methodCallers[caller];
          handle = Emval.toValue(handle);
          return caller(null, handle, destructorsRef, args);
        };
        var emval_symbols = {};
        var getStringOrSymbol = (address) => {
          var symbol = emval_symbols[address];
          if (symbol === void 0) {
            return readLatin1String(address);
          }
          return symbol;
        };
        var emval_get_global = () => {
          if (typeof globalThis == "object") {
            return globalThis;
          }
          function testGlobal(obj) {
            obj["$$$embind_global$$$"] = obj;
            var success = typeof $$$embind_global$$$ == "object" && obj["$$$embind_global$$$"] == obj;
            if (!success) {
              delete obj["$$$embind_global$$$"];
            }
            return success;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          if (typeof global == "object" && testGlobal(global)) {
            $$$embind_global$$$ = global;
          } else if (typeof self == "object" && testGlobal(self)) {
            $$$embind_global$$$ = self;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          throw Error("unable to get global object.");
        };
        var __emval_get_global = (name) => {
          if (name === 0) {
            return Emval.toHandle(emval_get_global());
          } else {
            name = getStringOrSymbol(name);
            return Emval.toHandle(emval_get_global()[name]);
          }
        };
        var emval_addMethodCaller = (caller) => {
          var id = emval_methodCallers.length;
          emval_methodCallers.push(caller);
          return id;
        };
        var requireRegisteredType = (rawType, humanName) => {
          var impl = registeredTypes[rawType];
          if (void 0 === impl) {
            throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);
          }
          return impl;
        };
        var emval_lookupTypes = (argCount, argTypes) => {
          var a = new Array(argCount);
          for (var i = 0; i < argCount; ++i) {
            a[i] = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i);
          }
          return a;
        };
        var reflectConstruct = Reflect.construct;
        var emval_returnValue = (returnType, destructorsRef, handle) => {
          var destructors = [];
          var result = returnType["toWireType"](destructors, handle);
          if (destructors.length) {
            HEAPU32[destructorsRef >> 2] = Emval.toHandle(destructors);
          }
          return result;
        };
        var __emval_get_method_caller = (argCount, argTypes, kind) => {
          var types = emval_lookupTypes(argCount, argTypes);
          var retType = types.shift();
          argCount--;
          var argN = new Array(argCount);
          var invokerFunction = (obj, func, destructorsRef, args) => {
            var offset = 0;
            for (var i = 0; i < argCount; ++i) {
              argN[i] = types[i]["readValueFromPointer"](args + offset);
              offset += types[i]["argPackAdvance"];
            }
            var rv = kind === 1 ? reflectConstruct(func, argN) : func.apply(obj, argN);
            return emval_returnValue(retType, destructorsRef, rv);
          };
          var functionName = `methodCaller<(${types.map((t) => t.name).join(", ")}) => ${retType.name}>`;
          return emval_addMethodCaller(createNamedFunction(functionName, invokerFunction));
        };
        var __emval_run_destructors = (handle) => {
          var destructors = Emval.toValue(handle);
          runDestructors(destructors);
          __emval_decref(handle);
        };
        var _abort = () => {
          abort("");
        };
        var getHeapMax = () => 2147483648;
        var growMemory = (size) => {
          var b = wasmMemory.buffer;
          var pages = (size - b.byteLength + 65535) / 65536;
          try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return 1;
          } catch (e) {
          }
        };
        var _emscripten_resize_heap = (requestedSize) => {
          var oldSize = HEAPU8.length;
          requestedSize >>>= 0;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = growMemory(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        };
        var ENV = {};
        var getExecutableName = () => thisProgram || "./this.program";
        var getEnvStrings = () => {
          if (!getEnvStrings.strings) {
            var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
            var env = { "USER": "web_user", "LOGNAME": "web_user", "PATH": "/", "PWD": "/", "HOME": "/home/web_user", "LANG": lang, "_": getExecutableName() };
            for (var x in ENV) {
              if (ENV[x] === void 0) delete env[x];
              else env[x] = ENV[x];
            }
            var strings = [];
            for (var x in env) {
              strings.push(`${x}=${env[x]}`);
            }
            getEnvStrings.strings = strings;
          }
          return getEnvStrings.strings;
        };
        var stringToAscii = (str, buffer) => {
          for (var i = 0; i < str.length; ++i) {
            HEAP8[buffer++] = str.charCodeAt(i);
          }
          HEAP8[buffer] = 0;
        };
        var _environ_get = (__environ, environ_buf) => {
          var bufSize = 0;
          getEnvStrings().forEach((string, i) => {
            var ptr = environ_buf + bufSize;
            HEAPU32[__environ + i * 4 >> 2] = ptr;
            stringToAscii(string, ptr);
            bufSize += string.length + 1;
          });
          return 0;
        };
        var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
          var strings = getEnvStrings();
          HEAPU32[penviron_count >> 2] = strings.length;
          var bufSize = 0;
          strings.forEach((string) => bufSize += string.length + 1);
          HEAPU32[penviron_buf_size >> 2] = bufSize;
          return 0;
        };
        var runtimeKeepaliveCounter = 0;
        var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
        var _proc_exit = (code) => {
          EXITSTATUS = code;
          if (!keepRuntimeAlive()) {
            Module5["onExit"]?.(code);
            ABORT = true;
          }
          quit_(code, new ExitStatus(code));
        };
        var exitJS = (status, implicit) => {
          EXITSTATUS = status;
          _proc_exit(status);
        };
        var _exit = exitJS;
        var _fd_close = (fd) => 52;
        var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
        function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          return 70;
        }
        var printCharBuffers = [null, [], []];
        var printChar = (stream, curr) => {
          var buffer = printCharBuffers[stream];
          if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        };
        var _fd_write = (fd, iov, iovcnt, pnum) => {
          var num = 0;
          for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAPU32[iov >> 2];
            var len = HEAPU32[iov + 4 >> 2];
            iov += 8;
            for (var j = 0; j < len; j++) {
              printChar(fd, HEAPU8[ptr + j]);
            }
            num += len;
          }
          HEAPU32[pnum >> 2] = num;
          return 0;
        };
        InternalError = Module5["InternalError"] = class InternalError extends Error {
          constructor(message) {
            super(message);
            this.name = "InternalError";
          }
        };
        embind_init_charCodes();
        BindingError = Module5["BindingError"] = class BindingError extends Error {
          constructor(message) {
            super(message);
            this.name = "BindingError";
          }
        };
        init_emval();
        UnboundTypeError = Module5["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
        var wasmImports = { j: ___cxa_throw, k: __embind_finalize_value_object, n: __embind_register_bigint, h: __embind_register_bool, z: __embind_register_emval, f: __embind_register_float, e: __embind_register_function, c: __embind_register_integer, a: __embind_register_memory_view, g: __embind_register_std_string, d: __embind_register_std_wstring, l: __embind_register_value_object, b: __embind_register_value_object_field, i: __embind_register_void, s: __emscripten_memcpy_js, y: __emval_call, u: __emval_decref, A: __emval_get_global, x: __emval_get_method_caller, w: __emval_run_destructors, o: _abort, p: _emscripten_resize_heap, q: _environ_get, r: _environ_sizes_get, B: _exit, t: _fd_close, m: _fd_seek, v: _fd_write };
        var wasmExports = createWasm();
        var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["D"])();
        var ___getTypeName = (a0) => (___getTypeName = wasmExports["E"])(a0);
        var _malloc = (a0) => (_malloc = wasmExports["F"])(a0);
        var _free = (a0) => (_free = wasmExports["G"])(a0);
        var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);
        var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);
        var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();
        var ___cxa_increment_exception_refcount = (a0) => (___cxa_increment_exception_refcount = wasmExports["__cxa_increment_exception_refcount"])(a0);
        var ___cxa_is_pointer_type = (a0) => (___cxa_is_pointer_type = wasmExports["I"])(a0);
        var dynCall_jiji = Module5["dynCall_jiji"] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module5["dynCall_jiji"] = wasmExports["J"])(a0, a1, a2, a3, a4);
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          if (!calledRun) run();
          if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run() {
          if (runDependencies > 0) {
            return;
          }
          preRun();
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            if (calledRun) return;
            calledRun = true;
            Module5["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            readyPromiseResolve(Module5);
            if (Module5["onRuntimeInitialized"]) Module5["onRuntimeInitialized"]();
            postRun();
          }
          if (Module5["setStatus"]) {
            Module5["setStatus"]("Running...");
            setTimeout(function() {
              setTimeout(function() {
                Module5["setStatus"]("");
              }, 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
        }
        if (Module5["preInit"]) {
          if (typeof Module5["preInit"] == "function") Module5["preInit"] = [Module5["preInit"]];
          while (Module5["preInit"].length > 0) {
            Module5["preInit"].pop()();
          }
        }
        run();
        return readyPromise;
      });
    })();
    mozjpeg_enc_default = Module;
  }
});

// node_modules/@jsquash/jpeg/meta.js
var defaultOptions;
var init_meta = __esm({
  "node_modules/@jsquash/jpeg/meta.js"() {
    defaultOptions = {
      quality: 75,
      baseline: false,
      arithmetic: false,
      progressive: true,
      optimize_coding: true,
      smoothing: 0,
      color_space: 3,
      quant_table: 3,
      trellis_multipass: false,
      trellis_opt_zero: false,
      trellis_opt_table: false,
      trellis_loops: 1,
      auto_subsample: true,
      chroma_subsample: 2,
      separate_chroma_quality: false,
      chroma_quality: 75
    };
  }
});

// node_modules/@jsquash/jpeg/utils.js
function initEmscriptenModule(moduleFactory, wasmModule, moduleOptionOverrides = {}) {
  let instantiateWasm;
  if (wasmModule) {
    instantiateWasm = (imports, callback) => {
      const instance = new WebAssembly.Instance(wasmModule, imports);
      callback(instance);
      return instance.exports;
    };
  }
  return moduleFactory({
    // Just to be safe, don't automatically invoke any wasm functions
    noInitialRun: true,
    instantiateWasm,
    ...moduleOptionOverrides
  });
}
var init_utils = __esm({
  "node_modules/@jsquash/jpeg/utils.js"() {
  }
});

// node_modules/@jsquash/jpeg/encode.js
var encode_exports = {};
__export(encode_exports, {
  default: () => encode,
  init: () => init
});
async function init(module, moduleOptionOverrides) {
  let actualModule = module;
  let actualOptions = moduleOptionOverrides;
  if (arguments.length === 1 && !(module instanceof WebAssembly.Module)) {
    actualModule = void 0;
    actualOptions = module;
  }
  emscriptenModule = initEmscriptenModule(mozjpeg_enc_default, actualModule, actualOptions);
}
async function encode(data, options = {}) {
  if (!emscriptenModule)
    init();
  const module = await emscriptenModule;
  const _options = { ...defaultOptions, ...options };
  const resultView = module.encode(data.data, data.width, data.height, _options);
  return resultView.buffer;
}
var emscriptenModule;
var init_encode = __esm({
  "node_modules/@jsquash/jpeg/encode.js"() {
    init_mozjpeg_enc();
    init_meta();
    init_utils();
  }
});

// node_modules/@jsquash/webp/meta.js
var defaultOptions2;
var init_meta2 = __esm({
  "node_modules/@jsquash/webp/meta.js"() {
    defaultOptions2 = {
      quality: 75,
      target_size: 0,
      target_PSNR: 0,
      method: 4,
      sns_strength: 50,
      filter_strength: 60,
      filter_sharpness: 0,
      filter_type: 1,
      partitions: 0,
      segments: 4,
      pass: 1,
      show_compressed: 0,
      preprocessing: 0,
      autofilter: 0,
      partition_limit: 0,
      alpha_compression: 1,
      alpha_filtering: 1,
      alpha_quality: 100,
      lossless: 0,
      exact: 0,
      image_hint: 0,
      emulate_jpeg_size: 0,
      thread_level: 0,
      low_memory: 0,
      near_lossless: 100,
      use_delta_palette: 0,
      use_sharp_yuv: 0
    };
  }
});

// node_modules/@jsquash/webp/utils.js
function initEmscriptenModule2(moduleFactory, wasmModule, moduleOptionOverrides = {}) {
  let instantiateWasm;
  if (wasmModule) {
    instantiateWasm = (imports, callback) => {
      const instance = new WebAssembly.Instance(wasmModule, imports);
      callback(instance);
      return instance.exports;
    };
  }
  return moduleFactory({
    // Just to be safe, don't automatically invoke any wasm functions
    noInitialRun: true,
    instantiateWasm,
    ...moduleOptionOverrides
  });
}
var init_utils2 = __esm({
  "node_modules/@jsquash/webp/utils.js"() {
  }
});

// node_modules/wasm-feature-detect/dist/esm/index.js
var simd;
var init_esm = __esm({
  "node_modules/wasm-feature-detect/dist/esm/index.js"() {
    simd = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
  }
});

// node_modules/@jsquash/webp/codec/enc/webp_enc_simd.js
var webp_enc_simd_exports = {};
__export(webp_enc_simd_exports, {
  default: () => webp_enc_simd_default
});
var Module2, webp_enc_simd_default;
var init_webp_enc_simd = __esm({
  "node_modules/@jsquash/webp/codec/enc/webp_enc_simd.js"() {
    Module2 = (() => {
      var _scriptDir = import.meta.url;
      return (function(Module5 = {}) {
        var Module5 = typeof Module5 != "undefined" ? Module5 : {};
        var readyPromiseResolve, readyPromiseReject;
        Module5["ready"] = new Promise(function(resolve, reject) {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject;
        });
        const isServiceWorker2 = globalThis.ServiceWorkerGlobalScope !== void 0;
        const isRunningInCloudFlareWorkers2 = isServiceWorker2 && typeof self !== "undefined" && caches.default !== void 0;
        if (isRunningInCloudFlareWorkers2) {
          if (!globalThis.ImageData) {
            globalThis.ImageData = class ImageData {
              constructor(data, width, height) {
                this.data = data;
                this.width = width;
                this.height = height;
              }
            };
          }
          if (import.meta.url === void 0) {
            import.meta.url = "https://localhost";
          }
          if (self.location === void 0) {
            self.location = { href: "" };
          }
        }
        var moduleOverrides = Object.assign({}, Module5);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module5["locateFile"]) {
            return Module5["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var read_, readAsync, readBinary, setWindowTitle;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            scriptDirectory = document.currentScript.src;
          }
          if (_scriptDir) {
            scriptDirectory = _scriptDir;
          }
          if (scriptDirectory.indexOf("blob:") !== 0) {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
          } else {
            scriptDirectory = "";
          }
          {
            read_ = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = (url, onload, onerror) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = () => {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
          }
          setWindowTitle = (title) => document.title = title;
        } else {
        }
        var out = Module5["print"] || console.log.bind(console);
        var err = Module5["printErr"] || console.warn.bind(console);
        Object.assign(Module5, moduleOverrides);
        moduleOverrides = null;
        if (Module5["arguments"]) arguments_ = Module5["arguments"];
        if (Module5["thisProgram"]) thisProgram = Module5["thisProgram"];
        if (Module5["quit"]) quit_ = Module5["quit"];
        var wasmBinary;
        if (Module5["wasmBinary"]) wasmBinary = Module5["wasmBinary"];
        var noExitRuntime = Module5["noExitRuntime"] || true;
        if (typeof WebAssembly != "object") {
          abort("no native wasm support detected");
        }
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
          var endIdx = idx + maxBytesToRead;
          var str = "";
          while (!(idx >= endIdx)) {
            var u0 = heapOrArray[idx++];
            if (!u0) return str;
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
          return str;
        }
        function UTF8ToString(ptr, maxBytesToRead) {
          return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        }
        function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
          if (!(maxBytesToWrite > 0)) return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i);
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023;
            }
            if (u <= 127) {
              if (outIdx >= endIdx) break;
              heap[outIdx++] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              heap[outIdx++] = 192 | u >> 6;
              heap[outIdx++] = 128 | u & 63;
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              heap[outIdx++] = 224 | u >> 12;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            } else {
              if (outIdx + 3 >= endIdx) break;
              heap[outIdx++] = 240 | u >> 18;
              heap[outIdx++] = 128 | u >> 12 & 63;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            }
          }
          heap[outIdx] = 0;
          return outIdx - startIdx;
        }
        function stringToUTF8(str, outPtr, maxBytesToWrite) {
          return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        }
        function lengthBytesUTF8(str) {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        }
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module5["HEAP8"] = HEAP8 = new Int8Array(b);
          Module5["HEAP16"] = HEAP16 = new Int16Array(b);
          Module5["HEAP32"] = HEAP32 = new Int32Array(b);
          Module5["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module5["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module5["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module5["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module5["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        var wasmTable;
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module5["preRun"]) {
            if (typeof Module5["preRun"] == "function") Module5["preRun"] = [Module5["preRun"]];
            while (Module5["preRun"].length) {
              addOnPreRun(Module5["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
          runtimeInitialized = true;
          callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
          if (Module5["postRun"]) {
            if (typeof Module5["postRun"] == "function") Module5["postRun"] = [Module5["postRun"]];
            while (Module5["postRun"].length) {
              addOnPostRun(Module5["postRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
          runDependencies++;
          if (Module5["monitorRunDependencies"]) {
            Module5["monitorRunDependencies"](runDependencies);
          }
        }
        function removeRunDependency(id) {
          runDependencies--;
          if (Module5["monitorRunDependencies"]) {
            Module5["monitorRunDependencies"](runDependencies);
          }
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          if (Module5["onAbort"]) {
            Module5["onAbort"](what);
          }
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        function isDataURI(filename) {
          return filename.startsWith(dataURIPrefix);
        }
        var wasmBinaryFile;
        if (Module5["locateFile"]) {
          wasmBinaryFile = "webp_enc_simd.wasm";
          if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
          }
        } else {
          wasmBinaryFile = new URL("webp_enc_simd.wasm", import.meta.url).href;
        }
        function getBinary(file) {
          try {
            if (file == wasmBinaryFile && wasmBinary) {
              return new Uint8Array(wasmBinary);
            }
            if (readBinary) {
              return readBinary(file);
            }
            throw "both async and sync fetching of the wasm failed";
          } catch (err2) {
            abort(err2);
          }
        }
        function getBinaryPromise(binaryFile) {
          if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
            if (typeof fetch == "function") {
              return fetch(binaryFile, { credentials: "same-origin" }).then(function(response) {
                if (!response["ok"]) {
                  throw "failed to load wasm binary file at '" + binaryFile + "'";
                }
                return response["arrayBuffer"]();
              }).catch(function() {
                return getBinary(binaryFile);
              });
            }
          }
          return Promise.resolve().then(function() {
            return getBinary(binaryFile);
          });
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then(function(binary) {
            return WebAssembly.instantiate(binary, imports);
          }).then(function(instance) {
            return instance;
          }).then(receiver, function(reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
            return fetch(binaryFile, { credentials: "same-origin" }).then(function(response) {
              var result = WebAssembly.instantiateStreaming(response, imports);
              return result.then(callback, function(reason) {
                err("wasm streaming compile failed: " + reason);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback);
              });
            });
          } else {
            return instantiateArrayBuffer(binaryFile, imports, callback);
          }
        }
        function createWasm() {
          var info = { "a": wasmImports };
          function receiveInstance(instance, module) {
            var exports = instance.exports;
            Module5["asm"] = exports;
            wasmMemory = Module5["asm"]["x"];
            updateMemoryViews();
            wasmTable = Module5["asm"]["D"];
            addOnInit(Module5["asm"]["y"]);
            removeRunDependency("wasm-instantiate");
            return exports;
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result) {
            receiveInstance(result["instance"]);
          }
          if (Module5["instantiateWasm"]) {
            try {
              return Module5["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err("Module.instantiateWasm callback failed with error: " + e);
              readyPromiseReject(e);
            }
          }
          instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
          return {};
        }
        function callRuntimeCallbacks(callbacks) {
          while (callbacks.length > 0) {
            callbacks.shift()(Module5);
          }
        }
        function ExceptionInfo(excPtr) {
          this.excPtr = excPtr;
          this.ptr = excPtr - 24;
          this.set_type = function(type) {
            HEAPU32[this.ptr + 4 >> 2] = type;
          };
          this.get_type = function() {
            return HEAPU32[this.ptr + 4 >> 2];
          };
          this.set_destructor = function(destructor) {
            HEAPU32[this.ptr + 8 >> 2] = destructor;
          };
          this.get_destructor = function() {
            return HEAPU32[this.ptr + 8 >> 2];
          };
          this.set_refcount = function(refcount) {
            HEAP32[this.ptr >> 2] = refcount;
          };
          this.set_caught = function(caught) {
            caught = caught ? 1 : 0;
            HEAP8[this.ptr + 12 >> 0] = caught;
          };
          this.get_caught = function() {
            return HEAP8[this.ptr + 12 >> 0] != 0;
          };
          this.set_rethrown = function(rethrown) {
            rethrown = rethrown ? 1 : 0;
            HEAP8[this.ptr + 13 >> 0] = rethrown;
          };
          this.get_rethrown = function() {
            return HEAP8[this.ptr + 13 >> 0] != 0;
          };
          this.init = function(type, destructor) {
            this.set_adjusted_ptr(0);
            this.set_type(type);
            this.set_destructor(destructor);
            this.set_refcount(0);
            this.set_caught(false);
            this.set_rethrown(false);
          };
          this.add_ref = function() {
            var value = HEAP32[this.ptr >> 2];
            HEAP32[this.ptr >> 2] = value + 1;
          };
          this.release_ref = function() {
            var prev = HEAP32[this.ptr >> 2];
            HEAP32[this.ptr >> 2] = prev - 1;
            return prev === 1;
          };
          this.set_adjusted_ptr = function(adjustedPtr) {
            HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
          };
          this.get_adjusted_ptr = function() {
            return HEAPU32[this.ptr + 16 >> 2];
          };
          this.get_exception_ptr = function() {
            var isPointer = ___cxa_is_pointer_type(this.get_type());
            if (isPointer) {
              return HEAPU32[this.excPtr >> 2];
            }
            var adjusted = this.get_adjusted_ptr();
            if (adjusted !== 0) return adjusted;
            return this.excPtr;
          };
        }
        var exceptionLast = 0;
        var uncaughtExceptionCount = 0;
        function ___cxa_throw(ptr, type, destructor) {
          var info = new ExceptionInfo(ptr);
          info.init(type, destructor);
          exceptionLast = ptr;
          uncaughtExceptionCount++;
          throw ptr;
        }
        var structRegistrations = {};
        function runDestructors(destructors) {
          while (destructors.length) {
            var ptr = destructors.pop();
            var del = destructors.pop();
            del(ptr);
          }
        }
        function simpleReadValueFromPointer(pointer) {
          return this["fromWireType"](HEAP32[pointer >> 2]);
        }
        var awaitingDependencies = {};
        var registeredTypes = {};
        var typeDependencies = {};
        var char_0 = 48;
        var char_9 = 57;
        function makeLegalFunctionName(name) {
          if (void 0 === name) {
            return "_unknown";
          }
          name = name.replace(/[^a-zA-Z0-9_]/g, "$");
          var f = name.charCodeAt(0);
          if (f >= char_0 && f <= char_9) {
            return "_" + name;
          }
          return name;
        }
        function createNamedFunction(name, body) {
          name = makeLegalFunctionName(name);
          return { [name]: function() {
            return body.apply(this, arguments);
          } }[name];
        }
        function extendError(baseErrorType, errorName) {
          var errorClass = createNamedFunction(errorName, function(message) {
            this.name = errorName;
            this.message = message;
            var stack = new Error(message).stack;
            if (stack !== void 0) {
              this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
            }
          });
          errorClass.prototype = Object.create(baseErrorType.prototype);
          errorClass.prototype.constructor = errorClass;
          errorClass.prototype.toString = function() {
            if (this.message === void 0) {
              return this.name;
            } else {
              return this.name + ": " + this.message;
            }
          };
          return errorClass;
        }
        var InternalError = void 0;
        function throwInternalError(message) {
          throw new InternalError(message);
        }
        function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
          myTypes.forEach(function(type) {
            typeDependencies[type] = dependentTypes;
          });
          function onComplete(typeConverters2) {
            var myTypeConverters = getTypeConverters(typeConverters2);
            if (myTypeConverters.length !== myTypes.length) {
              throwInternalError("Mismatched type converter count");
            }
            for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
            }
          }
          var typeConverters = new Array(dependentTypes.length);
          var unregisteredTypes = [];
          var registered = 0;
          dependentTypes.forEach((dt, i) => {
            if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
            } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(() => {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                  onComplete(typeConverters);
                }
              });
            }
          });
          if (0 === unregisteredTypes.length) {
            onComplete(typeConverters);
          }
        }
        function __embind_finalize_value_object(structType) {
          var reg = structRegistrations[structType];
          delete structRegistrations[structType];
          var rawConstructor = reg.rawConstructor;
          var rawDestructor = reg.rawDestructor;
          var fieldRecords = reg.fields;
          var fieldTypes = fieldRecords.map((field) => field.getterReturnType).concat(fieldRecords.map((field) => field.setterArgumentType));
          whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes2) => {
            var fields = {};
            fieldRecords.forEach((field, i) => {
              var fieldName = field.fieldName;
              var getterReturnType = fieldTypes2[i];
              var getter = field.getter;
              var getterContext = field.getterContext;
              var setterArgumentType = fieldTypes2[i + fieldRecords.length];
              var setter = field.setter;
              var setterContext = field.setterContext;
              fields[fieldName] = { read: (ptr) => {
                return getterReturnType["fromWireType"](getter(getterContext, ptr));
              }, write: (ptr, o) => {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                runDestructors(destructors);
              } };
            });
            return [{ name: reg.name, "fromWireType": function(ptr) {
              var rv = {};
              for (var i in fields) {
                rv[i] = fields[i].read(ptr);
              }
              rawDestructor(ptr);
              return rv;
            }, "toWireType": function(destructors, o) {
              for (var fieldName in fields) {
                if (!(fieldName in o)) {
                  throw new TypeError('Missing field:  "' + fieldName + '"');
                }
              }
              var ptr = rawConstructor();
              for (fieldName in fields) {
                fields[fieldName].write(ptr, o[fieldName]);
              }
              if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
              }
              return ptr;
            }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: rawDestructor }];
          });
        }
        function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
        }
        function getShiftFromSize(size) {
          switch (size) {
            case 1:
              return 0;
            case 2:
              return 1;
            case 4:
              return 2;
            case 8:
              return 3;
            default:
              throw new TypeError("Unknown type size: " + size);
          }
        }
        function embind_init_charCodes() {
          var codes = new Array(256);
          for (var i = 0; i < 256; ++i) {
            codes[i] = String.fromCharCode(i);
          }
          embind_charCodes = codes;
        }
        var embind_charCodes = void 0;
        function readLatin1String(ptr) {
          var ret = "";
          var c = ptr;
          while (HEAPU8[c]) {
            ret += embind_charCodes[HEAPU8[c++]];
          }
          return ret;
        }
        var BindingError = void 0;
        function throwBindingError(message) {
          throw new BindingError(message);
        }
        function registerType(rawType, registeredInstance, options = {}) {
          if (!("argPackAdvance" in registeredInstance)) {
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          }
          var name = registeredInstance.name;
          if (!rawType) {
            throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
          }
          if (registeredTypes.hasOwnProperty(rawType)) {
            if (options.ignoreDuplicateRegistrations) {
              return;
            } else {
              throwBindingError("Cannot register type '" + name + "' twice");
            }
          }
          registeredTypes[rawType] = registeredInstance;
          delete typeDependencies[rawType];
          if (awaitingDependencies.hasOwnProperty(rawType)) {
            var callbacks = awaitingDependencies[rawType];
            delete awaitingDependencies[rawType];
            callbacks.forEach((cb) => cb());
          }
        }
        function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
          var shift = getShiftFromSize(size);
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(wt) {
            return !!wt;
          }, "toWireType": function(destructors, o) {
            return o ? trueValue : falseValue;
          }, "argPackAdvance": 8, "readValueFromPointer": function(pointer) {
            var heap;
            if (size === 1) {
              heap = HEAP8;
            } else if (size === 2) {
              heap = HEAP16;
            } else if (size === 4) {
              heap = HEAP32;
            } else {
              throw new TypeError("Unknown boolean type size: " + name);
            }
            return this["fromWireType"](heap[pointer >> shift]);
          }, destructorFunction: null });
        }
        var emval_free_list = [];
        var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
        function __emval_decref(handle) {
          if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
            emval_handle_array[handle] = void 0;
            emval_free_list.push(handle);
          }
        }
        function count_emval_handles() {
          var count = 0;
          for (var i = 5; i < emval_handle_array.length; ++i) {
            if (emval_handle_array[i] !== void 0) {
              ++count;
            }
          }
          return count;
        }
        function get_first_emval() {
          for (var i = 5; i < emval_handle_array.length; ++i) {
            if (emval_handle_array[i] !== void 0) {
              return emval_handle_array[i];
            }
          }
          return null;
        }
        function init_emval() {
          Module5["count_emval_handles"] = count_emval_handles;
          Module5["get_first_emval"] = get_first_emval;
        }
        var Emval = { toValue: (handle) => {
          if (!handle) {
            throwBindingError("Cannot use deleted val. handle = " + handle);
          }
          return emval_handle_array[handle].value;
        }, toHandle: (value) => {
          switch (value) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default: {
              var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
              emval_handle_array[handle] = { refcount: 1, value };
              return handle;
            }
          }
        } };
        function __embind_register_emval(rawType, name) {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(handle) {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          }, "toWireType": function(destructors, value) {
            return Emval.toHandle(value);
          }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null });
        }
        function ensureOverloadTable(proto, methodName, humanName) {
          if (void 0 === proto[methodName].overloadTable) {
            var prevFunc = proto[methodName];
            proto[methodName] = function() {
              if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
              }
              return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
            };
            proto[methodName].overloadTable = [];
            proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
          }
        }
        function exposePublicSymbol(name, value, numArguments) {
          if (Module5.hasOwnProperty(name)) {
            if (void 0 === numArguments || void 0 !== Module5[name].overloadTable && void 0 !== Module5[name].overloadTable[numArguments]) {
              throwBindingError("Cannot register public name '" + name + "' twice");
            }
            ensureOverloadTable(Module5, name, name);
            if (Module5.hasOwnProperty(numArguments)) {
              throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
            }
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            if (void 0 !== numArguments) {
              Module5[name].numArguments = numArguments;
            }
          }
        }
        function enumReadValueFromPointer(name, shift, signed) {
          switch (shift) {
            case 0:
              return function(pointer) {
                var heap = signed ? HEAP8 : HEAPU8;
                return this["fromWireType"](heap[pointer]);
              };
            case 1:
              return function(pointer) {
                var heap = signed ? HEAP16 : HEAPU16;
                return this["fromWireType"](heap[pointer >> 1]);
              };
            case 2:
              return function(pointer) {
                var heap = signed ? HEAP32 : HEAPU32;
                return this["fromWireType"](heap[pointer >> 2]);
              };
            default:
              throw new TypeError("Unknown integer type: " + name);
          }
        }
        function __embind_register_enum(rawType, name, size, isSigned) {
          var shift = getShiftFromSize(size);
          name = readLatin1String(name);
          function ctor() {
          }
          ctor.values = {};
          registerType(rawType, { name, constructor: ctor, "fromWireType": function(c) {
            return this.constructor.values[c];
          }, "toWireType": function(destructors, c) {
            return c.value;
          }, "argPackAdvance": 8, "readValueFromPointer": enumReadValueFromPointer(name, shift, isSigned), destructorFunction: null });
          exposePublicSymbol(name, ctor);
        }
        function getTypeName(type) {
          var ptr = ___getTypeName(type);
          var rv = readLatin1String(ptr);
          _free(ptr);
          return rv;
        }
        function requireRegisteredType(rawType, humanName) {
          var impl = registeredTypes[rawType];
          if (void 0 === impl) {
            throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
          }
          return impl;
        }
        function __embind_register_enum_value(rawEnumType, name, enumValue) {
          var enumType = requireRegisteredType(rawEnumType, "enum");
          name = readLatin1String(name);
          var Enum = enumType.constructor;
          var Value = Object.create(enumType.constructor.prototype, { value: { value: enumValue }, constructor: { value: createNamedFunction(enumType.name + "_" + name, function() {
          }) } });
          Enum.values[enumValue] = Value;
          Enum[name] = Value;
        }
        function floatReadValueFromPointer(name, shift) {
          switch (shift) {
            case 2:
              return function(pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2]);
              };
            case 3:
              return function(pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3]);
              };
            default:
              throw new TypeError("Unknown float type: " + name);
          }
        }
        function __embind_register_float(rawType, name, size) {
          var shift = getShiftFromSize(size);
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(value) {
            return value;
          }, "toWireType": function(destructors, value) {
            return value;
          }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null });
        }
        function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
          var argCount = argTypes.length;
          if (argCount < 2) {
            throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
          }
          var isClassMethodFunc = argTypes[1] !== null && classType !== null;
          var needsDestructorStack = false;
          for (var i = 1; i < argTypes.length; ++i) {
            if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
              needsDestructorStack = true;
              break;
            }
          }
          var returns = argTypes[0].name !== "void";
          var expectedArgCount = argCount - 2;
          var argsWired = new Array(expectedArgCount);
          var invokerFuncArgs = [];
          var destructors = [];
          return function() {
            if (arguments.length !== expectedArgCount) {
              throwBindingError("function " + humanName + " called with " + arguments.length + " arguments, expected " + expectedArgCount + " args!");
            }
            destructors.length = 0;
            var thisWired;
            invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
            invokerFuncArgs[0] = cppTargetFunc;
            if (isClassMethodFunc) {
              thisWired = argTypes[1]["toWireType"](destructors, this);
              invokerFuncArgs[1] = thisWired;
            }
            for (var i2 = 0; i2 < expectedArgCount; ++i2) {
              argsWired[i2] = argTypes[i2 + 2]["toWireType"](destructors, arguments[i2]);
              invokerFuncArgs.push(argsWired[i2]);
            }
            var rv = cppInvokerFunc.apply(null, invokerFuncArgs);
            function onDone(rv2) {
              if (needsDestructorStack) {
                runDestructors(destructors);
              } else {
                for (var i3 = isClassMethodFunc ? 1 : 2; i3 < argTypes.length; i3++) {
                  var param = i3 === 1 ? thisWired : argsWired[i3 - 2];
                  if (argTypes[i3].destructorFunction !== null) {
                    argTypes[i3].destructorFunction(param);
                  }
                }
              }
              if (returns) {
                return argTypes[0]["fromWireType"](rv2);
              }
            }
            return onDone(rv);
          };
        }
        function heap32VectorToArray(count, firstElement) {
          var array = [];
          for (var i = 0; i < count; i++) {
            array.push(HEAPU32[firstElement + i * 4 >> 2]);
          }
          return array;
        }
        function replacePublicSymbol(name, value, numArguments) {
          if (!Module5.hasOwnProperty(name)) {
            throwInternalError("Replacing nonexistant public symbol");
          }
          if (void 0 !== Module5[name].overloadTable && void 0 !== numArguments) {
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            Module5[name].argCount = numArguments;
          }
        }
        function dynCallLegacy(sig, ptr, args) {
          var f = Module5["dynCall_" + sig];
          return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
        }
        var wasmTableMirror = [];
        function getWasmTableEntry(funcPtr) {
          var func = wasmTableMirror[funcPtr];
          if (!func) {
            if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
            wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
          }
          return func;
        }
        function dynCall(sig, ptr, args) {
          if (sig.includes("j")) {
            return dynCallLegacy(sig, ptr, args);
          }
          var rtn = getWasmTableEntry(ptr).apply(null, args);
          return rtn;
        }
        function getDynCaller(sig, ptr) {
          var argCache = [];
          return function() {
            argCache.length = 0;
            Object.assign(argCache, arguments);
            return dynCall(sig, ptr, argCache);
          };
        }
        function embind__requireFunction(signature, rawFunction) {
          signature = readLatin1String(signature);
          function makeDynCaller() {
            if (signature.includes("j")) {
              return getDynCaller(signature, rawFunction);
            }
            return getWasmTableEntry(rawFunction);
          }
          var fp = makeDynCaller();
          if (typeof fp != "function") {
            throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
          }
          return fp;
        }
        var UnboundTypeError = void 0;
        function throwUnboundTypeError(message, types) {
          var unboundTypes = [];
          var seen = {};
          function visit(type) {
            if (seen[type]) {
              return;
            }
            if (registeredTypes[type]) {
              return;
            }
            if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return;
            }
            unboundTypes.push(type);
            seen[type] = true;
          }
          types.forEach(visit);
          throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
        }
        function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync) {
          var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
          name = readLatin1String(name);
          rawInvoker = embind__requireFunction(signature, rawInvoker);
          exposePublicSymbol(name, function() {
            throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes);
          }, argCount - 1);
          whenDependentTypesAreResolved([], argTypes, function(argTypes2) {
            var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
            replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn, isAsync), argCount - 1);
            return [];
          });
        }
        function integerReadValueFromPointer(name, shift, signed) {
          switch (shift) {
            case 0:
              return signed ? function readS8FromPointer(pointer) {
                return HEAP8[pointer];
              } : function readU8FromPointer(pointer) {
                return HEAPU8[pointer];
              };
            case 1:
              return signed ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1];
              } : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1];
              };
            case 2:
              return signed ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2];
              } : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2];
              };
            default:
              throw new TypeError("Unknown integer type: " + name);
          }
        }
        function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
          name = readLatin1String(name);
          if (maxRange === -1) {
            maxRange = 4294967295;
          }
          var shift = getShiftFromSize(size);
          var fromWireType = (value) => value;
          if (minRange === 0) {
            var bitshift = 32 - 8 * size;
            fromWireType = (value) => value << bitshift >>> bitshift;
          }
          var isUnsignedType = name.includes("unsigned");
          var checkAssertions = (value, toTypeName) => {
          };
          var toWireType;
          if (isUnsignedType) {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value >>> 0;
            };
          } else {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value;
            };
          }
          registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null });
        }
        function __embind_register_memory_view(rawType, dataTypeIndex, name) {
          var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
          var TA = typeMapping[dataTypeIndex];
          function decodeMemoryView(handle) {
            handle = handle >> 2;
            var heap = HEAPU32;
            var size = heap[handle];
            var data = heap[handle + 1];
            return new TA(heap.buffer, data, size);
          }
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
        }
        function __embind_register_std_string(rawType, name) {
          name = readLatin1String(name);
          var stdStringIsUTF8 = name === "std::string";
          registerType(rawType, { name, "fromWireType": function(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === void 0) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join("");
            }
            _free(value);
            return str;
          }, "toWireType": function(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError("Cannot pass non-string to std::string");
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
            _free(ptr);
          } });
        }
        function UTF16ToString(ptr, maxBytesToRead) {
          var str = "";
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
        function stringToUTF16(str, outPtr, maxBytesToWrite) {
          if (maxBytesToWrite === void 0) {
            maxBytesToWrite = 2147483647;
          }
          if (maxBytesToWrite < 2) return 0;
          maxBytesToWrite -= 2;
          var startPtr = outPtr;
          var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
          for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i);
            HEAP16[outPtr >> 1] = codeUnit;
            outPtr += 2;
          }
          HEAP16[outPtr >> 1] = 0;
          return outPtr - startPtr;
        }
        function lengthBytesUTF16(str) {
          return str.length * 2;
        }
        function UTF32ToString(ptr, maxBytesToRead) {
          var i = 0;
          var str = "";
          while (!(i >= maxBytesToRead / 4)) {
            var utf32 = HEAP32[ptr + i * 4 >> 2];
            if (utf32 == 0) break;
            ++i;
            if (utf32 >= 65536) {
              var ch = utf32 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            } else {
              str += String.fromCharCode(utf32);
            }
          }
          return str;
        }
        function stringToUTF32(str, outPtr, maxBytesToWrite) {
          if (maxBytesToWrite === void 0) {
            maxBytesToWrite = 2147483647;
          }
          if (maxBytesToWrite < 4) return 0;
          var startPtr = outPtr;
          var endPtr = startPtr + maxBytesToWrite - 4;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) {
              var trailSurrogate = str.charCodeAt(++i);
              codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
            }
            HEAP32[outPtr >> 2] = codeUnit;
            outPtr += 4;
            if (outPtr + 4 > endPtr) break;
          }
          HEAP32[outPtr >> 2] = 0;
          return outPtr - startPtr;
        }
        function lengthBytesUTF32(str) {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
            len += 4;
          }
          return len;
        }
        function __embind_register_std_wstring(rawType, charSize, name) {
          name = readLatin1String(name);
          var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
          if (charSize === 2) {
            decodeString = UTF16ToString;
            encodeString = stringToUTF16;
            lengthBytesUTF = lengthBytesUTF16;
            getHeap = () => HEAPU16;
            shift = 1;
          } else if (charSize === 4) {
            decodeString = UTF32ToString;
            encodeString = stringToUTF32;
            lengthBytesUTF = lengthBytesUTF32;
            getHeap = () => HEAPU32;
            shift = 2;
          }
          registerType(rawType, { name, "fromWireType": function(value) {
            var length = HEAPU32[value >> 2];
            var HEAP = getHeap();
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          }, "toWireType": function(destructors, value) {
            if (!(typeof value == "string")) {
              throwBindingError("Cannot pass non-string to C++ string type " + name);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length >> shift;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
            _free(ptr);
          } });
        }
        function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
          structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
        }
        function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
          structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
        }
        function __embind_register_void(rawType, name) {
          name = readLatin1String(name);
          registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": function() {
            return void 0;
          }, "toWireType": function(destructors, o) {
            return void 0;
          } });
        }
        var emval_symbols = {};
        function getStringOrSymbol(address) {
          var symbol = emval_symbols[address];
          if (symbol === void 0) {
            return readLatin1String(address);
          }
          return symbol;
        }
        function emval_get_global() {
          if (typeof globalThis == "object") {
            return globalThis;
          }
          function testGlobal(obj) {
            obj["$$$embind_global$$$"] = obj;
            var success = typeof $$$embind_global$$$ == "object" && obj["$$$embind_global$$$"] == obj;
            if (!success) {
              delete obj["$$$embind_global$$$"];
            }
            return success;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          if (typeof global == "object" && testGlobal(global)) {
            $$$embind_global$$$ = global;
          } else if (typeof self == "object" && testGlobal(self)) {
            $$$embind_global$$$ = self;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          throw Error("unable to get global object.");
        }
        function __emval_get_global(name) {
          if (name === 0) {
            return Emval.toHandle(emval_get_global());
          } else {
            name = getStringOrSymbol(name);
            return Emval.toHandle(emval_get_global()[name]);
          }
        }
        function __emval_incref(handle) {
          if (handle > 4) {
            emval_handle_array[handle].refcount += 1;
          }
        }
        function craftEmvalAllocator(argCount) {
          var argsList = new Array(argCount + 1);
          return function(constructor, argTypes, args) {
            argsList[0] = constructor;
            for (var i = 0; i < argCount; ++i) {
              var argType = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i);
              argsList[i + 1] = argType["readValueFromPointer"](args);
              args += argType["argPackAdvance"];
            }
            var obj = new (constructor.bind.apply(constructor, argsList))();
            return Emval.toHandle(obj);
          };
        }
        var emval_newers = {};
        function __emval_new(handle, argCount, argTypes, args) {
          handle = Emval.toValue(handle);
          var newer = emval_newers[argCount];
          if (!newer) {
            newer = craftEmvalAllocator(argCount);
            emval_newers[argCount] = newer;
          }
          return newer(handle, argTypes, args);
        }
        function _abort() {
          abort("");
        }
        function _emscripten_memcpy_big(dest, src, num) {
          HEAPU8.copyWithin(dest, src, src + num);
        }
        function getHeapMax() {
          return 2147483648;
        }
        function emscripten_realloc_buffer(size) {
          var b = wasmMemory.buffer;
          try {
            wasmMemory.grow(size - b.byteLength + 65535 >>> 16);
            updateMemoryViews();
            return 1;
          } catch (e) {
          }
        }
        function _emscripten_resize_heap(requestedSize) {
          var oldSize = HEAPU8.length;
          requestedSize = requestedSize >>> 0;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = emscripten_realloc_buffer(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        }
        InternalError = Module5["InternalError"] = extendError(Error, "InternalError");
        embind_init_charCodes();
        BindingError = Module5["BindingError"] = extendError(Error, "BindingError");
        init_emval();
        UnboundTypeError = Module5["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
        var wasmImports = { "k": ___cxa_throw, "m": __embind_finalize_value_object, "o": __embind_register_bigint, "t": __embind_register_bool, "s": __embind_register_emval, "q": __embind_register_enum, "d": __embind_register_enum_value, "h": __embind_register_float, "f": __embind_register_function, "c": __embind_register_integer, "b": __embind_register_memory_view, "i": __embind_register_std_string, "e": __embind_register_std_wstring, "n": __embind_register_value_object, "a": __embind_register_value_object_field, "u": __embind_register_void, "j": __emval_decref, "w": __emval_get_global, "l": __emval_incref, "v": __emval_new, "g": _abort, "r": _emscripten_memcpy_big, "p": _emscripten_resize_heap };
        var asm = createWasm();
        var ___wasm_call_ctors = function() {
          return (___wasm_call_ctors = Module5["asm"]["y"]).apply(null, arguments);
        };
        var _malloc = function() {
          return (_malloc = Module5["asm"]["z"]).apply(null, arguments);
        };
        var _free = function() {
          return (_free = Module5["asm"]["A"]).apply(null, arguments);
        };
        var ___getTypeName = Module5["___getTypeName"] = function() {
          return (___getTypeName = Module5["___getTypeName"] = Module5["asm"]["B"]).apply(null, arguments);
        };
        var __embind_initialize_bindings = Module5["__embind_initialize_bindings"] = function() {
          return (__embind_initialize_bindings = Module5["__embind_initialize_bindings"] = Module5["asm"]["C"]).apply(null, arguments);
        };
        var ___errno_location = function() {
          return (___errno_location = Module5["asm"]["__errno_location"]).apply(null, arguments);
        };
        var ___cxa_is_pointer_type = function() {
          return (___cxa_is_pointer_type = Module5["asm"]["E"]).apply(null, arguments);
        };
        var dynCall_jiiii = Module5["dynCall_jiiii"] = function() {
          return (dynCall_jiiii = Module5["dynCall_jiiii"] = Module5["asm"]["F"]).apply(null, arguments);
        };
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          if (!calledRun) run();
          if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run() {
          if (runDependencies > 0) {
            return;
          }
          preRun();
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            if (calledRun) return;
            calledRun = true;
            Module5["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            readyPromiseResolve(Module5);
            if (Module5["onRuntimeInitialized"]) Module5["onRuntimeInitialized"]();
            postRun();
          }
          if (Module5["setStatus"]) {
            Module5["setStatus"]("Running...");
            setTimeout(function() {
              setTimeout(function() {
                Module5["setStatus"]("");
              }, 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
        }
        if (Module5["preInit"]) {
          if (typeof Module5["preInit"] == "function") Module5["preInit"] = [Module5["preInit"]];
          while (Module5["preInit"].length > 0) {
            Module5["preInit"].pop()();
          }
        }
        run();
        return Module5.ready;
      });
    })();
    webp_enc_simd_default = Module2;
  }
});

// node_modules/@jsquash/webp/codec/enc/webp_enc.js
var webp_enc_exports = {};
__export(webp_enc_exports, {
  default: () => webp_enc_default
});
var Module3, webp_enc_default;
var init_webp_enc = __esm({
  "node_modules/@jsquash/webp/codec/enc/webp_enc.js"() {
    Module3 = (() => {
      var _scriptDir = import.meta.url;
      return (function(Module5 = {}) {
        var Module5 = typeof Module5 != "undefined" ? Module5 : {};
        var readyPromiseResolve, readyPromiseReject;
        Module5["ready"] = new Promise(function(resolve, reject) {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject;
        });
        const isServiceWorker2 = globalThis.ServiceWorkerGlobalScope !== void 0;
        const isRunningInCloudFlareWorkers2 = isServiceWorker2 && typeof self !== "undefined" && globalThis.caches && globalThis.caches.default !== void 0;
        const isRunningInNode2 = typeof process === "object" && process.release && process.release.name === "node";
        if (isRunningInCloudFlareWorkers2 || isRunningInNode2) {
          if (!globalThis.ImageData) {
            globalThis.ImageData = class ImageData {
              constructor(data, width, height) {
                this.data = data;
                this.width = width;
                this.height = height;
              }
            };
          }
          if (import.meta.url === void 0) {
            import.meta.url = "https://localhost";
          }
          if (typeof self !== "undefined" && self.location === void 0) {
            self.location = { href: "" };
          }
        }
        var moduleOverrides = Object.assign({}, Module5);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module5["locateFile"]) {
            return Module5["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var read_, readAsync, readBinary, setWindowTitle;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            scriptDirectory = document.currentScript.src;
          }
          if (_scriptDir) {
            scriptDirectory = _scriptDir;
          }
          if (scriptDirectory.indexOf("blob:") !== 0) {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
          } else {
            scriptDirectory = "";
          }
          {
            read_ = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = (url, onload, onerror) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = () => {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
          }
          setWindowTitle = (title) => document.title = title;
        } else {
        }
        var out = Module5["print"] || console.log.bind(console);
        var err = Module5["printErr"] || console.warn.bind(console);
        Object.assign(Module5, moduleOverrides);
        moduleOverrides = null;
        if (Module5["arguments"]) arguments_ = Module5["arguments"];
        if (Module5["thisProgram"]) thisProgram = Module5["thisProgram"];
        if (Module5["quit"]) quit_ = Module5["quit"];
        var wasmBinary;
        if (Module5["wasmBinary"]) wasmBinary = Module5["wasmBinary"];
        var noExitRuntime = Module5["noExitRuntime"] || true;
        if (typeof WebAssembly != "object") {
          abort("no native wasm support detected");
        }
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
          var endIdx = idx + maxBytesToRead;
          var str = "";
          while (!(idx >= endIdx)) {
            var u0 = heapOrArray[idx++];
            if (!u0) return str;
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
          return str;
        }
        function UTF8ToString(ptr, maxBytesToRead) {
          return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        }
        function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
          if (!(maxBytesToWrite > 0)) return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i);
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023;
            }
            if (u <= 127) {
              if (outIdx >= endIdx) break;
              heap[outIdx++] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              heap[outIdx++] = 192 | u >> 6;
              heap[outIdx++] = 128 | u & 63;
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              heap[outIdx++] = 224 | u >> 12;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            } else {
              if (outIdx + 3 >= endIdx) break;
              heap[outIdx++] = 240 | u >> 18;
              heap[outIdx++] = 128 | u >> 12 & 63;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            }
          }
          heap[outIdx] = 0;
          return outIdx - startIdx;
        }
        function stringToUTF8(str, outPtr, maxBytesToWrite) {
          return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        }
        function lengthBytesUTF8(str) {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        }
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module5["HEAP8"] = HEAP8 = new Int8Array(b);
          Module5["HEAP16"] = HEAP16 = new Int16Array(b);
          Module5["HEAP32"] = HEAP32 = new Int32Array(b);
          Module5["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module5["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module5["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module5["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module5["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        var wasmTable;
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module5["preRun"]) {
            if (typeof Module5["preRun"] == "function") Module5["preRun"] = [Module5["preRun"]];
            while (Module5["preRun"].length) {
              addOnPreRun(Module5["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
          runtimeInitialized = true;
          callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
          if (Module5["postRun"]) {
            if (typeof Module5["postRun"] == "function") Module5["postRun"] = [Module5["postRun"]];
            while (Module5["postRun"].length) {
              addOnPostRun(Module5["postRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
          runDependencies++;
          if (Module5["monitorRunDependencies"]) {
            Module5["monitorRunDependencies"](runDependencies);
          }
        }
        function removeRunDependency(id) {
          runDependencies--;
          if (Module5["monitorRunDependencies"]) {
            Module5["monitorRunDependencies"](runDependencies);
          }
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          if (Module5["onAbort"]) {
            Module5["onAbort"](what);
          }
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        function isDataURI(filename) {
          return filename.startsWith(dataURIPrefix);
        }
        var wasmBinaryFile;
        if (Module5["locateFile"]) {
          wasmBinaryFile = "webp_enc.wasm";
          if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
          }
        } else {
          wasmBinaryFile = new URL("webp_enc.wasm", import.meta.url).href;
        }
        function getBinary(file) {
          try {
            if (file == wasmBinaryFile && wasmBinary) {
              return new Uint8Array(wasmBinary);
            }
            if (readBinary) {
              return readBinary(file);
            }
            throw "both async and sync fetching of the wasm failed";
          } catch (err2) {
            abort(err2);
          }
        }
        function getBinaryPromise(binaryFile) {
          if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
            if (typeof fetch == "function") {
              return fetch(binaryFile, { credentials: "same-origin" }).then(function(response) {
                if (!response["ok"]) {
                  throw "failed to load wasm binary file at '" + binaryFile + "'";
                }
                return response["arrayBuffer"]();
              }).catch(function() {
                return getBinary(binaryFile);
              });
            }
          }
          return Promise.resolve().then(function() {
            return getBinary(binaryFile);
          });
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then(function(binary) {
            return WebAssembly.instantiate(binary, imports);
          }).then(function(instance) {
            return instance;
          }).then(receiver, function(reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
            return fetch(binaryFile, { credentials: "same-origin" }).then(function(response) {
              var result = WebAssembly.instantiateStreaming(response, imports);
              return result.then(callback, function(reason) {
                err("wasm streaming compile failed: " + reason);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback);
              });
            });
          } else {
            return instantiateArrayBuffer(binaryFile, imports, callback);
          }
        }
        function createWasm() {
          var info = { "a": wasmImports };
          function receiveInstance(instance, module) {
            var exports = instance.exports;
            Module5["asm"] = exports;
            wasmMemory = Module5["asm"]["x"];
            updateMemoryViews();
            wasmTable = Module5["asm"]["D"];
            addOnInit(Module5["asm"]["y"]);
            removeRunDependency("wasm-instantiate");
            return exports;
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result) {
            receiveInstance(result["instance"]);
          }
          if (Module5["instantiateWasm"]) {
            try {
              return Module5["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err("Module.instantiateWasm callback failed with error: " + e);
              readyPromiseReject(e);
            }
          }
          instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
          return {};
        }
        function callRuntimeCallbacks(callbacks) {
          while (callbacks.length > 0) {
            callbacks.shift()(Module5);
          }
        }
        function ExceptionInfo(excPtr) {
          this.excPtr = excPtr;
          this.ptr = excPtr - 24;
          this.set_type = function(type) {
            HEAPU32[this.ptr + 4 >> 2] = type;
          };
          this.get_type = function() {
            return HEAPU32[this.ptr + 4 >> 2];
          };
          this.set_destructor = function(destructor) {
            HEAPU32[this.ptr + 8 >> 2] = destructor;
          };
          this.get_destructor = function() {
            return HEAPU32[this.ptr + 8 >> 2];
          };
          this.set_refcount = function(refcount) {
            HEAP32[this.ptr >> 2] = refcount;
          };
          this.set_caught = function(caught) {
            caught = caught ? 1 : 0;
            HEAP8[this.ptr + 12 >> 0] = caught;
          };
          this.get_caught = function() {
            return HEAP8[this.ptr + 12 >> 0] != 0;
          };
          this.set_rethrown = function(rethrown) {
            rethrown = rethrown ? 1 : 0;
            HEAP8[this.ptr + 13 >> 0] = rethrown;
          };
          this.get_rethrown = function() {
            return HEAP8[this.ptr + 13 >> 0] != 0;
          };
          this.init = function(type, destructor) {
            this.set_adjusted_ptr(0);
            this.set_type(type);
            this.set_destructor(destructor);
            this.set_refcount(0);
            this.set_caught(false);
            this.set_rethrown(false);
          };
          this.add_ref = function() {
            var value = HEAP32[this.ptr >> 2];
            HEAP32[this.ptr >> 2] = value + 1;
          };
          this.release_ref = function() {
            var prev = HEAP32[this.ptr >> 2];
            HEAP32[this.ptr >> 2] = prev - 1;
            return prev === 1;
          };
          this.set_adjusted_ptr = function(adjustedPtr) {
            HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
          };
          this.get_adjusted_ptr = function() {
            return HEAPU32[this.ptr + 16 >> 2];
          };
          this.get_exception_ptr = function() {
            var isPointer = ___cxa_is_pointer_type(this.get_type());
            if (isPointer) {
              return HEAPU32[this.excPtr >> 2];
            }
            var adjusted = this.get_adjusted_ptr();
            if (adjusted !== 0) return adjusted;
            return this.excPtr;
          };
        }
        var exceptionLast = 0;
        var uncaughtExceptionCount = 0;
        function ___cxa_throw(ptr, type, destructor) {
          var info = new ExceptionInfo(ptr);
          info.init(type, destructor);
          exceptionLast = ptr;
          uncaughtExceptionCount++;
          throw ptr;
        }
        var structRegistrations = {};
        function runDestructors(destructors) {
          while (destructors.length) {
            var ptr = destructors.pop();
            var del = destructors.pop();
            del(ptr);
          }
        }
        function simpleReadValueFromPointer(pointer) {
          return this["fromWireType"](HEAP32[pointer >> 2]);
        }
        var awaitingDependencies = {};
        var registeredTypes = {};
        var typeDependencies = {};
        var char_0 = 48;
        var char_9 = 57;
        function makeLegalFunctionName(name) {
          if (void 0 === name) {
            return "_unknown";
          }
          name = name.replace(/[^a-zA-Z0-9_]/g, "$");
          var f = name.charCodeAt(0);
          if (f >= char_0 && f <= char_9) {
            return "_" + name;
          }
          return name;
        }
        function createNamedFunction(name, body) {
          name = makeLegalFunctionName(name);
          return { [name]: function() {
            return body.apply(this, arguments);
          } }[name];
        }
        function extendError(baseErrorType, errorName) {
          var errorClass = createNamedFunction(errorName, function(message) {
            this.name = errorName;
            this.message = message;
            var stack = new Error(message).stack;
            if (stack !== void 0) {
              this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
            }
          });
          errorClass.prototype = Object.create(baseErrorType.prototype);
          errorClass.prototype.constructor = errorClass;
          errorClass.prototype.toString = function() {
            if (this.message === void 0) {
              return this.name;
            } else {
              return this.name + ": " + this.message;
            }
          };
          return errorClass;
        }
        var InternalError = void 0;
        function throwInternalError(message) {
          throw new InternalError(message);
        }
        function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
          myTypes.forEach(function(type) {
            typeDependencies[type] = dependentTypes;
          });
          function onComplete(typeConverters2) {
            var myTypeConverters = getTypeConverters(typeConverters2);
            if (myTypeConverters.length !== myTypes.length) {
              throwInternalError("Mismatched type converter count");
            }
            for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
            }
          }
          var typeConverters = new Array(dependentTypes.length);
          var unregisteredTypes = [];
          var registered = 0;
          dependentTypes.forEach((dt, i) => {
            if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
            } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(() => {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                  onComplete(typeConverters);
                }
              });
            }
          });
          if (0 === unregisteredTypes.length) {
            onComplete(typeConverters);
          }
        }
        function __embind_finalize_value_object(structType) {
          var reg = structRegistrations[structType];
          delete structRegistrations[structType];
          var rawConstructor = reg.rawConstructor;
          var rawDestructor = reg.rawDestructor;
          var fieldRecords = reg.fields;
          var fieldTypes = fieldRecords.map((field) => field.getterReturnType).concat(fieldRecords.map((field) => field.setterArgumentType));
          whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes2) => {
            var fields = {};
            fieldRecords.forEach((field, i) => {
              var fieldName = field.fieldName;
              var getterReturnType = fieldTypes2[i];
              var getter = field.getter;
              var getterContext = field.getterContext;
              var setterArgumentType = fieldTypes2[i + fieldRecords.length];
              var setter = field.setter;
              var setterContext = field.setterContext;
              fields[fieldName] = { read: (ptr) => {
                return getterReturnType["fromWireType"](getter(getterContext, ptr));
              }, write: (ptr, o) => {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                runDestructors(destructors);
              } };
            });
            return [{ name: reg.name, "fromWireType": function(ptr) {
              var rv = {};
              for (var i in fields) {
                rv[i] = fields[i].read(ptr);
              }
              rawDestructor(ptr);
              return rv;
            }, "toWireType": function(destructors, o) {
              for (var fieldName in fields) {
                if (!(fieldName in o)) {
                  throw new TypeError('Missing field:  "' + fieldName + '"');
                }
              }
              var ptr = rawConstructor();
              for (fieldName in fields) {
                fields[fieldName].write(ptr, o[fieldName]);
              }
              if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
              }
              return ptr;
            }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: rawDestructor }];
          });
        }
        function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
        }
        function getShiftFromSize(size) {
          switch (size) {
            case 1:
              return 0;
            case 2:
              return 1;
            case 4:
              return 2;
            case 8:
              return 3;
            default:
              throw new TypeError("Unknown type size: " + size);
          }
        }
        function embind_init_charCodes() {
          var codes = new Array(256);
          for (var i = 0; i < 256; ++i) {
            codes[i] = String.fromCharCode(i);
          }
          embind_charCodes = codes;
        }
        var embind_charCodes = void 0;
        function readLatin1String(ptr) {
          var ret = "";
          var c = ptr;
          while (HEAPU8[c]) {
            ret += embind_charCodes[HEAPU8[c++]];
          }
          return ret;
        }
        var BindingError = void 0;
        function throwBindingError(message) {
          throw new BindingError(message);
        }
        function registerType(rawType, registeredInstance, options = {}) {
          if (!("argPackAdvance" in registeredInstance)) {
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          }
          var name = registeredInstance.name;
          if (!rawType) {
            throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
          }
          if (registeredTypes.hasOwnProperty(rawType)) {
            if (options.ignoreDuplicateRegistrations) {
              return;
            } else {
              throwBindingError("Cannot register type '" + name + "' twice");
            }
          }
          registeredTypes[rawType] = registeredInstance;
          delete typeDependencies[rawType];
          if (awaitingDependencies.hasOwnProperty(rawType)) {
            var callbacks = awaitingDependencies[rawType];
            delete awaitingDependencies[rawType];
            callbacks.forEach((cb) => cb());
          }
        }
        function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
          var shift = getShiftFromSize(size);
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(wt) {
            return !!wt;
          }, "toWireType": function(destructors, o) {
            return o ? trueValue : falseValue;
          }, "argPackAdvance": 8, "readValueFromPointer": function(pointer) {
            var heap;
            if (size === 1) {
              heap = HEAP8;
            } else if (size === 2) {
              heap = HEAP16;
            } else if (size === 4) {
              heap = HEAP32;
            } else {
              throw new TypeError("Unknown boolean type size: " + name);
            }
            return this["fromWireType"](heap[pointer >> shift]);
          }, destructorFunction: null });
        }
        var emval_free_list = [];
        var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
        function __emval_decref(handle) {
          if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
            emval_handle_array[handle] = void 0;
            emval_free_list.push(handle);
          }
        }
        function count_emval_handles() {
          var count = 0;
          for (var i = 5; i < emval_handle_array.length; ++i) {
            if (emval_handle_array[i] !== void 0) {
              ++count;
            }
          }
          return count;
        }
        function get_first_emval() {
          for (var i = 5; i < emval_handle_array.length; ++i) {
            if (emval_handle_array[i] !== void 0) {
              return emval_handle_array[i];
            }
          }
          return null;
        }
        function init_emval() {
          Module5["count_emval_handles"] = count_emval_handles;
          Module5["get_first_emval"] = get_first_emval;
        }
        var Emval = { toValue: (handle) => {
          if (!handle) {
            throwBindingError("Cannot use deleted val. handle = " + handle);
          }
          return emval_handle_array[handle].value;
        }, toHandle: (value) => {
          switch (value) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default: {
              var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
              emval_handle_array[handle] = { refcount: 1, value };
              return handle;
            }
          }
        } };
        function __embind_register_emval(rawType, name) {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(handle) {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
          }, "toWireType": function(destructors, value) {
            return Emval.toHandle(value);
          }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null });
        }
        function ensureOverloadTable(proto, methodName, humanName) {
          if (void 0 === proto[methodName].overloadTable) {
            var prevFunc = proto[methodName];
            proto[methodName] = function() {
              if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
              }
              return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
            };
            proto[methodName].overloadTable = [];
            proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
          }
        }
        function exposePublicSymbol(name, value, numArguments) {
          if (Module5.hasOwnProperty(name)) {
            if (void 0 === numArguments || void 0 !== Module5[name].overloadTable && void 0 !== Module5[name].overloadTable[numArguments]) {
              throwBindingError("Cannot register public name '" + name + "' twice");
            }
            ensureOverloadTable(Module5, name, name);
            if (Module5.hasOwnProperty(numArguments)) {
              throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
            }
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            if (void 0 !== numArguments) {
              Module5[name].numArguments = numArguments;
            }
          }
        }
        function enumReadValueFromPointer(name, shift, signed) {
          switch (shift) {
            case 0:
              return function(pointer) {
                var heap = signed ? HEAP8 : HEAPU8;
                return this["fromWireType"](heap[pointer]);
              };
            case 1:
              return function(pointer) {
                var heap = signed ? HEAP16 : HEAPU16;
                return this["fromWireType"](heap[pointer >> 1]);
              };
            case 2:
              return function(pointer) {
                var heap = signed ? HEAP32 : HEAPU32;
                return this["fromWireType"](heap[pointer >> 2]);
              };
            default:
              throw new TypeError("Unknown integer type: " + name);
          }
        }
        function __embind_register_enum(rawType, name, size, isSigned) {
          var shift = getShiftFromSize(size);
          name = readLatin1String(name);
          function ctor() {
          }
          ctor.values = {};
          registerType(rawType, { name, constructor: ctor, "fromWireType": function(c) {
            return this.constructor.values[c];
          }, "toWireType": function(destructors, c) {
            return c.value;
          }, "argPackAdvance": 8, "readValueFromPointer": enumReadValueFromPointer(name, shift, isSigned), destructorFunction: null });
          exposePublicSymbol(name, ctor);
        }
        function getTypeName(type) {
          var ptr = ___getTypeName(type);
          var rv = readLatin1String(ptr);
          _free(ptr);
          return rv;
        }
        function requireRegisteredType(rawType, humanName) {
          var impl = registeredTypes[rawType];
          if (void 0 === impl) {
            throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
          }
          return impl;
        }
        function __embind_register_enum_value(rawEnumType, name, enumValue) {
          var enumType = requireRegisteredType(rawEnumType, "enum");
          name = readLatin1String(name);
          var Enum = enumType.constructor;
          var Value = Object.create(enumType.constructor.prototype, { value: { value: enumValue }, constructor: { value: createNamedFunction(enumType.name + "_" + name, function() {
          }) } });
          Enum.values[enumValue] = Value;
          Enum[name] = Value;
        }
        function floatReadValueFromPointer(name, shift) {
          switch (shift) {
            case 2:
              return function(pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2]);
              };
            case 3:
              return function(pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3]);
              };
            default:
              throw new TypeError("Unknown float type: " + name);
          }
        }
        function __embind_register_float(rawType, name, size) {
          var shift = getShiftFromSize(size);
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(value) {
            return value;
          }, "toWireType": function(destructors, value) {
            return value;
          }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null });
        }
        function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
          var argCount = argTypes.length;
          if (argCount < 2) {
            throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
          }
          var isClassMethodFunc = argTypes[1] !== null && classType !== null;
          var needsDestructorStack = false;
          for (var i = 1; i < argTypes.length; ++i) {
            if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
              needsDestructorStack = true;
              break;
            }
          }
          var returns = argTypes[0].name !== "void";
          var expectedArgCount = argCount - 2;
          var argsWired = new Array(expectedArgCount);
          var invokerFuncArgs = [];
          var destructors = [];
          return function() {
            if (arguments.length !== expectedArgCount) {
              throwBindingError("function " + humanName + " called with " + arguments.length + " arguments, expected " + expectedArgCount + " args!");
            }
            destructors.length = 0;
            var thisWired;
            invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
            invokerFuncArgs[0] = cppTargetFunc;
            if (isClassMethodFunc) {
              thisWired = argTypes[1]["toWireType"](destructors, this);
              invokerFuncArgs[1] = thisWired;
            }
            for (var i2 = 0; i2 < expectedArgCount; ++i2) {
              argsWired[i2] = argTypes[i2 + 2]["toWireType"](destructors, arguments[i2]);
              invokerFuncArgs.push(argsWired[i2]);
            }
            var rv = cppInvokerFunc.apply(null, invokerFuncArgs);
            function onDone(rv2) {
              if (needsDestructorStack) {
                runDestructors(destructors);
              } else {
                for (var i3 = isClassMethodFunc ? 1 : 2; i3 < argTypes.length; i3++) {
                  var param = i3 === 1 ? thisWired : argsWired[i3 - 2];
                  if (argTypes[i3].destructorFunction !== null) {
                    argTypes[i3].destructorFunction(param);
                  }
                }
              }
              if (returns) {
                return argTypes[0]["fromWireType"](rv2);
              }
            }
            return onDone(rv);
          };
        }
        function heap32VectorToArray(count, firstElement) {
          var array = [];
          for (var i = 0; i < count; i++) {
            array.push(HEAPU32[firstElement + i * 4 >> 2]);
          }
          return array;
        }
        function replacePublicSymbol(name, value, numArguments) {
          if (!Module5.hasOwnProperty(name)) {
            throwInternalError("Replacing nonexistant public symbol");
          }
          if (void 0 !== Module5[name].overloadTable && void 0 !== numArguments) {
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            Module5[name].argCount = numArguments;
          }
        }
        function dynCallLegacy(sig, ptr, args) {
          var f = Module5["dynCall_" + sig];
          return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
        }
        var wasmTableMirror = [];
        function getWasmTableEntry(funcPtr) {
          var func = wasmTableMirror[funcPtr];
          if (!func) {
            if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
            wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
          }
          return func;
        }
        function dynCall(sig, ptr, args) {
          if (sig.includes("j")) {
            return dynCallLegacy(sig, ptr, args);
          }
          var rtn = getWasmTableEntry(ptr).apply(null, args);
          return rtn;
        }
        function getDynCaller(sig, ptr) {
          var argCache = [];
          return function() {
            argCache.length = 0;
            Object.assign(argCache, arguments);
            return dynCall(sig, ptr, argCache);
          };
        }
        function embind__requireFunction(signature, rawFunction) {
          signature = readLatin1String(signature);
          function makeDynCaller() {
            if (signature.includes("j")) {
              return getDynCaller(signature, rawFunction);
            }
            return getWasmTableEntry(rawFunction);
          }
          var fp = makeDynCaller();
          if (typeof fp != "function") {
            throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
          }
          return fp;
        }
        var UnboundTypeError = void 0;
        function throwUnboundTypeError(message, types) {
          var unboundTypes = [];
          var seen = {};
          function visit(type) {
            if (seen[type]) {
              return;
            }
            if (registeredTypes[type]) {
              return;
            }
            if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return;
            }
            unboundTypes.push(type);
            seen[type] = true;
          }
          types.forEach(visit);
          throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
        }
        function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync) {
          var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
          name = readLatin1String(name);
          rawInvoker = embind__requireFunction(signature, rawInvoker);
          exposePublicSymbol(name, function() {
            throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes);
          }, argCount - 1);
          whenDependentTypesAreResolved([], argTypes, function(argTypes2) {
            var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
            replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn, isAsync), argCount - 1);
            return [];
          });
        }
        function integerReadValueFromPointer(name, shift, signed) {
          switch (shift) {
            case 0:
              return signed ? function readS8FromPointer(pointer) {
                return HEAP8[pointer];
              } : function readU8FromPointer(pointer) {
                return HEAPU8[pointer];
              };
            case 1:
              return signed ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1];
              } : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1];
              };
            case 2:
              return signed ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2];
              } : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2];
              };
            default:
              throw new TypeError("Unknown integer type: " + name);
          }
        }
        function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
          name = readLatin1String(name);
          if (maxRange === -1) {
            maxRange = 4294967295;
          }
          var shift = getShiftFromSize(size);
          var fromWireType = (value) => value;
          if (minRange === 0) {
            var bitshift = 32 - 8 * size;
            fromWireType = (value) => value << bitshift >>> bitshift;
          }
          var isUnsignedType = name.includes("unsigned");
          var checkAssertions = (value, toTypeName) => {
          };
          var toWireType;
          if (isUnsignedType) {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value >>> 0;
            };
          } else {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value;
            };
          }
          registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null });
        }
        function __embind_register_memory_view(rawType, dataTypeIndex, name) {
          var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
          var TA = typeMapping[dataTypeIndex];
          function decodeMemoryView(handle) {
            handle = handle >> 2;
            var heap = HEAPU32;
            var size = heap[handle];
            var data = heap[handle + 1];
            return new TA(heap.buffer, data, size);
          }
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
        }
        function __embind_register_std_string(rawType, name) {
          name = readLatin1String(name);
          var stdStringIsUTF8 = name === "std::string";
          registerType(rawType, { name, "fromWireType": function(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === void 0) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join("");
            }
            _free(value);
            return str;
          }, "toWireType": function(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError("Cannot pass non-string to std::string");
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
            _free(ptr);
          } });
        }
        function UTF16ToString(ptr, maxBytesToRead) {
          var str = "";
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        }
        function stringToUTF16(str, outPtr, maxBytesToWrite) {
          if (maxBytesToWrite === void 0) {
            maxBytesToWrite = 2147483647;
          }
          if (maxBytesToWrite < 2) return 0;
          maxBytesToWrite -= 2;
          var startPtr = outPtr;
          var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
          for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i);
            HEAP16[outPtr >> 1] = codeUnit;
            outPtr += 2;
          }
          HEAP16[outPtr >> 1] = 0;
          return outPtr - startPtr;
        }
        function lengthBytesUTF16(str) {
          return str.length * 2;
        }
        function UTF32ToString(ptr, maxBytesToRead) {
          var i = 0;
          var str = "";
          while (!(i >= maxBytesToRead / 4)) {
            var utf32 = HEAP32[ptr + i * 4 >> 2];
            if (utf32 == 0) break;
            ++i;
            if (utf32 >= 65536) {
              var ch = utf32 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            } else {
              str += String.fromCharCode(utf32);
            }
          }
          return str;
        }
        function stringToUTF32(str, outPtr, maxBytesToWrite) {
          if (maxBytesToWrite === void 0) {
            maxBytesToWrite = 2147483647;
          }
          if (maxBytesToWrite < 4) return 0;
          var startPtr = outPtr;
          var endPtr = startPtr + maxBytesToWrite - 4;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) {
              var trailSurrogate = str.charCodeAt(++i);
              codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
            }
            HEAP32[outPtr >> 2] = codeUnit;
            outPtr += 4;
            if (outPtr + 4 > endPtr) break;
          }
          HEAP32[outPtr >> 2] = 0;
          return outPtr - startPtr;
        }
        function lengthBytesUTF32(str) {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
            len += 4;
          }
          return len;
        }
        function __embind_register_std_wstring(rawType, charSize, name) {
          name = readLatin1String(name);
          var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
          if (charSize === 2) {
            decodeString = UTF16ToString;
            encodeString = stringToUTF16;
            lengthBytesUTF = lengthBytesUTF16;
            getHeap = () => HEAPU16;
            shift = 1;
          } else if (charSize === 4) {
            decodeString = UTF32ToString;
            encodeString = stringToUTF32;
            lengthBytesUTF = lengthBytesUTF32;
            getHeap = () => HEAPU32;
            shift = 2;
          }
          registerType(rawType, { name, "fromWireType": function(value) {
            var length = HEAPU32[value >> 2];
            var HEAP = getHeap();
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          }, "toWireType": function(destructors, value) {
            if (!(typeof value == "string")) {
              throwBindingError("Cannot pass non-string to C++ string type " + name);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length >> shift;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
            _free(ptr);
          } });
        }
        function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
          structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
        }
        function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
          structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
        }
        function __embind_register_void(rawType, name) {
          name = readLatin1String(name);
          registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": function() {
            return void 0;
          }, "toWireType": function(destructors, o) {
            return void 0;
          } });
        }
        var emval_symbols = {};
        function getStringOrSymbol(address) {
          var symbol = emval_symbols[address];
          if (symbol === void 0) {
            return readLatin1String(address);
          }
          return symbol;
        }
        function emval_get_global() {
          if (typeof globalThis == "object") {
            return globalThis;
          }
          function testGlobal(obj) {
            obj["$$$embind_global$$$"] = obj;
            var success = typeof $$$embind_global$$$ == "object" && obj["$$$embind_global$$$"] == obj;
            if (!success) {
              delete obj["$$$embind_global$$$"];
            }
            return success;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          if (typeof global == "object" && testGlobal(global)) {
            $$$embind_global$$$ = global;
          } else if (typeof self == "object" && testGlobal(self)) {
            $$$embind_global$$$ = self;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          throw Error("unable to get global object.");
        }
        function __emval_get_global(name) {
          if (name === 0) {
            return Emval.toHandle(emval_get_global());
          } else {
            name = getStringOrSymbol(name);
            return Emval.toHandle(emval_get_global()[name]);
          }
        }
        function __emval_incref(handle) {
          if (handle > 4) {
            emval_handle_array[handle].refcount += 1;
          }
        }
        function craftEmvalAllocator(argCount) {
          var argsList = new Array(argCount + 1);
          return function(constructor, argTypes, args) {
            argsList[0] = constructor;
            for (var i = 0; i < argCount; ++i) {
              var argType = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i);
              argsList[i + 1] = argType["readValueFromPointer"](args);
              args += argType["argPackAdvance"];
            }
            var obj = new (constructor.bind.apply(constructor, argsList))();
            return Emval.toHandle(obj);
          };
        }
        var emval_newers = {};
        function __emval_new(handle, argCount, argTypes, args) {
          handle = Emval.toValue(handle);
          var newer = emval_newers[argCount];
          if (!newer) {
            newer = craftEmvalAllocator(argCount);
            emval_newers[argCount] = newer;
          }
          return newer(handle, argTypes, args);
        }
        function _abort() {
          abort("");
        }
        function _emscripten_memcpy_big(dest, src, num) {
          HEAPU8.copyWithin(dest, src, src + num);
        }
        function getHeapMax() {
          return 2147483648;
        }
        function emscripten_realloc_buffer(size) {
          var b = wasmMemory.buffer;
          try {
            wasmMemory.grow(size - b.byteLength + 65535 >>> 16);
            updateMemoryViews();
            return 1;
          } catch (e) {
          }
        }
        function _emscripten_resize_heap(requestedSize) {
          var oldSize = HEAPU8.length;
          requestedSize = requestedSize >>> 0;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = emscripten_realloc_buffer(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        }
        InternalError = Module5["InternalError"] = extendError(Error, "InternalError");
        embind_init_charCodes();
        BindingError = Module5["BindingError"] = extendError(Error, "BindingError");
        init_emval();
        UnboundTypeError = Module5["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
        var wasmImports = { "k": ___cxa_throw, "m": __embind_finalize_value_object, "o": __embind_register_bigint, "t": __embind_register_bool, "s": __embind_register_emval, "q": __embind_register_enum, "d": __embind_register_enum_value, "h": __embind_register_float, "f": __embind_register_function, "c": __embind_register_integer, "b": __embind_register_memory_view, "i": __embind_register_std_string, "e": __embind_register_std_wstring, "n": __embind_register_value_object, "a": __embind_register_value_object_field, "u": __embind_register_void, "j": __emval_decref, "w": __emval_get_global, "l": __emval_incref, "v": __emval_new, "g": _abort, "r": _emscripten_memcpy_big, "p": _emscripten_resize_heap };
        var asm = createWasm();
        var ___wasm_call_ctors = function() {
          return (___wasm_call_ctors = Module5["asm"]["y"]).apply(null, arguments);
        };
        var _malloc = function() {
          return (_malloc = Module5["asm"]["z"]).apply(null, arguments);
        };
        var _free = function() {
          return (_free = Module5["asm"]["A"]).apply(null, arguments);
        };
        var ___getTypeName = Module5["___getTypeName"] = function() {
          return (___getTypeName = Module5["___getTypeName"] = Module5["asm"]["B"]).apply(null, arguments);
        };
        var __embind_initialize_bindings = Module5["__embind_initialize_bindings"] = function() {
          return (__embind_initialize_bindings = Module5["__embind_initialize_bindings"] = Module5["asm"]["C"]).apply(null, arguments);
        };
        var ___errno_location = function() {
          return (___errno_location = Module5["asm"]["__errno_location"]).apply(null, arguments);
        };
        var ___cxa_is_pointer_type = function() {
          return (___cxa_is_pointer_type = Module5["asm"]["E"]).apply(null, arguments);
        };
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          if (!calledRun) run();
          if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run() {
          if (runDependencies > 0) {
            return;
          }
          preRun();
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            if (calledRun) return;
            calledRun = true;
            Module5["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            readyPromiseResolve(Module5);
            if (Module5["onRuntimeInitialized"]) Module5["onRuntimeInitialized"]();
            postRun();
          }
          if (Module5["setStatus"]) {
            Module5["setStatus"]("Running...");
            setTimeout(function() {
              setTimeout(function() {
                Module5["setStatus"]("");
              }, 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
        }
        if (Module5["preInit"]) {
          if (typeof Module5["preInit"] == "function") Module5["preInit"] = [Module5["preInit"]];
          while (Module5["preInit"].length > 0) {
            Module5["preInit"].pop()();
          }
        }
        run();
        return Module5.ready;
      });
    })();
    webp_enc_default = Module3;
  }
});

// node_modules/@jsquash/webp/encode.js
var encode_exports2 = {};
__export(encode_exports2, {
  default: () => encode2,
  init: () => init2
});
async function init2(module, moduleOptionOverrides) {
  let actualModule = module;
  let actualOptions = moduleOptionOverrides;
  if (arguments.length === 1 && !(module instanceof WebAssembly.Module)) {
    actualModule = void 0;
    actualOptions = module;
  }
  if (await simd()) {
    const webpEncoder2 = await Promise.resolve().then(() => (init_webp_enc_simd(), webp_enc_simd_exports));
    emscriptenModule2 = initEmscriptenModule2(webpEncoder2.default, actualModule, actualOptions);
    return emscriptenModule2;
  }
  const webpEncoder = await Promise.resolve().then(() => (init_webp_enc(), webp_enc_exports));
  emscriptenModule2 = initEmscriptenModule2(webpEncoder.default, actualModule, actualOptions);
  return emscriptenModule2;
}
async function encode2(data, options = {}) {
  if (!emscriptenModule2)
    emscriptenModule2 = init2();
  const _options = { ...defaultOptions2, ...options };
  const module = await emscriptenModule2;
  const result = module.encode(data.data, data.width, data.height, _options);
  if (!result)
    throw new Error("Encoding error.");
  return result.buffer;
}
var emscriptenModule2;
var init_encode2 = __esm({
  "node_modules/@jsquash/webp/encode.js"() {
    init_meta2();
    init_utils2();
    init_esm();
  }
});

// node_modules/@jsquash/avif/codec/enc/avif_enc.js
var avif_enc_exports = {};
__export(avif_enc_exports, {
  default: () => avif_enc_default
});
var Module4, avif_enc_default;
var init_avif_enc = __esm({
  "node_modules/@jsquash/avif/codec/enc/avif_enc.js"() {
    Module4 = (() => {
      var _scriptDir = import.meta.url;
      return (function(moduleArg = {}) {
        var Module5 = moduleArg;
        var readyPromiseResolve, readyPromiseReject;
        var readyPromise = new Promise((resolve, reject) => {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject;
        });
        const isServiceWorker2 = globalThis.ServiceWorkerGlobalScope !== void 0;
        const isRunningInCloudFlareWorkers2 = isServiceWorker2 && typeof self !== "undefined" && globalThis.caches && globalThis.caches.default !== void 0;
        const isRunningInNode2 = typeof process === "object" && process.release && process.release.name === "node";
        if (isRunningInCloudFlareWorkers2 || isRunningInNode2) {
          if (!globalThis.ImageData) {
            globalThis.ImageData = class ImageData {
              constructor(data, width, height) {
                this.data = data;
                this.width = width;
                this.height = height;
              }
            };
          }
          if (import.meta.url === void 0) {
            import.meta.url = "https://localhost";
          }
          if (typeof self !== "undefined" && self.location === void 0) {
            self.location = { href: "" };
          }
        }
        var moduleOverrides = Object.assign({}, Module5);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module5["locateFile"]) {
            return Module5["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var read_, readAsync, readBinary;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            scriptDirectory = document.currentScript.src;
          }
          if (_scriptDir) {
            scriptDirectory = _scriptDir;
          }
          if (scriptDirectory.startsWith("blob:")) {
            scriptDirectory = "";
          } else {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
          }
          {
            read_ = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = (url, onload, onerror) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = () => {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
          }
        } else {
        }
        var out = Module5["print"] || console.log.bind(console);
        var err = Module5["printErr"] || console.error.bind(console);
        Object.assign(Module5, moduleOverrides);
        moduleOverrides = null;
        if (Module5["arguments"]) arguments_ = Module5["arguments"];
        if (Module5["thisProgram"]) thisProgram = Module5["thisProgram"];
        if (Module5["quit"]) quit_ = Module5["quit"];
        var wasmBinary;
        if (Module5["wasmBinary"]) wasmBinary = Module5["wasmBinary"];
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module5["HEAP8"] = HEAP8 = new Int8Array(b);
          Module5["HEAP16"] = HEAP16 = new Int16Array(b);
          Module5["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module5["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module5["HEAP32"] = HEAP32 = new Int32Array(b);
          Module5["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module5["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module5["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module5["preRun"]) {
            if (typeof Module5["preRun"] == "function") Module5["preRun"] = [Module5["preRun"]];
            while (Module5["preRun"].length) {
              addOnPreRun(Module5["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
          runtimeInitialized = true;
          callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
          if (Module5["postRun"]) {
            if (typeof Module5["postRun"] == "function") Module5["postRun"] = [Module5["postRun"]];
            while (Module5["postRun"].length) {
              addOnPostRun(Module5["postRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
          __ATPOSTRUN__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
          runDependencies++;
          Module5["monitorRunDependencies"]?.(runDependencies);
        }
        function removeRunDependency(id) {
          runDependencies--;
          Module5["monitorRunDependencies"]?.(runDependencies);
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          Module5["onAbort"]?.(what);
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
        var wasmBinaryFile;
        if (Module5["locateFile"]) {
          wasmBinaryFile = "avif_enc.wasm";
          if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
          }
        } else {
          wasmBinaryFile = new URL("avif_enc.wasm", import.meta.url).href;
        }
        function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          }
          throw "both async and sync fetching of the wasm failed";
        }
        function getBinaryPromise(binaryFile) {
          if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
            if (typeof fetch == "function") {
              return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
                if (!response["ok"]) {
                  throw `failed to load wasm binary file at '${binaryFile}'`;
                }
                return response["arrayBuffer"]();
              }).catch(() => getBinarySync(binaryFile));
            }
          }
          return Promise.resolve().then(() => getBinarySync(binaryFile));
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then((binary) => WebAssembly.instantiate(binary, imports)).then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
            return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
              var result = WebAssembly.instantiateStreaming(response, imports);
              return result.then(callback, function(reason) {
                err(`wasm streaming compile failed: ${reason}`);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback);
              });
            });
          }
          return instantiateArrayBuffer(binaryFile, imports, callback);
        }
        function createWasm() {
          var info = { "a": wasmImports };
          function receiveInstance(instance, module) {
            wasmExports = instance.exports;
            wasmMemory = wasmExports["P"];
            updateMemoryViews();
            wasmTable = wasmExports["U"];
            addOnInit(wasmExports["Q"]);
            removeRunDependency("wasm-instantiate");
            return wasmExports;
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result) {
            receiveInstance(result["instance"]);
          }
          if (Module5["instantiateWasm"]) {
            try {
              return Module5["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err(`Module.instantiateWasm callback failed with error: ${e}`);
              readyPromiseReject(e);
            }
          }
          instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
          return {};
        }
        var ASM_CONSTS = { 617256: () => {
          throw new Error("Invalid bit depth. Supported values are 8, 10, or 12.");
        } };
        var callRuntimeCallbacks = (callbacks) => {
          while (callbacks.length > 0) {
            callbacks.shift()(Module5);
          }
        };
        var noExitRuntime = Module5["noExitRuntime"] || true;
        var stackRestore = (val) => __emscripten_stack_restore(val);
        var stackSave = () => _emscripten_stack_get_current();
        var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
          var endIdx = idx + maxBytesToRead;
          var str = "";
          while (!(idx >= endIdx)) {
            var u0 = heapOrArray[idx++];
            if (!u0) return str;
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
          return str;
        };
        var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        var SYSCALLS = { varargs: void 0, getStr(ptr) {
          var ret = UTF8ToString(ptr);
          return ret;
        } };
        function ___syscall_fcntl64(fd, cmd, varargs) {
          SYSCALLS.varargs = varargs;
          return 0;
        }
        function ___syscall_ioctl(fd, op, varargs) {
          SYSCALLS.varargs = varargs;
          return 0;
        }
        function ___syscall_openat(dirfd, path, flags, varargs) {
          SYSCALLS.varargs = varargs;
        }
        var structRegistrations = {};
        var runDestructors = (destructors) => {
          while (destructors.length) {
            var ptr = destructors.pop();
            var del = destructors.pop();
            del(ptr);
          }
        };
        function readPointer(pointer) {
          return this["fromWireType"](HEAPU32[pointer >> 2]);
        }
        var awaitingDependencies = {};
        var registeredTypes = {};
        var typeDependencies = {};
        var InternalError;
        var throwInternalError = (message) => {
          throw new InternalError(message);
        };
        var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
          myTypes.forEach(function(type) {
            typeDependencies[type] = dependentTypes;
          });
          function onComplete(typeConverters2) {
            var myTypeConverters = getTypeConverters(typeConverters2);
            if (myTypeConverters.length !== myTypes.length) {
              throwInternalError("Mismatched type converter count");
            }
            for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
            }
          }
          var typeConverters = new Array(dependentTypes.length);
          var unregisteredTypes = [];
          var registered = 0;
          dependentTypes.forEach((dt, i) => {
            if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
            } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(() => {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                  onComplete(typeConverters);
                }
              });
            }
          });
          if (0 === unregisteredTypes.length) {
            onComplete(typeConverters);
          }
        };
        var __embind_finalize_value_object = (structType) => {
          var reg = structRegistrations[structType];
          delete structRegistrations[structType];
          var rawConstructor = reg.rawConstructor;
          var rawDestructor = reg.rawDestructor;
          var fieldRecords = reg.fields;
          var fieldTypes = fieldRecords.map((field) => field.getterReturnType).concat(fieldRecords.map((field) => field.setterArgumentType));
          whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes2) => {
            var fields = {};
            fieldRecords.forEach((field, i) => {
              var fieldName = field.fieldName;
              var getterReturnType = fieldTypes2[i];
              var getter = field.getter;
              var getterContext = field.getterContext;
              var setterArgumentType = fieldTypes2[i + fieldRecords.length];
              var setter = field.setter;
              var setterContext = field.setterContext;
              fields[fieldName] = { read: (ptr) => getterReturnType["fromWireType"](getter(getterContext, ptr)), write: (ptr, o) => {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                runDestructors(destructors);
              } };
            });
            return [{ name: reg.name, "fromWireType": (ptr) => {
              var rv = {};
              for (var i in fields) {
                rv[i] = fields[i].read(ptr);
              }
              rawDestructor(ptr);
              return rv;
            }, "toWireType": (destructors, o) => {
              for (var fieldName in fields) {
                if (!(fieldName in o)) {
                  throw new TypeError(`Missing field: "${fieldName}"`);
                }
              }
              var ptr = rawConstructor();
              for (fieldName in fields) {
                fields[fieldName].write(ptr, o[fieldName]);
              }
              if (destructors !== null) {
                destructors.push(rawDestructor, ptr);
              }
              return ptr;
            }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: rawDestructor }];
          });
        };
        var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
        };
        var embind_init_charCodes = () => {
          var codes = new Array(256);
          for (var i = 0; i < 256; ++i) {
            codes[i] = String.fromCharCode(i);
          }
          embind_charCodes = codes;
        };
        var embind_charCodes;
        var readLatin1String = (ptr) => {
          var ret = "";
          var c = ptr;
          while (HEAPU8[c]) {
            ret += embind_charCodes[HEAPU8[c++]];
          }
          return ret;
        };
        var BindingError;
        var throwBindingError = (message) => {
          throw new BindingError(message);
        };
        function sharedRegisterType(rawType, registeredInstance, options = {}) {
          var name = registeredInstance.name;
          if (!rawType) {
            throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
          }
          if (registeredTypes.hasOwnProperty(rawType)) {
            if (options.ignoreDuplicateRegistrations) {
              return;
            } else {
              throwBindingError(`Cannot register type '${name}' twice`);
            }
          }
          registeredTypes[rawType] = registeredInstance;
          delete typeDependencies[rawType];
          if (awaitingDependencies.hasOwnProperty(rawType)) {
            var callbacks = awaitingDependencies[rawType];
            delete awaitingDependencies[rawType];
            callbacks.forEach((cb) => cb());
          }
        }
        function registerType(rawType, registeredInstance, options = {}) {
          if (!("argPackAdvance" in registeredInstance)) {
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          }
          return sharedRegisterType(rawType, registeredInstance, options);
        }
        var GenericWireTypeSize = 8;
        var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": function(wt) {
            return !!wt;
          }, "toWireType": function(destructors, o) {
            return o ? trueValue : falseValue;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": function(pointer) {
            return this["fromWireType"](HEAPU8[pointer]);
          }, destructorFunction: null });
        };
        var emval_freelist = [];
        var emval_handles = [];
        var __emval_decref = (handle) => {
          if (handle > 9 && 0 === --emval_handles[handle + 1]) {
            emval_handles[handle] = void 0;
            emval_freelist.push(handle);
          }
        };
        var count_emval_handles = () => emval_handles.length / 2 - 5 - emval_freelist.length;
        var init_emval = () => {
          emval_handles.push(0, 1, void 0, 1, null, 1, true, 1, false, 1);
          Module5["count_emval_handles"] = count_emval_handles;
        };
        var Emval = { toValue: (handle) => {
          if (!handle) {
            throwBindingError("Cannot use deleted val. handle = " + handle);
          }
          return emval_handles[handle];
        }, toHandle: (value) => {
          switch (value) {
            case void 0:
              return 2;
            case null:
              return 4;
            case true:
              return 6;
            case false:
              return 8;
            default: {
              const handle = emval_freelist.pop() || emval_handles.length;
              emval_handles[handle] = value;
              emval_handles[handle + 1] = 1;
              return handle;
            }
          }
        } };
        var EmValType = { name: "emscripten::val", "fromWireType": (handle) => {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv;
        }, "toWireType": (destructors, value) => Emval.toHandle(value), "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction: null };
        var __embind_register_emval = (rawType) => registerType(rawType, EmValType);
        var floatReadValueFromPointer = (name, width) => {
          switch (width) {
            case 4:
              return function(pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2]);
              };
            case 8:
              return function(pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3]);
              };
            default:
              throw new TypeError(`invalid float width (${width}): ${name}`);
          }
        };
        var __embind_register_float = (rawType, name, size) => {
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": (value) => value, "toWireType": (destructors, value) => value, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": floatReadValueFromPointer(name, size), destructorFunction: null });
        };
        var createNamedFunction = (name, body) => Object.defineProperty(body, "name", { value: name });
        function usesDestructorStack(argTypes) {
          for (var i = 1; i < argTypes.length; ++i) {
            if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
              return true;
            }
          }
          return false;
        }
        function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, isAsync) {
          var argCount = argTypes.length;
          if (argCount < 2) {
            throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
          }
          var isClassMethodFunc = argTypes[1] !== null && classType !== null;
          var needsDestructorStack = usesDestructorStack(argTypes);
          var returns = argTypes[0].name !== "void";
          var expectedArgCount = argCount - 2;
          var argsWired = new Array(expectedArgCount);
          var invokerFuncArgs = [];
          var destructors = [];
          var invokerFn = function(...args) {
            if (args.length !== expectedArgCount) {
              throwBindingError(`function ${humanName} called with ${args.length} arguments, expected ${expectedArgCount}`);
            }
            destructors.length = 0;
            var thisWired;
            invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
            invokerFuncArgs[0] = cppTargetFunc;
            if (isClassMethodFunc) {
              thisWired = argTypes[1]["toWireType"](destructors, this);
              invokerFuncArgs[1] = thisWired;
            }
            for (var i = 0; i < expectedArgCount; ++i) {
              argsWired[i] = argTypes[i + 2]["toWireType"](destructors, args[i]);
              invokerFuncArgs.push(argsWired[i]);
            }
            var rv = cppInvokerFunc(...invokerFuncArgs);
            function onDone(rv2) {
              if (needsDestructorStack) {
                runDestructors(destructors);
              } else {
                for (var i2 = isClassMethodFunc ? 1 : 2; i2 < argTypes.length; i2++) {
                  var param = i2 === 1 ? thisWired : argsWired[i2 - 2];
                  if (argTypes[i2].destructorFunction !== null) {
                    argTypes[i2].destructorFunction(param);
                  }
                }
              }
              if (returns) {
                return argTypes[0]["fromWireType"](rv2);
              }
            }
            return onDone(rv);
          };
          return createNamedFunction(humanName, invokerFn);
        }
        var ensureOverloadTable = (proto, methodName, humanName) => {
          if (void 0 === proto[methodName].overloadTable) {
            var prevFunc = proto[methodName];
            proto[methodName] = function(...args) {
              if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
                throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
              }
              return proto[methodName].overloadTable[args.length].apply(this, args);
            };
            proto[methodName].overloadTable = [];
            proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
          }
        };
        var exposePublicSymbol = (name, value, numArguments) => {
          if (Module5.hasOwnProperty(name)) {
            if (void 0 === numArguments || void 0 !== Module5[name].overloadTable && void 0 !== Module5[name].overloadTable[numArguments]) {
              throwBindingError(`Cannot register public name '${name}' twice`);
            }
            ensureOverloadTable(Module5, name, name);
            if (Module5.hasOwnProperty(numArguments)) {
              throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
            }
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            if (void 0 !== numArguments) {
              Module5[name].numArguments = numArguments;
            }
          }
        };
        var heap32VectorToArray = (count, firstElement) => {
          var array = [];
          for (var i = 0; i < count; i++) {
            array.push(HEAPU32[firstElement + i * 4 >> 2]);
          }
          return array;
        };
        var replacePublicSymbol = (name, value, numArguments) => {
          if (!Module5.hasOwnProperty(name)) {
            throwInternalError("Replacing nonexistent public symbol");
          }
          if (void 0 !== Module5[name].overloadTable && void 0 !== numArguments) {
            Module5[name].overloadTable[numArguments] = value;
          } else {
            Module5[name] = value;
            Module5[name].argCount = numArguments;
          }
        };
        var dynCallLegacy = (sig, ptr, args) => {
          sig = sig.replace(/p/g, "i");
          var f = Module5["dynCall_" + sig];
          return f(ptr, ...args);
        };
        var wasmTable;
        var getWasmTableEntry = (funcPtr) => wasmTable.get(funcPtr);
        var dynCall = (sig, ptr, args = []) => {
          if (sig.includes("j")) {
            return dynCallLegacy(sig, ptr, args);
          }
          var rtn = getWasmTableEntry(ptr)(...args);
          return rtn;
        };
        var getDynCaller = (sig, ptr) => (...args) => dynCall(sig, ptr, args);
        var embind__requireFunction = (signature, rawFunction) => {
          signature = readLatin1String(signature);
          function makeDynCaller() {
            if (signature.includes("j")) {
              return getDynCaller(signature, rawFunction);
            }
            return getWasmTableEntry(rawFunction);
          }
          var fp = makeDynCaller();
          if (typeof fp != "function") {
            throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
          }
          return fp;
        };
        var extendError = (baseErrorType, errorName) => {
          var errorClass = createNamedFunction(errorName, function(message) {
            this.name = errorName;
            this.message = message;
            var stack = new Error(message).stack;
            if (stack !== void 0) {
              this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
            }
          });
          errorClass.prototype = Object.create(baseErrorType.prototype);
          errorClass.prototype.constructor = errorClass;
          errorClass.prototype.toString = function() {
            if (this.message === void 0) {
              return this.name;
            } else {
              return `${this.name}: ${this.message}`;
            }
          };
          return errorClass;
        };
        var UnboundTypeError;
        var getTypeName = (type) => {
          var ptr = ___getTypeName(type);
          var rv = readLatin1String(ptr);
          _free(ptr);
          return rv;
        };
        var throwUnboundTypeError = (message, types) => {
          var unboundTypes = [];
          var seen = {};
          function visit(type) {
            if (seen[type]) {
              return;
            }
            if (registeredTypes[type]) {
              return;
            }
            if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return;
            }
            unboundTypes.push(type);
            seen[type] = true;
          }
          types.forEach(visit);
          throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([", "]));
        };
        var getFunctionName = (signature) => {
          signature = signature.trim();
          const argsIndex = signature.indexOf("(");
          if (argsIndex !== -1) {
            return signature.substr(0, argsIndex);
          } else {
            return signature;
          }
        };
        var __embind_register_function = (name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync) => {
          var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
          name = readLatin1String(name);
          name = getFunctionName(name);
          rawInvoker = embind__requireFunction(signature, rawInvoker);
          exposePublicSymbol(name, function() {
            throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes);
          }, argCount - 1);
          whenDependentTypesAreResolved([], argTypes, (argTypes2) => {
            var invokerArgsArray = [argTypes2[0], null].concat(argTypes2.slice(1));
            replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn, isAsync), argCount - 1);
            return [];
          });
        };
        var integerReadValueFromPointer = (name, width, signed) => {
          switch (width) {
            case 1:
              return signed ? (pointer) => HEAP8[pointer] : (pointer) => HEAPU8[pointer];
            case 2:
              return signed ? (pointer) => HEAP16[pointer >> 1] : (pointer) => HEAPU16[pointer >> 1];
            case 4:
              return signed ? (pointer) => HEAP32[pointer >> 2] : (pointer) => HEAPU32[pointer >> 2];
            default:
              throw new TypeError(`invalid integer width (${width}): ${name}`);
          }
        };
        var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
          name = readLatin1String(name);
          if (maxRange === -1) {
            maxRange = 4294967295;
          }
          var fromWireType = (value) => value;
          if (minRange === 0) {
            var bitshift = 32 - 8 * size;
            fromWireType = (value) => value << bitshift >>> bitshift;
          }
          var isUnsignedType = name.includes("unsigned");
          var checkAssertions = (value, toTypeName) => {
          };
          var toWireType;
          if (isUnsignedType) {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value >>> 0;
            };
          } else {
            toWireType = function(destructors, value) {
              checkAssertions(value, this.name);
              return value;
            };
          }
          registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": integerReadValueFromPointer(name, size, minRange !== 0), destructorFunction: null });
        };
        var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
          var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
          var TA = typeMapping[dataTypeIndex];
          function decodeMemoryView(handle) {
            var size = HEAPU32[handle >> 2];
            var data = HEAPU32[handle + 4 >> 2];
            return new TA(HEAP8.buffer, data, size);
          }
          name = readLatin1String(name);
          registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
        };
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
          if (!(maxBytesToWrite > 0)) return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i);
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023;
            }
            if (u <= 127) {
              if (outIdx >= endIdx) break;
              heap[outIdx++] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx) break;
              heap[outIdx++] = 192 | u >> 6;
              heap[outIdx++] = 128 | u & 63;
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx) break;
              heap[outIdx++] = 224 | u >> 12;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            } else {
              if (outIdx + 3 >= endIdx) break;
              heap[outIdx++] = 240 | u >> 18;
              heap[outIdx++] = 128 | u >> 12 & 63;
              heap[outIdx++] = 128 | u >> 6 & 63;
              heap[outIdx++] = 128 | u & 63;
            }
          }
          heap[outIdx] = 0;
          return outIdx - startIdx;
        };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        var lengthBytesUTF8 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        };
        var __embind_register_std_string = (rawType, name) => {
          name = readLatin1String(name);
          var stdStringIsUTF8 = name === "std::string";
          registerType(rawType, { name, "fromWireType"(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === void 0) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join("");
            }
            _free(value);
            return str;
          }, "toWireType"(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
              throwBindingError("Cannot pass non-string to std::string");
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }
            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction(ptr) {
            _free(ptr);
          } });
        };
        var UTF16ToString = (ptr, maxBytesToRead) => {
          var str = "";
          for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) break;
            str += String.fromCharCode(codeUnit);
          }
          return str;
        };
        var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
          maxBytesToWrite ?? (maxBytesToWrite = 2147483647);
          if (maxBytesToWrite < 2) return 0;
          maxBytesToWrite -= 2;
          var startPtr = outPtr;
          var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
          for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i);
            HEAP16[outPtr >> 1] = codeUnit;
            outPtr += 2;
          }
          HEAP16[outPtr >> 1] = 0;
          return outPtr - startPtr;
        };
        var lengthBytesUTF16 = (str) => str.length * 2;
        var UTF32ToString = (ptr, maxBytesToRead) => {
          var i = 0;
          var str = "";
          while (!(i >= maxBytesToRead / 4)) {
            var utf32 = HEAP32[ptr + i * 4 >> 2];
            if (utf32 == 0) break;
            ++i;
            if (utf32 >= 65536) {
              var ch = utf32 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            } else {
              str += String.fromCharCode(utf32);
            }
          }
          return str;
        };
        var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
          maxBytesToWrite ?? (maxBytesToWrite = 2147483647);
          if (maxBytesToWrite < 4) return 0;
          var startPtr = outPtr;
          var endPtr = startPtr + maxBytesToWrite - 4;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) {
              var trailSurrogate = str.charCodeAt(++i);
              codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
            }
            HEAP32[outPtr >> 2] = codeUnit;
            outPtr += 4;
            if (outPtr + 4 > endPtr) break;
          }
          HEAP32[outPtr >> 2] = 0;
          return outPtr - startPtr;
        };
        var lengthBytesUTF32 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i);
            if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
            len += 4;
          }
          return len;
        };
        var __embind_register_std_wstring = (rawType, charSize, name) => {
          name = readLatin1String(name);
          var decodeString, encodeString, readCharAt, lengthBytesUTF;
          if (charSize === 2) {
            decodeString = UTF16ToString;
            encodeString = stringToUTF16;
            lengthBytesUTF = lengthBytesUTF16;
            readCharAt = (pointer) => HEAPU16[pointer >> 1];
          } else if (charSize === 4) {
            decodeString = UTF32ToString;
            encodeString = stringToUTF32;
            lengthBytesUTF = lengthBytesUTF32;
            readCharAt = (pointer) => HEAPU32[pointer >> 2];
          }
          registerType(rawType, { name, "fromWireType": (value) => {
            var length = HEAPU32[value >> 2];
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || readCharAt(currentBytePtr) == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === void 0) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }
            _free(value);
            return str;
          }, "toWireType": (destructors, value) => {
            if (!(typeof value == "string")) {
              throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length / charSize;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr;
          }, "argPackAdvance": GenericWireTypeSize, "readValueFromPointer": readPointer, destructorFunction(ptr) {
            _free(ptr);
          } });
        };
        var __embind_register_value_object = (rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) => {
          structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
        };
        var __embind_register_value_object_field = (structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) => {
          structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
        };
        var __embind_register_void = (rawType, name) => {
          name = readLatin1String(name);
          registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": () => void 0, "toWireType": (destructors, o) => void 0 });
        };
        var __emscripten_throw_longjmp = () => {
          throw Infinity;
        };
        var emval_methodCallers = [];
        var __emval_call = (caller, handle, destructorsRef, args) => {
          caller = emval_methodCallers[caller];
          handle = Emval.toValue(handle);
          return caller(null, handle, destructorsRef, args);
        };
        var emval_symbols = {};
        var getStringOrSymbol = (address) => {
          var symbol = emval_symbols[address];
          if (symbol === void 0) {
            return readLatin1String(address);
          }
          return symbol;
        };
        var emval_get_global = () => {
          if (typeof globalThis == "object") {
            return globalThis;
          }
          function testGlobal(obj) {
            obj["$$$embind_global$$$"] = obj;
            var success = typeof $$$embind_global$$$ == "object" && obj["$$$embind_global$$$"] == obj;
            if (!success) {
              delete obj["$$$embind_global$$$"];
            }
            return success;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          if (typeof global == "object" && testGlobal(global)) {
            $$$embind_global$$$ = global;
          } else if (typeof self == "object" && testGlobal(self)) {
            $$$embind_global$$$ = self;
          }
          if (typeof $$$embind_global$$$ == "object") {
            return $$$embind_global$$$;
          }
          throw Error("unable to get global object.");
        };
        var __emval_get_global = (name) => {
          if (name === 0) {
            return Emval.toHandle(emval_get_global());
          } else {
            name = getStringOrSymbol(name);
            return Emval.toHandle(emval_get_global()[name]);
          }
        };
        var emval_addMethodCaller = (caller) => {
          var id = emval_methodCallers.length;
          emval_methodCallers.push(caller);
          return id;
        };
        var requireRegisteredType = (rawType, humanName) => {
          var impl = registeredTypes[rawType];
          if (void 0 === impl) {
            throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);
          }
          return impl;
        };
        var emval_lookupTypes = (argCount, argTypes) => {
          var a = new Array(argCount);
          for (var i = 0; i < argCount; ++i) {
            a[i] = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i);
          }
          return a;
        };
        var reflectConstruct = Reflect.construct;
        var emval_returnValue = (returnType, destructorsRef, handle) => {
          var destructors = [];
          var result = returnType["toWireType"](destructors, handle);
          if (destructors.length) {
            HEAPU32[destructorsRef >> 2] = Emval.toHandle(destructors);
          }
          return result;
        };
        var __emval_get_method_caller = (argCount, argTypes, kind) => {
          var types = emval_lookupTypes(argCount, argTypes);
          var retType = types.shift();
          argCount--;
          var argN = new Array(argCount);
          var invokerFunction = (obj, func, destructorsRef, args) => {
            var offset = 0;
            for (var i = 0; i < argCount; ++i) {
              argN[i] = types[i]["readValueFromPointer"](args + offset);
              offset += types[i]["argPackAdvance"];
            }
            var rv = kind === 1 ? reflectConstruct(func, argN) : func.apply(obj, argN);
            return emval_returnValue(retType, destructorsRef, rv);
          };
          var functionName = `methodCaller<(${types.map((t) => t.name).join(", ")}) => ${retType.name}>`;
          return emval_addMethodCaller(createNamedFunction(functionName, invokerFunction));
        };
        var __emval_run_destructors = (handle) => {
          var destructors = Emval.toValue(handle);
          runDestructors(destructors);
          __emval_decref(handle);
        };
        var _abort = () => {
          abort("");
        };
        var readEmAsmArgsArray = [];
        var readEmAsmArgs = (sigPtr, buf) => {
          readEmAsmArgsArray.length = 0;
          var ch;
          while (ch = HEAPU8[sigPtr++]) {
            var wide = ch != 105;
            wide &= ch != 112;
            buf += wide && buf % 8 ? 4 : 0;
            readEmAsmArgsArray.push(ch == 112 ? HEAPU32[buf >> 2] : ch == 105 ? HEAP32[buf >> 2] : HEAPF64[buf >> 3]);
            buf += wide ? 8 : 4;
          }
          return readEmAsmArgsArray;
        };
        var runEmAsmFunction = (code, sigPtr, argbuf) => {
          var args = readEmAsmArgs(sigPtr, argbuf);
          return ASM_CONSTS[code](...args);
        };
        var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);
        var _emscripten_date_now = () => Date.now();
        var getHeapMax = () => 2147483648;
        var growMemory = (size) => {
          var b = wasmMemory.buffer;
          var pages = (size - b.byteLength + 65535) / 65536;
          try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return 1;
          } catch (e) {
          }
        };
        var _emscripten_resize_heap = (requestedSize) => {
          var oldSize = HEAPU8.length;
          requestedSize >>>= 0;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
            var replacement = growMemory(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        };
        var _fd_close = (fd) => 52;
        var _fd_read = (fd, iov, iovcnt, pnum) => 52;
        var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
        function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          return 70;
        }
        var printCharBuffers = [null, [], []];
        var printChar = (stream, curr) => {
          var buffer = printCharBuffers[stream];
          if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        };
        var _fd_write = (fd, iov, iovcnt, pnum) => {
          var num = 0;
          for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAPU32[iov >> 2];
            var len = HEAPU32[iov + 4 >> 2];
            iov += 8;
            for (var j = 0; j < len; j++) {
              printChar(fd, HEAPU8[ptr + j]);
            }
            num += len;
          }
          HEAPU32[pnum >> 2] = num;
          return 0;
        };
        InternalError = Module5["InternalError"] = class InternalError extends Error {
          constructor(message) {
            super(message);
            this.name = "InternalError";
          }
        };
        embind_init_charCodes();
        BindingError = Module5["BindingError"] = class BindingError extends Error {
          constructor(message) {
            super(message);
            this.name = "BindingError";
          }
        };
        init_emval();
        UnboundTypeError = Module5["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
        var wasmImports = { p: ___syscall_fcntl64, F: ___syscall_ioctl, G: ___syscall_openat, u: __embind_finalize_value_object, w: __embind_register_bigint, r: __embind_register_bool, M: __embind_register_emval, q: __embind_register_float, t: __embind_register_function, f: __embind_register_integer, b: __embind_register_memory_view, j: __embind_register_std_string, i: __embind_register_std_wstring, A: __embind_register_value_object, k: __embind_register_value_object_field, s: __embind_register_void, B: __emscripten_throw_longjmp, L: __emval_call, H: __emval_decref, N: __emval_get_global, K: __emval_get_method_caller, J: __emval_run_destructors, c: _abort, O: _emscripten_asm_const_int, I: _emscripten_date_now, C: _emscripten_resize_heap, o: _fd_close, E: _fd_read, v: _fd_seek, D: _fd_write, e: invoke_iii, g: invoke_iiiii, x: invoke_iiiiiiiiii, y: invoke_iiiiiiiiiii, z: invoke_iiiiiiiiiiii, h: invoke_vi, d: invoke_vii, l: invoke_viii, a: invoke_viiii, m: invoke_viiiii, n: invoke_viiiiii };
        var wasmExports = createWasm();
        var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["Q"])();
        var ___getTypeName = (a0) => (___getTypeName = wasmExports["R"])(a0);
        var _malloc = (a0) => (_malloc = wasmExports["S"])(a0);
        var _free = (a0) => (_free = wasmExports["T"])(a0);
        var _setThrew = (a0, a1) => (_setThrew = wasmExports["V"])(a0, a1);
        var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports["W"])(a0);
        var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);
        var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["X"])();
        var ___cxa_increment_exception_refcount = (a0) => (___cxa_increment_exception_refcount = wasmExports["__cxa_increment_exception_refcount"])(a0);
        var ___cxa_is_pointer_type = (a0) => (___cxa_is_pointer_type = wasmExports["__cxa_is_pointer_type"])(a0);
        var dynCall_jiiiiiiiii = Module5["dynCall_jiiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (dynCall_jiiiiiiiii = Module5["dynCall_jiiiiiiiii"] = wasmExports["Y"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        var dynCall_jiji = Module5["dynCall_jiji"] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module5["dynCall_jiji"] = wasmExports["Z"])(a0, a1, a2, a3, a4);
        var dynCall_iiijii = Module5["dynCall_iiijii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_iiijii = Module5["dynCall_iiijii"] = wasmExports["_"])(a0, a1, a2, a3, a4, a5, a6);
        var dynCall_jiiiiiiii = Module5["dynCall_jiiiiiiii"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) => (dynCall_jiiiiiiii = Module5["dynCall_jiiiiiiii"] = wasmExports["$"])(a0, a1, a2, a3, a4, a5, a6, a7, a8);
        var dynCall_jiiiiii = Module5["dynCall_jiiiiii"] = (a0, a1, a2, a3, a4, a5, a6) => (dynCall_jiiiiii = Module5["dynCall_jiiiiii"] = wasmExports["aa"])(a0, a1, a2, a3, a4, a5, a6);
        var dynCall_jiiiii = Module5["dynCall_jiiiii"] = (a0, a1, a2, a3, a4, a5) => (dynCall_jiiiii = Module5["dynCall_jiiiii"] = wasmExports["ba"])(a0, a1, a2, a3, a4, a5);
        function invoke_vi(index, a1) {
          var sp = stackSave();
          try {
            getWasmTableEntry(index)(a1);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_vii(index, a1, a2) {
          var sp = stackSave();
          try {
            getWasmTableEntry(index)(a1, a2);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_iiiii(index, a1, a2, a3, a4) {
          var sp = stackSave();
          try {
            return getWasmTableEntry(index)(a1, a2, a3, a4);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_iii(index, a1, a2) {
          var sp = stackSave();
          try {
            return getWasmTableEntry(index)(a1, a2);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
          var sp = stackSave();
          try {
            return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_viiii(index, a1, a2, a3, a4) {
          var sp = stackSave();
          try {
            getWasmTableEntry(index)(a1, a2, a3, a4);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
          var sp = stackSave();
          try {
            return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
          var sp = stackSave();
          try {
            getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_viiiii(index, a1, a2, a3, a4, a5) {
          var sp = stackSave();
          try {
            getWasmTableEntry(index)(a1, a2, a3, a4, a5);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_viii(index, a1, a2, a3) {
          var sp = stackSave();
          try {
            getWasmTableEntry(index)(a1, a2, a3);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          var sp = stackSave();
          try {
            return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
          } catch (e) {
            stackRestore(sp);
            if (e !== e + 0) throw e;
            _setThrew(1, 0);
          }
        }
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          if (!calledRun) run();
          if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run() {
          if (runDependencies > 0) {
            return;
          }
          preRun();
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            if (calledRun) return;
            calledRun = true;
            Module5["calledRun"] = true;
            if (ABORT) return;
            initRuntime();
            readyPromiseResolve(Module5);
            if (Module5["onRuntimeInitialized"]) Module5["onRuntimeInitialized"]();
            postRun();
          }
          if (Module5["setStatus"]) {
            Module5["setStatus"]("Running...");
            setTimeout(function() {
              setTimeout(function() {
                Module5["setStatus"]("");
              }, 1);
              doRun();
            }, 1);
          } else {
            doRun();
          }
        }
        if (Module5["preInit"]) {
          if (typeof Module5["preInit"] == "function") Module5["preInit"] = [Module5["preInit"]];
          while (Module5["preInit"].length > 0) {
            Module5["preInit"].pop()();
          }
        }
        run();
        return readyPromise;
      });
    })();
    avif_enc_default = Module4;
  }
});

// node_modules/@jsquash/oxipng/codec/pkg/squoosh_oxipng.js
var squoosh_oxipng_exports = {};
__export(squoosh_oxipng_exports, {
  default: () => squoosh_oxipng_default,
  initSync: () => initSync,
  optimise: () => optimise,
  optimise_raw: () => optimise_raw
});
function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
function optimise(data, level, interlace, optimize_alpha) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.optimise(retptr, ptr0, len0, level, interlace, optimize_alpha);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var v2 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1, 1);
    return v2;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function optimise_raw(data, width, height, level, interlace, optimize_alpha) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.optimise_raw(retptr, ptr0, len0, width, height, level, interlace, optimize_alpha);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var v2 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1, 1);
    return v2;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  return imports;
}
function __wbg_init_memory(imports, maybe_memory) {
}
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;
  return wasm;
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  const imports = __wbg_get_imports();
  __wbg_init_memory(imports);
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(input) {
  if (wasm !== void 0) return wasm;
  if (typeof input === "undefined") {
    input = new URL("squoosh_oxipng_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
    input = fetch(input);
  }
  __wbg_init_memory(imports);
  const { instance, module } = await __wbg_load(await input, imports);
  return __wbg_finalize_init(instance, module);
}
var wasm, cachedTextDecoder, cachedUint8Memory0, WASM_VECTOR_LEN, cachedInt32Memory0, squoosh_oxipng_default, isServiceWorker, isRunningInCloudFlareWorkers, isRunningInNode;
var init_squoosh_oxipng = __esm({
  "node_modules/@jsquash/oxipng/codec/pkg/squoosh_oxipng.js"() {
    cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
      throw Error("TextDecoder not available");
    } };
    if (typeof TextDecoder !== "undefined") {
      cachedTextDecoder.decode();
    }
    cachedUint8Memory0 = null;
    WASM_VECTOR_LEN = 0;
    cachedInt32Memory0 = null;
    squoosh_oxipng_default = __wbg_init;
    isServiceWorker = globalThis.ServiceWorkerGlobalScope !== void 0;
    isRunningInCloudFlareWorkers = isServiceWorker && typeof self !== "undefined" && globalThis.caches && globalThis.caches.default !== void 0;
    isRunningInNode = typeof process === "object" && process.release && process.release.name === "node";
    if (isRunningInCloudFlareWorkers || isRunningInNode) {
      if (!globalThis.ImageData) {
        globalThis.ImageData = class ImageData {
          constructor(data, width, height) {
            this.data = data;
            this.width = width;
            this.height = height;
          }
        };
      }
      if (import.meta.url === void 0) {
        import.meta.url = "https://localhost";
      }
      if (typeof self !== "undefined" && self.location === void 0) {
        self.location = { href: "" };
      }
    }
  }
});

// scripts/worker-src/image-compress.worker.mjs
var WASM_BASE = "/wasm/";
var WASM_FILES = {
  jpeg: "mozjpeg_enc.wasm",
  webp: "webp_enc.wasm",
  avif: "avif_enc.wasm",
  png: "squoosh_oxipng_bg.wasm"
};
self.addEventListener(
  "error",
  (e) => self.postMessage({ type: "error", id: -1, message: "Worker error: " + (e.message || e.error || "unknown") })
);
self.addEventListener(
  "unhandledrejection",
  (e) => self.postMessage({ type: "error", id: -1, message: "Unhandled rejection: " + (e.reason && e.reason.message ? e.reason.message : String(e.reason)) })
);
var moduleCache = {};
async function loadWasmModule(name) {
  if (moduleCache[name]) return moduleCache[name];
  const res = await fetch(WASM_BASE + WASM_FILES[name]);
  if (!res.ok) throw new Error(`Failed to fetch ${WASM_FILES[name]} (HTTP ${res.status})`);
  const buf = await res.arrayBuffer();
  const mod = await WebAssembly.compile(buf);
  moduleCache[name] = mod;
  return mod;
}
var codecCache = {};
async function getModule(format) {
  if (codecCache[format]) return codecCache[format];
  if (format === "jpeg") {
    const wm = await loadWasmModule("jpeg");
    const { default: encode3, init: init4 } = await Promise.resolve().then(() => (init_encode(), encode_exports));
    await init4(wm);
    return codecCache.jpeg = { encode: encode3 };
  }
  if (format === "webp") {
    const wm = await loadWasmModule("webp");
    const { default: encode3, init: init4 } = await Promise.resolve().then(() => (init_encode2(), encode_exports2));
    await init4(wm);
    return codecCache.webp = { encode: encode3 };
  }
  if (format === "avif") {
    const res2 = await fetch(WASM_BASE + WASM_FILES.avif);
    if (!res2.ok) throw new Error(`Failed to fetch ${WASM_FILES.avif} (HTTP ${res2.status})`);
    const buf2 = await res2.arrayBuffer();
    const { default: avifEnc } = await Promise.resolve().then(() => (init_avif_enc(), avif_enc_exports));
    const mod = await avifEnc({ wasmBinary: buf2 });
    return codecCache.avif = { mod };
  }
  const res = await fetch(WASM_BASE + WASM_FILES.png);
  if (!res.ok) throw new Error(`Failed to fetch ${WASM_FILES.png} (HTTP ${res.status})`);
  const buf = await res.arrayBuffer();
  const { default: init3, optimise: optimise2 } = await Promise.resolve().then(() => (init_squoosh_oxipng(), squoosh_oxipng_exports));
  await init3(buf);
  return codecCache.png = { optimise: optimise2 };
}
function mimeFor(format) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  if (format === "png") return "image/png";
  return "application/octet-stream";
}
var AVIF_DEFAULTS = {
  quality: 50,
  qualityAlpha: -1,
  denoiseLevel: 0,
  tileColsLog2: 0,
  tileRowsLog2: 0,
  speed: 6,
  subsample: 1,
  chromaDeltaQ: false,
  sharpness: 0,
  tune: 0,
  enableSharpYUV: false,
  bitDepth: 8,
  lossless: false
};
async function compress(req) {
  const { format, imageData, options } = req;
  const opts = options || {};
  self.postMessage({ type: "progress", id: req.id, stage: "loading" });
  const codec = await getModule(format);
  self.postMessage({ type: "progress", id: req.id, stage: "encoding" });
  let out;
  if (format === "jpeg") {
    out = await codec.encode(imageData, { quality: opts.quality != null ? opts.quality : 75 });
  } else if (format === "webp") {
    out = await codec.encode(imageData, {
      quality: opts.quality != null ? opts.quality : 75,
      lossless: Boolean(opts.lossless)
    });
  } else if (format === "avif") {
    out = await codec.mod.encode(
      new Uint8Array(imageData.data.buffer),
      imageData.width,
      imageData.height,
      { ...AVIF_DEFAULTS, quality: opts.quality != null ? opts.quality : 50 }
    );
  } else {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const pngBytes = await blob.arrayBuffer();
    out = await codec.optimise(new Uint8Array(pngBytes), opts.level != null ? opts.level : 2, false, false);
  }
  return out && out.buffer ? out.buffer : out;
}
self.onmessage = async (e) => {
  const req = e.data;
  if (!req || req.type !== "compress") return;
  try {
    const buffer = await compress(req);
    self.postMessage(
      { type: "done", id: req.id, buffer, mime: mimeFor(req.format), format: req.format },
      [buffer]
    );
  } catch (err) {
    self.postMessage({
      type: "error",
      id: req.id,
      message: err instanceof Error ? err.message : String(err)
    });
  }
};

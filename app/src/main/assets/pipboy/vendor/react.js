;(function(){var __r=window.React,__rd=window.ReactDOM;/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.React = {}));
}(this, (function (exports) { 'use strict';

  var ReactVersion = '18.3.1';

  // ATTENTION
  // When adding new symbols to this file,
  // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
  // The Symbol used to tag the ReactElement-like types.
  var REACT_ELEMENT_TYPE = Symbol.for('react.element');
  var REACT_PORTAL_TYPE = Symbol.for('react.portal');
  var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
  var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
  var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
  var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
  var REACT_CONTEXT_TYPE = Symbol.for('react.context');
  var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
  var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
  var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
  var REACT_MEMO_TYPE = Symbol.for('react.memo');
  var REACT_LAZY_TYPE = Symbol.for('react.lazy');
  var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';
  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== 'object') {
      return null;
    }

    var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

    if (typeof maybeIterator === 'function') {
      return maybeIterator;
    }

    return null;
  }

  /**
   * Keeps track of the current dispatcher.
   */
  var ReactCurrentDispatcher = {
    /**
     * @internal
     * @type {ReactComponent}
     */
    current: null
  };

  /**
   * Keeps track of the current batch's configuration such as how long an update
   * should suspend for if it needs to.
   */
  var ReactCurrentBatchConfig = {
    transition: null
  };

  var ReactCurrentActQueue = {
    current: null,
    // Used to reproduce behavior of `batchedUpdates` in legacy mode.
    isBatchingLegacy: false,
    didScheduleLegacyUpdate: false
  };

  /**
   * Keeps track of the current owner.
   *
   * The current owner is the component who should own any components that are
   * currently being constructed.
   */
  var ReactCurrentOwner = {
    /**
     * @internal
     * @type {ReactComponent}
     */
    current: null
  };

  var ReactDebugCurrentFrame = {};
  var currentExtraStackFrame = null;
  function setExtraStackFrame(stack) {
    {
      currentExtraStackFrame = stack;
    }
  }

  {
    ReactDebugCurrentFrame.setExtraStackFrame = function (stack) {
      {
        currentExtraStackFrame = stack;
      }
    }; // Stack implementation injected by the current renderer.


    ReactDebugCurrentFrame.getCurrentStack = null;

    ReactDebugCurrentFrame.getStackAddendum = function () {
      var stack = ''; // Add an extra top frame while an element is being validated

      if (currentExtraStackFrame) {
        stack += currentExtraStackFrame;
      } // Delegate to the injected renderer-specific implementation


      var impl = ReactDebugCurrentFrame.getCurrentStack;

      if (impl) {
        stack += impl() || '';
      }

      return stack;
    };
  }

  // -----------------------------------------------------------------------------

  var enableScopeAPI = false; // Experimental Create Event Handle API.
  var enableCacheElement = false;
  var enableTransitionTracing = false; // No known bugs, but needs performance testing

  var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
  // stuff. Intended to enable React core members to more easily debug scheduling
  // issues in DEV builds.

  var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

  var ReactSharedInternals = {
    ReactCurrentDispatcher: ReactCurrentDispatcher,
    ReactCurrentBatchConfig: ReactCurrentBatchConfig,
    ReactCurrentOwner: ReactCurrentOwner
  };

  {
    ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
    ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
  }

  // by calls to these methods by a Babel plugin.
  //
  // In PROD (or in packages without access to React internals),
  // they are left as they are instead.

  function warn(format) {
    {
      {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        printWarning('warn', format, args);
      }
    }
  }
  function error(format) {
    {
      {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        printWarning('error', format, args);
      }
    }
  }

  function printWarning(level, format, args) {
    // When changing this logic, you might want to also
    // update consoleWithStackDev.www.js as well.
    {
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      var stack = ReactDebugCurrentFrame.getStackAddendum();

      if (stack !== '') {
        format += '%s';
        args = args.concat([stack]);
      } // eslint-disable-next-line react-internal/safe-string-coercion


      var argsWithFormat = args.map(function (item) {
        return String(item);
      }); // Careful: RN currently depends on this prefix

      argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
      // breaks IE9: https://github.com/facebook/react/issues/13610
      // eslint-disable-next-line react-internal/no-production-logging

      Function.prototype.apply.call(console[level], console, argsWithFormat);
    }
  }

  var didWarnStateUpdateForUnmountedComponent = {};

  function warnNoop(publicInstance, callerName) {
    {
      var _constructor = publicInstance.constructor;
      var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
      var warningKey = componentName + "." + callerName;

      if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
        return;
      }

      error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);

      didWarnStateUpdateForUnmountedComponent[warningKey] = true;
    }
  }
  /**
   * This is the abstract API for an update queue.
   */


  var ReactNoopUpdateQueue = {
    /**
     * Checks whether or not this composite component is mounted.
     * @param {ReactClass} publicInstance The instance we want to test.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function (publicInstance) {
      return false;
    },

    /**
     * Forces an update. This should only be invoked when it is known with
     * certainty that we are **not** in a DOM transaction.
     *
     * You may want to call this when you know that some deeper aspect of the
     * component's state has changed but `setState` was not called.
     *
     * This will not invoke `shouldComponentUpdate`, but it will invoke
     * `componentWillUpdate` and `componentDidUpdate`.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {?function} callback Called after component is updated.
     * @param {?string} callerName name of the calling function in the public API.
     * @internal
     */
    enqueueForceUpdate: function (publicInstance, callback, callerName) {
      warnNoop(publicInstance, 'forceUpdate');
    },

    /**
     * Replaces all of the state. Always use this or `setState` to mutate state.
     * You should treat `this.state` as immutable.
     *
     * There is no guarantee that `this.state` will be immediately updated, so
     * accessing `this.state` after calling this method may return the old value.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {object} completeState Next state.
     * @param {?function} callback Called after component is updated.
     * @param {?string} callerName name of the calling function in the public API.
     * @internal
     */
    enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
      warnNoop(publicInstance, 'replaceState');
    },

    /**
     * Sets a subset of the state. This only exists because _pendingState is
     * internal. This provides a merging strategy that is not available to deep
     * properties which is confusing. TODO: Expose pendingState or don't use it
     * during the merge.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {object} partialState Next partial state to be merged with state.
     * @param {?function} callback Called after component is updated.
     * @param {?string} Name of the calling function in the public API.
     * @internal
     */
    enqueueSetState: function (publicInstance, partialState, callback, callerName) {
      warnNoop(publicInstance, 'setState');
    }
  };

  var assign = Object.assign;

  var emptyObject = {};

  {
    Object.freeze(emptyObject);
  }
  /**
   * Base class helpers for the updating state of a component.
   */


  function Component(props, context, updater) {
    this.props = props;
    this.context = context; // If a component has string refs, we will assign a different object later.

    this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
    // renderer.

    this.updater = updater || ReactNoopUpdateQueue;
  }

  Component.prototype.isReactComponent = {};
  /**
   * Sets a subset of the state. Always use this to mutate
   * state. You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * There is no guarantee that calls to `setState` will run synchronously,
   * as they may eventually be batched together.  You can provide an optional
   * callback that will be executed when the call to setState is actually
   * completed.
   *
   * When a function is provided to setState, it will be called at some point in
   * the future (not synchronously). It will be called with the up to date
   * component arguments (state, props, context). These values can be different
   * from this.* because your function may be called after receiveProps but before
   * shouldComponentUpdate, and this new state, props, and context will not yet be
   * assigned to this.
   *
   * @param {object|function} partialState Next partial state or function to
   *        produce next partial state to be merged with current state.
   * @param {?function} callback Called after state is updated.
   * @final
   * @protected
   */

  Component.prototype.setState = function (partialState, callback) {
    if (typeof partialState !== 'object' && typeof partialState !== 'function' && partialState != null) {
      throw new Error('setState(...): takes an object of state variables to update or a ' + 'function which returns an object of state variables.');
    }

    this.updater.enqueueSetState(this, partialState, callback, 'setState');
  };
  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {?function} callback Called after update is complete.
   * @final
   * @protected
   */


  Component.prototype.forceUpdate = function (callback) {
    this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
  };
  /**
   * Deprecated APIs. These APIs used to exist on classic React classes but since
   * we would like to deprecate them, we're not going to move them over to this
   * modern base class. Instead, we define a getter that warns if it's accessed.
   */


  {
    var deprecatedAPIs = {
      isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
      replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
    };

    var defineDeprecationWarning = function (methodName, info) {
      Object.defineProperty(Component.prototype, methodName, {
        get: function () {
          warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);

          return undefined;
        }
      });
    };

    for (var fnName in deprecatedAPIs) {
      if (deprecatedAPIs.hasOwnProperty(fnName)) {
        defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      }
    }
  }

  function ComponentDummy() {}

  ComponentDummy.prototype = Component.prototype;
  /**
   * Convenience component with default shallow equality check for sCU.
   */

  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context; // If a component has string refs, we will assign a different object later.

    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }

  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;

  // an immutable object with a single mutable value
  function createRef() {
    var refObject = {
      current: null
    };

    {
      Object.seal(refObject);
    }

    return refObject;
  }

  var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

  function isArray(a) {
    return isArrayImpl(a);
  }

  /*
   * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
   * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
   *
   * The functions in this module will throw an easier-to-understand,
   * easier-to-debug exception with a clear errors message message explaining the
   * problem. (Instead of a confusing exception thrown inside the implementation
   * of the `value` object).
   */
  // $FlowFixMe only called in DEV, so void return is not possible.
  function typeName(value) {
    {
      // toStringTag is needed for namespaced types like Temporal.Instant
      var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
      var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
      return type;
    }
  } // $FlowFixMe only called in DEV, so void return is not possible.


  function willCoercionThrow(value) {
    {
      try {
        testStringCoercion(value);
        return false;
      } catch (e) {
        return true;
      }
    }
  }

  function testStringCoercion(value) {
    // If you ended up here by following an exception call stack, here's what's
    // happened: you supplied an object or symbol value to React (as a prop, key,
    // DOM attribute, CSS property, string ref, etc.) and when React tried to
    // coerce it to a string using `'' + value`, an exception was thrown.
    //
    // The most common types that will cause this exception are `Symbol` instances
    // and Temporal objects like `Temporal.Instant`. But any object that has a
    // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
    // exception. (Library authors do this to prevent users from using built-in
    // numeric operators like `+` or comparison operators like `>=` because custom
    // methods are needed to perform accurate arithmetic or comparison.)
    //
    // To fix the problem, coerce this object or symbol value to a string before
    // passing it to React. The most reliable way is usually `String(value)`.
    //
    // To find which value is throwing, check the browser or debugger console.
    // Before this exception was thrown, there should be `console.error` output
    // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
    // problem and how that type was used: key, atrribute, input value prop, etc.
    // In most cases, this console output also shows the component and its
    // ancestor components where the exception happened.
    //
    // eslint-disable-next-line react-internal/safe-string-coercion
    return '' + value;
  }
  function checkKeyStringCoercion(value) {
    {
      if (willCoercionThrow(value)) {
        error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }

  function getWrappedName(outerType, innerType, wrapperName) {
    var displayName = outerType.displayName;

    if (displayName) {
      return displayName;
    }

    var functionName = innerType.displayName || innerType.name || '';
    return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
  } // Keep in sync with react-reconciler/getComponentNameFromFiber


  function getContextName(type) {
    return type.displayName || 'Context';
  } // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


  function getComponentNameFromType(type) {
    if (type == null) {
      // Host root, text node or just invalid type.
      return null;
    }

    {
      if (typeof type.tag === 'number') {
        error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
      }
    }

    if (typeof type === 'function') {
      return type.displayName || type.name || null;
    }

    if (typeof type === 'string') {
      return type;
    }

    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return 'Fragment';

      case REACT_PORTAL_TYPE:
        return 'Portal';

      case REACT_PROFILER_TYPE:
        return 'Profiler';

      case REACT_STRICT_MODE_TYPE:
        return 'StrictMode';

      case REACT_SUSPENSE_TYPE:
        return 'Suspense';

      case REACT_SUSPENSE_LIST_TYPE:
        return 'SuspenseList';

    }

    if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_CONTEXT_TYPE:
          var context = type;
          return getContextName(context) + '.Consumer';

        case REACT_PROVIDER_TYPE:
          var provider = type;
          return getContextName(provider._context) + '.Provider';

        case REACT_FORWARD_REF_TYPE:
          return getWrappedName(type, type.render, 'ForwardRef');

        case REACT_MEMO_TYPE:
          var outerName = type.displayName || null;

          if (outerName !== null) {
            return outerName;
          }

          return getComponentNameFromType(type.type) || 'Memo';

        case REACT_LAZY_TYPE:
          {
            var lazyComponent = type;
            var payload = lazyComponent._payload;
            var init = lazyComponent._init;

            try {
              return getComponentNameFromType(init(payload));
            } catch (x) {
              return null;
            }
          }

        // eslint-disable-next-line no-fallthrough
      }
    }

    return null;
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;

  {
    didWarnAboutStringRefs = {};
  }

  function hasValidRef(config) {
    {
      if (hasOwnProperty.call(config, 'ref')) {
        var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }

    return config.ref !== undefined;
  }

  function hasValidKey(config) {
    {
      if (hasOwnProperty.call(config, 'key')) {
        var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

        if (getter && getter.isReactWarning) {
          return false;
        }
      }
    }

    return config.key !== undefined;
  }

  function defineKeyPropWarningGetter(props, displayName) {
    var warnAboutAccessingKey = function () {
      {
        if (!specialPropKeyWarningShown) {
          specialPropKeyWarningShown = true;

          error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
        }
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }

  function defineRefPropWarningGetter(props, displayName) {
    var warnAboutAccessingRef = function () {
      {
        if (!specialPropRefWarningShown) {
          specialPropRefWarningShown = true;

          error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
        }
      }
    };

    warnAboutAccessingRef.isReactWarning = true;
    Object.defineProperty(props, 'ref', {
      get: warnAboutAccessingRef,
      configurable: true
    });
  }

  function warnIfStringRefCannotBeAutoConverted(config) {
    {
      if (typeof config.ref === 'string' && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
        var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

        if (!didWarnAboutStringRefs[componentName]) {
          error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);

          didWarnAboutStringRefs[componentName] = true;
        }
      }
    }
  }
  /**
   * Factory method to create a new React element. This no longer adheres to
   * the class pattern, so do not use new to call it. Also, instanceof check
   * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
   * if something is a React Element.
   *
   * @param {*} type
   * @param {*} props
   * @param {*} key
   * @param {string|object} ref
   * @param {*} owner
   * @param {*} self A *temporary* helper to detect places where `this` is
   * different from the `owner` when React.createElement is called, so that we
   * can warn. We want to get rid of owner and replace string `ref`s with arrow
   * functions, and as long as `this` and owner are the same, there will be no
   * change in behavior.
   * @param {*} source An annotation object (added by a transpiler or otherwise)
   * indicating filename, line number, and/or other information.
   * @internal
   */


  var ReactElement = function (type, key, ref, self, source, owner, props) {
    var element = {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      // Built-in properties that belong on the element
      type: type,
      key: key,
      ref: ref,
      props: props,
      // Record the component responsible for creating this element.
      _owner: owner
    };

    {
      // The validation flag is currently mutative. We put it on
      // an external backing store so that we can freeze the whole object.
      // This can be replaced with a WeakMap once they are implemented in
      // commonly used development environments.
      element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
      // the validation flag non-enumerable (where possible, which should
      // include every environment we run tests in), so the test framework
      // ignores it.

      Object.defineProperty(element._store, 'validated', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      }); // self and source are DEV only properties.

      Object.defineProperty(element, '_self', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self
      }); // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.

      Object.defineProperty(element, '_source', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source
      });

      if (Object.freeze) {
        Object.freeze(element.props);
        Object.freeze(element);
      }
    }

    return element;
  };
  /**
   * Create and return a new ReactElement of the given type.
   * See https://reactjs.org/docs/react-api.html#createelement
   */

  function createElement(type, config, children) {
    var propName; // Reserved names are extracted

    var props = {};
    var key = null;
    var ref = null;
    var self = null;
    var source = null;

    if (config != null) {
      if (hasValidRef(config)) {
        ref = config.ref;

        {
          warnIfStringRefCannotBeAutoConverted(config);
        }
      }

      if (hasValidKey(config)) {
        {
          checkKeyStringCoercion(config.key);
        }

        key = '' + config.key;
      }

      self = config.__self === undefined ? null : config.__self;
      source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

      for (propName in config) {
        if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
          props[propName] = config[propName];
        }
      }
    } // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.


    var childrenLength = arguments.length - 2;

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }

      {
        if (Object.freeze) {
          Object.freeze(childArray);
        }
      }

      props.children = childArray;
    } // Resolve default props


    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;

      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    {
      if (key || ref) {
        var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }

        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }

    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
    return newElement;
  }
  /**
   * Clone and return a new ReactElement using element as the starting point.
   * See https://reactjs.org/docs/react-api.html#cloneelement
   */

  function cloneElement(element, config, children) {
    if (element === null || element === undefined) {
      throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
    }

    var propName; // Original props are copied

    var props = assign({}, element.props); // Reserved names are extracted

    var key = element.key;
    var ref = element.ref; // Self is preserved since the owner is preserved.

    var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
    // transpiler, and the original source is probably a better indicator of the
    // true owner.

    var source = element._source; // Owner will be preserved, unless ref is overridden

    var owner = element._owner;

    if (config != null) {
      if (hasValidRef(config)) {
        // Silently steal the ref from the parent.
        ref = config.ref;
        owner = ReactCurrentOwner.current;
      }

      if (hasValidKey(config)) {
        {
          checkKeyStringCoercion(config.key);
        }

        key = '' + config.key;
      } // Remaining properties override existing props


      var defaultProps;

      if (element.type && element.type.defaultProps) {
        defaultProps = element.type.defaultProps;
      }

      for (propName in config) {
        if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
          if (config[propName] === undefined && defaultProps !== undefined) {
            // Resolve default props
            props[propName] = defaultProps[propName];
          } else {
            props[propName] = config[propName];
          }
        }
      }
    } // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.


    var childrenLength = arguments.length - 2;

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }

      props.children = childArray;
    }

    return ReactElement(element.type, key, ref, self, source, owner, props);
  }
  /**
   * Verifies the object is a ReactElement.
   * See https://reactjs.org/docs/react-api.html#isvalidelement
   * @param {?object} object
   * @return {boolean} True if `object` is a ReactElement.
   * @final
   */

  function isValidElement(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }

  var SEPARATOR = '.';
  var SUBSEPARATOR = ':';
  /**
   * Escape and wrap key so it is safe to use as a reactid
   *
   * @param {string} key to be escaped.
   * @return {string} the escaped key.
   */

  function escape(key) {
    var escapeRegex = /[=:]/g;
    var escaperLookup = {
      '=': '=0',
      ':': '=2'
    };
    var escapedString = key.replace(escapeRegex, function (match) {
      return escaperLookup[match];
    });
    return '$' + escapedString;
  }
  /**
   * TODO: Test that a single child and an array with one item have the same key
   * pattern.
   */


  var didWarnAboutMaps = false;
  var userProvidedKeyEscapeRegex = /\/+/g;

  function escapeUserProvidedKey(text) {
    return text.replace(userProvidedKeyEscapeRegex, '$&/');
  }
  /**
   * Generate a key string that identifies a element within a set.
   *
   * @param {*} element A element that could contain a manual key.
   * @param {number} index Index that is used if a manual key is not provided.
   * @return {string}
   */


  function getElementKey(element, index) {
    // Do some typechecking here since we call this blindly. We want to ensure
    // that we don't block potential future ES APIs.
    if (typeof element === 'object' && element !== null && element.key != null) {
      // Explicit key
      {
        checkKeyStringCoercion(element.key);
      }

      return escape('' + element.key);
    } // Implicit key determined by the index in the set


    return index.toString(36);
  }

  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;

    if (type === 'undefined' || type === 'boolean') {
      // All of the above are perceived as null.
      children = null;
    }

    var invokeCallback = false;

    if (children === null) {
      invokeCallback = true;
    } else {
      switch (type) {
        case 'string':
        case 'number':
          invokeCallback = true;
          break;

        case 'object':
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
          }

      }
    }

    if (invokeCallback) {
      var _child = children;
      var mappedChild = callback(_child); // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows:

      var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;

      if (isArray(mappedChild)) {
        var escapedChildKey = '';

        if (childKey != null) {
          escapedChildKey = escapeUserProvidedKey(childKey) + '/';
        }

        mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
          return c;
        });
      } else if (mappedChild != null) {
        if (isValidElement(mappedChild)) {
          {
            // The `if` statement here prevents auto-disabling of the safe
            // coercion ESLint rule, so we must manually disable it below.
            // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
              checkKeyStringCoercion(mappedChild.key);
            }
          }

          mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
          // traverseAllChildren used to do for objects as children
          escapedPrefix + ( // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
          mappedChild.key && (!_child || _child.key !== mappedChild.key) ? // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
          // eslint-disable-next-line react-internal/safe-string-coercion
          escapeUserProvidedKey('' + mappedChild.key) + '/' : '') + childKey);
        }

        array.push(mappedChild);
      }

      return 1;
    }

    var child;
    var nextName;
    var subtreeCount = 0; // Count of children found in the current subtree.

    var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

    if (isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        nextName = nextNamePrefix + getElementKey(child, i);
        subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
      }
    } else {
      var iteratorFn = getIteratorFn(children);

      if (typeof iteratorFn === 'function') {
        var iterableChildren = children;

        {
          // Warn about using Maps as children
          if (iteratorFn === iterableChildren.entries) {
            if (!didWarnAboutMaps) {
              warn('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
            }

            didWarnAboutMaps = true;
          }
        }

        var iterator = iteratorFn.call(iterableChildren);
        var step;
        var ii = 0;

        while (!(step = iterator.next()).done) {
          child = step.value;
          nextName = nextNamePrefix + getElementKey(child, ii++);
          subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
        }
      } else if (type === 'object') {
        // eslint-disable-next-line react-internal/safe-string-coercion
        var childrenString = String(children);
        throw new Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
      }
    }

    return subtreeCount;
  }

  /**
   * Maps children that are typically specified as `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenmap
   *
   * The provided mapFunction(child, index) will be called for each
   * leaf child.
   *
   * @param {?*} children Children tree container.
   * @param {function(*, int)} func The map function.
   * @param {*} context Context for mapFunction.
   * @return {object} Object containing the ordered map of results.
   */
  function mapChildren(children, func, context) {
    if (children == null) {
      return children;
    }

    var result = [];
    var count = 0;
    mapIntoArray(children, result, '', '', function (child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  /**
   * Count the number of children that are typically specified as
   * `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrencount
   *
   * @param {?*} children Children tree container.
   * @return {number} The number of children.
   */


  function countChildren(children) {
    var n = 0;
    mapChildren(children, function () {
      n++; // Don't return anything
    });
    return n;
  }

  /**
   * Iterates through children that are typically specified as `props.children`.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
   *
   * The provided forEachFunc(child, index) will be called for each
   * leaf child.
   *
   * @param {?*} children Children tree container.
   * @param {function(*, int)} forEachFunc
   * @param {*} forEachContext Context for forEachContext.
   */
  function forEachChildren(children, forEachFunc, forEachContext) {
    mapChildren(children, function () {
      forEachFunc.apply(this, arguments); // Don't return anything.
    }, forEachContext);
  }
  /**
   * Flatten a children object (typically specified as `props.children`) and
   * return an array with appropriately re-keyed children.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
   */


  function toArray(children) {
    return mapChildren(children, function (child) {
      return child;
    }) || [];
  }
  /**
   * Returns the first child in a collection of children and verifies that there
   * is only one child in the collection.
   *
   * See https://reactjs.org/docs/react-api.html#reactchildrenonly
   *
   * The current implementation of this function assumes that a single child gets
   * passed without a wrapper, but the purpose of this helper function is to
   * abstract away the particular structure of children.
   *
   * @param {?object} children Child collection structure.
   * @return {ReactElement} The first and only `ReactElement` contained in the
   * structure.
   */


  function onlyChild(children) {
    if (!isValidElement(children)) {
      throw new Error('React.Children.only expected to receive a single React element child.');
    }

    return children;
  }

  function createContext(defaultValue) {
    // TODO: Second argument used to be an optional `calculateChangedBits`
    // function. Warn to reserve for future use?
    var context = {
      $$typeof: REACT_CONTEXT_TYPE,
      // As a workaround to support multiple concurrent renderers, we categorize
      // some renderers as primary and others as secondary. We only expect
      // there to be two concurrent renderers at most: React Native (primary) and
      // Fabric (secondary); React DOM (primary) and React ART (secondary).
      // Secondary renderers store their context values on separate fields.
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      // Used to track how many concurrent renderers this context currently
      // supports within in a single renderer. Such as parallel server rendering.
      _threadCount: 0,
      // These are circular
      Provider: null,
      Consumer: null,
      // Add these to use same hidden class in VM as ServerContext
      _defaultValue: null,
      _globalName: null
    };
    context.Provider = {
      $$typeof: REACT_PROVIDER_TYPE,
      _context: context
    };
    var hasWarnedAboutUsingNestedContextConsumers = false;
    var hasWarnedAboutUsingConsumerProvider = false;
    var hasWarnedAboutDisplayNameOnConsumer = false;

    {
      // A separate object, but proxies back to the original context object for
      // backwards compatibility. It has a different $$typeof, so we can properly
      // warn for the incorrect usage of Context as a Consumer.
      var Consumer = {
        $$typeof: REACT_CONTEXT_TYPE,
        _context: context
      }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

      Object.defineProperties(Consumer, {
        Provider: {
          get: function () {
            if (!hasWarnedAboutUsingConsumerProvider) {
              hasWarnedAboutUsingConsumerProvider = true;

              error('Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
            }

            return context.Provider;
          },
          set: function (_Provider) {
            context.Provider = _Provider;
          }
        },
        _currentValue: {
          get: function () {
            return context._currentValue;
          },
          set: function (_currentValue) {
            context._currentValue = _currentValue;
          }
        },
        _currentValue2: {
          get: function () {
            return context._currentValue2;
          },
          set: function (_currentValue2) {
            context._currentValue2 = _currentValue2;
          }
        },
        _threadCount: {
          get: function () {
            return context._threadCount;
          },
          set: function (_threadCount) {
            context._threadCount = _threadCount;
          }
        },
        Consumer: {
          get: function () {
            if (!hasWarnedAboutUsingNestedContextConsumers) {
              hasWarnedAboutUsingNestedContextConsumers = true;

              error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
            }

            return context.Consumer;
          }
        },
        displayName: {
          get: function () {
            return context.displayName;
          },
          set: function (displayName) {
            if (!hasWarnedAboutDisplayNameOnConsumer) {
              warn('Setting `displayName` on Context.Consumer has no effect. ' + "You should set it directly on the context with Context.displayName = '%s'.", displayName);

              hasWarnedAboutDisplayNameOnConsumer = true;
            }
          }
        }
      }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

      context.Consumer = Consumer;
    }

    {
      context._currentRenderer = null;
      context._currentRenderer2 = null;
    }

    return context;
  }

  var Uninitialized = -1;
  var Pending = 0;
  var Resolved = 1;
  var Rejected = 2;

  function lazyInitializer(payload) {
    if (payload._status === Uninitialized) {
      var ctor = payload._result;
      var thenable = ctor(); // Transition to the next state.
      // This might throw either because it's missing or throws. If so, we treat it
      // as still uninitialized and try again next time. Which is the same as what
      // happens if the ctor or any wrappers processing the ctor throws. This might
      // end up fixing it if the resolution was a concurrency bug.

      thenable.then(function (moduleObject) {
        if (payload._status === Pending || payload._status === Uninitialized) {
          // Transition to the next state.
          var resolved = payload;
          resolved._status = Resolved;
          resolved._result = moduleObject;
        }
      }, function (error) {
        if (payload._status === Pending || payload._status === Uninitialized) {
          // Transition to the next state.
          var rejected = payload;
          rejected._status = Rejected;
          rejected._result = error;
        }
      });

      if (payload._status === Uninitialized) {
        // In case, we're still uninitialized, then we're waiting for the thenable
        // to resolve. Set it as pending in the meantime.
        var pending = payload;
        pending._status = Pending;
        pending._result = thenable;
      }
    }

    if (payload._status === Resolved) {
      var moduleObject = payload._result;

      {
        if (moduleObject === undefined) {
          error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
          'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))\n\n" + 'Did you accidentally put curly braces around the import?', moduleObject);
        }
      }

      {
        if (!('default' in moduleObject)) {
          error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
          'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
        }
      }

      return moduleObject.default;
    } else {
      throw payload._result;
    }
  }

  function lazy(ctor) {
    var payload = {
      // We use these fields to store the result.
      _status: Uninitialized,
      _result: ctor
    };
    var lazyType = {
      $$typeof: REACT_LAZY_TYPE,
      _payload: payload,
      _init: lazyInitializer
    };

    {
      // In production, this would just set it on the object.
      var defaultProps;
      var propTypes; // $FlowFixMe

      Object.defineProperties(lazyType, {
        defaultProps: {
          configurable: true,
          get: function () {
            return defaultProps;
          },
          set: function (newDefaultProps) {
            error('React.lazy(...): It is not supported to assign `defaultProps` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

            defaultProps = newDefaultProps; // Match production behavior more closely:
            // $FlowFixMe

            Object.defineProperty(lazyType, 'defaultProps', {
              enumerable: true
            });
          }
        },
        propTypes: {
          configurable: true,
          get: function () {
            return propTypes;
          },
          set: function (newPropTypes) {
            error('React.lazy(...): It is not supported to assign `propTypes` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

            propTypes = newPropTypes; // Match production behavior more closely:
            // $FlowFixMe

            Object.defineProperty(lazyType, 'propTypes', {
              enumerable: true
            });
          }
        }
      });
    }

    return lazyType;
  }

  function forwardRef(render) {
    {
      if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
        error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
      } else if (typeof render !== 'function') {
        error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
      } else {
        if (render.length !== 0 && render.length !== 2) {
          error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
        }
      }

      if (render != null) {
        if (render.defaultProps != null || render.propTypes != null) {
          error('forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?');
        }
      }
    }

    var elementType = {
      $$typeof: REACT_FORWARD_REF_TYPE,
      render: render
    };

    {
      var ownName;
      Object.defineProperty(elementType, 'displayName', {
        enumerable: false,
        configurable: true,
        get: function () {
          return ownName;
        },
        set: function (name) {
          ownName = name; // The inner component shouldn't inherit this display name in most cases,
          // because the component may be used elsewhere.
          // But it's nice for anonymous functions to inherit the name,
          // so that our component-stack generation logic will display their frames.
          // An anonymous function generally suggests a pattern like:
          //   React.forwardRef((props, ref) => {...});
          // This kind of inner function is not used elsewhere so the side effect is okay.

          if (!render.name && !render.displayName) {
            render.displayName = name;
          }
        }
      });
    }

    return elementType;
  }

  var REACT_MODULE_REFERENCE;

  {
    REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
  }

  function isValidElementType(type) {
    if (typeof type === 'string' || typeof type === 'function') {
      return true;
    } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


    if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
      return true;
    }

    if (typeof type === 'object' && type !== null) {
      if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
        return true;
      }
    }

    return false;
  }

  function memo(type, compare) {
    {
      if (!isValidElementType(type)) {
        error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
      }
    }

    var elementType = {
      $$typeof: REACT_MEMO_TYPE,
      type: type,
      compare: compare === undefined ? null : compare
    };

    {
      var ownName;
      Object.defineProperty(elementType, 'displayName', {
        enumerable: false,
        configurable: true,
        get: function () {
          return ownName;
        },
        set: function (name) {
          ownName = name; // The inner component shouldn't inherit this display name in most cases,
          // because the component may be used elsewhere.
          // But it's nice for anonymous functions to inherit the name,
          // so that our component-stack generation logic will display their frames.
          // An anonymous function generally suggests a pattern like:
          //   React.memo((props) => {...});
          // This kind of inner function is not used elsewhere so the side effect is okay.

          if (!type.name && !type.displayName) {
            type.displayName = name;
          }
        }
      });
    }

    return elementType;
  }

  function resolveDispatcher() {
    var dispatcher = ReactCurrentDispatcher.current;

    {
      if (dispatcher === null) {
        error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.');
      }
    } // Will result in a null access error if accessed outside render phase. We
    // intentionally don't throw our own error because this is in a hot path.
    // Also helps ensure this is inlined.


    return dispatcher;
  }
  function useContext(Context) {
    var dispatcher = resolveDispatcher();

    {
      // TODO: add a more generic warning for invalid values.
      if (Context._context !== undefined) {
        var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
        // and nobody should be using this in existing code.

        if (realContext.Consumer === Context) {
          error('Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
        } else if (realContext.Provider === Context) {
          error('Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
        }
      }
    }

    return dispatcher.useContext(Context);
  }
  function useState(initialState) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
  }
  function useReducer(reducer, initialArg, init) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initialArg, init);
  }
  function useRef(initialValue) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useRef(initialValue);
  }
  function useEffect(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
  }
  function useInsertionEffect(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useInsertionEffect(create, deps);
  }
  function useLayoutEffect(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useLayoutEffect(create, deps);
  }
  function useCallback(callback, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useCallback(callback, deps);
  }
  function useMemo(create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useMemo(create, deps);
  }
  function useImperativeHandle(ref, create, deps) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useImperativeHandle(ref, create, deps);
  }
  function useDebugValue(value, formatterFn) {
    {
      var dispatcher = resolveDispatcher();
      return dispatcher.useDebugValue(value, formatterFn);
    }
  }
  function useTransition() {
    var dispatcher = resolveDispatcher();
    return dispatcher.useTransition();
  }
  function useDeferredValue(value) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useDeferredValue(value);
  }
  function useId() {
    var dispatcher = resolveDispatcher();
    return dispatcher.useId();
  }
  function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    var dispatcher = resolveDispatcher();
    return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  // Helpers to patch console.logs to avoid logging during side-effect free
  // replaying on render function. This currently only patches the object
  // lazily which won't cover if the log function was extracted eagerly.
  // We could also eagerly patch the method.
  var disabledDepth = 0;
  var prevLog;
  var prevInfo;
  var prevWarn;
  var prevError;
  var prevGroup;
  var prevGroupCollapsed;
  var prevGroupEnd;

  function disabledLog() {}

  disabledLog.__reactDisabledLog = true;
  function disableLogs() {
    {
      if (disabledDepth === 0) {
        /* eslint-disable react-internal/no-production-logging */
        prevLog = console.log;
        prevInfo = console.info;
        prevWarn = console.warn;
        prevError = console.error;
        prevGroup = console.group;
        prevGroupCollapsed = console.groupCollapsed;
        prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

        var props = {
          configurable: true,
          enumerable: true,
          value: disabledLog,
          writable: true
        }; // $FlowFixMe Flow thinks console is immutable.

        Object.defineProperties(console, {
          info: props,
          log: props,
          warn: props,
          error: props,
          group: props,
          groupCollapsed: props,
          groupEnd: props
        });
        /* eslint-enable react-internal/no-production-logging */
      }

      disabledDepth++;
    }
  }
  function reenableLogs() {
    {
      disabledDepth--;

      if (disabledDepth === 0) {
        /* eslint-disable react-internal/no-production-logging */
        var props = {
          configurable: true,
          enumerable: true,
          writable: true
        }; // $FlowFixMe Flow thinks console is immutable.

        Object.defineProperties(console, {
          log: assign({}, props, {
            value: prevLog
          }),
          info: assign({}, props, {
            value: prevInfo
          }),
          warn: assign({}, props, {
            value: prevWarn
          }),
          error: assign({}, props, {
            value: prevError
          }),
          group: assign({}, props, {
            value: prevGroup
          }),
          groupCollapsed: assign({}, props, {
            value: prevGroupCollapsed
          }),
          groupEnd: assign({}, props, {
            value: prevGroupEnd
          })
        });
        /* eslint-enable react-internal/no-production-logging */
      }

      if (disabledDepth < 0) {
        error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
      }
    }
  }

  var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
  var prefix;
  function describeBuiltInComponentFrame(name, source, ownerFn) {
    {
      if (prefix === undefined) {
        // Extract the VM specific prefix used by each line.
        try {
          throw Error();
        } catch (x) {
          var match = x.stack.trim().match(/\n( *(at )?)/);
          prefix = match && match[1] || '';
        }
      } // We use the prefix to ensure our stacks line up with native stack frames.


      return '\n' + prefix + name;
    }
  }
  var reentry = false;
  var componentFrameCache;

  {
    var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
    componentFrameCache = new PossiblyWeakMap();
  }

  function describeNativeComponentFrame(fn, construct) {
    // If something asked for a stack inside a fake render, it should get ignored.
    if ( !fn || reentry) {
      return '';
    }

    {
      var frame = componentFrameCache.get(fn);

      if (frame !== undefined) {
        return frame;
      }
    }

    var control;
    reentry = true;
    var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

    Error.prepareStackTrace = undefined;
    var previousDispatcher;

    {
      previousDispatcher = ReactCurrentDispatcher$1.current; // Set the dispatcher in DEV because this might be call in the render function
      // for warnings.

      ReactCurrentDispatcher$1.current = null;
      disableLogs();
    }

    try {
      // This should throw.
      if (construct) {
        // Something should be setting the props in the constructor.
        var Fake = function () {
          throw Error();
        }; // $FlowFixMe


        Object.defineProperty(Fake.prototype, 'props', {
          set: function () {
            // We use a throwing setter instead of frozen or non-writable props
            // because that won't throw in a non-strict mode function.
            throw Error();
          }
        });

        if (typeof Reflect === 'object' && Reflect.construct) {
          // We construct a different control for this case to include any extra
          // frames added by the construct call.
          try {
            Reflect.construct(Fake, []);
          } catch (x) {
            control = x;
          }

          Reflect.construct(fn, [], Fake);
        } else {
          try {
            Fake.call();
          } catch (x) {
            control = x;
          }

          fn.call(Fake.prototype);
        }
      } else {
        try {
          throw Error();
        } catch (x) {
          control = x;
        }

        fn();
      }
    } catch (sample) {
      // This is inlined manually because closure doesn't do it for us.
      if (sample && control && typeof sample.stack === 'string') {
        // This extracts the first frame from the sample that isn't also in the control.
        // Skipping one frame that we assume is the frame that calls the two.
        var sampleLines = sample.stack.split('\n');
        var controlLines = control.stack.split('\n');
        var s = sampleLines.length - 1;
        var c = controlLines.length - 1;

        while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
          // We expect at least one stack frame to be shared.
          // Typically this will be the root most one. However, stack frames may be
          // cut off due to maximum stack limits. In this case, one maybe cut off
          // earlier than the other. We assume that the sample is longer or the same
          // and there for cut off earlier. So we should find the root most frame in
          // the sample somewhere in the control.
          c--;
        }

        for (; s >= 1 && c >= 0; s--, c--) {
          // Next we find the first one that isn't the same which should be the
          // frame that called our sample function and the control.
          if (sampleLines[s] !== controlLines[c]) {
            // In V8, the first line is describing the message but other VMs don't.
            // If we're about to return the first line, and the control is also on the same
            // line, that's a pretty good indicator that our sample threw at same line as
            // the control. I.e. before we entered the sample frame. So we ignore this result.
            // This can happen if you passed a class to function component, or non-function.
            if (s !== 1 || c !== 1) {
              do {
                s--;
                c--; // We may still have similar intermediate frames from the construct call.
                // The next one that isn't the same should be our match though.

                if (c < 0 || sampleLines[s] !== controlLines[c]) {
                  // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                  var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                  // but we have a user-provided "displayName"
                  // splice it in to make the stack more readable.


                  if (fn.displayName && _frame.includes('<anonymous>')) {
                    _frame = _frame.replace('<anonymous>', fn.displayName);
                  }

                  {
                    if (typeof fn === 'function') {
                      componentFrameCache.set(fn, _frame);
                    }
                  } // Return the line we found.


                  return _frame;
                }
              } while (s >= 1 && c >= 0);
            }

            break;
          }
        }
      }
    } finally {
      reentry = false;

      {
        ReactCurrentDispatcher$1.current = previousDispatcher;
        reenableLogs();
      }

      Error.prepareStackTrace = previousPrepareStackTrace;
    } // Fallback to just using the name if we couldn't make it throw.


    var name = fn ? fn.displayName || fn.name : '';
    var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

    {
      if (typeof fn === 'function') {
        componentFrameCache.set(fn, syntheticFrame);
      }
    }

    return syntheticFrame;
  }
  function describeFunctionComponentFrame(fn, source, ownerFn) {
    {
      return describeNativeComponentFrame(fn, false);
    }
  }

  function shouldConstruct(Component) {
    var prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
  }

  function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

    if (type == null) {
      return '';
    }

    if (typeof type === 'function') {
      {
        return describeNativeComponentFrame(type, shouldConstruct(type));
      }
    }

    if (typeof type === 'string') {
      return describeBuiltInComponentFrame(type);
    }

    switch (type) {
      case REACT_SUSPENSE_TYPE:
        return describeBuiltInComponentFrame('Suspense');

      case REACT_SUSPENSE_LIST_TYPE:
        return describeBuiltInComponentFrame('SuspenseList');
    }

    if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          return describeFunctionComponentFrame(type.render);

        case REACT_MEMO_TYPE:
          // Memo may contain any component type so we recursively resolve it.
          return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

        case REACT_LAZY_TYPE:
          {
            var lazyComponent = type;
            var payload = lazyComponent._payload;
            var init = lazyComponent._init;

            try {
              // Lazy may contain any component type so we recursively resolve it.
              return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
            } catch (x) {}
          }
      }
    }

    return '';
  }

  var loggedTypeFailures = {};
  var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

  function setCurrentlyValidatingElement(element) {
    {
      if (element) {
        var owner = element._owner;
        var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
        ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
      } else {
        ReactDebugCurrentFrame$1.setExtraStackFrame(null);
      }
    }
  }

  function checkPropTypes(typeSpecs, values, location, componentName, element) {
    {
      // $FlowFixMe This is okay but Flow doesn't know it.
      var has = Function.call.bind(hasOwnProperty);

      for (var typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
          // fail the render phase where it didn't fail before. So we log it.
          // After these have been cleaned up, we'll let them throw.

          try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              // eslint-disable-next-line react-internal/prod-error-codes
              var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
              err.name = 'Invariant Violation';
              throw err;
            }

            error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
          } catch (ex) {
            error$1 = ex;
          }

          if (error$1 && !(error$1 instanceof Error)) {
            setCurrentlyValidatingElement(element);

            error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

            setCurrentlyValidatingElement(null);
          }

          if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error$1.message] = true;
            setCurrentlyValidatingElement(element);

            error('Failed %s type: %s', location, error$1.message);

            setCurrentlyValidatingElement(null);
          }
        }
      }
    }
  }

  function setCurrentlyValidatingElement$1(element) {
    {
      if (element) {
        var owner = element._owner;
        var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
        setExtraStackFrame(stack);
      } else {
        setExtraStackFrame(null);
      }
    }
  }

  var propTypesMisspellWarningShown;

  {
    propTypesMisspellWarningShown = false;
  }

  function getDeclarationErrorAddendum() {
    if (ReactCurrentOwner.current) {
      var name = getComponentNameFromType(ReactCurrentOwner.current.type);

      if (name) {
        return '\n\nCheck the render method of `' + name + '`.';
      }
    }

    return '';
  }

  function getSourceInfoErrorAddendum(source) {
    if (source !== undefined) {
      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
      var lineNumber = source.lineNumber;
      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
    }

    return '';
  }

  function getSourceInfoErrorAddendumForProps(elementProps) {
    if (elementProps !== null && elementProps !== undefined) {
      return getSourceInfoErrorAddendum(elementProps.__source);
    }

    return '';
  }
  /**
   * Warn if there's no key explicitly set on dynamic arrays of children or
   * object keys are not valid. This allows us to keep track of children between
   * updates.
   */


  var ownerHasKeyUseWarning = {};

  function getCurrentComponentErrorInfo(parentType) {
    var info = getDeclarationErrorAddendum();

    if (!info) {
      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

      if (parentName) {
        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
      }
    }

    return info;
  }
  /**
   * Warn if the element doesn't have an explicit key assigned to it.
   * This element is in an array. The array could grow and shrink or be
   * reordered. All children that haven't already been validated are required to
   * have a "key" property assigned to it. Error statuses are cached so a warning
   * will only be shown once.
   *
   * @internal
   * @param {ReactElement} element Element that requires a key.
   * @param {*} parentType element's parent's type.
   */


  function validateExplicitKey(element, parentType) {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }

    element._store.validated = true;
    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }

    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
    // property, it may be the creator of the child that's responsible for
    // assigning it a key.

    var childOwner = '';

    if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
      // Give the component that originally created this child.
      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
    }

    {
      setCurrentlyValidatingElement$1(element);

      error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

      setCurrentlyValidatingElement$1(null);
    }
  }
  /**
   * Ensure that every element either is passed in a static location, in an
   * array with an explicit keys property defined, or in an object literal
   * with valid key property.
   *
   * @internal
   * @param {ReactNode} node Statically passed child of any type.
   * @param {*} parentType node's parent's type.
   */


  function validateChildKeys(node, parentType) {
    if (typeof node !== 'object') {
      return;
    }

    if (isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];

        if (isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (isValidElement(node)) {
      // This element was passed in a valid location.
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      var iteratorFn = getIteratorFn(node);

      if (typeof iteratorFn === 'function') {
        // Entry iterators used to provide implicit keys,
        // but now we print a separate warning for them later.
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;

          while (!(step = iterator.next()).done) {
            if (isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
  /**
   * Given an element, validate that its props follow the propTypes definition,
   * provided by the type.
   *
   * @param {ReactElement} element
   */


  function validatePropTypes(element) {
    {
      var type = element.type;

      if (type === null || type === undefined || typeof type === 'string') {
        return;
      }

      var propTypes;

      if (typeof type === 'function') {
        propTypes = type.propTypes;
      } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
      // Inner props are checked in the reconciler.
      type.$$typeof === REACT_MEMO_TYPE)) {
        propTypes = type.propTypes;
      } else {
        return;
      }

      if (propTypes) {
        // Intentionally inside to avoid triggering lazy initializers:
        var name = getComponentNameFromType(type);
        checkPropTypes(propTypes, element.props, 'prop', name, element);
      } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
        propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

        var _name = getComponentNameFromType(type);

        error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
      }

      if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
        error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
      }
    }
  }
  /**
   * Given a fragment, validate that it can only be provided with fragment props
   * @param {ReactElement} fragment
   */


  function validateFragmentProps(fragment) {
    {
      var keys = Object.keys(fragment.props);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (key !== 'children' && key !== 'key') {
          setCurrentlyValidatingElement$1(fragment);

          error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

          setCurrentlyValidatingElement$1(null);
          break;
        }
      }

      if (fragment.ref !== null) {
        setCurrentlyValidatingElement$1(fragment);

        error('Invalid attribute `ref` supplied to `React.Fragment`.');

        setCurrentlyValidatingElement$1(null);
      }
    }
  }
  function createElementWithValidation(type, props, children) {
    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.

    if (!validType) {
      var info = '';

      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
      }

      var sourceInfo = getSourceInfoErrorAddendumForProps(props);

      if (sourceInfo) {
        info += sourceInfo;
      } else {
        info += getDeclarationErrorAddendum();
      }

      var typeString;

      if (type === null) {
        typeString = 'null';
      } else if (isArray(type)) {
        typeString = 'array';
      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
        info = ' Did you accidentally export a JSX literal instead of a component?';
      } else {
        typeString = typeof type;
      }

      {
        error('React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
      }
    }

    var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.

    if (element == null) {
      return element;
    } // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)


    if (validType) {
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], type);
      }
    }

    if (type === REACT_FRAGMENT_TYPE) {
      validateFragmentProps(element);
    } else {
      validatePropTypes(element);
    }

    return element;
  }
  var didWarnAboutDeprecatedCreateFactory = false;
  function createFactoryWithValidation(type) {
    var validatedFactory = createElementWithValidation.bind(null, type);
    validatedFactory.type = type;

    {
      if (!didWarnAboutDeprecatedCreateFactory) {
        didWarnAboutDeprecatedCreateFactory = true;

        warn('React.createFactory() is deprecated and will be removed in ' + 'a future major release. Consider using JSX ' + 'or use React.createElement() directly instead.');
      } // Legacy hook: remove it


      Object.defineProperty(validatedFactory, 'type', {
        enumerable: false,
        get: function () {
          warn('Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');

          Object.defineProperty(this, 'type', {
            value: type
          });
          return type;
        }
      });
    }

    return validatedFactory;
  }
  function cloneElementWithValidation(element, props, children) {
    var newElement = cloneElement.apply(this, arguments);

    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], newElement.type);
    }

    validatePropTypes(newElement);
    return newElement;
  }

  var enableSchedulerDebugging = false;
  var enableProfiling = false;
  var frameYieldMs = 5;

  function push(heap, node) {
    var index = heap.length;
    heap.push(node);
    siftUp(heap, node, index);
  }
  function peek(heap) {
    return heap.length === 0 ? null : heap[0];
  }
  function pop(heap) {
    if (heap.length === 0) {
      return null;
    }

    var first = heap[0];
    var last = heap.pop();

    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }

    return first;
  }

  function siftUp(heap, node, i) {
    var index = i;

    while (index > 0) {
      var parentIndex = index - 1 >>> 1;
      var parent = heap[parentIndex];

      if (compare(parent, node) > 0) {
        // The parent is larger. Swap positions.
        heap[parentIndex] = node;
        heap[index] = parent;
        index = parentIndex;
      } else {
        // The parent is smaller. Exit.
        return;
      }
    }
  }

  function siftDown(heap, node, i) {
    var index = i;
    var length = heap.length;
    var halfLength = length >>> 1;

    while (index < halfLength) {
      var leftIndex = (index + 1) * 2 - 1;
      var left = heap[leftIndex];
      var rightIndex = leftIndex + 1;
      var right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

      if (compare(left, node) < 0) {
        if (rightIndex < length && compare(right, left) < 0) {
          heap[index] = right;
          heap[rightIndex] = node;
          index = rightIndex;
        } else {
          heap[index] = left;
          heap[leftIndex] = node;
          index = leftIndex;
        }
      } else if (rightIndex < length && compare(right, node) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // Neither child is smaller. Exit.
        return;
      }
    }
  }

  function compare(a, b) {
    // Compare sort index first, then task id.
    var diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
  }

  // TODO: Use symbols?
  var ImmediatePriority = 1;
  var UserBlockingPriority = 2;
  var NormalPriority = 3;
  var LowPriority = 4;
  var IdlePriority = 5;

  function markTaskErrored(task, ms) {
  }

  /* eslint-disable no-var */
  var getCurrentTime;
  var hasPerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';

  if (hasPerformanceNow) {
    var localPerformance = performance;

    getCurrentTime = function () {
      return localPerformance.now();
    };
  } else {
    var localDate = Date;
    var initialTime = localDate.now();

    getCurrentTime = function () {
      return localDate.now() - initialTime;
    };
  } // Max 31 bit integer. The max integer size in V8 for 32-bit systems.
  // Math.pow(2, 30) - 1
  // 0b111111111111111111111111111111


  var maxSigned31BitInt = 1073741823; // Times out immediately

  var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

  var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
  var NORMAL_PRIORITY_TIMEOUT = 5000;
  var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

  var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // Tasks are stored on a min heap

  var taskQueue = [];
  var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

  var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.
  var currentTask = null;
  var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrance.

  var isPerformingWork = false;
  var isHostCallbackScheduled = false;
  var isHostTimeoutScheduled = false; // Capture local references to native APIs, in case a polyfill overrides them.

  var localSetTimeout = typeof setTimeout === 'function' ? setTimeout : null;
  var localClearTimeout = typeof clearTimeout === 'function' ? clearTimeout : null;
  var localSetImmediate = typeof setImmediate !== 'undefined' ? setImmediate : null; // IE and Node.js + jsdom

  var isInputPending = typeof navigator !== 'undefined' && navigator.scheduling !== undefined && navigator.scheduling.isInputPending !== undefined ? navigator.scheduling.isInputPending.bind(navigator.scheduling) : null;

  function advanceTimers(currentTime) {
    // Check for tasks that are no longer delayed and add them to the queue.
    var timer = peek(timerQueue);

    while (timer !== null) {
      if (timer.callback === null) {
        // Timer was cancelled.
        pop(timerQueue);
      } else if (timer.startTime <= currentTime) {
        // Timer fired. Transfer to the task queue.
        pop(timerQueue);
        timer.sortIndex = timer.expirationTime;
        push(taskQueue, timer);
      } else {
        // Remaining timers are pending.
        return;
      }

      timer = peek(timerQueue);
    }
  }

  function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);

    if (!isHostCallbackScheduled) {
      if (peek(taskQueue) !== null) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      } else {
        var firstTimer = peek(timerQueue);

        if (firstTimer !== null) {
          requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
      }
    }
  }

  function flushWork(hasTimeRemaining, initialTime) {


    isHostCallbackScheduled = false;

    if (isHostTimeoutScheduled) {
      // We scheduled a timeout but it's no longer needed. Cancel it.
      isHostTimeoutScheduled = false;
      cancelHostTimeout();
    }

    isPerformingWork = true;
    var previousPriorityLevel = currentPriorityLevel;

    try {
      if (enableProfiling) {
        try {
          return workLoop(hasTimeRemaining, initialTime);
        } catch (error) {
          if (currentTask !== null) {
            var currentTime = getCurrentTime();
            markTaskErrored(currentTask, currentTime);
            currentTask.isQueued = false;
          }

          throw error;
        }
      } else {
        // No catch in prod code path.
        return workLoop(hasTimeRemaining, initialTime);
      }
    } finally {
      currentTask = null;
      currentPriorityLevel = previousPriorityLevel;
      isPerformingWork = false;
    }
  }

  function workLoop(hasTimeRemaining, initialTime) {
    var currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);

    while (currentTask !== null && !(enableSchedulerDebugging )) {
      if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
        // This currentTask hasn't expired, and we've reached the deadline.
        break;
      }

      var callback = currentTask.callback;

      if (typeof callback === 'function') {
        currentTask.callback = null;
        currentPriorityLevel = currentTask.priorityLevel;
        var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;

        var continuationCallback = callback(didUserCallbackTimeout);
        currentTime = getCurrentTime();

        if (typeof continuationCallback === 'function') {
          currentTask.callback = continuationCallback;
        } else {

          if (currentTask === peek(taskQueue)) {
            pop(taskQueue);
          }
        }

        advanceTimers(currentTime);
      } else {
        pop(taskQueue);
      }

      currentTask = peek(taskQueue);
    } // Return whether there's additional work


    if (currentTask !== null) {
      return true;
    } else {
      var firstTimer = peek(timerQueue);

      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }

      return false;
    }
  }

  function unstable_runWithPriority(priorityLevel, eventHandler) {
    switch (priorityLevel) {
      case ImmediatePriority:
      case UserBlockingPriority:
      case NormalPriority:
      case LowPriority:
      case IdlePriority:
        break;

      default:
        priorityLevel = NormalPriority;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  }

  function unstable_next(eventHandler) {
    var priorityLevel;

    switch (currentPriorityLevel) {
      case ImmediatePriority:
      case UserBlockingPriority:
      case NormalPriority:
        // Shift down to normal priority
        priorityLevel = NormalPriority;
        break;

      default:
        // Anything lower than normal priority should remain at the current level.
        priorityLevel = currentPriorityLevel;
        break;
    }

    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;

    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  }

  function unstable_wrapCallback(callback) {
    var parentPriorityLevel = currentPriorityLevel;
    return function () {
      // This is a fork of runWithPriority, inlined for performance.
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = parentPriorityLevel;

      try {
        return callback.apply(this, arguments);
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
  }

  function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = getCurrentTime();
    var startTime;

    if (typeof options === 'object' && options !== null) {
      var delay = options.delay;

      if (typeof delay === 'number' && delay > 0) {
        startTime = currentTime + delay;
      } else {
        startTime = currentTime;
      }
    } else {
      startTime = currentTime;
    }

    var timeout;

    switch (priorityLevel) {
      case ImmediatePriority:
        timeout = IMMEDIATE_PRIORITY_TIMEOUT;
        break;

      case UserBlockingPriority:
        timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
        break;

      case IdlePriority:
        timeout = IDLE_PRIORITY_TIMEOUT;
        break;

      case LowPriority:
        timeout = LOW_PRIORITY_TIMEOUT;
        break;

      case NormalPriority:
      default:
        timeout = NORMAL_PRIORITY_TIMEOUT;
        break;
    }

    var expirationTime = startTime + timeout;
    var newTask = {
      id: taskIdCounter++,
      callback: callback,
      priorityLevel: priorityLevel,
      startTime: startTime,
      expirationTime: expirationTime,
      sortIndex: -1
    };

    if (startTime > currentTime) {
      // This is a delayed task.
      newTask.sortIndex = startTime;
      push(timerQueue, newTask);

      if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
        // All tasks are delayed, and this is the task with the earliest delay.
        if (isHostTimeoutScheduled) {
          // Cancel an existing timeout.
          cancelHostTimeout();
        } else {
          isHostTimeoutScheduled = true;
        } // Schedule a timeout.


        requestHostTimeout(handleTimeout, startTime - currentTime);
      }
    } else {
      newTask.sortIndex = expirationTime;
      push(taskQueue, newTask);
      // wait until the next time we yield.


      if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      }
    }

    return newTask;
  }

  function unstable_pauseExecution() {
  }

  function unstable_continueExecution() {

    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  function unstable_getFirstCallbackNode() {
    return peek(taskQueue);
  }

  function unstable_cancelCallback(task) {
    // remove from the queue because you can't remove arbitrary nodes from an
    // array based heap, only the first one.)


    task.callback = null;
  }

  function unstable_getCurrentPriorityLevel() {
    return currentPriorityLevel;
  }

  var isMessageLoopRunning = false;
  var scheduledHostCallback = null;
  var taskTimeoutID = -1; // Scheduler periodically yields in case there is other work on the main
  // thread, like user events. By default, it yields multiple times per frame.
  // It does not attempt to align with frame boundaries, since most tasks don't
  // need to be frame aligned; for those that do, use requestAnimationFrame.

  var frameInterval = frameYieldMs;
  var startTime = -1;

  function shouldYieldToHost() {
    var timeElapsed = getCurrentTime() - startTime;

    if (timeElapsed < frameInterval) {
      // The main thread has only been blocked for a really short amount of time;
      // smaller than a single frame. Don't yield yet.
      return false;
    } // The main thread has been blocked for a non-negligible amount of time. We


    return true;
  }

  function requestPaint() {

  }

  function forceFrameRate(fps) {
    if (fps < 0 || fps > 125) {
      // Using console['error'] to evade Babel and ESLint
      console['error']('forceFrameRate takes a positive int between 0 and 125, ' + 'forcing frame rates higher than 125 fps is not supported');
      return;
    }

    if (fps > 0) {
      frameInterval = Math.floor(1000 / fps);
    } else {
      // reset the framerate
      frameInterval = frameYieldMs;
    }
  }

  var performWorkUntilDeadline = function () {
    if (scheduledHostCallback !== null) {
      var currentTime = getCurrentTime(); // Keep track of the start time so we can measure how long the main thread
      // has been blocked.

      startTime = currentTime;
      var hasTimeRemaining = true; // If a scheduler task throws, exit the current browser task so the
      // error can be observed.
      //
      // Intentionally not using a try-catch, since that makes some debugging
      // techniques harder. Instead, if `scheduledHostCallback` errors, then
      // `hasMoreWork` will remain true, and we'll continue the work loop.

      var hasMoreWork = true;

      try {
        hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
      } finally {
        if (hasMoreWork) {
          // If there's more work, schedule the next message event at the end
          // of the preceding one.
          schedulePerformWorkUntilDeadline();
        } else {
          isMessageLoopRunning = false;
          scheduledHostCallback = null;
        }
      }
    } else {
      isMessageLoopRunning = false;
    } // Yielding to the browser will give it a chance to paint, so we can
  };

  var schedulePerformWorkUntilDeadline;

  if (typeof localSetImmediate === 'function') {
    // Node.js and old IE.
    // There's a few reasons for why we prefer setImmediate.
    //
    // Unlike MessageChannel, it doesn't prevent a Node.js process from exiting.
    // (Even though this is a DOM fork of the Scheduler, you could get here
    // with a mix of Node.js 15+, which has a MessageChannel, and jsdom.)
    // https://github.com/facebook/react/issues/20756
    //
    // But also, it runs earlier which is the semantic we want.
    // If other browsers ever implement it, it's better to use it.
    // Although both of these would be inferior to native scheduling.
    schedulePerformWorkUntilDeadline = function () {
      localSetImmediate(performWorkUntilDeadline);
    };
  } else if (typeof MessageChannel !== 'undefined') {
    // DOM and Worker environments.
    // We prefer MessageChannel because of the 4ms setTimeout clamping.
    var channel = new MessageChannel();
    var port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;

    schedulePerformWorkUntilDeadline = function () {
      port.postMessage(null);
    };
  } else {
    // We should only fallback here in non-browser environments.
    schedulePerformWorkUntilDeadline = function () {
      localSetTimeout(performWorkUntilDeadline, 0);
    };
  }

  function requestHostCallback(callback) {
    scheduledHostCallback = callback;

    if (!isMessageLoopRunning) {
      isMessageLoopRunning = true;
      schedulePerformWorkUntilDeadline();
    }
  }

  function requestHostTimeout(callback, ms) {
    taskTimeoutID = localSetTimeout(function () {
      callback(getCurrentTime());
    }, ms);
  }

  function cancelHostTimeout() {
    localClearTimeout(taskTimeoutID);
    taskTimeoutID = -1;
  }

  var unstable_requestPaint = requestPaint;
  var unstable_Profiling =  null;



  var Scheduler = /*#__PURE__*/Object.freeze({
    __proto__: null,
    unstable_ImmediatePriority: ImmediatePriority,
    unstable_UserBlockingPriority: UserBlockingPriority,
    unstable_NormalPriority: NormalPriority,
    unstable_IdlePriority: IdlePriority,
    unstable_LowPriority: LowPriority,
    unstable_runWithPriority: unstable_runWithPriority,
    unstable_next: unstable_next,
    unstable_scheduleCallback: unstable_scheduleCallback,
    unstable_cancelCallback: unstable_cancelCallback,
    unstable_wrapCallback: unstable_wrapCallback,
    unstable_getCurrentPriorityLevel: unstable_getCurrentPriorityLevel,
    unstable_shouldYield: shouldYieldToHost,
    unstable_requestPaint: unstable_requestPaint,
    unstable_continueExecution: unstable_continueExecution,
    unstable_pauseExecution: unstable_pauseExecution,
    unstable_getFirstCallbackNode: unstable_getFirstCallbackNode,
    get unstable_now () { return getCurrentTime; },
    unstable_forceFrameRate: forceFrameRate,
    unstable_Profiling: unstable_Profiling
  });

  var ReactSharedInternals$1 = {
    ReactCurrentDispatcher: ReactCurrentDispatcher,
    ReactCurrentOwner: ReactCurrentOwner,
    ReactCurrentBatchConfig: ReactCurrentBatchConfig,
    // Re-export the schedule API(s) for UMD bundles.
    // This avoids introducing a dependency on a new UMD global in a minor update,
    // Since that would be a breaking change (e.g. for all existing CodeSandboxes).
    // This re-export is only required for UMD bundles;
    // CJS bundles use the shared NPM package.
    Scheduler: Scheduler
  };

  {
    ReactSharedInternals$1.ReactCurrentActQueue = ReactCurrentActQueue;
    ReactSharedInternals$1.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
  }

  function startTransition(scope, options) {
    var prevTransition = ReactCurrentBatchConfig.transition;
    ReactCurrentBatchConfig.transition = {};
    var currentTransition = ReactCurrentBatchConfig.transition;

    {
      ReactCurrentBatchConfig.transition._updatedFibers = new Set();
    }

    try {
      scope();
    } finally {
      ReactCurrentBatchConfig.transition = prevTransition;

      {
        if (prevTransition === null && currentTransition._updatedFibers) {
          var updatedFibersCount = currentTransition._updatedFibers.size;

          if (updatedFibersCount > 10) {
            warn('Detected a large number of updates inside startTransition. ' + 'If this is due to a subscription please re-write it to use React provided hooks. ' + 'Otherwise concurrent mode guarantees are off the table.');
          }

          currentTransition._updatedFibers.clear();
        }
      }
    }
  }

  var didWarnAboutMessageChannel = false;
  var enqueueTaskImpl = null;
  function enqueueTask(task) {
    if (enqueueTaskImpl === null) {
      try {
        // read require off the module object to get around the bundlers.
        // we don't want them to detect a require and bundle a Node polyfill.
        var requireString = ('require' + Math.random()).slice(0, 7);
        var nodeRequire = module && module[requireString]; // assuming we're in node, let's try to get node's
        // version of setImmediate, bypassing fake timers if any.

        enqueueTaskImpl = nodeRequire.call(module, 'timers').setImmediate;
      } catch (_err) {
        // we're in a browser
        // we can't use regular timers because they may still be faked
        // so we try MessageChannel+postMessage instead
        enqueueTaskImpl = function (callback) {
          {
            if (didWarnAboutMessageChannel === false) {
              didWarnAboutMessageChannel = true;

              if (typeof MessageChannel === 'undefined') {
                error('This browser does not have a MessageChannel implementation, ' + 'so enqueuing tasks via await act(async () => ...) will fail. ' + 'Please file an issue at https://github.com/facebook/react/issues ' + 'if you encounter this warning.');
              }
            }
          }

          var channel = new MessageChannel();
          channel.port1.onmessage = callback;
          channel.port2.postMessage(undefined);
        };
      }
    }

    return enqueueTaskImpl(task);
  }

  var actScopeDepth = 0;
  var didWarnNoAwaitAct = false;
  function act(callback) {
    {
      // `act` calls can be nested, so we track the depth. This represents the
      // number of `act` scopes on the stack.
      var prevActScopeDepth = actScopeDepth;
      actScopeDepth++;

      if (ReactCurrentActQueue.current === null) {
        // This is the outermost `act` scope. Initialize the queue. The reconciler
        // will detect the queue and use it instead of Scheduler.
        ReactCurrentActQueue.current = [];
      }

      var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
      var result;

      try {
        // Used to reproduce behavior of `batchedUpdates` in legacy mode. Only
        // set to `true` while the given callback is executed, not for updates
        // triggered during an async event, because this is how the legacy
        // implementation of `act` behaved.
        ReactCurrentActQueue.isBatchingLegacy = true;
        result = callback(); // Replicate behavior of original `act` implementation in legacy mode,
        // which flushed updates immediately after the scope function exits, even
        // if it's an async function.

        if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
          var queue = ReactCurrentActQueue.current;

          if (queue !== null) {
            ReactCurrentActQueue.didScheduleLegacyUpdate = false;
            flushActQueue(queue);
          }
        }
      } catch (error) {
        popActScope(prevActScopeDepth);
        throw error;
      } finally {
        ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
      }

      if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
        var thenableResult = result; // The callback is an async function (i.e. returned a promise). Wait
        // for it to resolve before exiting the current scope.

        var wasAwaited = false;
        var thenable = {
          then: function (resolve, reject) {
            wasAwaited = true;
            thenableResult.then(function (returnValue) {
              popActScope(prevActScopeDepth);

              if (actScopeDepth === 0) {
                // We've exited the outermost act scope. Recursively flush the
                // queue until there's no remaining work.
                recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              } else {
                resolve(returnValue);
              }
            }, function (error) {
              // The callback threw an error.
              popActScope(prevActScopeDepth);
              reject(error);
            });
          }
        };

        {
          if (!didWarnNoAwaitAct && typeof Promise !== 'undefined') {
            // eslint-disable-next-line no-undef
            Promise.resolve().then(function () {}).then(function () {
              if (!wasAwaited) {
                didWarnNoAwaitAct = true;

                error('You called act(async () => ...) without await. ' + 'This could lead to unexpected testing behaviour, ' + 'interleaving multiple act calls and mixing their ' + 'scopes. ' + 'You should - await act(async () => ...);');
              }
            });
          }
        }

        return thenable;
      } else {
        var returnValue = result; // The callback is not an async function. Exit the current scope
        // immediately, without awaiting.

        popActScope(prevActScopeDepth);

        if (actScopeDepth === 0) {
          // Exiting the outermost act scope. Flush the queue.
          var _queue = ReactCurrentActQueue.current;

          if (_queue !== null) {
            flushActQueue(_queue);
            ReactCurrentActQueue.current = null;
          } // Return a thenable. If the user awaits it, we'll flush again in
          // case additional work was scheduled by a microtask.


          var _thenable = {
            then: function (resolve, reject) {
              // Confirm we haven't re-entered another `act` scope, in case
              // the user does something weird like await the thenable
              // multiple times.
              if (ReactCurrentActQueue.current === null) {
                // Recursively flush the queue until there's no remaining work.
                ReactCurrentActQueue.current = [];
                recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              } else {
                resolve(returnValue);
              }
            }
          };
          return _thenable;
        } else {
          // Since we're inside a nested `act` scope, the returned thenable
          // immediately resolves. The outer scope will flush the queue.
          var _thenable2 = {
            then: function (resolve, reject) {
              resolve(returnValue);
            }
          };
          return _thenable2;
        }
      }
    }
  }

  function popActScope(prevActScopeDepth) {
    {
      if (prevActScopeDepth !== actScopeDepth - 1) {
        error('You seem to have overlapping act() calls, this is not supported. ' + 'Be sure to await previous act() calls before making a new one. ');
      }

      actScopeDepth = prevActScopeDepth;
    }
  }

  function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
    {
      var queue = ReactCurrentActQueue.current;

      if (queue !== null) {
        try {
          flushActQueue(queue);
          enqueueTask(function () {
            if (queue.length === 0) {
              // No additional work was scheduled. Finish.
              ReactCurrentActQueue.current = null;
              resolve(returnValue);
            } else {
              // Keep flushing work until there's none left.
              recursivelyFlushAsyncActWork(returnValue, resolve, reject);
            }
          });
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(returnValue);
      }
    }
  }

  var isFlushing = false;

  function flushActQueue(queue) {
    {
      if (!isFlushing) {
        // Prevent re-entrance.
        isFlushing = true;
        var i = 0;

        try {
          for (; i < queue.length; i++) {
            var callback = queue[i];

            do {
              callback = callback(true);
            } while (callback !== null);
          }

          queue.length = 0;
        } catch (error) {
          // If something throws, leave the remaining callbacks on the queue.
          queue = queue.slice(i + 1);
          throw error;
        } finally {
          isFlushing = false;
        }
      }
    }
  }

  var createElement$1 =  createElementWithValidation ;
  var cloneElement$1 =  cloneElementWithValidation ;
  var createFactory =  createFactoryWithValidation ;
  var Children = {
    map: mapChildren,
    forEach: forEachChildren,
    count: countChildren,
    toArray: toArray,
    only: onlyChild
  };

  exports.Children = Children;
  exports.Component = Component;
  exports.Fragment = REACT_FRAGMENT_TYPE;
  exports.Profiler = REACT_PROFILER_TYPE;
  exports.PureComponent = PureComponent;
  exports.StrictMode = REACT_STRICT_MODE_TYPE;
  exports.Suspense = REACT_SUSPENSE_TYPE;
  exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals$1;
  exports.act = act;
  exports.cloneElement = cloneElement$1;
  exports.createContext = createContext;
  exports.createElement = createElement$1;
  exports.createFactory = createFactory;
  exports.createRef = createRef;
  exports.forwardRef = forwardRef;
  exports.isValidElement = isValidElement;
  exports.lazy = lazy;
  exports.memo = memo;
  exports.startTransition = startTransition;
  exports.unstable_act = act;
  exports.useCallback = useCallback;
  exports.useContext = useContext;
  exports.useDebugValue = useDebugValue;
  exports.useDeferredValue = useDeferredValue;
  exports.useEffect = useEffect;
  exports.useId = useId;
  exports.useImperativeHandle = useImperativeHandle;
  exports.useInsertionEffect = useInsertionEffect;
  exports.useLayoutEffect = useLayoutEffect;
  exports.useMemo = useMemo;
  exports.useReducer = useReducer;
  exports.useRef = useRef;
  exports.useState = useState;
  exports.useSyncExternalStore = useSyncExternalStore;
  exports.useTransition = useTransition;
  exports.version = ReactVersion;

})));

/**
 * @license React
 * react-dom.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = global || self, factory(global.ReactDOM = {}, global.React));
}(this, (function (exports, React) { 'use strict';

  var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  var suppressWarning = false;
  function setSuppressWarning(newSuppressWarning) {
    {
      suppressWarning = newSuppressWarning;
    }
  } // In DEV, calls to console.warn and console.error get replaced
  // by calls to these methods by a Babel plugin.
  //
  // In PROD (or in packages without access to React internals),
  // they are left as they are instead.

  function warn(format) {
    {
      if (!suppressWarning) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        printWarning('warn', format, args);
      }
    }
  }
  function error(format) {
    {
      if (!suppressWarning) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        printWarning('error', format, args);
      }
    }
  }

  function printWarning(level, format, args) {
    // When changing this logic, you might want to also
    // update consoleWithStackDev.www.js as well.
    {
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      var stack = ReactDebugCurrentFrame.getStackAddendum();

      if (stack !== '') {
        format += '%s';
        args = args.concat([stack]);
      } // eslint-disable-next-line react-internal/safe-string-coercion


      var argsWithFormat = args.map(function (item) {
        return String(item);
      }); // Careful: RN currently depends on this prefix

      argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
      // breaks IE9: https://github.com/facebook/react/issues/13610
      // eslint-disable-next-line react-internal/no-production-logging

      Function.prototype.apply.call(console[level], console, argsWithFormat);
    }
  }

  var FunctionComponent = 0;
  var ClassComponent = 1;
  var IndeterminateComponent = 2; // Before we know whether it is function or class

  var HostRoot = 3; // Root of a host tree. Could be nested inside another node.

  var HostPortal = 4; // A subtree. Could be an entry point to a different renderer.

  var HostComponent = 5;
  var HostText = 6;
  var Fragment = 7;
  var Mode = 8;
  var ContextConsumer = 9;
  var ContextProvider = 10;
  var ForwardRef = 11;
  var Profiler = 12;
  var SuspenseComponent = 13;
  var MemoComponent = 14;
  var SimpleMemoComponent = 15;
  var LazyComponent = 16;
  var IncompleteClassComponent = 17;
  var DehydratedFragment = 18;
  var SuspenseListComponent = 19;
  var ScopeComponent = 21;
  var OffscreenComponent = 22;
  var LegacyHiddenComponent = 23;
  var CacheComponent = 24;
  var TracingMarkerComponent = 25;

  // -----------------------------------------------------------------------------

  var enableClientRenderFallbackOnTextMismatch = true; // TODO: Need to review this code one more time before landing
  // the react-reconciler package.

  var enableNewReconciler = false; // Support legacy Primer support on internal FB www

  var enableLazyContextPropagation = false; // FB-only usage. The new API has different semantics.

  var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber

  var enableSuspenseAvoidThisFallback = false; // Enables unstable_avoidThisFallback feature in Fizz
  // React DOM Chopping Block
  //
  // Similar to main Chopping Block but only flags related to React DOM. These are
  // grouped because we will likely batch all of them into a single major release.
  // -----------------------------------------------------------------------------
  // Disable support for comment nodes as React DOM containers. Already disabled
  // in open source, but www codebase still relies on it. Need to remove.

  var disableCommentsAsDOMContainers = true; // Disable javascript: URL strings in href for XSS protection.
  // and client rendering, mostly to allow JSX attributes to apply to the custom
  // element's object properties instead of only HTML attributes.
  // https://github.com/facebook/react/issues/11347

  var enableCustomElementPropertySupport = false; // Disables children for <textarea> elements
  var warnAboutStringRefs = true; // -----------------------------------------------------------------------------
  // Debugging and DevTools
  // -----------------------------------------------------------------------------
  // Adds user timing marks for e.g. state updates, suspense, and work loop stuff,
  // for an experimental timeline tool.

  var enableSchedulingProfiler = true; // Helps identify side effects in render-phase lifecycle hooks and setState

  var enableProfilerTimer = true; // Record durations for commit and passive effects phases.

  var enableProfilerCommitHooks = true; // Phase param passed to onRender callback differentiates between an "update" and a "cascading-update".

  var allNativeEvents = new Set();
  /**
   * Mapping from registration name to event name
   */


  var registrationNameDependencies = {};
  /**
   * Mapping from lowercase registration names to the properly cased version,
   * used to warn in the case of missing event handlers. Available
   * only in true.
   * @type {Object}
   */

  var possibleRegistrationNames =  {} ; // Trust the developer to only use possibleRegistrationNames in true

  function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + 'Capture', dependencies);
  }
  function registerDirectEvent(registrationName, dependencies) {
    {
      if (registrationNameDependencies[registrationName]) {
        error('EventRegistry: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName);
      }
    }

    registrationNameDependencies[registrationName] = dependencies;

    {
      var lowerCasedName = registrationName.toLowerCase();
      possibleRegistrationNames[lowerCasedName] = registrationName;

      if (registrationName === 'onDoubleClick') {
        possibleRegistrationNames.ondblclick = registrationName;
      }
    }

    for (var i = 0; i < dependencies.length; i++) {
      allNativeEvents.add(dependencies[i]);
    }
  }

  var canUseDOM = !!(typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined');

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  /*
   * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
   * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
   *
   * The functions in this module will throw an easier-to-understand,
   * easier-to-debug exception with a clear errors message message explaining the
   * problem. (Instead of a confusing exception thrown inside the implementation
   * of the `value` object).
   */
  // $FlowFixMe only called in DEV, so void return is not possible.
  function typeName(value) {
    {
      // toStringTag is needed for namespaced types like Temporal.Instant
      var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
      var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
      return type;
    }
  } // $FlowFixMe only called in DEV, so void return is not possible.


  function willCoercionThrow(value) {
    {
      try {
        testStringCoercion(value);
        return false;
      } catch (e) {
        return true;
      }
    }
  }

  function testStringCoercion(value) {
    // If you ended up here by following an exception call stack, here's what's
    // happened: you supplied an object or symbol value to React (as a prop, key,
    // DOM attribute, CSS property, string ref, etc.) and when React tried to
    // coerce it to a string using `'' + value`, an exception was thrown.
    //
    // The most common types that will cause this exception are `Symbol` instances
    // and Temporal objects like `Temporal.Instant`. But any object that has a
    // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
    // exception. (Library authors do this to prevent users from using built-in
    // numeric operators like `+` or comparison operators like `>=` because custom
    // methods are needed to perform accurate arithmetic or comparison.)
    //
    // To fix the problem, coerce this object or symbol value to a string before
    // passing it to React. The most reliable way is usually `String(value)`.
    //
    // To find which value is throwing, check the browser or debugger console.
    // Before this exception was thrown, there should be `console.error` output
    // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
    // problem and how that type was used: key, atrribute, input value prop, etc.
    // In most cases, this console output also shows the component and its
    // ancestor components where the exception happened.
    //
    // eslint-disable-next-line react-internal/safe-string-coercion
    return '' + value;
  }

  function checkAttributeStringCoercion(value, attributeName) {
    {
      if (willCoercionThrow(value)) {
        error('The provided `%s` attribute is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', attributeName, typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }
  function checkKeyStringCoercion(value) {
    {
      if (willCoercionThrow(value)) {
        error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }
  function checkPropStringCoercion(value, propName) {
    {
      if (willCoercionThrow(value)) {
        error('The provided `%s` prop is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', propName, typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }
  function checkCSSPropertyStringCoercion(value, propName) {
    {
      if (willCoercionThrow(value)) {
        error('The provided `%s` CSS property is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', propName, typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }
  function checkHtmlStringCoercion(value) {
    {
      if (willCoercionThrow(value)) {
        error('The provided HTML markup uses a value of unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }
  function checkFormFieldValueStringCoercion(value) {
    {
      if (willCoercionThrow(value)) {
        error('Form field values (value, checked, defaultValue, or defaultChecked props)' + ' must be strings, not %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

        return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
      }
    }
  }

  // A reserved attribute.
  // It is handled by React separately and shouldn't be written to the DOM.
  var RESERVED = 0; // A simple string attribute.
  // Attributes that aren't in the filter are presumed to have this type.

  var STRING = 1; // A string attribute that accepts booleans in React. In HTML, these are called
  // "enumerated" attributes with "true" and "false" as possible values.
  // When true, it should be set to a "true" string.
  // When false, it should be set to a "false" string.

  var BOOLEANISH_STRING = 2; // A real boolean attribute.
  // When true, it should be present (set either to an empty string or its name).
  // When false, it should be omitted.

  var BOOLEAN = 3; // An attribute that can be used as a flag as well as with a value.
  // When true, it should be present (set either to an empty string or its name).
  // When false, it should be omitted.
  // For any other value, should be present with that value.

  var OVERLOADED_BOOLEAN = 4; // An attribute that must be numeric or parse as a numeric.
  // When falsy, it should be removed.

  var NUMERIC = 5; // An attribute that must be positive numeric or parse as a positive numeric.
  // When falsy, it should be removed.

  var POSITIVE_NUMERIC = 6;

  /* eslint-disable max-len */
  var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
  /* eslint-enable max-len */

  var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
  var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
  var illegalAttributeNameCache = {};
  var validatedAttributeNameCache = {};
  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
      return true;
    }

    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
      return false;
    }

    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
      validatedAttributeNameCache[attributeName] = true;
      return true;
    }

    illegalAttributeNameCache[attributeName] = true;

    {
      error('Invalid attribute name: `%s`', attributeName);
    }

    return false;
  }
  function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
    if (propertyInfo !== null) {
      return propertyInfo.type === RESERVED;
    }

    if (isCustomComponentTag) {
      return false;
    }

    if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
      return true;
    }

    return false;
  }
  function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
    if (propertyInfo !== null && propertyInfo.type === RESERVED) {
      return false;
    }

    switch (typeof value) {
      case 'function': // $FlowIssue symbol is perfectly valid here

      case 'symbol':
        // eslint-disable-line
        return true;

      case 'boolean':
        {
          if (isCustomComponentTag) {
            return false;
          }

          if (propertyInfo !== null) {
            return !propertyInfo.acceptsBooleans;
          } else {
            var prefix = name.toLowerCase().slice(0, 5);
            return prefix !== 'data-' && prefix !== 'aria-';
          }
        }

      default:
        return false;
    }
  }
  function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
    if (value === null || typeof value === 'undefined') {
      return true;
    }

    if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag)) {
      return true;
    }

    if (isCustomComponentTag) {

      return false;
    }

    if (propertyInfo !== null) {

      switch (propertyInfo.type) {
        case BOOLEAN:
          return !value;

        case OVERLOADED_BOOLEAN:
          return value === false;

        case NUMERIC:
          return isNaN(value);

        case POSITIVE_NUMERIC:
          return isNaN(value) || value < 1;
      }
    }

    return false;
  }
  function getPropertyInfo(name) {
    return properties.hasOwnProperty(name) ? properties[name] : null;
  }

  function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace, sanitizeURL, removeEmptyString) {
    this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
    this.attributeName = attributeName;
    this.attributeNamespace = attributeNamespace;
    this.mustUseProperty = mustUseProperty;
    this.propertyName = name;
    this.type = type;
    this.sanitizeURL = sanitizeURL;
    this.removeEmptyString = removeEmptyString;
  } // When adding attributes to this list, be sure to also add them to
  // the `possibleStandardNames` module to ensure casing and incorrect
  // name warnings.


  var properties = {}; // These props are reserved by React. They shouldn't be written to the DOM.

  var reservedProps = ['children', 'dangerouslySetInnerHTML', // TODO: This prevents the assignment of defaultValue to regular
  // elements (not just inputs). Now that ReactDOMInput assigns to the
  // defaultValue property -- do we need this?
  'defaultValue', 'defaultChecked', 'innerHTML', 'suppressContentEditableWarning', 'suppressHydrationWarning', 'style'];

  reservedProps.forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, RESERVED, false, // mustUseProperty
    name, // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // A few React string attributes have a different name.
  // This is a mapping from React prop names to the attribute names.

  [['acceptCharset', 'accept-charset'], ['className', 'class'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv']].forEach(function (_ref) {
    var name = _ref[0],
        attributeName = _ref[1];
    properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
    attributeName, // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are "enumerated" HTML attributes that accept "true" and "false".
  // In React, we let users pass `true` and `false` even though technically
  // these aren't boolean attributes (they are coerced to strings).

  ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, // mustUseProperty
    name.toLowerCase(), // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are "enumerated" SVG attributes that accept "true" and "false".
  // In React, we let users pass `true` and `false` even though technically
  // these aren't boolean attributes (they are coerced to strings).
  // Since these are SVG attributes, their attribute names are case-sensitive.

  ['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, // mustUseProperty
    name, // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are HTML boolean attributes.

  ['allowFullScreen', 'async', // Note: there is a special case that prevents it from being written to the DOM
  // on the client side because the browsers are inconsistent. Instead we call focus().
  'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'disablePictureInPicture', 'disableRemotePlayback', 'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed', 'scoped', 'seamless', // Microdata
  'itemScope'].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, // mustUseProperty
    name.toLowerCase(), // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are the few React props that we set as DOM properties
  // rather than attributes. These are all booleans.

  ['checked', // Note: `option.selected` is not updated if `select.multiple` is
  // disabled with `removeAttribute`. We have special logic for handling this.
  'multiple', 'muted', 'selected' // NOTE: if you add a camelCased prop to this list,
  // you'll need to set attributeName to name.toLowerCase()
  // instead in the assignment below.
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, // mustUseProperty
    name, // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are HTML attributes that are "overloaded booleans": they behave like
  // booleans, but can also accept a string value.

  ['capture', 'download' // NOTE: if you add a camelCased prop to this list,
  // you'll need to set attributeName to name.toLowerCase()
  // instead in the assignment below.
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, // mustUseProperty
    name, // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are HTML attributes that must be positive numbers.

  ['cols', 'rows', 'size', 'span' // NOTE: if you add a camelCased prop to this list,
  // you'll need to set attributeName to name.toLowerCase()
  // instead in the assignment below.
  ].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, // mustUseProperty
    name, // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These are HTML attributes that must be numbers.

  ['rowSpan', 'start'].forEach(function (name) {
    properties[name] = new PropertyInfoRecord(name, NUMERIC, false, // mustUseProperty
    name.toLowerCase(), // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  });
  var CAMELIZE = /[\-\:]([a-z])/g;

  var capitalize = function (token) {
    return token[1].toUpperCase();
  }; // This is a list of all SVG attributes that need special casing, namespacing,
  // or boolean value assignment. Regular attributes that just accept strings
  // and have the same names are omitted, just like in the HTML attribute filter.
  // Some of these attributes can be hard to find. This list was created by
  // scraping the MDN documentation.


  ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'xmlns:xlink', 'x-height' // NOTE: if you add a camelCased prop to this list,
  // you'll need to set attributeName to name.toLowerCase()
  // instead in the assignment below.
  ].forEach(function (attributeName) {
    var name = attributeName.replace(CAMELIZE, capitalize);
    properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
    attributeName, null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // String SVG attributes with the xlink namespace.

  ['xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type' // NOTE: if you add a camelCased prop to this list,
  // you'll need to set attributeName to name.toLowerCase()
  // instead in the assignment below.
  ].forEach(function (attributeName) {
    var name = attributeName.replace(CAMELIZE, capitalize);
    properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
    attributeName, 'http://www.w3.org/1999/xlink', false, // sanitizeURL
    false);
  }); // String SVG attributes with the xml namespace.

  ['xml:base', 'xml:lang', 'xml:space' // NOTE: if you add a camelCased prop to this list,
  // you'll need to set attributeName to name.toLowerCase()
  // instead in the assignment below.
  ].forEach(function (attributeName) {
    var name = attributeName.replace(CAMELIZE, capitalize);
    properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
    attributeName, 'http://www.w3.org/XML/1998/namespace', false, // sanitizeURL
    false);
  }); // These attribute exists both in HTML and SVG.
  // The attribute name is case-sensitive in SVG so we can't just use
  // the React name like we do for attributes that exist only in HTML.

  ['tabIndex', 'crossOrigin'].forEach(function (attributeName) {
    properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, // mustUseProperty
    attributeName.toLowerCase(), // attributeName
    null, // attributeNamespace
    false, // sanitizeURL
    false);
  }); // These attributes accept URLs. These must not allow javascript: URLS.
  // These will also need to accept Trusted Types object in the future.

  var xlinkHref = 'xlinkHref';
  properties[xlinkHref] = new PropertyInfoRecord('xlinkHref', STRING, false, // mustUseProperty
  'xlink:href', 'http://www.w3.org/1999/xlink', true, // sanitizeURL
  false);
  ['src', 'href', 'action', 'formAction'].forEach(function (attributeName) {
    properties[attributeName] = new PropertyInfoRecord(attributeName, STRING, false, // mustUseProperty
    attributeName.toLowerCase(), // attributeName
    null, // attributeNamespace
    true, // sanitizeURL
    true);
  });

  // and any newline or tab are filtered out as if they're not part of the URL.
  // https://url.spec.whatwg.org/#url-parsing
  // Tab or newline are defined as \r\n\t:
  // https://infra.spec.whatwg.org/#ascii-tab-or-newline
  // A C0 control is a code point in the range \u0000 NULL to \u001F
  // INFORMATION SEPARATOR ONE, inclusive:
  // https://infra.spec.whatwg.org/#c0-control-or-space

  /* eslint-disable max-len */

  var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
  var didWarn = false;

  function sanitizeURL(url) {
    {
      if (!didWarn && isJavaScriptProtocol.test(url)) {
        didWarn = true;

        error('A future version of React will block javascript: URLs as a security precaution. ' + 'Use event handlers instead if you can. If you need to generate unsafe HTML try ' + 'using dangerouslySetInnerHTML instead. React was passed %s.', JSON.stringify(url));
      }
    }
  }

  /**
   * Get the value for a property on a node. Only used in DEV for SSR validation.
   * The "expected" argument is used as a hint of what the expected value is.
   * Some properties have multiple equivalent values.
   */
  function getValueForProperty(node, name, expected, propertyInfo) {
    {
      if (propertyInfo.mustUseProperty) {
        var propertyName = propertyInfo.propertyName;
        return node[propertyName];
      } else {
        // This check protects multiple uses of `expected`, which is why the
        // react-internal/safe-string-coercion rule is disabled in several spots
        // below.
        {
          checkAttributeStringCoercion(expected, name);
        }

        if ( propertyInfo.sanitizeURL) {
          // If we haven't fully disabled javascript: URLs, and if
          // the hydration is successful of a javascript: URL, we
          // still want to warn on the client.
          // eslint-disable-next-line react-internal/safe-string-coercion
          sanitizeURL('' + expected);
        }

        var attributeName = propertyInfo.attributeName;
        var stringValue = null;

        if (propertyInfo.type === OVERLOADED_BOOLEAN) {
          if (node.hasAttribute(attributeName)) {
            var value = node.getAttribute(attributeName);

            if (value === '') {
              return true;
            }

            if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
              return value;
            } // eslint-disable-next-line react-internal/safe-string-coercion


            if (value === '' + expected) {
              return expected;
            }

            return value;
          }
        } else if (node.hasAttribute(attributeName)) {
          if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
            // We had an attribute but shouldn't have had one, so read it
            // for the error message.
            return node.getAttribute(attributeName);
          }

          if (propertyInfo.type === BOOLEAN) {
            // If this was a boolean, it doesn't matter what the value is
            // the fact that we have it is the same as the expected.
            return expected;
          } // Even if this property uses a namespace we use getAttribute
          // because we assume its namespaced name is the same as our config.
          // To use getAttributeNS we need the local name which we don't have
          // in our config atm.


          stringValue = node.getAttribute(attributeName);
        }

        if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
          return stringValue === null ? expected : stringValue; // eslint-disable-next-line react-internal/safe-string-coercion
        } else if (stringValue === '' + expected) {
          return expected;
        } else {
          return stringValue;
        }
      }
    }
  }
  /**
   * Get the value for a attribute on a node. Only used in DEV for SSR validation.
   * The third argument is used as a hint of what the expected value is. Some
   * attributes have multiple equivalent values.
   */

  function getValueForAttribute(node, name, expected, isCustomComponentTag) {
    {
      if (!isAttributeNameSafe(name)) {
        return;
      }

      if (!node.hasAttribute(name)) {
        return expected === undefined ? undefined : null;
      }

      var value = node.getAttribute(name);

      {
        checkAttributeStringCoercion(expected, name);
      }

      if (value === '' + expected) {
        return expected;
      }

      return value;
    }
  }
  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */

  function setValueForProperty(node, name, value, isCustomComponentTag) {
    var propertyInfo = getPropertyInfo(name);

    if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
      return;
    }

    if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
      value = null;
    }


    if (isCustomComponentTag || propertyInfo === null) {
      if (isAttributeNameSafe(name)) {
        var _attributeName = name;

        if (value === null) {
          node.removeAttribute(_attributeName);
        } else {
          {
            checkAttributeStringCoercion(value, name);
          }

          node.setAttribute(_attributeName,  '' + value);
        }
      }

      return;
    }

    var mustUseProperty = propertyInfo.mustUseProperty;

    if (mustUseProperty) {
      var propertyName = propertyInfo.propertyName;

      if (value === null) {
        var type = propertyInfo.type;
        node[propertyName] = type === BOOLEAN ? false : '';
      } else {
        // Contrary to `setAttribute`, object properties are properly
        // `toString`ed by IE8/9.
        node[propertyName] = value;
      }

      return;
    } // The rest are treated as attributes with special cases.


    var attributeName = propertyInfo.attributeName,
        attributeNamespace = propertyInfo.attributeNamespace;

    if (value === null) {
      node.removeAttribute(attributeName);
    } else {
      var _type = propertyInfo.type;
      var attributeValue;

      if (_type === BOOLEAN || _type === OVERLOADED_BOOLEAN && value === true) {
        // If attribute type is boolean, we know for sure it won't be an execution sink
        // and we won't require Trusted Type here.
        attributeValue = '';
      } else {
        // `setAttribute` with objects becomes only `[object]` in IE8/9,
        // ('' + value) makes it output the correct toString()-value.
        {
          {
            checkAttributeStringCoercion(value, attributeName);
          }

          attributeValue = '' + value;
        }

        if (propertyInfo.sanitizeURL) {
          sanitizeURL(attributeValue.toString());
        }
      }

      if (attributeNamespace) {
        node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
      } else {
        node.setAttribute(attributeName, attributeValue);
      }
    }
  }

  // ATTENTION
  // When adding new symbols to this file,
  // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
  // The Symbol used to tag the ReactElement-like types.
  var REACT_ELEMENT_TYPE = Symbol.for('react.element');
  var REACT_PORTAL_TYPE = Symbol.for('react.portal');
  var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
  var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
  var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
  var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
  var REACT_CONTEXT_TYPE = Symbol.for('react.context');
  var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
  var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
  var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
  var REACT_MEMO_TYPE = Symbol.for('react.memo');
  var REACT_LAZY_TYPE = Symbol.for('react.lazy');
  var REACT_SCOPE_TYPE = Symbol.for('react.scope');
  var REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for('react.debug_trace_mode');
  var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
  var REACT_LEGACY_HIDDEN_TYPE = Symbol.for('react.legacy_hidden');
  var REACT_CACHE_TYPE = Symbol.for('react.cache');
  var REACT_TRACING_MARKER_TYPE = Symbol.for('react.tracing_marker');
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';
  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== 'object') {
      return null;
    }

    var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

    if (typeof maybeIterator === 'function') {
      return maybeIterator;
    }

    return null;
  }

  var assign = Object.assign;

  // Helpers to patch console.logs to avoid logging during side-effect free
  // replaying on render function. This currently only patches the object
  // lazily which won't cover if the log function was extracted eagerly.
  // We could also eagerly patch the method.
  var disabledDepth = 0;
  var prevLog;
  var prevInfo;
  var prevWarn;
  var prevError;
  var prevGroup;
  var prevGroupCollapsed;
  var prevGroupEnd;

  function disabledLog() {}

  disabledLog.__reactDisabledLog = true;
  function disableLogs() {
    {
      if (disabledDepth === 0) {
        /* eslint-disable react-internal/no-production-logging */
        prevLog = console.log;
        prevInfo = console.info;
        prevWarn = console.warn;
        prevError = console.error;
        prevGroup = console.group;
        prevGroupCollapsed = console.groupCollapsed;
        prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

        var props = {
          configurable: true,
          enumerable: true,
          value: disabledLog,
          writable: true
        }; // $FlowFixMe Flow thinks console is immutable.

        Object.defineProperties(console, {
          info: props,
          log: props,
          warn: props,
          error: props,
          group: props,
          groupCollapsed: props,
          groupEnd: props
        });
        /* eslint-enable react-internal/no-production-logging */
      }

      disabledDepth++;
    }
  }
  function reenableLogs() {
    {
      disabledDepth--;

      if (disabledDepth === 0) {
        /* eslint-disable react-internal/no-production-logging */
        var props = {
          configurable: true,
          enumerable: true,
          writable: true
        }; // $FlowFixMe Flow thinks console is immutable.

        Object.defineProperties(console, {
          log: assign({}, props, {
            value: prevLog
          }),
          info: assign({}, props, {
            value: prevInfo
          }),
          warn: assign({}, props, {
            value: prevWarn
          }),
          error: assign({}, props, {
            value: prevError
          }),
          group: assign({}, props, {
            value: prevGroup
          }),
          groupCollapsed: assign({}, props, {
            value: prevGroupCollapsed
          }),
          groupEnd: assign({}, props, {
            value: prevGroupEnd
          })
        });
        /* eslint-enable react-internal/no-production-logging */
      }

      if (disabledDepth < 0) {
        error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
      }
    }
  }

  var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
  var prefix;
  function describeBuiltInComponentFrame(name, source, ownerFn) {
    {
      if (prefix === undefined) {
        // Extract the VM specific prefix used by each line.
        try {
          throw Error();
        } catch (x) {
          var match = x.stack.trim().match(/\n( *(at )?)/);
          prefix = match && match[1] || '';
        }
      } // We use the prefix to ensure our stacks line up with native stack frames.


      return '\n' + prefix + name;
    }
  }
  var reentry = false;
  var componentFrameCache;

  {
    var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
    componentFrameCache = new PossiblyWeakMap();
  }

  function describeNativeComponentFrame(fn, construct) {
    // If something asked for a stack inside a fake render, it should get ignored.
    if ( !fn || reentry) {
      return '';
    }

    {
      var frame = componentFrameCache.get(fn);

      if (frame !== undefined) {
        return frame;
      }
    }

    var control;
    reentry = true;
    var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

    Error.prepareStackTrace = undefined;
    var previousDispatcher;

    {
      previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
      // for warnings.

      ReactCurrentDispatcher.current = null;
      disableLogs();
    }

    try {
      // This should throw.
      if (construct) {
        // Something should be setting the props in the constructor.
        var Fake = function () {
          throw Error();
        }; // $FlowFixMe


        Object.defineProperty(Fake.prototype, 'props', {
          set: function () {
            // We use a throwing setter instead of frozen or non-writable props
            // because that won't throw in a non-strict mode function.
            throw Error();
          }
        });

        if (typeof Reflect === 'object' && Reflect.construct) {
          // We construct a different control for this case to include any extra
          // frames added by the construct call.
          try {
            Reflect.construct(Fake, []);
          } catch (x) {
            control = x;
          }

          Reflect.construct(fn, [], Fake);
        } else {
          try {
            Fake.call();
          } catch (x) {
            control = x;
          }

          fn.call(Fake.prototype);
        }
      } else {
        try {
          throw Error();
        } catch (x) {
          control = x;
        }

        fn();
      }
    } catch (sample) {
      // This is inlined manually because closure doesn't do it for us.
      if (sample && control && typeof sample.stack === 'string') {
        // This extracts the first frame from the sample that isn't also in the control.
        // Skipping one frame that we assume is the frame that calls the two.
        var sampleLines = sample.stack.split('\n');
        var controlLines = control.stack.split('\n');
        var s = sampleLines.length - 1;
        var c = controlLines.length - 1;

        while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
          // We expect at least one stack frame to be shared.
          // Typically this will be the root most one. However, stack frames may be
          // cut off due to maximum stack limits. In this case, one maybe cut off
          // earlier than the other. We assume that the sample is longer or the same
          // and there for cut off earlier. So we should find the root most frame in
          // the sample somewhere in the control.
          c--;
        }

        for (; s >= 1 && c >= 0; s--, c--) {
          // Next we find the first one that isn't the same which should be the
          // frame that called our sample function and the control.
          if (sampleLines[s] !== controlLines[c]) {
            // In V8, the first line is describing the message but other VMs don't.
            // If we're about to return the first line, and the control is also on the same
            // line, that's a pretty good indicator that our sample threw at same line as
            // the control. I.e. before we entered the sample frame. So we ignore this result.
            // This can happen if you passed a class to function component, or non-function.
            if (s !== 1 || c !== 1) {
              do {
                s--;
                c--; // We may still have similar intermediate frames from the construct call.
                // The next one that isn't the same should be our match though.

                if (c < 0 || sampleLines[s] !== controlLines[c]) {
                  // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                  var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                  // but we have a user-provided "displayName"
                  // splice it in to make the stack more readable.


                  if (fn.displayName && _frame.includes('<anonymous>')) {
                    _frame = _frame.replace('<anonymous>', fn.displayName);
                  }

                  {
                    if (typeof fn === 'function') {
                      componentFrameCache.set(fn, _frame);
                    }
                  } // Return the line we found.


                  return _frame;
                }
              } while (s >= 1 && c >= 0);
            }

            break;
          }
        }
      }
    } finally {
      reentry = false;

      {
        ReactCurrentDispatcher.current = previousDispatcher;
        reenableLogs();
      }

      Error.prepareStackTrace = previousPrepareStackTrace;
    } // Fallback to just using the name if we couldn't make it throw.


    var name = fn ? fn.displayName || fn.name : '';
    var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

    {
      if (typeof fn === 'function') {
        componentFrameCache.set(fn, syntheticFrame);
      }
    }

    return syntheticFrame;
  }

  function describeClassComponentFrame(ctor, source, ownerFn) {
    {
      return describeNativeComponentFrame(ctor, true);
    }
  }
  function describeFunctionComponentFrame(fn, source, ownerFn) {
    {
      return describeNativeComponentFrame(fn, false);
    }
  }

  function shouldConstruct(Component) {
    var prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
  }

  function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

    if (type == null) {
      return '';
    }

    if (typeof type === 'function') {
      {
        return describeNativeComponentFrame(type, shouldConstruct(type));
      }
    }

    if (typeof type === 'string') {
      return describeBuiltInComponentFrame(type);
    }

    switch (type) {
      case REACT_SUSPENSE_TYPE:
        return describeBuiltInComponentFrame('Suspense');

      case REACT_SUSPENSE_LIST_TYPE:
        return describeBuiltInComponentFrame('SuspenseList');
    }

    if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          return describeFunctionComponentFrame(type.render);

        case REACT_MEMO_TYPE:
          // Memo may contain any component type so we recursively resolve it.
          return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

        case REACT_LAZY_TYPE:
          {
            var lazyComponent = type;
            var payload = lazyComponent._payload;
            var init = lazyComponent._init;

            try {
              // Lazy may contain any component type so we recursively resolve it.
              return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
            } catch (x) {}
          }
      }
    }

    return '';
  }

  function describeFiber(fiber) {
    var owner =  fiber._debugOwner ? fiber._debugOwner.type : null ;
    var source =  fiber._debugSource ;

    switch (fiber.tag) {
      case HostComponent:
        return describeBuiltInComponentFrame(fiber.type);

      case LazyComponent:
        return describeBuiltInComponentFrame('Lazy');

      case SuspenseComponent:
        return describeBuiltInComponentFrame('Suspense');

      case SuspenseListComponent:
        return describeBuiltInComponentFrame('SuspenseList');

      case FunctionComponent:
      case IndeterminateComponent:
      case SimpleMemoComponent:
        return describeFunctionComponentFrame(fiber.type);

      case ForwardRef:
        return describeFunctionComponentFrame(fiber.type.render);

      case ClassComponent:
        return describeClassComponentFrame(fiber.type);

      default:
        return '';
    }
  }

  function getStackByFiberInDevAndProd(workInProgress) {
    try {
      var info = '';
      var node = workInProgress;

      do {
        info += describeFiber(node);
        node = node.return;
      } while (node);

      return info;
    } catch (x) {
      return '\nError generating stack: ' + x.message + '\n' + x.stack;
    }
  }

  function getWrappedName(outerType, innerType, wrapperName) {
    var displayName = outerType.displayName;

    if (displayName) {
      return displayName;
    }

    var functionName = innerType.displayName || innerType.name || '';
    return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
  } // Keep in sync with react-reconciler/getComponentNameFromFiber


  function getContextName(type) {
    return type.displayName || 'Context';
  } // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


  function getComponentNameFromType(type) {
    if (type == null) {
      // Host root, text node or just invalid type.
      return null;
    }

    {
      if (typeof type.tag === 'number') {
        error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
      }
    }

    if (typeof type === 'function') {
      return type.displayName || type.name || null;
    }

    if (typeof type === 'string') {
      return type;
    }

    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return 'Fragment';

      case REACT_PORTAL_TYPE:
        return 'Portal';

      case REACT_PROFILER_TYPE:
        return 'Profiler';

      case REACT_STRICT_MODE_TYPE:
        return 'StrictMode';

      case REACT_SUSPENSE_TYPE:
        return 'Suspense';

      case REACT_SUSPENSE_LIST_TYPE:
        return 'SuspenseList';

    }

    if (typeof type === 'object') {
      switch (type.$$typeof) {
        case REACT_CONTEXT_TYPE:
          var context = type;
          return getContextName(context) + '.Consumer';

        case REACT_PROVIDER_TYPE:
          var provider = type;
          return getContextName(provider._context) + '.Provider';

        case REACT_FORWARD_REF_TYPE:
          return getWrappedName(type, type.render, 'ForwardRef');

        case REACT_MEMO_TYPE:
          var outerName = type.displayName || null;

          if (outerName !== null) {
            return outerName;
          }

          return getComponentNameFromType(type.type) || 'Memo';

        case REACT_LAZY_TYPE:
          {
            var lazyComponent = type;
            var payload = lazyComponent._payload;
            var init = lazyComponent._init;

            try {
              return getComponentNameFromType(init(payload));
            } catch (x) {
              return null;
            }
          }

        // eslint-disable-next-line no-fallthrough
      }
    }

    return null;
  }

  function getWrappedName$1(outerType, innerType, wrapperName) {
    var functionName = innerType.displayName || innerType.name || '';
    return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
  } // Keep in sync with shared/getComponentNameFromType


  function getContextName$1(type) {
    return type.displayName || 'Context';
  }

  function getComponentNameFromFiber(fiber) {
    var tag = fiber.tag,
        type = fiber.type;

    switch (tag) {
      case CacheComponent:
        return 'Cache';

      case ContextConsumer:
        var context = type;
        return getContextName$1(context) + '.Consumer';

      case ContextProvider:
        var provider = type;
        return getContextName$1(provider._context) + '.Provider';

      case DehydratedFragment:
        return 'DehydratedFragment';

      case ForwardRef:
        return getWrappedName$1(type, type.render, 'ForwardRef');

      case Fragment:
        return 'Fragment';

      case HostComponent:
        // Host component type is the display name (e.g. "div", "View")
        return type;

      case HostPortal:
        return 'Portal';

      case HostRoot:
        return 'Root';

      case HostText:
        return 'Text';

      case LazyComponent:
        // Name comes from the type in this case; we don't have a tag.
        return getComponentNameFromType(type);

      case Mode:
        if (type === REACT_STRICT_MODE_TYPE) {
          // Don't be less specific than shared/getComponentNameFromType
          return 'StrictMode';
        }

        return 'Mode';

      case OffscreenComponent:
        return 'Offscreen';

      case Profiler:
        return 'Profiler';

      case ScopeComponent:
        return 'Scope';

      case SuspenseComponent:
        return 'Suspense';

      case SuspenseListComponent:
        return 'SuspenseList';

      case TracingMarkerComponent:
        return 'TracingMarker';
      // The display name for this tags come from the user-provided type:

      case ClassComponent:
      case FunctionComponent:
      case IncompleteClassComponent:
      case IndeterminateComponent:
      case MemoComponent:
      case SimpleMemoComponent:
        if (typeof type === 'function') {
          return type.displayName || type.name || null;
        }

        if (typeof type === 'string') {
          return type;
        }

        break;

    }

    return null;
  }

  var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
  var current = null;
  var isRendering = false;
  function getCurrentFiberOwnerNameInDevOrNull() {
    {
      if (current === null) {
        return null;
      }

      var owner = current._debugOwner;

      if (owner !== null && typeof owner !== 'undefined') {
        return getComponentNameFromFiber(owner);
      }
    }

    return null;
  }

  function getCurrentFiberStackInDev() {
    {
      if (current === null) {
        return '';
      } // Safe because if current fiber exists, we are reconciling,
      // and it is guaranteed to be the work-in-progress version.


      return getStackByFiberInDevAndProd(current);
    }
  }

  function resetCurrentFiber() {
    {
      ReactDebugCurrentFrame.getCurrentStack = null;
      current = null;
      isRendering = false;
    }
  }
  function setCurrentFiber(fiber) {
    {
      ReactDebugCurrentFrame.getCurrentStack = fiber === null ? null : getCurrentFiberStackInDev;
      current = fiber;
      isRendering = false;
    }
  }
  function getCurrentFiber() {
    {
      return current;
    }
  }
  function setIsRendering(rendering) {
    {
      isRendering = rendering;
    }
  }

  // Flow does not allow string concatenation of most non-string types. To work
  // around this limitation, we use an opaque type that can only be obtained by
  // passing the value through getToStringValue first.
  function toString(value) {
    // The coercion safety check is performed in getToStringValue().
    // eslint-disable-next-line react-internal/safe-string-coercion
    return '' + value;
  }
  function getToStringValue(value) {
    switch (typeof value) {
      case 'boolean':
      case 'number':
      case 'string':
      case 'undefined':
        return value;

      case 'object':
        {
          checkFormFieldValueStringCoercion(value);
        }

        return value;

      default:
        // function, symbol are assigned as empty strings
        return '';
    }
  }

  var hasReadOnlyValue = {
    button: true,
    checkbox: true,
    image: true,
    hidden: true,
    radio: true,
    reset: true,
    submit: true
  };
  function checkControlledValueProps(tagName, props) {
    {
      if (!(hasReadOnlyValue[props.type] || props.onChange || props.onInput || props.readOnly || props.disabled || props.value == null)) {
        error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
      }

      if (!(props.onChange || props.readOnly || props.disabled || props.checked == null)) {
        error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
      }
    }
  }

  function isCheckable(elem) {
    var type = elem.type;
    var nodeName = elem.nodeName;
    return nodeName && nodeName.toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio');
  }

  function getTracker(node) {
    return node._valueTracker;
  }

  function detachTracker(node) {
    node._valueTracker = null;
  }

  function getValueFromNode(node) {
    var value = '';

    if (!node) {
      return value;
    }

    if (isCheckable(node)) {
      value = node.checked ? 'true' : 'false';
    } else {
      value = node.value;
    }

    return value;
  }

  function trackValueOnNode(node) {
    var valueField = isCheckable(node) ? 'checked' : 'value';
    var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);

    {
      checkFormFieldValueStringCoercion(node[valueField]);
    }

    var currentValue = '' + node[valueField]; // if someone has already defined a value or Safari, then bail
    // and don't track value will cause over reporting of changes,
    // but it's better then a hard failure
    // (needed for certain tests that spyOn input values and Safari)

    if (node.hasOwnProperty(valueField) || typeof descriptor === 'undefined' || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') {
      return;
    }

    var get = descriptor.get,
        set = descriptor.set;
    Object.defineProperty(node, valueField, {
      configurable: true,
      get: function () {
        return get.call(this);
      },
      set: function (value) {
        {
          checkFormFieldValueStringCoercion(value);
        }

        currentValue = '' + value;
        set.call(this, value);
      }
    }); // We could've passed this the first time
    // but it triggers a bug in IE11 and Edge 14/15.
    // Calling defineProperty() again should be equivalent.
    // https://github.com/facebook/react/issues/11768

    Object.defineProperty(node, valueField, {
      enumerable: descriptor.enumerable
    });
    var tracker = {
      getValue: function () {
        return currentValue;
      },
      setValue: function (value) {
        {
          checkFormFieldValueStringCoercion(value);
        }

        currentValue = '' + value;
      },
      stopTracking: function () {
        detachTracker(node);
        delete node[valueField];
      }
    };
    return tracker;
  }

  function track(node) {
    if (getTracker(node)) {
      return;
    } // TODO: Once it's just Fiber we can move this to node._wrapperState


    node._valueTracker = trackValueOnNode(node);
  }
  function updateValueIfChanged(node) {
    if (!node) {
      return false;
    }

    var tracker = getTracker(node); // if there is no tracker at this point it's unlikely
    // that trying again will succeed

    if (!tracker) {
      return true;
    }

    var lastValue = tracker.getValue();
    var nextValue = getValueFromNode(node);

    if (nextValue !== lastValue) {
      tracker.setValue(nextValue);
      return true;
    }

    return false;
  }

  function getActiveElement(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);

    if (typeof doc === 'undefined') {
      return null;
    }

    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }

  var didWarnValueDefaultValue = false;
  var didWarnCheckedDefaultChecked = false;
  var didWarnControlledToUncontrolled = false;
  var didWarnUncontrolledToControlled = false;

  function isControlled(props) {
    var usesChecked = props.type === 'checkbox' || props.type === 'radio';
    return usesChecked ? props.checked != null : props.value != null;
  }
  /**
   * Implements an <input> host component that allows setting these optional
   * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
   *
   * If `checked` or `value` are not supplied (or null/undefined), user actions
   * that affect the checked state or value will trigger updates to the element.
   *
   * If they are supplied (and not null/undefined), the rendered element will not
   * trigger updates to the element. Instead, the props must change in order for
   * the rendered element to be updated.
   *
   * The rendered element will be initialized as unchecked (or `defaultChecked`)
   * with an empty value (or `defaultValue`).
   *
   * See http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
   */


  function getHostProps(element, props) {
    var node = element;
    var checked = props.checked;
    var hostProps = assign({}, props, {
      defaultChecked: undefined,
      defaultValue: undefined,
      value: undefined,
      checked: checked != null ? checked : node._wrapperState.initialChecked
    });
    return hostProps;
  }
  function initWrapperState(element, props) {
    {
      checkControlledValueProps('input', props);

      if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnCheckedDefaultChecked) {
        error('%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', getCurrentFiberOwnerNameInDevOrNull() || 'A component', props.type);

        didWarnCheckedDefaultChecked = true;
      }

      if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
        error('%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', getCurrentFiberOwnerNameInDevOrNull() || 'A component', props.type);

        didWarnValueDefaultValue = true;
      }
    }

    var node = element;
    var defaultValue = props.defaultValue == null ? '' : props.defaultValue;
    node._wrapperState = {
      initialChecked: props.checked != null ? props.checked : props.defaultChecked,
      initialValue: getToStringValue(props.value != null ? props.value : defaultValue),
      controlled: isControlled(props)
    };
  }
  function updateChecked(element, props) {
    var node = element;
    var checked = props.checked;

    if (checked != null) {
      setValueForProperty(node, 'checked', checked, false);
    }
  }
  function updateWrapper(element, props) {
    var node = element;

    {
      var controlled = isControlled(props);

      if (!node._wrapperState.controlled && controlled && !didWarnUncontrolledToControlled) {
        error('A component is changing an uncontrolled input to be controlled. ' + 'This is likely caused by the value changing from undefined to ' + 'a defined value, which should not happen. ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components');

        didWarnUncontrolledToControlled = true;
      }

      if (node._wrapperState.controlled && !controlled && !didWarnControlledToUncontrolled) {
        error('A component is changing a controlled input to be uncontrolled. ' + 'This is likely caused by the value changing from a defined to ' + 'undefined, which should not happen. ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components');

        didWarnControlledToUncontrolled = true;
      }
    }

    updateChecked(element, props);
    var value = getToStringValue(props.value);
    var type = props.type;

    if (value != null) {
      if (type === 'number') {
        if (value === 0 && node.value === '' || // We explicitly want to coerce to number here if possible.
        // eslint-disable-next-line
        node.value != value) {
          node.value = toString(value);
        }
      } else if (node.value !== toString(value)) {
        node.value = toString(value);
      }
    } else if (type === 'submit' || type === 'reset') {
      // Submit/reset inputs need the attribute removed completely to avoid
      // blank-text buttons.
      node.removeAttribute('value');
      return;
    }

    {
      // When syncing the value attribute, the value comes from a cascade of
      // properties:
      //  1. The value React property
      //  2. The defaultValue React property
      //  3. Otherwise there should be no change
      if (props.hasOwnProperty('value')) {
        setDefaultValue(node, props.type, value);
      } else if (props.hasOwnProperty('defaultValue')) {
        setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
      }
    }

    {
      // When syncing the checked attribute, it only changes when it needs
      // to be removed, such as transitioning from a checkbox into a text input
      if (props.checked == null && props.defaultChecked != null) {
        node.defaultChecked = !!props.defaultChecked;
      }
    }
  }
  function postMountWrapper(element, props, isHydrating) {
    var node = element; // Do not assign value if it is already set. This prevents user text input
    // from being lost during SSR hydration.

    if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
      var type = props.type;
      var isButton = type === 'submit' || type === 'reset'; // Avoid setting value attribute on submit/reset inputs as it overrides the
      // default value provided by the browser. See: #12872

      if (isButton && (props.value === undefined || props.value === null)) {
        return;
      }

      var initialValue = toString(node._wrapperState.initialValue); // Do not assign value if it is already set. This prevents user text input
      // from being lost during SSR hydration.

      if (!isHydrating) {
        {
          // When syncing the value attribute, the value property should use
          // the wrapperState._initialValue property. This uses:
          //
          //   1. The value React property when present
          //   2. The defaultValue React property when present
          //   3. An empty string
          if (initialValue !== node.value) {
            node.value = initialValue;
          }
        }
      }

      {
        // Otherwise, the value attribute is synchronized to the property,
        // so we assign defaultValue to the same thing as the value property
        // assignment step above.
        node.defaultValue = initialValue;
      }
    } // Normally, we'd just do `node.checked = node.checked` upon initial mount, less this bug
    // this is needed to work around a chrome bug where setting defaultChecked
    // will sometimes influence the value of checked (even after detachment).
    // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=608416
    // We need to temporarily unset name to avoid disrupting radio button groups.


    var name = node.name;

    if (name !== '') {
      node.name = '';
    }

    {
      // When syncing the checked attribute, both the checked property and
      // attribute are assigned at the same time using defaultChecked. This uses:
      //
      //   1. The checked React property when present
      //   2. The defaultChecked React property when present
      //   3. Otherwise, false
      node.defaultChecked = !node.defaultChecked;
      node.defaultChecked = !!node._wrapperState.initialChecked;
    }

    if (name !== '') {
      node.name = name;
    }
  }
  function restoreControlledState(element, props) {
    var node = element;
    updateWrapper(node, props);
    updateNamedCousins(node, props);
  }

  function updateNamedCousins(rootNode, props) {
    var name = props.name;

    if (props.type === 'radio' && name != null) {
      var queryRoot = rootNode;

      while (queryRoot.parentNode) {
        queryRoot = queryRoot.parentNode;
      } // If `rootNode.form` was non-null, then we could try `form.elements`,
      // but that sometimes behaves strangely in IE8. We could also try using
      // `form.getElementsByName`, but that will only return direct children
      // and won't include inputs that use the HTML5 `form=` attribute. Since
      // the input might not even be in a form. It might not even be in the
      // document. Let's just use the local `querySelectorAll` to ensure we don't
      // miss anything.


      {
        checkAttributeStringCoercion(name, 'name');
      }

      var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');

      for (var i = 0; i < group.length; i++) {
        var otherNode = group[i];

        if (otherNode === rootNode || otherNode.form !== rootNode.form) {
          continue;
        } // This will throw if radio buttons rendered by different copies of React
        // and the same name are rendered into the same form (same as #1939).
        // That's probably okay; we don't support it just as we don't support
        // mixing React radio buttons with non-React ones.


        var otherProps = getFiberCurrentPropsFromNode(otherNode);

        if (!otherProps) {
          throw new Error('ReactDOMInput: Mixing React and non-React radio inputs with the ' + 'same `name` is not supported.');
        } // We need update the tracked value on the named cousin since the value
        // was changed but the input saw no event or value set


        updateValueIfChanged(otherNode); // If this is a controlled radio button group, forcing the input that
        // was previously checked to update will cause it to be come re-checked
        // as appropriate.

        updateWrapper(otherNode, otherProps);
      }
    }
  } // In Chrome, assigning defaultValue to certain input types triggers input validation.
  // For number inputs, the display value loses trailing decimal points. For email inputs,
  // Chrome raises "The specified value <x> is not a valid email address".
  //
  // Here we check to see if the defaultValue has actually changed, avoiding these problems
  // when the user is inputting text
  //
  // https://github.com/facebook/react/issues/7253


  function setDefaultValue(node, type, value) {
    if ( // Focused number inputs synchronize on blur. See ChangeEventPlugin.js
    type !== 'number' || getActiveElement(node.ownerDocument) !== node) {
      if (value == null) {
        node.defaultValue = toString(node._wrapperState.initialValue);
      } else if (node.defaultValue !== toString(value)) {
        node.defaultValue = toString(value);
      }
    }
  }

  var didWarnSelectedSetOnOption = false;
  var didWarnInvalidChild = false;
  var didWarnInvalidInnerHTML = false;
  /**
   * Implements an <option> host component that warns when `selected` is set.
   */

  function validateProps(element, props) {
    {
      // If a value is not provided, then the children must be simple.
      if (props.value == null) {
        if (typeof props.children === 'object' && props.children !== null) {
          React.Children.forEach(props.children, function (child) {
            if (child == null) {
              return;
            }

            if (typeof child === 'string' || typeof child === 'number') {
              return;
            }

            if (!didWarnInvalidChild) {
              didWarnInvalidChild = true;

              error('Cannot infer the option value of complex children. ' + 'Pass a `value` prop or use a plain string as children to <option>.');
            }
          });
        } else if (props.dangerouslySetInnerHTML != null) {
          if (!didWarnInvalidInnerHTML) {
            didWarnInvalidInnerHTML = true;

            error('Pass a `value` prop if you set dangerouslyInnerHTML so React knows ' + 'which value should be selected.');
          }
        }
      } // TODO: Remove support for `selected` in <option>.


      if (props.selected != null && !didWarnSelectedSetOnOption) {
        error('Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.');

        didWarnSelectedSetOnOption = true;
      }
    }
  }
  function postMountWrapper$1(element, props) {
    // value="" should make a value attribute (#6219)
    if (props.value != null) {
      element.setAttribute('value', toString(getToStringValue(props.value)));
    }
  }

  var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

  function isArray(a) {
    return isArrayImpl(a);
  }

  var didWarnValueDefaultValue$1;

  {
    didWarnValueDefaultValue$1 = false;
  }

  function getDeclarationErrorAddendum() {
    var ownerName = getCurrentFiberOwnerNameInDevOrNull();

    if (ownerName) {
      return '\n\nCheck the render method of `' + ownerName + '`.';
    }

    return '';
  }

  var valuePropNames = ['value', 'defaultValue'];
  /**
   * Validation function for `value` and `defaultValue`.
   */

  function checkSelectPropTypes(props) {
    {
      checkControlledValueProps('select', props);

      for (var i = 0; i < valuePropNames.length; i++) {
        var propName = valuePropNames[i];

        if (props[propName] == null) {
          continue;
        }

        var propNameIsArray = isArray(props[propName]);

        if (props.multiple && !propNameIsArray) {
          error('The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum());
        } else if (!props.multiple && propNameIsArray) {
          error('The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum());
        }
      }
    }
  }

  function updateOptions(node, multiple, propValue, setDefaultSelected) {
    var options = node.options;

    if (multiple) {
      var selectedValues = propValue;
      var selectedValue = {};

      for (var i = 0; i < selectedValues.length; i++) {
        // Prefix to avoid chaos with special keys.
        selectedValue['$' + selectedValues[i]] = true;
      }

      for (var _i = 0; _i < options.length; _i++) {
        var selected = selectedValue.hasOwnProperty('$' + options[_i].value);

        if (options[_i].selected !== selected) {
          options[_i].selected = selected;
        }

        if (selected && setDefaultSelected) {
          options[_i].defaultSelected = true;
        }
      }
    } else {
      // Do not set `select.value` as exact behavior isn't consistent across all
      // browsers for all cases.
      var _selectedValue = toString(getToStringValue(propValue));

      var defaultSelected = null;

      for (var _i2 = 0; _i2 < options.length; _i2++) {
        if (options[_i2].value === _selectedValue) {
          options[_i2].selected = true;

          if (setDefaultSelected) {
            options[_i2].defaultSelected = true;
          }

          return;
        }

        if (defaultSelected === null && !options[_i2].disabled) {
          defaultSelected = options[_i2];
        }
      }

      if (defaultSelected !== null) {
        defaultSelected.selected = true;
      }
    }
  }
  /**
   * Implements a <select> host component that allows optionally setting the
   * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
   * stringable. If `multiple` is true, the prop must be an array of stringables.
   *
   * If `value` is not supplied (or null/undefined), user actions that change the
   * selected option will trigger updates to the rendered options.
   *
   * If it is supplied (and not null/undefined), the rendered options will not
   * update in response to user actions. Instead, the `value` prop must change in
   * order for the rendered options to update.
   *
   * If `defaultValue` is provided, any options with the supplied values will be
   * selected.
   */


  function getHostProps$1(element, props) {
    return assign({}, props, {
      value: undefined
    });
  }
  function initWrapperState$1(element, props) {
    var node = element;

    {
      checkSelectPropTypes(props);
    }

    node._wrapperState = {
      wasMultiple: !!props.multiple
    };

    {
      if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue$1) {
        error('Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components');

        didWarnValueDefaultValue$1 = true;
      }
    }
  }
  function postMountWrapper$2(element, props) {
    var node = element;
    node.multiple = !!props.multiple;
    var value = props.value;

    if (value != null) {
      updateOptions(node, !!props.multiple, value, false);
    } else if (props.defaultValue != null) {
      updateOptions(node, !!props.multiple, props.defaultValue, true);
    }
  }
  function postUpdateWrapper(element, props) {
    var node = element;
    var wasMultiple = node._wrapperState.wasMultiple;
    node._wrapperState.wasMultiple = !!props.multiple;
    var value = props.value;

    if (value != null) {
      updateOptions(node, !!props.multiple, value, false);
    } else if (wasMultiple !== !!props.multiple) {
      // For simplicity, reapply `defaultValue` if `multiple` is toggled.
      if (props.defaultValue != null) {
        updateOptions(node, !!props.multiple, props.defaultValue, true);
      } else {
        // Revert the select back to its default unselected state.
        updateOptions(node, !!props.multiple, props.multiple ? [] : '', false);
      }
    }
  }
  function restoreControlledState$1(element, props) {
    var node = element;
    var value = props.value;

    if (value != null) {
      updateOptions(node, !!props.multiple, value, false);
    }
  }

  var didWarnValDefaultVal = false;

  /**
   * Implements a <textarea> host component that allows setting `value`, and
   * `defaultValue`. This differs from the traditional DOM API because value is
   * usually set as PCDATA children.
   *
   * If `value` is not supplied (or null/undefined), user actions that affect the
   * value will trigger updates to the element.
   *
   * If `value` is supplied (and not null/undefined), the rendered element will
   * not trigger updates to the element. Instead, the `value` prop must change in
   * order for the rendered element to be updated.
   *
   * The rendered element will be initialized with an empty value, the prop
   * `defaultValue` if specified, or the children content (deprecated).
   */
  function getHostProps$2(element, props) {
    var node = element;

    if (props.dangerouslySetInnerHTML != null) {
      throw new Error('`dangerouslySetInnerHTML` does not make sense on <textarea>.');
    } // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.  We could add a check in setTextContent
    // to only set the value if/when the value differs from the node value (which would
    // completely solve this IE9 bug), but Sebastian+Sophie seemed to like this
    // solution. The value can be a boolean or object so that's why it's forced
    // to be a string.


    var hostProps = assign({}, props, {
      value: undefined,
      defaultValue: undefined,
      children: toString(node._wrapperState.initialValue)
    });

    return hostProps;
  }
  function initWrapperState$2(element, props) {
    var node = element;

    {
      checkControlledValueProps('textarea', props);

      if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValDefaultVal) {
        error('%s contains a textarea with both value and defaultValue props. ' + 'Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://reactjs.org/link/controlled-components', getCurrentFiberOwnerNameInDevOrNull() || 'A component');

        didWarnValDefaultVal = true;
      }
    }

    var initialValue = props.value; // Only bother fetching default value if we're going to use it

    if (initialValue == null) {
      var children = props.children,
          defaultValue = props.defaultValue;

      if (children != null) {
        {
          error('Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
        }

        {
          if (defaultValue != null) {
            throw new Error('If you supply `defaultValue` on a <textarea>, do not pass children.');
          }

          if (isArray(children)) {
            if (children.length > 1) {
              throw new Error('<textarea> can only have at most one child.');
            }

            children = children[0];
          }

          defaultValue = children;
        }
      }

      if (defaultValue == null) {
        defaultValue = '';
      }

      initialValue = defaultValue;
    }

    node._wrapperState = {
      initialValue: getToStringValue(initialValue)
    };
  }
  function updateWrapper$1(element, props) {
    var node = element;
    var value = getToStringValue(props.value);
    var defaultValue = getToStringValue(props.defaultValue);

    if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
      var newValue = toString(value); // To avoid side effects (such as losing text selection), only set value if changed

      if (newValue !== node.value) {
        node.value = newValue;
      }

      if (props.defaultValue == null && node.defaultValue !== newValue) {
        node.defaultValue = newValue;
      }
    }

    if (defaultValue != null) {
      node.defaultValue = toString(defaultValue);
    }
  }
  function postMountWrapper$3(element, props) {
    var node = element; // This is in postMount because we need access to the DOM node, which is not
    // available until after the component has mounted.

    var textContent = node.textContent; // Only set node.value if textContent is equal to the expected
    // initial value. In IE10/IE11 there is a bug where the placeholder attribute
    // will populate textContent as well.
    // https://developer.microsoft.com/microsoft-edge/platform/issues/101525/

    if (textContent === node._wrapperState.initialValue) {
      if (textContent !== '' && textContent !== null) {
        node.value = textContent;
      }
    }
  }
  function restoreControlledState$2(element, props) {
    // DOM component is still mounted; update
    updateWrapper$1(element, props);
  }

  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg'; // Assumes there is no parent namespace.

  function getIntrinsicNamespace(type) {
    switch (type) {
      case 'svg':
        return SVG_NAMESPACE;

      case 'math':
        return MATH_NAMESPACE;

      default:
        return HTML_NAMESPACE;
    }
  }
  function getChildNamespace(parentNamespace, type) {
    if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
      // No (or default) parent namespace: potential entry point.
      return getIntrinsicNamespace(type);
    }

    if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
      // We're leaving SVG.
      return HTML_NAMESPACE;
    } // By default, pass namespace below.


    return parentNamespace;
  }

  /* globals MSApp */

  /**
   * Create a function which has 'unsafe' privileges (required by windows8 apps)
   */
  var createMicrosoftUnsafeLocalFunction = function (func) {
    if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
      return function (arg0, arg1, arg2, arg3) {
        MSApp.execUnsafeLocalFunction(function () {
          return func(arg0, arg1, arg2, arg3);
        });
      };
    } else {
      return func;
    }
  };

  var reusableSVGContainer;
  /**
   * Set the innerHTML property of a node
   *
   * @param {DOMElement} node
   * @param {string} html
   * @internal
   */

  var setInnerHTML = createMicrosoftUnsafeLocalFunction(function (node, html) {
    if (node.namespaceURI === SVG_NAMESPACE) {

      if (!('innerHTML' in node)) {
        // IE does not have innerHTML for SVG nodes, so instead we inject the
        // new markup in a temp node and then move the child nodes across into
        // the target node
        reusableSVGContainer = reusableSVGContainer || document.createElement('div');
        reusableSVGContainer.innerHTML = '<svg>' + html.valueOf().toString() + '</svg>';
        var svgNode = reusableSVGContainer.firstChild;

        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }

        while (svgNode.firstChild) {
          node.appendChild(svgNode.firstChild);
        }

        return;
      }
    }

    node.innerHTML = html;
  });

  /**
   * HTML nodeType values that represent the type of the node
   */
  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;
  var COMMENT_NODE = 8;
  var DOCUMENT_NODE = 9;
  var DOCUMENT_FRAGMENT_NODE = 11;

  /**
   * Set the textContent property of a node. For text updates, it's faster
   * to set the `nodeValue` of the Text node directly instead of using
   * `.textContent` which will remove the existing node and create a new one.
   *
   * @param {DOMElement} node
   * @param {string} text
   * @internal
   */

  var setTextContent = function (node, text) {
    if (text) {
      var firstChild = node.firstChild;

      if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
        firstChild.nodeValue = text;
        return;
      }
    }

    node.textContent = text;
  };

  // List derived from Gecko source code:
  // https://github.com/mozilla/gecko-dev/blob/4e638efc71/layout/style/test/property_database.js
  var shorthandToLonghand = {
    animation: ['animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction'],
    background: ['backgroundAttachment', 'backgroundClip', 'backgroundColor', 'backgroundImage', 'backgroundOrigin', 'backgroundPositionX', 'backgroundPositionY', 'backgroundRepeat', 'backgroundSize'],
    backgroundPosition: ['backgroundPositionX', 'backgroundPositionY'],
    border: ['borderBottomColor', 'borderBottomStyle', 'borderBottomWidth', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderTopColor', 'borderTopStyle', 'borderTopWidth'],
    borderBlockEnd: ['borderBlockEndColor', 'borderBlockEndStyle', 'borderBlockEndWidth'],
    borderBlockStart: ['borderBlockStartColor', 'borderBlockStartStyle', 'borderBlockStartWidth'],
    borderBottom: ['borderBottomColor', 'borderBottomStyle', 'borderBottomWidth'],
    borderColor: ['borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor'],
    borderImage: ['borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth'],
    borderInlineEnd: ['borderInlineEndColor', 'borderInlineEndStyle', 'borderInlineEndWidth'],
    borderInlineStart: ['borderInlineStartColor', 'borderInlineStartStyle', 'borderInlineStartWidth'],
    borderLeft: ['borderLeftColor', 'borderLeftStyle', 'borderLeftWidth'],
    borderRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'],
    borderRight: ['borderRightColor', 'borderRightStyle', 'borderRightWidth'],
    borderStyle: ['borderBottomStyle', 'borderLeftStyle', 'borderRightStyle', 'borderTopStyle'],
    borderTop: ['borderTopColor', 'borderTopStyle', 'borderTopWidth'],
    borderWidth: ['borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth'],
    columnRule: ['columnRuleColor', 'columnRuleStyle', 'columnRuleWidth'],
    columns: ['columnCount', 'columnWidth'],
    flex: ['flexBasis', 'flexGrow', 'flexShrink'],
    flexFlow: ['flexDirection', 'flexWrap'],
    font: ['fontFamily', 'fontFeatureSettings', 'fontKerning', 'fontLanguageOverride', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'lineHeight'],
    fontVariant: ['fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition'],
    gap: ['columnGap', 'rowGap'],
    grid: ['gridAutoColumns', 'gridAutoFlow', 'gridAutoRows', 'gridTemplateAreas', 'gridTemplateColumns', 'gridTemplateRows'],
    gridArea: ['gridColumnEnd', 'gridColumnStart', 'gridRowEnd', 'gridRowStart'],
    gridColumn: ['gridColumnEnd', 'gridColumnStart'],
    gridColumnGap: ['columnGap'],
    gridGap: ['columnGap', 'rowGap'],
    gridRow: ['gridRowEnd', 'gridRowStart'],
    gridRowGap: ['rowGap'],
    gridTemplate: ['gridTemplateAreas', 'gridTemplateColumns', 'gridTemplateRows'],
    listStyle: ['listStyleImage', 'listStylePosition', 'listStyleType'],
    margin: ['marginBottom', 'marginLeft', 'marginRight', 'marginTop'],
    marker: ['markerEnd', 'markerMid', 'markerStart'],
    mask: ['maskClip', 'maskComposite', 'maskImage', 'maskMode', 'maskOrigin', 'maskPositionX', 'maskPositionY', 'maskRepeat', 'maskSize'],
    maskPosition: ['maskPositionX', 'maskPositionY'],
    outline: ['outlineColor', 'outlineStyle', 'outlineWidth'],
    overflow: ['overflowX', 'overflowY'],
    padding: ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'],
    placeContent: ['alignContent', 'justifyContent'],
    placeItems: ['alignItems', 'justifyItems'],
    placeSelf: ['alignSelf', 'justifySelf'],
    textDecoration: ['textDecorationColor', 'textDecorationLine', 'textDecorationStyle'],
    textEmphasis: ['textEmphasisColor', 'textEmphasisStyle'],
    transition: ['transitionDelay', 'transitionDuration', 'transitionProperty', 'transitionTimingFunction'],
    wordWrap: ['overflowWrap']
  };

  /**
   * CSS properties which accept numbers but are not in units of "px".
   */
  var isUnitlessNumber = {
    animationIterationCount: true,
    aspectRatio: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    columns: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridArea: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowSpan: true,
    gridRowStart: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnSpan: true,
    gridColumnStart: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    // SVG-related properties
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
  };
  /**
   * @param {string} prefix vendor-specific prefix, eg: Webkit
   * @param {string} key style name, eg: transitionDuration
   * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
   * WebkitTransitionDuration
   */

  function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
  }
  /**
   * Support style names that may come passed in prefixed by adding permutations
   * of vendor prefixes.
   */


  var prefixes = ['Webkit', 'ms', 'Moz', 'O']; // Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
  // infinite loop, because it iterates over the newly added props too.

  Object.keys(isUnitlessNumber).forEach(function (prop) {
    prefixes.forEach(function (prefix) {
      isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
    });
  });

  /**
   * Convert a value into the proper css writable value. The style name `name`
   * should be logical (no hyphens), as specified
   * in `CSSProperty.isUnitlessNumber`.
   *
   * @param {string} name CSS property name such as `topMargin`.
   * @param {*} value CSS property value such as `10px`.
   * @return {string} Normalized style value with dimensions applied.
   */

  function dangerousStyleValue(name, value, isCustomProperty) {
    // Note that we've removed escapeTextForBrowser() calls here since the
    // whole string will be escaped when the attribute is injected into
    // the markup. If you provide unsafe user data here they can inject
    // arbitrary CSS which may be problematic (I couldn't repro this):
    // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
    // This is not an XSS hole but instead a potential CSS injection issue
    // which has lead to a greater discussion about how we're going to
    // trust URLs moving forward. See #2115901
    var isEmpty = value == null || typeof value === 'boolean' || value === '';

    if (isEmpty) {
      return '';
    }

    if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
      return value + 'px'; // Presumes implicit 'px' suffix for unitless numbers
    }

    {
      checkCSSPropertyStringCoercion(value, name);
    }

    return ('' + value).trim();
  }

  var uppercasePattern = /([A-Z])/g;
  var msPattern = /^ms-/;
  /**
   * Hyphenates a camelcased CSS property name, for example:
   *
   *   > hyphenateStyleName('backgroundColor')
   *   < "background-color"
   *   > hyphenateStyleName('MozTransition')
   *   < "-moz-transition"
   *   > hyphenateStyleName('msTransition')
   *   < "-ms-transition"
   *
   * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
   * is converted to `-ms-`.
   */

  function hyphenateStyleName(name) {
    return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
  }

  var warnValidStyle = function () {};

  {
    // 'msTransform' is correct, but the other prefixes should be capitalized
    var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
    var msPattern$1 = /^-ms-/;
    var hyphenPattern = /-(.)/g; // style values shouldn't contain a semicolon

    var badStyleValueWithSemicolonPattern = /;\s*$/;
    var warnedStyleNames = {};
    var warnedStyleValues = {};
    var warnedForNaNValue = false;
    var warnedForInfinityValue = false;

    var camelize = function (string) {
      return string.replace(hyphenPattern, function (_, character) {
        return character.toUpperCase();
      });
    };

    var warnHyphenatedStyleName = function (name) {
      if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
        return;
      }

      warnedStyleNames[name] = true;

      error('Unsupported style property %s. Did you mean %s?', name, // As Andi Smith suggests
      // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
      // is converted to lowercase `ms`.
      camelize(name.replace(msPattern$1, 'ms-')));
    };

    var warnBadVendoredStyleName = function (name) {
      if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
        return;
      }

      warnedStyleNames[name] = true;

      error('Unsupported vendor-prefixed style property %s. Did you mean %s?', name, name.charAt(0).toUpperCase() + name.slice(1));
    };

    var warnStyleValueWithSemicolon = function (name, value) {
      if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
        return;
      }

      warnedStyleValues[value] = true;

      error("Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.', name, value.replace(badStyleValueWithSemicolonPattern, ''));
    };

    var warnStyleValueIsNaN = function (name, value) {
      if (warnedForNaNValue) {
        return;
      }

      warnedForNaNValue = true;

      error('`NaN` is an invalid value for the `%s` css style property.', name);
    };

    var warnStyleValueIsInfinity = function (name, value) {
      if (warnedForInfinityValue) {
        return;
      }

      warnedForInfinityValue = true;

      error('`Infinity` is an invalid value for the `%s` css style property.', name);
    };

    warnValidStyle = function (name, value) {
      if (name.indexOf('-') > -1) {
        warnHyphenatedStyleName(name);
      } else if (badVendoredStyleNamePattern.test(name)) {
        warnBadVendoredStyleName(name);
      } else if (badStyleValueWithSemicolonPattern.test(value)) {
        warnStyleValueWithSemicolon(name, value);
      }

      if (typeof value === 'number') {
        if (isNaN(value)) {
          warnStyleValueIsNaN(name, value);
        } else if (!isFinite(value)) {
          warnStyleValueIsInfinity(name, value);
        }
      }
    };
  }

  var warnValidStyle$1 = warnValidStyle;

  /**
   * Operations for dealing with CSS properties.
   */

  /**
   * This creates a string that is expected to be equivalent to the style
   * attribute generated by server-side rendering. It by-passes warnings and
   * security checks so it's not safe to use this value for anything other than
   * comparison. It is only used in DEV for SSR validation.
   */

  function createDangerousStringForStyles(styles) {
    {
      var serialized = '';
      var delimiter = '';

      for (var styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
          continue;
        }

        var styleValue = styles[styleName];

        if (styleValue != null) {
          var isCustomProperty = styleName.indexOf('--') === 0;
          serialized += delimiter + (isCustomProperty ? styleName : hyphenateStyleName(styleName)) + ':';
          serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);
          delimiter = ';';
        }
      }

      return serialized || null;
    }
  }
  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   */

  function setValueForStyles(node, styles) {
    var style = node.style;

    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }

      var isCustomProperty = styleName.indexOf('--') === 0;

      {
        if (!isCustomProperty) {
          warnValidStyle$1(styleName, styles[styleName]);
        }
      }

      var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);

      if (styleName === 'float') {
        styleName = 'cssFloat';
      }

      if (isCustomProperty) {
        style.setProperty(styleName, styleValue);
      } else {
        style[styleName] = styleValue;
      }
    }
  }

  function isValueEmpty(value) {
    return value == null || typeof value === 'boolean' || value === '';
  }
  /**
   * Given {color: 'red', overflow: 'hidden'} returns {
   *   color: 'color',
   *   overflowX: 'overflow',
   *   overflowY: 'overflow',
   * }. This can be read as "the overflowY property was set by the overflow
   * shorthand". That is, the values are the property that each was derived from.
   */


  function expandShorthandMap(styles) {
    var expanded = {};

    for (var key in styles) {
      var longhands = shorthandToLonghand[key] || [key];

      for (var i = 0; i < longhands.length; i++) {
        expanded[longhands[i]] = key;
      }
    }

    return expanded;
  }
  /**
   * When mixing shorthand and longhand property names, we warn during updates if
   * we expect an incorrect result to occur. In particular, we warn for:
   *
   * Updating a shorthand property (longhand gets overwritten):
   *   {font: 'foo', fontVariant: 'bar'} -> {font: 'baz', fontVariant: 'bar'}
   *   becomes .style.font = 'baz'
   * Removing a shorthand property (longhand gets lost too):
   *   {font: 'foo', fontVariant: 'bar'} -> {fontVariant: 'bar'}
   *   becomes .style.font = ''
   * Removing a longhand property (should revert to shorthand; doesn't):
   *   {font: 'foo', fontVariant: 'bar'} -> {font: 'foo'}
   *   becomes .style.fontVariant = ''
   */


  function validateShorthandPropertyCollisionInDev(styleUpdates, nextStyles) {
    {
      if (!nextStyles) {
        return;
      }

      var expandedUpdates = expandShorthandMap(styleUpdates);
      var expandedStyles = expandShorthandMap(nextStyles);
      var warnedAbout = {};

      for (var key in expandedUpdates) {
        var originalKey = expandedUpdates[key];
        var correctOriginalKey = expandedStyles[key];

        if (correctOriginalKey && originalKey !== correctOriginalKey) {
          var warningKey = originalKey + ',' + correctOriginalKey;

          if (warnedAbout[warningKey]) {
            continue;
          }

          warnedAbout[warningKey] = true;

          error('%s a style property during rerender (%s) when a ' + 'conflicting property is set (%s) can lead to styling bugs. To ' + "avoid this, don't mix shorthand and non-shorthand properties " + 'for the same value; instead, replace the shorthand with ' + 'separate values.', isValueEmpty(styleUpdates[originalKey]) ? 'Removing' : 'Updating', originalKey, correctOriginalKey);
        }
      }
    }
  }

  // For HTML, certain tags should omit their close tag. We keep a list for
  // those special-case tags.
  var omittedCloseTags = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true // NOTE: menuitem's close tag should be omitted, but that causes problems.

  };

  // `omittedCloseTags` except that `menuitem` should still have its closing tag.

  var voidElementTags = assign({
    menuitem: true
  }, omittedCloseTags);

  var HTML = '__html';

  function assertValidProps(tag, props) {
    if (!props) {
      return;
    } // Note the use of `==` which checks for null or undefined.


    if (voidElementTags[tag]) {
      if (props.children != null || props.dangerouslySetInnerHTML != null) {
        throw new Error(tag + " is a void element tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
      }
    }

    if (props.dangerouslySetInnerHTML != null) {
      if (props.children != null) {
        throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
      }

      if (typeof props.dangerouslySetInnerHTML !== 'object' || !(HTML in props.dangerouslySetInnerHTML)) {
        throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://reactjs.org/link/dangerously-set-inner-html ' + 'for more information.');
      }
    }

    {
      if (!props.suppressContentEditableWarning && props.contentEditable && props.children != null) {
        error('A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.');
      }
    }

    if (props.style != null && typeof props.style !== 'object') {
      throw new Error('The `style` prop expects a mapping from style properties to values, ' + "not a string. For example, style={{marginRight: spacing + 'em'}} when " + 'using JSX.');
    }
  }

  function isCustomComponent(tagName, props) {
    if (tagName.indexOf('-') === -1) {
      return typeof props.is === 'string';
    }

    switch (tagName) {
      // These are reserved SVG and MathML elements.
      // We don't mind this list too much because we expect it to never grow.
      // The alternative is to track the namespace in a few places which is convoluted.
      // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
      case 'annotation-xml':
      case 'color-profile':
      case 'font-face':
      case 'font-face-src':
      case 'font-face-uri':
      case 'font-face-format':
      case 'font-face-name':
      case 'missing-glyph':
        return false;

      default:
        return true;
    }
  }

  // When adding attributes to the HTML or SVG allowed attribute list, be sure to
  // also add them to this module to ensure casing and incorrect name
  // warnings.
  var possibleStandardNames = {
    // HTML
    accept: 'accept',
    acceptcharset: 'acceptCharset',
    'accept-charset': 'acceptCharset',
    accesskey: 'accessKey',
    action: 'action',
    allowfullscreen: 'allowFullScreen',
    alt: 'alt',
    as: 'as',
    async: 'async',
    autocapitalize: 'autoCapitalize',
    autocomplete: 'autoComplete',
    autocorrect: 'autoCorrect',
    autofocus: 'autoFocus',
    autoplay: 'autoPlay',
    autosave: 'autoSave',
    capture: 'capture',
    cellpadding: 'cellPadding',
    cellspacing: 'cellSpacing',
    challenge: 'challenge',
    charset: 'charSet',
    checked: 'checked',
    children: 'children',
    cite: 'cite',
    class: 'className',
    classid: 'classID',
    classname: 'className',
    cols: 'cols',
    colspan: 'colSpan',
    content: 'content',
    contenteditable: 'contentEditable',
    contextmenu: 'contextMenu',
    controls: 'controls',
    controlslist: 'controlsList',
    coords: 'coords',
    crossorigin: 'crossOrigin',
    dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
    data: 'data',
    datetime: 'dateTime',
    default: 'default',
    defaultchecked: 'defaultChecked',
    defaultvalue: 'defaultValue',
    defer: 'defer',
    dir: 'dir',
    disabled: 'disabled',
    disablepictureinpicture: 'disablePictureInPicture',
    disableremoteplayback: 'disableRemotePlayback',
    download: 'download',
    draggable: 'draggable',
    enctype: 'encType',
    enterkeyhint: 'enterKeyHint',
    for: 'htmlFor',
    form: 'form',
    formmethod: 'formMethod',
    formaction: 'formAction',
    formenctype: 'formEncType',
    formnovalidate: 'formNoValidate',
    formtarget: 'formTarget',
    frameborder: 'frameBorder',
    headers: 'headers',
    height: 'height',
    hidden: 'hidden',
    high: 'high',
    href: 'href',
    hreflang: 'hrefLang',
    htmlfor: 'htmlFor',
    httpequiv: 'httpEquiv',
    'http-equiv': 'httpEquiv',
    icon: 'icon',
    id: 'id',
    imagesizes: 'imageSizes',
    imagesrcset: 'imageSrcSet',
    innerhtml: 'innerHTML',
    inputmode: 'inputMode',
    integrity: 'integrity',
    is: 'is',
    itemid: 'itemID',
    itemprop: 'itemProp',
    itemref: 'itemRef',
    itemscope: 'itemScope',
    itemtype: 'itemType',
    keyparams: 'keyParams',
    keytype: 'keyType',
    kind: 'kind',
    label: 'label',
    lang: 'lang',
    list: 'list',
    loop: 'loop',
    low: 'low',
    manifest: 'manifest',
    marginwidth: 'marginWidth',
    marginheight: 'marginHeight',
    max: 'max',
    maxlength: 'maxLength',
    media: 'media',
    mediagroup: 'mediaGroup',
    method: 'method',
    min: 'min',
    minlength: 'minLength',
    multiple: 'multiple',
    muted: 'muted',
    name: 'name',
    nomodule: 'noModule',
    nonce: 'nonce',
    novalidate: 'noValidate',
    open: 'open',
    optimum: 'optimum',
    pattern: 'pattern',
    placeholder: 'placeholder',
    playsinline: 'playsInline',
    poster: 'poster',
    preload: 'preload',
    profile: 'profile',
    radiogroup: 'radioGroup',
    readonly: 'readOnly',
    referrerpolicy: 'referrerPolicy',
    rel: 'rel',
    required: 'required',
    reversed: 'reversed',
    role: 'role',
    rows: 'rows',
    rowspan: 'rowSpan',
    sandbox: 'sandbox',
    scope: 'scope',
    scoped: 'scoped',
    scrolling: 'scrolling',
    seamless: 'seamless',
    selected: 'selected',
    shape: 'shape',
    size: 'size',
    sizes: 'sizes',
    span: 'span',
    spellcheck: 'spellCheck',
    src: 'src',
    srcdoc: 'srcDoc',
    srclang: 'srcLang',
    srcset: 'srcSet',
    start: 'start',
    step: 'step',
    style: 'style',
    summary: 'summary',
    tabindex: 'tabIndex',
    target: 'target',
    title: 'title',
    type: 'type',
    usemap: 'useMap',
    value: 'value',
    width: 'width',
    wmode: 'wmode',
    wrap: 'wrap',
    // SVG
    about: 'about',
    accentheight: 'accentHeight',
    'accent-height': 'accentHeight',
    accumulate: 'accumulate',
    additive: 'additive',
    alignmentbaseline: 'alignmentBaseline',
    'alignment-baseline': 'alignmentBaseline',
    allowreorder: 'allowReorder',
    alphabetic: 'alphabetic',
    amplitude: 'amplitude',
    arabicform: 'arabicForm',
    'arabic-form': 'arabicForm',
    ascent: 'ascent',
    attributename: 'attributeName',
    attributetype: 'attributeType',
    autoreverse: 'autoReverse',
    azimuth: 'azimuth',
    basefrequency: 'baseFrequency',
    baselineshift: 'baselineShift',
    'baseline-shift': 'baselineShift',
    baseprofile: 'baseProfile',
    bbox: 'bbox',
    begin: 'begin',
    bias: 'bias',
    by: 'by',
    calcmode: 'calcMode',
    capheight: 'capHeight',
    'cap-height': 'capHeight',
    clip: 'clip',
    clippath: 'clipPath',
    'clip-path': 'clipPath',
    clippathunits: 'clipPathUnits',
    cliprule: 'clipRule',
    'clip-rule': 'clipRule',
    color: 'color',
    colorinterpolation: 'colorInterpolation',
    'color-interpolation': 'colorInterpolation',
    colorinterpolationfilters: 'colorInterpolationFilters',
    'color-interpolation-filters': 'colorInterpolationFilters',
    colorprofile: 'colorProfile',
    'color-profile': 'colorProfile',
    colorrendering: 'colorRendering',
    'color-rendering': 'colorRendering',
    contentscripttype: 'contentScriptType',
    contentstyletype: 'contentStyleType',
    cursor: 'cursor',
    cx: 'cx',
    cy: 'cy',
    d: 'd',
    datatype: 'datatype',
    decelerate: 'decelerate',
    descent: 'descent',
    diffuseconstant: 'diffuseConstant',
    direction: 'direction',
    display: 'display',
    divisor: 'divisor',
    dominantbaseline: 'dominantBaseline',
    'dominant-baseline': 'dominantBaseline',
    dur: 'dur',
    dx: 'dx',
    dy: 'dy',
    edgemode: 'edgeMode',
    elevation: 'elevation',
    enablebackground: 'enableBackground',
    'enable-background': 'enableBackground',
    end: 'end',
    exponent: 'exponent',
    externalresourcesrequired: 'externalResourcesRequired',
    fill: 'fill',
    fillopacity: 'fillOpacity',
    'fill-opacity': 'fillOpacity',
    fillrule: 'fillRule',
    'fill-rule': 'fillRule',
    filter: 'filter',
    filterres: 'filterRes',
    filterunits: 'filterUnits',
    floodopacity: 'floodOpacity',
    'flood-opacity': 'floodOpacity',
    floodcolor: 'floodColor',
    'flood-color': 'floodColor',
    focusable: 'focusable',
    fontfamily: 'fontFamily',
    'font-family': 'fontFamily',
    fontsize: 'fontSize',
    'font-size': 'fontSize',
    fontsizeadjust: 'fontSizeAdjust',
    'font-size-adjust': 'fontSizeAdjust',
    fontstretch: 'fontStretch',
    'font-stretch': 'fontStretch',
    fontstyle: 'fontStyle',
    'font-style': 'fontStyle',
    fontvariant: 'fontVariant',
    'font-variant': 'fontVariant',
    fontweight: 'fontWeight',
    'font-weight': 'fontWeight',
    format: 'format',
    from: 'from',
    fx: 'fx',
    fy: 'fy',
    g1: 'g1',
    g2: 'g2',
    glyphname: 'glyphName',
    'glyph-name': 'glyphName',
    glyphorientationhorizontal: 'glyphOrientationHorizontal',
    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
    glyphorientationvertical: 'glyphOrientationVertical',
    'glyph-orientation-vertical': 'glyphOrientationVertical',
    glyphref: 'glyphRef',
    gradienttransform: 'gradientTransform',
    gradientunits: 'gradientUnits',
    hanging: 'hanging',
    horizadvx: 'horizAdvX',
    'horiz-adv-x': 'horizAdvX',
    horizoriginx: 'horizOriginX',
    'horiz-origin-x': 'horizOriginX',
    ideographic: 'ideographic',
    imagerendering: 'imageRendering',
    'image-rendering': 'imageRendering',
    in2: 'in2',
    in: 'in',
    inlist: 'inlist',
    intercept: 'intercept',
    k1: 'k1',
    k2: 'k2',
    k3: 'k3',
    k4: 'k4',
    k: 'k',
    kernelmatrix: 'kernelMatrix',
    kernelunitlength: 'kernelUnitLength',
    kerning: 'kerning',
    keypoints: 'keyPoints',
    keysplines: 'keySplines',
    keytimes: 'keyTimes',
    lengthadjust: 'lengthAdjust',
    letterspacing: 'letterSpacing',
    'letter-spacing': 'letterSpacing',
    lightingcolor: 'lightingColor',
    'lighting-color': 'lightingColor',
    limitingconeangle: 'limitingConeAngle',
    local: 'local',
    markerend: 'markerEnd',
    'marker-end': 'markerEnd',
    markerheight: 'markerHeight',
    markermid: 'markerMid',
    'marker-mid': 'markerMid',
    markerstart: 'markerStart',
    'marker-start': 'markerStart',
    markerunits: 'markerUnits',
    markerwidth: 'markerWidth',
    mask: 'mask',
    maskcontentunits: 'maskContentUnits',
    maskunits: 'maskUnits',
    mathematical: 'mathematical',
    mode: 'mode',
    numoctaves: 'numOctaves',
    offset: 'offset',
    opacity: 'opacity',
    operator: 'operator',
    order: 'order',
    orient: 'orient',
    orientation: 'orientation',
    origin: 'origin',
    overflow: 'overflow',
    overlineposition: 'overlinePosition',
    'overline-position': 'overlinePosition',
    overlinethickness: 'overlineThickness',
    'overline-thickness': 'overlineThickness',
    paintorder: 'paintOrder',
    'paint-order': 'paintOrder',
    panose1: 'panose1',
    'panose-1': 'panose1',
    pathlength: 'pathLength',
    patterncontentunits: 'patternContentUnits',
    patterntransform: 'patternTransform',
    patternunits: 'patternUnits',
    pointerevents: 'pointerEvents',
    'pointer-events': 'pointerEvents',
    points: 'points',
    pointsatx: 'pointsAtX',
    pointsaty: 'pointsAtY',
    pointsatz: 'pointsAtZ',
    prefix: 'prefix',
    preservealpha: 'preserveAlpha',
    preserveaspectratio: 'preserveAspectRatio',
    primitiveunits: 'primitiveUnits',
    property: 'property',
    r: 'r',
    radius: 'radius',
    refx: 'refX',
    refy: 'refY',
    renderingintent: 'renderingIntent',
    'rendering-intent': 'renderingIntent',
    repeatcount: 'repeatCount',
    repeatdur: 'repeatDur',
    requiredextensions: 'requiredExtensions',
    requiredfeatures: 'requiredFeatures',
    resource: 'resource',
    restart: 'restart',
    result: 'result',
    results: 'results',
    rotate: 'rotate',
    rx: 'rx',
    ry: 'ry',
    scale: 'scale',
    security: 'security',
    seed: 'seed',
    shaperendering: 'shapeRendering',
    'shape-rendering': 'shapeRendering',
    slope: 'slope',
    spacing: 'spacing',
    specularconstant: 'specularConstant',
    specularexponent: 'specularExponent',
    speed: 'speed',
    spreadmethod: 'spreadMethod',
    startoffset: 'startOffset',
    stddeviation: 'stdDeviation',
    stemh: 'stemh',
    stemv: 'stemv',
    stitchtiles: 'stitchTiles',
    stopcolor: 'stopColor',
    'stop-color': 'stopColor',
    stopopacity: 'stopOpacity',
    'stop-opacity': 'stopOpacity',
    strikethroughposition: 'strikethroughPosition',
    'strikethrough-position': 'strikethroughPosition',
    strikethroughthickness: 'strikethroughThickness',
    'strikethrough-thickness': 'strikethroughThickness',
    string: 'string',
    stroke: 'stroke',
    strokedasharray: 'strokeDasharray',
    'stroke-dasharray': 'strokeDasharray',
    strokedashoffset: 'strokeDashoffset',
    'stroke-dashoffset': 'strokeDashoffset',
    strokelinecap: 'strokeLinecap',
    'stroke-linecap': 'strokeLinecap',
    strokelinejoin: 'strokeLinejoin',
    'stroke-linejoin': 'strokeLinejoin',
    strokemiterlimit: 'strokeMiterlimit',
    'stroke-miterlimit': 'strokeMiterlimit',
    strokewidth: 'strokeWidth',
    'stroke-width': 'strokeWidth',
    strokeopacity: 'strokeOpacity',
    'stroke-opacity': 'strokeOpacity',
    suppresscontenteditablewarning: 'suppressContentEditableWarning',
    suppresshydrationwarning: 'suppressHydrationWarning',
    surfacescale: 'surfaceScale',
    systemlanguage: 'systemLanguage',
    tablevalues: 'tableValues',
    targetx: 'targetX',
    targety: 'targetY',
    textanchor: 'textAnchor',
    'text-anchor': 'textAnchor',
    textdecoration: 'textDecoration',
    'text-decoration': 'textDecoration',
    textlength: 'textLength',
    textrendering: 'textRendering',
    'text-rendering': 'textRendering',
    to: 'to',
    transform: 'transform',
    typeof: 'typeof',
    u1: 'u1',
    u2: 'u2',
    underlineposition: 'underlinePosition',
    'underline-position': 'underlinePosition',
    underlinethickness: 'underlineThickness',
    'underline-thickness': 'underlineThickness',
    unicode: 'unicode',
    unicodebidi: 'unicodeBidi',
    'unicode-bidi': 'unicodeBidi',
    unicoderange: 'unicodeRange',
    'unicode-range': 'unicodeRange',
    unitsperem: 'unitsPerEm',
    'units-per-em': 'unitsPerEm',
    unselectable: 'unselectable',
    valphabetic: 'vAlphabetic',
    'v-alphabetic': 'vAlphabetic',
    values: 'values',
    vectoreffect: 'vectorEffect',
    'vector-effect': 'vectorEffect',
    version: 'version',
    vertadvy: 'vertAdvY',
    'vert-adv-y': 'vertAdvY',
    vertoriginx: 'vertOriginX',
    'vert-origin-x': 'vertOriginX',
    vertoriginy: 'vertOriginY',
    'vert-origin-y': 'vertOriginY',
    vhanging: 'vHanging',
    'v-hanging': 'vHanging',
    videographic: 'vIdeographic',
    'v-ideographic': 'vIdeographic',
    viewbox: 'viewBox',
    viewtarget: 'viewTarget',
    visibility: 'visibility',
    vmathematical: 'vMathematical',
    'v-mathematical': 'vMathematical',
    vocab: 'vocab',
    widths: 'widths',
    wordspacing: 'wordSpacing',
    'word-spacing': 'wordSpacing',
    writingmode: 'writingMode',
    'writing-mode': 'writingMode',
    x1: 'x1',
    x2: 'x2',
    x: 'x',
    xchannelselector: 'xChannelSelector',
    xheight: 'xHeight',
    'x-height': 'xHeight',
    xlinkactuate: 'xlinkActuate',
    'xlink:actuate': 'xlinkActuate',
    xlinkarcrole: 'xlinkArcrole',
    'xlink:arcrole': 'xlinkArcrole',
    xlinkhref: 'xlinkHref',
    'xlink:href': 'xlinkHref',
    xlinkrole: 'xlinkRole',
    'xlink:role': 'xlinkRole',
    xlinkshow: 'xlinkShow',
    'xlink:show': 'xlinkShow',
    xlinktitle: 'xlinkTitle',
    'xlink:title': 'xlinkTitle',
    xlinktype: 'xlinkType',
    'xlink:type': 'xlinkType',
    xmlbase: 'xmlBase',
    'xml:base': 'xmlBase',
    xmllang: 'xmlLang',
    'xml:lang': 'xmlLang',
    xmlns: 'xmlns',
    'xml:space': 'xmlSpace',
    xmlnsxlink: 'xmlnsXlink',
    'xmlns:xlink': 'xmlnsXlink',
    xmlspace: 'xmlSpace',
    y1: 'y1',
    y2: 'y2',
    y: 'y',
    ychannelselector: 'yChannelSelector',
    z: 'z',
    zoomandpan: 'zoomAndPan'
  };

  var ariaProperties = {
    'aria-current': 0,
    // state
    'aria-description': 0,
    'aria-details': 0,
    'aria-disabled': 0,
    // state
    'aria-hidden': 0,
    // state
    'aria-invalid': 0,
    // state
    'aria-keyshortcuts': 0,
    'aria-label': 0,
    'aria-roledescription': 0,
    // Widget Attributes
    'aria-autocomplete': 0,
    'aria-checked': 0,
    'aria-expanded': 0,
    'aria-haspopup': 0,
    'aria-level': 0,
    'aria-modal': 0,
    'aria-multiline': 0,
    'aria-multiselectable': 0,
    'aria-orientation': 0,
    'aria-placeholder': 0,
    'aria-pressed': 0,
    'aria-readonly': 0,
    'aria-required': 0,
    'aria-selected': 0,
    'aria-sort': 0,
    'aria-valuemax': 0,
    'aria-valuemin': 0,
    'aria-valuenow': 0,
    'aria-valuetext': 0,
    // Live Region Attributes
    'aria-atomic': 0,
    'aria-busy': 0,
    'aria-live': 0,
    'aria-relevant': 0,
    // Drag-and-Drop Attributes
    'aria-dropeffect': 0,
    'aria-grabbed': 0,
    // Relationship Attributes
    'aria-activedescendant': 0,
    'aria-colcount': 0,
    'aria-colindex': 0,
    'aria-colspan': 0,
    'aria-controls': 0,
    'aria-describedby': 0,
    'aria-errormessage': 0,
    'aria-flowto': 0,
    'aria-labelledby': 0,
    'aria-owns': 0,
    'aria-posinset': 0,
    'aria-rowcount': 0,
    'aria-rowindex': 0,
    'aria-rowspan': 0,
    'aria-setsize': 0
  };

  var warnedProperties = {};
  var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
  var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

  function validateProperty(tagName, name) {
    {
      if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
        return true;
      }

      if (rARIACamel.test(name)) {
        var ariaName = 'aria-' + name.slice(4).toLowerCase();
        var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null; // If this is an aria-* attribute, but is not listed in the known DOM
        // DOM properties, then it is an invalid aria-* attribute.

        if (correctName == null) {
          error('Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.', name);

          warnedProperties[name] = true;
          return true;
        } // aria-* attributes should be lowercase; suggest the lowercase version.


        if (name !== correctName) {
          error('Invalid ARIA attribute `%s`. Did you mean `%s`?', name, correctName);

          warnedProperties[name] = true;
          return true;
        }
      }

      if (rARIA.test(name)) {
        var lowerCasedName = name.toLowerCase();
        var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null; // If this is an aria-* attribute, but is not listed in the known DOM
        // DOM properties, then it is an invalid aria-* attribute.

        if (standardName == null) {
          warnedProperties[name] = true;
          return false;
        } // aria-* attributes should be lowercase; suggest the lowercase version.


        if (name !== standardName) {
          error('Unknown ARIA attribute `%s`. Did you mean `%s`?', name, standardName);

          warnedProperties[name] = true;
          return true;
        }
      }
    }

    return true;
  }

  function warnInvalidARIAProps(type, props) {
    {
      var invalidProps = [];

      for (var key in props) {
        var isValid = validateProperty(type, key);

        if (!isValid) {
          invalidProps.push(key);
        }
      }

      var unknownPropString = invalidProps.map(function (prop) {
        return '`' + prop + '`';
      }).join(', ');

      if (invalidProps.length === 1) {
        error('Invalid aria prop %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
      } else if (invalidProps.length > 1) {
        error('Invalid aria props %s on <%s> tag. ' + 'For details, see https://reactjs.org/link/invalid-aria-props', unknownPropString, type);
      }
    }
  }

  function validateProperties(type, props) {
    if (isCustomComponent(type, props)) {
      return;
    }

    warnInvalidARIAProps(type, props);
  }

  var didWarnValueNull = false;
  function validateProperties$1(type, props) {
    {
      if (type !== 'input' && type !== 'textarea' && type !== 'select') {
        return;
      }

      if (props != null && props.value === null && !didWarnValueNull) {
        didWarnValueNull = true;

        if (type === 'select' && props.multiple) {
          error('`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.', type);
        } else {
          error('`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.', type);
        }
      }
    }
  }

  var validateProperty$1 = function () {};

  {
    var warnedProperties$1 = {};
    var EVENT_NAME_REGEX = /^on./;
    var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
    var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
    var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

    validateProperty$1 = function (tagName, name, value, eventRegistry) {
      if (hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
        return true;
      }

      var lowerCasedName = name.toLowerCase();

      if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
        error('React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');

        warnedProperties$1[name] = true;
        return true;
      } // We can't rely on the event system being injected on the server.


      if (eventRegistry != null) {
        var registrationNameDependencies = eventRegistry.registrationNameDependencies,
            possibleRegistrationNames = eventRegistry.possibleRegistrationNames;

        if (registrationNameDependencies.hasOwnProperty(name)) {
          return true;
        }

        var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;

        if (registrationName != null) {
          error('Invalid event handler property `%s`. Did you mean `%s`?', name, registrationName);

          warnedProperties$1[name] = true;
          return true;
        }

        if (EVENT_NAME_REGEX.test(name)) {
          error('Unknown event handler property `%s`. It will be ignored.', name);

          warnedProperties$1[name] = true;
          return true;
        }
      } else if (EVENT_NAME_REGEX.test(name)) {
        // If no event plugins have been injected, we are in a server environment.
        // So we can't tell if the event name is correct for sure, but we can filter
        // out known bad ones like `onclick`. We can't suggest a specific replacement though.
        if (INVALID_EVENT_NAME_REGEX.test(name)) {
          error('Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.', name);
        }

        warnedProperties$1[name] = true;
        return true;
      } // Let the ARIA attribute hook validate ARIA attributes


      if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
        return true;
      }

      if (lowerCasedName === 'innerhtml') {
        error('Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');

        warnedProperties$1[name] = true;
        return true;
      }

      if (lowerCasedName === 'aria') {
        error('The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');

        warnedProperties$1[name] = true;
        return true;
      }

      if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
        error('Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.', typeof value);

        warnedProperties$1[name] = true;
        return true;
      }

      if (typeof value === 'number' && isNaN(value)) {
        error('Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.', name);

        warnedProperties$1[name] = true;
        return true;
      }

      var propertyInfo = getPropertyInfo(name);
      var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED; // Known attributes should match the casing specified in the property config.

      if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
        var standardName = possibleStandardNames[lowerCasedName];

        if (standardName !== name) {
          error('Invalid DOM property `%s`. Did you mean `%s`?', name, standardName);

          warnedProperties$1[name] = true;
          return true;
        }
      } else if (!isReserved && name !== lowerCasedName) {
        // Unknown attributes should have lowercase casing since that's how they
        // will be cased anyway with server rendering.
        error('React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.', name, lowerCasedName);

        warnedProperties$1[name] = true;
        return true;
      }

      if (typeof value === 'boolean' && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
        if (value) {
          error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.', value, name, name, value, name);
        } else {
          error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
        }

        warnedProperties$1[name] = true;
        return true;
      } // Now that we've validated casing, do not validate
      // data types for reserved props


      if (isReserved) {
        return true;
      } // Warn when a known attribute is a bad type


      if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
        warnedProperties$1[name] = true;
        return false;
      } // Warn when passing the strings 'false' or 'true' into a boolean prop


      if ((value === 'false' || value === 'true') && propertyInfo !== null && propertyInfo.type === BOOLEAN) {
        error('Received the string `%s` for the boolean attribute `%s`. ' + '%s ' + 'Did you mean %s={%s}?', value, name, value === 'false' ? 'The browser will interpret it as a truthy value.' : 'Although this works, it will not work as expected if you pass the string "false".', name, value);

        warnedProperties$1[name] = true;
        return true;
      }

      return true;
    };
  }

  var warnUnknownProperties = function (type, props, eventRegistry) {
    {
      var unknownProps = [];

      for (var key in props) {
        var isValid = validateProperty$1(type, key, props[key], eventRegistry);

        if (!isValid) {
          unknownProps.push(key);
        }
      }

      var unknownPropString = unknownProps.map(function (prop) {
        return '`' + prop + '`';
      }).join(', ');

      if (unknownProps.length === 1) {
        error('Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
      } else if (unknownProps.length > 1) {
        error('Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://reactjs.org/link/attribute-behavior ', unknownPropString, type);
      }
    }
  };

  function validateProperties$2(type, props, eventRegistry) {
    if (isCustomComponent(type, props)) {
      return;
    }

    warnUnknownProperties(type, props, eventRegistry);
  }

  var IS_EVENT_HANDLE_NON_MANAGED_NODE = 1;
  var IS_NON_DELEGATED = 1 << 1;
  var IS_CAPTURE_PHASE = 1 << 2;
  // set to LEGACY_FB_SUPPORT. LEGACY_FB_SUPPORT only gets set when
  // we call willDeferLaterForLegacyFBSupport, thus not bailing out
  // will result in endless cycles like an infinite loop.
  // We also don't want to defer during event replaying.

  var SHOULD_NOT_PROCESS_POLYFILL_EVENT_PLUGINS = IS_EVENT_HANDLE_NON_MANAGED_NODE | IS_NON_DELEGATED | IS_CAPTURE_PHASE;

  // This exists to avoid circular dependency between ReactDOMEventReplaying
  // and DOMPluginEventSystem.
  var currentReplayingEvent = null;
  function setReplayingEvent(event) {
    {
      if (currentReplayingEvent !== null) {
        error('Expected currently replaying event to be null. This error ' + 'is likely caused by a bug in React. Please file an issue.');
      }
    }

    currentReplayingEvent = event;
  }
  function resetReplayingEvent() {
    {
      if (currentReplayingEvent === null) {
        error('Expected currently replaying event to not be null. This error ' + 'is likely caused by a bug in React. Please file an issue.');
      }
    }

    currentReplayingEvent = null;
  }
  function isReplayingEvent(event) {
    return event === currentReplayingEvent;
  }

  /**
   * Gets the target node from a native browser event by accounting for
   * inconsistencies in browser DOM APIs.
   *
   * @param {object} nativeEvent Native browser event.
   * @return {DOMEventTarget} Target node.
   */

  function getEventTarget(nativeEvent) {
    // Fallback to nativeEvent.srcElement for IE9
    // https://github.com/facebook/react/issues/12506
    var target = nativeEvent.target || nativeEvent.srcElement || window; // Normalize SVG <use> element events #4963

    if (target.correspondingUseElement) {
      target = target.correspondingUseElement;
    } // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
    // @see http://www.quirksmode.org/js/events_properties.html


    return target.nodeType === TEXT_NODE ? target.parentNode : target;
  }

  var restoreImpl = null;
  var restoreTarget = null;
  var restoreQueue = null;

  function restoreStateOfTarget(target) {
    // We perform this translation at the end of the event loop so that we
    // always receive the correct fiber here
    var internalInstance = getInstanceFromNode(target);

    if (!internalInstance) {
      // Unmounted
      return;
    }

    if (typeof restoreImpl !== 'function') {
      throw new Error('setRestoreImplementation() needs to be called to handle a target for controlled ' + 'events. This error is likely caused by a bug in React. Please file an issue.');
    }

    var stateNode = internalInstance.stateNode; // Guard against Fiber being unmounted.

    if (stateNode) {
      var _props = getFiberCurrentPropsFromNode(stateNode);

      restoreImpl(internalInstance.stateNode, internalInstance.type, _props);
    }
  }

  function setRestoreImplementation(impl) {
    restoreImpl = impl;
  }
  function enqueueStateRestore(target) {
    if (restoreTarget) {
      if (restoreQueue) {
        restoreQueue.push(target);
      } else {
        restoreQueue = [target];
      }
    } else {
      restoreTarget = target;
    }
  }
  function needsStateRestore() {
    return restoreTarget !== null || restoreQueue !== null;
  }
  function restoreStateIfNeeded() {
    if (!restoreTarget) {
      return;
    }

    var target = restoreTarget;
    var queuedTargets = restoreQueue;
    restoreTarget = null;
    restoreQueue = null;
    restoreStateOfTarget(target);

    if (queuedTargets) {
      for (var i = 0; i < queuedTargets.length; i++) {
        restoreStateOfTarget(queuedTargets[i]);
      }
    }
  }

  // the renderer. Such as when we're dispatching events or if third party
  // libraries need to call batchedUpdates. Eventually, this API will go away when
  // everything is batched by default. We'll then have a similar API to opt-out of
  // scheduled work and instead do synchronous work.
  // Defaults

  var batchedUpdatesImpl = function (fn, bookkeeping) {
    return fn(bookkeeping);
  };

  var flushSyncImpl = function () {};

  var isInsideEventHandler = false;

  function finishEventHandler() {
    // Here we wait until all updates have propagated, which is important
    // when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    // Then we restore state of any controlled component.
    var controlledComponentsHavePendingUpdates = needsStateRestore();

    if (controlledComponentsHavePendingUpdates) {
      // If a controlled event was fired, we may need to restore the state of
      // the DOM node back to the controlled value. This is necessary when React
      // bails out of the update without touching the DOM.
      // TODO: Restore state in the microtask, after the discrete updates flush,
      // instead of early flushing them here.
      flushSyncImpl();
      restoreStateIfNeeded();
    }
  }

  function batchedUpdates(fn, a, b) {
    if (isInsideEventHandler) {
      // If we are currently inside another batch, we need to wait until it
      // fully completes before restoring state.
      return fn(a, b);
    }

    isInsideEventHandler = true;

    try {
      return batchedUpdatesImpl(fn, a, b);
    } finally {
      isInsideEventHandler = false;
      finishEventHandler();
    }
  } // TODO: Replace with flushSync
  function setBatchingImplementation(_batchedUpdatesImpl, _discreteUpdatesImpl, _flushSyncImpl) {
    batchedUpdatesImpl = _batchedUpdatesImpl;
    flushSyncImpl = _flushSyncImpl;
  }

  function isInteractive(tag) {
    return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
  }

  function shouldPreventMouseEvent(name, type, props) {
    switch (name) {
      case 'onClick':
      case 'onClickCapture':
      case 'onDoubleClick':
      case 'onDoubleClickCapture':
      case 'onMouseDown':
      case 'onMouseDownCapture':
      case 'onMouseMove':
      case 'onMouseMoveCapture':
      case 'onMouseUp':
      case 'onMouseUpCapture':
      case 'onMouseEnter':
        return !!(props.disabled && isInteractive(type));

      default:
        return false;
    }
  }
  /**
   * @param {object} inst The instance, which is the source of events.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */


  function getListener(inst, registrationName) {
    var stateNode = inst.stateNode;

    if (stateNode === null) {
      // Work in progress (ex: onload events in incremental mode).
      return null;
    }

    var props = getFiberCurrentPropsFromNode(stateNode);

    if (props === null) {
      // Work in progress.
      return null;
    }

    var listener = props[registrationName];

    if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
      return null;
    }

    if (listener && typeof listener !== 'function') {
      throw new Error("Expected `" + registrationName + "` listener to be a function, instead got a value of `" + typeof listener + "` type.");
    }

    return listener;
  }

  var passiveBrowserEventsSupported = false; // Check if browser support events with passive listeners
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support

  if (canUseDOM) {
    try {
      var options = {}; // $FlowFixMe: Ignore Flow complaining about needing a value

      Object.defineProperty(options, 'passive', {
        get: function () {
          passiveBrowserEventsSupported = true;
        }
      });
      window.addEventListener('test', options, options);
      window.removeEventListener('test', options, options);
    } catch (e) {
      passiveBrowserEventsSupported = false;
    }
  }

  function invokeGuardedCallbackProd(name, func, context, a, b, c, d, e, f) {
    var funcArgs = Array.prototype.slice.call(arguments, 3);

    try {
      func.apply(context, funcArgs);
    } catch (error) {
      this.onError(error);
    }
  }

  var invokeGuardedCallbackImpl = invokeGuardedCallbackProd;

  {
    // In DEV mode, we swap out invokeGuardedCallback for a special version
    // that plays more nicely with the browser's DevTools. The idea is to preserve
    // "Pause on exceptions" behavior. Because React wraps all user-provided
    // functions in invokeGuardedCallback, and the production version of
    // invokeGuardedCallback uses a try-catch, all user exceptions are treated
    // like caught exceptions, and the DevTools won't pause unless the developer
    // takes the extra step of enabling pause on caught exceptions. This is
    // unintuitive, though, because even though React has caught the error, from
    // the developer's perspective, the error is uncaught.
    //
    // To preserve the expected "Pause on exceptions" behavior, we don't use a
    // try-catch in DEV. Instead, we synchronously dispatch a fake event to a fake
    // DOM node, and call the user-provided callback from inside an event handler
    // for that fake event. If the callback throws, the error is "captured" using
    // a global event handler. But because the error happens in a different
    // event loop context, it does not interrupt the normal program flow.
    // Effectively, this gives us try-catch behavior without actually using
    // try-catch. Neat!
    // Check that the browser supports the APIs we need to implement our special
    // DEV version of invokeGuardedCallback
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
      var fakeNode = document.createElement('react');

      invokeGuardedCallbackImpl = function invokeGuardedCallbackDev(name, func, context, a, b, c, d, e, f) {
        // If document doesn't exist we know for sure we will crash in this method
        // when we call document.createEvent(). However this can cause confusing
        // errors: https://github.com/facebook/create-react-app/issues/3482
        // So we preemptively throw with a better message instead.
        if (typeof document === 'undefined' || document === null) {
          throw new Error('The `document` global was defined when React was initialized, but is not ' + 'defined anymore. This can happen in a test environment if a component ' + 'schedules an update from an asynchronous callback, but the test has already ' + 'finished running. To solve this, you can either unmount the component at ' + 'the end of your test (and ensure that any asynchronous operations get ' + 'canceled in `componentWillUnmount`), or you can change the test itself ' + 'to be asynchronous.');
        }

        var evt = document.createEvent('Event');
        var didCall = false; // Keeps track of whether the user-provided callback threw an error. We
        // set this to true at the beginning, then set it to false right after
        // calling the function. If the function errors, `didError` will never be
        // set to false. This strategy works even if the browser is flaky and
        // fails to call our global error handler, because it doesn't rely on
        // the error event at all.

        var didError = true; // Keeps track of the value of window.event so that we can reset it
        // during the callback to let user code access window.event in the
        // browsers that support it.

        var windowEvent = window.event; // Keeps track of the descriptor of window.event to restore it after event
        // dispatching: https://github.com/facebook/react/issues/13688

        var windowEventDescriptor = Object.getOwnPropertyDescriptor(window, 'event');

        function restoreAfterDispatch() {
          // We immediately remove the callback from event listeners so that
          // nested `invokeGuardedCallback` calls do not clash. Otherwise, a
          // nested call would trigger the fake event handlers of any call higher
          // in the stack.
          fakeNode.removeEventListener(evtType, callCallback, false); // We check for window.hasOwnProperty('event') to prevent the
          // window.event assignment in both IE <= 10 as they throw an error
          // "Member not found" in strict mode, and in Firefox which does not
          // support window.event.

          if (typeof window.event !== 'undefined' && window.hasOwnProperty('event')) {
            window.event = windowEvent;
          }
        } // Create an event handler for our fake event. We will synchronously
        // dispatch our fake event using `dispatchEvent`. Inside the handler, we
        // call the user-provided callback.


        var funcArgs = Array.prototype.slice.call(arguments, 3);

        function callCallback() {
          didCall = true;
          restoreAfterDispatch();
          func.apply(context, funcArgs);
          didError = false;
        } // Create a global error event handler. We use this to capture the value
        // that was thrown. It's possible that this error handler will fire more
        // than once; for example, if non-React code also calls `dispatchEvent`
        // and a handler for that event throws. We should be resilient to most of
        // those cases. Even if our error event handler fires more than once, the
        // last error event is always used. If the callback actually does error,
        // we know that the last error event is the correct one, because it's not
        // possible for anything else to have happened in between our callback
        // erroring and the code that follows the `dispatchEvent` call below. If
        // the callback doesn't error, but the error event was fired, we know to
        // ignore it because `didError` will be false, as described above.


        var error; // Use this to track whether the error event is ever called.

        var didSetError = false;
        var isCrossOriginError = false;

        function handleWindowError(event) {
          error = event.error;
          didSetError = true;

          if (error === null && event.colno === 0 && event.lineno === 0) {
            isCrossOriginError = true;
          }

          if (event.defaultPrevented) {
            // Some other error handler has prevented default.
            // Browsers silence the error report if this happens.
            // We'll remember this to later decide whether to log it or not.
            if (error != null && typeof error === 'object') {
              try {
                error._suppressLogging = true;
              } catch (inner) {// Ignore.
              }
            }
          }
        } // Create a fake event type.


        var evtType = "react-" + (name ? name : 'invokeguardedcallback'); // Attach our event handlers

        window.addEventListener('error', handleWindowError);
        fakeNode.addEventListener(evtType, callCallback, false); // Synchronously dispatch our fake event. If the user-provided function
        // errors, it will trigger our global error handler.

        evt.initEvent(evtType, false, false);
        fakeNode.dispatchEvent(evt);

        if (windowEventDescriptor) {
          Object.defineProperty(window, 'event', windowEventDescriptor);
        }

        if (didCall && didError) {
          if (!didSetError) {
            // The callback errored, but the error event never fired.
            // eslint-disable-next-line react-internal/prod-error-codes
            error = new Error('An error was thrown inside one of your components, but React ' + "doesn't know what it was. This is likely due to browser " + 'flakiness. React does its best to preserve the "Pause on ' + 'exceptions" behavior of the DevTools, which requires some ' + "DEV-mode only tricks. It's possible that these don't work in " + 'your browser. Try triggering the error in production mode, ' + 'or switching to a modern browser. If you suspect that this is ' + 'actually an issue with React, please file an issue.');
          } else if (isCrossOriginError) {
            // eslint-disable-next-line react-internal/prod-error-codes
            error = new Error("A cross-origin error was thrown. React doesn't have access to " + 'the actual error object in development. ' + 'See https://reactjs.org/link/crossorigin-error for more information.');
          }

          this.onError(error);
        } // Remove our event listeners


        window.removeEventListener('error', handleWindowError);

        if (!didCall) {
          // Something went really wrong, and our event was not dispatched.
          // https://github.com/facebook/react/issues/16734
          // https://github.com/facebook/react/issues/16585
          // Fall back to the production implementation.
          restoreAfterDispatch();
          return invokeGuardedCallbackProd.apply(this, arguments);
        }
      };
    }
  }

  var invokeGuardedCallbackImpl$1 = invokeGuardedCallbackImpl;

  var hasError = false;
  var caughtError = null; // Used by event system to capture/rethrow the first error.

  var hasRethrowError = false;
  var rethrowError = null;
  var reporter = {
    onError: function (error) {
      hasError = true;
      caughtError = error;
    }
  };
  /**
   * Call a function while guarding against errors that happens within it.
   * Returns an error if it throws, otherwise null.
   *
   * In production, this is implemented using a try-catch. The reason we don't
   * use a try-catch directly is so that we can swap out a different
   * implementation in DEV mode.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */

  function invokeGuardedCallback(name, func, context, a, b, c, d, e, f) {
    hasError = false;
    caughtError = null;
    invokeGuardedCallbackImpl$1.apply(reporter, arguments);
  }
  /**
   * Same as invokeGuardedCallback, but instead of returning an error, it stores
   * it in a global so it can be rethrown by `rethrowCaughtError` later.
   * TODO: See if caughtError and rethrowError can be unified.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */

  function invokeGuardedCallbackAndCatchFirstError(name, func, context, a, b, c, d, e, f) {
    invokeGuardedCallback.apply(this, arguments);

    if (hasError) {
      var error = clearCaughtError();

      if (!hasRethrowError) {
        hasRethrowError = true;
        rethrowError = error;
      }
    }
  }
  /**
   * During execution of guarded functions we will capture the first error which
   * we will rethrow to be handled by the top level error handler.
   */

  function rethrowCaughtError() {
    if (hasRethrowError) {
      var error = rethrowError;
      hasRethrowError = false;
      rethrowError = null;
      throw error;
    }
  }
  function hasCaughtError() {
    return hasError;
  }
  function clearCaughtError() {
    if (hasError) {
      var error = caughtError;
      hasError = false;
      caughtError = null;
      return error;
    } else {
      throw new Error('clearCaughtError was called but no error was captured. This error ' + 'is likely caused by a bug in React. Please file an issue.');
    }
  }

  var ReactInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  var _ReactInternals$Sched = ReactInternals.Scheduler,
      unstable_cancelCallback = _ReactInternals$Sched.unstable_cancelCallback,
      unstable_now = _ReactInternals$Sched.unstable_now,
      unstable_scheduleCallback = _ReactInternals$Sched.unstable_scheduleCallback,
      unstable_shouldYield = _ReactInternals$Sched.unstable_shouldYield,
      unstable_requestPaint = _ReactInternals$Sched.unstable_requestPaint,
      unstable_getFirstCallbackNode = _ReactInternals$Sched.unstable_getFirstCallbackNode,
      unstable_runWithPriority = _ReactInternals$Sched.unstable_runWithPriority,
      unstable_next = _ReactInternals$Sched.unstable_next,
      unstable_continueExecution = _ReactInternals$Sched.unstable_continueExecution,
      unstable_pauseExecution = _ReactInternals$Sched.unstable_pauseExecution,
      unstable_getCurrentPriorityLevel = _ReactInternals$Sched.unstable_getCurrentPriorityLevel,
      unstable_ImmediatePriority = _ReactInternals$Sched.unstable_ImmediatePriority,
      unstable_UserBlockingPriority = _ReactInternals$Sched.unstable_UserBlockingPriority,
      unstable_NormalPriority = _ReactInternals$Sched.unstable_NormalPriority,
      unstable_LowPriority = _ReactInternals$Sched.unstable_LowPriority,
      unstable_IdlePriority = _ReactInternals$Sched.unstable_IdlePriority,
      unstable_forceFrameRate = _ReactInternals$Sched.unstable_forceFrameRate,
      unstable_flushAllWithoutAsserting = _ReactInternals$Sched.unstable_flushAllWithoutAsserting,
      unstable_yieldValue = _ReactInternals$Sched.unstable_yieldValue,
      unstable_setDisableYieldValue = _ReactInternals$Sched.unstable_setDisableYieldValue;

  /**
   * `ReactInstanceMap` maintains a mapping from a public facing stateful
   * instance (key) and the internal representation (value). This allows public
   * methods to accept the user facing instance as an argument and map them back
   * to internal methods.
   *
   * Note that this module is currently shared and assumed to be stateless.
   * If this becomes an actual Map, that will break.
   */
  function get(key) {
    return key._reactInternals;
  }
  function has(key) {
    return key._reactInternals !== undefined;
  }
  function set(key, value) {
    key._reactInternals = value;
  }

  // Don't change these two values. They're used by React Dev Tools.
  var NoFlags =
  /*                      */
  0;
  var PerformedWork =
  /*                */
  1; // You can change the rest (and add more).

  var Placement =
  /*                    */
  2;
  var Update =
  /*                       */
  4;
  var ChildDeletion =
  /*                */
  16;
  var ContentReset =
  /*                 */
  32;
  var Callback =
  /*                     */
  64;
  var DidCapture =
  /*                   */
  128;
  var ForceClientRender =
  /*            */
  256;
  var Ref =
  /*                          */
  512;
  var Snapshot =
  /*                     */
  1024;
  var Passive =
  /*                      */
  2048;
  var Hydrating =
  /*                    */
  4096;
  var Visibility =
  /*                   */
  8192;
  var StoreConsistency =
  /*             */
  16384;
  var LifecycleEffectMask = Passive | Update | Callback | Ref | Snapshot | StoreConsistency; // Union of all commit flags (flags with the lifetime of a particular commit)

  var HostEffectMask =
  /*               */
  32767; // These are not really side effects, but we still reuse this field.

  var Incomplete =
  /*                   */
  32768;
  var ShouldCapture =
  /*                */
  65536;
  var ForceUpdateForLegacySuspense =
  /* */
  131072;
  var Forked =
  /*                       */
  1048576; // Static tags describe aspects of a fiber that are not specific to a render,
  // e.g. a fiber uses a passive effect (even if there are no updates on this particular render).
  // This enables us to defer more work in the unmount case,
  // since we can defer traversing the tree during layout to look for Passive effects,
  // and instead rely on the static flag as a signal that there may be cleanup work.

  var RefStatic =
  /*                    */
  2097152;
  var LayoutStatic =
  /*                 */
  4194304;
  var PassiveStatic =
  /*                */
  8388608; // These flags allow us to traverse to fibers that have effects on mount
  // without traversing the entire tree after every commit for
  // double invoking

  var MountLayoutDev =
  /*               */
  16777216;
  var MountPassiveDev =
  /*              */
  33554432; // Groups of flags that are used in the commit phase to skip over trees that
  // don't contain effects, by checking subtreeFlags.

  var BeforeMutationMask = // TODO: Remove Update flag from before mutation phase by re-landing Visibility
  // flag logic (see #20043)
  Update | Snapshot | ( 0);
  var MutationMask = Placement | Update | ChildDeletion | ContentReset | Ref | Hydrating | Visibility;
  var LayoutMask = Update | Callback | Ref | Visibility; // TODO: Split into PassiveMountMask and PassiveUnmountMask

  var PassiveMask = Passive | ChildDeletion; // Union of tags that don't get reset on clones.
  // This allows certain concepts to persist without recalculating them,
  // e.g. whether a subtree contains passive effects or portals.

  var StaticMask = LayoutStatic | PassiveStatic | RefStatic;

  var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
  function getNearestMountedFiber(fiber) {
    var node = fiber;
    var nearestMounted = fiber;

    if (!fiber.alternate) {
      // If there is no alternate, this might be a new tree that isn't inserted
      // yet. If it is, then it will have a pending insertion effect on it.
      var nextNode = node;

      do {
        node = nextNode;

        if ((node.flags & (Placement | Hydrating)) !== NoFlags) {
          // This is an insertion or in-progress hydration. The nearest possible
          // mounted fiber is the parent but we need to continue to figure out
          // if that one is still mounted.
          nearestMounted = node.return;
        }

        nextNode = node.return;
      } while (nextNode);
    } else {
      while (node.return) {
        node = node.return;
      }
    }

    if (node.tag === HostRoot) {
      // TODO: Check if this was a nested HostRoot when used with
      // renderContainerIntoSubtree.
      return nearestMounted;
    } // If we didn't hit the root, that means that we're in an disconnected tree
    // that has been unmounted.


    return null;
  }
  function getSuspenseInstanceFromFiber(fiber) {
    if (fiber.tag === SuspenseComponent) {
      var suspenseState = fiber.memoizedState;

      if (suspenseState === null) {
        var current = fiber.alternate;

        if (current !== null) {
          suspenseState = current.memoizedState;
        }
      }

      if (suspenseState !== null) {
        return suspenseState.dehydrated;
      }
    }

    return null;
  }
  function getContainerFromFiber(fiber) {
    return fiber.tag === HostRoot ? fiber.stateNode.containerInfo : null;
  }
  function isFiberMounted(fiber) {
    return getNearestMountedFiber(fiber) === fiber;
  }
  function isMounted(component) {
    {
      var owner = ReactCurrentOwner.current;

      if (owner !== null && owner.tag === ClassComponent) {
        var ownerFiber = owner;
        var instance = ownerFiber.stateNode;

        if (!instance._warnedAboutRefsInRender) {
          error('%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentNameFromFiber(ownerFiber) || 'A component');
        }

        instance._warnedAboutRefsInRender = true;
      }
    }

    var fiber = get(component);

    if (!fiber) {
      return false;
    }

    return getNearestMountedFiber(fiber) === fiber;
  }

  function assertIsMounted(fiber) {
    if (getNearestMountedFiber(fiber) !== fiber) {
      throw new Error('Unable to find node on an unmounted component.');
    }
  }

  function findCurrentFiberUsingSlowPath(fiber) {
    var alternate = fiber.alternate;

    if (!alternate) {
      // If there is no alternate, then we only need to check if it is mounted.
      var nearestMounted = getNearestMountedFiber(fiber);

      if (nearestMounted === null) {
        throw new Error('Unable to find node on an unmounted component.');
      }

      if (nearestMounted !== fiber) {
        return null;
      }

      return fiber;
    } // If we have two possible branches, we'll walk backwards up to the root
    // to see what path the root points to. On the way we may hit one of the
    // special cases and we'll deal with them.


    var a = fiber;
    var b = alternate;

    while (true) {
      var parentA = a.return;

      if (parentA === null) {
        // We're at the root.
        break;
      }

      var parentB = parentA.alternate;

      if (parentB === null) {
        // There is no alternate. This is an unusual case. Currently, it only
        // happens when a Suspense component is hidden. An extra fragment fiber
        // is inserted in between the Suspense fiber and its children. Skip
        // over this extra fragment fiber and proceed to the next parent.
        var nextParent = parentA.return;

        if (nextParent !== null) {
          a = b = nextParent;
          continue;
        } // If there's no parent, we're at the root.


        break;
      } // If both copies of the parent fiber point to the same child, we can
      // assume that the child is current. This happens when we bailout on low
      // priority: the bailed out fiber's child reuses the current child.


      if (parentA.child === parentB.child) {
        var child = parentA.child;

        while (child) {
          if (child === a) {
            // We've determined that A is the current branch.
            assertIsMounted(parentA);
            return fiber;
          }

          if (child === b) {
            // We've determined that B is the current branch.
            assertIsMounted(parentA);
            return alternate;
          }

          child = child.sibling;
        } // We should never have an alternate for any mounting node. So the only
        // way this could possibly happen is if this was unmounted, if at all.


        throw new Error('Unable to find node on an unmounted component.');
      }

      if (a.return !== b.return) {
        // The return pointer of A and the return pointer of B point to different
        // fibers. We assume that return pointers never criss-cross, so A must
        // belong to the child set of A.return, and B must belong to the child
        // set of B.return.
        a = parentA;
        b = parentB;
      } else {
        // The return pointers point to the same fiber. We'll have to use the
        // default, slow path: scan the child sets of each parent alternate to see
        // which child belongs to which set.
        //
        // Search parent A's child set
        var didFindChild = false;
        var _child = parentA.child;

        while (_child) {
          if (_child === a) {
            didFindChild = true;
            a = parentA;
            b = parentB;
            break;
          }

          if (_child === b) {
            didFindChild = true;
            b = parentA;
            a = parentB;
            break;
          }

          _child = _child.sibling;
        }

        if (!didFindChild) {
          // Search parent B's child set
          _child = parentB.child;

          while (_child) {
            if (_child === a) {
              didFindChild = true;
              a = parentB;
              b = parentA;
              break;
            }

            if (_child === b) {
              didFindChild = true;
              b = parentB;
              a = parentA;
              break;
            }

            _child = _child.sibling;
          }

          if (!didFindChild) {
            throw new Error('Child was not found in either parent set. This indicates a bug ' + 'in React related to the return pointer. Please file an issue.');
          }
        }
      }

      if (a.alternate !== b) {
        throw new Error("Return fibers should always be each others' alternates. " + 'This error is likely caused by a bug in React. Please file an issue.');
      }
    } // If the root is not a host container, we're in a disconnected tree. I.e.
    // unmounted.


    if (a.tag !== HostRoot) {
      throw new Error('Unable to find node on an unmounted component.');
    }

    if (a.stateNode.current === a) {
      // We've determined that A is the current branch.
      return fiber;
    } // Otherwise B has to be current branch.


    return alternate;
  }
  function findCurrentHostFiber(parent) {
    var currentParent = findCurrentFiberUsingSlowPath(parent);
    return currentParent !== null ? findCurrentHostFiberImpl(currentParent) : null;
  }

  function findCurrentHostFiberImpl(node) {
    // Next we'll drill down this component to find the first HostComponent/Text.
    if (node.tag === HostComponent || node.tag === HostText) {
      return node;
    }

    var child = node.child;

    while (child !== null) {
      var match = findCurrentHostFiberImpl(child);

      if (match !== null) {
        return match;
      }

      child = child.sibling;
    }

    return null;
  }

  function findCurrentHostFiberWithNoPortals(parent) {
    var currentParent = findCurrentFiberUsingSlowPath(parent);
    return currentParent !== null ? findCurrentHostFiberWithNoPortalsImpl(currentParent) : null;
  }

  function findCurrentHostFiberWithNoPortalsImpl(node) {
    // Next we'll drill down this component to find the first HostComponent/Text.
    if (node.tag === HostComponent || node.tag === HostText) {
      return node;
    }

    var child = node.child;

    while (child !== null) {
      if (child.tag !== HostPortal) {
        var match = findCurrentHostFiberWithNoPortalsImpl(child);

        if (match !== null) {
          return match;
        }
      }

      child = child.sibling;
    }

    return null;
  }

  // This module only exists as an ESM wrapper around the external CommonJS
  var scheduleCallback = unstable_scheduleCallback;
  var cancelCallback = unstable_cancelCallback;
  var shouldYield = unstable_shouldYield;
  var requestPaint = unstable_requestPaint;
  var now = unstable_now;
  var getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
  var ImmediatePriority = unstable_ImmediatePriority;
  var UserBlockingPriority = unstable_UserBlockingPriority;
  var NormalPriority = unstable_NormalPriority;
  var LowPriority = unstable_LowPriority;
  var IdlePriority = unstable_IdlePriority;
  // this doesn't actually exist on the scheduler, but it *does*
  // on scheduler/unstable_mock, which we'll need for internal testing
  var unstable_yieldValue$1 = unstable_yieldValue;
  var unstable_setDisableYieldValue$1 = unstable_setDisableYieldValue;

  var rendererID = null;
  var injectedHook = null;
  var injectedProfilingHooks = null;
  var hasLoggedError = false;
  var isDevToolsPresent = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
  function injectInternals(internals) {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
      // No DevTools
      return false;
    }

    var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;

    if (hook.isDisabled) {
      // This isn't a real property on the hook, but it can be set to opt out
      // of DevTools integration and associated warnings and logs.
      // https://github.com/facebook/react/issues/3877
      return true;
    }

    if (!hook.supportsFiber) {
      {
        error('The installed version of React DevTools is too old and will not work ' + 'with the current version of React. Please update React DevTools. ' + 'https://reactjs.org/link/react-devtools');
      } // DevTools exists, even though it doesn't support Fiber.


      return true;
    }

    try {
      if (enableSchedulingProfiler) {
        // Conditionally inject these hooks only if Timeline profiler is supported by this build.
        // This gives DevTools a way to feature detect that isn't tied to version number
        // (since profiling and timeline are controlled by different feature flags).
        internals = assign({}, internals, {
          getLaneLabelMap: getLaneLabelMap,
          injectProfilingHooks: injectProfilingHooks
        });
      }

      rendererID = hook.inject(internals); // We have successfully injected, so now it is safe to set up hooks.

      injectedHook = hook;
    } catch (err) {
      // Catch all errors because it is unsafe to throw during initialization.
      {
        error('React instrumentation encountered an error: %s.', err);
      }
    }

    if (hook.checkDCE) {
      // This is the real DevTools.
      return true;
    } else {
      // This is likely a hook installed by Fast Refresh runtime.
      return false;
    }
  }
  function onScheduleRoot(root, children) {
    {
      if (injectedHook && typeof injectedHook.onScheduleFiberRoot === 'function') {
        try {
          injectedHook.onScheduleFiberRoot(rendererID, root, children);
        } catch (err) {
          if ( !hasLoggedError) {
            hasLoggedError = true;

            error('React instrumentation encountered an error: %s', err);
          }
        }
      }
    }
  }
  function onCommitRoot(root, eventPriority) {
    if (injectedHook && typeof injectedHook.onCommitFiberRoot === 'function') {
      try {
        var didError = (root.current.flags & DidCapture) === DidCapture;

        if (enableProfilerTimer) {
          var schedulerPriority;

          switch (eventPriority) {
            case DiscreteEventPriority:
              schedulerPriority = ImmediatePriority;
              break;

            case ContinuousEventPriority:
              schedulerPriority = UserBlockingPriority;
              break;

            case DefaultEventPriority:
              schedulerPriority = NormalPriority;
              break;

            case IdleEventPriority:
              schedulerPriority = IdlePriority;
              break;

            default:
              schedulerPriority = NormalPriority;
              break;
          }

          injectedHook.onCommitFiberRoot(rendererID, root, schedulerPriority, didError);
        } else {
          injectedHook.onCommitFiberRoot(rendererID, root, undefined, didError);
        }
      } catch (err) {
        {
          if (!hasLoggedError) {
            hasLoggedError = true;

            error('React instrumentation encountered an error: %s', err);
          }
        }
      }
    }
  }
  function onPostCommitRoot(root) {
    if (injectedHook && typeof injectedHook.onPostCommitFiberRoot === 'function') {
      try {
        injectedHook.onPostCommitFiberRoot(rendererID, root);
      } catch (err) {
        {
          if (!hasLoggedError) {
            hasLoggedError = true;

            error('React instrumentation encountered an error: %s', err);
          }
        }
      }
    }
  }
  function onCommitUnmount(fiber) {
    if (injectedHook && typeof injectedHook.onCommitFiberUnmount === 'function') {
      try {
        injectedHook.onCommitFiberUnmount(rendererID, fiber);
      } catch (err) {
        {
          if (!hasLoggedError) {
            hasLoggedError = true;

            error('React instrumentation encountered an error: %s', err);
          }
        }
      }
    }
  }
  function setIsStrictModeForDevtools(newIsStrictMode) {
    {
      if (typeof unstable_yieldValue$1 === 'function') {
        // We're in a test because Scheduler.unstable_yieldValue only exists
        // in SchedulerMock. To reduce the noise in strict mode tests,
        // suppress warnings and disable scheduler yielding during the double render
        unstable_setDisableYieldValue$1(newIsStrictMode);
        setSuppressWarning(newIsStrictMode);
      }

      if (injectedHook && typeof injectedHook.setStrictMode === 'function') {
        try {
          injectedHook.setStrictMode(rendererID, newIsStrictMode);
        } catch (err) {
          {
            if (!hasLoggedError) {
              hasLoggedError = true;

              error('React instrumentation encountered an error: %s', err);
            }
          }
        }
      }
    }
  } // Profiler API hooks

  function injectProfilingHooks(profilingHooks) {
    injectedProfilingHooks = profilingHooks;
  }

  function getLaneLabelMap() {
    {
      var map = new Map();
      var lane = 1;

      for (var index = 0; index < TotalLanes; index++) {
        var label = getLabelForLane(lane);
        map.set(lane, label);
        lane *= 2;
      }

      return map;
    }
  }

  function markCommitStarted(lanes) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markCommitStarted === 'function') {
        injectedProfilingHooks.markCommitStarted(lanes);
      }
    }
  }
  function markCommitStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markCommitStopped === 'function') {
        injectedProfilingHooks.markCommitStopped();
      }
    }
  }
  function markComponentRenderStarted(fiber) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentRenderStarted === 'function') {
        injectedProfilingHooks.markComponentRenderStarted(fiber);
      }
    }
  }
  function markComponentRenderStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentRenderStopped === 'function') {
        injectedProfilingHooks.markComponentRenderStopped();
      }
    }
  }
  function markComponentPassiveEffectMountStarted(fiber) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectMountStarted === 'function') {
        injectedProfilingHooks.markComponentPassiveEffectMountStarted(fiber);
      }
    }
  }
  function markComponentPassiveEffectMountStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectMountStopped === 'function') {
        injectedProfilingHooks.markComponentPassiveEffectMountStopped();
      }
    }
  }
  function markComponentPassiveEffectUnmountStarted(fiber) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectUnmountStarted === 'function') {
        injectedProfilingHooks.markComponentPassiveEffectUnmountStarted(fiber);
      }
    }
  }
  function markComponentPassiveEffectUnmountStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentPassiveEffectUnmountStopped === 'function') {
        injectedProfilingHooks.markComponentPassiveEffectUnmountStopped();
      }
    }
  }
  function markComponentLayoutEffectMountStarted(fiber) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectMountStarted === 'function') {
        injectedProfilingHooks.markComponentLayoutEffectMountStarted(fiber);
      }
    }
  }
  function markComponentLayoutEffectMountStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectMountStopped === 'function') {
        injectedProfilingHooks.markComponentLayoutEffectMountStopped();
      }
    }
  }
  function markComponentLayoutEffectUnmountStarted(fiber) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectUnmountStarted === 'function') {
        injectedProfilingHooks.markComponentLayoutEffectUnmountStarted(fiber);
      }
    }
  }
  function markComponentLayoutEffectUnmountStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentLayoutEffectUnmountStopped === 'function') {
        injectedProfilingHooks.markComponentLayoutEffectUnmountStopped();
      }
    }
  }
  function markComponentErrored(fiber, thrownValue, lanes) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentErrored === 'function') {
        injectedProfilingHooks.markComponentErrored(fiber, thrownValue, lanes);
      }
    }
  }
  function markComponentSuspended(fiber, wakeable, lanes) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markComponentSuspended === 'function') {
        injectedProfilingHooks.markComponentSuspended(fiber, wakeable, lanes);
      }
    }
  }
  function markLayoutEffectsStarted(lanes) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markLayoutEffectsStarted === 'function') {
        injectedProfilingHooks.markLayoutEffectsStarted(lanes);
      }
    }
  }
  function markLayoutEffectsStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markLayoutEffectsStopped === 'function') {
        injectedProfilingHooks.markLayoutEffectsStopped();
      }
    }
  }
  function markPassiveEffectsStarted(lanes) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markPassiveEffectsStarted === 'function') {
        injectedProfilingHooks.markPassiveEffectsStarted(lanes);
      }
    }
  }
  function markPassiveEffectsStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markPassiveEffectsStopped === 'function') {
        injectedProfilingHooks.markPassiveEffectsStopped();
      }
    }
  }
  function markRenderStarted(lanes) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderStarted === 'function') {
        injectedProfilingHooks.markRenderStarted(lanes);
      }
    }
  }
  function markRenderYielded() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderYielded === 'function') {
        injectedProfilingHooks.markRenderYielded();
      }
    }
  }
  function markRenderStopped() {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderStopped === 'function') {
        injectedProfilingHooks.markRenderStopped();
      }
    }
  }
  function markRenderScheduled(lane) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markRenderScheduled === 'function') {
        injectedProfilingHooks.markRenderScheduled(lane);
      }
    }
  }
  function markForceUpdateScheduled(fiber, lane) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markForceUpdateScheduled === 'function') {
        injectedProfilingHooks.markForceUpdateScheduled(fiber, lane);
      }
    }
  }
  function markStateUpdateScheduled(fiber, lane) {
    {
      if (injectedProfilingHooks !== null && typeof injectedProfilingHooks.markStateUpdateScheduled === 'function') {
        injectedProfilingHooks.markStateUpdateScheduled(fiber, lane);
      }
    }
  }

  var NoMode =
  /*                         */
  0; // TODO: Remove ConcurrentMode by reading from the root tag instead

  var ConcurrentMode =
  /*                 */
  1;
  var ProfileMode =
  /*                    */
  2;
  var StrictLegacyMode =
  /*               */
  8;
  var StrictEffectsMode =
  /*              */
  16;

  // TODO: This is pretty well supported by browsers. Maybe we can drop it.
  var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback; // Count leading zeros.
  // Based on:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

  var log = Math.log;
  var LN2 = Math.LN2;

  function clz32Fallback(x) {
    var asUint = x >>> 0;

    if (asUint === 0) {
      return 32;
    }

    return 31 - (log(asUint) / LN2 | 0) | 0;
  }

  // If those values are changed that package should be rebuilt and redeployed.

  var TotalLanes = 31;
  var NoLanes =
  /*                        */
  0;
  var NoLane =
  /*                          */
  0;
  var SyncLane =
  /*                        */
  1;
  var InputContinuousHydrationLane =
  /*    */
  2;
  var InputContinuousLane =
  /*             */
  4;
  var DefaultHydrationLane =
  /*            */
  8;
  var DefaultLane =
  /*                     */
  16;
  var TransitionHydrationLane =
  /*                */
  32;
  var TransitionLanes =
  /*                       */
  4194240;
  var TransitionLane1 =
  /*                        */
  64;
  var TransitionLane2 =
  /*                        */
  128;
  var TransitionLane3 =
  /*                        */
  256;
  var TransitionLane4 =
  /*                        */
  512;
  var TransitionLane5 =
  /*                        */
  1024;
  var TransitionLane6 =
  /*                        */
  2048;
  var TransitionLane7 =
  /*                        */
  4096;
  var TransitionLane8 =
  /*                        */
  8192;
  var TransitionLane9 =
  /*                        */
  16384;
  var TransitionLane10 =
  /*                       */
  32768;
  var TransitionLane11 =
  /*                       */
  65536;
  var TransitionLane12 =
  /*                       */
  131072;
  var TransitionLane13 =
  /*                       */
  262144;
  var TransitionLane14 =
  /*                       */
  524288;
  var TransitionLane15 =
  /*                       */
  1048576;
  var TransitionLane16 =
  /*                       */
  2097152;
  var RetryLanes =
  /*                            */
  130023424;
  var RetryLane1 =
  /*                             */
  4194304;
  var RetryLane2 =
  /*                             */
  8388608;
  var RetryLane3 =
  /*                             */
  16777216;
  var RetryLane4 =
  /*                             */
  33554432;
  var RetryLane5 =
  /*                             */
  67108864;
  var SomeRetryLane = RetryLane1;
  var SelectiveHydrationLane =
  /*          */
  134217728;
  var NonIdleLanes =
  /*                          */
  268435455;
  var IdleHydrationLane =
  /*               */
  268435456;
  var IdleLane =
  /*                        */
  536870912;
  var OffscreenLane =
  /*                   */
  1073741824; // This function is used for the experimental timeline (react-devtools-timeline)
  // It should be kept in sync with the Lanes values above.

  function getLabelForLane(lane) {
    {
      if (lane & SyncLane) {
        return 'Sync';
      }

      if (lane & InputContinuousHydrationLane) {
        return 'InputContinuousHydration';
      }

      if (lane & InputContinuousLane) {
        return 'InputContinuous';
      }

      if (lane & DefaultHydrationLane) {
        return 'DefaultHydration';
      }

      if (lane & DefaultLane) {
        return 'Default';
      }

      if (lane & TransitionHydrationLane) {
        return 'TransitionHydration';
      }

      if (lane & TransitionLanes) {
        return 'Transition';
      }

      if (lane & RetryLanes) {
        return 'Retry';
      }

      if (lane & SelectiveHydrationLane) {
        return 'SelectiveHydration';
      }

      if (lane & IdleHydrationLane) {
        return 'IdleHydration';
      }

      if (lane & IdleLane) {
        return 'Idle';
      }

      if (lane & OffscreenLane) {
        return 'Offscreen';
      }
    }
  }
  var NoTimestamp = -1;
  var nextTransitionLane = TransitionLane1;
  var nextRetryLane = RetryLane1;

  function getHighestPriorityLanes(lanes) {
    switch (getHighestPriorityLane(lanes)) {
      case SyncLane:
        return SyncLane;

      case InputContinuousHydrationLane:
        return InputContinuousHydrationLane;

      case InputContinuousLane:
        return InputContinuousLane;

      case DefaultHydrationLane:
        return DefaultHydrationLane;

      case DefaultLane:
        return DefaultLane;

      case TransitionHydrationLane:
        return TransitionHydrationLane;

      case TransitionLane1:
      case TransitionLane2:
      case TransitionLane3:
      case TransitionLane4:
      case TransitionLane5:
      case TransitionLane6:
      case TransitionLane7:
      case TransitionLane8:
      case TransitionLane9:
      case TransitionLane10:
      case TransitionLane11:
      case TransitionLane12:
      case TransitionLane13:
      case TransitionLane14:
      case TransitionLane15:
      case TransitionLane16:
        return lanes & TransitionLanes;

      case RetryLane1:
      case RetryLane2:
      case RetryLane3:
      case RetryLane4:
      case RetryLane5:
        return lanes & RetryLanes;

      case SelectiveHydrationLane:
        return SelectiveHydrationLane;

      case IdleHydrationLane:
        return IdleHydrationLane;

      case IdleLane:
        return IdleLane;

      case OffscreenLane:
        return OffscreenLane;

      default:
        {
          error('Should have found matching lanes. This is a bug in React.');
        } // This shouldn't be reachable, but as a fallback, return the entire bitmask.


        return lanes;
    }
  }

  function getNextLanes(root, wipLanes) {
    // Early bailout if there's no pending work left.
    var pendingLanes = root.pendingLanes;

    if (pendingLanes === NoLanes) {
      return NoLanes;
    }

    var nextLanes = NoLanes;
    var suspendedLanes = root.suspendedLanes;
    var pingedLanes = root.pingedLanes; // Do not work on any idle work until all the non-idle work has finished,
    // even if the work is suspended.

    var nonIdlePendingLanes = pendingLanes & NonIdleLanes;

    if (nonIdlePendingLanes !== NoLanes) {
      var nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;

      if (nonIdleUnblockedLanes !== NoLanes) {
        nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
      } else {
        var nonIdlePingedLanes = nonIdlePendingLanes & pingedLanes;

        if (nonIdlePingedLanes !== NoLanes) {
          nextLanes = getHighestPriorityLanes(nonIdlePingedLanes);
        }
      }
    } else {
      // The only remaining work is Idle.
      var unblockedLanes = pendingLanes & ~suspendedLanes;

      if (unblockedLanes !== NoLanes) {
        nextLanes = getHighestPriorityLanes(unblockedLanes);
      } else {
        if (pingedLanes !== NoLanes) {
          nextLanes = getHighestPriorityLanes(pingedLanes);
        }
      }
    }

    if (nextLanes === NoLanes) {
      // This should only be reachable if we're suspended
      // TODO: Consider warning in this path if a fallback timer is not scheduled.
      return NoLanes;
    } // If we're already in the middle of a render, switching lanes will interrupt
    // it and we'll lose our progress. We should only do this if the new lanes are
    // higher priority.


    if (wipLanes !== NoLanes && wipLanes !== nextLanes && // If we already suspended with a delay, then interrupting is fine. Don't
    // bother waiting until the root is complete.
    (wipLanes & suspendedLanes) === NoLanes) {
      var nextLane = getHighestPriorityLane(nextLanes);
      var wipLane = getHighestPriorityLane(wipLanes);

      if ( // Tests whether the next lane is equal or lower priority than the wip
      // one. This works because the bits decrease in priority as you go left.
      nextLane >= wipLane || // Default priority updates should not interrupt transition updates. The
      // only difference between default updates and transition updates is that
      // default updates do not support refresh transitions.
      nextLane === DefaultLane && (wipLane & TransitionLanes) !== NoLanes) {
        // Keep working on the existing in-progress tree. Do not interrupt.
        return wipLanes;
      }
    }

    if ((nextLanes & InputContinuousLane) !== NoLanes) {
      // When updates are sync by default, we entangle continuous priority updates
      // and default updates, so they render in the same batch. The only reason
      // they use separate lanes is because continuous updates should interrupt
      // transitions, but default updates should not.
      nextLanes |= pendingLanes & DefaultLane;
    } // Check for entangled lanes and add them to the batch.
    //
    // A lane is said to be entangled with another when it's not allowed to render
    // in a batch that does not also include the other lane. Typically we do this
    // when multiple updates have the same source, and we only want to respond to
    // the most recent event from that source.
    //
    // Note that we apply entanglements *after* checking for partial work above.
    // This means that if a lane is entangled during an interleaved event while
    // it's already rendering, we won't interrupt it. This is intentional, since
    // entanglement is usually "best effort": we'll try our best to render the
    // lanes in the same batch, but it's not worth throwing out partially
    // completed work in order to do it.
    // TODO: Reconsider this. The counter-argument is that the partial work
    // represents an intermediate state, which we don't want to show to the user.
    // And by spending extra time finishing it, we're increasing the amount of
    // time it takes to show the final state, which is what they are actually
    // waiting for.
    //
    // For those exceptions where entanglement is semantically important, like
    // useMutableSource, we should ensure that there is no partial work at the
    // time we apply the entanglement.


    var entangledLanes = root.entangledLanes;

    if (entangledLanes !== NoLanes) {
      var entanglements = root.entanglements;
      var lanes = nextLanes & entangledLanes;

      while (lanes > 0) {
        var index = pickArbitraryLaneIndex(lanes);
        var lane = 1 << index;
        nextLanes |= entanglements[index];
        lanes &= ~lane;
      }
    }

    return nextLanes;
  }
  function getMostRecentEventTime(root, lanes) {
    var eventTimes = root.eventTimes;
    var mostRecentEventTime = NoTimestamp;

    while (lanes > 0) {
      var index = pickArbitraryLaneIndex(lanes);
      var lane = 1 << index;
      var eventTime = eventTimes[index];

      if (eventTime > mostRecentEventTime) {
        mostRecentEventTime = eventTime;
      }

      lanes &= ~lane;
    }

    return mostRecentEventTime;
  }

  function computeExpirationTime(lane, currentTime) {
    switch (lane) {
      case SyncLane:
      case InputContinuousHydrationLane:
      case InputContinuousLane:
        // User interactions should expire slightly more quickly.
        //
        // NOTE: This is set to the corresponding constant as in Scheduler.js.
        // When we made it larger, a product metric in www regressed, suggesting
        // there's a user interaction that's being starved by a series of
        // synchronous updates. If that theory is correct, the proper solution is
        // to fix the starvation. However, this scenario supports the idea that
        // expiration times are an important safeguard when starvation
        // does happen.
        return currentTime + 250;

      case DefaultHydrationLane:
      case DefaultLane:
      case TransitionHydrationLane:
      case TransitionLane1:
      case TransitionLane2:
      case TransitionLane3:
      case TransitionLane4:
      case TransitionLane5:
      case TransitionLane6:
      case TransitionLane7:
      case TransitionLane8:
      case TransitionLane9:
      case TransitionLane10:
      case TransitionLane11:
      case TransitionLane12:
      case TransitionLane13:
      case TransitionLane14:
      case TransitionLane15:
      case TransitionLane16:
        return currentTime + 5000;

      case RetryLane1:
      case RetryLane2:
      case RetryLane3:
      case RetryLane4:
      case RetryLane5:
        // TODO: Retries should be allowed to expire if they are CPU bound for
        // too long, but when I made this change it caused a spike in browser
        // crashes. There must be some other underlying bug; not super urgent but
        // ideally should figure out why and fix it. Unfortunately we don't have
        // a repro for the crashes, only detected via production metrics.
        return NoTimestamp;

      case SelectiveHydrationLane:
      case IdleHydrationLane:
      case IdleLane:
      case OffscreenLane:
        // Anything idle priority or lower should never expire.
        return NoTimestamp;

      default:
        {
          error('Should have found matching lanes. This is a bug in React.');
        }

        return NoTimestamp;
    }
  }

  function markStarvedLanesAsExpired(root, currentTime) {
    // TODO: This gets called every time we yield. We can optimize by storing
    // the earliest expiration time on the root. Then use that to quickly bail out
    // of this function.
    var pendingLanes = root.pendingLanes;
    var suspendedLanes = root.suspendedLanes;
    var pingedLanes = root.pingedLanes;
    var expirationTimes = root.expirationTimes; // Iterate through the pending lanes and check if we've reached their
    // expiration time. If so, we'll assume the update is being starved and mark
    // it as expired to force it to finish.

    var lanes = pendingLanes;

    while (lanes > 0) {
      var index = pickArbitraryLaneIndex(lanes);
      var lane = 1 << index;
      var expirationTime = expirationTimes[index];

      if (expirationTime === NoTimestamp) {
        // Found a pending lane with no expiration time. If it's not suspended, or
        // if it's pinged, assume it's CPU-bound. Compute a new expiration time
        // using the current time.
        if ((lane & suspendedLanes) === NoLanes || (lane & pingedLanes) !== NoLanes) {
          // Assumes timestamps are monotonically increasing.
          expirationTimes[index] = computeExpirationTime(lane, currentTime);
        }
      } else if (expirationTime <= currentTime) {
        // This lane expired
        root.expiredLanes |= lane;
      }

      lanes &= ~lane;
    }
  } // This returns the highest priority pending lanes regardless of whether they
  // are suspended.

  function getHighestPriorityPendingLanes(root) {
    return getHighestPriorityLanes(root.pendingLanes);
  }
  function getLanesToRetrySynchronouslyOnError(root) {
    var everythingButOffscreen = root.pendingLanes & ~OffscreenLane;

    if (everythingButOffscreen !== NoLanes) {
      return everythingButOffscreen;
    }

    if (everythingButOffscreen & OffscreenLane) {
      return OffscreenLane;
    }

    return NoLanes;
  }
  function includesSyncLane(lanes) {
    return (lanes & SyncLane) !== NoLanes;
  }
  function includesNonIdleWork(lanes) {
    return (lanes & NonIdleLanes) !== NoLanes;
  }
  function includesOnlyRetries(lanes) {
    return (lanes & RetryLanes) === lanes;
  }
  function includesOnlyNonUrgentLanes(lanes) {
    var UrgentLanes = SyncLane | InputContinuousLane | DefaultLane;
    return (lanes & UrgentLanes) === NoLanes;
  }
  function includesOnlyTransitions(lanes) {
    return (lanes & TransitionLanes) === lanes;
  }
  function includesBlockingLane(root, lanes) {

    var SyncDefaultLanes = InputContinuousHydrationLane | InputContinuousLane | DefaultHydrationLane | DefaultLane;
    return (lanes & SyncDefaultLanes) !== NoLanes;
  }
  function includesExpiredLane(root, lanes) {
    // This is a separate check from includesBlockingLane because a lane can
    // expire after a render has already started.
    return (lanes & root.expiredLanes) !== NoLanes;
  }
  function isTransitionLane(lane) {
    return (lane & TransitionLanes) !== NoLanes;
  }
  function claimNextTransitionLane() {
    // Cycle through the lanes, assigning each new transition to the next lane.
    // In most cases, this means every transition gets its own lane, until we
    // run out of lanes and cycle back to the beginning.
    var lane = nextTransitionLane;
    nextTransitionLane <<= 1;

    if ((nextTransitionLane & TransitionLanes) === NoLanes) {
      nextTransitionLane = TransitionLane1;
    }

    return lane;
  }
  function claimNextRetryLane() {
    var lane = nextRetryLane;
    nextRetryLane <<= 1;

    if ((nextRetryLane & RetryLanes) === NoLanes) {
      nextRetryLane = RetryLane1;
    }

    return lane;
  }
  function getHighestPriorityLane(lanes) {
    return lanes & -lanes;
  }
  function pickArbitraryLane(lanes) {
    // This wrapper function gets inlined. Only exists so to communicate that it
    // doesn't matter which bit is selected; you can pick any bit without
    // affecting the algorithms where its used. Here I'm using
    // getHighestPriorityLane because it requires the fewest operations.
    return getHighestPriorityLane(lanes);
  }

  function pickArbitraryLaneIndex(lanes) {
    return 31 - clz32(lanes);
  }

  function laneToIndex(lane) {
    return pickArbitraryLaneIndex(lane);
  }

  function includesSomeLane(a, b) {
    return (a & b) !== NoLanes;
  }
  function isSubsetOfLanes(set, subset) {
    return (set & subset) === subset;
  }
  function mergeLanes(a, b) {
    return a | b;
  }
  function removeLanes(set, subset) {
    return set & ~subset;
  }
  function intersectLanes(a, b) {
    return a & b;
  } // Seems redundant, but it changes the type from a single lane (used for
  // updates) to a group of lanes (used for flushing work).

  function laneToLanes(lane) {
    return lane;
  }
  function higherPriorityLane(a, b) {
    // This works because the bit ranges decrease in priority as you go left.
    return a !== NoLane && a < b ? a : b;
  }
  function createLaneMap(initial) {
    // Intentionally pushing one by one.
    // https://v8.dev/blog/elements-kinds#avoid-creating-holes
    var laneMap = [];

    for (var i = 0; i < TotalLanes; i++) {
      laneMap.push(initial);
    }

    return laneMap;
  }
  function markRootUpdated(root, updateLane, eventTime) {
    root.pendingLanes |= updateLane; // If there are any suspended transitions, it's possible this new update
    // could unblock them. Clear the suspended lanes so that we can try rendering
    // them again.
    //
    // TODO: We really only need to unsuspend only lanes that are in the
    // `subtreeLanes` of the updated fiber, or the update lanes of the return
    // path. This would exclude suspended updates in an unrelated sibling tree,
    // since there's no way for this update to unblock it.
    //
    // We don't do this if the incoming update is idle, because we never process
    // idle updates until after all the regular updates have finished; there's no
    // way it could unblock a transition.

    if (updateLane !== IdleLane) {
      root.suspendedLanes = NoLanes;
      root.pingedLanes = NoLanes;
    }

    var eventTimes = root.eventTimes;
    var index = laneToIndex(updateLane); // We can always overwrite an existing timestamp because we prefer the most
    // recent event, and we assume time is monotonically increasing.

    eventTimes[index] = eventTime;
  }
  function markRootSuspended(root, suspendedLanes) {
    root.suspendedLanes |= suspendedLanes;
    root.pingedLanes &= ~suspendedLanes; // The suspended lanes are no longer CPU-bound. Clear their expiration times.

    var expirationTimes = root.expirationTimes;
    var lanes = suspendedLanes;

    while (lanes > 0) {
      var index = pickArbitraryLaneIndex(lanes);
      var lane = 1 << index;
      expirationTimes[index] = NoTimestamp;
      lanes &= ~lane;
    }
  }
  function markRootPinged(root, pingedLanes, eventTime) {
    root.pingedLanes |= root.suspendedLanes & pingedLanes;
  }
  function markRootFinished(root, remainingLanes) {
    var noLongerPendingLanes = root.pendingLanes & ~remainingLanes;
    root.pendingLanes = remainingLanes; // Let's try everything again

    root.suspendedLanes = NoLanes;
    root.pingedLanes = NoLanes;
    root.expiredLanes &= remainingLanes;
    root.mutableReadLanes &= remainingLanes;
    root.entangledLanes &= remainingLanes;
    var entanglements = root.entanglements;
    var eventTimes = root.eventTimes;
    var expirationTimes = root.expirationTimes; // Clear the lanes that no longer have pending work

    var lanes = noLongerPendingLanes;

    while (lanes > 0) {
      var index = pickArbitraryLaneIndex(lanes);
      var lane = 1 << index;
      entanglements[index] = NoLanes;
      eventTimes[index] = NoTimestamp;
      expirationTimes[index] = NoTimestamp;
      lanes &= ~lane;
    }
  }
  function markRootEntangled(root, entangledLanes) {
    // In addition to entangling each of the given lanes with each other, we also
    // have to consider _transitive_ entanglements. For each lane that is already
    // entangled with *any* of the given lanes, that lane is now transitively
    // entangled with *all* the given lanes.
    //
    // Translated: If C is entangled with A, then entangling A with B also
    // entangles C with B.
    //
    // If this is hard to grasp, it might help to intentionally break this
    // function and look at the tests that fail in ReactTransition-test.js. Try
    // commenting out one of the conditions below.
    var rootEntangledLanes = root.entangledLanes |= entangledLanes;
    var entanglements = root.entanglements;
    var lanes = rootEntangledLanes;

    while (lanes) {
      var index = pickArbitraryLaneIndex(lanes);
      var lane = 1 << index;

      if ( // Is this one of the newly entangled lanes?
      lane & entangledLanes | // Is this lane transitively entangled with the newly entangled lanes?
      entanglements[index] & entangledLanes) {
        entanglements[index] |= entangledLanes;
      }

      lanes &= ~lane;
    }
  }
  function getBumpedLaneForHydration(root, renderLanes) {
    var renderLane = getHighestPriorityLane(renderLanes);
    var lane;

    switch (renderLane) {
      case InputContinuousLane:
        lane = InputContinuousHydrationLane;
        break;

      case DefaultLane:
        lane = DefaultHydrationLane;
        break;

      case TransitionLane1:
      case TransitionLane2:
      case TransitionLane3:
      case TransitionLane4:
      case TransitionLane5:
      case TransitionLane6:
      case TransitionLane7:
      case TransitionLane8:
      case TransitionLane9:
      case TransitionLane10:
      case TransitionLane11:
      case TransitionLane12:
      case TransitionLane13:
      case TransitionLane14:
      case TransitionLane15:
      case TransitionLane16:
      case RetryLane1:
      case RetryLane2:
      case RetryLane3:
      case RetryLane4:
      case RetryLane5:
        lane = TransitionHydrationLane;
        break;

      case IdleLane:
        lane = IdleHydrationLane;
        break;

      default:
        // Everything else is already either a hydration lane, or shouldn't
        // be retried at a hydration lane.
        lane = NoLane;
        break;
    } // Check if the lane we chose is suspended. If so, that indicates that we
    // already attempted and failed to hydrate at that level. Also check if we're
    // already rendering that lane, which is rare but could happen.


    if ((lane & (root.suspendedLanes | renderLanes)) !== NoLane) {
      // Give up trying to hydrate and fall back to client render.
      return NoLane;
    }

    return lane;
  }
  function addFiberToLanesMap(root, fiber, lanes) {

    if (!isDevToolsPresent) {
      return;
    }

    var pendingUpdatersLaneMap = root.pendingUpdatersLaneMap;

    while (lanes > 0) {
      var index = laneToIndex(lanes);
      var lane = 1 << index;
      var updaters = pendingUpdatersLaneMap[index];
      updaters.add(fiber);
      lanes &= ~lane;
    }
  }
  function movePendingFibersToMemoized(root, lanes) {

    if (!isDevToolsPresent) {
      return;
    }

    var pendingUpdatersLaneMap = root.pendingUpdatersLaneMap;
    var memoizedUpdaters = root.memoizedUpdaters;

    while (lanes > 0) {
      var index = laneToIndex(lanes);
      var lane = 1 << index;
      var updaters = pendingUpdatersLaneMap[index];

      if (updaters.size > 0) {
        updaters.forEach(function (fiber) {
          var alternate = fiber.alternate;

          if (alternate === null || !memoizedUpdaters.has(alternate)) {
            memoizedUpdaters.add(fiber);
          }
        });
        updaters.clear();
      }

      lanes &= ~lane;
    }
  }
  function getTransitionsForLanes(root, lanes) {
    {
      return null;
    }
  }

  var DiscreteEventPriority = SyncLane;
  var ContinuousEventPriority = InputContinuousLane;
  var DefaultEventPriority = DefaultLane;
  var IdleEventPriority = IdleLane;
  var currentUpdatePriority = NoLane;
  function getCurrentUpdatePriority() {
    return currentUpdatePriority;
  }
  function setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
  }
  function runWithPriority(priority, fn) {
    var previousPriority = currentUpdatePriority;

    try {
      currentUpdatePriority = priority;
      return fn();
    } finally {
      currentUpdatePriority = previousPriority;
    }
  }
  function higherEventPriority(a, b) {
    return a !== 0 && a < b ? a : b;
  }
  function lowerEventPriority(a, b) {
    return a === 0 || a > b ? a : b;
  }
  function isHigherEventPriority(a, b) {
    return a !== 0 && a < b;
  }
  function lanesToEventPriority(lanes) {
    var lane = getHighestPriorityLane(lanes);

    if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
      return DiscreteEventPriority;
    }

    if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
      return ContinuousEventPriority;
    }

    if (includesNonIdleWork(lane)) {
      return DefaultEventPriority;
    }

    return IdleEventPriority;
  }

  // This is imported by the event replaying implementation in React DOM. It's
  // in a separate file to break a circular dependency between the renderer and
  // the reconciler.
  function isRootDehydrated(root) {
    var currentState = root.current.memoizedState;
    return currentState.isDehydrated;
  }

  var _attemptSynchronousHydration;

  function setAttemptSynchronousHydration(fn) {
    _attemptSynchronousHydration = fn;
  }
  function attemptSynchronousHydration(fiber) {
    _attemptSynchronousHydration(fiber);
  }
  var attemptContinuousHydration;
  function setAttemptContinuousHydration(fn) {
    attemptContinuousHydration = fn;
  }
  var attemptHydrationAtCurrentPriority;
  function setAttemptHydrationAtCurrentPriority(fn) {
    attemptHydrationAtCurrentPriority = fn;
  }
  var getCurrentUpdatePriority$1;
  function setGetCurrentUpdatePriority(fn) {
    getCurrentUpdatePriority$1 = fn;
  }
  var attemptHydrationAtPriority;
  function setAttemptHydrationAtPriority(fn) {
    attemptHydrationAtPriority = fn;
  } // TODO: Upgrade this definition once we're on a newer version of Flow that
  // has this definition built-in.

  var hasScheduledReplayAttempt = false; // The queue of discrete events to be replayed.

  var queuedDiscreteEvents = []; // Indicates if any continuous event targets are non-null for early bailout.
  // if the last target was dehydrated.

  var queuedFocus = null;
  var queuedDrag = null;
  var queuedMouse = null; // For pointer events there can be one latest event per pointerId.

  var queuedPointers = new Map();
  var queuedPointerCaptures = new Map(); // We could consider replaying selectionchange and touchmoves too.

  var queuedExplicitHydrationTargets = [];
  var discreteReplayableEvents = ['mousedown', 'mouseup', 'touchcancel', 'touchend', 'touchstart', 'auxclick', 'dblclick', 'pointercancel', 'pointerdown', 'pointerup', 'dragend', 'dragstart', 'drop', 'compositionend', 'compositionstart', 'keydown', 'keypress', 'keyup', 'input', 'textInput', // Intentionally camelCase
  'copy', 'cut', 'paste', 'click', 'change', 'contextmenu', 'reset', 'submit'];
  function isDiscreteEventThatRequiresHydration(eventType) {
    return discreteReplayableEvents.indexOf(eventType) > -1;
  }

  function createQueuedReplayableEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    return {
      blockedOn: blockedOn,
      domEventName: domEventName,
      eventSystemFlags: eventSystemFlags,
      nativeEvent: nativeEvent,
      targetContainers: [targetContainer]
    };
  }

  function clearIfContinuousEvent(domEventName, nativeEvent) {
    switch (domEventName) {
      case 'focusin':
      case 'focusout':
        queuedFocus = null;
        break;

      case 'dragenter':
      case 'dragleave':
        queuedDrag = null;
        break;

      case 'mouseover':
      case 'mouseout':
        queuedMouse = null;
        break;

      case 'pointerover':
      case 'pointerout':
        {
          var pointerId = nativeEvent.pointerId;
          queuedPointers.delete(pointerId);
          break;
        }

      case 'gotpointercapture':
      case 'lostpointercapture':
        {
          var _pointerId = nativeEvent.pointerId;
          queuedPointerCaptures.delete(_pointerId);
          break;
        }
    }
  }

  function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (existingQueuedEvent === null || existingQueuedEvent.nativeEvent !== nativeEvent) {
      var queuedEvent = createQueuedReplayableEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent);

      if (blockedOn !== null) {
        var _fiber2 = getInstanceFromNode(blockedOn);

        if (_fiber2 !== null) {
          // Attempt to increase the priority of this target.
          attemptContinuousHydration(_fiber2);
        }
      }

      return queuedEvent;
    } // If we have already queued this exact event, then it's because
    // the different event systems have different DOM event listeners.
    // We can accumulate the flags, and the targetContainers, and
    // store a single event to be replayed.


    existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
    var targetContainers = existingQueuedEvent.targetContainers;

    if (targetContainer !== null && targetContainers.indexOf(targetContainer) === -1) {
      targetContainers.push(targetContainer);
    }

    return existingQueuedEvent;
  }

  function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    // These set relatedTarget to null because the replayed event will be treated as if we
    // moved from outside the window (no target) onto the target once it hydrates.
    // Instead of mutating we could clone the event.
    switch (domEventName) {
      case 'focusin':
        {
          var focusEvent = nativeEvent;
          queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, focusEvent);
          return true;
        }

      case 'dragenter':
        {
          var dragEvent = nativeEvent;
          queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, dragEvent);
          return true;
        }

      case 'mouseover':
        {
          var mouseEvent = nativeEvent;
          queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, mouseEvent);
          return true;
        }

      case 'pointerover':
        {
          var pointerEvent = nativeEvent;
          var pointerId = pointerEvent.pointerId;
          queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, pointerEvent));
          return true;
        }

      case 'gotpointercapture':
        {
          var _pointerEvent = nativeEvent;
          var _pointerId2 = _pointerEvent.pointerId;
          queuedPointerCaptures.set(_pointerId2, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(_pointerId2) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, _pointerEvent));
          return true;
        }
    }

    return false;
  } // Check if this target is unblocked. Returns true if it's unblocked.

  function attemptExplicitHydrationTarget(queuedTarget) {
    // TODO: This function shares a lot of logic with findInstanceBlockingEvent.
    // Try to unify them. It's a bit tricky since it would require two return
    // values.
    var targetInst = getClosestInstanceFromNode(queuedTarget.target);

    if (targetInst !== null) {
      var nearestMounted = getNearestMountedFiber(targetInst);

      if (nearestMounted !== null) {
        var tag = nearestMounted.tag;

        if (tag === SuspenseComponent) {
          var instance = getSuspenseInstanceFromFiber(nearestMounted);

          if (instance !== null) {
            // We're blocked on hydrating this boundary.
            // Increase its priority.
            queuedTarget.blockedOn = instance;
            attemptHydrationAtPriority(queuedTarget.priority, function () {
              attemptHydrationAtCurrentPriority(nearestMounted);
            });
            return;
          }
        } else if (tag === HostRoot) {
          var root = nearestMounted.stateNode;

          if (isRootDehydrated(root)) {
            queuedTarget.blockedOn = getContainerFromFiber(nearestMounted); // We don't currently have a way to increase the priority of
            // a root other than sync.

            return;
          }
        }
      }
    }

    queuedTarget.blockedOn = null;
  }

  function queueExplicitHydrationTarget(target) {
    // TODO: This will read the priority if it's dispatched by the React
    // event system but not native events. Should read window.event.type, like
    // we do for updates (getCurrentEventPriority).
    var updatePriority = getCurrentUpdatePriority$1();
    var queuedTarget = {
      blockedOn: null,
      target: target,
      priority: updatePriority
    };
    var i = 0;

    for (; i < queuedExplicitHydrationTargets.length; i++) {
      // Stop once we hit the first target with lower priority than
      if (!isHigherEventPriority(updatePriority, queuedExplicitHydrationTargets[i].priority)) {
        break;
      }
    }

    queuedExplicitHydrationTargets.splice(i, 0, queuedTarget);

    if (i === 0) {
      attemptExplicitHydrationTarget(queuedTarget);
    }
  }

  function attemptReplayContinuousQueuedEvent(queuedEvent) {
    if (queuedEvent.blockedOn !== null) {
      return false;
    }

    var targetContainers = queuedEvent.targetContainers;

    while (targetContainers.length > 0) {
      var targetContainer = targetContainers[0];
      var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.domEventName, queuedEvent.eventSystemFlags, targetContainer, queuedEvent.nativeEvent);

      if (nextBlockedOn === null) {
        {
          var nativeEvent = queuedEvent.nativeEvent;
          var nativeEventClone = new nativeEvent.constructor(nativeEvent.type, nativeEvent);
          setReplayingEvent(nativeEventClone);
          nativeEvent.target.dispatchEvent(nativeEventClone);
          resetReplayingEvent();
        }
      } else {
        // We're still blocked. Try again later.
        var _fiber3 = getInstanceFromNode(nextBlockedOn);

        if (_fiber3 !== null) {
          attemptContinuousHydration(_fiber3);
        }

        queuedEvent.blockedOn = nextBlockedOn;
        return false;
      } // This target container was successfully dispatched. Try the next.


      targetContainers.shift();
    }

    return true;
  }

  function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
    if (attemptReplayContinuousQueuedEvent(queuedEvent)) {
      map.delete(key);
    }
  }

  function replayUnblockedEvents() {
    hasScheduledReplayAttempt = false;


    if (queuedFocus !== null && attemptReplayContinuousQueuedEvent(queuedFocus)) {
      queuedFocus = null;
    }

    if (queuedDrag !== null && attemptReplayContinuousQueuedEvent(queuedDrag)) {
      queuedDrag = null;
    }

    if (queuedMouse !== null && attemptReplayContinuousQueuedEvent(queuedMouse)) {
      queuedMouse = null;
    }

    queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
    queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
  }

  function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
    if (queuedEvent.blockedOn === unblocked) {
      queuedEvent.blockedOn = null;

      if (!hasScheduledReplayAttempt) {
        hasScheduledReplayAttempt = true; // Schedule a callback to attempt replaying as many events as are
        // now unblocked. This first might not actually be unblocked yet.
        // We could check it early to avoid scheduling an unnecessary callback.

        unstable_scheduleCallback(unstable_NormalPriority, replayUnblockedEvents);
      }
    }
  }

  function retryIfBlockedOn(unblocked) {
    // Mark anything that was blocked on this as no longer blocked
    // and eligible for a replay.
    if (queuedDiscreteEvents.length > 0) {
      scheduleCallbackIfUnblocked(queuedDiscreteEvents[0], unblocked); // This is a exponential search for each boundary that commits. I think it's
      // worth it because we expect very few discrete events to queue up and once
      // we are actually fully unblocked it will be fast to replay them.

      for (var i = 1; i < queuedDiscreteEvents.length; i++) {
        var queuedEvent = queuedDiscreteEvents[i];

        if (queuedEvent.blockedOn === unblocked) {
          queuedEvent.blockedOn = null;
        }
      }
    }

    if (queuedFocus !== null) {
      scheduleCallbackIfUnblocked(queuedFocus, unblocked);
    }

    if (queuedDrag !== null) {
      scheduleCallbackIfUnblocked(queuedDrag, unblocked);
    }

    if (queuedMouse !== null) {
      scheduleCallbackIfUnblocked(queuedMouse, unblocked);
    }

    var unblock = function (queuedEvent) {
      return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
    };

    queuedPointers.forEach(unblock);
    queuedPointerCaptures.forEach(unblock);

    for (var _i = 0; _i < queuedExplicitHydrationTargets.length; _i++) {
      var queuedTarget = queuedExplicitHydrationTargets[_i];

      if (queuedTarget.blockedOn === unblocked) {
        queuedTarget.blockedOn = null;
      }
    }

    while (queuedExplicitHydrationTargets.length > 0) {
      var nextExplicitTarget = queuedExplicitHydrationTargets[0];

      if (nextExplicitTarget.blockedOn !== null) {
        // We're still blocked.
        break;
      } else {
        attemptExplicitHydrationTarget(nextExplicitTarget);

        if (nextExplicitTarget.blockedOn === null) {
          // We're unblocked.
          queuedExplicitHydrationTargets.shift();
        }
      }
    }
  }

  var ReactCurrentBatchConfig = ReactSharedInternals.ReactCurrentBatchConfig; // TODO: can we stop exporting these?

  var _enabled = true; // This is exported in FB builds for use by legacy FB layer infra.
  // We'd like to remove this but it's not clear if this is safe.

  function setEnabled(enabled) {
    _enabled = !!enabled;
  }
  function isEnabled() {
    return _enabled;
  }
  function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
    var eventPriority = getEventPriority(domEventName);
    var listenerWrapper;

    switch (eventPriority) {
      case DiscreteEventPriority:
        listenerWrapper = dispatchDiscreteEvent;
        break;

      case ContinuousEventPriority:
        listenerWrapper = dispatchContinuousEvent;
        break;

      case DefaultEventPriority:
      default:
        listenerWrapper = dispatchEvent;
        break;
    }

    return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
  }

  function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var previousPriority = getCurrentUpdatePriority();
    var prevTransition = ReactCurrentBatchConfig.transition;
    ReactCurrentBatchConfig.transition = null;

    try {
      setCurrentUpdatePriority(DiscreteEventPriority);
      dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      setCurrentUpdatePriority(previousPriority);
      ReactCurrentBatchConfig.transition = prevTransition;
    }
  }

  function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var previousPriority = getCurrentUpdatePriority();
    var prevTransition = ReactCurrentBatchConfig.transition;
    ReactCurrentBatchConfig.transition = null;

    try {
      setCurrentUpdatePriority(ContinuousEventPriority);
      dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      setCurrentUpdatePriority(previousPriority);
      ReactCurrentBatchConfig.transition = prevTransition;
    }
  }

  function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (!_enabled) {
      return;
    }

    {
      dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent);
    }
  }

  function dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    var blockedOn = findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);

    if (blockedOn === null) {
      dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
      clearIfContinuousEvent(domEventName, nativeEvent);
      return;
    }

    if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) {
      nativeEvent.stopPropagation();
      return;
    } // We need to clear only if we didn't queue because
    // queueing is accumulative.


    clearIfContinuousEvent(domEventName, nativeEvent);

    if (eventSystemFlags & IS_CAPTURE_PHASE && isDiscreteEventThatRequiresHydration(domEventName)) {
      while (blockedOn !== null) {
        var fiber = getInstanceFromNode(blockedOn);

        if (fiber !== null) {
          attemptSynchronousHydration(fiber);
        }

        var nextBlockedOn = findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);

        if (nextBlockedOn === null) {
          dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
        }

        if (nextBlockedOn === blockedOn) {
          break;
        }

        blockedOn = nextBlockedOn;
      }

      if (blockedOn !== null) {
        nativeEvent.stopPropagation();
      }

      return;
    } // This is not replayable so we'll invoke it but without a target,
    // in case the event system needs to trace it.


    dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
  }

  var return_targetInst = null; // Returns a SuspenseInstance or Container if it's blocked.
  // The return_targetInst field above is conceptually part of the return value.

  function findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    // TODO: Warn if _enabled is false.
    return_targetInst = null;
    var nativeEventTarget = getEventTarget(nativeEvent);
    var targetInst = getClosestInstanceFromNode(nativeEventTarget);

    if (targetInst !== null) {
      var nearestMounted = getNearestMountedFiber(targetInst);

      if (nearestMounted === null) {
        // This tree has been unmounted already. Dispatch without a target.
        targetInst = null;
      } else {
        var tag = nearestMounted.tag;

        if (tag === SuspenseComponent) {
          var instance = getSuspenseInstanceFromFiber(nearestMounted);

          if (instance !== null) {
            // Queue the event to be replayed later. Abort dispatching since we
            // don't want this event dispatched twice through the event system.
            // TODO: If this is the first discrete event in the queue. Schedule an increased
            // priority for this boundary.
            return instance;
          } // This shouldn't happen, something went wrong but to avoid blocking
          // the whole system, dispatch the event without a target.
          // TODO: Warn.


          targetInst = null;
        } else if (tag === HostRoot) {
          var root = nearestMounted.stateNode;

          if (isRootDehydrated(root)) {
            // If this happens during a replay something went wrong and it might block
            // the whole system.
            return getContainerFromFiber(nearestMounted);
          }

          targetInst = null;
        } else if (nearestMounted !== targetInst) {
          // If we get an event (ex: img onload) before committing that
          // component's mount, ignore it for now (that is, treat it as if it was an
          // event on a non-React tree). We might also consider queueing events and
          // dispatching them after the mount.
          targetInst = null;
        }
      }
    }

    return_targetInst = targetInst; // We're not blocked on anything.

    return null;
  }
  function getEventPriority(domEventName) {
    switch (domEventName) {
      // Used by SimpleEventPlugin:
      case 'cancel':
      case 'click':
      case 'close':
      case 'contextmenu':
      case 'copy':
      case 'cut':
      case 'auxclick':
      case 'dblclick':
      case 'dragend':
      case 'dragstart':
      case 'drop':
      case 'focusin':
      case 'focusout':
      case 'input':
      case 'invalid':
      case 'keydown':
      case 'keypress':
      case 'keyup':
      case 'mousedown':
      case 'mouseup':
      case 'paste':
      case 'pause':
      case 'play':
      case 'pointercancel':
      case 'pointerdown':
      case 'pointerup':
      case 'ratechange':
      case 'reset':
      case 'resize':
      case 'seeked':
      case 'submit':
      case 'touchcancel':
      case 'touchend':
      case 'touchstart':
      case 'volumechange': // Used by polyfills:
      // eslint-disable-next-line no-fallthrough

      case 'change':
      case 'selectionchange':
      case 'textInput':
      case 'compositionstart':
      case 'compositionend':
      case 'compositionupdate': // Only enableCreateEventHandleAPI:
      // eslint-disable-next-line no-fallthrough

      case 'beforeblur':
      case 'afterblur': // Not used by React but could be by user code:
      // eslint-disable-next-line no-fallthrough

      case 'beforeinput':
      case 'blur':
      case 'fullscreenchange':
      case 'focus':
      case 'hashchange':
      case 'popstate':
      case 'select':
      case 'selectstart':
        return DiscreteEventPriority;

      case 'drag':
      case 'dragenter':
      case 'dragexit':
      case 'dragleave':
      case 'dragover':
      case 'mousemove':
      case 'mouseout':
      case 'mouseover':
      case 'pointermove':
      case 'pointerout':
      case 'pointerover':
      case 'scroll':
      case 'toggle':
      case 'touchmove':
      case 'wheel': // Not used by React but could be by user code:
      // eslint-disable-next-line no-fallthrough

      case 'mouseenter':
      case 'mouseleave':
      case 'pointerenter':
      case 'pointerleave':
        return ContinuousEventPriority;

      case 'message':
        {
          // We might be in the Scheduler callback.
          // Eventually this mechanism will be replaced by a check
          // of the current priority on the native scheduler.
          var schedulerPriority = getCurrentPriorityLevel();

          switch (schedulerPriority) {
            case ImmediatePriority:
              return DiscreteEventPriority;

            case UserBlockingPriority:
              return ContinuousEventPriority;

            case NormalPriority:
            case LowPriority:
              // TODO: Handle LowSchedulerPriority, somehow. Maybe the same lane as hydration.
              return DefaultEventPriority;

            case IdlePriority:
              return IdleEventPriority;

            default:
              return DefaultEventPriority;
          }
        }

      default:
        return DefaultEventPriority;
    }
  }

  function addEventBubbleListener(target, eventType, listener) {
    target.addEventListener(eventType, listener, false);
    return listener;
  }
  function addEventCaptureListener(target, eventType, listener) {
    target.addEventListener(eventType, listener, true);
    return listener;
  }
  function addEventCaptureListenerWithPassiveFlag(target, eventType, listener, passive) {
    target.addEventListener(eventType, listener, {
      capture: true,
      passive: passive
    });
    return listener;
  }
  function addEventBubbleListenerWithPassiveFlag(target, eventType, listener, passive) {
    target.addEventListener(eventType, listener, {
      passive: passive
    });
    return listener;
  }

  /**
   * These variables store information about text content of a target node,
   * allowing comparison of content before and after a given event.
   *
   * Identify the node where selection currently begins, then observe
   * both its text content and its current position in the DOM. Since the
   * browser may natively replace the target node during composition, we can
   * use its position to find its replacement.
   *
   *
   */
  var root = null;
  var startText = null;
  var fallbackText = null;
  function initialize(nativeEventTarget) {
    root = nativeEventTarget;
    startText = getText();
    return true;
  }
  function reset() {
    root = null;
    startText = null;
    fallbackText = null;
  }
  function getData() {
    if (fallbackText) {
      return fallbackText;
    }

    var start;
    var startValue = startText;
    var startLength = startValue.length;
    var end;
    var endValue = getText();
    var endLength = endValue.length;

    for (start = 0; start < startLength; start++) {
      if (startValue[start] !== endValue[start]) {
        break;
      }
    }

    var minEnd = startLength - start;

    for (end = 1; end <= minEnd; end++) {
      if (startValue[startLength - end] !== endValue[endLength - end]) {
        break;
      }
    }

    var sliceTail = end > 1 ? 1 - end : undefined;
    fallbackText = endValue.slice(start, sliceTail);
    return fallbackText;
  }
  function getText() {
    if ('value' in root) {
      return root.value;
    }

    return root.textContent;
  }

  /**
   * `charCode` represents the actual "character code" and is safe to use with
   * `String.fromCharCode`. As such, only keys that correspond to printable
   * characters produce a valid `charCode`, the only exception to this is Enter.
   * The Tab-key is considered non-printable and does not have a `charCode`,
   * presumably because it does not produce a tab-character in browsers.
   *
   * @param {object} nativeEvent Native browser event.
   * @return {number} Normalized `charCode` property.
   */
  function getEventCharCode(nativeEvent) {
    var charCode;
    var keyCode = nativeEvent.keyCode;

    if ('charCode' in nativeEvent) {
      charCode = nativeEvent.charCode; // FF does not set `charCode` for the Enter-key, check against `keyCode`.

      if (charCode === 0 && keyCode === 13) {
        charCode = 13;
      }
    } else {
      // IE8 does not implement `charCode`, but `keyCode` has the correct value.
      charCode = keyCode;
    } // IE and Edge (on Windows) and Chrome / Safari (on Windows and Linux)
    // report Enter as charCode 10 when ctrl is pressed.


    if (charCode === 10) {
      charCode = 13;
    } // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
    // Must not discard the (non-)printable Enter-key.


    if (charCode >= 32 || charCode === 13) {
      return charCode;
    }

    return 0;
  }

  function functionThatReturnsTrue() {
    return true;
  }

  function functionThatReturnsFalse() {
    return false;
  } // This is intentionally a factory so that we have different returned constructors.
  // If we had a single constructor, it would be megamorphic and engines would deopt.


  function createSyntheticEvent(Interface) {
    /**
     * Synthetic events are dispatched by event plugins, typically in response to a
     * top-level event delegation handler.
     *
     * These systems should generally use pooling to reduce the frequency of garbage
     * collection. The system should check `isPersistent` to determine whether the
     * event should be released into the pool after being dispatched. Users that
     * need a persisted event should invoke `persist`.
     *
     * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
     * normalizing browser quirks. Subclasses do not necessarily have to implement a
     * DOM interface; custom application-specific events can also subclass this.
     */
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;
      this.currentTarget = null;

      for (var _propName in Interface) {
        if (!Interface.hasOwnProperty(_propName)) {
          continue;
        }

        var normalize = Interface[_propName];

        if (normalize) {
          this[_propName] = normalize(nativeEvent);
        } else {
          this[_propName] = nativeEvent[_propName];
        }
      }

      var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;

      if (defaultPrevented) {
        this.isDefaultPrevented = functionThatReturnsTrue;
      } else {
        this.isDefaultPrevented = functionThatReturnsFalse;
      }

      this.isPropagationStopped = functionThatReturnsFalse;
      return this;
    }

    assign(SyntheticBaseEvent.prototype, {
      preventDefault: function () {
        this.defaultPrevented = true;
        var event = this.nativeEvent;

        if (!event) {
          return;
        }

        if (event.preventDefault) {
          event.preventDefault(); // $FlowFixMe - flow is not aware of `unknown` in IE
        } else if (typeof event.returnValue !== 'unknown') {
          event.returnValue = false;
        }

        this.isDefaultPrevented = functionThatReturnsTrue;
      },
      stopPropagation: function () {
        var event = this.nativeEvent;

        if (!event) {
          return;
        }

        if (event.stopPropagation) {
          event.stopPropagation(); // $FlowFixMe - flow is not aware of `unknown` in IE
        } else if (typeof event.cancelBubble !== 'unknown') {
          // The ChangeEventPlugin registers a "propertychange" event for
          // IE. This event does not support bubbling or cancelling, and
          // any references to cancelBubble throw "Member not found".  A
          // typeof check of "unknown" circumvents this issue (and is also
          // IE specific).
          event.cancelBubble = true;
        }

        this.isPropagationStopped = functionThatReturnsTrue;
      },

      /**
       * We release all dispatched `SyntheticEvent`s after each event loop, adding
       * them back into the pool. This allows a way to hold onto a reference that
       * won't be added back into the pool.
       */
      persist: function () {// Modern event system doesn't use pooling.
      },

      /**
       * Checks if this event should be released back into the pool.
       *
       * @return {boolean} True if this should not be released, false otherwise.
       */
      isPersistent: functionThatReturnsTrue
    });
    return SyntheticBaseEvent;
  }
  /**
   * @interface Event
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */


  var EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  };
  var SyntheticEvent = createSyntheticEvent(EventInterface);

  var UIEventInterface = assign({}, EventInterface, {
    view: 0,
    detail: 0
  });

  var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
  var lastMovementX;
  var lastMovementY;
  var lastMouseEvent;

  function updateMouseMovementPolyfillState(event) {
    if (event !== lastMouseEvent) {
      if (lastMouseEvent && event.type === 'mousemove') {
        lastMovementX = event.screenX - lastMouseEvent.screenX;
        lastMovementY = event.screenY - lastMouseEvent.screenY;
      } else {
        lastMovementX = 0;
        lastMovementY = 0;
      }

      lastMouseEvent = event;
    }
  }
  /**
   * @interface MouseEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */


  var MouseEventInterface = assign({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function (event) {
      if (event.relatedTarget === undefined) return event.fromElement === event.srcElement ? event.toElement : event.fromElement;
      return event.relatedTarget;
    },
    movementX: function (event) {
      if ('movementX' in event) {
        return event.movementX;
      }

      updateMouseMovementPolyfillState(event);
      return lastMovementX;
    },
    movementY: function (event) {
      if ('movementY' in event) {
        return event.movementY;
      } // Don't need to call updateMouseMovementPolyfillState() here
      // because it's guaranteed to have already run when movementX
      // was copied.


      return lastMovementY;
    }
  });

  var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
  /**
   * @interface DragEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  var DragEventInterface = assign({}, MouseEventInterface, {
    dataTransfer: 0
  });

  var SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
  /**
   * @interface FocusEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  var FocusEventInterface = assign({}, UIEventInterface, {
    relatedTarget: 0
  });

  var SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
  /**
   * @interface Event
   * @see http://www.w3.org/TR/css3-animations/#AnimationEvent-interface
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEvent
   */

  var AnimationEventInterface = assign({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  });

  var SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
  /**
   * @interface Event
   * @see http://www.w3.org/TR/clipboard-apis/
   */

  var ClipboardEventInterface = assign({}, EventInterface, {
    clipboardData: function (event) {
      return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
    }
  });

  var SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
  /**
   * @interface Event
   * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
   */

  var CompositionEventInterface = assign({}, EventInterface, {
    data: 0
  });

  var SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
  /**
   * @interface Event
   * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
   *      /#events-inputevents
   */
  // Happens to share the same list for now.

  var SyntheticInputEvent = SyntheticCompositionEvent;
  /**
   * Normalization of deprecated HTML5 `key` values
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
   */

  var normalizeKey = {
    Esc: 'Escape',
    Spacebar: ' ',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Win: 'OS',
    Menu: 'ContextMenu',
    Apps: 'ContextMenu',
    Scroll: 'ScrollLock',
    MozPrintableKey: 'Unidentified'
  };
  /**
   * Translation from legacy `keyCode` to HTML5 `key`
   * Only special keys supported, all others depend on keyboard layout or browser
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
   */

  var translateToKey = {
    '8': 'Backspace',
    '9': 'Tab',
    '12': 'Clear',
    '13': 'Enter',
    '16': 'Shift',
    '17': 'Control',
    '18': 'Alt',
    '19': 'Pause',
    '20': 'CapsLock',
    '27': 'Escape',
    '32': ' ',
    '33': 'PageUp',
    '34': 'PageDown',
    '35': 'End',
    '36': 'Home',
    '37': 'ArrowLeft',
    '38': 'ArrowUp',
    '39': 'ArrowRight',
    '40': 'ArrowDown',
    '45': 'Insert',
    '46': 'Delete',
    '112': 'F1',
    '113': 'F2',
    '114': 'F3',
    '115': 'F4',
    '116': 'F5',
    '117': 'F6',
    '118': 'F7',
    '119': 'F8',
    '120': 'F9',
    '121': 'F10',
    '122': 'F11',
    '123': 'F12',
    '144': 'NumLock',
    '145': 'ScrollLock',
    '224': 'Meta'
  };
  /**
   * @param {object} nativeEvent Native browser event.
   * @return {string} Normalized `key` property.
   */

  function getEventKey(nativeEvent) {
    if (nativeEvent.key) {
      // Normalize inconsistent values reported by browsers due to
      // implementations of a working draft specification.
      // FireFox implements `key` but returns `MozPrintableKey` for all
      // printable characters (normalized to `Unidentified`), ignore it.
      var key = normalizeKey[nativeEvent.key] || nativeEvent.key;

      if (key !== 'Unidentified') {
        return key;
      }
    } // Browser does not implement `key`, polyfill as much of it as we can.


    if (nativeEvent.type === 'keypress') {
      var charCode = getEventCharCode(nativeEvent); // The enter-key is technically both printable and non-printable and can
      // thus be captured by `keypress`, no other non-printable key should.

      return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
    }

    if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
      // While user keyboard layout determines the actual meaning of each
      // `keyCode` value, almost all function keys have a universal value.
      return translateToKey[nativeEvent.keyCode] || 'Unidentified';
    }

    return '';
  }
  /**
   * Translation from modifier key to the associated property in the event.
   * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
   */


  var modifierKeyToProp = {
    Alt: 'altKey',
    Control: 'ctrlKey',
    Meta: 'metaKey',
    Shift: 'shiftKey'
  }; // Older browsers (Safari <= 10, iOS Safari <= 10.2) do not support
  // getModifierState. If getModifierState is not supported, we map it to a set of
  // modifier keys exposed by the event. In this case, Lock-keys are not supported.

  function modifierStateGetter(keyArg) {
    var syntheticEvent = this;
    var nativeEvent = syntheticEvent.nativeEvent;

    if (nativeEvent.getModifierState) {
      return nativeEvent.getModifierState(keyArg);
    }

    var keyProp = modifierKeyToProp[keyArg];
    return keyProp ? !!nativeEvent[keyProp] : false;
  }

  function getEventModifierState(nativeEvent) {
    return modifierStateGetter;
  }
  /**
   * @interface KeyboardEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */


  var KeyboardEventInterface = assign({}, UIEventInterface, {
    key: getEventKey,
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    // Legacy Interface
    charCode: function (event) {
      // `charCode` is the result of a KeyPress event and represents the value of
      // the actual printable character.
      // KeyPress is deprecated, but its replacement is not yet final and not
      // implemented in any major browser. Only KeyPress has charCode.
      if (event.type === 'keypress') {
        return getEventCharCode(event);
      }

      return 0;
    },
    keyCode: function (event) {
      // `keyCode` is the result of a KeyDown/Up event and represents the value of
      // physical keyboard key.
      // The actual meaning of the value depends on the users' keyboard layout
      // which cannot be detected. Assuming that it is a US keyboard layout
      // provides a surprisingly accurate mapping for US and European users.
      // Due to this, it is left to the user to implement at this time.
      if (event.type === 'keydown' || event.type === 'keyup') {
        return event.keyCode;
      }

      return 0;
    },
    which: function (event) {
      // `which` is an alias for either `keyCode` or `charCode` depending on the
      // type of the event.
      if (event.type === 'keypress') {
        return getEventCharCode(event);
      }

      if (event.type === 'keydown' || event.type === 'keyup') {
        return event.keyCode;
      }

      return 0;
    }
  });

  var SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
  /**
   * @interface PointerEvent
   * @see http://www.w3.org/TR/pointerevents/
   */

  var PointerEventInterface = assign({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  });

  var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
  /**
   * @interface TouchEvent
   * @see http://www.w3.org/TR/touch-events/
   */

  var TouchEventInterface = assign({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  });

  var SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
  /**
   * @interface Event
   * @see http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-events-
   * @see https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent
   */

  var TransitionEventInterface = assign({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  });

  var SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
  /**
   * @interface WheelEvent
   * @see http://www.w3.org/TR/DOM-Level-3-Events/
   */

  var WheelEventInterface = assign({}, MouseEventInterface, {
    deltaX: function (event) {
      return 'deltaX' in event ? event.deltaX : // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
    },
    deltaY: function (event) {
      return 'deltaY' in event ? event.deltaY : // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
      'wheelDeltaY' in event ? -event.wheelDeltaY : // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
      'wheelDelta' in event ? -event.wheelDelta : 0;
    },
    deltaZ: 0,
    // Browsers without "deltaMode" is reporting in raw wheel delta where one
    // notch on the scroll is always +/- 120, roughly equivalent to pixels.
    // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
    // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
    deltaMode: 0
  });

  var SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);

  var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space

  var START_KEYCODE = 229;
  var canUseCompositionEvent = canUseDOM && 'CompositionEvent' in window;
  var documentMode = null;

  if (canUseDOM && 'documentMode' in document) {
    documentMode = document.documentMode;
  } // Webkit offers a very useful `textInput` event that can be used to
  // directly represent `beforeInput`. The IE `textinput` event is not as
  // useful, so we don't use it.


  var canUseTextInputEvent = canUseDOM && 'TextEvent' in window && !documentMode; // In IE9+, we have access to composition events, but the data supplied
  // by the native compositionend event may be incorrect. Japanese ideographic
  // spaces, for instance (\u3000) are not recorded correctly.

  var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);
  var SPACEBAR_CODE = 32;
  var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

  function registerEvents() {
    registerTwoPhaseEvent('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']);
    registerTwoPhaseEvent('onCompositionEnd', ['compositionend', 'focusout', 'keydown', 'keypress', 'keyup', 'mousedown']);
    registerTwoPhaseEvent('onCompositionStart', ['compositionstart', 'focusout', 'keydown', 'keypress', 'keyup', 'mousedown']);
    registerTwoPhaseEvent('onCompositionUpdate', ['compositionupdate', 'focusout', 'keydown', 'keypress', 'keyup', 'mousedown']);
  } // Track whether we've ever handled a keypress on the space key.


  var hasSpaceKeypress = false;
  /**
   * Return whether a native keypress event is assumed to be a command.
   * This is required because Firefox fires `keypress` events for key commands
   * (cut, copy, select-all, etc.) even though no character is inserted.
   */

  function isKeypressCommand(nativeEvent) {
    return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && // ctrlKey && altKey is equivalent to AltGr, and is not a command.
    !(nativeEvent.ctrlKey && nativeEvent.altKey);
  }
  /**
   * Translate native top level events into event types.
   */


  function getCompositionEventType(domEventName) {
    switch (domEventName) {
      case 'compositionstart':
        return 'onCompositionStart';

      case 'compositionend':
        return 'onCompositionEnd';

      case 'compositionupdate':
        return 'onCompositionUpdate';
    }
  }
  /**
   * Does our fallback best-guess model think this event signifies that
   * composition has begun?
   */


  function isFallbackCompositionStart(domEventName, nativeEvent) {
    return domEventName === 'keydown' && nativeEvent.keyCode === START_KEYCODE;
  }
  /**
   * Does our fallback mode think that this event is the end of composition?
   */


  function isFallbackCompositionEnd(domEventName, nativeEvent) {
    switch (domEventName) {
      case 'keyup':
        // Command keys insert or clear IME input.
        return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;

      case 'keydown':
        // Expect IME keyCode on each keydown. If we get any other
        // code we must have exited earlier.
        return nativeEvent.keyCode !== START_KEYCODE;

      case 'keypress':
      case 'mousedown':
      case 'focusout':
        // Events are not possible without cancelling IME.
        return true;

      default:
        return false;
    }
  }
  /**
   * Google Input Tools provides composition data via a CustomEvent,
   * with the `data` property populated in the `detail` object. If this
   * is available on the event object, use it. If not, this is a plain
   * composition event and we have nothing special to extract.
   *
   * @param {object} nativeEvent
   * @return {?string}
   */


  function getDataFromCustomEvent(nativeEvent) {
    var detail = nativeEvent.detail;

    if (typeof detail === 'object' && 'data' in detail) {
      return detail.data;
    }

    return null;
  }
  /**
   * Check if a composition event was triggered by Korean IME.
   * Our fallback mode does not work well with IE's Korean IME,
   * so just use native composition events when Korean IME is used.
   * Although CompositionEvent.locale property is deprecated,
   * it is available in IE, where our fallback mode is enabled.
   *
   * @param {object} nativeEvent
   * @return {boolean}
   */


  function isUsingKoreanIME(nativeEvent) {
    return nativeEvent.locale === 'ko';
  } // Track the current IME composition status, if any.


  var isComposing = false;
  /**
   * @return {?object} A SyntheticCompositionEvent.
   */

  function extractCompositionEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget) {
    var eventType;
    var fallbackData;

    if (canUseCompositionEvent) {
      eventType = getCompositionEventType(domEventName);
    } else if (!isComposing) {
      if (isFallbackCompositionStart(domEventName, nativeEvent)) {
        eventType = 'onCompositionStart';
      }
    } else if (isFallbackCompositionEnd(domEventName, nativeEvent)) {
      eventType = 'onCompositionEnd';
    }

    if (!eventType) {
      return null;
    }

    if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
      // The current composition is stored statically and must not be
      // overwritten while composition continues.
      if (!isComposing && eventType === 'onCompositionStart') {
        isComposing = initialize(nativeEventTarget);
      } else if (eventType === 'onCompositionEnd') {
        if (isComposing) {
          fallbackData = getData();
        }
      }
    }

    var listeners = accumulateTwoPhaseListeners(targetInst, eventType);

    if (listeners.length > 0) {
      var event = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget);
      dispatchQueue.push({
        event: event,
        listeners: listeners
      });

      if (fallbackData) {
        // Inject data generated from fallback path into the synthetic event.
        // This matches the property of native CompositionEventInterface.
        event.data = fallbackData;
      } else {
        var customData = getDataFromCustomEvent(nativeEvent);

        if (customData !== null) {
          event.data = customData;
        }
      }
    }
  }

  function getNativeBeforeInputChars(domEventName, nativeEvent) {
    switch (domEventName) {
      case 'compositionend':
        return getDataFromCustomEvent(nativeEvent);

      case 'keypress':
        /**
         * If native `textInput` events are available, our goal is to make
         * use of them. However, there is a special case: the spacebar key.
         * In Webkit, preventing default on a spacebar `textInput` event
         * cancels character insertion, but it *also* causes the browser
         * to fall back to its default spacebar behavior of scrolling the
         * page.
         *
         * Tracking at:
         * https://code.google.com/p/chromium/issues/detail?id=355103
         *
         * To avoid this issue, use the keypress event as if no `textInput`
         * event is available.
         */
        var which = nativeEvent.which;

        if (which !== SPACEBAR_CODE) {
          return null;
        }

        hasSpaceKeypress = true;
        return SPACEBAR_CHAR;

      case 'textInput':
        // Record the characters to be added to the DOM.
        var chars = nativeEvent.data; // If it's a spacebar character, assume that we have already handled
        // it at the keypress level and bail immediately. Android Chrome
        // doesn't give us keycodes, so we need to ignore it.

        if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
          return null;
        }

        return chars;

      default:
        // For other native event types, do nothing.
        return null;
    }
  }
  /**
   * For browsers that do not provide the `textInput` event, extract the
   * appropriate string to use for SyntheticInputEvent.
   */


  function getFallbackBeforeInputChars(domEventName, nativeEvent) {
    // If we are currently composing (IME) and using a fallback to do so,
    // try to extract the composed characters from the fallback object.
    // If composition event is available, we extract a string only at
    // compositionevent, otherwise extract it at fallback events.
    if (isComposing) {
      if (domEventName === 'compositionend' || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent)) {
        var chars = getData();
        reset();
        isComposing = false;
        return chars;
      }

      return null;
    }

    switch (domEventName) {
      case 'paste':
        // If a paste event occurs after a keypress, throw out the input
        // chars. Paste events should not lead to BeforeInput events.
        return null;

      case 'keypress':
        /**
         * As of v27, Firefox may fire keypress events even when no character
         * will be inserted. A few possibilities:
         *
         * - `which` is `0`. Arrow keys, Esc key, etc.
         *
         * - `which` is the pressed key code, but no char is available.
         *   Ex: 'AltGr + d` in Polish. There is no modified character for
         *   this key combination and no character is inserted into the
         *   document, but FF fires the keypress for char code `100` anyway.
         *   No `input` event will occur.
         *
         * - `which` is the pressed key code, but a command combination is
         *   being used. Ex: `Cmd+C`. No character is inserted, and no
         *   `input` event will occur.
         */
        if (!isKeypressCommand(nativeEvent)) {
          // IE fires the `keypress` event when a user types an emoji via
          // Touch keyboard of Windows.  In such a case, the `char` property
          // holds an emoji character like `\uD83D\uDE0A`.  Because its length
          // is 2, the property `which` does not represent an emoji correctly.
          // In such a case, we directly return the `char` property instead of
          // using `which`.
          if (nativeEvent.char && nativeEvent.char.length > 1) {
            return nativeEvent.char;
          } else if (nativeEvent.which) {
            return String.fromCharCode(nativeEvent.which);
          }
        }

        return null;

      case 'compositionend':
        return useFallbackCompositionData && !isUsingKoreanIME(nativeEvent) ? null : nativeEvent.data;

      default:
        return null;
    }
  }
  /**
   * Extract a SyntheticInputEvent for `beforeInput`, based on either native
   * `textInput` or fallback behavior.
   *
   * @return {?object} A SyntheticInputEvent.
   */


  function extractBeforeInputEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget) {
    var chars;

    if (canUseTextInputEvent) {
      chars = getNativeBeforeInputChars(domEventName, nativeEvent);
    } else {
      chars = getFallbackBeforeInputChars(domEventName, nativeEvent);
    } // If no characters are being inserted, no BeforeInput event should
    // be fired.


    if (!chars) {
      return null;
    }

    var listeners = accumulateTwoPhaseListeners(targetInst, 'onBeforeInput');

    if (listeners.length > 0) {
      var event = new SyntheticInputEvent('onBeforeInput', 'beforeinput', null, nativeEvent, nativeEventTarget);
      dispatchQueue.push({
        event: event,
        listeners: listeners
      });
      event.data = chars;
    }
  }
  /**
   * Create an `onBeforeInput` event to match
   * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
   *
   * This event plugin is based on the native `textInput` event
   * available in Chrome, Safari, Opera, and IE. This event fires after
   * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
   *
   * `beforeInput` is spec'd but not implemented in any browsers, and
   * the `input` event does not provide any useful information about what has
   * actually been added, contrary to the spec. Thus, `textInput` is the best
   * available event to identify the characters that have actually been inserted
   * into the target node.
   *
   * This plugin is also responsible for emitting `composition` events, thus
   * allowing us to share composition fallback code for both `beforeInput` and
   * `composition` event types.
   */


  function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
    extractCompositionEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
    extractBeforeInputEvent(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
  }

  /**
   * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
   */
  var supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    'datetime-local': true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };

  function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

    if (nodeName === 'input') {
      return !!supportedInputTypes[elem.type];
    }

    if (nodeName === 'textarea') {
      return true;
    }

    return false;
  }

  /**
   * Checks if an event is supported in the current execution environment.
   *
   * NOTE: This will not work correctly for non-generic events such as `change`,
   * `reset`, `load`, `error`, and `select`.
   *
   * Borrows from Modernizr.
   *
   * @param {string} eventNameSuffix Event name, e.g. "click".
   * @return {boolean} True if the event is supported.
   * @internal
   * @license Modernizr 3.0.0pre (Custom Build) | MIT
   */

  function isEventSupported(eventNameSuffix) {
    if (!canUseDOM) {
      return false;
    }

    var eventName = 'on' + eventNameSuffix;
    var isSupported = (eventName in document);

    if (!isSupported) {
      var element = document.createElement('div');
      element.setAttribute(eventName, 'return;');
      isSupported = typeof element[eventName] === 'function';
    }

    return isSupported;
  }

  function registerEvents$1() {
    registerTwoPhaseEvent('onChange', ['change', 'click', 'focusin', 'focusout', 'input', 'keydown', 'keyup', 'selectionchange']);
  }

  function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
    // Flag this event loop as needing state restore.
    enqueueStateRestore(target);
    var listeners = accumulateTwoPhaseListeners(inst, 'onChange');

    if (listeners.length > 0) {
      var event = new SyntheticEvent('onChange', 'change', null, nativeEvent, target);
      dispatchQueue.push({
        event: event,
        listeners: listeners
      });
    }
  }
  /**
   * For IE shims
   */


  var activeElement = null;
  var activeElementInst = null;
  /**
   * SECTION: handle `change` event
   */

  function shouldUseChangeEvent(elem) {
    var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
  }

  function manualDispatchChangeEvent(nativeEvent) {
    var dispatchQueue = [];
    createAndAccumulateChangeEvent(dispatchQueue, activeElementInst, nativeEvent, getEventTarget(nativeEvent)); // If change and propertychange bubbled, we'd just bind to it like all the
    // other events and have it go through ReactBrowserEventEmitter. Since it
    // doesn't, we manually listen for the events and so we have to enqueue and
    // process the abstract event manually.
    //
    // Batching is necessary here in order to ensure that all event handlers run
    // before the next rerender (including event handlers attached to ancestor
    // elements instead of directly on the input). Without this, controlled
    // components don't work properly in conjunction with event bubbling because
    // the component is rerendered and the value reverted before all the event
    // handlers can run. See https://github.com/facebook/react/issues/708.

    batchedUpdates(runEventInBatch, dispatchQueue);
  }

  function runEventInBatch(dispatchQueue) {
    processDispatchQueue(dispatchQueue, 0);
  }

  function getInstIfValueChanged(targetInst) {
    var targetNode = getNodeFromInstance(targetInst);

    if (updateValueIfChanged(targetNode)) {
      return targetInst;
    }
  }

  function getTargetInstForChangeEvent(domEventName, targetInst) {
    if (domEventName === 'change') {
      return targetInst;
    }
  }
  /**
   * SECTION: handle `input` event
   */


  var isInputEventSupported = false;

  if (canUseDOM) {
    // IE9 claims to support the input event but fails to trigger it when
    // deleting text, so we ignore its input events.
    isInputEventSupported = isEventSupported('input') && (!document.documentMode || document.documentMode > 9);
  }
  /**
   * (For IE <=9) Starts tracking propertychange events on the passed-in element
   * and override the value property so that we can distinguish user events from
   * value changes in JS.
   */


  function startWatchingForValueChange(target, targetInst) {
    activeElement = target;
    activeElementInst = targetInst;
    activeElement.attachEvent('onpropertychange', handlePropertyChange);
  }
  /**
   * (For IE <=9) Removes the event listeners from the currently-tracked element,
   * if any exists.
   */


  function stopWatchingForValueChange() {
    if (!activeElement) {
      return;
    }

    activeElement.detachEvent('onpropertychange', handlePropertyChange);
    activeElement = null;
    activeElementInst = null;
  }
  /**
   * (For IE <=9) Handles a propertychange event, sending a `change` event if
   * the value of the active element has changed.
   */


  function handlePropertyChange(nativeEvent) {
    if (nativeEvent.propertyName !== 'value') {
      return;
    }

    if (getInstIfValueChanged(activeElementInst)) {
      manualDispatchChangeEvent(nativeEvent);
    }
  }

  function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
    if (domEventName === 'focusin') {
      // In IE9, propertychange fires for most input events but is buggy and
      // doesn't fire when text is deleted, but conveniently, selectionchange
      // appears to fire in all of the remaining cases so we catch those and
      // forward the event if the value has changed
      // In either case, we don't want to call the event handler if the value
      // is changed from JS so we redefine a setter for `.value` that updates
      // our activeElementValue variable, allowing us to ignore those changes
      //
      // stopWatching() should be a noop here but we call it just in case we
      // missed a blur event somehow.
      stopWatchingForValueChange();
      startWatchingForValueChange(target, targetInst);
    } else if (domEventName === 'focusout') {
      stopWatchingForValueChange();
    }
  } // For IE8 and IE9.


  function getTargetInstForInputEventPolyfill(domEventName, targetInst) {
    if (domEventName === 'selectionchange' || domEventName === 'keyup' || domEventName === 'keydown') {
      // On the selectionchange event, the target is just document which isn't
      // helpful for us so just check activeElement instead.
      //
      // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
      // propertychange on the first input event after setting `value` from a
      // script and fires only keydown, keypress, keyup. Catching keyup usually
      // gets it and catching keydown lets us fire an event for the first
      // keystroke if user does a key repeat (it'll be a little delayed: right
      // before the second keystroke). Other input methods (e.g., paste) seem to
      // fire selectionchange normally.
      return getInstIfValueChanged(activeElementInst);
    }
  }
  /**
   * SECTION: handle `click` event
   */


  function shouldUseClickEvent(elem) {
    // Use the `click` event to detect changes to checkbox and radio inputs.
    // This approach works across all browsers, whereas `change` does not fire
    // until `blur` in IE8.
    var nodeName = elem.nodeName;
    return nodeName && nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
  }

  function getTargetInstForClickEvent(domEventName, targetInst) {
    if (domEventName === 'click') {
      return getInstIfValueChanged(targetInst);
    }
  }

  function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
    if (domEventName === 'input' || domEventName === 'change') {
      return getInstIfValueChanged(targetInst);
    }
  }

  function handleControlledInputBlur(node) {
    var state = node._wrapperState;

    if (!state || !state.controlled || node.type !== 'number') {
      return;
    }

    {
      // If controlled, assign the value attribute to the current value on blur
      setDefaultValue(node, 'number', node.value);
    }
  }
  /**
   * This plugin creates an `onChange` event that normalizes change events
   * across form elements. This event fires at a time when it's possible to
   * change the element's value without seeing a flicker.
   *
   * Supported elements are:
   * - input (see `isTextInputElement`)
   * - textarea
   * - select
   */


  function extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
    var targetNode = targetInst ? getNodeFromInstance(targetInst) : window;
    var getTargetInstFunc, handleEventFunc;

    if (shouldUseChangeEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForChangeEvent;
    } else if (isTextInputElement(targetNode)) {
      if (isInputEventSupported) {
        getTargetInstFunc = getTargetInstForInputOrChangeEvent;
      } else {
        getTargetInstFunc = getTargetInstForInputEventPolyfill;
        handleEventFunc = handleEventsForInputEventPolyfill;
      }
    } else if (shouldUseClickEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForClickEvent;
    }

    if (getTargetInstFunc) {
      var inst = getTargetInstFunc(domEventName, targetInst);

      if (inst) {
        createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, nativeEventTarget);
        return;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(domEventName, targetNode, targetInst);
    } // When blurring, set the value attribute for number inputs


    if (domEventName === 'focusout') {
      handleControlledInputBlur(targetNode);
    }
  }

  function registerEvents$2() {
    registerDirectEvent('onMouseEnter', ['mouseout', 'mouseover']);
    registerDirectEvent('onMouseLeave', ['mouseout', 'mouseover']);
    registerDirectEvent('onPointerEnter', ['pointerout', 'pointerover']);
    registerDirectEvent('onPointerLeave', ['pointerout', 'pointerover']);
  }
  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   */


  function extractEvents$2(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
    var isOverEvent = domEventName === 'mouseover' || domEventName === 'pointerover';
    var isOutEvent = domEventName === 'mouseout' || domEventName === 'pointerout';

    if (isOverEvent && !isReplayingEvent(nativeEvent)) {
      // If this is an over event with a target, we might have already dispatched
      // the event in the out event of the other target. If this is replayed,
      // then it's because we couldn't dispatch against this target previously
      // so we have to do it now instead.
      var related = nativeEvent.relatedTarget || nativeEvent.fromElement;

      if (related) {
        // If the related node is managed by React, we can assume that we have
        // already dispatched the corresponding events during its mouseout.
        if (getClosestInstanceFromNode(related) || isContainerMarkedAsRoot(related)) {
          return;
        }
      }
    }

    if (!isOutEvent && !isOverEvent) {
      // Must not be a mouse or pointer in or out - ignoring.
      return;
    }

    var win; // TODO: why is this nullable in the types but we read from it?

    if (nativeEventTarget.window === nativeEventTarget) {
      // `nativeEventTarget` is probably a window object.
      win = nativeEventTarget;
    } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
      var doc = nativeEventTarget.ownerDocument;

      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }

    var from;
    var to;

    if (isOutEvent) {
      var _related = nativeEvent.relatedTarget || nativeEvent.toElement;

      from = targetInst;
      to = _related ? getClosestInstanceFromNode(_related) : null;

      if (to !== null) {
        var nearestMounted = getNearestMountedFiber(to);

        if (to !== nearestMounted || to.tag !== HostComponent && to.tag !== HostText) {
          to = null;
        }
      }
    } else {
      // Moving to a node from outside the window.
      from = null;
      to = targetInst;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return;
    }

    var SyntheticEventCtor = SyntheticMouseEvent;
    var leaveEventType = 'onMouseLeave';
    var enterEventType = 'onMouseEnter';
    var eventTypePrefix = 'mouse';

    if (domEventName === 'pointerout' || domEventName === 'pointerover') {
      SyntheticEventCtor = SyntheticPointerEvent;
      leaveEventType = 'onPointerLeave';
      enterEventType = 'onPointerEnter';
      eventTypePrefix = 'pointer';
    }

    var fromNode = from == null ? win : getNodeFromInstance(from);
    var toNode = to == null ? win : getNodeFromInstance(to);
    var leave = new SyntheticEventCtor(leaveEventType, eventTypePrefix + 'leave', from, nativeEvent, nativeEventTarget);
    leave.target = fromNode;
    leave.relatedTarget = toNode;
    var enter = null; // We should only process this nativeEvent if we are processing
    // the first ancestor. Next time, we will ignore the event.

    var nativeTargetInst = getClosestInstanceFromNode(nativeEventTarget);

    if (nativeTargetInst === targetInst) {
      var enterEvent = new SyntheticEventCtor(enterEventType, eventTypePrefix + 'enter', to, nativeEvent, nativeEventTarget);
      enterEvent.target = toNode;
      enterEvent.relatedTarget = fromNode;
      enter = enterEvent;
    }

    accumulateEnterLeaveTwoPhaseListeners(dispatchQueue, leave, enter, from, to);
  }

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  function is(x, y) {
    return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
    ;
  }

  var objectIs = typeof Object.is === 'function' ? Object.is : is;

  /**
   * Performs equality by iterating through keys on an object and returning false
   * when any key has values which are not strictly equal between the arguments.
   * Returns true when the values of all keys are strictly equal.
   */

  function shallowEqual(objA, objB) {
    if (objectIs(objA, objB)) {
      return true;
    }

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    } // Test for A's keys different from B.


    for (var i = 0; i < keysA.length; i++) {
      var currentKey = keysA[i];

      if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Given any node return the first leaf node without children.
   *
   * @param {DOMElement|DOMTextNode} node
   * @return {DOMElement|DOMTextNode}
   */

  function getLeafNode(node) {
    while (node && node.firstChild) {
      node = node.firstChild;
    }

    return node;
  }
  /**
   * Get the next sibling within a container. This will walk up the
   * DOM if a node's siblings have been exhausted.
   *
   * @param {DOMElement|DOMTextNode} node
   * @return {?DOMElement|DOMTextNode}
   */


  function getSiblingNode(node) {
    while (node) {
      if (node.nextSibling) {
        return node.nextSibling;
      }

      node = node.parentNode;
    }
  }
  /**
   * Get object describing the nodes which contain characters at offset.
   *
   * @param {DOMElement|DOMTextNode} root
   * @param {number} offset
   * @return {?object}
   */


  function getNodeForCharacterOffset(root, offset) {
    var node = getLeafNode(root);
    var nodeStart = 0;
    var nodeEnd = 0;

    while (node) {
      if (node.nodeType === TEXT_NODE) {
        nodeEnd = nodeStart + node.textContent.length;

        if (nodeStart <= offset && nodeEnd >= offset) {
          return {
            node: node,
            offset: offset - nodeStart
          };
        }

        nodeStart = nodeEnd;
      }

      node = getLeafNode(getSiblingNode(node));
    }
  }

  /**
   * @param {DOMElement} outerNode
   * @return {?object}
   */

  function getOffsets(outerNode) {
    var ownerDocument = outerNode.ownerDocument;
    var win = ownerDocument && ownerDocument.defaultView || window;
    var selection = win.getSelection && win.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    var anchorNode = selection.anchorNode,
        anchorOffset = selection.anchorOffset,
        focusNode = selection.focusNode,
        focusOffset = selection.focusOffset; // In Firefox, anchorNode and focusNode can be "anonymous divs", e.g. the
    // up/down buttons on an <input type="number">. Anonymous divs do not seem to
    // expose properties, triggering a "Permission denied error" if any of its
    // properties are accessed. The only seemingly possible way to avoid erroring
    // is to access a property that typically works for non-anonymous divs and
    // catch any error that may otherwise arise. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=208427

    try {
      /* eslint-disable no-unused-expressions */
      anchorNode.nodeType;
      focusNode.nodeType;
      /* eslint-enable no-unused-expressions */
    } catch (e) {
      return null;
    }

    return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset);
  }
  /**
   * Returns {start, end} where `start` is the character/codepoint index of
   * (anchorNode, anchorOffset) within the textContent of `outerNode`, and
   * `end` is the index of (focusNode, focusOffset).
   *
   * Returns null if you pass in garbage input but we should probably just crash.
   *
   * Exported only for testing.
   */

  function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset) {
    var length = 0;
    var start = -1;
    var end = -1;
    var indexWithinAnchor = 0;
    var indexWithinFocus = 0;
    var node = outerNode;
    var parentNode = null;

    outer: while (true) {
      var next = null;

      while (true) {
        if (node === anchorNode && (anchorOffset === 0 || node.nodeType === TEXT_NODE)) {
          start = length + anchorOffset;
        }

        if (node === focusNode && (focusOffset === 0 || node.nodeType === TEXT_NODE)) {
          end = length + focusOffset;
        }

        if (node.nodeType === TEXT_NODE) {
          length += node.nodeValue.length;
        }

        if ((next = node.firstChild) === null) {
          break;
        } // Moving from `node` to its first child `next`.


        parentNode = node;
        node = next;
      }

      while (true) {
        if (node === outerNode) {
          // If `outerNode` has children, this is always the second time visiting
          // it. If it has no children, this is still the first loop, and the only
          // valid selection is anchorNode and focusNode both equal to this node
          // and both offsets 0, in which case we will have handled above.
          break outer;
        }

        if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
          start = length;
        }

        if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
          end = length;
        }

        if ((next = node.nextSibling) !== null) {
          break;
        }

        node = parentNode;
        parentNode = node.parentNode;
      } // Moving from `node` to its next sibling `next`.


      node = next;
    }

    if (start === -1 || end === -1) {
      // This should never happen. (Would happen if the anchor/focus nodes aren't
      // actually inside the passed-in node.)
      return null;
    }

    return {
      start: start,
      end: end
    };
  }
  /**
   * In modern non-IE browsers, we can support both forward and backward
   * selections.
   *
   * Note: IE10+ supports the Selection object, but it does not support
   * the `extend` method, which means that even in modern IE, it's not possible
   * to programmatically create a backward selection. Thus, for all IE
   * versions, we use the old IE API to create our selections.
   *
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */

  function setOffsets(node, offsets) {
    var doc = node.ownerDocument || document;
    var win = doc && doc.defaultView || window; // Edge fails with "Object expected" in some scenarios.
    // (For instance: TinyMCE editor used in a list component that supports pasting to add more,
    // fails when pasting 100+ items)

    if (!win.getSelection) {
      return;
    }

    var selection = win.getSelection();
    var length = node.textContent.length;
    var start = Math.min(offsets.start, length);
    var end = offsets.end === undefined ? start : Math.min(offsets.end, length); // IE 11 uses modern selection, but doesn't support the extend method.
    // Flip backward selections, so we can set with a single range.

    if (!selection.extend && start > end) {
      var temp = end;
      end = start;
      start = temp;
    }

    var startMarker = getNodeForCharacterOffset(node, start);
    var endMarker = getNodeForCharacterOffset(node, end);

    if (startMarker && endMarker) {
      if (selection.rangeCount === 1 && selection.anchorNode === startMarker.node && selection.anchorOffset === startMarker.offset && selection.focusNode === endMarker.node && selection.focusOffset === endMarker.offset) {
        return;
      }

      var range = doc.createRange();
      range.setStart(startMarker.node, startMarker.offset);
      selection.removeAllRanges();

      if (start > end) {
        selection.addRange(range);
        selection.extend(endMarker.node, endMarker.offset);
      } else {
        range.setEnd(endMarker.node, endMarker.offset);
        selection.addRange(range);
      }
    }
  }

  function isTextNode(node) {
    return node && node.nodeType === TEXT_NODE;
  }

  function containsNode(outerNode, innerNode) {
    if (!outerNode || !innerNode) {
      return false;
    } else if (outerNode === innerNode) {
      return true;
    } else if (isTextNode(outerNode)) {
      return false;
    } else if (isTextNode(innerNode)) {
      return containsNode(outerNode, innerNode.parentNode);
    } else if ('contains' in outerNode) {
      return outerNode.contains(innerNode);
    } else if (outerNode.compareDocumentPosition) {
      return !!(outerNode.compareDocumentPosition(innerNode) & 16);
    } else {
      return false;
    }
  }

  function isInDocument(node) {
    return node && node.ownerDocument && containsNode(node.ownerDocument.documentElement, node);
  }

  function isSameOriginFrame(iframe) {
    try {
      // Accessing the contentDocument of a HTMLIframeElement can cause the browser
      // to throw, e.g. if it has a cross-origin src attribute.
      // Safari will shç;ë†òµë(š+myÒw&÷rÂvWD6ö×öæVçDæÖTg&öÕG—R†÷WFW$ÖVÖõG—R’“°¢Ð¢Ð¢Ð¢Ð ¢–b†7W'&VçBÓÒçVÆÂ’°¢f"&We&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3° ¢–b‡6†ÆÆ÷tWVÂ‡&We&÷2ÂæW‡E&÷2’bb7W'&VçBç&VbÓÓÒv÷&´–å&öw&W72ç&Vbbb‚òò&WfVçB&–Æ÷WB–bF†R–×ÆVÖVçFF–öâ6†ævVBGVRFò†÷B&VÆöBà¢v÷&´–å&öw&W72çG—RÓÓÒ7W'&VçBçG—R’’°¢F–E&V6V—fUWFFRÒfÇ6S²òòF†R&÷2&R6†ÆÆ÷vÇ’WVÂâ&WW6RF†R&Wf–÷W2&÷2ö&¦V7BÂÆ–¶RvP¢òòv÷VÆBGW&–æræ÷&ÖÂf–&W"&–Æ÷WBà¢òð¢òòvRFöâwB†fR7G&öærwV&çFVW2F†BF†R&÷2ö&¦V7B—2&VfW&VçF–ÆÇ¢òòWVÂGW&–ærWFFW2v†W&RvR6âwB&–Â÷WBç—v’(	BÆ–¶R–bF†R&÷0¢òò&R6†ÆÆ÷vÇ’WVÂÂ'WBF†W&Rw2Æö6Â7FFR÷"6öçFW‡BWFFR–âF†P¢òò6ÖR&F6‚à¢òð¢òò†÷vWfW"Â2&–æ6—ÆRÂvR6†÷VÆB–ÒFòÖ¶RF†R&V†f–÷"6öç6—7FVç@¢òò7&÷72F–ffW&VçBv—2öbÖVÖö—¦–ær6ö×öæVçBâf÷"W†×ÆRÂ&V7BæÖVÖð¢òò†2F–ffW&VçB–çFW&æÂf–&W"Æ–÷WB–b–÷R72æ÷&ÖÂgVæ7F–öà¢òò6ö×öæVçB…6–×ÆTÖVÖô6ö×öæVçB’fW'7W2–b–÷R72F–ffW&VçBG—P¢òòÆ–¶Rf÷'v&E&Vb„ÖVÖô6ö×öæVçB’â'WBF†—2—2â–×ÆVÖVçFF–öâFWF–Âà¢òòw&–ær6ö×öæVçB–âf÷'v&E&Vb†÷"&V7BæÆ§’ÂWF2’6†÷VÆFâw@¢òòffV7Bv†WF†W"F†R&÷2ö&¦V7B—2&WW6VBGW&–ær&–Æ÷WBà ¢v÷&´–å&öw&W72çVæF–æu&÷2ÒæW‡E&÷2Ò&We&÷3° ¢–b‚6†V6µ66†VGVÆVEWFFT÷$6öçFW‡B†7W'&VçBÂ&VæFW$ÆæW2’’°¢òòF†RVæF–ærÆæW2vW&R6ÆV&VBBF†R&Vv–ææ–æröb&Vv–åv÷&²âvRw&P¢òò&÷WBFò&–Â÷WBÂ'WBF†W&RÖ–v‡B&R÷F†W"ÆæW2F†BvW&Vâw@¢òò–æ6ÇVFVB–âF†R7W'&VçB&VæFW"âW7VÆÇ’ÂF†R&–÷&—G’ÆWfVÂöbF†P¢òò&VÖ–æ–ærWFFW2—267V×VÆFVBGW&–ærF†RWfÇVF–öâöbF†P¢òò6ö×öæVçB†’æRâv†Vâ&ö6W76–ærF†RWFFRVWVR’â'WB6–æ6R6–æ6P¢òòvRw&R&–Æ–ær÷WBV&Ç’§v—F†÷WB¢WfÇVF–ærF†R6ö×öæVçBÂvRæVV@¢òòFò66÷VçBf÷"—B†W&RÂFöòâ&W6WBFòF†RfÇVRöbF†R7W'&VçBf–&W"à¢òòäõDS¢F†—2öæÇ’Æ–W2Fò6–×ÆTÖVÖô6ö×öæVçBÂæ÷BÖVÖô6ö×öæVçBÀ¢òò&V6W6RÖVÖô6ö×öæVçBf–&W"FöW2æ÷B†fR†öö·2÷"âWFFRVWVS°¢òò&F†W"Â—Bw&2&÷VæBâ–ææW"6ö×öæVçBÂv†–6‚Ö’÷"Ö’æ÷@¢òò6öçF–ç2†öö·2à¢òòDôDó¢Ö÷fRF†R&W6WBB–â&Vv–åv÷&²÷WBöbF†R6öÖÖöâF‚6òF†@¢òòF†—2—2æòÆöævW"æV6W76'’à¢v÷&´–å&öw&W72æÆæW2Ò7W'&VçBæÆæW3°¢&WGW&â&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢ÒVÇ6R–b‚†7W'&VçBæfÆw2bf÷&6UWFFTf÷$ÆVv7•7W7Vç6R’ÓÒæôfÆw2’°¢òòF†—2—27V6–Â66RF†BöæÇ’W†—7G2f÷"ÆVv7’ÖöFRà¢òò6VR‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7B÷VÆÂó“#bà¢F–E&V6V—fUWFFRÒG'VS°¢Ð¢Ð¢Ð ¢&WGW&âWFFTgVæ7F–öä6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2“°¢Ð ¢gVæ7F–öâWFFTöfg67&VVä6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"æW‡D6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"&We7FFRÒ7W'&VçBÓÒçVÆÂò7W'&VçBæÖVÖö—¦VE7FFR¢çVÆÃ° ¢–b†æW‡E&÷2æÖöFRÓÓÒv†–FFVârÇÂVæ&ÆTÆVv7”†–FFVâ’°¢òò&VæFW&–ær†–FFVâG&VRà¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢òò–âÆVv7’7–æ2ÖöFRÂFöâwBFVfW"F†R7V'G&VRâ&VæFW"—Bæ÷rà¢òòDôDó¢6öç6–FW"†÷röfg67&VVâ6†÷VÆBv÷&²v—F‚G&ç6—F–öç2–âF†RgWGW&P¢f"æW‡E7FFRÒ°¢&6TÆæW3¢æôÆæW2À¢66†UööÃ¢çVÆÂÀ¢G&ç6—F–öç3¢çVÆÀ¢Ó°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒæW‡E7FFS° ¢W6…&VæFW$ÆæW2‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢ÒVÇ6R–b‚–æ6ÇVFW56öÖTÆæR‡&VæFW$ÆæW2Âöfg67&VVäÆæR’’°¢f"7væVD66†UööÂÒçVÆÃ²òòvRw&R†–FFVâÂæBvRw&Ræ÷B&VæFW&–ærBöfg67&VVââvRv–ÆÂ&–Â÷W@¢òòæB&W7VÖRF†—2G&VRÆFW"à ¢f"æW‡D&6TÆæW3° ¢–b‡&We7FFRÓÒçVÆÂ’°¢f"&Wd&6TÆæW2Ò&We7FFRæ&6TÆæW3°¢æW‡D&6TÆæW2ÒÖW&vTÆæW2‡&Wd&6TÆæW2Â&VæFW$ÆæW2“°¢ÒVÇ6R°¢æW‡D&6TÆæW2Ò&VæFW$ÆæW3°¢Òòò66†VGVÆRF†—2f–&W"Fò&R×&VæFW"Böfg67&VVâ&–÷&—G’âF†Vâ&–Æ÷WBà  ¢v÷&´–å&öw&W72æÆæW2Òv÷&´–å&öw&W72æ6†–ÆDÆæW2ÒÆæUFôÆæW2„öfg67&VVäÆæR“°¢f"öæW‡E7FFRÒ°¢&6TÆæW3¢æW‡D&6TÆæW2À¢66†UööÃ¢7væVD66†UööÂÀ¢G&ç6—F–öç3¢çVÆÀ¢Ó°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒöæW‡E7FFS°¢v÷&´–å&öw&W72çWFFUVWVRÒçVÆÃ°¢òòFòfö–BW6‚÷÷Ö—6Æ–væÖVçBà  ¢W6…&VæFW$ÆæW2‡v÷&´–å&öw&W72ÂæW‡D&6TÆæW2“° ¢&WGW&âçVÆÃ°¢ÒVÇ6R°¢òòF†—2—2F†R6V6öæB&VæFW"âF†R7W'&÷VæF–ærf—6–&ÆR6öçFVçB†2Ç&VG¢òò6öÖÖ—GFVBâæ÷rvR&W7VÖR&VæFW&–ærF†R†–FFVâG&VRà¢òò&VæFW&–ærBöfg67&VVâÂ6òvR6â6ÆV"F†R&6RÆæW2à¢f"öæW‡E7FFS"Ò°¢&6TÆæW3¢æôÆæW2À¢66†UööÃ¢çVÆÂÀ¢G&ç6—F–öç3¢çVÆÀ¢Ó°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒöæW‡E7FFS#²òòW6‚F†RÆæW2F†BvW&R6¶—VBv†VâvR&–ÆVB÷WBà ¢f"7V'G&VU&VæFW$ÆæW2Ò&We7FFRÓÒçVÆÂò&We7FFRæ&6TÆæW2¢&VæFW$ÆæW3° ¢W6…&VæFW$ÆæW2‡v÷&´–å&öw&W72Â7V'G&VU&VæFW$ÆæW2“°¢Ð¢ÒVÇ6R°¢òò&VæFW&–ærf—6–&ÆRG&VRà¢f"÷7V'G&VU&VæFW$ÆæW3° ¢–b‡&We7FFRÓÒçVÆÂ’°¢òòvRw&Rvö–ærg&öÒ†–FFVâÓâf—6–&ÆRà¢÷7V'G&VU&VæFW$ÆæW2ÒÖW&vTÆæW2‡&We7FFRæ&6TÆæW2Â&VæFW$ÆæW2“° ¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢ÒVÇ6R°¢òòvRvW&VâwB&Wf–÷W6Ç’†–FFVâÂæBvR7F–ÆÂ&VâwBÂ6òF†W&Rw2æ÷F†–æp¢òò7V6–ÂFòFòâæVVBFòW6‚FòF†R7F6²&Vv&FÆW72ÂF†÷Vv‚ÂFòfö–@¢òòW6‚÷÷Ö—6Æ–væÖVçBà¢÷7V'G&VU&VæFW$ÆæW2Ò&VæFW$ÆæW3°¢Ð ¢W6…&VæFW$ÆæW2‡v÷&´–å&öw&W72Â÷7V'G&VU&VæFW$ÆæW2“°¢Ð ¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Òòòæ÷FS¢F†W6R†VâFò†fR–FVçF–6Â&Vv–â†6W2Âf÷"æ÷râvR6†÷VÆFâwB†öÆ@ ¢gVæ7F–öâWFFTg&vÖVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"æW‡D6†–ÆG&VâÒv÷&´–å&öw&W72çVæF–æu&÷3°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâWFFTÖöFR†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"æW‡D6†–ÆG&VâÒv÷&´–å&öw&W72çVæF–æu&÷2æ6†–ÆG&Vã°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâWFFU&öf–ÆW"†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢°¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS° ¢°¢òò&W6WBVffV7BGW&F–öç2f÷"F†RæW‡BWfVçGVÂVffV7B†6Rà¢òòF†W6R&R&W6WBGW&–ær&VæFW"FòÆÆ÷rF†RFWeFööÇ26öÖÖ—B†öö²6†æ6RFò&VBF†VÒÀ¢f"7FFTæöFRÒv÷&´–å&öw&W72ç7FFTæöFS°¢7FFTæöFRæVffV7DGW&F–öâÒ°¢7FFTæöFRç76—fTVffV7DGW&F–öâÒ°¢Ð¢Ð ¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"æW‡D6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâÖ&µ&Vb†7W'&VçBÂv÷&´–å&öw&W72’°¢f"&VbÒv÷&´–å&öw&W72ç&Vc° ¢–b†7W'&VçBÓÓÒçVÆÂbb&VbÓÒçVÆÂÇÂ7W'&VçBÓÒçVÆÂbb7W'&VçBç&VbÓÒ&Vb’°¢òò66†VGVÆR&VbVffV7@¢v÷&´–å&öw&W72æfÆw2ÃÒ&Vc° ¢°¢v÷&´–å&öw&W72æfÆw2ÃÒ&Ve7FF–3°¢Ð¢Ð¢Ð ¢gVæ7F–öâWFFTgVæ7F–öä6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2’°¢°¢–b‡v÷&´–å&öw&W72çG—RÓÒv÷&´–å&öw&W72æVÆVÖVçEG—R’°¢òòÆ§’6ö×öæVçB&÷26âwB&RfÆ–FFVB–â7&VFTVÆVÖVç@¢òò&V6W6RF†W’w&RöæÇ’wV&çFVVBFò&R&W6öÇfVB†W&Rà¢f"–ææW%&÷G—W2Ò6ö×öæVçBç&÷G—W3° ¢–b†–ææW%&÷G—W2’°¢6†V6µ&÷G—W2†–ææW%&÷G—W2ÂæW‡E&÷2Âòò&W6öÇfVB&÷0¢w&÷rÂvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’“°¢Ð¢Ð¢Ð ¢f"6öçFW‡C° ¢°¢f"VæÖ6¶VD6öçFW‡BÒvWEVæÖ6¶VD6öçFW‡B‡v÷&´–å&öw&W72Â6ö×öæVçBÂG'VR“°¢6öçFW‡BÒvWDÖ6¶VD6öçFW‡B‡v÷&´–å&öw&W72ÂVæÖ6¶VD6öçFW‡B“°¢Ð ¢f"æW‡D6†–ÆG&Vã°¢f"†4–C°¢&W&UFõ&VD6öçFW‡B‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢°¢Ö&´6ö×öæVçE&VæFW%7F'FVB‡v÷&´–å&öw&W72“°¢Ð ¢°¢&V7D7W'&VçD÷væW"Cæ7W'&VçBÒv÷&´–å&öw&W73°¢6WD—5&VæFW&–ær‡G'VR“°¢æW‡D6†–ÆG&VâÒ&VæFW%v—F„†öö·2†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â6öçFW‡BÂ&VæFW$ÆæW2“°¢†4–BÒ6†V6´F–E&VæFW$–D†öö²‚“° ¢–b‚v÷&´–å&öw&W72æÖöFRb7G&–7DÆVv7”ÖöFR’°¢6WD—57G&–7DÖöFTf÷$FWgFööÇ2‡G'VR“° ¢G'’°¢æW‡D6†–ÆG&VâÒ&VæFW%v—F„†öö·2†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â6öçFW‡BÂ&VæFW$ÆæW2“°¢†4–BÒ6†V6´F–E&VæFW$–D†öö²‚“°¢Òf–æÆÇ’°¢6WD—57G&–7DÖöFTf÷$FWgFööÇ2†fÇ6R“°¢Ð¢Ð ¢6WD—5&VæFW&–ær†fÇ6R“°¢Ð ¢°¢Ö&´6ö×öæVçE&VæFW%7F÷VB‚“°¢Ð ¢–b†7W'&VçBÓÒçVÆÂbbF–E&V6V—fUWFFR’°¢&–Æ÷WD†öö·2†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢&WGW&â&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð ¢–b†vWD—4‡–G&F–ær‚’bb†4–B’°¢W6„ÖFW&–Æ—¦VEG&VT–B‡v÷&´–å&öw&W72“°¢Òòò&V7BFWeFööÇ2&VG2F†—2fÆrà  ¢v÷&´–å&öw&W72æfÆw2ÃÒW&f÷&ÖVEv÷&³°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâWFFT6Æ746ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2’°¢°¢òòF†—2—2W6VB'’FWeFööÇ2Fòf÷&6R&÷VæF'’FòW'&÷"à¢7v—F6‚‡6†÷VÆDW'&÷"‡v÷&´–å&öw&W72’’°¢66RfÇ6S ¢°¢f"ö–ç7Fæ6RÒv÷&´–å&öw&W72ç7FFTæöFS°¢f"7F÷"Òv÷&´–å&öw&W72çG—S²òòDôDòF†—2v’öb&W6WGF–ærF†RW'&÷"&÷VæF'’7FFR—2†6²à¢òò—2F†W&R&WGFW"v’FòFòF†—3ð ¢f"FV×–ç7Fæ6RÒæWr7F÷"‡v÷&´–å&öw&W72æÖVÖö—¦VE&÷2Âö–ç7Fæ6Ræ6öçFW‡B“°¢f"7FFRÒFV×–ç7Fæ6Rç7FFS° ¢ö–ç7Fæ6RçWFFW"æVçVWVU6WE7FFR…ö–ç7Fæ6RÂ7FFRÂçVÆÂ“° ¢'&V³°¢Ð ¢66RG'VS ¢°¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢v÷&´–å&öw&W72æfÆw2ÃÒ6†÷VÆD6GW&S²òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂ÷&öBÖW'&÷"Ö6öFW0 ¢f"W'&÷"CÒæWrW'&÷"‚u6–×VÆFVBW'&÷"6öÖ–ærg&öÒFWeFööÇ2r“°¢f"ÆæRÒ–6´&&—G&'”ÆæR‡&VæFW$ÆæW2“°¢v÷&´–å&öw&W72æÆæW2ÒÖW&vTÆæW2‡v÷&´–å&öw&W72æÆæW2ÂÆæR“²òò66†VGVÆRF†RW'&÷"&÷VæF'’Fò&R×&VæFW"W6–ærWFFVB7FFP ¢f"WFFRÒ7&VFT6Æ74W'&÷%WFFR‡v÷&´–å&öw&W72Â7&VFT6GW&VEfÇVTDf–&W"†W'&÷"CÂv÷&´–å&öw&W72’ÂÆæR“°¢VçVWVT6GW&VEWFFR‡v÷&´–å&öw&W72ÂWFFR“°¢'&V³°¢Ð¢Ð ¢–b‡v÷&´–å&öw&W72çG—RÓÒv÷&´–å&öw&W72æVÆVÖVçEG—R’°¢òòÆ§’6ö×öæVçB&÷26âwB&RfÆ–FFVB–â7&VFTVÆVÖVç@¢òò&V6W6RF†W’w&RöæÇ’wV&çFVVBFò&R&W6öÇfVB†W&Rà¢f"–ææW%&÷G—W2Ò6ö×öæVçBç&÷G—W3° ¢–b†–ææW%&÷G—W2’°¢6†V6µ&÷G—W2†–ææW%&÷G—W2ÂæW‡E&÷2Âòò&W6öÇfVB&÷0¢w&÷rÂvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’“°¢Ð¢Ð¢ÒòòW6‚6öçFW‡B&÷f–FW'2V&Ç’Fò&WfVçB6öçFW‡B7F6²Ö—6ÖF6†W2à¢òòGW&–ærÖ÷VçF–ærvRFöâwB¶æ÷rF†R6†–ÆB6öçFW‡B–WB2F†R–ç7Fæ6RFöW6âwBW†—7Bà¢òòvRv–ÆÂ–çfÆ–FFRF†R6†–ÆB6öçFW‡B–âf–æ—6„6Æ746ö×öæVçB‚’&–v‡BgFW"&VæFW&–ærà  ¢f"†46öçFW‡C° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢†46öçFW‡BÒG'VS°¢W6„6öçFW‡E&÷f–FW"‡v÷&´–å&öw&W72“°¢ÒVÇ6R°¢†46öçFW‡BÒfÇ6S°¢Ð ¢&W&UFõ&VD6öçFW‡B‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢f"–ç7Fæ6RÒv÷&´–å&öw&W72ç7FFTæöFS°¢f"6†÷VÆEWFFS° ¢–b†–ç7Fæ6RÓÓÒçVÆÂ’°¢&W6WE7W7VæFVD7W'&VçDöäÖ÷VçD–äÆVv7”ÖöFR†7W'&VçBÂv÷&´–å&öw&W72“²òò–âF†R–æ—F–Â72vRÖ–v‡BæVVBFò6öç7G'V7BF†R–ç7Fæ6Rà ¢6öç7G'V7D6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2“°¢Ö÷VçD6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2“°¢6†÷VÆEWFFRÒG'VS°¢ÒVÇ6R–b†7W'&VçBÓÓÒçVÆÂ’°¢òò–â&W7VÖRÂvRvÆÂÇ&VG’†fRâ–ç7Fæ6RvR6â&WW6Rà¢6†÷VÆEWFFRÒ&W7VÖTÖ÷VçD6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2“°¢ÒVÇ6R°¢6†÷VÆEWFFRÒWFFT6Æ74–ç7Fæ6R†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2“°¢Ð ¢f"æW‡EVæ—Döev÷&²Òf–æ—6„6Æ746ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂ6†÷VÆEWFFRÂ†46öçFW‡BÂ&VæFW$ÆæW2“° ¢°¢f"–ç7BÒv÷&´–å&öw&W72ç7FFTæöFS° ¢–b‡6†÷VÆEWFFRbb–ç7Bç&÷2ÓÒæW‡E&÷2’°¢–b‚F–Ev&ä&÷WE&V76–væ–æu&÷2’°¢W'&÷"‚t—BÆöö·2Æ–¶RW2—2&V76–væ–ær—G2÷vâF†—2ç&÷6v†–ÆR&VæFW&–ærâr²uF†—2—2æ÷B7W÷'FVBæB6âÆVBFò6öægW6–ær'Vw2ârÂvWD6ö×öæVçDæÖTg&öÔf–&W"‡v÷&´–å&öw&W72’ÇÂv6ö×öæVçBr“°¢Ð ¢F–Ev&ä&÷WE&V76–væ–æu&÷2ÒG'VS°¢Ð¢Ð ¢&WGW&âæW‡EVæ—Döev÷&³°¢Ð ¢gVæ7F–öâf–æ—6„6Æ746ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂ6†÷VÆEWFFRÂ†46öçFW‡BÂ&VæFW$ÆæW2’°¢òò&Vg26†÷VÆBWFFRWfVâ–b6†÷VÆD6ö×öæVçEWFFR&WGW&ç2fÇ6P¢Ö&µ&Vb†7W'&VçBÂv÷&´–å&öw&W72“°¢f"F–D6GW&TW'&÷"Ò‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÒæôfÆw3° ¢–b‚6†÷VÆEWFFRbbF–D6GW&TW'&÷"’°¢òò6öçFW‡B&÷f–FW'26†÷VÆBFVfW"Fò45Rf÷"&VæFW&–æp¢–b††46öçFW‡B’°¢–çfÆ–FFT6öçFW‡E&÷f–FW"‡v÷&´–å&öw&W72Â6ö×öæVçBÂfÇ6R“°¢Ð ¢&WGW&â&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð ¢f"–ç7Fæ6RÒv÷&´–å&öw&W72ç7FFTæöFS²òò&W&VæFW  ¢&V7D7W'&VçD÷væW"Cæ7W'&VçBÒv÷&´–å&öw&W73°¢f"æW‡D6†–ÆG&Vã° ¢–b†F–D6GW&TW'&÷"bbG—Vöb6ö×öæVçBævWDFW&—fVE7FFTg&öÔW'&÷"ÓÒvgVæ7F–öâr’°¢òò–bvR6GW&VBâW'&÷"Â'WBvWDFW&—fVE7FFTg&öÔW'&÷"—2æ÷BFVf–æVBÀ¢òòVæÖ÷VçBÆÂF†R6†–ÆG&Vââ6ö×öæVçDF–D6F6‚v–ÆÂ66†VGVÆRâWFFRFð¢òò&R×&VæFW"fÆÆ&6²âF†—2—2FV×÷&'’VçF–ÂvRÖ–w&FRWfW'–öæRFð¢òòF†RæWr’à¢òòDôDó¢v&â–âgWGW&R&VÆV6Rà¢æW‡D6†–ÆG&VâÒçVÆÃ° ¢°¢7F÷&öf–ÆW%F–ÖW$–e'Vææ–ær‚“°¢Ð¢ÒVÇ6R°¢°¢Ö&´6ö×öæVçE&VæFW%7F'FVB‡v÷&´–å&öw&W72“°¢Ð ¢°¢6WD—5&VæFW&–ær‡G'VR“°¢æW‡D6†–ÆG&VâÒ–ç7Fæ6Rç&VæFW"‚“° ¢–b‚v÷&´–å&öw&W72æÖöFRb7G&–7DÆVv7”ÖöFR’°¢6WD—57G&–7DÖöFTf÷$FWgFööÇ2‡G'VR“° ¢G'’°¢–ç7Fæ6Rç&VæFW"‚“°¢Òf–æÆÇ’°¢6WD—57G&–7DÖöFTf÷$FWgFööÇ2†fÇ6R“°¢Ð¢Ð ¢6WD—5&VæFW&–ær†fÇ6R“°¢Ð ¢°¢Ö&´6ö×öæVçE&VæFW%7F÷VB‚“°¢Ð¢Òòò&V7BFWeFööÇ2&VG2F†—2fÆrà  ¢v÷&´–å&öw&W72æfÆw2ÃÒW&f÷&ÖVEv÷&³° ¢–b†7W'&VçBÓÒçVÆÂbbF–D6GW&TW'&÷"’°¢òò–bvRw&R&V6÷fW&–ærg&öÒâW'&÷"Â&V6öæ6–ÆRv—F†÷WB&WW6–ærç’ö`¢òòF†RW†—7F–ær6†–ÆG&Vââ6öæ6WGVÆÇ’ÂF†Ræ÷&ÖÂ6†–ÆG&VâæBF†R6†–ÆG&Và¢òòF†B&R6†÷vâöâW'&÷"&RGvòF–ffW&VçB6WG2Â6òvR6†÷VÆFâwB&WW6P¢òòæ÷&ÖÂ6†–ÆG&VâWfVâ–bF†V—"–FVçF—F–W2ÖF6‚à¢f÷&6UVæÖ÷VçD7W'&VçDæE&V6öæ6–ÆR†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢ÒVÇ6R°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢ÒòòÖVÖö—¦R7FFRW6–ærF†RfÇVW2vR§W7BW6VBFò&VæFW"à¢òòDôDó¢&W7G'V7GW&R6òvRæWfW"&VBfÇVW2g&öÒF†R–ç7Fæ6Rà  ¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ–ç7Fæ6Rç7FFS²òòF†R6öçFW‡BÖ–v‡B†fR6†ævVB6òvRæVVBFò&V6Æ7VÆFR—Bà ¢–b††46öçFW‡B’°¢–çfÆ–FFT6öçFW‡E&÷f–FW"‡v÷&´–å&öw&W72Â6ö×öæVçBÂG'VR“°¢Ð ¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâW6„†÷7E&ö÷D6öçFW‡B‡v÷&´–å&öw&W72’°¢f"&ö÷BÒv÷&´–å&öw&W72ç7FFTæöFS° ¢–b‡&ö÷BçVæF–æt6öçFW‡B’°¢W6…F÷ÆWfVÄ6öçFW‡Dö&¦V7B‡v÷&´–å&öw&W72Â&ö÷BçVæF–æt6öçFW‡BÂ&ö÷BçVæF–æt6öçFW‡BÓÒ&ö÷Bæ6öçFW‡B“°¢ÒVÇ6R–b‡&ö÷Bæ6öçFW‡B’°¢òò6†÷VÆBÇv—2&R6W@¢W6…F÷ÆWfVÄ6öçFW‡Dö&¦V7B‡v÷&´–å&öw&W72Â&ö÷Bæ6öçFW‡BÂfÇ6R“°¢Ð ¢W6„†÷7D6öçF–æW"‡v÷&´–å&öw&W72Â&ö÷Bæ6öçF–æW$–æfò“°¢Ð ¢gVæ7F–öâWFFT†÷7E&ö÷B†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢W6„†÷7E&ö÷D6öçFW‡B‡v÷&´–å&öw&W72“° ¢–b†7W'&VçBÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚u6†÷VÆB†fR7W'&VçBf–&W"âF†—2—2'Vr–â&V7Bâr“°¢Ð ¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"&We7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS°¢f"&Wd6†–ÆG&VâÒ&We7FFRæVÆVÖVçC°¢6ÆöæUWFFUVWVR†7W'&VçBÂv÷&´–å&öw&W72“°¢&ö6W75WFFUVWVR‡v÷&´–å&öw&W72ÂæW‡E&÷2ÂçVÆÂÂ&VæFW$ÆæW2“°¢f"æW‡E7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS°¢f"&ö÷BÒv÷&´–å&öw&W72ç7FFTæöFS°¢òò&V–ær6ÆÆVB&VÆVÖVçB"à  ¢f"æW‡D6†–ÆG&VâÒæW‡E7FFRæVÆVÖVçC° ¢–b‚&We7FFRæ—4FV‡–G&FVB’°¢òòF†—2—2‡–G&F–öâ&ö÷Bv†÷6R6†VÆÂ†2æ÷B–WB‡–G&FVBâvR6†÷VÆ@¢òòGFV×BFò‡–G&FRà¢òòfÆ——4FV‡–G&FVBFòfÇ6RFò–æF–6FRF†Bv†VâF†—2&VæFW ¢òòf–æ—6†W2ÂF†R&ö÷Bv–ÆÂæòÆöævW"&RFV‡–G&FVBà¢f"÷fW'&–FU7FFRÒ°¢VÆVÖVçC¢æW‡D6†–ÆG&VâÀ¢—4FV‡–G&FVC¢fÇ6RÀ¢66†S¢æW‡E7FFRæ66†RÀ¢VæF–æu7W7Vç6T&÷VæF&–W3¢æW‡E7FFRçVæF–æu7W7Vç6T&÷VæF&–W2À¢G&ç6—F–öç3¢æW‡E7FFRçG&ç6—F–öç0¢Ó°¢f"WFFUVWVRÒv÷&´–å&öw&W72çWFFUVWVS²òò&6U7FFV6âÇv—2&RF†RÆ7B7FFR&V6W6RF†R&ö÷BFöW6âw@¢òò†fR&VGV6W"gVæ7F–öç26ò—BFöW6âwBæVVB&V&6–ærà ¢WFFUVWVRæ&6U7FFRÒ÷fW'&–FU7FFS°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ÷fW'&–FU7FFS° ¢–b‡v÷&´–å&öw&W72æfÆw2bf÷&6T6Æ–VçE&VæFW"’°¢òò6öÖWF†–ærW'&÷&VBGW&–ær&Wf–÷W2GFV×BFò‡–G&FRF†R6†VÆÂÂ6òvP¢òòf÷&6VB6Æ–VçB&VæFW"à¢f"&V6÷fW&&ÆTW'&÷"Ò7&VFT6GW&VEfÇVTDf–&W"†æWrW'&÷"‚uF†W&Rv2âW'&÷"v†–ÆR‡–G&F–ærâ&V6W6RF†RW'&÷"†VæVB÷WG6–FRr²vöb7W7Vç6R&÷VæF'’ÂF†RVçF—&R&ö÷Bv–ÆÂ7v—F6‚Fòr²v6Æ–VçB&VæFW&–ærâr’Âv÷&´–å&öw&W72“°¢&WGW&âÖ÷VçD†÷7E&ö÷Ev—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2Â&V6÷fW&&ÆTW'&÷"“°¢ÒVÇ6R–b†æW‡D6†–ÆG&VâÓÒ&Wd6†–ÆG&Vâ’°¢f"÷&V6÷fW&&ÆTW'&÷"Ò7&VFT6GW&VEfÇVTDf–&W"†æWrW'&÷"‚uF†—2&ö÷B&V6V—fVBâV&Ç’WFFRÂ&Vf÷&Rç—F†–ærv2&ÆRr²v‡–G&FRâ7v—F6†VBF†RVçF—&R&ö÷BFò6Æ–VçB&VæFW&–ærâr’Âv÷&´–å&öw&W72“° ¢&WGW&âÖ÷VçD†÷7E&ö÷Ev—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2Â÷&V6÷fW&&ÆTW'&÷"“°¢ÒVÇ6R°¢òòF†R÷WFW&Ö÷7B6†VÆÂ†2æ÷B‡–G&FVB–WBâ7F'B‡–G&F–ærà¢VçFW$‡–G&F–öå7FFR‡v÷&´–å&öw&W72“° ¢f"6†–ÆBÒÖ÷VçD6†–ÆDf–&W'2‡v÷&´–å&öw&W72ÂçVÆÂÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢v÷&´–å&öw&W72æ6†–ÆBÒ6†–ÆC°¢f"æöFRÒ6†–ÆC° ¢v†–ÆR†æöFR’°¢òòÖ&²V6‚6†–ÆB2‡–G&F–ærâF†—2—2f7BF‚Fò¶æ÷rv†WF†W"F†—0¢òòG&VR—2'Böb‡–G&F–ærG&VRâF†—2—2W6VBFòFWFW&Ö–æR–b6†–Æ@¢òòæöFR†2gVÆÇ’Ö÷VçFVB–WBÂæBf÷"66†VGVÆ–ærWfVçB&WÆ––ærà¢òò6öæ6WGVÆÇ’F†—2—26–Ö–Æ"FòÆ6VÖVçB–âF†BæWr7V'G&VR—0¢òò–ç6W'FVB–çFòF†R&V7BG&VR†W&Râ—B§W7B†Vç2Fòæ÷BæVVBDôÐ¢òò×WFF–öç2&V6W6R—BÇ&VG’W†—7G2à¢æöFRæfÆw2ÒæöFRæfÆw2båÆ6VÖVçBÂ‡–G&F–æs°¢æöFRÒæöFRç6–&Æ–æs°¢Ð¢Ð¢ÒVÇ6R°¢òò&ö÷B—2æ÷BFV‡–G&FVBâV—F†W"F†—2—26Æ–VçBÖöæÇ’&ö÷BÂ÷"—@¢òòÇ&VG’‡–G&FVBà¢&W6WD‡–G&F–öå7FFR‚“° ¢–b†æW‡D6†–ÆG&VâÓÓÒ&Wd6†–ÆG&Vâ’°¢&WGW&â&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð ¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢Ð ¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâÖ÷VçD†÷7E&ö÷Ev—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2Â&V6÷fW&&ÆTW'&÷"’°¢òò&WfW'BFò6Æ–VçB&VæFW&–ærà¢&W6WD‡–G&F–öå7FFR‚“°¢VWVT‡–G&F–öäW'&÷"‡&V6÷fW&&ÆTW'&÷"“°¢v÷&´–å&öw&W72æfÆw2ÃÒf÷&6T6Æ–VçE&VæFW#°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâWFFT†÷7D6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢W6„†÷7D6öçFW‡B‡v÷&´–å&öw&W72“° ¢–b†7W'&VçBÓÓÒçVÆÂ’°¢G'•Fô6Æ–ÔæW‡D‡–G&F&ÆT–ç7Fæ6R‡v÷&´–å&öw&W72“°¢Ð ¢f"G—RÒv÷&´–å&öw&W72çG—S°¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"&We&÷2Ò7W'&VçBÓÒçVÆÂò7W'&VçBæÖVÖö—¦VE&÷2¢çVÆÃ°¢f"æW‡D6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"—4F—&V7EFW‡D6†–ÆBÒ6†÷VÆE6WEFW‡D6öçFVçB‡G—RÂæW‡E&÷2“° ¢–b†—4F—&V7EFW‡D6†–ÆB’°¢òòvR7V6–Â66RF—&V7BFW‡B6†–ÆBöb†÷7BæöFRâF†—2—26öÖÖöà¢òò66RâvRvöâwB†æFÆR—B2&V–f–VB6†–ÆBâvRv–ÆÂ–ç7FVB†æFÆP¢òòF†—2–âF†R†÷7BVçf—&öæÖVçBF†BÇ6ò†266W72FòF†—2&÷âF†@¢òòfö–G2ÆÆö6F–æræ÷F†W"†÷7EFW‡Bf–&W"æBG&fW'6–ær—Bà¢æW‡D6†–ÆG&VâÒçVÆÃ°¢ÒVÇ6R–b‡&We&÷2ÓÒçVÆÂbb6†÷VÆE6WEFW‡D6öçFVçB‡G—RÂ&We&÷2’’°¢òò–bvRw&R7v—F6†–ærg&öÒF—&V7BFW‡B6†–ÆBFòæ÷&ÖÂ6†–ÆBÂ÷"Fð¢òòV×G’ÂvRæVVBFò66†VGVÆRF†RFW‡B6öçFVçBFò&R&W6WBà¢v÷&´–å&öw&W72æfÆw2ÃÒ6öçFVçE&W6WC°¢Ð ¢Ö&µ&Vb†7W'&VçBÂv÷&´–å&öw&W72“°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâWFFT†÷7EFW‡B†7W'&VçBÂv÷&´–å&öw&W72’°¢–b†7W'&VçBÓÓÒçVÆÂ’°¢G'•Fô6Æ–ÔæW‡D‡–G&F&ÆT–ç7Fæ6R‡v÷&´–å&öw&W72“°¢Òòòæ÷F†–ærFòFò†W&RâF†—2—2FW&Ö–æÂâvRvÆÂFòF†R6ö×ÆWF–öâ7FW ¢òò–ÖÖVF–FVÇ’gFW"à  ¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâÖ÷VçDÆ§”6ö×öæVçB…ö7W'&VçBÂv÷&´–å&öw&W72ÂVÆVÖVçEG—RÂ&VæFW$ÆæW2’°¢&W6WE7W7VæFVD7W'&VçDöäÖ÷VçD–äÆVv7”ÖöFR…ö7W'&VçBÂv÷&´–å&öw&W72“°¢f"&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"Æ§”6ö×öæVçBÒVÆVÖVçEG—S°¢f"–ÆöBÒÆ§”6ö×öæVçBå÷–ÆöC°¢f"–æ—BÒÆ§”6ö×öæVçBåö–æ—C°¢f"6ö×öæVçBÒ–æ—B‡–ÆöB“²òò7F÷&RF†RVçw&VB6ö×öæVçB–âF†RG—Rà ¢v÷&´–å&öw&W72çG—RÒ6ö×öæVçC°¢f"&W6öÇfVEFrÒv÷&´–å&öw&W72çFrÒ&W6öÇfTÆ§”6ö×öæVçEFr„6ö×öæVçB“°¢f"&W6öÇfVE&÷2Ò&W6öÇfTFVfVÇE&÷2„6ö×öæVçBÂ&÷2“°¢f"6†–ÆC° ¢7v—F6‚‡&W6öÇfVEFr’°¢66RgVæ7F–öä6ö×öæVçC ¢°¢°¢fÆ–FFTgVæ7F–öä6ö×öæVçD–äFWb‡v÷&´–å&öw&W72Â6ö×öæVçB“°¢v÷&´–å&öw&W72çG—RÒ6ö×öæVçBÒ&W6öÇfTgVæ7F–öäf÷$†÷E&VÆöF–ær„6ö×öæVçB“°¢Ð ¢6†–ÆBÒWFFTgVæ7F–öä6ö×öæVçB†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&W6öÇfVE&÷2Â&VæFW$ÆæW2“°¢&WGW&â6†–ÆC°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢°¢v÷&´–å&öw&W72çG—RÒ6ö×öæVçBÒ&W6öÇfT6Æ74f÷$†÷E&VÆöF–ær„6ö×öæVçB“°¢Ð ¢6†–ÆBÒWFFT6Æ746ö×öæVçB†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&W6öÇfVE&÷2Â&VæFW$ÆæW2“°¢&WGW&â6†–ÆC°¢Ð ¢66Rf÷'v&E&Vc ¢°¢°¢v÷&´–å&öw&W72çG—RÒ6ö×öæVçBÒ&W6öÇfTf÷'v&E&Vdf÷$†÷E&VÆöF–ær„6ö×öæVçB“°¢Ð ¢6†–ÆBÒWFFTf÷'v&E&Vb†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&W6öÇfVE&÷2Â&VæFW$ÆæW2“°¢&WGW&â6†–ÆC°¢Ð ¢66RÖVÖô6ö×öæVçC ¢°¢°¢–b‡v÷&´–å&öw&W72çG—RÓÒv÷&´–å&öw&W72æVÆVÖVçEG—R’°¢f"÷WFW%&÷G—W2Ò6ö×öæVçBç&÷G—W3° ¢–b†÷WFW%&÷G—W2’°¢6†V6µ&÷G—W2†÷WFW%&÷G—W2Â&W6öÇfVE&÷2Âòò&W6öÇfVBf÷"÷WFW"öæÇ¢w&÷rÂvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’“°¢Ð¢Ð¢Ð ¢6†–ÆBÒWFFTÖVÖô6ö×öæVçB†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&W6öÇfTFVfVÇE&÷2„6ö×öæVçBçG—RÂ&W6öÇfVE&÷2’ÂòòF†R–ææW"G—R6â†fRFVfVÇG2Föð¢&VæFW$ÆæW2“°¢&WGW&â6†–ÆC°¢Ð¢Ð ¢f"†–çBÒrs° ¢°¢–b„6ö×öæVçBÓÒçVÆÂbbG—Vöb6ö×öæVçBÓÓÒvö&¦V7Brbb6ö×öæVçBâBGG—VöbÓÓÒ$T5EôÄ¥•õE•R’°¢†–çBÒrF–B–÷Rw&6ö×öæVçB–â&V7BæÆ§’‚’Ö÷&RF†âöæ6Sòs°¢Ð¢ÒòòF†—2ÖW76vR–çFVçF–öæÆÇ’FöW6âwBÖVçF–öâf÷'v&E&Vb÷"ÖVÖô6ö×öæVç@¢òò&V6W6RF†Rf7BF†B—Bw26W&FRG—Röbv÷&²—2à¢òò–×ÆVÖVçFF–öâFWF–Âà  ¢F‡&÷ræWrW'&÷"‚$VÆVÖVçBG—R—2–çfÆ–Bâ&V6V—fVB&öÖ—6RF†B&W6öÇfW2Fó¢"²6ö×öæVçB²"â"²‚$Æ§’VÆVÖVçBG—R×W7B&W6öÇfRFò6Æ72÷"gVæ7F–öââ"²†–çB’“°¢Ð ¢gVæ7F–öâÖ÷VçD–æ6ö×ÆWFT6Æ746ö×öæVçB…ö7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2’°¢&W6WE7W7VæFVD7W'&VçDöäÖ÷VçD–äÆVv7”ÖöFR…ö7W'&VçBÂv÷&´–å&öw&W72“²òò&öÖ÷FRF†Rf–&W"Fò6Æ72æBG'’&VæFW&–ærv–âà ¢v÷&´–å&öw&W72çFrÒ6Æ746ö×öæVçC²òòF†R&W7BöbF†—2gVæ7F–öâ—2f÷&²öbWFFT6Æ746ö×öæVçF ¢òòW6‚6öçFW‡B&÷f–FW'2V&Ç’Fò&WfVçB6öçFW‡B7F6²Ö—6ÖF6†W2à¢òòGW&–ærÖ÷VçF–ærvRFöâwB¶æ÷rF†R6†–ÆB6öçFW‡B–WB2F†R–ç7Fæ6RFöW6âwBW†—7Bà¢òòvRv–ÆÂ–çfÆ–FFRF†R6†–ÆB6öçFW‡B–âf–æ—6„6Æ746ö×öæVçB‚’&–v‡BgFW"&VæFW&–ærà ¢f"†46öçFW‡C° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢†46öçFW‡BÒG'VS°¢W6„6öçFW‡E&÷f–FW"‡v÷&´–å&öw&W72“°¢ÒVÇ6R°¢†46öçFW‡BÒfÇ6S°¢Ð ¢&W&UFõ&VD6öçFW‡B‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢6öç7G'V7D6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2“°¢Ö÷VçD6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72Â6ö×öæVçBÂæW‡E&÷2Â&VæFW$ÆæW2“°¢&WGW&âf–æ—6„6Æ746ö×öæVçB†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂG'VRÂ†46öçFW‡BÂ&VæFW$ÆæW2“°¢Ð ¢gVæ7F–öâÖ÷VçD–æFWFW&Ö–æFT6ö×öæVçB…ö7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&VæFW$ÆæW2’°¢&W6WE7W7VæFVD7W'&VçDöäÖ÷VçD–äÆVv7”ÖöFR…ö7W'&VçBÂv÷&´–å&öw&W72“°¢f"&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"6öçFW‡C° ¢°¢f"VæÖ6¶VD6öçFW‡BÒvWEVæÖ6¶VD6öçFW‡B‡v÷&´–å&öw&W72Â6ö×öæVçBÂfÇ6R“°¢6öçFW‡BÒvWDÖ6¶VD6öçFW‡B‡v÷&´–å&öw&W72ÂVæÖ6¶VD6öçFW‡B“°¢Ð ¢&W&UFõ&VD6öçFW‡B‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢f"fÇVS°¢f"†4–C° ¢°¢Ö&´6ö×öæVçE&VæFW%7F'FVB‡v÷&´–å&öw&W72“°¢Ð ¢°¢–b„6ö×öæVçBç&÷F÷G—RbbG—Vöb6ö×öæVçBç&÷F÷G—Rç&VæFW"ÓÓÒvgVæ7F–öâr’°¢f"6ö×öæVçDæÖRÒvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’ÇÂuVæ¶æ÷vâs° ¢–b‚F–Ev&ä&÷WD&D6Æ75¶6ö×öæVçDæÖUÒ’°¢W'&÷"‚%F†RÂW2óâ6ö×öæVçBV'2Fò†fR&VæFW"ÖWF†öBÂ'WBFöW6âwBW‡FVæB&V7Bä6ö×öæVçBâ"²uF†—2—2Æ–¶VÇ’Fò6W6RW'&÷'2â6†ævRW2FòW‡FVæB&V7Bä6ö×öæVçB–ç7FVBârÂ6ö×öæVçDæÖRÂ6ö×öæVçDæÖR“° ¢F–Ev&ä&÷WD&D6Æ75¶6ö×öæVçDæÖUÒÒG'VS°¢Ð¢Ð ¢–b‡v÷&´–å&öw&W72æÖöFRb7G&–7DÆVv7”ÖöFR’°¢&V7E7G&–7DÖöFUv&æ–æw2ç&V6÷&DÆVv7”6öçFW‡Ev&æ–ær‡v÷&´–å&öw&W72ÂçVÆÂ“°¢Ð ¢6WD—5&VæFW&–ær‡G'VR“°¢&V7D7W'&VçD÷væW"Cæ7W'&VçBÒv÷&´–å&öw&W73°¢fÇVRÒ&VæFW%v—F„†öö·2†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&÷2Â6öçFW‡BÂ&VæFW$ÆæW2“°¢†4–BÒ6†V6´F–E&VæFW$–D†öö²‚“°¢6WD—5&VæFW&–ær†fÇ6R“°¢Ð ¢°¢Ö&´6ö×öæVçE&VæFW%7F÷VB‚“°¢Òòò&V7BFWeFööÇ2&VG2F†—2fÆrà  ¢v÷&´–å&öw&W72æfÆw2ÃÒW&f÷&ÖVEv÷&³° ¢°¢òò7W÷'Bf÷"ÖöGVÆR6ö×öæVçG2—2FW&V6FVBæB—2&VÖ÷fVB&V†–æBfÆrà¢òòv†WF†W"÷"æ÷B—Bv÷VÆB7&6‚ÆFW"ÂvRvçBFò6†÷rvööBÖW76vR–âDUbf—'7Bà¢–b‡G—VöbfÇVRÓÓÒvö&¦V7BrbbfÇVRÓÒçVÆÂbbG—VöbfÇVRç&VæFW"ÓÓÒvgVæ7F–öârbbfÇVRâBGG—VöbÓÓÒVæFVf–æVB’°¢f"ö6ö×öæVçDæÖRÒvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’ÇÂuVæ¶æ÷vâs° ¢–b‚F–Ev&ä&÷WDÖöGVÆUGFW&ä6ö×öæVçEµö6ö×öæVçDæÖUÒ’°¢W'&÷"‚uF†RÂW2óâ6ö×öæVçBV'2Fò&RgVæ7F–öâ6ö×öæVçBF†B&WGW&ç26Æ72–ç7Fæ6Râr²t6†ævRW2Fò6Æ72F†BW‡FVæG2&V7Bä6ö×öæVçB–ç7FVBâr²$–b–÷R6âwBW6R6Æ72G'’76–væ–ærF†R&÷F÷G—RöâF†RgVæ7F–öâ2v÷&¶&÷VæBâ"²&W2ç&÷F÷G—RÒ&V7Bä6ö×öæVçBç&÷F÷G—VâFöâwBW6Râ'&÷rgVæ7F–öâ6–æ6R—B"²v6ææ÷B&R6ÆÆVBv—F‚æWv'’&V7BârÂö6ö×öæVçDæÖRÂö6ö×öæVçDæÖRÂö6ö×öæVçDæÖR“° ¢F–Ev&ä&÷WDÖöGVÆUGFW&ä6ö×öæVçEµö6ö×öæVçDæÖUÒÒG'VS°¢Ð¢Ð¢Ð ¢–b‚òò'VâF†W6R6†V6·2–â&öGV7F–öâöæÇ’–bF†RfÆr—2öfbà¢òòWfVçGVÆÇ’vRvÆÂFVÆWFRF†—2'&æ6‚ÇFövWF†W"à¢G—VöbfÇVRÓÓÒvö&¦V7BrbbfÇVRÓÒçVÆÂbbG—VöbfÇVRç&VæFW"ÓÓÒvgVæ7F–öârbbfÇVRâBGG—VöbÓÓÒVæFVf–æVB’°¢°¢f"ö6ö×öæVçDæÖS"ÒvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’ÇÂuVæ¶æ÷vâs° ¢–b‚F–Ev&ä&÷WDÖöGVÆUGFW&ä6ö×öæVçEµö6ö×öæVçDæÖS%Ò’°¢W'&÷"‚uF†RÂW2óâ6ö×öæVçBV'2Fò&RgVæ7F–öâ6ö×öæVçBF†B&WGW&ç26Æ72–ç7Fæ6Râr²t6†ævRW2Fò6Æ72F†BW‡FVæG2&V7Bä6ö×öæVçB–ç7FVBâr²$–b–÷R6âwBW6R6Æ72G'’76–væ–ærF†R&÷F÷G—RöâF†RgVæ7F–öâ2v÷&¶&÷VæBâ"²&W2ç&÷F÷G—RÒ&V7Bä6ö×öæVçBç&÷F÷G—VâFöâwBW6Râ'&÷rgVæ7F–öâ6–æ6R—B"²v6ææ÷B&R6ÆÆVBv—F‚æWv'’&V7BârÂö6ö×öæVçDæÖS"Âö6ö×öæVçDæÖS"Âö6ö×öæVçDæÖS"“° ¢F–Ev&ä&÷WDÖöGVÆUGFW&ä6ö×öæVçEµö6ö×öæVçDæÖS%ÒÒG'VS°¢Ð¢Òòò&ö6VVBVæFW"F†R77V×F–öâF†BF†—2—26Æ72–ç7Fæ6P  ¢v÷&´–å&öw&W72çFrÒ6Æ746ö×öæVçC²òòF‡&÷r÷WBç’†öö·2F†BvW&RW6VBà ¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢v÷&´–å&öw&W72çWFFUVWVRÒçVÆÃ²òòW6‚6öçFW‡B&÷f–FW'2V&Ç’Fò&WfVçB6öçFW‡B7F6²Ö—6ÖF6†W2à¢òòGW&–ærÖ÷VçF–ærvRFöâwB¶æ÷rF†R6†–ÆB6öçFW‡B–WB2F†R–ç7Fæ6RFöW6âwBW†—7Bà¢òòvRv–ÆÂ–çfÆ–FFRF†R6†–ÆB6öçFW‡B–âf–æ—6„6Æ746ö×öæVçB‚’&–v‡BgFW"&VæFW&–ærà ¢f"†46öçFW‡BÒfÇ6S° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢†46öçFW‡BÒG'VS°¢W6„6öçFW‡E&÷f–FW"‡v÷&´–å&öw&W72“°¢ÒVÇ6R°¢†46öçFW‡BÒfÇ6S°¢Ð ¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒfÇVRç7FFRÓÒçVÆÂbbfÇVRç7FFRÓÒVæFVf–æVBòfÇVRç7FFR¢çVÆÃ°¢–æ—F–Æ—¦UWFFUVWVR‡v÷&´–å&öw&W72“°¢F÷D6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72ÂfÇVR“°¢Ö÷VçD6Æ74–ç7Fæ6R‡v÷&´–å&öw&W72Â6ö×öæVçBÂ&÷2Â&VæFW$ÆæW2“°¢&WGW&âf–æ—6„6Æ746ö×öæVçB†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂG'VRÂ†46öçFW‡BÂ&VæFW$ÆæW2“°¢ÒVÇ6R°¢òò&ö6VVBVæFW"F†R77V×F–öâF†BF†—2—2gVæ7F–öâ6ö×öæVç@¢v÷&´–å&öw&W72çFrÒgVæ7F–öä6ö×öæVçC° ¢° ¢–b‚v÷&´–å&öw&W72æÖöFRb7G&–7DÆVv7”ÖöFR’°¢6WD—57G&–7DÖöFTf÷$FWgFööÇ2‡G'VR“° ¢G'’°¢fÇVRÒ&VæFW%v—F„†öö·2†çVÆÂÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&÷2Â6öçFW‡BÂ&VæFW$ÆæW2“°¢†4–BÒ6†V6´F–E&VæFW$–D†öö²‚“°¢Òf–æÆÇ’°¢6WD—57G&–7DÖöFTf÷$FWgFööÇ2†fÇ6R“°¢Ð¢Ð¢Ð ¢–b†vWD—4‡–G&F–ær‚’bb†4–B’°¢W6„ÖFW&–Æ—¦VEG&VT–B‡v÷&´–å&öw&W72“°¢Ð ¢&V6öæ6–ÆT6†–ÆG&Vâ†çVÆÂÂv÷&´–å&öw&W72ÂfÇVRÂ&VæFW$ÆæW2“° ¢°¢fÆ–FFTgVæ7F–öä6ö×öæVçD–äFWb‡v÷&´–å&öw&W72Â6ö×öæVçB“°¢Ð ¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð¢Ð ¢gVæ7F–öâfÆ–FFTgVæ7F–öä6ö×öæVçD–äFWb‡v÷&´–å&öw&W72Â6ö×öæVçB’°¢°¢–b„6ö×öæVçB’°¢–b„6ö×öæVçBæ6†–ÆD6öçFW‡EG—W2’°¢W'&÷"‚rW2‚âââ“¢6†–ÆD6öçFW‡EG—W26ææ÷B&RFVf–æVBöâgVæ7F–öâ6ö×öæVçBârÂ6ö×öæVçBæF—7Æ”æÖRÇÂ6ö×öæVçBææÖRÇÂt6ö×öæVçBr“°¢Ð¢Ð ¢–b‡v÷&´–å&öw&W72ç&VbÓÒçVÆÂ’°¢f"–æfòÒrs°¢f"÷væW$æÖRÒvWD7W'&VçDf–&W$÷væW$æÖT–äFWd÷$çVÆÂ‚“° ¢–b†÷væW$æÖR’°¢–æfò³ÒuÆåÆä6†V6²F†R&VæFW"ÖWF†öBöbr²÷væW$æÖR²vâs°¢Ð ¢f"v&æ–æt¶W’Ò÷væW$æÖRÇÂrs°¢f"FV'Vu6÷W&6RÒv÷&´–å&öw&W72åöFV'Vu6÷W&6S° ¢–b†FV'Vu6÷W&6R’°¢v&æ–æt¶W’ÒFV'Vu6÷W&6Ræf–ÆTæÖR²s¢r²FV'Vu6÷W&6RæÆ–æTçVÖ&W#°¢Ð ¢–b‚F–Ev&ä&÷WDgVæ7F–öå&Vg5·v&æ–æt¶W•Ò’°¢F–Ev&ä&÷WDgVæ7F–öå&Vg5·v&æ–æt¶W•ÒÒG'VS° ¢W'&÷"‚tgVæ7F–öâ6ö×öæVçG26ææ÷B&Rv—fVâ&Vg2âr²tGFV×G2Fò66W72F†—2&Vbv–ÆÂf–Ââr²tF–B–÷RÖVâFòW6R&V7Bæf÷'v&E&Vb‚“òW2rÂ–æfò“°¢Ð¢Ð ¢–b‚6ö×öæVçBæFVfVÇE&÷2ÓÒVæFVf–æVB’°¢f"6ö×öæVçDæÖRÒvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’ÇÂuVæ¶æ÷vâs° ¢–b‚F–Ev&ä&÷WDFVfVÇE&÷4öägVæ7F–öä6ö×öæVçE¶6ö×öæVçDæÖUÒ’°¢W'&÷"‚rW3¢7W÷'Bf÷"FVfVÇE&÷2v–ÆÂ&R&VÖ÷fVBg&öÒgVæ7F–öâ6ö×öæVçG2r²v–âgWGW&RÖ¦÷"&VÆV6RâW6R¦f67&—BFVfVÇB&ÖWFW'2–ç7FVBârÂ6ö×öæVçDæÖR“° ¢F–Ev&ä&÷WDFVfVÇE&÷4öägVæ7F–öä6ö×öæVçE¶6ö×öæVçDæÖUÒÒG'VS°¢Ð¢Ð ¢–b‡G—Vöb6ö×öæVçBævWDFW&—fVE7FFTg&öÕ&÷2ÓÓÒvgVæ7F–öâr’°¢f"ö6ö×öæVçDæÖS2ÒvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’ÇÂuVæ¶æ÷vâs° ¢–b‚F–Ev&ä&÷WDvWDFW&—fVE7FFTöägVæ7F–öä6ö×öæVçEµö6ö×öæVçDæÖS5Ò’°¢W'&÷"‚rW3¢gVæ7F–öâ6ö×öæVçG2Fòæ÷B7W÷'BvWDFW&—fVE7FFTg&öÕ&÷2ârÂö6ö×öæVçDæÖS2“° ¢F–Ev&ä&÷WDvWDFW&—fVE7FFTöägVæ7F–öä6ö×öæVçEµö6ö×öæVçDæÖS5ÒÒG'VS°¢Ð¢Ð ¢–b‡G—Vöb6ö×öæVçBæ6öçFW‡EG—RÓÓÒvö&¦V7Brbb6ö×öæVçBæ6öçFW‡EG—RÓÒçVÆÂ’°¢f"ö6ö×öæVçDæÖSBÒvWD6ö×öæVçDæÖTg&öÕG—R„6ö×öæVçB’ÇÂuVæ¶æ÷vâs° ¢–b‚F–Ev&ä&÷WD6öçFW‡EG—TöägVæ7F–öä6ö×öæVçEµö6ö×öæVçDæÖSEÒ’°¢W'&÷"‚rW3¢gVæ7F–öâ6ö×öæVçG2Fòæ÷B7W÷'B6öçFW‡EG—RârÂö6ö×öæVçDæÖSB“° ¢F–Ev&ä&÷WD6öçFW‡EG—TöägVæ7F–öä6ö×öæVçEµö6ö×öæVçDæÖSEÒÒG'VS°¢Ð¢Ð¢Ð¢Ð ¢f"5U5TäDTEôÔ$´U"Ò°¢FV‡–G&FVC¢çVÆÂÀ¢G&VT6öçFW‡C¢çVÆÂÀ¢&WG'”ÆæS¢æôÆæP¢Ó° ¢gVæ7F–öâÖ÷VçE7W7Vç6Töfg67&VVå7FFR‡&VæFW$ÆæW2’°¢&WGW&â°¢&6TÆæW3¢&VæFW$ÆæW2À¢66†UööÃ¢vWE7W7VæFVD66†R‚’À¢G&ç6—F–öç3¢çVÆÀ¢Ó°¢Ð ¢gVæ7F–öâWFFU7W7Vç6Töfg67&VVå7FFR‡&Wdöfg67&VVå7FFRÂ&VæFW$ÆæW2’°¢f"66†UööÂÒçVÆÃ° ¢&WGW&â°¢&6TÆæW3¢ÖW&vTÆæW2‡&Wdöfg67&VVå7FFRæ&6TÆæW2Â&VæFW$ÆæW2’À¢66†UööÃ¢66†UööÂÀ¢G&ç6—F–öç3¢&Wdöfg67&VVå7FFRçG&ç6—F–öç0¢Ó°¢ÒòòDôDó¢&ö&&Ç’6†÷VÆB–æÆ–æRF†—2&6°  ¢gVæ7F–öâ6†÷VÆE&VÖ–äöäfÆÆ&6²‡7W7Vç6T6öçFW‡BÂ7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢òò–bvRw&RÇ&VG’6†÷v–ærfÆÆ&6²ÂF†W&R&R66W2v†W&RvRæVVBFð¢òò&VÖ–âöâF†BfÆÆ&6²&Vv&FÆW72öbv†WF†W"F†R6öçFVçB†2&W6öÇfVBà¢òòf÷"W†×ÆRÂ7W7Vç6TÆ—7B6ö÷&F–æFW2v†VâæW7FVB6öçFVçBV'2à¢–b†7W'&VçBÓÒçVÆÂ’°¢f"7W7Vç6U7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS° ¢–b‡7W7Vç6U7FFRÓÓÒçVÆÂ’°¢òò7W'&VçFÇ’6†÷v–ær6öçFVçBâFöâwB†–FR—BÂWfVâ–bf÷&6U7W7Vç6TfÆÆ&6°¢òò—2G'VRâÖ÷&R&V6—6RæÖRÖ–v‡B&R$f÷&6U&VÖ–å7W7Vç6TfÆÆ&6²"à¢òòæ÷FS¢F†—2—2f7F÷&–ær6ÖVÆÂâ6âwB&VÖ–âöâfÆÆ&6²–bF†W&Rw0¢òòæòfÆÆ&6²Fò&VÖ–âöâà¢&WGW&âfÇ6S°¢Ð¢Òòòæ÷B7W'&VçFÇ’6†÷v–ær6öçFVçBâ6öç7VÇBF†R7W7Vç6R6öçFW‡Bà  ¢&WGW&â†57W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡BÂf÷&6U7W7Vç6TfÆÆ&6²“°¢Ð ¢gVæ7F–öâvWE&VÖ–æ–æuv÷&´–å&–Ö'•G&VR†7W'&VçBÂ&VæFW$ÆæW2’°¢òòDôDó¢6†÷VÆBæ÷B&VÖ÷fR&VæFW"ÆæW2F†BvW&R–ævVBGW&–ærF†—2&VæFW ¢&WGW&â&VÖ÷fTÆæW2†7W'&VçBæ6†–ÆDÆæW2Â&VæFW$ÆæW2“°¢Ð ¢gVæ7F–öâWFFU7W7Vç6T6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3²òòF†—2—2W6VB'’FWeFööÇ2Fòf÷&6R&÷VæF'’Fò7W7VæBà ¢°¢–b‡6†÷VÆE7W7VæB‡v÷&´–å&öw&W72’’°¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢Ð¢Ð ¢f"7W7Vç6T6öçFW‡BÒ7W7Vç6U7F6´7W'6÷"æ7W'&VçC°¢f"6†÷tfÆÆ&6²ÒfÇ6S°¢f"F–E7W7VæBÒ‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÒæôfÆw3° ¢–b†F–E7W7VæBÇÂ6†÷VÆE&VÖ–äöäfÆÆ&6²‡7W7Vç6T6öçFW‡BÂ7W'&VçB’’°¢òò6öÖWF†–ær–âF†—2&÷VæF'’w27V'G&VRÇ&VG’7W7VæFVBâ7v—F6‚Fð¢òò&VæFW&–ærF†RfÆÆ&6²6†–ÆG&Vâà¢6†÷tfÆÆ&6²ÒG'VS°¢v÷&´–å&öw&W72æfÆw2cÒäF–D6GW&S°¢ÒVÇ6R°¢òòGFV×F–ærF†RÖ–â6öçFVç@¢–b†7W'&VçBÓÓÒçVÆÂÇÂ7W'&VçBæÖVÖö—¦VE7FFRÓÒçVÆÂ’°¢òòF†—2—2æWrÖ÷VçB÷"F†—2&÷VæF'’—2Ç&VG’6†÷v–ærfÆÆ&6²7FFRà¢òòÖ&²F†—27V'G&VR6öçFW‡B2†f–ærBÆV7BöæR–çf—6–&ÆR&VçBF†B6÷VÆ@¢òò†æFÆRF†RfÆÆ&6²7FFRà¢òòfö–FVB&÷VæF&–W2&Ræ÷B6öç6–FW&VB6–æ6RF†W’6ææ÷B†æFÆR&VfW'&VBfÆÆ&6²7FFW2à¢°¢7W7Vç6T6öçFW‡BÒFE7V'G&VU7W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡BÂ–çf—6–&ÆU&VçE7W7Vç6T6öçFW‡B“°¢Ð¢Ð¢Ð ¢7W7Vç6T6öçFW‡BÒ6WDFVfVÇE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡B“°¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â7W7Vç6T6öçFW‡B“²òòô²ÂF†RæW‡B'B—26öægW6–ærâvRw&R&÷WBFò&V6öæ6–ÆRF†R7W7Vç6P¢òò&÷VæF'’w26†–ÆG&VââF†—2–çföÇfW26öÖR7W7FöÒ&V6öæ6–Æ–F–öâÆöv–2âGvð¢òòÖ–â&V6öç2F†—2—26ò6ö×Æ–6FVBà¢òð¢òòf—'7BÂÆVv7’ÖöFR†2F–ffW&VçB6VÖçF–72f÷"&6·v&G26ö×F–&–Æ—G’âF†P¢òò&–Ö'’G&VRv–ÆÂ6öÖÖ—B–ââ–æ6öç6—7FVçB7FFRÂ6òv†VâvRFòF†P¢òò6V6öæB72Fò&VæFW"F†RfÆÆ&6²ÂvRFò6öÖRW†6VVF–ævÇ’ÂV‚Â6ÆWfW ¢òò†6·2FòÖ¶RF†Bæ÷BF÷FÆÇ’'&V²âÆ–¶RG&ç6fW'&–ærVffV7G2æ@¢òòFVÆWF–öç2g&öÒ†–FFVâG&VRâ–â6öæ7W'&VçBÖöFRÂ—Bw2×V6‚6–×ÆW"À¢òò&V6W6RvR&–Æ÷WBöâF†R&–Ö'’G&VR6ö×ÆWFVÇ’æBÆVfR—B–â—G2öÆ@¢òò7FFRÂæòVffV7G2â6ÖR2v†BvRFòf÷"öfg67&VVâ†W†6WBF†@¢òòöfg67&VVâFöW6âwB†fRF†Rf—'7B&VæFW"72’à¢òð¢òò6V6öæB—2‡–G&F–öââGW&–ær‡–G&F–öâÂF†R7W7Vç6Rf–&W"†26Æ–v‡FÇ¢òòF–ffW&VçBÆ–÷WBÂv†W&RF†R6†–ÆBö–çG2FòFV‡–G&FVBg&vÖVçBÂv†–6€¢òò6öçF–ç2F†RDôÒ&VæFW&VB'’F†R6W'fW"à¢òð¢òòF†—&BÂWfVâ–b–÷R6WBÆÂF†B6–FRÂ7W7Vç6R—2Æ–¶RW'&÷"&÷VæF&–W2–à¢òòF†BvRf—'7BvRG'’Fò&VæFW"öæRG&VRÂæB–bF†Bf–Ç2ÂvR&VæFW"v–à¢òòæB7v—F6‚FòF–ffW&VçBG&VRâÆ–¶RG'’ö6F6‚&Æö6²â6òvR†fRFòG&6°¢òòv†–6‚'&æ6‚vRw&R7W'&VçFÇ’&VæFW&–ærâ–FVÆÇ’vRv÷VÆBÖöFVÂF†—2W6–æp¢òò7F6²à ¢–b†7W'&VçBÓÓÒçVÆÂ’°¢òò–æ—F–ÂÖ÷Vç@¢òò7V6–ÂF‚f÷"‡–G&F–öà¢òò–bvRw&R7W'&VçFÇ’‡–G&F–ærÂG'’Fò‡–G&FRF†—2&÷VæF'’à¢G'•Fô6Æ–ÔæW‡D‡–G&F&ÆT–ç7Fæ6R‡v÷&´–å&öw&W72“²òòF†—26÷VÆBwfR&VVâFV‡–G&FVB7W7Vç6R6ö×öæVçBà ¢f"7W7Vç6U7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS° ¢–b‡7W7Vç6U7FFRÓÒçVÆÂ’°¢f"FV‡–G&FVBÒ7W7Vç6U7FFRæFV‡–G&FVC° ¢–b†FV‡–G&FVBÓÒçVÆÂ’°¢&WGW&âÖ÷VçDFV‡–G&FVE7W7Vç6T6ö×öæVçB‡v÷&´–å&öw&W72ÂFV‡–G&FVB“°¢Ð¢Ð ¢f"æW‡E&–Ö'”6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"æW‡DfÆÆ&6´6†–ÆG&VâÒæW‡E&÷2æfÆÆ&6³° ¢–b‡6†÷tfÆÆ&6²’°¢f"fÆÆ&6´g&vÖVçBÒÖ÷VçE7W7Vç6TfÆÆ&6´6†–ÆG&Vâ‡v÷&´–å&öw&W72ÂæW‡E&–Ö'”6†–ÆG&VâÂæW‡DfÆÆ&6´6†–ÆG&VâÂ&VæFW$ÆæW2“°¢f"&–Ö'”6†–ÆDg&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC°¢&–Ö'”6†–ÆDg&vÖVçBæÖVÖö—¦VE7FFRÒÖ÷VçE7W7Vç6Töfg67&VVå7FFR‡&VæFW$ÆæW2“°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ5U5TäDTEôÔ$´U#° ¢&WGW&âfÆÆ&6´g&vÖVçC°¢ÒVÇ6R°¢&WGW&âÖ÷VçE7W7Vç6U&–Ö'”6†–ÆG&Vâ‡v÷&´–å&öw&W72ÂæW‡E&–Ö'”6†–ÆG&Vâ“°¢Ð¢ÒVÇ6R°¢òòF†—2—2âWFFRà¢òò7V6–ÂF‚f÷"‡–G&F–öà¢f"&We7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS° ¢–b‡&We7FFRÓÒçVÆÂ’°¢f"öFV‡–G&FVBÒ&We7FFRæFV‡–G&FVC° ¢–b…öFV‡–G&FVBÓÒçVÆÂ’°¢&WGW&âWFFTFV‡–G&FVE7W7Vç6T6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72ÂF–E7W7VæBÂæW‡E&÷2ÂöFV‡–G&FVBÂ&We7FFRÂ&VæFW$ÆæW2“°¢Ð¢Ð ¢–b‡6†÷tfÆÆ&6²’°¢f"öæW‡DfÆÆ&6´6†–ÆG&VâÒæW‡E&÷2æfÆÆ&6³°¢f"öæW‡E&–Ö'”6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"fÆÆ&6´6†–ÆDg&vÖVçBÒWFFU7W7Vç6TfÆÆ&6´6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂöæW‡E&–Ö'”6†–ÆG&VâÂöæW‡DfÆÆ&6´6†–ÆG&VâÂ&VæFW$ÆæW2“°¢f"÷&–Ö'”6†–ÆDg&vÖVçC"Òv÷&´–å&öw&W72æ6†–ÆC°¢f"&Wdöfg67&VVå7FFRÒ7W'&VçBæ6†–ÆBæÖVÖö—¦VE7FFS°¢÷&–Ö'”6†–ÆDg&vÖVçC"æÖVÖö—¦VE7FFRÒ&Wdöfg67&VVå7FFRÓÓÒçVÆÂòÖ÷VçE7W7Vç6Töfg67&VVå7FFR‡&VæFW$ÆæW2’¢WFFU7W7Vç6Töfg67&VVå7FFR‡&Wdöfg67&VVå7FFRÂ&VæFW$ÆæW2“° ¢÷&–Ö'”6†–ÆDg&vÖVçC"æ6†–ÆDÆæW2ÒvWE&VÖ–æ–æuv÷&´–å&–Ö'•G&VR†7W'&VçBÂ&VæFW$ÆæW2“°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ5U5TäDTEôÔ$´U#°¢&WGW&âfÆÆ&6´6†–ÆDg&vÖVçC°¢ÒVÇ6R°¢f"öæW‡E&–Ö'”6†–ÆG&Vã"ÒæW‡E&÷2æ6†–ÆG&Vã° ¢f"÷&–Ö'”6†–ÆDg&vÖVçC2ÒWFFU7W7Vç6U&–Ö'”6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂöæW‡E&–Ö'”6†–ÆG&Vã"Â&VæFW$ÆæW2“° ¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢&WGW&â÷&–Ö'”6†–ÆDg&vÖVçC3°¢Ð¢Ð¢Ð ¢gVæ7F–öâÖ÷VçE7W7Vç6U&–Ö'”6†–ÆG&Vâ‡v÷&´–å&öw&W72Â&–Ö'”6†–ÆG&VâÂ&VæFW$ÆæW2’°¢f"ÖöFRÒv÷&´–å&öw&W72æÖöFS°¢f"&–Ö'”6†–ÆE&÷2Ò°¢ÖöFS¢wf—6–&ÆRrÀ¢6†–ÆG&Vã¢&–Ö'”6†–ÆG&Và¢Ó°¢f"&–Ö'”6†–ÆDg&vÖVçBÒÖ÷VçEv÷&´–å&öw&W74öfg67&VVäf–&W"‡&–Ö'”6†–ÆE&÷2ÂÖöFR“°¢&–Ö'”6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢v÷&´–å&öw&W72æ6†–ÆBÒ&–Ö'”6†–ÆDg&vÖVçC°¢&WGW&â&–Ö'”6†–ÆDg&vÖVçC°¢Ð ¢gVæ7F–öâÖ÷VçE7W7Vç6TfÆÆ&6´6†–ÆG&Vâ‡v÷&´–å&öw&W72Â&–Ö'”6†–ÆG&VâÂfÆÆ&6´6†–ÆG&VâÂ&VæFW$ÆæW2’°¢f"ÖöFRÒv÷&´–å&öw&W72æÖöFS°¢f"&öw&W76VE&–Ö'”g&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC°¢f"&–Ö'”6†–ÆE&÷2Ò°¢ÖöFS¢v†–FFVârÀ¢6†–ÆG&Vã¢&–Ö'”6†–ÆG&Và¢Ó°¢f"&–Ö'”6†–ÆDg&vÖVçC°¢f"fÆÆ&6´6†–ÆDg&vÖVçC° ¢–b‚†ÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFRbb&öw&W76VE&–Ö'”g&vÖVçBÓÒçVÆÂ’°¢òò–âÆVv7’ÖöFRÂvR6öÖÖ—BF†R&–Ö'’G&VR2–b—B7V66W76gVÆÇ¢òò6ö×ÆWFVBÂWfVâF†÷Vv‚—Bw2–ââ–æ6öç6—7FVçB7FFRà¢&–Ö'”6†–ÆDg&vÖVçBÒ&öw&W76VE&–Ö'”g&vÖVçC°¢&–Ö'”6†–ÆDg&vÖVçBæ6†–ÆDÆæW2ÒæôÆæW3°¢&–Ö'”6†–ÆDg&vÖVçBçVæF–æu&÷2Ò&–Ö'”6†–ÆE&÷3° ¢–b‚v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’°¢òò&W6WBF†RGW&F–öç2g&öÒF†Rf—'7B726òF†W’&VâwB–æ6ÇVFVB–âF†P¢òòf–æÂÖ÷VçG2âF†—26VV×26÷VçFW&–çGV—F—fRÂ6–æ6RvRw&R–çFVçF–öæÆÇ¢òòæ÷BÖV7W&–ær'BöbF†R&VæFW"†6RÂ'WBF†—2Ö¶W2—BÖF6‚v†BvP¢òòFò–â6öæ7W'&VçBÖöFRà¢&–Ö'”6†–ÆDg&vÖVçBæ7GVÄGW&F–öâÒ°¢&–Ö'”6†–ÆDg&vÖVçBæ7GVÅ7F'EF–ÖRÒÓ°¢&–Ö'”6†–ÆDg&vÖVçBç6VÆd&6TGW&F–öâÒ°¢&–Ö'”6†–ÆDg&vÖVçBçG&VT&6TGW&F–öâÒ°¢Ð ¢fÆÆ&6´6†–ÆDg&vÖVçBÒ7&VFTf–&W$g&öÔg&vÖVçB†fÆÆ&6´6†–ÆG&VâÂÖöFRÂ&VæFW$ÆæW2ÂçVÆÂ“°¢ÒVÇ6R°¢&–Ö'”6†–ÆDg&vÖVçBÒÖ÷VçEv÷&´–å&öw&W74öfg67&VVäf–&W"‡&–Ö'”6†–ÆE&÷2ÂÖöFR“°¢fÆÆ&6´6†–ÆDg&vÖVçBÒ7&VFTf–&W$g&öÔg&vÖVçB†fÆÆ&6´6†–ÆG&VâÂÖöFRÂ&VæFW$ÆæW2ÂçVÆÂ“°¢Ð ¢&–Ö'”6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢fÆÆ&6´6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢&–Ö'”6†–ÆDg&vÖVçBç6–&Æ–ærÒfÆÆ&6´6†–ÆDg&vÖVçC°¢v÷&´–å&öw&W72æ6†–ÆBÒ&–Ö'”6†–ÆDg&vÖVçC°¢&WGW&âfÆÆ&6´6†–ÆDg&vÖVçC°¢Ð ¢gVæ7F–öâÖ÷VçEv÷&´–å&öw&W74öfg67&VVäf–&W"†öfg67&VVå&÷2ÂÖöFRÂ&VæFW$ÆæW2’°¢òòF†R&÷2&wVÖVçBFò7&VFTf–&W$g&öÔöfg67&VVæ—2ç–G—VBÂ6òvRW6P¢òòF†—2w&W"gVæ7F–öâFò6öç7G&–â—Bà¢&WGW&â7&VFTf–&W$g&öÔöfg67&VVâ†öfg67&VVå&÷2ÂÖöFRÂæôÆæW2ÂçVÆÂ“°¢Ð ¢gVæ7F–öâWFFUv÷&´–å&öw&W74öfg67&VVäf–&W"†7W'&VçBÂöfg67&VVå&÷2’°¢òòF†R&÷2&wVÖVçBFò7&VFUv÷&´–å&öw&W76—2ç–G—VBÂ6òvRW6RF†—0¢òòw&W"gVæ7F–öâFò6öç7G&–â—Bà¢&WGW&â7&VFUv÷&´–å&öw&W72†7W'&VçBÂöfg67&VVå&÷2“°¢Ð ¢gVæ7F–öâWFFU7W7Vç6U&–Ö'”6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72Â&–Ö'”6†–ÆG&VâÂ&VæFW$ÆæW2’°¢f"7W'&VçE&–Ö'”6†–ÆDg&vÖVçBÒ7W'&VçBæ6†–ÆC°¢f"7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçBÒ7W'&VçE&–Ö'”6†–ÆDg&vÖVçBç6–&Æ–æs°¢f"&–Ö'”6†–ÆDg&vÖVçBÒWFFUv÷&´–å&öw&W74öfg67&VVäf–&W"†7W'&VçE&–Ö'”6†–ÆDg&vÖVçBÂ°¢ÖöFS¢wf—6–&ÆRrÀ¢6†–ÆG&Vã¢&–Ö'”6†–ÆG&Và¢Ò“° ¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢&–Ö'”6†–ÆDg&vÖVçBæÆæW2Ò&VæFW$ÆæW3°¢Ð ¢&–Ö'”6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢&–Ö'”6†–ÆDg&vÖVçBç6–&Æ–ærÒçVÆÃ° ¢–b†7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçBÓÒçVÆÂ’°¢òòFVÆWFRF†RfÆÆ&6²6†–ÆBg&vÖVç@¢f"FVÆWF–öç2Òv÷&´–å&öw&W72æFVÆWF–öç3° ¢–b†FVÆWF–öç2ÓÓÒçVÆÂ’°¢v÷&´–å&öw&W72æFVÆWF–öç2Ò¶7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçEÓ°¢v÷&´–å&öw&W72æfÆw2ÃÒ6†–ÆDFVÆWF–öã°¢ÒVÇ6R°¢FVÆWF–öç2çW6‚†7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçB“°¢Ð¢Ð ¢v÷&´–å&öw&W72æ6†–ÆBÒ&–Ö'”6†–ÆDg&vÖVçC°¢&WGW&â&–Ö'”6†–ÆDg&vÖVçC°¢Ð ¢gVæ7F–öâWFFU7W7Vç6TfÆÆ&6´6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72Â&–Ö'”6†–ÆG&VâÂfÆÆ&6´6†–ÆG&VâÂ&VæFW$ÆæW2’°¢f"ÖöFRÒv÷&´–å&öw&W72æÖöFS°¢f"7W'&VçE&–Ö'”6†–ÆDg&vÖVçBÒ7W'&VçBæ6†–ÆC°¢f"7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçBÒ7W'&VçE&–Ö'”6†–ÆDg&vÖVçBç6–&Æ–æs°¢f"&–Ö'”6†–ÆE&÷2Ò°¢ÖöFS¢v†–FFVârÀ¢6†–ÆG&Vã¢&–Ö'”6†–ÆG&Và¢Ó°¢f"&–Ö'”6†–ÆDg&vÖVçC° ¢–b‚òò–âÆVv7’ÖöFRÂvR6öÖÖ—BF†R&–Ö'’G&VR2–b—B7V66W76gVÆÇ¢òò6ö×ÆWFVBÂWfVâF†÷Vv‚—Bw2–ââ–æ6öç6—7FVçB7FFRà¢†ÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFRbbòòÖ¶R7W&RvRw&RöâF†R6V6öæB72Â’æRâF†R&–Ö'’6†–ÆBg&vÖVçBv0¢òòÇ&VG’6ÆöæVBâ–âÆVv7’ÖöFRÂF†RöæÇ’66Rv†W&RF†—2—6âwBG'VR—0¢òòv†VâFWeFööÇ2f÷&6W2W2FòF—7Æ’fÆÆ&6³²vR6¶—F†Rf—'7B&VæFW ¢òò72VçF—&VÇ’æBvò7G&–v‡BFò&VæFW&–ærF†RfÆÆ&6²â„–â6öæ7W'&Vç@¢òòÖöFRÂ7W7Vç6TÆ—7B6âÇ6òG&–vvW"F†—266Væ&–òÂ'WBF†—2—2ÆVv7’Ð¢òòöæÇ’6öFWF‚â¢v÷&´–å&öw&W72æ6†–ÆBÓÒ7W'&VçE&–Ö'”6†–ÆDg&vÖVçB’°¢f"&öw&W76VE&–Ö'”g&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC°¢&–Ö'”6†–ÆDg&vÖVçBÒ&öw&W76VE&–Ö'”g&vÖVçC°¢&–Ö'”6†–ÆDg&vÖVçBæ6†–ÆDÆæW2ÒæôÆæW3°¢&–Ö'”6†–ÆDg&vÖVçBçVæF–æu&÷2Ò&–Ö'”6†–ÆE&÷3° ¢–b‚v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’°¢òò&W6WBF†RGW&F–öç2g&öÒF†Rf—'7B726òF†W’&VâwB–æ6ÇVFVB–âF†P¢òòf–æÂÖ÷VçG2âF†—26VV×26÷VçFW&–çGV—F—fRÂ6–æ6RvRw&R–çFVçF–öæÆÇ¢òòæ÷BÖV7W&–ær'BöbF†R&VæFW"†6RÂ'WBF†—2Ö¶W2—BÖF6‚v†BvP¢òòFò–â6öæ7W'&VçBÖöFRà¢&–Ö'”6†–ÆDg&vÖVçBæ7GVÄGW&F–öâÒ°¢&–Ö'”6†–ÆDg&vÖVçBæ7GVÅ7F'EF–ÖRÒÓ°¢&–Ö'”6†–ÆDg&vÖVçBç6VÆd&6TGW&F–öâÒ7W'&VçE&–Ö'”6†–ÆDg&vÖVçBç6VÆd&6TGW&F–öã°¢&–Ö'”6†–ÆDg&vÖVçBçG&VT&6TGW&F–öâÒ7W'&VçE&–Ö'”6†–ÆDg&vÖVçBçG&VT&6TGW&F–öã°¢ÒòòF†RfÆÆ&6²f–&W"v2FFVB2FVÆWF–öâGW&–ærF†Rf—'7B72à¢òò†÷vWfW"Â6–æ6RvRw&Rvö–ærFò&VÖ–âöâF†RfÆÆ&6²ÂvRæòÆöævW"vç@¢òòFòFVÆWFR—Bà  ¢v÷&´–å&öw&W72æFVÆWF–öç2ÒçVÆÃ°¢ÒVÇ6R°¢&–Ö'”6†–ÆDg&vÖVçBÒWFFUv÷&´–å&öw&W74öfg67&VVäf–&W"†7W'&VçE&–Ö'”6†–ÆDg&vÖVçBÂ&–Ö'”6†–ÆE&÷2“²òò6–æ6RvRw&R&WW6–ær7W'&VçBG&VRÂvRæVVBFò&WW6RF†RfÆw2ÂFöòà¢òò…vRFöâwBFòF†—2–âÆVv7’ÖöFRÂ&V6W6R–âÆVv7’ÖöFRvRFöâwB&R×W6P¢òòF†R7W'&VçBG&VS²6VR&Wf–÷W2'&æ6‚â ¢&–Ö'”6†–ÆDg&vÖVçBç7V'G&VTfÆw2Ò7W'&VçE&–Ö'”6†–ÆDg&vÖVçBç7V'G&VTfÆw2b7FF–4Ö6³°¢Ð ¢f"fÆÆ&6´6†–ÆDg&vÖVçC° ¢–b†7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçBÓÒçVÆÂ’°¢fÆÆ&6´6†–ÆDg&vÖVçBÒ7&VFUv÷&´–å&öw&W72†7W'&VçDfÆÆ&6´6†–ÆDg&vÖVçBÂfÆÆ&6´6†–ÆG&Vâ“°¢ÒVÇ6R°¢fÆÆ&6´6†–ÆDg&vÖVçBÒ7&VFTf–&W$g&öÔg&vÖVçB†fÆÆ&6´6†–ÆG&VâÂÖöFRÂ&VæFW$ÆæW2ÂçVÆÂ“²òòæVVG2Æ6VÖVçBVffV7B&V6W6RF†R&VçB‡F†R7W7Vç6R&÷VæF'’’Ç&VG¢òòÖ÷VçFVB'WBF†—2—2æWrf–&W"à ¢fÆÆ&6´6†–ÆDg&vÖVçBæfÆw2ÃÒÆ6VÖVçC°¢Ð ¢fÆÆ&6´6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢&–Ö'”6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢&–Ö'”6†–ÆDg&vÖVçBç6–&Æ–ærÒfÆÆ&6´6†–ÆDg&vÖVçC°¢v÷&´–å&öw&W72æ6†–ÆBÒ&–Ö'”6†–ÆDg&vÖVçC°¢&WGW&âfÆÆ&6´6†–ÆDg&vÖVçC°¢Ð ¢gVæ7F–öâ&WG'•7W7Vç6T6ö×öæVçEv—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2Â&V6÷fW&&ÆTW'&÷"’°¢òòfÆÆ–ær&6²Fò6Æ–VçB&VæFW&–ærâ&V6W6RF†—2†2W&f÷&Öæ6P¢òò–×Æ–6F–öç2Â—Bw26öç6–FW&VB&V6÷fW&&ÆRW'&÷"ÂWfVâF†÷Vv‚F†RW6W ¢òòÆ–¶VÇ’vöâwBö'6W'fRç—F†–ærw&öærv—F‚F†RT’à¢òð¢òòF†RW'&÷"—276VB–â2â&wVÖVçBFòVæf÷&6RF†BWfW'’6ÆÆW"&÷f–FP¢òò7W7FöÒÖW76vRÂ÷"W‡Æ–6—FÇ’÷B÷WB†7W'&VçFÇ’F†RöæÇ’F‚F†B÷G0¢òò÷WB—2ÆVv7’ÖöFS²WfW'’6öæ7W'&VçBF‚&÷f–FW2âW'&÷"’à¢–b‡&V6÷fW&&ÆTW'&÷"ÓÒçVÆÂ’°¢VWVT‡–G&F–öäW'&÷"‡&V6÷fW&&ÆTW'&÷"“°¢ÒòòF†—2v–ÆÂFBF†RöÆBf–&W"FòF†RFVÆWF–öâÆ—7@  ¢&V6öæ6–ÆT6†–ÆDf–&W'2‡v÷&´–å&öw&W72Â7W'&VçBæ6†–ÆBÂçVÆÂÂ&VæFW$ÆæW2“²òòvRw&Ræ÷ræ÷B7W7VæFVBæ÷"FV‡–G&FVBà ¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"&–Ö'”6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"&–Ö'”6†–ÆDg&vÖVçBÒÖ÷VçE7W7Vç6U&–Ö'”6†–ÆG&Vâ‡v÷&´–å&öw&W72Â&–Ö'”6†–ÆG&Vâ“²òòæVVG2Æ6VÖVçBVffV7B&V6W6RF†R&VçB‡F†R7W7Vç6R&÷VæF'’’Ç&VG¢òòÖ÷VçFVB'WBF†—2—2æWrf–&W"à ¢&–Ö'”6†–ÆDg&vÖVçBæfÆw2ÃÒÆ6VÖVçC°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢&WGW&â&–Ö'”6†–ÆDg&vÖVçC°¢Ð ¢gVæ7F–öâÖ÷VçE7W7Vç6TfÆÆ&6´gFW%&WG'•v—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72Â&–Ö'”6†–ÆG&VâÂfÆÆ&6´6†–ÆG&VâÂ&VæFW$ÆæW2’°¢f"f–&W$ÖöFRÒv÷&´–å&öw&W72æÖöFS°¢f"&–Ö'”6†–ÆE&÷2Ò°¢ÖöFS¢wf—6–&ÆRrÀ¢6†–ÆG&Vã¢&–Ö'”6†–ÆG&Và¢Ó°¢f"&–Ö'”6†–ÆDg&vÖVçBÒÖ÷VçEv÷&´–å&öw&W74öfg67&VVäf–&W"‡&–Ö'”6†–ÆE&÷2Âf–&W$ÖöFR“°¢f"fÆÆ&6´6†–ÆDg&vÖVçBÒ7&VFTf–&W$g&öÔg&vÖVçB†fÆÆ&6´6†–ÆG&VâÂf–&W$ÖöFRÂ&VæFW$ÆæW2ÂçVÆÂ“²òòæVVG2Æ6VÖVçBVffV7B&V6W6RF†R&VçB‡F†R7W7Vç6P¢òò&÷VæF'’’Ç&VG’Ö÷VçFVB'WBF†—2—2æWrf–&W"à ¢fÆÆ&6´6†–ÆDg&vÖVçBæfÆw2ÃÒÆ6VÖVçC°¢&–Ö'”6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢fÆÆ&6´6†–ÆDg&vÖVçBç&WGW&âÒv÷&´–å&öw&W73°¢&–Ö'”6†–ÆDg&vÖVçBç6–&Æ–ærÒfÆÆ&6´6†–ÆDg&vÖVçC°¢v÷&´–å&öw&W72æ6†–ÆBÒ&–Ö'”6†–ÆDg&vÖVçC° ¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÒæôÖöFR’°¢òòvRv–ÆÂ†fRG&÷VBF†RVffV7BÆ—7Bv†–6‚6öçF–ç2F†P¢òòFVÆWF–öââvRæVVBFò&V6öæ6–ÆRFòFVÆWFRF†R7W'&VçB6†–ÆBà¢&V6öæ6–ÆT6†–ÆDf–&W'2‡v÷&´–å&öw&W72Â7W'&VçBæ6†–ÆBÂçVÆÂÂ&VæFW$ÆæW2“°¢Ð ¢&WGW&âfÆÆ&6´6†–ÆDg&vÖVçC°¢Ð ¢gVæ7F–öâÖ÷VçDFV‡–G&FVE7W7Vç6T6ö×öæVçB‡v÷&´–å&öw&W72Â7W7Vç6T–ç7Fæ6RÂ&VæFW$ÆæW2’°¢òòGW&–ærF†Rf—'7B72ÂvRvÆÂ&–Â÷WBæBæ÷BG&–ÆÂ–çFòF†R6†–ÆG&Vâà¢òò–ç7FVBÂvRvÆÂÆVfRF†R6öçFVçB–âÆ6RæBG'’Fò‡–G&FR—BÆFW"à¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢°¢W'&÷"‚t6ææ÷B‡–G&FR7W7Vç6R–âÆVv7’ÖöFRâ7v—F6‚g&öÒr²u&V7DDôÒæ‡–G&FR†VÆVÖVçBÂ6öçF–æW"’Fòr²u&V7DDôÔ6Æ–VçBæ‡–G&FU&ö÷B†6öçF–æW"ÂÄóâ’r²rç&VæFW"†VÆVÖVçB’÷"&VÖ÷fRF†R7W7Vç6R6ö×öæVçG2g&öÒr²wF†R6W'fW"&VæFW&VB6ö×öæVçG2âr“°¢Ð ¢v÷&´–å&öw&W72æÆæW2ÒÆæUFôÆæW2…7–æ4ÆæR“°¢ÒVÇ6R–b†—57W7Vç6T–ç7Fæ6TfÆÆ&6²‡7W7Vç6T–ç7Fæ6R’’°¢òòF†—2—26Æ–VçBÖöæÇ’&÷VæF'’â6–æ6RvRvöâwBvWBç’6öçFVçBg&öÒF†R6W'fW ¢òòf÷"F†—2ÂvRæVVBFò66†VGVÆRF†BB†–v†W"&–÷&—G’&6VBöâv†Vâ—Bv÷VÆ@¢òò†fRF–ÖVB÷WBâ–âF†V÷'’vR6÷VÆB&VæFW"—B–âF†—272'WB—Bv÷VÆB†fRF†P¢òòw&öær&–÷&—G’76ö6–FVBv—F‚—BæBv–ÆÂ&WfVçB‡–G&F–öâöb&VçBF‚à¢òò–ç7FVBÂvRvÆÂÆVfRv÷&²ÆVgBöâ—BFò&VæFW"—B–â6W&FR6öÖÖ—Bà¢òòDôDòF†—2F–ÖR6†÷VÆB&RF†RF–ÖRBv†–6‚F†R6W'fW"&VæFW&VB&W7öç6RF†B—0¢òò&VçBFòF†—2&÷VæF'’v2F—7Æ–VBâ†÷vWfW"Â6–æ6RvR7W'&VçFÇ’FöâwB†fP¢òò&÷Fö6öÂFòG&ç6fW"F†BF–ÖRÂvRvÆÂ§W7BW7F–ÖFR—B'’W6–ærF†R7W'&Vç@¢òòF–ÖRâF†—2v–ÆÂÖVâF†B7W7Vç6RF–ÖV÷WG2&R6Æ–v‡FÇ’6†–gFVBFòÆFW"F†à¢òòF†W’6†÷VÆB&Rà¢òò66†VGVÆRæ÷&ÖÂ&’WFFRFò&VæFW"F†—26öçFVçBà¢v÷&´–å&öw&W72æÆæW2ÒÆæUFôÆæW2„FVfVÇD‡–G&F–öäÆæR“°¢ÒVÇ6R°¢òòvRvÆÂ6öçF–çVR‡–G&F–ærF†R&W7BBöfg67&VVâ&–÷&—G’6–æ6RvRvÆÂÇ&VG¢òò&R6†÷v–ærF†R&–v‡B6öçFVçB6öÖ–ærg&öÒF†R6W'fW"Â—B—2æò'W6‚à¢v÷&´–å&öw&W72æÆæW2ÒÆæUFôÆæW2„öfg67&VVäÆæR“°¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâWFFTFV‡–G&FVE7W7Vç6T6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72ÂF–E7W7VæBÂæW‡E&÷2Â7W7Vç6T–ç7Fæ6RÂ7W7Vç6U7FFRÂ&VæFW$ÆæW2’°¢–b‚F–E7W7VæB’°¢òòF†—2—2F†Rf—'7B&VæFW"72âGFV×BFò‡–G&FRà¢òòvR6†÷VÆBæWfW"&R‡–G&F–ærBF†—2ö–çB&V6W6R—B—2F†Rf—'7B72À¢òò'WBgFW"vRwfRÇ&VG’6öÖÖ—GFVBöæ6Rà¢v&ä–d‡–G&F–ær‚“° ¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢&WGW&â&WG'•7W7Vç6T6ö×öæVçEv—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2ÂòòDôDó¢v†VâvRFVÆWFRÆVv7’ÖöFRÂvR6†÷VÆBÖ¶RF†—2W'&÷"&wVÖVç@¢òò&WV—&VB(	BWfW'’6öæ7W'&VçBÖöFRF‚F†B6W6W2‡–G&F–öâFð¢òòFRÖ÷BFò6Æ–VçB&VæFW&–ær6†÷VÆB†fRâW'&÷"ÖW76vRà¢çVÆÂ“°¢Ð ¢–b†—57W7Vç6T–ç7Fæ6TfÆÆ&6²‡7W7Vç6T–ç7Fæ6R’’°¢òòF†—2&÷VæF'’—2–âW&ÖæVçBfÆÆ&6²7FFRâ–âF†—266RÂvRvÆÂæWfW ¢òòvWBâWFFRæBvRvÆÂæWfW"&R&ÆRFò‡–G&FRF†Rf–æÂ6öçFVçBâÆWBw2§W7BG'’F†P¢òò6Æ–VçB6–FR&VæFW"–ç7FVBà¢f"F–vW7BÂÖW76vRÂ7F6³° ¢°¢f"övWE7W7Vç6T–ç7Fæ6TbÒvWE7W7Vç6T–ç7Fæ6TfÆÆ&6´W'&÷$FWF–Ç2‡7W7Vç6T–ç7Fæ6R“° ¢F–vW7BÒövWE7W7Vç6T–ç7Fæ6TbæF–vW7C°¢ÖW76vRÒövWE7W7Vç6T–ç7Fæ6TbæÖW76vS°¢7F6²ÒövWE7W7Vç6T–ç7Fæ6Tbç7F6³°¢Ð ¢f"W'&÷#° ¢–b†ÖW76vR’°¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂ÷&öBÖW'&÷"Ö6öFW0¢W'&÷"ÒæWrW'&÷"†ÖW76vR“°¢ÒVÇ6R°¢W'&÷"ÒæWrW'&÷"‚uF†R6W'fW"6÷VÆBæ÷Bf–æ—6‚F†—27W7Vç6R&÷VæF'’ÂÆ–¶VÇ’r²vGVRFòâW'&÷"GW&–ær6W'fW"&VæFW&–ærâ7v—F6†VBFòr²v6Æ–VçB&VæFW&–ærâr“°¢Ð ¢f"6GW&VEfÇVRÒ7&VFT6GW&VEfÇVR†W'&÷"ÂF–vW7BÂ7F6²“°¢&WGW&â&WG'•7W7Vç6T6ö×öæVçEv—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2Â6GW&VEfÇVR“°¢Ð¢òòç’6öçFW‡B†26†ævVBÂvRæVVBFòG&VB—22–bF†R–çWBÖ–v‡B†fR6†ævVBà  ¢f"†46öçFW‡D6†ævVBÒ–æ6ÇVFW56öÖTÆæR‡&VæFW$ÆæW2Â7W'&VçBæ6†–ÆDÆæW2“° ¢–b†F–E&V6V—fUWFFRÇÂ†46öçFW‡D6†ævVB’°¢òòF†—2&÷VæF'’†26†ævVB6–æ6RF†Rf—'7B&VæFW"âF†—2ÖVç2F†BvR&Ræ÷rVæ&ÆRFð¢òò‡–G&FR—BâvRÖ–v‡B7F–ÆÂ&R&ÆRFò‡–G&FR—BW6–ær†–v†W"&–÷&—G’ÆæRà¢f"&ö÷BÒvWEv÷&´–å&öw&W75&ö÷B‚“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢f"GFV×D‡–G&F–öäDÆæRÒvWD'V×VDÆæTf÷$‡–G&F–öâ‡&ö÷BÂ&VæFW$ÆæW2“° ¢–b†GFV×D‡–G&F–öäDÆæRÓÒæôÆæRbbGFV×D‡–G&F–öäDÆæRÓÒ7W7Vç6U7FFRç&WG'”ÆæR’°¢òò–çFVçF–öæÆÇ’×WFF–ær6–æ6RF†—2&VæFW"v–ÆÂvWB–çFW''WFVBâF†—0¢òò—2öæRöbF†RfW'’&&RF–ÖW2v†W&RvR×WFFRF†R7W'&VçBG&VP¢òòGW&–ærF†R&VæFW"†6Rà¢7W7Vç6U7FFRç&WG'”ÆæRÒGFV×D‡–G&F–öäDÆæS²òòDôDó¢–FVÆÇ’F†—2v÷VÆB–æ†W&—BF†RWfVçBF–ÖRöbF†R7W'&VçB&VæFW  ¢f"WfVçEF–ÖRÒæõF–ÖW7F×°¢VçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†7W'&VçBÂGFV×D‡–G&F–öäDÆæR“°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂ7W'&VçBÂGFV×D‡–G&F–öäDÆæRÂWfVçEF–ÖR“°¢Ð¢Òòò–bvR†fR66†VGVÆVB†–v†W"&’v÷&²&÷fRÂF†—2v–ÆÂ&ö&&Ç’§W7B&÷'BF†R&VæFW ¢òò6–æ6RvRæ÷r†fR†–v†W"&–÷&—G’v÷&²Â'WB–â66R—BFöW6âwBÂvRæVVBFò&W&RFð¢òò&VæFW"6öÖWF†–ærÂ–bvRF–ÖR÷WBâWfVâ–bF†B&WV—&W2W2FòFVÆWFRWfW'—F†–æræ@¢òò6¶—‡–G&F–öâà¢òòFVÆ’†f–ærFòFòF†—22Æöær2F†R7W7Vç6RF–ÖV÷WBÆÆ÷w2W2à  ¢&VæFW$F–E7W7VæDFVÆ”–e÷76–&ÆR‚“° ¢f"ö6GW&VEfÇVRÒ7&VFT6GW&VEfÇVR†æWrW'&÷"‚uF†—27W7Vç6R&÷VæF'’&V6V—fVBâWFFR&Vf÷&R—Bf–æ—6†VBr²v‡–G&F–ærâF†—26W6VBF†R&÷VæF'’Fò7v—F6‚Fò6Æ–VçB&VæFW&–ærâr²uF†RW7VÂv’Fòf—‚F†—2—2Fòw&F†R÷&–v–æÂWFFRr²v–â7F'EG&ç6—F–öââr’“° ¢&WGW&â&WG'•7W7Vç6T6ö×öæVçEv—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2Âö6GW&VEfÇVR“°¢ÒVÇ6R–b†—57W7Vç6T–ç7Fæ6UVæF–ær‡7W7Vç6T–ç7Fæ6R’’°¢òòF†—26ö×öæVçB—27F–ÆÂVæF–ærÖ÷&RFFg&öÒF†R6W'fW"Â6òvR6âwB‡–G&FR—G0¢òò6öçFVçBâvRG&VB—B2–bF†—26ö×öæVçB7W7VæFVB—G6VÆbâ—BÖ–v‡B6VVÒ2–`¢òòvR6÷VÆB§W7BG'’Fò&VæFW"—B6Æ–VçB×6–FR–ç7FVBâ†÷vWfW"ÂF†—2v–ÆÂW&f÷&Ò¢òòÆ÷BöbVææV6W76'’v÷&²æB—2VæÆ–¶VÇ’Fò6ö×ÆWFR6–æ6R—BögFVâv–ÆÂ7W7Væ@¢òòöâÖ—76–ærFFç—v’âFF—F–öæÆÇ’ÂF†R6W'fW"Ö–v‡B&R&ÆRFò&VæFW"Ö÷&P¢òòF†âvR6âöâF†R6Æ–VçB–WBâ–âF†B66RvRvBVæBWv—F‚Ö÷&RfÆÆ&6²7FFW0¢òòöâF†R6Æ–VçBF†â–bvR§W7BÆVfR—BÆöæRâ–bF†R6W'fW"F–ÖW2÷WB÷"W'&÷'0¢òòF†W6R6†÷VÆBWFFRF†—2&÷VæF'’FòF†RW&ÖæVçBfÆÆ&6²7FFR–ç7FVBà¢òòÖ&²—B2†f–ær6GW&VB†’æRâ7W7VæFVB’à¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S²òòÆVfRF†R6†–ÆB–âÆ6Râ’æRâF†RFV‡–G&FVBg&vÖVçBà ¢v÷&´–å&öw&W72æ6†–ÆBÒ7W'&VçBæ6†–ÆC²òò&Vv—7FW"6ÆÆ&6²Fò&WG'’F†—2&÷VæF'’öæ6RF†R6W'fW"†26VçBF†R&W7VÇBà ¢f"&WG'’Ò&WG'”FV‡–G&FVE7W7Vç6T&÷VæF'’æ&–æB†çVÆÂÂ7W'&VçB“°¢&Vv—7FW%7W7Vç6T–ç7Fæ6U&WG'’‡7W7Vç6T–ç7Fæ6RÂ&WG'’“°¢&WGW&âçVÆÃ°¢ÒVÇ6R°¢òòF†—2—2F†Rf—'7BGFV×Bà¢&VVçFW$‡–G&F–öå7FFTg&öÔFV‡–G&FVE7W7Vç6T–ç7Fæ6R‡v÷&´–å&öw&W72Â7W7Vç6T–ç7Fæ6RÂ7W7Vç6U7FFRçG&VT6öçFW‡B“°¢f"&–Ö'”6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"&–Ö'”6†–ÆDg&vÖVçBÒÖ÷VçE7W7Vç6U&–Ö'”6†–ÆG&Vâ‡v÷&´–å&öw&W72Â&–Ö'”6†–ÆG&Vâ“²òòÖ&²F†R6†–ÆG&Vâ2‡–G&F–ærâF†—2—2f7BF‚Fò¶æ÷rv†WF†W"F†—0¢òòG&VR—2'Böb‡–G&F–ærG&VRâF†—2—2W6VBFòFWFW&Ö–æR–b6†–Æ@¢òòæöFR†2gVÆÇ’Ö÷VçFVB–WBÂæBf÷"66†VGVÆ–ærWfVçB&WÆ––ærà¢òò6öæ6WGVÆÇ’F†—2—26–Ö–Æ"FòÆ6VÖVçB–âF†BæWr7V'G&VR—0¢òò–ç6W'FVB–çFòF†R&V7BG&VR†W&Râ—B§W7B†Vç2Fòæ÷BæVVBDôÐ¢òò×WFF–öç2&V6W6R—BÇ&VG’W†—7G2à ¢&–Ö'”6†–ÆDg&vÖVçBæfÆw2ÃÒ‡–G&F–æs°¢&WGW&â&–Ö'”6†–ÆDg&vÖVçC°¢Ð¢ÒVÇ6R°¢òòF†—2—2F†R6V6öæB&VæFW"72âvRÇ&VG’GFV×FVBFò‡–G&FVBÂ'W@¢òò6öÖWF†–ærV—F†W"7W7VæFVB÷"W'&÷&VBà¢–b‡v÷&´–å&öw&W72æfÆw2bf÷&6T6Æ–VçE&VæFW"’°¢òò6öÖWF†–ærW'&÷&VBGW&–ær‡–G&F–öââG'’v–âv—F†÷WB‡–G&F–ærà¢v÷&´–å&öw&W72æfÆw2cÒäf÷&6T6Æ–VçE&VæFW#° ¢f"ö6GW&VEfÇVS"Ò7&VFT6GW&VEfÇVR†æWrW'&÷"‚uF†W&Rv2âW'&÷"v†–ÆR‡–G&F–ærF†—27W7Vç6R&÷VæF'’âr²u7v—F6†VBFò6Æ–VçB&VæFW&–ærâr’“° ¢&WGW&â&WG'•7W7Vç6T6ö×öæVçEv—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2Âö6GW&VEfÇVS"“°¢ÒVÇ6R–b‡v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÓÒçVÆÂ’°¢òò6öÖWF†–ær7W7VæFVBæBvR6†÷VÆB7F–ÆÂ&R–âFV‡–G&FVBÖöFRà¢òòÆVfRF†RW†—7F–ær6†–ÆB–âÆ6Rà¢v÷&´–å&öw&W72æ6†–ÆBÒ7W'&VçBæ6†–ÆC²òòF†RFV‡–G&FVB6ö×ÆWF–öâ72W‡V7G2F†—2fÆrFò&RF†W&P¢òò'WBF†Ræ÷&ÖÂ7W7Vç6R72FöW6âwBà ¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢&WGW&âçVÆÃ°¢ÒVÇ6R°¢òò7W7VæFVB'WBvR6†÷VÆBæòÆöævW"&R–âFV‡–G&FVBÖöFRà¢òòF†W&Vf÷&RvRæ÷r†fRFò&VæFW"F†RfÆÆ&6²à¢f"æW‡E&–Ö'”6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢f"æW‡DfÆÆ&6´6†–ÆG&VâÒæW‡E&÷2æfÆÆ&6³°¢f"fÆÆ&6´6†–ÆDg&vÖVçBÒÖ÷VçE7W7Vç6TfÆÆ&6´gFW%&WG'•v—F†÷WD‡–G&F–ær†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡E&–Ö'”6†–ÆG&VâÂæW‡DfÆÆ&6´6†–ÆG&VâÂ&VæFW$ÆæW2“°¢f"÷&–Ö'”6†–ÆDg&vÖVçCBÒv÷&´–å&öw&W72æ6†–ÆC°¢÷&–Ö'”6†–ÆDg&vÖVçCBæÖVÖö—¦VE7FFRÒÖ÷VçE7W7Vç6Töfg67&VVå7FFR‡&VæFW$ÆæW2“°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ5U5TäDTEôÔ$´U#°¢&WGW&âfÆÆ&6´6†–ÆDg&vÖVçC°¢Ð¢Ð¢Ð ¢gVæ7F–öâ66†VGVÆU7W7Vç6Uv÷&´öäf–&W"†f–&W"Â&VæFW$ÆæW2Â&÷vF–öå&ö÷B’°¢f–&W"æÆæW2ÒÖW&vTÆæW2†f–&W"æÆæW2Â&VæFW$ÆæW2“°¢f"ÇFW&æFRÒf–&W"æÇFW&æFS° ¢–b†ÇFW&æFRÓÒçVÆÂ’°¢ÇFW&æFRæÆæW2ÒÖW&vTÆæW2†ÇFW&æFRæÆæW2Â&VæFW$ÆæW2“°¢Ð ¢66†VGVÆT6öçFW‡Ev÷&´öå&VçEF‚†f–&W"ç&WGW&âÂ&VæFW$ÆæW2Â&÷vF–öå&ö÷B“°¢Ð ¢gVæ7F–öâ&÷vFU7W7Vç6T6öçFW‡D6†ævR‡v÷&´–å&öw&W72Âf—'7D6†–ÆBÂ&VæFW$ÆæW2’°¢òòÖ&²ç’7W7Vç6R&÷VæF&–W2v—F‚fÆÆ&6·22†f–ærv÷&²FòFòà¢òò–bF†W’vW&R&Wf–÷W6Ç’f÷&6VB–çFòfÆÆ&6·2ÂF†W’Ö’æ÷r&R&ÆP¢òòFòVæ&Æö6²à¢f"æöFRÒf—'7D6†–ÆC° ¢v†–ÆR†æöFRÓÒçVÆÂ’°¢–b†æöFRçFrÓÓÒ7W7Vç6T6ö×öæVçB’°¢f"7FFRÒæöFRæÖVÖö—¦VE7FFS° ¢–b‡7FFRÓÒçVÆÂ’°¢66†VGVÆU7W7Vç6Uv÷&´öäf–&W"†æöFRÂ&VæFW$ÆæW2Âv÷&´–å&öw&W72“°¢Ð¢ÒVÇ6R–b†æöFRçFrÓÓÒ7W7Vç6TÆ—7D6ö×öæVçB’°¢òò–bF†RF–Â—2†–FFVâF†W&RÖ–v‡Bæ÷B&Râ7W7Vç6R&÷VæF&–W0¢òòFò66†VGVÆRv÷&²öââ–âF†—266RvR†fRFò66†VGVÆR—BöâF†P¢òòÆ—7B—G6VÆbà¢òòvRFöâwB†fRFòG&fW'6RFòF†R6†–ÆG&VâöbF†RÆ—7B6–æ6P¢òòF†RÆ—7Bv–ÆÂ&÷vFRF†R6†ævRv†Vâ—B&W&VæFW'2à¢66†VGVÆU7W7Vç6Uv÷&´öäf–&W"†æöFRÂ&VæFW$ÆæW2Âv÷&´–å&öw&W72“°¢ÒVÇ6R–b†æöFRæ6†–ÆBÓÒçVÆÂ’°¢æöFRæ6†–ÆBç&WGW&âÒæöFS°¢æöFRÒæöFRæ6†–ÆC°¢6öçF–çVS°¢Ð ¢–b†æöFRÓÓÒv÷&´–å&öw&W72’°¢&WGW&ã°¢Ð ¢v†–ÆR†æöFRç6–&Æ–ærÓÓÒçVÆÂ’°¢–b†æöFRç&WGW&âÓÓÒçVÆÂÇÂæöFRç&WGW&âÓÓÒv÷&´–å&öw&W72’°¢&WGW&ã°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð ¢æöFRç6–&Æ–ærç&WGW&âÒæöFRç&WGW&ã°¢æöFRÒæöFRç6–&Æ–æs°¢Ð¢Ð ¢gVæ7F–öâf–æDÆ7D6öçFVçE&÷r†f—'7D6†–ÆB’°¢òòF†—2—2vö–ærFòf–æBF†RÆ7B&÷rÖöærF†W6R6†–ÆG&VâF†B—2Ç&VG¢òò6†÷v–ær6öçFVçBöâF†R67&VVâÂ2÷÷6VBFò&V–ær–âfÆÆ&6²7FFR÷ ¢òòæWrâ–b&÷r†2×VÇF—ÆR7W7Vç6R&÷VæF&–W2Âç’öbF†VÒ&V–ær–âF†P¢òòfÆÆ&6²7FFRÂ6÷VçG22F†Rv†öÆR&÷r&V–ær–âfÆÆ&6²7FFRà¢òòæ÷FRF†BF†R'&÷w2"v–ÆÂ&Rv÷&´–å&öw&W72Â'WBç’æW7FVB6†–ÆG&Và¢òòv–ÆÂ7F–ÆÂ&R7W'&VçB6–æ6RvR†fVâwB&VæFW&VBF†VÒ–WBâF†RÖ÷VçFV@¢òò÷&FW"Ö’æ÷B&RF†R6ÖR2F†RæWr÷&FW"âvRW6RF†RæWr÷&FW"à¢f"&÷rÒf—'7D6†–ÆC°¢f"Æ7D6öçFVçE&÷rÒçVÆÃ° ¢v†–ÆR‡&÷rÓÒçVÆÂ’°¢f"7W'&VçE&÷rÒ&÷ræÇFW&æFS²òòæWr&÷w26âwB&R6öçFVçB&÷w2à ¢–b†7W'&VçE&÷rÓÒçVÆÂbbf–æDf—'7E7W7VæFVB†7W'&VçE&÷r’ÓÓÒçVÆÂ’°¢Æ7D6öçFVçE&÷rÒ&÷s°¢Ð ¢&÷rÒ&÷rç6–&Æ–æs°¢Ð ¢&WGW&âÆ7D6öçFVçE&÷s°¢Ð ¢gVæ7F–öâfÆ–FFU&WfVÄ÷&FW"‡&WfVÄ÷&FW"’°¢°¢–b‡&WfVÄ÷&FW"ÓÒVæFVf–æVBbb&WfVÄ÷&FW"ÓÒvf÷'v&G2rbb&WfVÄ÷&FW"ÓÒv&6·v&G2rbb&WfVÄ÷&FW"ÓÒwFövWF†W"rbbF–Ev&ä&÷WE&WfVÄ÷&FW%·&WfVÄ÷&FW%Ò’°¢F–Ev&ä&÷WE&WfVÄ÷&FW%·&WfVÄ÷&FW%ÒÒG'VS° ¢–b‡G—Vöb&WfVÄ÷&FW"ÓÓÒw7G&–ærr’°¢7v—F6‚‡&WfVÄ÷&FW"çFôÆ÷vW$66R‚’’°¢66RwFövWF†W"s ¢66Rvf÷'v&G2s ¢66Rv&6·v&G2s ¢°¢W'&÷"‚r"W2"—2æ÷BfÆ–BfÇVRf÷"&WfVÄ÷&FW"öâÅ7W7Vç6TÆ—7Bóââr²uW6RÆ÷vW&66R"W2"–ç7FVBârÂ&WfVÄ÷&FW"Â&WfVÄ÷&FW"çFôÆ÷vW$66R‚’“° ¢'&V³°¢Ð ¢66Rvf÷'v&Bs ¢66Rv&6·v&Bs ¢°¢W'&÷"‚r"W2"—2æ÷BfÆ–BfÇVRf÷"&WfVÄ÷&FW"öâÅ7W7Vç6TÆ—7Bóââr²u&V7BW6W2F†R×27Vff—‚–âF†R7VÆÆ–ærâW6R"W72"–ç7FVBârÂ&WfVÄ÷&FW"Â&WfVÄ÷&FW"çFôÆ÷vW$66R‚’“° ¢'&V³°¢Ð ¢FVfVÇC ¢W'&÷"‚r"W2"—2æ÷B7W÷'FVB&WfVÄ÷&FW"öâÅ7W7Vç6TÆ—7Bóââr²tF–B–÷RÖVâ'FövWF†W""Â&f÷'v&G2"÷"&&6·v&G2#òrÂ&WfVÄ÷&FW"“° ¢'&V³°¢Ð¢ÒVÇ6R°¢W'&÷"‚rW2—2æ÷B7W÷'FVBfÇVRf÷"&WfVÄ÷&FW"öâÅ7W7Vç6TÆ—7Bóââr²tF–B–÷RÖVâ'FövWF†W""Â&f÷'v&G2"÷"&&6·v&G2#òrÂ&WfVÄ÷&FW"“°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâfÆ–FFUF–Ä÷F–öç2‡F–ÄÖöFRÂ&WfVÄ÷&FW"’°¢°¢–b‡F–ÄÖöFRÓÒVæFVf–æVBbbF–Ev&ä&÷WEF–Ä÷F–öç5·F–ÄÖöFUÒ’°¢–b‡F–ÄÖöFRÓÒv6öÆÆ6VBrbbF–ÄÖöFRÓÒv†–FFVâr’°¢F–Ev&ä&÷WEF–Ä÷F–öç5·F–ÄÖöFUÒÒG'VS° ¢W'&÷"‚r"W2"—2æ÷B7W÷'FVBfÇVRf÷"F–ÂöâÅ7W7Vç6TÆ—7Bóââr²tF–B–÷RÖVâ&6öÆÆ6VB"÷"&†–FFVâ#òrÂF–ÄÖöFR“°¢ÒVÇ6R–b‡&WfVÄ÷&FW"ÓÒvf÷'v&G2rbb&WfVÄ÷&FW"ÓÒv&6·v&G2r’°¢F–Ev&ä&÷WEF–Ä÷F–öç5·F–ÄÖöFUÒÒG'VS° ¢W'&÷"‚sÅ7W7Vç6TÆ—7BF–ÃÒ"W2"óâ—2öæÇ’fÆ–B–b&WfVÄ÷&FW"—2r²r&f÷'v&G2"÷"&&6·v&G2"âr²tF–B–÷RÖVâFò7V6–g’&WfVÄ÷&FW#Ò&f÷'v&G2#òrÂF–ÄÖöFR“°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâfÆ–FFU7W7Vç6TÆ—7DæW7FVD6†–ÆB†6†–ÆE6Æ÷BÂ–æFW‚’°¢°¢f"—4ä'&’Ò—4'&’†6†–ÆE6Æ÷B“°¢f"—4—FW&&ÆRÒ—4ä'&’bbG—VöbvWD—FW&F÷$fâ†6†–ÆE6Æ÷B’ÓÓÒvgVæ7F–öâs° ¢–b†—4ä'&’ÇÂ—4—FW&&ÆR’°¢f"G—RÒ—4ä'&’òv'&’r¢v—FW&&ÆRs° ¢W'&÷"‚tæW7FVBW2v276VBFò&÷r2W2–âÅ7W7Vç6TÆ—7Bóââw&—B–âr²vâFF—F–öæÂ7W7Vç6TÆ—7BFò6öæf–wW&R—G2&WfVÄ÷&FW#¢r²sÅ7W7Vç6TÆ—7B&WfVÄ÷&FW#Òââãââââr²sÅ7W7Vç6TÆ—7B&WfVÄ÷&FW#Òââãç²W7ÓÂõ7W7Vç6TÆ—7Cââââr²sÂõ7W7Vç6TÆ—7CârÂG—RÂ–æFW‚ÂG—R“° ¢&WGW&âfÇ6S°¢Ð¢Ð ¢&WGW&âG'VS°¢Ð ¢gVæ7F–öâfÆ–FFU7W7Vç6TÆ—7D6†–ÆG&Vâ†6†–ÆG&VâÂ&WfVÄ÷&FW"’°¢°¢–b‚‡&WfVÄ÷&FW"ÓÓÒvf÷'v&G2rÇÂ&WfVÄ÷&FW"ÓÓÒv&6·v&G2r’bb6†–ÆG&VâÓÒVæFVf–æVBbb6†–ÆG&VâÓÒçVÆÂbb6†–ÆG&VâÓÒfÇ6R’°¢–b†—4'&’†6†–ÆG&Vâ’’°¢f÷"‡f"’Ò²’Â6†–ÆG&VâæÆVæwFƒ²’²²’°¢–b‚fÆ–FFU7W7Vç6TÆ—7DæW7FVD6†–ÆB†6†–ÆG&Vå¶•ÒÂ’’’°¢&WGW&ã°¢Ð¢Ð¢ÒVÇ6R°¢f"—FW&F÷$fâÒvWD—FW&F÷$fâ†6†–ÆG&Vâ“° ¢–b‡G—Vöb—FW&F÷$fâÓÓÒvgVæ7F–öâr’°¢f"6†–ÆG&Vä—FW&F÷"Ò—FW&F÷$fâæ6ÆÂ†6†–ÆG&Vâ“° ¢–b†6†–ÆG&Vä—FW&F÷"’°¢f"7FWÒ6†–ÆG&Vä—FW&F÷"ææW‡B‚“°¢f"ö’Ò° ¢f÷"ƒ²7FWæFöæS²7FWÒ6†–ÆG&Vä—FW&F÷"ææW‡B‚’’°¢–b‚fÆ–FFU7W7Vç6TÆ—7DæW7FVD6†–ÆB‡7FWçfÇVRÂö’’’°¢&WGW&ã°¢Ð ¢ö’²³°¢Ð¢Ð¢ÒVÇ6R°¢W'&÷"‚t6–ævÆR&÷rv276VBFòÅ7W7Vç6TÆ—7B&WfVÄ÷&FW#Ò"W2"óââr²uF†—2—2æ÷BW6VgVÂ6–æ6R—BæVVG2×VÇF—ÆR&÷w2âr²tF–B–÷RÖVâFò72×VÇF—ÆR6†–ÆG&Vâ÷"â'&“òrÂ&WfVÄ÷&FW"“°¢Ð¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ–æ—E7W7Vç6TÆ—7E&VæFW%7FFR‡v÷&´–å&öw&W72Â—4&6·v&G2ÂF–ÂÂÆ7D6öçFVçE&÷rÂF–ÄÖöFR’°¢f"&VæFW%7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS° ¢–b‡&VæFW%7FFRÓÓÒçVÆÂ’°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ°¢—4&6·v&G3¢—4&6·v&G2À¢&VæFW&–æs¢çVÆÂÀ¢&VæFW&–æu7F'EF–ÖS¢À¢Æ7C¢Æ7D6öçFVçE&÷rÀ¢F–Ã¢F–ÂÀ¢F–ÄÖöFS¢F–ÄÖöFP¢Ó°¢ÒVÇ6R°¢òòvR6â&WW6RF†RW†—7F–ærö&¦V7Bg&öÒ&Wf–÷W2&VæFW'2à¢&VæFW%7FFRæ—4&6·v&G2Ò—4&6·v&G3°¢&VæFW%7FFRç&VæFW&–ærÒçVÆÃ°¢&VæFW%7FFRç&VæFW&–æu7F'EF–ÖRÒ°¢&VæFW%7FFRæÆ7BÒÆ7D6öçFVçE&÷s°¢&VæFW%7FFRçF–ÂÒF–Ã°¢&VæFW%7FFRçF–ÄÖöFRÒF–ÄÖöFS°¢Ð¢ÒòòF†—26âVæBW&VæFW&–ærF†—26ö×öæVçB×VÇF—ÆR76W2à¢òòF†Rf—'7B727Æ—G2F†R6†–ÆG&Vâf–&W'2–çFòGvò6WG2â†VBæBF–Âà¢òòvRf—'7B&VæFW"F†R†VBâ–bç—F†–ær—2–âfÆÆ&6²7FFRÂvRFòæ÷F†W ¢òò72F‡&÷Vv‚&Vv–åv÷&²Fò&W&VæFW"ÆÂ6†–ÆG&Vâ†–æ6ÇVF–ærF†RF–Â’v—F€¢òòF†Rf÷&6R7W7VæB6öçFW‡Bâ–bF†Rf—'7B&VæFW"F–FâwB†fRç—F†–ær–à¢òò–âfÆÆ&6²7FFRâF†VâvR&VæFW"V6‚&÷r–âF†RF–ÂöæRÖ'’ÖöæRà¢òòF†B†Vç2–âF†R6ö×ÆWFUv÷&²†6Rv—F†÷WBvö–ær&6²Fò&Vv–åv÷&²à  ¢gVæ7F–öâWFFU7W7Vç6TÆ—7D6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"æW‡E&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"&WfVÄ÷&FW"ÒæW‡E&÷2ç&WfVÄ÷&FW#°¢f"F–ÄÖöFRÒæW‡E&÷2çF–Ã°¢f"æWt6†–ÆG&VâÒæW‡E&÷2æ6†–ÆG&Vã°¢fÆ–FFU&WfVÄ÷&FW"‡&WfVÄ÷&FW"“°¢fÆ–FFUF–Ä÷F–öç2‡F–ÄÖöFRÂ&WfVÄ÷&FW"“°¢fÆ–FFU7W7Vç6TÆ—7D6†–ÆG&Vâ†æWt6†–ÆG&VâÂ&WfVÄ÷&FW"“°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæWt6†–ÆG&VâÂ&VæFW$ÆæW2“°¢f"7W7Vç6T6öçFW‡BÒ7W7Vç6U7F6´7W'6÷"æ7W'&VçC°¢f"6†÷VÆDf÷&6TfÆÆ&6²Ò†57W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡BÂf÷&6U7W7Vç6TfÆÆ&6²“° ¢–b‡6†÷VÆDf÷&6TfÆÆ&6²’°¢7W7Vç6T6öçFW‡BÒ6WE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡BÂf÷&6U7W7Vç6TfÆÆ&6²“°¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢ÒVÇ6R°¢f"F–E7W7VæD&Vf÷&RÒ7W'&VçBÓÒçVÆÂbb†7W'&VçBæfÆw2bF–D6GW&R’ÓÒæôfÆw3° ¢–b†F–E7W7VæD&Vf÷&R’°¢òò–bvR&Wf–÷W6Ç’f÷&6VBfÆÆ&6²ÂvRæVVBFò66†VGVÆRv÷&°¢òòöâç’æW7FVB&÷VæF&–W2FòÆWBF†VÒ¶æ÷rFòG'’Fò&VæFW ¢òòv–ââF†—2—2F†R6ÖR26öçFW‡BWFF–ærà¢&÷vFU7W7Vç6T6öçFW‡D6†ævR‡v÷&´–å&öw&W72Âv÷&´–å&öw&W72æ6†–ÆBÂ&VæFW$ÆæW2“°¢Ð ¢7W7Vç6T6öçFW‡BÒ6WDFVfVÇE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡B“°¢Ð ¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â7W7Vç6T6öçFW‡B“° ¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢òò–âÆVv7’ÖöFRÂ7W7Vç6TÆ—7BFöW6âwBv÷&²6òvR§W7@¢òòW6RÖ¶R—Bæö÷'’G&VF–ær—B2F†RFVfVÇB&WfVÄ÷&FW"à¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢ÒVÇ6R°¢7v—F6‚‡&WfVÄ÷&FW"’°¢66Rvf÷'v&G2s ¢°¢f"Æ7D6öçFVçE&÷rÒf–æDÆ7D6öçFVçE&÷r‡v÷&´–å&öw&W72æ6†–ÆB“°¢f"F–Ã° ¢–b†Æ7D6öçFVçE&÷rÓÓÒçVÆÂ’°¢òòF†Rv†öÆRÆ—7B—2'BöbF†RF–Âà¢òòDôDó¢vR6÷VÆBf7BF‚'’§W7B&VæFW&–ærF†RF–Âæ÷rà¢F–ÂÒv÷&´–å&öw&W72æ6†–ÆC°¢v÷&´–å&öw&W72æ6†–ÆBÒçVÆÃ°¢ÒVÇ6R°¢òòF—66öææV7BF†RF–Â&÷w2gFW"F†R6öçFVçB&÷rà¢òòvRw&Rvö–ærFò&VæFW"F†VÒ6W&FVÇ’ÆFW"à¢F–ÂÒÆ7D6öçFVçE&÷rç6–&Æ–æs°¢Æ7D6öçFVçE&÷rç6–&Æ–ærÒçVÆÃ°¢Ð ¢–æ—E7W7Vç6TÆ—7E&VæFW%7FFR‡v÷&´–å&öw&W72ÂfÇ6RÂòò—4&6·v&G0¢F–ÂÂÆ7D6öçFVçE&÷rÂF–ÄÖöFR“°¢'&V³°¢Ð ¢66Rv&6·v&G2s ¢°¢òòvRw&Rvö–ærFòf–æBF†Rf—'7B&÷rF†B†2W†—7F–ær6öçFVçBà¢òòBF†R6ÖRF–ÖRvRw&Rvö–ærFò&WfW'6RF†RÆ—7BöbWfW'—F†–æp¢òòvR72–âF†RÖVçF–ÖRâF†Bw2vö–ærFò&R÷W"F–Â–â&WfW'6P¢òò÷&FW"à¢f"÷F–ÂÒçVÆÃ°¢f"&÷rÒv÷&´–å&öw&W72æ6†–ÆC°¢v÷&´–å&öw&W72æ6†–ÆBÒçVÆÃ° ¢v†–ÆR‡&÷rÓÒçVÆÂ’°¢f"7W'&VçE&÷rÒ&÷ræÇFW&æFS²òòæWr&÷w26âwB&R6öçFVçB&÷w2à ¢–b†7W'&VçE&÷rÓÒçVÆÂbbf–æDf—'7E7W7VæFVB†7W'&VçE&÷r’ÓÓÒçVÆÂ’°¢òòF†—2—2F†R&Vv–ææ–æröbF†RÖ–â6öçFVçBà¢v÷&´–å&öw&W72æ6†–ÆBÒ&÷s°¢'&V³°¢Ð ¢f"æW‡E&÷rÒ&÷rç6–&Æ–æs°¢&÷rç6–&Æ–ærÒ÷F–Ã°¢÷F–ÂÒ&÷s°¢&÷rÒæW‡E&÷s°¢ÒòòDôDó¢–bv÷&´–å&öw&W72æ6†–ÆB—2çVÆÂÂvR6â6öçF–çVRöâF†RF–Â–ÖÖVF–FVÇ’à  ¢–æ—E7W7Vç6TÆ—7E&VæFW%7FFR‡v÷&´–å&öw&W72ÂG'VRÂòò—4&6·v&G0¢÷F–ÂÂçVÆÂÂòòÆ7@¢F–ÄÖöFR“°¢'&V³°¢Ð ¢66RwFövWF†W"s ¢°¢–æ—E7W7Vç6TÆ—7E&VæFW%7FFR‡v÷&´–å&öw&W72ÂfÇ6RÂòò—4&6·v&G0¢çVÆÂÂòòF–À¢çVÆÂÂòòÆ7@¢VæFVf–æVB“°¢'&V³°¢Ð ¢FVfVÇC ¢°¢òòF†RFVfVÇB&WfVÂ÷&FW"—2F†R6ÖR2æ÷B†f–æp¢òò&÷VæF'’à¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢Ð¢Ð¢Ð ¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâWFFU÷'FÄ6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢W6„†÷7D6öçF–æW"‡v÷&´–å&öw&W72Âv÷&´–å&öw&W72ç7FFTæöFRæ6öçF–æW$–æfò“°¢f"æW‡D6†–ÆG&VâÒv÷&´–å&öw&W72çVæF–æu&÷3° ¢–b†7W'&VçBÓÓÒçVÆÂ’°¢òò÷'FÇ2&R7V6–Â&V6W6RvRFöâwBVæBF†R6†–ÆG&VâGW&–ærÖ÷Vç@¢òò'WBB6öÖÖ—BâF†W&Vf÷&RvRæVVBFòG&6²–ç6W'F–öç2v†–6‚F†Ræ÷&ÖÀ¢òòfÆ÷rFöW6âwBFòGW&–ærÖ÷VçBâF†—2FöW6âwB†VâBF†R&ö÷B&V6W6P¢òòF†R&ö÷BÇv—27F'G2v—F‚&7W'&VçB"v—F‚çVÆÂ6†–ÆBà¢òòDôDó¢6öç6–FW"Væ–g––ærF†—2v—F‚†÷rF†R&ö÷Bv÷&·2à¢v÷&´–å&öw&W72æ6†–ÆBÒ&V6öæ6–ÆT6†–ÆDf–&W'2‡v÷&´–å&öw&W72ÂçVÆÂÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢ÒVÇ6R°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡D6†–ÆG&VâÂ&VæFW$ÆæW2“°¢Ð ¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢f"†5v&æVD&÷WEW6–ætæõfÇVU&÷öä6öçFW‡E&÷f–FW"ÒfÇ6S° ¢gVæ7F–öâWFFT6öçFW‡E&÷f–FW"†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"&÷f–FW%G—RÒv÷&´–å&öw&W72çG—S°¢f"6öçFW‡BÒ&÷f–FW%G—Råö6öçFW‡C°¢f"æWu&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"öÆE&÷2Òv÷&´–å&öw&W72æÖVÖö—¦VE&÷3°¢f"æWufÇVRÒæWu&÷2çfÇVS° ¢°¢–b‚‚wfÇVRr–âæWu&÷2’’°¢–b‚†5v&æVD&÷WEW6–ætæõfÇVU&÷öä6öçFW‡E&÷f–FW"’°¢†5v&æVD&÷WEW6–ætæõfÇVU&÷öä6öçFW‡E&÷f–FW"ÒG'VS° ¢W'&÷"‚uF†RfÇVV&÷—2&WV—&VBf÷"F†RÄ6öçFW‡Bå&÷f–FW#æâF–B–÷RÖ—77VÆÂ—B÷"f÷&vWBFò72—Còr“°¢Ð¢Ð ¢f"&÷f–FW%&÷G—W2Òv÷&´–å&öw&W72çG—Rç&÷G—W3° ¢–b‡&÷f–FW%&÷G—W2’°¢6†V6µ&÷G—W2‡&÷f–FW%&÷G—W2ÂæWu&÷2Âw&÷rÂt6öçFW‡Bå&÷f–FW"r“°¢Ð¢Ð ¢W6…&÷f–FW"‡v÷&´–å&öw&W72Â6öçFW‡BÂæWufÇVR“° ¢°¢–b†öÆE&÷2ÓÒçVÆÂ’°¢f"öÆEfÇVRÒöÆE&÷2çfÇVS° ¢–b†ö&¦V7D—2†öÆEfÇVRÂæWufÇVR’’°¢òòæò6†ævRâ&–Æ÷WBV&Ç’–b6†–ÆG&Vâ&RF†R6ÖRà¢–b†öÆE&÷2æ6†–ÆG&VâÓÓÒæWu&÷2æ6†–ÆG&Vâbb†46öçFW‡D6†ævVB‚’’°¢&WGW&â&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð¢ÒVÇ6R°¢òòF†R6öçFW‡BfÇVR6†ævVBâ6V&6‚f÷"ÖF6†–ær6öç7VÖW'2æB66†VGVÆP¢òòF†VÒFòWFFRà¢&÷vFT6öçFW‡D6†ævR‡v÷&´–å&öw&W72Â6öçFW‡BÂ&VæFW$ÆæW2“°¢Ð¢Ð¢Ð ¢f"æWt6†–ÆG&VâÒæWu&÷2æ6†–ÆG&Vã°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæWt6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢f"†5v&æVD&÷WEW6–æt6öçFW‡D46öç7VÖW"ÒfÇ6S° ¢gVæ7F–öâWFFT6öçFW‡D6öç7VÖW"†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"6öçFW‡BÒv÷&´–å&öw&W72çG—S²òòF†RÆöv–2&VÆ÷rf÷"6öçFW‡BF–ffW'2FWVæF–æröâ$ôB÷"DUbÖöFRâ–à¢òòDUbÖöFRÂvR7&VFR6W&FRö&¦V7Bf÷"6öçFW‡Bä6öç7VÖW"F†B7G0¢òòÆ–¶R&÷‡’Fò6öçFW‡BâF†—2&÷‡’ö&¦V7BFG2VææV6W76'’6öFR–â$ô@¢òò6òvRW6RF†RöÆB&V†f–÷W"„6öçFW‡Bä6öç7VÖW"&VfW&Væ6W26öçFW‡B’Fð¢òò&VGV6R6—¦RæB÷fW&†VBâF†R6W&FRö&¦V7B&VfW&Væ6W26öçFW‡Bf–¢òò&÷W'G’6ÆÆVB%ö6öçFW‡B"Âv†–6‚Ç6òv—fW2W2F†R&–Æ—G’Fò6†V6°¢òò–âDUbÖöFR–bF†—2&÷W'G’W†—7G2÷"æ÷BæBv&â–b—BFöW2æ÷Bà ¢°¢–b†6öçFW‡Båö6öçFW‡BÓÓÒVæFVf–æVB’°¢òòF†—2Ö’&R&V6W6R—Bw26öçFW‡B‡&F†W"F†â6öç7VÖW"’à¢òò÷"—BÖ’&R&V6W6R—Bw2öÆFW"&V7Bv†W&RF†W’w&RF†R6ÖRF†–ærà¢òòvRöæÇ’vçBFòv&â–bvRw&R7W&R—Bw2æWr&V7Bà¢–b†6öçFW‡BÓÒ6öçFW‡Bä6öç7VÖW"’°¢–b‚†5v&æVD&÷WEW6–æt6öçFW‡D46öç7VÖW"’°¢†5v&æVD&÷WEW6–æt6öçFW‡D46öç7VÖW"ÒG'VS° ¢W'&÷"‚u&VæFW&–ærÄ6öçFW‡CâF—&V7FÇ’—2æ÷B7W÷'FVBæBv–ÆÂ&R&VÖ÷fVB–âr²vgWGW&RÖ¦÷"&VÆV6RâF–B–÷RÖVâFò&VæFW"Ä6öçFW‡Bä6öç7VÖW#â–ç7FVCòr“°¢Ð¢Ð¢ÒVÇ6R°¢6öçFW‡BÒ6öçFW‡Båö6öçFW‡C°¢Ð¢Ð ¢f"æWu&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"&VæFW"ÒæWu&÷2æ6†–ÆG&Vã° ¢°¢–b‡G—Vöb&VæFW"ÓÒvgVæ7F–öâr’°¢W'&÷"‚t6öçFW‡B6öç7VÖW"v2&VæFW&VBv—F‚×VÇF—ÆR6†–ÆG&VâÂ÷"6†–ÆBr²'F†B—6âwBgVæ7F–öââ6öçFW‡B6öç7VÖW"W‡V7G26–ævÆR6†–ÆB"²wF†B—2gVæ7F–öââ–b–÷RF–B72gVæ7F–öâÂÖ¶R7W&RF†W&Rr²v—2æòG&–Æ–ær÷"ÆVF–ærv†—FW76R&÷VæB—Bâr“°¢Ð¢Ð ¢&W&UFõ&VD6öçFW‡B‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢f"æWufÇVRÒ&VD6öçFW‡B†6öçFW‡B“° ¢°¢Ö&´6ö×öæVçE&VæFW%7F'FVB‡v÷&´–å&öw&W72“°¢Ð ¢f"æWt6†–ÆG&Vã° ¢°¢&V7D7W'&VçD÷væW"Cæ7W'&VçBÒv÷&´–å&öw&W73°¢6WD—5&VæFW&–ær‡G'VR“°¢æWt6†–ÆG&VâÒ&VæFW"†æWufÇVR“°¢6WD—5&VæFW&–ær†fÇ6R“°¢Ð ¢°¢Ö&´6ö×öæVçE&VæFW%7F÷VB‚“°¢Òòò&V7BFWeFööÇ2&VG2F†—2fÆrà  ¢v÷&´–å&öw&W72æfÆw2ÃÒW&f÷&ÖVEv÷&³°¢&V6öæ6–ÆT6†–ÆG&Vâ†7W'&VçBÂv÷&´–å&öw&W72ÂæWt6†–ÆG&VâÂ&VæFW$ÆæW2“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâÖ&µv÷&´–å&öw&W75&V6V—fVEWFFR‚’°¢F–E&V6V—fUWFFRÒG'VS°¢Ð ¢gVæ7F–öâ&W6WE7W7VæFVD7W'&VçDöäÖ÷VçD–äÆVv7”ÖöFR†7W'&VçBÂv÷&´–å&öw&W72’°¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢–b†7W'&VçBÓÒçVÆÂ’°¢òòÆ§’6ö×öæVçBöæÇ’Ö÷VçG2–b—B7W7VæFVB–ç6–FRæöâÐ¢òò6öæ7W'&VçBG&VRÂ–ââ–æ6öç6—7FVçB7FFRâvRvçBFòG&VB—BÆ–¶P¢òòæWrÖ÷VçBÂWfVâF†÷Vv‚âV×G’fW'6–öâöb—BÇ&VG’6öÖÖ—GFVBà¢òòF—66öææV7BF†RÇFW&æFRö–çFW'2à¢7W'&VçBæÇFW&æFRÒçVÆÃ°¢v÷&´–å&öw&W72æÇFW&æFRÒçVÆÃ²òò6–æ6RF†—2—26öæ6WGVÆÇ’æWrf–&W"Â66†VGVÆRÆ6VÖVçBVffV7@ ¢v÷&´–å&öw&W72æfÆw2ÃÒÆ6VÖVçC°¢Ð¢Ð¢Ð ¢gVæ7F–öâ&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢–b†7W'&VçBÓÒçVÆÂ’°¢òò&WW6R&Wf–÷W2FWVæFVæ6–W0¢v÷&´–å&öw&W72æFWVæFVæ6–W2Ò7W'&VçBæFWVæFVæ6–W3°¢Ð ¢°¢òòFöâwBWFFR&&6R"&VæFW"F–ÖW2f÷"&–Æ÷WG2à¢7F÷&öf–ÆW%F–ÖW$–e'Vææ–ær‚“°¢Ð ¢Ö&µ6¶—VEWFFTÆæW2‡v÷&´–å&öw&W72æÆæW2“²òò6†V6²–bF†R6†–ÆG&Vâ†fRç’VæF–ærv÷&²à ¢–b‚–æ6ÇVFW56öÖTÆæR‡&VæFW$ÆæW2Âv÷&´–å&öw&W72æ6†–ÆDÆæW2’’°¢òòF†R6†–ÆG&VâFöâwB†fRç’v÷&²V—F†W"âvR6â6¶—F†VÒà¢òòDôDó¢öæ6RvRFB&6²&W7VÖ–ærÂvR6†÷VÆB6†V6²–bF†R6†–ÆG&Vâ&P¢òòv÷&²Ö–â×&öw&W726WBâ–b6òÂvRæVVBFòG&ç6fW"F†V—"VffV7G2à¢°¢&WGW&âçVÆÃ°¢Ð¢ÒòòF†—2f–&W"FöW6âwB†fRv÷&²Â'WB—G27V'G&VRFöW2â6ÆöæRF†R6†–Æ@¢òòf–&W'2æB6öçF–çVRà  ¢6ÆöæT6†–ÆDf–&W'2†7W'&VçBÂv÷&´–å&öw&W72“°¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢gVæ7F–öâ&VÖ÷VçDf–&W"†7W'&VçBÂöÆEv÷&´–å&öw&W72ÂæWuv÷&´–å&öw&W72’°¢°¢f"&WGW&äf–&W"ÒöÆEv÷&´–å&öw&W72ç&WGW&ã° ¢–b‡&WGW&äf–&W"ÓÓÒçVÆÂ’°¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂ÷&öBÖW'&÷"Ö6öFW0¢F‡&÷ræWrW'&÷"‚t6ææ÷B7vF†R&ö÷Bf–&W"âr“°¢ÒòòF—66öææV7Bg&öÒF†RöÆB7W'&VçBà¢òò—Bv–ÆÂvWBFVÆWFVBà  ¢7W'&VçBæÇFW&æFRÒçVÆÃ°¢öÆEv÷&´–å&öw&W72æÇFW&æFRÒçVÆÃ²òò6öææV7BFòF†RæWrG&VRà ¢æWuv÷&´–å&öw&W72æ–æFW‚ÒöÆEv÷&´–å&öw&W72æ–æFWƒ°¢æWuv÷&´–å&öw&W72ç6–&Æ–ærÒöÆEv÷&´–å&öw&W72ç6–&Æ–æs°¢æWuv÷&´–å&öw&W72ç&WGW&âÒöÆEv÷&´–å&öw&W72ç&WGW&ã°¢æWuv÷&´–å&öw&W72ç&VbÒöÆEv÷&´–å&öw&W72ç&Vc²òò&WÆ6RF†R6†–ÆB÷6–&Æ–ærö–çFW'2&÷fR—Bà ¢–b†öÆEv÷&´–å&öw&W72ÓÓÒ&WGW&äf–&W"æ6†–ÆB’°¢&WGW&äf–&W"æ6†–ÆBÒæWuv÷&´–å&öw&W73°¢ÒVÇ6R°¢f"&We6–&Æ–ærÒ&WGW&äf–&W"æ6†–ÆC° ¢–b‡&We6–&Æ–ærÓÓÒçVÆÂ’°¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂ÷&öBÖW'&÷"Ö6öFW0¢F‡&÷ræWrW'&÷"‚tW‡V7FVB&VçBFò†fR6†–ÆBâr“°¢Ð ¢v†–ÆR‡&We6–&Æ–ærç6–&Æ–ærÓÒöÆEv÷&´–å&öw&W72’°¢&We6–&Æ–ærÒ&We6–&Æ–ærç6–&Æ–æs° ¢–b‡&We6–&Æ–ærÓÓÒçVÆÂ’°¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂ÷&öBÖW'&÷"Ö6öFW0¢F‡&÷ræWrW'&÷"‚tW‡V7FVBFòf–æBF†R&Wf–÷W26–&Æ–ærâr“°¢Ð¢Ð ¢&We6–&Æ–ærç6–&Æ–ærÒæWuv÷&´–å&öw&W73°¢ÒòòFVÆWFRF†RöÆBf–&W"æBÆ6RF†RæWröæRà¢òò6–æ6RF†RöÆBf–&W"—2F—66öææV7FVBÂvR†fRFò66†VGVÆR—BÖçVÆÇ’à  ¢f"FVÆWF–öç2Ò&WGW&äf–&W"æFVÆWF–öç3° ¢–b†FVÆWF–öç2ÓÓÒçVÆÂ’°¢&WGW&äf–&W"æFVÆWF–öç2Ò¶7W'&VçEÓ°¢&WGW&äf–&W"æfÆw2ÃÒ6†–ÆDFVÆWF–öã°¢ÒVÇ6R°¢FVÆWF–öç2çW6‚†7W'&VçB“°¢Ð ¢æWuv÷&´–å&öw&W72æfÆw2ÃÒÆ6VÖVçC²òò&W7F'Bv÷&²g&öÒF†RæWrf–&W"à ¢&WGW&âæWuv÷&´–å&öw&W73°¢Ð¢Ð ¢gVæ7F–öâ6†V6µ66†VGVÆVEWFFT÷$6öçFW‡B†7W'&VçBÂ&VæFW$ÆæW2’°¢òò&Vf÷&RW&f÷&Ö–ærâV&Ç’&–Æ÷WBÂvR×W7B6†V6²–bF†W&R&RVæF–æp¢òòWFFW2÷"6öçFW‡Bà¢f"WFFTÆæW2Ò7W'&VçBæÆæW3° ¢–b†–æ6ÇVFW56öÖTÆæR‡WFFTÆæW2Â&VæFW$ÆæW2’’°¢&WGW&âG'VS°¢ÒòòæòVæF–ærWFFRÂ'WB&V6W6R6öçFW‡B—2&÷vFVBÆ¦–Ç’ÂvRæVV@ ¢&WGW&âfÇ6S°¢Ð ¢gVæ7F–öâGFV×DV&Ç”&–Æ÷WD–dæõ66†VGVÆVEWFFR†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢òòF†—2f–&W"FöW2æ÷B†fRç’VæF–ærv÷&²â&–Æ÷WBv—F†÷WBVçFW&–æp¢òòF†R&Vv–â†6RâF†W&Rw27F–ÆÂ6öÖR&öö¶¶VW–ærvRF†BæVVG2Fò&RFöæP¢òò–âF†—2÷F–Ö—¦VBF‚ÂÖ÷7FÇ’W6†–ær7GVfböçFòF†R7F6²à¢7v—F6‚‡v÷&´–å&öw&W72çFr’°¢66R†÷7E&ö÷C ¢W6„†÷7E&ö÷D6öçFW‡B‡v÷&´–å&öw&W72“°¢f"&ö÷BÒv÷&´–å&öw&W72ç7FFTæöFS° ¢&W6WD‡–G&F–öå7FFR‚“°¢'&V³° ¢66R†÷7D6ö×öæVçC ¢W6„†÷7D6öçFW‡B‡v÷&´–å&öw&W72“°¢'&V³° ¢66R6Æ746ö×öæVçC ¢°¢f"6ö×öæVçBÒv÷&´–å&öw&W72çG—S° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢W6„6öçFW‡E&÷f–FW"‡v÷&´–å&öw&W72“°¢Ð ¢'&V³°¢Ð ¢66R†÷7E÷'FÃ ¢W6„†÷7D6öçF–æW"‡v÷&´–å&öw&W72Âv÷&´–å&öw&W72ç7FFTæöFRæ6öçF–æW$–æfò“°¢'&V³° ¢66R6öçFW‡E&÷f–FW# ¢°¢f"æWufÇVRÒv÷&´–å&öw&W72æÖVÖö—¦VE&÷2çfÇVS°¢f"6öçFW‡BÒv÷&´–å&öw&W72çG—Råö6öçFW‡C°¢W6…&÷f–FW"‡v÷&´–å&öw&W72Â6öçFW‡BÂæWufÇVR“°¢'&V³°¢Ð ¢66R&öf–ÆW# ¢°¢òò&öf–ÆW"6†÷VÆBöæÇ’6ÆÂöå&VæFW"v†VâöæRöb—G2FW66VæFçG27GVÆÇ’&VæFW&VBà¢f"†46†–ÆEv÷&²Ò–æ6ÇVFW56öÖTÆæR‡&VæFW$ÆæW2Âv÷&´–å&öw&W72æ6†–ÆDÆæW2“° ¢–b††46†–ÆEv÷&²’°¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS°¢Ð ¢°¢òò&W6WBVffV7BGW&F–öç2f÷"F†RæW‡BWfVçGVÂVffV7B†6Rà¢òòF†W6R&R&W6WBGW&–ær&VæFW"FòÆÆ÷rF†RFWeFööÇ26öÖÖ—B†öö²6†æ6RFò&VBF†VÒÀ¢f"7FFTæöFRÒv÷&´–å&öw&W72ç7FFTæöFS°¢7FFTæöFRæVffV7DGW&F–öâÒ°¢7FFTæöFRç76—fTVffV7DGW&F–öâÒ°¢Ð¢Ð ¢'&V³° ¢66R7W7Vç6T6ö×öæVçC ¢°¢f"7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS° ¢–b‡7FFRÓÒçVÆÂ’°¢–b‡7FFRæFV‡–G&FVBÓÒçVÆÂ’°¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â6WDFVfVÇE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6U7F6´7W'6÷"æ7W'&VçB’“²òòvR¶æ÷rF†BF†—26ö×öæVçBv–ÆÂ7W7VæBv–â&V6W6R–b—B†0¢òò&VVâVç7W7VæFVB—B†26öÖÖ—GFVB2&W6öÇfVB7W7Vç6R6ö×öæVçBà¢òò–b—BæVVG2Fò&R&WG&–VBÂ—B6†÷VÆB†fRv÷&²66†VGVÆVBöâ—Bà ¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S²òòvR6†÷VÆBæWfW"&VæFW"F†R6†–ÆG&VâöbFV‡–G&FVB&÷VæF'’VçF–ÂvP¢òòWw&FR—BâvR&WGW&âçVÆÂ–ç7FVBöb&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²à ¢&WGW&âçVÆÃ°¢Òòò–bF†—2&÷VæF'’—27W'&VçFÇ’F–ÖVB÷WBÂvRæVVBFòFV6–FP¢òòv†WF†W"Fò&WG'’F†R&–Ö'’6†–ÆG&VâÂ÷"Fò6¶—÷fW"—Bæ@¢òòvò7G&–v‡BFòF†RfÆÆ&6²â6†V6²F†R&–÷&—G’öbF†R&–Ö'¢òò6†–ÆBg&vÖVçBà  ¢f"&–Ö'”6†–ÆDg&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC°¢f"&–Ö'”6†–ÆDÆæW2Ò&–Ö'”6†–ÆDg&vÖVçBæ6†–ÆDÆæW3° ¢–b†–æ6ÇVFW56öÖTÆæR‡&VæFW$ÆæW2Â&–Ö'”6†–ÆDÆæW2’’°¢òòF†R&–Ö'’6†–ÆG&Vâ†fRVæF–ærv÷&²âW6RF†Ræ÷&ÖÂF€¢òòFòGFV×BFò&VæFW"F†R&–Ö'’6†–ÆG&Vâv–âà¢&WGW&âWFFU7W7Vç6T6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢ÒVÇ6R°¢òòF†R&–Ö'’6†–ÆBg&vÖVçBFöW2æ÷B†fRVæF–ærv÷&²Ö&¶V@¢òòöâ—@¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â6WDFVfVÇE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6U7F6´7W'6÷"æ7W'&VçB’“²òòF†R&–Ö'’6†–ÆG&VâFòæ÷B†fRVæF–ærv÷&²v—F‚7Vff–6–Vç@¢òò&–÷&—G’â&–Æ÷WBà ¢f"6†–ÆBÒ&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢–b†6†–ÆBÓÒçVÆÂ’°¢òòF†RfÆÆ&6²6†–ÆG&Vâ†fRVæF–ærv÷&²â6¶—÷fW"F†P¢òò&–Ö'’6†–ÆG&VâæBv÷&²öâF†RfÆÆ&6²à¢&WGW&â6†–ÆBç6–&Æ–æs°¢ÒVÇ6R°¢òòæ÷FS¢vR6â&WGW&âçVÆÆ†W&R&V6W6RvRÇ&VG’6†V6¶V@¢òòv†WF†W"F†W&RvW&RæW7FVB6öçFW‡B6öç7VÖW'2Âf–F†R6ÆÂFð¢òò&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&¶&÷fRà¢&WGW&âçVÆÃ°¢Ð¢Ð¢ÒVÇ6R°¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â6WDFVfVÇE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6U7F6´7W'6÷"æ7W'&VçB’“°¢Ð ¢'&V³°¢Ð ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢°¢f"F–E7W7VæD&Vf÷&RÒ†7W'&VçBæfÆw2bF–D6GW&R’ÓÒæôfÆw3° ¢f"ö†46†–ÆEv÷&²Ò–æ6ÇVFW56öÖTÆæR‡&VæFW$ÆæW2Âv÷&´–å&öw&W72æ6†–ÆDÆæW2“° ¢–b†F–E7W7VæD&Vf÷&R’°¢–b…ö†46†–ÆEv÷&²’°¢òò–b6öÖWF†–ærv2–âfÆÆ&6²7FFRÆ7BF–ÖRÂæBvR†fRÆÂF†P¢òò6ÖR6†–ÆG&VâF†VâvRw&R7F–ÆÂ–â&öw&W76—fRÆöF–ær7FFRà¢òò6öÖWF†–ærÖ–v‡BvWBVæ&Æö6¶VB'’7FFRWFFW2÷"&WG&–W2–âF†P¢òòG&VRv†–6‚v–ÆÂffV7BF†RF–Ââ6òvRæVVBFòW6RF†Ræ÷&ÖÀ¢òòF‚Fò6ö×WFRF†R6÷'&V7BF–Âà¢&WGW&âWFFU7W7Vç6TÆ—7D6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Òòò–bæöæRöbF†R6†–ÆG&Vâ†Bç’v÷&²ÂF†BÖVç2F†BæöæRö`¢òòF†VÒv÷B&WG&–VB6òF†W’vÆÂ7F–ÆÂ&R&Æö6¶VB–âF†R6ÖRv¢òò2&Vf÷&RâvR6âf7B&–Â÷WBà  ¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢Òòò–bæ÷F†–ær7W7VæFVB&Vf÷&RæBvRw&R&VæFW&–ærF†R6ÖR6†–ÆG&VâÀ¢òòF†VâF†RF–ÂFöW6âwBÖGFW"âç—F†–æræWrF†B7W7VæG2v–ÆÂv÷&°¢òò–âF†R'FövWF†W""ÖöFRÂ6òvR6â6öçF–çVRg&öÒF†R7FFRvR†Bà  ¢f"&VæFW%7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS° ¢–b‡&VæFW%7FFRÓÒçVÆÂ’°¢òò&W6WBFòF†R'FövWF†W""ÖöFR–â66RvRwfR7F'FVBF–ffW&Vç@¢òòWFFR–âF†R7B'WBF–FâwB6ö×ÆWFR—Bà¢&VæFW%7FFRç&VæFW&–ærÒçVÆÃ°¢&VæFW%7FFRçF–ÂÒçVÆÃ°¢&VæFW%7FFRæÆ7DVffV7BÒçVÆÃ°¢Ð ¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â7W7Vç6U7F6´7W'6÷"æ7W'&VçB“° ¢–b…ö†46†–ÆEv÷&²’°¢'&V³°¢ÒVÇ6R°¢òò–bæöæRöbF†R6†–ÆG&Vâ†Bç’v÷&²ÂF†BÖVç2F†BæöæRö`¢òòF†VÒv÷B&WG&–VB6òF†W’vÆÂ7F–ÆÂ&R&Æö6¶VB–âF†R6ÖRv¢òò2&Vf÷&RâvR6âf7B&–Â÷WBà¢&WGW&âçVÆÃ°¢Ð¢Ð ¢66Röfg67&VVä6ö×öæVçC ¢66RÆVv7”†–FFVä6ö×öæVçC ¢°¢òòæVVBFò6†V6²–bF†RG&VR7F–ÆÂæVVG2Fò&RFVfW'&VBâF†—2—0¢òòÆÖ÷7B–FVçF–6ÂFòF†RÆöv–2W6VB–âF†Ræ÷&ÖÂWFFRF‚À¢òò6òvRvÆÂ§W7BVçFW"F†BâF†RöæÇ’F–ffW&Væ6R—2vRvÆÂ&–Â÷W@¢òòBF†RæW‡BÆWfVÂ–ç7FVBöbF†—2öæRÂ&V6W6RF†R6†–ÆB&÷0¢òò†fRæ÷B6†ævVBâv†–6‚—2f–æRà¢òòDôDó¢&ö&&Ç’6†÷VÆB&Vf7F÷"&Vv–åv÷&¶Fò7Æ—BF†R&–Æ÷W@¢òòF‚g&öÒF†Ræ÷&ÖÂF‚â’vÒFV×FVBFòFòÆ&VÆVB'&V²†W&P¢òò'WB’vöâwB¢¢v÷&´–å&öw&W72æÆæW2ÒæôÆæW3°¢&WGW&âWFFTöfg67&VVä6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð¢Ð ¢&WGW&â&–Æ÷WDöäÇ&VG”f–æ—6†VEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð ¢gVæ7F–öâ&Vv–åv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢°¢–b‡v÷&´–å&öw&W72åöFV'VtæVVG5&VÖ÷VçBbb7W'&VçBÓÒçVÆÂ’°¢òòF†—2v–ÆÂ&W7F'BF†R&Vv–â†6Rv—F‚æWrf–&W"à¢&WGW&â&VÖ÷VçDf–&W"†7W'&VçBÂv÷&´–å&öw&W72Â7&VFTf–&W$g&öÕG—TæE&÷2‡v÷&´–å&öw&W72çG—RÂv÷&´–å&öw&W72æ¶W’Âv÷&´–å&öw&W72çVæF–æu&÷2Âv÷&´–å&öw&W72åöFV'Vt÷væW"ÇÂçVÆÂÂv÷&´–å&öw&W72æÖöFRÂv÷&´–å&öw&W72æÆæW2’“°¢Ð¢Ð ¢–b†7W'&VçBÓÒçVÆÂ’°¢f"öÆE&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3°¢f"æWu&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3° ¢–b†öÆE&÷2ÓÒæWu&÷2ÇÂ†46öçFW‡D6†ævVB‚’ÇÂ‚òòf÷&6R&R×&VæFW"–bF†R–×ÆVÖVçFF–öâ6†ævVBGVRFò†÷B&VÆöC ¢v÷&´–å&öw&W72çG—RÓÒ7W'&VçBçG—R’’°¢òò–b&÷2÷"6öçFW‡B6†ævVBÂÖ&²F†Rf–&W"2†f–ærW&f÷&ÖVBv÷&²à¢òòF†—2Ö’&RVç6WB–bF†R&÷2&RFWFW&Ö–æVBFò&RWVÂÆFW"†ÖVÖò’à¢F–E&V6V—fUWFFRÒG'VS°¢ÒVÇ6R°¢òòæV—F†W"&÷2æ÷"ÆVv7’6öçFW‡B6†ævW2â6†V6²–bF†W&Rw2VæF–æp¢òòWFFR÷"6öçFW‡B6†ævRà¢f"†566†VGVÆVEWFFT÷$6öçFW‡BÒ6†V6µ66†VGVÆVEWFFT÷$6öçFW‡B†7W'&VçBÂ&VæFW$ÆæW2“° ¢–b‚†566†VGVÆVEWFFT÷$6öçFW‡Bbbòò–bF†—2—2F†R6V6öæB72öbâW'&÷"÷"7W7Vç6R&÷VæF'’ÂF†W&P¢òòÖ’æ÷B&Rv÷&²66†VGVÆVBöâ7W'&VçFÂ6òvR6†V6²f÷"F†—2fÆrà¢‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÓÒæôfÆw2’°¢òòæòVæF–ærWFFW2÷"6öçFW‡Bâ&–Â÷WBæ÷rà¢F–E&V6V—fUWFFRÒfÇ6S°¢&WGW&âGFV×DV&Ç”&–Æ÷WD–dæõ66†VGVÆVEWFFR†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð ¢–b‚†7W'&VçBæfÆw2bf÷&6UWFFTf÷$ÆVv7•7W7Vç6R’ÓÒæôfÆw2’°¢òòF†—2—27V6–Â66RF†BöæÇ’W†—7G2f÷"ÆVv7’ÖöFRà¢òò6VR‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7B÷VÆÂó“#bà¢F–E&V6V—fUWFFRÒG'VS°¢ÒVÇ6R°¢òòâWFFRv266†VGVÆVBöâF†—2f–&W"Â'WBF†W&R&RæòæWr&÷0¢òòæ÷"ÆVv7’6öçFW‡Bâ6WBF†—2FòfÇ6Râ–bâWFFRVWVR÷"6öçFW‡@¢òò6öç7VÖW"&öGV6W26†ævVBfÇVRÂ—Bv–ÆÂ6WBF†—2FòG'VRâ÷F†W'v—6RÀ¢òòF†R6ö×öæVçBv–ÆÂ77VÖRF†R6†–ÆG&Vâ†fRæ÷B6†ævVBæB&–Â÷WBà¢F–E&V6V—fUWFFRÒfÇ6S°¢Ð¢Ð¢ÒVÇ6R°¢F–E&V6V—fUWFFRÒfÇ6S° ¢–b†vWD—4‡–G&F–ær‚’bb—4f÷&¶VD6†–ÆB‡v÷&´–å&öw&W72’’°¢òò6†V6²–bF†—26†–ÆB&VÆöæw2FòÆ—7Böb×VÆ—ÆR6†–ÆG&Vâ–à¢òò—G2&VçBà¢òð¢òò–âG'VR×VÇF’×F‡&VFVB–×ÆVÖVçFF–öâÂvRv÷VÆB&VæFW"6†–ÆG&Vâöà¢òò&ÆÆVÂF‡&VG2âF†—2v÷VÆB&W&W6VçBF†R&Vv–ææ–æröbæWr&VæFW ¢òòF‡&VBf÷"F†—27V'G&VRà¢òð¢òòvRöæÇ’W6RF†—2f÷"–BvVæW&F–öâGW&–ær‡–G&F–öâÂv†–6‚—2v‡’F†P¢òòÆöv–2—2Æö6FVB–âF†—27V6–Â'&æ6‚à¢f"6Æ÷D–æFW‚Òv÷&´–å&öw&W72æ–æFWƒ°¢f"çVÖ&W$ödf÷&·2ÒvWDf÷&·4DÆWfVÂ‚“°¢W6…G&VT–B‡v÷&´–å&öw&W72ÂçVÖ&W$ödf÷&·2Â6Æ÷D–æFW‚“°¢Ð¢Òòò&Vf÷&RVçFW&–ærF†R&Vv–â†6RÂ6ÆV"VæF–ærWFFR&–÷&—G’à¢òòDôDó¢F†—277VÖW2F†BvRw&R&÷WBFòWfÇVFRF†R6ö×öæVçBæB&ö6W70¢òòF†RWFFRVWVRâ†÷vWfW"ÂF†W&Rw2âW†6WF–öã¢6–×ÆTÖVÖô6ö×öæVç@¢òò6öÖWF–ÖW2&–Ç2÷WBÆFW"–âF†R&Vv–â†6RâF†—2–æF–6FW2F†BvR6†÷VÆ@¢òòÖ÷fRF†—276–væÖVçB÷WBöbF†R6öÖÖöâF‚æB–çFòV6‚'&æ6‚à  ¢v÷&´–å&öw&W72æÆæW2ÒæôÆæW3° ¢7v—F6‚‡v÷&´–å&öw&W72çFr’°¢66R–æFWFW&Ö–æFT6ö×öæVçC ¢°¢&WGW&âÖ÷VçD–æFWFW&Ö–æFT6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Âv÷&´–å&öw&W72çG—RÂ&VæFW$ÆæW2“°¢Ð ¢66RÆ§”6ö×öæVçC ¢°¢f"VÆVÖVçEG—RÒv÷&´–å&öw&W72æVÆVÖVçEG—S°¢&WGW&âÖ÷VçDÆ§”6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72ÂVÆVÖVçEG—RÂ&VæFW$ÆæW2“°¢Ð ¢66RgVæ7F–öä6ö×öæVçC ¢°¢f"6ö×öæVçBÒv÷&´–å&öw&W72çG—S°¢f"Vç&W6öÇfVE&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3°¢f"&W6öÇfVE&÷2Òv÷&´–å&öw&W72æVÆVÖVçEG—RÓÓÒ6ö×öæVçBòVç&W6öÇfVE&÷2¢&W6öÇfTFVfVÇE&÷2„6ö×öæVçBÂVç&W6öÇfVE&÷2“°¢&WGW&âWFFTgVæ7F–öä6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â6ö×öæVçBÂ&W6öÇfVE&÷2Â&VæFW$ÆæW2“°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢f"ô6ö×öæVçBÒv÷&´–å&öw&W72çG—S°¢f"÷Vç&W6öÇfVE&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3° ¢f"÷&W6öÇfVE&÷2Òv÷&´–å&öw&W72æVÆVÖVçEG—RÓÓÒô6ö×öæVçBò÷Vç&W6öÇfVE&÷2¢&W6öÇfTFVfVÇE&÷2…ô6ö×öæVçBÂ÷Vç&W6öÇfVE&÷2“° ¢&WGW&âWFFT6Æ746ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Âô6ö×öæVçBÂ÷&W6öÇfVE&÷2Â&VæFW$ÆæW2“°¢Ð ¢66R†÷7E&ö÷C ¢&WGW&âWFFT†÷7E&ö÷B†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66R†÷7D6ö×öæVçC ¢&WGW&âWFFT†÷7D6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66R†÷7EFW‡C ¢&WGW&âWFFT†÷7EFW‡B†7W'&VçBÂv÷&´–å&öw&W72“° ¢66R7W7Vç6T6ö×öæVçC ¢&WGW&âWFFU7W7Vç6T6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66R†÷7E÷'FÃ ¢&WGW&âWFFU÷'FÄ6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66Rf÷'v&E&Vc ¢°¢f"G—RÒv÷&´–å&öw&W72çG—S°¢f"÷Vç&W6öÇfVE&÷3"Òv÷&´–å&öw&W72çVæF–æu&÷3° ¢f"÷&W6öÇfVE&÷3"Òv÷&´–å&öw&W72æVÆVÖVçEG—RÓÓÒG—Rò÷Vç&W6öÇfVE&÷3"¢&W6öÇfTFVfVÇE&÷2‡G—RÂ÷Vç&W6öÇfVE&÷3"“° ¢&WGW&âWFFTf÷'v&E&Vb†7W'&VçBÂv÷&´–å&öw&W72ÂG—RÂ÷&W6öÇfVE&÷3"Â&VæFW$ÆæW2“°¢Ð ¢66Rg&vÖVçC ¢&WGW&âWFFTg&vÖVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66RÖöFS ¢&WGW&âWFFTÖöFR†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66R&öf–ÆW# ¢&WGW&âWFFU&öf–ÆW"†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66R6öçFW‡E&÷f–FW# ¢&WGW&âWFFT6öçFW‡E&÷f–FW"†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66R6öçFW‡D6öç7VÖW# ¢&WGW&âWFFT6öçFW‡D6öç7VÖW"†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“° ¢66RÖVÖô6ö×öæVçC ¢°¢f"÷G—S"Òv÷&´–å&öw&W72çG—S°¢f"÷Vç&W6öÇfVE&÷32Òv÷&´–å&öw&W72çVæF–æu&÷3²òò&W6öÇfR÷WFW"&÷2f—'7BÂF†Vâ&W6öÇfR–ææW"&÷2à ¢f"÷&W6öÇfVE&÷32Ò&W6öÇfTFVfVÇE&÷2…÷G—S"Â÷Vç&W6öÇfVE&÷32“° ¢°¢–b‡v÷&´–å&öw&W72çG—RÓÒv÷&´–å&öw&W72æVÆVÖVçEG—R’°¢f"÷WFW%&÷G—W2Ò÷G—S"ç&÷G—W3° ¢–b†÷WFW%&÷G—W2’°¢6†V6µ&÷G—W2†÷WFW%&÷G—W2Â÷&W6öÇfVE&÷32Âòò&W6öÇfVBf÷"÷WFW"öæÇ¢w&÷rÂvWD6ö×öæVçDæÖTg&öÕG—R…÷G—S"’“°¢Ð¢Ð¢Ð ¢÷&W6öÇfVE&÷32Ò&W6öÇfTFVfVÇE&÷2…÷G—S"çG—RÂ÷&W6öÇfVE&÷32“°¢&WGW&âWFFTÖVÖô6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â÷G—S"Â÷&W6öÇfVE&÷32Â&VæFW$ÆæW2“°¢Ð ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢&WGW&âWFFU6–×ÆTÖVÖô6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Âv÷&´–å&öw&W72çG—RÂv÷&´–å&öw&W72çVæF–æu&÷2Â&VæFW$ÆæW2“°¢Ð ¢66R–æ6ö×ÆWFT6Æ746ö×öæVçC ¢°¢f"ô6ö×öæVçC"Òv÷&´–å&öw&W72çG—S°¢f"÷Vç&W6öÇfVE&÷3BÒv÷&´–å&öw&W72çVæF–æu&÷3° ¢f"÷&W6öÇfVE&÷3BÒv÷&´–å&öw&W72æVÆVÖVçEG—RÓÓÒô6ö×öæVçC"ò÷Vç&W6öÇfVE&÷3B¢&W6öÇfTFVfVÇE&÷2…ô6ö×öæVçC"Â÷Vç&W6öÇfVE&÷3B“° ¢&WGW&âÖ÷VçD–æ6ö×ÆWFT6Æ746ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Âô6ö×öæVçC"Â÷&W6öÇfVE&÷3BÂ&VæFW$ÆæW2“°¢Ð ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢°¢&WGW&âWFFU7W7Vç6TÆ—7D6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð ¢66R66÷T6ö×öæVçC ¢° ¢'&V³°¢Ð ¢66Röfg67&VVä6ö×öæVçC ¢°¢&WGW&âWFFTöfg67&VVä6ö×öæVçB†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2“°¢Ð¢Ð ¢F‡&÷ræWrW'&÷"‚%Væ¶æ÷vâVæ—Böbv÷&²Fr‚"²v÷&´–å&öw&W72çFr²"’âF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’'Vr–â"²u&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢gVæ7F–öâÖ&µWFFR‡v÷&´–å&öw&W72’°¢òòFrF†Rf–&W"v—F‚âWFFRVffV7BâF†—2GW&ç2Æ6VÖVçB–çFð¢òòÆ6VÖVçDæEWFFRà¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS°¢Ð ¢gVæ7F–öâÖ&µ&VbC‡v÷&´–å&öw&W72’°¢v÷&´–å&öw&W72æfÆw2ÃÒ&Vc° ¢°¢v÷&´–å&öw&W72æfÆw2ÃÒ&Ve7FF–3°¢Ð¢Ð ¢f"VæDÆÄ6†–ÆG&Vã°¢f"WFFT†÷7D6öçF–æW#°¢f"WFFT†÷7D6ö×öæVçBC°¢f"WFFT†÷7EFW‡BC° ¢°¢òò×WFF–öâÖöFP¢VæDÆÄ6†–ÆG&VâÒgVæ7F–öâ‡&VçBÂv÷&´–å&öw&W72ÂæVVG5f—6–&–Æ—G•FövvÆRÂ—4†–FFVâ’°¢òòvRöæÇ’†fRF†RF÷f–&W"F†Bv27&VFVB'WBvRæVVB&V7W'6RF÷vâ—G0¢òò6†–ÆG&VâFòf–æBÆÂF†RFW&Ö–æÂæöFW2à¢f"æöFRÒv÷&´–å&öw&W72æ6†–ÆC° ¢v†–ÆR†æöFRÓÒçVÆÂ’°¢–b†æöFRçFrÓÓÒ†÷7D6ö×öæVçBÇÂæöFRçFrÓÓÒ†÷7EFW‡B’°¢VæD–æ—F–Ä6†–ÆB‡&VçBÂæöFRç7FFTæöFR“°¢ÒVÇ6R–b†æöFRçFrÓÓÒ†÷7E÷'FÂ’²VÇ6R–b†æöFRæ6†–ÆBÓÒçVÆÂ’°¢æöFRæ6†–ÆBç&WGW&âÒæöFS°¢æöFRÒæöFRæ6†–ÆC°¢6öçF–çVS°¢Ð ¢–b†æöFRÓÓÒv÷&´–å&öw&W72’°¢&WGW&ã°¢Ð ¢v†–ÆR†æöFRç6–&Æ–ærÓÓÒçVÆÂ’°¢–b†æöFRç&WGW&âÓÓÒçVÆÂÇÂæöFRç&WGW&âÓÓÒv÷&´–å&öw&W72’°¢&WGW&ã°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð ¢æöFRç6–&Æ–ærç&WGW&âÒæöFRç&WGW&ã°¢æöFRÒæöFRç6–&Æ–æs°¢Ð¢Ó° ¢WFFT†÷7D6öçF–æW"ÒgVæ7F–öâ†7W'&VçBÂv÷&´–å&öw&W72’²òòæö÷ ¢Ó° ¢WFFT†÷7D6ö×öæVçBCÒgVæ7F–öâ†7W'&VçBÂv÷&´–å&öw&W72ÂG—RÂæWu&÷2Â&ö÷D6öçF–æW$–ç7Fæ6R’°¢òò–bvR†fRâÇFW&æFRÂF†BÖVç2F†—2—2âWFFRæBvRæVVBFð¢òò66†VGVÆR6–FRÖVffV7BFòFòF†RWFFW2à¢f"öÆE&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3° ¢–b†öÆE&÷2ÓÓÒæWu&÷2’°¢òò–â×WFF–öâÖöFRÂF†—2—27Vff–6–VçBf÷"&–Æ÷WB&V6W6P¢òòvRvöâwBF÷V6‚F†—2æöFRWfVâ–b6†–ÆG&Vâ6†ævVBà¢&WGW&ã°¢Òòò–bvRvWBWFFVB&V6W6RöæRöb÷W"6†–ÆG&VâWFFVBÂvRFöâw@¢òò†fRæWu&÷26òvRvÆÂ†fRFò&WW6RF†VÒà¢òòDôDó¢7Æ—BF†RWFFR’26W&FRf÷"F†R&÷2g2â6†–ÆG&Vâà¢òòWfVâ&WGFW"v÷VÆB&R–b6†–ÆG&VâvW&VâwB7V6–Â66VBBÆÂF†òà  ¢f"–ç7Fæ6RÒv÷&´–å&öw&W72ç7FFTæöFS°¢f"7W'&VçD†÷7D6öçFW‡BÒvWD†÷7D6öçFW‡B‚“²òòDôDó¢W‡W&–Væ6–ærâW'&÷"v†W&RöÆE&÷2—2çVÆÂâ7VvvW7G2†÷7@¢òò6ö×öæVçB—2†—GF–ærF†R&W7VÖRF‚âf–wW&R÷WBv‡’â÷76–&Ç¢òò&VÆFVBFò†–FFVæà ¢f"WFFU–ÆöBÒ&W&UWFFR†–ç7Fæ6RÂG—RÂöÆE&÷2ÂæWu&÷2Â&ö÷D6öçF–æW$–ç7Fæ6RÂ7W'&VçD†÷7D6öçFW‡B“²òòDôDó¢G—RF†—27V6–f–2FòF†—2G—Röb6ö×öæVçBà ¢v÷&´–å&öw&W72çWFFUVWVRÒWFFU–ÆöC²òò–bF†RWFFR–ÆöB–æF–6FW2F†BF†W&R—26†ævR÷"–bF†W&P¢òò—2æWr&VbvRÖ&²F†—22âWFFRâÆÂF†Rv÷&²—2FöæR–â6öÖÖ—Ev÷&²à ¢–b‡WFFU–ÆöB’°¢Ö&µWFFR‡v÷&´–å&öw&W72“°¢Ð¢Ó° ¢WFFT†÷7EFW‡BCÒgVæ7F–öâ†7W'&VçBÂv÷&´–å&öw&W72ÂöÆEFW‡BÂæWuFW‡B’°¢òò–bF†RFW‡BF–ffW'2ÂÖ&²—B2âWFFRâÆÂF†Rv÷&²–âFöæR–â6öÖÖ—Ev÷&²à¢–b†öÆEFW‡BÓÒæWuFW‡B’°¢Ö&µWFFR‡v÷&´–å&öw&W72“°¢Ð¢Ó°¢Ð ¢gVæ7F–öâ7WDöfeF–Ä–dæVVFVB‡&VæFW%7FFRÂ†5&VæFW&VDF–ÄfÆÆ&6²’°¢–b†vWD—4‡–G&F–ær‚’’°¢òò–bvRw&R‡–G&F–ærÂvR6†÷VÆB6öç7VÖR2Öç’—FV×22vR6à¢òò6òvRFöâwBÆVfRç’&V†–æBà¢&WGW&ã°¢Ð ¢7v—F6‚‡&VæFW%7FFRçF–ÄÖöFR’°¢66Rv†–FFVâs ¢°¢òòç’–ç6W'F–öç2BF†RVæBöbF†RF–ÂÆ—7BgFW"F†—2ö–ç@¢òò6†÷VÆB&R–çf—6–&ÆRâ–bF†W&R&RÇ&VG’Ö÷VçFVB&÷VæF&–W0¢òòç—F†–ær&Vf÷&RF†VÒ&Ræ÷B6öç6–FW&VBf÷"6öÆÆ6–ærà¢òòF†W&Vf÷&RvRæVVBFòvòF‡&÷Vv‚F†Rv†öÆRF–ÂFòf–æB–`¢òòF†W&R&Rç’à¢f"F–ÄæöFRÒ&VæFW%7FFRçF–Ã°¢f"Æ7EF–ÄæöFRÒçVÆÃ° ¢v†–ÆR‡F–ÄæöFRÓÒçVÆÂ’°¢–b‡F–ÄæöFRæÇFW&æFRÓÒçVÆÂ’°¢Æ7EF–ÄæöFRÒF–ÄæöFS°¢Ð ¢F–ÄæöFRÒF–ÄæöFRç6–&Æ–æs°¢ÒòòæW‡BvRw&R6–×Ç’vö–ærFòFVÆWFRÆÂ–ç6W'F–öç2gFW"F†P¢òòÆ7B&VæFW&VB—FVÒà  ¢–b†Æ7EF–ÄæöFRÓÓÒçVÆÂ’°¢òòÆÂ&VÖ–æ–ær—FV×2–âF†RF–Â&R–ç6W'F–öç2à¢&VæFW%7FFRçF–ÂÒçVÆÃ°¢ÒVÇ6R°¢òòFWF6‚F†R–ç6W'F–öâgFW"F†RÆ7BæöFRF†Bv2Ç&VG¢òò–ç6W'FVBà¢Æ7EF–ÄæöFRç6–&Æ–ærÒçVÆÃ°¢Ð ¢'&V³°¢Ð ¢66Rv6öÆÆ6VBs ¢°¢òòç’–ç6W'F–öç2BF†RVæBöbF†RF–ÂÆ—7BgFW"F†—2ö–ç@¢òò6†÷VÆB&R–çf—6–&ÆRâ–bF†W&R&RÇ&VG’Ö÷VçFVB&÷VæF&–W0¢òòç—F†–ær&Vf÷&RF†VÒ&Ræ÷B6öç6–FW&VBf÷"6öÆÆ6–ærà¢òòF†W&Vf÷&RvRæVVBFòvòF‡&÷Vv‚F†Rv†öÆRF–ÂFòf–æB–`¢òòF†W&R&Rç’à¢f"÷F–ÄæöFRÒ&VæFW%7FFRçF–Ã°¢f"öÆ7EF–ÄæöFRÒçVÆÃ° ¢v†–ÆR…÷F–ÄæöFRÓÒçVÆÂ’°¢–b…÷F–ÄæöFRæÇFW&æFRÓÒçVÆÂ’°¢öÆ7EF–ÄæöFRÒ÷F–ÄæöFS°¢Ð ¢÷F–ÄæöFRÒ÷F–ÄæöFRç6–&Æ–æs°¢ÒòòæW‡BvRw&R6–×Ç’vö–ærFòFVÆWFRÆÂ–ç6W'F–öç2gFW"F†P¢òòÆ7B&VæFW&VB—FVÒà  ¢–b…öÆ7EF–ÄæöFRÓÓÒçVÆÂ’°¢òòÆÂ&VÖ–æ–ær—FV×2–âF†RF–Â&R–ç6W'F–öç2à¢–b‚†5&VæFW&VDF–ÄfÆÆ&6²bb&VæFW%7FFRçF–ÂÓÒçVÆÂ’°¢òòvR7W7VæFVBGW&–ærF†R†VBâvRvçBFò6†÷rBÆV7BöæP¢òò&÷rBF†RF–Ââ6òvRvÆÂ¶VWöâæB7WBöfbF†R&W7Bà¢&VæFW%7FFRçF–Âç6–&Æ–ærÒçVÆÃ°¢ÒVÇ6R°¢&VæFW%7FFRçF–ÂÒçVÆÃ°¢Ð¢ÒVÇ6R°¢òòFWF6‚F†R–ç6W'F–öâgFW"F†RÆ7BæöFRF†Bv2Ç&VG¢òò–ç6W'FVBà¢öÆ7EF–ÄæöFRç6–&Æ–ærÒçVÆÃ°¢Ð ¢'&V³°¢Ð¢Ð¢Ð ¢gVæ7F–öâ'V&&ÆU&÷W'F–W2†6ö×ÆWFVEv÷&²’°¢f"F–D&–Æ÷WBÒ6ö×ÆWFVEv÷&²æÇFW&æFRÓÒçVÆÂbb6ö×ÆWFVEv÷&²æÇFW&æFRæ6†–ÆBÓÓÒ6ö×ÆWFVEv÷&²æ6†–ÆC°¢f"æWt6†–ÆDÆæW2ÒæôÆæW3°¢f"7V'G&VTfÆw2ÒæôfÆw3° ¢–b‚F–D&–Æ÷WB’°¢òò'V&&ÆRWF†RV&Æ–W7BW‡—&F–öâF–ÖRà¢–b‚†6ö×ÆWFVEv÷&²æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢òò–â&öf–Æ–ærÖöFRÂ&W6WD6†–ÆDW‡—&F–öåF–ÖR—2Ç6òW6VBFò&W6W@¢òò&öf–ÆW"GW&F–öç2à¢f"7GVÄGW&F–öâÒ6ö×ÆWFVEv÷&²æ7GVÄGW&F–öã°¢f"G&VT&6TGW&F–öâÒ6ö×ÆWFVEv÷&²ç6VÆd&6TGW&F–öã°¢f"6†–ÆBÒ6ö×ÆWFVEv÷&²æ6†–ÆC° ¢v†–ÆR†6†–ÆBÓÒçVÆÂ’°¢æWt6†–ÆDÆæW2ÒÖW&vTÆæW2†æWt6†–ÆDÆæW2ÂÖW&vTÆæW2†6†–ÆBæÆæW2Â6†–ÆBæ6†–ÆDÆæW2’“°¢7V'G&VTfÆw2ÃÒ6†–ÆBç7V'G&VTfÆw3°¢7V'G&VTfÆw2ÃÒ6†–ÆBæfÆw3²òòv†Vâf–&W"—26ÆöæVBÂ—G27GVÄGW&F–öâ—2&W6WBFòâF†—2fÇVRv–ÆÀ¢òòöæÇ’&RWFFVB–bv÷&²—2FöæRöâF†Rf–&W"†’æRâ—BFöW6âwB&–Æ÷WB’à¢òòv†Vâv÷&²—2FöæRÂ—B6†÷VÆB'V&&ÆRFòF†R&VçBw27GVÄGW&F–öââ–`¢òòF†Rf–&W"†2æ÷B&VVâ6ÆöæVBF†÷Vv‚Â†ÖVæ–æræòv÷&²v2FöæR’ÂF†Và¢òòF†—2fÇVRv–ÆÂ&VfÆV7BF†RÖ÷VçBöbF–ÖR7VçBv÷&¶–æröâ&Wf–÷W0¢òò&VæFW"â–âF†B66R—B6†÷VÆBæ÷B'V&&ÆRâvRFWFW&Ö–æRv†WF†W"—Bv0¢òò6ÆöæVB'’6ö×&–ærF†R6†–ÆBö–çFW"à ¢7GVÄGW&F–öâ³Ò6†–ÆBæ7GVÄGW&F–öã°¢G&VT&6TGW&F–öâ³Ò6†–ÆBçG&VT&6TGW&F–öã°¢6†–ÆBÒ6†–ÆBç6–&Æ–æs°¢Ð ¢6ö×ÆWFVEv÷&²æ7GVÄGW&F–öâÒ7GVÄGW&F–öã°¢6ö×ÆWFVEv÷&²çG&VT&6TGW&F–öâÒG&VT&6TGW&F–öã°¢ÒVÇ6R°¢f"ö6†–ÆBÒ6ö×ÆWFVEv÷&²æ6†–ÆC° ¢v†–ÆR…ö6†–ÆBÓÒçVÆÂ’°¢æWt6†–ÆDÆæW2ÒÖW&vTÆæW2†æWt6†–ÆDÆæW2ÂÖW&vTÆæW2…ö6†–ÆBæÆæW2Âö6†–ÆBæ6†–ÆDÆæW2’“°¢7V'G&VTfÆw2ÃÒö6†–ÆBç7V'G&VTfÆw3°¢7V'G&VTfÆw2ÃÒö6†–ÆBæfÆw3²òòWFFRF†R&WGW&âö–çFW"6òF†RG&VR—26öç6—7FVçBâF†—2—26öFP¢òò6ÖVÆÂ&V6W6R—B77VÖW2F†R6öÖÖ—B†6R—2æWfW"6öæ7W'&VçBv—F€¢òòF†R&VæFW"†6Râv–ÆÂFG&W72GW&–ær&Vf7F÷"FòÇFW&æFRÖöFVÂà ¢ö6†–ÆBç&WGW&âÒ6ö×ÆWFVEv÷&³°¢ö6†–ÆBÒö6†–ÆBç6–&Æ–æs°¢Ð¢Ð ¢6ö×ÆWFVEv÷&²ç7V'G&VTfÆw2ÃÒ7V'G&VTfÆw3°¢ÒVÇ6R°¢òò'V&&ÆRWF†RV&Æ–W7BW‡—&F–öâF–ÖRà¢–b‚†6ö×ÆWFVEv÷&²æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢òò–â&öf–Æ–ærÖöFRÂ&W6WD6†–ÆDW‡—&F–öåF–ÖR—2Ç6òW6VBFò&W6W@¢òò&öf–ÆW"GW&F–öç2à¢f"÷G&VT&6TGW&F–öâÒ6ö×ÆWFVEv÷&²ç6VÆd&6TGW&F–öã°¢f"ö6†–ÆC"Ò6ö×ÆWFVEv÷&²æ6†–ÆC° ¢v†–ÆR…ö6†–ÆC"ÓÒçVÆÂ’°¢æWt6†–ÆDÆæW2ÒÖW&vTÆæW2†æWt6†–ÆDÆæW2ÂÖW&vTÆæW2…ö6†–ÆC"æÆæW2Âö6†–ÆC"æ6†–ÆDÆæW2’“²òò%7FF–2"fÆw26†&RF†RÆ–fWF–ÖRöbF†Rf–&W"ö†öö²F†W’&VÆöærFòÀ¢òò6òvR6†÷VÆB'V&&ÆRF†÷6RWWfVâGW&–ær&–Æ÷WBâÆÂF†R÷F†W ¢òòfÆw2†fRÆ–fWF–ÖRöæÇ’öb6–ævÆR&VæFW"²6öÖÖ—BÂ6òvR6†÷VÆ@¢òò–væ÷&RF†VÒà ¢7V'G&VTfÆw2ÃÒö6†–ÆC"ç7V'G&VTfÆw2b7FF–4Ö6³°¢7V'G&VTfÆw2ÃÒö6†–ÆC"æfÆw2b7FF–4Ö6³°¢÷G&VT&6TGW&F–öâ³Òö6†–ÆC"çG&VT&6TGW&F–öã°¢ö6†–ÆC"Òö6†–ÆC"ç6–&Æ–æs°¢Ð ¢6ö×ÆWFVEv÷&²çG&VT&6TGW&F–öâÒ÷G&VT&6TGW&F–öã°¢ÒVÇ6R°¢f"ö6†–ÆC2Ò6ö×ÆWFVEv÷&²æ6†–ÆC° ¢v†–ÆR…ö6†–ÆC2ÓÒçVÆÂ’°¢æWt6†–ÆDÆæW2ÒÖW&vTÆæW2†æWt6†–ÆDÆæW2ÂÖW&vTÆæW2…ö6†–ÆC2æÆæW2Âö6†–ÆC2æ6†–ÆDÆæW2’“²òò%7FF–2"fÆw26†&RF†RÆ–fWF–ÖRöbF†Rf–&W"ö†öö²F†W’&VÆöærFòÀ¢òò6òvR6†÷VÆB'V&&ÆRF†÷6RWWfVâGW&–ær&–Æ÷WBâÆÂF†R÷F†W ¢òòfÆw2†fRÆ–fWF–ÖRöæÇ’öb6–ævÆR&VæFW"²6öÖÖ—BÂ6òvR6†÷VÆ@¢òò–væ÷&RF†VÒà ¢7V'G&VTfÆw2ÃÒö6†–ÆC2ç7V'G&VTfÆw2b7FF–4Ö6³°¢7V'G&VTfÆw2ÃÒö6†–ÆC2æfÆw2b7FF–4Ö6³²òòWFFRF†R&WGW&âö–çFW"6òF†RG&VR—26öç6—7FVçBâF†—2—26öFP¢òò6ÖVÆÂ&V6W6R—B77VÖW2F†R6öÖÖ—B†6R—2æWfW"6öæ7W'&VçBv—F€¢òòF†R&VæFW"†6Râv–ÆÂFG&W72GW&–ær&Vf7F÷"FòÇFW&æFRÖöFVÂà ¢ö6†–ÆC2ç&WGW&âÒ6ö×ÆWFVEv÷&³°¢ö6†–ÆC2Òö6†–ÆC2ç6–&Æ–æs°¢Ð¢Ð ¢6ö×ÆWFVEv÷&²ç7V'G&VTfÆw2ÃÒ7V'G&VTfÆw3°¢Ð ¢6ö×ÆWFVEv÷&²æ6†–ÆDÆæW2ÒæWt6†–ÆDÆæW3°¢&WGW&âF–D&–Æ÷WC°¢Ð ¢gVæ7F–öâ6ö×ÆWFTFV‡–G&FVE7W7Vç6T&÷VæF'’†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡E7FFR’°¢–b††5Væ‡–G&FVEF–ÄæöFW2‚’bb‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÒæôÖöFRbb‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÓÒæôfÆw2’°¢v&ä–eVæ‡–G&FVEF–ÄæöFW2‡v÷&´–å&öw&W72“°¢&W6WD‡–G&F–öå7FFR‚“°¢v÷&´–å&öw&W72æfÆw2ÃÒf÷&6T6Æ–VçE&VæFW"Â–æ6ö×ÆWFRÂ6†÷VÆD6GW&S°¢&WGW&âfÇ6S°¢Ð ¢f"v4‡–G&FVBÒ÷‡–G&F–öå7FFR‡v÷&´–å&öw&W72“° ¢–b†æW‡E7FFRÓÒçVÆÂbbæW‡E7FFRæFV‡–G&FVBÓÒçVÆÂ’°¢òòvRÖ–v‡B&R–ç6–FR‡–G&F–öâ7FFRF†Rf—'7BF–ÖRvRw&R–6¶–ærWF†—0¢òò7W7Vç6R&÷VæF'’ÂæBÇ6ògFW"vRwfR&VVçFW&VB—Bf÷"gW'F†W"‡–G&F–öâà¢–b†7W'&VçBÓÓÒçVÆÂ’°¢–b‚v4‡–G&FVB’°¢F‡&÷ræWrW'&÷"‚tFV‡–G&FVB7W7Vç6R6ö×öæVçBv26ö×ÆWFVBv—F†÷WB‡–G&FVBæöFRâr²uF†—2—2&ö&&Ç’'Vr–â&V7Bâr“°¢Ð ¢&W&UFô‡–G&FT†÷7E7W7Vç6T–ç7Fæ6R‡v÷&´–å&öw&W72“°¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“° ¢°¢–b‚‡v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢f"—5F–ÖVD÷WE7W7Vç6RÒæW‡E7FFRÓÒçVÆÃ° ¢–b†—5F–ÖVD÷WE7W7Vç6R’°¢òòFöâwB6÷VçBF–ÖR7VçB–âF–ÖVB÷WB7W7Vç6R7V'G&VR2'BöbF†R&6RGW&F–öâà¢f"&–Ö'”6†–ÆDg&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC° ¢–b‡&–Ö'”6†–ÆDg&vÖVçBÓÒçVÆÂ’°¢òòDfÆ÷tf—„ÖRfÆ÷rFöW6âwB7W÷'BG—R67F–ær–â6öÖ&–æF–öâv—F‚F†RÓÒ÷W&F÷ ¢v÷&´–å&öw&W72çG&VT&6TGW&F–öâÓÒ&–Ö'”6†–ÆDg&vÖVçBçG&VT&6TGW&F–öã°¢Ð¢Ð¢Ð¢Ð ¢&WGW&âfÇ6S°¢ÒVÇ6R°¢òòvRÖ–v‡B†fR&VVçFW&VBF†—2&÷VæF'’Fò‡–G&FR—Bâ–b6òÂvRæVVBFò&W6WBF†R‡–G&F–öà¢òò7FFR6–æ6RvRw&Ræ÷rW†—F–ær÷WBöb—Bâ÷‡–G&F–öå7FFRFöW6âwBFòF†Bf÷"W2à¢&W6WD‡–G&F–öå7FFR‚“° ¢–b‚‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÓÒæôfÆw2’°¢òòF†—2&÷VæF'’F–Bæ÷B7W7VæB6ò—Bw2æ÷r‡–G&FVBæBVç7W7VæFVBà¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢Òòò–bæ÷F†–ær7W7VæFVBÂvRæVVBFò66†VGVÆRâVffV7BFòÖ&²F†—2&÷VæF'¢òò2†f–ær‡–G&FVB6òWfVçG2¶æ÷rF†BF†W’w&Rg&VRFò&R–çfö¶VBà¢òò—Bw2Ç6ò6–væÂFò&WÆ’WfVçG2æBF†R7W7Vç6R6ÆÆ&6²à¢òò–b6öÖWF†–ær7W7VæFVBÂ66†VGVÆRâVffV7BFòGF6‚&WG'’Æ—7FVæW'2à¢òò6òvRÖ–v‡B2vVÆÂÇv—2Ö&²F†—2à  ¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS°¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“° ¢°¢–b‚‡v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢f"ö—5F–ÖVD÷WE7W7Vç6RÒæW‡E7FFRÓÒçVÆÃ° ¢–b…ö—5F–ÖVD÷WE7W7Vç6R’°¢òòFöâwB6÷VçBF–ÖR7VçB–âF–ÖVB÷WB7W7Vç6R7V'G&VR2'BöbF†R&6RGW&F–öâà¢f"÷&–Ö'”6†–ÆDg&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC° ¢–b…÷&–Ö'”6†–ÆDg&vÖVçBÓÒçVÆÂ’°¢òòDfÆ÷tf—„ÖRfÆ÷rFöW6âwB7W÷'BG—R67F–ær–â6öÖ&–æF–öâv—F‚F†RÓÒ÷W&F÷ ¢v÷&´–å&öw&W72çG&VT&6TGW&F–öâÓÒ÷&–Ö'”6†–ÆDg&vÖVçBçG&VT&6TGW&F–öã°¢Ð¢Ð¢Ð¢Ð ¢&WGW&âfÇ6S°¢Ð¢ÒVÇ6R°¢òò7V66W76gVÆÇ’6ö×ÆWFVBF†—2G&VRâ–bF†—2v2f÷&6VB6Æ–VçB&VæFW"À¢òòF†W&RÖ’†fR&VVâ&V6÷fW&&ÆRW'&÷'2GW&–ærf—'7B‡–G&F–öà¢òòGFV×Bâ–b6òÂFBF†VÒFòVWVR6òvR6âÆörF†VÒ–âF†P¢òò6öÖÖ—B†6Rà¢Ww&FT‡–G&F–öäW'&÷'5Fõ&V6÷fW&&ÆR‚“²òòfÆÂF‡&÷Vv‚Fòæ÷&ÖÂ7W7Vç6RF€ ¢&WGW&âG'VS°¢Ð¢Ð ¢gVæ7F–öâ6ö×ÆWFUv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢f"æWu&÷2Òv÷&´–å&öw&W72çVæF–æu&÷3²òòæ÷FS¢F†—2–çFVçF–öæÆÇ’FöW6âwB6†V6²–bvRw&R‡–G&F–ær&V6W6R6ö×&–æp¢òòFòF†R7W'&VçBG&VR&÷f–FW"f–&W"—2§W7B2f7BæBÆW72W'&÷"×&öæRà¢òò–FVÆÇ’vRv÷VÆB†fR7V6–ÂfW'6–öâöbF†Rv÷&²Æö÷öæÇ¢òòf÷"‡–G&F–öâà ¢÷G&VT6öçFW‡B‡v÷&´–å&öw&W72“° ¢7v—F6‚‡v÷&´–å&öw&W72çFr’°¢66R–æFWFW&Ö–æFT6ö×öæVçC ¢66RÆ§”6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66Rg&vÖVçC ¢66RÖöFS ¢66R&öf–ÆW# ¢66R6öçFW‡D6öç7VÖW# ¢66RÖVÖô6ö×öæVçC ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ° ¢66R6Æ746ö×öæVçC ¢°¢f"6ö×öæVçBÒv÷&´–å&öw&W72çG—S° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢÷6öçFW‡B‡v÷&´–å&öw&W72“°¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7E&ö÷C ¢°¢f"f–&W%&ö÷BÒv÷&´–å&öw&W72ç7FFTæöFS°¢÷†÷7D6öçF–æW"‡v÷&´–å&öw&W72“°¢÷F÷ÆWfVÄ6öçFW‡Dö&¦V7B‡v÷&´–å&öw&W72“°¢&W6WEv÷&´–å&öw&W75fW'6–öç2‚“° ¢–b†f–&W%&ö÷BçVæF–æt6öçFW‡B’°¢f–&W%&ö÷Bæ6öçFW‡BÒf–&W%&ö÷BçVæF–æt6öçFW‡C°¢f–&W%&ö÷BçVæF–æt6öçFW‡BÒçVÆÃ°¢Ð ¢–b†7W'&VçBÓÓÒçVÆÂÇÂ7W'&VçBæ6†–ÆBÓÓÒçVÆÂ’°¢òò–bvR‡–G&FVBÂ÷6òF†BvR6âFVÆWFRç’&VÖ–æ–ær6†–ÆG&Và¢òòF†BvW&VâwB‡–G&FVBà¢f"v4‡–G&FVBÒ÷‡–G&F–öå7FFR‡v÷&´–å&öw&W72“° ¢–b‡v4‡–G&FVB’°¢òò–bvR‡–G&FVBÂF†VâvRvÆÂæVVBFò66†VGVÆRâWFFRf÷ ¢òòF†R6öÖÖ—B6–FRÖVffV7G2öâF†R&ö÷Bà¢Ö&µWFFR‡v÷&´–å&öw&W72“°¢ÒVÇ6R°¢–b†7W'&VçBÓÒçVÆÂ’°¢f"&We7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS° ¢–b‚òò6†V6²–bF†—2—26Æ–VçB&ö÷@¢&We7FFRæ—4FV‡–G&FVBÇÂòò6†V6²–bvR&WfW'FVBFò6Æ–VçB&VæFW&–ær†RærâGVRFòâW'&÷"¢‡v÷&´–å&öw&W72æfÆw2bf÷&6T6Æ–VçE&VæFW"’ÓÒæôfÆw2’°¢òò66†VGVÆRâVffV7BFò6ÆV"F†—26öçF–æW"BF†R7F'BöbF†P¢òòæW‡B6öÖÖ—BâF†—2†æFÆW2F†R66Röb&V7B&VæFW&–ær–çFò¢òò6öçF–æW"v—F‚&Wf–÷W26†–ÆG&Vââ—Bw2Ç6ò6fRFòFòf÷ ¢òòWFFW2FöòÂ&V6W6R7W'&VçBæ6†–ÆBv÷VÆBöæÇ’&RçVÆÂ–bF†P¢òò&Wf–÷W2&VæFW"v2çVÆÂ‡6òF†R6öçF–æW"v÷VÆBÇ&VG¢òò&RV×G’’à¢v÷&´–å&öw&W72æfÆw2ÃÒ6æ6†÷C²òò–bF†—2v2f÷&6VB6Æ–VçB&VæFW"ÂF†W&RÖ’†fR&VVà¢òò&V6÷fW&&ÆRW'&÷'2GW&–ærf—'7B‡–G&F–öâGFV×Bâ–b6òÂF@¢òòF†VÒFòVWVR6òvR6âÆörF†VÒ–âF†R6öÖÖ—B†6Rà ¢Ww&FT‡–G&F–öäW'&÷'5Fõ&V6÷fW&&ÆR‚“°¢Ð¢Ð¢Ð¢Ð ¢WFFT†÷7D6öçF–æW"†7W'&VçBÂv÷&´–å&öw&W72“°¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“° ¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢÷†÷7D6öçFW‡B‡v÷&´–å&öw&W72“°¢f"&ö÷D6öçF–æW$–ç7Fæ6RÒvWE&ö÷D†÷7D6öçF–æW"‚“°¢f"G—RÒv÷&´–å&öw&W72çG—S° ¢–b†7W'&VçBÓÒçVÆÂbbv÷&´–å&öw&W72ç7FFTæöFRÒçVÆÂ’°¢WFFT†÷7D6ö×öæVçBC†7W'&VçBÂv÷&´–å&öw&W72ÂG—RÂæWu&÷2Â&ö÷D6öçF–æW$–ç7Fæ6R“° ¢–b†7W'&VçBç&VbÓÒv÷&´–å&öw&W72ç&Vb’°¢Ö&µ&VbC‡v÷&´–å&öw&W72“°¢Ð¢ÒVÇ6R°¢–b‚æWu&÷2’°¢–b‡v÷&´–å&öw&W72ç7FFTæöFRÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚uvR×W7B†fRæWr&÷2f÷"æWrÖ÷VçG2âF†—2W'&÷"—2Æ–¶VÇ’r²v6W6VB'’'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢ÒòòF†—26â†Vâv†VâvR&÷'Bv÷&²à  ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢f"7W'&VçD†÷7D6öçFW‡BÒvWD†÷7D6öçFW‡B‚“²òòDôDó¢Ö÷fR7&VFT–ç7Fæ6RFò&Vv–åv÷&²æB¶VW—Böâ6öçFW‡@¢òò'7F6²"2F†R&VçBâF†VâVæB6†–ÆG&Vâ2vRvò–â&Vv–åv÷&°¢òò÷"6ö×ÆWFUv÷&²FWVæF–æröâv†WF†W"vRvçBFòFBF†VÒF÷ÓæF÷vâ÷ ¢òò&÷GFöÒÓçWâF÷ÓæF÷vâ—2f7FW"–â”Sà ¢f"÷v4‡–G&FVBÒ÷‡–G&F–öå7FFR‡v÷&´–å&öw&W72“° ¢–b…÷v4‡–G&FVB’°¢òòDôDó¢Ö÷fRF†—2æB7&VFT–ç7Fæ6R7FW–çFòF†R&Vv–å†6P¢òòFò6öç6öÆ–FFRà¢–b‡&W&UFô‡–G&FT†÷7D–ç7Fæ6R‡v÷&´–å&öw&W72Â&ö÷D6öçF–æW$–ç7Fæ6RÂ7W'&VçD†÷7D6öçFW‡B’’°¢òò–b6†ævW2FòF†R‡–G&FVBæöFRæVVBFò&RÆ–VBBF†P¢òò6öÖÖ—B×†6RvRÖ&²F†—227V6‚à¢Ö&µWFFR‡v÷&´–å&öw&W72“°¢Ð¢ÒVÇ6R°¢f"–ç7Fæ6RÒ7&VFT–ç7Fæ6R‡G—RÂæWu&÷2Â&ö÷D6öçF–æW$–ç7Fæ6RÂ7W'&VçD†÷7D6öçFW‡BÂv÷&´–å&öw&W72“°¢VæDÆÄ6†–ÆG&Vâ†–ç7Fæ6RÂv÷&´–å&öw&W72ÂfÇ6RÂfÇ6R“°¢v÷&´–å&öw&W72ç7FFTæöFRÒ–ç7Fæ6S²òò6W'F–â&VæFW&W'2&WV—&R6öÖÖ—B×F–ÖRVffV7G2f÷"–æ—F–ÂÖ÷VçBà¢òò†VrDôÒ&VæFW&W"7W÷'G2WFòÖfö7W2f÷"6W'F–âVÆVÖVçG2’à¢òòÖ¶R7W&R7V6‚&VæFW&W'2vWB66†VGVÆVBf÷"ÆFW"v÷&²à ¢–b†f–æÆ—¦T–æ—F–Ä6†–ÆG&Vâ†–ç7Fæ6RÂG—RÂæWu&÷2Â&ö÷D6öçF–æW$–ç7Fæ6R’’°¢Ö&µWFFR‡v÷&´–å&öw&W72“°¢Ð¢Ð ¢–b‡v÷&´–å&öw&W72ç&VbÓÒçVÆÂ’°¢òò–bF†W&R—2&Vböâ†÷7BæöFRvRæVVBFò66†VGVÆR6ÆÆ&6°¢Ö&µ&VbC‡v÷&´–å&öw&W72“°¢Ð¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7EFW‡C ¢°¢f"æWuFW‡BÒæWu&÷3° ¢–b†7W'&VçBbbv÷&´–å&öw&W72ç7FFTæöFRÒçVÆÂ’°¢f"öÆEFW‡BÒ7W'&VçBæÖVÖö—¦VE&÷3²òò–bvR†fRâÇFW&æFRÂF†BÖVç2F†—2—2âWFFRæBvRæVV@¢òòFò66†VGVÆR6–FRÖVffV7BFòFòF†RWFFW2à ¢WFFT†÷7EFW‡BC†7W'&VçBÂv÷&´–å&öw&W72ÂöÆEFW‡BÂæWuFW‡B“°¢ÒVÇ6R°¢–b‡G—VöbæWuFW‡BÓÒw7G&–ærr’°¢–b‡v÷&´–å&öw&W72ç7FFTæöFRÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚uvR×W7B†fRæWr&÷2f÷"æWrÖ÷VçG2âF†—2W'&÷"—2Æ–¶VÇ’r²v6W6VB'’'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢ÒòòF†—26â†Vâv†VâvR&÷'Bv÷&²à ¢Ð ¢f"÷&ö÷D6öçF–æW$–ç7Fæ6RÒvWE&ö÷D†÷7D6öçF–æW"‚“° ¢f"ö7W'&VçD†÷7D6öçFW‡BÒvWD†÷7D6öçFW‡B‚“° ¢f"÷v4‡–G&FVC"Ò÷‡–G&F–öå7FFR‡v÷&´–å&öw&W72“° ¢–b…÷v4‡–G&FVC"’°¢–b‡&W&UFô‡–G&FT†÷7EFW‡D–ç7Fæ6R‡v÷&´–å&öw&W72’’°¢Ö&µWFFR‡v÷&´–å&öw&W72“°¢Ð¢ÒVÇ6R°¢v÷&´–å&öw&W72ç7FFTæöFRÒ7&VFUFW‡D–ç7Fæ6R†æWuFW‡BÂ÷&ö÷D6öçF–æW$–ç7Fæ6RÂö7W'&VçD†÷7D6öçFW‡BÂv÷&´–å&öw&W72“°¢Ð¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢66R7W7Vç6T6ö×öæVçC ¢°¢÷7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72“°¢f"æW‡E7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS²òò7V6–ÂF‚f÷"FV‡–G&FVB&÷VæF&–W2âvRÖ’WfVçGVÆÇ’Ö÷fRF†—0¢òòFò—G2÷vâf–&W"G—R6òF†BvR6âFB÷F†W"¶–æG2öb‡–G&F–öà¢òò&÷VæF&–W2F†B&VâwB76ö6–FVBv—F‚7W7Vç6RG&VRâ–âçF–6—F–öà¢òòöb7V6‚&Vf7F÷"ÂÆÂF†R‡–G&F–öâÆöv–2—26öçF–æVB–à¢òòF†—2'&æ6‚à ¢–b†7W'&VçBÓÓÒçVÆÂÇÂ7W'&VçBæÖVÖö—¦VE7FFRÓÒçVÆÂbb7W'&VçBæÖVÖö—¦VE7FFRæFV‡–G&FVBÓÒçVÆÂ’°¢f"fÆÇF‡&÷Vv…Fôæ÷&ÖÅ7W7Vç6UF‚Ò6ö×ÆWFTFV‡–G&FVE7W7Vç6T&÷VæF'’†7W'&VçBÂv÷&´–å&öw&W72ÂæW‡E7FFR“° ¢–b‚fÆÇF‡&÷Vv…Fôæ÷&ÖÅ7W7Vç6UF‚’°¢–b‡v÷&´–å&öw&W72æfÆw2b6†÷VÆD6GW&R’°¢òò7V6–Â66RâF†W&RvW&R&VÖ–æ–ærVæ‡–G&FVBæöFW2âvRG&V@¢òòF†—22Ö—6ÖF6‚â&WfW'BFò6Æ–VçB&VæFW&–ærà¢&WGW&âv÷&´–å&öw&W73°¢ÒVÇ6R°¢òòF–Bæ÷Bf–æ—6‚‡–G&F–ærÂV—F†W"&V6W6RF†—2—2F†R–æ—F–À¢òò&VæFW"÷"&V6W6R6öÖWF†–ær7W7VæFVBà¢&WGW&âçVÆÃ°¢Ð¢Òòò6öçF–çVRv—F‚F†Ræ÷&ÖÂ7W7Vç6RF‚à ¢Ð ¢–b‚‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÒæôfÆw2’°¢òò6öÖWF†–ær7W7VæFVBâ&R×&VæFW"v—F‚F†RfÆÆ&6²6†–ÆG&Vâà¢v÷&´–å&öw&W72æÆæW2Ò&VæFW$ÆæW3²òòFòæ÷B&W6WBF†RVffV7BÆ—7Bà ¢–b‚‡v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢G&ç6fW$7GVÄGW&F–öâ‡v÷&´–å&öw&W72“°¢ÒòòFöâwB'V&&ÆR&÷W'F–W2–âF†—266Rà  ¢&WGW&âv÷&´–å&öw&W73°¢Ð ¢f"æW‡DF–EF–ÖV÷WBÒæW‡E7FFRÓÒçVÆÃ°¢f"&WdF–EF–ÖV÷WBÒ7W'&VçBÓÒçVÆÂbb7W'&VçBæÖVÖö—¦VE7FFRÓÒçVÆÃ°¢òò76—fRVffV7BÂv†–6‚—2v†VâvR&ö6W72F†RG&ç6—F–öç0  ¢–b†æW‡DF–EF–ÖV÷WBÓÒ&WdF–EF–ÖV÷WB’°¢òòâVffV7BFòFövvÆRF†R7V'G&VRw2f—6–&–Æ—G’âv†VâvR7v—F6‚g&öÐ¢òòfÆÆ&6²Óâ&–Ö'’ÂF†R–ææW"öfg67&VVâf–&W"66†VGVÆW2F†—2VffV7@¢òò2'Böb—G2æ÷&ÖÂ6ö×ÆWFR†6Râ'WBv†VâvR7v—F6‚g&öÐ¢òò&–Ö'’ÓâfÆÆ&6²ÂF†R–ææW"öfg67&VVâf–&W"FöW2æ÷B†fR6ö×ÆWFP¢òò†6Râ6òvRæVVBFò66†VGVÆR—G2VffV7B†W&Rà¢òð¢òòvRÇ6òW6RF†—2fÆrFò6öææV7BöF—66öææV7BF†RVffV7G2Â'WBF†R6ÖP¢òòÆöv–2Æ–W3¢v†Vâ&RÖ6öææV7F–ærÂF†Röfg67&VVâf–&W"w26ö×ÆWFP¢òò†6Rv–ÆÂ†æFÆR66†VGVÆ–ærF†RVffV7Bâ—Bw2öæÇ’v†VâF†RfÆÆ&6°¢òò—27F—fRF†BvR†fRFòFòç—F†–ær7V6–Âà  ¢–b†æW‡DF–EF–ÖV÷WB’°¢f"ööfg67&VVäf–&W#"Òv÷&´–å&öw&W72æ6†–ÆC°¢ööfg67&VVäf–&W#"æfÆw2ÃÒf—6–&–Æ—G“²òòDôDó¢F†—2v–ÆÂ7F–ÆÂ7W7VæB7–æ6‡&öæ÷W2G&VR–bç—F†–æp¢òò–âF†R6öæ7W'&VçBG&VRÇ&VG’7W7VæFVBGW&–ærF†—2&VæFW"à¢òòF†—2—2¶æ÷vâ'Vrà ¢–b‚‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÒæôÖöFR’°¢òòDôDó¢Ö÷fRF†—2&6²FòF‡&÷tW†6WF–öâ&V6W6RF†—2—2FöòÆFP¢òò–bF†—2—2Æ&vRG&VRv†–6‚—26öÖÖöâf÷"–æ—F–ÂÆöG2âvP¢òòFöâwB¶æ÷r–bvR6†÷VÆB&W7F'B&VæFW"÷"æ÷BVçF–ÂvRvW@¢òòF†—2Ö&¶W"ÂæBF†—2—2FöòÆFRà¢òò–bF†—2&VæFW"Ç&VG’†B–ær÷"Æ÷vW"&’WFFW2À¢òòæBF†—2—2F†Rf—'7BF–ÖRvR¶æ÷rvRw&Rvö–ærFò7W7VæBvP¢òò6†÷VÆB&R&ÆRFò–ÖÖVF–FVÇ’&W7F'Bg&öÒv—F†–âF‡&÷tW†6WF–öâà¢f"†4–çf—6–&ÆT6†–ÆD6öçFW‡BÒ7W'&VçBÓÓÒçVÆÂbb‡v÷&´–å&öw&W72æÖVÖö—¦VE&÷2çVç7F&ÆUöfö–EF†—4fÆÆ&6²ÓÒG'VRÇÂVæ&ÆU7W7Vç6Tfö–EF†—4fÆÆ&6²“° ¢–b††4–çf—6–&ÆT6†–ÆD6öçFW‡BÇÂ†57W7Vç6T6öçFW‡B‡7W7Vç6U7F6´7W'6÷"æ7W'&VçBÂ–çf—6–&ÆU&VçE7W7Vç6T6öçFW‡B’’°¢òò–bF†—2v2–ââ–çf—6–&ÆRG&VR÷"æWr&VæFW"ÂF†Vâ6†÷v–æp¢òòF†—2&÷VæF'’—2ö²à¢&VæFW$F–E7W7VæB‚“°¢ÒVÇ6R°¢òò÷F†W'v—6RÂvRw&Rvö–ærFò†fRFò†–FR6öçFVçB6òvR6†÷VÆ@¢òò7W7VæBf÷"ÆöævW"–b÷76–&ÆRà¢&VæFW$F–E7W7VæDFVÆ”–e÷76–&ÆR‚“°¢Ð¢Ð¢Ð¢Ð ¢f"v¶V&ÆW2Òv÷&´–å&öw&W72çWFFUVWVS° ¢–b‡v¶V&ÆW2ÓÒçVÆÂ’°¢òò66†VGVÆRâVffV7BFòGF6‚&WG'’Æ—7FVæW"FòF†R&öÖ—6Rà¢òòDôDó¢Ö÷fRFò76—fR†6P¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS°¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“° ¢°¢–b‚‡v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢–b†æW‡DF–EF–ÖV÷WB’°¢òòFöâwB6÷VçBF–ÖR7VçB–âF–ÖVB÷WB7W7Vç6R7V'G&VR2'BöbF†R&6RGW&F–öâà¢f"&–Ö'”6†–ÆDg&vÖVçBÒv÷&´–å&öw&W72æ6†–ÆC° ¢–b‡&–Ö'”6†–ÆDg&vÖVçBÓÒçVÆÂ’°¢òòDfÆ÷tf—„ÖRfÆ÷rFöW6âwB7W÷'BG—R67F–ær–â6öÖ&–æF–öâv—F‚F†RÓÒ÷W&F÷ ¢v÷&´–å&öw&W72çG&VT&6TGW&F–öâÓÒ&–Ö'”6†–ÆDg&vÖVçBçG&VT&6TGW&F–öã°¢Ð¢Ð¢Ð¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7E÷'FÃ ¢÷†÷7D6öçF–æW"‡v÷&´–å&öw&W72“°¢WFFT†÷7D6öçF–æW"†7W'&VçBÂv÷&´–å&öw&W72“° ¢–b†7W'&VçBÓÓÒçVÆÂ’°¢&W&U÷'FÄÖ÷VçB‡v÷&´–å&öw&W72ç7FFTæöFRæ6öçF–æW$–æfò“°¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ° ¢66R6öçFW‡E&÷f–FW# ¢òò÷&÷f–FW"f–&W ¢f"6öçFW‡BÒv÷&´–å&öw&W72çG—Råö6öçFW‡C°¢÷&÷f–FW"†6öçFW‡BÂv÷&´–å&öw&W72“°¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ° ¢66R–æ6ö×ÆWFT6Æ746ö×öæVçC ¢°¢òò6ÖR26Æ726ö×öæVçB66Râ’WB—BF÷vâ†W&R6òF†BF†RFw2&P¢òò6WVVçF–ÂFòVç7W&RF†—27v—F6‚—26ö×–ÆVBFò§V×F&ÆRà¢f"ô6ö×öæVçBÒv÷&´–å&öw&W72çG—S° ¢–b†—46öçFW‡E&÷f–FW"…ô6ö×öæVçB’’°¢÷6öçFW‡B‡v÷&´–å&öw&W72“°¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢°¢÷7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72“°¢f"&VæFW%7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS° ¢–b‡&VæFW%7FFRÓÓÒçVÆÂ’°¢òòvRw&R'Vææ–ær–âF†RFVfVÇBÂ&–æFWVæFVçB"ÖöFRà¢òòvRFöâwBFòç—F†–ær–âF†—2ÖöFRà¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢f"F–E7W7VæDÇ&VG’Ò‡v÷&´–å&öw&W72æfÆw2bF–D6GW&R’ÓÒæôfÆw3°¢f"&VæFW&VEF–ÂÒ&VæFW%7FFRç&VæFW&–æs° ¢–b‡&VæFW&VEF–ÂÓÓÒçVÆÂ’°¢òòvR§W7B&VæFW&VBF†R†VBà¢–b‚F–E7W7VæDÇ&VG’’°¢òòF†—2—2F†Rf—'7B72âvRæVVBFòf–wW&R÷WB–bç—F†–ær—27F–ÆÀ¢òò7W7VæFVB–âF†R&VæFW&VB6WBà¢òò–bæWr6öçFVçBVç7W7VæFVBÂ'WBF†W&Rw27F–ÆÂ6öÖR6öçFVçBF†@¢òòF–FâwBâF†VâvRæVVBFòFò6V6öæB72F†Bf÷&6W2WfW'—F†–æp¢òòFò¶VW6†÷v–ærF†V—"fÆÆ&6·2à¢òòvRÖ–v‡B&R7W7VæFVB–b6öÖWF†–ær–âF†—2&VæFW"727W7VæFVBÂ÷ ¢òò6öÖWF†–ær–âF†R&Wf–÷W26öÖÖ—GFVB727W7VæFVBâ÷F†W'v—6RÀ¢òòF†W&Rw2æò6†æ6R6òvR6â6¶—F†RW‡Vç6—fR6ÆÂFð¢òòf–æDf—'7E7W7VæFVBà¢f"6ææ÷D&U7W7VæFVBÒ&VæFW$†4æ÷E7W7VæFVE–WB‚’bb†7W'&VçBÓÓÒçVÆÂÇÂ†7W'&VçBæfÆw2bF–D6GW&R’ÓÓÒæôfÆw2“° ¢–b‚6ææ÷D&U7W7VæFVB’°¢f"&÷rÒv÷&´–å&öw&W72æ6†–ÆC° ¢v†–ÆR‡&÷rÓÒçVÆÂ’°¢f"7W7VæFVBÒf–æDf—'7E7W7VæFVB‡&÷r“° ¢–b‡7W7VæFVBÓÒçVÆÂ’°¢F–E7W7VæDÇ&VG’ÒG'VS°¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢7WDöfeF–Ä–dæVVFVB‡&VæFW%7FFRÂfÇ6R“²òò–bF†—2—2æWvÇ’7W7VæFVBG&VRÂ—BÖ–v‡Bæ÷BvWB6öÖÖ—GFVB0¢òò'BöbF†R6V6öæB72â–âF†B66Ræ÷F†–ærv–ÆÂ7V'67&–&RFð¢òò—G2F†Væ&ÆW2â–ç7FVBÂvRvÆÂG&ç6fW"—G2F†Væ&ÆW2FòF†P¢òò7W7Vç6TÆ—7B6òF†B—B6â&WG'’–bF†W’&W6öÇfRà¢òòF†W&RÖ–v‡B&R×VÇF—ÆRöbF†W6R–âF†RÆ—7B'WB6–æ6RvRw&P¢òòvö–ærFòv—Bf÷"ÆÂöbF†VÒç—v’Â—BFöW6âwB&VÆÇ’ÖGFW ¢òòv†–6‚öæW2vWG2Fò–ærâ–âF†V÷'’vR6÷VÆBvWB6ÆWfW"æB¶VW ¢òòG&6²öb†÷rÖç’FWVæFVæ6–W2&VÖ–â'WB—BvWG2G&–6·’&V6W6P¢òò–âF†RÖVçF–ÖRÂvR6âFB÷&VÖ÷fRö6†ævR—FV×2æBFWVæFVæ6–W2à¢òòvRÖ–v‡B&–Â÷WBöbF†RÆö÷&Vf÷&Rf–æF–ærç’'WBF†@¢òòFöW6âwBÖGFW"6–æ6RF†BÖVç2F†BF†R÷F†W"&÷VæF&–W2F†@¢òòvRF–Bf–æBÇ&VG’†2F†V—"Æ—7FVæW'2GF6†VBà ¢f"æWuF†Væ&ÆW2Ò7W7VæFVBçWFFUVWVS° ¢–b†æWuF†Væ&ÆW2ÓÒçVÆÂ’°¢v÷&´–å&öw&W72çWFFUVWVRÒæWuF†Væ&ÆW3°¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS°¢Òòò&W&VæFW"F†Rv†öÆRÆ—7BÂ'WBF†—2F–ÖRÂvRvÆÂf÷&6RfÆÆ&6·0¢òòFò7F’–âÆ6Rà¢òò&W6WBF†RVffV7BfÆw2&Vf÷&RFö–ærF†R6V6öæB726–æ6RF†Bw2æ÷r–çfÆ–Bà¢òò&W6WBF†R6†–ÆBf–&W'2FòF†V—"÷&–v–æÂ7FFRà  ¢v÷&´–å&öw&W72ç7V'G&VTfÆw2ÒæôfÆw3°¢&W6WD6†–ÆDf–&W'2‡v÷&´–å&öw&W72Â&VæFW$ÆæW2“²òò6WBWF†R7W7Vç6R6öçFW‡BFòf÷&6R7W7Vç6RæB–ÖÖVF–FVÇ¢òò&W&VæFW"F†R6†–ÆG&Vâà ¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â6WE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6U7F6´7W'6÷"æ7W'&VçBÂf÷&6U7W7Vç6TfÆÆ&6²’“²òòFöâwB'V&&ÆR&÷W'F–W2–âF†—266Rà ¢&WGW&âv÷&´–å&öw&W72æ6†–ÆC°¢Ð ¢&÷rÒ&÷rç6–&Æ–æs°¢Ð¢Ð ¢–b‡&VæFW%7FFRçF–ÂÓÒçVÆÂbbæ÷r‚’âvWE&VæFW%F&vWEF–ÖR‚’’°¢òòvR†fRÇ&VG’76VB÷W"5RFVFÆ–æR'WBvR7F–ÆÂ†fR&÷w0¢òòÆVgB–âF†RF–ÂâvRvÆÂ§W7Bv—fRWgW'F†W"GFV×G2Fò&VæFW ¢òòF†RÖ–â6öçFVçBæBöæÇ’&VæFW"fÆÆ&6·2à¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢F–E7W7VæDÇ&VG’ÒG'VS°¢7WDöfeF–Ä–dæVVFVB‡&VæFW%7FFRÂfÇ6R“²òò6–æ6Ræ÷F†–ær7GVÆÇ’7W7VæFVBÂF†W&Rv–ÆÂæ÷F†–ærFò–ærF†—0¢òòFòvWB—B7F'FVB&6²WFòGFV×BF†RæW‡B—FVÒâv†–ÆR–âFW&×0¢òòöb&–÷&—G’F†—2v÷&²†2F†R6ÖR&–÷&—G’2F†—27W'&VçB&VæFW"À¢òò—Bw2æ÷B'BöbF†R6ÖRG&ç6—F–öâöæ6RF†RG&ç6—F–öâ†0¢òò6öÖÖ—GFVBâ–b—Bw27–æ2ÂvR7F–ÆÂvçBFò––VÆB6òF†B—B6â&P¢òò–çFVBâ6öæ6WGVÆÇ’ÂF†—2—2&VÆÇ’F†R6ÖR2–æv–ærà¢òòvR6âW6Rç’&WG'”ÆæRWfVâ–b—Bw2F†RöæR7W'&VçFÇ’&VæFW&–æp¢òò6–æ6RvRw&RÆVf–ær—B&V†–æBöâF†—2æöFRà ¢v÷&´–å&öw&W72æÆæW2Ò6öÖU&WG'”ÆæS°¢Ð¢ÒVÇ6R°¢7WDöfeF–Ä–dæVVFVB‡&VæFW%7FFRÂfÇ6R“°¢ÒòòæW‡BvRw&Rvö–ærFò&VæFW"F†RF–Âà ¢ÒVÇ6R°¢òòVæBF†R&VæFW&VB&÷rFòF†R6†–ÆBÆ—7Bà¢–b‚F–E7W7VæDÇ&VG’’°¢f"÷7W7VæFVBÒf–æDf—'7E7W7VæFVB‡&VæFW&VEF–Â“° ¢–b…÷7W7VæFVBÓÒçVÆÂ’°¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢F–E7W7VæDÇ&VG’ÒG'VS²òòVç7W&RvRG&ç6fW"F†RWFFRVWVRFòF†R&VçB6òF†B—BFöW6âw@¢òòvWBÆ÷7B–bF†—2&÷rVæG2WG&÷VBGW&–ær6V6öæB72à ¢f"öæWuF†Væ&ÆW2Ò÷7W7VæFVBçWFFUVWVS° ¢–b…öæWuF†Væ&ÆW2ÓÒçVÆÂ’°¢v÷&´–å&öw&W72çWFFUVWVRÒöæWuF†Væ&ÆW3°¢v÷&´–å&öw&W72æfÆw2ÃÒWFFS°¢Ð ¢7WDöfeF–Ä–dæVVFVB‡&VæFW%7FFRÂG'VR“²òòF†—2Ö–v‡B†fR&VVâÖöF–f–VBà ¢–b‡&VæFW%7FFRçF–ÂÓÓÒçVÆÂbb&VæFW%7FFRçF–ÄÖöFRÓÓÒv†–FFVârbb&VæFW&VEF–ÂæÇFW&æFRbbvWD—4‡–G&F–ær‚’òòvRFöâwB7WB—B–bvRw&R‡–G&F–ærà¢’°¢òòvRw&RFöæRà¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð¢ÒVÇ6R–b‚òòF†RF–ÖR—BFöö²Fò&VæFW"Æ7B&÷r—2w&VFW"F†âF†R&VÖ–æ–æp¢òòF–ÖRvR†fRFò&VæFW"â6ò&VæFW&–æröæRÖ÷&R&÷rv÷VÆBÆ–¶VÇ¢òòW†6VVB—Bà¢æ÷r‚’¢"Ò&VæFW%7FFRç&VæFW&–æu7F'EF–ÖRâvWE&VæFW%F&vWEF–ÖR‚’bb&VæFW$ÆæW2ÓÒöfg67&VVäÆæR’°¢òòvR†fRæ÷r76VB÷W"5RFVFÆ–æRæBvRvÆÂ§W7Bv—fRWgW'F†W ¢òòGFV×G2Fò&VæFW"F†RÖ–â6öçFVçBæBöæÇ’&VæFW"fÆÆ&6·2à¢òòF†R77V×F–öâ—2F†BF†—2—2W7VÆÇ’f7FW"à¢v÷&´–å&öw&W72æfÆw2ÃÒF–D6GW&S°¢F–E7W7VæDÇ&VG’ÒG'VS°¢7WDöfeF–Ä–dæVVFVB‡&VæFW%7FFRÂfÇ6R“²òò6–æ6Ræ÷F†–ær7GVÆÇ’7W7VæFVBÂF†W&Rv–ÆÂæ÷F†–ærFò–ærF†—0¢òòFòvWB—B7F'FVB&6²WFòGFV×BF†RæW‡B—FVÒâv†–ÆR–âFW&×0¢òòöb&–÷&—G’F†—2v÷&²†2F†R6ÖR&–÷&—G’2F†—27W'&VçB&VæFW"À¢òò—Bw2æ÷B'BöbF†R6ÖRG&ç6—F–öâöæ6RF†RG&ç6—F–öâ†0¢òò6öÖÖ—GFVBâ–b—Bw27–æ2ÂvR7F–ÆÂvçBFò––VÆB6òF†B—B6â&P¢òò–çFVBâ6öæ6WGVÆÇ’ÂF†—2—2&VÆÇ’F†R6ÖR2–æv–ærà¢òòvR6âW6Rç’&WG'”ÆæRWfVâ–b—Bw2F†RöæR7W'&VçFÇ’&VæFW&–æp¢òò6–æ6RvRw&RÆVf–ær—B&V†–æBöâF†—2æöFRà ¢v÷&´–å&öw&W72æÆæW2Ò6öÖU&WG'”ÆæS°¢Ð¢Ð ¢–b‡&VæFW%7FFRæ—4&6·v&G2’°¢òòF†RVffV7BÆ—7BöbF†R&6·v&G2F–Âv–ÆÂ†fR&VVâFFV@¢òòFòF†RVæBâF†—2'&V·2F†RwV&çFVRF†BÆ–fRÖ7–6ÆW2f—&R–à¢òò6–&Æ–ær÷&FW"'WBF†B—6âwB7G&öærwV&çFVR&öÖ—6VB'’&V7Bà¢òòW7V6–ÆÇ’6–æ6RF†W6RÖ–v‡BÇ6ò§W7B÷–âGW&–ærgWGW&R6öÖÖ—G2à¢òòVæBFòF†R&Vv–ææ–æröbF†RÆ—7Bà¢&VæFW&VEF–Âç6–&Æ–ærÒv÷&´–å&öw&W72æ6†–ÆC°¢v÷&´–å&öw&W72æ6†–ÆBÒ&VæFW&VEF–Ã°¢ÒVÇ6R°¢f"&Wf–÷W56–&Æ–ærÒ&VæFW%7FFRæÆ7C° ¢–b‡&Wf–÷W56–&Æ–ærÓÒçVÆÂ’°¢&Wf–÷W56–&Æ–ærç6–&Æ–ærÒ&VæFW&VEF–Ã°¢ÒVÇ6R°¢v÷&´–å&öw&W72æ6†–ÆBÒ&VæFW&VEF–Ã°¢Ð ¢&VæFW%7FFRæÆ7BÒ&VæFW&VEF–Ã°¢Ð¢Ð ¢–b‡&VæFW%7FFRçF–ÂÓÒçVÆÂ’°¢òòvR7F–ÆÂ†fRF–Â&÷w2Fò&VæFW"à¢òò÷&÷rà¢f"æW‡BÒ&VæFW%7FFRçF–Ã°¢&VæFW%7FFRç&VæFW&–ærÒæW‡C°¢&VæFW%7FFRçF–ÂÒæW‡Bç6–&Æ–æs°¢&VæFW%7FFRç&VæFW&–æu7F'EF–ÖRÒæ÷r‚“°¢æW‡Bç6–&Æ–ærÒçVÆÃ²òò&W7F÷&RF†R6öçFW‡Bà¢òòDôDó¢vR6â&ö&&Ç’§W7Bfö–B÷–ær—B–ç7FVBæBöæÇ¢òò6WGF–ær—BF†Rf—'7BF–ÖRvRvòg&öÒæ÷B7W7VæFVBFò7W7VæFVBà ¢f"7W7Vç6T6öçFW‡BÒ7W7Vç6U7F6´7W'6÷"æ7W'&VçC° ¢–b†F–E7W7VæDÇ&VG’’°¢7W7Vç6T6öçFW‡BÒ6WE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡BÂf÷&6U7W7Vç6TfÆÆ&6²“°¢ÒVÇ6R°¢7W7Vç6T6öçFW‡BÒ6WDFVfVÇE6†ÆÆ÷u7W7Vç6T6öçFW‡B‡7W7Vç6T6öçFW‡B“°¢Ð ¢W6…7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72Â7W7Vç6T6öçFW‡B“²òòFò72÷fW"F†RæW‡B&÷rà¢òòFöâwB'V&&ÆR&÷W'F–W2–âF†—266Rà ¢&WGW&âæW‡C°¢Ð ¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢66R66÷T6ö×öæVçC ¢° ¢'&V³°¢Ð ¢66Röfg67&VVä6ö×öæVçC ¢66RÆVv7”†–FFVä6ö×öæVçC ¢°¢÷&VæFW$ÆæW2‡v÷&´–å&öw&W72“°¢f"öæW‡E7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS°¢f"æW‡D—4†–FFVâÒöæW‡E7FFRÓÒçVÆÃ° ¢–b†7W'&VçBÓÒçVÆÂ’°¢f"÷&We7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS°¢f"&Wd—4†–FFVâÒ÷&We7FFRÓÒçVÆÃ° ¢–b‡&Wd—4†–FFVâÓÒæW‡D—4†–FFVâbb‚òòÆVv7”†–FFVâFöW6âwBFòç’†–F–ær(	B—BöæÇ’&R×&VæFW'2à¢Væ&ÆTÆVv7”†–FFVâ’’°¢v÷&´–å&öw&W72æfÆw2ÃÒf—6–&–Æ—G“°¢Ð¢Ð ¢–b‚æW‡D—4†–FFVâÇÂ‡v÷&´–å&öw&W72æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“°¢ÒVÇ6R°¢òòFöâwB'V&&ÆR&÷W'F–W2f÷"†–FFVâ6†–ÆG&VâVæÆW72vRw&R&VæFW&–æp¢òòBöfg67&VVâ&–÷&—G’à¢–b†–æ6ÇVFW56öÖTÆæR‡7V'G&VU&VæFW$ÆæW2Âöfg67&VVäÆæR’’°¢'V&&ÆU&÷W'F–W2‡v÷&´–å&öw&W72“° ¢°¢òò6†V6²–bF†W&Rv2â–ç6W'F–öâ÷"WFFR–âF†R†–FFVâ7V'G&VRà¢òò–b6òÂvRæVVBFò†–FRF†÷6RæöFW2–âF†R6öÖÖ—B†6RÂ6ð¢òò66†VGVÆRf—6–&–Æ—G’VffV7Bà¢–b‚v÷&´–å&öw&W72ç7V'G&VTfÆw2b…Æ6VÖVçBÂWFFR’’°¢v÷&´–å&öw&W72æfÆw2ÃÒf—6–&–Æ—G“°¢Ð¢Ð¢Ð¢Ð¢&WGW&âçVÆÃ°¢Ð ¢66R66†T6ö×öæVçC ¢° ¢&WGW&âçVÆÃ°¢Ð ¢66RG&6–ætÖ&¶W$6ö×öæVçC ¢° ¢&WGW&âçVÆÃ°¢Ð¢Ð ¢F‡&÷ræWrW'&÷"‚%Væ¶æ÷vâVæ—Böbv÷&²Fr‚"²v÷&´–å&öw&W72çFr²"’âF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’'Vr–â"²u&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢gVæ7F–öâVçv–æEv÷&²†7W'&VçBÂv÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢òòæ÷FS¢F†—2–çFVçF–öæÆÇ’FöW6âwB6†V6²–bvRw&R‡–G&F–ær&V6W6R6ö×&–æp¢òòFòF†R7W'&VçBG&VR&÷f–FW"f–&W"—2§W7B2f7BæBÆW72W'&÷"×&öæRà¢òò–FVÆÇ’vRv÷VÆB†fR7V6–ÂfW'6–öâöbF†Rv÷&²Æö÷öæÇ¢òòf÷"‡–G&F–öâà¢÷G&VT6öçFW‡B‡v÷&´–å&öw&W72“° ¢7v—F6‚‡v÷&´–å&öw&W72çFr’°¢66R6Æ746ö×öæVçC ¢°¢f"6ö×öæVçBÒv÷&´–å&öw&W72çG—S° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢÷6öçFW‡B‡v÷&´–å&öw&W72“°¢Ð ¢f"fÆw2Òv÷&´–å&öw&W72æfÆw3° ¢–b†fÆw2b6†÷VÆD6GW&R’°¢v÷&´–å&öw&W72æfÆw2ÒfÆw2bå6†÷VÆD6GW&RÂF–D6GW&S° ¢–b‚‡v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢G&ç6fW$7GVÄGW&F–öâ‡v÷&´–å&öw&W72“°¢Ð ¢&WGW&âv÷&´–å&öw&W73°¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7E&ö÷C ¢°¢f"&ö÷BÒv÷&´–å&öw&W72ç7FFTæöFS°¢÷†÷7D6öçF–æW"‡v÷&´–å&öw&W72“°¢÷F÷ÆWfVÄ6öçFW‡Dö&¦V7B‡v÷&´–å&öw&W72“°¢&W6WEv÷&´–å&öw&W75fW'6–öç2‚“°¢f"öfÆw2Òv÷&´–å&öw&W72æfÆw3° ¢–b‚…öfÆw2b6†÷VÆD6GW&R’ÓÒæôfÆw2bb…öfÆw2bF–D6GW&R’ÓÓÒæôfÆw2’°¢òòF†W&Rv2âW'&÷"GW&–ær&VæFW"F†Bv6âwB6GW&VB'’7W7Vç6P¢òò&÷VæF'’âFò6V6öæB72öâF†R&ö÷BFòVæÖ÷VçBF†R6†–ÆG&Vâà¢v÷&´–å&öw&W72æfÆw2ÒöfÆw2bå6†÷VÆD6GW&RÂF–D6GW&S°¢&WGW&âv÷&´–å&öw&W73°¢ÒòòvRVçv÷VæBFòF†R&ö÷Bv—F†÷WB6ö×ÆWF–ær—BâW†—Bà  ¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢òòDôDó¢÷‡–G&F–öå7FFP¢÷†÷7D6öçFW‡B‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ°¢Ð ¢66R7W7Vç6T6ö×öæVçC ¢°¢÷7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72“°¢f"7W7Vç6U7FFRÒv÷&´–å&öw&W72æÖVÖö—¦VE7FFS° ¢–b‡7W7Vç6U7FFRÓÒçVÆÂbb7W7Vç6U7FFRæFV‡–G&FVBÓÒçVÆÂ’°¢–b‡v÷&´–å&öw&W72æÇFW&æFRÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚uF‡&Wr–âæWvÇ’Ö÷VçFVBFV‡–G&FVB6ö×öæVçBâF†—2—2Æ–¶VÇ’'Vr–âr²u&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢&W6WD‡–G&F–öå7FFR‚“°¢Ð ¢f"öfÆw3"Òv÷&´–å&öw&W72æfÆw3° ¢–b…öfÆw3"b6†÷VÆD6GW&R’°¢v÷&´–å&öw&W72æfÆw2ÒöfÆw3"bå6†÷VÆD6GW&RÂF–D6GW&S²òò6GW&VB7W7Vç6RVffV7Bâ&R×&VæFW"F†R&÷VæF'’à ¢–b‚‡v÷&´–å&öw&W72æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢G&ç6fW$7GVÄGW&F–öâ‡v÷&´–å&öw&W72“°¢Ð ¢&WGW&âv÷&´–å&öw&W73°¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢°¢÷7W7Vç6T6öçFW‡B‡v÷&´–å&öw&W72“²òò7W7Vç6TÆ—7BFöW6âwB7GVÆÇ’6F6‚ç—F†–ærâ—B6†÷VÆBwfR&VVà¢òò6Vv‡B'’æW7FVB&÷VæF'’â–bæ÷BÂ—B6†÷VÆB'V&&ÆRF‡&÷Vv‚à ¢&WGW&âçVÆÃ°¢Ð ¢66R†÷7E÷'FÃ ¢÷†÷7D6öçF–æW"‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ° ¢66R6öçFW‡E&÷f–FW# ¢f"6öçFW‡BÒv÷&´–å&öw&W72çG—Råö6öçFW‡C°¢÷&÷f–FW"†6öçFW‡BÂv÷&´–å&öw&W72“°¢&WGW&âçVÆÃ° ¢66Röfg67&VVä6ö×öæVçC ¢66RÆVv7”†–FFVä6ö×öæVçC ¢÷&VæFW$ÆæW2‡v÷&´–å&öw&W72“°¢&WGW&âçVÆÃ° ¢66R66†T6ö×öæVçC  ¢&WGW&âçVÆÃ° ¢FVfVÇC ¢&WGW&âçVÆÃ°¢Ð¢Ð ¢gVæ7F–öâVçv–æD–çFW''WFVEv÷&²†7W'&VçBÂ–çFW''WFVEv÷&²Â&VæFW$ÆæW2’°¢òòæ÷FS¢F†—2–çFVçF–öæÆÇ’FöW6âwB6†V6²–bvRw&R‡–G&F–ær&V6W6R6ö×&–æp¢òòFòF†R7W'&VçBG&VR&÷f–FW"f–&W"—2§W7B2f7BæBÆW72W'&÷"×&öæRà¢òò–FVÆÇ’vRv÷VÆB†fR7V6–ÂfW'6–öâöbF†Rv÷&²Æö÷öæÇ¢òòf÷"‡–G&F–öâà¢÷G&VT6öçFW‡B†–çFW''WFVEv÷&²“° ¢7v—F6‚†–çFW''WFVEv÷&²çFr’°¢66R6Æ746ö×öæVçC ¢°¢f"6†–ÆD6öçFW‡EG—W2Ò–çFW''WFVEv÷&²çG—Ræ6†–ÆD6öçFW‡EG—W3° ¢–b†6†–ÆD6öçFW‡EG—W2ÓÒçVÆÂbb6†–ÆD6öçFW‡EG—W2ÓÒVæFVf–æVB’°¢÷6öçFW‡B†–çFW''WFVEv÷&²“°¢Ð ¢'&V³°¢Ð ¢66R†÷7E&ö÷C ¢°¢f"&ö÷BÒ–çFW''WFVEv÷&²ç7FFTæöFS°¢÷†÷7D6öçF–æW"†–çFW''WFVEv÷&²“°¢÷F÷ÆWfVÄ6öçFW‡Dö&¦V7B†–çFW''WFVEv÷&²“°¢&W6WEv÷&´–å&öw&W75fW'6–öç2‚“°¢'&V³°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢÷†÷7D6öçFW‡B†–çFW''WFVEv÷&²“°¢'&V³°¢Ð ¢66R†÷7E÷'FÃ ¢÷†÷7D6öçF–æW"†–çFW''WFVEv÷&²“°¢'&V³° ¢66R7W7Vç6T6ö×öæVçC ¢÷7W7Vç6T6öçFW‡B†–çFW''WFVEv÷&²“°¢'&V³° ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢÷7W7Vç6T6öçFW‡B†–çFW''WFVEv÷&²“°¢'&V³° ¢66R6öçFW‡E&÷f–FW# ¢f"6öçFW‡BÒ–çFW''WFVEv÷&²çG—Råö6öçFW‡C°¢÷&÷f–FW"†6öçFW‡BÂ–çFW''WFVEv÷&²“°¢'&V³° ¢66Röfg67&VVä6ö×öæVçC ¢66RÆVv7”†–FFVä6ö×öæVçC ¢÷&VæFW$ÆæW2†–çFW''WFVEv÷&²“°¢'&V³°¢Ð¢Ð ¢f"F–Ev&ä&÷WEVæFVf–æVE6æ6†÷D&Vf÷&UWFFRÒçVÆÃ° ¢°¢F–Ev&ä&÷WEVæFVf–æVE6æ6†÷D&Vf÷&UWFFRÒæWr6WB‚“°¢ÒòòW6VBGW&–ærF†R6öÖÖ—B†6RFòG&6²F†R7FFRöbF†Röfg67&VVâ6ö×öæVçB7F6²à¢òòÆÆ÷w2W2Fòfö–BG&fW'6–ærF†R&WGW&âF‚Fòf–æBF†RæV&W7Böfg67&VVâæ6W7F÷"à¢òòöæÇ’W6VBv†VâVæ&ÆU7W7Vç6TÆ–÷WDVffV7E6VÖçF–72—2Væ&ÆVBà  ¢f"öfg67&VVå7V'G&VT—4†–FFVâÒfÇ6S°¢f"öfg67&VVå7V'G&VUv4†–FFVâÒfÇ6S°¢f"÷76–&Ç•vVµ6WBÒG—VöbvVµ6WBÓÓÒvgVæ7F–öâròvVµ6WB¢6WC°¢f"æW‡DVffV7BÒçVÆÃ²òòW6VBf÷"&öf–Æ–ær'V–ÆG2FòG&6²WFFW'2à ¢f"–å&öw&W74ÆæW2ÒçVÆÃ°¢f"–å&öw&W75&ö÷BÒçVÆÃ°¢gVæ7F–öâ&W÷'EVæ6Vv‡DW'&÷$–äDUb†W'&÷"’°¢òòw&–ærV6‚6ÖÆÂ'BöbF†R6öÖÖ—B†6R–çFòwV&FV@¢òò6ÆÆ&6²—2&—BFöò6Æ÷r†‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7B÷VÆÂó#ccb’à¢òò'WBvR&VÇ’öâ—BFò7W&f6RW'&÷'2FòDUbFööÇ2Æ–¶R÷fW&Æ—0¢òò†‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7Bö—77VW2ó#s"’à¢òò26ö×&öÖ—6RÂ&WF‡&÷röæÇ’6Vv‡BW'&÷'2–âwV&Bà¢°¢–çfö¶TwV&FVD6ÆÆ&6²†çVÆÂÂgVæ7F–öâ‚’°¢F‡&÷rW'&÷#°¢Ò“°¢6ÆV$6Vv‡DW'&÷"‚“°¢Ð¢Ð ¢f"6ÆÄ6ö×öæVçEv–ÆÅVæÖ÷VçEv—F…F–ÖW"ÒgVæ7F–öâ†7W'&VçBÂ–ç7Fæ6R’°¢–ç7Fæ6Rç&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3°¢–ç7Fæ6Rç7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS° ¢–b‚7W'&VçBæÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢–ç7Fæ6Ræ6ö×öæVçEv–ÆÅVæÖ÷VçB‚“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†7W'&VçB“°¢Ð¢ÒVÇ6R°¢–ç7Fæ6Ræ6ö×öæVçEv–ÆÅVæÖ÷VçB‚“°¢Ð¢Ó²òò6GW&RW'&÷'26òF†W’FöâwB–çFW''WBÖ÷VçF–ærà  ¢gVæ7F–öâ6fVÇ”6ÆÄ6öÖÖ—D†öö´Æ–÷WDVffV7DÆ—7DÖ÷VçB†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"’°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB„Æ–÷WBÂ7W'&VçB“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"“°¢Ð¢Òòò6GW&RW'&÷'26òF†W’FöâwB–çFW''WBVæÖ÷VçF–ærà  ¢gVæ7F–öâ6fVÇ”6ÆÄ6ö×öæVçEv–ÆÅVæÖ÷VçB†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"Â–ç7Fæ6R’°¢G'’°¢6ÆÄ6ö×öæVçEv–ÆÅVæÖ÷VçEv—F…F–ÖW"†7W'&VçBÂ–ç7Fæ6R“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"“°¢Ð¢Òòò6GW&RW'&÷'26òF†W’FöâwB–çFW''WBÖ÷VçF–ærà  ¢gVæ7F–öâ6fVÇ”6ÆÄ6ö×öæVçDF–DÖ÷VçB†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"Â–ç7Fæ6R’°¢G'’°¢–ç7Fæ6Ræ6ö×öæVçDF–DÖ÷VçB‚“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"“°¢Ð¢Òòò6GW&RW'&÷'26òF†W’FöâwB–çFW''WBÖ÷VçF–ærà  ¢gVæ7F–öâ6fVÇ”GF6…&Vb†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"’°¢G'’°¢6öÖÖ—DGF6…&Vb†7W'&VçB“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"“°¢Ð¢Ð ¢gVæ7F–öâ6fVÇ”FWF6…&Vb†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"’°¢f"&VbÒ7W'&VçBç&Vc° ¢–b‡&VbÓÒçVÆÂ’°¢–b‡G—Vöb&VbÓÓÒvgVæ7F–öâr’°¢f"&WEfÃ° ¢G'’°¢–b†Væ&ÆU&öf–ÆW%F–ÖW"bbVæ&ÆU&öf–ÆW$6öÖÖ—D†öö·2bb7W'&VçBæÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢&WEfÂÒ&Vb†çVÆÂ“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†7W'&VçB“°¢Ð¢ÒVÇ6R°¢&WEfÂÒ&Vb†çVÆÂ“°¢Ð¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"“°¢Ð ¢°¢–b‡G—Vöb&WEfÂÓÓÒvgVæ7F–öâr’°¢W'&÷"‚uVæW‡V7FVB&WGW&âfÇVRg&öÒ6ÆÆ&6²&Vb–âW2âr²t6ÆÆ&6²&Vb6†÷VÆBæ÷B&WGW&âgVæ7F–öâârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†7W'&VçB’“°¢Ð¢Ð¢ÒVÇ6R°¢&Vbæ7W'&VçBÒçVÆÃ°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6fVÇ”6ÆÄFW7G&÷’†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFW7G&÷’’°¢G'’°¢FW7G&÷’‚“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"“°¢Ð¢Ð ¢f"fö7W6VD–ç7Fæ6T†æFÆRÒçVÆÃ°¢f"6†÷VÆDf—&TgFW$7F—fT–ç7Fæ6T&ÇW"ÒfÇ6S°¢gVæ7F–öâ6öÖÖ—D&Vf÷&T×WFF–öäVffV7G2‡&ö÷BÂf—'7D6†–ÆB’°¢fö7W6VD–ç7Fæ6T†æFÆRÒ&W&Tf÷$6öÖÖ—B‡&ö÷Bæ6öçF–æW$–æfò“°¢æW‡DVffV7BÒf—'7D6†–ÆC°¢6öÖÖ—D&Vf÷&T×WFF–öäVffV7G5ö&Vv–â‚“²òòvRæòÆöævW"æVVBFòG&6²F†R7F—fR–ç7Fæ6Rf–&W  ¢f"6†÷VÆDf—&RÒ6†÷VÆDf—&TgFW$7F—fT–ç7Fæ6T&ÇW#°¢6†÷VÆDf—&TgFW$7F—fT–ç7Fæ6T&ÇW"ÒfÇ6S°¢fö7W6VD–ç7Fæ6T†æFÆRÒçVÆÃ°¢&WGW&â6†÷VÆDf—&S°¢Ð ¢gVæ7F–öâ6öÖÖ—D&Vf÷&T×WFF–öäVffV7G5ö&Vv–â‚’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C²òòF†—2†6R—2öæÇ’W6VBf÷"&Vf÷&T7F—fT–ç7Fæ6T&ÇW"à ¢f"6†–ÆBÒf–&W"æ6†–ÆC° ¢–b‚†f–&W"ç7V'G&VTfÆw2b&Vf÷&T×WFF–öäÖ6²’ÓÒæôfÆw2bb6†–ÆBÓÒçVÆÂ’°¢6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒ6†–ÆC°¢ÒVÇ6R°¢6öÖÖ—D&Vf÷&T×WFF–öäVffV7G5ö6ö×ÆWFR‚“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—D&Vf÷&T×WFF–öäVffV7G5ö6ö×ÆWFR‚’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢6WD7W'&VçDf–&W"†f–&W"“° ¢G'’°¢6öÖÖ—D&Vf÷&T×WFF–öäVffV7G4öäf–&W"†f–&W"“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“°¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs° ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢6–&Æ–ærç&WGW&âÒf–&W"ç&WGW&ã°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒf–&W"ç&WGW&ã°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—D&Vf÷&T×WFF–öäVffV7G4öäf–&W"†f–æ—6†VEv÷&²’°¢f"7W'&VçBÒf–æ—6†VEv÷&²æÇFW&æFS°¢f"fÆw2Òf–æ—6†VEv÷&²æfÆw3° ¢–b‚†fÆw2b6æ6†÷B’ÓÒæôfÆw2’°¢6WD7W'&VçDf–&W"†f–æ—6†VEv÷&²“° ¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢–b†7W'&VçBÓÒçVÆÂ’°¢f"&We&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3°¢f"&We7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS°¢f"–ç7Fæ6RÒf–æ—6†VEv÷&²ç7FFTæöFS²òòvR6÷VÆBWFFR–ç7Fæ6R&÷2æB7FFR†W&RÀ¢òò'WB–ç7FVBvR&VÇ’öâF†VÒ&V–ær6WBGW&–ærÆ7B&VæFW"à¢òòDôDó¢&Wf—6—BF†—2v†VâvR–×ÆVÖVçB&W7VÖ–ærà ¢°¢–b†f–æ—6†VEv÷&²çG—RÓÓÒf–æ—6†VEv÷&²æVÆVÖVçEG—RbbF–Ev&ä&÷WE&V76–væ–æu&÷2’°¢–b†–ç7Fæ6Rç&÷2ÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE&÷2’°¢W'&÷"‚tW‡V7FVBW2&÷2FòÖF6‚ÖVÖö—¦VB&÷2&Vf÷&Rr²vvWE6æ6†÷D&Vf÷&UWFFRâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç&÷6âr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð ¢–b†–ç7Fæ6Rç7FFRÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFR’°¢W'&÷"‚tW‡V7FVBW27FFRFòÖF6‚ÖVÖö—¦VB7FFR&Vf÷&Rr²vvWE6æ6†÷D&Vf÷&UWFFRâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç7FFVâr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð¢Ð¢Ð ¢f"6æ6†÷BÒ–ç7Fæ6RævWE6æ6†÷D&Vf÷&UWFFR†f–æ—6†VEv÷&²æVÆVÖVçEG—RÓÓÒf–æ—6†VEv÷&²çG—Rò&We&÷2¢&W6öÇfTFVfVÇE&÷2†f–æ—6†VEv÷&²çG—RÂ&We&÷2’Â&We7FFR“° ¢°¢f"F–Ev&å6WBÒF–Ev&ä&÷WEVæFVf–æVE6æ6†÷D&Vf÷&UWFFS° ¢–b‡6æ6†÷BÓÓÒVæFVf–æVBbbF–Ev&å6WBæ†2†f–æ—6†VEv÷&²çG—R’’°¢F–Ev&å6WBæFB†f–æ—6†VEv÷&²çG—R“° ¢W'&÷"‚rW2ævWE6æ6†÷D&Vf÷&UWFFR‚“¢6æ6†÷BfÇVR†÷"çVÆÂ’r²v×W7B&R&WGW&æVBâ–÷R†fR&WGW&æVBVæFVf–æVBârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’“°¢Ð¢Ð ¢–ç7Fæ6Råõ÷&V7D–çFW&æÅ6æ6†÷D&Vf÷&UWFFRÒ6æ6†÷C°¢Ð ¢'&V³°¢Ð ¢66R†÷7E&ö÷C ¢°¢°¢f"&ö÷BÒf–æ—6†VEv÷&²ç7FFTæöFS°¢6ÆV$6öçF–æW"‡&ö÷Bæ6öçF–æW$–æfò“°¢Ð ¢'&V³°¢Ð ¢66R†÷7D6ö×öæVçC ¢66R†÷7EFW‡C ¢66R†÷7E÷'FÃ ¢66R–æ6ö×ÆWFT6Æ746ö×öæVçC ¢òòæ÷F†–ærFòFòf÷"F†W6R6ö×öæVçBG—W0¢'&V³° ¢FVfVÇC ¢°¢F‡&÷ræWrW'&÷"‚uF†—2Væ—Böbv÷&²Fr6†÷VÆBæ÷B†fR6–FRÖVffV7G2âF†—2W'&÷"—2r²vÆ–¶VÇ’6W6VB'’'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð¢Ð ¢&W6WD7W'&VçDf–&W"‚“°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB†fÆw2Âf–æ—6†VEv÷&²ÂæV&W7DÖ÷VçFVDæ6W7F÷"’°¢f"WFFUVWVRÒf–æ—6†VEv÷&²çWFFUVWVS°¢f"Æ7DVffV7BÒWFFUVWVRÓÒçVÆÂòWFFUVWVRæÆ7DVffV7B¢çVÆÃ° ¢–b†Æ7DVffV7BÓÒçVÆÂ’°¢f"f—'7DVffV7BÒÆ7DVffV7BææW‡C°¢f"VffV7BÒf—'7DVffV7C° ¢Fò°¢–b‚†VffV7BçFrbfÆw2’ÓÓÒfÆw2’°¢òòVæÖ÷Vç@¢f"FW7G&÷’ÒVffV7BæFW7G&÷“°¢VffV7BæFW7G&÷’ÒVæFVf–æVC° ¢–b†FW7G&÷’ÓÒVæFVf–æVB’°¢°¢–b‚†fÆw2b76—fRC’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçE76—fTVffV7EVæÖ÷VçE7F'FVB†f–æ—6†VEv÷&²“°¢ÒVÇ6R–b‚†fÆw2bÆ–÷WB’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçDÆ–÷WDVffV7EVæÖ÷VçE7F'FVB†f–æ—6†VEv÷&²“°¢Ð¢Ð ¢°¢–b‚†fÆw2b–ç6W'F–öâ’ÓÒæôfÆw2C’°¢6WD—5'Vææ–æt–ç6W'F–öäVffV7B‡G'VR“°¢Ð¢Ð ¢6fVÇ”6ÆÄFW7G&÷’†f–æ—6†VEv÷&²ÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFW7G&÷’“° ¢°¢–b‚†fÆw2b–ç6W'F–öâ’ÓÒæôfÆw2C’°¢6WD—5'Vææ–æt–ç6W'F–öäVffV7B†fÇ6R“°¢Ð¢Ð ¢°¢–b‚†fÆw2b76—fRC’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçE76—fTVffV7EVæÖ÷VçE7F÷VB‚“°¢ÒVÇ6R–b‚†fÆw2bÆ–÷WB’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçDÆ–÷WDVffV7EVæÖ÷VçE7F÷VB‚“°¢Ð¢Ð¢Ð¢Ð ¢VffV7BÒVffV7BææW‡C°¢Òv†–ÆR†VffV7BÓÒf—'7DVffV7B“°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB†fÆw2Âf–æ—6†VEv÷&²’°¢f"WFFUVWVRÒf–æ—6†VEv÷&²çWFFUVWVS°¢f"Æ7DVffV7BÒWFFUVWVRÓÒçVÆÂòWFFUVWVRæÆ7DVffV7B¢çVÆÃ° ¢–b†Æ7DVffV7BÓÒçVÆÂ’°¢f"f—'7DVffV7BÒÆ7DVffV7BææW‡C°¢f"VffV7BÒf—'7DVffV7C° ¢Fò°¢–b‚†VffV7BçFrbfÆw2’ÓÓÒfÆw2’°¢°¢–b‚†fÆw2b76—fRC’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçE76—fTVffV7DÖ÷VçE7F'FVB†f–æ—6†VEv÷&²“°¢ÒVÇ6R–b‚†fÆw2bÆ–÷WB’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçDÆ–÷WDVffV7DÖ÷VçE7F'FVB†f–æ—6†VEv÷&²“°¢Ð¢ÒòòÖ÷Vç@  ¢f"7&VFRÒVffV7Bæ7&VFS° ¢°¢–b‚†fÆw2b–ç6W'F–öâ’ÓÒæôfÆw2C’°¢6WD—5'Vææ–æt–ç6W'F–öäVffV7B‡G'VR“°¢Ð¢Ð ¢VffV7BæFW7G&÷’Ò7&VFR‚“° ¢°¢–b‚†fÆw2b–ç6W'F–öâ’ÓÒæôfÆw2C’°¢6WD—5'Vææ–æt–ç6W'F–öäVffV7B†fÇ6R“°¢Ð¢Ð ¢°¢–b‚†fÆw2b76—fRC’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçE76—fTVffV7DÖ÷VçE7F÷VB‚“°¢ÒVÇ6R–b‚†fÆw2bÆ–÷WB’ÓÒæôfÆw2C’°¢Ö&´6ö×öæVçDÆ–÷WDVffV7DÖ÷VçE7F÷VB‚“°¢Ð¢Ð ¢°¢f"FW7G&÷’ÒVffV7BæFW7G&÷“° ¢–b†FW7G&÷’ÓÒVæFVf–æVBbbG—VöbFW7G&÷’ÓÒvgVæ7F–öâr’°¢f"†öö´æÖRÒfö–B° ¢–b‚†VffV7BçFrbÆ–÷WB’ÓÒæôfÆw2’°¢†öö´æÖRÒwW6TÆ–÷WDVffV7Bs°¢ÒVÇ6R–b‚†VffV7BçFrb–ç6W'F–öâ’ÓÒæôfÆw2’°¢†öö´æÖRÒwW6T–ç6W'F–öäVffV7Bs°¢ÒVÇ6R°¢†öö´æÖRÒwW6TVffV7Bs°¢Ð ¢f"FFVæGVÒÒfö–B° ¢–b†FW7G&÷’ÓÓÒçVÆÂ’°¢FFVæGVÒÒr–÷R&WGW&æVBçVÆÂâ–b–÷W"VffV7BFöW2æ÷B&WV—&R6ÆVâr²wWÂ&WGW&âVæFVf–æVB†÷"æ÷F†–ær’âs°¢ÒVÇ6R–b‡G—VöbFW7G&÷’çF†VâÓÓÒvgVæ7F–öâr’°¢FFVæGVÒÒuÆåÆä—BÆöö·2Æ–¶R–÷Rw&÷FRr²†öö´æÖR²r†7–æ2‚’Óââââ’÷"&WGW&æVB&öÖ—6Râr²t–ç7FVBÂw&—FRF†R7–æ2gVæ7F–öâ–ç6–FR–÷W"VffV7Br²væB6ÆÂ—B–ÖÖVF–FVÇ“¥ÆåÆâr²†öö´æÖR²r‚‚’ÓâµÆâr²r7–æ2gVæ7F–öâfWF6„FF‚’µÆâr²ròò–÷R6âv—B†W&UÆâr²r6öç7B&W7öç6RÒv—B×”’ævWDFF‡6öÖT–B“µÆâr²ròòââåÆâr²rÕÆâr²rfWF6„FF‚“µÆâr²'ÒÂ·6öÖT–EÒ“²òò÷"µÒ–bVffV7BFöW6âwBæVVB&÷2÷"7FFUÆåÆâ"²tÆV&âÖ÷&R&÷WBFFfWF6†–ærv—F‚†öö·3¢‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²ö†öö·2ÖFFÖfWF6†–ærs°¢ÒVÇ6R°¢FFVæGVÒÒr–÷R&WGW&æVC¢r²FW7G&÷“°¢Ð ¢W'&÷"‚rW2×W7Bæ÷B&WGW&âç—F†–ær&W6–FW2gVæ7F–öâÂr²wv†–6‚—2W6VBf÷"6ÆVâ×WâW2rÂ†öö´æÖRÂFFVæGVÒ“°¢Ð¢Ð¢Ð ¢VffV7BÒVffV7BææW‡C°¢Òv†–ÆR†VffV7BÓÒf—'7DVffV7B“°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fTVffV7DGW&F–öç2†f–æ—6†VE&ö÷BÂf–æ—6†VEv÷&²’°¢°¢òòöæÇ’&öf–ÆW'2v—F‚v÷&²–âF†V—"7V'G&VRv–ÆÂ†fRâWFFRVffV7B66†VGVÆVBà¢–b‚†f–æ—6†VEv÷&²æfÆw2bWFFR’ÓÒæôfÆw2’°¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66R&öf–ÆW# ¢°¢f"76—fTVffV7DGW&F–öâÒf–æ—6†VEv÷&²ç7FFTæöFRç76—fTVffV7DGW&F–öã°¢f"öf–æ—6†VEv÷&²FÖVÖö—¦RÒf–æ—6†VEv÷&²æÖVÖö—¦VE&÷2À¢–BÒöf–æ—6†VEv÷&²FÖVÖö—¦Ræ–BÀ¢öå÷7D6öÖÖ—BÒöf–æ—6†VEv÷&²FÖVÖö—¦Ræöå÷7D6öÖÖ—C²òòF†—2fÇVRv–ÆÂ7F–ÆÂ&VfÆV7BF†R&Wf–÷W26öÖÖ—B†6Rà¢òò—BFöW2æ÷BvWB&W6WBVçF–ÂF†R7F'BöbF†RæW‡B6öÖÖ—B†6Rà ¢f"6öÖÖ—EF–ÖRÒvWD6öÖÖ—EF–ÖR‚“°¢f"†6RÒf–æ—6†VEv÷&²æÇFW&æFRÓÓÒçVÆÂòvÖ÷VçBr¢wWFFRs° ¢°¢–b†—47W'&VçEWFFTæW7FVB‚’’°¢†6RÒvæW7FVB×WFFRs°¢Ð¢Ð ¢–b‡G—Vöböå÷7D6öÖÖ—BÓÓÒvgVæ7F–öâr’°¢öå÷7D6öÖÖ—B†–BÂ†6RÂ76—fTVffV7DGW&F–öâÂ6öÖÖ—EF–ÖR“°¢Òòò'V&&ÆRF–ÖW2FòF†RæW‡BæV&W7Bæ6W7F÷"&öf–ÆW"à¢òògFW"vR&ö6W72F†B&öf–ÆW"ÂvRvÆÂ'V&&ÆRgW'F†W"Wà  ¢f"&VçDf–&W"Òf–æ—6†VEv÷&²ç&WGW&ã° ¢÷WFW#¢v†–ÆR‡&VçDf–&W"ÓÒçVÆÂ’°¢7v—F6‚‡&VçDf–&W"çFr’°¢66R†÷7E&ö÷C ¢f"&ö÷BÒ&VçDf–&W"ç7FFTæöFS°¢&ö÷Bç76—fTVffV7DGW&F–öâ³Ò76—fTVffV7DGW&F–öã°¢'&V²÷WFW#° ¢66R&öf–ÆW# ¢f"&VçE7FFTæöFRÒ&VçDf–&W"ç7FFTæöFS°¢&VçE7FFTæöFRç76—fTVffV7DGW&F–öâ³Ò76—fTVffV7DGW&F–öã°¢'&V²÷WFW#°¢Ð ¢&VçDf–&W"Ò&VçDf–&W"ç&WGW&ã°¢Ð ¢'&V³°¢Ð¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—DÆ–÷WDVffV7Döäf–&W"†f–æ—6†VE&ö÷BÂ7W'&VçBÂf–æ—6†VEv÷&²Â6öÖÖ—GFVDÆæW2’°¢–b‚†f–æ—6†VEv÷&²æfÆw2bÆ–÷WDÖ6²’ÓÒæôfÆw2’°¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚öfg67&VVå7V'G&VUv4†–FFVâ’°¢òòBF†—2ö–çBÆ–÷WBVffV7G2†fRÇ&VG’&VVâFW7G&÷–VB†GW&–ær×WFF–öâ†6R’à¢òòF†—2—2FöæRFò&WfVçB6–&Æ–ær6ö×öæVçBVffV7G2g&öÒ–çFW&fW&–ærv—F‚V6‚÷F†W"À¢òòRærâFW7G&÷’gVæ7F–öâ–âöæR6ö×öæVçB6†÷VÆBæWfW"÷fW'&–FR&Vb6W@¢òò'’7&VFRgVæ7F–öâ–âæ÷F†W"6ö×öæVçBGW&–ærF†R6ÖR6öÖÖ—Bà¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB„Æ–÷WBÂ†4VffV7BÂf–æ—6†VEv÷&²“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢Ð¢ÒVÇ6R°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB„Æ–÷WBÂ†4VffV7BÂf–æ—6†VEv÷&²“°¢Ð¢Ð ¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢f"–ç7Fæ6RÒf–æ—6†VEv÷&²ç7FFTæöFS° ¢–b†f–æ—6†VEv÷&²æfÆw2bWFFR’°¢–b‚öfg67&VVå7V'G&VUv4†–FFVâ’°¢–b†7W'&VçBÓÓÒçVÆÂ’°¢òòvR6÷VÆBWFFR–ç7Fæ6R&÷2æB7FFR†W&RÀ¢òò'WB–ç7FVBvR&VÇ’öâF†VÒ&V–ær6WBGW&–ærÆ7B&VæFW"à¢òòDôDó¢&Wf—6—BF†—2v†VâvR–×ÆVÖVçB&W7VÖ–ærà¢°¢–b†f–æ—6†VEv÷&²çG—RÓÓÒf–æ—6†VEv÷&²æVÆVÖVçEG—RbbF–Ev&ä&÷WE&V76–væ–æu&÷2’°¢–b†–ç7Fæ6Rç&÷2ÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE&÷2’°¢W'&÷"‚tW‡V7FVBW2&÷2FòÖF6‚ÖVÖö—¦VB&÷2&Vf÷&Rr²v6ö×öæVçDF–DÖ÷VçBâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç&÷6âr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð ¢–b†–ç7Fæ6Rç7FFRÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFR’°¢W'&÷"‚tW‡V7FVBW27FFRFòÖF6‚ÖVÖö—¦VB7FFR&Vf÷&Rr²v6ö×öæVçDF–DÖ÷VçBâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç7FFVâr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð¢Ð¢Ð ¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢–ç7Fæ6Ræ6ö×öæVçDF–DÖ÷VçB‚“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢Ð¢ÒVÇ6R°¢–ç7Fæ6Ræ6ö×öæVçDF–DÖ÷VçB‚“°¢Ð¢ÒVÇ6R°¢f"&We&÷2Òf–æ—6†VEv÷&²æVÆVÖVçEG—RÓÓÒf–æ—6†VEv÷&²çG—Rò7W'&VçBæÖVÖö—¦VE&÷2¢&W6öÇfTFVfVÇE&÷2†f–æ—6†VEv÷&²çG—RÂ7W'&VçBæÖVÖö—¦VE&÷2“°¢f"&We7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS²òòvR6÷VÆBWFFR–ç7Fæ6R&÷2æB7FFR†W&RÀ¢òò'WB–ç7FVBvR&VÇ’öâF†VÒ&V–ær6WBGW&–ærÆ7B&VæFW"à¢òòDôDó¢&Wf—6—BF†—2v†VâvR–×ÆVÖVçB&W7VÖ–ærà ¢°¢–b†f–æ—6†VEv÷&²çG—RÓÓÒf–æ—6†VEv÷&²æVÆVÖVçEG—RbbF–Ev&ä&÷WE&V76–væ–æu&÷2’°¢–b†–ç7Fæ6Rç&÷2ÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE&÷2’°¢W'&÷"‚tW‡V7FVBW2&÷2FòÖF6‚ÖVÖö—¦VB&÷2&Vf÷&Rr²v6ö×öæVçDF–EWFFRâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç&÷6âr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð ¢–b†–ç7Fæ6Rç7FFRÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFR’°¢W'&÷"‚tW‡V7FVBW27FFRFòÖF6‚ÖVÖö—¦VB7FFR&Vf÷&Rr²v6ö×öæVçDF–EWFFRâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç7FFVâr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð¢Ð¢Ð ¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢–ç7Fæ6Ræ6ö×öæVçDF–EWFFR‡&We&÷2Â&We7FFRÂ–ç7Fæ6Råõ÷&V7D–çFW&æÅ6æ6†÷D&Vf÷&UWFFR“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢Ð¢ÒVÇ6R°¢–ç7Fæ6Ræ6ö×öæVçDF–EWFFR‡&We&÷2Â&We7FFRÂ–ç7Fæ6Råõ÷&V7D–çFW&æÅ6æ6†÷D&Vf÷&UWFFR“°¢Ð¢Ð¢Ð¢ÒòòDôDó¢’F†–æ²F†—2—2æ÷rÇv—2æöâÖçVÆÂ'’F†RF–ÖR—B&V6†W2F†P¢òò6öÖÖ—B†6Râ6öç6–FW"&VÖ÷f–ærF†RG—R6†V6²à  ¢f"WFFUVWVRÒf–æ—6†VEv÷&²çWFFUVWVS° ¢–b‡WFFUVWVRÓÒçVÆÂ’°¢°¢–b†f–æ—6†VEv÷&²çG—RÓÓÒf–æ—6†VEv÷&²æVÆVÖVçEG—RbbF–Ev&ä&÷WE&V76–væ–æu&÷2’°¢–b†–ç7Fæ6Rç&÷2ÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE&÷2’°¢W'&÷"‚tW‡V7FVBW2&÷2FòÖF6‚ÖVÖö—¦VB&÷2&Vf÷&Rr²w&ö6W76–ærF†RWFFRVWVRâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç&÷6âr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð ¢–b†–ç7Fæ6Rç7FFRÓÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFR’°¢W'&÷"‚tW‡V7FVBW27FFRFòÖF6‚ÖVÖö—¦VB7FFR&Vf÷&Rr²w&ö6W76–ærF†RWFFRVWVRâr²uF†—2Ö–v‡BV—F†W"&R&V6W6Röb'Vr–â&V7BÂ÷"&V6W6Rr²v6ö×öæVçB&V76–vç2—G2÷vâF†—2ç7FFVâr²uÆV6Rf–ÆRâ—77VRârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’ÇÂv–ç7Fæ6Rr“°¢Ð¢Ð¢ÒòòvR6÷VÆBWFFR–ç7Fæ6R&÷2æB7FFR†W&RÀ¢òò'WB–ç7FVBvR&VÇ’öâF†VÒ&V–ær6WBGW&–ærÆ7B&VæFW"à¢òòDôDó¢&Wf—6—BF†—2v†VâvR–×ÆVÖVçB&W7VÖ–ærà  ¢6öÖÖ—EWFFUVWVR†f–æ—6†VEv÷&²ÂWFFUVWVRÂ–ç7Fæ6R“°¢Ð ¢'&V³°¢Ð ¢66R†÷7E&ö÷C ¢°¢òòDôDó¢’F†–æ²F†—2—2æ÷rÇv—2æöâÖçVÆÂ'’F†RF–ÖR—B&V6†W2F†P¢òò6öÖÖ—B†6Râ6öç6–FW"&VÖ÷f–ærF†RG—R6†V6²à¢f"÷WFFUVWVRÒf–æ—6†VEv÷&²çWFFUVWVS° ¢–b…÷WFFUVWVRÓÒçVÆÂ’°¢f"ö–ç7Fæ6RÒçVÆÃ° ¢–b†f–æ—6†VEv÷&²æ6†–ÆBÓÒçVÆÂ’°¢7v—F6‚†f–æ—6†VEv÷&²æ6†–ÆBçFr’°¢66R†÷7D6ö×öæVçC ¢ö–ç7Fæ6RÒvWEV&Æ–4–ç7Fæ6R†f–æ—6†VEv÷&²æ6†–ÆBç7FFTæöFR“°¢'&V³° ¢66R6Æ746ö×öæVçC ¢ö–ç7Fæ6RÒf–æ—6†VEv÷&²æ6†–ÆBç7FFTæöFS°¢'&V³°¢Ð¢Ð ¢6öÖÖ—EWFFUVWVR†f–æ—6†VEv÷&²Â÷WFFUVWVRÂö–ç7Fæ6R“°¢Ð ¢'&V³°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢f"ö–ç7Fæ6S"Òf–æ—6†VEv÷&²ç7FFTæöFS²òò&VæFW&W'2Ö’66†VGVÆRv÷&²Fò&RFöæRgFW"†÷7B6ö×öæVçG2&RÖ÷VçFV@¢òò†VrDôÒ&VæFW&W"Ö’66†VGVÆRWFòÖfö7W2f÷"–çWG2æBf÷&Ò6öçG&öÇ2’à¢òòF†W6RVffV7G26†÷VÆBöæÇ’&R6öÖÖ—GFVBv†Vâ6ö×öæVçG2&Rf—'7BÖ÷VçFVBÀ¢òò¶v†VâF†W&R—2æò7W'&VçBöÇFW&æFRà ¢–b†7W'&VçBÓÓÒçVÆÂbbf–æ—6†VEv÷&²æfÆw2bWFFR’°¢f"G—RÒf–æ—6†VEv÷&²çG—S°¢f"&÷2Òf–æ—6†VEv÷&²æÖVÖö—¦VE&÷3°¢6öÖÖ—DÖ÷VçB…ö–ç7Fæ6S"ÂG—RÂ&÷2“°¢Ð ¢'&V³°¢Ð ¢66R†÷7EFW‡C ¢°¢òòvR†fRæòÆ–fRÖ7–6ÆW276ö6–FVBv—F‚FW‡Bà¢'&V³°¢Ð ¢66R†÷7E÷'FÃ ¢°¢òòvR†fRæòÆ–fRÖ7–6ÆW276ö6–FVBv—F‚÷'FÇ2à¢'&V³°¢Ð ¢66R&öf–ÆW# ¢°¢°¢f"öf–æ—6†VEv÷&²FÖVÖö—¦S"Òf–æ—6†VEv÷&²æÖVÖö—¦VE&÷2À¢öä6öÖÖ—BÒöf–æ—6†VEv÷&²FÖVÖö—¦S"æöä6öÖÖ—BÀ¢öå&VæFW"Òöf–æ—6†VEv÷&²FÖVÖö—¦S"æöå&VæFW#°¢f"VffV7DGW&F–öâÒf–æ—6†VEv÷&²ç7FFTæöFRæVffV7DGW&F–öã°¢f"6öÖÖ—EF–ÖRÒvWD6öÖÖ—EF–ÖR‚“°¢f"†6RÒ7W'&VçBÓÓÒçVÆÂòvÖ÷VçBr¢wWFFRs° ¢°¢–b†—47W'&VçEWFFTæW7FVB‚’’°¢†6RÒvæW7FVB×WFFRs°¢Ð¢Ð ¢–b‡G—Vöböå&VæFW"ÓÓÒvgVæ7F–öâr’°¢öå&VæFW"†f–æ—6†VEv÷&²æÖVÖö—¦VE&÷2æ–BÂ†6RÂf–æ—6†VEv÷&²æ7GVÄGW&F–öâÂf–æ—6†VEv÷&²çG&VT&6TGW&F–öâÂf–æ—6†VEv÷&²æ7GVÅ7F'EF–ÖRÂ6öÖÖ—EF–ÖR“°¢Ð ¢°¢–b‡G—Vöböä6öÖÖ—BÓÓÒvgVæ7F–öâr’°¢öä6öÖÖ—B†f–æ—6†VEv÷&²æÖVÖö—¦VE&÷2æ–BÂ†6RÂVffV7DGW&F–öâÂ6öÖÖ—EF–ÖR“°¢Òòò66†VGVÆR76—fRVffV7Bf÷"F†—2&öf–ÆW"Fò6ÆÂöå÷7D6öÖÖ—B†öö·2à¢òòF†—2VffV7B6†÷VÆB&R66†VGVÆVBWfVâ–bF†W&R—2æòöå÷7D6öÖÖ—B6ÆÆ&6²f÷"F†—2&öf–ÆW"À¢òò&V6W6RF†RVffV7B—2Ç6òv†W&RF–ÖW2'V&&ÆRFò&VçB&öf–ÆW'2à  ¢VçVWVUVæF–æu76—fU&öf–ÆW$VffV7B†f–æ—6†VEv÷&²“²òò&÷vFRÆ–÷WBVffV7BGW&F–öç2FòF†RæW‡BæV&W7B&öf–ÆW"æ6W7F÷"à¢òòFòæ÷B&W6WBF†W6RfÇVW2VçF–ÂF†RæW‡B&VæFW"6òFWeFööÇ2†26†æ6RFò&VBF†VÒf—'7Bà ¢f"&VçDf–&W"Òf–æ—6†VEv÷&²ç&WGW&ã° ¢÷WFW#¢v†–ÆR‡&VçDf–&W"ÓÒçVÆÂ’°¢7v—F6‚‡&VçDf–&W"çFr’°¢66R†÷7E&ö÷C ¢f"&ö÷BÒ&VçDf–&W"ç7FFTæöFS°¢&ö÷BæVffV7DGW&F–öâ³ÒVffV7DGW&F–öã°¢'&V²÷WFW#° ¢66R&öf–ÆW# ¢f"&VçE7FFTæöFRÒ&VçDf–&W"ç7FFTæöFS°¢&VçE7FFTæöFRæVffV7DGW&F–öâ³ÒVffV7DGW&F–öã°¢'&V²÷WFW#°¢Ð ¢&VçDf–&W"Ò&VçDf–&W"ç&WGW&ã°¢Ð¢Ð¢Ð ¢'&V³°¢Ð ¢66R7W7Vç6T6ö×öæVçC ¢°¢6öÖÖ—E7W7Vç6T‡–G&F–öä6ÆÆ&6·2†f–æ—6†VE&ö÷BÂf–æ—6†VEv÷&²“°¢'&V³°¢Ð ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢66R–æ6ö×ÆWFT6Æ746ö×öæVçC ¢66R66÷T6ö×öæVçC ¢66Röfg67&VVä6ö×öæVçC ¢66RÆVv7”†–FFVä6ö×öæVçC ¢66RG&6–ætÖ&¶W$6ö×öæVçC ¢°¢'&V³°¢Ð ¢FVfVÇC ¢F‡&÷ræWrW'&÷"‚uF†—2Væ—Böbv÷&²Fr6†÷VÆBæ÷B†fR6–FRÖVffV7G2âF†—2W'&÷"—2r²vÆ–¶VÇ’6W6VB'’'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð¢Ð ¢–b‚öfg67&VVå7V'G&VUv4†–FFVâ’°¢°¢–b†f–æ—6†VEv÷&²æfÆw2b&Vb’°¢6öÖÖ—DGF6…&Vb†f–æ—6†VEv÷&²“°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ&VV$Æ–÷WDVffV7G4öäf–&W"†æöFR’°¢òòGW&âöâÆ–÷WBVffV7G2–âG&VRF†B&Wf–÷W6Ç’F—6V&VBà¢òòDôDò„öfg67&VVâ’6†V6³¢fÆw2bÆ–÷WE7FF–0¢7v—F6‚†æöFRçFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚æöFRæÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢6fVÇ”6ÆÄ6öÖÖ—D†öö´Æ–÷WDVffV7DÆ—7DÖ÷VçB†æöFRÂæöFRç&WGW&â“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†æöFR“°¢Ð¢ÒVÇ6R°¢6fVÇ”6ÆÄ6öÖÖ—D†öö´Æ–÷WDVffV7DÆ—7DÖ÷VçB†æöFRÂæöFRç&WGW&â“°¢Ð ¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢f"–ç7Fæ6RÒæöFRç7FFTæöFS° ¢–b‡G—Vöb–ç7Fæ6Ræ6ö×öæVçDF–DÖ÷VçBÓÓÒvgVæ7F–öâr’°¢6fVÇ”6ÆÄ6ö×öæVçDF–DÖ÷VçB†æöFRÂæöFRç&WGW&âÂ–ç7Fæ6R“°¢Ð ¢6fVÇ”GF6…&Vb†æöFRÂæöFRç&WGW&â“°¢'&V³°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢6fVÇ”GF6…&Vb†æöFRÂæöFRç&WGW&â“°¢'&V³°¢Ð¢Ð¢Ð ¢gVæ7F–öâ†–FT÷%Væ†–FTÆÄ6†–ÆG&Vâ†f–æ—6†VEv÷&²Â—4†–FFVâ’°¢òòöæÇ’†–FR÷"Væ†–FRF†RF÷ÖÖ÷7B†÷7BæöFW2à¢f"†÷7E7V'G&VU&ö÷BÒçVÆÃ° ¢°¢òòvRöæÇ’†fRF†RF÷f–&W"F†Bv2–ç6W'FVB'WBvRæVVBFò&V7W'6RF÷vâ—G0¢òò6†–ÆG&VâFòf–æBÆÂF†RFW&Ö–æÂæöFW2à¢f"æöFRÒf–æ—6†VEv÷&³° ¢v†–ÆR‡G'VR’°¢–b†æöFRçFrÓÓÒ†÷7D6ö×öæVçB’°¢–b††÷7E7V'G&VU&ö÷BÓÓÒçVÆÂ’°¢†÷7E7V'G&VU&ö÷BÒæöFS° ¢G'’°¢f"–ç7Fæ6RÒæöFRç7FFTæöFS° ¢–b†—4†–FFVâ’°¢†–FT–ç7Fæ6R†–ç7Fæ6R“°¢ÒVÇ6R°¢Væ†–FT–ç7Fæ6R†æöFRç7FFTæöFRÂæöFRæÖVÖö—¦VE&÷2“°¢Ð¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢ÒVÇ6R–b†æöFRçFrÓÓÒ†÷7EFW‡B’°¢–b††÷7E7V'G&VU&ö÷BÓÓÒçVÆÂ’°¢G'’°¢f"ö–ç7Fæ6S2ÒæöFRç7FFTæöFS° ¢–b†—4†–FFVâ’°¢†–FUFW‡D–ç7Fæ6R…ö–ç7Fæ6S2“°¢ÒVÇ6R°¢Væ†–FUFW‡D–ç7Fæ6R…ö–ç7Fæ6S2ÂæöFRæÖVÖö—¦VE&÷2“°¢Ð¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢ÒVÇ6R–b‚†æöFRçFrÓÓÒöfg67&VVä6ö×öæVçBÇÂæöFRçFrÓÓÒÆVv7”†–FFVä6ö×öæVçB’bbæöFRæÖVÖö—¦VE7FFRÓÒçVÆÂbbæöFRÓÒf–æ—6†VEv÷&²’²VÇ6R–b†æöFRæ6†–ÆBÓÒçVÆÂ’°¢æöFRæ6†–ÆBç&WGW&âÒæöFS°¢æöFRÒæöFRæ6†–ÆC°¢6öçF–çVS°¢Ð ¢–b†æöFRÓÓÒf–æ—6†VEv÷&²’°¢&WGW&ã°¢Ð ¢v†–ÆR†æöFRç6–&Æ–ærÓÓÒçVÆÂ’°¢–b†æöFRç&WGW&âÓÓÒçVÆÂÇÂæöFRç&WGW&âÓÓÒf–æ—6†VEv÷&²’°¢&WGW&ã°¢Ð ¢–b††÷7E7V'G&VU&ö÷BÓÓÒæöFR’°¢†÷7E7V'G&VU&ö÷BÒçVÆÃ°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð ¢–b††÷7E7V'G&VU&ö÷BÓÓÒæöFR’°¢†÷7E7V'G&VU&ö÷BÒçVÆÃ°¢Ð ¢æöFRç6–&Æ–ærç&WGW&âÒæöFRç&WGW&ã°¢æöFRÒæöFRç6–&Æ–æs°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—DGF6…&Vb†f–æ—6†VEv÷&²’°¢f"&VbÒf–æ—6†VEv÷&²ç&Vc° ¢–b‡&VbÓÒçVÆÂ’°¢f"–ç7Fæ6RÒf–æ—6†VEv÷&²ç7FFTæöFS°¢f"–ç7Fæ6UFõW6S° ¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66R†÷7D6ö×öæVçC ¢–ç7Fæ6UFõW6RÒvWEV&Æ–4–ç7Fæ6R†–ç7Fæ6R“°¢'&V³° ¢FVfVÇC ¢–ç7Fæ6UFõW6RÒ–ç7Fæ6S°¢ÒòòÖ÷fVB÷WG6–FRFòVç7W&RD4Rv÷&·2v—F‚F†—2fÆp ¢–b‡G—Vöb&VbÓÓÒvgVæ7F–öâr’°¢f"&WEfÃ° ¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢&WEfÂÒ&Vb†–ç7Fæ6UFõW6R“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢Ð¢ÒVÇ6R°¢&WEfÂÒ&Vb†–ç7Fæ6UFõW6R“°¢Ð ¢°¢–b‡G—Vöb&WEfÂÓÓÒvgVæ7F–öâr’°¢W'&÷"‚uVæW‡V7FVB&WGW&âfÇVRg&öÒ6ÆÆ&6²&Vb–âW2âr²t6ÆÆ&6²&Vb6†÷VÆBæ÷B&WGW&âgVæ7F–öâârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’“°¢Ð¢Ð¢ÒVÇ6R°¢°¢–b‚&Vbæ†4÷vå&÷W'G’‚v7W'&VçBr’’°¢W'&÷"‚uVæW‡V7FVB&Vbö&¦V7B&÷f–FVBf÷"W2âr²uW6RV—F†W"&Vb×6WGFW"gVæ7F–öâ÷"&V7Bæ7&VFU&Vb‚’ârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–æ—6†VEv÷&²’“°¢Ð¢Ð ¢&Vbæ7W'&VçBÒ–ç7Fæ6UFõW6S°¢Ð¢Ð¢Ð ¢gVæ7F–öâFWF6„f–&W$×WFF–öâ†f–&W"’°¢òò7WBöfbF†R&WGW&âö–çFW"FòF—66öææV7B—Bg&öÒF†RG&VRà¢òòF†—2Væ&ÆW2W2FòFWFV7BæBv&âv–ç7B7FFRWFFW2öââVæÖ÷VçFVB6ö×öæVçBà¢òò—BÇ6ò&WfVçG2WfVçG2g&öÒ'V&&Æ–ærg&öÒv—F†–âF—66öææV7FVB6ö×öæVçG2à¢òð¢òò–FVÆÇ’ÂvR6†÷VÆBÇ6ò6ÆV"F†R6†–ÆBö–çFW"öbF†R&VçBÇFW&æFRFòÆWBF†—0¢òòvWBt3¦VB'WBvRFöâwB¶æ÷rv†–6‚f÷"7W&Rv†–6‚&VçB—2F†R7W'&Vç@¢òòöæR6òvRvÆÂ6WGFÆRf÷"t3¦–ærF†R7V'G&VRöbF†—26†–ÆBà¢òòF†—26†–ÆB—G6VÆbv–ÆÂ&Rt3¦VBv†VâF†R&VçBWFFW2F†RæW‡BF–ÖRà¢òð¢òòæ÷FRF†BvR6âwB6ÆV"6†–ÆB÷"6–&Æ–ærö–çFW'2–WBà¢òòF†W’w&RæVVFVBf÷"76—fRVffV7G2æBf÷"f–æDDôÔæöFRà¢òòvRFVfW"F†÷6Rf–VÆG2ÂæBÆÂ÷F†W"6ÆVçWÂFòF†R76—fR†6R‡6VRFWF6„f–&W$gFW$VffV7G2’à¢òð¢òòFöâwB&W6WBF†RÇFW&æFR–WBÂV—F†W"âvRæVVBF†B6òvR6âFWF6‚F†P¢òòÇFW&æFRw2f–VÆG2–âF†R76—fR†6Râ6ÆV&–ærF†R&WGW&âö–çFW"—0¢òò7Vff–6–VçBf÷"f–æDDôÔæöFR6VÖçF–72à¢f"ÇFW&æFRÒf–&W"æÇFW&æFS° ¢–b†ÇFW&æFRÓÒçVÆÂ’°¢ÇFW&æFRç&WGW&âÒçVÆÃ°¢Ð ¢f–&W"ç&WGW&âÒçVÆÃ°¢Ð ¢gVæ7F–öâFWF6„f–&W$gFW$VffV7G2†f–&W"’°¢f"ÇFW&æFRÒf–&W"æÇFW&æFS° ¢–b†ÇFW&æFRÓÒçVÆÂ’°¢f–&W"æÇFW&æFRÒçVÆÃ°¢FWF6„f–&W$gFW$VffV7G2†ÇFW&æFR“°¢Òòòæ÷FS¢FVfVç6—fVÇ’W6–æræVvF–öâ–ç7FVBöbÂ–â66P¢òòFVÆWFVEG&VT6ÆVåWÆWfVÆ—2VæFVf–æVBà  ¢°¢òò6ÆV"7–6Æ–6Âf–&W"f–VÆG2âF†—2ÆWfVÂÆöæR—2FW6–væVBFò&÷Vv†Ç¢òò&÷†–ÖFRF†RÆææVBf–&W"&Vf7F÷"â–âF†Bv÷&ÆBÂ6WE7FFVv–ÆÂ&P¢òò&÷VæBFò7V6–Â&–ç7Fæ6R"ö&¦V7B–ç7FVBöbf–&W"âF†R–ç7Fæ6P¢òòö&¦V7Bv–ÆÂæ÷B†fRç’öbF†W6Rf–VÆG2â—Bv–ÆÂöæÇ’&R6öææV7FVBFð¢òòF†Rf–&W"G&VRf–6–ævÆRÆ–æ²BF†R&ö÷Bâ6ò–bF†—2ÆWfVÂÆöæR—0¢òò7Vff–6–VçBFòf—‚ÖVÖ÷'’—77VW2ÂF†B&öFW2vVÆÂf÷"÷W"Æç2à¢f–&W"æ6†–ÆBÒçVÆÃ°¢f–&W"æFVÆWF–öç2ÒçVÆÃ°¢f–&W"ç6–&Æ–ærÒçVÆÃ²òòF†R7FFTæöFV—27–6Æ–6Â&V6W6Röâ†÷7BæöFW2—Bö–çG2FòF†R†÷7@¢òòG&VRÂv†–6‚†2—G2÷vâö–çFW'2Fò6†–ÆG&VâÂ&VçG2ÂæB6–&Æ–æw2à¢òòF†R÷F†W"†÷7BæöFW2Ç6òö–çB&6²Fòf–&W'2Â6òvR6†÷VÆBFWF6‚F†@¢òòöæRÂFöòà ¢–b†f–&W"çFrÓÓÒ†÷7D6ö×öæVçB’°¢f"†÷7D–ç7Fæ6RÒf–&W"ç7FFTæöFS° ¢–b††÷7D–ç7Fæ6RÓÒçVÆÂ’°¢FWF6„FVÆWFVD–ç7Fæ6R††÷7D–ç7Fæ6R“°¢Ð¢Ð ¢f–&W"ç7FFTæöFRÒçVÆÃ²òò’vÒ–çFVçF–öæÆÇ’æ÷B6ÆV&–ærF†R&WGW&æf–VÆB–âF†—2ÆWfVÂâvP¢òòÇ&VG’F—66öææV7BF†R&WGW&æö–çFW"BF†R&ö÷BöbF†RFVÆWFV@¢òò7V'G&VR†–âFWF6„f–&W$×WFF–öæ’â&W6–FW2Â&WGW&æ'’—G6VÆb—2æ÷@¢òò7–6Æ–6Â(	B—Bw2öæÇ’7–6Æ–6Âv†Vâ6öÖ&–æVBv—F‚6†–ÆFÂ6–&Æ–ævÂæ@¢òòÇFW&æFVâ'WBvRvÆÂ6ÆV"—B–âF†RæW‡BÆWfVÂç—v’Â§W7B–â66Rà ¢°¢f–&W"åöFV'Vt÷væW"ÒçVÆÃ°¢Ð ¢°¢òòF†V÷&WF–6ÆÇ’Âæ÷F†–ær–â†W&R6†÷VÆB&RæV6W76'’Â&V6W6RvRÇ&VG¢òòF—66öææV7FVBF†Rf–&W"g&öÒF†RG&VRâ6òWfVâ–b6öÖWF†–ærÆV·2F†—0¢òò'F–7VÆ"f–&W"Â—BvöâwBÆV²ç—F†–ærVÇ6P¢òð¢òòF†RW'÷6RöbF†—2'&æ6‚—2Fò&R7WW"vw&W76—fR6òvR6âÖV7W&P¢òò–bF†W&Rw2ç’F–ffW&Væ6R–âÖVÖ÷'’–×7Bâ–bF†W&R—2ÂF†B6÷VÆ@¢òò–æF–6FR&V7BÆV²vRFöâwB¶æ÷r&÷WBà¢f–&W"ç&WGW&âÒçVÆÃ°¢f–&W"æFWVæFVæ6–W2ÒçVÆÃ°¢f–&W"æÖVÖö—¦VE&÷2ÒçVÆÃ°¢f–&W"æÖVÖö—¦VE7FFRÒçVÆÃ°¢f–&W"çVæF–æu&÷2ÒçVÆÃ°¢f–&W"ç7FFTæöFRÒçVÆÃ²òòDôDó¢Ö÷fRFò6öÖÖ—E76—fUVæÖ÷VçD–ç6–FTFVÆWFVEG&VTöäf–&W&–ç7FVBà ¢f–&W"çWFFUVWVRÒçVÆÃ°¢Ð¢Ð¢Ð ¢gVæ7F–öâvWD†÷7E&VçDf–&W"†f–&W"’°¢f"&VçBÒf–&W"ç&WGW&ã° ¢v†–ÆR‡&VçBÓÒçVÆÂ’°¢–b†—4†÷7E&VçB‡&VçB’’°¢&WGW&â&VçC°¢Ð ¢&VçBÒ&VçBç&WGW&ã°¢Ð ¢F‡&÷ræWrW'&÷"‚tW‡V7FVBFòf–æB†÷7B&VçBâF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’'Vrr²v–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢gVæ7F–öâ—4†÷7E&VçB†f–&W"’°¢&WGW&âf–&W"çFrÓÓÒ†÷7D6ö×öæVçBÇÂf–&W"çFrÓÓÒ†÷7E&ö÷BÇÂf–&W"çFrÓÓÒ†÷7E÷'FÃ°¢Ð ¢gVæ7F–öâvWD†÷7E6–&Æ–ær†f–&W"’°¢òòvRw&Rvö–ærFò6V&6‚f÷'v&B–çFòF†RG&VRVçF–ÂvRf–æB6–&Æ–ær†÷7@¢òòæöFRâVæf÷'GVæFVÇ’Â–b×VÇF—ÆR–ç6W'F–öç2&RFöæR–â&÷rvR†fRFð¢òò6V&6‚7BF†VÒâF†—2ÆVG2FòW‡öæVçF–Â6V&6‚f÷"F†RæW‡B6–&Æ–ærà¢òòDôDó¢f–æBÖ÷&RVff–6–VçBv’FòFòF†—2à¢f"æöFRÒf–&W#° ¢6–&Æ–æw3¢v†–ÆR‡G'VR’°¢òò–bvRF–FâwBf–æBç—F†–ærÂÆWBw2G'’F†RæW‡B6–&Æ–ærà¢v†–ÆR†æöFRç6–&Æ–ærÓÓÒçVÆÂ’°¢–b†æöFRç&WGW&âÓÓÒçVÆÂÇÂ—4†÷7E&VçB†æöFRç&WGW&â’’°¢òò–bvR÷÷WBöbF†R&ö÷B÷"†—BF†R&VçBF†Rf–&W"vR&RF†P¢òòÆ7B6–&Æ–ærà¢&WGW&âçVÆÃ°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð ¢æöFRç6–&Æ–ærç&WGW&âÒæöFRç&WGW&ã°¢æöFRÒæöFRç6–&Æ–æs° ¢v†–ÆR†æöFRçFrÓÒ†÷7D6ö×öæVçBbbæöFRçFrÓÒ†÷7EFW‡BbbæöFRçFrÓÒFV‡–G&FVDg&vÖVçB’°¢òò–b—B—2æ÷B†÷7BæöFRæBÂvRÖ–v‡B†fR†÷7BæöFR–ç6–FR—Bà¢òòG'’Fò6V&6‚F÷vâVçF–ÂvRf–æBöæRà¢–b†æöFRæfÆw2bÆ6VÖVçB’°¢òò–bvRFöâwB†fR6†–ÆBÂG'’F†R6–&Æ–æw2–ç7FVBà¢6öçF–çVR6–&Æ–æw3°¢Òòò–bvRFöâwB†fR6†–ÆBÂG'’F†R6–&Æ–æw2–ç7FVBà¢òòvRÇ6ò6¶—÷'FÇ2&V6W6RF†W’&Ræ÷B'BöbF†—2†÷7BG&VRà  ¢–b†æöFRæ6†–ÆBÓÓÒçVÆÂÇÂæöFRçFrÓÓÒ†÷7E÷'FÂ’°¢6öçF–çVR6–&Æ–æw3°¢ÒVÇ6R°¢æöFRæ6†–ÆBç&WGW&âÒæöFS°¢æöFRÒæöFRæ6†–ÆC°¢Ð¢Òòò6†V6²–bF†—2†÷7BæöFR—27F&ÆR÷"&÷WBFò&RÆ6VBà  ¢–b‚†æöFRæfÆw2bÆ6VÖVçB’’°¢òòf÷VæB—B¢&WGW&âæöFRç7FFTæöFS°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—EÆ6VÖVçB†f–æ—6†VEv÷&²’°  ¢f"&VçDf–&W"ÒvWD†÷7E&VçDf–&W"†f–æ—6†VEv÷&²“²òòæ÷FS¢F†W6RGvòf&–&ÆW2¦×W7B¢Çv—2&RWFFVBFövWF†W"à ¢7v—F6‚‡&VçDf–&W"çFr’°¢66R†÷7D6ö×öæVçC ¢°¢f"&VçBÒ&VçDf–&W"ç7FFTæöFS° ¢–b‡&VçDf–&W"æfÆw2b6öçFVçE&W6WB’°¢òò&W6WBF†RFW‡B6öçFVçBöbF†R&VçB&Vf÷&RFö–ærç’–ç6W'F–öç0¢&W6WEFW‡D6öçFVçB‡&VçB“²òò6ÆV"6öçFVçE&W6WBg&öÒF†RVffV7BFp ¢&VçDf–&W"æfÆw2cÒä6öçFVçE&W6WC°¢Ð ¢f"&Vf÷&RÒvWD†÷7E6–&Æ–ær†f–æ—6†VEv÷&²“²òòvRöæÇ’†fRF†RF÷f–&W"F†Bv2–ç6W'FVB'WBvRæVVBFò&V7W'6RF÷vâ—G0¢òò6†–ÆG&VâFòf–æBÆÂF†RFW&Ö–æÂæöFW2à ¢–ç6W'D÷$VæEÆ6VÖVçDæöFR†f–æ—6†VEv÷&²Â&Vf÷&RÂ&VçB“°¢'&V³°¢Ð ¢66R†÷7E&ö÷C ¢66R†÷7E÷'FÃ ¢°¢f"÷&VçBÒ&VçDf–&W"ç7FFTæöFRæ6öçF–æW$–æfó° ¢f"ö&Vf÷&RÒvWD†÷7E6–&Æ–ær†f–æ—6†VEv÷&²“° ¢–ç6W'D÷$VæEÆ6VÖVçDæöFT–çFô6öçF–æW"†f–æ—6†VEv÷&²Âö&Vf÷&RÂ÷&VçB“°¢'&V³°¢Ð¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRÖæòÖfÆÇF‡&÷Vv€ ¢FVfVÇC ¢F‡&÷ræWrW'&÷"‚t–çfÆ–B†÷7B&VçBf–&W"âF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’'Vrr²v–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð¢Ð ¢gVæ7F–öâ–ç6W'D÷$VæEÆ6VÖVçDæöFT–çFô6öçF–æW"†æöFRÂ&Vf÷&RÂ&VçB’°¢f"FrÒæöFRçFs°¢f"—4†÷7BÒFrÓÓÒ†÷7D6ö×öæVçBÇÂFrÓÓÒ†÷7EFW‡C° ¢–b†—4†÷7B’°¢f"7FFTæöFRÒæöFRç7FFTæöFS° ¢–b†&Vf÷&R’°¢–ç6W'D–ä6öçF–æW$&Vf÷&R‡&VçBÂ7FFTæöFRÂ&Vf÷&R“°¢ÒVÇ6R°¢VæD6†–ÆEFô6öçF–æW"‡&VçBÂ7FFTæöFR“°¢Ð¢ÒVÇ6R–b‡FrÓÓÒ†÷7E÷'FÂ’²VÇ6R°¢f"6†–ÆBÒæöFRæ6†–ÆC° ¢–b†6†–ÆBÓÒçVÆÂ’°¢–ç6W'D÷$VæEÆ6VÖVçDæöFT–çFô6öçF–æW"†6†–ÆBÂ&Vf÷&RÂ&VçB“°¢f"6–&Æ–ærÒ6†–ÆBç6–&Æ–æs° ¢v†–ÆR‡6–&Æ–ærÓÒçVÆÂ’°¢–ç6W'D÷$VæEÆ6VÖVçDæöFT–çFô6öçF–æW"‡6–&Æ–ærÂ&Vf÷&RÂ&VçB“°¢6–&Æ–ærÒ6–&Æ–ærç6–&Æ–æs°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ–ç6W'D÷$VæEÆ6VÖVçDæöFR†æöFRÂ&Vf÷&RÂ&VçB’°¢f"FrÒæöFRçFs°¢f"—4†÷7BÒFrÓÓÒ†÷7D6ö×öæVçBÇÂFrÓÓÒ†÷7EFW‡C° ¢–b†—4†÷7B’°¢f"7FFTæöFRÒæöFRç7FFTæöFS° ¢–b†&Vf÷&R’°¢–ç6W'D&Vf÷&R‡&VçBÂ7FFTæöFRÂ&Vf÷&R“°¢ÒVÇ6R°¢VæD6†–ÆB‡&VçBÂ7FFTæöFR“°¢Ð¢ÒVÇ6R–b‡FrÓÓÒ†÷7E÷'FÂ’²VÇ6R°¢f"6†–ÆBÒæöFRæ6†–ÆC° ¢–b†6†–ÆBÓÒçVÆÂ’°¢–ç6W'D÷$VæEÆ6VÖVçDæöFR†6†–ÆBÂ&Vf÷&RÂ&VçB“°¢f"6–&Æ–ærÒ6†–ÆBç6–&Æ–æs° ¢v†–ÆR‡6–&Æ–ærÓÒçVÆÂ’°¢–ç6W'D÷$VæEÆ6VÖVçDæöFR‡6–&Æ–ærÂ&Vf÷&RÂ&VçB“°¢6–&Æ–ærÒ6–&Æ–ærç6–&Æ–æs°¢Ð¢Ð¢Ð¢ÒòòF†W6R&RG&6¶VBöâF†R7F6²2vR&V7W'6—fVÇ’G&fW'6R¢òòFVÆWFVB7V'G&VRà¢òòDôDó¢WFFRF†W6RGW&–ærF†Rv†öÆR×WFF–öâ†6RÂæ÷B§W7BGW&–æp¢òòFVÆWF–öâà  ¢f"†÷7E&VçBÒçVÆÃ°¢f"†÷7E&VçD—46öçF–æW"ÒfÇ6S° ¢gVæ7F–öâ6öÖÖ—DFVÆWF–öäVffV7G2‡&ö÷BÂ&WGW&äf–&W"ÂFVÆWFVDf–&W"’°¢°¢òòvRöæÇ’†fRF†RF÷f–&W"F†Bv2FVÆWFVB'WBvRæVVBFò&V7W'6RF÷vâ—G0¢òò6†–ÆG&VâFòf–æBÆÂF†RFW&Ö–æÂæöFW2à¢òò&V7W'6—fVÇ’FVÆWFRÆÂ†÷7BæöFW2g&öÒF†R&VçBÂFWF6‚&Vg2Â6ÆVà¢òòWÖ÷VçFVBÆ–÷WBVffV7G2ÂæB6ÆÂ6ö×öæVçEv–ÆÅVæÖ÷VçBà¢òòvRöæÇ’æVVBFò&VÖ÷fRF†RF÷Ö÷7B†÷7B6†–ÆB–âV6‚'&æ6‚â'WBF†VâvP¢òò7F–ÆÂæVVBFò¶VWG&fW'6–ærFòVæÖ÷VçBVffV7G2Â&Vg2ÂæB5uRâDôDó¢vP¢òò6÷VÆB7Æ—BF†—2–çFòGvò6W&FRG&fW'6Ç2gVæ7F–öç2Âv†W&RF†R6V6öæ@¢òòöæRFöW6âwB–æ6ÇVFRç’&VÖ÷fT6†–ÆBÆöv–2âF†—2—2Ö–&RF†R6ÖP¢òògVæ7F–öâ2&F—6V$Æ–÷WDVffV7G2"†÷"v†FWfW"F†BGW&ç2–çFògFW ¢òòF†RÆ–÷WB†6R—2&Vf7F÷&VBFòW6R&V7W'6–öâ’à¢òò&Vf÷&R7F'F–ærÂf–æBF†RæV&W7B†÷7B&VçBöâF†R7F6²6òvR¶æ÷p¢òòv†–6‚–ç7Fæ6Rö6öçF–æW"Fò&VÖ÷fRF†R6†–ÆG&Vâg&öÒà¢òòDôDó¢–ç7FVBöb6V&6†–ærWF†Rf–&W"&WGW&âF‚öâWfW'’FVÆWF–öâÂvP¢òò6âG&6²F†RæV&W7B†÷7B6ö×öæVçBöâF†R¥27F6²2vRG&fW'6RF†P¢òòG&VRGW&–ærF†R6öÖÖ—B†6RâF†—2v÷VÆBÖ¶R–ç6W'F–öç2f7FW"ÂFöòà¢f"&VçBÒ&WGW&äf–&W#° ¢f–æE&VçC¢v†–ÆR‡&VçBÓÒçVÆÂ’°¢7v—F6‚‡&VçBçFr’°¢66R†÷7D6ö×öæVçC ¢°¢†÷7E&VçBÒ&VçBç7FFTæöFS°¢†÷7E&VçD—46öçF–æW"ÒfÇ6S°¢'&V²f–æE&VçC°¢Ð ¢66R†÷7E&ö÷C ¢°¢†÷7E&VçBÒ&VçBç7FFTæöFRæ6öçF–æW$–æfó°¢†÷7E&VçD—46öçF–æW"ÒG'VS°¢'&V²f–æE&VçC°¢Ð ¢66R†÷7E÷'FÃ ¢°¢†÷7E&VçBÒ&VçBç7FFTæöFRæ6öçF–æW$–æfó°¢†÷7E&VçD—46öçF–æW"ÒG'VS°¢'&V²f–æE&VçC°¢Ð¢Ð ¢&VçBÒ&VçBç&WGW&ã°¢Ð ¢–b††÷7E&VçBÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚tW‡V7FVBFòf–æB†÷7B&VçBâF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’r²v'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢6öÖÖ—DFVÆWF–öäVffV7G4öäf–&W"‡&ö÷BÂ&WGW&äf–&W"ÂFVÆWFVDf–&W"“°¢†÷7E&VçBÒçVÆÃ°¢†÷7E&VçD—46öçF–æW"ÒfÇ6S°¢Ð ¢FWF6„f–&W$×WFF–öâ†FVÆWFVDf–&W"“°¢Ð ¢gVæ7F–öâ&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"Â&VçB’°¢òòDôDó¢W6R7FF–2fÆrFò6¶—G&VW2F†BFöâwB†fRVæÖ÷VçBVffV7G0¢f"6†–ÆBÒ&VçBæ6†–ÆC° ¢v†–ÆR†6†–ÆBÓÒçVÆÂ’°¢6öÖÖ—DFVÆWF–öäVffV7G4öäf–&W"†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"Â6†–ÆB“°¢6†–ÆBÒ6†–ÆBç6–&Æ–æs°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—DFVÆWF–öäVffV7G4öäf–&W"†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"’°¢öä6öÖÖ—EVæÖ÷VçB†FVÆWFVDf–&W"“²òòF†R66W2–âF†—2÷WFW"7v—F6‚ÖöF–g’F†R7F6²&Vf÷&RF†W’G&fW'6P¢òò–çFòF†V—"7V'G&VRâF†W&R&R6–×ÆW"66W2–âF†R–ææW"7v—F6€¢òòF†BFöâwBÖöF–g’F†R7F6²à ¢7v—F6‚†FVÆWFVDf–&W"çFr’°¢66R†÷7D6ö×öæVçC ¢°¢–b‚öfg67&VVå7V'G&VUv4†–FFVâ’°¢6fVÇ”FWF6…&Vb†FVÆWFVDf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"“°¢Òòò–çFVçF–öæÂfÆÇF‡&÷Vv‚FòæW‡B'&æ6€ ¢Ð¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRÖæòÖfÆÇF‡&÷Vv€ ¢66R†÷7EFW‡C ¢°¢òòvRöæÇ’æVVBFò&VÖ÷fRF†RæV&W7B†÷7B6†–ÆBâ6WBF†R†÷7B&Vç@¢òòFòçVÆÆöâF†R7F6²Fò–æF–6FRF†BæW7FVB6†–ÆG&VâFöâw@¢òòæVVBFò&R&VÖ÷fVBà¢°¢f"&Wd†÷7E&VçBÒ†÷7E&VçC°¢f"&Wd†÷7E&VçD—46öçF–æW"Ò†÷7E&VçD—46öçF–æW#°¢†÷7E&VçBÒçVÆÃ°¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢†÷7E&VçBÒ&Wd†÷7E&VçC°¢†÷7E&VçD—46öçF–æW"Ò&Wd†÷7E&VçD—46öçF–æW#° ¢–b††÷7E&VçBÓÒçVÆÂ’°¢òòæ÷rF†BÆÂF†R6†–ÆBVffV7G2†fRVæÖ÷VçFVBÂvR6â&VÖ÷fRF†P¢òòæöFRg&öÒF†RG&VRà¢–b††÷7E&VçD—46öçF–æW"’°¢&VÖ÷fT6†–ÆDg&öÔ6öçF–æW"††÷7E&VçBÂFVÆWFVDf–&W"ç7FFTæöFR“°¢ÒVÇ6R°¢&VÖ÷fT6†–ÆB††÷7E&VçBÂFVÆWFVDf–&W"ç7FFTæöFR“°¢Ð¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66RFV‡–G&FVDg&vÖVçC ¢°¢òòFVÆWFRF†RFV‡–G&FVB7W7Vç6R&÷VæF'’æBÆÂöb—G26öçFVçBà  ¢°¢–b††÷7E&VçBÓÒçVÆÂ’°¢–b††÷7E&VçD—46öçF–æW"’°¢6ÆV%7W7Vç6T&÷VæF'”g&öÔ6öçF–æW"††÷7E&VçBÂFVÆWFVDf–&W"ç7FFTæöFR“°¢ÒVÇ6R°¢6ÆV%7W7Vç6T&÷VæF'’††÷7E&VçBÂFVÆWFVDf–&W"ç7FFTæöFR“°¢Ð¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R†÷7E÷'FÃ ¢°¢°¢òòv†VâvRvò–çFò÷'FÂÂ—B&V6öÖW2F†R&VçBFò&VÖ÷fRg&öÒà¢f"÷&Wd†÷7E&VçBÒ†÷7E&VçC°¢f"÷&Wd†÷7E&VçD—46öçF–æW"Ò†÷7E&VçD—46öçF–æW#°¢†÷7E&VçBÒFVÆWFVDf–&W"ç7FFTæöFRæ6öçF–æW$–æfó°¢†÷7E&VçD—46öçF–æW"ÒG'VS°¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢†÷7E&VçBÒ÷&Wd†÷7E&VçC°¢†÷7E&VçD—46öçF–æW"Ò÷&Wd†÷7E&VçD—46öçF–æW#°¢Ð ¢&WGW&ã°¢Ð ¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66RÖVÖô6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚öfg67&VVå7V'G&VUv4†–FFVâ’°¢f"WFFUVWVRÒFVÆWFVDf–&W"çWFFUVWVS° ¢–b‡WFFUVWVRÓÒçVÆÂ’°¢f"Æ7DVffV7BÒWFFUVWVRæÆ7DVffV7C° ¢–b†Æ7DVffV7BÓÒçVÆÂ’°¢f"f—'7DVffV7BÒÆ7DVffV7BææW‡C°¢f"VffV7BÒf—'7DVffV7C° ¢Fò°¢f"öVffV7BÒVffV7BÀ¢FW7G&÷’ÒöVffV7BæFW7G&÷’À¢FrÒöVffV7BçFs° ¢–b†FW7G&÷’ÓÒVæFVf–æVB’°¢–b‚‡Frb–ç6W'F–öâ’ÓÒæôfÆw2C’°¢6fVÇ”6ÆÄFW7G&÷’†FVÆWFVDf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFW7G&÷’“°¢ÒVÇ6R–b‚‡FrbÆ–÷WB’ÓÒæôfÆw2C’°¢°¢Ö&´6ö×öæVçDÆ–÷WDVffV7EVæÖ÷VçE7F'FVB†FVÆWFVDf–&W"“°¢Ð ¢–b‚FVÆWFVDf–&W"æÖöFRb&öf–ÆTÖöFR’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢6fVÇ”6ÆÄFW7G&÷’†FVÆWFVDf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFW7G&÷’“°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†FVÆWFVDf–&W"“°¢ÒVÇ6R°¢6fVÇ”6ÆÄFW7G&÷’†FVÆWFVDf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFW7G&÷’“°¢Ð ¢°¢Ö&´6ö×öæVçDÆ–÷WDVffV7EVæÖ÷VçE7F÷VB‚“°¢Ð¢Ð¢Ð ¢VffV7BÒVffV7BææW‡C°¢Òv†–ÆR†VffV7BÓÒf—'7DVffV7B“°¢Ð¢Ð¢Ð ¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢&WGW&ã°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢–b‚öfg67&VVå7V'G&VUv4†–FFVâ’°¢6fVÇ”FWF6…&Vb†FVÆWFVDf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"“°¢f"–ç7Fæ6RÒFVÆWFVDf–&W"ç7FFTæöFS° ¢–b‡G—Vöb–ç7Fæ6Ræ6ö×öæVçEv–ÆÅVæÖ÷VçBÓÓÒvgVæ7F–öâr’°¢6fVÇ”6ÆÄ6ö×öæVçEv–ÆÅVæÖ÷VçB†FVÆWFVDf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"Â–ç7Fæ6R“°¢Ð¢Ð ¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢&WGW&ã°¢Ð ¢66R66÷T6ö×öæVçC ¢° ¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢&WGW&ã°¢Ð ¢66Röfg67&VVä6ö×öæVçC ¢°¢–b‚òòDôDó¢&VÖ÷fRF†—2FVBfÆp¢FVÆWFVDf–&W"æÖöFRb6öæ7W'&VçDÖöFR’°¢òò–bF†—2öfg67&VVâ6ö×öæVçB—2†–FFVâÂvRÇ&VG’VæÖ÷VçFVB—Bâ&Vf÷&P¢òòFVÆWF–ærF†R6†–ÆG&VâÂG&6²F†B—Bw2Ç&VG’VæÖ÷VçFVB6òF†BvP¢òòFöâwBGFV×BFòVæÖ÷VçBF†RVffV7G2v–âà¢òòDôDó¢–bF†RG&VR—2†–FFVâÂ–âÖ÷7B66W2vR6†÷VÆB&R&ÆRFò6¶— ¢òò÷fW"F†RæW7FVB6†–ÆG&VâVçF—&VÇ’ââW†6WF–öâ—2vR†fVâwB–WBf÷Væ@¢òòF†RF÷Ö÷7B†÷7BæöFRFòFVÆWFRÂv†–6‚vRÇ&VG’G&6²öâF†R7F6²à¢òò'WBF†R÷F†W"66R—2÷'FÇ2Âv†–6‚æVVBFò&RFWF6†VBæòÖGFW"†÷p¢òòFVWÇ’F†W’&RæW7FVBâvR6†÷VÆBW6R7V'G&VRfÆrFòG&6²v†WF†W"¢òò7V'G&VR–æ6ÇVFW2æW7FVB÷'FÂà¢f"&Wdöfg67&VVå7V'G&VUv4†–FFVâÒöfg67&VVå7V'G&VUv4†–FFVã°¢öfg67&VVå7V'G&VUv4†–FFVâÒ&Wdöfg67&VVå7V'G&VUv4†–FFVâÇÂFVÆWFVDf–&W"æÖVÖö—¦VE7FFRÓÒçVÆÃ°¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢öfg67&VVå7V'G&VUv4†–FFVâÒ&Wdöfg67&VVå7V'G&VUv4†–FFVã°¢ÒVÇ6R°¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢Ð ¢'&V³°¢Ð ¢FVfVÇC ¢°¢&V7W'6—fVÇ•G&fW'6TFVÆWF–öäVffV7G2†f–æ—6†VE&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂFVÆWFVDf–&W"“°¢&WGW&ã°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E7W7Vç6T6ÆÆ&6²†f–æ—6†VEv÷&²’°¢òòDôDó¢Ö÷fRF†—2Fò76—fR†6P¢f"æWu7FFRÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFS°¢Ð ¢gVæ7F–öâ6öÖÖ—E7W7Vç6T‡–G&F–öä6ÆÆ&6·2†f–æ—6†VE&ö÷BÂf–æ—6†VEv÷&²’° ¢f"æWu7FFRÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFS° ¢–b†æWu7FFRÓÓÒçVÆÂ’°¢f"7W'&VçBÒf–æ—6†VEv÷&²æÇFW&æFS° ¢–b†7W'&VçBÓÒçVÆÂ’°¢f"&We7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS° ¢–b‡&We7FFRÓÒçVÆÂ’°¢f"7W7Vç6T–ç7Fæ6RÒ&We7FFRæFV‡–G&FVC° ¢–b‡7W7Vç6T–ç7Fæ6RÓÒçVÆÂ’°¢6öÖÖ—D‡–G&FVE7W7Vç6T–ç7Fæ6R‡7W7Vç6T–ç7Fæ6R“°¢Ð¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâGF6…7W7Vç6U&WG'”Æ—7FVæW'2†f–æ—6†VEv÷&²’°¢òò–bF†—2&÷VæF'’§W7BF–ÖVB÷WBÂF†Vâ—Bv–ÆÂ†fR6WBöbv¶V&ÆW2à¢òòf÷"V6‚v¶V&ÆRÂGF6‚Æ—7FVæW"6òF†Bv†Vâ—B&W6öÇfW2Â&V7@¢òòGFV×G2Fò&R×&VæFW"F†R&÷VæF'’–âF†R&–Ö'’‡&R×F–ÖV÷WB’7FFRà¢f"v¶V&ÆW2Òf–æ—6†VEv÷&²çWFFUVWVS° ¢–b‡v¶V&ÆW2ÓÒçVÆÂ’°¢f–æ—6†VEv÷&²çWFFUVWVRÒçVÆÃ°¢f"&WG'”66†RÒf–æ—6†VEv÷&²ç7FFTæöFS° ¢–b‡&WG'”66†RÓÓÒçVÆÂ’°¢&WG'”66†RÒf–æ—6†VEv÷&²ç7FFTæöFRÒæWr÷76–&Ç•vVµ6WB‚“°¢Ð ¢v¶V&ÆW2æf÷$V6‚†gVæ7F–öâ‡v¶V&ÆR’°¢òòÖVÖö—¦RW6–ærF†R&÷VæF'’f–&W"Fò&WfVçB&VGVæFçBÆ—7FVæW'2à¢f"&WG'’Ò&W6öÇfU&WG'•v¶V&ÆRæ&–æB†çVÆÂÂf–æ—6†VEv÷&²Âv¶V&ÆR“° ¢–b‚&WG'”66†Ræ†2‡v¶V&ÆR’’°¢&WG'”66†RæFB‡v¶V&ÆR“° ¢°¢–b†—4FWeFööÇ5&W6VçB’°¢–b†–å&öw&W74ÆæW2ÓÒçVÆÂbb–å&öw&W75&ö÷BÓÒçVÆÂ’°¢òò–bvR†fRVæF–ærv÷&²7F–ÆÂÂ76ö6–FRF†R÷&–v–æÂWFFW'2v—F‚—Bà¢&W7F÷&UVæF–æuWFFW'2†–å&öw&W75&ö÷BÂ–å&öw&W74ÆæW2“°¢ÒVÇ6R°¢F‡&÷rW'&÷"‚tW‡V7FVBf–æ—6†VB&ö÷BæBÆæW2Fò&R6WBâF†—2—2'Vr–â&V7Bâr“°¢Ð¢Ð¢Ð ¢v¶V&ÆRçF†Vâ‡&WG'’Â&WG'’“°¢Ð¢Ò“°¢Ð¢ÒòòF†—2gVæ7F–öâFWFV7G2v†Vâ7W7Vç6R&÷VæF'’vöW2g&öÒf—6–&ÆRFò†–FFVâà¢gVæ7F–öâ6öÖÖ—D×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²Â6öÖÖ—GFVDÆæW2’°¢–å&öw&W74ÆæW2Ò6öÖÖ—GFVDÆæW3°¢–å&öw&W75&ö÷BÒ&ö÷C°¢6WD7W'&VçDf–&W"†f–æ—6†VEv÷&²“°¢6öÖÖ—D×WFF–öäVffV7G4öäf–&W"†f–æ—6†VEv÷&²Â&ö÷B“°¢6WD7W'&VçDf–&W"†f–æ—6†VEv÷&²“°¢–å&öw&W74ÆæW2ÒçVÆÃ°¢–å&öw&W75&ö÷BÒçVÆÃ°¢Ð ¢gVæ7F–öâ&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂ&VçDf–&W"ÂÆæW2’°¢òòFVÆWF–öç2VffV7G26â&R66†VGVÆVBöâç’f–&W"G—RâF†W’æVVBFò†Và¢òò&Vf÷&RF†R6†–ÆG&VâVffV7G2†Rf—&VBà¢f"FVÆWF–öç2Ò&VçDf–&W"æFVÆWF–öç3° ¢–b†FVÆWF–öç2ÓÒçVÆÂ’°¢f÷"‡f"’Ò²’ÂFVÆWF–öç2æÆVæwFƒ²’²²’°¢f"6†–ÆEFôFVÆWFRÒFVÆWF–öç5¶•Ó° ¢G'’°¢6öÖÖ—DFVÆWF–öäVffV7G2‡&ö÷BÂ&VçDf–&W"Â6†–ÆEFôFVÆWFR“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†6†–ÆEFôFVÆWFRÂ&VçDf–&W"ÂW'&÷"“°¢Ð¢Ð¢Ð ¢f"&WdFV'Vtf–&W"ÒvWD7W'&VçDf–&W"‚“° ¢–b‡&VçDf–&W"ç7V'G&VTfÆw2b×WFF–öäÖ6²’°¢f"6†–ÆBÒ&VçDf–&W"æ6†–ÆC° ¢v†–ÆR†6†–ÆBÓÒçVÆÂ’°¢6WD7W'&VçDf–&W"†6†–ÆB“°¢6öÖÖ—D×WFF–öäVffV7G4öäf–&W"†6†–ÆBÂ&ö÷B“°¢6†–ÆBÒ6†–ÆBç6–&Æ–æs°¢Ð¢Ð ¢6WD7W'&VçDf–&W"‡&WdFV'Vtf–&W"“°¢Ð ¢gVæ7F–öâ6öÖÖ—D×WFF–öäVffV7G4öäf–&W"†f–æ—6†VEv÷&²Â&ö÷BÂÆæW2’°¢f"7W'&VçBÒf–æ—6†VEv÷&²æÇFW&æFS°¢f"fÆw2Òf–æ—6†VEv÷&²æfÆw3²òòF†RVffV7BfÆr6†÷VÆB&R6†V6¶VB¦gFW"¢vR&Vf–æRF†RG—Röbf–&W"À¢òò&V6W6RF†Rf–&W"Fr—2Ö÷&R7V6–f–2ââW†6WF–öâ—2ç’fÆr&VÆFV@¢òòFò&V6öæ6–ÆF–öâÂ&V6W6RF†÷6R6â&R6WBöâÆÂf–&W"G—W2à ¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66RÖVÖô6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2bWFFR’°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB„–ç6W'F–öâÂ†4VffV7BÂf–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&â“°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB„–ç6W'F–öâÂ†4VffV7BÂf–æ—6†VEv÷&²“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢ÒòòÆ–÷WBVffV7G2&RFW7G&÷–VBGW&–ærF†R×WFF–öâ†6R6òF†BÆÀ¢òòFW7G&÷’gVæ7F–öç2f÷"ÆÂf–&W'2&R6ÆÆVB&Vf÷&Rç’7&VFRgVæ7F–öç2à¢òòF†—2&WfVçG26–&Æ–ær6ö×öæVçBVffV7G2g&öÒ–çFW&fW&–ærv—F‚V6‚÷F†W"À¢òòRærâFW7G&÷’gVæ7F–öâ–âöæR6ö×öæVçB6†÷VÆBæWfW"÷fW'&–FR&Vb6W@¢òò'’7&VFRgVæ7F–öâ–âæ÷F†W"6ö×öæVçBGW&–ærF†R6ÖR6öÖÖ—Bà  ¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB„Æ–÷WBÂ†4VffV7BÂf–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&â“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð ¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢ÒVÇ6R°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB„Æ–÷WBÂ†4VffV7BÂf–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&â“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2b&Vb’°¢–b†7W'&VçBÓÒçVÆÂ’°¢6fVÇ”FWF6…&Vb†7W'&VçBÂ7W'&VçBç&WGW&â“°¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2b&Vb’°¢–b†7W'&VçBÓÒçVÆÂ’°¢6fVÇ”FWF6…&Vb†7W'&VçBÂ7W'&VçBç&WGW&â“°¢Ð¢Ð ¢°¢òòDôDó¢6öçFVçE&W6WBvWG26ÆV&VB'’F†R6†–ÆG&VâGW&–ærF†R6öÖÖ—@¢òò†6RâF†—2—2&Vf7F÷"†¦&B&V6W6R—BÖVç2vR×W7B&V@¢òòfÆw2F†RfÆw2gFW"6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G6†2Ç&VG’'Vã°¢òòF†R÷&FW"ÖGFW'2âvR6†÷VÆB&Vf7F÷"6òF†B6öçFVçE&W6WBFöW2æ÷@¢òò&VÇ’öâ×WFF–ærF†RfÆrGW&–ær6öÖÖ—BâÆ–¶R'’6WGF–ærfÆp¢òòGW&–ærF†R&VæFW"†6R–ç7FVBà¢–b†f–æ—6†VEv÷&²æfÆw2b6öçFVçE&W6WB’°¢f"–ç7Fæ6RÒf–æ—6†VEv÷&²ç7FFTæöFS° ¢G'’°¢&W6WEFW‡D6öçFVçB†–ç7Fæ6R“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð ¢–b†fÆw2bWFFR’°¢f"ö–ç7Fæ6SBÒf–æ—6†VEv÷&²ç7FFTæöFS° ¢–b…ö–ç7Fæ6SBÒçVÆÂ’°¢òò6öÖÖ—BF†Rv÷&²&W&VBV&Æ–W"à¢f"æWu&÷2Òf–æ—6†VEv÷&²æÖVÖö—¦VE&÷3²òòf÷"‡–G&F–öâvR&WW6RF†RWFFRF‚'WBvRG&VBF†RöÆE&÷0¢òò2F†RæWu&÷2âF†RWFFU–ÆöBv–ÆÂ6öçF–âF†R&VÂ6†ævR–à¢òòF†—266Rà ¢f"öÆE&÷2Ò7W'&VçBÓÒçVÆÂò7W'&VçBæÖVÖö—¦VE&÷2¢æWu&÷3°¢f"G—RÒf–æ—6†VEv÷&²çG—S²òòDôDó¢G—RF†RWFFUVWVRFò&R7V6–f–2Fò†÷7B6ö×öæVçG2à ¢f"WFFU–ÆöBÒf–æ—6†VEv÷&²çWFFUVWVS°¢f–æ—6†VEv÷&²çWFFUVWVRÒçVÆÃ° ¢–b‡WFFU–ÆöBÓÒçVÆÂ’°¢G'’°¢6öÖÖ—EWFFR…ö–ç7Fæ6SBÂWFFU–ÆöBÂG—RÂöÆE&÷2ÂæWu&÷2Âf–æ—6†VEv÷&²“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢Ð¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R†÷7EFW‡C ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2bWFFR’°¢°¢–b†f–æ—6†VEv÷&²ç7FFTæöFRÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚uF†—26†÷VÆB†fRFW‡BæöFR–æ—F–Æ—¦VBâF†—2W'&÷"—2Æ–¶VÇ’r²v6W6VB'’'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢f"FW‡D–ç7Fæ6RÒf–æ—6†VEv÷&²ç7FFTæöFS°¢f"æWuFW‡BÒf–æ—6†VEv÷&²æÖVÖö—¦VE&÷3²òòf÷"‡–G&F–öâvR&WW6RF†RWFFRF‚'WBvRG&VBF†RöÆE&÷0¢òò2F†RæWu&÷2âF†RWFFU–ÆöBv–ÆÂ6öçF–âF†R&VÂ6†ævR–à¢òòF†—266Rà ¢f"öÆEFW‡BÒ7W'&VçBÓÒçVÆÂò7W'&VçBæÖVÖö—¦VE&÷2¢æWuFW‡C° ¢G'’°¢6öÖÖ—EFW‡EWFFR‡FW‡D–ç7Fæ6RÂöÆEFW‡BÂæWuFW‡B“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R†÷7E&ö÷C ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2bWFFR’°¢°¢–b†7W'&VçBÓÒçVÆÂ’°¢f"&We&ö÷E7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS° ¢–b‡&We&ö÷E7FFRæ—4FV‡–G&FVB’°¢G'’°¢6öÖÖ—D‡–G&FVD6öçF–æW"‡&ö÷Bæ6öçF–æW$–æfò“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢Ð¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R†÷7E÷'FÃ ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢&WGW&ã°¢Ð ¢66R7W7Vç6T6ö×öæVçC ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“°¢f"öfg67&VVäf–&W"Òf–æ—6†VEv÷&²æ6†–ÆC° ¢–b†öfg67&VVäf–&W"æfÆw2bf—6–&–Æ—G’’°¢f"öfg67&VVä–ç7Fæ6RÒöfg67&VVäf–&W"ç7FFTæöFS°¢f"æWu7FFRÒöfg67&VVäf–&W"æÖVÖö—¦VE7FFS°¢f"—4†–FFVâÒæWu7FFRÓÒçVÆÃ²òòG&6²F†R7W'&VçB7FFRöâF†Röfg67&VVâ–ç7Fæ6R6òvR6à¢òò&VB—BGW&–ærâWfVç@ ¢öfg67&VVä–ç7Fæ6Ræ—4†–FFVâÒ—4†–FFVã° ¢–b†—4†–FFVâ’°¢f"v4†–FFVâÒöfg67&VVäf–&W"æÇFW&æFRÓÒçVÆÂbböfg67&VVäf–&W"æÇFW&æFRæÖVÖö—¦VE7FFRÓÒçVÆÃ° ¢–b‚v4†–FFVâ’°¢òòDôDó¢Ö÷fRFò76—fR†6P¢Ö&´6öÖÖ—EF–ÖTödfÆÆ&6²‚“°¢Ð¢Ð¢Ð ¢–b†fÆw2bWFFR’°¢G'’°¢6öÖÖ—E7W7Vç6T6ÆÆ&6²†f–æ—6†VEv÷&²“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Ð ¢GF6…7W7Vç6U&WG'”Æ—7FVæW'2†f–æ—6†VEv÷&²“°¢Ð ¢&WGW&ã°¢Ð ¢66Röfg67&VVä6ö×öæVçC ¢°¢f"÷v4†–FFVâÒ7W'&VçBÓÒçVÆÂbb7W'&VçBæÖVÖö—¦VE7FFRÓÒçVÆÃ° ¢–b‚òòDôDó¢&VÖ÷fRF†—2FVBfÆp¢f–æ—6†VEv÷&²æÖöFRb6öæ7W'&VçDÖöFR’°¢òò&Vf÷&R6öÖÖ—GF–ærF†R6†–ÆG&VâÂG&6²öâF†R7F6²v†WF†W"F†—0¢òòöfg67&VVâ7V'G&VRv2Ç&VG’†–FFVâÂ6òF†BvRFöâwBVæÖ÷VçBF†P¢òòVffV7G2v–âà¢f"&Wdöfg67&VVå7V'G&VUv4†–FFVâÒöfg67&VVå7V'G&VUv4†–FFVã°¢öfg67&VVå7V'G&VUv4†–FFVâÒ&Wdöfg67&VVå7V'G&VUv4†–FFVâÇÂ÷v4†–FFVã°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢öfg67&VVå7V'G&VUv4†–FFVâÒ&Wdöfg67&VVå7V'G&VUv4†–FFVã°¢ÒVÇ6R°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢Ð ¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2bf—6–&–Æ—G’’°¢f"ööfg67&VVä–ç7Fæ6RÒf–æ—6†VEv÷&²ç7FFTæöFS°¢f"öæWu7FFRÒf–æ—6†VEv÷&²æÖVÖö—¦VE7FFS° ¢f"ö—4†–FFVâÒöæWu7FFRÓÒçVÆÃ° ¢f"öfg67&VVä&÷VæF'’Òf–æ—6†VEv÷&³²òòG&6²F†R7W'&VçB7FFRöâF†Röfg67&VVâ–ç7Fæ6R6òvR6à¢òò&VB—BGW&–ærâWfVç@ ¢ööfg67&VVä–ç7Fæ6Ræ—4†–FFVâÒö—4†–FFVã° ¢°¢–b…ö—4†–FFVâ’°¢–b‚÷v4†–FFVâ’°¢–b‚†öfg67&VVä&÷VæF'’æÖöFRb6öæ7W'&VçDÖöFR’ÓÒæôÖöFR’°¢æW‡DVffV7BÒöfg67&VVä&÷VæF'“°¢f"öfg67&VVä6†–ÆBÒöfg67&VVä&÷VæF'’æ6†–ÆC° ¢v†–ÆR†öfg67&VVä6†–ÆBÓÒçVÆÂ’°¢æW‡DVffV7BÒöfg67&VVä6†–ÆC°¢F—6V$Æ–÷WDVffV7G5ö&Vv–â†öfg67&VVä6†–ÆB“°¢öfg67&VVä6†–ÆBÒöfg67&VVä6†–ÆBç6–&Æ–æs°¢Ð¢Ð¢Ð¢Ð¢Ð ¢°¢òòDôDó¢F†—2æVVG2Fò'Vâv†VæWfW"F†W&Rw2â–ç6W'F–öâ÷"WFFP¢òò–ç6–FR†–FFVâöfg67&VVâG&VRà¢†–FT÷%Væ†–FTÆÄ6†–ÆG&Vâ†öfg67&VVä&÷VæF'’Âö—4†–FFVâ“°¢Ð¢Ð ¢&WGW&ã°¢Ð ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“° ¢–b†fÆw2bWFFR’°¢GF6…7W7Vç6U&WG'”Æ—7FVæW'2†f–æ—6†VEv÷&²“°¢Ð ¢&WGW&ã°¢Ð ¢66R66÷T6ö×öæVçC ¢° ¢&WGW&ã°¢Ð ¢FVfVÇC ¢°¢&V7W'6—fVÇ•G&fW'6T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“°¢6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²“°¢&WGW&ã°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E&V6öæ6–Æ–F–öäVffV7G2†f–æ—6†VEv÷&²’°¢òòÆ6VÖVçBVffV7G2†–ç6W'F–öç2Â&V÷&FW'2’6â&R66†VGVÆVBöâç’f–&W ¢òòG—RâF†W’æVVG2Fò†VâgFW"F†R6†–ÆG&VâVffV7G2†fRf—&VBÂ'W@¢òò&Vf÷&RF†RVffV7G2öâF†—2f–&W"†fRf—&VBà¢f"fÆw2Òf–æ—6†VEv÷&²æfÆw3° ¢–b†fÆw2bÆ6VÖVçB’°¢G'’°¢6öÖÖ—EÆ6VÖVçB†f–æ—6†VEv÷&²“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&âÂW'&÷"“°¢Òòò6ÆV"F†R'Æ6VÖVçB"g&öÒVffV7BFr6òF†BvR¶æ÷rF†BF†—2—0¢òò–ç6W'FVBÂ&Vf÷&Rç’Æ–fRÖ7–6ÆW2Æ–¶R6ö×öæVçDF–DÖ÷VçBvWG26ÆÆVBà¢òòDôDó¢f–æDDôÔæöFRFöW6âwB&VÇ’öâF†—2ç’Ö÷&R'WB—4Ö÷VçFVBFöW0¢òòæB—4Ö÷VçFVB—2FW&V6FVBç—v’6òvR6†÷VÆB&R&ÆRFò¶–ÆÂF†—2à  ¢f–æ—6†VEv÷&²æfÆw2cÒåÆ6VÖVçC°¢Ð ¢–b†fÆw2b‡–G&F–ær’°¢f–æ—6†VEv÷&²æfÆw2cÒä‡–G&F–æs°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—DÆ–÷WDVffV7G2†f–æ—6†VEv÷&²Â&ö÷BÂ6öÖÖ—GFVDÆæW2’°¢–å&öw&W74ÆæW2Ò6öÖÖ—GFVDÆæW3°¢–å&öw&W75&ö÷BÒ&ö÷C°¢æW‡DVffV7BÒf–æ—6†VEv÷&³°¢6öÖÖ—DÆ–÷WDVffV7G5ö&Vv–â†f–æ—6†VEv÷&²Â&ö÷BÂ6öÖÖ—GFVDÆæW2“°¢–å&öw&W74ÆæW2ÒçVÆÃ°¢–å&öw&W75&ö÷BÒçVÆÃ°¢Ð ¢gVæ7F–öâ6öÖÖ—DÆ–÷WDVffV7G5ö&Vv–â‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2’°¢òò7W7Vç6RÆ–÷WBVffV7G26VÖçF–72FöâwB6†ævRf÷"ÆVv7’&ö÷G2à¢f"—4ÖöFW&å&ö÷BÒ‡7V'G&VU&ö÷BæÖöFRb6öæ7W'&VçDÖöFR’ÓÒæôÖöFS° ¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢f"f—'7D6†–ÆBÒf–&W"æ6†–ÆC° ¢–b‚f–&W"çFrÓÓÒöfg67&VVä6ö×öæVçBbb—4ÖöFW&å&ö÷B’°¢òò¶VWG&6²öbF†R7W'&VçBöfg67&VVâ7F6²w27FFRà¢f"—4†–FFVâÒf–&W"æÖVÖö—¦VE7FFRÓÒçVÆÃ°¢f"æWtöfg67&VVå7V'G&VT—4†–FFVâÒ—4†–FFVâÇÂöfg67&VVå7V'G&VT—4†–FFVã° ¢–b†æWtöfg67&VVå7V'G&VT—4†–FFVâ’°¢òòF†Röfg67&VVâG&VR—2†–FFVââ6¶—÷fW"—G2Æ–÷WBVffV7G2à¢6öÖÖ—DÆ–÷WDÖ÷VçDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2“°¢6öçF–çVS°¢ÒVÇ6R°¢òòDôDò„öfg67&VVâ’Ç6ò6†V6³¢7V'G&VTfÆw2bÆ–÷WDÖ6°¢f"7W'&VçBÒf–&W"æÇFW&æFS°¢f"v4†–FFVâÒ7W'&VçBÓÒçVÆÂbb7W'&VçBæÖVÖö—¦VE7FFRÓÒçVÆÃ°¢f"æWtöfg67&VVå7V'G&VUv4†–FFVâÒv4†–FFVâÇÂöfg67&VVå7V'G&VUv4†–FFVã°¢f"&Wdöfg67&VVå7V'G&VT—4†–FFVâÒöfg67&VVå7V'G&VT—4†–FFVã°¢f"&Wdöfg67&VVå7V'G&VUv4†–FFVâÒöfg67&VVå7V'G&VUv4†–FFVã²òòG&fW'6RF†Röfg67&VVâ7V'G&VRv—F‚F†R7W'&VçBöfg67&VVâ2F†R&ö÷Bà ¢öfg67&VVå7V'G&VT—4†–FFVâÒæWtöfg67&VVå7V'G&VT—4†–FFVã°¢öfg67&VVå7V'G&VUv4†–FFVâÒæWtöfg67&VVå7V'G&VUv4†–FFVã° ¢–b†öfg67&VVå7V'G&VUv4†–FFVâbb&Wdöfg67&VVå7V'G&VUv4†–FFVâ’°¢òòF†—2—2F†R&ö÷Böb&VV&–ær&÷VæF'’âGW&â—G2Æ–÷WBVffV7G0¢òò&6²öâà¢æW‡DVffV7BÒf–&W#°¢&VV$Æ–÷WDVffV7G5ö&Vv–â†f–&W"“°¢Ð ¢f"6†–ÆBÒf—'7D6†–ÆC° ¢v†–ÆR†6†–ÆBÓÒçVÆÂ’°¢æW‡DVffV7BÒ6†–ÆC°¢6öÖÖ—DÆ–÷WDVffV7G5ö&Vv–â†6†–ÆBÂòòæWr&ö÷C²'V&&ÆR&6²WFò†W&RæB7F÷à¢&ö÷BÂ6öÖÖ—GFVDÆæW2“°¢6†–ÆBÒ6†–ÆBç6–&Æ–æs°¢Òòò&W7F÷&Röfg67&VVâ7FFRæB&W7VÖR–â÷W"×&öw&W72G&fW'6Âà  ¢æW‡DVffV7BÒf–&W#°¢öfg67&VVå7V'G&VT—4†–FFVâÒ&Wdöfg67&VVå7V'G&VT—4†–FFVã°¢öfg67&VVå7V'G&VUv4†–FFVâÒ&Wdöfg67&VVå7V'G&VUv4†–FFVã°¢6öÖÖ—DÆ–÷WDÖ÷VçDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2“°¢6öçF–çVS°¢Ð¢Ð ¢–b‚†f–&W"ç7V'G&VTfÆw2bÆ–÷WDÖ6²’ÓÒæôfÆw2bbf—'7D6†–ÆBÓÒçVÆÂ’°¢f—'7D6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒf—'7D6†–ÆC°¢ÒVÇ6R°¢6öÖÖ—DÆ–÷WDÖ÷VçDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—DÆ–÷WDÖ÷VçDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C° ¢–b‚†f–&W"æfÆw2bÆ–÷WDÖ6²’ÓÒæôfÆw2’°¢f"7W'&VçBÒf–&W"æÇFW&æFS°¢6WD7W'&VçDf–&W"†f–&W"“° ¢G'’°¢6öÖÖ—DÆ–÷WDVffV7Döäf–&W"‡&ö÷BÂ7W'&VçBÂf–&W"Â6öÖÖ—GFVDÆæW2“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“°¢Ð ¢–b†f–&W"ÓÓÒ7V'G&VU&ö÷B’°¢æW‡DVffV7BÒçVÆÃ°¢&WGW&ã°¢Ð ¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs° ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢6–&Æ–ærç&WGW&âÒf–&W"ç&WGW&ã°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒf–&W"ç&WGW&ã°¢Ð¢Ð ¢gVæ7F–öâF—6V$Æ–÷WDVffV7G5ö&Vv–â‡7V'G&VU&ö÷B’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢f"f—'7D6†–ÆBÒf–&W"æ6†–ÆC²òòDôDò„öfg67&VVâ’6†V6³¢fÆw2b…&Ve7FF–2ÂÆ–÷WE7FF–2 ¢7v—F6‚†f–&W"çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66RÖVÖô6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚f–&W"æÖöFRb&öf–ÆTÖöFR’°¢G'’°¢7F'DÆ–÷WDVffV7EF–ÖW"‚“°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB„Æ–÷WBÂf–&W"Âf–&W"ç&WGW&â“°¢Òf–æÆÇ’°¢&V6÷&DÆ–÷WDVffV7DGW&F–öâ†f–&W"“°¢Ð¢ÒVÇ6R°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB„Æ–÷WBÂf–&W"Âf–&W"ç&WGW&â“°¢Ð ¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢òòDôDò„öfg67&VVâ’6†V6³¢fÆw2b&Ve7FF–0¢6fVÇ”FWF6…&Vb†f–&W"Âf–&W"ç&WGW&â“°¢f"–ç7Fæ6RÒf–&W"ç7FFTæöFS° ¢–b‡G—Vöb–ç7Fæ6Ræ6ö×öæVçEv–ÆÅVæÖ÷VçBÓÓÒvgVæ7F–öâr’°¢6fVÇ”6ÆÄ6ö×öæVçEv–ÆÅVæÖ÷VçB†f–&W"Âf–&W"ç&WGW&âÂ–ç7Fæ6R“°¢Ð ¢'&V³°¢Ð ¢66R†÷7D6ö×öæVçC ¢°¢6fVÇ”FWF6…&Vb†f–&W"Âf–&W"ç&WGW&â“°¢'&V³°¢Ð ¢66Röfg67&VVä6ö×öæVçC ¢°¢òò6†V6²–bF†—2—2¢f"—4†–FFVâÒf–&W"æÖVÖö—¦VE7FFRÓÒçVÆÃ° ¢–b†—4†–FFVâ’°¢òòæW7FVBöfg67&VVâG&VR—2Ç&VG’†–FFVââFöâwBF—6V ¢òò—G2VffV7G2à¢F—6V$Æ–÷WDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷B“°¢6öçF–çVS°¢Ð ¢'&V³°¢Ð¢ÒòòDôDò„öfg67&VVâ’6†V6³¢7V'G&VTfÆw2bÆ–÷WE7FF–0  ¢–b†f—'7D6†–ÆBÓÒçVÆÂ’°¢f—'7D6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒf—'7D6†–ÆC°¢ÒVÇ6R°¢F—6V$Æ–÷WDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷B“°¢Ð¢Ð¢Ð ¢gVæ7F–öâF—6V$Æ–÷WDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷B’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C° ¢–b†f–&W"ÓÓÒ7V'G&VU&ö÷B’°¢æW‡DVffV7BÒçVÆÃ°¢&WGW&ã°¢Ð ¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs° ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢6–&Æ–ærç&WGW&âÒf–&W"ç&WGW&ã°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒf–&W"ç&WGW&ã°¢Ð¢Ð ¢gVæ7F–öâ&VV$Æ–÷WDVffV7G5ö&Vv–â‡7V'G&VU&ö÷B’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢f"f—'7D6†–ÆBÒf–&W"æ6†–ÆC° ¢–b†f–&W"çFrÓÓÒöfg67&VVä6ö×öæVçB’°¢f"—4†–FFVâÒf–&W"æÖVÖö—¦VE7FFRÓÒçVÆÃ° ¢–b†—4†–FFVâ’°¢òòæW7FVBöfg67&VVâG&VR—27F–ÆÂ†–FFVââFöâwB&RÖV"—G2VffV7G2à¢&VV$Æ–÷WDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷B“°¢6öçF–çVS°¢Ð¢ÒòòDôDò„öfg67&VVâ’6†V6³¢7V'G&VTfÆw2bÆ–÷WE7FF–0  ¢–b†f—'7D6†–ÆBÓÒçVÆÂ’°¢òòF†—2æöFRÖ’†fR&VVâ&WW6VBg&öÒ&Wf–÷W2&VæFW"Â6òvR6âw@¢òò77VÖR—G2&WGW&âö–çFW"—26÷'&V7Bà¢f—'7D6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒf—'7D6†–ÆC°¢ÒVÇ6R°¢&VV$Æ–÷WDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷B“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ&VV$Æ–÷WDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷B’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C²òòDôDò„öfg67&VVâ’6†V6³¢fÆw2bÆ–÷WE7FF–0 ¢6WD7W'&VçDf–&W"†f–&W"“° ¢G'’°¢&VV$Æ–÷WDVffV7G4öäf–&W"†f–&W"“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“° ¢–b†f–&W"ÓÓÒ7V'G&VU&ö÷B’°¢æW‡DVffV7BÒçVÆÃ°¢&WGW&ã°¢Ð ¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs° ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢òòF†—2æöFRÖ’†fR&VVâ&WW6VBg&öÒ&Wf–÷W2&VæFW"Â6òvR6âw@¢òò77VÖR—G2&WGW&âö–çFW"—26÷'&V7Bà¢6–&Æ–ærç&WGW&âÒf–&W"ç&WGW&ã°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒf–&W"ç&WGW&ã°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fTÖ÷VçDVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²Â6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2’°¢æW‡DVffV7BÒf–æ—6†VEv÷&³°¢6öÖÖ—E76—fTÖ÷VçDVffV7G5ö&Vv–â†f–æ—6†VEv÷&²Â&ö÷BÂ6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2“°¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fTÖ÷VçDVffV7G5ö&Vv–â‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢f"f—'7D6†–ÆBÒf–&W"æ6†–ÆC° ¢–b‚†f–&W"ç7V'G&VTfÆw2b76—fTÖ6²’ÓÒæôfÆw2bbf—'7D6†–ÆBÓÒçVÆÂ’°¢f—'7D6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒf—'7D6†–ÆC°¢ÒVÇ6R°¢6öÖÖ—E76—fTÖ÷VçDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fTÖ÷VçDVffV7G5ö6ö×ÆWFR‡7V'G&VU&ö÷BÂ&ö÷BÂ6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C° ¢–b‚†f–&W"æfÆw2b76—fR’ÓÒæôfÆw2’°¢6WD7W'&VçDf–&W"†f–&W"“° ¢G'’°¢6öÖÖ—E76—fTÖ÷VçDöäf–&W"‡&ö÷BÂf–&W"Â6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“°¢Ð ¢–b†f–&W"ÓÓÒ7V'G&VU&ö÷B’°¢æW‡DVffV7BÒçVÆÃ°¢&WGW&ã°¢Ð ¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs° ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢6–&Æ–ærç&WGW&âÒf–&W"ç&WGW&ã°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒf–&W"ç&WGW&ã°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fTÖ÷VçDöäf–&W"†f–æ—6†VE&ö÷BÂf–æ—6†VEv÷&²Â6öÖÖ—GFVDÆæW2Â6öÖÖ—GFVEG&ç6—F–öç2’°¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢7F'E76—fTVffV7EF–ÖW"‚“° ¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB…76—fRCÂ†4VffV7BÂf–æ—6†VEv÷&²“°¢Òf–æÆÇ’°¢&V6÷&E76—fTVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢Ð¢ÒVÇ6R°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB…76—fRCÂ†4VffV7BÂf–æ—6†VEv÷&²“°¢Ð ¢'&V³°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçDVffV7G2†f—'7D6†–ÆB’°¢æW‡DVffV7BÒf—'7D6†–ÆC°¢6öÖÖ—E76—fUVæÖ÷VçDVffV7G5ö&Vv–â‚“°¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçDVffV7G5ö&Vv–â‚’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢f"6†–ÆBÒf–&W"æ6†–ÆC° ¢–b‚†æW‡DVffV7BæfÆw2b6†–ÆDFVÆWF–öâ’ÓÒæôfÆw2’°¢f"FVÆWF–öç2Òf–&W"æFVÆWF–öç3° ¢–b†FVÆWF–öç2ÓÒçVÆÂ’°¢f÷"‡f"’Ò²’ÂFVÆWF–öç2æÆVæwFƒ²’²²’°¢f"f–&W%FôFVÆWFRÒFVÆWF–öç5¶•Ó°¢æW‡DVffV7BÒf–&W%FôFVÆWFS°¢6öÖÖ—E76—fUVæÖ÷VçDVffV7G4–ç6–FTödFVÆWFVEG&VUö&Vv–â†f–&W%FôFVÆWFRÂf–&W"“°¢Ð ¢°¢òòf–&W"v2FVÆWFVBg&öÒF†—2&VçBf–&W"Â'WB—Bw27F–ÆÂ'Bö`¢òòF†R&Wf–÷W2†ÇFW&æFR’&VçBf–&W"w2Æ—7Böb6†–ÆG&Vââ&V6W6P¢òò6†–ÆG&Vâ&RÆ–æ¶VBÆ—7BÂâV&Æ–W"6–&Æ–ærF†Bw27F–ÆÂÆ—fP¢òòv–ÆÂ&R6öææV7FVBFòF†RFVÆWFVBf–&W"f–—G2ÇFW&æFV ¢òð¢òòÆ—fRf–&W ¢òòÒÖÇFW&æFRÒÓâ&Wf–÷W2Æ—fRf–&W ¢òòÒ×6–&Æ–ærÒÓâFVÆWFVBf–&W ¢òð¢òòvR6âwBF—66öææV7BÇFW&æFVöâæöFW2F†B†fVâwB&VVâFVÆWFV@¢òò–WBÂ'WBvR6âF—66öææV7BF†R6–&Æ–ævæB6†–ÆFö–çFW'2à¢f"&Wf–÷W4f–&W"Òf–&W"æÇFW&æFS° ¢–b‡&Wf–÷W4f–&W"ÓÒçVÆÂ’°¢f"FWF6†VD6†–ÆBÒ&Wf–÷W4f–&W"æ6†–ÆC° ¢–b†FWF6†VD6†–ÆBÓÒçVÆÂ’°¢&Wf–÷W4f–&W"æ6†–ÆBÒçVÆÃ° ¢Fò°¢f"FWF6†VE6–&Æ–ærÒFWF6†VD6†–ÆBç6–&Æ–æs°¢FWF6†VD6†–ÆBç6–&Æ–ærÒçVÆÃ°¢FWF6†VD6†–ÆBÒFWF6†VE6–&Æ–æs°¢Òv†–ÆR†FWF6†VD6†–ÆBÓÒçVÆÂ“°¢Ð¢Ð¢Ð ¢æW‡DVffV7BÒf–&W#°¢Ð¢Ð ¢–b‚†f–&W"ç7V'G&VTfÆw2b76—fTÖ6²’ÓÒæôfÆw2bb6†–ÆBÓÒçVÆÂ’°¢6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒ6†–ÆC°¢ÒVÇ6R°¢6öÖÖ—E76—fUVæÖ÷VçDVffV7G5ö6ö×ÆWFR‚“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçDVffV7G5ö6ö×ÆWFR‚’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C° ¢–b‚†f–&W"æfÆw2b76—fR’ÓÒæôfÆw2’°¢6WD7W'&VçDf–&W"†f–&W"“°¢6öÖÖ—E76—fUVæÖ÷VçDöäf–&W"†f–&W"“°¢&W6WD7W'&VçDf–&W"‚“°¢Ð ¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs° ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢6–&Æ–ærç&WGW&âÒf–&W"ç&WGW&ã°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒf–&W"ç&WGW&ã°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçDöäf–&W"†f–æ—6†VEv÷&²’°¢7v—F6‚†f–æ—6†VEv÷&²çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚f–æ—6†VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢7F'E76—fTVffV7EF–ÖW"‚“°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB…76—fRCÂ†4VffV7BÂf–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&â“°¢&V6÷&E76—fTVffV7DGW&F–öâ†f–æ—6†VEv÷&²“°¢ÒVÇ6R°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB…76—fRCÂ†4VffV7BÂf–æ—6†VEv÷&²Âf–æ—6†VEv÷&²ç&WGW&â“°¢Ð ¢'&V³°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçDVffV7G4–ç6–FTödFVÆWFVEG&VUö&Vv–â†FVÆWFVE7V'G&VU&ö÷BÂæV&W7DÖ÷VçFVDæ6W7F÷"’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C²òòFVÆWF–öâVffV7G2f—&R–â&VçBÓâ6†–ÆB÷&FW ¢òòDôDó¢6†V6²–bf–&W"†276—fU7FF–2fÆp ¢6WD7W'&VçDf–&W"†f–&W"“°¢6öÖÖ—E76—fUVæÖ÷VçD–ç6–FTFVÆWFVEG&VTöäf–&W"†f–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"“°¢&W6WD7W'&VçDf–&W"‚“°¢f"6†–ÆBÒf–&W"æ6†–ÆC²òòDôDó¢öæÇ’G&fW'6R7V'G&VR–b—B†276—fU7FF–2fÆrâ„'WBÂ–bvP¢òòFòF†—2Â7F–ÆÂæVVBFò†æFÆRFVÆWFVEG&VT6ÆVåWÆWfVÆ6÷'&V7FÇ’â ¢–b†6†–ÆBÓÒçVÆÂ’°¢6†–ÆBç&WGW&âÒf–&W#°¢æW‡DVffV7BÒ6†–ÆC°¢ÒVÇ6R°¢6öÖÖ—E76—fUVæÖ÷VçDVffV7G4–ç6–FTödFVÆWFVEG&VUö6ö×ÆWFR†FVÆWFVE7V'G&VU&ö÷B“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçDVffV7G4–ç6–FTödFVÆWFVEG&VUö6ö×ÆWFR†FVÆWFVE7V'G&VU&ö÷B’°¢v†–ÆR†æW‡DVffV7BÓÒçVÆÂ’°¢f"f–&W"ÒæW‡DVffV7C°¢f"6–&Æ–ærÒf–&W"ç6–&Æ–æs°¢f"&WGW&äf–&W"Òf–&W"ç&WGW&ã° ¢°¢òò&V7W'6—fVÇ’G&fW'6RF†RVçF—&RFVÆWFVBG&VRæB6ÆVâWf–&W"f–VÆG2à¢òòF†—2—2Ö÷&Rvw&W76—fRF†â–FVÂÂæBF†RÆöærFW&ÒvöÂ—2FòöæÇ¢òò†fRFòFWF6‚F†RFVÆWFVBG&VRBF†R&ö÷Bà¢FWF6„f–&W$gFW$VffV7G2†f–&W"“° ¢–b†f–&W"ÓÓÒFVÆWFVE7V'G&VU&ö÷B’°¢æW‡DVffV7BÒçVÆÃ°¢&WGW&ã°¢Ð¢Ð ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢6–&Æ–ærç&WGW&âÒ&WGW&äf–&W#°¢æW‡DVffV7BÒ6–&Æ–æs°¢&WGW&ã°¢Ð ¢æW‡DVffV7BÒ&WGW&äf–&W#°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E76—fUVæÖ÷VçD–ç6–FTFVÆWFVEG&VTöäf–&W"†7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"’°¢7v—F6‚†7W'&VçBçFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚7W'&VçBæÖöFRb&öf–ÆTÖöFR’°¢7F'E76—fTVffV7EF–ÖW"‚“°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB…76—fRCÂ7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"“°¢&V6÷&E76—fTVffV7DGW&F–öâ†7W'&VçB“°¢ÒVÇ6R°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB…76—fRCÂ7W'&VçBÂæV&W7DÖ÷VçFVDæ6W7F÷"“°¢Ð ¢'&V³°¢Ð¢Ð¢ÒòòDôDó¢&WW6R&VV$Æ–÷WDVffV7G2G&fW'6Â†W&Sð  ¢gVæ7F–öâ–çfö¶TÆ–÷WDVffV7DÖ÷VçD–äDUb†f–&W"’°¢°¢òòvRFöâwBæVVBFò&RÖ6†V6²7G&–7DVffV7G4ÖöFR†W&Rà¢òòF†—2gVæ7F–öâ—2öæÇ’6ÆÆVB–bF†B6†V6²†2Ç&VG’76VBà¢7v—F6‚†f–&W"çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB„Æ–÷WBÂ†4VffV7BÂf–&W"“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢f"–ç7Fæ6RÒf–&W"ç7FFTæöFS° ¢G'’°¢–ç7Fæ6Ræ6ö×öæVçDF–DÖ÷VçB‚“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢'&V³°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ–çfö¶U76—fTVffV7DÖ÷VçD–äDUb†f–&W"’°¢°¢òòvRFöâwBæVVBFò&RÖ6†V6²7G&–7DVffV7G4ÖöFR†W&Rà¢òòF†—2gVæ7F–öâ—2öæÇ’6ÆÆVB–bF†B6†V6²†2Ç&VG’76VBà¢7v—F6‚†f–&W"çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7DÖ÷VçB…76—fRCÂ†4VffV7BÂf–&W"“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢'&V³°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ–çfö¶TÆ–÷WDVffV7EVæÖ÷VçD–äDUb†f–&W"’°¢°¢òòvRFöâwBæVVBFò&RÖ6†V6²7G&–7DVffV7G4ÖöFR†W&Rà¢òòF†—2gVæ7F–öâ—2öæÇ’6ÆÆVB–bF†B6†V6²†2Ç&VG’76VBà¢7v—F6‚†f–&W"çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB„Æ–÷WBÂ†4VffV7BÂf–&W"Âf–&W"ç&WGW&â“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð ¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢f"–ç7Fæ6RÒf–&W"ç7FFTæöFS° ¢–b‡G—Vöb–ç7Fæ6Ræ6ö×öæVçEv–ÆÅVæÖ÷VçBÓÓÒvgVæ7F–öâr’°¢6fVÇ”6ÆÄ6ö×öæVçEv–ÆÅVæÖ÷VçB†f–&W"Âf–&W"ç&WGW&âÂ–ç7Fæ6R“°¢Ð ¢'&V³°¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ–çfö¶U76—fTVffV7EVæÖ÷VçD–äDUb†f–&W"’°¢°¢òòvRFöâwBæVVBFò&RÖ6†V6²7G&–7DVffV7G4ÖöFR†W&Rà¢òòF†—2gVæ7F–öâ—2öæÇ’6ÆÆVB–bF†B6†V6²†2Ç&VG’76VBà¢7v—F6‚†f–&W"çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢G'’°¢6öÖÖ—D†öö´VffV7DÆ—7EVæÖ÷VçB…76—fRCÂ†4VffV7BÂf–&W"Âf–&W"ç&WGW&â“°¢Ò6F6‚†W'&÷"’°¢6GW&T6öÖÖ—E†6TW'&÷"†f–&W"Âf–&W"ç&WGW&âÂW'&÷"“°¢Ð¢Ð¢Ð¢Ð¢Ð ¢f"4ôÕôäTåEõE•RÒ°¢f"„5õ4UTDõô4Ä55õE•RÒ°¢f"$ôÄUõE•RÒ#°¢f"DU5EôäÔUõE•RÒ3°¢f"DU…EõE•RÒC° ¢–b‡G—Vöb7–Ö&öÂÓÓÒvgVæ7F–öârbb7–Ö&öÂæf÷"’°¢f"7–Ö&öÄf÷"Ò7–Ö&öÂæf÷#°¢4ôÕôäTåEõE•RÒ7–Ö&öÄf÷"‚w6VÆV7F÷"æ6ö×öæVçBr“°¢„5õ4UTDõô4Ä55õE•RÒ7–Ö&öÄf÷"‚w6VÆV7F÷"æ†5÷6WVFõö6Æ72r“°¢$ôÄUõE•RÒ7–Ö&öÄf÷"‚w6VÆV7F÷"ç&öÆRr“°¢DU5EôäÔUõE•RÒ7–Ö&öÄf÷"‚w6VÆV7F÷"çFW7Eö–Br“°¢DU…EõE•RÒ7–Ö&öÄf÷"‚w6VÆV7F÷"çFW‡Br“°¢Ð¢f"6öÖÖ—D†öö·2ÒµÓ°¢gVæ7F–öâöä6öÖÖ—E&ö÷BC‚’°¢°¢6öÖÖ—D†öö·2æf÷$V6‚†gVæ7F–öâ†6öÖÖ—D†öö²’°¢&WGW&â6öÖÖ—D†öö²‚“°¢Ò“°¢Ð¢Ð ¢f"&V7D7W'&VçD7EVWVRÒ&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçD7EVWVS°¢gVæ7F–öâ—4ÆVv7”7DVçf—&öæÖVçB†f–&W"’°¢°¢òòÆVv7’ÖöFRâvR&W6W'fRF†R&V†f–÷"öb&V7Brw27Bâ—B77VÖW2à¢òò7BVçf—&öæÖVçBv†VæWfW"¦W7F—2FVf–æVBÂ'WB–÷R6â7F–ÆÂGW&âöf`¢òò7W&–÷W2v&æ–æw2'’6WGF–ær•5õ$T5Eô5EôTåd•$ôäÔTåBW‡Æ–6—FÇ¢òòFòfÇ6Rà¢f"—5&V7D7DVçf—&öæÖVçDvÆö&ÂÒòòDfÆ÷tW‡V7FVDW'&÷"(	2fÆ÷rFöW6âwB¶æ÷r&÷WB•5õ$T5Eô5EôTåd•$ôäÔTåBvÆö&À¢G—Vöb•5õ$T5Eô5EôTåd•$ôäÔTåBÓÒwVæFVf–æVBrò•5õ$T5Eô5EôTåd•$ôäÔTåB¢VæFVf–æVC²òòDfÆ÷tW‡V7FVDW'&÷"ÒfÆ÷rFöW6âwB¶æ÷r&÷WB¦W7@ ¢f"¦W7D—4FVf–æVBÒG—Vöb¦W7BÓÒwVæFVf–æVBs°¢&WGW&â¦W7D—4FVf–æVBbb—5&V7D7DVçf—&öæÖVçDvÆö&ÂÓÒfÇ6S°¢Ð¢Ð¢gVæ7F–öâ—46öæ7W'&VçD7DVçf—&öæÖVçB‚’°¢°¢f"—5&V7D7DVçf—&öæÖVçDvÆö&ÂÒòòDfÆ÷tW‡V7FVDW'&÷"(	2fÆ÷rFöW6âwB¶æ÷r&÷WB•5õ$T5Eô5EôTåd•$ôäÔTåBvÆö&À¢G—Vöb•5õ$T5Eô5EôTåd•$ôäÔTåBÓÒwVæFVf–æVBrò•5õ$T5Eô5EôTåd•$ôäÔTåB¢VæFVf–æVC° ¢–b‚—5&V7D7DVçf—&öæÖVçDvÆö&Âbb&V7D7W'&VçD7EVWVRæ7W'&VçBÓÒçVÆÂ’°¢òòDôDó¢–æ6ÇVFRÆ–æ²Fò&VÆWfçBFö7VÖVçFF–öâvRà¢W'&÷"‚uF†R7W'&VçBFW7F–ærVçf—&öæÖVçB—2æ÷B6öæf–wW&VBFò7W÷'Br²v7B‚âââ’r“°¢Ð ¢&WGW&â—5&V7D7DVçf—&öæÖVçDvÆö&Ã°¢Ð¢Ð ¢f"6V–ÂÒÖF‚æ6V–Ã°¢f"&V7D7W'&VçDF—7F6†W"C"Ò&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçDF—7F6†W"À¢&V7D7W'&VçD÷væW"C"Ò&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçD÷væW"À¢&V7D7W'&VçD&F6„6öæf–rC2Ò&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçD&F6„6öæf–rÀ¢&V7D7W'&VçD7EVWVRCÒ&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçD7EVWVS°¢f"æô6öçFW‡BÐ¢ò¢¢ð¢°¢f"&F6†VD6öçFW‡BÐ¢ò¢¢ð¢°¢f"&VæFW$6öçFW‡BÐ¢ò¢¢ð¢#°¢f"6öÖÖ—D6öçFW‡BÐ¢ò¢¢ð¢C°¢f"&ö÷D–å&öw&W72Ò°¢f"&ö÷DfFÄW'&÷&VBÒ°¢f"&ö÷DW'&÷&VBÒ#°¢f"&ö÷E7W7VæFVBÒ3°¢f"&ö÷E7W7VæFVEv—F„FVÆ’ÒC°¢f"&ö÷D6ö×ÆWFVBÒS°¢f"&ö÷DF–Dæ÷D6ö×ÆWFRÒc²òòFW67&–&W2v†W&RvR&R–âF†R&V7BW†V7WF–öâ7F6° ¢f"W†V7WF–öä6öçFW‡BÒæô6öçFW‡C²òòF†R&ö÷BvRw&Rv÷&¶–æröà ¢f"v÷&´–å&öw&W75&ö÷BÒçVÆÃ²òòF†Rf–&W"vRw&Rv÷&¶–æröà ¢f"v÷&´–å&öw&W72ÒçVÆÃ²òòF†RÆæW2vRw&R&VæFW&–æp ¢f"v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÒæôÆæW3²òò7F6²F†BÆÆ÷w26ö×öæVçG2Fò6†ævRF†R&VæFW"ÆæW2f÷"—G27V'G&VP¢òòF†—2—27WW'6WBöbF†RÆæW2vR7F'FVBv÷&¶–æröâBF†R&ö÷BâF†RöæÇ¢òò66Rv†W&R—Bw2F–ffW&VçBg&öÒv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW6—2v†VâvP¢òòVçFW"7V'G&VRF†B—2†–FFVâæBæVVG2Fò&RVæ†–FFVã¢7W7Vç6Ræ@¢òòöfg67&VVâ6ö×öæVçBà¢òð¢òòÖ÷7BF†–æw2–âF†Rv÷&²Æö÷6†÷VÆBFVÂv—F‚v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2à¢òòÖ÷7BF†–æw2–â&Vv–âö6ö×ÆWFR†6W26†÷VÆBFVÂv—F‚7V'G&VU&VæFW$ÆæW2à ¢f"7V'G&VU&VæFW$ÆæW2ÒæôÆæW3°¢f"7V'G&VU&VæFW$ÆæW47W'6÷"Ò7&VFT7W'6÷"„æôÆæW2“²òòv†WF†W"Fò&ö÷B6ö×ÆWFVBÂW'&÷&VBÂ7W7VæFVBÂWF2à ¢f"v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷D–å&öw&W73²òòfFÂW'&÷"Â–böæR—2F‡&÷và ¢f"v÷&´–å&öw&W75&ö÷DfFÄW'&÷"ÒçVÆÃ²òò$–æ6ÇVFVB"ÆæW2&VfW"FòÆæW2F†BvW&Rv÷&¶VBöâGW&–ærF†—2&VæFW"â—Bw0¢òò6Æ–v‡FÇ’F–ffW&VçBF†â&VæFW$ÆæW6&V6W6R&VæFW$ÆæW66â6†ævR2–÷P¢òòVçFW"æBW†—Bâöfg67&VVâG&VRâF†—2fÇVR—2F†R6öÖ&–æF–öâöbÆÂ&VæFW ¢òòÆæW2f÷"F†RVçF—&R&VæFW"†6Rà ¢f"v÷&´–å&öw&W75&ö÷D–æ6ÇVFVDÆæW2ÒæôÆæW3²òòF†Rv÷&²ÆVgB÷fW"'’6ö×öæVçG2F†BvW&Rf—6—FVBGW&–ærF†—2&VæFW"âöæÇ¢òò–æ6ÇVFW2Vç&ö6W76VBWFFW2Âæ÷Bv÷&²–â&–ÆVB÷WB6†–ÆG&Vâà ¢f"v÷&´–å&öw&W75&ö÷E6¶—VDÆæW2ÒæôÆæW3²òòÆæW2F†BvW&RWFFVB†–ââ–çFW&ÆVfVBWfVçB’GW&–ærF†—2&VæFW"à ¢f"v÷&´–å&öw&W75&ö÷D–çFW&ÆVfVEWFFVDÆæW2ÒæôÆæW3²òòÆæW2F†BvW&RWFFVBGW&–ærF†R&VæFW"†6R‚¦æ÷B¢â–çFW&ÆVfVBWfVçB’à ¢f"v÷&´–å&öw&W75&ö÷E–ævVDÆæW2ÒæôÆæW3²òòW'&÷'2F†B&RF‡&÷vâGW&–ærF†R&VæFW"†6Rà ¢f"v÷&´–å&öw&W75&ö÷D6öæ7W'&VçDW'&÷'2ÒçVÆÃ²òòF†W6R&RW'&÷'2F†BvR&V6÷fW&VBg&öÒv—F†÷WB7W&f6–ærF†VÒFòF†RT’à¢òòvRv–ÆÂÆörF†VÒöæ6RF†RG&VR6öÖÖ—G2à ¢f"v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2ÒçVÆÃ²òòF†RÖ÷7B&V6VçBF–ÖRvR6öÖÖ—GFVBfÆÆ&6²âF†—2ÆWG2W2Vç7W&RG&–à¢òòÖöFVÂv†W&RvRFöâwB6öÖÖ—BæWrÆöF–ær7FFW2–âFöòV–6²7V66W76–öâà ¢f"vÆö&ÄÖ÷7E&V6VçDfÆÆ&6µF–ÖRÒ°¢f"dÄÄ$4µõD…$õEDÄUôÕ2ÒS²òòF†R'6öÇWFRF–ÖRf÷"v†VâvR6†÷VÆB7F'Bv—f–ærWöâ&VæFW&–æp¢òòÖ÷&RæB&VfW"5R7W7Vç6R†WW&—7F–72–ç7FVBà ¢f"v÷&´–å&öw&W75&ö÷E&VæFW%F&vWEF–ÖRÒ–æf–æ—G“²òò†÷rÆöær&VæFW"—27W÷6VBFòF¶R&Vf÷&RvR7F'BföÆÆ÷v–ær5P¢òò7W7Vç6R†WW&—7F–72æB÷B÷WBöb&VæFW&–ærÖ÷&R6öçFVçBà ¢f"$TäDU%õD”ÔTõUEôÕ2ÒS°¢f"v÷&´–å&öw&W75G&ç6—F–öç2ÒçVÆÃ° ¢gVæ7F–öâ&W6WE&VæFW%F–ÖW"‚’°¢v÷&´–å&öw&W75&ö÷E&VæFW%F&vWEF–ÖRÒæ÷r‚’²$TäDU%õD”ÔTõUEôÕ3°¢Ð ¢gVæ7F–öâvWE&VæFW%F&vWEF–ÖR‚’°¢&WGW&âv÷&´–å&öw&W75&ö÷E&VæFW%F&vWEF–ÖS°¢Ð¢f"†5Væ6Vv‡DW'&÷"ÒfÇ6S°¢f"f—'7EVæ6Vv‡DW'&÷"ÒçVÆÃ°¢f"ÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBÒçVÆÃ²òòöæÇ’W6VBv†VâVæ&ÆU&öf–ÆW$æW7FVEWFFU66†VGVÆVD†öö²—2G'VS°¢f"&ö÷DFöW4†fU76—fTVffV7G2ÒfÇ6S°¢f"&ö÷Ev—F…VæF–æu76—fTVffV7G2ÒçVÆÃ°¢f"VæF–æu76—fTVffV7G4ÆæW2ÒæôÆæW3°¢f"VæF–æu76—fU&öf–ÆW$VffV7G2ÒµÓ°¢f"VæF–æu76—fUG&ç6—F–öç2ÒçVÆÃ²òòW6RF†W6RFò&WfVçBâ–æf–æ—FRÆö÷öbæW7FVBWFFW0 ¢f"äU5DTEõUDDUôÄ”Ô•BÒS°¢f"æW7FVEWFFT6÷VçBÒ°¢f"&ö÷Ev—F„æW7FVEWFFW2ÒçVÆÃ°¢f"—4fÇW6†–æu76—fTVffV7G2ÒfÇ6S°¢f"F–E66†VGVÆUWFFTGW&–æu76—fTVffV7G2ÒfÇ6S°¢f"äU5DTEõ54•dUõUDDUôÄ”Ô•BÒS°¢f"æW7FVE76—fUWFFT6÷VçBÒ°¢f"&ö÷Ev—F…76—fTæW7FVEWFFW2ÒçVÆÃ²òò–bGvòWFFW2&R66†VGVÆVBv—F†–âF†R6ÖRWfVçBÂvR6†÷VÆBG&VBF†V— ¢òòWfVçBF–ÖW226–×VÇFæV÷W2ÂWfVâ–bF†R7GVÂ6Æö6²F–ÖR†2Gfæ6V@¢òò&WGvVVâF†Rf—'7BæB6V6öæB6ÆÂà ¢f"7W'&VçDWfVçEF–ÖRÒæõF–ÖW7F×°¢f"7W'&VçDWfVçEG&ç6—F–öäÆæRÒæôÆæW3°¢f"—5'Vææ–æt–ç6W'F–öäVffV7BÒfÇ6S°¢gVæ7F–öâvWEv÷&´–å&öw&W75&ö÷B‚’°¢&WGW&âv÷&´–å&öw&W75&ö÷C°¢Ð¢gVæ7F–öâ&WVW7DWfVçEF–ÖR‚’°¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÒæô6öçFW‡B’°¢òòvRw&R–ç6–FR&V7BÂ6ò—Bw2f–æRFò&VBF†R7GVÂF–ÖRà¢&WGW&âæ÷r‚“°¢ÒòòvRw&Ræ÷B–ç6–FR&V7BÂ6òvRÖ’&R–âF†RÖ–FFÆRöb'&÷w6W"WfVçBà  ¢–b†7W'&VçDWfVçEF–ÖRÓÒæõF–ÖW7F×’°¢òòW6RF†R6ÖR7F'BF–ÖRf÷"ÆÂWFFW2VçF–ÂvRVçFW"&V7Bv–âà¢&WGW&â7W'&VçDWfVçEF–ÖS°¢ÒòòF†—2—2F†Rf—'7BWFFR6–æ6R&V7B––VÆFVBâ6ö×WFRæWr7F'BF–ÖRà  ¢7W'&VçDWfVçEF–ÖRÒæ÷r‚“°¢&WGW&â7W'&VçDWfVçEF–ÖS°¢Ð¢gVæ7F–öâ&WVW7EWFFTÆæR†f–&W"’°¢òò7V6–Â66W0¢f"ÖöFRÒf–&W"æÖöFS° ¢–b‚†ÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢&WGW&â7–æ4ÆæS°¢ÒVÇ6R–b‚†W†V7WF–öä6öçFW‡Bb&VæFW$6öçFW‡B’ÓÒæô6öçFW‡Bbbv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÓÒæôÆæW2’°¢òòF†—2—2&VæFW"†6RWFFRâF†W6R&Ræ÷Böff–6–ÆÇ’7W÷'FVBâF†P¢òòöÆB&V†f–÷"—2Fòv—fRF†—2F†R6ÖR'F‡&VB"†ÆæW2’0¢òòv†FWfW"—27W'&VçFÇ’&VæFW&–ærâ6ò–b–÷R6ÆÂ6WE7FFVöâ6ö×öæVç@¢òòF†B†Vç2ÆFW"–âF†R6ÖR&VæFW"Â—Bv–ÆÂfÇW6‚â–FVÆÇ’ÂvRvçBFð¢òò&VÖ÷fRF†R7V6–Â66RæBG&VBF†VÒ2–bF†W’6ÖRg&öÒà¢òò–çFW&ÆVfVBWfVçBâ&Vv&FÆW72ÂF†—2GFW&â—2æ÷Böff–6–ÆÇ’7W÷'FVBà¢òòF†—2&V†f–÷"—2öæÇ’fÆÆ&6²âF†RfÆröæÇ’W†—7G2VçF–ÂvR6â&öÆÀ¢òò÷WBF†R6WE7FFRv&æ–ærÂ6–æ6RW†—7F–ær6öFRÖ–v‡B66–FVçFÆÇ’&VÇ’öà¢òòF†R7W'&VçB&V†f–÷"à¢&WGW&â–6´&&—G&'”ÆæR‡v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢Ð ¢f"—5G&ç6—F–öâÒ&WVW7D7W'&VçEG&ç6—F–öâ‚’ÓÒæõG&ç6—F–öã° ¢–b†—5G&ç6—F–öâ’°¢–b‚&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÓÒçVÆÂ’°¢f"G&ç6—F–öâÒ&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öã° ¢–b‚G&ç6—F–öâå÷WFFVDf–&W'2’°¢G&ç6—F–öâå÷WFFVDf–&W'2ÒæWr6WB‚“°¢Ð ¢G&ç6—F–öâå÷WFFVDf–&W'2æFB†f–&W"“°¢ÒòòF†RÆv÷&—F†Òf÷"76–væ–ærâWFFRFòÆæR6†÷VÆB&R7F&ÆRf÷"ÆÀ¢òòWFFW2BF†R6ÖR&–÷&—G’v—F†–âF†R6ÖRWfVçBâFòFòF†—2ÂF†P¢òò–çWG2FòF†RÆv÷&—F†Ò×W7B&RF†R6ÖRà¢òð¢òòF†RG&–6²vRW6R—2Fò66†RF†Rf—'7BöbV6‚öbF†W6R–çWG2v—F†–âà¢òòWfVçBâF†Vâ&W6WBF†R66†VBfÇVW2öæ6RvR6â&R7W&RF†RWfVçB—0¢òò÷fW"â÷W"†WW&—7F–2f÷"F†B—2v†VæWfW"vRVçFW"6öæ7W'&VçBv÷&²Æö÷à  ¢–b†7W'&VçDWfVçEG&ç6—F–öäÆæRÓÓÒæôÆæR’°¢òòÆÂG&ç6—F–öç2v—F†–âF†R6ÖRWfVçB&R76–væVBF†R6ÖRÆæRà¢7W'&VçDWfVçEG&ç6—F–öäÆæRÒ6Æ–ÔæW‡EG&ç6—F–öäÆæR‚“°¢Ð ¢&WGW&â7W'&VçDWfVçEG&ç6—F–öäÆæS°¢ÒòòWFFW2÷&–v–æF–ær–ç6–FR6W'F–â&V7BÖWF†öG2ÂÆ–¶RfÇW6…7–æ2Â†fP¢òòF†V—"&–÷&—G’6WB'’G&6¶–ær—Bv—F‚6öçFW‡Bf&–&ÆRà¢òð¢òòF†R÷VRG—R&WGW&æVB'’F†R†÷7B6öæf–r—2–çFW&æÆÇ’ÆæRÂ6òvR6à¢òòW6RF†BF—&V7FÇ’à¢òòDôDó¢Ö÷fRF†—2G—R6öçfW'6–öâFòF†RWfVçB&–÷&—G’ÖöGVÆRà  ¢f"WFFTÆæRÒvWD7W'&VçEWFFU&–÷&—G’‚“° ¢–b‡WFFTÆæRÓÒæôÆæR’°¢&WGW&âWFFTÆæS°¢ÒòòF†—2WFFR÷&–v–æFVB÷WG6–FR&V7Bâ6²F†R†÷7BVçf—&öæÖVçBf÷"à¢òò&÷&–FR&–÷&—G’Â&6VBöâF†RG—RöbWfVçBà¢òð¢òòF†R÷VRG—R&WGW&æVB'’F†R†÷7B6öæf–r—2–çFW&æÆÇ’ÆæRÂ6òvR6à¢òòW6RF†BF—&V7FÇ’à¢òòDôDó¢Ö÷fRF†—2G—R6öçfW'6–öâFòF†RWfVçB&–÷&—G’ÖöGVÆRà  ¢f"WfVçDÆæRÒvWD7W'&VçDWfVçE&–÷&—G’‚“°¢&WGW&âWfVçDÆæS°¢Ð ¢gVæ7F–öâ&WVW7E&WG'”ÆæR†f–&W"’°¢òòF†—2—2f÷&²öb&WVW7EWFFTÆæVFW6–væVB7V6–f–6ÆÇ’f÷"7W7Vç6P¢òò'&WG&–W2"(	B7V6–ÂWFFRF†BGFV×G2FòfÆ—7W7Vç6R&÷VæF'¢òòg&öÒ—G2Æ6V†öÆFW"7FFRFò—G2&–Ö'’÷&W6öÇfVB7FFRà¢òò7V6–Â66W0¢f"ÖöFRÒf–&W"æÖöFS° ¢–b‚†ÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFR’°¢&WGW&â7–æ4ÆæS°¢Ð ¢&WGW&â6Æ–ÔæW‡E&WG'”ÆæR‚“°¢Ð ¢gVæ7F–öâ66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"ÂÆæRÂWfVçEF–ÖR’°¢6†V6´f÷$æW7FVEWFFW2‚“° ¢°¢–b†—5'Vææ–æt–ç6W'F–öäVffV7B’°¢W'&÷"‚wW6T–ç6W'F–öäVffV7B×W7Bæ÷B66†VGVÆRWFFW2âr“°¢Ð¢Ð ¢°¢–b†—4fÇW6†–æu76—fTVffV7G2’°¢F–E66†VGVÆUWFFTGW&–æu76—fTVffV7G2ÒG'VS°¢Ð¢ÒòòÖ&²F†BF†R&ö÷B†2VæF–ærWFFRà  ¢Ö&µ&ö÷EWFFVB‡&ö÷BÂÆæRÂWfVçEF–ÖR“° ¢–b‚†W†V7WF–öä6öçFW‡Bb&VæFW$6öçFW‡B’ÓÒæôÆæW2bb&ö÷BÓÓÒv÷&´–å&öw&W75&ö÷B’°¢òòF†—2WFFRv2F—7F6†VBGW&–ærF†R&VæFW"†6RâF†—2—2Ö—7F¶P¢òò–bF†RWFFR÷&–v–æFW2g&öÒW6W"76R‡v—F‚F†RW†6WF–öâöbÆö6À¢òò†öö²WFFW2Âv†–6‚&R†æFÆVBF–ffW&VçFÇ’æBFöâwB&V6‚F†—0¢òògVæ7F–öâ’Â'WBF†W&R&R6öÖR–çFW&æÂ&V7BfVGW&W2F†BW6RF†—20¢òòâ–×ÆVÖVçFF–öâFWF–ÂÂÆ–¶R6VÆV7F—fR‡–G&F–öâà¢v&ä&÷WE&VæFW%†6UWFFW4–äDUb†f–&W"“²òòG&6²ÆæW2F†BvW&RWFFVBGW&–ærF†R&VæFW"†6P¢ÒVÇ6R°¢òòF†—2—2æ÷&ÖÂWFFRÂ66†VGVÆVBg&öÒ÷WG6–FRF†R&VæFW"†6Râf÷ ¢òòW†×ÆRÂGW&–ærâ–çWBWfVçBà¢°¢–b†—4FWeFööÇ5&W6VçB’°¢FDf–&W%FôÆæW4Ö‡&ö÷BÂf–&W"ÂÆæR“°¢Ð¢Ð ¢v&ä–eWFFW4æ÷Ew&VEv—F„7DDUb†f–&W"“° ¢–b‡&ö÷BÓÓÒv÷&´–å&öw&W75&ö÷B’°¢òò&V6V—fVBâWFFRFòG&VRF†Bw2–âF†RÖ–FFÆRöb&VæFW&–ærâÖ&°¢òòF†BF†W&Rv2â–çFW&ÆVfVBWFFRv÷&²öâF†—2&ö÷BâVæÆW72F†P¢òòFVfW%&VæFW%†6UWFFUFôæW‡D&F6†fÆr—2öfbæBF†—2—2&VæFW ¢òò†6RWFFRâ–âF†B66RÂvRFöâwBG&VB&VæFW"†6RWFFW22–`¢òòF†W’vW&R–çFW&ÆVfVBÂf÷"&6·v&G26ö×B&V6öç2à¢–b‚†W†V7WF–öä6öçFW‡Bb&VæFW$6öçFW‡B’ÓÓÒæô6öçFW‡B’°¢v÷&´–å&öw&W75&ö÷D–çFW&ÆVfVEWFFVDÆæW2ÒÖW&vTÆæW2‡v÷&´–å&öw&W75&ö÷D–çFW&ÆVfVEWFFVDÆæW2ÂÆæR“°¢Ð ¢–b‡v÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷E7W7VæFVEv—F„FVÆ’’°¢òòF†R&ö÷BÇ&VG’7W7VæFVBv—F‚FVÆ’Âv†–6‚ÖVç2F†—2&VæFW ¢òòFVf–æ—FVÇ’vöâwBf–æ—6‚â6–æ6RvR†fRæWrWFFRÂÆWBw2Ö&²—B0¢òò7W7VæFVBæ÷rÂ&–v‡B&Vf÷&RÖ&¶–ærF†R–æ6öÖ–ærWFFRâF†—2†2F†P¢òòVffV7Böb–çFW''WF–ærF†R7W'&VçB&VæFW"æB7v—F6†–ærFòF†RWFFRà¢òòDôDó¢Ö¶R7W&RF†—2FöW6âwB÷fW'&–FR–æw2F†B†Vâv†–ÆRvRwfP¢òòÇ&VG’7F'FVB&VæFW&–ærà¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢Ð¢Ð ¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂWfVçEF–ÖR“° ¢–b†ÆæRÓÓÒ7–æ4ÆæRbbW†V7WF–öä6öçFW‡BÓÓÒæô6öçFW‡Bbb†f–&W"æÖöFRb6öæ7W'&VçDÖöFR’ÓÓÒæôÖöFRbbòòG&VB7F2–b—Bw2–ç6–FR&F6†VEWFFW6ÂWfVâ–âÆVv7’ÖöFRà¢‚&V7D7W'&VçD7EVWVRCæ—4&F6†–ætÆVv7’’’°¢òòfÇW6‚F†R7–æ6‡&öæ÷W2v÷&²æ÷rÂVæÆW72vRw&RÇ&VG’v÷&¶–ær÷"–ç6–FP¢òò&F6‚âF†—2—2–çFVçF–öæÆÇ’–ç6–FR66†VGVÆUWFFTöäf–&W"–ç7FVBö`¢òò66†VGVÆT6ÆÆ&6´f÷$f–&W"Fò&W6W'fRF†R&–Æ—G’Fò66†VGVÆR6ÆÆ&6°¢òòv—F†÷WB–ÖÖVF–FVÇ’fÇW6†–ær—BâvRöæÇ’FòF†—2f÷"W6W"Ö–æ—F–FV@¢òòWFFW2ÂFò&W6W'fR†—7F÷&–6Â&V†f–÷"öbÆVv7’ÖöFRà¢&W6WE&VæFW%F–ÖW"‚“°¢fÇW6…7–æ46ÆÆ&6·4öæÇ”–äÆVv7”ÖöFR‚“°¢Ð¢Ð¢Ð¢gVæ7F–öâ66†VGVÆT–æ—F–Ä‡–G&F–öäöå&ö÷B‡&ö÷BÂÆæRÂWfVçEF–ÖR’°¢òòF†—2—27V6–Âf÷&²öb66†VGVÆUWFFTöäf–&W"F†B—2öæÇ’W6VBFð¢òò66†VGVÆRF†R–æ—F–Â‡–G&F–öâöb&ö÷BF†B†2§W7B&VVâ7&VFVBâÖ÷7@¢òòöbF†R7GVfb–â66†VGVÆUWFFTöäf–&W"6â&R6¶—VBà¢òð¢òòF†RÖ–â&V6öâf÷"F†—26W&FRF‚ÂF†÷Vv‚Â—2FòF—7F–æwV—6‚F†P¢òò–æ—F–Â6†–ÆG&Vâg&öÒ7V'6WVVçBWFFW2â–âgVÆÇ’6Æ–VçB×&VæFW&VB&ö÷G0¢òò†7&VFU&ö÷B–ç7FVBöb‡–G&FU&ö÷B’ÂÆÂF÷ÖÆWfVÂ&VæFW'2&RÖöFVÆVB0¢òòWFFW2Â'WB‡–G&F–öâ&ö÷G2&R7V6–Â&V6W6RF†R–æ—F–Â&VæFW"×W7@¢òòÖF6‚v†Bv2&VæFW&VBöâF†R6W'fW"à¢f"7W'&VçBÒ&ö÷Bæ7W'&VçC°¢7W'&VçBæÆæW2ÒÆæS°¢Ö&µ&ö÷EWFFVB‡&ö÷BÂÆæRÂWfVçEF–ÖR“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂWfVçEF–ÖR“°¢Ð¢gVæ7F–öâ—5Vç6fT6Æ75&VæFW%†6UWFFR†f–&W"’°¢òò6†V6²–bF†—2—2&VæFW"†6RWFFRâöæÇ’6ÆÆVB'’6Æ726ö×öæVçG2À¢òòv†–6‚7V6–Â†FW&V6FVB’&V†f–÷"f÷"Tå4dUö6ö×öæVçEv–ÆÅ&V6V—fR&÷2à¢&WGW&â‚òòDôDó¢&VÖ÷fR÷WFFFVBFVfW%&VæFW%†6UWFFUFôæW‡D&F6‚W‡W&–ÖVçBâvP¢òòFV6–FVBæ÷BFòVæ&ÆR—Bà¢†W†V7WF–öä6öçFW‡Bb&VæFW$6öçFW‡B’ÓÒæô6öçFW‡@¢“°¢ÒòòW6RF†—2gVæ7F–öâFò66†VGVÆRF6²f÷"&ö÷BâF†W&Rw2öæÇ’öæRF6²W ¢òò&ö÷C²–bF6²v2Ç&VG’66†VGVÆVBÂvRvÆÂ6†V6²FòÖ¶R7W&RF†R&–÷&—G¢òòöbF†RW†—7F–ærF6²—2F†R6ÖR2F†R&–÷&—G’öbF†RæW‡BÆWfVÂF†BF†P¢òò&ö÷B†2v÷&²öââF†—2gVæ7F–öâ—26ÆÆVBöâWfW'’WFFRÂæB&–v‡B&Vf÷&P¢òòW†—F–ærF6²à ¢gVæ7F–öâVç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂ7W'&VçEF–ÖR’°¢f"W†—7F–æt6ÆÆ&6´æöFRÒ&ö÷Bæ6ÆÆ&6´æöFS²òò6†V6²–bç’ÆæW2&R&V–ær7F'fVB'’÷F†W"v÷&²â–b6òÂÖ&²F†VÒ0¢òòW‡—&VB6òvR¶æ÷rFòv÷&²öâF†÷6RæW‡Bà ¢Ö&µ7F'fVDÆæW44W‡—&VB‡&ö÷BÂ7W'&VçEF–ÖR“²òòFWFW&Ö–æRF†RæW‡BÆæW2Fòv÷&²öâÂæBF†V—"&–÷&—G’à ¢f"æW‡DÆæW2ÒvWDæW‡DÆæW2‡&ö÷BÂ&ö÷BÓÓÒv÷&´–å&öw&W75&ö÷Bòv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2¢æôÆæW2“° ¢–b†æW‡DÆæW2ÓÓÒæôÆæW2’°¢òò7V6–Â66S¢F†W&Rw2æ÷F†–ærFòv÷&²öâà¢–b†W†—7F–æt6ÆÆ&6´æöFRÓÒçVÆÂ’°¢6æ6VÄ6ÆÆ&6²C†W†—7F–æt6ÆÆ&6´æöFR“°¢Ð ¢&ö÷Bæ6ÆÆ&6´æöFRÒçVÆÃ°¢&ö÷Bæ6ÆÆ&6µ&–÷&—G’ÒæôÆæS°¢&WGW&ã°¢ÒòòvRW6RF†R†–v†W7B&–÷&—G’ÆæRFò&W&W6VçBF†R&–÷&—G’öbF†R6ÆÆ&6²à  ¢f"æWt6ÆÆ&6µ&–÷&—G’ÒvWD†–v†W7E&–÷&—G”ÆæR†æW‡DÆæW2“²òò6†V6²–bF†W&Rw2âW†—7F–ærF6²âvRÖ’&R&ÆRFò&WW6R—Bà ¢f"W†—7F–æt6ÆÆ&6µ&–÷&—G’Ò&ö÷Bæ6ÆÆ&6µ&–÷&—G“° ¢–b†W†—7F–æt6ÆÆ&6µ&–÷&—G’ÓÓÒæWt6ÆÆ&6µ&–÷&—G’bbòò7V6–Â66R&VÆFVBFò7Fâ–bF†R7W'&VçFÇ’66†VGVÆVBF6²—2¢òò66†VGVÆW"F6²Â&F†W"F†ââ7FF6²Â6æ6VÂ—BæB&R×66†VGVÆV@¢òòöâF†R7FVWVRà¢‚&V7D7W'&VçD7EVWVRCæ7W'&VçBÓÒçVÆÂbbW†—7F–æt6ÆÆ&6´æöFRÓÒf¶T7D6ÆÆ&6´æöFR’’°¢°¢òò–bvRw&Rvö–ærFò&R×W6RâW†—7F–ærF6²Â—BæVVG2FòW†—7Bà¢òò77VÖRF†BF—67&WFRWFFRÖ–7&÷F6·2&RæöâÖ6æ6VÆÆ&ÆRæBçVÆÂà¢òòDôDó¢FV×÷&'’VçF–ÂvR6öæf—&ÒF†—2v&æ–ær—2æ÷Bf—&VBà¢–b†W†—7F–æt6ÆÆ&6´æöFRÓÒçVÆÂbbW†—7F–æt6ÆÆ&6µ&–÷&—G’ÓÒ7–æ4ÆæR’°¢W'&÷"‚tW‡V7FVB66†VGVÆVB6ÆÆ&6²FòW†—7BâF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð¢ÒòòF†R&–÷&—G’†6âwB6†ævVBâvR6â&WW6RF†RW†—7F–ærF6²âW†—Bà  ¢&WGW&ã°¢Ð ¢–b†W†—7F–æt6ÆÆ&6´æöFRÒçVÆÂ’°¢òò6æ6VÂF†RW†—7F–ær6ÆÆ&6²âvRvÆÂ66†VGVÆRæWröæR&VÆ÷rà¢6æ6VÄ6ÆÆ&6²C†W†—7F–æt6ÆÆ&6´æöFR“°¢Òòò66†VGVÆRæWr6ÆÆ&6²à  ¢f"æWt6ÆÆ&6´æöFS° ¢–b†æWt6ÆÆ&6µ&–÷&—G’ÓÓÒ7–æ4ÆæR’°¢òò7V6–Â66S¢7–æ2&V7B6ÆÆ&6·2&R66†VGVÆVBöâ7V6–À¢òò–çFW&æÂVWVP¢–b‡&ö÷BçFrÓÓÒÆVv7•&ö÷B’°¢–b‚&V7D7W'&VçD7EVWVRCæ—4&F6†–ætÆVv7’ÓÒçVÆÂ’°¢&V7D7W'&VçD7EVWVRCæF–E66†VGVÆTÆVv7•WFFRÒG'VS°¢Ð ¢66†VGVÆTÆVv7•7–æ46ÆÆ&6²‡W&f÷&Õ7–æ5v÷&´öå&ö÷Bæ&–æB†çVÆÂÂ&ö÷B’“°¢ÒVÇ6R°¢66†VGVÆU7–æ46ÆÆ&6²‡W&f÷&Õ7–æ5v÷&´öå&ö÷Bæ&–æB†çVÆÂÂ&ö÷B’“°¢Ð ¢°¢òòfÇW6‚F†RVWVR–âÖ–7&÷F6²à¢–b‚&V7D7W'&VçD7EVWVRCæ7W'&VçBÓÒçVÆÂ’°¢òò–ç6–FR7FÂW6R÷W"–çFW&æÂ7FVWVR6òF†BF†W6RvWBfÇW6†V@¢òòBF†RVæBöbF†R7W'&VçB66÷RWfVâv†VâW6–ærF†R7–æ2fW'6–öà¢òòöb7Fà¢&V7D7W'&VçD7EVWVRCæ7W'&VçBçW6‚†fÇW6…7–æ46ÆÆ&6·2“°¢ÒVÇ6R°¢66†VGVÆTÖ–7&÷F6²†gVæ7F–öâ‚’°¢òò–â6f&’ÂVæF–ærâ–g&ÖRf÷&6W2Ö–7&÷F6·2Fò'Vâà¢òò‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7Bö—77VW2ó##CS¢òòvRFöâwB7W÷'B'Vææ–ær6ÆÆ&6·2–âF†RÖ–FFÆRöb&VæFW ¢òò÷"6öÖÖ—B6òvRæVVBFò6†V6²v–ç7BF†Bà¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÓÒæô6öçFW‡B’°¢òòæ÷FRF†BF†—2v÷VÆB7F–ÆÂ&VÖGW&VÇ’fÇW6‚F†R6ÆÆ&6·0¢òò–bF†—2†Vç2÷WG6–FR&VæFW"÷"6öÖÖ—B†6R†Rærâ–ââWfVçB’à¢fÇW6…7–æ46ÆÆ&6·2‚“°¢Ð¢Ò“°¢Ð¢Ð ¢æWt6ÆÆ&6´æöFRÒçVÆÃ°¢ÒVÇ6R°¢f"66†VGVÆW%&–÷&—G”ÆWfVÃ° ¢7v—F6‚†ÆæW5FôWfVçE&–÷&—G’†æW‡DÆæW2’’°¢66RF—67&WFTWfVçE&–÷&—G“ ¢66†VGVÆW%&–÷&—G”ÆWfVÂÒ–ÖÖVF–FU&–÷&—G“°¢'&V³° ¢66R6öçF–çV÷W4WfVçE&–÷&—G“ ¢66†VGVÆW%&–÷&—G”ÆWfVÂÒW6W$&Æö6¶–æu&–÷&—G“°¢'&V³° ¢66RFVfVÇDWfVçE&–÷&—G“ ¢66†VGVÆW%&–÷&—G”ÆWfVÂÒæ÷&ÖÅ&–÷&—G“°¢'&V³° ¢66R–FÆTWfVçE&–÷&—G“ ¢66†VGVÆW%&–÷&—G”ÆWfVÂÒ–FÆU&–÷&—G“°¢'&V³° ¢FVfVÇC ¢66†VGVÆW%&–÷&—G”ÆWfVÂÒæ÷&ÖÅ&–÷&—G“°¢'&V³°¢Ð ¢æWt6ÆÆ&6´æöFRÒ66†VGVÆT6ÆÆ&6²C‡66†VGVÆW%&–÷&—G”ÆWfVÂÂW&f÷&Ô6öæ7W'&VçEv÷&´öå&ö÷Bæ&–æB†çVÆÂÂ&ö÷B’“°¢Ð ¢&ö÷Bæ6ÆÆ&6µ&–÷&—G’ÒæWt6ÆÆ&6µ&–÷&—G“°¢&ö÷Bæ6ÆÆ&6´æöFRÒæWt6ÆÆ&6´æöFS°¢ÒòòF†—2—2F†RVçG'’ö–çBf÷"WfW'’6öæ7W'&VçBF6²Â’æRâç—F†–ærF†@¢òòvöW2F‡&÷Vv‚66†VGVÆW"à  ¢gVæ7F–öâW&f÷&Ô6öæ7W'&VçEv÷&´öå&ö÷B‡&ö÷BÂF–EF–ÖV÷WB’°¢°¢&W6WDæW7FVEWFFTfÆr‚“°¢Òòò6–æ6RvR¶æ÷rvRw&R–â&V7BWfVçBÂvR6â6ÆV"F†R7W'&Vç@¢òòWfVçBF–ÖRâF†RæW‡BWFFRv–ÆÂ6ö×WFRæWrWfVçBF–ÖRà  ¢7W'&VçDWfVçEF–ÖRÒæõF–ÖW7F×°¢7W'&VçDWfVçEG&ç6—F–öäÆæRÒæôÆæW3° ¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÒæô6öçFW‡B’°¢F‡&÷ræWrW'&÷"‚u6†÷VÆBæ÷BÇ&VG’&Rv÷&¶–ærâr“°¢ÒòòfÇW6‚ç’VæF–ær76—fRVffV7G2&Vf÷&RFV6–F–ærv†–6‚ÆæW2Fòv÷&²öâÀ¢òò–â66RF†W’66†VGVÆRFF—F–öæÂv÷&²à  ¢f"÷&–v–æÄ6ÆÆ&6´æöFRÒ&ö÷Bæ6ÆÆ&6´æöFS°¢f"F–DfÇW6…76—fTVffV7G2ÒfÇW6…76—fTVffV7G2‚“° ¢–b†F–DfÇW6…76—fTVffV7G2’°¢òò6öÖWF†–ær–âF†R76—fRVffV7B†6RÖ’†fR6æ6VÆVBF†R7W'&VçBF6²à¢òò6†V6²–bF†RF6²æöFRf÷"F†—2&ö÷Bv26†ævVBà¢–b‡&ö÷Bæ6ÆÆ&6´æöFRÓÒ÷&–v–æÄ6ÆÆ&6´æöFR’°¢òòF†R7W'&VçBF6²v26æ6VÆVBâW†—BâvRFöâwBæVVBFò6ÆÀ¢òòVç7W&U&ö÷D—566†VGVÆVF&V6W6RF†R6†V6²&÷fR–×Æ–W2V—F†W"F†@¢òòF†W&Rw2æWrF6²Â÷"F†BF†W&Rw2æò&VÖ–æ–ærv÷&²öâF†—2&ö÷Bà¢&WGW&âçVÆÃ°¢Ð¢ÒòòFWFW&Ö–æRF†RæW‡BÆæW2Fòv÷&²öâÂW6–ærF†Rf–VÆG27F÷&V@¢òòöâF†R&ö÷Bà  ¢f"ÆæW2ÒvWDæW‡DÆæW2‡&ö÷BÂ&ö÷BÓÓÒv÷&´–å&öw&W75&ö÷Bòv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2¢æôÆæW2“° ¢–b†ÆæW2ÓÓÒæôÆæW2’°¢òòFVfVç6—fR6öF–ærâF†—2—2æWfW"W‡V7FVBFò†Vâà¢&WGW&âçVÆÃ°¢ÒòòvRF—6&ÆRF–ÖR×6Æ–6–ær–â6öÖR66W3¢–bF†Rv÷&²†2&VVâ5RÖ&÷Væ@¢òòf÷"FöòÆöær‚&W‡—&VB"v÷&²ÂFò&WfVçB7F'fF–öâ’Â÷"vRw&R–à¢òò7–æ2×WFFW2Ö'’ÖFVfVÇBÖöFRà¢òòDôDó¢vRöæÇ’6†V6²F–EF–ÖV÷WFFVfVç6—fVÇ’ÂFò66÷VçBf÷"66†VGVÆW ¢òò'VrvRw&R7F–ÆÂ–çfW7F–vF–ærâöæ6RF†R'Vr–â66†VGVÆW"—2f—†VBÀ¢òòvR6â&VÖ÷fRF†—2Â6–æ6RvRG&6²W‡—&F–öâ÷W'6VÇfW2à  ¢f"6†÷VÆEF–ÖU6Æ–6RÒ–æ6ÇVFW4&Æö6¶–ætÆæR‡&ö÷BÂÆæW2’bb–æ6ÇVFW4W‡—&VDÆæR‡&ö÷BÂÆæW2’bb‚F–EF–ÖV÷WB“°¢f"W†—E7FGW2Ò6†÷VÆEF–ÖU6Æ–6Rò&VæFW%&ö÷D6öæ7W'&VçB‡&ö÷BÂÆæW2’¢&VæFW%&ö÷E7–æ2‡&ö÷BÂÆæW2“° ¢–b†W†—E7FGW2ÓÒ&ö÷D–å&öw&W72’°¢–b†W†—E7FGW2ÓÓÒ&ö÷DW'&÷&VB’°¢òò–b6öÖWF†–ærF‡&WrâW'&÷"ÂG'’&VæFW&–æröæRÖ÷&RF–ÖRâvRvÆÀ¢òò&VæFW"7–æ6‡&öæ÷W6Ç’Fò&Æö6²6öæ7W'&VçBFF×WFF–öç2ÂæBvRvÆÀ¢òò–æ6ÇVFW2ÆÂVæF–ærWFFW2&R–æ6ÇVFVBâ–b—B7F–ÆÂf–Ç2gFW ¢òòF†R6V6öæBGFV×BÂvRvÆÂv—fRWæB6öÖÖ—BF†R&W7VÇF–ærG&VRà¢f"W'&÷%&WG'”ÆæW2ÒvWDÆæW5Fõ&WG'•7–æ6‡&öæ÷W6Ç”öäW'&÷"‡&ö÷B“° ¢–b†W'&÷%&WG'”ÆæW2ÓÒæôÆæW2’°¢ÆæW2ÒW'&÷%&WG'”ÆæW3°¢W†—E7FGW2Ò&V6÷fW$g&öÔ6öæ7W'&VçDW'&÷"‡&ö÷BÂW'&÷%&WG'”ÆæW2“°¢Ð¢Ð ¢–b†W†—E7FGW2ÓÓÒ&ö÷DfFÄW'&÷&VB’°¢f"fFÄW'&÷"Òv÷&´–å&öw&W75&ö÷DfFÄW'&÷#°¢&W&Tg&W6…7F6²‡&ö÷BÂæôÆæW2“°¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂÆæW2“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“°¢F‡&÷rfFÄW'&÷#°¢Ð ¢–b†W†—E7FGW2ÓÓÒ&ö÷DF–Dæ÷D6ö×ÆWFR’°¢òòF†R&VæFW"Vçv÷VæBv—F†÷WB6ö×ÆWF–ærF†RG&VRâF†—2†Vç2–â7V6–À¢òò66W2v†W&RæVVBFòW†—BF†R7W'&VçB&VæFW"v—F†÷WB&öGV6–ær¢òò6öç6—7FVçBG&VR÷"6öÖÖ—GF–ærà¢òð¢òòF†—26†÷VÆBöæÇ’†VâGW&–ær6öæ7W'&VçB&VæFW"Âæ÷BF—67&WFR÷ ¢òò7–æ6‡&öæ÷W2WFFRâvR6†÷VÆB†fRÇ&VG’6†V6¶VBf÷"F†—2v†VâvP¢òòVçv÷VæBF†R7F6²à¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂÆæW2“°¢ÒVÇ6R°¢òòF†R&VæFW"6ö×ÆWFVBà¢òò6†V6²–bF†—2&VæFW"Ö’†fR––VÆFVBFò6öæ7W'&VçBWfVçBÂæB–b6òÀ¢òò6öæf—&ÒF†Bç’æWvÇ’&VæFW&VB7F÷&W2&R6öç6—7FVçBà¢òòDôDó¢—Bw2÷76–&ÆRF†BWfVâ6öæ7W'&VçB&VæFW"Ö’æWfW"†fR––VÆFV@¢òòFòF†RÖ–âF‡&VBÂ–b—Bv2f7BVæ÷Vv‚Â÷"–b—BW‡—&VBâvR6÷VÆ@¢òò6¶—F†R6öç6—7FVæ7’6†V6²–âF†B66RÂFöòà¢f"&VæFW%v46öæ7W'&VçBÒ–æ6ÇVFW4&Æö6¶–ætÆæR‡&ö÷BÂÆæW2“°¢f"f–æ—6†VEv÷&²Ò&ö÷Bæ7W'&VçBæÇFW&æFS° ¢–b‡&VæFW%v46öæ7W'&VçBbb—5&VæFW$6öç6—7FVçEv—F„W‡FW&æÅ7F÷&W2†f–æ—6†VEv÷&²’’°¢òò7F÷&Rv2×WFFVB–ââ–çFW&ÆVfVBWfVçBâ&VæFW"v–âÀ¢òò7–æ6‡&öæ÷W6Ç’ÂFò&Æö6²gW'F†W"×WFF–öç2à¢W†—E7FGW2Ò&VæFW%&ö÷E7–æ2‡&ö÷BÂÆæW2“²òòvRæVVBFò6†V6²v–â–b6öÖWF†–ærF‡&Wp ¢–b†W†—E7FGW2ÓÓÒ&ö÷DW'&÷&VB’°¢f"öW'&÷%&WG'”ÆæW2ÒvWDÆæW5Fõ&WG'•7–æ6‡&öæ÷W6Ç”öäW'&÷"‡&ö÷B“° ¢–b…öW'&÷%&WG'”ÆæW2ÓÒæôÆæW2’°¢ÆæW2ÒöW'&÷%&WG'”ÆæW3°¢W†—E7FGW2Ò&V6÷fW$g&öÔ6öæ7W'&VçDW'&÷"‡&ö÷BÂöW'&÷%&WG'”ÆæW2“²òòvR77VÖRF†RG&VR—2æ÷r6öç6—7FVçB&V6W6RvRF–FâwB––VÆBFòç¢òò6öæ7W'&VçBWfVçG2à¢Ð¢Ð ¢–b†W†—E7FGW2ÓÓÒ&ö÷DfFÄW'&÷&VB’°¢f"öfFÄW'&÷"Òv÷&´–å&öw&W75&ö÷DfFÄW'&÷#°¢&W&Tg&W6…7F6²‡&ö÷BÂæôÆæW2“°¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂÆæW2“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“°¢F‡&÷röfFÄW'&÷#°¢Ð¢ÒòòvRæ÷r†fR6öç6—7FVçBG&VRâF†RæW‡B7FW—2V—F†W"Fò6öÖÖ—B—BÀ¢òò÷"Â–b6öÖWF†–ær7W7VæFVBÂv—BFò6öÖÖ—B—BgFW"F–ÖV÷WBà  ¢&ö÷Bæf–æ—6†VEv÷&²Òf–æ—6†VEv÷&³°¢&ö÷Bæf–æ—6†VDÆæW2ÒÆæW3°¢f–æ—6„6öæ7W'&VçE&VæFW"‡&ö÷BÂW†—E7FGW2ÂÆæW2“°¢Ð¢Ð ¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“° ¢–b‡&ö÷Bæ6ÆÆ&6´æöFRÓÓÒ÷&–v–æÄ6ÆÆ&6´æöFR’°¢òòF†RF6²æöFR66†VGVÆVBf÷"F†—2&ö÷B—2F†R6ÖRöæRF†Bw0¢òò7W'&VçFÇ’W†V7WFVBâæVVBFò&WGW&â6öçF–çVF–öâà¢&WGW&âW&f÷&Ô6öæ7W'&VçEv÷&´öå&ö÷Bæ&–æB†çVÆÂÂ&ö÷B“°¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâ&V6÷fW$g&öÔ6öæ7W'&VçDW'&÷"‡&ö÷BÂW'&÷%&WG'”ÆæW2’°¢òò–bâW'&÷"ö67W'&VBGW&–ær‡–G&F–öâÂF—66&B6W'fW"&W7öç6RæBfÆÀ¢òò&6²Fò6Æ–VçB6–FR&VæFW"à¢òò&Vf÷&R&VæFW&–ærv–âÂ6fRF†RW'&÷'2g&öÒF†R&Wf–÷W2GFV×Bà¢f"W'&÷'4g&öÔf—'7DGFV×BÒv÷&´–å&öw&W75&ö÷D6öæ7W'&VçDW'&÷'3° ¢–b†—5&ö÷DFV‡–G&FVB‡&ö÷B’’°¢òòF†R6†VÆÂf–ÆVBFò‡–G&FRâ6WBfÆrFòf÷&6R6Æ–VçB&VæFW&–æp¢òòGW&–ærF†RæW‡BGFV×BâFòFòF†—2ÂvR6ÆÂ&W&Tg&W6…7F6²æ÷p¢òòFò7&VFRF†R&ö÷Bv÷&²Ö–â×&öw&W72f–&W"âF†—2—2&—BvV—&B–âFW&×0¢òòöbf7F÷&–ærÂ&V6W6R—B&VÆ–W2öâ&VæFW%&ö÷E7–æ2æ÷B6ÆÆ–æp¢òò&W&Tg&W6…7F6²v–â–âF†R6ÆÂ&VÆ÷rÂv†–6‚†Vç2&V6W6RF†P¢òò&ö÷BæBÆæW2†fVâwB6†ævVBà¢òð¢òòDôDó¢’F†–æ²v†BvR6†÷VÆBFò—26WBf÷&6T6Æ–VçE&VæFW"–ç6–FP¢òòF‡&÷tW†6WF–öâÂÆ–¶RvRFòf÷"æW7FVB7W7Vç6R&÷VæF&–W2âF†R&V6öà¢òò—Bw2†W&R–ç7FVB—26òvR6â7v—F6‚FòF†R7–æ6‡&öæ÷W2v÷&²Æö÷ÂFöòà¢òò6öÖWF†–ærFò6öç6–FW"f÷"gWGW&R&Vf7F÷"à¢f"&ö÷Ev÷&´–å&öw&W72Ò&W&Tg&W6…7F6²‡&ö÷BÂW'&÷%&WG'”ÆæW2“°¢&ö÷Ev÷&´–å&öw&W72æfÆw2ÃÒf÷&6T6Æ–VçE&VæFW#° ¢°¢W'&÷$‡–G&F–æt6öçF–æW"‡&ö÷Bæ6öçF–æW$–æfò“°¢Ð¢Ð ¢f"W†—E7FGW2Ò&VæFW%&ö÷E7–æ2‡&ö÷BÂW'&÷%&WG'”ÆæW2“° ¢–b†W†—E7FGW2ÓÒ&ö÷DW'&÷&VB’°¢òò7V66W76gVÆÇ’f–æ—6†VB&VæFW&–æröâ&WG'¢òòF†RW'&÷'2g&öÒF†Rf–ÆVBf—'7BGFV×B†fR&VVâ&V6÷fW&VBâF@¢òòF†VÒFòF†R6öÆÆV7F–öâöb&V6÷fW&&ÆRW'&÷'2âvRvÆÂÆörF†VÒ–âF†P¢òò6öÖÖ—B†6Rà¢f"W'&÷'4g&öÕ6V6öæDGFV×BÒv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'3°¢v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2ÒW'&÷'4g&öÔf—'7DGFV×C²òòF†RW'&÷'2g&öÒF†R6V6öæBGFV×B6†÷VÆB&RVWVVBgFW"F†RW'&÷'0¢òòg&öÒF†Rf—'7BGFV×BÂFò&W6W'fRF†R6W6Â6WVVæ6Rà ¢–b†W'&÷'4g&öÕ6V6öæDGFV×BÓÒçVÆÂ’°¢VWVU&V6÷fW&&ÆTW'&÷'2†W'&÷'4g&öÕ6V6öæDGFV×B“°¢Ð¢Ð ¢&WGW&âW†—E7FGW3°¢Ð ¢gVæ7F–öâVWVU&V6÷fW&&ÆTW'&÷'2†W'&÷'2’°¢–b‡v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2ÓÓÒçVÆÂ’°¢v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2ÒW'&÷'3°¢ÒVÇ6R°¢v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2çW6‚æÇ’‡v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2ÂW'&÷'2“°¢Ð¢Ð ¢gVæ7F–öâf–æ—6„6öæ7W'&VçE&VæFW"‡&ö÷BÂW†—E7FGW2ÂÆæW2’°¢7v—F6‚†W†—E7FGW2’°¢66R&ö÷D–å&öw&W73 ¢66R&ö÷DfFÄW'&÷&VC ¢°¢F‡&÷ræWrW'&÷"‚u&ö÷BF–Bæ÷B6ö×ÆWFRâF†—2—2'Vr–â&V7Bâr“°¢Ð¢òòfÆ÷r¶æ÷w2&÷WB–çf&–çBÂ6ò—B6ö×Æ–ç2–b’FB'&V°¢òò7FFVÖVçBÂ'WBW6Æ–çBFöW6âwB¶æ÷r&÷WB–çf&–çBÂ6ò—B6ö×Æ–ç0¢òò–b’FòâW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæòÖfÆÇF‡&÷Vv€ ¢66R&ö÷DW'&÷&VC ¢°¢òòvR6†÷VÆB†fRÇ&VG’GFV×FVBFò&WG'’F†—2G&VRâ–bvR&V6†V@¢òòF†—2ö–çBÂ—BW'&÷&VBv–ââ6öÖÖ—B—Bà¢6öÖÖ—E&ö÷B‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2“°¢'&V³°¢Ð ¢66R&ö÷E7W7VæFVC ¢°¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂÆæW2“²òòvR†fRâ66WF&ÆRÆöF–ær7FFRâvRæVVBFòf–wW&R÷WB–bvP¢òò6†÷VÆB–ÖÖVF–FVÇ’6öÖÖ—B—B÷"v—B&—Bà ¢–b†–æ6ÇVFW4öæÇ•&WG&–W2†ÆæW2’bbòòFòæ÷BFVÆ’–bvRw&R–ç6–FRâ7B‚’66÷P¢6†÷VÆDf÷&6TfÇW6„fÆÆ&6·4–äDUb‚’’°¢òòF†—2&VæFW"öæÇ’–æ6ÇVFVB&WG&–W2ÂæòWFFW2âF‡&÷GFÆR6öÖÖ—GF–æp¢òò&WG&–W26òF†BvRFöâwB6†÷rFöòÖç’ÆöF–ær7FFW2FöòV–6¶Ç’à¢f"×5VçF–ÅF–ÖV÷WBÒvÆö&ÄÖ÷7E&V6VçDfÆÆ&6µF–ÖR²dÄÄ$4µõD…$õEDÄUôÕ2Òæ÷r‚“²òòFöâwB&÷F†W"v—F‚fW'’6†÷'B7W7Vç6RF–ÖRà ¢–b†×5VçF–ÅF–ÖV÷WBâ’°¢f"æW‡DÆæW2ÒvWDæW‡DÆæW2‡&ö÷BÂæôÆæW2“° ¢–b†æW‡DÆæW2ÓÒæôÆæW2’°¢òòF†W&Rw2FF—F–öæÂv÷&²öâF†—2&ö÷Bà¢'&V³°¢Ð ¢f"7W7VæFVDÆæW2Ò&ö÷Bç7W7VæFVDÆæW3° ¢–b‚—57V'6WDödÆæW2‡7W7VæFVDÆæW2ÂÆæW2’’°¢òòvR6†÷VÆB&VfW"Fò&VæFW"F†RfÆÆ&6²öbBF†RÆ7@¢òò7W7VæFVBÆWfVÂâ–ærF†RÆ7B7W7VæFVBÆWfVÂFòG'¢òò&VæFW&–ær—Bv–âà¢òòd•„ÔS¢v†B–bF†R7W7VæFVBÆæW2&R–FÆSò6†÷VÆBæ÷B&W7F'Bà¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢Ö&µ&ö÷E–ævVB‡&ö÷BÂ7W7VæFVDÆæW2“°¢'&V³°¢ÒòòF†R&VæFW"—27W7VæFVBÂ—B†6âwBF–ÖVB÷WBÂæBF†W&Rw2æð¢òòÆ÷vW"&–÷&—G’v÷&²FòFòâ–ç7FVBöb6öÖÖ—GF–ærF†RfÆÆ&6°¢òò–ÖÖVF–FVÇ’Âv—Bf÷"Ö÷&RFFFò'&—fRà  ¢&ö÷BçF–ÖV÷WD†æFÆRÒ66†VGVÆUF–ÖV÷WB†6öÖÖ—E&ö÷Bæ&–æB†çVÆÂÂ&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2’Â×5VçF–ÅF–ÖV÷WB“°¢'&V³°¢Ð¢ÒòòF†Rv÷&²W‡—&VBâ6öÖÖ—B–ÖÖVF–FVÇ’à  ¢6öÖÖ—E&ö÷B‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2“°¢'&V³°¢Ð ¢66R&ö÷E7W7VæFVEv—F„FVÆ“ ¢°¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂÆæW2“° ¢–b†–æ6ÇVFW4öæÇ•G&ç6—F–öç2†ÆæW2’’°¢òòF†—2—2G&ç6—F–öâÂ6òvR6†÷VÆBW†—Bv—F†÷WB6öÖÖ—GF–ær¢òòÆ6V†öÆFW"æBv—F†÷WB66†VGVÆ–ærF–ÖV÷WBâFVÆ’–æFVf–æ—FVÇ¢òòVçF–ÂvR&V6V—fRÖ÷&RFFà¢'&V³°¢Ð ¢–b‚6†÷VÆDf÷&6TfÇW6„fÆÆ&6·4–äDUb‚’’°¢òòF†—2—2æ÷BG&ç6—F–öâÂ'WBvRF–BG&–vvW"âfö–FVB7FFRà¢òò66†VGVÆRÆ6V†öÆFW"FòF—7Æ’gFW"6†÷'BFVÆ’ÂW6–ærF†R§W7@¢òòæ÷F–6V&ÆRF–ffW&Væ6Rà¢òòDôDó¢—2F†R¤äB÷F–Ö—¦F–öâv÷'F‚F†RFFVB6ö×ÆW†—G“ò–bF†—2—0¢òòF†RöæÇ’&V6öâvRG&6²F†RWfVçBF–ÖRÂF†Vâ&ö&&Ç’æ÷Bà¢òò6öç6–FW"&VÖ÷f–ærà¢f"Ö÷7E&V6VçDWfVçEF–ÖRÒvWDÖ÷7E&V6VçDWfVçEF–ÖR‡&ö÷BÂÆæW2“°¢f"WfVçEF–ÖT×2ÒÖ÷7E&V6VçDWfVçEF–ÖS°¢f"F–ÖTVÆ6VD×2Òæ÷r‚’ÒWfVçEF–ÖT×3° ¢f"ö×5VçF–ÅF–ÖV÷WBÒ¦æB‡F–ÖTVÆ6VD×2’ÒF–ÖTVÆ6VD×3²òòFöâwB&÷F†W"v—F‚fW'’6†÷'B7W7Vç6RF–ÖRà  ¢–b…ö×5VçF–ÅF–ÖV÷WBâ’°¢òò–ç7FVBöb6öÖÖ—GF–ærF†RfÆÆ&6²–ÖÖVF–FVÇ’Âv—Bf÷"Ö÷&RFF¢òòFò'&—fRà¢&ö÷BçF–ÖV÷WD†æFÆRÒ66†VGVÆUF–ÖV÷WB†6öÖÖ—E&ö÷Bæ&–æB†çVÆÂÂ&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2’Âö×5VçF–ÅF–ÖV÷WB“°¢'&V³°¢Ð¢Òòò6öÖÖ—BF†RÆ6V†öÆFW"à  ¢6öÖÖ—E&ö÷B‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2“°¢'&V³°¢Ð ¢66R&ö÷D6ö×ÆWFVC ¢°¢òòF†Rv÷&²6ö×ÆWFVBâ&VG’Fò6öÖÖ—Bà¢6öÖÖ—E&ö÷B‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2“°¢'&V³°¢Ð ¢FVfVÇC ¢°¢F‡&÷ræWrW'&÷"‚uVæ¶æ÷vâ&ö÷BW†—B7FGW2âr“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ—5&VæFW$6öç6—7FVçEv—F„W‡FW&æÅ7F÷&W2†f–æ—6†VEv÷&²’°¢òò6V&6‚F†R&VæFW&VBG&VRf÷"W‡FW&æÂ7F÷&R&VG2ÂæB6†V6²v†WF†W"F†P¢òò7F÷&W2vW&R×WFFVB–â6öæ7W'&VçBWfVçBâ–çFVçF–öæÆÇ’W6–ærâ—FW&F—fP¢òòÆö÷–ç7FVBöb&V7W'6–öâ6òvR6âW†—BV&Ç’à¢f"æöFRÒf–æ—6†VEv÷&³° ¢v†–ÆR‡G'VR’°¢–b†æöFRæfÆw2b7F÷&T6öç6—7FVæ7’’°¢f"WFFUVWVRÒæöFRçWFFUVWVS° ¢–b‡WFFUVWVRÓÒçVÆÂ’°¢f"6†V6·2ÒWFFUVWVRç7F÷&W3° ¢–b†6†V6·2ÓÒçVÆÂ’°¢f÷"‡f"’Ò²’Â6†V6·2æÆVæwFƒ²’²²’°¢f"6†V6²Ò6†V6·5¶•Ó°¢f"vWE6æ6†÷BÒ6†V6²ævWE6æ6†÷C°¢f"&VæFW&VEfÇVRÒ6†V6²çfÇVS° ¢G'’°¢–b‚ö&¦V7D—2†vWE6æ6†÷B‚’Â&VæFW&VEfÇVR’’°¢òòf÷VæBâ–æ6öç6—7FVçB7F÷&Rà¢&WGW&âfÇ6S°¢Ð¢Ò6F6‚†W'&÷"’°¢òò–bvWE6æ6†÷FF‡&÷w2Â&WGW&âfÇ6VâF†—2v–ÆÂ66†VGVÆP¢òò&R×&VæFW"ÂæBF†RW'&÷"v–ÆÂ&R&WF‡&÷vâGW&–ær&VæFW"à¢&WGW&âfÇ6S°¢Ð¢Ð¢Ð¢Ð¢Ð ¢f"6†–ÆBÒæöFRæ6†–ÆC° ¢–b†æöFRç7V'G&VTfÆw2b7F÷&T6öç6—7FVæ7’bb6†–ÆBÓÒçVÆÂ’°¢6†–ÆBç&WGW&âÒæöFS°¢æöFRÒ6†–ÆC°¢6öçF–çVS°¢Ð ¢–b†æöFRÓÓÒf–æ—6†VEv÷&²’°¢&WGW&âG'VS°¢Ð ¢v†–ÆR†æöFRç6–&Æ–ærÓÓÒçVÆÂ’°¢–b†æöFRç&WGW&âÓÓÒçVÆÂÇÂæöFRç&WGW&âÓÓÒf–æ—6†VEv÷&²’°¢&WGW&âG'VS°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð ¢æöFRç6–&Æ–ærç&WGW&âÒæöFRç&WGW&ã°¢æöFRÒæöFRç6–&Æ–æs°¢ÒòòfÆ÷rFöW6âwB¶æ÷rF†—2—2Vç&V6†&ÆRÂ'WBW6Æ–çBFöW0¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæò×Vç&V6†&ÆP  ¢&WGW&âG'VS°¢Ð ¢gVæ7F–öâÖ&µ&ö÷E7W7VæFVBC‡&ö÷BÂ7W7VæFVDÆæW2’°¢òòv†Vâ7W7VæF–ærÂvR6†÷VÆBÇv—2W†6ÇVFRÆæW2F†BvW&R–ævVB÷"†Ö÷&P¢òò&&VÇ’Â6–æ6RvRG'’Fòfö–B—B’WFFVBGW&–ærF†R&VæFW"†6Rà¢òòDôDó¢ÆöÂÖ–&RF†W&Rw2&WGFW"v’Fòf7F÷"F†—2&W6–FW2F†—0¢òòö&æ÷†–÷W6Ç’æÖVBgVæ7F–öâ¢¢7W7VæFVDÆæW2Ò&VÖ÷fTÆæW2‡7W7VæFVDÆæW2Âv÷&´–å&öw&W75&ö÷E–ævVDÆæW2“°¢7W7VæFVDÆæW2Ò&VÖ÷fTÆæW2‡7W7VæFVDÆæW2Âv÷&´–å&öw&W75&ö÷D–çFW&ÆVfVEWFFVDÆæW2“°¢Ö&µ&ö÷E7W7VæFVB‡&ö÷BÂ7W7VæFVDÆæW2“°¢ÒòòF†—2—2F†RVçG'’ö–çBf÷"7–æ6‡&öæ÷W2F6·2F†BFöâwBvð¢òòF‡&÷Vv‚66†VGVÆW   ¢gVæ7F–öâW&f÷&Õ7–æ5v÷&´öå&ö÷B‡&ö÷B’°¢°¢7–æ4æW7FVEWFFTfÆr‚“°¢Ð ¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÒæô6öçFW‡B’°¢F‡&÷ræWrW'&÷"‚u6†÷VÆBæ÷BÇ&VG’&Rv÷&¶–ærâr“°¢Ð ¢fÇW6…76—fTVffV7G2‚“°¢f"ÆæW2ÒvWDæW‡DÆæW2‡&ö÷BÂæôÆæW2“° ¢–b‚–æ6ÇVFW56öÖTÆæR†ÆæW2Â7–æ4ÆæR’’°¢òòF†W&Rw2æò&VÖ–æ–ær7–æ2v÷&²ÆVgBà¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“°¢&WGW&âçVÆÃ°¢Ð ¢f"W†—E7FGW2Ò&VæFW%&ö÷E7–æ2‡&ö÷BÂÆæW2“° ¢–b‡&ö÷BçFrÓÒÆVv7•&ö÷BbbW†—E7FGW2ÓÓÒ&ö÷DW'&÷&VB’°¢òò–b6öÖWF†–ærF‡&WrâW'&÷"ÂG'’&VæFW&–æröæRÖ÷&RF–ÖRâvRvÆÂ&VæFW ¢òò7–æ6‡&öæ÷W6Ç’Fò&Æö6²6öæ7W'&VçBFF×WFF–öç2ÂæBvRvÆÂ–æ6ÇVFW0¢òòÆÂVæF–ærWFFW2&R–æ6ÇVFVBâ–b—B7F–ÆÂf–Ç2gFW"F†R6V6öæ@¢òòGFV×BÂvRvÆÂv—fRWæB6öÖÖ—BF†R&W7VÇF–ærG&VRà¢f"W'&÷%&WG'”ÆæW2ÒvWDÆæW5Fõ&WG'•7–æ6‡&öæ÷W6Ç”öäW'&÷"‡&ö÷B“° ¢–b†W'&÷%&WG'”ÆæW2ÓÒæôÆæW2’°¢ÆæW2ÒW'&÷%&WG'”ÆæW3°¢W†—E7FGW2Ò&V6÷fW$g&öÔ6öæ7W'&VçDW'&÷"‡&ö÷BÂW'&÷%&WG'”ÆæW2“°¢Ð¢Ð ¢–b†W†—E7FGW2ÓÓÒ&ö÷DfFÄW'&÷&VB’°¢f"fFÄW'&÷"Òv÷&´–å&öw&W75&ö÷DfFÄW'&÷#°¢&W&Tg&W6…7F6²‡&ö÷BÂæôÆæW2“°¢Ö&µ&ö÷E7W7VæFVBC‡&ö÷BÂÆæW2“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“°¢F‡&÷rfFÄW'&÷#°¢Ð ¢–b†W†—E7FGW2ÓÓÒ&ö÷DF–Dæ÷D6ö×ÆWFR’°¢F‡&÷ræWrW'&÷"‚u&ö÷BF–Bæ÷B6ö×ÆWFRâF†—2—2'Vr–â&V7Bâr“°¢ÒòòvRæ÷r†fR6öç6—7FVçBG&VRâ&V6W6RF†—2—27–æ2&VæFW"ÂvP¢òòv–ÆÂ6öÖÖ—B—BWfVâ–b6öÖWF†–ær7W7VæFVBà  ¢f"f–æ—6†VEv÷&²Ò&ö÷Bæ7W'&VçBæÇFW&æFS°¢&ö÷Bæf–æ—6†VEv÷&²Òf–æ—6†VEv÷&³°¢&ö÷Bæf–æ—6†VDÆæW2ÒÆæW3°¢6öÖÖ—E&ö÷B‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2Âv÷&´–å&öw&W75G&ç6—F–öç2“²òò&Vf÷&RW†—F–ærÂÖ¶R7W&RF†W&Rw26ÆÆ&6²66†VGVÆVBf÷"F†RæW‡@¢òòVæF–ærÆWfVÂà ¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“°¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâfÇW6…&ö÷B‡&ö÷BÂÆæW2’°¢–b†ÆæW2ÓÒæôÆæW2’°¢Ö&µ&ö÷DVçFævÆVB‡&ö÷BÂÖW&vTÆæW2†ÆæW2Â7–æ4ÆæR’“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“° ¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÓÒæô6öçFW‡B’°¢&W6WE&VæFW%F–ÖW"‚“°¢fÇW6…7–æ46ÆÆ&6·2‚“°¢Ð¢Ð¢Ð¢gVæ7F–öâ&F6†VEWFFW2C†fâÂ’°¢f"&WdW†V7WF–öä6öçFW‡BÒW†V7WF–öä6öçFW‡C°¢W†V7WF–öä6öçFW‡BÃÒ&F6†VD6öçFW‡C° ¢G'’°¢&WGW&âfâ†“°¢Òf–æÆÇ’°¢W†V7WF–öä6öçFW‡BÒ&WdW†V7WF–öä6öçFW‡C²òò–bF†W&RvW&RÆVv7’7–æ2WFFW2ÂfÇW6‚F†VÒBF†RVæBöbF†R÷WFW ¢òòÖ÷7B&F6†VEWFFW2ÖÆ–¶RÖWF†öBà ¢–b†W†V7WF–öä6öçFW‡BÓÓÒæô6öçFW‡BbbòòG&VB7F2–b—Bw2–ç6–FR&F6†VEWFFW6ÂWfVâ–âÆVv7’ÖöFRà¢‚&V7D7W'&VçD7EVWVRCæ—4&F6†–ætÆVv7’’’°¢&W6WE&VæFW%F–ÖW"‚“°¢fÇW6…7–æ46ÆÆ&6·4öæÇ”–äÆVv7”ÖöFR‚“°¢Ð¢Ð¢Ð¢gVæ7F–öâF—67&WFUWFFW2†fâÂÂ"Â2ÂB’°¢f"&Wf–÷W5&–÷&—G’ÒvWD7W'&VçEWFFU&–÷&—G’‚“°¢f"&WeG&ç6—F–öâÒ&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öã° ¢G'’°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒçVÆÃ°¢6WD7W'&VçEWFFU&–÷&—G’„F—67&WFTWfVçE&–÷&—G’“°¢&WGW&âfâ†Â"Â2ÂB“°¢Òf–æÆÇ’°¢6WD7W'&VçEWFFU&–÷&—G’‡&Wf–÷W5&–÷&—G’“°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒ&WeG&ç6—F–öã° ¢–b†W†V7WF–öä6öçFW‡BÓÓÒæô6öçFW‡B’°¢&W6WE&VæFW%F–ÖW"‚“°¢Ð¢Ð¢Òòò÷fW&ÆöBF†RFVf–æ—F–öâFòF†RGvòfÆ–B6–væGW&W2à¢òòv&æ–ærÂF†—2÷G2Ö÷WBöb6†V6¶–ærF†RgVæ7F–öâ&öG’à ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæò×&VFV6Æ&P¢gVæ7F–öâfÇW6…7–æ2†fâ’°¢òò–âÆVv7’ÖöFRÂvRfÇW6‚VæF–ær76—fRVffV7G2BF†R&Vv–ææ–æröbF†P¢òòæW‡BWfVçBÂæ÷BBF†RVæBöbF†R&Wf–÷W2öæRà¢–b‡&ö÷Ev—F…VæF–æu76—fTVffV7G2ÓÒçVÆÂbb&ö÷Ev—F…VæF–æu76—fTVffV7G2çFrÓÓÒÆVv7•&ö÷Bbb†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÓÒæô6öçFW‡B’°¢fÇW6…76—fTVffV7G2‚“°¢Ð ¢f"&WdW†V7WF–öä6öçFW‡BÒW†V7WF–öä6öçFW‡C°¢W†V7WF–öä6öçFW‡BÃÒ&F6†VD6öçFW‡C°¢f"&WeG&ç6—F–öâÒ&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öã°¢f"&Wf–÷W5&–÷&—G’ÒvWD7W'&VçEWFFU&–÷&—G’‚“° ¢G'’°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒçVÆÃ°¢6WD7W'&VçEWFFU&–÷&—G’„F—67&WFTWfVçE&–÷&—G’“° ¢–b†fâ’°¢&WGW&âfâ‚“°¢ÒVÇ6R°¢&WGW&âVæFVf–æVC°¢Ð¢Òf–æÆÇ’°¢6WD7W'&VçEWFFU&–÷&—G’‡&Wf–÷W5&–÷&—G’“°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒ&WeG&ç6—F–öã°¢W†V7WF–öä6öçFW‡BÒ&WdW†V7WF–öä6öçFW‡C²òòfÇW6‚F†R–ÖÖVF–FR6ÆÆ&6·2F†BvW&R66†VGVÆVBGW&–ærF†—2&F6‚à¢òòæ÷FRF†BF†—2v–ÆÂ†VâWfVâ–b&F6†VEWFFW2—2†–v†W"W ¢òòF†R7F6²à ¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÓÒæô6öçFW‡B’°¢fÇW6…7–æ46ÆÆ&6·2‚“°¢Ð¢Ð¢Ð¢gVæ7F–öâ—4Ç&VG•&VæFW&–ær‚’°¢òòW6VB'’F†R&VæFW&W"Fò&–çBv&æ–ær–b6W'F–â—2&R6ÆÆVBg&öÐ¢òòF†Rw&öær6öçFW‡Bà¢&WGW&â†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÒæô6öçFW‡C°¢Ð¢gVæ7F–öâW6…&VæFW$ÆæW2†f–&W"ÂÆæW2’°¢W6‚‡7V'G&VU&VæFW$ÆæW47W'6÷"Â7V'G&VU&VæFW$ÆæW2Âf–&W"“°¢7V'G&VU&VæFW$ÆæW2ÒÖW&vTÆæW2‡7V'G&VU&VæFW$ÆæW2ÂÆæW2“°¢v÷&´–å&öw&W75&ö÷D–æ6ÇVFVDÆæW2ÒÖW&vTÆæW2‡v÷&´–å&öw&W75&ö÷D–æ6ÇVFVDÆæW2ÂÆæW2“°¢Ð¢gVæ7F–öâ÷&VæFW$ÆæW2†f–&W"’°¢7V'G&VU&VæFW$ÆæW2Ò7V'G&VU&VæFW$ÆæW47W'6÷"æ7W'&VçC°¢÷‡7V'G&VU&VæFW$ÆæW47W'6÷"Âf–&W"“°¢Ð ¢gVæ7F–öâ&W&Tg&W6…7F6²‡&ö÷BÂÆæW2’°¢&ö÷Bæf–æ—6†VEv÷&²ÒçVÆÃ°¢&ö÷Bæf–æ—6†VDÆæW2ÒæôÆæW3°¢f"F–ÖV÷WD†æFÆRÒ&ö÷BçF–ÖV÷WD†æFÆS° ¢–b‡F–ÖV÷WD†æFÆRÓÒæõF–ÖV÷WB’°¢òòF†R&ö÷B&Wf–÷W27W7VæFVBæB66†VGVÆVBF–ÖV÷WBFò6öÖÖ—BfÆÆ&6°¢òò7FFRâæ÷rF†BvR†fRFF—F–öæÂv÷&²Â6æ6VÂF†RF–ÖV÷WBà¢&ö÷BçF–ÖV÷WD†æFÆRÒæõF–ÖV÷WC²òòDfÆ÷tf—„ÖR6ö×Æ–ç2æõF–ÖV÷WB—2æ÷BF–ÖV÷WD”BÂFW7—FRF†R6†V6²&÷fP ¢6æ6VÅF–ÖV÷WB‡F–ÖV÷WD†æFÆR“°¢Ð ¢–b‡v÷&´–å&öw&W72ÓÒçVÆÂ’°¢f"–çFW''WFVEv÷&²Òv÷&´–å&öw&W72ç&WGW&ã° ¢v†–ÆR†–çFW''WFVEv÷&²ÓÒçVÆÂ’°¢f"7W'&VçBÒ–çFW''WFVEv÷&²æÇFW&æFS°¢Vçv–æD–çFW''WFVEv÷&²†7W'&VçBÂ–çFW''WFVEv÷&²“°¢–çFW''WFVEv÷&²Ò–çFW''WFVEv÷&²ç&WGW&ã°¢Ð¢Ð ¢v÷&´–å&öw&W75&ö÷BÒ&ö÷C°¢f"&ö÷Ev÷&´–å&öw&W72Ò7&VFUv÷&´–å&öw&W72‡&ö÷Bæ7W'&VçBÂçVÆÂ“°¢v÷&´–å&öw&W72Ò&ö÷Ev÷&´–å&öw&W73°¢v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2Ò7V'G&VU&VæFW$ÆæW2Òv÷&´–å&öw&W75&ö÷D–æ6ÇVFVDÆæW2ÒÆæW3°¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷D–å&öw&W73°¢v÷&´–å&öw&W75&ö÷DfFÄW'&÷"ÒçVÆÃ°¢v÷&´–å&öw&W75&ö÷E6¶—VDÆæW2ÒæôÆæW3°¢v÷&´–å&öw&W75&ö÷D–çFW&ÆVfVEWFFVDÆæW2ÒæôÆæW3°¢v÷&´–å&öw&W75&ö÷E–ævVDÆæW2ÒæôÆæW3°¢v÷&´–å&öw&W75&ö÷D6öæ7W'&VçDW'&÷'2ÒçVÆÃ°¢v÷&´–å&öw&W75&ö÷E&V6÷fW&&ÆTW'&÷'2ÒçVÆÃ°¢f–æ—6…VWVV–æt6öæ7W'&VçEWFFW2‚“° ¢°¢&V7E7G&–7DÖöFUv&æ–æw2æF—66&EVæF–æuv&æ–æw2‚“°¢Ð ¢&WGW&â&ö÷Ev÷&´–å&öw&W73°¢Ð ¢gVæ7F–öâ†æFÆTW'&÷"‡&ö÷BÂF‡&÷våfÇVR’°¢Fò°¢f"W'&÷&VEv÷&²Òv÷&´–å&öw&W73° ¢G'’°¢òò&W6WBÖöGVÆRÖÆWfVÂ7FFRF†Bv26WBGW&–ærF†R&VæFW"†6Rà¢&W6WD6öçFW‡DFWVæFVæ6–W2‚“°¢&W6WD†öö·4gFW%F‡&÷r‚“°¢&W6WD7W'&VçDf–&W"‚“²òòDôDó¢’f÷VæBæBFFVBF†—2Ö—76–ærÆ–æRv†–ÆR–çfW7F–vF–ær¢òò6W&FR—77VRâw&—FR&Vw&W76–öâFW7BW6–ær7G&–ær&Vg2à ¢&V7D7W'&VçD÷væW"C"æ7W'&VçBÒçVÆÃ° ¢–b†W'&÷&VEv÷&²ÓÓÒçVÆÂÇÂW'&÷&VEv÷&²ç&WGW&âÓÓÒçVÆÂ’°¢òòW‡V7FVBFò&Rv÷&¶–æröâæöâ×&ö÷Bf–&W"âF†—2—2fFÂW'&÷ ¢òò&V6W6RF†W&Rw2æòæ6W7F÷"F†B6â†æFÆR—C²F†R&ö÷B—0¢òò7W÷6VBFò6GW&RÆÂW'&÷'2F†BvW&VâwB6Vv‡B'’âW'&÷ ¢òò&÷VæF'’à¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷DfFÄW'&÷&VC°¢v÷&´–å&öw&W75&ö÷DfFÄW'&÷"ÒF‡&÷våfÇVS²òò6WBv÷&´–å&öw&W76FòçVÆÂâF†—2&W&W6VçG2Gfæ6–ærFòF†RæW‡@¢òò6–&Æ–ærÂ÷"F†R&VçB–bF†W&R&Ræò6–&Æ–æw2â'WB6–æ6RF†R&ö÷@¢òò†2æò6–&Æ–æw2æ÷"&VçBÂvR6WB—BFòçVÆÂâW7VÆÇ’F†—2—0¢òò†æFÆVB'’6ö×ÆWFUVæ—Döev÷&¶÷"Vçv–æEv÷&¶Â'WB6–æ6RvRw&P¢òò–çFVçF–öæÆÇ’æ÷B6ÆÆ–ærF†÷6RÂvRæVVB6WB—B†W&Rà¢òòDôDó¢6öç6–FW"6ÆÆ–ærVçv–æEv÷&¶Fò÷F†R6öçFW‡G2à ¢v÷&´–å&öw&W72ÒçVÆÃ°¢&WGW&ã°¢Ð ¢–b†Væ&ÆU&öf–ÆW%F–ÖW"bbW'&÷&VEv÷&²æÖöFRb&öf–ÆTÖöFR’°¢òò&V6÷&BF†RF–ÖR7VçB&VæFW&–ær&Vf÷&RâW'&÷"v2F‡&÷vââF†—0¢òòfö–G2–æ67W&FR&öf–ÆW"GW&F–öç2–âF†R66Röb¢òò7W7VæFVB&VæFW"à¢7F÷&öf–ÆW%F–ÖW$–e'Vææ–ætæE&V6÷&DFVÇF†W'&÷&VEv÷&²ÂG'VR“°¢Ð ¢–b†Væ&ÆU66†VGVÆ–æu&öf–ÆW"’°¢Ö&´6ö×öæVçE&VæFW%7F÷VB‚“° ¢–b‡F‡&÷våfÇVRÓÒçVÆÂbbG—VöbF‡&÷våfÇVRÓÓÒvö&¦V7BrbbG—VöbF‡&÷våfÇVRçF†VâÓÓÒvgVæ7F–öâr’°¢f"v¶V&ÆRÒF‡&÷våfÇVS°¢Ö&´6ö×öæVçE7W7VæFVB†W'&÷&VEv÷&²Âv¶V&ÆRÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢ÒVÇ6R°¢Ö&´6ö×öæVçDW'&÷&VB†W'&÷&VEv÷&²ÂF‡&÷våfÇVRÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢Ð¢Ð ¢F‡&÷tW†6WF–öâ‡&ö÷BÂW'&÷&VEv÷&²ç&WGW&âÂW'&÷&VEv÷&²ÂF‡&÷våfÇVRÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢6ö×ÆWFUVæ—Döev÷&²†W'&÷&VEv÷&²“°¢Ò6F6‚‡–WDæ÷F†W%F‡&÷våfÇVR’°¢òò6öÖWF†–ær–âF†R&WGW&âF‚Ç6òF‡&Wrà¢F‡&÷våfÇVRÒ–WDæ÷F†W%F‡&÷våfÇVS° ¢–b‡v÷&´–å&öw&W72ÓÓÒW'&÷&VEv÷&²bbW'&÷&VEv÷&²ÓÒçVÆÂ’°¢òò–bF†—2&÷VæF'’†2Ç&VG’W'&÷&VBÂF†VâvR†BG&÷V&ÆR&ö6W76–æp¢òòF†RW'&÷"â'V&&ÆR—BFòF†RæW‡B&÷VæF'’à¢W'&÷&VEv÷&²ÒW'&÷&VEv÷&²ç&WGW&ã°¢v÷&´–å&öw&W72ÒW'&÷&VEv÷&³°¢ÒVÇ6R°¢W'&÷&VEv÷&²Òv÷&´–å&öw&W73°¢Ð ¢6öçF–çVS°¢Òòò&WGW&âFòF†Ræ÷&ÖÂv÷&²Æö÷à  ¢&WGW&ã°¢Òv†–ÆR‡G'VR“°¢Ð ¢gVæ7F–öâW6„F—7F6†W"‚’°¢f"&WdF—7F6†W"Ò&V7D7W'&VçDF—7F6†W"C"æ7W'&VçC°¢&V7D7W'&VçDF—7F6†W"C"æ7W'&VçBÒ6öçFW‡DöæÇ”F—7F6†W#° ¢–b‡&WdF—7F6†W"ÓÓÒçVÆÂ’°¢òòF†R&V7B—6öÖ÷'†–26¶vRFöW2æ÷B–æ6ÇVFRFVfVÇBF—7F6†W"à¢òò–ç7FVBF†Rf—'7B&VæFW&W"v–ÆÂÆ¦–Ç’GF6‚öæRÂ–â÷&FW"Fòv—fP¢òòæ–6W"W'&÷"ÖW76vW2à¢&WGW&â6öçFW‡DöæÇ”F—7F6†W#°¢ÒVÇ6R°¢&WGW&â&WdF—7F6†W#°¢Ð¢Ð ¢gVæ7F–öâ÷F—7F6†W"‡&WdF—7F6†W"’°¢&V7D7W'&VçDF—7F6†W"C"æ7W'&VçBÒ&WdF—7F6†W#°¢Ð ¢gVæ7F–öâÖ&´6öÖÖ—EF–ÖTödfÆÆ&6²‚’°¢vÆö&ÄÖ÷7E&V6VçDfÆÆ&6µF–ÖRÒæ÷r‚“°¢Ð¢gVæ7F–öâÖ&µ6¶—VEWFFTÆæW2†ÆæR’°¢v÷&´–å&öw&W75&ö÷E6¶—VDÆæW2ÒÖW&vTÆæW2†ÆæRÂv÷&´–å&öw&W75&ö÷E6¶—VDÆæW2“°¢Ð¢gVæ7F–öâ&VæFW$F–E7W7VæB‚’°¢–b‡v÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷D–å&öw&W72’°¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷E7W7VæFVC°¢Ð¢Ð¢gVæ7F–öâ&VæFW$F–E7W7VæDFVÆ”–e÷76–&ÆR‚’°¢–b‡v÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷D–å&öw&W72ÇÂv÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷E7W7VæFVBÇÂv÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷DW'&÷&VB’°¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷E7W7VæFVEv—F„FVÆ“°¢Òòò6†V6²–bF†W&R&RWFFW2F†BvR6¶—VBG&VRF†BÖ–v‡B†fRVæ&Æö6¶V@¢òòF†—2&VæFW"à  ¢–b‡v÷&´–å&öw&W75&ö÷BÓÒçVÆÂbb†–æ6ÇVFW4æöä–FÆUv÷&²‡v÷&´–å&öw&W75&ö÷E6¶—VDÆæW2’ÇÂ–æ6ÇVFW4æöä–FÆUv÷&²‡v÷&´–å&öw&W75&ö÷D–çFW&ÆVfVEWFFVDÆæW2’’’°¢òòÖ&²F†R7W'&VçB&VæFW"27W7VæFVB6òF†BvR7v—F6‚Fòv÷&¶–æröà¢òòF†RWFFW2F†BvW&R6¶—VBâW7VÆÇ’vRöæÇ’7W7VæBBF†RVæBö`¢òòF†R&VæFW"†6Rà¢òòDôDó¢vR6†÷VÆB&ö&&Ç’Çv—2Ö&²F†R&ö÷B27W7VæFVB–ÖÖVF–FVÇ¢òò†–ç6–FRF†—2gVæ7F–öâ’Â6–æ6R'’7W7VæF–ærBF†RVæBöbF†R&VæFW ¢òò†6R–çG&öGV6W2÷FVçF–ÂÖ—7F¶Rv†W&RvR7W7VæBÆæW2F†BvW&P¢òò–ævVB÷"WFFVBv†–ÆRvRvW&R&VæFW&–ærà¢Ö&µ&ö÷E7W7VæFVBC‡v÷&´–å&öw&W75&ö÷BÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢Ð¢Ð¢gVæ7F–öâ&VæFW$F–DW'&÷"†W'&÷"’°¢–b‡v÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÒ&ö÷E7W7VæFVEv—F„FVÆ’’°¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷DW'&÷&VC°¢Ð ¢–b‡v÷&´–å&öw&W75&ö÷D6öæ7W'&VçDW'&÷'2ÓÓÒçVÆÂ’°¢v÷&´–å&öw&W75&ö÷D6öæ7W'&VçDW'&÷'2Ò¶W'&÷%Ó°¢ÒVÇ6R°¢v÷&´–å&öw&W75&ö÷D6öæ7W'&VçDW'&÷'2çW6‚†W'&÷"“°¢Ð¢Òòò6ÆÆVBGW&–ær&VæFW"FòFWFW&Ö–æR–bç—F†–ær†27W7VæFVBà¢òò&WGW&ç2fÇ6R–bvRw&Ræ÷B7W&Rà ¢gVæ7F–öâ&VæFW$†4æ÷E7W7VæFVE–WB‚’°¢òò–b6öÖWF†–ærW'&÷&VB÷"6ö×ÆWFVBÂvR6âwB&VÆÇ’&R7W&RÀ¢òò6òF†÷6R&RfÇ6Rà¢&WGW&âv÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷D–å&öw&W73°¢Ð ¢gVæ7F–öâ&VæFW%&ö÷E7–æ2‡&ö÷BÂÆæW2’°¢f"&WdW†V7WF–öä6öçFW‡BÒW†V7WF–öä6öçFW‡C°¢W†V7WF–öä6öçFW‡BÃÒ&VæFW$6öçFW‡C°¢f"&WdF—7F6†W"ÒW6„F—7F6†W"‚“²òò–bF†R&ö÷B÷"ÆæW2†fR6†ævVBÂF‡&÷r÷WBF†RW†—7F–ær7F6°¢òòæB&W&Rg&W6‚öæRâ÷F†W'v—6RvRvÆÂ6öçF–çVRv†W&RvRÆVgBöfbà ¢–b‡v÷&´–å&öw&W75&ö÷BÓÒ&ö÷BÇÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÓÒÆæW2’°¢°¢–b†—4FWeFööÇ5&W6VçB’°¢f"ÖVÖö—¦VEWFFW'2Ò&ö÷BæÖVÖö—¦VEWFFW'3° ¢–b†ÖVÖö—¦VEWFFW'2ç6—¦Râ’°¢&W7F÷&UVæF–æuWFFW'2‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢ÖVÖö—¦VEWFFW'2æ6ÆV"‚“°¢ÒòòBF†—2ö–çBÂÖ÷fRf–&W'2F†B66†VGVÆVBF†RW6öÖ–ærv÷&²g&öÒF†RÖFòF†R6WBà¢òò–bvR&–Æ÷WBöâF†—2v÷&²ÂvRvÆÂÖ÷fRF†VÒ&6²†Æ–¶R&÷fR’à¢òò—Bw2–×÷'FçBFòÖ÷fRF†VÒæ÷r–â66RF†Rv÷&²7vç2Ö÷&Rv÷&²BF†R6ÖR&–÷&—G’v—F‚F–ffW&VçBWFFW'2à¢òòF†Bv’vR6â¶VWF†R7W'&VçBWFFRæBgWGW&RWFFW26W&FRà  ¢Ö÷fUVæF–ætf–&W'5FôÖVÖö—¦VB‡&ö÷BÂÆæW2“°¢Ð¢Ð ¢v÷&´–å&öw&W75G&ç6—F–öç2ÒvWEG&ç6—F–öç4f÷$ÆæW2‚“°¢&W&Tg&W6…7F6²‡&ö÷BÂÆæW2“°¢Ð ¢°¢Ö&µ&VæFW%7F'FVB†ÆæW2“°¢Ð ¢Fò°¢G'’°¢v÷&´Æö÷7–æ2‚“°¢'&V³°¢Ò6F6‚‡F‡&÷våfÇVR’°¢†æFÆTW'&÷"‡&ö÷BÂF‡&÷våfÇVR“°¢Ð¢Òv†–ÆR‡G'VR“° ¢&W6WD6öçFW‡DFWVæFVæ6–W2‚“°¢W†V7WF–öä6öçFW‡BÒ&WdW†V7WF–öä6öçFW‡C°¢÷F—7F6†W"‡&WdF—7F6†W"“° ¢–b‡v÷&´–å&öw&W72ÓÒçVÆÂ’°¢òòF†—2—27–æ2&VæFW"Â6òvR6†÷VÆB†fRf–æ—6†VBF†Rv†öÆRG&VRà¢F‡&÷ræWrW'&÷"‚t6ææ÷B6öÖÖ—Bâ–æ6ö×ÆWFR&ö÷BâF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’r²v'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Ð ¢°¢Ö&µ&VæFW%7F÷VB‚“°¢Òòò6WBF†—2FòçVÆÂFò–æF–6FRF†W&Rw2æò–â×&öw&W72&VæFW"à  ¢v÷&´–å&öw&W75&ö÷BÒçVÆÃ°¢v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÒæôÆæW3°¢&WGW&âv÷&´–å&öw&W75&ö÷DW†—E7FGW3°¢ÒòòF†Rv÷&²Æö÷—2âW‡G&VÖVÇ’†÷BF‚âFVÆÂ6Æ÷7W&Ræ÷BFò–æÆ–æR—Bà ¢ò¢¢æö–æÆ–æR¢ð  ¢gVæ7F–öâv÷&´Æö÷7–æ2‚’°¢òòÇ&VG’F–ÖVB÷WBÂ6òW&f÷&Òv÷&²v—F†÷WB6†V6¶–ær–bvRæVVBFò––VÆBà¢v†–ÆR‡v÷&´–å&öw&W72ÓÒçVÆÂ’°¢W&f÷&ÕVæ—Döev÷&²‡v÷&´–å&öw&W72“°¢Ð¢Ð ¢gVæ7F–öâ&VæFW%&ö÷D6öæ7W'&VçB‡&ö÷BÂÆæW2’°¢f"&WdW†V7WF–öä6öçFW‡BÒW†V7WF–öä6öçFW‡C°¢W†V7WF–öä6öçFW‡BÃÒ&VæFW$6öçFW‡C°¢f"&WdF—7F6†W"ÒW6„F—7F6†W"‚“²òò–bF†R&ö÷B÷"ÆæW2†fR6†ævVBÂF‡&÷r÷WBF†RW†—7F–ær7F6°¢òòæB&W&Rg&W6‚öæRâ÷F†W'v—6RvRvÆÂ6öçF–çVRv†W&RvRÆVgBöfbà ¢–b‡v÷&´–å&öw&W75&ö÷BÓÒ&ö÷BÇÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÓÒÆæW2’°¢°¢–b†—4FWeFööÇ5&W6VçB’°¢f"ÖVÖö—¦VEWFFW'2Ò&ö÷BæÖVÖö—¦VEWFFW'3° ¢–b†ÖVÖö—¦VEWFFW'2ç6—¦Râ’°¢&W7F÷&UVæF–æuWFFW'2‡&ö÷BÂv÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2“°¢ÖVÖö—¦VEWFFW'2æ6ÆV"‚“°¢ÒòòBF†—2ö–çBÂÖ÷fRf–&W'2F†B66†VGVÆVBF†RW6öÖ–ærv÷&²g&öÒF†RÖFòF†R6WBà¢òò–bvR&–Æ÷WBöâF†—2v÷&²ÂvRvÆÂÖ÷fRF†VÒ&6²†Æ–¶R&÷fR’à¢òò—Bw2–×÷'FçBFòÖ÷fRF†VÒæ÷r–â66RF†Rv÷&²7vç2Ö÷&Rv÷&²BF†R6ÖR&–÷&—G’v—F‚F–ffW&VçBWFFW'2à¢òòF†Bv’vR6â¶VWF†R7W'&VçBWFFRæBgWGW&RWFFW26W&FRà  ¢Ö÷fUVæF–ætf–&W'5FôÖVÖö—¦VB‡&ö÷BÂÆæW2“°¢Ð¢Ð ¢v÷&´–å&öw&W75G&ç6—F–öç2ÒvWEG&ç6—F–öç4f÷$ÆæW2‚“°¢&W6WE&VæFW%F–ÖW"‚“°¢&W&Tg&W6…7F6²‡&ö÷BÂÆæW2“°¢Ð ¢°¢Ö&µ&VæFW%7F'FVB†ÆæW2“°¢Ð ¢Fò°¢G'’°¢v÷&´Æö÷6öæ7W'&VçB‚“°¢'&V³°¢Ò6F6‚‡F‡&÷våfÇVR’°¢†æFÆTW'&÷"‡&ö÷BÂF‡&÷våfÇVR“°¢Ð¢Òv†–ÆR‡G'VR“° ¢&W6WD6öçFW‡DFWVæFVæ6–W2‚“°¢÷F—7F6†W"‡&WdF—7F6†W"“°¢W†V7WF–öä6öçFW‡BÒ&WdW†V7WF–öä6öçFW‡C°  ¢–b‡v÷&´–å&öw&W72ÓÒçVÆÂ’°¢òò7F–ÆÂv÷&²&VÖ–æ–ærà¢°¢Ö&µ&VæFW%––VÆFVB‚“°¢Ð ¢&WGW&â&ö÷D–å&öw&W73°¢ÒVÇ6R°¢òò6ö×ÆWFVBF†RG&VRà¢°¢Ö&µ&VæFW%7F÷VB‚“°¢Òòò6WBF†—2FòçVÆÂFò–æF–6FRF†W&Rw2æò–â×&öw&W72&VæFW"à  ¢v÷&´–å&öw&W75&ö÷BÒçVÆÃ°¢v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÒæôÆæW3²òò&WGW&âF†Rf–æÂW†—B7FGW2à ¢&WGW&âv÷&´–å&öw&W75&ö÷DW†—E7FGW3°¢Ð¢Ð¢ò¢¢æö–æÆ–æR¢ð  ¢gVæ7F–öâv÷&´Æö÷6öæ7W'&VçB‚’°¢òòW&f÷&Òv÷&²VçF–Â66†VGVÆW"6·2W2Fò––VÆ@¢v†–ÆR‡v÷&´–å&öw&W72ÓÒçVÆÂbb6†÷VÆE––VÆB‚’’°¢W&f÷&ÕVæ—Döev÷&²‡v÷&´–å&öw&W72“°¢Ð¢Ð ¢gVæ7F–öâW&f÷&ÕVæ—Döev÷&²‡Væ—Döev÷&²’°¢òòF†R7W'&VçBÂfÇW6†VBÂ7FFRöbF†—2f–&W"—2F†RÇFW&æFRâ–FVÆÇ¢òòæ÷F†–ær6†÷VÆB&VÇ’öâF†—2Â'WB&VÇ––æröâ—B†W&RÖVç2F†BvRFöâw@¢òòæVVBâFF—F–öæÂf–VÆBöâF†Rv÷&²–â&öw&W72à¢f"7W'&VçBÒVæ—Döev÷&²æÇFW&æFS°¢6WD7W'&VçDf–&W"‡Væ—Döev÷&²“°¢f"æW‡C° ¢–b‚‡Væ—Döev÷&²æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢7F'E&öf–ÆW%F–ÖW"‡Væ—Döev÷&²“°¢æW‡BÒ&Vv–åv÷&²C†7W'&VçBÂVæ—Döev÷&²Â7V'G&VU&VæFW$ÆæW2“°¢7F÷&öf–ÆW%F–ÖW$–e'Vææ–ætæE&V6÷&DFVÇF‡Væ—Döev÷&²ÂG'VR“°¢ÒVÇ6R°¢æW‡BÒ&Vv–åv÷&²C†7W'&VçBÂVæ—Döev÷&²Â7V'G&VU&VæFW$ÆæW2“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“°¢Væ—Döev÷&²æÖVÖö—¦VE&÷2ÒVæ—Döev÷&²çVæF–æu&÷3° ¢–b†æW‡BÓÓÒçVÆÂ’°¢òò–bF†—2FöW6âwB7vâæWrv÷&²Â6ö×ÆWFRF†R7W'&VçBv÷&²à¢6ö×ÆWFUVæ—Döev÷&²‡Væ—Döev÷&²“°¢ÒVÇ6R°¢v÷&´–å&öw&W72ÒæW‡C°¢Ð ¢&V7D7W'&VçD÷væW"C"æ7W'&VçBÒçVÆÃ°¢Ð ¢gVæ7F–öâ6ö×ÆWFUVæ—Döev÷&²‡Væ—Döev÷&²’°¢òòGFV×BFò6ö×ÆWFRF†R7W'&VçBVæ—Böbv÷&²ÂF†VâÖ÷fRFòF†RæW‡@¢òò6–&Æ–ærâ–bF†W&R&RæòÖ÷&R6–&Æ–æw2Â&WGW&âFòF†R&VçBf–&W"à¢f"6ö×ÆWFVEv÷&²ÒVæ—Döev÷&³° ¢Fò°¢òòF†R7W'&VçBÂfÇW6†VBÂ7FFRöbF†—2f–&W"—2F†RÇFW&æFRâ–FVÆÇ¢òòæ÷F†–ær6†÷VÆB&VÇ’öâF†—2Â'WB&VÇ––æröâ—B†W&RÖVç2F†BvRFöâw@¢òòæVVBâFF—F–öæÂf–VÆBöâF†Rv÷&²–â&öw&W72à¢f"7W'&VçBÒ6ö×ÆWFVEv÷&²æÇFW&æFS°¢f"&WGW&äf–&W"Ò6ö×ÆWFVEv÷&²ç&WGW&ã²òò6†V6²–bF†Rv÷&²6ö×ÆWFVB÷"–b6öÖWF†–ærF‡&Wrà ¢–b‚†6ö×ÆWFVEv÷&²æfÆw2b–æ6ö×ÆWFR’ÓÓÒæôfÆw2’°¢6WD7W'&VçDf–&W"†6ö×ÆWFVEv÷&²“°¢f"æW‡BÒfö–B° ¢–b‚†6ö×ÆWFVEv÷&²æÖöFRb&öf–ÆTÖöFR’ÓÓÒæôÖöFR’°¢æW‡BÒ6ö×ÆWFUv÷&²†7W'&VçBÂ6ö×ÆWFVEv÷&²Â7V'G&VU&VæFW$ÆæW2“°¢ÒVÇ6R°¢7F'E&öf–ÆW%F–ÖW"†6ö×ÆWFVEv÷&²“°¢æW‡BÒ6ö×ÆWFUv÷&²†7W'&VçBÂ6ö×ÆWFVEv÷&²Â7V'G&VU&VæFW$ÆæW2“²òòWFFR&VæFW"GW&F–öâ77VÖ–ærvRF–FâwBW'&÷"à ¢7F÷&öf–ÆW%F–ÖW$–e'Vææ–ætæE&V6÷&DFVÇF†6ö×ÆWFVEv÷&²ÂfÇ6R“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“° ¢–b†æW‡BÓÒçVÆÂ’°¢òò6ö×ÆWF–ærF†—2f–&W"7væVBæWrv÷&²âv÷&²öâF†BæW‡Bà¢v÷&´–å&öw&W72ÒæW‡C°¢&WGW&ã°¢Ð¢ÒVÇ6R°¢òòF†—2f–&W"F–Bæ÷B6ö×ÆWFR&V6W6R6öÖWF†–ærF‡&Wrâ÷fÇVW2öf`¢òòF†R7F6²v—F†÷WBVçFW&–ærF†R6ö×ÆWFR†6Râ–bF†—2—2&÷VæF'’À¢òò6GW&RfÇVW2–b÷76–&ÆRà¢f"öæW‡BÒVçv–æEv÷&²†7W'&VçBÂ6ö×ÆWFVEv÷&²“²òò&V6W6RF†—2f–&W"F–Bæ÷B6ö×ÆWFRÂFöâwB&W6WB—G2ÆæW2à  ¢–b…öæW‡BÓÒçVÆÂ’°¢òò–b6ö×ÆWF–ærF†—2v÷&²7væVBæWrv÷&²ÂFòF†BæW‡BâvRvÆÂ6öÖP¢òò&6²†W&Rv–âà¢òò6–æ6RvRw&R&W7F'F–ærÂ&VÖ÷fRç—F†–ærF†B—2æ÷B†÷7BVffV7@¢òòg&öÒF†RVffV7BFrà¢öæW‡BæfÆw2cÒ†÷7DVffV7DÖ6³°¢v÷&´–å&öw&W72ÒöæW‡C°¢&WGW&ã°¢Ð ¢–b‚†6ö×ÆWFVEv÷&²æÖöFRb&öf–ÆTÖöFR’ÓÒæôÖöFR’°¢òò&V6÷&BF†R&VæFW"GW&F–öâf÷"F†Rf–&W"F†BW'&÷&VBà¢7F÷&öf–ÆW%F–ÖW$–e'Vææ–ætæE&V6÷&DFVÇF†6ö×ÆWFVEv÷&²ÂfÇ6R“²òò–æ6ÇVFRF†RF–ÖR7VçBv÷&¶–æröâf–ÆVB6†–ÆG&Vâ&Vf÷&R6öçF–çV–ærà ¢f"7GVÄGW&F–öâÒ6ö×ÆWFVEv÷&²æ7GVÄGW&F–öã°¢f"6†–ÆBÒ6ö×ÆWFVEv÷&²æ6†–ÆC° ¢v†–ÆR†6†–ÆBÓÒçVÆÂ’°¢7GVÄGW&F–öâ³Ò6†–ÆBæ7GVÄGW&F–öã°¢6†–ÆBÒ6†–ÆBç6–&Æ–æs°¢Ð ¢6ö×ÆWFVEv÷&²æ7GVÄGW&F–öâÒ7GVÄGW&F–öã°¢Ð ¢–b‡&WGW&äf–&W"ÓÒçVÆÂ’°¢òòÖ&²F†R&VçBf–&W"2–æ6ö×ÆWFRæB6ÆV"—G27V'G&VRfÆw2à¢&WGW&äf–&W"æfÆw2ÃÒ–æ6ö×ÆWFS°¢&WGW&äf–&W"ç7V'G&VTfÆw2ÒæôfÆw3°¢&WGW&äf–&W"æFVÆWF–öç2ÒçVÆÃ°¢ÒVÇ6R°¢òòvRwfRVçv÷VæBÆÂF†Rv’FòF†R&ö÷Bà¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷DF–Dæ÷D6ö×ÆWFS°¢v÷&´–å&öw&W72ÒçVÆÃ°¢&WGW&ã°¢Ð¢Ð ¢f"6–&Æ–ætf–&W"Ò6ö×ÆWFVEv÷&²ç6–&Æ–æs° ¢–b‡6–&Æ–ætf–&W"ÓÒçVÆÂ’°¢òò–bF†W&R—2Ö÷&Rv÷&²FòFò–âF†—2&WGW&äf–&W"ÂFòF†BæW‡Bà¢v÷&´–å&öw&W72Ò6–&Æ–ætf–&W#°¢&WGW&ã°¢Òòò÷F†W'v—6RÂ&WGW&âFòF†R&Vç@  ¢6ö×ÆWFVEv÷&²Ò&WGW&äf–&W#²òòWFFRF†RæW‡BF†–ærvRw&Rv÷&¶–æröâ–â66R6öÖWF†–ærF‡&÷w2à ¢v÷&´–å&öw&W72Ò6ö×ÆWFVEv÷&³°¢Òv†–ÆR†6ö×ÆWFVEv÷&²ÓÒçVÆÂ“²òòvRwfR&V6†VBF†R&ö÷Bà  ¢–b‡v÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷D–å&öw&W72’°¢v÷&´–å&öw&W75&ö÷DW†—E7FGW2Ò&ö÷D6ö×ÆWFVC°¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—E&ö÷B‡&ö÷BÂ&V6÷fW&&ÆTW'&÷'2ÂG&ç6—F–öç2’°¢òòDôDó¢F†—2æòÆöævW"Ö¶W2ç’6Vç6RâvRÇ&VG’w&F†R×WFF–öâæ@¢òòÆ–÷WB†6W2â6†÷VÆB&R&ÆRFò&VÖ÷fRà¢f"&Wf–÷W5WFFTÆæU&–÷&—G’ÒvWD7W'&VçEWFFU&–÷&—G’‚“°¢f"&WeG&ç6—F–öâÒ&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öã° ¢G'’°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒçVÆÃ°¢6WD7W'&VçEWFFU&–÷&—G’„F—67&WFTWfVçE&–÷&—G’“°¢6öÖÖ—E&ö÷D–×Â‡&ö÷BÂ&V6÷fW&&ÆTW'&÷'2ÂG&ç6—F–öç2Â&Wf–÷W5WFFTÆæU&–÷&—G’“°¢Òf–æÆÇ’°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒ&WeG&ç6—F–öã°¢6WD7W'&VçEWFFU&–÷&—G’‡&Wf–÷W5WFFTÆæU&–÷&—G’“°¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâ6öÖÖ—E&ö÷D–×Â‡&ö÷BÂ&V6÷fW&&ÆTW'&÷'2ÂG&ç6—F–öç2Â&VæFW%&–÷&—G”ÆWfVÂ’°¢Fò°¢òòfÇW6…76—fTVffV7G6v–ÆÂ6ÆÂfÇW6…7–æ5WFFUVWVVBF†RVæBÂv†–6€¢òòÖVç2fÇW6…76—fTVffV7G6v–ÆÂ6öÖWF–ÖW2&W7VÇB–âFF—F–öæÀ¢òò76—fRVffV7G2â6òvRæVVBFò¶VWfÇW6†–ær–âÆö÷VçF–ÂF†W&R&P¢òòæòÖ÷&RVæF–ærVffV7G2à¢òòDôDó¢Ö–v‡B&R&WGFW"–bfÇW6…76—fTVffV7G6F–Bæ÷BWFöÖF–6ÆÇ¢òòfÇW6‚7–æ6‡&öæ÷W2v÷&²BF†RVæBÂFòfö–Bf7F÷&–ær†¦&G2Æ–¶RF†—2à¢fÇW6…76—fTVffV7G2‚“°¢Òv†–ÆR‡&ö÷Ev—F…VæF–æu76—fTVffV7G2ÓÒçVÆÂ“° ¢fÇW6…&VæFW%†6U7G&–7DÖöFUv&æ–æw4–äDUb‚“° ¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÒæô6öçFW‡B’°¢F‡&÷ræWrW'&÷"‚u6†÷VÆBæ÷BÇ&VG’&Rv÷&¶–ærâr“°¢Ð ¢f"f–æ—6†VEv÷&²Ò&ö÷Bæf–æ—6†VEv÷&³°¢f"ÆæW2Ò&ö÷Bæf–æ—6†VDÆæW3° ¢°¢Ö&´6öÖÖ—E7F'FVB†ÆæW2“°¢Ð ¢–b†f–æ—6†VEv÷&²ÓÓÒçVÆÂ’° ¢°¢Ö&´6öÖÖ—E7F÷VB‚“°¢Ð ¢&WGW&âçVÆÃ°¢ÒVÇ6R°¢°¢–b†ÆæW2ÓÓÒæôÆæW2’°¢W'&÷"‚w&ö÷Bæf–æ—6†VDÆæW26†÷VÆBæ÷B&RV×G’GW&–ær6öÖÖ—BâF†—2—2r²v'Vr–â&V7Bâr“°¢Ð¢Ð¢Ð ¢&ö÷Bæf–æ—6†VEv÷&²ÒçVÆÃ°¢&ö÷Bæf–æ—6†VDÆæW2ÒæôÆæW3° ¢–b†f–æ—6†VEv÷&²ÓÓÒ&ö÷Bæ7W'&VçB’°¢F‡&÷ræWrW'&÷"‚t6ææ÷B6öÖÖ—BF†R6ÖRG&VR2&Vf÷&RâF†—2W'&÷"—2Æ–¶VÇ’6W6VB'’r²v'Vr–â&V7BâÆV6Rf–ÆRâ—77VRâr“°¢Òòò6öÖÖ—E&ö÷BæWfW"&WGW&ç26öçF–çVF–öã²—BÇv—2f–æ—6†W27–æ6‡&öæ÷W6Ç’à¢òò6òvR6â6ÆV"F†W6Ræ÷rFòÆÆ÷ræWr6ÆÆ&6²Fò&R66†VGVÆVBà  ¢&ö÷Bæ6ÆÆ&6´æöFRÒçVÆÃ°¢&ö÷Bæ6ÆÆ&6µ&–÷&—G’ÒæôÆæS²òòWFFRF†Rf—'7BæBÆ7BVæF–ærF–ÖW2öâF†—2&ö÷BâF†RæWrf—'7@¢òòVæF–ærF–ÖR—2v†FWfW"—2ÆVgBöâF†R&ö÷Bf–&W"à ¢f"&VÖ–æ–ætÆæW2ÒÖW&vTÆæW2†f–æ—6†VEv÷&²æÆæW2Âf–æ—6†VEv÷&²æ6†–ÆDÆæW2“°¢Ö&µ&ö÷Df–æ—6†VB‡&ö÷BÂ&VÖ–æ–ætÆæW2“° ¢–b‡&ö÷BÓÓÒv÷&´–å&öw&W75&ö÷B’°¢òòvR6â&W6WBF†W6Ræ÷rF†BF†W’&Rf–æ—6†VBà¢v÷&´–å&öw&W75&ö÷BÒçVÆÃ°¢v÷&´–å&öw&W72ÒçVÆÃ°¢v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2ÒæôÆæW3°¢Òòò–bF†W&R&RVæF–ær76—fRVffV7G2Â66†VGVÆR6ÆÆ&6²Fò&ö6W72F†VÒà¢òòFòF†—22V&Ç’2÷76–&ÆRÂ6ò—B—2VWVVB&Vf÷&Rç—F†–ærVÇ6RF†@¢òòÖ–v‡BvWB66†VGVÆVB–âF†R6öÖÖ—B†6Râ…6VR3csBâ¢òòDôDó¢FVÆWFRÆÂ÷F†W"Æ6W2F†B66†VGVÆRF†R76—fRVffV7B6ÆÆ&6°¢òòF†W’w&R&VGVæFçBà  ¢–b‚†f–æ—6†VEv÷&²ç7V'G&VTfÆw2b76—fTÖ6²’ÓÒæôfÆw2ÇÂ†f–æ—6†VEv÷&²æfÆw2b76—fTÖ6²’ÓÒæôfÆw2’°¢–b‚&ö÷DFöW4†fU76—fTVffV7G2’°¢&ö÷DFöW4†fU76—fTVffV7G2ÒG'VS°¢òòFò7F÷&R—B–âVæF–æu76—fUG&ç6—F–öç2VçF–ÂF†W’vWB&ö6W76V@¢òòvRæVVBFò72F†—2F‡&÷Vv‚2â&wVÖVçBFò6öÖÖ—E&ö÷@¢òò&V6W6Rv÷&´–å&öw&W75G&ç6—F–öç2Ö–v‡B†fR6†ævVB&WGvVVà¢òòF†R&Wf–÷W2&VæFW"æB6öÖÖ—B–bvRF‡&÷GFÆRF†R6öÖÖ—@¢òòv—F‚6WEF–ÖV÷W@ ¢VæF–æu76—fUG&ç6—F–öç2ÒG&ç6—F–öç3°¢66†VGVÆT6ÆÆ&6²C„æ÷&ÖÅ&–÷&—G’ÂgVæ7F–öâ‚’°¢fÇW6…76—fTVffV7G2‚“²òòF†—2&VæFW"G&–vvW&VB76—fRVffV7G3¢&VÆV6RF†R&ö÷B66†RööÀ¢òò¦gFW"¢76—fRVffV7G2f—&RFòfö–Bg&VV–ær66†RööÂF†BÖ¢òò&R&VfW&Væ6VB'’æöFR–âF†RG&VR„†÷7E&ö÷BÂ66†R&÷VæF'’WF2 ¢&WGW&âçVÆÃ°¢Ò“°¢Ð¢Òòò6†V6²–bF†W&R&Rç’VffV7G2–âF†Rv†öÆRG&VRà¢òòDôDó¢F†—2—2ÆVgB÷fW"g&öÒF†RVffV7BÆ—7B–×ÆVÖVçFF–öâÂv†W&RvR†@¢òòFò6†V6²f÷"F†RW†—7FVæ6Röbf—'7DVffV7FFò6F—6g’fÆ÷râ’F†–æ²F†P¢òòöæÇ’÷F†W"&V6öâF†—2÷F–Ö—¦F–öâW†—7G2—2&V6W6R—BffV7G2&öf–Æ–ærà¢òò&V6öç6–FW"v†WF†W"F†—2—2æV6W76'’à  ¢f"7V'G&VT†4VffV7G2Ò†f–æ—6†VEv÷&²ç7V'G&VTfÆw2b„&Vf÷&T×WFF–öäÖ6²Â×WFF–öäÖ6²ÂÆ–÷WDÖ6²Â76—fTÖ6²’’ÓÒæôfÆw3°¢f"&ö÷D†4VffV7BÒ†f–æ—6†VEv÷&²æfÆw2b„&Vf÷&T×WFF–öäÖ6²Â×WFF–öäÖ6²ÂÆ–÷WDÖ6²Â76—fTÖ6²’’ÓÒæôfÆw3° ¢–b‡7V'G&VT†4VffV7G2ÇÂ&ö÷D†4VffV7B’°¢f"&WeG&ç6—F–öâÒ&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öã°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒçVÆÃ°¢f"&Wf–÷W5&–÷&—G’ÒvWD7W'&VçEWFFU&–÷&—G’‚“°¢6WD7W'&VçEWFFU&–÷&—G’„F—67&WFTWfVçE&–÷&—G’“°¢f"&WdW†V7WF–öä6öçFW‡BÒW†V7WF–öä6öçFW‡C°¢W†V7WF–öä6öçFW‡BÃÒ6öÖÖ—D6öçFW‡C²òò&W6WBF†—2FòçVÆÂ&Vf÷&R6ÆÆ–ærÆ–fV7–6ÆW0 ¢&V7D7W'&VçD÷væW"C"æ7W'&VçBÒçVÆÃ²òòF†R6öÖÖ—B†6R—2'&ö¶Vâ–çFò6WfW&Â7V"×†6W2âvRFò6W&FR70¢òòöbF†RVffV7BÆ—7Bf÷"V6‚†6S¢ÆÂ×WFF–öâVffV7G26öÖR&Vf÷&RÆÀ¢òòÆ–÷WBVffV7G2ÂæB6òöâà¢òòF†Rf—'7B†6R&&Vf÷&R×WFF–öâ"†6RâvRW6RF†—2†6RFò&VBF†P¢òò7FFRöbF†R†÷7BG&VR&–v‡B&Vf÷&RvR×WFFR—BâF†—2—2v†W&P¢òòvWE6æ6†÷D&Vf÷&UWFFR—26ÆÆVBà ¢f"6†÷VÆDf—&TgFW$7F—fT–ç7Fæ6T&ÇW"Ò6öÖÖ—D&Vf÷&T×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²“° ¢°¢òòÖ&²F†R7W'&VçB6öÖÖ—BF–ÖRFò&R6†&VB'’ÆÂ&öf–ÆW'2–âF†—0¢òò&F6‚âF†—2Væ&ÆW2F†VÒFò&Rw&÷WVBÆFW"à¢&V6÷&D6öÖÖ—EF–ÖR‚“°¢Ð  ¢6öÖÖ—D×WFF–öäVffV7G2‡&ö÷BÂf–æ—6†VEv÷&²ÂÆæW2“° ¢&W6WDgFW$6öÖÖ—B‡&ö÷Bæ6öçF–æW$–æfò“²òòF†Rv÷&²Ö–â×&öw&W72G&VR—2æ÷rF†R7W'&VçBG&VRâF†—2×W7B6öÖRgFW ¢òòF†R×WFF–öâ†6RÂ6òF†BF†R&Wf–÷W2G&VR—27F–ÆÂ7W'&VçBGW&–æp¢òò6ö×öæVçEv–ÆÅVæÖ÷VçBÂ'WB&Vf÷&RF†RÆ–÷WB†6RÂ6òF†BF†Rf–æ—6†V@¢òòv÷&²—27W'&VçBGW&–ær6ö×öæVçDF–DÖ÷VçBõWFFRà ¢&ö÷Bæ7W'&VçBÒf–æ—6†VEv÷&³²òòF†RæW‡B†6R—2F†RÆ–÷WB†6RÂv†W&RvR6ÆÂVffV7G2F†B&V@ ¢°¢Ö&´Æ–÷WDVffV7G57F'FVB†ÆæW2“°¢Ð ¢6öÖÖ—DÆ–÷WDVffV7G2†f–æ—6†VEv÷&²Â&ö÷BÂÆæW2“° ¢°¢Ö&´Æ–÷WDVffV7G57F÷VB‚“°¢Ð¢òò÷÷'GVæ—G’Fò–çBà  ¢&WVW7E–çB‚“°¢W†V7WF–öä6öçFW‡BÒ&WdW†V7WF–öä6öçFW‡C²òò&W6WBF†R&–÷&—G’FòF†R&Wf–÷W2æöâ×7–æ2fÇVRà ¢6WD7W'&VçEWFFU&–÷&—G’‡&Wf–÷W5&–÷&—G’“°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒ&WeG&ç6—F–öã°¢ÒVÇ6R°¢òòæòVffV7G2à¢&ö÷Bæ7W'&VçBÒf–æ—6†VEv÷&³²òòÖV7W&RF†W6Rç—v’6òF†RfÆÖVw&‚W‡Æ–6—FÇ’6†÷w2F†BF†W&RvW&P¢òòæòVffV7G2à¢òòDôDó¢Ö–&RF†W&Rw2&WGFW"v’Fò&W÷'BF†—2à ¢°¢&V6÷&D6öÖÖ—EF–ÖR‚“°¢Ð¢Ð ¢f"&ö÷DF–D†fU76—fTVffV7G2Ò&ö÷DFöW4†fU76—fTVffV7G3° ¢–b‡&ö÷DFöW4†fU76—fTVffV7G2’°¢òòF†—26öÖÖ—B†276—fRVffV7G2â7F6‚&VfW&Væ6RFòF†VÒâ'WBFöâw@¢òò66†VGVÆR6ÆÆ&6²VçF–ÂgFW"fÇW6†–ærÆ–÷WBv÷&²à¢&ö÷DFöW4†fU76—fTVffV7G2ÒfÇ6S°¢&ö÷Ev—F…VæF–æu76—fTVffV7G2Ò&ö÷C°¢VæF–æu76—fTVffV7G4ÆæW2ÒÆæW3°¢ÒVÇ6R° ¢°¢æW7FVE76—fUWFFT6÷VçBÒ°¢&ö÷Ev—F…76—fTæW7FVEWFFW2ÒçVÆÃ°¢Ð¢Òòò&VBF†—2v–âÂ6–æ6RâVffV7BÖ–v‡B†fRWFFVB—@  ¢&VÖ–æ–ætÆæW2Ò&ö÷BçVæF–ætÆæW3²òò6†V6²–bF†W&Rw2&VÖ–æ–ærv÷&²öâF†—2&ö÷@¢òòDôDó¢F†—2—2'BöbF†R6ö×öæVçDF–D6F6†–×ÆVÖVçFF–öââ—G2W'÷6P¢òò—2FòFWFV7Bv†WF†W"6öÖWF†–ærÖ–v‡B†fR6ÆÆVB6WE7FFR–ç6–FP¢òò6ö×öæVçDF–D6F6†âF†RÖV6†æ—6Ò—2¶æ÷vâFò&RfÆvVB&V6W6R6WE7FFV ¢òò–ç6–FR6ö×öæVçDF–D6F6†—2—G6VÆbfÆvVB(	BF†Bw2v‡’vR&V6öÖÖVæ@¢òòvWDFW&—fVE7FFTg&öÔW'&÷&–ç7FVBâ†÷vWfW"Â—B6÷VÆB&R–×&÷fVB'¢òò6†V6¶–ær–b&VÖ–æ–ætÆæW2–æ6ÇVFW27–æ2v÷&²Â–ç7FVBöbv†WF†W"F†W&Rw0¢òòç’v÷&²&VÖ–æ–ærBÆÂ‡v†–6‚v÷VÆBÇ6ò–æ6ÇVFR7GVfbÆ–¶R7W7Vç6P¢òò&WG&–W2÷"G&ç6—F–öç2’â—Bw2&VVâÆ–¶RF†—2f÷"v†–ÆRÂF†÷Vv‚Â6òf—†–æp¢òò—B&ö&&Ç’—6âwBF†BW&vVçBà ¢–b‡&VÖ–æ–ætÆæW2ÓÓÒæôÆæW2’°¢òò–bF†W&Rw2æò&VÖ–æ–ærv÷&²ÂvR6â6ÆV"F†R6WBöbÇ&VG’f–ÆV@¢òòW'&÷"&÷VæF&–W2à¢ÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBÒçVÆÃ°¢Ð ¢°¢–b‚&ö÷DF–D†fU76—fTVffV7G2’°¢6öÖÖ—DF÷V&ÆT–çfö¶TVffV7G4–äDUb‡&ö÷Bæ7W'&VçBÂfÇ6R“°¢Ð¢Ð ¢öä6öÖÖ—E&ö÷B†f–æ—6†VEv÷&²ç7FFTæöFRÂ&VæFW%&–÷&—G”ÆWfVÂ“° ¢°¢–b†—4FWeFööÇ5&W6VçB’°¢&ö÷BæÖVÖö—¦VEWFFW'2æ6ÆV"‚“°¢Ð¢Ð ¢°¢öä6öÖÖ—E&ö÷BC‚“°¢ÒòòÇv—26ÆÂF†—2&Vf÷&RW†—F–ær6öÖÖ—E&ö÷FÂFòVç7W&RF†Bç¢òòFF—F–öæÂv÷&²öâF†—2&ö÷B—266†VGVÆVBà  ¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂæ÷r‚’“° ¢–b‡&V6÷fW&&ÆTW'&÷'2ÓÒçVÆÂ’°¢òòF†W&RvW&RW'&÷'2GW&–ærF†—2&VæFW"Â'WB&V6÷fW&VBg&öÒF†VÒv—F†÷W@¢òòæVVF–ærFò7W&f6R—BFòF†RT’âvRÆörF†VÒ†W&Rà¢f"öå&V6÷fW&&ÆTW'&÷"Ò&ö÷Bæöå&V6÷fW&&ÆTW'&÷#° ¢f÷"‡f"’Ò²’Â&V6÷fW&&ÆTW'&÷'2æÆVæwFƒ²’²²’°¢f"&V6÷fW&&ÆTW'&÷"Ò&V6÷fW&&ÆTW'&÷'5¶•Ó°¢f"6ö×öæVçE7F6²Ò&V6÷fW&&ÆTW'&÷"ç7F6³°¢f"F–vW7BÒ&V6÷fW&&ÆTW'&÷"æF–vW7C°¢öå&V6÷fW&&ÆTW'&÷"‡&V6÷fW&&ÆTW'&÷"çfÇVRÂ°¢6ö×öæVçE7F6³¢6ö×öæVçE7F6²À¢F–vW7C¢F–vW7@¢Ò“°¢Ð¢Ð ¢–b††5Væ6Vv‡DW'&÷"’°¢†5Væ6Vv‡DW'&÷"ÒfÇ6S°¢f"W'&÷"CÒf—'7EVæ6Vv‡DW'&÷#°¢f—'7EVæ6Vv‡DW'&÷"ÒçVÆÃ°¢F‡&÷rW'&÷"C°¢Òòò–bF†R76—fRVffV7G2&RF†R&W7VÇBöbF—67&WFR&VæFW"ÂfÇW6‚F†VÐ¢òò7–æ6‡&öæ÷W6Ç’BF†RVæBöbF†R7W'&VçBF6²6òF†BF†R&W7VÇB—0¢òò–ÖÖVF–FVÇ’ö'6W'f&ÆRâ÷F†W'v—6RÂvR77VÖRF†BF†W’&Ræ÷@¢òò÷&FW"ÖFWVæFVçBæBFòæ÷BæVVBFò&Rö'6W'fVB'’W‡FW&æÂ7—7FV×2Â6òvP¢òò6âv—BVçF–ÂgFW"–çBà¢òòDôDó¢vR6â÷F–Ö—¦RF†—2'’æ÷B66†VGVÆ–ærF†R6ÆÆ&6²V&Æ–W"â6–æ6RvP¢òò7W'&VçFÇ’66†VGVÆRF†R6ÆÆ&6²–â×VÇF—ÆRÆ6W2Âv–ÆÂv—BVçF–ÂF†÷6P¢òò&R6öç6öÆ–FFVBà  ¢–b†–æ6ÇVFW56öÖTÆæR‡VæF–æu76—fTVffV7G4ÆæW2Â7–æ4ÆæR’bb&ö÷BçFrÓÒÆVv7•&ö÷B’°¢fÇW6…76—fTVffV7G2‚“°¢Òòò&VBF†—2v–âÂ6–æ6R76—fRVffV7BÖ–v‡B†fRWFFVB—@  ¢&VÖ–æ–ætÆæW2Ò&ö÷BçVæF–ætÆæW3° ¢–b†–æ6ÇVFW56öÖTÆæR‡&VÖ–æ–ætÆæW2Â7–æ4ÆæR’’°¢°¢Ö&´æW7FVEWFFU66†VGVÆVB‚“°¢Òòò6÷VçBF†RçVÖ&W"öbF–ÖW2F†R&ö÷B7–æ6‡&öæ÷W6Ç’&R×&VæFW'2v—F†÷W@¢òòf–æ—6†–ærâ–bF†W&R&RFöòÖç’Â—B–æF–6FW2â–æf–æ—FRWFFRÆö÷à  ¢–b‡&ö÷BÓÓÒ&ö÷Ev—F„æW7FVEWFFW2’°¢æW7FVEWFFT6÷VçB²³°¢ÒVÇ6R°¢æW7FVEWFFT6÷VçBÒ°¢&ö÷Ev—F„æW7FVEWFFW2Ò&ö÷C°¢Ð¢ÒVÇ6R°¢æW7FVEWFFT6÷VçBÒ°¢Òòò–bÆ–÷WBv÷&²v266†VGVÆVBÂfÇW6‚—Bæ÷rà  ¢fÇW6…7–æ46ÆÆ&6·2‚“° ¢°¢Ö&´6öÖÖ—E7F÷VB‚“°¢Ð ¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâfÇW6…76—fTVffV7G2‚’°¢òò&WGW&ç2v†WF†W"76—fRVffV7G2vW&RfÇW6†VBà¢òòDôDó¢6öÖ&–æRF†—26†V6²v—F‚F†RöæR–âfÇW6…76—fTTffV7G4–×ÂâvR6†÷VÆ@¢òò&ö&&Ç’§W7B6öÖ&–æRF†RGvògVæ7F–öç2â’&VÆ–WfRF†W’vW&RöæÇ’6W&FP¢òò–âF†Rf—'7BÆ6R&V6W6RvRW6VBFòw&—Bv—F€¢òò66†VGVÆW"ç'Våv—F…&–÷&—G–Âv†–6‚66WG2gVæ7F–öââ'WBæ÷rvRG&6²F†P¢òò&–÷&—G’v—F†–â&V7B—G6VÆbÂ6òvR6â×WFFRF†Rf&–&ÆRF—&V7FÇ’à¢–b‡&ö÷Ev—F…VæF–æu76—fTVffV7G2ÓÒçVÆÂ’°¢f"&VæFW%&–÷&—G’ÒÆæW5FôWfVçE&–÷&—G’‡VæF–æu76—fTVffV7G4ÆæW2“°¢f"&–÷&—G’ÒÆ÷vW$WfVçE&–÷&—G’„FVfVÇDWfVçE&–÷&—G’Â&VæFW%&–÷&—G’“°¢f"&WeG&ç6—F–öâÒ&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öã°¢f"&Wf–÷W5&–÷&—G’ÒvWD7W'&VçEWFFU&–÷&—G’‚“° ¢G'’°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒçVÆÃ°¢6WD7W'&VçEWFFU&–÷&—G’‡&–÷&—G’“°¢&WGW&âfÇW6…76—fTVffV7G4–×Â‚“°¢Òf–æÆÇ’°¢6WD7W'&VçEWFFU&–÷&—G’‡&Wf–÷W5&–÷&—G’“°¢&V7D7W'&VçD&F6„6öæf–rC2çG&ç6—F–öâÒ&WeG&ç6—F–öã²òòöæ6R76—fRVffV7G2†fR'Vâf÷"F†RG&VRÒv—f–ær6ö×öæVçG2¢Ð¢Ð ¢&WGW&âfÇ6S°¢Ð¢gVæ7F–öâVçVWVUVæF–æu76—fU&öf–ÆW$VffV7B†f–&W"’°¢°¢VæF–æu76—fU&öf–ÆW$VffV7G2çW6‚†f–&W"“° ¢–b‚&ö÷DFöW4†fU76—fTVffV7G2’°¢&ö÷DFöW4†fU76—fTVffV7G2ÒG'VS°¢66†VGVÆT6ÆÆ&6²C„æ÷&ÖÅ&–÷&—G’ÂgVæ7F–öâ‚’°¢fÇW6…76—fTVffV7G2‚“°¢&WGW&âçVÆÃ°¢Ò“°¢Ð¢Ð¢Ð ¢gVæ7F–öâfÇW6…76—fTVffV7G4–×Â‚’°¢–b‡&ö÷Ev—F…VæF–æu76—fTVffV7G2ÓÓÒçVÆÂ’°¢&WGW&âfÇ6S°¢Òòò66†RæB6ÆV"F†RG&ç6—F–öç2fÆp  ¢f"G&ç6—F–öç2ÒVæF–æu76—fUG&ç6—F–öç3°¢VæF–æu76—fUG&ç6—F–öç2ÒçVÆÃ°¢f"&ö÷BÒ&ö÷Ev—F…VæF–æu76—fTVffV7G3°¢f"ÆæW2ÒVæF–æu76—fTVffV7G4ÆæW3°¢&ö÷Ev—F…VæF–æu76—fTVffV7G2ÒçVÆÃ²òòDôDó¢F†—2—26öÖWF–ÖW2÷WBöb7–æ2v—F‚&ö÷Ev—F…VæF–æu76—fTVffV7G2à¢òòf–wW&R÷WBv‡’æBf—‚—Bâ—Bw2æ÷B6W6–ærç’¶æ÷vâ—77VW2‡&ö&&Ç¢òò&V6W6R—Bw2öæÇ’W6VBf÷"&öf–Æ–ær’Â'WB—Bw2&Vf7F÷"†¦&Bà ¢VæF–æu76—fTVffV7G4ÆæW2ÒæôÆæW3° ¢–b‚†W†V7WF–öä6öçFW‡Bb…&VæFW$6öçFW‡BÂ6öÖÖ—D6öçFW‡B’’ÓÒæô6öçFW‡B’°¢F‡&÷ræWrW'&÷"‚t6ææ÷BfÇW6‚76—fRVffV7G2v†–ÆRÇ&VG’&VæFW&–ærâr“°¢Ð ¢°¢—4fÇW6†–æu76—fTVffV7G2ÒG'VS°¢F–E66†VGVÆUWFFTGW&–æu76—fTVffV7G2ÒfÇ6S°¢Ð ¢°¢Ö&µ76—fTVffV7G57F'FVB†ÆæW2“°¢Ð ¢f"&WdW†V7WF–öä6öçFW‡BÒW†V7WF–öä6öçFW‡C°¢W†V7WF–öä6öçFW‡BÃÒ6öÖÖ—D6öçFW‡C°¢6öÖÖ—E76—fUVæÖ÷VçDVffV7G2‡&ö÷Bæ7W'&VçB“°¢6öÖÖ—E76—fTÖ÷VçDVffV7G2‡&ö÷BÂ&ö÷Bæ7W'&VçBÂÆæW2ÂG&ç6—F–öç2“²òòDôDó¢Ö÷fRFò6öÖÖ—E76—fTÖ÷VçDVffV7G0 ¢°¢f"&öf–ÆW$VffV7G2ÒVæF–æu76—fU&öf–ÆW$VffV7G3°¢VæF–æu76—fU&öf–ÆW$VffV7G2ÒµÓ° ¢f÷"‡f"’Ò²’Â&öf–ÆW$VffV7G2æÆVæwFƒ²’²²’°¢f"öf–&W"Ò&öf–ÆW$VffV7G5¶•Ó°¢6öÖÖ—E76—fTVffV7DGW&F–öç2‡&ö÷BÂöf–&W"“°¢Ð¢Ð ¢°¢Ö&µ76—fTVffV7G57F÷VB‚“°¢Ð ¢°¢6öÖÖ—DF÷V&ÆT–çfö¶TVffV7G4–äDUb‡&ö÷Bæ7W'&VçBÂG'VR“°¢Ð ¢W†V7WF–öä6öçFW‡BÒ&WdW†V7WF–öä6öçFW‡C°¢fÇW6…7–æ46ÆÆ&6·2‚“° ¢°¢òò–bFF—F–öæÂ76—fRVffV7G2vW&R66†VGVÆVBÂ–æ7&VÖVçB6÷VçFW"â–bF†—0¢òòW†6VVG2F†RÆ–Ö—BÂvRvÆÂf—&Rv&æ–ærà¢–b†F–E66†VGVÆUWFFTGW&–æu76—fTVffV7G2’°¢–b‡&ö÷BÓÓÒ&ö÷Ev—F…76—fTæW7FVEWFFW2’°¢æW7FVE76—fUWFFT6÷VçB²³°¢ÒVÇ6R°¢æW7FVE76—fUWFFT6÷VçBÒ°¢&ö÷Ev—F…76—fTæW7FVEWFFW2Ò&ö÷C°¢Ð¢ÒVÇ6R°¢æW7FVE76—fUWFFT6÷VçBÒ°¢Ð ¢—4fÇW6†–æu76—fTVffV7G2ÒfÇ6S°¢F–E66†VGVÆUWFFTGW&–æu76—fTVffV7G2ÒfÇ6S°¢ÒòòDôDó¢Ö÷fRFò6öÖÖ—E76—fTÖ÷VçDVffV7G0  ¢öå÷7D6öÖÖ—E&ö÷B‡&ö÷B“° ¢°¢f"7FFTæöFRÒ&ö÷Bæ7W'&VçBç7FFTæöFS°¢7FFTæöFRæVffV7DGW&F–öâÒ°¢7FFTæöFRç76—fTVffV7DGW&F–öâÒ°¢Ð ¢&WGW&âG'VS°¢Ð ¢gVæ7F–öâ—4Ç&VG”f–ÆVDÆVv7”W'&÷$&÷VæF'’†–ç7Fæ6R’°¢&WGW&âÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBÓÒçVÆÂbbÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBæ†2†–ç7Fæ6R“°¢Ð¢gVæ7F–öâÖ&´ÆVv7”W'&÷$&÷VæF'”4f–ÆVB†–ç7Fæ6R’°¢–b†ÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBÓÓÒçVÆÂ’°¢ÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBÒæWr6WB…¶–ç7Fæ6UÒ“°¢ÒVÇ6R°¢ÆVv7”W'&÷$&÷VæF&–W5F†DÇ&VG”f–ÆVBæFB†–ç7Fæ6R“°¢Ð¢Ð ¢gVæ7F–öâ&W&UFõF‡&÷uVæ6Vv‡DW'&÷"†W'&÷"’°¢–b‚†5Væ6Vv‡DW'&÷"’°¢†5Væ6Vv‡DW'&÷"ÒG'VS°¢f—'7EVæ6Vv‡DW'&÷"ÒW'&÷#°¢Ð¢Ð ¢f"öåVæ6Vv‡DW'&÷"Ò&W&UFõF‡&÷uVæ6Vv‡DW'&÷#° ¢gVæ7F–öâ6GW&T6öÖÖ—E†6TW'&÷$öå&ö÷B‡&ö÷Df–&W"Â6÷W&6Tf–&W"ÂW'&÷"’°¢f"W'&÷$–æfòÒ7&VFT6GW&VEfÇVTDf–&W"†W'&÷"Â6÷W&6Tf–&W"“°¢f"WFFRÒ7&VFU&ö÷DW'&÷%WFFR‡&ö÷Df–&W"ÂW'&÷$–æfòÂ7–æ4ÆæR“°¢f"&ö÷BÒVçVWVUWFFR‡&ö÷Df–&W"ÂWFFRÂ7–æ4ÆæR“°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢Ö&µ&ö÷EWFFVB‡&ö÷BÂ7–æ4ÆæRÂWfVçEF–ÖR“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂWfVçEF–ÖR“°¢Ð¢Ð ¢gVæ7F–öâ6GW&T6öÖÖ—E†6TW'&÷"‡6÷W&6Tf–&W"ÂæV&W7DÖ÷VçFVDæ6W7F÷"ÂW'&÷"C’°¢°¢&W÷'EVæ6Vv‡DW'&÷$–äDUb†W'&÷"C“°¢6WD—5'Vææ–æt–ç6W'F–öäVffV7B†fÇ6R“°¢Ð ¢–b‡6÷W&6Tf–&W"çFrÓÓÒ†÷7E&ö÷B’°¢òòW'&÷"v2F‡&÷vâBF†R&ö÷BâF†W&R—2æò&VçBÂ6òF†R&ö÷@¢òò—G6VÆb6†÷VÆB6GW&R—Bà¢6GW&T6öÖÖ—E†6TW'&÷$öå&ö÷B‡6÷W&6Tf–&W"Â6÷W&6Tf–&W"ÂW'&÷"C“°¢&WGW&ã°¢Ð ¢f"f–&W"ÒçVÆÃ° ¢°¢f–&W"ÒæV&W7DÖ÷VçFVDæ6W7F÷#°¢Ð ¢v†–ÆR†f–&W"ÓÒçVÆÂ’°¢–b†f–&W"çFrÓÓÒ†÷7E&ö÷B’°¢6GW&T6öÖÖ—E†6TW'&÷$öå&ö÷B†f–&W"Â6÷W&6Tf–&W"ÂW'&÷"C“°¢&WGW&ã°¢ÒVÇ6R–b†f–&W"çFrÓÓÒ6Æ746ö×öæVçB’°¢f"7F÷"Òf–&W"çG—S°¢f"–ç7Fæ6RÒf–&W"ç7FFTæöFS° ¢–b‡G—Vöb7F÷"ævWDFW&—fVE7FFTg&öÔW'&÷"ÓÓÒvgVæ7F–öârÇÂG—Vöb–ç7Fæ6Ræ6ö×öæVçDF–D6F6‚ÓÓÒvgVæ7F–öârbb—4Ç&VG”f–ÆVDÆVv7”W'&÷$&÷VæF'’†–ç7Fæ6R’’°¢f"W'&÷$–æfòÒ7&VFT6GW&VEfÇVTDf–&W"†W'&÷"CÂ6÷W&6Tf–&W"“°¢f"WFFRÒ7&VFT6Æ74W'&÷%WFFR†f–&W"ÂW'&÷$–æfòÂ7–æ4ÆæR“°¢f"&ö÷BÒVçVWVUWFFR†f–&W"ÂWFFRÂ7–æ4ÆæR“°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢Ö&µ&ö÷EWFFVB‡&ö÷BÂ7–æ4ÆæRÂWfVçEF–ÖR“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂWfVçEF–ÖR“°¢Ð ¢&WGW&ã°¢Ð¢Ð ¢f–&W"Òf–&W"ç&WGW&ã°¢Ð ¢°¢òòDôDó¢VçF–ÂvR&RÖÆæB6¶—VæÖ÷VçFVD&÷VæF&–W2‡6VR3#Cr’ÂF†—2v&æ–æp¢òòv–ÆÂf—&Rf÷"W'&÷'2F†B&RF‡&÷vâ'’FW7G&÷’gVæ7F–öç2–ç6–FRFVÆWFV@¢òòG&VW2âv†B—B6†÷VÆB–ç7FVBFò—2&÷vFRF†RW'&÷"FòF†R&VçBö`¢òòF†RFVÆWFVBG&VRâ–âF†RÖVçF–ÖRÂFòæ÷BFBF†—2v&æ–ærFòF†P¢òòÆÆ÷vÆ—7C²F†—2—2öæÇ’f÷"÷W"–çFW&æÂW6Rà¢W'&÷"‚t–çFW&æÂ&V7BW'&÷#¢GFV×FVBFò6GW&R6öÖÖ—B†6RW'&÷"r²v–ç6–FRFWF6†VBG&VRâF†—2–æF–6FW2'Vr–â&V7BâÆ–¶VÇ’r²v6W6W2–æ6ÇVFRFVÆWF–ærF†R6ÖRf–&W"Ö÷&RF†âöæ6RÂ6öÖÖ—GF–ærâr²vÇ&VG’Öf–æ—6†VBG&VRÂ÷"â–æ6öç6—7FVçB&WGW&âö–çFW"åÆåÆâr²tW'&÷"ÖW76vS¥ÆåÆâW2rÂW'&÷"C“°¢Ð¢Ð¢gVæ7F–öâ–æu7W7VæFVE&ö÷B‡&ö÷BÂv¶V&ÆRÂ–ævVDÆæW2’°¢f"–æt66†RÒ&ö÷Bç–æt66†S° ¢–b‡–æt66†RÓÒçVÆÂ’°¢òòF†Rv¶V&ÆR&W6öÇfVBÂ6òvRæòÆöævW"æVVBFòÖVÖö—¦RÂ&V6W6R—Bv–ÆÀ¢òòæWfW"&RF‡&÷vâv–âà¢–æt66†RæFVÆWFR‡v¶V&ÆR“°¢Ð ¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢Ö&µ&ö÷E–ævVB‡&ö÷BÂ–ævVDÆæW2“°¢v&ä–e7W7Vç6U&W6öÇWF–öäæ÷Ew&VEv—F„7DDUb‡&ö÷B“° ¢–b‡v÷&´–å&öw&W75&ö÷BÓÓÒ&ö÷Bbb—57V'6WDödÆæW2‡v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2Â–ævVDÆæW2’’°¢òò&V6V—fVB–ærBF†R6ÖR&–÷&—G’ÆWfVÂBv†–6‚vRw&R7W'&VçFÇ¢òò&VæFW&–ærâvRÖ–v‡BvçBFò&W7F'BF†—2&VæFW"âF†—26†÷VÆBÖ—'&÷ ¢òòF†RÆöv–2öbv†WF†W"÷"æ÷B&ö÷B7W7VæG2öæ6R—B6ö×ÆWFW2à¢òòDôDó¢–bvRw&R&VæFW&–ær7–æ2V—F†W"GVRFò7–æ2Â&F6†VB÷"W‡—&VBÀ¢òòvR6†÷VÆB&ö&&Ç’æWfW"&W7F'Bà¢òò–bvRw&R7W7VæFVBv—F‚FVÆ’Â÷"–b—Bw2&WG'’ÂvRvÆÂÇv—27W7Væ@¢òò6òvR6âÇv—2&W7F'Bà¢–b‡v÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷E7W7VæFVEv—F„FVÆ’ÇÂv÷&´–å&öw&W75&ö÷DW†—E7FGW2ÓÓÒ&ö÷E7W7VæFVBbb–æ6ÇVFW4öæÇ•&WG&–W2‡v÷&´–å&öw&W75&ö÷E&VæFW$ÆæW2’bbæ÷r‚’ÒvÆö&ÄÖ÷7E&V6VçDfÆÆ&6µF–ÖRÂdÄÄ$4µõD…$õEDÄUôÕ2’°¢òò&W7F'Bg&öÒF†R&ö÷Bà¢&W&Tg&W6…7F6²‡&ö÷BÂæôÆæW2“°¢ÒVÇ6R°¢òòWfVâF†÷Vv‚vR6âwB&W7F'B&–v‡Bæ÷rÂvRÖ–v‡BvWBà¢òò÷÷'GVæ—G’ÆFW"â6òvRÖ&²F†—2&VæFW"2†f–ær–ærà¢v÷&´–å&öw&W75&ö÷E–ævVDÆæW2ÒÖW&vTÆæW2‡v÷&´–å&öw&W75&ö÷E–ævVDÆæW2Â–ævVDÆæW2“°¢Ð¢Ð ¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂWfVçEF–ÖR“°¢Ð ¢gVæ7F–öâ&WG'•F–ÖVD÷WD&÷VæF'’†&÷VæF'”f–&W"Â&WG'”ÆæR’°¢òòF†R&÷VæF'’f–&W"†7W7Vç6R6ö×öæVçB÷"7W7Vç6TÆ—7B6ö×öæVçB¢òò&Wf–÷W6Ç’v2&VæFW&VB–â—G2fÆÆ&6²7FFRâöæRöbF†R&öÖ—6W2F†@¢òò7W7VæFVB—B†2&W6öÇfVBÂv†–6‚ÖVç2BÆV7B'BöbF†RG&VRv0¢òòÆ–¶VÇ’Væ&Æö6¶VBâG'’&VæFW&–ærv–âÂBæWrÆæW2à¢–b‡&WG'”ÆæRÓÓÒæôÆæR’°¢òòDôDó¢76–vâF†—2Fò7W7Vç6U7FFRç&WG'”ÆæVòFòfö–@¢òòVææV6W76'’VçFævÆVÖVçCð¢&WG'”ÆæRÒ&WVW7E&WG'”ÆæR†&÷VæF'”f–&W"“°¢ÒòòDôDó¢7V6–Â66R–FÆR&–÷&—G“ð  ¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†&÷VæF'”f–&W"Â&WG'”ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢Ö&µ&ö÷EWFFVB‡&ö÷BÂ&WG'”ÆæRÂWfVçEF–ÖR“°¢Vç7W&U&ö÷D—566†VGVÆVB‡&ö÷BÂWfVçEF–ÖR“°¢Ð¢Ð ¢gVæ7F–öâ&WG'”FV‡–G&FVE7W7Vç6T&÷VæF'’†&÷VæF'”f–&W"’°¢f"7W7Vç6U7FFRÒ&÷VæF'”f–&W"æÖVÖö—¦VE7FFS°¢f"&WG'”ÆæRÒæôÆæS° ¢–b‡7W7Vç6U7FFRÓÒçVÆÂ’°¢&WG'”ÆæRÒ7W7Vç6U7FFRç&WG'”ÆæS°¢Ð ¢&WG'•F–ÖVD÷WD&÷VæF'’†&÷VæF'”f–&W"Â&WG'”ÆæR“°¢Ð¢gVæ7F–öâ&W6öÇfU&WG'•v¶V&ÆR†&÷VæF'”f–&W"Âv¶V&ÆR’°¢f"&WG'”ÆæRÒæôÆæS²òòFVfVÇ@ ¢f"&WG'”66†S° ¢7v—F6‚†&÷VæF'”f–&W"çFr’°¢66R7W7Vç6T6ö×öæVçC ¢&WG'”66†RÒ&÷VæF'”f–&W"ç7FFTæöFS°¢f"7W7Vç6U7FFRÒ&÷VæF'”f–&W"æÖVÖö—¦VE7FFS° ¢–b‡7W7Vç6U7FFRÓÒçVÆÂ’°¢&WG'”ÆæRÒ7W7Vç6U7FFRç&WG'”ÆæS°¢Ð ¢'&V³° ¢66R7W7Vç6TÆ—7D6ö×öæVçC ¢&WG'”66†RÒ&÷VæF'”f–&W"ç7FFTæöFS°¢'&V³° ¢FVfVÇC ¢F‡&÷ræWrW'&÷"‚u–ævVBVæ¶æ÷vâ7W7Vç6R&÷VæF'’G—Râr²uF†—2—2&ö&&Ç’'Vr–â&V7Bâr“°¢Ð ¢–b‡&WG'”66†RÓÒçVÆÂ’°¢òòF†Rv¶V&ÆR&W6öÇfVBÂ6òvRæòÆöævW"æVVBFòÖVÖö—¦RÂ&V6W6R—Bv–ÆÀ¢òòæWfW"&RF‡&÷vâv–âà¢&WG'”66†RæFVÆWFR‡v¶V&ÆR“°¢Ð ¢&WG'•F–ÖVD÷WD&÷VæF'’†&÷VæF'”f–&W"Â&WG'”ÆæR“°¢Òòò6ö×WFW2F†RæW‡B§W7Bæ÷F–6V&ÆRF–ffW&Væ6R„¤äB’&÷VæF'’à¢òòF†RF†V÷'’—2F†BW'6öâ6âwBFVÆÂF†RF–ffW&Væ6R&WGvVVâ6ÖÆÂF–ffW&Væ6W2–âF–ÖRà¢òòF†W&Vf÷&RÂ–bvRv—B&—BÆöævW"F†âæV6W76'’F†BvöâwBG&ç6ÆFRFòæ÷F–6V&ÆP¢òòF–ffW&Væ6R–âF†RW‡W&–Væ6Râ†÷vWfW"Âv—F–ærf÷"ÆöævW"Ö–v‡BÖVâF†BvR6âfö–@¢òò6†÷v–ærâ–çFW&ÖVF–FRÆöF–ær7FFRâF†RÆöævW"vR†fRÇ&VG’v—FVBÂF†R†&FW"—@¢òò—2FòFVÆÂ6ÖÆÂF–ffW&Væ6W2–âF–ÖRâF†W&Vf÷&RÂF†RÆöævW"vRwfRÇ&VG’v—FVBÀ¢òòF†RÆöævW"vR6âv—BFF—F–öæÆÇ’âB6öÖRö–çBvR†fRFòv—fRWF†÷Vv‚à¢òòvR–6²G&–âÖöFVÂv†W&RF†RæW‡B&÷VæF'’6öÖÖ—G2B6öç6—7FVçB66†VGVÆRà¢òòF†W6R'F–7VÆ"çVÖ&W'2&RfwVRW7F–ÖFW2âvRW‡V7BFòF§W7BF†VÒ&6VBöâ&W6V&6‚à ¢gVæ7F–öâ¦æB‡F–ÖTVÆ6VB’°¢&WGW&âF–ÖTVÆ6VBÂ#ò#¢F–ÖTVÆ6VBÂCƒòCƒ¢F–ÖTVÆ6VBÂƒòƒ¢F–ÖTVÆ6VBÂ“#ò“#¢F–ÖTVÆ6VBÂ3ò3¢F–ÖTVÆ6VBÂC3#òC3#¢6V–Â‡F–ÖTVÆ6VBò“c’¢“c°¢Ð ¢gVæ7F–öâ6†V6´f÷$æW7FVEWFFW2‚’°¢–b†æW7FVEWFFT6÷VçBâäU5DTEõUDDUôÄ”Ô•B’°¢æW7FVEWFFT6÷VçBÒ°¢&ö÷Ev—F„æW7FVEWFFW2ÒçVÆÃ°¢F‡&÷ræWrW'&÷"‚tÖ†–×VÒWFFRFWF‚W†6VVFVBâF†—26â†Vâv†Vâ6ö×öæVçBr²w&WVFVFÇ’6ÆÇ26WE7FFR–ç6–FR6ö×öæVçEv–ÆÅWFFR÷"r²v6ö×öæVçDF–EWFFRâ&V7BÆ–Ö—G2F†RçVÖ&W"öbæW7FVBWFFW2Fòr²w&WfVçB–æf–æ—FRÆö÷2âr“°¢Ð ¢°¢–b†æW7FVE76—fUWFFT6÷VçBâäU5DTEõ54•dUõUDDUôÄ”Ô•B’°¢æW7FVE76—fUWFFT6÷VçBÒ°¢&ö÷Ev—F…76—fTæW7FVEWFFW2ÒçVÆÃ° ¢W'&÷"‚tÖ†–×VÒWFFRFWF‚W†6VVFVBâF†—26â†Vâv†Vâ6ö×öæVçBr²&6ÆÇ26WE7FFR–ç6–FRW6TVffV7BÂ'WBW6TVffV7BV—F†W"FöW6âwB"²v†fRFWVæFVæ7’'&’Â÷"öæRöbF†RFWVæFVæ6–W26†ævW2öâr²vWfW'’&VæFW"âr“°¢Ð¢Ð¢Ð ¢gVæ7F–öâfÇW6…&VæFW%†6U7G&–7DÖöFUv&æ–æw4–äDUb‚’°¢°¢&V7E7G&–7DÖöFUv&æ–æw2æfÇW6„ÆVv7”6öçFW‡Ev&æ–ær‚“° ¢°¢&V7E7G&–7DÖöFUv&æ–æw2æfÇW6…VæF–æuVç6fTÆ–fV7–6ÆUv&æ–æw2‚“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6öÖÖ—DF÷V&ÆT–çfö¶TVffV7G4–äDUb†f–&W"Â†576—fTVffV7G2’°¢°¢òòDôDò…7G&–7DVffV7G2’6†÷VÆBvR6WBÖ&¶W"öâF†R&ö÷B–b—B6öçF–ç27G&–7BVffV7G0¢òò6òvRFöâwBG&fW'6RVææV6W76&–Ç“ò6–Ö–Æ"Fò7V'G&VTfÆw2'WB§W7BBF†R&ö÷BÆWfVÂà¢òòÖ–&Ræ÷B&–rFVÂ6–æ6RF†—2—2DUböæÇ’&V†f–÷"à¢6WD7W'&VçDf–&W"†f–&W"“°¢–çfö¶TVffV7G4–äFWb†f–&W"ÂÖ÷VçDÆ–÷WDFWbÂ–çfö¶TÆ–÷WDVffV7EVæÖ÷VçD–äDUb“° ¢–b††576—fTVffV7G2’°¢–çfö¶TVffV7G4–äFWb†f–&W"ÂÖ÷VçE76—fTFWbÂ–çfö¶U76—fTVffV7EVæÖ÷VçD–äDUb“°¢Ð ¢–çfö¶TVffV7G4–äFWb†f–&W"ÂÖ÷VçDÆ–÷WDFWbÂ–çfö¶TÆ–÷WDVffV7DÖ÷VçD–äDUb“° ¢–b††576—fTVffV7G2’°¢–çfö¶TVffV7G4–äFWb†f–&W"ÂÖ÷VçE76—fTFWbÂ–çfö¶U76—fTVffV7DÖ÷VçD–äDUb“°¢Ð ¢&W6WD7W'&VçDf–&W"‚“°¢Ð¢Ð ¢gVæ7F–öâ–çfö¶TVffV7G4–äFWb†f—'7D6†–ÆBÂf–&W$fÆw2Â–çfö¶TVffV7Dfâ’°¢°¢òòvRFöâwBæVVBFò&RÖ6†V6²7G&–7DVffV7G4ÖöFR†W&Rà¢òòF†—2gVæ7F–öâ—2öæÇ’6ÆÆVB–bF†B6†V6²†2Ç&VG’76VBà¢f"7W'&VçBÒf—'7D6†–ÆC°¢f"7V'G&VU&ö÷BÒçVÆÃ° ¢v†–ÆR†7W'&VçBÓÒçVÆÂ’°¢f"&–Ö'•7V'G&VTfÆrÒ7W'&VçBç7V'G&VTfÆw2bf–&W$fÆw3° ¢–b†7W'&VçBÓÒ7V'G&VU&ö÷Bbb7W'&VçBæ6†–ÆBÓÒçVÆÂbb&–Ö'•7V'G&VTfÆrÓÒæôfÆw2’°¢7W'&VçBÒ7W'&VçBæ6†–ÆC°¢ÒVÇ6R°¢–b‚†7W'&VçBæfÆw2bf–&W$fÆw2’ÓÒæôfÆw2’°¢–çfö¶TVffV7Dfâ†7W'&VçB“°¢Ð ¢–b†7W'&VçBç6–&Æ–ærÓÒçVÆÂ’°¢7W'&VçBÒ7W'&VçBç6–&Æ–æs°¢ÒVÇ6R°¢7W'&VçBÒ7V'G&VU&ö÷BÒ7W'&VçBç&WGW&ã°¢Ð¢Ð¢Ð¢Ð¢Ð ¢f"F–Ev&å7FFUWFFTf÷$æ÷E–WDÖ÷VçFVD6ö×öæVçBÒçVÆÃ°¢gVæ7F–öâv&ä&÷WEWFFTöäæ÷E–WDÖ÷VçFVDf–&W$–äDUb†f–&W"’°¢°¢–b‚†W†V7WF–öä6öçFW‡Bb&VæFW$6öçFW‡B’ÓÒæô6öçFW‡B’°¢òòvRÆWBF†R÷F†W"v&æ–ær&÷WB&VæFW"†6RWFFW2FVÂv—F‚F†—2öæRà¢&WGW&ã°¢Ð ¢–b‚†f–&W"æÖöFRb6öæ7W'&VçDÖöFR’’°¢&WGW&ã°¢Ð ¢f"FrÒf–&W"çFs° ¢–b‡FrÓÒ–æFWFW&Ö–æFT6ö×öæVçBbbFrÓÒ†÷7E&ö÷BbbFrÓÒ6Æ746ö×öæVçBbbFrÓÒgVæ7F–öä6ö×öæVçBbbFrÓÒf÷'v&E&VbbbFrÓÒÖVÖô6ö×öæVçBbbFrÓÒ6–×ÆTÖVÖô6ö×öæVçB’°¢òòöæÇ’v&âf÷"W6W"ÖFVf–æVB6ö×öæVçG2Âæ÷B–çFW&æÂöæW2Æ–¶R7W7Vç6Rà¢&WGW&ã°¢ÒòòvR6†÷rF†Rv†öÆR7F6²'WBFVGWRöâF†RF÷6ö×öæVçBw2æÖR&V6W6P¢òòF†R&ö&ÆVÖF–26öFRÆÖ÷7BÇv—2Æ–W2–ç6–FRF†B6ö×öæVçBà  ¢f"6ö×öæVçDæÖRÒvWD6ö×öæVçDæÖTg&öÔf–&W"†f–&W"’ÇÂu&V7D6ö×öæVçBs° ¢–b†F–Ev&å7FFUWFFTf÷$æ÷E–WDÖ÷VçFVD6ö×öæVçBÓÒçVÆÂ’°¢–b†F–Ev&å7FFUWFFTf÷$æ÷E–WDÖ÷VçFVD6ö×öæVçBæ†2†6ö×öæVçDæÖR’’°¢&WGW&ã°¢Ð ¢F–Ev&å7FFUWFFTf÷$æ÷E–WDÖ÷VçFVD6ö×öæVçBæFB†6ö×öæVçDæÖR“°¢ÒVÇ6R°¢F–Ev&å7FFUWFFTf÷$æ÷E–WDÖ÷VçFVD6ö×öæVçBÒæWr6WB…¶6ö×öæVçDæÖUÒ“°¢Ð ¢f"&Wf–÷W4f–&W"Ò7W'&VçC° ¢G'’°¢6WD7W'&VçDf–&W"†f–&W"“° ¢W'&÷"‚$6âwBW&f÷&Ò&V7B7FFRWFFRöâ6ö×öæVçBF†B†6âwBÖ÷VçFVB–WBâ"²uF†—2–æF–6FW2F†B–÷R†fR6–FRÖVffV7B–â–÷W"&VæFW"gVæ7F–öâF†Br²v7–æ6‡&öæ÷W6Ç’ÆFW"6ÆÇ2G&–W2FòWFFRF†R6ö×öæVçBâÖ÷fRF†—2v÷&²Fòr²wW6TVffV7B–ç7FVBâr“°¢Òf–æÆÇ’°¢–b‡&Wf–÷W4f–&W"’°¢6WD7W'&VçDf–&W"†f–&W"“°¢ÒVÇ6R°¢&W6WD7W'&VçDf–&W"‚“°¢Ð¢Ð¢Ð¢Ð¢f"&Vv–åv÷&²C° ¢°¢f"GVÖ×”f–&W"ÒçVÆÃ° ¢&Vv–åv÷&²CÒgVæ7F–öâ†7W'&VçBÂVæ—Döev÷&²ÂÆæW2’°¢òò–b6ö×öæVçBF‡&÷w2âW'&÷"ÂvR&WÆ’—Bv–â–â7–æ6‡&öæ÷W6Ç¢òòF—7F6†VBWfVçBÂ6òF†BF†RFV'VvvW"v–ÆÂG&VB—B2âVæ6Vv‡@¢òòW'&÷"6VR&V7DW'&÷%WF–Ç2f÷"Ö÷&R–æf÷&ÖF–öâà¢òò&Vf÷&RVçFW&–ærF†R&Vv–â†6RÂ6÷’F†Rv÷&²Ö–â×&öw&W72öçFòGVÖ×¢òòf–&W"â–b&Vv–åv÷&²F‡&÷w2ÂvRvÆÂW6RF†—2Fò&W6WBF†R7FFRà¢f"÷&–v–æÅv÷&´–å&öw&W746÷’Ò76–väf–&W%&÷W'F–W4–äDUb†GVÖ×”f–&W"ÂVæ—Döev÷&²“° ¢G'’°¢&WGW&â&Vv–åv÷&²†7W'&VçBÂVæ—Döev÷&²ÂÆæW2“°¢Ò6F6‚†÷&–v–æÄW'&÷"’°¢–b†F–E7W7VæD÷$W'&÷%v†–ÆT‡–G&F–ætDUb‚’ÇÂ÷&–v–æÄW'&÷"ÓÒçVÆÂbbG—Vöb÷&–v–æÄW'&÷"ÓÓÒvö&¦V7BrbbG—Vöb÷&–v–æÄW'&÷"çF†VâÓÓÒvgVæ7F–öâr’°¢òòFöâwB&WÆ’&öÖ—6W2à¢òòFöâwB&WÆ’W'&÷'2–bvR&R‡–G&F–æræB†fRÇ&VG’7W7VæFVB÷"†æFÆVBâW'&÷ ¢F‡&÷r÷&–v–æÄW'&÷#°¢Òòò¶VWF†—26öFR–â7–æ2v—F‚†æFÆTW'&÷#²ç’6†ævW2†W&R×W7B†fP¢òò6÷'&W7öæF–ær6†ævW2F†W&Rà  ¢&W6WD6öçFW‡DFWVæFVæ6–W2‚“°¢&W6WD†öö·4gFW%F‡&÷r‚“²òòFöâwB&W6WB7W'&VçBFV'Vrf–&W"Â6–æ6RvRw&R&÷WBFòv÷&²öâF†P¢òò6ÖRf–&W"v–âà¢òòVçv–æBF†Rf–ÆVB7F6²g&ÖP ¢Vçv–æD–çFW''WFVEv÷&²†7W'&VçBÂVæ—Döev÷&²“²òò&W7F÷&RF†R÷&–v–æÂ&÷W'F–W2öbF†Rf–&W"à ¢76–väf–&W%&÷W'F–W4–äDUb‡Væ—Döev÷&²Â÷&–v–æÅv÷&´–å&öw&W746÷’“° ¢–b‚Væ—Döev÷&²æÖöFRb&öf–ÆTÖöFR’°¢òò&W6WBF†R&öf–ÆW"F–ÖW"à¢7F'E&öf–ÆW%F–ÖW"‡Væ—Döev÷&²“°¢Òòò'Vâ&Vv–åv÷&²v–âà  ¢–çfö¶TwV&FVD6ÆÆ&6²†çVÆÂÂ&Vv–åv÷&²ÂçVÆÂÂ7W'&VçBÂVæ—Döev÷&²ÂÆæW2“° ¢–b††46Vv‡DW'&÷"‚’’°¢f"&WÆ”W'&÷"Ò6ÆV$6Vv‡DW'&÷"‚“° ¢–b‡G—Vöb&WÆ”W'&÷"ÓÓÒvö&¦V7Brbb&WÆ”W'&÷"ÓÒçVÆÂbb&WÆ”W'&÷"å÷7W&W74Æövv–ærbbG—Vöb÷&–v–æÄW'&÷"ÓÓÒvö&¦V7Brbb÷&–v–æÄW'&÷"ÓÒçVÆÂbb÷&–v–æÄW'&÷"å÷7W&W74Æövv–ær’°¢òò–b7W&W76VBÂÆWBF†RfÆr6''’÷fW"FòF†R÷&–v–æÂW'&÷"v†–6‚—2F†RöæRvRvÆÂ&WF‡&÷rà¢÷&–v–æÄW'&÷"å÷7W&W74Æövv–ærÒG'VS°¢Ð¢ÒòòvRÇv—2F‡&÷rF†R÷&–v–æÂW'&÷"–â66RF†R6V6öæB&VæFW"72—2æ÷B–FV×÷FVçBà¢òòF†—26â†Vâ–bÖVÖö—¦VBgVæ7F–öâ÷"6öÖÖöä¥2ÖöGVÆRFöW6âwBF‡&÷rgFW"f—'7B–çfö6F–öâà  ¢F‡&÷r÷&–v–æÄW'&÷#°¢Ð¢Ó°¢Ð ¢f"F–Ev&ä&÷WEWFFT–å&VæFW"ÒfÇ6S°¢f"F–Ev&ä&÷WEWFFT–å&VæFW$f÷$æ÷F†W$6ö×öæVçC° ¢°¢F–Ev&ä&÷WEWFFT–å&VæFW$f÷$æ÷F†W$6ö×öæVçBÒæWr6WB‚“°¢Ð ¢gVæ7F–öâv&ä&÷WE&VæFW%†6UWFFW4–äDUb†f–&W"’°¢°¢–b†—5&VæFW&–ærbbvWD—5WFF–æt÷VUfÇVT–å&VæFW%†6T–äDUb‚’’°¢7v—F6‚†f–&W"çFr’°¢66RgVæ7F–öä6ö×öæVçC ¢66Rf÷'v&E&Vc ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢f"&VæFW&–æt6ö×öæVçDæÖRÒv÷&´–å&öw&W72bbvWD6ö×öæVçDæÖTg&öÔf–&W"‡v÷&´–å&öw&W72’ÇÂuVæ¶æ÷vâs²òòFVGWR'’F†R&VæFW&–ær6ö×öæVçB&V6W6R—Bw2F†RöæRF†BæVVG2Fò&Rf—†VBà ¢f"FVGWT¶W’Ò&VæFW&–æt6ö×öæVçDæÖS° ¢–b‚F–Ev&ä&÷WEWFFT–å&VæFW$f÷$æ÷F†W$6ö×öæVçBæ†2†FVGWT¶W’’’°¢F–Ev&ä&÷WEWFFT–å&VæFW$f÷$æ÷F†W$6ö×öæVçBæFB†FVGWT¶W’“°¢f"6WE7FFT6ö×öæVçDæÖRÒvWD6ö×öæVçDæÖTg&öÔf–&W"†f–&W"’ÇÂuVæ¶æ÷vâs° ¢W'&÷"‚t6ææ÷BWFFR6ö×öæVçB†W6’v†–ÆR&VæFW&–ærr²vF–ffW&VçB6ö×öæVçB†W6’âFòÆö6FRF†R&B6WE7FFR‚’6ÆÂ–ç6–FRW6Âr²vföÆÆ÷rF†R7F6²G&6R2FW67&–&VB–â‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷6WG7FFRÖ–â×&VæFW"rÂ6WE7FFT6ö×öæVçDæÖRÂ&VæFW&–æt6ö×öæVçDæÖRÂ&VæFW&–æt6ö×öæVçDæÖR“°¢Ð ¢'&V³°¢Ð ¢66R6Æ746ö×öæVçC ¢°¢–b‚F–Ev&ä&÷WEWFFT–å&VæFW"’°¢W'&÷"‚t6ææ÷BWFFRGW&–ærâW†—7F–ær7FFRG&ç6—F–öâ‡7V6‚2r²wv—F†–â&VæFW&’â&VæFW"ÖWF†öG26†÷VÆB&RW&Rr²vgVæ7F–öâöb&÷2æB7FFRâr“° ¢F–Ev&ä&÷WEWFFT–å&VæFW"ÒG'VS°¢Ð ¢'&V³°¢Ð¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâ&W7F÷&UVæF–æuWFFW'2‡&ö÷BÂÆæW2’°¢°¢–b†—4FWeFööÇ5&W6VçB’°¢f"ÖVÖö—¦VEWFFW'2Ò&ö÷BæÖVÖö—¦VEWFFW'3°¢ÖVÖö—¦VEWFFW'2æf÷$V6‚†gVæ7F–öâ‡66†VGVÆ–ætf–&W"’°¢FDf–&W%FôÆæW4Ö‡&ö÷BÂ66†VGVÆ–ætf–&W"ÂÆæW2“°¢Ò“²òòF†—2gVæ7F–öâ–çFVçF–öæÆÇ’FöW2æ÷B6ÆV"ÖVÖö—¦VBWFFW'2à¢òòF†÷6RÖ’7F–ÆÂ&R&VÆWfçBFòF†R7W'&VçB6öÖÖ—@¢òòæBgWGW&RöæR†Rærâ7W7Vç6R’à¢Ð¢Ð¢Ð¢f"f¶T7D6ÆÆ&6´æöFRÒ·Ó° ¢gVæ7F–öâ66†VGVÆT6ÆÆ&6²C‡&–÷&—G”ÆWfVÂÂ6ÆÆ&6²’°¢°¢òò–bvRw&R7W'&VçFÇ’–ç6–FRâ7F66÷RÂ'—7266†VGVÆW"æBW6‚Fð¢òòF†R7FVWVR–ç7FVBà¢f"7EVWVRÒ&V7D7W'&VçD7EVWVRCæ7W'&VçC° ¢–b†7EVWVRÓÒçVÆÂ’°¢7EVWVRçW6‚†6ÆÆ&6²“°¢&WGW&âf¶T7D6ÆÆ&6´æöFS°¢ÒVÇ6R°¢&WGW&â66†VGVÆT6ÆÆ&6²‡&–÷&—G”ÆWfVÂÂ6ÆÆ&6²“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6æ6VÄ6ÆÆ&6²C†6ÆÆ&6´æöFR’°¢–b‚6ÆÆ&6´æöFRÓÓÒf¶T7D6ÆÆ&6´æöFR’°¢&WGW&ã°¢Òòò–â&öGV7F–öâÂÇv—26ÆÂ66†VGVÆW"âF†—2gVæ7F–öâv–ÆÂ&R7G&—VB÷WBà  ¢&WGW&â6æ6VÄ6ÆÆ&6²†6ÆÆ&6´æöFR“°¢Ð ¢gVæ7F–öâ6†÷VÆDf÷&6TfÇW6„fÆÆ&6·4–äDUb‚’°¢òòæWfW"f÷&6RfÇW6‚–â&öGV7F–öââF†—2gVæ7F–öâ6†÷VÆBvWB7G&—VB÷WBà¢&WGW&â&V7D7W'&VçD7EVWVRCæ7W'&VçBÓÒçVÆÃ°¢Ð ¢gVæ7F–öâv&ä–eWFFW4æ÷Ew&VEv—F„7DDUb†f–&W"’°¢°¢–b†f–&W"æÖöFRb6öæ7W'&VçDÖöFR’°¢–b‚—46öæ7W'&VçD7DVçf—&öæÖVçB‚’’°¢òòæ÷B–ââ7BVçf—&öæÖVçBâæòæVVBFòv&âà¢&WGW&ã°¢Ð¢ÒVÇ6R°¢òòÆVv7’ÖöFR†2FF—F–öæÂ66W2v†W&RvR7W&W72v&æ–ærà¢–b‚—4ÆVv7”7DVçf—&öæÖVçB‚’’°¢òòæ÷B–ââ7BVçf—&öæÖVçBâæòæVVBFòv&âà¢&WGW&ã°¢Ð ¢–b†W†V7WF–öä6öçFW‡BÓÒæô6öçFW‡B’°¢òòÆVv7’ÖöFRFöW6âwBv&â–bF†RWFFR—2&F6†VBÂ’æRà¢òò&F6†VEWFFW2÷"fÇW6…7–æ2à¢&WGW&ã°¢Ð ¢–b†f–&W"çFrÓÒgVæ7F–öä6ö×öæVçBbbf–&W"çFrÓÒf÷'v&E&Vbbbf–&W"çFrÓÒ6–×ÆTÖVÖô6ö×öæVçB’°¢òòf÷"&6·v&G26ö×F–&–Æ—G’v—F‚&RÖ†öö·26öFRÂÆVv7’ÖöFRöæÇ¢òòv&ç2f÷"WFFW2F†B÷&–v–æFRg&öÒ†öö²à¢&WGW&ã°¢Ð¢Ð ¢–b…&V7D7W'&VçD7EVWVRCæ7W'&VçBÓÓÒçVÆÂ’°¢f"&Wf–÷W4f–&W"Ò7W'&VçC° ¢G'’°¢6WD7W'&VçDf–&W"†f–&W"“° ¢W'&÷"‚tâWFFRFòW2–ç6–FRFW7Bv2æ÷Bw&VB–â7B‚âââ’åÆåÆâr²uv†VâFW7F–ærÂ6öFRF†B6W6W2&V7B7FFRWFFW26†÷VÆB&Rr²ww&VB–çFò7B‚âââ“¥ÆåÆâr²v7B‚‚’ÓâµÆâr²rò¢f—&RWfVçG2F†BWFFR7FFR¢õÆâr²wÒ“µÆâr²rò¢76W'BöâF†R÷WGWB¢õÆåÆâr²%F†—2Vç7W&W2F†B–÷Rw&RFW7F–ærF†R&V†f–÷"F†RW6W"v÷VÆB6VR"²v–âF†R'&÷w6W"âr²rÆV&âÖ÷&RB‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷w&×FW7G2×v—F‚Ö7BrÂvWD6ö×öæVçDæÖTg&öÔf–&W"†f–&W"’“°¢Òf–æÆÇ’°¢–b‡&Wf–÷W4f–&W"’°¢6WD7W'&VçDf–&W"†f–&W"“°¢ÒVÇ6R°¢&W6WD7W'&VçDf–&W"‚“°¢Ð¢Ð¢Ð¢Ð¢Ð ¢gVæ7F–öâv&ä–e7W7Vç6U&W6öÇWF–öäæ÷Ew&VEv—F„7DDUb‡&ö÷B’°¢°¢–b‡&ö÷BçFrÓÒÆVv7•&ö÷Bbb—46öæ7W'&VçD7DVçf—&öæÖVçB‚’bb&V7D7W'&VçD7EVWVRCæ7W'&VçBÓÓÒçVÆÂ’°¢W'&÷"‚t7W7VæFVB&W6÷W&6Rf–æ—6†VBÆöF–ær–ç6–FRFW7BÂ'WBF†RWfVçBr²wv2æ÷Bw&VB–â7B‚âââ’åÆåÆâr²uv†VâFW7F–ærÂ6öFRF†B&W6öÇfW27W7VæFVBFF6†÷VÆB&Rw&VBr²v–çFò7B‚âââ“¥ÆåÆâr²v7B‚‚’ÓâµÆâr²rò¢f–æ—6‚ÆöF–ær7W7VæFVBFF¢õÆâr²wÒ“µÆâr²rò¢76W'BöâF†R÷WGWB¢õÆåÆâr²%F†—2Vç7W&W2F†B–÷Rw&RFW7F–ærF†R&V†f–÷"F†RW6W"v÷VÆB6VR"²v–âF†R'&÷w6W"âr²rÆV&âÖ÷&RB‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷w&×FW7G2×v—F‚Ö7Br“°¢Ð¢Ð¢Ð ¢gVæ7F–öâ6WD—5'Vææ–æt–ç6W'F–öäVffV7B†—5'Vææ–ær’°¢°¢—5'Vææ–æt–ç6W'F–öäVffV7BÒ—5'Vææ–æs°¢Ð¢Ð ¢ò¢W6Æ–çBÖF—6&ÆR&V7BÖ–çFW&æÂ÷&öBÖW'&÷"Ö6öFW2¢ð¢f"&W6öÇfTfÖ–Ç’ÒçVÆÃ²òòDfÆ÷tf—„ÖRfÆ÷rvWG26öægW6VB'’vVµ6WBfVGW&R6†V6²&VÆ÷rà ¢f"f–ÆVD&÷VæF&–W2ÒçVÆÃ°¢f"6WE&Vg&W6„†æFÆW"ÒgVæ7F–öâ††æFÆW"’°¢°¢&W6öÇfTfÖ–Ç’Ò†æFÆW#°¢Ð¢Ó°¢gVæ7F–öâ&W6öÇfTgVæ7F–öäf÷$†÷E&VÆöF–ær‡G—R’°¢°¢–b‡&W6öÇfTfÖ–Ç’ÓÓÒçVÆÂ’°¢òò†÷B&VÆöF–ær—2F—6&ÆVBà¢&WGW&âG—S°¢Ð ¢f"fÖ–Ç’Ò&W6öÇfTfÖ–Ç’‡G—R“° ¢–b†fÖ–Ç’ÓÓÒVæFVf–æVB’°¢&WGW&âG—S°¢ÒòòW6RF†RÆFW7B¶æ÷vâ–×ÆVÖVçFF–öâà  ¢&WGW&âfÖ–Ç’æ7W'&VçC°¢Ð¢Ð¢gVæ7F–öâ&W6öÇfT6Æ74f÷$†÷E&VÆöF–ær‡G—R’°¢òòæò–×ÆVÖVçFF–öâF–ffW&Væ6W2à¢&WGW&â&W6öÇfTgVæ7F–öäf÷$†÷E&VÆöF–ær‡G—R“°¢Ð¢gVæ7F–öâ&W6öÇfTf÷'v&E&Vdf÷$†÷E&VÆöF–ær‡G—R’°¢°¢–b‡&W6öÇfTfÖ–Ç’ÓÓÒçVÆÂ’°¢òò†÷B&VÆöF–ær—2F—6&ÆVBà¢&WGW&âG—S°¢Ð ¢f"fÖ–Ç’Ò&W6öÇfTfÖ–Ç’‡G—R“° ¢–b†fÖ–Ç’ÓÓÒVæFVf–æVB’°¢òò6†V6²–bvRw&RFVÆ–ærv—F‚&VÂf÷'v&E&VbâFöâwBvçBFò7&6‚V&Ç’à¢–b‡G—RÓÒçVÆÂbbG—RÓÒVæFVf–æVBbbG—VöbG—Rç&VæFW"ÓÓÒvgVæ7F–öâr’°¢òòf÷'v&E&Vb—27V6–Â&V6W6R—G2&W6öÇfVBçG—R—2âö&¦V7BÀ¢òò'WB—Bw2÷76–&ÆRF†BvRöæÇ’†fR—G2–ææW"&VæFW"gVæ7F–öâ–âF†RÖà¢òò–bF†B–ææW"&VæFW"gVæ7F–öâ—2F–ffW&VçBÂvRvÆÂ'V–ÆBæWrf÷'v&E&VbG—Rà¢f"7W'&VçE&VæFW"Ò&W6öÇfTgVæ7F–öäf÷$†÷E&VÆöF–ær‡G—Rç&VæFW"“° ¢–b‡G—Rç&VæFW"ÓÒ7W'&VçE&VæFW"’°¢f"7–çF†WF–5G—RÒ°¢BGG—Vöc¢$T5Eôdõ%t$Eõ$TeõE•RÀ¢&VæFW#¢7W'&VçE&VæFW ¢Ó° ¢–b‡G—RæF—7Æ”æÖRÓÒVæFVf–æVB’°¢7–çF†WF–5G—RæF—7Æ”æÖRÒG—RæF—7Æ”æÖS°¢Ð ¢&WGW&â7–çF†WF–5G—S°¢Ð¢Ð ¢&WGW&âG—S°¢ÒòòW6RF†RÆFW7B¶æ÷vâ–×ÆVÖVçFF–öâà  ¢&WGW&âfÖ–Ç’æ7W'&VçC°¢Ð¢Ð¢gVæ7F–öâ—46ö×F–&ÆTfÖ–Ç”f÷$†÷E&VÆöF–ær†f–&W"ÂVÆVÖVçB’°¢°¢–b‡&W6öÇfTfÖ–Ç’ÓÓÒçVÆÂ’°¢òò†÷B&VÆöF–ær—2F—6&ÆVBà¢&WGW&âfÇ6S°¢Ð ¢f"&WeG—RÒf–&W"æVÆVÖVçEG—S°¢f"æW‡EG—RÒVÆVÖVçBçG—S²òò–bvRv÷B†W&RÂvR¶æ÷rG—W2&VâwBÓÓÒWVÂà ¢f"æVVG46ö×&TfÖ–Æ–W2ÒfÇ6S°¢f"BGG—VödæW‡EG—RÒG—VöbæW‡EG—RÓÓÒvö&¦V7BrbbæW‡EG—RÓÒçVÆÂòæW‡EG—RâBGG—Vöb¢çVÆÃ° ¢7v—F6‚†f–&W"çFr’°¢66R6Æ746ö×öæVçC ¢°¢–b‡G—VöbæW‡EG—RÓÓÒvgVæ7F–öâr’°¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢Ð ¢'&V³°¢Ð ¢66RgVæ7F–öä6ö×öæVçC ¢°¢–b‡G—VöbæW‡EG—RÓÓÒvgVæ7F–öâr’°¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢ÒVÇ6R–b‚BGG—VödæW‡EG—RÓÓÒ$T5EôÄ¥•õE•R’°¢òòvRFöâwB¶æ÷rF†R–ææW"G—R–WBà¢òòvRw&Rvö–ærFò77VÖRF†BF†RÆ§’–ææW"G—R—27F&ÆRÀ¢òòæB6ò—B—27Vff–6–VçBFòfö–B&V6öæ6–Æ–ær—Bv’à¢òòvRw&Ræ÷Bvö–ærFòVçw&÷"7GVÆÇ’W6RF†RæWrÆ§’G—Rà¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢Ð ¢'&V³°¢Ð ¢66Rf÷'v&E&Vc ¢°¢–b‚BGG—VödæW‡EG—RÓÓÒ$T5Eôdõ%t$Eõ$TeõE•R’°¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢ÒVÇ6R–b‚BGG—VödæW‡EG—RÓÓÒ$T5EôÄ¥•õE•R’°¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢Ð ¢'&V³°¢Ð ¢66RÖVÖô6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢°¢–b‚BGG—VödæW‡EG—RÓÓÒ$T5EôÔTÔõõE•R’°¢òòDôDó¢–b—Bv2'WB6âæòÆöævW"&R6–×ÆRÀ¢òòvR6†÷VÆFâwB6WBF†—2à¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢ÒVÇ6R–b‚BGG—VödæW‡EG—RÓÓÒ$T5EôÄ¥•õE•R’°¢æVVG46ö×&TfÖ–Æ–W2ÒG'VS°¢Ð ¢'&V³°¢Ð ¢FVfVÇC ¢&WGW&âfÇ6S°¢Òòò6†V6²–b&÷F‚G—W2†fRfÖ–Ç’æB—Bw2F†R6ÖRöæRà  ¢–b†æVVG46ö×&TfÖ–Æ–W2’°¢òòæ÷FS¢ÖVÖò‚’æBf÷'v&E&Vb‚’vRvÆÂ6ö×&R÷WFW"&F†W"F†â–ææW"G—Rà¢òòF†—2ÖVç2&÷F‚öbF†VÒæVVBFò&R&Vv—7FW&VBFò&W6W'fR7FFRà¢òò–bvRVçw&VBæB6ö×&VBF†R–ææW"G—W2f÷"w&W'2–ç7FVBÀ¢òòF†VâvRv÷VÆB&—6²fÇ6VÇ’6––ærGvò6W&FRÖVÖò„föò¢òò6ÆÇ2&RWV—fÆVçB&V6W6RF†W’w&F†R6ÖRföògVæ7F–öâà¢f"&WdfÖ–Ç’Ò&W6öÇfTfÖ–Ç’‡&WeG—R“° ¢–b‡&WdfÖ–Ç’ÓÒVæFVf–æVBbb&WdfÖ–Ç’ÓÓÒ&W6öÇfTfÖ–Ç’†æW‡EG—R’’°¢&WGW&âG'VS°¢Ð¢Ð ¢&WGW&âfÇ6S°¢Ð¢Ð¢gVæ7F–öâÖ&´f–ÆVDW'&÷$&÷VæF'”f÷$†÷E&VÆöF–ær†f–&W"’°¢°¢–b‡&W6öÇfTfÖ–Ç’ÓÓÒçVÆÂ’°¢òò†÷B&VÆöF–ær—2F—6&ÆVBà¢&WGW&ã°¢Ð ¢–b‡G—VöbvVµ6WBÓÒvgVæ7F–öâr’°¢&WGW&ã°¢Ð ¢–b†f–ÆVD&÷VæF&–W2ÓÓÒçVÆÂ’°¢f–ÆVD&÷VæF&–W2ÒæWrvVµ6WB‚“°¢Ð ¢f–ÆVD&÷VæF&–W2æFB†f–&W"“°¢Ð¢Ð¢f"66†VGVÆU&Vg&W6‚ÒgVæ7F–öâ‡&ö÷BÂWFFR’°¢°¢–b‡&W6öÇfTfÖ–Ç’ÓÓÒçVÆÂ’°¢òò†÷B&VÆöF–ær—2F—6&ÆVBà¢&WGW&ã°¢Ð ¢f"7FÆTfÖ–Æ–W2ÒWFFRç7FÆTfÖ–Æ–W2À¢WFFVDfÖ–Æ–W2ÒWFFRçWFFVDfÖ–Æ–W3°¢fÇW6…76—fTVffV7G2‚“°¢fÇW6…7–æ2†gVæ7F–öâ‚’°¢66†VGVÆTf–&W'5v—F„fÖ–Æ–W5&V7W'6—fVÇ’‡&ö÷Bæ7W'&VçBÂWFFVDfÖ–Æ–W2Â7FÆTfÖ–Æ–W2“°¢Ò“°¢Ð¢Ó°¢f"66†VGVÆU&ö÷BÒgVæ7F–öâ‡&ö÷BÂVÆVÖVçB’°¢°¢–b‡&ö÷Bæ6öçFW‡BÓÒV×G”6öçFW‡Dö&¦V7B’°¢òò7WW"VFvR66S¢&ö÷B†2ÆVv7’÷&VæFW%7V'G&VR6öçFW‡@¢òò'WBvRFöâwB¶æ÷rF†R&VçD6ö×öæVçB6òvR6âwB72—Bà¢òò§W7B–væ÷&RâvRvÆÂFVÆWFRF†—2v—F‚÷&VæFW%7V'G&VR6öFRF‚ÆFW"à¢&WGW&ã°¢Ð ¢fÇW6…76—fTVffV7G2‚“°¢fÇW6…7–æ2†gVæ7F–öâ‚’°¢WFFT6öçF–æW"†VÆVÖVçBÂ&ö÷BÂçVÆÂÂçVÆÂ“°¢Ò“°¢Ð¢Ó° ¢gVæ7F–öâ66†VGVÆTf–&W'5v—F„fÖ–Æ–W5&V7W'6—fVÇ’†f–&W"ÂWFFVDfÖ–Æ–W2Â7FÆTfÖ–Æ–W2’°¢°¢f"ÇFW&æFRÒf–&W"æÇFW&æFRÀ¢6†–ÆBÒf–&W"æ6†–ÆBÀ¢6–&Æ–ærÒf–&W"ç6–&Æ–ærÀ¢FrÒf–&W"çFrÀ¢G—RÒf–&W"çG—S°¢f"6æF–FFUG—RÒçVÆÃ° ¢7v—F6‚‡Fr’°¢66RgVæ7F–öä6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢66R6Æ746ö×öæVçC ¢6æF–FFUG—RÒG—S°¢'&V³° ¢66Rf÷'v&E&Vc ¢6æF–FFUG—RÒG—Rç&VæFW#°¢'&V³°¢Ð ¢–b‡&W6öÇfTfÖ–Ç’ÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚tW‡V7FVB&W6öÇfTfÖ–Ç’Fò&R6WBGW&–ær†÷B&VÆöBâr“°¢Ð ¢f"æVVG5&VæFW"ÒfÇ6S°¢f"æVVG5&VÖ÷VçBÒfÇ6S° ¢–b†6æF–FFUG—RÓÒçVÆÂ’°¢f"fÖ–Ç’Ò&W6öÇfTfÖ–Ç’†6æF–FFUG—R“° ¢–b†fÖ–Ç’ÓÒVæFVf–æVB’°¢–b‡7FÆTfÖ–Æ–W2æ†2†fÖ–Ç’’’°¢æVVG5&VÖ÷VçBÒG'VS°¢ÒVÇ6R–b‡WFFVDfÖ–Æ–W2æ†2†fÖ–Ç’’’°¢–b‡FrÓÓÒ6Æ746ö×öæVçB’°¢æVVG5&VÖ÷VçBÒG'VS°¢ÒVÇ6R°¢æVVG5&VæFW"ÒG'VS°¢Ð¢Ð¢Ð¢Ð ¢–b†f–ÆVD&÷VæF&–W2ÓÒçVÆÂ’°¢–b†f–ÆVD&÷VæF&–W2æ†2†f–&W"’ÇÂÇFW&æFRÓÒçVÆÂbbf–ÆVD&÷VæF&–W2æ†2†ÇFW&æFR’’°¢æVVG5&VÖ÷VçBÒG'VS°¢Ð¢Ð ¢–b†æVVG5&VÖ÷VçB’°¢f–&W"åöFV'VtæVVG5&VÖ÷VçBÒG'VS°¢Ð ¢–b†æVVG5&VÖ÷VçBÇÂæVVG5&VæFW"’°¢f"÷&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b…÷&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"…÷&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ð ¢–b†6†–ÆBÓÒçVÆÂbbæVVG5&VÖ÷VçB’°¢66†VGVÆTf–&W'5v—F„fÖ–Æ–W5&V7W'6—fVÇ’†6†–ÆBÂWFFVDfÖ–Æ–W2Â7FÆTfÖ–Æ–W2“°¢Ð ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢66†VGVÆTf–&W'5v—F„fÖ–Æ–W5&V7W'6—fVÇ’‡6–&Æ–ærÂWFFVDfÖ–Æ–W2Â7FÆTfÖ–Æ–W2“°¢Ð¢Ð¢Ð ¢f"f–æD†÷7D–ç7Fæ6W4f÷%&Vg&W6‚ÒgVæ7F–öâ‡&ö÷BÂfÖ–Æ–W2’°¢°¢f"†÷7D–ç7Fæ6W2ÒæWr6WB‚“°¢f"G—W2ÒæWr6WB†fÖ–Æ–W2æÖ†gVæ7F–öâ†fÖ–Ç’’°¢&WGW&âfÖ–Ç’æ7W'&VçC°¢Ò’“°¢f–æD†÷7D–ç7Fæ6W4f÷$ÖF6†–ætf–&W'5&V7W'6—fVÇ’‡&ö÷Bæ7W'&VçBÂG—W2Â†÷7D–ç7Fæ6W2“°¢&WGW&â†÷7D–ç7Fæ6W3°¢Ð¢Ó° ¢gVæ7F–öâf–æD†÷7D–ç7Fæ6W4f÷$ÖF6†–ætf–&W'5&V7W'6—fVÇ’†f–&W"ÂG—W2Â†÷7D–ç7Fæ6W2’°¢°¢f"6†–ÆBÒf–&W"æ6†–ÆBÀ¢6–&Æ–ærÒf–&W"ç6–&Æ–ærÀ¢FrÒf–&W"çFrÀ¢G—RÒf–&W"çG—S°¢f"6æF–FFUG—RÒçVÆÃ° ¢7v—F6‚‡Fr’°¢66RgVæ7F–öä6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢66R6Æ746ö×öæVçC ¢6æF–FFUG—RÒG—S°¢'&V³° ¢66Rf÷'v&E&Vc ¢6æF–FFUG—RÒG—Rç&VæFW#°¢'&V³°¢Ð ¢f"F–DÖF6‚ÒfÇ6S° ¢–b†6æF–FFUG—RÓÒçVÆÂ’°¢–b‡G—W2æ†2†6æF–FFUG—R’’°¢F–DÖF6‚ÒG'VS°¢Ð¢Ð ¢–b†F–DÖF6‚’°¢òòvR†fRÖF6‚âF†—2öæÇ’G&–ÆÇ2F÷vâFòF†R6Æ÷6W7B†÷7B6ö×öæVçG2à¢òòF†W&Rw2æòæVVBFò6V&6‚FVWW"&V6W6Rf÷"F†RW'÷6Röbv—f–æp¢òòf—7VÂfVVF&6²Â&fÆ6†–ær"÷WFW&Ö÷7B&VçB&V7FævÆW2—27Vff–6–VçBà¢f–æD†÷7D–ç7Fæ6W4f÷$f–&W%6†ÆÆ÷vÇ’†f–&W"Â†÷7D–ç7Fæ6W2“°¢ÒVÇ6R°¢òò–bF†W&Rw2æòÖF6‚ÂÖ–&RF†W&Rv–ÆÂ&RöæRgW'F†W"F÷vâ–âF†R6†–ÆBG&VRà¢–b†6†–ÆBÓÒçVÆÂ’°¢f–æD†÷7D–ç7Fæ6W4f÷$ÖF6†–ætf–&W'5&V7W'6—fVÇ’†6†–ÆBÂG—W2Â†÷7D–ç7Fæ6W2“°¢Ð¢Ð ¢–b‡6–&Æ–ærÓÒçVÆÂ’°¢f–æD†÷7D–ç7Fæ6W4f÷$ÖF6†–ætf–&W'5&V7W'6—fVÇ’‡6–&Æ–ærÂG—W2Â†÷7D–ç7Fæ6W2“°¢Ð¢Ð¢Ð ¢gVæ7F–öâf–æD†÷7D–ç7Fæ6W4f÷$f–&W%6†ÆÆ÷vÇ’†f–&W"Â†÷7D–ç7Fæ6W2’°¢°¢f"f÷VæD†÷7D–ç7Fæ6W2Òf–æD6†–ÆD†÷7D–ç7Fæ6W4f÷$f–&W%6†ÆÆ÷vÇ’†f–&W"Â†÷7D–ç7Fæ6W2“° ¢–b†f÷VæD†÷7D–ç7Fæ6W2’°¢&WGW&ã°¢Òòò–bvRF–FâwBf–æBç’†÷7B6†–ÆG&VâÂfÆÆ&6²Fò6Æ÷6W7B†÷7B&VçBà  ¢f"æöFRÒf–&W#° ¢v†–ÆR‡G'VR’°¢7v—F6‚†æöFRçFr’°¢66R†÷7D6ö×öæVçC ¢†÷7D–ç7Fæ6W2æFB†æöFRç7FFTæöFR“°¢&WGW&ã° ¢66R†÷7E÷'FÃ ¢†÷7D–ç7Fæ6W2æFB†æöFRç7FFTæöFRæ6öçF–æW$–æfò“°¢&WGW&ã° ¢66R†÷7E&ö÷C ¢†÷7D–ç7Fæ6W2æFB†æöFRç7FFTæöFRæ6öçF–æW$–æfò“°¢&WGW&ã°¢Ð ¢–b†æöFRç&WGW&âÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚tW‡V7FVBFò&V6‚&ö÷Bf—'7Bâr“°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð¢Ð¢Ð ¢gVæ7F–öâf–æD6†–ÆD†÷7D–ç7Fæ6W4f÷$f–&W%6†ÆÆ÷vÇ’†f–&W"Â†÷7D–ç7Fæ6W2’°¢°¢f"æöFRÒf–&W#°¢f"f÷VæD†÷7D–ç7Fæ6W2ÒfÇ6S° ¢v†–ÆR‡G'VR’°¢–b†æöFRçFrÓÓÒ†÷7D6ö×öæVçB’°¢òòvRv÷BÖF6‚à¢f÷VæD†÷7D–ç7Fæ6W2ÒG'VS°¢†÷7D–ç7Fæ6W2æFB†æöFRç7FFTæöFR“²òòF†W&RÖ’7F–ÆÂ&RÖ÷&RÂ6ò¶VW6V&6†–ærà¢ÒVÇ6R–b†æöFRæ6†–ÆBÓÒçVÆÂ’°¢æöFRæ6†–ÆBç&WGW&âÒæöFS°¢æöFRÒæöFRæ6†–ÆC°¢6öçF–çVS°¢Ð ¢–b†æöFRÓÓÒf–&W"’°¢&WGW&âf÷VæD†÷7D–ç7Fæ6W3°¢Ð ¢v†–ÆR†æöFRç6–&Æ–ærÓÓÒçVÆÂ’°¢–b†æöFRç&WGW&âÓÓÒçVÆÂÇÂæöFRç&WGW&âÓÓÒf–&W"’°¢&WGW&âf÷VæD†÷7D–ç7Fæ6W3°¢Ð ¢æöFRÒæöFRç&WGW&ã°¢Ð ¢æöFRç6–&Æ–ærç&WGW&âÒæöFRç&WGW&ã°¢æöFRÒæöFRç6–&Æ–æs°¢Ð¢Ð ¢&WGW&âfÇ6S°¢Ð ¢f"†4&DÖöÇ–f–ÆÃ° ¢°¢†4&DÖöÇ–f–ÆÂÒfÇ6S° ¢G'’°¢f"æöäW‡FVç6–&ÆTö&¦V7BÒö&¦V7Bç&WfVçDW‡FVç6–öç2‡·Ò“°¢ò¢W6Æ–çBÖF—6&ÆRæòÖæWr¢ð ¢æWrÖ…µ¶æöäW‡FVç6–&ÆTö&¦V7BÂçVÆÅÕÒ“°¢æWr6WB…¶æöäW‡FVç6–&ÆTö&¦V7EÒ“°¢ò¢W6Æ–çBÖVæ&ÆRæòÖæWr¢ð¢Ò6F6‚†R’°¢òòDôDó¢6öç6–FW"v&æ–ær&÷WB&BöÇ–f–ÆÇ0¢†4&DÖöÇ–f–ÆÂÒG'VS°¢Ð¢Ð ¢gVæ7F–öâf–&W$æöFR‡FrÂVæF–æu&÷2Â¶W’ÂÖöFR’°¢òò–ç7Fæ6P¢F†—2çFrÒFs°¢F†—2æ¶W’Ò¶W“°¢F†—2æVÆVÖVçEG—RÒçVÆÃ°¢F†—2çG—RÒçVÆÃ°¢F†—2ç7FFTæöFRÒçVÆÃ²òòf–&W  ¢F†—2ç&WGW&âÒçVÆÃ°¢F†—2æ6†–ÆBÒçVÆÃ°¢F†—2ç6–&Æ–ærÒçVÆÃ°¢F†—2æ–æFW‚Ò°¢F†—2ç&VbÒçVÆÃ°¢F†—2çVæF–æu&÷2ÒVæF–æu&÷3°¢F†—2æÖVÖö—¦VE&÷2ÒçVÆÃ°¢F†—2çWFFUVWVRÒçVÆÃ°¢F†—2æÖVÖö—¦VE7FFRÒçVÆÃ°¢F†—2æFWVæFVæ6–W2ÒçVÆÃ°¢F†—2æÖöFRÒÖöFS²òòVffV7G0 ¢F†—2æfÆw2ÒæôfÆw3°¢F†—2ç7V'G&VTfÆw2ÒæôfÆw3°¢F†—2æFVÆWF–öç2ÒçVÆÃ°¢F†—2æÆæW2ÒæôÆæW3°¢F†—2æ6†–ÆDÆæW2ÒæôÆæW3°¢F†—2æÇFW&æFRÒçVÆÃ° ¢°¢òòæ÷FS¢F†RföÆÆ÷v–ær—2FöæRFòfö–Bc‚W&f÷&Öæ6R6Æ–fbà¢òð¢òò–æ—F–Æ—¦–ærF†Rf–VÆG2&VÆ÷rFò6Ö—2æBÆFW"WFF–ærF†VÒv—F€¢òòF÷V&ÆRfÇVW2v–ÆÂ6W6Rf–&W'2FòVæBW†f–ær6W&FR6†W2à¢òòF†—2&V†f–÷"ö'Vr†26öÖWF†–ærFòFòv—F‚ö&¦V7Bç&WfVçDW‡FVç6–öâ‚’à¢òòf÷'GVæFVÇ’F†—2öæÇ’–×7G2DUb'V–ÆG2à¢òòVæf÷'GVæFVÇ’—BÖ¶W2&V7BVçW6&Ç’6Æ÷rf÷"6öÖRÆ–6F–öç2à¢òòFòv÷&²&÷VæBF†—2Â–æ—F–Æ—¦RF†Rf–VÆG2&VÆ÷rv—F‚F÷V&ÆW2à¢òð¢òòÆV&âÖ÷&R&÷WBF†—2†W&S ¢òò‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7Bö—77VW2óC3cP¢òò‡GG3¢òö'Vw2æ6‡&öÖ—VÒæ÷&r÷÷c‚ö—77VW2öFWF–Ãö–CÓƒS3€¢F†—2æ7GVÄGW&F–öâÒçVÖ&W"äæã°¢F†—2æ7GVÅ7F'EF–ÖRÒçVÖ&W"äæã°¢F†—2ç6VÆd&6TGW&F–öâÒçVÖ&W"äæã°¢F†—2çG&VT&6TGW&F–öâÒçVÖ&W"äæã²òò—Bw2ö¶’Fò&WÆ6RF†R–æ—F–ÂF÷V&ÆW2v—F‚6Ö—2gFW"–æ—F–Æ—¦F–öâà¢òòF†—2vöâwBG&–vvW"F†RW&f÷&Öæ6R6Æ–fbÖVçF–öæVB&÷fRÀ¢òòæB—B6–×Æ–f–W2÷F†W"&öf–ÆW"6öFR†–æ6ÇVF–ærFWeFööÇ2’à ¢F†—2æ7GVÄGW&F–öâÒ°¢F†—2æ7GVÅ7F'EF–ÖRÒÓ°¢F†—2ç6VÆd&6TGW&F–öâÒ°¢F†—2çG&VT&6TGW&F–öâÒ°¢Ð ¢°¢òòF†—2—6âwBF—&V7FÇ’W6VB'WB—2†æG’f÷"FV'Vvv–ær–çFW&æÇ3 ¢F†—2åöFV'Vu6÷W&6RÒçVÆÃ°¢F†—2åöFV'Vt÷væW"ÒçVÆÃ°¢F†—2åöFV'VtæVVG5&VÖ÷VçBÒfÇ6S°¢F†—2åöFV'Vt†ööµG—W2ÒçVÆÃ° ¢–b‚†4&DÖöÇ–f–ÆÂbbG—Vöbö&¦V7Bç&WfVçDW‡FVç6–öç2ÓÓÒvgVæ7F–öâr’°¢ö&¦V7Bç&WfVçDW‡FVç6–öç2‡F†—2“°¢Ð¢Ð¢ÒòòF†—2—26öç7G'V7F÷"gVæ7F–öâÂ&F†W"F†âô¤ò6öç7G'V7F÷"Â7F–ÆÀ¢òòÆV6RVç7W&RvRFòF†RföÆÆ÷v–æs ¢òò’æö&öG’6†÷VÆBFBç’–ç7Fæ6RÖWF†öG2öâF†—2â–ç7Fæ6RÖWF†öG26â&P¢òòÖ÷&RF–ff–7VÇBFò&VF–7Bv†VâF†W’vWB÷F–Ö—¦VBæBF†W’&RÆÖ÷7@¢òòæWfW"–æÆ–æVB&÷W&Ç’–â7FF–26ö×–ÆW'2à¢òò"’æö&öG’6†÷VÆB&VÇ’öâ–ç7Fæ6Vöbf–&W&f÷"G—RFW7F–ærâvR6†÷VÆ@¢òòÇv—2¶æ÷rv†Vâ—B—2f–&W"à¢òò2’vRÖ–v‡BvçBFòW‡W&–ÖVçBv—F‚W6–ærçVÖW&–2¶W—26–æ6RF†W’&RV6–W ¢òòFò÷F–Ö—¦R–âæöâÔ¤•BVçf—&öæÖVçBà¢òòB’vR6âV6–Ç’vòg&öÒ6öç7G'V7F÷"Fò7&VFTf–&W"ö&¦V7BÆ—FW&Â–bF†@¢òò—2f7FW"à¢òòR’—B6†÷VÆB&RV7’Fò÷'BF†—2Fò27G'V7BæB¶VW2–×ÆVÖVçFF–öà¢òò6ö×F–&ÆRà  ¢f"7&VFTf–&W"ÒgVæ7F–öâ‡FrÂVæF–æu&÷2Â¶W’ÂÖöFR’°¢òòDfÆ÷tf—„ÖS¢F†R6†W2&RW†7B†W&R'WBfÆ÷rFöW6âwBÆ–¶R6öç7G'V7F÷'0¢&WGW&âæWrf–&W$æöFR‡FrÂVæF–æu&÷2Â¶W’ÂÖöFR“°¢Ó° ¢gVæ7F–öâ6†÷VÆD6öç7G'V7BC„6ö×öæVçB’°¢f"&÷F÷G—RÒ6ö×öæVçBç&÷F÷G—S°¢&WGW&â‡&÷F÷G—Rbb&÷F÷G—Ræ—5&V7D6ö×öæVçB“°¢Ð ¢gVæ7F–öâ—56–×ÆTgVæ7F–öä6ö×öæVçB‡G—R’°¢&WGW&âG—VöbG—RÓÓÒvgVæ7F–öârbb6†÷VÆD6öç7G'V7BC‡G—R’bbG—RæFVfVÇE&÷2ÓÓÒVæFVf–æVC°¢Ð¢gVæ7F–öâ&W6öÇfTÆ§”6ö×öæVçEFr„6ö×öæVçB’°¢–b‡G—Vöb6ö×öæVçBÓÓÒvgVæ7F–öâr’°¢&WGW&â6†÷VÆD6öç7G'V7BC„6ö×öæVçB’ò6Æ746ö×öæVçB¢gVæ7F–öä6ö×öæVçC°¢ÒVÇ6R–b„6ö×öæVçBÓÒVæFVf–æVBbb6ö×öæVçBÓÒçVÆÂ’°¢f"BGG—VöbÒ6ö×öæVçBâBGG—Vöc° ¢–b‚BGG—VöbÓÓÒ$T5Eôdõ%t$Eõ$TeõE•R’°¢&WGW&âf÷'v&E&Vc°¢Ð ¢–b‚BGG—VöbÓÓÒ$T5EôÔTÔõõE•R’°¢&WGW&âÖVÖô6ö×öæVçC°¢Ð¢Ð ¢&WGW&â–æFWFW&Ö–æFT6ö×öæVçC°¢ÒòòF†—2—2W6VBFò7&VFRâÇFW&æFRf–&W"FòFòv÷&²öâà ¢gVæ7F–öâ7&VFUv÷&´–å&öw&W72†7W'&VçBÂVæF–æu&÷2’°¢f"v÷&´–å&öw&W72Ò7W'&VçBæÇFW&æFS° ¢–b‡v÷&´–å&öw&W72ÓÓÒçVÆÂ’°¢òòvRW6RF÷V&ÆR'VffW&–ærööÆ–ærFV6†æ—VR&V6W6RvR¶æ÷rF†BvRvÆÀ¢òòöæÇ’WfW"æVVBBÖ÷7BGvòfW'6–öç2öbG&VRâvRööÂF†R&÷F†W""VçW6V@¢òòæöFRF†BvRw&Rg&VRFò&WW6RâF†—2—2Æ¦–Ç’7&VFVBFòfö–BÆÆö6F–æp¢òòW‡G&ö&¦V7G2f÷"F†–æw2F†B&RæWfW"WFFVBâ—BÇ6òÆÆ÷rW2Fð¢òò&V6Æ–ÒF†RW‡G&ÖVÖ÷'’–bæVVFVBà¢v÷&´–å&öw&W72Ò7&VFTf–&W"†7W'&VçBçFrÂVæF–æu&÷2Â7W'&VçBæ¶W’Â7W'&VçBæÖöFR“°¢v÷&´–å&öw&W72æVÆVÖVçEG—RÒ7W'&VçBæVÆVÖVçEG—S°¢v÷&´–å&öw&W72çG—RÒ7W'&VçBçG—S°¢v÷&´–å&öw&W72ç7FFTæöFRÒ7W'&VçBç7FFTæöFS° ¢°¢òòDUbÖöæÇ’f–VÆG0¢v÷&´–å&öw&W72åöFV'Vu6÷W&6RÒ7W'&VçBåöFV'Vu6÷W&6S°¢v÷&´–å&öw&W72åöFV'Vt÷væW"Ò7W'&VçBåöFV'Vt÷væW#°¢v÷&´–å&öw&W72åöFV'Vt†ööµG—W2Ò7W'&VçBåöFV'Vt†ööµG—W3°¢Ð ¢v÷&´–å&öw&W72æÇFW&æFRÒ7W'&VçC°¢7W'&VçBæÇFW&æFRÒv÷&´–å&öw&W73°¢ÒVÇ6R°¢v÷&´–å&öw&W72çVæF–æu&÷2ÒVæF–æu&÷3²òòæVVFVB&V6W6R&Æö6·27F÷&RFFöâG—Rà ¢v÷&´–å&öw&W72çG—RÒ7W'&VçBçG—S²òòvRÇ&VG’†fRâÇFW&æFRà¢òò&W6WBF†RVffV7BFrà ¢v÷&´–å&öw&W72æfÆw2ÒæôfÆw3²òòF†RVffV7G2&RæòÆöævW"fÆ–Bà ¢v÷&´–å&öw&W72ç7V'G&VTfÆw2ÒæôfÆw3°¢v÷&´–å&öw&W72æFVÆWF–öç2ÒçVÆÃ° ¢°¢òòvR–çFVçF–öæÆÇ’&W6WBÂ&F†W"F†â6÷’Â7GVÄGW&F–öâb7GVÅ7F'EF–ÖRà¢òòF†—2&WfVçG2F–ÖRg&öÒVæFÆW76Ç’67V×VÆF–ær–âæWr6öÖÖ—G2à¢òòF†—2†2F†RF÷vç6–FRöb&W6WGF–ærfÇVW2f÷"F–ffW&VçB&–÷&—G’&VæFW'2À¢òò'WBv÷&·2f÷"––VÆF–ær‡F†R6öÖÖöâ66R’æB6†÷VÆB7W÷'B&W7VÖ–ærà¢v÷&´–å&öw&W72æ7GVÄGW&F–öâÒ°¢v÷&´–å&öw&W72æ7GVÅ7F'EF–ÖRÒÓ°¢Ð¢Òòò&W6WBÆÂVffV7G2W†6WB7FF–2öæW2à¢òò7FF–2VffV7G2&Ræ÷B7V6–f–2Fò&VæFW"à  ¢v÷&´–å&öw&W72æfÆw2Ò7W'&VçBæfÆw2b7FF–4Ö6³°¢v÷&´–å&öw&W72æ6†–ÆDÆæW2Ò7W'&VçBæ6†–ÆDÆæW3°¢v÷&´–å&öw&W72æÆæW2Ò7W'&VçBæÆæW3°¢v÷&´–å&öw&W72æ6†–ÆBÒ7W'&VçBæ6†–ÆC°¢v÷&´–å&öw&W72æÖVÖö—¦VE&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS°¢v÷&´–å&öw&W72çWFFUVWVRÒ7W'&VçBçWFFUVWVS²òò6ÆöæRF†RFWVæFVæ6–W2ö&¦V7BâF†—2—2×WFFVBGW&–ærF†R&VæFW"†6RÂ6ð¢òò—B6ææ÷B&R6†&VBv—F‚F†R7W'&VçBf–&W"à ¢f"7W'&VçDFWVæFVæ6–W2Ò7W'&VçBæFWVæFVæ6–W3°¢v÷&´–å&öw&W72æFWVæFVæ6–W2Ò7W'&VçDFWVæFVæ6–W2ÓÓÒçVÆÂòçVÆÂ¢°¢ÆæW3¢7W'&VçDFWVæFVæ6–W2æÆæW2À¢f—'7D6öçFW‡C¢7W'&VçDFWVæFVæ6–W2æf—'7D6öçFW‡@¢Ó²òòF†W6Rv–ÆÂ&R÷fW'&–FFVâGW&–ærF†R&VçBw2&V6öæ6–Æ–F–öà ¢v÷&´–å&öw&W72ç6–&Æ–ærÒ7W'&VçBç6–&Æ–æs°¢v÷&´–å&öw&W72æ–æFW‚Ò7W'&VçBæ–æFWƒ°¢v÷&´–å&öw&W72ç&VbÒ7W'&VçBç&Vc° ¢°¢v÷&´–å&öw&W72ç6VÆd&6TGW&F–öâÒ7W'&VçBç6VÆd&6TGW&F–öã°¢v÷&´–å&öw&W72çG&VT&6TGW&F–öâÒ7W'&VçBçG&VT&6TGW&F–öã°¢Ð ¢°¢v÷&´–å&öw&W72åöFV'VtæVVG5&VÖ÷VçBÒ7W'&VçBåöFV'VtæVVG5&VÖ÷VçC° ¢7v—F6‚‡v÷&´–å&öw&W72çFr’°¢66R–æFWFW&Ö–æFT6ö×öæVçC ¢66RgVæ7F–öä6ö×öæVçC ¢66R6–×ÆTÖVÖô6ö×öæVçC ¢v÷&´–å&öw&W72çG—RÒ&W6öÇfTgVæ7F–öäf÷$†÷E&VÆöF–ær†7W'&VçBçG—R“°¢'&V³° ¢66R6Æ746ö×öæVçC ¢v÷&´–å&öw&W72çG—RÒ&W6öÇfT6Æ74f÷$†÷E&VÆöF–ær†7W'&VçBçG—R“°¢'&V³° ¢66Rf÷'v&E&Vc ¢v÷&´–å&öw&W72çG—RÒ&W6öÇfTf÷'v&E&Vdf÷$†÷E&VÆöF–ær†7W'&VçBçG—R“°¢'&V³°¢Ð¢Ð ¢&WGW&âv÷&´–å&öw&W73°¢ÒòòW6VBFò&WW6Rf–&W"f÷"6V6öæB72à ¢gVæ7F–öâ&W6WEv÷&´–å&öw&W72‡v÷&´–å&öw&W72Â&VæFW$ÆæW2’°¢òòF†—2&W6WG2F†Rf–&W"Fòv†B7&VFTf–&W"÷"7&VFUv÷&´–å&öw&W72v÷VÆ@¢òò†fR6WBF†RfÇVW2Fò&Vf÷&RGW&–ærF†Rf—'7B72â–FVÆÇ’F†—2v÷VÆFâw@¢òò&RæV6W76'’'WBVæf÷'GVæFVÇ’Öç’6öFRF‡2&VG2g&öÒF†Rv÷&´–å&öw&W70¢òòv†VâF†W’6†÷VÆB&R&VF–ærg&öÒ7W'&VçBæBw&—F–ærFòv÷&´–å&öw&W72à¢òòvR77VÖRVæF–æu&÷2Â–æFW‚Â¶W’Â&VbÂ&WGW&â&R7F–ÆÂVçF÷V6†VBFð¢òòfö–BFö–æræ÷F†W"&V6öæ6–Æ–F–öâà¢òò&W6WBF†RVffV7BfÆw2'WB¶VWç’Æ6VÖVçBFw2Â6–æ6RF†Bw26öÖWF†–æp¢òòF†B6†–ÆBf–&W"—26WGF–ærÂæ÷BF†R&V6öæ6–Æ–F–öâà¢v÷&´–å&öw&W72æfÆw2cÒ7FF–4Ö6²ÂÆ6VÖVçC²òòF†RVffV7G2&RæòÆöævW"fÆ–Bà ¢f"7W'&VçBÒv÷&´–å&öw&W72æÇFW&æFS° ¢–b†7W'&VçBÓÓÒçVÆÂ’°¢òò&W6WBFò7&VFTf–&W"w2–æ—F–ÂfÇVW2à¢v÷&´–å&öw&W72æ6†–ÆDÆæW2ÒæôÆæW3°¢v÷&´–å&öw&W72æÆæW2Ò&VæFW$ÆæW3°¢v÷&´–å&öw&W72æ6†–ÆBÒçVÆÃ°¢v÷&´–å&öw&W72ç7V'G&VTfÆw2ÒæôfÆw3°¢v÷&´–å&öw&W72æÖVÖö—¦VE&÷2ÒçVÆÃ°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒçVÆÃ°¢v÷&´–å&öw&W72çWFFUVWVRÒçVÆÃ°¢v÷&´–å&öw&W72æFWVæFVæ6–W2ÒçVÆÃ°¢v÷&´–å&öw&W72ç7FFTæöFRÒçVÆÃ° ¢°¢òòæ÷FS¢vRFöâwB&W6WBF†R7GVÅF–ÖR6÷VçG2â—Bw2W6VgVÂFò67V×VÆFP¢òò7GVÂF–ÖR7&÷72×VÇF—ÆR&VæFW"76W2à¢v÷&´–å&öw&W72ç6VÆd&6TGW&F–öâÒ°¢v÷&´–å&öw&W72çG&VT&6TGW&F–öâÒ°¢Ð¢ÒVÇ6R°¢òò&W6WBFòF†R6ÆöæVBfÇVW2F†B7&VFUv÷&´–å&öw&W72v÷VÆBwfRà¢v÷&´–å&öw&W72æ6†–ÆDÆæW2Ò7W'&VçBæ6†–ÆDÆæW3°¢v÷&´–å&öw&W72æÆæW2Ò7W'&VçBæÆæW3°¢v÷&´–å&öw&W72æ6†–ÆBÒ7W'&VçBæ6†–ÆC°¢v÷&´–å&öw&W72ç7V'G&VTfÆw2ÒæôfÆw3°¢v÷&´–å&öw&W72æFVÆWF–öç2ÒçVÆÃ°¢v÷&´–å&öw&W72æÖVÖö—¦VE&÷2Ò7W'&VçBæÖVÖö—¦VE&÷3°¢v÷&´–å&öw&W72æÖVÖö—¦VE7FFRÒ7W'&VçBæÖVÖö—¦VE7FFS°¢v÷&´–å&öw&W72çWFFUVWVRÒ7W'&VçBçWFFUVWVS²òòæVVFVB&V6W6R&Æö6·27F÷&RFFöâG—Rà ¢v÷&´–å&öw&W72çG—RÒ7W'&VçBçG—S²òò6ÆöæRF†RFWVæFVæ6–W2ö&¦V7BâF†—2—2×WFFVBGW&–ærF†R&VæFW"†6RÂ6ð¢òò—B6ææ÷B&R6†&VBv—F‚F†R7W'&VçBf–&W"à ¢f"7W'&VçDFWVæFVæ6–W2Ò7W'&VçBæFWVæFVæ6–W3°¢v÷&´–å&öw&W72æFWVæFVæ6–W2Ò7W'&VçDFWVæFVæ6–W2ÓÓÒçVÆÂòçVÆÂ¢°¢ÆæW3¢7W'&VçDFWVæFVæ6–W2æÆæW2À¢f—'7D6öçFW‡C¢7W'&VçDFWVæFVæ6–W2æf—'7D6öçFW‡@¢Ó° ¢°¢òòæ÷FS¢vRFöâwB&W6WBF†R7GVÅF–ÖR6÷VçG2â—Bw2W6VgVÂFò67V×VÆFP¢òò7GVÂF–ÖR7&÷72×VÇF—ÆR&VæFW"76W2à¢v÷&´–å&öw&W72ç6VÆd&6TGW&F–öâÒ7W'&VçBç6VÆd&6TGW&F–öã°¢v÷&´–å&öw&W72çG&VT&6TGW&F–öâÒ7W'&VçBçG&VT&6TGW&F–öã°¢Ð¢Ð ¢&WGW&âv÷&´–å&öw&W73°¢Ð¢gVæ7F–öâ7&VFT†÷7E&ö÷Df–&W"‡FrÂ—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FR’°¢f"ÖöFS° ¢–b‡FrÓÓÒ6öæ7W'&VçE&ö÷B’°¢ÖöFRÒ6öæ7W'&VçDÖöFS° ¢–b†—57G&–7DÖöFRÓÓÒG'VR’°¢ÖöFRÃÒ7G&–7DÆVv7”ÖöFS° ¢°¢ÖöFRÃÒ7G&–7DVffV7G4ÖöFS°¢Ð¢Ð¢ÒVÇ6R°¢ÖöFRÒæôÖöFS°¢Ð ¢–b‚—4FWeFööÇ5&W6VçB’°¢òòÇv—26öÆÆV7B&öf–ÆRF–Ö–æw2v†VâFWeFööÇ2&R&W6VçBà¢òòF†—2Væ&ÆW2FWeFööÇ2Fò7F'B6GW&–ærF–Ö–ærBç’ö–çN(	0¢òòv—F†÷WB6öÖRæöFW2–âF†RG&VR†f–ærV×G’&6RF–ÖW2à¢ÖöFRÃÒ&öf–ÆTÖöFS°¢Ð ¢&WGW&â7&VFTf–&W"„†÷7E&ö÷BÂçVÆÂÂçVÆÂÂÖöFR“°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÕG—TæE&÷2‡G—RÂòò&V7BDVÆVÖVçEG—P¢¶W’ÂVæF–æu&÷2Â÷væW"ÂÖöFRÂÆæW2’°¢f"f–&W%FrÒ–æFWFW&Ö–æFT6ö×öæVçC²òòF†R&W6öÇfVBG—R—26WB–bvR¶æ÷rv†BF†Rf–æÂG—Rv–ÆÂ&Râ’æRâ—Bw2æ÷BÆ§’à ¢f"&W6öÇfVEG—RÒG—S° ¢–b‡G—VöbG—RÓÓÒvgVæ7F–öâr’°¢–b‡6†÷VÆD6öç7G'V7BC‡G—R’’°¢f–&W%FrÒ6Æ746ö×öæVçC° ¢°¢&W6öÇfVEG—RÒ&W6öÇfT6Æ74f÷$†÷E&VÆöF–ær‡&W6öÇfVEG—R“°¢Ð¢ÒVÇ6R°¢°¢&W6öÇfVEG—RÒ&W6öÇfTgVæ7F–öäf÷$†÷E&VÆöF–ær‡&W6öÇfVEG—R“°¢Ð¢Ð¢ÒVÇ6R–b‡G—VöbG—RÓÓÒw7G&–ærr’°¢f–&W%FrÒ†÷7D6ö×öæVçC°¢ÒVÇ6R°¢vWEFs¢7v—F6‚‡G—R’°¢66R$T5Eôe$tÔTåEõE•S ¢&WGW&â7&VFTf–&W$g&öÔg&vÖVçB‡VæF–æu&÷2æ6†–ÆG&VâÂÖöFRÂÆæW2Â¶W’“° ¢66R$T5Eõ5E$”5EôÔôDUõE•S ¢f–&W%FrÒÖöFS°¢ÖöFRÃÒ7G&–7DÆVv7”ÖöFS° ¢–b‚†ÖöFRb6öæ7W'&VçDÖöFR’ÓÒæôÖöFR’°¢òò7G&–7BVffV7G26†÷VÆBæWfW"'VâöâÆVv7’&ö÷G0¢ÖöFRÃÒ7G&–7DVffV7G4ÖöFS°¢Ð ¢'&V³° ¢66R$T5Eõ$ôd”ÄU%õE•S ¢&WGW&â7&VFTf–&W$g&öÕ&öf–ÆW"‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’“° ¢66R$T5Eõ5U5Tå4UõE•S ¢&WGW&â7&VFTf–&W$g&öÕ7W7Vç6R‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’“° ¢66R$T5Eõ5U5Tå4UôÄ•5EõE•S ¢&WGW&â7&VFTf–&W$g&öÕ7W7Vç6TÆ—7B‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’“° ¢66R$T5Eôôde45$TTåõE•S ¢&WGW&â7&VFTf–&W$g&öÔöfg67&VVâ‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’“° ¢66R$T5EôÄTt5•ô„”DDTåõE•S  ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæòÖfÆÇF‡&÷Vv€ ¢66R$T5Eõ44õUõE•S  ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæòÖfÆÇF‡&÷Vv€ ¢66R$T5Eô44„UõE•S  ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæòÖfÆÇF‡&÷Vv€ ¢66R$T5EõE$4”äuôÔ$´U%õE•S  ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæòÖfÆÇF‡&÷Vv€ ¢66R$T5EôDT%TuõE$4”äuôÔôDUõE•S  ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæòÖfÆÇF‡&÷Vv€ ¢FVfVÇC ¢°¢–b‡G—VöbG—RÓÓÒvö&¦V7BrbbG—RÓÒçVÆÂ’°¢7v—F6‚‡G—RâBGG—Vöb’°¢66R$T5Eõ$õd”DU%õE•S ¢f–&W%FrÒ6öçFW‡E&÷f–FW#°¢'&V²vWEFs° ¢66R$T5Eô4ôåDU…EõE•S ¢òòF†—2—26öç7VÖW ¢f–&W%FrÒ6öçFW‡D6öç7VÖW#°¢'&V²vWEFs° ¢66R$T5Eôdõ%t$Eõ$TeõE•S ¢f–&W%FrÒf÷'v&E&Vc° ¢°¢&W6öÇfVEG—RÒ&W6öÇfTf÷'v&E&Vdf÷$†÷E&VÆöF–ær‡&W6öÇfVEG—R“°¢Ð ¢'&V²vWEFs° ¢66R$T5EôÔTÔõõE•S ¢f–&W%FrÒÖVÖô6ö×öæVçC°¢'&V²vWEFs° ¢66R$T5EôÄ¥•õE•S ¢f–&W%FrÒÆ§”6ö×öæVçC°¢&W6öÇfVEG—RÒçVÆÃ°¢'&V²vWEFs°¢Ð¢Ð ¢f"–æfòÒrs° ¢°¢–b‡G—RÓÓÒVæFVf–æVBÇÂG—VöbG—RÓÓÒvö&¦V7BrbbG—RÓÒçVÆÂbbö&¦V7Bæ¶W—2‡G—R’æÆVæwF‚ÓÓÒ’°¢–æfò³Òr–÷RÆ–¶VÇ’f÷&v÷BFòW‡÷'B–÷W"6ö×öæVçBg&öÒF†Rf–ÆRr²&—Bw2FVf–æVB–âÂ÷"–÷RÖ–v‡B†fRÖ—†VBWFVfVÇBæB"²væÖVB–×÷'G2âs°¢Ð ¢f"÷væW$æÖRÒ÷væW"òvWD6ö×öæVçDæÖTg&öÔf–&W"†÷væW"’¢çVÆÃ° ¢–b†÷væW$æÖR’°¢–æfò³ÒuÆåÆä6†V6²F†R&VæFW"ÖWF†öBöbr²÷væW$æÖR²vâs°¢Ð¢Ð ¢F‡&÷ræWrW'&÷"‚tVÆVÖVçBG—R—2–çfÆ–C¢W‡V7FVB7G&–ær†f÷"'V–ÇBÖ–âr²v6ö×öæVçG2’÷"6Æ72ögVæ7F–öâ†f÷"6ö×÷6—FR6ö×öæVçG2’r²‚&'WBv÷C¢"²‡G—RÓÒçVÆÂòG—R¢G—VöbG—R’²"â"²–æfò’“°¢Ð¢Ð¢Ð ¢f"f–&W"Ò7&VFTf–&W"†f–&W%FrÂVæF–æu&÷2Â¶W’ÂÖöFR“°¢f–&W"æVÆVÖVçEG—RÒG—S°¢f–&W"çG—RÒ&W6öÇfVEG—S°¢f–&W"æÆæW2ÒÆæW3° ¢°¢f–&W"åöFV'Vt÷væW"Ò÷væW#°¢Ð ¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÔVÆVÖVçB†VÆVÖVçBÂÖöFRÂÆæW2’°¢f"÷væW"ÒçVÆÃ° ¢°¢÷væW"ÒVÆVÖVçBåö÷væW#°¢Ð ¢f"G—RÒVÆVÖVçBçG—S°¢f"¶W’ÒVÆVÖVçBæ¶W“°¢f"VæF–æu&÷2ÒVÆVÖVçBç&÷3°¢f"f–&W"Ò7&VFTf–&W$g&öÕG—TæE&÷2‡G—RÂ¶W’ÂVæF–æu&÷2Â÷væW"ÂÖöFRÂÆæW2“° ¢°¢f–&W"åöFV'Vu6÷W&6RÒVÆVÖVçBå÷6÷W&6S°¢f–&W"åöFV'Vt÷væW"ÒVÆVÖVçBåö÷væW#°¢Ð ¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÔg&vÖVçB†VÆVÖVçG2ÂÖöFRÂÆæW2Â¶W’’°¢f"f–&W"Ò7&VFTf–&W"„g&vÖVçBÂVÆVÖVçG2Â¶W’ÂÖöFR“°¢f–&W"æÆæW2ÒÆæW3°¢&WGW&âf–&W#°¢Ð ¢gVæ7F–öâ7&VFTf–&W$g&öÕ&öf–ÆW"‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’’°¢°¢–b‡G—VöbVæF–æu&÷2æ–BÓÒw7G&–ærr’°¢W'&÷"‚u&öf–ÆW"×W7B7V6–g’â&–B"öbG—R7G&–æv2&÷â&V6V—fVBF†RG—RW6–ç7FVBârÂG—VöbVæF–æu&÷2æ–B“°¢Ð¢Ð ¢f"f–&W"Ò7&VFTf–&W"…&öf–ÆW"ÂVæF–æu&÷2Â¶W’ÂÖöFRÂ&öf–ÆTÖöFR“°¢f–&W"æVÆVÖVçEG—RÒ$T5Eõ$ôd”ÄU%õE•S°¢f–&W"æÆæW2ÒÆæW3° ¢°¢f–&W"ç7FFTæöFRÒ°¢VffV7DGW&F–öã¢À¢76—fTVffV7DGW&F–öã¢ ¢Ó°¢Ð ¢&WGW&âf–&W#°¢Ð ¢gVæ7F–öâ7&VFTf–&W$g&öÕ7W7Vç6R‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’’°¢f"f–&W"Ò7&VFTf–&W"…7W7Vç6T6ö×öæVçBÂVæF–æu&÷2Â¶W’ÂÖöFR“°¢f–&W"æVÆVÖVçEG—RÒ$T5Eõ5U5Tå4UõE•S°¢f–&W"æÆæW2ÒÆæW3°¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÕ7W7Vç6TÆ—7B‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’’°¢f"f–&W"Ò7&VFTf–&W"…7W7Vç6TÆ—7D6ö×öæVçBÂVæF–æu&÷2Â¶W’ÂÖöFR“°¢f–&W"æVÆVÖVçEG—RÒ$T5Eõ5U5Tå4UôÄ•5EõE•S°¢f–&W"æÆæW2ÒÆæW3°¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÔöfg67&VVâ‡VæF–æu&÷2ÂÖöFRÂÆæW2Â¶W’’°¢f"f–&W"Ò7&VFTf–&W"„öfg67&VVä6ö×öæVçBÂVæF–æu&÷2Â¶W’ÂÖöFR“°¢f–&W"æVÆVÖVçEG—RÒ$T5Eôôde45$TTåõE•S°¢f–&W"æÆæW2ÒÆæW3°¢f"&–Ö'”6†–ÆD–ç7Fæ6RÒ°¢—4†–FFVã¢fÇ6P¢Ó°¢f–&W"ç7FFTæöFRÒ&–Ö'”6†–ÆD–ç7Fæ6S°¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÕFW‡B†6öçFVçBÂÖöFRÂÆæW2’°¢f"f–&W"Ò7&VFTf–&W"„†÷7EFW‡BÂ6öçFVçBÂçVÆÂÂÖöFR“°¢f–&W"æÆæW2ÒÆæW3°¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÔ†÷7D–ç7Fæ6Tf÷$FVÆWF–öâ‚’°¢f"f–&W"Ò7&VFTf–&W"„†÷7D6ö×öæVçBÂçVÆÂÂçVÆÂÂæôÖöFR“°¢f–&W"æVÆVÖVçEG—RÒtDTÄUDTBs°¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÔFV‡–G&FVDg&vÖVçB†FV‡–G&FVDæöFR’°¢f"f–&W"Ò7&VFTf–&W"„FV‡–G&FVDg&vÖVçBÂçVÆÂÂçVÆÂÂæôÖöFR“°¢f–&W"ç7FFTæöFRÒFV‡–G&FVDæöFS°¢&WGW&âf–&W#°¢Ð¢gVæ7F–öâ7&VFTf–&W$g&öÕ÷'FÂ‡÷'FÂÂÖöFRÂÆæW2’°¢f"VæF–æu&÷2Ò÷'FÂæ6†–ÆG&VâÓÒçVÆÂò÷'FÂæ6†–ÆG&Vâ¢µÓ°¢f"f–&W"Ò7&VFTf–&W"„†÷7E÷'FÂÂVæF–æu&÷2Â÷'FÂæ¶W’ÂÖöFR“°¢f–&W"æÆæW2ÒÆæW3°¢f–&W"ç7FFTæöFRÒ°¢6öçF–æW$–æfó¢÷'FÂæ6öçF–æW$–æfòÀ¢VæF–æt6†–ÆG&Vã¢çVÆÂÀ¢òòW6VB'’W'6—7FVçBWFFW0¢–×ÆVÖVçFF–öã¢÷'FÂæ–×ÆVÖVçFF–öà¢Ó°¢&WGW&âf–&W#°¢ÒòòW6VBf÷"7F6†–ært•&÷W'F–W2Fò&WÆ’f–ÆVBv÷&²–âDUbà ¢gVæ7F–öâ76–väf–&W%&÷W'F–W4–äDUb‡F&vWBÂ6÷W&6R’°¢–b‡F&vWBÓÓÒçVÆÂ’°¢òòF†—2f–&W"w2–æ—F–Â&÷W'F–W2v–ÆÂÇv—2&R÷fW'w&—GFVâà¢òòvRöæÇ’W6Rf–&W"FòVç7W&RF†R6ÖR†–FFVâ6Æ726òDUb—6âwB6Æ÷rà¢F&vWBÒ7&VFTf–&W"„–æFWFW&Ö–æFT6ö×öæVçBÂçVÆÂÂçVÆÂÂæôÖöFR“°¢ÒòòF†—2—2–çFVçF–öæÆÇ’w&—GFVâ2Æ—7BöbÆÂ&÷W'F–W2à¢òòvRG&–VBFòW6Rö&¦V7Bæ76–vâ‚’–ç7FVB'WBF†—2—26ÆÆVB–à¢òòF†R†÷GFW7BF‚ÂæBö&¦V7Bæ76–vâ‚’v2Föò6Æ÷s ¢òò‡GG3¢òöv—F‡V"æ6öÒöf6V&öö²÷&V7Bö—77VW2ó#S ¢òòF†—26öFR—2DUbÖöæÇ’6ò6—¦R—2æ÷B6öæ6W&âà  ¢F&vWBçFrÒ6÷W&6RçFs°¢F&vWBæ¶W’Ò6÷W&6Ræ¶W“°¢F&vWBæVÆVÖVçEG—RÒ6÷W&6RæVÆVÖVçEG—S°¢F&vWBçG—RÒ6÷W&6RçG—S°¢F&vWBç7FFTæöFRÒ6÷W&6Rç7FFTæöFS°¢F&vWBç&WGW&âÒ6÷W&6Rç&WGW&ã°¢F&vWBæ6†–ÆBÒ6÷W&6Ræ6†–ÆC°¢F&vWBç6–&Æ–ærÒ6÷W&6Rç6–&Æ–æs°¢F&vWBæ–æFW‚Ò6÷W&6Ræ–æFWƒ°¢F&vWBç&VbÒ6÷W&6Rç&Vc°¢F&vWBçVæF–æu&÷2Ò6÷W&6RçVæF–æu&÷3°¢F&vWBæÖVÖö—¦VE&÷2Ò6÷W&6RæÖVÖö—¦VE&÷3°¢F&vWBçWFFUVWVRÒ6÷W&6RçWFFUVWVS°¢F&vWBæÖVÖö—¦VE7FFRÒ6÷W&6RæÖVÖö—¦VE7FFS°¢F&vWBæFWVæFVæ6–W2Ò6÷W&6RæFWVæFVæ6–W3°¢F&vWBæÖöFRÒ6÷W&6RæÖöFS°¢F&vWBæfÆw2Ò6÷W&6RæfÆw3°¢F&vWBç7V'G&VTfÆw2Ò6÷W&6Rç7V'G&VTfÆw3°¢F&vWBæFVÆWF–öç2Ò6÷W&6RæFVÆWF–öç3°¢F&vWBæÆæW2Ò6÷W&6RæÆæW3°¢F&vWBæ6†–ÆDÆæW2Ò6÷W&6Ræ6†–ÆDÆæW3°¢F&vWBæÇFW&æFRÒ6÷W&6RæÇFW&æFS° ¢°¢F&vWBæ7GVÄGW&F–öâÒ6÷W&6Ræ7GVÄGW&F–öã°¢F&vWBæ7GVÅ7F'EF–ÖRÒ6÷W&6Ræ7GVÅ7F'EF–ÖS°¢F&vWBç6VÆd&6TGW&F–öâÒ6÷W&6Rç6VÆd&6TGW&F–öã°¢F&vWBçG&VT&6TGW&F–öâÒ6÷W&6RçG&VT&6TGW&F–öã°¢Ð ¢F&vWBåöFV'Vu6÷W&6RÒ6÷W&6RåöFV'Vu6÷W&6S°¢F&vWBåöFV'Vt÷væW"Ò6÷W&6RåöFV'Vt÷væW#°¢F&vWBåöFV'VtæVVG5&VÖ÷VçBÒ6÷W&6RåöFV'VtæVVG5&VÖ÷VçC°¢F&vWBåöFV'Vt†ööµG—W2Ò6÷W&6RåöFV'Vt†ööµG—W3°¢&WGW&âF&vWC°¢Ð ¢gVæ7F–öâf–&W%&ö÷DæöFR†6öçF–æW$–æfòÂFrÂ‡–G&FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"’°¢F†—2çFrÒFs°¢F†—2æ6öçF–æW$–æfòÒ6öçF–æW$–æfó°¢F†—2çVæF–æt6†–ÆG&VâÒçVÆÃ°¢F†—2æ7W'&VçBÒçVÆÃ°¢F†—2ç–æt66†RÒçVÆÃ°¢F†—2æf–æ—6†VEv÷&²ÒçVÆÃ°¢F†—2çF–ÖV÷WD†æFÆRÒæõF–ÖV÷WC°¢F†—2æ6öçFW‡BÒçVÆÃ°¢F†—2çVæF–æt6öçFW‡BÒçVÆÃ°¢F†—2æ6ÆÆ&6´æöFRÒçVÆÃ°¢F†—2æ6ÆÆ&6µ&–÷&—G’ÒæôÆæS°¢F†—2æWfVçEF–ÖW2Ò7&VFTÆæTÖ„æôÆæW2“°¢F†—2æW‡—&F–öåF–ÖW2Ò7&VFTÆæTÖ„æõF–ÖW7F×“°¢F†—2çVæF–ætÆæW2ÒæôÆæW3°¢F†—2ç7W7VæFVDÆæW2ÒæôÆæW3°¢F†—2ç–ævVDÆæW2ÒæôÆæW3°¢F†—2æW‡—&VDÆæW2ÒæôÆæW3°¢F†—2æ×WF&ÆU&VDÆæW2ÒæôÆæW3°¢F†—2æf–æ—6†VDÆæW2ÒæôÆæW3°¢F†—2æVçFævÆVDÆæW2ÒæôÆæW3°¢F†—2æVçFævÆVÖVçG2Ò7&VFTÆæTÖ„æôÆæW2“°¢F†—2æ–FVçF–f–W%&Vf—‚Ò–FVçF–f–W%&Vf—ƒ°¢F†—2æöå&V6÷fW&&ÆTW'&÷"Òöå&V6÷fW&&ÆTW'&÷#° ¢°¢F†—2æ×WF&ÆU6÷W&6TVvW$‡–G&F–öäFFÒçVÆÃ°¢Ð ¢°¢F†—2æVffV7DGW&F–öâÒ°¢F†—2ç76—fTVffV7DGW&F–öâÒ°¢Ð ¢°¢F†—2æÖVÖö—¦VEWFFW'2ÒæWr6WB‚“°¢f"VæF–æuWFFW'4ÆæTÖÒF†—2çVæF–æuWFFW'4ÆæTÖÒµÓ° ¢f÷"‡f"ö’Ò²ö’ÂF÷FÄÆæW3²ö’²²’°¢VæF–æuWFFW'4ÆæTÖçW6‚†æWr6WB‚’“°¢Ð¢Ð ¢°¢7v—F6‚‡Fr’°¢66R6öæ7W'&VçE&ö÷C ¢F†—2åöFV'Vu&ö÷EG—RÒ‡–G&FRòv‡–G&FU&ö÷B‚’r¢v7&VFU&ö÷B‚’s°¢'&V³° ¢66RÆVv7•&ö÷C ¢F†—2åöFV'Vu&ö÷EG—RÒ‡–G&FRòv‡–G&FR‚’r¢w&VæFW"‚’s°¢'&V³°¢Ð¢Ð¢Ð ¢gVæ7F–öâ7&VFTf–&W%&ö÷B†6öçF–æW$–æfòÂFrÂ‡–G&FRÂ–æ—F–Ä6†–ÆG&VâÂ‡–G&F–öä6ÆÆ&6·2Â—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂòòDôDó¢vR†fR6WfW&ÂöbF†W6R&wVÖVçG2F†B&R6öæ6WGVÆÇ’'BöbF†P¢òò†÷7B6öæf–rÂ'WB&V6W6RF†W’&R76VB–âB'VçF–ÖRÂvR†fRFòF‡&V@¢òòF†VÒF‡&÷Vv‚F†R&ö÷B6öç7G'V7F÷"âW&†2vR6†÷VÆBWBF†VÒÆÂ–çFò¢òò6–ævÆRG—RÂÆ–¶RG–æÖ–4†÷7D6öæf–rF†B—2FVf–æVB'’F†R&VæFW&W"à¢–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"ÂG&ç6—F–öä6ÆÆ&6·2’°¢f"&ö÷BÒæWrf–&W%&ö÷DæöFR†6öçF–æW$–æfòÂFrÂ‡–G&FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"“°¢òò7FFTæöFR—2ç’à  ¢f"Væ–æ—F–Æ—¦VDf–&W"Ò7&VFT†÷7E&ö÷Df–&W"‡FrÂ—57G&–7DÖöFR“°¢&ö÷Bæ7W'&VçBÒVæ–æ—F–Æ—¦VDf–&W#°¢Væ–æ—F–Æ—¦VDf–&W"ç7FFTæöFRÒ&ö÷C° ¢°¢f"ö–æ—F–Å7FFRÒ°¢VÆVÖVçC¢–æ—F–Ä6†–ÆG&VâÀ¢—4FV‡–G&FVC¢‡–G&FRÀ¢66†S¢çVÆÂÀ¢òòæ÷BVæ&ÆVB–W@¢G&ç6—F–öç3¢çVÆÂÀ¢VæF–æu7W7Vç6T&÷VæF&–W3¢çVÆÀ¢Ó°¢Væ–æ—F–Æ—¦VDf–&W"æÖVÖö—¦VE7FFRÒö–æ—F–Å7FFS°¢Ð ¢–æ—F–Æ—¦UWFFUVWVR‡Væ–æ—F–Æ—¦VDf–&W"“°¢&WGW&â&ö÷C°¢Ð ¢f"&V7EfW'6–öâÒs‚ã2ãs° ¢gVæ7F–öâ7&VFU÷'FÂ†6†–ÆG&VâÂ6öçF–æW$–æfòÂòòDôDó¢f–wW&R÷WBF†R’f÷"7&÷72×&VæFW&W"–×ÆVÖVçFF–öâà¢–×ÆVÖVçFF–öâ’°¢f"¶W’Ò&wVÖVçG2æÆVæwF‚â2bb&wVÖVçG5³5ÒÓÒVæFVf–æVBò&wVÖVçG5³5Ò¢çVÆÃ° ¢°¢6†V6´¶W•7G&–æt6öW&6–öâ†¶W’“°¢Ð ¢&WGW&â°¢òòF†—2FrÆÆ÷rW2FòVæ—VVÇ’–FVçF–g’F†—22&V7B÷'FÀ¢BGG—Vöc¢$T5Eõõ%DÅõE•RÀ¢¶W“¢¶W’ÓÒçVÆÂòçVÆÂ¢rr²¶W’À¢6†–ÆG&Vã¢6†–ÆG&VâÀ¢6öçF–æW$–æfó¢6öçF–æW$–æfòÀ¢–×ÆVÖVçFF–öã¢–×ÆVÖVçFF–öà¢Ó°¢Ð ¢f"F–Ev&ä&÷WDæW7FVEWFFW3°¢f"F–Ev&ä&÷WDf–æDæöFT–å7G&–7DÖöFS° ¢°¢F–Ev&ä&÷WDæW7FVEWFFW2ÒfÇ6S°¢F–Ev&ä&÷WDf–æDæöFT–å7G&–7DÖöFRÒ·Ó°¢Ð ¢gVæ7F–öâvWD6öçFW‡Df÷%7V'G&VR‡&VçD6ö×öæVçB’°¢–b‚&VçD6ö×öæVçB’°¢&WGW&âV×G”6öçFW‡Dö&¦V7C°¢Ð ¢f"f–&W"ÒvWB‡&VçD6ö×öæVçB“°¢f"&VçD6öçFW‡BÒf–æD7W'&VçEVæÖ6¶VD6öçFW‡B†f–&W"“° ¢–b†f–&W"çFrÓÓÒ6Æ746ö×öæVçB’°¢f"6ö×öæVçBÒf–&W"çG—S° ¢–b†—46öçFW‡E&÷f–FW"„6ö×öæVçB’’°¢&WGW&â&ö6W746†–ÆD6öçFW‡B†f–&W"Â6ö×öæVçBÂ&VçD6öçFW‡B“°¢Ð¢Ð ¢&WGW&â&VçD6öçFW‡C°¢Ð ¢gVæ7F–öâf–æD†÷7D–ç7Fæ6Uv—F…v&æ–ær†6ö×öæVçBÂÖWF†öDæÖR’°¢°¢f"f–&W"ÒvWB†6ö×öæVçB“° ¢–b†f–&W"ÓÓÒVæFVf–æVB’°¢–b‡G—Vöb6ö×öæVçBç&VæFW"ÓÓÒvgVæ7F–öâr’°¢F‡&÷ræWrW'&÷"‚uVæ&ÆRFòf–æBæöFRöââVæÖ÷VçFVB6ö×öæVçBâr“°¢ÒVÇ6R°¢f"¶W—2Òö&¦V7Bæ¶W—2†6ö×öæVçB’æ¦ö–â‚rÂr“°¢F‡&÷ræWrW'&÷"‚$&wVÖVçBV'2Fòæ÷B&R&V7D6ö×öæVçBâ¶W—3¢"²¶W—2“°¢Ð¢Ð ¢f"†÷7Df–&W"Òf–æD7W'&VçD†÷7Df–&W"†f–&W"“° ¢–b††÷7Df–&W"ÓÓÒçVÆÂ’°¢&WGW&âçVÆÃ°¢Ð ¢–b††÷7Df–&W"æÖöFRb7G&–7DÆVv7”ÖöFR’°¢f"6ö×öæVçDæÖRÒvWD6ö×öæVçDæÖTg&öÔf–&W"†f–&W"’ÇÂt6ö×öæVçBs° ¢–b‚F–Ev&ä&÷WDf–æDæöFT–å7G&–7DÖöFU¶6ö×öæVçDæÖUÒ’°¢F–Ev&ä&÷WDf–æDæöFT–å7G&–7DÖöFU¶6ö×öæVçDæÖUÒÒG'VS°¢f"&Wf–÷W4f–&W"Ò7W'&VçC° ¢G'’°¢6WD7W'&VçDf–&W"††÷7Df–&W"“° ¢–b†f–&W"æÖöFRb7G&–7DÆVv7”ÖöFR’°¢W'&÷"‚rW2—2FW&V6FVB–â7G&–7DÖöFRâr²rW2v276VBâ–ç7Fæ6RöbW2v†–6‚—2–ç6–FR7G&–7DÖöFRâr²t–ç7FVBÂFB&VbF—&V7FÇ’FòF†RVÆVÖVçB–÷RvçBFò&VfW&Væ6Râr²tÆV&âÖ÷&R&÷WBW6–ær&Vg26fVÇ’†W&S¢r²v‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7G&–7BÖÖöFRÖf–æBÖæöFRrÂÖWF†öDæÖRÂÖWF†öDæÖRÂ6ö×öæVçDæÖR“°¢ÒVÇ6R°¢W'&÷"‚rW2—2FW&V6FVB–â7G&–7DÖöFRâr²rW2v276VBâ–ç7Fæ6RöbW2v†–6‚&VæFW'27G&–7DÖöFR6†–ÆG&Vââr²t–ç7FVBÂFB&VbF—&V7FÇ’FòF†RVÆVÖVçB–÷RvçBFò&VfW&Væ6Râr²tÆV&âÖ÷&R&÷WBW6–ær&Vg26fVÇ’†W&S¢r²v‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7G&–7BÖÖöFRÖf–æBÖæöFRrÂÖWF†öDæÖRÂÖWF†öDæÖRÂ6ö×öæVçDæÖR“°¢Ð¢Òf–æÆÇ’°¢òò–FVÆÇ’F†—26†÷VÆB&W6WBFò&Wf–÷W2'WBF†—26†÷VÆFâwB&R6ÆÆVB–à¢òò&VæFW"æBF†W&Rw2æ÷F†W"v&æ–ærf÷"F†Bç—v’à¢–b‡&Wf–÷W4f–&W"’°¢6WD7W'&VçDf–&W"‡&Wf–÷W4f–&W"“°¢ÒVÇ6R°¢&W6WD7W'&VçDf–&W"‚“°¢Ð¢Ð¢Ð¢Ð ¢&WGW&â†÷7Df–&W"ç7FFTæöFS°¢Ð¢Ð ¢gVæ7F–öâ7&VFT6öçF–æW"†6öçF–æW$–æfòÂFrÂ‡–G&F–öä6ÆÆ&6·2Â—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"ÂG&ç6—F–öä6ÆÆ&6·2’°¢f"‡–G&FRÒfÇ6S°¢f"–æ—F–Ä6†–ÆG&VâÒçVÆÃ°¢&WGW&â7&VFTf–&W%&ö÷B†6öçF–æW$–æfòÂFrÂ‡–G&FRÂ–æ—F–Ä6†–ÆG&VâÂ‡–G&F–öä6ÆÆ&6·2Â—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"“°¢Ð¢gVæ7F–öâ7&VFT‡–G&F–öä6öçF–æW"†–æ—F–Ä6†–ÆG&VâÂòòDôDó¢&VÖ÷fR6ÆÆ&6¶v†VâvRFVÆWFRÆVv7’ÖöFRà¢6ÆÆ&6²Â6öçF–æW$–æfòÂFrÂ‡–G&F–öä6ÆÆ&6·2Â—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"ÂG&ç6—F–öä6ÆÆ&6·2’°¢f"‡–G&FRÒG'VS°¢f"&ö÷BÒ7&VFTf–&W%&ö÷B†6öçF–æW$–æfòÂFrÂ‡–G&FRÂ–æ—F–Ä6†–ÆG&VâÂ‡–G&F–öä6ÆÆ&6·2Â—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"“²òòDôDó¢Ö÷fRF†—2Fòf–&W%&ö÷B6öç7G'V7F÷  ¢&ö÷Bæ6öçFW‡BÒvWD6öçFW‡Df÷%7V'G&VR†çVÆÂ“²òò66†VGVÆRF†R–æ—F–Â&VæFW"â–â‡–G&F–öâ&ö÷BÂF†—2—2F–ffW&VçBg&öÐ¢òò&VwVÆ"WFFR&V6W6RF†R–æ—F–Â&VæFW"×W7BÖF6‚v2v2&VæFW&V@¢òòöâF†R6W'fW"à¢òòäõDS¢F†—2WFFR–çFVçF–öæÆÇ’FöW6âwB†fR–ÆöBâvRw&RöæÇ’W6–æp¢òòF†RWFFRFò66†VGVÆRv÷&²öâF†R&ö÷Bf–&W"†æBÂf÷"ÆVv7’&ö÷G2ÂFð¢òòVçVWVRF†R6ÆÆ&6²–böæR—2&÷f–FVB’à ¢f"7W'&VçBÒ&ö÷Bæ7W'&VçC°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢f"ÆæRÒ&WVW7EWFFTÆæR†7W'&VçB“°¢f"WFFRÒ7&VFUWFFR†WfVçEF–ÖRÂÆæR“°¢WFFRæ6ÆÆ&6²Ò6ÆÆ&6²ÓÒVæFVf–æVBbb6ÆÆ&6²ÓÒçVÆÂò6ÆÆ&6²¢çVÆÃ°¢VçVWVUWFFR†7W'&VçBÂWFFRÂÆæR“°¢66†VGVÆT–æ—F–Ä‡–G&F–öäöå&ö÷B‡&ö÷BÂÆæRÂWfVçEF–ÖR“°¢&WGW&â&ö÷C°¢Ð¢gVæ7F–öâWFFT6öçF–æW"†VÆVÖVçBÂ6öçF–æW"Â&VçD6ö×öæVçBÂ6ÆÆ&6²’°¢°¢öå66†VGVÆU&ö÷B†6öçF–æW"ÂVÆVÖVçB“°¢Ð ¢f"7W'&VçBCÒ6öçF–æW"æ7W'&VçC°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢f"ÆæRÒ&WVW7EWFFTÆæR†7W'&VçBC“° ¢°¢Ö&µ&VæFW%66†VGVÆVB†ÆæR“°¢Ð ¢f"6öçFW‡BÒvWD6öçFW‡Df÷%7V'G&VR‡&VçD6ö×öæVçB“° ¢–b†6öçF–æW"æ6öçFW‡BÓÓÒçVÆÂ’°¢6öçF–æW"æ6öçFW‡BÒ6öçFW‡C°¢ÒVÇ6R°¢6öçF–æW"çVæF–æt6öçFW‡BÒ6öçFW‡C°¢Ð ¢°¢–b†—5&VæFW&–ærbb7W'&VçBÓÒçVÆÂbbF–Ev&ä&÷WDæW7FVEWFFW2’°¢F–Ev&ä&÷WDæW7FVEWFFW2ÒG'VS° ¢W'&÷"‚u&VæFW"ÖWF†öG26†÷VÆB&RW&RgVæ7F–öâöb&÷2æB7FFS²r²wG&–vvW&–æræW7FVB6ö×öæVçBWFFW2g&öÒ&VæFW"—2æ÷BÆÆ÷vVBâr²t–bæV6W76'’ÂG&–vvW"æW7FVBWFFW2–â6ö×öæVçDF–EWFFRåÆåÆâr²t6†V6²F†R&VæFW"ÖWF†öBöbW2ârÂvWD6ö×öæVçDæÖTg&öÔf–&W"†7W'&VçB’ÇÂuVæ¶æ÷vâr“°¢Ð¢Ð ¢f"WFFRÒ7&VFUWFFR†WfVçEF–ÖRÂÆæR“²òò6WF–öã¢&V7BFWeFööÇ27W'&VçFÇ’FWVæG2öâF†—2&÷W'G¢òò&V–ær6ÆÆVB&VÆVÖVçB"à ¢WFFRç–ÆöBÒ°¢VÆVÖVçC¢VÆVÖVç@¢Ó°¢6ÆÆ&6²Ò6ÆÆ&6²ÓÓÒVæFVf–æVBòçVÆÂ¢6ÆÆ&6³° ¢–b†6ÆÆ&6²ÓÒçVÆÂ’°¢°¢–b‡G—Vöb6ÆÆ&6²ÓÒvgVæ7F–öâr’°¢W'&÷"‚w&VæFW"‚âââ“¢W‡V7FVBF†RÆ7B÷F–öæÂ6ÆÆ&6¶&wVÖVçBFò&Rr²vgVæ7F–öââ–ç7FVB&V6V—fVC¢W2ârÂ6ÆÆ&6²“°¢Ð¢Ð ¢WFFRæ6ÆÆ&6²Ò6ÆÆ&6³°¢Ð ¢f"&ö÷BÒVçVWVUWFFR†7W'&VçBCÂWFFRÂÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂ7W'&VçBCÂÆæRÂWfVçEF–ÖR“°¢VçFævÆUG&ç6—F–öç2‡&ö÷BÂ7W'&VçBCÂÆæR“°¢Ð ¢&WGW&âÆæS°¢Ð¢gVæ7F–öâvWEV&Æ–5&ö÷D–ç7Fæ6R†6öçF–æW"’°¢f"6öçF–æW$f–&W"Ò6öçF–æW"æ7W'&VçC° ¢–b‚6öçF–æW$f–&W"æ6†–ÆB’°¢&WGW&âçVÆÃ°¢Ð ¢7v—F6‚†6öçF–æW$f–&W"æ6†–ÆBçFr’°¢66R†÷7D6ö×öæVçC ¢&WGW&âvWEV&Æ–4–ç7Fæ6R†6öçF–æW$f–&W"æ6†–ÆBç7FFTæöFR“° ¢FVfVÇC ¢&WGW&â6öçF–æW$f–&W"æ6†–ÆBç7FFTæöFS°¢Ð¢Ð¢gVæ7F–öâGFV×E7–æ6‡&öæ÷W4‡–G&F–öâC†f–&W"’°¢7v—F6‚†f–&W"çFr’°¢66R†÷7E&ö÷C ¢°¢f"&ö÷BÒf–&W"ç7FFTæöFS° ¢–b†—5&ö÷DFV‡–G&FVB‡&ö÷B’’°¢òòfÇW6‚F†Rf—'7B66†VGVÆVB'WFFR"à¢f"ÆæW2ÒvWD†–v†W7E&–÷&—G•VæF–ætÆæW2‡&ö÷B“°¢fÇW6…&ö÷B‡&ö÷BÂÆæW2“°¢Ð ¢'&V³°¢Ð ¢66R7W7Vç6T6ö×öæVçC ¢°¢fÇW6…7–æ2†gVæ7F–öâ‚’°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂWfVçEF–ÖR“°¢Ð¢Ò“²òò–bvRw&R7F–ÆÂ&Æö6¶VBgFW"F†—2ÂvRæVVBFò–æ7&V6P¢òòF†R&–÷&—G’öbç’&öÖ—6W2&W6öÇf–ærv—F†–âF†—0¢òò&÷VæF'’6òF†BF†W’æW‡BGFV×BÇ6ò†2†–v†W"&’à ¢f"&WG'”ÆæRÒ7–æ4ÆæS°¢Ö&µ&WG'”ÆæT–dæ÷D‡–G&FVB†f–&W"Â&WG'”ÆæR“°¢'&V³°¢Ð¢Ð¢Ð ¢gVæ7F–öâÖ&µ&WG'”ÆæT–×Â†f–&W"Â&WG'”ÆæR’°¢f"7W7Vç6U7FFRÒf–&W"æÖVÖö—¦VE7FFS° ¢–b‡7W7Vç6U7FFRÓÒçVÆÂbb7W7Vç6U7FFRæFV‡–G&FVBÓÒçVÆÂ’°¢7W7Vç6U7FFRç&WG'”ÆæRÒ†–v†W%&–÷&—G”ÆæR‡7W7Vç6U7FFRç&WG'”ÆæRÂ&WG'”ÆæR“°¢Ð¢Òòò–æ7&V6W2F†R&–÷&—G’öbF†Væ&ÆW2v†VâF†W’&W6öÇfRv—F†–âF†—2&÷VæF'’à  ¢gVæ7F–öâÖ&µ&WG'”ÆæT–dæ÷D‡–G&FVB†f–&W"Â&WG'”ÆæR’°¢Ö&µ&WG'”ÆæT–×Â†f–&W"Â&WG'”ÆæR“°¢f"ÇFW&æFRÒf–&W"æÇFW&æFS° ¢–b†ÇFW&æFR’°¢Ö&µ&WG'”ÆæT–×Â†ÇFW&æFRÂ&WG'”ÆæR“°¢Ð¢Ð¢gVæ7F–öâGFV×D6öçF–çV÷W4‡–G&F–öâC†f–&W"’°¢–b†f–&W"çFrÓÒ7W7Vç6T6ö×öæVçB’°¢òòvR–væ÷&R†÷7E&ö÷G2†W&R&V6W6RvR6âwB–æ7&V6P¢òòF†V—"&–÷&—G’æBF†W’6†÷VÆBæ÷B7W7VæBöâ’ôòÀ¢òò6–æ6R–÷R†fRFòw&ç—F†–ærF†BÖ–v‡B7W7VæB–à¢òò7W7Vç6Rà¢&WGW&ã°¢Ð ¢f"ÆæRÒ6VÆV7F—fT‡–G&F–öäÆæS°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"ÂÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"ÂÆæRÂWfVçEF–ÖR“°¢Ð ¢Ö&µ&WG'”ÆæT–dæ÷D‡–G&FVB†f–&W"ÂÆæR“°¢Ð¢gVæ7F–öâGFV×D‡–G&F–öäD7W'&VçE&–÷&—G’C†f–&W"’°¢–b†f–&W"çFrÓÒ7W7Vç6T6ö×öæVçB’°¢òòvR–væ÷&R†÷7E&ö÷G2†W&R&V6W6RvR6âwB–æ7&V6P¢òòF†V—"&–÷&—G’÷F†W"F†â7–æ6‡&öæ÷W6Ç’fÇW6‚—Bà¢&WGW&ã°¢Ð ¢f"ÆæRÒ&WVW7EWFFTÆæR†f–&W"“°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"ÂÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢f"WfVçEF–ÖRÒ&WVW7DWfVçEF–ÖR‚“°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"ÂÆæRÂWfVçEF–ÖR“°¢Ð ¢Ö&µ&WG'”ÆæT–dæ÷D‡–G&FVB†f–&W"ÂÆæR“°¢Ð¢gVæ7F–öâf–æD†÷7D–ç7Fæ6Uv—F„æõ÷'FÇ2†f–&W"’°¢f"†÷7Df–&W"Òf–æD7W'&VçD†÷7Df–&W%v—F„æõ÷'FÇ2†f–&W"“° ¢–b††÷7Df–&W"ÓÓÒçVÆÂ’°¢&WGW&âçVÆÃ°¢Ð ¢&WGW&â†÷7Df–&W"ç7FFTæöFS°¢Ð ¢f"6†÷VÆDW'&÷$–×ÂÒgVæ7F–öâ†f–&W"’°¢&WGW&âçVÆÃ°¢Ó° ¢gVæ7F–öâ6†÷VÆDW'&÷"†f–&W"’°¢&WGW&â6†÷VÆDW'&÷$–×Â†f–&W"“°¢Ð ¢f"6†÷VÆE7W7VæD–×ÂÒgVæ7F–öâ†f–&W"’°¢&WGW&âfÇ6S°¢Ó° ¢gVæ7F–öâ6†÷VÆE7W7VæB†f–&W"’°¢&WGW&â6†÷VÆE7W7VæD–×Â†f–&W"“°¢Ð¢f"÷fW'&–FT†ööµ7FFRÒçVÆÃ°¢f"÷fW'&–FT†ööµ7FFTFVÆWFUF‚ÒçVÆÃ°¢f"÷fW'&–FT†ööµ7FFU&VæÖUF‚ÒçVÆÃ°¢f"÷fW'&–FU&÷2ÒçVÆÃ°¢f"÷fW'&–FU&÷4FVÆWFUF‚ÒçVÆÃ°¢f"÷fW'&–FU&÷5&VæÖUF‚ÒçVÆÃ°¢f"66†VGVÆUWFFRÒçVÆÃ°¢f"6WDW'&÷$†æFÆW"ÒçVÆÃ°¢f"6WE7W7Vç6T†æFÆW"ÒçVÆÃ° ¢°¢f"6÷•v—F„FVÆWFT–×ÂÒgVæ7F–öâ†ö&¢ÂF‚Â–æFW‚’°¢f"¶W’ÒF…¶–æFW…Ó°¢f"WFFVBÒ—4'&’†ö&¢’òö&¢ç6Æ–6R‚’¢76–vâ‡·ÒÂö&¢“° ¢–b†–æFW‚²ÓÓÒF‚æÆVæwF‚’°¢–b†—4'&’‡WFFVB’’°¢WFFVBç7Æ–6R†¶W’Â“°¢ÒVÇ6R°¢FVÆWFRWFFVE¶¶W•Ó°¢Ð ¢&WGW&âWFFVC°¢ÒòòDfÆ÷tf—„ÖRçVÖ&W"÷"7G&–ær—2f–æR†W&P  ¢WFFVE¶¶W•ÒÒ6÷•v—F„FVÆWFT–×Â†ö&¥¶¶W•ÒÂF‚Â–æFW‚²“°¢&WGW&âWFFVC°¢Ó° ¢f"6÷•v—F„FVÆWFRÒgVæ7F–öâ†ö&¢ÂF‚’°¢&WGW&â6÷•v—F„FVÆWFT–×Â†ö&¢ÂF‚Â“°¢Ó° ¢f"6÷•v—F…&VæÖT–×ÂÒgVæ7F–öâ†ö&¢ÂöÆEF‚ÂæWuF‚Â–æFW‚’°¢f"öÆD¶W’ÒöÆEF…¶–æFW…Ó°¢f"WFFVBÒ—4'&’†ö&¢’òö&¢ç6Æ–6R‚’¢76–vâ‡·ÒÂö&¢“° ¢–b†–æFW‚²ÓÓÒöÆEF‚æÆVæwF‚’°¢f"æWt¶W’ÒæWuF…¶–æFW…Ó²òòDfÆ÷tf—„ÖRçVÖ&W"÷"7G&–ær—2f–æR†W&P ¢WFFVE¶æWt¶W•ÒÒWFFVE¶öÆD¶W•Ó° ¢–b†—4'&’‡WFFVB’’°¢WFFVBç7Æ–6R†öÆD¶W’Â“°¢ÒVÇ6R°¢FVÆWFRWFFVE¶öÆD¶W•Ó°¢Ð¢ÒVÇ6R°¢òòDfÆ÷tf—„ÖRçVÖ&W"÷"7G&–ær—2f–æR†W&P¢WFFVE¶öÆD¶W•ÒÒ6÷•v—F…&VæÖT–×Â‚òòDfÆ÷tf—„ÖRçVÖ&W"÷"7G&–ær—2f–æR†W&P¢ö&¥¶öÆD¶W•ÒÂöÆEF‚ÂæWuF‚Â–æFW‚²“°¢Ð ¢&WGW&âWFFVC°¢Ó° ¢f"6÷•v—F…&VæÖRÒgVæ7F–öâ†ö&¢ÂöÆEF‚ÂæWuF‚’°¢–b†öÆEF‚æÆVæwF‚ÓÒæWuF‚æÆVæwF‚’°¢v&â‚v6÷•v—F…&VæÖR‚’W‡V7G2F‡2öbF†R6ÖRÆVæwF‚r“° ¢&WGW&ã°¢ÒVÇ6R°¢f÷"‡f"’Ò²’ÂæWuF‚æÆVæwF‚Ò²’²²’°¢–b†öÆEF…¶•ÒÓÒæWuF…¶•Ò’°¢v&â‚v6÷•v—F…&VæÖR‚’W‡V7G2F‡2Fò&RF†R6ÖRW†6WBf÷"F†RFVWW7B¶W’r“° ¢&WGW&ã°¢Ð¢Ð¢Ð ¢&WGW&â6÷•v—F…&VæÖT–×Â†ö&¢ÂöÆEF‚ÂæWuF‚Â“°¢Ó° ¢f"6÷•v—F…6WD–×ÂÒgVæ7F–öâ†ö&¢ÂF‚Â–æFW‚ÂfÇVR’°¢–b†–æFW‚ãÒF‚æÆVæwF‚’°¢&WGW&âfÇVS°¢Ð ¢f"¶W’ÒF…¶–æFW…Ó°¢f"WFFVBÒ—4'&’†ö&¢’òö&¢ç6Æ–6R‚’¢76–vâ‡·ÒÂö&¢“²òòDfÆ÷tf—„ÖRçVÖ&W"÷"7G&–ær—2f–æR†W&P ¢WFFVE¶¶W•ÒÒ6÷•v—F…6WD–×Â†ö&¥¶¶W•ÒÂF‚Â–æFW‚²ÂfÇVR“°¢&WGW&âWFFVC°¢Ó° ¢f"6÷•v—F…6WBÒgVæ7F–öâ†ö&¢ÂF‚ÂfÇVR’°¢&WGW&â6÷•v—F…6WD–×Â†ö&¢ÂF‚ÂÂfÇVR“°¢Ó° ¢f"f–æD†öö²ÒgVæ7F–öâ†f–&W"Â–B’°¢òòf÷"æ÷rÂF†R&–B"öb7FFVgVÂ†öö·2—2§W7BF†R7FFVgVÂ†öö²–æFW‚à¢òòF†—2Ö’6†ævR–âF†RgWGW&Rv—F‚RærâæW7FVB†öö·2à¢f"7W'&VçD†öö²Òf–&W"æÖVÖö—¦VE7FFS° ¢v†–ÆR†7W'&VçD†öö²ÓÒçVÆÂbb–Bâ’°¢7W'&VçD†öö²Ò7W'&VçD†öö²ææW‡C°¢–BÒÓ°¢Ð ¢&WGW&â7W'&VçD†öö³°¢Ó²òò7W÷'BFWeFööÇ2VF—F&ÆRfÇVW2f÷"W6U7FFRæBW6U&VGV6W"à  ¢÷fW'&–FT†ööµ7FFRÒgVæ7F–öâ†f–&W"Â–BÂF‚ÂfÇVR’°¢f"†öö²Òf–æD†öö²†f–&W"Â–B“° ¢–b††öö²ÓÒçVÆÂ’°¢f"æWu7FFRÒ6÷•v—F…6WB††öö²æÖVÖö—¦VE7FFRÂF‚ÂfÇVR“°¢†öö²æÖVÖö—¦VE7FFRÒæWu7FFS°¢†öö²æ&6U7FFRÒæWu7FFS²òòvR&VâwB7GVÆÇ’FF–ærâWFFRFòF†RVWVRÀ¢òò&V6W6RF†W&R—2æòWFFRvR6âFBf÷"W6U&VGV6W"†öö·2F†BvöâwBG&–vvW"âW'&÷"à¢òò…F†W&Rw2æò&÷&–FR7F–öâG—Rf÷"FWeFööÇ2÷fW'&–FW2â¢òò2&W7VÇBF†÷Vv‚Â&V7Bv–ÆÂ6VRF†R66†VGVÆVBWFFR2æö÷æB&–Æ÷WBà¢òò6†ÆÆ÷r6Æöæ–ær&÷2v÷&·22v÷&¶&÷VæBf÷"æ÷rFò'—72F†R&–Æ÷WB6†V6²à ¢f–&W"æÖVÖö—¦VE&÷2Ò76–vâ‡·ÒÂf–&W"æÖVÖö—¦VE&÷2“°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ð¢Ó° ¢÷fW'&–FT†ööµ7FFTFVÆWFUF‚ÒgVæ7F–öâ†f–&W"Â–BÂF‚’°¢f"†öö²Òf–æD†öö²†f–&W"Â–B“° ¢–b††öö²ÓÒçVÆÂ’°¢f"æWu7FFRÒ6÷•v—F„FVÆWFR††öö²æÖVÖö—¦VE7FFRÂF‚“°¢†öö²æÖVÖö—¦VE7FFRÒæWu7FFS°¢†öö²æ&6U7FFRÒæWu7FFS²òòvR&VâwB7GVÆÇ’FF–ærâWFFRFòF†RVWVRÀ¢òò&V6W6RF†W&R—2æòWFFRvR6âFBf÷"W6U&VGV6W"†öö·2F†BvöâwBG&–vvW"âW'&÷"à¢òò…F†W&Rw2æò&÷&–FR7F–öâG—Rf÷"FWeFööÇ2÷fW'&–FW2â¢òò2&W7VÇBF†÷Vv‚Â&V7Bv–ÆÂ6VRF†R66†VGVÆVBWFFR2æö÷æB&–Æ÷WBà¢òò6†ÆÆ÷r6Æöæ–ær&÷2v÷&·22v÷&¶&÷VæBf÷"æ÷rFò'—72F†R&–Æ÷WB6†V6²à ¢f–&W"æÖVÖö—¦VE&÷2Ò76–vâ‡·ÒÂf–&W"æÖVÖö—¦VE&÷2“°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ð¢Ó° ¢÷fW'&–FT†ööµ7FFU&VæÖUF‚ÒgVæ7F–öâ†f–&W"Â–BÂöÆEF‚ÂæWuF‚’°¢f"†öö²Òf–æD†öö²†f–&W"Â–B“° ¢–b††öö²ÓÒçVÆÂ’°¢f"æWu7FFRÒ6÷•v—F…&VæÖR††öö²æÖVÖö—¦VE7FFRÂöÆEF‚ÂæWuF‚“°¢†öö²æÖVÖö—¦VE7FFRÒæWu7FFS°¢†öö²æ&6U7FFRÒæWu7FFS²òòvR&VâwB7GVÆÇ’FF–ærâWFFRFòF†RVWVRÀ¢òò&V6W6RF†W&R—2æòWFFRvR6âFBf÷"W6U&VGV6W"†öö·2F†BvöâwBG&–vvW"âW'&÷"à¢òò…F†W&Rw2æò&÷&–FR7F–öâG—Rf÷"FWeFööÇ2÷fW'&–FW2â¢òò2&W7VÇBF†÷Vv‚Â&V7Bv–ÆÂ6VRF†R66†VGVÆVBWFFR2æö÷æB&–Æ÷WBà¢òò6†ÆÆ÷r6Æöæ–ær&÷2v÷&·22v÷&¶&÷VæBf÷"æ÷rFò'—72F†R&–Æ÷WB6†V6²à ¢f–&W"æÖVÖö—¦VE&÷2Ò76–vâ‡·ÒÂf–&W"æÖVÖö—¦VE&÷2“°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ð¢Ó²òò7W÷'BFWeFööÇ2&÷2f÷"gVæ7F–öâ6ö×öæVçG2Âf÷'v&E&VbÂÖVÖòÂ†÷7B6ö×öæVçG2ÂWF2à  ¢÷fW'&–FU&÷2ÒgVæ7F–öâ†f–&W"ÂF‚ÂfÇVR’°¢f–&W"çVæF–æu&÷2Ò6÷•v—F…6WB†f–&W"æÖVÖö—¦VE&÷2ÂF‚ÂfÇVR“° ¢–b†f–&W"æÇFW&æFR’°¢f–&W"æÇFW&æFRçVæF–æu&÷2Òf–&W"çVæF–æu&÷3°¢Ð ¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ó° ¢÷fW'&–FU&÷4FVÆWFUF‚ÒgVæ7F–öâ†f–&W"ÂF‚’°¢f–&W"çVæF–æu&÷2Ò6÷•v—F„FVÆWFR†f–&W"æÖVÖö—¦VE&÷2ÂF‚“° ¢–b†f–&W"æÇFW&æFR’°¢f–&W"æÇFW&æFRçVæF–æu&÷2Òf–&W"çVæF–æu&÷3°¢Ð ¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ó° ¢÷fW'&–FU&÷5&VæÖUF‚ÒgVæ7F–öâ†f–&W"ÂöÆEF‚ÂæWuF‚’°¢f–&W"çVæF–æu&÷2Ò6÷•v—F…&VæÖR†f–&W"æÖVÖö—¦VE&÷2ÂöÆEF‚ÂæWuF‚“° ¢–b†f–&W"æÇFW&æFR’°¢f–&W"æÇFW&æFRçVæF–æu&÷2Òf–&W"çVæF–æu&÷3°¢Ð ¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ó° ¢66†VGVÆUWFFRÒgVæ7F–öâ†f–&W"’°¢f"&ö÷BÒVçVWVT6öæ7W'&VçE&VæFW$f÷$ÆæR†f–&W"Â7–æ4ÆæR“° ¢–b‡&ö÷BÓÒçVÆÂ’°¢66†VGVÆUWFFTöäf–&W"‡&ö÷BÂf–&W"Â7–æ4ÆæRÂæõF–ÖW7F×“°¢Ð¢Ó° ¢6WDW'&÷$†æFÆW"ÒgVæ7F–öâ†æWu6†÷VÆDW'&÷$–×Â’°¢6†÷VÆDW'&÷$–×ÂÒæWu6†÷VÆDW'&÷$–×Ã°¢Ó° ¢6WE7W7Vç6T†æFÆW"ÒgVæ7F–öâ†æWu6†÷VÆE7W7VæD–×Â’°¢6†÷VÆE7W7VæD–×ÂÒæWu6†÷VÆE7W7VæD–×Ã°¢Ó°¢Ð ¢gVæ7F–öâf–æD†÷7D–ç7Fæ6T'”f–&W"†f–&W"’°¢f"†÷7Df–&W"Òf–æD7W'&VçD†÷7Df–&W"†f–&W"“° ¢–b††÷7Df–&W"ÓÓÒçVÆÂ’°¢&WGW&âçVÆÃ°¢Ð ¢&WGW&â†÷7Df–&W"ç7FFTæöFS°¢Ð ¢gVæ7F–öâV×G”f–æDf–&W$'”†÷7D–ç7Fæ6R†–ç7Fæ6R’°¢&WGW&âçVÆÃ°¢Ð ¢gVæ7F–öâvWD7W'&VçDf–&W$f÷$FWeFööÇ2‚’°¢&WGW&â7W'&VçC°¢Ð ¢gVæ7F–öâ–æ¦V7D–çFôFWeFööÇ2†FWeFööÇ46öæf–r’°¢f"f–æDf–&W$'”†÷7D–ç7Fæ6RÒFWeFööÇ46öæf–ræf–æDf–&W$'”†÷7D–ç7Fæ6S°¢f"&V7D7W'&VçDF—7F6†W"Ò&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçDF—7F6†W#°¢&WGW&â–æ¦V7D–çFW&æÇ2‡°¢'VæFÆUG—S¢FWeFööÇ46öæf–ræ'VæFÆUG—RÀ¢fW'6–öã¢FWeFööÇ46öæf–rçfW'6–öâÀ¢&VæFW&W%6¶vTæÖS¢FWeFööÇ46öæf–rç&VæFW&W%6¶vTæÖRÀ¢&VæFW&W$6öæf–s¢FWeFööÇ46öæf–rç&VæFW&W$6öæf–rÀ¢÷fW'&–FT†ööµ7FFS¢÷fW'&–FT†ööµ7FFRÀ¢÷fW'&–FT†ööµ7FFTFVÆWFUFƒ¢÷fW'&–FT†ööµ7FFTFVÆWFUF‚À¢÷fW'&–FT†ööµ7FFU&VæÖUFƒ¢÷fW'&–FT†ööµ7FFU&VæÖUF‚À¢÷fW'&–FU&÷3¢÷fW'&–FU&÷2À¢÷fW'&–FU&÷4FVÆWFUFƒ¢÷fW'&–FU&÷4FVÆWFUF‚À¢÷fW'&–FU&÷5&VæÖUFƒ¢÷fW'&–FU&÷5&VæÖUF‚À¢6WDW'&÷$†æFÆW#¢6WDW'&÷$†æFÆW"À¢6WE7W7Vç6T†æFÆW#¢6WE7W7Vç6T†æFÆW"À¢66†VGVÆUWFFS¢66†VGVÆUWFFRÀ¢7W'&VçDF—7F6†W%&Vc¢&V7D7W'&VçDF—7F6†W"À¢f–æD†÷7D–ç7Fæ6T'”f–&W#¢f–æD†÷7D–ç7Fæ6T'”f–&W"À¢f–æDf–&W$'”†÷7D–ç7Fæ6S¢f–æDf–&W$'”†÷7D–ç7Fæ6RÇÂV×G”f–æDf–&W$'”†÷7D–ç7Fæ6RÀ¢òò&V7B&Vg&W6€¢f–æD†÷7D–ç7Fæ6W4f÷%&Vg&W6ƒ¢f–æD†÷7D–ç7Fæ6W4f÷%&Vg&W6‚À¢66†VGVÆU&Vg&W6ƒ¢66†VGVÆU&Vg&W6‚À¢66†VGVÆU&ö÷C¢66†VGVÆU&ö÷BÀ¢6WE&Vg&W6„†æFÆW#¢6WE&Vg&W6„†æFÆW"À¢òòVæ&ÆW2FWeFööÇ2FòVæB÷væW"7F6·2FòW'&÷"ÖW76vW2–âDUbÖöFRà¢vWD7W'&VçDf–&W#¢vWD7W'&VçDf–&W$f÷$FWeFööÇ2À¢òòVæ&ÆW2FWeFööÇ2FòFWFV7B&V6öæ6–ÆW"fW'6–öâ&F†W"F†â&VæFW&W"fW'6–öà¢òòv†–6‚Ö’æ÷BÖF6‚f÷"F†—&B'G’&VæFW&W'2à¢&V6öæ6–ÆW%fW'6–öã¢&V7EfW'6–öà¢Ò“°¢Ð ¢ò¢vÆö&Â&W÷'DW'&÷"¢ð ¢f"FVfVÇDöå&V6÷fW&&ÆTW'&÷"ÒG—Vöb&W÷'DW'&÷"ÓÓÒvgVæ7F–öâròòò–âÖöFW&â'&÷w6W'2Â&W÷'DW'&÷"v–ÆÂF—7F6‚âW'&÷"WfVçBÀ¢òòV×VÆF–ærâVæ6Vv‡B¦f67&—BW'&÷"à¢&W÷'DW'&÷"¢gVæ7F–öâ†W'&÷"’°¢òò–âöÆFW"'&÷w6W'2æBFW7BVçf—&öæÖVçG2ÂfÆÆ&6²Fò6öç6öÆRæW'&÷"à¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂöæò×&öGV7F–öâÖÆövv–æp¢6öç6öÆU²vW'&÷"uÒ†W'&÷"“°¢Ó° ¢gVæ7F–öâ&V7DDôÕ&ö÷B†–çFW&æÅ&ö÷B’°¢F†—2åö–çFW&æÅ&ö÷BÒ–çFW&æÅ&ö÷C°¢Ð ¢&V7DDôÔ‡–G&F–öå&ö÷Bç&÷F÷G—Rç&VæFW"Ò&V7DDôÕ&ö÷Bç&÷F÷G—Rç&VæFW"ÒgVæ7F–öâ†6†–ÆG&Vâ’°¢f"&ö÷BÒF†—2åö–çFW&æÅ&ö÷C° ¢–b‡&ö÷BÓÓÒçVÆÂ’°¢F‡&÷ræWrW'&÷"‚t6ææ÷BWFFRâVæÖ÷VçFVB&ö÷Bâr“°¢Ð ¢°¢–b‡G—Vöb&wVÖVçG5³ÒÓÓÒvgVæ7F–öâr’°¢W'&÷"‚w&VæFW"‚âââ“¢FöW2æ÷B7W÷'BF†R6V6öæB6ÆÆ&6²&wVÖVçBâr²uFòW†V7WFR6–FRVffV7BgFW"&VæFW&–ærÂFV6Æ&R—B–â6ö×öæVçB&öG’v—F‚W6TVffV7B‚’âr“°¢ÒVÇ6R–b†—5fÆ–D6öçF–æW"†&wVÖVçG5³Ò’’°¢W'&÷"‚u–÷R76VB6öçF–æW"FòF†R6V6öæB&wVÖVçBöb&ö÷Bç&VæFW"‚âââ’âr²%–÷RFöâwBæVVBFò72—Bv–â6–æ6R–÷RÇ&VG’76VB—BFò7&VFRF†R&ö÷Bâ"“°¢ÒVÇ6R–b‡G—Vöb&wVÖVçG5³ÒÓÒwVæFVf–æVBr’°¢W'&÷"‚u–÷R76VB6V6öæB&wVÖVçBFò&ö÷Bç&VæFW"‚âââ’'WB—BöæÇ’66WG2r²vöæR&wVÖVçBâr“°¢Ð ¢f"6öçF–æW"Ò&ö÷Bæ6öçF–æW$–æfó° ¢–b†6öçF–æW"ææöFUG—RÓÒ4ôÔÔTåEôäôDR’°¢f"†÷7D–ç7Fæ6RÒf–æD†÷7D–ç7Fæ6Uv—F„æõ÷'FÇ2‡&ö÷Bæ7W'&VçB“° ¢–b††÷7D–ç7Fæ6R’°¢–b††÷7D–ç7Fæ6Rç&VçDæöFRÓÒ6öçF–æW"’°¢W'&÷"‚w&VæFW"‚âââ“¢—BÆöö·2Æ–¶RF†R&V7B×&VæFW&VB6öçFVçBöbF†Rr²w&ö÷B6öçF–æW"v2&VÖ÷fVBv—F†÷WBW6–ær&V7BâF†—2—2æ÷Br²w7W÷'FVBæBv–ÆÂ6W6RW'&÷'2â–ç7FVBÂ6ÆÂr²'&ö÷BçVæÖ÷VçB‚’FòV×G’&ö÷Bw26öçF–æW"â"“°¢Ð¢Ð¢Ð¢Ð ¢WFFT6öçF–æW"†6†–ÆG&VâÂ&ö÷BÂçVÆÂÂçVÆÂ“°¢Ó° ¢&V7DDôÔ‡–G&F–öå&ö÷Bç&÷F÷G—RçVæÖ÷VçBÒ&V7DDôÕ&ö÷Bç&÷F÷G—RçVæÖ÷VçBÒgVæ7F–öâ‚’°¢°¢–b‡G—Vöb&wVÖVçG5³ÒÓÓÒvgVæ7F–öâr’°¢W'&÷"‚wVæÖ÷VçB‚âââ“¢FöW2æ÷B7W÷'B6ÆÆ&6²&wVÖVçBâr²uFòW†V7WFR6–FRVffV7BgFW"&VæFW&–ærÂFV6Æ&R—B–â6ö×öæVçB&öG’v—F‚W6TVffV7B‚’âr“°¢Ð¢Ð ¢f"&ö÷BÒF†—2åö–çFW&æÅ&ö÷C° ¢–b‡&ö÷BÓÒçVÆÂ’°¢F†—2åö–çFW&æÅ&ö÷BÒçVÆÃ°¢f"6öçF–æW"Ò&ö÷Bæ6öçF–æW$–æfó° ¢°¢–b†—4Ç&VG•&VæFW&–ær‚’’°¢W'&÷"‚tGFV×FVBFò7–æ6‡&öæ÷W6Ç’VæÖ÷VçB&ö÷Bv†–ÆR&V7Bv2Ç&VG’r²w&VæFW&–ærâ&V7B6ææ÷Bf–æ—6‚VæÖ÷VçF–ærF†R&ö÷BVçF–ÂF†Rr²v7W'&VçB&VæFW"†26ö×ÆWFVBÂv†–6‚Ö’ÆVBFò&6R6öæF—F–öââr“°¢Ð¢Ð ¢fÇW6…7–æ2†gVæ7F–öâ‚’°¢WFFT6öçF–æW"†çVÆÂÂ&ö÷BÂçVÆÂÂçVÆÂ“°¢Ò“°¢VæÖ&´6öçF–æW$5&ö÷B†6öçF–æW"“°¢Ð¢Ó° ¢gVæ7F–öâ7&VFU&ö÷B†6öçF–æW"Â÷F–öç2’°¢–b‚—5fÆ–D6öçF–æW"†6öçF–æW"’’°¢F‡&÷ræWrW'&÷"‚v7&VFU&ö÷B‚âââ“¢F&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢Ð ¢v&ä–e&V7DDôÔ6öçF–æW$–äDUb†6öçF–æW"“°¢f"—57G&–7DÖöFRÒfÇ6S°¢f"6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÒfÇ6S°¢f"–FVçF–f–W%&Vf—‚Òrs°¢f"öå&V6÷fW&&ÆTW'&÷"ÒFVfVÇDöå&V6÷fW&&ÆTW'&÷#°¢f"G&ç6—F–öä6ÆÆ&6·2ÒçVÆÃ° ¢–b†÷F–öç2ÓÒçVÆÂbb÷F–öç2ÓÒVæFVf–æVB’°¢°¢–b†÷F–öç2æ‡–G&FR’°¢v&â‚v‡–G&FRF‡&÷Vv‚7&VFU&ö÷B—2FW&V6FVBâW6R&V7DDôÔ6Æ–VçBæ‡–G&FU&ö÷B†6öçF–æW"ÂÄóâ’–ç7FVBâr“°¢ÒVÇ6R°¢–b‡G—Vöb÷F–öç2ÓÓÒvö&¦V7Brbb÷F–öç2ÓÒçVÆÂbb÷F–öç2âBGG—VöbÓÓÒ$T5EôTÄTÔTåEõE•R’°¢W'&÷"‚u–÷R76VB¥5‚VÆVÖVçBFò7&VFU&ö÷Bâ–÷R&ö&&Ç’ÖVçBFòr²v6ÆÂ&ö÷Bç&VæFW"–ç7FVBâr²tW†×ÆRW6vS¥ÆåÆâr²rÆWB&ö÷BÒ7&VFU&ö÷B†FöÔ6öçF–æW"“µÆâr²r&ö÷Bç&VæFW"ƒÄóâ“²r“°¢Ð¢Ð¢Ð ¢–b†÷F–öç2çVç7F&ÆU÷7G&–7DÖöFRÓÓÒG'VR’°¢—57G&–7DÖöFRÒG'VS°¢Ð ¢–b†÷F–öç2æ–FVçF–f–W%&Vf—‚ÓÒVæFVf–æVB’°¢–FVçF–f–W%&Vf—‚Ò÷F–öç2æ–FVçF–f–W%&Vf—ƒ°¢Ð ¢–b†÷F–öç2æöå&V6÷fW&&ÆTW'&÷"ÓÒVæFVf–æVB’°¢öå&V6÷fW&&ÆTW'&÷"Ò÷F–öç2æöå&V6÷fW&&ÆTW'&÷#°¢Ð ¢–b†÷F–öç2çG&ç6—F–öä6ÆÆ&6·2ÓÒVæFVf–æVB’°¢G&ç6—F–öä6ÆÆ&6·2Ò÷F–öç2çG&ç6—F–öä6ÆÆ&6·3°¢Ð¢Ð ¢f"&ö÷BÒ7&VFT6öçF–æW"†6öçF–æW"Â6öæ7W'&VçE&ö÷BÂçVÆÂÂ—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"“°¢Ö&´6öçF–æW$5&ö÷B‡&ö÷Bæ7W'&VçBÂ6öçF–æW"“°¢f"&ö÷D6öçF–æW$VÆVÖVçBÒ6öçF–æW"ææöFUG—RÓÓÒ4ôÔÔTåEôäôDRò6öçF–æW"ç&VçDæöFR¢6öçF–æW#°¢Æ—7FVåFôÆÅ7W÷'FVDWfVçG2‡&ö÷D6öçF–æW$VÆVÖVçB“°¢&WGW&âæWr&V7DDôÕ&ö÷B‡&ö÷B“°¢Ð ¢gVæ7F–öâ&V7DDôÔ‡–G&F–öå&ö÷B†–çFW&æÅ&ö÷B’°¢F†—2åö–çFW&æÅ&ö÷BÒ–çFW&æÅ&ö÷C°¢Ð ¢gVæ7F–öâ66†VGVÆT‡–G&F–öâ‡F&vWB’°¢–b‡F&vWB’°¢VWVTW‡Æ–6—D‡–G&F–öåF&vWB‡F&vWB“°¢Ð¢Ð ¢&V7DDôÔ‡–G&F–öå&ö÷Bç&÷F÷G—RçVç7F&ÆU÷66†VGVÆT‡–G&F–öâÒ66†VGVÆT‡–G&F–öã°¢gVæ7F–öâ‡–G&FU&ö÷B†6öçF–æW"Â–æ—F–Ä6†–ÆG&VâÂ÷F–öç2’°¢–b‚—5fÆ–D6öçF–æW"†6öçF–æW"’’°¢F‡&÷ræWrW'&÷"‚v‡–G&FU&ö÷B‚âââ“¢F&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢Ð ¢v&ä–e&V7DDôÔ6öçF–æW$–äDUb†6öçF–æW"“° ¢°¢–b†–æ—F–Ä6†–ÆG&VâÓÓÒVæFVf–æVB’°¢W'&÷"‚t×W7B&÷f–FR–æ—F–Â6†–ÆG&Vâ26V6öæB&wVÖVçBFò‡–G&FU&ö÷Bâr²tW†×ÆRW6vS¢‡–G&FU&ö÷B†FöÔ6öçF–æW"ÂÄóâ’r“°¢Ð¢Òòòf÷"æ÷rvR&WW6RF†Rv†öÆR&röb÷F–öç26–æ6RF†W’6öçF–à¢òòF†R‡–G&F–öâ6ÆÆ&6·2à  ¢f"‡–G&F–öä6ÆÆ&6·2Ò÷F–öç2ÒçVÆÂò÷F–öç2¢çVÆÃ²òòDôDó¢FVÆWFRF†—2÷F–öà ¢f"×WF&ÆU6÷W&6W2Ò÷F–öç2ÒçVÆÂbb÷F–öç2æ‡–G&FVE6÷W&6W2ÇÂçVÆÃ°¢f"—57G&–7DÖöFRÒfÇ6S°¢f"6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÒfÇ6S°¢f"–FVçF–f–W%&Vf—‚Òrs°¢f"öå&V6÷fW&&ÆTW'&÷"ÒFVfVÇDöå&V6÷fW&&ÆTW'&÷#° ¢–b†÷F–öç2ÓÒçVÆÂbb÷F–öç2ÓÒVæFVf–æVB’°¢–b†÷F–öç2çVç7F&ÆU÷7G&–7DÖöFRÓÓÒG'VR’°¢—57G&–7DÖöFRÒG'VS°¢Ð ¢–b†÷F–öç2æ–FVçF–f–W%&Vf—‚ÓÒVæFVf–æVB’°¢–FVçF–f–W%&Vf—‚Ò÷F–öç2æ–FVçF–f–W%&Vf—ƒ°¢Ð ¢–b†÷F–öç2æöå&V6÷fW&&ÆTW'&÷"ÓÒVæFVf–æVB’°¢öå&V6÷fW&&ÆTW'&÷"Ò÷F–öç2æöå&V6÷fW&&ÆTW'&÷#°¢Ð¢Ð ¢f"&ö÷BÒ7&VFT‡–G&F–öä6öçF–æW"†–æ—F–Ä6†–ÆG&VâÂçVÆÂÂ6öçF–æW"Â6öæ7W'&VçE&ö÷BÂ‡–G&F–öä6ÆÆ&6·2Â—57G&–7DÖöFRÂ6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÂ–FVçF–f–W%&Vf—‚Âöå&V6÷fW&&ÆTW'&÷"“°¢Ö&´6öçF–æW$5&ö÷B‡&ö÷Bæ7W'&VçBÂ6öçF–æW"“²òòF†—26âwB&R6öÖÖVçBæöFR6–æ6R‡–G&F–öâFöW6âwBv÷&²öâ6öÖÖVçBæöFW2ç—v’à ¢Æ—7FVåFôÆÅ7W÷'FVDWfVçG2†6öçF–æW"“° ¢–b†×WF&ÆU6÷W&6W2’°¢f÷"‡f"’Ò²’Â×WF&ÆU6÷W&6W2æÆVæwFƒ²’²²’°¢f"×WF&ÆU6÷W&6RÒ×WF&ÆU6÷W&6W5¶•Ó°¢&Vv—7FW$×WF&ÆU6÷W&6Tf÷$‡–G&F–öâ‡&ö÷BÂ×WF&ÆU6÷W&6R“°¢Ð¢Ð ¢&WGW&âæWr&V7DDôÔ‡–G&F–öå&ö÷B‡&ö÷B“°¢Ð¢gVæ7F–öâ—5fÆ–D6öçF–æW"†æöFR’°¢&WGW&â†æöFRbb†æöFRææöFUG—RÓÓÒTÄTÔTåEôäôDRÇÂæöFRææöFUG—RÓÓÒDô5TÔTåEôäôDRÇÂæöFRææöFUG—RÓÓÒDô5TÔTåEôe$tÔTåEôäôDRÇÂF—6&ÆT6öÖÖVçG44DôÔ6öçF–æW'2’“°¢ÒòòDôDó¢&VÖ÷fRF†—2gVæ7F–öâv†–6‚Ç6ò–æ6ÇVFW26öÖÖVçBæöFW2à¢òòvRöæÇ’W6R—B–âÆ6W2F†B&R7W'&VçFÇ’Ö÷&R&VÆ†VBà ¢gVæ7F–öâ—5fÆ–D6öçF–æW$ÆVv7’†æöFR’°¢&WGW&â†æöFRbb†æöFRææöFUG—RÓÓÒTÄTÔTåEôäôDRÇÂæöFRææöFUG—RÓÓÒDô5TÔTåEôäôDRÇÂæöFRææöFUG—RÓÓÒDô5TÔTåEôe$tÔTåEôäôDRÇÂæöFRææöFUG—RÓÓÒ4ôÔÔTåEôäôDRbbæöFRææöFUfÇVRÓÓÒr&V7BÖÖ÷VçB×ö–çB×Vç7F&ÆRr’“°¢Ð ¢gVæ7F–öâv&ä–e&V7DDôÔ6öçF–æW$–äDUb†6öçF–æW"’°¢°¢–b†6öçF–æW"ææöFUG—RÓÓÒTÄTÔTåEôäôDRbb6öçF–æW"çFtæÖRbb6öçF–æW"çFtæÖRçFõWW$66R‚’ÓÓÒt$ôE’r’°¢W'&÷"‚v7&VFU&ö÷B‚“¢7&VF–ær&ö÷G2F—&V7FÇ’v—F‚Fö7VÖVçBæ&öG’—2r²vF—66÷W&vVBÂ6–æ6R—G26†–ÆG&Vâ&RögFVâÖæ—VÆFVB'’F†—&B×'G’r²w67&—G2æB'&÷w6W"W‡FVç6–öç2âF†—2Ö’ÆVBFò7V'FÆRr²w&V6öæ6–Æ–F–öâ—77VW2âG'’W6–ær6öçF–æW"VÆVÖVçB7&VFVBr²vf÷"–÷W"âr“°¢Ð ¢–b†—46öçF–æW$Ö&¶VD5&ö÷B†6öçF–æW"’’°¢–b†6öçF–æW"å÷&V7E&ö÷D6öçF–æW"’°¢W'&÷"‚u–÷R&R6ÆÆ–ær&V7DDôÔ6Æ–VçBæ7&VFU&ö÷B‚’öâ6öçF–æW"F†Bv2&Wf–÷W6Ç’r²w76VBFò&V7DDôÒç&VæFW"‚’âF†—2—2æ÷B7W÷'FVBâr“°¢ÒVÇ6R°¢W'&÷"‚u–÷R&R6ÆÆ–ær&V7DDôÔ6Æ–VçBæ7&VFU&ö÷B‚’öâ6öçF–æW"F†Br²v†2Ç&VG’&VVâ76VBFò7&VFU&ö÷B‚’&Vf÷&Râ–ç7FVBÂ6ÆÂr²w&ö÷Bç&VæFW"‚’öâF†RW†—7F–ær&ö÷B–ç7FVB–b–÷RvçBFòWFFR—Bâr“°¢Ð¢Ð¢Ð¢Ð ¢f"&V7D7W'&VçD÷væW"C2Ò&V7E6†&VD–çFW&æÇ2å&V7D7W'&VçD÷væW#°¢f"F÷ÆWfVÅWFFUv&æ–æw3° ¢°¢F÷ÆWfVÅWFFUv&æ–æw2ÒgVæ7F–öâ†6öçF–æW"’°¢–b†6öçF–æW"å÷&V7E&ö÷D6öçF–æW"bb6öçF–æW"ææöFUG—RÓÒ4ôÔÔTåEôäôDR’°¢f"†÷7D–ç7Fæ6RÒf–æD†÷7D–ç7Fæ6Uv—F„æõ÷'FÇ2†6öçF–æW"å÷&V7E&ö÷D6öçF–æW"æ7W'&VçB“° ¢–b††÷7D–ç7Fæ6R’°¢–b††÷7D–ç7Fæ6Rç&VçDæöFRÓÒ6öçF–æW"’°¢W'&÷"‚w&VæFW"‚âââ“¢—BÆöö·2Æ–¶RF†R&V7B×&VæFW&VB6öçFVçBöbF†—2r²v6öçF–æW"v2&VÖ÷fVBv—F†÷WBW6–ær&V7BâF†—2—2æ÷Br²w7W÷'FVBæBv–ÆÂ6W6RW'&÷'2â–ç7FVBÂ6ÆÂr²u&V7DDôÒçVæÖ÷VçD6ö×öæVçDDæöFRFòV×G’6öçF–æW"âr“°¢Ð¢Ð¢Ð ¢f"—5&ö÷E&VæFW&VD'•6öÖU&V7BÒ6öçF–æW"å÷&V7E&ö÷D6öçF–æW#°¢f"&ö÷DVÂÒvWE&V7E&ö÷DVÆVÖVçD–ä6öçF–æW"†6öçF–æW"“°¢f"†4æöå&ö÷E&V7D6†–ÆBÒ‡&ö÷DVÂbbvWD–ç7Fæ6Tg&öÔæöFR‡&ö÷DVÂ’“° ¢–b††4æöå&ö÷E&V7D6†–ÆBbb—5&ö÷E&VæFW&VD'•6öÖU&V7B’°¢W'&÷"‚w&VæFW"‚âââ“¢&WÆ6–ær&V7B×&VæFW&VB6†–ÆG&Vâv—F‚æWr&ö÷Br²v6ö×öæVçBâ–b–÷R–çFVæFVBFòWFFRF†R6†–ÆG&VâöbF†—2æöFRÂr²w–÷R6†÷VÆB–ç7FVB†fRF†RW†—7F–ær6†–ÆG&VâWFFRF†V—"7FFRr²væB&VæFW"F†RæWr6ö×öæVçG2–ç7FVBöb6ÆÆ–ær&V7DDôÒç&VæFW"âr“°¢Ð ¢–b†6öçF–æW"ææöFUG—RÓÓÒTÄTÔTåEôäôDRbb6öçF–æW"çFtæÖRbb6öçF–æW"çFtæÖRçFõWW$66R‚’ÓÓÒt$ôE’r’°¢W'&÷"‚w&VæFW"‚“¢&VæFW&–ær6ö×öæVçG2F—&V7FÇ’–çFòFö7VÖVçBæ&öG’—2r²vF—66÷W&vVBÂ6–æ6R—G26†–ÆG&Vâ&RögFVâÖæ—VÆFVB'’F†—&B×'G’r²w67&—G2æB'&÷w6W"W‡FVç6–öç2âF†—2Ö’ÆVBFò7V'FÆRr²w&V6öæ6–Æ–F–öâ—77VW2âG'’&VæFW&–ær–çFò6öçF–æW"VÆVÖVçB7&VFVBr²vf÷"–÷W"âr“°¢Ð¢Ó°¢Ð ¢gVæ7F–öâvWE&V7E&ö÷DVÆVÖVçD–ä6öçF–æW"†6öçF–æW"’°¢–b‚6öçF–æW"’°¢&WGW&âçVÆÃ°¢Ð ¢–b†6öçF–æW"ææöFUG—RÓÓÒDô5TÔTåEôäôDR’°¢&WGW&â6öçF–æW"æFö7VÖVçDVÆVÖVçC°¢ÒVÇ6R°¢&WGW&â6öçF–æW"æf—'7D6†–ÆC°¢Ð¢Ð ¢gVæ7F–öâæö÷öå&V6÷fW&&ÆTW'&÷"‚’²òòF†—2—6âwB&V6†&ÆR&V6W6Röå&V6÷fW&&ÆTW'&÷"—6âwB6ÆÆVB–âF†P¢òòÆVv7’’à¢Ð ¢gVæ7F–öâÆVv7”7&VFU&ö÷Dg&öÔDôÔ6öçF–æW"†6öçF–æW"Â–æ—F–Ä6†–ÆG&VâÂ&VçD6ö×öæVçBÂ6ÆÆ&6²Â—4‡–G&F–öä6öçF–æW"’°¢–b†—4‡–G&F–öä6öçF–æW"’°¢–b‡G—Vöb6ÆÆ&6²ÓÓÒvgVæ7F–öâr’°¢f"÷&–v–æÄ6ÆÆ&6²Ò6ÆÆ&6³° ¢6ÆÆ&6²ÒgVæ7F–öâ‚’°¢f"–ç7Fæ6RÒvWEV&Æ–5&ö÷D–ç7Fæ6R‡&ö÷B“°¢÷&–v–æÄ6ÆÆ&6²æ6ÆÂ†–ç7Fæ6R“°¢Ó°¢Ð ¢f"&ö÷BÒ7&VFT‡–G&F–öä6öçF–æW"†–æ—F–Ä6†–ÆG&VâÂ6ÆÆ&6²Â6öçF–æW"ÂÆVv7•&ö÷BÂçVÆÂÂòò‡–G&F–öä6ÆÆ&6·0¢fÇ6RÂòò—57G&–7DÖöFP¢fÇ6RÂòò6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÀ¢rrÂòò–FVçF–f–W%&Vf—€¢æö÷öå&V6÷fW&&ÆTW'&÷"“°¢6öçF–æW"å÷&V7E&ö÷D6öçF–æW"Ò&ö÷C°¢Ö&´6öçF–æW$5&ö÷B‡&ö÷Bæ7W'&VçBÂ6öçF–æW"“°¢f"&ö÷D6öçF–æW$VÆVÖVçBÒ6öçF–æW"ææöFUG—RÓÓÒ4ôÔÔTåEôäôDRò6öçF–æW"ç&VçDæöFR¢6öçF–æW#°¢Æ—7FVåFôÆÅ7W÷'FVDWfVçG2‡&ö÷D6öçF–æW$VÆVÖVçB“°¢fÇW6…7–æ2‚“°¢&WGW&â&ö÷C°¢ÒVÇ6R°¢òòf—'7B6ÆV"ç’W†—7F–ær6öçFVçBà¢f"&ö÷E6–&Æ–æs° ¢v†–ÆR‡&ö÷E6–&Æ–ærÒ6öçF–æW"æÆ7D6†–ÆB’°¢6öçF–æW"ç&VÖ÷fT6†–ÆB‡&ö÷E6–&Æ–ær“°¢Ð ¢–b‡G—Vöb6ÆÆ&6²ÓÓÒvgVæ7F–öâr’°¢f"ö÷&–v–æÄ6ÆÆ&6²Ò6ÆÆ&6³° ¢6ÆÆ&6²ÒgVæ7F–öâ‚’°¢f"–ç7Fæ6RÒvWEV&Æ–5&ö÷D–ç7Fæ6R…÷&ö÷B“° ¢ö÷&–v–æÄ6ÆÆ&6²æ6ÆÂ†–ç7Fæ6R“°¢Ó°¢Ð ¢f"÷&ö÷BÒ7&VFT6öçF–æW"†6öçF–æW"ÂÆVv7•&ö÷BÂçVÆÂÂòò‡–G&F–öä6ÆÆ&6·0¢fÇ6RÂòò—57G&–7DÖöFP¢fÇ6RÂòò6öæ7W'&VçEWFFW4'”FVfVÇD÷fW'&–FRÀ¢rrÂòò–FVçF–f–W%&Vf—€¢æö÷öå&V6÷fW&&ÆTW'&÷"“° ¢6öçF–æW"å÷&V7E&ö÷D6öçF–æW"Ò÷&ö÷C°¢Ö&´6öçF–æW$5&ö÷B…÷&ö÷Bæ7W'&VçBÂ6öçF–æW"“° ¢f"÷&ö÷D6öçF–æW$VÆVÖVçBÒ6öçF–æW"ææöFUG—RÓÓÒ4ôÔÔTåEôäôDRò6öçF–æW"ç&VçDæöFR¢6öçF–æW#° ¢Æ—7FVåFôÆÅ7W÷'FVDWfVçG2…÷&ö÷D6öçF–æW$VÆVÖVçB“²òò–æ—F–ÂÖ÷VçB6†÷VÆBæ÷B&R&F6†VBà ¢fÇW6…7–æ2†gVæ7F–öâ‚’°¢WFFT6öçF–æW"†–æ—F–Ä6†–ÆG&VâÂ÷&ö÷BÂ&VçD6ö×öæVçBÂ6ÆÆ&6²“°¢Ò“°¢&WGW&â÷&ö÷C°¢Ð¢Ð ¢gVæ7F–öâv&äöä–çfÆ–D6ÆÆ&6²C†6ÆÆ&6²Â6ÆÆW$æÖR’°¢°¢–b†6ÆÆ&6²ÓÒçVÆÂbbG—Vöb6ÆÆ&6²ÓÒvgVæ7F–öâr’°¢W'&÷"‚rW2‚âââ“¢W‡V7FVBF†RÆ7B÷F–öæÂ6ÆÆ&6¶&wVÖVçBFò&Rr²vgVæ7F–öââ–ç7FVB&V6V—fVC¢W2ârÂ6ÆÆW$æÖRÂ6ÆÆ&6²“°¢Ð¢Ð¢Ð ¢gVæ7F–öâÆVv7•&VæFW%7V'G&VT–çFô6öçF–æW"‡&VçD6ö×öæVçBÂ6†–ÆG&VâÂ6öçF–æW"Âf÷&6T‡–G&FRÂ6ÆÆ&6²’°¢°¢F÷ÆWfVÅWFFUv&æ–æw2†6öçF–æW"“°¢v&äöä–çfÆ–D6ÆÆ&6²C†6ÆÆ&6²ÓÓÒVæFVf–æVBòçVÆÂ¢6ÆÆ&6²Âw&VæFW"r“°¢Ð ¢f"Ö–&U&ö÷BÒ6öçF–æW"å÷&V7E&ö÷D6öçF–æW#°¢f"&ö÷C° ¢–b‚Ö–&U&ö÷B’°¢òò–æ—F–ÂÖ÷Vç@¢&ö÷BÒÆVv7”7&VFU&ö÷Dg&öÔDôÔ6öçF–æW"†6öçF–æW"Â6†–ÆG&VâÂ&VçD6ö×öæVçBÂ6ÆÆ&6²Âf÷&6T‡–G&FR“°¢ÒVÇ6R°¢&ö÷BÒÖ–&U&ö÷C° ¢–b‡G—Vöb6ÆÆ&6²ÓÓÒvgVæ7F–öâr’°¢f"÷&–v–æÄ6ÆÆ&6²Ò6ÆÆ&6³° ¢6ÆÆ&6²ÒgVæ7F–öâ‚’°¢f"–ç7Fæ6RÒvWEV&Æ–5&ö÷D–ç7Fæ6R‡&ö÷B“°¢÷&–v–æÄ6ÆÆ&6²æ6ÆÂ†–ç7Fæ6R“°¢Ó°¢ÒòòWFFP  ¢WFFT6öçF–æW"†6†–ÆG&VâÂ&ö÷BÂ&VçD6ö×öæVçBÂ6ÆÆ&6²“°¢Ð ¢&WGW&âvWEV&Æ–5&ö÷D–ç7Fæ6R‡&ö÷B“°¢Ð ¢f"F–Ev&ä&÷WDf–æDDôÔæöFRÒfÇ6S°¢gVæ7F–öâf–æDDôÔæöFR†6ö×öæVçD÷$VÆVÖVçB’°¢°¢–b‚F–Ev&ä&÷WDf–æDDôÔæöFR’°¢F–Ev&ä&÷WDf–æDDôÔæöFRÒG'VS° ¢W'&÷"‚vf–æDDôÔæöFR—2FW&V6FVBæBv–ÆÂ&R&VÖ÷fVB–âF†RæW‡BÖ¦÷"r²w&VÆV6Râ–ç7FVBÂFB&VbF—&V7FÇ’FòF†RVÆVÖVçB–÷RvçBr²wFò&VfW&Væ6RâÆV&âÖ÷&R&÷WBW6–ær&Vg26fVÇ’†W&S¢r²v‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7G&–7BÖÖöFRÖf–æBÖæöFRr“°¢Ð ¢f"÷væW"Ò&V7D7W'&VçD÷væW"C2æ7W'&VçC° ¢–b†÷væW"ÓÒçVÆÂbb÷væW"ç7FFTæöFRÓÒçVÆÂ’°¢f"v&æVD&÷WE&Vg4–å&VæFW"Ò÷væW"ç7FFTæöFRå÷v&æVD&÷WE&Vg4–å&VæFW#° ¢–b‚v&æVD&÷WE&Vg4–å&VæFW"’°¢W'&÷"‚rW2—266W76–ærf–æDDôÔæöFR–ç6–FR—G2&VæFW"‚’âr²w&VæFW"‚’6†÷VÆB&RW&RgVæ7F–öâöb&÷2æB7FFRâ—B6†÷VÆBr²væWfW"66W726öÖWF†–ærF†B&WV—&W27FÆRFFg&öÒF†R&Wf–÷W2r²w&VæFW"Â7V6‚2&Vg2âÖ÷fRF†—2Æöv–2Fò6ö×öæVçDF–DÖ÷VçBæBr²v6ö×öæVçDF–EWFFR–ç7FVBârÂvWD6ö×öæVçDæÖTg&öÕG—R†÷væW"çG—R’ÇÂt6ö×öæVçBr“°¢Ð ¢÷væW"ç7FFTæöFRå÷v&æVD&÷WE&Vg4–å&VæFW"ÒG'VS°¢Ð¢Ð ¢–b†6ö×öæVçD÷$VÆVÖVçBÓÒçVÆÂ’°¢&WGW&âçVÆÃ°¢Ð ¢–b†6ö×öæVçD÷$VÆVÖVçBææöFUG—RÓÓÒTÄTÔTåEôäôDR’°¢&WGW&â6ö×öæVçD÷$VÆVÖVçC°¢Ð ¢°¢&WGW&âf–æD†÷7D–ç7Fæ6Uv—F…v&æ–ær†6ö×öæVçD÷$VÆVÖVçBÂvf–æDDôÔæöFRr“°¢Ð¢Ð¢gVæ7F–öâ‡–G&FR†VÆVÖVçBÂ6öçF–æW"Â6ÆÆ&6²’°¢°¢W'&÷"‚u&V7DDôÒæ‡–G&FR—2æòÆöævW"7W÷'FVB–â&V7B‚âW6R‡–G&FU&ö÷Br²v–ç7FVBâVçF–Â–÷R7v—F6‚FòF†RæWr’Â–÷W"v–ÆÂ&V†fR2r²&–b—Bw2'Vææ–ær&V7BrâÆV&â"²vÖ÷&S¢‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7v—F6‚×FòÖ7&VFW&ö÷Br“°¢Ð ¢–b‚—5fÆ–D6öçF–æW$ÆVv7’†6öçF–æW"’’°¢F‡&÷ræWrW'&÷"‚uF&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢Ð ¢°¢f"—4ÖöFW&å&ö÷BÒ—46öçF–æW$Ö&¶VD5&ö÷B†6öçF–æW"’bb6öçF–æW"å÷&V7E&ö÷D6öçF–æW"ÓÓÒVæFVf–æVC° ¢–b†—4ÖöFW&å&ö÷B’°¢W'&÷"‚u–÷R&R6ÆÆ–ær&V7DDôÒæ‡–G&FR‚’öâ6öçF–æW"F†Bv2&Wf–÷W6Ç’r²w76VBFò&V7DDôÔ6Æ–VçBæ7&VFU&ö÷B‚’âF†—2—2æ÷B7W÷'FVBâr²tF–B–÷RÖVâFò6ÆÂ‡–G&FU&ö÷B†6öçF–æW"ÂVÆVÖVçB“òr“°¢Ð¢ÒòòDôDó¢F‡&÷r÷"v&â–bvR6÷VÆFâwB‡–G&FSð  ¢&WGW&âÆVv7•&VæFW%7V'G&VT–çFô6öçF–æW"†çVÆÂÂVÆVÖVçBÂ6öçF–æW"ÂG'VRÂ6ÆÆ&6²“°¢Ð¢gVæ7F–öâ&VæFW"†VÆVÖVçBÂ6öçF–æW"Â6ÆÆ&6²’°¢°¢W'&÷"‚u&V7DDôÒç&VæFW"—2æòÆöævW"7W÷'FVB–â&V7B‚âW6R7&VFU&ö÷Br²v–ç7FVBâVçF–Â–÷R7v—F6‚FòF†RæWr’Â–÷W"v–ÆÂ&V†fR2r²&–b—Bw2'Vææ–ær&V7BrâÆV&â"²vÖ÷&S¢‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7v—F6‚×FòÖ7&VFW&ö÷Br“°¢Ð ¢–b‚—5fÆ–D6öçF–æW$ÆVv7’†6öçF–æW"’’°¢F‡&÷ræWrW'&÷"‚uF&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢Ð ¢°¢f"—4ÖöFW&å&ö÷BÒ—46öçF–æW$Ö&¶VD5&ö÷B†6öçF–æW"’bb6öçF–æW"å÷&V7E&ö÷D6öçF–æW"ÓÓÒVæFVf–æVC° ¢–b†—4ÖöFW&å&ö÷B’°¢W'&÷"‚u–÷R&R6ÆÆ–ær&V7DDôÒç&VæFW"‚’öâ6öçF–æW"F†Bv2&Wf–÷W6Ç’r²w76VBFò&V7DDôÔ6Æ–VçBæ7&VFU&ö÷B‚’âF†—2—2æ÷B7W÷'FVBâr²tF–B–÷RÖVâFò6ÆÂ&ö÷Bç&VæFW"†VÆVÖVçB“òr“°¢Ð¢Ð ¢&WGW&âÆVv7•&VæFW%7V'G&VT–çFô6öçF–æW"†çVÆÂÂVÆVÖVçBÂ6öçF–æW"ÂfÇ6RÂ6ÆÆ&6²“°¢Ð¢gVæ7F–öâVç7F&ÆU÷&VæFW%7V'G&VT–çFô6öçF–æW"‡&VçD6ö×öæVçBÂVÆVÖVçBÂ6öçF–æW$æöFRÂ6ÆÆ&6²’°¢°¢W'&÷"‚u&V7DDôÒçVç7F&ÆU÷&VæFW%7V'G&VT–çFô6öçF–æW"‚’—2æòÆöævW"7W÷'FVBr²v–â&V7B‚â6öç6–FW"W6–ær÷'FÂ–ç7FVBâVçF–Â–÷R7v—F6‚Fòr²'F†R7&VFU&ö÷B’Â–÷W"v–ÆÂ&V†fR2–b—Bw2'Vææ–ær&V7B"²srâÆV&âÖ÷&S¢‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7v—F6‚×FòÖ7&VFW&ö÷Br“°¢Ð ¢–b‚—5fÆ–D6öçF–æW$ÆVv7’†6öçF–æW$æöFR’’°¢F‡&÷ræWrW'&÷"‚uF&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢Ð ¢–b‡&VçD6ö×öæVçBÓÒçVÆÂÇÂ†2‡&VçD6ö×öæVçB’’°¢F‡&÷ræWrW'&÷"‚w&VçD6ö×öæVçB×W7B&RfÆ–B&V7B6ö×öæVçBr“°¢Ð ¢&WGW&âÆVv7•&VæFW%7V'G&VT–çFô6öçF–æW"‡&VçD6ö×öæVçBÂVÆVÖVçBÂ6öçF–æW$æöFRÂfÇ6RÂ6ÆÆ&6²“°¢Ð¢f"F–Ev&ä&÷WEVæÖ÷VçD6ö×öæVçDDæöFRÒfÇ6S°¢gVæ7F–öâVæÖ÷VçD6ö×öæVçDDæöFR†6öçF–æW"’°¢°¢–b‚F–Ev&ä&÷WEVæÖ÷VçD6ö×öæVçDDæöFR’°¢F–Ev&ä&÷WEVæÖ÷VçD6ö×öæVçDDæöFRÒG'VS° ¢W'&÷"‚wVæÖ÷VçD6ö×öæVçDDæöFR—2FW&V6FVBæBv–ÆÂ&R&VÖ÷fVB–âF†Rr²væW‡BÖ¦÷"&VÆV6Râ7v—F6‚FòF†R7&VFU&ö÷B’âÆV&âr²vÖ÷&S¢‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷7v—F6‚×FòÖ7&VFW&ö÷Br“°¢Ð¢Ð ¢–b‚—5fÆ–D6öçF–æW$ÆVv7’†6öçF–æW"’’°¢F‡&÷ræWrW'&÷"‚wVæÖ÷VçD6ö×öæVçDDæöFR‚âââ“¢F&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢Ð ¢°¢f"—4ÖöFW&å&ö÷BÒ—46öçF–æW$Ö&¶VD5&ö÷B†6öçF–æW"’bb6öçF–æW"å÷&V7E&ö÷D6öçF–æW"ÓÓÒVæFVf–æVC° ¢–b†—4ÖöFW&å&ö÷B’°¢W'&÷"‚u–÷R&R6ÆÆ–ær&V7DDôÒçVæÖ÷VçD6ö×öæVçDDæöFR‚’öâ6öçF–æW"F†Bv2&Wf–÷W6Ç’r²w76VBFò&V7DDôÔ6Æ–VçBæ7&VFU&ö÷B‚’âF†—2—2æ÷B7W÷'FVBâF–B–÷RÖVâFò6ÆÂ&ö÷BçVæÖ÷VçB‚“òr“°¢Ð¢Ð ¢–b†6öçF–æW"å÷&V7E&ö÷D6öçF–æW"’°¢°¢f"&ö÷DVÂÒvWE&V7E&ö÷DVÆVÖVçD–ä6öçF–æW"†6öçF–æW"“°¢f"&VæFW&VD'”F–ffW&VçE&V7BÒ&ö÷DVÂbbvWD–ç7Fæ6Tg&öÔæöFR‡&ö÷DVÂ“° ¢–b‡&VæFW&VD'”F–ffW&VçE&V7B’°¢W'&÷"‚'VæÖ÷VçD6ö×öæVçDDæöFR‚“¢F†RæöFR–÷Rw&RGFV×F–ærFòVæÖ÷VçB"²wv2&VæFW&VB'’æ÷F†W"6÷’öb&V7Bâr“°¢Ð¢ÒòòVæÖ÷VçB6†÷VÆBæ÷B&R&F6†VBà  ¢fÇW6…7–æ2†gVæ7F–öâ‚’°¢ÆVv7•&VæFW%7V'G&VT–çFô6öçF–æW"†çVÆÂÂçVÆÂÂ6öçF–æW"ÂfÇ6RÂgVæ7F–öâ‚’°¢òòDfÆ÷tf—„ÖRF†—26†÷VÆB&ö&&Ç’W6RFVÆWFR6öçF–æW"å÷&V7E&ö÷D6öçF–æW& ¢6öçF–æW"å÷&V7E&ö÷D6öçF–æW"ÒçVÆÃ°¢VæÖ&´6öçF–æW$5&ö÷B†6öçF–æW"“°¢Ò“°¢Ò“²òò–b–÷R6ÆÂVæÖ÷VçD6ö×öæVçDDæöFRGv–6R–âV–6²7V66W76–öâÂ–÷RvÆÀ¢òòvWBG'VVGv–6RâF†Bw2&ö&&Ç’f–æSð ¢&WGW&âG'VS°¢ÒVÇ6R°¢°¢f"÷&ö÷DVÂÒvWE&V7E&ö÷DVÆVÖVçD–ä6öçF–æW"†6öçF–æW"“° ¢f"†4æöå&ö÷E&V7D6†–ÆBÒ…÷&ö÷DVÂbbvWD–ç7Fæ6Tg&öÔæöFR…÷&ö÷DVÂ’“²òò6†V6²–bF†R6öçF–æW"—G6VÆb—2&V7B&ö÷BæöFRà ¢f"—46öçF–æW%&V7E&ö÷BÒ6öçF–æW"ææöFUG—RÓÓÒTÄTÔTåEôäôDRbb—5fÆ–D6öçF–æW$ÆVv7’†6öçF–æW"ç&VçDæöFR’bb6öçF–æW"ç&VçDæöFRå÷&V7E&ö÷D6öçF–æW#° ¢–b††4æöå&ö÷E&V7D6†–ÆB’°¢W'&÷"‚'VæÖ÷VçD6ö×öæVçDDæöFR‚“¢F†RæöFR–÷Rw&RGFV×F–ærFòVæÖ÷VçB"²wv2&VæFW&VB'’&V7BæB—2æ÷BF÷ÖÆWfVÂ6öçF–æW"âW2rÂ—46öçF–æW%&V7E&ö÷Bòu–÷RÖ’†fR66–FVçFÆÇ’76VB–â&V7B&ö÷BæöFR–ç7FVBr²vöb—G26öçF–æW"âr¢t–ç7FVBÂ†fRF†R&VçB6ö×öæVçBWFFR—G27FFRæBr²w&W&VæFW"–â÷&FW"Fò&VÖ÷fRF†—26ö×öæVçBâr“°¢Ð¢Ð ¢&WGW&âfÇ6S°¢Ð¢Ð ¢6WDGFV×E7–æ6‡&öæ÷W4‡–G&F–öâ†GFV×E7–æ6‡&öæ÷W4‡–G&F–öâC“°¢6WDGFV×D6öçF–çV÷W4‡–G&F–öâ†GFV×D6öçF–çV÷W4‡–G&F–öâC“°¢6WDGFV×D‡–G&F–öäD7W'&VçE&–÷&—G’†GFV×D‡–G&F–öäD7W'&VçE&–÷&—G’C“°¢6WDvWD7W'&VçEWFFU&–÷&—G’†vWD7W'&VçEWFFU&–÷&—G’“°¢6WDGFV×D‡–G&F–öäE&–÷&—G’‡'Våv—F…&–÷&—G’“° ¢°¢–b‡G—VöbÖÓÒvgVæ7F–öârÇÂòòDfÆ÷t—77VRfÆ÷r–æ6÷'&V7FÇ’F†–æ·2Ö†2æò&÷F÷G—P¢Öç&÷F÷G—RÓÒçVÆÂÇÂG—VöbÖç&÷F÷G—Ræf÷$V6‚ÓÒvgVæ7F–öârÇÂG—Vöb6WBÓÒvgVæ7F–öârÇÂòòDfÆ÷t—77VRfÆ÷r–æ6÷'&V7FÇ’F†–æ·26WB†2æò&÷F÷G—P¢6WBç&÷F÷G—RÓÒçVÆÂÇÂG—Vöb6WBç&÷F÷G—Ræ6ÆV"ÓÒvgVæ7F–öârÇÂG—Vöb6WBç&÷F÷G—Ræf÷$V6‚ÓÒvgVæ7F–öâr’°¢W'&÷"‚u&V7BFWVæG2öâÖæB6WB'V–ÇBÖ–âG—W2âÖ¶R7W&RF†B–÷RÆöBr²wöÇ–f–ÆÂ–âöÆFW"'&÷w6W'2â‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷&V7B×öÇ–f–ÆÇ2r“°¢Ð¢Ð ¢6WE&W7F÷&T–×ÆVÖVçFF–öâ‡&W7F÷&T6öçG&öÆÆVE7FFRC2“°¢6WD&F6†–æt–×ÆVÖVçFF–öâ†&F6†VEWFFW2CÂF—67&WFUWFFW2ÂfÇW6…7–æ2“° ¢gVæ7F–öâ7&VFU÷'FÂC†6†–ÆG&VâÂ6öçF–æW"’°¢f"¶W’Ò&wVÖVçG2æÆVæwF‚â"bb&wVÖVçG5³%ÒÓÒVæFVf–æVBò&wVÖVçG5³%Ò¢çVÆÃ° ¢–b‚—5fÆ–D6öçF–æW"†6öçF–æW"’’°¢F‡&÷ræWrW'&÷"‚uF&vWB6öçF–æW"—2æ÷BDôÒVÆVÖVçBâr“°¢ÒòòDôDó¢72&V7DDôÒ÷'FÂ–×ÆVÖVçFF–öâ2F†—&B&wVÖVç@¢òòDfÆ÷tf—„ÖRF†RfÆ÷rG—R—2÷VR'WBF†W&Rw2æòv’Fò7GVÆÇ’7&VFR—Bà  ¢&WGW&â7&VFU÷'FÂ†6†–ÆG&VâÂ6öçF–æW"ÂçVÆÂÂ¶W’“°¢Ð ¢gVæ7F–öâ&VæFW%7V'G&VT–çFô6öçF–æW"‡&VçD6ö×öæVçBÂVÆVÖVçBÂ6öçF–æW$æöFRÂ6ÆÆ&6²’°¢&WGW&âVç7F&ÆU÷&VæFW%7V'G&VT–çFô6öçF–æW"‡&VçD6ö×öæVçBÂVÆVÖVçBÂ6öçF–æW$æöFRÂ6ÆÆ&6²“°¢Ð ¢f"–çFW&æÇ2Ò°¢W6–æt6Æ–VçDVçG'•ö–çC¢fÇ6RÀ¢òò¶VW–â7–æ2v—F‚&V7EFW7EWF–Ç2æ§2à¢òòF†—2—2â'&’f÷"&WGFW"Ö–æ–f–6F–öâà¢WfVçG3¢¶vWD–ç7Fæ6Tg&öÔæöFRÂvWDæöFTg&öÔ–ç7Fæ6RÂvWDf–&W$7W'&VçE&÷4g&öÔæöFRÂVçVWVU7FFU&W7F÷&RÂ&W7F÷&U7FFT–dæVVFVBÂ&F6†VEWFFW2CÐ¢Ó° ¢gVæ7F–öâ7&VFU&ö÷BC†6öçF–æW"Â÷F–öç2’°¢°¢–b‚–çFW&æÇ2çW6–æt6Æ–VçDVçG'•ö–çBbbG'VR’°¢W'&÷"‚u–÷R&R–×÷'F–ær7&VFU&ö÷Bg&öÒ'&V7BÖFöÒ"v†–6‚—2æ÷B7W÷'FVBâr²u–÷R6†÷VÆB–ç7FVB–×÷'B—Bg&öÒ'&V7BÖFöÒö6Æ–VçB"âr“°¢Ð¢Ð ¢&WGW&â7&VFU&ö÷B†6öçF–æW"Â÷F–öç2“°¢Ð ¢gVæ7F–öâ‡–G&FU&ö÷BC†6öçF–æW"Â–æ—F–Ä6†–ÆG&VâÂ÷F–öç2’°¢°¢–b‚–çFW&æÇ2çW6–æt6Æ–VçDVçG'•ö–çBbbG'VR’°¢W'&÷"‚u–÷R&R–×÷'F–ær‡–G&FU&ö÷Bg&öÒ'&V7BÖFöÒ"v†–6‚—2æ÷B7W÷'FVBâr²u–÷R6†÷VÆB–ç7FVB–×÷'B—Bg&öÒ'&V7BÖFöÒö6Æ–VçB"âr“°¢Ð¢Ð ¢&WGW&â‡–G&FU&ö÷B†6öçF–æW"Â–æ—F–Ä6†–ÆG&VâÂ÷F–öç2“°¢Òòò÷fW&ÆöBF†RFVf–æ—F–öâFòF†RGvòfÆ–B6–væGW&W2à¢òòv&æ–ærÂF†—2÷G2Ö÷WBöb6†V6¶–ærF†RgVæ7F–öâ&öG’à  ¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æRæò×&VFV6Æ&P¢gVæ7F–öâfÇW6…7–æ2C†fâ’°¢°¢–b†—4Ç&VG•&VæFW&–ær‚’’°¢W'&÷"‚vfÇW6…7–æ2v26ÆÆVBg&öÒ–ç6–FRÆ–fV7–6ÆRÖWF†öBâ&V7B6ææ÷Br²vfÇW6‚v†Vâ&V7B—2Ç&VG’&VæFW&–ærâ6öç6–FW"Ö÷f–ærF†—26ÆÂFòr²v66†VGVÆW"F6²÷"Ö–7&òF6²âr“°¢Ð¢Ð ¢&WGW&âfÇW6…7–æ2†fâ“°¢Ð¢f"f÷VæDFWeFööÇ2Ò–æ¦V7D–çFôFWeFööÇ2‡°¢f–æDf–&W$'”†÷7D–ç7Fæ6S¢vWD6Æ÷6W7D–ç7Fæ6Tg&öÔæöFRÀ¢'VæFÆUG—S¢À¢fW'6–öã¢&V7EfW'6–öâÀ¢&VæFW&W%6¶vTæÖS¢w&V7BÖFöÒp¢Ò“° ¢°¢–b‚f÷VæDFWeFööÇ2bb6åW6TDôÒbbv–æF÷rçF÷ÓÓÒv–æF÷rç6VÆb’°¢òò–bvRw&R–â6‡&öÖR÷"f—&Vf÷‚Â&÷f–FRF÷væÆöBÆ–æ²–bæ÷B–ç7FÆÆVBà¢–b†æf–vF÷"çW6W$vVçBæ–æFW„öb‚t6‡&öÖRr’âÓbbæf–vF÷"çW6W$vVçBæ–æFW„öb‚tVFvRr’ÓÓÒÓÇÂæf–vF÷"çW6W$vVçBæ–æFW„öb‚tf—&Vf÷‚r’âÓ’°¢f"&÷Fö6öÂÒv–æF÷ræÆö6F–öâç&÷Fö6öÃ²òòFöâwBv&â–âW†÷F–266W2Æ–¶R6‡&öÖRÖW‡FVç6–öã¢òòà ¢–b‚õâ†‡GG3÷Æf–ÆR“¢BòçFW7B‡&÷Fö6öÂ’’°¢òòW6Æ–çBÖF—6&ÆRÖæW‡BÖÆ–æR&V7BÖ–çFW&æÂöæò×&öGV7F–öâÖÆövv–æp¢6öç6öÆRæ–æfò‚rV4F÷væÆöBF†R&V7BFWeFööÇ2r²vf÷"&WGFW"FWfVÆ÷ÖVçBW‡W&–Væ6S¢r²v‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷&V7BÖFWgFööÇ2r²‡&÷Fö6öÂÓÓÒvf–ÆS¢ròuÆå–÷RÖ–v‡BæVVBFòW6RÆö6Â…EE6W'fW"†–ç7FVBöbf–ÆS¢òò“¢r²v‡GG3¢ò÷&V7F§2æ÷&röÆ–æ²÷&V7BÖFWgFööÇ2Öfr¢rr’ÂvföçB×vV–v‡C¦&öÆBr“°¢Ð¢Ð¢Ð¢Ð ¢W‡÷'G2åõõ4T5$UEô”åDU$äÅ5ôDõôäõEõU4Uôõ%õ”õUõt”ÄÅô$Uôd•$TBÒ–çFW&æÇ3°¢W‡÷'G2æ7&VFU÷'FÂÒ7&VFU÷'FÂC°¢W‡÷'G2æ7&VFU&ö÷BÒ7&VFU&ö÷BC°¢W‡÷'G2æf–æDDôÔæöFRÒf–æDDôÔæöFS°¢W‡÷'G2æfÇW6…7–æ2ÒfÇW6…7–æ2C°¢W‡÷'G2æ‡–G&FRÒ‡–G&FS°¢W‡÷'G2æ‡–G&FU&ö÷BÒ‡–G&FU&ö÷BC°¢W‡÷'G2ç&VæFW"Ò&VæFW#°¢W‡÷'G2çVæÖ÷VçD6ö×öæVçDDæöFRÒVæÖ÷VçD6ö×öæVçDDæöFS°¢W‡÷'G2çVç7F&ÆUö&F6†VEWFFW2Ò&F6†VEWFFW2C°¢W‡÷'G2çVç7F&ÆU÷&VæFW%7V'G&VT–çFô6öçF–æW"Ò&VæFW%7V'G&VT–çFô6öçF–æW#°¢W‡÷'G2çfW'6–öâÒ&V7EfW'6–öã° §Ò’’“° £·v–æF÷råõöG5&V7C×v–æF÷rå&V7C·v–æF÷råõöG5&V7DDôÓ×v–æF÷rå&V7DDôÓ¶–b…õ÷"—v–æF÷rå&V7CÕõ÷#¶–b…õ÷&B—v–æF÷rå&V7DDôÓÕõ÷&C·Ò’‚“³·v–æF÷rå&V7C×v–æF÷rå&V7GÇÇv–æF÷råõöG5&V7C·v–æF÷rå&V7DDôÓ×v–æF÷rå&V7DDô×ÇÇv–æF÷råõöG5&V7DDôÓ·G'—¶FVÆWFRv–æF÷råõöG5&V7C¶FVÆWFRv–æF÷råõöG5&V7DDôÓ·Ö6F6‚†R—·
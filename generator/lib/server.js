var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var _a, _b, _c, _d, _e;
import { Helmet, HelmetProvider } from "react-helmet-async";
import { jsxs, jsx } from "react/jsx-runtime";
import { StaticRouter } from "react-router-dom/server.js";
import { lazy, Component, createContext, useContext, useState, useCallback, useMemo, Suspense, StrictMode, forwardRef } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { useLocation, Routes, Route, useHref, useLinkClickHandler } from "react-router-dom";
import axios from "axios";
const bar = "bar";
async function preloader$1() {
  return { foo: bar };
}
var __glob_7_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  preloader: preloader$1
}, Symbol.toStringTag, { value: "Module" }));
const app = "_app_1f4ah_1";
var styles = {
  app
};
var index$1 = "";
function App$1({
  Component: Component2,
  initialProps,
  preloadedData
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: styles.app,
    id: "App",
    children: [/* @__PURE__ */ jsxs(Helmet, {
      htmlAttributes: {
        lang: "en"
      },
      children: [/* @__PURE__ */ jsx("title", {
        children: "React App"
      }), /* @__PURE__ */ jsx("meta", {
        charSet: "UTF-8"
      }), /* @__PURE__ */ jsx("meta", {
        httpEquiv: "X-UA-Compatible",
        content: "IE=edge"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      })]
    }), /* @__PURE__ */ jsx("h1", {
      children: "React App"
    }), /* @__PURE__ */ jsx(Component2, {
      initialProps,
      onError: (error, errorInfo) => {
        console.error(error);
        console.log(errorInfo);
      }
    })]
  });
}
var __glob_6_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": App$1
}, Symbol.toStringTag, { value: "Module" }));
function NotFound() {
  return /* @__PURE__ */ jsx("div", {
    children: "Oops..."
  });
}
var __glob_9_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": NotFound
}, Symbol.toStringTag, { value: "Module" }));
const ROUTES = { "../src/pages/about.tsx": () => Promise.resolve().then(function() {
  return about;
}), "../src/pages/index.tsx": () => Promise.resolve().then(function() {
  return index;
}) };
const routes = Object.entries(ROUTES).map(([pathname, module]) => {
  const path = pathname.replaceAll("../", "").replace("src/pages", "").replace(/\[\.{3}.+\]/, "*").replace(/\[(.+)\]/, ":$1").replace(/\.(tsx|ts|jsx|js)/, "");
  return {
    path: path === "/index" ? "/" : path,
    component: lazy(module),
    getStaticProps: () => module().then((m) => m.getStaticProps())
  };
});
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError(_error) {
    return {
      hasError: true
    };
  }
  componentDidCatch(error, errorInfo) {
    var _a2, _b2;
    (_b2 = (_a2 = this.props).onError) == null ? void 0 : _b2.call(_a2, error, errorInfo);
  }
  render() {
    const {
      children,
      fallback = null
    } = this.props;
    const {
      hasError
    } = this.state;
    if (hasError) {
      return fallback;
    }
    return children;
  }
}
function noop() {
}
const PageDataCacheContext = createContext({
  preload: noop,
  queryPageData: noop
});
function useQueryPageData(href) {
  return useContext(PageDataCacheContext).queryPageData(href);
}
const usePreload = () => useContext(PageDataCacheContext).preload;
function PageDataCache({
  initialProps,
  children
}) {
  const {
    pathname
  } = useLocation();
  const [cache, setCache] = useState(() => {
    if (initialProps === void 0) {
      return {};
    }
    return {
      [pathname]: {
        status: "SUCCESS",
        data: initialProps
      }
    };
  });
  const loadData = useCallback((href) => {
    var _a2;
    const cacheStatus = (_a2 = cache[href]) == null ? void 0 : _a2.status;
    if (["SUCCESS", "PENDING"].includes(cacheStatus)) {
      return;
    }
    const pendingData = loadStaticProps(href).then((data) => setCache((oldCache) => __spreadProps(__spreadValues({}, oldCache), {
      [href]: {
        status: "SUCCESS",
        data
      }
    }))).catch((error) => setCache((oldCache) => __spreadProps(__spreadValues({}, oldCache), {
      [href]: {
        status: "ERROR",
        error
      }
    })));
    setCache((oldCache) => __spreadProps(__spreadValues({}, oldCache), {
      [href]: {
        status: "PENDING",
        pendingData
      }
    }));
  }, [cache]);
  const queryPageData = useCallback((href) => {
    const currentData = cache[href];
    switch (currentData == null ? void 0 : currentData.status) {
      case "ERROR":
        throw currentData.error;
      case "PENDING":
        throw currentData.pendingData;
      case "SUCCESS":
        return currentData.data;
      default:
        throw loadData(href);
    }
  }, [cache, loadData]);
  const context = useMemo(() => ({
    queryPageData,
    preload: loadData
  }), [loadData, queryPageData]);
  return /* @__PURE__ */ jsx(PageDataCacheContext.Provider, {
    value: context,
    children
  });
}
class PageDataNotFoundError extends Error {
  constructor(href) {
    super(`page data not found at ${href}`);
    this.href = href;
  }
}
async function loadStaticProps(href) {
  return axios.get(`${href === "/" ? "index" : href}.json`).then((res) => {
    const contentType = res.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      throw new PageDataNotFoundError(href);
    }
    return res.data;
  }).catch((e) => {
    throw new PageDataNotFoundError(href);
  });
}
function Page({
  component: Component2
}) {
  const {
    pathname
  } = useLocation();
  const data = useQueryPageData(pathname);
  return /* @__PURE__ */ jsx(Component2, {
    staticProps: data
  });
}
const ErrorPage = ((_a = Object.values({})[0]) == null ? void 0 : _a.default) || (() => null);
const NotFoundPage = ((_b = Object.values({ "/src/404.tsx": __glob_9_0 })[0]) == null ? void 0 : _b.default) || (() => null);
const LoadingPage = ((_c = Object.values({})[0]) == null ? void 0 : _c.default) || (() => null);
function App({
  initialProps = {},
  onError
}) {
  return /* @__PURE__ */ jsx(PageDataCache, {
    initialProps,
    children: /* @__PURE__ */ jsx(Suspense, {
      fallback: /* @__PURE__ */ jsx(LoadingPage, {}),
      children: /* @__PURE__ */ jsx(ErrorBoundary, {
        fallback: /* @__PURE__ */ jsx(ErrorPage, {}),
        onError,
        children: /* @__PURE__ */ jsxs(Routes, {
          children: [routes.map(({
            path,
            component
          }) => /* @__PURE__ */ jsx(Route, {
            path,
            element: /* @__PURE__ */ jsx(Page, {
              component
            })
          }, path)), /* @__PURE__ */ jsx(Route, {
            path: "*",
            element: /* @__PURE__ */ jsx(NotFoundPage, {})
          })]
        })
      })
    })
  });
}
const CustomApp = (_d = Object.values({ "../src/App.tsx": __glob_6_0 })[0]) == null ? void 0 : _d.default;
function render(url, {
  preloadedData,
  initialProps
}, onAllReady) {
  const helmetData = {};
  const stream = renderToPipeableStream(/* @__PURE__ */ jsx(StrictMode, {
    children: /* @__PURE__ */ jsx(HelmetProvider, {
      context: helmetData,
      children: /* @__PURE__ */ jsx(StaticRouter, {
        location: url,
        children: CustomApp ? /* @__PURE__ */ jsx(CustomApp, {
          Component: App,
          initialProps,
          preloadedData
        }) : /* @__PURE__ */ jsx(App, {
          initialProps
        })
      })
    })
  }), {
    onShellError: (e) => onAllReady(stream, {}, e),
    onAllReady: () => {
      const {
        helmet
      } = helmetData;
      onAllReady(stream, helmet, null);
    }
  });
}
const preloader = ((_e = Object.values({ "../src/server.ts": __glob_7_0 })[0]) == null ? void 0 : _e.preloader) || function preloader2() {
  return {};
};
const Link = forwardRef(({
  to,
  replace = false,
  target,
  children,
  state
}, ref) => {
  const href = useHref(to);
  const handleClick = useLinkClickHandler(to, {
    replace,
    target,
    state
  });
  const preload = usePreload();
  return /* @__PURE__ */ jsx("a", {
    ref,
    href,
    onClick: handleClick,
    onMouseEnter: () => {
      preload(href);
    },
    children
  });
});
function getStaticProps$1() {
  return {
    foo: "baz"
  };
}
function About({
  staticProps
}) {
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      children: "ABOUT"
    }), /* @__PURE__ */ jsx(Link, {
      to: "/",
      children: "home"
    }), /* @__PURE__ */ jsx("div", {
      children: JSON.stringify(staticProps, null, 2)
    })]
  });
}
var about = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStaticProps: getStaticProps$1,
  "default": About
}, Symbol.toStringTag, { value: "Module" }));
function getStaticProps() {
  return {
    foo: "bar"
  };
}
function Home({
  staticProps
}) {
  return /* @__PURE__ */ jsxs("div", {
    children: [/* @__PURE__ */ jsx("h1", {
      children: "HOME"
    }), /* @__PURE__ */ jsx(Link, {
      to: "/about",
      children: "about"
    }), /* @__PURE__ */ jsx("div", {
      children: JSON.stringify(staticProps, null, 2)
    })]
  });
}
var index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStaticProps,
  "default": Home
}, Symbol.toStringTag, { value: "Module" }));
export { preloader, render, routes };

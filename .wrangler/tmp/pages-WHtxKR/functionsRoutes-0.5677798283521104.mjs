import { onRequest as __api_archive_transactions_js_onRequest } from "C:\\Users\\DotnetICT\\vatflow-ai\\functions\\api\\archive-transactions.js"
import { onRequest as __api_historical_transactions_js_onRequest } from "C:\\Users\\DotnetICT\\vatflow-ai\\functions\\api\\historical_transactions.js"
import { onRequest as __api_rules_js_onRequest } from "C:\\Users\\DotnetICT\\vatflow-ai\\functions\\api\\rules.js"
import { onRequest as __api_transactions_js_onRequest } from "C:\\Users\\DotnetICT\\vatflow-ai\\functions\\api\\transactions.js"
import { onRequest as __api_vatreturns_js_onRequest } from "C:\\Users\\DotnetICT\\vatflow-ai\\functions\\api\\vatreturns.js"

export const routes = [
    {
      routePath: "/api/archive-transactions",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_archive_transactions_js_onRequest],
    },
  {
      routePath: "/api/historical_transactions",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_historical_transactions_js_onRequest],
    },
  {
      routePath: "/api/rules",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_rules_js_onRequest],
    },
  {
      routePath: "/api/transactions",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_transactions_js_onRequest],
    },
  {
      routePath: "/api/vatreturns",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_vatreturns_js_onRequest],
    },
  ]
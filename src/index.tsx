import { Cmd, ActionType, runAction } from 'hydux'

export type ParamValue<A, D> = {
  api: A,
  init: D,
  handleStart?: (key: string) => void,
  /** override default success handler action */
  handleSuccess?: (key: string, data: D) => any,
  /** override default error handler action */
  handleError?: (key: string, err: Error) => any,
}
export type Param = { [k: string]: ParamValue<any, any> }

export type LoadApi<P extends Param> = {
  [k in keyof P]: P[k]['api']
} & {
  /** Enable auto set loading flag before fetching */
  enableLoadingFlag(): void
  /** Disbale auto set loading flag before fetching */
  disableLoadingFlag(): void
}
export type apiStatus<A extends Param, k extends keyof A> = {
  isLoading: boolean
  error: string
  rawError: any | null
  data: A[k]['init']
}
export type LoadState<A extends Param> = {
  [k in keyof A]: apiStatus<A, k>
}

const makeKey = (name: string) => `@hydux-data/${name}`

export default function Loadable<P extends Param>(
  param: P
): {
  actions: LoadApi<P>,
  state: LoadState<P>,
} {
  const state: LoadState<P> = {} as any
  const HandlerSuccess = makeKey('handleSuccess')
  const HandlerError = makeKey('handleError')
  const HandlerStart = makeKey('handleStart')
  const LoadingFlagDisabled = makeKey('loadingFlagDisabled')
  const actions: any = {
    [HandlerSuccess]: (key, data) => (state, actions) => ({
      ...state,
      [key]: {
        isLoading: false,
        rawError: null,
        data,
        error: '',
      }
    }),
    [HandlerError]: (key, error) => (state, actions) => ({
      ...state,
      [key]: {
        ...state[key],
        isLoading: false,
        rawError: error,
        error: error.message,
      }
    }),
    [HandlerStart]: (key) => (state, actions) => ({
      ...state,
      [key]: {
        ...state[key],
        isLoading: true,
        rawError: null,
        error: '',
      }
    }),
    enableLoadingFlag: () => state => ({
      ...state,
      [LoadingFlagDisabled]: false,
    }),
    disableLoadingFlag: () => state => ({
      ...state,
      [LoadingFlagDisabled]: true,
    }),
  }
  for (const key in param) {
    const info = param[key]
    state[key] = {
      error: '',
      data: info.init,
      isLoading: false,
      rawError: null,
    }
    actions[key] = (...args) => (state, actions, ps, pa) => {
      const runCustomAction =
        result => runAction(result, state, actions, ps, pa)
      return [
        state,
        Cmd.batch(
          state[LoadingFlagDisabled]
            ? Cmd.none
            : Cmd.ofSub(
                () =>
                  info.handleStart
                    ? runCustomAction(info.handleStart(key))
                    : actions[HandlerStart](key)
              ),
          Cmd.ofPromise(
            () => info.api(...args),
            data =>
              info.handleSuccess
                ? runCustomAction(info.handleSuccess(key, data))
                : actions[HandlerSuccess](key, data),
            (err: Error) =>
              info.handleError
                ? runCustomAction(info.handleError(key, err))
                : actions[HandlerError](key, err),
          )
        )
      ]
    }
  }
  return {
    state,
    actions,
  }
}

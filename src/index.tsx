import { wrapAction } from 'hydux'

type Status<A, E = string> = {
  [K in keyof A]: {
    isLoading: boolean,
    error: E,
    data: any
  }
}

type AsyncActions = {
  handleFulfilled: (name: string, data: any) => (state) => any,
  handleRejected: (name: string, err: Error) => (state) => any,
}
type AsyncState<A, E = string> = { status: Status<A, E> }

type AsyncResult<A, E = string> = {
  init: () => AsyncState<A, E>,
  actions: A & AsyncActions,
}

function async<A, E = string>(
  a: A,
  options: {
    parseError?: (err: Error) => E,
  } = {},
): AsyncResult<A> {
  const {
    parseError = (err: Error) => err.message as any as E,
  } = options
  let keys = Object.keys(a)
  let i = keys.length
  let actions = {} as (AsyncActions & A)
  let initState = { status: {} } as AsyncState<A>
  while (i--) {
    const k = keys[i]
    const action = a[k]
    initState[k] = {
      isLoading: false,
      error: '',
      data: null,
    }
    actions[k] = (...args) => wrapAction(action, (action, _, __, state: AsyncState<A, E>, actions: AsyncActions) => {
      const [nextState, cmd] = action(...args)
      if (cmd.length > 1) {
        console.error('[hydux-async]', 'Batched cmds in async actions might cause bugs!', k, actions)
        throw new TypeError(`[hydux-async] Invalid async action: ` + k)
      }
      return [nextState, cmd.map(cmd => _ => {
        const ret = cmd(_)
        if (ret && (ret instanceof Promise)) {
          ret
            .then(_ => (actions.handleFulfilled(k, _), _))
            .catch(err => actions.handleRejected(k, err))
        }
        return ret
      })]
    })
  }
  actions.handleFulfilled = (name: string, data: any) => (state: AsyncState<A>) => {
    return {
      ...state,
      status: {
        ...(state.status as any),
        [name]: { isLoading: false, error: '', data }
      },
    }
  }
  actions.handleRejected = (name: string, err: Error) => (state: AsyncState<A>) => {
    return {
      ...state,
      status: {
        ...(state.status as any),
        [name]: { isLoading: false, error: parseError(err) },
      },
    }
  }
  return {
    init: () => initState,
    actions,
  }
}

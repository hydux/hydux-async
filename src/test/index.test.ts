import Loadable from '../index'
import * as Hydux from 'hydux'
import * as assert from 'assert'
const sleep = ns => new Promise(res => setTimeout(res, ns))
const asyncApi = {
  fetchCount(count: number, failed = false) {
    return new Promise<number>(
      (resolve, reject) =>
        setTimeout(
          () => {
            failed
              ? reject(new Error(`Fetch ${count} failed!`))
              : resolve(count)
          },
          10,
        )
    )
  },
}

describe('test', () => {
  it('return', async () => {
    const loadableApi = Loadable({
      fetchCount: {
        init: 0,
        api: asyncApi.fetchCount,
      },
    })
    assert(typeof loadableApi.actions.fetchCount, 'function')
    assert(typeof loadableApi.actions.enableLoadingFlag, 'function')
    assert(typeof loadableApi.actions.disableLoadingFlag, 'function')
  })
  it('basic function', async () => {
    const loadableApi = Loadable({
      fetchCount: {
        init: 0,
        api: asyncApi.fetchCount,
      },
    })
    const ctx = Hydux.app<typeof loadableApi.state, typeof loadableApi.actions>({
      init: () => loadableApi.state,
      actions: loadableApi.actions,
      view: Hydux.noop,
    })
    assert.deepEqual(ctx.state, {
      fetchCount: {
        isLoading: false,
        data: 0,
        error: '',
        rawError: null,
      }
    }, 'init state work')
    ctx.actions.fetchCount(1)
    assert.deepEqual(ctx.state, {
      fetchCount: {
        isLoading: true,
        data: 0,
        error: '',
        rawError: null,
      }
    }, 'isLoading')
    await sleep(11)
    assert.deepEqual(ctx.state, {
      fetchCount: {
        isLoading: false,
        data: 1,
        error: '',
        rawError: null,
      }
    }, 'handle success')
    ctx.actions.fetchCount(2, true)
    assert(ctx.state.fetchCount.isLoading, 'fetchFailed isLoading')
    assert(ctx.state.fetchCount.data === 1, 'fetchFailed data')
    await sleep(11)
    assert(ctx.state.fetchCount.isLoading === false, 'fetchFailed done')
    assert(ctx.state.fetchCount.error === `Fetch 2 failed!`, 'fetchFailed done error')
    assert(ctx.state.fetchCount.rawError.message === `Fetch 2 failed!`, 'fetchFailed done rawError')
  })

  it('handleSuccess/handleError', async () => {
    let state = 'none' as 'none' | 'loading' | 'succeed' | 'failed'
    const loadableApi = Loadable({
      fetchCount: {
        init: 0,
        api: asyncApi.fetchCount,
        handleStart: () => (state = 'loading', void 0),
        handleSuccess: () => (state = 'succeed', void 0),
        handleError: () => (state = 'failed', void 0),
      },
    })
    const ctx = Hydux.app<typeof loadableApi.state, typeof loadableApi.actions>({
      init: () => loadableApi.state,
      actions: loadableApi.actions,
      view: Hydux.noop,
    })
    const initState = ctx.state
    ctx.actions.fetchCount(1, false)
    assert(state === 'loading', 'succeed state isLoading')
    await sleep(11)
    assert(ctx.state.fetchCount.data === 0, 'succeed state data')
    assert(state === 'succeed', 'succeed')
    ctx.actions.fetchCount(2, true)
    await sleep(11)
    assert(ctx.state.fetchCount.data === 0, 'faile state data')
    assert(ctx.state.fetchCount.error === '', 'failed state error')
    assert(state === 'failed', 'failed')
  })

  it('disableLoadingFlag', async () => {
    const loadableApi = Loadable({
      fetchCount: {
        init: 0,
        api: asyncApi.fetchCount,
      },
    })
    const ctx = Hydux.app<typeof loadableApi.state, typeof loadableApi.actions>({
      init: () => loadableApi.state,
      actions: loadableApi.actions,
      view: Hydux.noop,
    })

    ctx.actions.disableLoadingFlag()
    ctx.actions.fetchCount(1, false)
    assert.equal(ctx.state.fetchCount.isLoading, false, 'disableLoadingFlag')
    ctx.actions.enableLoadingFlag()
    ctx.actions.fetchCount(1, false)
    assert.equal(ctx.state.fetchCount.isLoading, true, 'enableLoadingFlag')
  })
})

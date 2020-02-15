import { createEvent, createStore, createEffect, forward } from 'lib/effector';

export const pageLoaded = createEvent();
export const incrementClicked = createEvent<any>();
export const resetClicked = createEvent<any>();

const getRandomInitialFx = createEffect<void, number>();

export const $counterValue = createStore<number>(0);
export const $pagePending = getRandomInitialFx.pending;

forward({
  from: pageLoaded,
  to: getRandomInitialFx,
});

$counterValue
  .on(getRandomInitialFx.done, (_, { result }) => result)
  .on(incrementClicked, (value) => value + 1)
  .on(resetClicked, () => 0);

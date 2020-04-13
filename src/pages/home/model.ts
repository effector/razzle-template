import { createEffect, createEvent, createStore, guard } from 'effector-root';

export const pageLoaded = createEvent();
export const incrementClicked = createEvent<any>();
export const resetClicked = createEvent<any>();

const getRandomInitialFx = createEffect<void, number>();

export const $counterValue = createStore<number>(0);
export const $pagePending = getRandomInitialFx.pending;

const $shouldGetNumber = $counterValue.map((value) => value === 0);

guard({
  source: pageLoaded,
  filter: $shouldGetNumber,
  target: getRandomInitialFx,
});

$counterValue
  .on(getRandomInitialFx.done, (_, { result }) => result)
  .on(incrementClicked, (value) => value + 1)
  .on(resetClicked, () => 0);

getRandomInitialFx.use(
  () =>
    new Promise((resolve) =>
      setTimeout(
        resolve,
        Math.floor(Math.random() * 300),
        Math.floor(Math.random() * 300),
      ),
    ),
);

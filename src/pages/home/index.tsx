import * as React from 'react';
import { useEvent, useStore } from 'effector-react/ssr';
import * as model from './model';

export const HomePage = () => {
  const pageLoaded = useEvent(model.pageLoaded);
  const increment = useEvent(model.incrementClicked);
  const reset = useEvent(model.resetClicked);

  const counterValue = useStore(model.$counterValue);
  const pagePending = useStore(model.$pagePending);

  React.useEffect(() => pageLoaded(), []);

  return (
    <section>
      <h2>Hello world! Effector SSR example</h2>
      <div>
        <h4>Counter value: {counterValue}</h4>
        <button disabled={pagePending} onClick={increment}>
          Increment
        </button>
        <button disabled={pagePending} onClick={reset}>
          Reset
        </button>
      </div>
    </section>
  );
};

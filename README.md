# mapgl-url-state

A simple way to make your map stateful through URL GET-parameters.

## Installation

```bash
npm i mapgl-url-state -S
```

## Usage 

Basic usage:

```ts
import urlState from 'mapgl-url-state';

const map = new mapgl.Map('container', {
    center: [55.31878, 25.23584],
    zoom: 17,
    key: 'Your MapGL JS API key'
});

urlState(map);
```

Advanced usage (with UI for custom params)

```ts
import { URLState } from './src/url-state';

load().then((mapgl) => {
    const map = new mapgl.Map('map', {
        center: [55.31878, 25.23584],
        zoom: 13,
        key: 'type your key here',
    });

    new URLState(map, {
        params: {
            theme: {
                type: 'string',
                default: 'Day',
                gui: true,
                options: {
                    'Day': 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
                    'Night': 'e05ac437-fcc2-4845-ad74-b1de9ce07555',
                    'Grayscale': 'b2b8046f-9bb0-469a-9860-9847032935cc',
                },
                onchange: (value) => {
                    map.setStyleById(value);
                }
            }
        }
    });
```
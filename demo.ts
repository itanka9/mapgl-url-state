import { load } from '@2gis/mapgl';
import { URLState } from './src/url-state';

load().then((mapgl) => {
    const map = new mapgl.Map('map', {
        center: [55.31878, 25.23584],
        zoom: 13,
        key: 'Your MapGL JS API key',
    });

    new URLState(map, {
        params: {
            theme: {
                type: 'string',
                default: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
                gui: true,
                options: {
                    'Day': 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
                    'Night': 'e05ac437-fcc2-4845-ad74-b1de9ce07555',
                    'Grayscale': 'b2b8046f-9bb0-469a-9860-9847032935cc',
                    'Snow': '1db52c6e-66b6-4c99-9c83-5538fa962d43',
                    '2009': '9e75a94c-36f7-4254-8101-90139ead38ad',
                },
                onchange: (value) => {
                    map.setStyleById(value);
                }
            }
        }
    });
});


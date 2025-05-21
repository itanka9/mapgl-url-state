import { Map } from '@2gis/mapgl/types';
import GUI from 'lil-gui';

interface StateParams {
    [key: string]: any;
}

interface ParamConfig {
    type: 'number' | 'string' | 'boolean';
    default: any;
    gui?: boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: string[] | { [key: string]: any };
    onchange?: (value: any) => void
}

interface URLStateConfig {
    params?: {
        [key: string]: ParamConfig;
    };
    guiOptions?: {
        container?: HTMLElement;
        autoPlace?: boolean;
    };
}

export class URLState {
    private map: Map;
    private paramsConfig: { [key: string]: ParamConfig };
    private gui: GUI | null = null;
    private guiControllers: { [key: string]: any } = {};
    private state: StateParams = {};
    private isUpdating = false;

    constructor(map: Map, private config: URLStateConfig = {}) {
        this.map = map;
        this.paramsConfig = config.params || {};

        this.initializeState();
        this.setupGUI();
        this.setupEventListeners();
    }

    private initializeState() {
        const params = new URLSearchParams(window.location.search);
        const hasExistingParams = params.toString() !== '';

        // Initialize map parameters
        const [lng, lat] = this.map.getCenter();
        this.state.lng = this.parseParam(params.get('lng'), 'number', lng);
        this.state.lat = this.parseParam(params.get('lat'), 'number', lat);
        this.state.zoom = this.parseParam(params.get('zoom'), 'number', this.map.getZoom());
        this.state.rotation = this.parseParam(
            params.get('rotation'),
            'number',
            this.map.getRotation(),
        );
        this.state.pitch = this.parseParam(params.get('pitch'), 'number', this.map.getPitch());

        // Initialize custom parameters
        Object.entries(this.paramsConfig).forEach(([key, config]) => {
            this.state[key] = this.parseParam(params.get(key), config.type, config.default);
        });

        this.applyMapState();
        this.updateGUI();

        if (!hasExistingParams) {
            this.updateURL();
        }
    }

    private parseParam(
        value: string | null,
        type: 'number' | 'string' | 'boolean',
        defaultValue: any,
    ): any {
        if (value === null) return defaultValue;
        if (type === 'number') return parseFloat(value);
        if (type === 'boolean') return value === 'true';
        return value;
    }

    private applyMapState() {
        this.isUpdating = true;
        this.map.setCenter([this.state.lng, this.state.lat]);
        this.map.setZoom(this.state.zoom);
        this.map.setRotation(this.state.rotation);
        this.map.setPitch(this.state.pitch);
        Object.entries(this.paramsConfig).forEach(([key, config]) => {
            if (config.onchange) {
                config.onchange(this.state[key]);
            }
        })
        this.isUpdating = false;
    }

    private setupGUI() {
        if (!Object.values(this.paramsConfig).some((c) => c.gui)) return;

        this.gui = new GUI(this.config?.guiOptions);

        Object.entries(this.paramsConfig).forEach(([key, config]) => {
            if (!config.gui) return;

            let controller = this.gui!.add(this.state, key);

            if (config.options) {
                controller = controller.options(config.options);
            }

            if (config.type === 'number') {
                controller
                    .min(config.min ?? 0)
                    .max(config.max ?? 100)
                    .step(config.step ?? 1);
            }
            controller.onChange((ev: any) => {
                this.updateURL();
                if (config.onchange) {
                    config.onchange(ev); 
                }

            });
            this.guiControllers[key] = controller;
        });
    }

    private updateGUI() {
        Object.keys(this.guiControllers).forEach((key) => {
            this.guiControllers[key]?.updateDisplay();
        });
    }

    private setupEventListeners() {
        this.map.on('moveend', () => this.handleMapMove());
        window.addEventListener('popstate', () => this.handlePopState());
    }

    private handleMapMove() {
        if (this.isUpdating) return;

        const [lng, lat] = this.map.getCenter();
        this.state.lng = lng;
        this.state.lat = lat;
        this.state.zoom = this.map.getZoom();
        this.state.rotation = this.map.getRotation();
        this.state.pitch = this.map.getPitch();

        this.updateURL();
    }

    private handlePopState() {
        this.initializeState();
    }

    private updateURL() {
        const params = new URLSearchParams();

        // Map parameters
        params.set('lng', this.state.lng.toFixed(6));
        params.set('lat', this.state.lat.toFixed(6));
        params.set('zoom', this.state.zoom.toFixed(2));
        params.set('rotation', this.state.rotation.toFixed(2));
        params.set('pitch', this.state.pitch.toFixed(2));

        // Custom parameters
        Object.entries(this.paramsConfig).forEach(([key]) => {
            const value = this.state[key];
            if (value !== undefined && value !== null) {
                params.set(key, value.toString());
            }
        });

        window.history.replaceState({}, '', `?${params.toString()}`);
    }

    public destroy() {
        this.map.off('moveend', () => this.handleMapMove());
        window.removeEventListener('popstate', () => this.handlePopState());
        this.gui?.destroy();
    }
}


export default function (map: Map, config: URLStateConfig) {
    return new URLState(map, config);
}
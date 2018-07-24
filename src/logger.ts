import * as Logdown from 'logdown';

import * as Raven from 'raven-js';

export class Logger {

    private logdown: Logdown;

    private namespace: string;

    private environment : any;

    constructor (namespace:string, environment: any) {

        this.namespace = namespace;
        
        this.environment = environment;
        
        if (this.environment.ENV === 'PROD') {

            // Fallback

            this.logdown = <any> {

                info: () => {},

                log: () => {},

                warn: () => {},

                error: () => {},

                debug: () => {}

            };

            return;

        }

        if (Logdown) {

            this.logdown = new Logdown(`${this.namespace} `);

            this.logdown.state.isEnabled = this.environment.ENV !== 'PROD';

            return;

        }

        // Fallback if logdown isn't available

        this.logdown = <any> console;

    }

    info (...args: Array<any>) {

        this.logdown.info(...args);

    }

    log (...args: Array<any>) {

        if (this.environment.production) {

            return;

        }

        this.logdown.log(...args);

    }

    warn (...args: Array<any>) {

        this.logdown.warn(...args);

    }

    error (...args: Array<any>) {

        Raven.captureException(args[0]);

        if (this.environment.production && Raven.isSetup()) {

            this.logdown.error(...args);

        }

    }

    debug (...args: Array<any>) {

        this.logdown.debug(...args);

    }
}
/**
 * Simple dependency injection container
 */
export class DependencyContainer {
    private services = new Map<string, unknown>();
    private factories = new Map<string, () => unknown>();
    private singletons = new Map<string, unknown>();

    /**
     * Register a service factory
     */
    register<T>(token: string, factory: () => T, singleton: boolean = true): void {
        this.factories.set(token, factory);
        if (!singleton) {
            this.services.set(token, null);
        }
    }

    /**
     * Register a value directly
     */
    registerValue<T>(token: string, value: T): void {
        this.singletons.set(token, value);
    }

    /**
     * Resolve a service
     */
    resolve<T>(token: string): T {
        if (this.singletons.has(token)) {
            return this.singletons.get(token) as T;
        }

        const factory = this.factories.get(token);
        if (!factory) {
            throw new Error(`No service registered for token: ${token}`);
        }

        if (!this.services.has(token)) {
            const instance = factory();
            this.singletons.set(token, instance);
            return instance as T;
        }

        return factory() as T;
    }
}

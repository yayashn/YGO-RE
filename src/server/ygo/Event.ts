import { Signal } from "@rbxts/beacon"

export class YEvent<T> {
    private value: T
    event = new Signal<T>();

    constructor(value: T) {
        this.value = value
    }

    set(newValue: T) {
        print(1.1);
        this.value = newValue;
        print(1.2);
        print(newValue);
        (this.event.Fire as unknown as (v: unknown) => {})(5);
        print(1.3)
    }

    get() {
        return this.value
    }

    changedOnce() {
        this.event.Wait()
        return this.value
    }
}

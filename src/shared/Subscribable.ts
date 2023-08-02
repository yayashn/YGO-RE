import { Signal } from "@rbxts/beacon"

export class Subscribable<T> {
    private value: T
    private event = new Signal<[val: T]>();
    private sideEffect?: Callback

    constructor(value: T, sideEffect?: Callback) {
        this.value = value;
        this.sideEffect = sideEffect;
    }

    set(newValue: T) {
        this.value = newValue;
        this.event.Fire(newValue);
        this.sideEffect?.();
    }

    get() {
        return this.value
    }

    changedOnce(callback: Callback) {
        return this.event.Once(callback)
    }

    changed(callback: Callback) {
        return this.event.Connect(callback)
    }

    wait() {
        return this.event.Wait()[0]
    }

    refresh() {
        this.event.Fire(this.value);
    }
}
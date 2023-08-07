import { Signal } from "@rbxts/beacon"

export class Subscribable<T> {
    private value: T
    private event = new Signal<[val: T]>();
    private sideEffect?: Callback
    private getSideEffect?: Callback

    constructor(value: T, sideEffect?: Callback, getSideEffect?: Callback) {
        this.value = value;
        this.sideEffect = sideEffect;
        this.getSideEffect = getSideEffect;
    }

    set(newValue: T) {
        this.value = newValue;
        this.event.Fire(newValue);
        this.sideEffect?.(newValue);
    }

    get() {
        this.getSideEffect?.(this.value);
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
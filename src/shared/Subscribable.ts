import { Signal } from "@rbxts/beacon"

export class Subscribable<T> {
    private value: T
    private event = new Signal<[val: T]>();

    constructor(value: T) {
        this.value = value
    }

    set(newValue: T) {
        this.value = newValue;
        this.event.Fire(newValue);
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
        return this.event.Wait()
    }
}
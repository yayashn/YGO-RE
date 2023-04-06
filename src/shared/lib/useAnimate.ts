import { useState, useEffect } from "@rbxts/roact-hooked";
import { TweenService } from "@rbxts/services";

interface AnimateInfo {
    duration: number;
    easingStyle: Enum.EasingStyle;
    easingDirection: Enum.EasingDirection;
    repeatCount: number;
    reverses: boolean;
    delayTime: number;
}

export default function useAnimate(initial: number, animate: number, animateInfo: AnimateInfo): number {
    const [value, setValue] = useState(initial);
    const numberValue = new Instance("NumberValue");
    numberValue.Value = initial;

    useEffect(() => {
        const connection = numberValue.Changed.Connect((newValue) => {
            setValue(newValue);
        });

        const tweenInfo = new TweenInfo(
            animateInfo.duration,
            animateInfo.easingStyle,
            animateInfo.easingDirection,
            animateInfo.repeatCount,
            animateInfo.reverses,
            animateInfo.delayTime
        );

        const tween = TweenService.Create(numberValue, tweenInfo, { Value: animate });
        tween.Play();

        return () => {
            connection.Disconnect();
            tween.Cancel();
        };
    }, [animate, animateInfo]);

    return value;
}

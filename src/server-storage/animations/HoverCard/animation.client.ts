import { TweenService } from "@rbxts/services"

const element = script.Parent!.Parent as GuiObject
const animationOn = script.Parent as BoolValue
const tweenInfoOn = new TweenInfo(0.1, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0);
const tweenInfoOff = new TweenInfo(0.1, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0);
const tweenGoalOn = { Size: new UDim2(1, 0, 1, 0) }
const tweenGoalOff = { Size: new UDim2(0.8, 0, 0.8, 0) }
const tweenOn = TweenService.Create(element!, tweenInfoOn, tweenGoalOn)
const tweenOff = TweenService.Create(element!, tweenInfoOff, tweenGoalOff)

animationOn.Changed.Connect((on) => {
    if (on) {
        tweenOff.Pause();
        tweenOn.Play();
    } else {
        tweenOn.Pause();
        tweenOff.Play();
    }
})
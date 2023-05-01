import { TweenService } from "@rbxts/services"

const element = script.Parent!.Parent as GuiObject
const animationOn = script.Parent as BoolValue
const tweenInfoOn = new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1, true, 0);
const tweenInfoOff = new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0);
const tweenGoalLoop = { BackgroundTransparency: 0.5 };
const tweenGoalOff = { BackgroundTransparency: 1 };
const tweenOn = TweenService.Create(element!, tweenInfoOn, tweenGoalLoop)
const tweenOff = TweenService.Create(element!, tweenInfoOff, tweenGoalOff)

animationOn.Changed.Connect((on) => {
    if (on) {
        tweenOn.Play();
    } else {
        tweenOn.Pause();
        element.BackgroundTransparency = 1
    }
})
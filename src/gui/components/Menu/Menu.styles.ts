import { black, white, greyLight } from "shared/colours"

export const window = {
    Size: new UDim2(1, 0, 1, 0),
    BackgroundColor3: black,
    BackgroundTransparency: 0.3
}

export const buttons = {
    Size: new UDim2(1, 0, 0, 80),
    BackgroundTransparency: 1
}

export const button = {
    Size: new UDim2(0, 260, 0, 48),
    BackgroundColor3: white,
    BackgroundTransparency: 1,
    AutoButtonColor: false
}

export const buttonHovered = {
    ...button,
    BackgroundTransparency: 0.8
}

export const buttonText = {
    Font: Enum.Font.GothamMedium,
    TextColor3: white,
    TextSize: 18,
    Size: new UDim2(1, 0, 1, 0),
    BackgroundTransparency: 1
}

export const tabs = {
    BackgroundTransparency: 1,
    Size: new UDim2(1, 0, 0, 60)
}

export const content = {
    Size: new UDim2(1, 0, 1, -tabs.Size.Y.Offset - buttons.Size.Y.Offset),
    BackgroundTransparency: 1
}

export const tabButtonContent = {
    BackgroundTransparency: 1,
    Size: new UDim2(1, 0, 1, 0)
}

export const tabButtonBorder = {
    BackgroundColor3: greyLight,
    Size: new UDim2(1, 0, 0, 1),
    Position: new UDim2(0, 0, 1, 0)
}

export const tabButtonBorderActive = {
    BackgroundColor3: white,
    Size: new UDim2(1, 0, 0, 3),
    Position: new UDim2(0, 0, 1, -1.5)
}

export const tabButtonIcon = {}

export const tabButton = (numberOfTabs: number) => ({
    Size: new UDim2(1 / numberOfTabs, 0, 1, 0),
    BackgroundTransparency: 1,
    Text: ''
})

export const tabButtonText = {
    Font: Enum.Font.GothamBlack,
    FontSize: Enum.FontSize.Size18,
    TextColor3: white
}

export const tabButtonTextInactive = {
    ...tabButtonText,
    TextColor3: greyLight
}

export const backdrop = {
    BackgroundColor3: black,
    BackgroundTransparency: 0.5,
    Size: new UDim2(1, 0, 1, 0)
}

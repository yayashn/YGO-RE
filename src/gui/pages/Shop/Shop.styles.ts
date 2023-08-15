import { black, white, grey } from "shared/colours"

export const packs = {
    Size: new UDim2(1, 0, 1, 0),
    BackgroundTransparency: 1,
    BorderSizePixel: 0
}

export const pack = {
    Size: new UDim2(1, -15, 0, 200),
    BackgroundColor3: black,
    BorderSizePixel: 0,
    ScaleType: Enum.ScaleType.Crop,
    ImageTransparency: 0.3
}

export const packPrice = {
    Size: new UDim2(1, 0, 0, 0),
    AutomaticSize: Enum.AutomaticSize.Y,
    BackgroundTransparency: 1,
    TextWrapped: true,
    TextColor3: white,
    TextSize: 40,
    TextXAlignment: Enum.TextXAlignment.Left,
    Font: Enum.Font.GothamBold,
    TextStrokeTransparency: 0,
    TextStrokeColor3: black
}

export const packButtons = {
    Size: new UDim2(1 - packPrice.Size.X.Scale, 0, 1, 0),
    BackgroundTransparency: 1
}

export const packButton = {
    TextColor3: white,
    TextSize: 20,
    TextXAlignment: Enum.TextXAlignment.Center,
    Font: Enum.Font.GothamMedium,
    Size: new UDim2(0, 0, 0, 50),
    AutomaticSize: Enum.AutomaticSize.X,
    BackgroundColor3: grey
}

export const packScroll = {
    ScrollBarThickness: 2,
    AutomaticCanvasSize: Enum.AutomaticSize.Y,
    Size: new UDim2(1, 0, 1, 0),
    BackgroundTransparency: 1,
    BorderSizePixel: 0
}

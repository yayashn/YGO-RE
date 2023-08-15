import { grey, white, greyLight } from "shared/colours"

export const decks = {
    Size: new UDim2(1, 0, 1, 0),
    BackgroundTransparency: 1,
    BorderSizePixel: 0
}

export const deck = {
    Size: new UDim2(1, -15, 0, 62),
    BackgroundColor3: grey,
    BorderSizePixel: 0
}

export const deckName = {
    Size: new UDim2(0.8, 0, 1, 0),
    BackgroundTransparency: 1,
    TextColor3: white,
    TextSize: 20,
    TextXAlignment: Enum.TextXAlignment.Left,
    Font: Enum.Font.GothamMedium
}

export const deckButtons = {
    Size: new UDim2(1 - deckName.Size.X.Scale, 0, 1, 0),
    BackgroundTransparency: 1
}

export const deckButton = {
    TextColor3: white,
    TextSize: 20,
    TextXAlignment: Enum.TextXAlignment.Center,
    Font: Enum.Font.GothamMedium,
    Size: new UDim2(0, 0, 0.7, 0),
    AutomaticSize: Enum.AutomaticSize.X,
    BackgroundColor3: greyLight
}

export const deckSearch = {
    Size: new UDim2(1, -110, 1, 0),
    BackgroundColor3: grey,
    TextColor3: white,
    Font: Enum.Font.GothamMedium,
    TextSize: 20,
    PlaceholderText: 'Search',
    Text: '',
    BorderSizePixel: 3,
    BorderColor3: greyLight
}

export const deckScroll = {
    ScrollBarThickness: 2,
    AutomaticCanvasSize: Enum.AutomaticSize.Y,
    Size: new UDim2(1, 0, 1, -deckSearch.Size.Y.Offset),
    BackgroundTransparency: 1,
    BorderSizePixel: 0
}

export const createButton = {
    ...deckButton,
    Size: new UDim2(0, 0, 1, 0),
}

export const topContainer = {
    Size: new UDim2(1, 0, 0, 50),
    BackgroundTransparency: 1
}
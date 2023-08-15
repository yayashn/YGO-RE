import { grey, white } from "shared/colours"

export const deckEditor = {
    Size: new UDim2(1, 0, 1, 0),
    BackgroundTransparency: 1
}
export const deck = {
    Size: new UDim2(0.7, 0, 1, 0),
    BackgroundTransparency: 1
}
export const cards = {
    Size: new UDim2(0, 235, 1, 0),
    BackgroundTransparency: 1
}
export const cardsSearch = {
    Size: new UDim2(1, 0, 0, 35),
    BorderSizePixel: 0,
    BackgroundColor3: grey,
    TextColor3: white,
    Text: '',
    PlaceholderText: 'Search'
}
export const cardsInfo = {
    Size: new UDim2(1, 0, 0, 100),
    BorderSizePixel: 0,
    BackgroundColor3: grey
}
export const cardScrollContainer = {
    Size: new UDim2(1, 0, 1, -cardsSearch.Size.Y.Offset - cardsInfo.Size.Y.Offset),
    BorderSizePixel: 0,
    BackgroundColor3: grey,
    ClipsDescendants: true,
}
export const cardsScroll = {
    Size: new UDim2(1, 0, 1, 0),
    BorderSizePixel: 0,
    ScrollBarThickness: 2,
    AutomaticCanvasSize: Enum.AutomaticSize.Y,
    BackgroundTransparency: 1,
}

export const mainDeckContainer = {
    Size: new UDim2(1, 0, 1, -cardsInfo.Size.Y.Offset + 10),
    BorderSizePixel: 0,
    BackgroundColor3: grey
}
export const mainDeck = {
    Size: new UDim2(1, 0, 1, 0),
    BorderSizePixel: 0,
    BackgroundTransparency: 1,
    ScrollBarThickness: 2,
    AutomaticCanvasSize: Enum.AutomaticSize.Y
}

export const extraDeckContainer = {
    Size: new UDim2(1, 0, 0, 96),
    BackgroundColor3: grey,
    BorderSizePixel: 0
}
export const extraDeck = {
    Size: new UDim2(1, 0, 1, 0),
    BackgroundTransparency: 1,
    BorderSizePixel: 0,
    ScrollBarThickness: 2,
    AutomaticCanvasSize: Enum.AutomaticSize.Y
}

export const card = {
    Size: new UDim2(1, 0, 0, 614 / 6.4),
    Text: '',
    BackgroundTransparency: 1,
}

export const cardArt = {
    Size: new UDim2(0, 421 / 6.4, 0, 614 / 6.4),
}

export const cardInfo = {
    Size: new UDim2(1, -cardArt.Size.X.Offset*1.1, 1, 0),
    AutomaticSize: Enum.AutomaticSize.Y,
    BackgroundTransparency: 1,
}

export const cardName = {
    Size: new UDim2(1, 0, 0, 15),
    TextYAlignment: Enum.TextYAlignment.Bottom,
    TextScaled: true,
    Font: Enum.Font.GothamMedium,
    TextColor3: white,
    TextXAlignment: Enum.TextXAlignment.Left,
    BackgroundTransparency: 1,
}

export const cardText = {
    BackgroundTransparency: 1,
    Size: new UDim2(1, 0, 0, 0),
    TextColor3: white,
    TextXAlignment: Enum.TextXAlignment.Left,
    TextYAlignment: Enum.TextYAlignment.Top,
    AutomaticSize: Enum.AutomaticSize.Y,
    TextSize: 12,
    Font: Enum.Font.Arial,
    LineHeight: 1.3,
    TextWrapped: true,
    TextStrokeTransparency: 0,
    TextStrokeColor3: grey
}

export const cardsInfoScroll = {
    Size: new UDim2(1, 0, 1, 0),
    BorderSizePixel: 0,
    ScrollBarThickness: 2,
    BackgroundTransparency: 1,
}

export const cardsInfoText = {
    BackgroundTransparency: 1,
    Size: new UDim2(1, 0, 0, 0),
    TextColor3: white,
    TextXAlignment: Enum.TextXAlignment.Left,
    TextYAlignment: Enum.TextYAlignment.Top,
    AutomaticSize: Enum.AutomaticSize.Y,
    TextSize: 12,
    Font: Enum.Font.Arial,
    LineHeight: 1.3,
    TextWrapped: true,
    TextStrokeTransparency: 0,
    TextStrokeColor3: grey
}
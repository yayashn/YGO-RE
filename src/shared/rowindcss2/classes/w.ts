import udim from "../values/udim";

export default (properties: Record<string, unknown>, value: string) => ({
    w() {
        (properties.Size as Record<string, unknown>).X = udim[value as unknown as keyof typeof udim] || new UDim(0, 0);
    }
})
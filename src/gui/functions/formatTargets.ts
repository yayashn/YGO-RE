export default (targets: string[]) => {
    const noEmptyStrings = () => {
        return targets.filter((target) => target !== "");
    }
    const noDuplicates = () => {
        return noEmptyStrings().filter((target, index, arr) => {
            return arr.indexOf(target) === index;
        });
    }

    return noDuplicates().join(",");
}
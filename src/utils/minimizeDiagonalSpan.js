function minimizeDiagonalSpan(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;

    // Helper function to generate all permutations of an array
    function generatePermutations(arr) {
        if (arr.length === 0) return [[]];
        const firstElem = arr[0];
        const rest = arr.slice(1);
        const permsWithoutFirst = generatePermutations(rest);
        const allPerms = [];
        permsWithoutFirst.forEach(perm => {
            for (let i = 0; i <= perm.length; i++) {
                const permWithFirst = [...perm.slice(0, i), firstElem, ...perm.slice(i)];
                allPerms.push(permWithFirst);
            }
        });
        return allPerms;
    }

    const columnPermutations = generatePermutations([...Array(n).keys()]);
    let bestDiagonal = [];
    let minSpan = Infinity;

    // Try all column permutations to find the one with the minimal span
    for (const perm of columnPermutations) {
        const diagonal = [];
        for (let i = 0; i < n; i++) {
            diagonal.push(matrix[i][perm[i]]);
        }
        const span = Math.max(...diagonal) - Math.min(...diagonal);
        if (span <= 3 && span < minSpan) {
            minSpan = span;
            bestDiagonal = diagonal;
        }
    }

    return { bestDiagonal, minSpan };
}

export default minimizeDiagonalSpan;

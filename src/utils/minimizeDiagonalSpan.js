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

    // Helper function to get all possible nxn submatrices with their original row indices
    function getSubmatrices(matrix) {
        const submatrices = [];
        for (let i = 0; i <= m - n; i++) {
            const submatrix = matrix.slice(i, i + n);
            const rowIndices = Array.from({ length: n }, (_, k) => i + k);
            submatrices.push({ submatrix, rowIndices });
        }
        return submatrices;
    }

    const columnPermutations = generatePermutations([...Array(n).keys()]);
    const validDiagonals = [];

    // Get all possible nxn submatrices
    const submatrices = getSubmatrices(matrix);

    // Try all submatrices and column permutations to find all that comply with the 3-fret rule
    for (const { submatrix, rowIndices } of submatrices) {
        for (const perm of columnPermutations) {
            const diagonal = [];
            for (let i = 0; i < n; i++) {
                diagonal.push(submatrix[i][perm[i]]);
            }
            const span = Math.max(...diagonal) - Math.min(...diagonal);
            if (span <= 3) {
                validDiagonals.push({ diagonal, rowIndices });
            }
        }
    }

    return validDiagonals;
}

export default minimizeDiagonalSpan;
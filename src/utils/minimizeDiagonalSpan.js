function minimizeDiagonalSpan(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;

    // Select the first n rows as the subset
    const subsetMatrix = matrix.slice(0, n);

    // Initialize the best diagonal and its span
    let bestDiagonal = [];
    let minSpan = Infinity;

    // Greedy approach to find the minimal span
    const usedColumns = new Set();
    for (let i = 0; i < n; i++) {
        let bestValue = Infinity;
        let bestColumn = -1;
        for (let j = 0; j < n; j++) {
            if (!usedColumns.has(j)) {
                const value = subsetMatrix[i][j];
                if (value < bestValue) {
                    bestValue = value;
                    bestColumn = j;
                }
            }
        }
        usedColumns.add(bestColumn);
        bestDiagonal.push(bestValue);
    }

    const span = Math.max(...bestDiagonal) - Math.min(...bestDiagonal);
    if (span < minSpan) {
        minSpan = span;
    }

    return { bestDiagonal, minSpan };
}

export default minimizeDiagonalSpan;

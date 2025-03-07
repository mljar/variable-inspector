import { allowedTypes } from './allowedTypes';

export function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) =>
    matrix.map((row: T[]) => row[colIndex])
  );
}

interface TransformedMatrix {
  data: any[][];
  fixedRowCount: number;
  fixedColumnCount: number;
}

interface TransformedMatrix {
  data: any[][];
  fixedRowCount: number;
  fixedColumnCount: number;
}

export function transformMatrixData(
  matrixData: any[],
  variableType: string,
  currentRow: number,
  currentColumn: number
): TransformedMatrix {
  let data2D: any[][] = [];
  if (matrixData.length > 0 && !Array.isArray(matrixData[0])) {
    data2D = (matrixData as any[]).map(item => [item]);
  } else {
    data2D = matrixData as any[][];
  }

  let data: any[][] = data2D;
  let fixedRowCount = 0;
  let fixedColumnCount = 0;

  if (data2D.length > 0 && allowedTypes.includes(variableType)) {
    const globalRowStart = currentRow;
    const headerRow = ['index'];
    const headerLength =
      variableType === 'DataFrame' ? data2D[0].length - 1 : data2D[0].length;
    for (let j = 0; j < headerLength; j++) {
      headerRow.push((globalRowStart + j).toString());
    }

    let newData = [headerRow];
    for (let i = 0; i < data2D.length; i++) {
      if (variableType === 'DataFrame') {
        newData.push([...data2D[i]]);
      } else {
        const globalIndex = currentRow + i;
        newData.push([globalIndex, ...data2D[i]]);
      }
    }

    if (variableType === 'DataFrame' || variableType === 'Series') {
      newData = transpose(newData);
    }

    data2D = transpose(data2D);
    data = newData;
    fixedRowCount = 1;
    fixedColumnCount = 1;
  }

  return { data, fixedRowCount, fixedColumnCount };
}

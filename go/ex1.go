package main

import (
	"fmt"
	"sync"
)

// 矩阵乘法函数
func matrixMultiply(a, b [][]float64) [][]float64 {
	rowNum := len(a)
	colNum := len(b[0])
	result := make([][]float64, rowNum)
	for i := range result {
		result[i] = make([]float64, colNum)
	}

	var wg sync.WaitGroup
	for i := 0; i < rowNum; i++ {
		for j := 0; j < colNum; j++ {
			wg.Add(1)
			go func(i, j int) {
				defer wg.Done()
				for k := 0; k < len(b); k++ {
					result[i][j] += a[i][k] * b[k][j]
				}
			}(i, j)
		}
	}
	wg.Wait()
	return result
}

func main() {
	// 初始化两个矩阵
	a := [][]float64{
		{1, 2},
		{3, 4},
	}
	b := [][]float64{
		{2, 0},
		{1, 2},
	}

	// 矩阵乘法
	result := matrixMultiply(a, b)

	// 打印结果
	fmt.Println(result)
}

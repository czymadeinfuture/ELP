package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"sync"
)

// read matrixs from a txt file
func readMatrixFromFile(filename string) [][]int {
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return nil
	}
	defer file.Close()

	var matrix [][]int
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		var row []int
		for _, element := range strings.Fields(scanner.Text()) {
			var value int
			fmt.Sscanf(element, "%d", &value)
			row = append(row, value)
		}
		matrix = append(matrix, row)
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading file:", err)
		return nil
	}
	return matrix
}

// adds two matrices
func addMatrix(A, B [][]int) [][]int {
	n := len(A)
	C := make([][]int, n)
	for i := range C {
		C[i] = make([]int, n)
		for j := range C[i] {
			C[i][j] = A[i][j] + B[i][j]
		}
	}
	return C
}

// subtracts matrix B from matrix A
func subtractMatrix(A, B [][]int) [][]int {
	n := len(A)
	C := make([][]int, n)
	for i := range C {
		C[i] = make([]int, n)
		for j := range C[i] {
			C[i][j] = A[i][j] - B[i][j]
		}
	}
	return C
}

// Strassen's algorithm for matrix multiplication
func strassen(A, B [][]int) [][]int {
	n := len(A)
	if n == 1 {
		return [][]int{{A[0][0] * B[0][0]}}
	}

	// etape1:split matrices into four submatrices
	newSize := n / 2
	A11, A12, A21, A22 := splitMatrix(A, newSize)
	B11, B12, B21, B22 := splitMatrix(B, newSize)

	// etape2:calculate 7 products using Strassen's formula
	var wg sync.WaitGroup

	results := make([][][]int, 7)
	wg.Add(7) // 因为有七个矩阵乘法操作
	go func() {
		defer wg.Done()
		results[0] = last_strassen(addMatrix(A11, A22), addMatrix(B11, B22)) // M1
	}()
	go func() {
		defer wg.Done()
		results[1] = last_strassen(addMatrix(A21, A22), B11) // M2
	}()
	go func() {
		defer wg.Done()
		results[2] = last_strassen(A11, subtractMatrix(B12, B22)) // M3
	}()
	go func() {
		defer wg.Done()
		results[3] = last_strassen(A22, subtractMatrix(B21, B11)) // M4
	}()
	go func() {
		defer wg.Done()
		results[4] = last_strassen(addMatrix(A11, A12), B22) // M5
	}()
	go func() {
		defer wg.Done()
		results[5] = last_strassen(subtractMatrix(A21, A11), addMatrix(B11, B12)) // M6
	}()
	go func() {
		defer wg.Done()
		results[6] = last_strassen(subtractMatrix(A12, A22), addMatrix(B21, B22)) // M7
	}()
	wg.Wait() // 等待所有 goroutine 完成

	// etape3:combine the four submatrices into the final result
	return combineMatrices(results, newSize)
}

func last_strassen(A, B [][]int) [][]int {
	n := len(A)
	if n == 1 {
		return [][]int{{A[0][0] * B[0][0]}}
	}

	// etape1:split matrices into four submatrices
	newSize := n / 2
	A11, A12, A21, A22 := splitMatrix(A, newSize)
	B11, B12, B21, B22 := splitMatrix(B, newSize)

	// etape2:calculate 7 products using Strassen's formula
	var wg sync.WaitGroup

	results := make([][][]int, 7)
	wg.Add(7) // 因为有七个矩阵乘法操作
	go func() {
		defer wg.Done()
		results[0] = MatrixMultiply(addMatrix(A11, A22), addMatrix(B11, B22)) // M1
	}()
	go func() {
		defer wg.Done()
		results[1] = MatrixMultiply(addMatrix(A21, A22), B11) // M2
	}()
	go func() {
		defer wg.Done()
		results[2] = MatrixMultiply(A11, subtractMatrix(B12, B22)) // M3
	}()
	go func() {
		defer wg.Done()
		results[3] = MatrixMultiply(A22, subtractMatrix(B21, B11)) // M4
	}()
	go func() {
		defer wg.Done()
		results[4] = MatrixMultiply(addMatrix(A11, A12), B22) // M5
	}()
	go func() {
		defer wg.Done()
		results[5] = MatrixMultiply(subtractMatrix(A21, A11), addMatrix(B11, B12)) // M6
	}()
	go func() {
		defer wg.Done()
		results[6] = MatrixMultiply(subtractMatrix(A12, A22), addMatrix(B21, B22)) // M7
	}()
	wg.Wait() // 等待所有 goroutine 完成

	// etape3:combine the four submatrices into the final result
	return combineMatrices(results, newSize)
}

func MatrixMultiply(a, b [][]int) [][]int {
	// 获取矩阵的维度
	n := len(a)
	// 创建结果矩阵
	result := make([][]int, n)
	for i := range result {
		result[i] = make([]int, n)
	}

	// 执行矩阵乘法
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			sum := 0
			for k := 0; k < n; k++ {
				sum += a[i][k] * b[k][j]
			}
			result[i][j] = sum
		}
	}

	return result
}

// splits a matrix into four equal submatrices
func splitMatrix(A [][]int, newSize int) ([][]int, [][]int, [][]int, [][]int) {
	A11 := make([][]int, newSize)
	A12 := make([][]int, newSize)
	A21 := make([][]int, newSize)
	A22 := make([][]int, newSize)

	for i := range A11 {
		A11[i] = make([]int, newSize)
		A12[i] = make([]int, newSize)
		A21[i] = make([]int, newSize)
		A22[i] = make([]int, newSize)

		for j := range A11[i] {
			A11[i][j] = A[i][j]
			A12[i][j] = A[i][j+newSize]
			A21[i][j] = A[i+newSize][j]
			A22[i][j] = A[i+newSize][j+newSize]
		}
	}
	return A11, A12, A21, A22
}

// combines the results of the Strassen algorithm into a single matrix
func combineMatrices(results [][][]int, newSize int) [][]int {
	M1 := results[0]
	M2 := results[1]
	M3 := results[2]
	M4 := results[3]
	M5 := results[4]
	M6 := results[5]
	M7 := results[6]
	n := newSize * 2
	C := make([][]int, n)
	for i := range C {
		C[i] = make([]int, n)
		for j := range C[i] {
			switch {
			case i < newSize && j < newSize:
				C[i][j] = M1[i][j] + M4[i][j] - M5[i][j] + M7[i][j]
			case i < newSize && j >= newSize:
				C[i][j] = M3[i][j-newSize] + M5[i][j-newSize]
			case i >= newSize && j < newSize:
				C[i][j] = M2[i-newSize][j] + M4[i-newSize][j]
			case i >= newSize && j >= newSize:
				C[i][j] = M1[i-newSize][j-newSize] - M2[i-newSize][j-newSize] + M3[i-newSize][j-newSize] + M6[i-newSize][j-newSize]
			}
		}
	}
	return C
}

func main() {
	// read txt files
	matrix1 := readMatrixFromFile("boom1.txt")
	matrix2 := readMatrixFromFile("boom2.txt")

	if matrix1 == nil || matrix2 == nil {
		fmt.Println("Failed to read one or both matrices.")
		return
	}

	result := strassen(matrix1, matrix2)

	// Print the result
	fmt.Println("Result:")
	for _, row := range result {
		fmt.Println(row)
	}
}

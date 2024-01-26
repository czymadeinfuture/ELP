package main

import (
	"sync"
)

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
	wg.Add(7) // 7 goroutines
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
	wg.Wait() // attendre des goroutines finir

	// etape3:combine the four submatrices into the final result
	return combineMatrices(results, newSize)
}

func last_strassen(A, B [][]int) [][]int {
	//Deuxieme fois strassen, sinon trop de goroutine
	n := len(A)
	if n == 1 {
		return [][]int{{A[0][0] * B[0][0]}}
	}

	newSize := n / 2
	A11, A12, A21, A22 := splitMatrix(A, newSize)
	B11, B12, B21, B22 := splitMatrix(B, newSize)

	var wg sync.WaitGroup

	results := make([][][]int, 7)
	wg.Add(7)
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
	wg.Wait()

	return combineMatrices(results, newSize)
}

func MatrixMultiply(a, b [][]int) [][]int {
	n := len(a)
	result := make([][]int, n)
	for i := range result {
		result[i] = make([]int, n)
	}

	// multication basic
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

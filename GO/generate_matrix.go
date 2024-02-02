package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
)

// generate a matrix m x n, in which each element is from 0-100
func generateMatrix(m, n int) [][]int {
	matrix := make([][]int, m)
	for i := 0; i < m; i++ {
		matrix[i] = make([]int, n)
		for j := 0; j < n; j++ {
			matrix[i][j] = rand.Intn(100) + 1
		}
	}
	return matrix
}

// save Matrix to txtfile
func saveMatrixToFile(matrix [][]int, filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := bufio.NewWriter(file)
	for _, row := range matrix {
		for _, val := range row {
			fmt.Fprintf(writer, "%d ", val)
		}
		fmt.Fprintln(writer)
	}
	return writer.Flush()
}

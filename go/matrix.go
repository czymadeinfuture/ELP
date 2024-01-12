package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"time"
)

// generateMatrix 生成一个m x n的矩阵，每个元素是1到100的随机数
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

// saveMatrixToFile 将矩阵保存到文本文件
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

func main() {
	rand.Seed(time.Now().UnixNano()) // 初始化随机数生成器

	var m, n int
	fmt.Print("Enter the number of rows (m): ")
	fmt.Scan(&m)
	fmt.Print("Enter the number of columns (n): ")
	fmt.Scan(&n)

	matrix := generateMatrix(m, n)
	filename := "matrix.txt"
	err := saveMatrixToFile(matrix, filename)
	if err != nil {
		fmt.Println("Error saving matrix to file:", err)
		return
	}
	fmt.Println("Matrix saved to", filename)
}

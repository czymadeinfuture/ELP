package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
)

func handleClient(conn net.Conn) {
	defer conn.Close()

	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("Error reading from client:", err)
		return
	}

	matrixSize, err := strconv.Atoi(strings.TrimSpace(string(buffer[:n])))
	if err != nil {
		fmt.Println("Error converting data to integer:", err)
		return
	}

	// Generate two matrices
	matrix1 := generateMatrix(matrixSize, matrixSize)
	matrix2 := generateMatrix(matrixSize, matrixSize)

	// Perform matrix multiplication
	resultMatrix := strassen(matrix1, matrix2)

	// Serialize and send the matrices
	sendMatrix(conn, matrix1)
	sendMatrix(conn, matrix2)
	sendMatrix(conn, resultMatrix)
}

func sendMatrix(conn net.Conn, matrix [][]int) {
	matrixStr := matrixToString(matrix) + "\n---\n"
	_, err := conn.Write([]byte(matrixStr))
	if err != nil {
		fmt.Println("Error sending matrix to client:", err)
	}
}

func matrixToString(matrix [][]int) string {
	var sb strings.Builder
	for _, row := range matrix {
		for _, val := range row {
			sb.WriteString(fmt.Sprintf("%d ", val))
		}
		sb.WriteString("\n")
	}
	return sb.String()
}

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

func main() {
	// Listen for incoming connections
	listener, err := net.Listen("tcp", "192.168.0.101:20000")
	//Il faut modifier l'adresse
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Server is listening on port 20000")

	for {
		// Accept incoming connections
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error:", err)
			continue
		}

		// Handle client connection in a goroutine
		go handleClient(conn)
	}
}

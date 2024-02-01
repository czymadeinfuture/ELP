package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
)

func main() {
	conn, err := net.Dial("tcp", "192.168.0.101:20000")
	//Il faut modifier l'ip adresse lors utilisation
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer conn.Close()

	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter matrix size (n): ")
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)

	n, err := strconv.Atoi(input)
	if err != nil {
		fmt.Println("Error: Invalid input, expected an int*4.")
		return
	}

	if n <= 0 || n%4 != 0 {
		fmt.Println("Error: Invalid input, expected a positive integer that is a multiple of 4.")
		return
	}

	data := fmt.Sprintf("%d", n)
	_, err = conn.Write([]byte(data))
	if err != nil {
		fmt.Println("Error sending data to server:", err)
		return
	}

	// Receive and display matrices
	fmt.Println("Received Matrices and Result from Server:")
	receiveAndPrintMatrix(conn)
	receiveAndPrintMatrix(conn)
	receiveAndPrintMatrix(conn)
}

func receiveAndPrintMatrix(conn net.Conn) {
	buffer := make([]byte, 4096) // Adjust the size according to your needs
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Println("Error reading matrix from server:", err)
		return
	}

	fmt.Println(string(buffer[:n]))
}

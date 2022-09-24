package main

import (
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"math/rand"
	"strconv"
	"strings"
)

type Witnesses = []int
type Secret = []string

func main() {
	client, err := ethclient.Dial("http://localhost:8575")
	if err != nil {
		log.Fatal(err)
	}
	defer client.close()

	// Create Wordle puzzle
	generator := rand.Intn(255) // Nonce between 0 and 255
	var accumulator int
	var modulus int

	witnesses := make(Witnesses, 0, 10)

	// Solution: "ferry"
	// The first 5 elements encode the letters and their position. The remaining elements encodes the
	// set membership of the letters for additional validation.
	secret := Secret{"0f", "1e", "2r", "3r", "4y", "5f", "5e", "5r", "5y"}
	primes := make([]int, 0, 10)

	for value, index := range secret {
		val = strings.split(value)
		i, err := strconv.Atoi(val[0])
		primes[index] = PrimeHashFunction(i, val[1])
	}

	//     witnesses = GenerateWitness()
}

func PrimeHashFunction(index uint8, letter string) (int, err) {
	if index > 5 {
		return nil, fmt.Error("Index out of range")
	}

	alphabet := "abcdefghijklmnopqrstuvwxyz"
	primes := []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911}
	letterIndex := strings.Index(letter, alphabet)

	// "0a" => 26 * 0 + 0 = primes[0], "1a" => 26 * 1 + 0 = primes[26]
	// "0b" => 26 * 0 + 1 = primes[1], "1b" => 26 * 1 + 1 = primes[27]
	// ...
	// "0z" => 26 * 0 + 25 = primes[25]
	// ...
	// "5z" =>  26 * 5 + 25 = primes[155]
	return primes[len(alphabet)*index+letterIndex]
}

func GenerateWitnesses(currentIndex int, nonce int, primes *[]int, modulus int) (witness int) {
	// var val = ((nonce ** primes[0] % modulus) ** primes[1] % modulus ...)
	// if nonce^primes[x] > 2^256 - 1, break apart the exponentiation such that you
	// have: nonce^primes[x] % modulus = (nonce^w % modulus)(nonce^y % modulus)(nonce^z % modulus)
	// where w+y+z = primes[x] so that nonce^w,y,z < 2^256 - 1 and doesn't overflow.
	return witness
}

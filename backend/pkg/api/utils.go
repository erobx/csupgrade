package api

import "math/rand/v2"

// Map numerical float values to their corresponding wear name
// Ex: [0, 0.07) => Factory New
func GetWearFromFloatValue(fv float64) string {
	if fv < 0.07 {
		return "Factory New"
	} else if fv < 0.15 {
		return "Minimal Wear"
	} else if fv < 0.37 {
		return "Field Tested"
	} else if fv < 0.45 {
		return "Well-Worn"
	} else {
		return "Battle-Scarred"
	}
}

// 20% chance to be StatTrak
func IsStatTrak() bool {
	rng := rand.IntN(10)
	if rng <= 1 {
		return true
	}
	return false
}

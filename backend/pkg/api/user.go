package api

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	New(user *NewUserRequest) (string, error)
	Login(request NewLoginRequest) (User, error)
	GetUser(userID string) (User, error)
}

type UserRepository interface {
	CreateUser(*NewUserRequest) (string, error)
	GetUserByID(userID string) (User, error)
	GetUserAndHashByEmail(email string) (User, string, error)
}

type userService struct {
	storage UserRepository
}

// Handles all user requests
func NewUserService(userRepo UserRepository) UserService {
	return &userService{storage: userRepo}
}

// Creates a new user and returns their ID
func (u *userService) New(user *NewUserRequest) (string, error) {
	err := ValidateNewUserRequest(user)
	if err != nil {
		return "", err
	}

	// Check if user already exists
	_, _, err = u.storage.GetUserAndHashByEmail(user.Email)
	if err == nil {
		return "", errors.New("email already used")
	}

	// Normalization
	user.Email = strings.TrimSpace(user.Email)

	return u.storage.CreateUser(user)
}

// Logs in an existing user
func (u *userService) Login(request NewLoginRequest) (User, error) {
	var user User
	err := ValidateLoginRequest(request)
	if err != nil {
		return user, err
	}

	request.Email = strings.TrimSpace(request.Email)

	user, hash, err := u.storage.GetUserAndHashByEmail(request.Email)
	if err != nil {
		return user, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(request.Password))
	if err != nil {
		return user, err
	}

	return user, nil
}

func (u *userService) GetUser(userID string) (User, error) {
	user, err := u.storage.GetUserByID(userID)
	if err != nil {
		return user, err
	}

	return user, nil
}

/*
Validators
*/

func ValidateNewUserRequest(user *NewUserRequest) error {
	if user.Email == "" {
		return errors.New("email cannot be empty")
	}

	if user.Username == "" {
		return errors.New("username cannot be empty")
	}

	if user.Password == "" {
		return errors.New("password cannot be empty")
	}

	return nil
}

func ValidateLoginRequest(user NewLoginRequest) error {
	if user.Email == "" {
		return errors.New("email cannot be empty")
	}

	if user.Password == "" {
		return errors.New("password cannot be empty")
	}
	
	return nil
}

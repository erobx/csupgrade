package api

import (
	"errors"
	"log"
)

type TradeupService interface {
	GetAllTradeups() ([]Tradeup, error)
	GetTradeupByID(tradeupID string) (Tradeup, error)
	AddSkinToTradeup(tradeupID, invID, userID string) error
	RemoveSkinFromTradeup(tradeupID, invID, userID string) error
}

type TradeupRepository interface {
	GetAllTradeups() ([]Tradeup, error)
	GetTradeupByID(tradeupID string) (Tradeup, error)
	AddSkinToTradeup(tradeupID, invID string) error
	RemoveSkinFromTradeup(tradeupID, invID string) error

	CheckSkinOwnership(invID, userID string) (bool, error)
	IsTradeupFull(tradeupID string) (bool, error)
	StartTimer(tradeupID string) error
	StopTimer(tradeupID string) error
	GetStatus(tradeupID string) (string, error)
	SetStatus(tradeupID, status string) error
}

type tradeupService struct {
	storage TradeupRepository
}

func NewTradeupService(tr TradeupRepository) TradeupService {
	return &tradeupService{storage: tr}
}

func (ts *tradeupService) GetAllTradeups() ([]Tradeup, error) {
	return ts.storage.GetAllTradeups()
}

func (ts *tradeupService) GetTradeupByID(tradeupID string) (Tradeup, error) {
	return ts.storage.GetTradeupByID(tradeupID)
}

func (ts *tradeupService) AddSkinToTradeup(tradeupID, invID, userID string) error {
	isOwned, err := ts.storage.CheckSkinOwnership(invID, userID)
	if err != nil {
		return err
	}

	if !isOwned {
		return errors.New("user does not own requested item")
	}

	isFull, err := ts.storage.IsTradeupFull(tradeupID)
	if err != nil {
		return err
	}

	if isFull {
		return errors.New("cannot add skin - tradeup is full")
	}

	err = ts.storage.AddSkinToTradeup(tradeupID, invID)
	if err != nil {
		return err
	}

	isFull, err = ts.storage.IsTradeupFull(tradeupID)
	if err != nil {
		return err
	}

	// if full after addition, start timer (5 min) and update status to Waiting
	if isFull {
		err := ts.storage.StartTimer(tradeupID)
		if err != nil {
			return err
		}
		log.Printf("Started timer for %s\n", tradeupID)
	}

	return nil
}

func (ts *tradeupService) RemoveSkinFromTradeup(tradeupID, invID, userID string) error {
	isOwned, err := ts.storage.CheckSkinOwnership(invID, userID)
	if err != nil {
		return err
	}

	if !isOwned {
		return errors.New("user does not own requested item")
	}

	status, err := ts.storage.GetStatus(tradeupID)
	if err != nil {
		return err
	}

	if status == "Waiting" {
		err := ts.storage.StopTimer(tradeupID)
		if err != nil {
			return err
		}
		log.Printf("Stopped timer for %s\n", tradeupID)
	}

	return ts.storage.RemoveSkinFromTradeup(tradeupID, invID)
}

// Get tradeups with status waiting that have an expired stop time.
// Decide winner and give winner new skin.
func (ts *tradeupService) ProcessWinner() {

}

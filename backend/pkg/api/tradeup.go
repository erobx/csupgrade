package api

import "errors"

type TradeupService interface {
	GetAllTradeups() ([]Tradeup, error)
	GetTradeupByID(tradeupID string) (Tradeup, error)
	AddSkinToTradeup(tradeupID, invID, userID string) error
}

type TradeupRepository interface {
	GetAllTradeups() ([]Tradeup, error)
	GetTradeupByID(tradeupID string) (Tradeup, error)
	CheckSkinOwnership(invID, userID string) (bool, error)
	IsTradeupFull(tradeupID string) (bool, error)
	AddSkinToTradeup(tradeupID, invID string) error
	StartTimer(tradeupID string) error
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

	// if full after addition, start timer (5 min)
	if isFull {
		err := ts.storage.StartTimer(tradeupID)
		if err != nil {
			return err
		}
	}

	return nil
}

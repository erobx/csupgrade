package api

type StoreService interface {
	BuyCrate(crateID, userID string, amount int) (float64, []Item, error)
}

type StoreRepository interface {
	BuyCrate(crateID, userID string, amount int) (float64, []Item, error)
}

type storeService struct {
	storage StoreRepository
}

func NewStoreService(storeRepo StoreRepository) StoreService {
	return &storeService{storage: storeRepo}
}

// Updates the user's current balance if they can purchase and adds skins to
// their inventory. Returns the new balance and items.
func (s *storeService) BuyCrate(crateID, userID string, amount int) (float64, []Item, error) {
	updatedBalance, addedItems, err := s.storage.BuyCrate(crateID, userID, amount)
	if err != nil {
		return updatedBalance, addedItems, err
	}

	return updatedBalance, addedItems, nil
}

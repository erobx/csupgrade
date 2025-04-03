package internal

type Message struct {
    Data any    `json:"data"`
}

type Event struct {

}

type TradeupUpdateMessage struct {
    Mt int      `json:"mt"`
    Msg Message `json:"msg"`
}

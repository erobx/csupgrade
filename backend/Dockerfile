FROM golang:latest AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tradeups-api /app/main.go

FROM scratch AS prod
WORKDIR /app
COPY --from=builder /app/tradeups-api .
EXPOSE 8080
CMD ["./tradeups-api"]

FROM golang:latest AS dev
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY . .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

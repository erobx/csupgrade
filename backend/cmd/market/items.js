const fs = require('fs')

const params = new URLSearchParams({
    app_id: 730,
    currency: 'USD',
    tradable: 0
});

(async () => {
    const response = await fetch(`https://api.skinport.com/v1/items?${params}`, {
        method: 'GET',
        headers: {
            'Accept-Encoding': 'br'
        }
    });

    const data = await response.json();
    const jsonString = JSON.stringify(data, null, 2)
    fs.writeFile('data.json', jsonString, (err) => {
        if (err) {
            console.log("Error writing to file")
        } else {
            console.log("Success")
        }
    })
})();

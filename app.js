let choice
let intMap
let userCoords
let resultMarkerLayer = null
let search = document.querySelector("#search")
let list = document.createElement("select")
let submit = document.createElement("button")
submit.textContent = "Submit"
submit.addEventListener("click", function(){
    choice = list.value
    listSearch()
})

const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'foursquare-api-key' //removed api key because i'm not sure if it's okay for it to be up
    }
}

let listoptions = ["Restaurants", "Coffee Shops", "Hotels", "Bars", "Supermarkets"]
listoptions.forEach(option => {
    let listoption = document.createElement("option")
    listoption.textContent = option
    list.append(listoption)
})

search.append(list, submit)


window.onload = async () => {
    userCoords = await getLocation()
    makeMap(userCoords)
}

async function getLocation() {
    let userLocation = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    return [userLocation.coords.latitude, userLocation.coords.longitude]
}

function makeMap(userLocation) {
    intMap = L.map("intMap", {
        center: [userLocation[0], userLocation[1]],
        zoom: 15
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    minzoom: '15',
    }).addTo(intMap)

    const marker = L.marker([userLocation[0], userLocation[1]]).addTo(intMap)
    marker.bindPopup("<b>You are here</b>").openPopup()
}

async function listSearch(){
    if (resultMarkerLayer != null){
        intMap.removeLayer(resultMarkerLayer)
    }
    let response = await fetch(`https://api.foursquare.com/v3/places/search?query=${choice}&ll=${userCoords[0]}%2C${userCoords[1]}&limit=5`, options)
    let responseObj = await response.json()
    let objResults = responseObj.results

    let name = objResults.map(result => result.name)
    let coords = objResults.map(result => result.geocodes.main)

    let newMarkersList = []
    for(let i = 0; i < objResults.length; i++){
        let newMarker = L.marker([coords[i].latitude, coords[i].longitude])
        newMarker.bindPopup(`<b>${name[i]}</b>`)
        newMarkersList.push(newMarker)
    }
    resultMarkerLayer = L.layerGroup(newMarkersList)
    resultMarkerLayer.addTo(intMap)
}

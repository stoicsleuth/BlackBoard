function fetchLatLong (input, lat, long) {

    if(!input) return;

    //Use autocomplete method of GMaps API
    const drop = new google.maps.places.Autocomplete(input);

    drop.addListener('place_changed', () =>{
        const place = drop.getPlace();
        lat.value = place.geometry.location.lat();
        long.value= place.geometry.location.lng();
    });

    input.on('keydown', (e) =>{
        if(e.keyCode=== 13) e.preventDefault();
    });


}

export default fetchLatLong;
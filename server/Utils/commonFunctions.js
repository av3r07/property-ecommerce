const moment = require('moment');



exports.getDateTimeInTimezone = (timestamp) => {
    // return moment(new Date(new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))).format('ddd Do MMM YYYY  hh:mm:ssa');

    return moment(new Date(new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))).format('MM-DD-YYYY');
}

exports.timeFormatter = (time, timeReferenceRequired) => {
    const timeArray = time.split(':');
    let hour = parseInt(timeArray[0]);
    let minutes = parseInt(timeArray[1]);
    let response = "";
    const timeReference = (timeReferenceRequired ? (hour >= 12 ? " PM" : " AM") : "")
    if (hour >= 12) {
        hour -= 12;
        if (hour === 0) {
            response = "12:";
        } else {
            if (hour > 9) {
                response = hour + ":";
            } else {
                response = "0" + hour + ":";
            }
        }
    } else {
        if (hour === 0) {
            response = "12:";
        } else {
            if (hour > 9) {
                response = hour + ":";
            } else {
                response = "0" + hour + ":";
            }
        }
    }

    if (minutes < 10) {
        response += "0" + minutes;
    } else {
        response += minutes
    }
    return (response + timeReference);
}

export function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
}

export function minutesToAngle(minutes) {
    return (360 / 60) * minutes;
}

export function secondsToAngle(seconds) {
    return (360 / 60) * seconds;
}

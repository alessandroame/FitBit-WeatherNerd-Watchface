
export function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    let res=hourAngle + minAngle;
    if (res>360 ) res = res%360;
    return res;
}

export function minutesToAngle(minutes) {
    return (360 / 60) * minutes;
}

export function secondsToAngle(seconds) {
    return (360 / 60) * seconds;
}

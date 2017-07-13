let currentValue = -1;

class CurrentCO2Value {

    static getCurrentValue() {
        if (currentValue < 0) {
            return "Unavailable"
        } else {
            return `${currentValue} ppm`;
        }
    }

    static updateCurrentValue(value) {
        currentValue = value;
    }
}

export default CurrentCO2Value;
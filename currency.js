class Converter {
    static instance = null;

    constructor() {
        if (Converter.instance) {
            return Converter.instance;
        }

        this.base = "USD";
        this.rates = { USD: 1 };
        this.lastUpdated = null;
        this.customRates = {};

        Converter.instance = this;
    }

    static getInstance() {
        if (!Converter.instance) {
            Converter.instance = new Converter();
        }
        return Converter.instance;
    }

    async loadApiRates(base = "USD") {
        const normalizedBase = base.toUpperCase();

        const response = await fetch(
            `https://api.frankfurter.dev/v1/latest?base=${normalizedBase}`
        );

        if (!response.ok) {
            throw new Error("Failed to load API currency rates.");
        }

        const data = await response.json();

        this.base = data.base.toUpperCase();
        this.rates = {
            ...data.rates,
            [this.base]: 1
        };
        this.lastUpdated = data.date ?? null;

        // Re-apply custom rates after API refresh
        this.rates = {
            ...this.rates,
            ...this.customRates
        };

        return this.rates;
    }

    async loadCustomRatesFromTxt(path = "./custom_rates.txt") {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error("Failed to load custom rates file.");
        }

        const text = await response.text();
        const parsed = this.parseCustomRates(text);

        this.customRates = {
            ...this.customRates,
            ...parsed
        };

        this.rates = {
            ...this.rates,
            ...this.customRates
        };

        return this.customRates;
    }

    parseCustomRates(text) {
        const parsed = {};
        const lines = text.split("\n");

        for (let rawLine of lines) {
            const line = rawLine.trim();

            if (!line || line.startsWith("#")) {
                continue;
            }

            const [codePart, valuePart] = line.split("=");

            if (!codePart || !valuePart) {
                continue;
            }

            const code = codePart.trim().toUpperCase();
            const value = Number(valuePart.trim());

            if (!Number.isFinite(value) || value <= 0) {
                continue;
            }

            parsed[code] = value;
        }

        return parsed;
    }

    addCustomRate(code, value) {
        const normalizedCode = code.toUpperCase();
        const numericValue = Number(value);

        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            throw new Error("Custom conversion value must be a positive number.");
        }

        this.customRates[normalizedCode] = numericValue;
        this.rates[normalizedCode] = numericValue;
    }

    hasCurrency(code) {
        return Object.prototype.hasOwnProperty.call(
            this.rates,
            code.toUpperCase()
        );
    }

    convert(amount, fromCurrency, toCurrency) {
        const from = fromCurrency.toUpperCase();
        const to = toCurrency.toUpperCase();

        if (!this.hasCurrency(from) || !this.hasCurrency(to)) {
            throw new Error(`Unsupported denomination: ${from} or ${to}`);
        }

        const amountInBase = amount / this.rates[from];
        const convertedAmount = amountInBase * this.rates[to];

        return Math.round(convertedAmount * 100) / 100;
    }

    getRates() {
        return { ...this.rates };
    }
}


class Currency {
    constructor(amount, denomination = "USD") {
        this.amount = Number(amount);
        this.denomination = denomination.toUpperCase();
        this.converter = Converter.getInstance();
    }

    toString() {
        return `Currency worth ${this.amount} ${this.denomination}`;
    }

    setAmount(amount) {
        this.amount = Number(amount);
        return this;
    }

    convert(newDenomination) {
        const target = newDenomination.toUpperCase();

        this.amount = this.converter.convert(
            this.amount,
            this.denomination,
            target
        );

        this.denomination = target;
        return this;
    }

    add(value) {
        if (value instanceof Currency) {
            const converted = this.converter.convert(
                value.amount,
                value.denomination,
                this.denomination
            );
            this.amount += converted;
        } else {
            this.amount += Number(value);
        }

        return this;
    }

    subtract(value) {
        let amountToSubtract;

        if (value instanceof Currency) {
            amountToSubtract = this.converter.convert(
                value.amount,
                value.denomination,
                this.denomination
            );
        } else {
            amountToSubtract = Number(value);
        }

        if (amountToSubtract > this.amount) {
            throw new Error("Cannot subtract more than current amount.");
        }

        this.amount -= amountToSubtract;
        return this;
    }

    multiply(value) {
        this.amount *= Number(value);
        return this;
    }

    divide(value) {
        const numericValue = Number(value);

        if (numericValue === 0) {
            throw new Error("Cannot divide by zero.");
        }

        this.amount /= numericValue;
        return this;
    }

    equals(other) {
        if (other instanceof Currency) {
        const converted = this.converter.convert(
            other.amount,
            other.denomination,
            this.denomination
        );
        return this.amount === converted;
        }

        return this.amount === Number(other);
    }
}

export { Converter, Currency };